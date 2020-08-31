using Configuration;
using DataStore.Interface;
using DDB.Entities;
using Org.Sdmx.Resources.SdmxMl.Schemas.V20.Registry;
using Org.Sdmxsource.Sdmx.Api.Constants;
using Org.Sdmxsource.Sdmx.Api.Model.Mutable.CategoryScheme;
using Org.Sdmxsource.Sdmx.Api.Model.Objects.Base;
using Org.Sdmxsource.Sdmx.Api.Model.Objects.CategoryScheme;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using static DataProvider.DDB_NEW;

namespace DataProvider
{
    public class BuilderDataProvider : IBuilderDataProvider
    {
        #region Campi privati

        private IDataStore mDataStore;
        private string mDBSchema;
        SqlCommandBuilder mBuilder;

        #endregion Campi privati

        public BuilderDataProvider(IDataStore dataStore)
        {
            mDataStore = dataStore;
            mDBSchema = mDataStore.Schema;
            mBuilder = new SqlCommandBuilder();
        }

        public int createCube(CubeWithDetails cube)
        {
            mDataStore.BeginTransaction();

            //verifying the cube has no duplicated codes
            checkDuplicateComponents(cube);

            try
            {
                //creating a row in CatCube table
                int IDCube = insertCatCubeRow(cube);

                //setting IDCube to the value inserted in the db 
                cube.IDCube = IDCube;

                //creating rows in localised_CatCube table
                insertLocalised_CatCubeRow(cube);

                //creating dimensions, measures and attributes of the cube
                insertCubeDimensions(cube);
                insertCubeMeasures(cube);
                insertCubeAttributes(cube);

                //creating FiltS, FactS and AttDsLev tables
                createFiltTable(IDCube);
                createFactTable(IDCube);
                if (cube.Attributes.Where(x => x.AttachmentLevel == AttachmentLevel.Dataset).ToArray().Length > 0)
                {
                    createAttDsLevTable(IDCube);
                }

                //creating cube's views
                createDatasetViews(IDCube);

                mDataStore.CommitTransaction();
                return IDCube;
            }
            catch (Exception ex)
            {
                mDataStore.RollbackTransaction();
                throw ex;
            }
        }

        public bool deleteCube(int CubeId)
        {
            STKeyValuePair[] parameters = new STKeyValuePair[] { new STKeyValuePair("IDCube", CubeId) };
            DataTable dt1 = mDataStore.GetTable(@"SELECT * FROM CatDataflow WHERE IDCube = @IDCube", parameters);
            if (dt1.Rows.Count > 0)
            {
                throw Utility.Utils.getCustomException("CUBE_WITH_ASSOCIATED_DATAFLOWS",
                    @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - Cannot delete cube with associated dataflows.", Infrastructure.STLogging.Interface.LogLevelEnum.Warn);
            }

            mDataStore.BeginTransaction();

            try
            {

                //getting tables for dimensions and attributes to be deleted (those that are not referenced by other cubes)
                DataTable tbDim = mDataStore.GetTable($@"SELECT d1.MemberTable
                                                     FROM CatDim d1
                                                     LEFT JOIN CatDim d2 on d1.MemberTable = d2.MemberTable AND d2.IDCube != @IDCube
                                                     WHERE d1.IDCube = @IDCube AND d1.IsTimeSeriesDim = 0 AND d2.IDCube is NULL", parameters);

                DataTable tbAtt = mDataStore.GetTable($@"SELECT a1.MemberTable
                                                     FROM CatAtt a1
                                                     LEFT JOIN CatAtt a2 on a1.MemberTable = a2.MemberTable AND a2.IDCube != @IDCube
                                                     WHERE a1.IDCube = @IDCube AND a2.IDCube is NULL AND a1.IsTid = 0", parameters);

                //deleting in progress loadings
                mDataStore.ExecuteCommand($"DELETE FROM UploadOps WHERE IDCube = @IDCube", parameters);

                //deleting tables for dimensions and attributes not referenced by other cubes
                if (tbDim.Rows.Count > 0)
                {
                    foreach (DataRow dr in tbDim.Rows)
                    {
                        if (mDataStore.ExistsTable(dr["MemberTable"].ToString()))
                            mDataStore.ExecuteCommand($"DROP TABLE {mBuilder.QuoteIdentifier(dr["MemberTable"].ToString())}");
                    }
                }

                if (tbAtt.Rows.Count > 0)
                {
                    foreach (DataRow dr in tbAtt.Rows)
                    {
                        if (mDataStore.ExistsTable(dr["MemberTable"].ToString()))
                            mDataStore.ExecuteCommand($"DROP TABLE {mBuilder.QuoteIdentifier(dr["MemberTable"].ToString())}");
                    }
                }

                if (mDataStore.ExistsView($"Dataset_{CubeId}_ViewCurrentData"))
                    mDataStore.ExecuteCommand($"DROP VIEW Dataset_{CubeId}_ViewCurrentData");

                if (mDataStore.ExistsView($"Dataset_{CubeId}_ViewAllSeries"))
                    mDataStore.ExecuteCommand($"DROP VIEW Dataset_{CubeId}_ViewAllSeries");

                if (mDataStore.ExistsView($"VIEW_DataFactS{CubeId}"))
                    mDataStore.ExecuteCommand($"DROP VIEW VIEW_DataFactS{CubeId}");

                //deleting FactS, FiltS and AttDsLev tables
                if (mDataStore.ExistsTable("FactS" + CubeId))
                    mDataStore.ExecuteCommand($"DROP TABLE FactS{CubeId}");

                if (mDataStore.ExistsTable("FactS_TEMP_" + CubeId))
                    mDataStore.ExecuteCommand($"DROP TABLE FactS_TEMP_{CubeId}");

                if (mDataStore.ExistsTable("FiltS" + CubeId))
                    mDataStore.ExecuteCommand($"DROP TABLE FiltS{CubeId}");

                if (mDataStore.ExistsTable("AttDsLev" + CubeId))
                    mDataStore.ExecuteCommand($"DROP TABLE AttDsLev{CubeId}");

                //deleting the row in CatCube table (all related info are deleted through CASCADE)
                mDataStore.ExecuteCommand($"DELETE FROM CatCube WHERE IDCube = @IDCube", parameters);
            }
            catch (Exception ex)
            {
                mDataStore.RollbackTransaction();
                throw Utility.Utils.getCustomException("CUBE_DELETE_ERROR",
                    @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }

            mDataStore.CommitTransaction();
            return true;
        }

        public List<Cube> getAvailableCubes()
        {
            try
            {
                List<Cube> cubeList = new List<Cube>();

                DataTable dt1 = mDataStore.GetTable(@"SELECT * FROM CatCube c INNER JOIN localised_CatCube loc ON c.IDCube = loc.IDMember");

                //selecting disting cubes
                DataTable dt2 = new DataView(dt1).ToTable("Cubes", true, "IDCube", "Code", "IDCat", "DSDCode", "LastUpdated", "HasEmbargoedData");

                //casting to typed DataTables
                CatCubeDataTable tbCube = new CatCubeDataTable();
                tbCube.Merge(dt2, true, MissingSchemaAction.Ignore);

                localised_CatCubeDataTable tbLoc = new localised_CatCubeDataTable();
                tbLoc.Merge(dt1, true, MissingSchemaAction.Ignore);

                foreach (CatCubeRow dr in tbCube.Rows)
                {
                    //getting labels associated to the cube
                    DataTable tblFilt = tbLoc.AsEnumerable().Where(row => row.IDMember == dr.IDCube).CopyToDataTable();

                    Cube c = getCubeFromRow(dr);

                    if (tblFilt.Rows.Count > 0)
                    {
                        Dictionary<string, string> labels = new Dictionary<string, string>();
                        foreach (DataRow r in tblFilt.Rows)
                            labels.Add(r["TwoLetterISO"].ToString(), r["Valore"].ToString());
                        c.labels = labels;
                    }
                    cubeList.Add(c);
                }
                return cubeList;
            }
            catch (Exception ex)
            {
                throw Utility.Utils.getCustomException("CUBE_RETRIEVING_AV_ERROR",
                    @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        public CubeWithDetails getCube(int cubeId)
        {
            STKeyValuePair[] parameters = new STKeyValuePair[] { new STKeyValuePair("IDCube", cubeId) };

            //executing queries
            DataTable tb0 = mDataStore.GetTable(@"SELECT * FROM CatCube WHERE IDCube = @IDCube", parameters);

            if (tb0.Rows.Count != 1)
            {
                throw Utility.Utils.getCustomException("CUBE_NOT_FOUND",
                    @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + $" - Cube {cubeId} not found.", Infrastructure.STLogging.Interface.LogLevelEnum.Warn);
            }

            DataTable tb1 = mDataStore.GetTable(@"SELECT * FROM localised_CatCube WHERE IDMember = @IDCube", parameters);

            if (tb1.Rows.Count < 1)
            {
                throw Utility.Utils.getCustomException("CUBE_WITHOUT_LABEL",
                    @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + $" - Cube {cubeId} has no associated labels.", Infrastructure.STLogging.Interface.LogLevelEnum.Warn);
            }

            try
            {

                DataTable tb2 = mDataStore.GetTable(@"  SELECT a.Code as AttCode, d.Code as DimCode
                                                    FROM CatAttDim ad
                                                    INNER JOIN CatAtt a on a.IDAtt = ad.IDAtt 
                                                    INNER JOIN CatDim d on d.IDDim = ad.IDDim 
                                                    WHERE a.IDCube = @IDCube", parameters);

                DataTable tb3 = mDataStore.GetTable(@"SELECT * FROM CatAtt WHERE IDCube = @IDCube", parameters);
                DataTable tb4 = mDataStore.GetTable(@"SELECT * FROM CatDim WHERE IDCube = @IDCube", parameters);
                DataTable tb5 = mDataStore.GetTable(@"SELECT * FROM CatMeas WHERE IDCube = @IDCube", parameters);

                //casting to typed DataTables
                CatCubeDataTable tbCube = new CatCubeDataTable();
                tbCube.Merge(tb0, true, MissingSchemaAction.Ignore);

                localised_CatCubeDataTable tbLoc = new localised_CatCubeDataTable();
                tbLoc.Merge(tb1, true, MissingSchemaAction.Ignore);

                CatAttDataTable tbAtt = new CatAttDataTable();
                tbAtt.Merge(tb3, true, MissingSchemaAction.Ignore);

                CatDimDataTable tbDim = new CatDimDataTable();
                tbDim.Merge(tb4, true, MissingSchemaAction.Ignore);

                CatMeasDataTable tbMeas = new CatMeasDataTable();
                tbMeas.Merge(tb5, true, MissingSchemaAction.Ignore);

                CubeWithDetails c = getCubeWithDetailsFromRow(tbCube[0], tbAtt, tbDim, tbMeas, tb2);

                Dictionary<string, string> labels = new Dictionary<string, string>();
                foreach (DataRow r in tbLoc.Rows)
                    labels.Add(r["TwoLetterISO"].ToString(), r["Valore"].ToString());
                c.labels = labels;

                return c;
            }
            catch (Exception ex)
            {
                throw Utility.Utils.getCustomException("CUBE_RETRIEVING_ERROR",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        public List<Category> getDCS()
        {
            DataTable dt1 = mDataStore.GetTable(@"SELECT * FROM CatCategory");
            DataTable dt2 = mDataStore.GetTable(@"SELECT * FROM localised_CatCategory");

            if (dt1.Rows.Count == 0)
            {
                throw Utility.Utils.getCustomException("DEF_CAT_SCHEME_EMPTY",
                    @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + $" - Default category scheme cannot be empty.", Infrastructure.STLogging.Interface.LogLevelEnum.Warn);
            }

            List<Category> cats = new List<Category>();

            try
            {
                //casting to typed DataTables
                CatCategoryDataTable tbCat = new CatCategoryDataTable();
                tbCat.Merge(dt1, true, MissingSchemaAction.Ignore);

                localised_CatCategoryDataTable tbLoc = new localised_CatCategoryDataTable();
                tbLoc.Merge(dt2, true, MissingSchemaAction.Ignore);

                foreach (CatCategoryRow dr in tbCat.Where(row => row.IsIDParentNull()).OrderBy(u => u.Ord))
                    getCategory(dr, tbCat, tbLoc, ref cats);

                return cats;
            }
            catch (Exception ex)
            {
                throw Utility.Utils.getCustomException("DCS_RETRIEVING_ERROR",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        public int InsertDCS(Category category)
        {
            var parameters = new STKeyValuePair[] {
                new STKeyValuePair("CatCode", category.CatCode)
                };

            var isDuplicate = (int)mDataStore.ExecuteScalar($@"SELECT COUNT(*) FROM CatCategory WHERE CatCode={mDataStore.PARAM_PREFIX}CatCode") > 0;
            if (isDuplicate)
            {
                throw Utility.Utils.getCustomException("DCS_INSERT_DUPLICATECODE",
               @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + $" - Category Code {category.ParCode} is dulicate", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }


            //Search parent category
            int parentId = -1;
            if (!string.IsNullOrWhiteSpace(category.ParCode))
            {
                var parentCatObj = mDataStore.ExecuteScalar($@"SELECT IDCat FROM CatCategory WHERE CatCode={mDataStore.PARAM_PREFIX}CatCode");
                if (parentCatObj == null || parentCatObj == DBNull.Value)
                {
                    throw Utility.Utils.getCustomException("DCS_INSERT_PARENTNOTFOUND",
               @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + $" - Parent Category Code {category.ParCode} not found ", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
                }
                parentId = (int)parentCatObj;
            }

            try
            {
                var objMax = mDataStore.ExecuteScalar($@"SELECT Max(Ord) FROM CatCategory WHERE IDParent={mDataStore.PARAM_PREFIX}IDParent");
                var maxOrd = 1;
                if (objMax != null && objMax != DBNull.Value)
                {
                    maxOrd = (int)objMax + 1;
                }

                parameters = new STKeyValuePair[] {
                new STKeyValuePair("CatCode", category.CatCode),
                new STKeyValuePair("IDParent", parentId <= 0 ? (object) parentId : DBNull.Value),
                new STKeyValuePair("Ord", maxOrd)
                };

                mDataStore.BeginTransaction();

                var newCatId = (int)mDataStore.ExecuteScalar($@"INSERT INTO CatCategory(CatCode, IDParent, Ord) OUTPUT Inserted.IDCat VALUES ({mDataStore.PARAM_PREFIX}CatCode, {mDataStore.PARAM_PREFIX}IDParent, {mDataStore.PARAM_PREFIX}Ord);", parameters);

                foreach (var item in category.labels)
                {
                    parameters = new STKeyValuePair[] {
                    new STKeyValuePair("IDMember", newCatId),
                    new STKeyValuePair("TwoLetterISO", item.Key),
                    new STKeyValuePair("Valore", item.Value)
                    };
                    mDataStore.ExecuteCommand($@"INSERT INTO localised_CatCategory(IDMember, TwoLetterISO, Valore)  VALUES ({mDataStore.PARAM_PREFIX}IDMember, {mDataStore.PARAM_PREFIX}TwoLetterISO, {mDataStore.PARAM_PREFIX}Valore", parameters);
                }

                mDataStore.CommitTransaction();

                return -1;
            }
            catch (Exception ex)
            {
                mDataStore.RollbackTransaction();
                throw Utility.Utils.getCustomException("DCS_INSERT_ERROR",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        public void MoveDCS(string updCatCode, string newParentCatCode, string moveBefore, string moveAfter)
        {
            var parameters = new STKeyValuePair[] {
                    new STKeyValuePair("CatCode", updCatCode)
                    };
            var reader = mDataStore.ExecuteReader($"SELECT * FROM CatCategory WHERE CatCode={mDataStore.PARAM_PREFIX}CatCode", parameters);
            CategoryMove oldCatValue = null;
            if (reader.Read())
            {
                var objParent = reader["IDParent"];
                var idParent = 0;
                if (objParent != null && objParent != DBNull.Value)
                {
                    idParent = (int)objParent;
                }
                oldCatValue = new CategoryMove
                {
                    IDCat = (int)reader["IDCat"],
                    CatCode = (string)reader["CatCode"],
                    IDParent = idParent,
                    Ord = (int)reader["Ord"]
                };
            }
            reader.Close();

            if (oldCatValue == null)
            {
                throw Utility.Utils.getCustomException("DCS_UPDATE_CATEGORYNOTFOUND",
               @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + $" - Category Code {updCatCode} not found ", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }

            var newParentId = -1;
            if (!string.IsNullOrWhiteSpace(newParentCatCode))
            {
                parameters = new STKeyValuePair[] {
                    new STKeyValuePair("CatCode", newParentCatCode)
                    };
                var parIdObj = mDataStore.ExecuteScalar($"SELECT IdCat FROM CatCategory WHERE CatCode={mDataStore.PARAM_PREFIX}CatCode", parameters);
                if (parIdObj != null && parIdObj != DBNull.Value)
                {
                    newParentId = (int)parIdObj;
                }
            }
            else
            {
                newParentId = 0;
            }
            if (newParentId == -1)
            {
                throw Utility.Utils.getCustomException("DCS_UPDATE_PARENTNOTFOUND",
           @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + $" - Parent Category Code {newParentCatCode} not found ", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }

            //If update change the ParentCode
            if (newParentId != oldCatValue.IDParent)
            {
                var parametersUpdateOrd = new STKeyValuePair[] {
                    new STKeyValuePair("Ord", oldCatValue.Ord),
                    new STKeyValuePair("IDParent", oldCatValue.IDParent <= 0 ? (object) oldCatValue.IDParent : DBNull.Value)
                    };
                mDataStore.ExecuteCommand($"UPDATE CatCategory SET Ord=Ord-1 WHERE IDParent={mDataStore.PARAM_PREFIX}IDParent AND Ord>=@Ord", parametersUpdateOrd);
            }


            var codeMove = "";
            var isAfter = false;
            if (!string.IsNullOrWhiteSpace(moveBefore))
            {
                codeMove = moveBefore;
            }
            else if (!string.IsNullOrWhiteSpace(moveAfter))
            {
                codeMove = moveAfter;
                isAfter = true;
            }

            var moveTo = -1;
            if (!string.IsNullOrWhiteSpace(codeMove))
            {
                parameters = new STKeyValuePair[] {
                    new STKeyValuePair("CatCode", codeMove)
                    };
                var objPos = mDataStore.ExecuteScalar($"SELECT Ord FROM CatCategory WHERE CatCode={mDataStore.PARAM_PREFIX}CatCode", parameters);

                if (objPos == null || objPos == DBNull.Value)
                {
                    throw Utility.Utils.getCustomException("DCS_UPDATE_CATEGORYNOTFOUND",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + $" - Category Code to move {codeMove} not found ", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
                }

                moveTo = (int)objPos;
                if (isAfter)
                {
                    moveTo++;
                }
                var parametersUpdateOrd = new STKeyValuePair[] {
                    new STKeyValuePair("Ord", moveTo),
                    new STKeyValuePair("IDParent", newParentId <= 0 ? (object) newParentId : DBNull.Value)
                    };
                mDataStore.ExecuteCommand($"UPDATE CatCategory SET Ord=Ord+1 WHERE IDParent={mDataStore.PARAM_PREFIX}IDParent AND Ord>=@Ord", parametersUpdateOrd);
            }
            else
            { //Move in last position
                var parametersUpdateOrd = new STKeyValuePair[] {
                    new STKeyValuePair("IDParent", newParentId <= 0 ? (object) newParentId : DBNull.Value)
                    };
                var objPos = mDataStore.ExecuteScalar($"SELECT Max(Ord) FROM CatCategory WHERE IDParent={mDataStore.PARAM_PREFIX}IDParent", parameters);
                if (objPos != null && objPos != DBNull.Value)
                {
                    moveTo = (int)objPos;
                }
                else
                {
                    moveTo = 1;
                }
            }

            parameters = new STKeyValuePair[] {
                new STKeyValuePair("Ord", moveTo),
                    new STKeyValuePair("IDParent", newParentId <= 0 ? (object) newParentId : DBNull.Value),
                    new STKeyValuePair("IDCat", oldCatValue.IDCat)
                    };
            mDataStore.ExecuteCommand($"UPDATE CatCategory SET Ord={mDataStore.PARAM_PREFIX}Ord, IDParent={mDataStore.PARAM_PREFIX}IDParent WHERE IDCat={mDataStore.PARAM_PREFIX}IDCat", parameters);
        }

        private class CategoryMove
        {
            public int IDCat { get; set; }
            public string CatCode { get; set; }
            public int IDParent { get; set; }
            public int Ord { get; set; }
        }

        public void UpdateDCS(Category updateDataCategory)
        {
            var allDcs = getDCS();

            //Check if edit category exist
            var oldCatData = allDcs.FirstOrDefault(i => i.CatCode.Equals(updateDataCategory.CatCode, StringComparison.InvariantCultureIgnoreCase));
            if (allDcs == null)
            {
                throw Utility.Utils.getCustomException("DCS_UPDATE_CATEGORYNOTFOUND",
               @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + $" - Category Code {updateDataCategory.CatCode} not found ", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }

            //Search OldParentId
            var oldParentCat = allDcs.FirstOrDefault(cat => cat.CatCode.Equals(oldCatData.ParCode, StringComparison.InvariantCultureIgnoreCase));
            var oldParentId = -1;
            if (oldParentCat != null)
            {
                oldParentId = oldParentCat.IDCat;
            }

            var idCategoryUpd = oldCatData.IDCat;

            //Search parent category
            int newParentId = -1;
            if (!string.IsNullOrWhiteSpace(updateDataCategory.ParCode))
            {
                var parentCat = allDcs.FirstOrDefault(cat => cat.CatCode.Equals(updateDataCategory.ParCode, StringComparison.InvariantCultureIgnoreCase));

                if (parentCat == null)
                {
                    throw Utility.Utils.getCustomException("DCS_UPDATE_PARENTNOTFOUND",
               @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + $" - Parent Category Code {updateDataCategory.ParCode} not found ", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
                }
                newParentId = parentCat.IDCat;
            }

            try
            {
                mDataStore.BeginTransaction();

                var newOrdValue = -1;
                //If update change the ParentCode
                if (oldParentId != newParentId)
                {
                    var parametersUpdateOrd = new STKeyValuePair[] {
                    new STKeyValuePair("Ord", oldCatData.Ord),
                    new STKeyValuePair("IDParent", oldParentId <= 0 ? (object) oldParentId : DBNull.Value)
                    };
                    mDataStore.ExecuteCommand($"UPDATE CatCategory SET Ord=Ord-1 WHERE IDParent={mDataStore.PARAM_PREFIX}IDParent AND Ord>=@Ord", parametersUpdateOrd);

                    parametersUpdateOrd = new STKeyValuePair[] {
                    new STKeyValuePair("IDParent", newParentId <= 0 ? (object) newParentId : DBNull.Value)
                    };
                    var maxOrdObj = mDataStore.ExecuteScalar($"SELECT Max(Ord) FROM CatCategory WHERE IDParent={mDataStore.PARAM_PREFIX}IDParent", parametersUpdateOrd);
                    if (maxOrdObj != null && maxOrdObj != DBNull.Value)
                    {
                        newOrdValue = (int)maxOrdObj + 1;
                    }
                    else
                    {
                        newOrdValue = 1;
                    }
                }

                var parameters = new List<STKeyValuePair> {
                new STKeyValuePair("IDCat", idCategoryUpd),
                new STKeyValuePair("IDParent", newParentId <= 0 ? (object) newParentId : DBNull.Value)
                };

                var strUpdOrder = "";
                if (newOrdValue > 0)
                {
                    strUpdOrder = $", Ord={mDataStore.PARAM_PREFIX}Ord";
                    parameters.Add(new STKeyValuePair("Ord", newOrdValue));
                }

                mDataStore.ExecuteCommand($@"UPDATE CatCategory SET IDParent={mDataStore.PARAM_PREFIX}IDParent{strUpdOrder} WHERE IDCat={mDataStore.PARAM_PREFIX}IDCat", parameters.ToArray());

                var parametersDelete = new STKeyValuePair[] {
                    new STKeyValuePair("IDMember", idCategoryUpd)
                    };
                mDataStore.ExecuteCommand($@"DELETE FROM localised_CatCategory WHERE IDMember={mDataStore.PARAM_PREFIX}IDMember", parametersDelete);

                foreach (var item in updateDataCategory.labels)
                {
                    var parametersInsert = new STKeyValuePair[] {
                    new STKeyValuePair("IDMember", idCategoryUpd),
                    new STKeyValuePair("TwoLetterISO", item.Key),
                    new STKeyValuePair("Valore", item.Value)
                    };
                    mDataStore.ExecuteCommand($@"INSERT INTO localised_CatCategory(IDMember, TwoLetterISO, Valore)  VALUES ({mDataStore.PARAM_PREFIX}IDMember, {mDataStore.PARAM_PREFIX}TwoLetterISO, {mDataStore.PARAM_PREFIX}Valore", parametersInsert);
                }

                mDataStore.CommitTransaction();
            }
            catch (Exception ex)
            {
                mDataStore.RollbackTransaction();
                throw Utility.Utils.getCustomException("DCS_UPDATE_ERROR",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        public bool DeleteDCS(string catCode)
        {
            var allDcs = getDCS();

            var deleteCatCode = allDcs.Where(cat => cat.CatCode.Equals(catCode, StringComparison.InvariantCultureIgnoreCase)).FirstOrDefault();

            if (deleteCatCode == null)
            {
                throw Utility.Utils.getCustomException("DCS_CATEGORYNOTFOUND",
               @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + $" - Category Code {catCode} not found ", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }

            try
            {
                //Can't delete category with children
                foreach (var item in allDcs)
                {
                    if (item.ParCode.Equals(catCode))
                    {
                        throw Utility.Utils.getCustomException("DCS_DELETE_CATWITHCHILDREN",
               @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + $" - Category {catCode} has children ", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
                    }
                }

                //Can't delete category with cube assign
                var allCube = getAvailableCubes();
                foreach (var item in allCube)
                {
                    if (item.IDCat.HasValue && item.IDCat.Value == deleteCatCode.IDCat)
                    {
                        throw Utility.Utils.getCustomException("DCS_DELETE_CATWITHCUBES",
               @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + $" - Category {catCode} has assigned cubes ", Infrastructure.STLogging.Interface.LogLevelEnum.Error);
                    }
                }

                mDataStore.BeginTransaction();

                STKeyValuePair[] parameters = new STKeyValuePair[] { new STKeyValuePair("IDCat", deleteCatCode.IDCat) };
                mDataStore.ExecuteCommand($"DELETE FROM localised_CatCategory WHERE IDMember = {mDataStore.PARAM_PREFIX}IDCat", parameters);

                parameters = new STKeyValuePair[] { new STKeyValuePair("IDCat", deleteCatCode.IDCat) };
                mDataStore.ExecuteCommand($"DELETE FROM CatCategory WHERE IDCat = {mDataStore.PARAM_PREFIX}IDCat", parameters);

                mDataStore.CommitTransaction();

                return true;
            }
            catch (Exception ex)
            {
                mDataStore.RollbackTransaction();
                throw Utility.Utils.getCustomException("DCS_DELETE_ERROR",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        public bool importDCSFromMSDB(ICategorySchemeObject catSch, string orderAnnType)
        {
            DataTable tb = mDataStore.GetTable(@"SELECT * FROM CatCategory");

            //Category Scheme already imported
            if (tb.Rows.Count > 0)
            {
                throw Utility.Utils.getCustomException("DEF_CAT_SCHEME_ALREADY_EXISTS",
                    @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - Default category scheme already defined.", Infrastructure.STLogging.Interface.LogLevelEnum.Warn);
            }

            //empty Category Scheme
            if (catSch.Items == null || catSch.Items.Count == 0)
            {
                throw Utility.Utils.getCustomException("DEF_CAT_SCHEME_EMPTY",
                    @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + $" - Default category scheme cannot be empty.", Infrastructure.STLogging.Interface.LogLevelEnum.Warn);
            }

            mDataStore.BeginTransaction();

            try
            {
                foreach (ICategoryObject cat in catSch.Items)
                {
                    insertCategory(cat, null, orderAnnType, 1);
                }
                mDataStore.CommitTransaction();
                return true;
            }
            catch (Exception ex)
            {
                mDataStore.RollbackTransaction();
                throw Utility.Utils.getCustomException("DEF_CAT_SCHEME_IMPORT_ERROR",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        #region Metodi Privati

        #region Metodi Build Cubo in Memoria

        /// <summary>
        /// Returns a cube from a row of CatCube table
        /// </summary>
        /// <param name="dr">Row of CatCube table containing info about the cube to be created.</param>
        /// <returns></returns>
        private Cube getCubeFromRow(CatCubeRow dr)
        {
            int? catId = null;
            if (!dr.IsIDCatNull()) catId = dr.IDCat;

            //checking DSDCode field format
            if (dr.DSDCode != null)
                Utility.SdmxUtils.checkCodeFormat(dr.DSDCode);

            return new Cube(dr.IDCube, dr.Code, catId, dr.DSDCode, null, dr.HasEmbargoedData, dr.LastUpdated);
        }

        /// <summary>
        /// Returns a cube with dimensions, attributes and measures from a row of the CatCube table and CatAtt, CatDim e CatMeas tables
        /// </summary>
        /// <param name="dr">Row of CatCube table containing info about the cube to be created.</param>
        /// <param name="atts">CatAtt table</param>
        /// <param name="dims">CatDim table</param>
        /// <param name="meas">CatMeas table</param>
        /// <param name="attDim">Datatable connecting attributes to dimensions for attachment levels Series and Group</param>
        /// <returns></returns>
        private CubeWithDetails getCubeWithDetailsFromRow(CatCubeRow dr, CatAttDataTable atts, CatDimDataTable dims, CatMeasDataTable meas, DataTable attDim)
        {
            List<DDB.Entities.Attribute> listAtt = new List<DDB.Entities.Attribute>();
            List<Dimension> listDim = new List<Dimension>();
            List<Measure> listMeas = new List<Measure>();

            //generating lists of attributes, dimensions and measures
            if (atts != null)
                foreach (CatAttRow r in atts)
                {
                    IEnumerable<DataRow> tblFilt = attDim.AsEnumerable().Where(row => row["AttCode"].ToString() == r.Code);
                    listAtt.Add(getAttFromRow(r, tblFilt));
                }

            if (dims != null)
                foreach (CatDimRow r in dims)
                    listDim.Add(getDimFromRow(r));

            if (meas != null)
                foreach (CatMeasRow r in meas)
                    listMeas.Add(getMeasFromRow(r));

            //checking DSDCode field format
            if (dr.DSDCode != null)
                Utility.SdmxUtils.checkCodeFormat(dr.DSDCode);

            return new CubeWithDetails(dr.IDCube, dr.Code, (dr.IsIDCatNull() ? (int?)null : dr.IDCat), dr.DSDCode, listAtt, listDim, listMeas, null, dr.HasEmbargoedData, dr.LastUpdated);
        }

        /// <summary>
        /// Returns an attribute from a row of CatAtt table and a set of rows with their connected dimensions.
        /// </summary>
        /// <param name="dr">Row of CatCube table containing info about the attribute to be created.</param>
        /// <param name="attLevel">DataTable rows with pairs [Attribute code, Code of the dimension to whom the attribute belongs]</param>
        /// <returns></returns>
        private DDB.Entities.Attribute getAttFromRow(CatAttRow dr, IEnumerable<DataRow> attLevel)
        {
            //list of dimensions connected to the attribute
            List<string> attList = new List<string>();

            //getting the list of codes
            List<string> codes = new List<string>();
            if (mDataStore.ExistsTable(dr.MemberTable))
            {
                DataTable tb = mDataStore.GetTable($@"SELECT Code FROM {mBuilder.QuoteIdentifier(dr.MemberTable)} ORDER BY Ordering ASC");
                codes = tb.AsEnumerable()
                           .Select(r => r.Field<string>("Code"))
                           .ToList();
            }

            foreach (DataRow r in attLevel)
                attList.Add(r["DimCode"].ToString());

            //checking DSDCode field format
            if (dr.CodelistCode != null)
                Utility.SdmxUtils.checkCodeFormat(dr.CodelistCode);

            return new DDB.Entities.Attribute(dr.IDAtt, dr.Code, dr.CodelistCode, dr.MemberTable, dr.ColName, dr.IsMandatory, dr.IsTid,
                (AttachmentLevel)Enum.Parse(typeof(AttachmentLevel), dr.AttachmentLevel), attList, codes);
        }

        /// <summary>
        /// Returns a dimension from a row of CatDim table.
        /// </summary>
        /// <param name="dr">Row of CatDim table containing info about the dimension to be created.</param>
        /// <returns></returns>
        private Dimension getDimFromRow(CatDimRow dr)
        {
            //getting the list of codes
            List<string> codes = new List<string>();
            if (!dr.IsTimeSeriesDim && mDataStore.ExistsTable(dr.MemberTable))
            {
                DataTable tb = mDataStore.GetTable($@"SELECT Code FROM {mBuilder.QuoteIdentifier(dr.MemberTable)} ORDER BY Ordering ASC");
                codes = tb.AsEnumerable()
                           .Select(r => r.Field<string>("Code"))
                           .ToList();
            }

            //checking DSDCode field format
            if (dr.CodelistCode != null)
                Utility.SdmxUtils.checkCodeFormat(dr.CodelistCode);

            return new Dimension(dr.IDDim, dr.Code, dr.CodelistCode, dr.MemberTable, dr.ColName, dr.IsTimeSeriesDim, codes);
        }

        /// <summary>
        ///  Returns a measure from a row of CatMeas table.
        /// </summary>
        /// <param name="dr">Row of CatMeas table containing info about the measure to be created.</param>
        /// <returns></returns>
        private Measure getMeasFromRow(CatMeasRow dr)
        {
            return new Measure(dr.IDMeas, dr.Code, dr.ColName, dr.IsAlphanumeric);
        }

        #endregion Metodi Build Cubo in Memoria

        #region Metodi Build Cubo in DB

        /// <summary>
        /// Inserts a row in CatCube table.
        /// If the cube's code already exists or the associated category does not exist an exception is thrown.
        /// </summary>
        /// <param name="c">The cube to be created.</param>
        /// <returns>The id of the cube created.</returns>
        private int insertCatCubeRow(Cube c)
        {
            STKeyValuePair[] parameters = new STKeyValuePair[] { new STKeyValuePair("Code", c.Code), new STKeyValuePair("IDCat", c.IDCat) };

            DataTable tb1 = mDataStore.GetTable($@"SELECT IDCube FROM CatCube WHERE Code = @Code", parameters);
            if (tb1.Rows.Count != 0)
            {
                throw Utility.Utils.getCustomException("CUBE_DUPLICATED_CODE",
                    @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - Cube code already in use.", Infrastructure.STLogging.Interface.LogLevelEnum.Warn);
            }

            if (c.IDCat != null)
            {
                DataTable tb2 = mDataStore.GetTable(@"SELECT IDCat FROM CatCategory WHERE IDCat = @IDCat", parameters);
                if (tb2.Rows.Count != 1)
                {
                    throw Utility.Utils.getCustomException("CUBE_CATEGORY_NOT_DEFINED",
                    @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - Cube category undefined.", Infrastructure.STLogging.Interface.LogLevelEnum.Warn);
                }
            }

            try
            {
                //checking DSDCode field format
                if (c.DSDCode != null)
                    Utility.SdmxUtils.checkCodeFormat(c.DSDCode);

                string catStr = c.IDCat != null ? c.IDCat.ToString() : "NULL";

                STKeyValuePair[] insParams = new STKeyValuePair[] {
                    new STKeyValuePair("Code", c.Code.Replace("'", "''")),
                    new STKeyValuePair("IDCat", catStr),
                    new STKeyValuePair("DSDCode", c.DSDCode.Replace("'", "''"))
                };

                mDataStore.ExecuteCommand($@"INSERT INTO CatCube(Code, IDCat, DSDCode, LastUpdated, HasEmbargoedData) 
                                                VALUES (@Code, @IDCat, @DSDCode, {mDataStore.GetCurrentDateExpression()}, 0)", insParams);

                //getting the id of the cube to be returned
                DataTable tb3 = mDataStore.GetTable($@"SELECT IDCube FROM CatCube WHERE Code = @Code", insParams);

                return int.Parse(tb3.Rows[0]["IDCube"].ToString());
            }
            catch (Exception ex)
            {
                throw Utility.Utils.getCustomException("CUBE_CATCUBE_INSERT_ERROR",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        /// <summary>
        /// Inserts rows in localised_CatCube table.
        /// If constraints are violated an exception is thrown.
        /// </summary>
        /// <param name="c">The cube to be created.</param>
        private void insertLocalised_CatCubeRow(Cube c)
        {
            if (c.labels.Count == 0)
            {
                throw Utility.Utils.getCustomException("CUBE_NO_LABELS",
                    @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - Cube with no associated labels.", Infrastructure.STLogging.Interface.LogLevelEnum.Warn);
            }

            localised_CatCubeDataTable dt = new localised_CatCubeDataTable();

            try
            {

                foreach (string lang in c.labels.Keys)
                    dt.Rows.Add(c.IDCube, lang, c.labels[lang]);

                mDataStore.UpdateChanges(dt);
            }
            catch (Exception ex)
            {
                throw Utility.Utils.getCustomException("CUBE_LABELS_CREATION",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        /// <summary>
        /// Builds cube's dimensions creating associated tables in the DDB if they do not exist and inserting rows in CatDim table.
        /// </summary>
        /// <param name="c">The cube to be created.</param>
        private void insertCubeDimensions(CubeWithDetails c)
        {
            if (c.Dimensions == null || c.Dimensions.Count == 0)
            {
                throw Utility.Utils.getCustomException("CUBE_NO_DIM",
                    @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - Cube with no dimensions.", Infrastructure.STLogging.Interface.LogLevelEnum.Warn);
            }

            CatDimDataTable dimDt = new CatDimDataTable();

            try
            {
                foreach (Dimension d in c.Dimensions)
                {
                    STKeyValuePair[] parameters = new STKeyValuePair[] { new STKeyValuePair("Code", d.Code), new STKeyValuePair("IDCube", c.IDCube) };

                    DataTable tb1 = mDataStore.GetTable($@"SELECT IDCube FROM CatDim WHERE IDCube = @IDCube AND Code = @Code", parameters);
                    if (tb1.Rows.Count != 0)
                    {
                        throw Utility.Utils.getCustomException("CUBE_DIM_DUPLICATED_CODE",
                            @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - Cube code already used.", Infrastructure.STLogging.Interface.LogLevelEnum.Warn);
                    }

                    string tableName;

                    if (d.IsTimeSeriesDim)
                    {
                        tableName = "DimTIME_PERIOD";
                    }
                    else if (d.CodelistCode != null)
                    {
                        Utility.SdmxUtils.checkCodeFormat(d.CodelistCode);
                        tableName = "Dim" + Utility.SdmxUtils.getCodePartFromTriplet(d.CodelistCode, "Id").Replace("CL_", "") + "@" +
                                    Utility.SdmxUtils.getCodePartFromTriplet(d.CodelistCode, "Agency");
                    }
                    else
                    {
                        Utility.SdmxUtils.checkCodeFormat(c.DSDCode);
                        tableName = "DimNoCode@" + c.IDCube;
                    }

                    //creates the table for the dimension if it does not exist yet
                    if (!mDataStore.ExistsTable(tableName))
                    {
                        createAttDimTable(tableName, d.CodelistCode != null);
                    }

                    //inserts new codes in the dimension table
                    if (d.codes != null)
                        insertCodes(tableName, d.codes);

                    //inserts the row in the DataTable
                    dimDt.Rows.Add(null, c.IDCube, d.Code, d.CodelistCode, tableName, "ID_" + d.Code, d.IsTimeSeriesDim, mDataStore.GetDateTextRepresentation(DateTime.Now));
                }
                mDataStore.UpdateChanges(dimDt);
            }
            catch (Exception ex)
            {
                throw Utility.Utils.getCustomException("CUBE_DIM_CREATE",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        /// <summary>
        /// Creates cubes' measures inserting correspondent rows in CatMeas table
        /// </summary>
        /// <param name="c">The cube to be created</param>
        private void insertCubeMeasures(CubeWithDetails c)
        {
            if (c.Measures == null || c.Measures.Count == 0)
            {
                throw Utility.Utils.getCustomException("CUBE_NO_MEAS",
                    @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - Cube with no measures.", Infrastructure.STLogging.Interface.LogLevelEnum.Warn);
            }

            CatMeasDataTable measDt = new CatMeasDataTable();

            try
            {
                foreach (Measure m in c.Measures)
                {
                    STKeyValuePair[] parameters = new STKeyValuePair[] { new STKeyValuePair("Code", m.Code), new STKeyValuePair("IDCube", c.IDCube) };

                    DataTable tb1 = mDataStore.GetTable($@"SELECT IDCube FROM CatMeas WHERE IDCube = @IDCube AND Code = @Code", parameters);
                    if (tb1.Rows.Count != 0)
                    {
                        throw Utility.Utils.getCustomException("CUBE_MEAS_DUPLICATED_CODE",
                            @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - Measure with duplicated code found.", Infrastructure.STLogging.Interface.LogLevelEnum.Warn);
                    }

                    //inserting the row for the measure in the correspondent DataTable
                    measDt.Rows.Add(null, c.IDCube, m.Code, m.Code, m.IsAlphanumeric, mDataStore.GetDateTextRepresentation(DateTime.Now));
                }
                mDataStore.UpdateChanges(measDt);
            }
            catch (Exception ex)
            {
                throw Utility.Utils.getCustomException("CUBE_MEAS_CREATE",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        /// <summary>
        /// Creates a table for a dimension or an attribute
        /// </summary>
        /// <param name="tableName">The name of the table</param>
        /// <param name="isCoded">Whether the dimension or the attribute has an associated codelist or not</param>
        private void createAttDimTable(string tableName, bool isCoded)
        {
            DataTable dt;
            if (isCoded)
            {
                dt = new AttDimStructDataTable();
            }
            else
            {
                dt = new AttDimStructNotCodedDataTable();
            }

            string q = mDataStore.GetTableScript(dt, mBuilder.QuoteIdentifier(tableName), true);
            mDataStore.ExecuteCommand(q);
            mDataStore.ExecuteCommand($@"ALTER TABLE {mBuilder.QuoteIdentifier(tableName)} ADD CONSTRAINT [UQ_{tableName}_Code] UNIQUE(Code);");
            mDataStore.ExecuteCommand($@"create index IDX_CODE on {mBuilder.QuoteIdentifier(tableName)} (Code);");
        }

        /// <summary>
        /// Builds cube's attributes creating associated tables in the DDB if they do not exist and inserting rows in CatAtt table.
        /// </summary>
        /// <param name="c">Cubo che si sta creando</param>
        private void insertCubeAttributes(CubeWithDetails c)
        {
            //cube with no attribute
            if (c.Attributes.Count == 0)
                return;

            try
            {
                //adds rows to CatAtt table
                CatAttDataTable attDt = new CatAttDataTable();

                foreach (DDB.Entities.Attribute a in c.Attributes)
                {
                    STKeyValuePair[] parameters = new STKeyValuePair[] { new STKeyValuePair("Code", a.Code), new STKeyValuePair("IDCube", c.IDCube) };

                    DataTable tb1 = mDataStore.GetTable($@"SELECT IDCube FROM CatAtt WHERE IDCube = @IDCube AND Code = @Code", parameters);
                    if (tb1.Rows.Count != 0)
                    {
                        throw Utility.Utils.getCustomException("CUBE_ATT_DUPLICATED_CODE",
                            @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - Attribute with duplicated code found.", Infrastructure.STLogging.Interface.LogLevelEnum.Warn);
                    }

                    //Tid attribute case: you need to set Code and IsTid fields, the others are automatically deducted
                    if (a.IsTid)
                    {
                        //inserting the row for the attribute in the corrispondent DataTable
                        attDt.Rows.Add(null, c.IDCube, a.Code, null, "AttTEXT_FREE@SDMX", "ID_" + a.Code, true, true,
                            AttachmentLevel.Dataset, mDataStore.GetDateTextRepresentation(DateTime.Now));
                    }
                    else
                    {
                        string tableName;

                        //checking CodelistCode field format
                        if (a.CodelistCode != null)
                        {
                            Utility.SdmxUtils.checkCodeFormat(a.CodelistCode);
                            tableName = "Att" + Utility.SdmxUtils.getCodePartFromTriplet(a.CodelistCode, "Id").Replace("CL_", "") + "@" +
                                        Utility.SdmxUtils.getCodePartFromTriplet(a.CodelistCode, "Agency");
                        }
                        else
                        {
                            Utility.SdmxUtils.checkCodeFormat(c.DSDCode);
                            tableName = "AttNoCode@" + c.IDCube;
                        }

                        //creates the table for the attribute if it does not exist yet
                        if (!mDataStore.ExistsTable(tableName))
                        {
                            createAttDimTable(tableName, a.CodelistCode != null);
                        }

                        ////inserts new codes in the attribute table
                        if (a.codes != null)
                            insertCodes(tableName, a.codes);

                        //inserts the row for the attribute in the corrispondent DataTable
                        attDt.Rows.Add(null, c.IDCube, a.Code, a.CodelistCode, tableName, "ID_" + a.Code, a.IsMandatory, a.IsTid,
                            a.AttachmentLevel, mDataStore.GetDateTextRepresentation(DateTime.Now));
                    }
                }
                mDataStore.UpdateChanges(attDt);

                //inserts CatAttDim rows (they reference rows in CatAtt)
                CatAttDimDataTable attDimDt = new CatAttDimDataTable();

                foreach (DDB.Entities.Attribute a in c.Attributes)
                {
                    if (a.refDim != null && a.refDim.Count > 0 && !a.IsTid)
                    {
                        STKeyValuePair[] attParams = new STKeyValuePair[] { new STKeyValuePair("Code", a.Code), new STKeyValuePair("IDCube", c.IDCube) };

                        DataTable tb2 = mDataStore.GetTable($@"SELECT IDAtt FROM CatAtt WHERE Code = @Code AND IDCube = @IDCube", attParams);
                        int attId = int.Parse(tb2.Rows[0]["IDAtt"].ToString());

                        foreach (string dim in a.refDim)
                        {
                            STKeyValuePair[] dimParams = new STKeyValuePair[] { new STKeyValuePair("Code", dim), new STKeyValuePair("IDCube", c.IDCube) };

                            DataTable tb3 = mDataStore.GetTable($@"SELECT IDDim FROM CatDim WHERE Code = @Code AND IDCube = @IDCube", dimParams);
                            int dimId = int.Parse(tb3.Rows[0]["IDDim"].ToString());
                            attDimDt.Rows.Add(attId, dimId);
                        }
                    }
                }
                mDataStore.UpdateChanges(attDimDt);
            }
            catch (Exception ex)
            {
                throw Utility.Utils.getCustomException("CUBE_ATT_CREATE",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        /// <summary>
        /// Inserts a list of distinct codes in an Att<> or Dim<> coded table
        /// </summary>
        /// <param name="tableName">Name of the table</param>
        /// <param name="codes">Codes to be inserted.</param>
        private void insertCodes(string tableName, List<string> codes)
        {
            bool inserted = false;

            DataTable dt = mDataStore.GetTable($@"SELECT * FROM {mBuilder.QuoteIdentifier(tableName)}");

            AttDimStructDataTable tbCube = new AttDimStructDataTable();
            tbCube.Merge(dt, true, MissingSchemaAction.Ignore);

            for (int i = 0; i < codes.Count; i++)
                if (tbCube.AsEnumerable().Where(r => r.Code.ToLower() == codes[i].ToLower()).Count() == 0)
                {
                    tbCube.Rows.Add(null, codes[i], tbCube.Rows.Count + 1, mDataStore.GetDateTextRepresentation(DateTime.Now));
                    inserted = true;
                }

            if (inserted)
            {
                tbCube.TableName = tableName;
                mDataStore.UpdateChanges(tbCube);
            }
        }

        /// <summary>
        /// Creates FactS table for the cube
        /// </summary>
        /// <param name="CubeId">Cube id</param>
        private void createFactTable(int CubeId)
        {
            STKeyValuePair[] parameters = new STKeyValuePair[] { new STKeyValuePair("IDCube", CubeId) };

            try
            {
                DataTable tb1 = mDataStore.GetTable($@"SELECT ColName FROM CatDim WHERE IsTimeSeriesDim = 1 AND IDCube = @IDCube", parameters);

                DataTable tb2 = mDataStore.GetTable($@"SELECT ColName FROM CatAtt WHERE AttachmentLevel = 'Observation' AND IDCube = @IDCube", parameters);
                DataTable tb3 = mDataStore.GetTable($@"SELECT ColName, IsAlphanumeric FROM CatMeas WHERE IDCube = @IDCube", parameters);
                if (tb3.Rows.Count == 0)
                {
                    throw Utility.Utils.getCustomException("CUBE_NO_MEAS",
                        @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - Cube cannot have no measures.", Infrastructure.STLogging.Interface.LogLevelEnum.Warn);
                }

                DataTable factDt = new DataTable();
                String timeDimColName = tb1.Rows.Count == 0 ? null : tb1.Rows[0]["ColName"].ToString();

                factDt.Columns.Add("SID", typeof(int));
                //time dimension column
                if (timeDimColName != null)
                    factDt.Columns.Add(timeDimColName, typeof(int));

                //columns for attributes with Attachment Level 'Observation'
                if (tb2.Rows.Count > 0)
                {
                    foreach (DataRow dr in tb2.Rows)
                        factDt.Columns.Add(dr["ColName"].ToString(), typeof(int));
                }

                //columns for measures
                foreach (DataRow dr in tb3.Rows)
                    factDt.Columns.Add(dr["ColName"].ToString(), bool.Parse(dr["IsAlphanumeric"].ToString()) ? typeof(string) : typeof(double));

                //columns for Insert Date
                factDt.Columns.Add("InsertDate", typeof(DateTime));

                if (timeDimColName != null)
                    factDt.PrimaryKey = new DataColumn[] { factDt.Columns["SID"], factDt.Columns[timeDimColName] };
                else
                    factDt.PrimaryKey = new DataColumn[] { factDt.Columns["SID"] };

                string q = mDataStore.GetTableScript(factDt, "FactS" + CubeId, true);
                mDataStore.ExecuteCommand(q);

                //adds foreign key constraint on SID field         
                mDataStore.ExecuteCommand($@"ALTER TABLE {"FactS" + CubeId} ADD CONSTRAINT {"FiltS" + CubeId + "_FactS" + CubeId + "_FK1"}
                                         FOREIGN KEY (SID)
                                         REFERENCES {"FiltS" + CubeId} (SID);");
            }
            catch (Exception ex)
            {
                throw Utility.Utils.getCustomException("CUBE_FACT_TABLE_CREAT",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        /// <summary>
        /// Creates FiltS table for the cube
        /// </summary>
        /// <param name="CubeId">Id of the cube</param>
        private void createFiltTable(int CubeId)
        {
            STKeyValuePair[] parameters = new STKeyValuePair[] { new STKeyValuePair("IDCube", CubeId) };

            try
            {
                DataTable tb1 = mDataStore.GetTable($@"SELECT ColName FROM CatDim WHERE IsTimeSeriesDim != 1 AND IDCube = @IDCube", parameters);
                DataTable tb2 = mDataStore.GetTable($@"SELECT ColName, IsTid FROM CatAtt WHERE AttachmentLevel != 'Observation' AND IDCube = @IDCube AND (AttachmentLevel != 'Dataset' OR IsTid = 1)", parameters);

                DataTable filtDt = new DataTable();
                DataColumn dc;

                //creates SID column as Identity
                dc = filtDt.Columns.Add("SID", typeof(int));
                dc.AllowDBNull = false;
                dc.AutoIncrement = true;

                List<DataColumn> keyCol = new List<DataColumn>();

                //columns for dimensions
                foreach (DataRow dr in tb1.Rows)
                {
                    keyCol.Add(new DataColumn(dr["ColName"].ToString(), typeof(int)));
                }

                filtDt.Columns.AddRange(keyCol.ToArray());

                //columns for attributes with Attachment Level different from Observation
                if (tb2.Rows.Count > 0)
                {
                    foreach (DataRow dr in tb2.Rows)
                    {
                        DataColumn dCol = new DataColumn(dr["ColName"].ToString(), typeof(int));

                        //adding Tid column to the key
                        if (bool.Parse(dr["IsTid"].ToString()))
                            keyCol.Add(dCol);

                        filtDt.Columns.Add(dCol);
                    }
                }

                //sets the primary key if you have at least one dimension or Tid column
                if (keyCol.Count > 0)
                    filtDt.PrimaryKey = keyCol.ToArray();

                //creates the primary key only if I have less then 16 columns in the key
                string q = mDataStore.GetTableScript(filtDt, "FiltS" + CubeId, keyCol.Count <= 16);
                mDataStore.ExecuteCommand(q);

                //case with more than 16 columns in the key
                if (keyCol.Count > 16)
                {
                    //adds a computed columns with the hash of the concatenation of the string cast of the columns in the key (with a separator)
                    string cmd = $@"ALTER TABLE {"FiltS" + CubeId} ADD CALC_COL {mDataStore.GetPersistedHashColumnExpression(keyCol.Select(x => x.ColumnName).ToList())} NOT NULL";
                    mDataStore.ExecuteCommand(cmd);
                    //set computed columns as primary key
                    mDataStore.ExecuteCommand($@"ALTER TABLE {"FiltS" + CubeId} ADD CONSTRAINT {"PK_" + ("FiltS" + CubeId).GetHashCode().ToString("X8")} PRIMARY KEY(CALC_COL);");

                    //adds indexes on dim columns
                    foreach (DataColumn d in keyCol)
                        mDataStore.ExecuteCommand($"CREATE NONCLUSTERED INDEX {mBuilder.QuoteIdentifier("IDX_" + d)} ON {"FiltS" + CubeId} ({mBuilder.QuoteIdentifier(d.ColumnName)});");
                }

                //adds unique constraint on SID
                mDataStore.ExecuteCommand($@"ALTER TABLE {"FiltS" + CubeId} ADD CONSTRAINT UQ_{"FiltS" + CubeId}_Code UNIQUE(SID);");
            }
            catch (Exception ex)
            {
                throw Utility.Utils.getCustomException("CUBE_FILT_TABLE_CREATE",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        /// <summary>
        /// Creates AttDsLev table for the cube
        /// </summary>
        /// <param name="CubeId">Id of the cube</param>
        /// <param name="Tid">Tid value</param>
        private void createAttDsLevTable(int CubeId)
        {
            STKeyValuePair[] parameters = new STKeyValuePair[] { new STKeyValuePair("IDCube", CubeId) };

            try
            {
                DataTable tb = mDataStore.GetTable($@"SELECT ColName FROM CatAtt WHERE AttachmentLevel = 'Dataset' AND IsTid = 0 AND IDCube = @IDCube", parameters);

                DataTable attDt = new DataTable();
                DataColumn dc;

                //creates IDMember column as Identity
                dc = attDt.Columns.Add("IDMember", typeof(int));
                dc.AllowDBNull = false;
                dc.AutoIncrement = true;

                //creates ID_TID column
                dc = attDt.Columns.Add("ID_TID", typeof(int));
                dc.AllowDBNull = true;

                List<DataColumn> cols = new List<DataColumn>();

                //columns for dimensions
                foreach (DataRow dr in tb.Rows)
                {
                    cols.Add(new DataColumn(dr["ColName"].ToString(), typeof(int)));
                }

                attDt.Columns.AddRange(cols.ToArray());

                //sets the primary key
                attDt.PrimaryKey = new DataColumn[] { attDt.Columns["IDMember"] };

                //creates the table
                string q = mDataStore.GetTableScript(attDt, "AttDsLev" + CubeId, true);
                mDataStore.ExecuteCommand(q);

                //adds unique constraint on TID
                mDataStore.ExecuteCommand($@"ALTER TABLE {"AttDsLev" + CubeId} ADD CONSTRAINT UQ_{"AttDsLev" + CubeId}_Tid UNIQUE(ID_TID);");
            }
            catch (Exception ex)
            {
                throw Utility.Utils.getCustomException("CUBE_ATTDSLEV_TABLE_CREATE",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        /// <summary>
        /// Verifies the cube has no components with the same codes
        /// </summary>
        /// <param name="cube">The cube to be checked</param>
        private void checkDuplicateComponents(CubeWithDetails cube)
        {
            try
            {
                List<string> comps = cube.Attributes.Select(a => a.Code).ToList();
                comps.AddRange(cube.Dimensions.Select(d => d.Code).ToList());
                comps.AddRange(cube.Measures.Select(m => m.Code).ToList());

                List<string> uniqueComps = new List<string>();

                foreach (string s in comps)
                {
                    if (uniqueComps.Contains(s))
                        throw new Exception();
                    uniqueComps.Add(s);
                }
            }
            catch (Exception ex)
            {
                throw Utility.Utils.getCustomException("CUBE_DUPL_COMP_CODES",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }


        #endregion Metodi Build Cubo in DB

        #region Creazione viste sul cubo

        /// <summary>
        /// Creates views for the dataset.
        /// </summary>
        /// <param name="CubeId">id of the cube for whom to create the views</param>
        private void createDatasetViews(int CubeId)
        {
            STKeyValuePair[] parameters = new STKeyValuePair[] { new STKeyValuePair("IDCube", CubeId) };

            DataTable tbDim = mDataStore.GetTable($@"SELECT * FROM CatDim WHERE IDCube = @IDCube ORDER BY IDDim ASC, IsTimeSeriesDim ASC", parameters);
            DataTable tbAtt = mDataStore.GetTable($@"SELECT * FROM CatAtt WHERE IDCube = @IDCube ORDER BY IDAtt ASC", parameters);
            DataTable tbMeas = mDataStore.GetTable($@"SELECT * FROM CatMeas WHERE IDCube = @IDCube ORDER BY IDMeas ASC", parameters);

            //creates the Dataset_<n>_ViewCurrentData view
            createViewData(CubeId, tbDim, tbAtt, tbMeas);

            //creates the Dataset_<n>_ViewAllSeries view
            createViewAllSeries(CubeId, tbDim, tbAtt);

            //creates the VIEW_DataFact<n> view
            createViewDataFact(CubeId, tbDim, tbAtt, tbMeas);
        }

        /// <summary>
        /// Creates Dataset_<n>_ViewCurrentData view
        /// </summary>
        /// <param name="CubeId">id of the cube for whom to create the view</param>
        /// <param name="tbDim">CatDim DataTable with the dimensions of the cube</param>
        /// <param name="tbAtt">CatAtt DataTable with the attributes of the cube</param>
        /// <param name="tbMeas">CatMeas DataTable with the measures of the cube</param>
        private void createViewData(int CubeId, DataTable tbDim, DataTable tbAtt, DataTable tbMeas)
        {
            try
            {
                string query = getViewDataQuery(CubeId, tbDim, tbAtt, tbMeas);
                string cmd = $"CREATE VIEW Dataset_{CubeId}_ViewCurrentData AS " + Environment.NewLine + query;

                //creates the Dataset_<n>_ViewCurrentData view
                mDataStore.ExecuteCommand(cmd);
            }
            catch (Exception ex)
            {
                throw Utility.Utils.getCustomException("CUBE_VIEW_DATA_CREATE",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        /// <summary>
        /// Creates Dataset_<n>_ViewAllSeries view
        /// </summary>
        /// <param name="CubeId">id of the cube for whom to create the view</param>
        /// <param name="tbDim">CatDim DataTable with the dimensions of the cube</param>
        /// <param name="tbAtt">CatAtt DataTable with the attributes of the cube</param>
        private void createViewAllSeries(int CubeId, DataTable tbDim, DataTable tbAtt)
        {
            try
            {
                string dimSelect = "", attSelect = "", dimJoin = "", attJoin = "";

                //whether the cube has at least one attribute with attachment level Dataset
                bool hasDsLevAttr = tbAtt.AsEnumerable().Where(x => x["AttachmentLevel"].ToString() == "Dataset" && !bool.Parse(x["IsTid"].ToString())).ToArray().Length > 0;
                //whether the cube has a Tid
                bool hasTid = tbAtt.AsEnumerable().Where(x => bool.Parse(x["IsTid"].ToString())).ToArray().Length > 0;

                //builds Select and Join clauses for the dimensions
                for (int i = 0; i < tbDim.Rows.Count; i++)
                {
                    bool isTime = bool.Parse(tbDim.Rows[i]["IsTimeSeriesDim"].ToString());
                    if (!isTime)
                    {
                        string field = DBNull.Value.Equals(tbDim.Rows[i]["CodelistCode"]) ? "Text" : "Code";
                        dimSelect += Environment.NewLine + $", d{i}.[{field}] as " + tbDim.Rows[i]["ColName"].ToString();
                        dimJoin += Environment.NewLine + $@"INNER JOIN [{tbDim.Rows[i]["MemberTable"].ToString()}] as d{i} ON F.[{tbDim.Rows[i]["ColName"].ToString()}] = d{i}.IDMember";
                    }
                }

                //builds Select and Join clauses for the attributes
                if (tbAtt.Rows.Count > 0)
                    for (int i = 0; i < tbAtt.Rows.Count; i++)
                    {
                        bool isTid = bool.Parse(tbAtt.Rows[i]["IsTid"].ToString());

                        if (tbAtt.Rows[i]["AttachmentLevel"].ToString() != "Observation")
                        {
                            string field = DBNull.Value.Equals(tbAtt.Rows[i]["CodelistCode"]) && !isTid ? "Text" : "Code";
                            attSelect += Environment.NewLine + $", a{i}.[{field}] as " + tbAtt.Rows[i]["ColName"].ToString();

                            string table = tbAtt.Rows[i]["AttachmentLevel"].ToString() == "Dataset" && !isTid ? "ATT" : "F";
                            attJoin += Environment.NewLine + $@"LEFT JOIN [{tbAtt.Rows[i]["MemberTable"].ToString()}] as a{i} ON {table}.[{tbAtt.Rows[i]["ColName"].ToString()}] = a{i}.IDMember";
                        }
                    }

                string attTab = hasDsLevAttr ? (hasTid ? Environment.NewLine + $"LEFT JOIN AttDsLev{CubeId} AS ATT on F.[ID_TID] = ATT.[ID_TID]" : Environment.NewLine + $"LEFT JOIN AttDsLev{CubeId} AS ATT on 1 = 1") : "";

                string cmd =
                      $"CREATE VIEW Dataset_{CubeId}_ViewAllSeries AS " + Environment.NewLine +
                      $"SELECT F.SID {dimSelect}{attSelect}" + Environment.NewLine +
                      $"FROM FiltS{CubeId} AS F {attTab}{dimJoin}{attJoin}";

                //creates Dataset_<n>_ViewAllSeries view
                mDataStore.ExecuteCommand(cmd);
            }
            catch (Exception ex)
            {
                throw Utility.Utils.getCustomException("CUBE_VIEW_ALL_SERIES_CREATE",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        /// <summary>
        /// Creates VIEW_DataFactS<n> view
        /// </summary>
        /// <param name="CubeId">id of the cube for whom to create the view</param>
        /// <param name="tbDim">CatDim DataTable with the dimensions of the cube</param>
        /// <param name="tbAtt">CatAtt DataTable with the attributes of the cube</param>
        /// <param name="tbMeas">CatMeas DataTable with the measures of the cube</param>
        private void createViewDataFact(int CubeId, DataTable tbDim, DataTable tbAtt, DataTable tbMeas)
        {
            try
            {
                string dimSelect = "", attSelect = "", measSelect = "", attJoin = "";

                //whether the cube has at least one attribute with attachment level Dataset
                bool hasDsLevAttr = tbAtt.AsEnumerable().Where(x => x["AttachmentLevel"].ToString() == "Dataset" && !bool.Parse(x["IsTid"].ToString())).ToArray().Length > 0;
                //whether the cube has a Tid
                bool hasTid = tbAtt.AsEnumerable().Where(x => bool.Parse(x["IsTid"].ToString())).ToArray().Length > 0;

                //builds Select clause for the dimensions
                for (int i = 0; i < tbDim.Rows.Count; i++)
                {
                    string table = bool.Parse(tbDim.Rows[i]["IsTimeSeriesDim"].ToString()) ? "FA" : "F";
                    dimSelect += Environment.NewLine + $", {table}.{tbDim.Rows[i]["ColName"].ToString()} as " + tbDim.Rows[i]["ColName"].ToString();
                }

                //builds Select and Join clauses for the attributes
                if (tbAtt.Rows.Count > 0)
                    for (int i = 0; i < tbAtt.Rows.Count; i++)
                    {
                        bool isTid = bool.Parse(tbAtt.Rows[i]["IsTid"].ToString());

                        string field = DBNull.Value.Equals(tbAtt.Rows[i]["CodelistCode"]) && !isTid ? "Text" : "Code";
                        attSelect += Environment.NewLine + $", a{i}.[{field}] as " + tbAtt.Rows[i]["ColName"].ToString();
                        string table = tbAtt.Rows[i]["AttachmentLevel"].ToString() == "Observation" ? "FA" : "F";
                        //custom table for Dataset level attributes different from Tid
                        if (tbAtt.Rows[i]["AttachmentLevel"].ToString() == "Dataset" && !isTid)
                            table = "ATT";
                        attJoin += Environment.NewLine + $@"LEFT JOIN [{tbAtt.Rows[i]["MemberTable"].ToString()}] as a{i} ON {table}.[{tbAtt.Rows[i]["ColName"].ToString()}] = a{i}.IDMember";
                    }

                //builds Select clause for the measures
                for (int i = 0; i < tbMeas.Rows.Count; i++)
                {
                    measSelect += Environment.NewLine + $", FA.[{tbMeas.Rows[i]["ColName"].ToString() }] as " + tbMeas.Rows[i]["ColName"].ToString();
                }

                string attTab = hasDsLevAttr ? (hasTid ? Environment.NewLine + $"LEFT JOIN AttDsLev{CubeId} AS ATT on F.[ID_TID] = ATT.[ID_TID]" : Environment.NewLine + $"LEFT JOIN AttDsLev{CubeId} AS ATT on 1 = 1") : "";

                string cmd =
                      $"CREATE VIEW [VIEW_DataFactS{CubeId}] AS " + Environment.NewLine +
                      $"SELECT F.SID {dimSelect}{attSelect}{measSelect}" + Environment.NewLine +
                      $"FROM FiltS{CubeId} AS F {attTab}" + Environment.NewLine +
                      $"INNER JOIN FactS{CubeId} AS FA ON F.SID = FA.SID {attJoin}";

                //creates VIEW_DataFactS<n> view
                mDataStore.ExecuteCommand(cmd);
            }
            catch (Exception ex)
            {
                throw Utility.Utils.getCustomException("CUBE_VIEW_DATAFACT_CREATE",
                   @"Metodo " + System.Reflection.MethodBase.GetCurrentMethod().Name + " - " + ex.Message, Infrastructure.STLogging.Interface.LogLevelEnum.Error);
            }
        }

        /// <summary>
        /// Generates the query for creating the Dataset_<n>_ViewCurrentData view
        /// </summary>
        /// <param name="CubeId">id of the cube for whom to create the view</param>
        /// <param name="tbDim">CatDim DataTable with the dimensions of the cube</param>
        /// <param name="tbAtt">CatAtt DataTable with the attributes of the cube</param>
        /// <param name="tbMeas">CatMeas DataTable with the measures of the cube</param>
        /// <returns></returns>
        private string getViewDataQuery(int CubeId, DataTable tbDim, DataTable tbAtt, DataTable tbMeas)
        {
            string dimSelect = "", attSelect = "", measSelect = "", dimJoin = "", attJoin = "";

            //whether the cube has at least one attribute with attachment level Dataset
            bool hasDsLevAttr = tbAtt.AsEnumerable().Where(x => x["AttachmentLevel"].ToString() == "Dataset" && !bool.Parse(x["IsTid"].ToString())).ToArray().Length > 0;
            //whether the cube has a Tid
            bool hasTid = tbAtt.AsEnumerable().Where(x => bool.Parse(x["IsTid"].ToString())).ToArray().Length > 0;

            //builds Select and Join clauses for the dimensions
            for (int i = 0; i < tbDim.Rows.Count; i++)
            {
                bool isTime = bool.Parse(tbDim.Rows[i]["IsTimeSeriesDim"].ToString());
                string table = isTime ? "FA" : "F";
                string field = DBNull.Value.Equals(tbDim.Rows[i]["CodelistCode"]) && !isTime ? "Text" : "Code";
                dimSelect += Environment.NewLine + $", d{i}.[{field}] as " + tbDim.Rows[i]["ColName"].ToString();
                dimJoin += Environment.NewLine + $@"INNER JOIN [{tbDim.Rows[i]["MemberTable"].ToString()}] as d{i} ON {table}.[{tbDim.Rows[i]["ColName"].ToString()}] = d{i}.IDMember";
            }

            //builds Select and Join clauses for the attributes
            if (tbAtt.Rows.Count > 0)
                for (int i = 0; i < tbAtt.Rows.Count; i++)
                {
                    bool isTid = bool.Parse(tbAtt.Rows[i]["IsTid"].ToString());

                    string field = DBNull.Value.Equals(tbAtt.Rows[i]["CodelistCode"]) && !isTid ? "Text" : "Code";
                    attSelect += Environment.NewLine + $", a{i}.[{field}] as " + tbAtt.Rows[i]["ColName"].ToString();
                    string table = tbAtt.Rows[i]["AttachmentLevel"].ToString() == "Observation" ? "FA" : "F";
                    //custom table for Dataset level attributes different from Tid
                    if (tbAtt.Rows[i]["AttachmentLevel"].ToString() == "Dataset" && !isTid)
                        table = "ATT";
                    attJoin += Environment.NewLine + $@"LEFT JOIN [{tbAtt.Rows[i]["MemberTable"].ToString()}] as a{i} ON {table}.[{tbAtt.Rows[i]["ColName"].ToString()}] = a{i}.IDMember";
                }

            //builds Select clause for the measures
            for (int i = 0; i < tbMeas.Rows.Count; i++)
            {
                measSelect += Environment.NewLine + $", FA.[{tbMeas.Rows[i]["ColName"].ToString() }] as " + tbMeas.Rows[i]["ColName"].ToString();
            }

            string attTab = hasDsLevAttr ? (hasTid ? Environment.NewLine + $"LEFT JOIN AttDsLev{CubeId} AS ATT on F.[ID_TID] = ATT.[ID_TID]" : Environment.NewLine + $"LEFT JOIN AttDsLev{CubeId} AS ATT on 1 = 1") : "";

            string cmd =
                  $@"SELECT F.SID {dimSelect}{attSelect}{measSelect}" + Environment.NewLine +
                  $"FROM FiltS{CubeId} AS F" + Environment.NewLine +
                  $"INNER JOIN FactS{CubeId} AS FA ON F.SID = FA.SID {attTab}{dimJoin}{attJoin}";

            return cmd;
        }

        #endregion Creazione viste sul cubo

        #region Metodi Category Scheme di lavoro

        /// <summary>
        /// Recursively retrievs a category from a row of the CatCategory table and CatCategory and localised_CatCategory tables.
        /// Incrementally stores the result in the reference parameter cats.
        /// </summary>
        /// <param name="dr">row of CatCategory table with the category to be created</param>
        /// <param name="tbCat">CatCategory table</param>
        /// <param name="tbLoc">localised_CatCategory table</param>
        /// <param name="cats">reference parameter with the list of retrieved categories</param>
        private void getCategory(CatCategoryRow dr, CatCategoryDataTable tbCat, localised_CatCategoryDataTable tbLoc, ref List<Category> cats)
        {
            //gets parent category (if exists)
            string parCode = null;
            if (!dr.IsIDParentNull())
            {
                parCode = tbCat.Where(row => row.IDCat == dr.IDParent).Single().CatCode;
            }

            //gets labels associated to the category
            Dictionary<string, string> labels = new Dictionary<string, string>();
            foreach (localised_CatCategoryRow row in tbLoc.Where(row => row.IDMember == dr.IDCat))
                labels.Add(row.TwoLetterISO, row.Valore);

            //adds the category to the list
            cats.Add(new Category(dr.IDCat, dr.CatCode, parCode, dr.Ord, labels));

            //recursively calls the function for all the (ordered) children category
            foreach (CatCategoryRow row in tbCat.Where(row => !row.IsIDParentNull() && row.IDParent == dr.IDCat).OrderBy(u => u.Ord))
                getCategory(row, tbCat, tbLoc, ref cats);
        }

        /// <summary>
        /// Recursive method for inserting a category with its associated labels in CatCategory and localised_CatCategory tables.
        /// </summary>
        /// <param name="cat">The category to be inserted.</param>
        /// <param name="parId">Parent category id.</param>
        /// <param name="annType">The annotation type for handling the order of the items.</param>
        private void insertCategory(ICategoryObject cat, int? parId, string annType, int order)
        {
            //retrieving the category order from the annotation

            STKeyValuePair[] parameters = new STKeyValuePair[] {
                new STKeyValuePair("CatCode", cat.Id.Replace("'", "''")),
                new STKeyValuePair("IDParent", (object) parId ?? DBNull.Value),
                new STKeyValuePair("Ord", order++)
            };

            //category already present
            DataTable tb = mDataStore.GetTable($@"SELECT IDCat FROM CatCategory WHERE CatCode = @CatCode", parameters);
            if (tb.Rows.Count > 0)
            {
                throw new Exception();
            }

            mDataStore.ExecuteCommand($@"INSERT INTO CatCategory(CatCode, IDParent, Ord) VALUES (@CatCode, @IDParent, @Ord)", parameters);

            //retirevs the id and inserting its associated labels
            DataTable tb2 = mDataStore.GetTable($@"SELECT IDCat FROM CatCategory WHERE CatCode = @CatCode", parameters);
            int catId = int.Parse(tb2.Rows[0]["IDCat"].ToString());
            localised_CatCategoryDataTable locTb = getCategoryNames(cat, catId);
            mDataStore.UpdateChanges(locTb);

            //inserts children
            if (cat.Items != null)
            {
                foreach (ICategoryObject child in cat.Items)
                    insertCategory(child, catId, annType, 0);
            }
        }

        /// <summary>
        /// Builds a localised_CatCategory DataTable with the lables associated to the category.
        /// </summary>
        /// <param name="cat">the category</param>
        /// <param name="catId">id in the DDB of the category</param>
        /// <returns></returns>
        private localised_CatCategoryDataTable getCategoryNames(ICategoryObject cat, int catId)
        {
            localised_CatCategoryDataTable tab = new localised_CatCategoryDataTable();

            if (cat.Names == null || cat.Names.Count == 0)
                return tab;

            foreach (ITextTypeWrapper n in cat.Names)
                tab.Rows.Add(catId, n.Locale, n.Value);

            return tab;
        }

        #endregion Metodi Category Scheme di lavoro

        #endregion Metodi Privati
    }
}