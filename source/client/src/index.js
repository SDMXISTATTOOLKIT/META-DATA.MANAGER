import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {HashRouter} from 'react-router-dom'
import {I18nextProvider} from 'react-i18next';
import './styles/ant-overrides.css';
import './styles/jquery-ui-overrides.css';
import './styles/custom.css';
import './styles/fonts/font-style.css';
import CustomEmpty from './components/custom-empty';

import init from './init';
import Page from './page';
import {ConfigProvider} from 'antd';
import {initConfig} from './reducers/config/actions';

init((store, i18n) => {
  store.dispatch(initConfig());
  ReactDOM.render(
    <Provider store={store}>
      <I18nextProvider i18n={i18n}>
        <HashRouter>
          <ConfigProvider renderEmpty={() => <CustomEmpty/>}>
            <Page/>
          </ConfigProvider>
        </HashRouter>
      </I18nextProvider>
    </Provider>,
    document.getElementById('react-root'));
});

//registerServiceWorker();
