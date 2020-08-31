import {applyMiddleware, createStore} from 'redux';
import rootReducer from './reducers/reducer';
import i18nMiddlewareFactory from './middlewares/i18n/middlewareFactory';
import i18next from 'i18next';
import apiMiddlewareFactory from './middlewares/api/middlewareFactory';
import userFeedbackMiddlewareFactory from './middlewares/user-feedback/middlewareFactory';
import defaultCategorySchemeSelectorMiddleware from './middlewares/default-category-scheme-selector/middleware';
import spinnerMiddlewareFactory from './middlewares/spinner/middlewareFactory';
import newTabMiddleware from './middlewares/newTab/middleware';
import emptyNodesModalMiddlewareFactory from "./middlewares/empty-nodes-modal/middlewareFactory";
import persistenceMiddleware from "./middlewares/persistence/middleware";
import authenticationMiddlewareFactory from "./middlewares/authentication/middlewareFactory";
import fileSaveMiddleware from "./middlewares/file-save/middleware";
import cubeNoDataModalMiddlewareFactory from "./middlewares/cube-no-data-modal/middlewareFactory";
import scrollToMiddleware from "./middlewares/scrollTo/middleware";
import metadataApiMiddleware from "./middlewares/metadata-api/middleware";
import currentNodeConfigMiddleware from "./middlewares/current-node-config/middleware";
import currentUserPermissionsMiddleware from "./middlewares/current-user-permissions/middleware";
import configMiddlewareFactory from "./middlewares/config/middleware";
// import {createLogger} from "redux-logger";

const $ = window.jQuery;

const showError = () => {
  $('.preloader__message').text("Error contacting server");
  $('.preloader__spinner__icon').hide();
  $('.preloader__error-icon').show();
};

// get configuration and translations and passes to callback the initialized redux and i18next
const init = onAfterInit =>
  fetch('./static/config.json')  // get configuration file
    .then(response => response.json())
    .then(config =>
      fetch(config.fetchBaseUrl + '/appConfig')
        .then(response => response.json())
        .then(appConfig =>                                            // configuration json defines necessary translations
          Promise.all(                                                // ... need to get all these translations
            appConfig.userInterface.languages.map(({code}) =>         // so, for each language defined in the configuration
              fetch(`./static/locales/${code}/translation.json`)  // ... get the translation file
                .then(response =>
                  response.headers.get("content-type").indexOf("application/json") !== -1
                    ? response.json()
                    : null
                )
                .catch(showError)
            )
          )
            .then(translations => {                                           // this is the array of translations objects
              let resources = {};                                             // i18n configuration requires a static object
              appConfig.userInterface.languages.forEach(({code}, idx) => {  // ... where each language
                if (translations[idx]) {
                  resources[code] = {translation: translations[idx]}      // ... is a property having an object like this as val
                }
              });
              i18next.init({
                lng: 'it',
                resources,
                returnEmptyString: false
              });
              onAfterInit(
                createStore(
                  rootReducer,
                  {},
                  applyMiddleware(
                    configMiddlewareFactory(i18next),
                    i18nMiddlewareFactory(i18next),
                    defaultCategorySchemeSelectorMiddleware,
                    emptyNodesModalMiddlewareFactory(i18next),
                    cubeNoDataModalMiddlewareFactory(i18next),
                    apiMiddlewareFactory(config.fetchBaseUrl, i18next),
                    newTabMiddleware,
                    userFeedbackMiddlewareFactory(i18next),
                    spinnerMiddlewareFactory(200),
                    persistenceMiddleware,
                    authenticationMiddlewareFactory(i18next),
                    fileSaveMiddleware,
                    scrollToMiddleware,
                    metadataApiMiddleware,
                    currentNodeConfigMiddleware,
                    currentUserPermissionsMiddleware,
                    // createLogger(),
                  )
                ),
                i18next
              );
            })
            .catch(showError)
        )
    )
    .catch(showError);

export default init;
