import React from "react";

export const DataLanguageContext = React.createContext(null);

export const DataLanguageProvider = DataLanguageContext.Provider;
export const DataLanguageConsumer = DataLanguageContext.Consumer;

export const withDataLanguage = () => Component => props =>
  <DataLanguageConsumer>
    {dataLanguage => <Component {...props} dataLanguage={dataLanguage}/>}
  </DataLanguageConsumer>;
