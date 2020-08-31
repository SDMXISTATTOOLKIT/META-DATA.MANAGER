using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DataStore.Interface;
using System.IO;
using System.Reflection;
using Configuration;
using Newtonsoft.Json;
using Microsoft.Extensions.Configuration;

namespace DataStore.Factory
{    

    public class DataStoreFactory
    {

        private static DataProviderDS mDataProviderConfigDS = new DataProviderDS();
        private static bool mConfigLoaded = false;

        static DataStoreFactory() {
            LoadDataProviderConfigDS();
        }

        public static IDataStore GetDataStore(string dataStoreType, DataStoreConfig dataStoreconfig=null, string connStr=null, string schema=null, string dataProviderName = null)
        {
            IDataStore dataStore = null;

            if (dataStoreType == "SQL_SERVER")
            {
                if (dataStoreconfig != null)
                {
                    dataStore = GetDataStore("DataStore.SQLServer", "DataStore.SQLServerDataStore.SQLServerDataStore", new object[] { dataStoreconfig });
                }
                else if (connStr != null)
                {
                    dataStore = GetDataStore("DataStore.SQLServer", "DataStore.SQLServerDataStore.SQLServerDataStore", new object[] { connStr, schema });
                }                
            }
            else
            {
                throw new Exception("Data store " + dataStoreType + " non supportato!");
            }

            dataStore.DataProviderName = dataProviderName;
            dataStore.DataProviderType = dataStoreType;

            return dataStore;
        }
        
        private static IDataStore GetDataStore(string assemblyName, string typeName, object[] args)
        {
            //ricavo il path dell'assembly del dataStore che mi serve
            string assemblyPath = AppDomain.CurrentDomain.BaseDirectory + assemblyName + ".dll";

            Assembly assembly = Assembly.LoadFrom(assemblyPath);
            Type type = assembly.GetType(typeName);
            IDataStore dataStore = Activator.CreateInstance(type, BindingFlags.CreateInstance, null, args, System.Globalization.CultureInfo.CurrentCulture, null) as IDataStore;

            return dataStore;
        }

        public static IDataStore GetDataStoreByDataProviderID(string dataProviderID) {    
                    
            DataProviderDS.DATA_PROVIDERRow row = mDataProviderConfigDS.DATA_PROVIDER.First((r)=> { return r.ID == dataProviderID; });
            if (row != null) {                      
                DataStoreConfig dataStoreConfig = new DataStoreConfig();
                dataStoreConfig.connStr = row.CONN_STR;
                dataStoreConfig.schema = row.IsSCHEMANull() ? null : row.SCHEMA;
                dataStoreConfig.idField = row.IsID_FIELDNull() ? null : row.ID_FIELD;
                dataStoreConfig.idFieldLength = row.IsID_FIELD_LENGTHNull() ? -1 : row.ID_FIELD_LENGTH;
                dataStoreConfig.idFieldPrefixLength = row.IsID_FIELD_PREFIX_LENGTHNull() ? -1 : row.ID_FIELD_PREFIX_LENGTH;
                dataStoreConfig.DateFormat = row.IsDATE_FORMATNull() ? null : row.DATE_FORMAT;
                dataStoreConfig.DecimalSeparator = row.IsDECIMAL_SEPARATORNull() ? null : row.DECIMAL_SEPARATOR;

                return GetDataStore(row.DATA_STORE_TYPE, dataStoreConfig, dataProviderName: dataProviderID);
            }            
            return null;
        }

        public static DataProviderDS.DATA_PROVIDERRow GetDataProviderByID(string dataProviderID)
        {
            DataProviderDS.DATA_PROVIDERRow row = mDataProviderConfigDS.DATA_PROVIDER.First((r) => { return r.ID == dataProviderID; });
            if (row != null)
            {
                return row;
            }
            return null;
        }

        public static DataProviderDS.DATA_PROVIDERRow[] GetDataProviders()
        {
            return (DataProviderDS.DATA_PROVIDERRow[]) mDataProviderConfigDS.DATA_PROVIDER.Select();
        }

        private static void LoadDataProviderConfigDS()
        {
            lock (DataStoreFactory.mDataProviderConfigDS)
            {
                if (!DataStoreFactory.mConfigLoaded)
                {
                    DataStoreFactory.mDataProviderConfigDS.Clear();
                    
                    var providers = ConfigurationManager.AppSettings.GetSection("DATA_PROVIDER_NAME").GetChildren();
                    //var providers = JsonConvert.DeserializeObject<Dictionary<string, DataProviderModel>>(itemConfig.Value);

                    var xmlBuilder = new StringBuilder();
                    xmlBuilder.Append("<?xml version=\"1.0\" standalone=\"yes\"?><DataProviderDS xmlns=\"http://tempuri.org/DataProviderDS.xsd\">");

                    if (providers != null)
                    {
                        foreach (var item in providers)
                        {
                            xmlBuilder.Append("<DATA_PROVIDER>");
                            xmlBuilder.Append($"<ID>{item.Key}</ID>");
                            var child = item.GetChildren();
                            foreach (var itemChild in child)
                            {
                                if (itemChild.Key.Equals("DATA_STORE_TYPE"))
                                {
                                    xmlBuilder.Append($"<DATA_STORE_TYPE>{itemChild.Value}</DATA_STORE_TYPE>");
                                }
                                else if (itemChild.Key.Equals("CONN_STR"))
                                {
                                    xmlBuilder.Append($"<CONN_STR>{itemChild.Value}</CONN_STR>");
                                }
                                else if (itemChild.Key.Equals("SCHEMA"))
                                {
                                    xmlBuilder.Append($"<SCHEMA>{itemChild.Value}</SCHEMA>");
                                }
                            }
                            xmlBuilder.Append("</DATA_PROVIDER>");
                        }
                    }
                    xmlBuilder.Append("</DataProviderDS>");

                    DataStoreFactory.mDataProviderConfigDS.ReadXml(new StringReader(xmlBuilder.ToString()));
                    DataStoreFactory.mConfigLoaded = true;
                }
            }
        }
    }
}
