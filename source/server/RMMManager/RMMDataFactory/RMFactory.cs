using Configuration;
using DataStore.Factory;
using DataStore.Interface;
using System;

namespace RMManager.RMDataFactory
{
    public class RMFactory
    {
        //private static DataProviderDS.DATA_PROVIDERRow DefaultDataProvider
        //{
        //    get
        //    {
        //        string dataProviderName = ConfigurationManager.AppSettings["DataStoreSettings:DATA_PROVIDER_NAME"];
        //        return DataStoreFactory.GetDataProviderByID(dataProviderName);
        //    }
        //}

        //private static DataProviderDS.DATA_PROVIDERRow DefaultSystemProvider
        //{
        //    get
        //    {
        //        string systemProviderName = ConfigurationManager.AppSettings["DataStoreSettings:SYSTEM_PROVIDER_NAME"];
        //        return DataStoreFactory.GetDataProviderByID(systemProviderName);
        //    }
        //}

        public static DataStore.Interface.IDataStore DataStore
        {
            get
            {
                string dataProviderName =  ConfigurationManager.AppSettings["RMManagerSettings:DATA_PROVIDER_NAME"];
                IDataStore dataStore = DataStoreFactory.GetDataStoreByDataProviderID(dataProviderName);

                return dataStore;
            }
        }
    }
}
