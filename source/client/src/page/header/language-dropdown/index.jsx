import React from 'react';
import {connect} from 'react-redux';
import {translate} from 'react-i18next';
import {Button, Dropdown, Icon, Menu} from 'antd';
import 'flag-icon-css/css/flag-icon.css';
import {setAppLanguage} from '../../../reducers/app/actions';
import {compose} from 'redux';
import {MARGIN_SM} from '../../../styles/constants';
import {getLanguageFlagIconCss, getLanguageLabel} from "../../../utils/languages";

const mapStateToProps = state => ({
  selectableLanguages: state.config.userInterface.languages,
  selectedLanguage: state.app.language
});

const mapDispatchToProps = dispatch => ({
  onLanguageSelect: language => dispatch(setAppLanguage(language))
});

const PageHeaderLanguageDropdown = ({
                                      selectableLanguages,
                                      selectedLanguage,
                                      onLanguageSelect,
                                      t
                                    }) =>
  selectableLanguages && selectableLanguages.length > 0 && selectedLanguage
    ? (
      <Dropdown
        trigger={['hover']}
        overlay={
          <Menu onClick={({key: language}) => onLanguageSelect(language)}>
            {
              selectableLanguages.map(({code}) =>
                <Menu.Item key={code}>
                  <a>{getLanguageLabel(t, code)}</a>
                </Menu.Item>
              )
            }
          </Menu>
        }
      >
        <Button htmlType="button">
          <i
            title={getLanguageLabel(t, selectedLanguage)}
            className={`flag-icon ${getLanguageFlagIconCss(selectedLanguage, selectableLanguages)}`}
            style={{marginRight: MARGIN_SM}}
          />
          <Icon type="down"/>
        </Button>
      </Dropdown>
    )
    : null;

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  translate()
)(PageHeaderLanguageDropdown);
