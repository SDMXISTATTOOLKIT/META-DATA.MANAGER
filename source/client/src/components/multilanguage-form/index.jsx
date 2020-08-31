import React from 'react';
import {connect} from 'react-redux';
import {translate} from 'react-i18next';
import {compose} from 'redux';
import {Tabs} from 'antd';
import 'flag-icon-css/css/flag-icon.css';
import './style.css';
import {getLanguageFlagIconCss, getLanguageLabel} from "../../utils/languages";

const mapStateToProps = state => ({
  selectableLanguages: state.config.dataManagement.dataLanguages,
});

const MultilanguageForm = ({
                             t,
                             children,
                             selectableLanguages
                           }) =>
  <Tabs className="multilanguage-form">
    {selectableLanguages.map(({code}) =>
      <Tabs.TabPane
        tab={
          <div>
            <i
              className={`flag-icon ${getLanguageFlagIconCss(code, selectableLanguages)}`}
            />
            {getLanguageLabel(t, code)}
          </div>
        }
        key={code}
      >
        {children}
      </Tabs.TabPane>
    )}
  </Tabs>;

export default compose(
  connect(mapStateToProps),
  translate()
)(MultilanguageForm);
