import React from 'react';
import {Select} from "antd";
import {connect} from "react-redux";
import {translate} from 'react-i18next';
import {compose} from "redux";
import {MARGIN_SM} from "../../styles/constants";
import {getLanguageFlagIconCss, getLanguageLabel} from "../../utils/languages";

const mapStateToProps = state => ({
  options: state.config.dataManagement.dataLanguages
});

const DataLanguageSelector = ({
                                t,
                                options,
                                value,
                                onSelect,
                                size
                              }) =>
  <Select value={value} onSelect={onSelect} size={size}>
    {options.map(({code}) =>
      <Select.Option key={code} value={code}>
        <i
          className={`flag-icon ${getLanguageFlagIconCss(code, options)}`}
          style={{marginRight: MARGIN_SM}}
        />
        {getLanguageLabel(t, code)}
      </Select.Option>
    )}
  </Select>;

export default compose(
  connect(mapStateToProps),
  translate()
)(DataLanguageSelector);
