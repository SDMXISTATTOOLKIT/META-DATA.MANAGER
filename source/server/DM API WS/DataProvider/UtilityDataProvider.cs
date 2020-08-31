using DataModel;
using DataProvider;
using DataStore.Interface;
using DDB.Entities;
using Newtonsoft.Json;
using NSI.Entities;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using Utility;
using static DataProvider.DDB_NEW;

namespace DataProvider
{
    public class UtilityDataProvider : IUtilityDataProvider
    {
        #region Campi privati

        private IDataStore mDataStore;
        private string mDBSchema;
        SqlCommandBuilder mBuilder;

        #endregion Campi privati

        public UtilityDataProvider(IDataStore dataStore)
        {
            mDataStore = dataStore;
            mDBSchema = mDataStore.Schema;
            mBuilder = new SqlCommandBuilder();
        }

        public bool DDBReset()
        {
            mDataStore.BeginTransaction();

            try
            {
                //deletes all FactS, FiltS and TMP tables and all tables for attributes and dimensions built on demand
                string[] tables = mDataStore.GetExistingTables();
                foreach (string tab in tables)
                {
                    if (tab.StartsWith("FactS") || tab.StartsWith("TMP_") ||
                        (tab.StartsWith("Att") && tab != "AttTEXT_FREE@SDMX") || (tab.StartsWith("Dim") && tab != "DimTIME_PERIOD"))
                    {
                        mDataStore.ExecuteCommand($"DROP TABLE {tab}");
                    }
                }

                foreach (string tab in tables)
                {
                    if (tab.StartsWith("FiltS"))
                    {
                        mDataStore.ExecuteCommand($"DROP TABLE {tab}");
                    }
                }

                //deletes all user-created views
                string[] views = mDataStore.GetExistingViews();
                foreach (string v in views)
                {
                    mDataStore.ExecuteCommand($"DROP VIEW {v}");
                }

                //empties catalog tables
                mDataStore.ExecuteCommand($"DELETE FROM CatDataflow");
                mDataStore.ExecuteCommand($"DELETE FROM CatCube");
                mDataStore.ExecuteCommand($"DELETE FROM CatCategory");
                mDataStore.ExecuteCommand($"DELETE FROM AttTEXT_FREE@SDMX");
            }
            catch (Exception ex)
            {
                mDataStore.RollbackTransaction();
                throw Utility.Utils.getCustomException("DDBRESET_ERROR",
                    @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }

            mDataStore.CommitTransaction();
            return true;
        }

        public Dictionary<string, List<string>> GetItemsCodelistFromDsd(List<string> dsdCheck)
        {
            var dsdFromDDB = new Dictionary<string, List<string>>();
            foreach (var dsd in dsdCheck)
            {
                //Take all codelists from dsd
                var sql = $@"SELECT catDim.CodelistCode, catDim.MemberTable
FROM CatCube catCube
INNER JOIN CatDim catDim
ON catDim.IDCube=catCube.IDCube
WHERE catCube.DSDCode={mDataStore.PARAM_PREFIX}DSDCode AND CodelistCode IS NOT NULL
UNION
SELECT catAtt.CodelistCode, catAtt.MemberTable
FROM CatCube catCube
INNER JOIN CatAtt catAtt
ON catAtt.IDCube=catCube.IDCube
WHERE catCube.DSDCode={mDataStore.PARAM_PREFIX}DSDCode AND CodelistCode IS NOT NULL";
                var listParam = new List<STKeyValuePair>();
                listParam.Add(new STKeyValuePair("DSDCode", dsd));
                var ddbCodeList = mDataStore.GetTable(sql, listParam.ToArray());

                foreach (DataRow data in ddbCodeList.Rows)
                {
                    //Take all items from codelist
                    var sqlItem = $@"SELECT Code FROM {mBuilder.QuoteIdentifier((string)data[1])}";
                    var ddbCodeListItem = mDataStore.GetTable(sqlItem);

                    var key = $"{dsd}|{data[0]}";
                    if (!dsdFromDDB.ContainsKey(key))
                    {
                        dsdFromDDB.Add(key, new List<string>());
                    }

                    foreach (DataRow ddbItem in ddbCodeListItem.Rows)
                    {
                        dsdFromDDB[key].Add((string)ddbItem[0]);
                    }
                }
            }
            return dsdFromDDB;
        }

        public Dictionary<string, List<string>> GetItemsFromCodelist(List<ArtefactIdentity> codeListCheck)
        {
            var codeListFromDDB = new Dictionary<string, List<string>>();
            foreach (var codeItem in codeListCheck)
            {
                //Take all codelists from dsd
                var sql = $@"SELECT catDim.CodelistCode, catDim.MemberTable
FROM CatCube catCube
INNER JOIN CatDim catDim
ON catDim.IDCube=catCube.IDCube
WHERE CodelistCode LIKE {mDataStore.PARAM_PREFIX}Code
UNION
SELECT catAtt.CodelistCode, catAtt.MemberTable
FROM CatCube catCube
INNER JOIN CatAtt catAtt
ON catAtt.IDCube=catCube.IDCube
WHERE CodelistCode LIKE {mDataStore.PARAM_PREFIX}Code";
                var listParam = new List<STKeyValuePair>();
                listParam.Add(new STKeyValuePair("Code", $"{codeItem.ID}+{codeItem.Agency}+%"));
                var ddbCodeList = mDataStore.GetTable(sql, listParam.ToArray());

                foreach (DataRow data in ddbCodeList.Rows)
                {
                    //Take all items from codelist
                    var sqlItem = $@"SELECT Code FROM {mBuilder.QuoteIdentifier((string)data[1])}";
                    var ddbCodeListItem = mDataStore.ExecuteReader(sqlItem);

                    var key = $"{data[0]}";
                    if (!codeListFromDDB.ContainsKey(key))
                    {
                        codeListFromDDB.Add(key, new List<string>());
                    }

                    while (ddbCodeListItem.Read())
                    {
                        codeListFromDDB[key].Add((string)ddbCodeListItem[0]);
                    }
                    ddbCodeListItem.Close();
                }
            }
            return codeListFromDDB;
        }

        public void SyncCodeList(Dictionary<string, List<string>> itemsCodeListToSync)
        {
            try
            {
                var codeLists = new Dictionary<string, List<string>>();

                //Merging codelists whith the same Id+Agency (ignore version)
                foreach (var codeList in itemsCodeListToSync)
                {
                    var codeListKey = codeList.Key.Split('+');
                    var key = $"{codeListKey[0]}+{codeListKey[1]}";//ID + AgencyId
                    if (!codeLists.ContainsKey(key))
                    {
                        codeLists.Add(key, new List<string>());
                    }
                    foreach (var item in codeList.Value)
                    {
                        if (!codeLists[key].Contains(item))
                        {
                            codeLists[key].Add(item);
                        }
                    }
                }


                //Sync CodeList in DDB
                mDataStore.BeginTransaction();
                foreach (var codeList in codeLists)
                {
                    var sqlTable = $@"SELECT catDim.MemberTable
                                    FROM [CatCube] catCube
                                    INNER JOIN [CatDim] catDim
                                    ON catDim.IDCube=catCube.IDCube
                                    WHERE CodelistCode LIKE {mDataStore.PARAM_PREFIX}CodeList
                                    UNION
                                    SELECT catAtt.MemberTable
                                    FROM [CatCube] catCube
                                    INNER JOIN [CatAtt] catAtt
                                    ON catAtt.IDCube=catCube.IDCube
                                    WHERE CodelistCode LIKE {mDataStore.PARAM_PREFIX}CodeList";

                    var listParam = new List<STKeyValuePair>();
                    listParam.Add(new STKeyValuePair("CodeList", $"{codeList.Key}+%"));//Search By Id+AgencyId+%(any version)
                    var dt = mDataStore.GetTable(sqlTable, listParam.ToArray());

                    if (dt.Rows.Count <= 0)
                    {
                        continue;
                    }

                    foreach (DataRow dr in dt.Rows)
                    {
                        var name = (string)dr[0];

                        var newItems = new DataTable(name);
                        newItems.Columns.Add("Code", Type.GetType("System.String"));
                        newItems.Columns["Code"].MaxLength = 2000;
                        newItems.Columns.Add("Ordering", Type.GetType("System.Int32"));
                        newItems.Columns.Add("TimeStmp", Type.GetType("System.DateTime"));
                        newItems.PrimaryKey = new DataColumn[] { newItems.Columns["Code"] };

                        foreach (var item in codeList.Value)
                        {
                            var drAdd = newItems.NewRow();
                            drAdd[0] = item;
                            newItems.Rows.Add(drAdd);
                        }
                        //Sync items with DDB 
                        mDataStore.InsertUpdateData(newItems);
                    }
                }
                mDataStore.CommitTransaction();
            }
            catch (Exception ex)
            {
                mDataStore.RollbackTransaction();
                throw Utils.getCustomException("SyncCodeList",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        public bool CompareDSD(DsdReport dsdReport)
        {
            var md5 = dsdReport.HashReport;
            dsdReport.HashReport = "DSDCOMPARE";
            var checkMD5 = Utils.EncodeMD5String(JsonConvert.SerializeObject(dsdReport));
            if (!checkMD5.Equals(md5))
            {
                throw Utils.getCustomException("DSDREPORT_INVALID",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - Invalid MD5 Code for DsdReport", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }

            var sourceDsd = dsdReport.SourceDsd.Split("+");
            var targetDsd = dsdReport.TargetDsd.Split("+");
            if (sourceDsd != null && sourceDsd.Length>=3 && targetDsd != null && targetDsd.Length >= 3)
            {
                Version sourceVersion = new Version(sourceDsd[2]);
                Version targetVersion = new Version(targetDsd[2]);
                switch (sourceVersion.CompareTo(targetVersion))
                {
                    case 0: //Source is same than target
                        return false;
                    case 1: //Source is later than target
                        return false;
                    case -1:
                        break;
                }
            }
            else
            {
                return false;
            }

            //Dimensions
            if (dsdReport.SourceDimensions.Count > 0 ||
                dsdReport.TargetDimensions.Count > 0)
            { //Check for the same Key in both DSD, else FALSE
                return false;
            }
            foreach (var attr in dsdReport.DifferenceDimensions)
            { //Check the difference is only for AgencyId and Version, else FALSE
                if (attr.Source == null && attr.Target != null ||
                    attr.Source != null && attr.Target == null ||
                    (attr.Source != null && attr.Target != null && !attr.Source.ID.Equals(attr.Target.ID, StringComparison.InvariantCultureIgnoreCase))
                    )
                { //Different ID
                    return false;
                }
            }


            //Attributes Mandatory
            if (dsdReport.SourceAttributes.Where(item => item.Mandatory).Count() > 0 ||
                dsdReport.TargetAttributes.Where(item => item.Mandatory).Count() > 0)
            { //Check for the same Key in both DSD, else FALSE
                return false;
            }


            //Check difference for all Attributes
            foreach (var attr in dsdReport.DifferenceAttributes)
            { //Check the difference is only for AgencyId and Version, else FALSE
                if (attr.Source == null && attr.Target != null ||
                    attr.Source != null && attr.Target == null ||
                    (attr.Source != null && attr.Target != null && !attr.Source.ID.Equals(attr.Target.ID, StringComparison.InvariantCultureIgnoreCase))
                    )
                { //Different ID
                    return false;
                }
            }


            //Attributes Conditional (No Mandatory)
            if (dsdReport.SourceAttributes.Where(item => !item.Mandatory).Count() > 0)
            { //Attribute can be delete, only if it's never used in any Cube
                var builderDataProvider = new BuilderDataProvider(mDataStore);

                //Get all avaiables cube
                var allCube = builderDataProvider.getAvailableCubes();
                var usedCube = new List<Cube>();
                foreach (var cube in allCube)
                { //take only cube that use the Dsd
                    if (cube.DSDCode.Equals(dsdReport.SourceDsd, StringComparison.InvariantCultureIgnoreCase))
                    {
                        usedCube.Add(cube);
                    }
                }

                var allCubeDetails = new Dictionary<int, CubeWithDetails>();
                foreach (var removeAttr in dsdReport.SourceAttributes)
                {
                    foreach (var cube in usedCube)
                    {
                        CubeWithDetails detailCube = null;
                        if (!allCubeDetails.ContainsKey(cube.IDCube))
                        {
                            detailCube = builderDataProvider.getCube(cube.IDCube);
                            allCubeDetails.Add(cube.IDCube, detailCube);
                        }
                        else
                        {
                            detailCube = allCubeDetails[cube.IDCube];
                        }

                        //Check if cube use a removed attr
                        var usedAttr = detailCube.Attributes.Any(att => att.Code.Equals(removeAttr.Key));
                        if (usedAttr)
                        {
                            return false;
                        }
                    }
                }
            }

            //TargetMeasures
            if (dsdReport.SourceMeasures.Count > 0 ||
                dsdReport.TargetMeasures.Count > 0)
            { //Check for the same Key in both DSD, else FALSE
                return false;
            }
            foreach (var attr in dsdReport.DifferenceMeasures)
            { //Check the difference is only for AgencyId and Version, else FALSE
                if (attr.Source == null && attr.Target != null ||
                    attr.Source != null && attr.Target == null ||
                    (attr.Source != null && attr.Target != null && !attr.Source.ID.Equals(attr.Target.ID, StringComparison.InvariantCultureIgnoreCase))
                    )
                { //Different ID
                    return false;
                }
            }
            dsdReport.Compare = true;
            return true;
        }

        public List<int> GetDataFlowsFromDSD(ArtefactIdentity artefactIdentity)
        {
            try
            {
                //Get all DataFlow With DSD to Upgrade
                var allCube = $@"SELECT cFlow.IDDataFlow 
                                FROM CatCube cCube
                                INNER JOIN CatDataFlow cFlow
                                ON cFlow.IDCube=cCube.IDCube 
                                WHERE cCube.DSDCode={mDataStore.PARAM_PREFIX}DSDCode";
                var listParam = new STKeyValuePair[] { new STKeyValuePair("DSDCode", $"{artefactIdentity.ID}+{artefactIdentity.Agency}+{artefactIdentity.Version}") };
                var reader = mDataStore.ExecuteReader(allCube, listParam);

                var dataFlowIds = new List<int>();
                while (reader.Read())
                {
                    dataFlowIds.Add((int)reader["IDDataFlow"]);
                }
                reader.Close();

                return dataFlowIds;
            }
            catch (Exception ex)
            {
                throw Utils.getCustomException("GETDATAFLOWSFROMDSD_ERROR",
                    @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        public bool UpgradeCube(DsdReport dsdReport)
        {
            var result = CompareDSD(dsdReport);
            if (!result)
            {
                throw Utils.getCustomException("UPGRADECUBE_NOTCOMPATIBLE",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + $" - DSD {dsdReport.SourceDsd} not compatible with DSD {dsdReport.TargetDsd}", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }

            mDataStore.BeginTransaction();

            try
            {
                //Get all Cube With DSD to Upgrade
                var allCube = $"SELECT IDCube FROM CatCube WHERE DSDCode={mDataStore.PARAM_PREFIX}DSDCode";
                var listParam = new STKeyValuePair[] { new STKeyValuePair("DSDCode", dsdReport.SourceDsd) };
                var reader = mDataStore.ExecuteReader(allCube, listParam);

                var cubeIds = new List<int>();
                while (reader.Read())
                {
                    cubeIds.Add((int)reader["IDCube"]);
                }
                reader.Close();

                var memberTableJustSync = new List<string>();

                var currentDateTime = DateTime.Now;
                var itemsCodeListToSync = new Dictionary<string, List<string>>();

                var getDataAttribute = $"SELECT IDAtt, MemberTable FROM CatAtt WHERE IDCube={mDataStore.PARAM_PREFIX}IDCube AND Code={mDataStore.PARAM_PREFIX}Code AND CodelistCode<>{mDataStore.PARAM_PREFIX}CodeList";
                var getDataDimension = $"SELECT IDDim, MemberTable FROM CatDim WHERE IDCube={mDataStore.PARAM_PREFIX}IDCube AND Code={mDataStore.PARAM_PREFIX}Code AND CodelistCode<>{mDataStore.PARAM_PREFIX}CodeList";

                var updAttr = $"UPDATE CatAtt SET CodelistCode={mDataStore.PARAM_PREFIX}CodeList, TimeStmp={mDataStore.PARAM_PREFIX}CurrentDateTime WHERE IDAtt={mDataStore.PARAM_PREFIX}IDAtt";
                var updDim = $"UPDATE CatDim SET CodelistCode={mDataStore.PARAM_PREFIX}CodeList, TimeStmp={mDataStore.PARAM_PREFIX}CurrentDateTime WHERE IDDim={mDataStore.PARAM_PREFIX}IDDim";

                var updCube = $"UPDATE CatCube SET DSDCode={mDataStore.PARAM_PREFIX}DSDCode, LastUpdated={mDataStore.PARAM_PREFIX}CurrentDateTime WHERE IDCube={mDataStore.PARAM_PREFIX}IDCube";
                foreach (var idCube in cubeIds)
                {
                    //Upgrade ATTRIBUTE
                    foreach (var item in dsdReport.DifferenceAttributes)
                    {
                        listParam = new STKeyValuePair[] { new STKeyValuePair("IDCube", idCube),
                                                            new STKeyValuePair("Code", item.Key),
                                                            new STKeyValuePair("CodeList", item.Target != null ? (object) $"{item.Target.ID}+{item.Target.AgencyId}+{item.Target.Version}" : DBNull.Value)};
                        var dataAttribute = mDataStore.ExecuteReader(getDataAttribute, listParam);
                        if (!dataAttribute.Read())
                        {
                            dataAttribute.Close();
                            continue;
                        }

                        var memberTable = (string)dataAttribute["MemberTable"];
                        var idAtt = (int)dataAttribute["IDAtt"];
                        dataAttribute.Close();

                        //Upgrade CodeList
                        listParam = new STKeyValuePair[] { new STKeyValuePair("IDAtt", idAtt),
                                                            new STKeyValuePair("CodeList", item.Target != null ? (object) $"{item.Target.ID}+{item.Target.AgencyId}+{item.Target.Version}" : DBNull.Value),
                                                            new STKeyValuePair("CurrentDateTime", currentDateTime) };
                        mDataStore.ExecuteCommand(updAttr, listParam);

                        if (item.Target == null || memberTableJustSync.Contains($"{memberTable}+{item.Target.ID}+{item.Target.AgencyId}+{item.Target.Version}"))
                        {
                            continue;
                        }

                        //Take all Code list inside of table
                        var sqlItem = $"SELECT Code, IDMember FROM {mBuilder.QuoteIdentifier(memberTable)}";
                        int maxId = 1;

                        var ddbCodeListItem = mDataStore.ExecuteReader(sqlItem);

                        var codePresent = new List<string>();
                        while (ddbCodeListItem.Read())
                        {
                            codePresent.Add(((string)ddbCodeListItem[0]).ToUpperInvariant());
                            maxId = (int)ddbCodeListItem[1] > maxId ? (int)ddbCodeListItem[1] : maxId;
                        }
                        ddbCodeListItem.Close();

                        //Update Code inside of new Code in CodeList
                        AttDimStructDataTable newItems = new AttDimStructDataTable();
                        newItems.TableName = memberTable;
                        newItems.IDMemberColumn.AutoIncrementSeed = maxId + 1;

                        foreach (var code in item.Code)
                        {
                            var findElement = codePresent.Remove(code); //Remove item for fast search with N element
                            if (findElement)
                            {
                                continue;
                            }
                            var drAdd = newItems.NewAttDimStructRow();
                            drAdd.Code = code;
                            drAdd.TimeStmp = DateTime.Now;
                            newItems.Rows.Add(drAdd);
                        }
                        //Sync items with DDB 
                        if (newItems.Rows.Count > 0)
                        {
                            mDataStore.InsertUpdateData(newItems);
                        }

                        memberTableJustSync.Add($"{memberTable}+{item.Target.ID}+{item.Target.AgencyId}+{item.Target.Version}");
                    }

                    //Upgrade DIMENSION
                    foreach (var item in dsdReport.DifferenceDimensions)
                    {
                        listParam = new STKeyValuePair[] { new STKeyValuePair("IDCube", idCube),
                                                        new STKeyValuePair("Code", item.Key),
                                                        new STKeyValuePair("CodeList", item.Target != null ? (object) $"{item.Target.ID}+{item.Target.AgencyId}+{item.Target.Version}" : DBNull.Value)};
                        var dataAttribute = mDataStore.ExecuteReader(getDataDimension, listParam);
                        if (!dataAttribute.Read())
                        {
                            continue;
                        }

                        var memberTable = (string)dataAttribute["MemberTable"];
                        var idDim = (int)dataAttribute["IDDim"];
                        dataAttribute.Close();

                        //Upgrade CodeList
                        listParam = new STKeyValuePair[] { new STKeyValuePair("IDDim", idDim),
                                                        new STKeyValuePair("CodeList", item.Target != null ? (object) $"{item.Target.ID}+{item.Target.AgencyId}+{item.Target.Version}" : DBNull.Value),
                                                        new STKeyValuePair("CurrentDateTime", currentDateTime) };
                        mDataStore.ExecuteCommand(updDim, listParam);

                        if (item.Target == null || memberTableJustSync.Contains($"{memberTable}+{item.Target.ID}+{item.Target.AgencyId}+{item.Target.Version}"))
                        {
                            continue;
                        }

                        //Take all Code list inside of table
                        var sqlItem = $"SELECT Code, IDMember FROM {mBuilder.QuoteIdentifier(memberTable)}";
                        int maxId = 1;
                        var ddbCodeListItem = mDataStore.ExecuteReader(sqlItem);

                        var codePresent = new List<string>();
                        while (ddbCodeListItem.Read())
                        {
                            codePresent.Add(((string)ddbCodeListItem[0]).ToUpperInvariant());
                            maxId = (int)ddbCodeListItem[1] > maxId ? (int)ddbCodeListItem[1] : maxId;
                        }
                        ddbCodeListItem.Close();

                        //Update Code inside of new Code in CodeList
                        AttDimStructDataTable newItems = new AttDimStructDataTable();
                        newItems.TableName = memberTable;
                        newItems.IDMemberColumn.AutoIncrementSeed = maxId + 1;

                        foreach (var code in item.Code)
                        {
                            var findElement = codePresent.Remove(code); //Remove item for fast search with N element
                            if (findElement)
                            {
                                continue;
                            }
                            var drAdd = newItems.NewAttDimStructRow();
                            drAdd.Code = code;
                            drAdd.TimeStmp = DateTime.Now;
                            newItems.Rows.Add(drAdd);
                        }
                        //Sync items with DDB 
                        if (newItems.Rows.Count > 0)
                        {
                            mDataStore.InsertUpdateData(newItems);
                        }

                        memberTableJustSync.Add($"{memberTable}+{item.Target.ID}+{item.Target.AgencyId}+{item.Target.Version}");
                    }

                    //Upgrade CUBE
                    listParam = new STKeyValuePair[] { new STKeyValuePair("IDCube", idCube),
                                                            new STKeyValuePair("DSDCode", dsdReport.TargetDsd),
                                                            new STKeyValuePair("CurrentDateTime", currentDateTime) };
                    mDataStore.ExecuteCommand(updCube, listParam);
                }
            }
            catch (Exception ex)
            {
                mDataStore.RollbackTransaction();
                throw Utils.getCustomException("UPGRADECUBE_ERROR",
                    @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }

            mDataStore.CommitTransaction();

            return true;
        }

        public List<string> GetFieldForCube(int idCube)
        {
            var listField = new List<string>();
            var query = $@"SELECT ColName FROM CatAtt WHERE AttachmentLevel != 'Observation' AND IDCube={mDataStore.PARAM_PREFIX}IDCube
                        UNION
                        SELECT ColName FROM CatDim WHERE IsTimeSeriesDim != 1 AND IDCube={mDataStore.PARAM_PREFIX}IDCube";

            var listParam = new STKeyValuePair[] { new STKeyValuePair("IDCube", idCube) };
            try
            {
                var reader = mDataStore.ExecuteReader(query, listParam);

                while (reader.Read())
                {
                    listField.Add((string)reader[0]);
                }
                reader.Close();
            }
            catch (Exception ex)
            {
                throw Utils.getCustomException("GetFieldForCube",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
            return listField;
        }

        public DataResults GetSeriesForCube(int idCube, DDBDataflow ddbDataflow)
        {
            try
            {
                var utilsDataProvider = new UtilsDataProvider(mDataStore);

                var tableName = $"Dataset_{idCube}_ViewAllSeries";
                var table = mDataStore.GetTableDefinition(tableName);


                var strSelColumn = "*"; //utilsDataProvider.GenerateSelectColumn(optionsTable, table);

                var listParam = new List<STKeyValuePair>();
                var filterStr = ddbDataflow.Filter?.ToSql();
                var query = $"SELECT * FROM {mBuilder.QuoteIdentifier(tableName)}";
                var queryCnt = $"SELECT count(*) FROM {mBuilder.QuoteIdentifier(tableName)}";
                if (!string.IsNullOrWhiteSpace(filterStr))
                {
                    query = $"{query} WHERE {filterStr}";
                    queryCnt = $"{queryCnt} WHERE {filterStr}";
                }

                List<string> allCols = table.Select(i => i.Value.ColumnName).ToList();
                var strSortColumn = allCols.First();
                if (ddbDataflow?.SqlData?.SortCols != null && ddbDataflow.SqlData.SortCols.Count > 0)
                { //In case of sort throw an exception if sortCols haven't a name of a db column (this control also prevents sql injection)

                    //Get all columns
                    var i = 0;
                    foreach (var item in ddbDataflow.SqlData.SortCols)
                    {
                        if (!allCols.Contains(item))
                        {
                            throw Utility.Utils.getCustomException("DF_INVALID_COLUMN_NAME",
                            @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - Dataflow filter on unknown column.", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
                        }

                        strSortColumn = i > 0 ? $"{strSortColumn},{item}" : item;
                        i++;
                    }
                }

                var count = (int)mDataStore.ExecuteScalar(queryCnt);
                var pagedQuery = mDataStore.GetPagedQuery(query, strSortColumn, ddbDataflow.SqlData.NumPage - 1, ddbDataflow.SqlData.PageSize, ddbDataflow.SqlData.SortByDesc);
                var dt = mDataStore.GetTable(pagedQuery, listParam.ToArray());

                var result = new DataResults { Data = dt, Count = count };

                result.Columns = allCols;

                return result;
            }
            catch (Exception ex)
            {
                throw Utils.getCustomException("GetSeriesForCube",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        public void DeleteSeries(int idCube, List<int> sId)
        {
            var tableFiltS = $"FiltS{idCube}";
            var tableFactSTmp = $"FactS_TEMP_{idCube}";
            var tableFactS = $"FactS{idCube}";
            var queryDeleteFilt = $"DELETE FROM {mBuilder.QuoteIdentifier(tableFiltS)} WHERE SID={mDataStore.PARAM_PREFIX}SID";
            var queryDeleteFactTmp = $"DELETE FROM {mBuilder.QuoteIdentifier(tableFactSTmp)} WHERE SID={mDataStore.PARAM_PREFIX}SID";
            var queryDeleteFact = $"DELETE FROM {mBuilder.QuoteIdentifier(tableFactS)} WHERE SID={mDataStore.PARAM_PREFIX}SID";

            //mDataStore.ExecuteCommand($@"ALTER TABLE [{tableFiltS}] NOCHECK CONSTRAINT ALL;
            //                                    ALTER INDEX ALL ON [{tableFiltS}] DISABLE;
            //                                    ALTER TABLE [{tableFactSTmp}] NOCHECK CONSTRAINT ALL;
            //                                    ALTER INDEX ALL ON [{tableFactSTmp}] DISABLE;
            //                                    ALTER TABLE [{tableFactS}] NOCHECK CONSTRAINT ALL;
            //                                    ALTER INDEX ALL ON [{tableFactS}] DISABLE;");
            mDataStore.BeginTransaction();
            try
            {
                foreach (var id in sId)
                {
                    var listParam = new STKeyValuePair[] { new STKeyValuePair("SID", id) };
                    mDataStore.ExecuteCommand(queryDeleteFact, listParam);
                    if (mDataStore.ExistsTable(tableFactSTmp))
                    {
                        mDataStore.ExecuteCommand(queryDeleteFactTmp, listParam);
                    }
                    mDataStore.ExecuteCommand(queryDeleteFilt, listParam);
                }

                mDataStore.CommitTransaction();
            }
            catch (Exception ex)
            {
                mDataStore.RollbackTransaction();
                throw Utils.getCustomException("DeleteSeries",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
            finally
            {
                //mDataStore.ExecuteCommand($@"ALTER INDEX ALL ON [{tableFiltS}] REBUILD;
                //                                ALTER TABLE [{tableFiltS}] CHECK CONSTRAINT ALL;
                //                                ALTER INDEX ALL ON [{tableFactSTmp}] REBUILD;
                //                                ALTER TABLE [{tableFactSTmp}] CHECK CONSTRAINT ALL;
                //                                ALTER INDEX ALL ON [{tableFactS}] REBUILD;
                //                                ALTER TABLE [{tableFactS}] CHECK CONSTRAINT ALL;");
            }
        }

        public List<DsdWithDataflow> GetDSDWithDataflow()
        {
            try
            {
                //Get all DSD With Dataflow 
                var allDsd = $@"SELECT cube.DSDCode, dataFLow.ID, dataFLow.Agency, dataFLow.Version
                          FROM [CatDataFlow] dataFLow
                          INNER JOIN [CatCube] cube
                          ON cube.IDCube=dataFLow.IDCube";
                var reader = mDataStore.ExecuteReader(allDsd);

                var listDsdWithDataflow = new List<DsdWithDataflow>();
                while (reader.Read())
                {
                    var dsd = reader.GetString(0).Split('+');
                    var itemDsd = new DsdWithDataflow();
                    itemDsd.ID = dsd[0];
                    itemDsd.Agency = dsd[1];
                    itemDsd.Version = dsd[2];
                    itemDsd.EnumType = Org.Sdmxsource.Sdmx.Api.Constants.SdmxStructureEnumType.Dsd;

                    var find = listDsdWithDataflow.FirstOrDefault(item => itemDsd.ID.Equals(item.ID) && itemDsd.Agency.Equals(item.Agency) && itemDsd.Version.Equals(item.Version));
                    
                    if (find == null)
                    {
                        listDsdWithDataflow.Add(itemDsd);
                        find = itemDsd;
                    }
                    find.Dataflows.Add(new DataflowReport { ID = reader.GetString(1), Agency = reader.GetString(2), Version = reader.GetString(3), EnumType = Org.Sdmxsource.Sdmx.Api.Constants.SdmxStructureEnumType.Dataflow });
                }
                reader.Close();

                var dataFlowName = $@"SELECT dfLocal.TwoLetterISO, dfLocal.Valore
                                    FROM CatDataFlow df
                                    INNER JOIN localised_CatDataFlow dfLocal
                                    ON dfLocal.IDMember=df.IDDataFlow
                                    WHERE df.ID={mDataStore.PARAM_PREFIX}DfId AND df.Agency={mDataStore.PARAM_PREFIX}DfAgency AND df.Version={mDataStore.PARAM_PREFIX}DfVersion";
                foreach (var dsd in listDsdWithDataflow)
                {
                    foreach (var df in dsd.Dataflows)
                    {
                        var listParam = new STKeyValuePair[] { new STKeyValuePair("DfId", df.ID),
                                                                new STKeyValuePair("DfAgency", df.Agency),
                                                                new STKeyValuePair("DfVersion", df.Version)};
                        reader = mDataStore.ExecuteReader(dataFlowName, listParam);
                        while (reader.Read())
                        {
                            df.Names.Add(reader.GetString(0), reader.GetString(1));
                        }
                        reader.Close();
                    }
                }
                

                return listDsdWithDataflow;
            }
            catch (Exception ex)
            {
                throw Utils.getCustomException("GETDATAFLOWSFROMDSD_ERROR",
                    @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        public void RemoveOldTempTable(string table)
        {
            mDataStore.ExecuteCommand($"DROP TABLE {mBuilder.QuoteIdentifier(table)}");
        }

    }
}
