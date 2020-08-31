using DataModel;
using DDB.Entities;
using EndpointConnectors.Connectors;
using Infrastructure.STLogging.Factory;
using Infrastructure.STLogging.Interface;
using MA.Entities;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Org.Sdmxsource.Sdmx.Api.Constants;
using Org.Sdmxsource.Sdmx.Api.Model.Mutable;
using Org.Sdmxsource.Sdmx.Api.Model.Mutable.Base;
using Org.Sdmxsource.Sdmx.Api.Model.Mutable.DataStructure;
using Org.Sdmxsource.Sdmx.Api.Model.Objects;
using Org.Sdmxsource.Sdmx.Api.Model.Objects.DataStructure;
using Org.Sdmxsource.Sdmx.Api.Model.Objects.Registry;
using Org.Sdmxsource.Sdmx.SdmxObjects.Model.Mutable.Base;
using Org.Sdmxsource.Sdmx.Util.Objects.Container;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using Utility;

namespace BusinessLogic.Controller
{
    public class DataflowProduction
    {
        private Sdmx21Connector Sdmx21Connector;
        private DmApiConnector DmApiConnector;
        private MaApiConnector MaApiConnector;
        private IConfiguration _configuration;

        readonly ISTLogger _logger;

        public DataflowProduction(Sdmx21Connector sdmx21Conn, DmApiConnector dmApiConn, MaApiConnector maApiConn, IConfiguration configuration)
        {
            this.Sdmx21Connector = sdmx21Conn;
            this.DmApiConnector = dmApiConn;
            this.MaApiConnector = maApiConn;
            _configuration = configuration;
            _logger = STLoggerFactory.Logger;
        }

        /// <summary>
        /// Generates a connection (if needed), a dataset and a mapping set for a dataflow
        /// </summary>
        /// <param name="dfId">The dataflow to set in production</param>
        /// <param name="defaultValue">Default value for the measure.</param>
        public void CreateMappingSetForDataflow(int dfId, string defaultValue)
        {
            //gets the DDB Dataflow from DDB and its corrispondent Cube
            DDBDataflowWithCols df = JsonConvert.DeserializeObject<DDBDataflowWithCols>(DmApiConnector.GetDDBDataflow(dfId));
            CubeWithDetails cube = JsonConvert.DeserializeObject<CubeWithDetails>(DmApiConnector.GetCube(df.IDCube));
            int msId = -1;

            try
            {
                //creates a connection if it does not exist
                _logger.Log("Creating DDB Connection if it does not exist", Infrastructure.STLogging.Interface.LogLevelEnum.Info);
                int connId = CreateDDBConnection();

                //creates a dataset with its columns
                _logger.Log("Creating Dataset", Infrastructure.STLogging.Interface.LogLevelEnum.Info);
                int dsId = CreateDataset(df, connId);
                CreateDatasetColumns(df, dsId);

                //creates a mapping set with its mappings
                _logger.Log("Creating MappingSet with Mappings", Infrastructure.STLogging.Interface.LogLevelEnum.Info);
                msId = CreateMappingSet(df, dsId);

                CreateMappings(df, cube, msId, defaultValue);
            }
            catch (Exception ex)
            {
                //removing all entities created
                RemoveMappingSet(dfId);

                throw Utility.Utils.getCustomException("DF_MS_SET",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }

        }

        /// <summary>
        /// Creates transcodings for a dataflow
        /// </summary>
        /// <param name="dfId">The id of the dataflow.</param>
        public void CreateTranscodingsForDataflow(int dfId)
        {
            try
            {
                //gets the DDB Dataflow from DDB and its corrispondent Cube
                DDBDataflowWithCols df = JsonConvert.DeserializeObject<DDBDataflowWithCols>(DmApiConnector.GetDDBDataflow(dfId));
                CubeWithDetails cube = JsonConvert.DeserializeObject<CubeWithDetails>(DmApiConnector.GetCube(df.IDCube));

                var temp = MaApiConnector.GetEntity("mappingset", null);

                if (temp != null)
                {
                    MappingSet[] list = JsonConvert.DeserializeObject<MappingSet[]>(temp);
                    string msId = list.Where(m => m.parentId == $"urn:sdmx:org.sdmx.infomodel.datastructure.Dataflow={df.Agency}:{df.ID}({df.Version})").Select(x => x.entityId).SingleOrDefault();

                    if (msId != null)
                    {

                        //gets all mappings in mapping set 
                        GenericMapping[] mapps = JsonConvert.DeserializeObject<GenericMapping[]>(MaApiConnector.GetEntity("mapping", null))
                            .Where(x => x.parentId == msId).OrderBy(y => y.entityId).ToArray();

                        _logger.Log("Creating Transcoding", Infrastructure.STLogging.Interface.LogLevelEnum.Info);
                        CreateTranscodings(cube, df, mapps);

                        _logger.Log("Creating Transcoding Rules", Infrastructure.STLogging.Interface.LogLevelEnum.Info);
                        CreateTranscodingRules(df, mapps);

                        //sets HasTranscoding flag in CatDataFlow DDB's table
                        _logger.Log("Setting Transcoding Flag", Infrastructure.STLogging.Interface.LogLevelEnum.Info);
                        DmApiConnector.SetHasTranscodingFlag(dfId, true);
                    }
                }
            }
            catch (Exception ex)
            {
                throw Utility.Utils.getCustomException("DF_PROD_SET_TRANSC",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        /// <summary>
        /// Creates transcodings from a content constraint for a dataflow 
        /// </summary>
        /// <param name="dfId">The id of the dataflow.</param>
        /// <param name="agCc">The agency of the content constraint.</param>
        /// <param name="idCc">The id of the content constraint.</param>
        /// <param name="versCc">The version of the content constraint.</param>
        public void CreateTranscodingsFromCCForDataflow(int dfId, string agCc, string idCc, string versCc)
        {
            try
            {
                //gets the DDB Dataflow from DDB and its corrispondent Cube
                DDBDataflowWithCols df = JsonConvert.DeserializeObject<DDBDataflowWithCols>(DmApiConnector.GetDDBDataflow(dfId));
                CubeWithDetails cube = JsonConvert.DeserializeObject<CubeWithDetails>(DmApiConnector.GetCube(df.IDCube));

                var temp = MaApiConnector.GetEntity("mappingset", null);

                if (temp != null)
                {
                    MappingSet[] list = JsonConvert.DeserializeObject<MappingSet[]>(temp);
                    string msId = list.Where(m => m.parentId == $"urn:sdmx:org.sdmx.infomodel.datastructure.Dataflow={df.Agency}:{df.ID}({df.Version})").Select(x => x.entityId).SingleOrDefault();

                    if (msId != null)
                    {

                        //gets all mappings in mapping set 
                        GenericMapping[] mapps = JsonConvert.DeserializeObject<GenericMapping[]>(MaApiConnector.GetEntity("mapping", null))
                            .Where(x => x.parentId == msId).OrderBy(y => y.entityId).ToArray();

                        _logger.Log("Creating Transcodings with Rules from Content Constraint", Infrastructure.STLogging.Interface.LogLevelEnum.Info);
                        MaApiConnector.CreateTranscodingsWithRulesFromCc(int.Parse(msId), agCc, idCc, versCc);

                        //sets HasTranscoding flag in CatDataFlow DDB's table
                        _logger.Log("Setting Transcoding Flag", Infrastructure.STLogging.Interface.LogLevelEnum.Info);
                        DmApiConnector.SetHasTranscodingFlag(dfId, true);
                    }
                }
            }
            catch (Exception ex)
            {
                throw Utility.Utils.getCustomException("DF_PROD_SET_TRANSC",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        /// <summary>
        /// Creates the Content Constraints for a dataflow
        /// </summary>
        /// <param name="dfId">The id of the dataflow.</param>
        public void CreateContentConstraintsForDataflow(int dfId)
        {
            try
            {
                int? msId = GetMappingSetIdForDDBDataflow(dfId);

                if (msId == null)
                    throw new Exception();

                //generates ContentConstraints
                _logger.Log("Creating Content Constraints", Infrastructure.STLogging.Interface.LogLevelEnum.Info);

                //gets all mappings in mapping set with transcodings
                /*GenericMapping[] mapps = JsonConvert.DeserializeObject<GenericMapping[]>(MaApiConnector.GetEntity("mapping", null))
                    .Where(x => x.parentId == msId && x.transcoding != null).OrderBy(y => y.entityId).ToArray();

                for(int i = 0; i < mapps.Length; i++)
                {
                    MaApiConnector.CreateContentConstraintsForComponent((int)msId, (int) mapps[i].entityId);
                }*/
                MaApiConnector.CreateContentConstraints((int)msId);

                //sets HasTranscoding flag in CatDataFlow DDB's table
                _logger.Log("Setting ContentConstraints Flag", Infrastructure.STLogging.Interface.LogLevelEnum.Info);
                DmApiConnector.SetHasContentConstraintFlag(dfId, true);
            }
            catch (Exception ex)
            {
                throw Utility.Utils.getCustomException("ERR_GEN_CONT_CONSTRAINTS",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - Content constraints generation not supported or generated an error." + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        /// <summary>
        /// Removes the MappingSet for a DDB Dataflow setting production flag to false and deleting its transcodings and  content constraints (if exist), 
        /// its dataset and its connection (if it is not used by other dataflows)
        /// </summary>
        /// <param name="dfId">The dataflow to remove from production</param>
        public void RemoveMappingSet(int dfId)
        {
            //getting the DDB Dataflow from DDB and its corrispondent Cube
            DDBDataflowWithCols df = JsonConvert.DeserializeObject<DDBDataflowWithCols>(DmApiConnector.GetDDBDataflow(dfId));
            CubeWithDetails cube = JsonConvert.DeserializeObject<CubeWithDetails>(DmApiConnector.GetCube(df.IDCube));

            try
            {
                //deletes transcodings and  content constraints (if exist)
                RemoveTranscodings(dfId);

                int? mappId = GetMappingSetIdForDDBDataflow(dfId);

                if (mappId != null)
                {
                    MappingSet[] ms = JsonConvert.DeserializeObject<MappingSet[]>(MaApiConnector.GetEntity("mappingset", (int)mappId));

                    _logger.Log("Removing mapping set with associated transcodings", Infrastructure.STLogging.Interface.LogLevelEnum.Info);
                    MaApiConnector.DeleteEntity("mappingset", (int)mappId);

                    //setting transcoding flag of DDB Dataflow to false
                    _logger.Log("Setting transcoding flag to false", Infrastructure.STLogging.Interface.LogLevelEnum.Info);
                    DmApiConnector.SetHasTranscodingFlag(dfId, false);

                    //removing dataflow's dataset
                    if (ms[0].dataset.entityId != null)
                    {
                        Dataset[] ds = JsonConvert.DeserializeObject<Dataset[]>(MaApiConnector.GetEntity("dataset", int.Parse(ms[0].dataset.entityId)));

                        _logger.Log("Removing dataset", Infrastructure.STLogging.Interface.LogLevelEnum.Info);
                        MaApiConnector.DeleteEntity("dataset", int.Parse(ds[0].entityId));

                        //deleting connection (if it is not used by other dataflows)
                        try
                        {
                            MaApiConnector.DeleteEntity("ddb", int.Parse(ds[0].parentId));
                            _logger.Log("DDB Connection removed", Infrastructure.STLogging.Interface.LogLevelEnum.Info);
                        }
                        catch (Exception)
                        {
                            //connection used by other dataflows
                        }
                    }
                }

                //setting production flag
                _logger.Log("Setting production flag", Infrastructure.STLogging.Interface.LogLevelEnum.Info);
                SetProductionFlag(dfId, true);
            }
            catch (Exception ex)
            {
                throw Utility.Utils.getCustomException("DF_MS_REM",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        /// <summary>
        /// Deletes Transcodings for a dataflow. Removes content constraints if exist
        /// </summary>
        /// <param name="dfId">The DDB dataflow id.</param>
        public void RemoveTranscodings(int dfId)
        {
            RemoveContentConstraints(dfId);

            try
            {
                _logger.Log("Removing transcodings", Infrastructure.STLogging.Interface.LogLevelEnum.Info);

                int? mappId = GetMappingSetIdForDDBDataflow(dfId);

                if (mappId != null)
                {
                    //getting all mapping id for the given mapping set
                    var temp1 = MaApiConnector.GetEntity("mapping", null);
                    int[] mappList = JsonConvert.DeserializeObject<GenericMapping[]>(temp1).Where(x => x.parentId == mappId.ToString()).Select(y => int.Parse(y.entityId)).ToArray();

                    var temp2 = MaApiConnector.GetEntity("transcoding", null);
                    Transcoding[] trList = JsonConvert.DeserializeObject<Transcoding[]>(temp2).Where(x => mappList.Contains(int.Parse(x.parentId))).ToArray();

                    for (int i = 0; i < trList.Length; i++)
                    {
                        MaApiConnector.DeleteEntity("transcoding", int.Parse(trList[i].entityId));
                    }
                }

                //setting Transcoding flag of DDB Dataflow to false
                _logger.Log("Setting Transcoding flag to false", Infrastructure.STLogging.Interface.LogLevelEnum.Info);
                DmApiConnector.SetHasTranscodingFlag(dfId, false);
            }
            catch (Exception ex)
            {
                throw Utility.Utils.getCustomException("DF_TRANSC_REM",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        /// <summary>
        /// Deletes Content Constraints for a dataflow
        /// </summary>
        /// <param name="dfId">The DDB dataflow id.</param>
        public void RemoveContentConstraints(int dfId)
        {
            _logger.Log("Removing Content Constraints", Infrastructure.STLogging.Interface.LogLevelEnum.Info);

            try
            {
                IDataflowMutableObject dfM = GetMSDBDataflowFromDDBId(dfId);

                ISdmxObjects obj = Sdmx21Connector.GetArtefacts(SdmxStructureEnumType.ContentConstraint, null, null, null, StructureReferenceDetailEnumType.Children);

                if (obj.ContentConstraintObjects != null)
                { 

                    ISdmxObjects delObj = new SdmxObjectsImpl();
                    IMutableObjects mutObj = delObj.MutableObjects;

                    foreach (IContentConstraintObject cc in obj.ContentConstraintObjects)
                    {
                        //selecting constraints for the dataflow
                        if (cc.CrossReferences.Where(x => x.MaintainableStructureEnumType == SdmxStructureEnumType.Dataflow &&
                            x.AgencyId == dfM.AgencyId && x.MaintainableId == dfM.Id && x.Version == dfM.Version).SingleOrDefault() != null)
                        {
                            mutObj.AddContentConstraint(cc.MutableInstance);
                        }
                    }

                    delObj = mutObj.ImmutableObjects;

                    if (delObj.ContentConstraintObjects != null && delObj.ContentConstraintObjects.Count > 0)
                    {
                        Sdmx21Connector.DeleteArtefact(delObj);
                    }
                }

                //setting ContentConstraint flag of DDB Dataflow to false
                _logger.Log("Setting ContentConstraint flag to false", Infrastructure.STLogging.Interface.LogLevelEnum.Info);
                DmApiConnector.SetHasContentConstraintFlag(dfId, false);
            }
            catch (Exception ex)
            {
                throw Utility.Utils.getCustomException("DEL_CONT_CONSTRAINTS",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - Error while deleting content constraints for the dataflow." + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        /// <summary>
        /// Sets or removes a DDB Dataflow in/from Production setting production flag to true/false
        /// </summary>
        /// <param name="dfId">The DDB Dataflow id</param>
        /// <param name="flagValue">The value (true or false) of NonProductionDataflow annotation.</param>
        public void SetDataflowProductionFlag(int dfId, bool flagValue)
        {
            try
            {
                _logger.Log("Setting Production Flag", Infrastructure.STLogging.Interface.LogLevelEnum.Info);
                SetProductionFlag(dfId, flagValue);
            }
            catch (Exception ex)
            {
                throw Utility.Utils.getCustomException("DF_PROD_SET",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        /// <summary>
        /// Returns the MappingSet Id for a DDB dataflow
        /// </summary>
        /// <param name="dfId">The DDB Dataflow id</param>
        /// <returns></returns>
        public int? GetMappingSetIdForDDBDataflow(int dfId)
        {
            //gets the DDB Dataflow from DDB and its corrispondent Cube
            DDBDataflowWithCols df = JsonConvert.DeserializeObject<DDBDataflowWithCols>(DmApiConnector.GetDDBDataflow(dfId));
            CubeWithDetails cube = JsonConvert.DeserializeObject<CubeWithDetails>(DmApiConnector.GetCube(df.IDCube));

            var temp = MaApiConnector.GetEntity("mappingset", null);

            if (temp == null)
                return null;

            MappingSet[] list = JsonConvert.DeserializeObject<MappingSet[]>(temp);
            string msId = list.Where(m => m.parentId == $"urn:sdmx:org.sdmx.infomodel.datastructure.Dataflow={df.Agency}:{df.ID}({df.Version})").Select(x => x.entityId).SingleOrDefault();

            if (msId == null)
                return null;
            return int.Parse(msId);
        }

        /// <summary>
        /// Sets SDMX Dataflow Production flag to true/false, setting NonProductionDataflow Annotation to false/true
        /// </summary>
        /// <param name="dfId">The DDB Dataflow id</param>
        /// <param name="flagValue">The value (true or false) of NonProductionDataflow annotation.</param>
        private void SetProductionFlag(int dfId, bool flagValue)
        {
            IDataflowMutableObject dfM = GetMSDBDataflowFromDDBId(dfId);

            IAnnotationMutableObject oldAnn = dfM.Annotations.Where(x => x.Type == "NonProductionDataflow").SingleOrDefault();

            //removes old NonProductionDataflow annotation
            if (oldAnn != null)
                dfM.Annotations.Remove(oldAnn);

            if (oldAnn == null || flagValue != bool.Parse(oldAnn.Text[0].Value.ToString()))
            {
                //creates new NonProductionDataflow annotation
                AnnotationMutableCore ann = new AnnotationMutableCore();
                ann.Type = "NonProductionDataflow";
                ann.AddText("en", flagValue.ToString());
                dfM.AddAnnotation(ann);

                ISdmxObjects newObjs = new SdmxObjectsImpl();
                IDataflowObject dfMImm = dfM.ImmutableInstance;
                newObjs.AddDataflow(dfMImm);

                Sdmx21Connector.UpdateArtefacts(newObjs);
            }
        }

        /// <summary>
        /// Returns the MSDB dataflow for a DDB dataflow
        /// </summary>
        /// <param name="dfId">The DDB Dataflow id</param>
        /// <returns></returns>
        private IDataflowMutableObject GetMSDBDataflowFromDDBId(int dfId)
        {
            DDBDataflowWithCols df = JsonConvert.DeserializeObject<DDBDataflowWithCols>(DmApiConnector.GetDDBDataflow(dfId));
            IDataflowMutableObject dfM;

            ISdmxObjects objs = Sdmx21Connector.GetArtefacts(SdmxStructureEnumType.Dataflow, df.ID, df.Agency, df.Version);
            IEnumerator<IDataflowObject> enumer = objs.Dataflows.GetEnumerator();
            enumer.MoveNext();
            dfM = enumer.Current.MutableInstance;

            return dfM;
        }

        /// <summary>
        /// Creates the transcodings from the DDB Dataflow
        /// </summary>
        /// <param name="cube">The cube to whom the DDB Dataflow refers.</param>
        /// <param name="df">The DDB Dataflow.</param>
        /// <param name="mapps">Array of DDB Dataflow's mappings</param>
        private void CreateTranscodings(CubeWithDetails cube, DDBDataflowWithCols df, GenericMapping[] mapps)
        {
            //retrieving dataset FREQ column from the DSD or from columns with name "ID_FREQ"
            IDataStructureMutableObject dsd = GetDsdFromCube(cube);
            string freqComp = dsd.Dimensions.Where(d => d.FrequencyDimension).Select(x => x.Id).SingleOrDefault();
            if (freqComp == null)
                freqComp = "FREQ";

            string freqCol = cube.Dimensions.Where(d => d.Code == freqComp).Select(x => x.ColName).SingleOrDefault();
            List<string> timeDimCol = cube.Dimensions.Where(d => d.IsTimeSeriesDim).Select(x => x.ColName).ToList();

            try
            {
                if (timeDimCol.Count > 0 && (freqCol == null || !df.DataflowColumns.Contains(freqCol)))
                    throw new Exception();

                //getting FREQ values
                DataTable freqDt = null;
                if (timeDimCol.Count > 0)
                {
                    if (freqComp != null)
                    {
                        var optionsTable = new OptionsTable();
                        optionsTable.SelCols = new List<string> { freqCol };
                        optionsTable.PageNum = 1;
                        optionsTable.PageSize = 10;
                        freqDt = JsonConvert.DeserializeObject<DataTable>(DmApiConnector.GetTableColumnPreview($"Dataset_{df.IDCube}_ViewCurrentData", optionsTable));                      
                    }
                }

                List<Transcoding> trs = new List<Transcoding>();

                //generate transcodings for all coded columns
                foreach (GenericMapping m in mapps)
                {
                    string code = m.component.id;
                    Dimension dim = cube.Dimensions
                                        .Where(d => d.Code == code && (d.CodelistCode != null || d.IsTimeSeriesDim))
                                        .SingleOrDefault();

                    //time dimension component
                    if (dim != null && dim.IsTimeSeriesDim && freqDt != null)
                    {
                        List<string> freqValues = new List<string>();
                        List<GenericMapping> mappings = new List<GenericMapping>();

                        foreach (DataRow dr in freqDt.Rows)
                        {
                            freqValues.Add(dr[0].ToString());
                            mappings.Add(m);                           
                        }
                        Dictionary<char, YearTranscoding> yt = CreateTimeTranscoding(freqValues, mappings);
                        trs.Add(new Transcoding(m.entityId, yt));
                    }
                    else if (dim != null) //coded dimensions
                    {
                        trs.Add(new Transcoding(m.entityId));
                    }
                    else
                    {
                        DDB.Entities.Attribute att = cube.Attributes.Where(a => a.Code == code && a.CodelistCode != null).SingleOrDefault();
                        if (att != null)
                        {
                            trs.Add(new Transcoding(m.entityId));
                        }
                    }
                }

                MaApiConnector.CreateTranscodings(trs.ToArray());
            }
            catch (Exception ex)
            {
                throw Utility.Utils.getCustomException("ERR_TRANSCODING",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - Transcoding cannot be created." + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }

        }

        /// <summary>
        /// Creates Time Transcoding from the DDB Dataflow
        /// </summary>
        /// <param name="freqValues">The list of frequency values.</param>
        /// <param name="m">The corrispondent list of mappings for the Time Dimension at that frequency.</param>
        private Dictionary<char, YearTranscoding> CreateTimeTranscoding(List<string> freqValues, List<GenericMapping> m)
        {
            Dictionary<char, YearTranscoding> d = new Dictionary<char, YearTranscoding>();
            List<MaRule> rules = new List<MaRule>();
            Period per;
            PeriodTranscoding pt;

            for(int j = 0; j < freqValues.Count; j++)
            {
                string freqValue = freqValues[j];

                switch (freqValue)
                {
                    case "A":
                        YearTranscoding yt = new YearTranscoding(new Year(new MAEntity(int.Parse(m[j].dataset_column[0].entityId)), 0, 4), false);
                        d.Add('A', yt);
                        break;

                    case "M":
                        //generate rules for months
                        rules = new List<MaRule>();
                        for (int i = 1; i <= 12; i++)
                        {
                            string monthNum = i.ToString();
                            if (monthNum.Length == 1)
                                monthNum = "0" + monthNum;

                            List<ComponentWithParent> localCodes = new List<ComponentWithParent>();
                            localCodes.Add(new ComponentWithParent(monthNum, null, m[j].dataset_column[0].entityId));
                            rules.Add(new MaRule(new Component(monthNum, null), localCodes));
                        }

                        per = new Period(rules, new MAEntity(int.Parse(m[j].dataset_column[0].entityId)), 5, -1);
                        pt = new PeriodTranscoding(new Year(new MAEntity(int.Parse(m[j].dataset_column[0].entityId)), 0, 4), false, per);
                        d.Add('M', pt);
                        break;

                    case "S":
                        //generate rules for semesters
                        rules = new List<MaRule>();
                        for (int i = 1; i <= 2; i++)
                        {
                            string semNum = "S" + i.ToString();

                            List<ComponentWithParent> localCodes = new List<ComponentWithParent>();
                            localCodes.Add(new ComponentWithParent(semNum, null, m[j].dataset_column[0].entityId));
                            rules.Add(new MaRule(new Component(semNum, null), localCodes));
                        }

                        per = new Period(rules, new MAEntity(int.Parse(m[j].dataset_column[0].entityId)), 5, -1);
                        pt = new PeriodTranscoding(new Year(new MAEntity(int.Parse(m[j].dataset_column[0].entityId)), 0, 4), false, per);
                        d.Add('S', pt);
                        break;

                    case "Q":
                        //generate rules for quarters
                        rules = new List<MaRule>();
                        for (int i = 1; i <= 4; i++)
                        {
                            string quarterNum = "Q" + i.ToString();

                            List<ComponentWithParent> localCodes = new List<ComponentWithParent>();
                            localCodes.Add(new ComponentWithParent(quarterNum, null, m[j].dataset_column[0].entityId));
                            rules.Add(new MaRule(new Component(quarterNum, null), localCodes));
                        }

                        per = new Period(rules, new MAEntity(int.Parse(m[j].dataset_column[0].entityId)), 5, -1);
                        pt = new PeriodTranscoding(new Year(new MAEntity(int.Parse(m[j].dataset_column[0].entityId)), 0, 4), false, per);
                        d.Add('Q', pt);
                        break;

                    default:
                        throw new Exception();
                }
            }

            return d;
        }

        /// <summary>
        /// Creates the transcoding rules for the DDB Dataflow.
        /// </summary>
        /// <param name="df">The DDB Dataflow.</param>
        /// <param name="mapps">Array of DDB Dataflow's mappings</param>
        private void CreateTranscodingRules(DDBDataflowWithCols df, GenericMapping[] mapps)
        {
            List<MaRule> ruleList = new List<MaRule>();

            //getting transcoding for given mappings
            var temp2 = MaApiConnector.GetEntity("transcoding", null);
            Transcoding[] trList = JsonConvert.DeserializeObject<Transcoding[]>(temp2).Where(tr => mapps.Select(x => int.Parse(x.entityId)).ToList().Contains(int.Parse(tr.parentId))).ToArray();

            foreach (Transcoding tr in trList)
            {
                bool found = false;

                GenericMapping mapp = mapps.Where(m => tr.parentId == m.entityId).Single();

                if (mapp.dataset_column[0].name != "ID_TIME_PERIOD")
                {
                    //getting all distinct codes 
                    DataTable dt = JsonConvert.DeserializeObject<DataTable>(DmApiConnector.GetDataflowColumnPreview(JsonConvert.SerializeObject(df), mapp.dataset_column[0].name, 1, int.MaxValue));

                    if (dt.Rows.Count > 0)
                    {
                        foreach (DataRow dr in dt.Rows)
                        {
                            string c = dr[mapp.dataset_column[0].name].ToString();
                            if (c != null && c != "")
                            {
                                List<ComponentWithParent> localCodes = new List<ComponentWithParent>();
                                localCodes.Add(new ComponentWithParent(c, null, mapp.dataset_column[0].entityId));
                                ruleList.Add(new MaRule(new Component(c, null), localCodes, tr.entityId));
                                found = true;
                            }
                        }
                    }

                    //if no rules have benn created the transcoding must be deleted
                    if (!found)
                        MaApiConnector.DeleteEntity("transcoding", int.Parse(tr.entityId));
                }
            }
            MaApiConnector.CreateTranscodingRules(ruleList);
        }

        /// <summary>
        /// Creates the connection to the DDB getting its connection string from DmApi
        /// </summary>
        /// <returns>The id of the entity created.</returns>
        private int CreateDDBConnection()
        {
            string tmp = JsonConvert.DeserializeObject<string>(DmApiConnector.GetConnectionString());
            string conn_string = Utility.Utils.Decrypt(tmp, _configuration["ENCRYPTION_PASSW"]);

            int connId = FindMAEntity("ddb", Utility.Utils.EncodeMD5String(conn_string));

            if (connId == -1)
            {
                DDBConnection newConn = new DDBConnection(Utility.Utils.EncodeMD5String(conn_string), "SqlServer", new SqlConnectionStringBuilder(conn_string));
                MaApiConnector.CreateDDBConnection(newConn);
                return FindMAEntity("ddb", Utility.Utils.EncodeMD5String(conn_string));
            }

            return connId;
        }

        /// <summary>
        /// Creates the dataset from the DDB Dataflow
        /// </summary>
        /// <param name="df">The DDB Dataflow.</param>
        /// <param name="connId">The connection id.</param>
        /// <returns>The id of the entity created.</returns>
        private int CreateDataset(DDBDataflowWithCols df, int connId)
        {
            string query = $"SELECT {String.Join(",", df.DataflowColumns)} FROM Dataset_{df.IDCube}_ViewCurrentData";

            var filterStr = df.Filter?.ToSql();
            if (!string.IsNullOrWhiteSpace(filterStr))
            {
                query += $" WHERE {filterStr}";
            }

            string dsName = "DS_" + df.ID + "+" + df.Agency + "+" + df.Version;
            Dataset ds = new Dataset(dsName, query, connId.ToString());
            MaApiConnector.CreateDataset(ds);
            return FindMAEntity("dataset", dsName);
        }

        /// <summary>
        /// Creates the mapping set for the DDB Dataflow
        /// </summary>
        /// <param name="df">The DDB Dataflow.</param>
        /// <param name="dsId">The dataset's id.</param>
        /// <returns>The id of the entity created.</returns>
        private int CreateMappingSet(DDBDataflowWithCols df, int dsId)
        {
            string msName = "MAPP_" + df.ID + "_" + new System.Random().Next(0, 999999);
            string msDescr = "Created by Sdmx – Data & Meta Manager";
            MappingSet ms = new MappingSet(msName, msDescr, new Dataset(dsId), df.ID, df.Agency, df.Version);

            MaApiConnector.CreateMappingSet(ms);
            return FindMAEntity("mappingset", msName);
        }

        /// <summary>
        /// Creates the dataset columns from the DDB Dataflow.
        /// </summary>
        /// <param name="df">The DDB Dataflow.</param>
        /// <param name="dsId">The dataset's id.</param>
        private void CreateDatasetColumns(DDBDataflowWithCols df, int dsId)
        {
            MaApiConnector.CreateDatasetColumns(df.DataflowColumns.ToArray(), dsId);
        }

        /// <summary>
        /// Creates the mappings for the mapping set.
        /// </summary>
        /// <param name="df">The DDB Dataflow.</param>
        /// <param name="cube">The cube associated to the DDB Dataflow.</param>
        /// <param name="msId">The mapping set id.</param>
        /// <param name="defaultValue">The default value for OBS_VALUE</param>
        private void CreateMappings(DDBDataflowWithCols df, CubeWithDetails cube, int msId, string defaultValue)
        {
            List<GenericMapping> mapps = new List<GenericMapping>();

            for (int i = 0; i < df.DataflowColumns.Count; i++)
            {
                string col = df.DataflowColumns[i];
                string code = GetCubeCodeFromColumnName(cube, col);
                mapps.Add(new GenericMapping(msId.ToString(), col, code, (code == "OBS_VALUE") ? defaultValue : null));
            }
            MaApiConnector.CreateMappings(mapps.ToArray());
        }

        /// <summary>
        /// Finds the id of a MAEntity given its type and name.
        /// </summary>
        /// <param name="type">Type pf the entity.</param>
        /// <param name="name">Name of the entity.</param>
        /// <returns></returns>
        private int FindMAEntity(string type, string name)
        {
            //Gets all the entities of the given type
            var temp = MaApiConnector.GetEntity(type, null);
            if (temp == null)
                return -1;
            MAEntity[] list = JsonConvert.DeserializeObject<MAEntity[]>(temp);

            foreach (MAEntity e in list)
            {
                if (e.name == name)
                {
                    return int.Parse(e.entityId);
                }
            }
            return -1;
        }

        /// <summary>
        /// Returns the code of the cube corrispondent to a given column of the dataset.
        /// </summary>
        /// <param name="cube">The cube.</param>
        /// <param name="colName">The name of the column.</param>
        /// <returns>The code of the component.</returns>
        private string GetCubeCodeFromColumnName(CubeWithDetails cube, string colName)
        {
            string code = cube.Dimensions.Where(d => d.ColName == colName).Select(x => x.Code).SingleOrDefault();
            if (code == null)
            {
                code = cube.Attributes.Where(a => a.ColName == colName).Select(x => x.Code).SingleOrDefault();
            }
            if (code == null)
            {
                code = cube.Measures.Where(m => m.ColName == colName).Select(x => x.Code).SingleOrDefault();
            }
            if (code == null)
                throw Utility.Utils.getCustomException("COL_NOT_IN_CUBE",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + $" - Column name {colName} does not exist in cube.", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            return code;
        }

        /// <summary>
        /// Returns MutableObject for DSD associated to the DDB Dataflow
        /// </summary>
        /// <param name="cube">Cube associated to the DDB Dataflow DDB Dataflow</param>
        /// <returns>The ISdmxObjects to be deleted: the df and, eventually, the dsd</returns>
        public IDataStructureMutableObject GetDsdFromCube(CubeWithDetails cube)
        {
            ISdmxObjects dsdObj = null;
            SdmxUtils.checkCodeFormat(cube.DSDCode);

            dsdObj = Sdmx21Connector.GetArtefacts(SdmxStructureEnumType.Dsd,
                SdmxUtils.getCodePartFromTriplet(cube.DSDCode, "Id"),
                SdmxUtils.getCodePartFromTriplet(cube.DSDCode, "Agency"),
                SdmxUtils.getCodePartFromTriplet(cube.DSDCode, "Version"));

            if (dsdObj.DataStructures == null || dsdObj.DataStructures.Count == 0)
                return null;

            IEnumerator<IDataStructureObject> enum2 = dsdObj.DataStructures.GetEnumerator();
            enum2.MoveNext();
            IDataStructureMutableObject dsd = enum2.Current.MutableInstance;

            return dsd;
        }
    }
}