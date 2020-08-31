using DataStore.Factory;
using DataStore.Interface;
using DataProvider;
using Configuration;

namespace DataFactory
{
    public class Factory
    {

        public static DataStore.Interface.IDataStore DataStore
        {
            get
            {
                string dataProviderName = ConfigurationManager.AppSettings["DataStoreSettings:DATA_PROVIDER_NAME"];
                IDataStore dataStore = DataStoreFactory.GetDataStoreByDataProviderID(dataProviderName);

                return dataStore;
            }
        }

        #region Data Provider specifici

        public static DataProvider.IBuilderDataProvider BuilderDataProv
        {
            get
            {
                return new BuilderDataProvider(DataStore);
            }
        }

        public static DataProvider.IMappingDataProvider MappingDataProv
        {
            get
            {
                return new MappingDataProvider(DataStore);
            }
        }

        public static DataProvider.ILoaderDataProvider LoaderDataProv
        {
            get
            {
                return new LoaderDataProvider(DataStore);
            }
        }

        public static DataProvider.IDataflowBuilderDataProvider DataflowBuilderDataProv
        {
            get
            {
                return new DataflowBuilderDataProvider(DataStore);
            }
        }

        public static DataProvider.IUtilsDataProvider UtilsDataProv
        {
            get
            {
                return new UtilsDataProvider(DataStore);
            }
        }

        public static DataProvider.IUtilityDataProvider UtilityDataProv
        {
            get
            {
                return new UtilityDataProvider(DataStore);
            }
        }

        #endregion Data Provider specifici
    }
}
