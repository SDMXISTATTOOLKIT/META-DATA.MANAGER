import React, {Fragment} from 'react';
import {compose} from 'redux';
import {translate} from 'react-i18next';
import LoaderCsvForm from './csv-form';
import LoaderXmlForm from './xml-form';
import {Divider, Radio} from 'antd';
import {connect} from 'react-redux';
import {showLoaderCsvForm} from './csv-form/actions';
import {showLoaderXmlForm} from './xml-form/actions';
import {DataLanguageConsumer} from "../../../contexts/DataLanguage";

const mapStateToProps = state => ({
  isCsvVisible: state.scenes.dataManager.loader.shared.isCsvVisible,
  isXmlVisible: state.scenes.dataManager.loader.shared.isXmlVisible
});

const mapDispatchToProps = dispatch => ({
  onCsvShow: () => dispatch(showLoaderCsvForm()),
  onXmlShow: () => dispatch(showLoaderXmlForm())
});

const Loader = ({
                  t,
                  isCsvVisible,
                  isXmlVisible,
                  onCsvShow,
                  onXmlShow
                }) =>
  <Fragment>
    <Radio.Group defaultValue="csv">
      <Radio.Button value="csv" onClick={onCsvShow}>
        CSV
      </Radio.Button>
      <Radio.Button value="sdmx-ml" onClick={onXmlShow}>
        SDMX-ML
      </Radio.Button>
    </Radio.Group>
    <Divider/>
    {isCsvVisible && <LoaderCsvForm/>}
    {isXmlVisible && (
      <DataLanguageConsumer>
        {dataLanguage => <LoaderXmlForm dataLanguage={dataLanguage}/>}
      </DataLanguageConsumer>
    )}
  </Fragment>;

export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps)
)(Loader);
