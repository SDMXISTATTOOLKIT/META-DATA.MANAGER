import React, {Fragment} from 'react';
import {connect} from "react-redux";
import {translate} from 'react-i18next';
import {compose} from "redux";
import {
  changeCompareDsdsDsdSource,
  downloadCompareDsdsReport,
  hideCompareDsdsCodelistCompareReport,
  hideCompareDsdsSrcDsds,
  hideCompareDsdsTargetDsds,
  readCompareDsdsCodelistCompareReport,
  readCompareDsdsReport,
  readCompareDsdsSrcDsds,
  readCompareDsdsTargetDsds,
  resetCompareDsdsSrcTriplet,
  resetCompareDsdsTargetTriplet,
  setCompareDsdsDsdFile,
  setCompareDsdsSrcTriplet,
  setCompareDsdsTargetTriplet,
  showCompareDsdsSrcDsds,
  showCompareDsdsTargetDsds
} from "./actions";
import {Button, Card, Col, Radio, Row} from "antd";
import {GUTTER_SM, MARGIN_MD, MODAL_WIDTH_LG, SPAN_HALF} from "../../../styles/constants";
import Selector from "../../../components/selector";
import Call from "../../../hocs/call";
import EnhancedModal from "../../../components/enhanced-modal";
import ArtefactList from "../../../components/artefact-list";
import {getStringFromArtefactTriplet} from "../../../utils/sdmxJson";
import DsdsCompareReport from "../../../components/dsds-compare-report";
import ReduxdsdDetailModal from "../../../redux-components/redux-dsd-detail-modal";
import {reuseAction} from "../../../utils/reduxReuse";
import {showDsdDetail} from "../../../redux-components/redux-dsd-detail-modal/actions";
import {
  DM_COMPARE_DSDS_CODELIST_DETAIL_PREFIX,
  DM_COMPARE_DSDS_DSD_DETAIL_PREFIX,
  DM_COMPARE_DSDS_SOURCE_MSDB,
  DM_COMPARE_DSDS_SOURCE_XML
} from "./reducer";
import {showCodelistDetail} from "../../../redux-components/redux-codelist-detail-modal/actions";
import FileInput from "../../../components/file-input";

const mapStateToProps = state => ({
  nodeId: state.app.endpointId,
  nodes: state.config.nodes,
  appLanguage: state.app.language,
  isSrcDsdsVisible: state.scenes.utilities.compareDsds.isSrcDsdsVisible,
  isTargetDsdsVisible: state.scenes.utilities.compareDsds.isTargetDsdsVisible,
  srcDsds: state.scenes.utilities.compareDsds.srcDsds,
  targetDsds: state.scenes.utilities.compareDsds.targetDsds,
  srcTriplet: state.scenes.utilities.compareDsds.srcTriplet,
  targetTriplet: state.scenes.utilities.compareDsds.targetTriplet,
  dsdDetail: state.scenes.utilities.compareDsds.dsdDetail,
  report: state.scenes.utilities.compareDsds.report,
  codelistDetail: state.scenes.utilities.compareDsds.codelistDetail,
  codelistCompareReport: state.scenes.utilities.compareDsds.codelistCompareReport,
  srcSource: state.scenes.utilities.compareDsds.srcSource,
  targetSource: state.scenes.utilities.compareDsds.targetSource,
  srcFile: state.scenes.utilities.compareDsds.srcFile,
  targetFile: state.scenes.utilities.compareDsds.targetFile,
});

const mapDispatchToProps = dispatch => ({
  onSrcDsdsShow: () => dispatch(showCompareDsdsSrcDsds()),
  onTargetDsdsShow: () => dispatch(showCompareDsdsTargetDsds()),
  onSrcDsdsHide: () => dispatch(hideCompareDsdsSrcDsds()),
  onTargetDsdsHide: () => dispatch(hideCompareDsdsTargetDsds()),
  onSrcTripletSet: srcTriplet => dispatch(setCompareDsdsSrcTriplet(srcTriplet)),
  onTargetTripletSet: srcTriplet => dispatch(setCompareDsdsTargetTriplet(srcTriplet)),
  onSrcTripletReset: () => dispatch(resetCompareDsdsSrcTriplet()),
  onTargetTripletReset: () => dispatch(resetCompareDsdsTargetTriplet()),
  fetchSrcDsds: () => dispatch(readCompareDsdsSrcDsds()),
  fetchTargetDsds: () => dispatch(readCompareDsdsTargetDsds()),
  fetchCompareDsdsReport: (srcTriplet, targetTriplet, srcFile, targetFile) =>
    dispatch(readCompareDsdsReport(srcTriplet, targetTriplet, srcFile, targetFile)),
  fetchCodelistCompareReport: (sourceCodelistTriplet, targetCodelistTriplet, sourceFile, targetFile) =>
    dispatch(readCompareDsdsCodelistCompareReport(sourceCodelistTriplet, targetCodelistTriplet, sourceFile, targetFile)),
  onCodelistCompareReportHide: () => dispatch(hideCompareDsdsCodelistCompareReport()),
  fetchDsdDetail: dsdTriplet => dispatch(reuseAction(showDsdDetail(dsdTriplet), DM_COMPARE_DSDS_DSD_DETAIL_PREFIX)),
  onCodelistDetailShow: (codelistTriplet, defaultItemsViewMode) =>
    dispatch(reuseAction(showCodelistDetail(codelistTriplet, defaultItemsViewMode), DM_COMPARE_DSDS_CODELIST_DETAIL_PREFIX)),
  onReportDownload: (srcTriplet, targetTriplet, srcFile, targetFile, lang) =>
    dispatch(downloadCompareDsdsReport(srcTriplet, targetTriplet, srcFile, targetFile, lang)),
  onSourceChange: (source, isSrc) => dispatch(changeCompareDsdsDsdSource(source, isSrc)),
  onFileSet: (file, isSrc) => dispatch(setCompareDsdsDsdFile(file, isSrc))
});

const CompareDsds = ({
                       t,
                       nodeId,
                       nodes,
                       appLanguage,
                       dsdDetail,
                       isSrcDsdsVisible,
                       isTargetDsdsVisible,
                       srcDsds,
                       targetDsds,
                       srcTriplet,
                       targetTriplet,
                       report,
                       codelistDetail,
                       codelistCompareReport,
                       srcSource,
                       targetSource,
                       srcFile,
                       targetFile,
                       onSrcDsdsShow,
                       onTargetDsdsShow,
                       onSrcDsdsHide,
                       onTargetDsdsHide,
                       onSrcTripletSet,
                       onSrcTripletReset,
                       onTargetTripletSet,
                       onTargetTripletReset,
                       fetchSrcDsds,
                       fetchTargetDsds,
                       fetchCompareDsdsReport,
                       fetchCodelistCompareReport,
                       onCodelistCompareReportHide,
                       fetchDsdDetail,
                       onCodelistDetailShow,
                       onReportDownload,
                       onSourceChange,
                       onFileSet
                     }) => {

  const defaultItemsViewMode = nodes.find(node => node.general.id === nodeId).general.defaultItemsViewMode;

  return (
    <Fragment>
      <EnhancedModal
        visible={isSrcDsdsVisible}
        onCancel={onSrcDsdsHide}
        title={t('scenes.utilities.compareDsds.sourceDsdSelector.modal.title')}
        width={MODAL_WIDTH_LG}
        footer={<Button onClick={onSrcDsdsHide}>{t('commons.buttons.close.title')}</Button>}
      >
        <Call cb={fetchSrcDsds}>
          <ArtefactList
            artefacts={srcDsds}
            onRowClick={onSrcTripletSet}
            onDetailShow={fetchDsdDetail}
          />
        </Call>
      </EnhancedModal>
      <EnhancedModal
        visible={isTargetDsdsVisible}
        onCancel={onTargetDsdsHide}
        title={t('scenes.utilities.compareDsds.sourceDsdSelector.modal.title')}
        width={MODAL_WIDTH_LG}
        footer={<Button onClick={onTargetDsdsHide}>{t('commons.buttons.close.title')}</Button>}
      >
        <Call cb={fetchTargetDsds}>
          <ArtefactList
            artefacts={targetDsds}
            onRowClick={onTargetTripletSet}
            onDetailShow={fetchDsdDetail}
          />
        </Call>
      </EnhancedModal>
      <Row type="flex" justify="end" gutter={GUTTER_SM} style={{marginBottom: MARGIN_MD}}>
        <Col>
          <Button
            type="primary"
            disabled={!((srcTriplet || srcFile) && (targetTriplet || targetFile))}
            onClick={() => fetchCompareDsdsReport(srcTriplet, targetTriplet, srcFile, targetFile)}
          >
            {t('scenes.utilities.compareDsds.compareButton.title')}
          </Button>
        </Col>
        <Col>
          <Button
            type="primary"
            disabled={!((srcTriplet || srcFile) && (targetTriplet || targetFile))}
            onClick={() => onReportDownload(srcTriplet, targetTriplet, srcFile, targetFile, appLanguage)}
          >
            {t('scenes.utilities.compareDsds.generateReport.title')}
          </Button>
        </Col>
      </Row>
      <Card style={{marginBottom: MARGIN_MD}}>
        <Row type="flex" gutter={48}>
          <Col span={SPAN_HALF}>
            <Row type="flex" justify="space-between">
              <Col style={{width: 140}}>
                <Radio.Group
                  value={srcSource}
                  onChange={({target}) => onSourceChange(target.value, true)}
                >
                  <Radio.Button value={DM_COMPARE_DSDS_SOURCE_MSDB} style={{width: 70, textAlign: "center"}}>
                    MSDB
                  </Radio.Button>
                  <Radio.Button value={DM_COMPARE_DSDS_SOURCE_XML} style={{width: 70, textAlign: "center"}}>
                    XML
                  </Radio.Button>
                </Radio.Group>
              </Col>
              <Col style={{width: "calc(100% - 144px)"}}>
                {
                  srcSource === DM_COMPARE_DSDS_SOURCE_MSDB
                    ? (
                      <Selector
                        value={srcTriplet && getStringFromArtefactTriplet(srcTriplet)}
                        selectTitle={t('scenes.utilities.compareDsds.sourceDsdSelector.selectButton.title')}
                        resetTitle={t('scenes.utilities.compareDsds.sourceDsdSelector.resetButton.title')}
                        detailTitle={t('scenes.utilities.compareDsds.sourceDsdSelector.detailButton.title')}
                        onSelect={onSrcDsdsShow}
                        onReset={onSrcTripletReset}
                        onDetail={() => fetchDsdDetail(srcTriplet)}
                      />
                    )
                    : (
                      <FileInput
                        value={srcFile}
                        accept={'.xml'}
                        onChange={file => onFileSet(file, true)}
                      />
                    )
                }
              </Col>
            </Row>
          </Col>
          <Col span={SPAN_HALF}>
            <Row type="flex" justify="space-between">
              <Col style={{width: 140}}>
                <Radio.Group
                  value={targetSource}
                  onChange={({target}) => onSourceChange(target.value, false)}
                >
                  <Radio.Button value={DM_COMPARE_DSDS_SOURCE_MSDB} style={{width: 70, textAlign: "center"}}>
                    MSDB
                  </Radio.Button>
                  <Radio.Button value={DM_COMPARE_DSDS_SOURCE_XML} style={{width: 70, textAlign: "center"}}>
                    XML
                  </Radio.Button>
                </Radio.Group>
              </Col>
              <Col style={{width: "calc(100% - 144px)"}}>
                {
                  targetSource === DM_COMPARE_DSDS_SOURCE_MSDB
                    ? (
                      <Selector
                        value={targetTriplet && getStringFromArtefactTriplet(targetTriplet)}
                        selectTitle={t('scenes.utilities.compareDsds.targetDsdSelector.selectButton.title')}
                        resetTitle={t('scenes.utilities.compareDsds.targetDsdSelector.resetButton.title')}
                        detailTitle={t('scenes.utilities.compareDsds.sourceDsdSelector.detailButton.title')}
                        onSelect={onTargetDsdsShow}
                        onReset={onTargetTripletReset}
                        onDetail={() => fetchDsdDetail(targetTriplet)}
                      />
                    )
                    : (
                      <FileInput
                        value={targetFile}
                        accept={'.xml'}
                        onChange={file => onFileSet(file, false)}
                      />
                    )
                }
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>
      {
        report && (
          <DsdsCompareReport
            report={report}
            codelistDetail={codelistDetail}
            codelistDetailInstancePrefix={DM_COMPARE_DSDS_CODELIST_DETAIL_PREFIX}
            onCodelistDetailShow={triplet => onCodelistDetailShow(triplet, defaultItemsViewMode)}
            codelistCompareReport={codelistCompareReport}
            fetchCodelistCompareReport={fetchCodelistCompareReport}
            onCodelistCompareReportHide={onCodelistCompareReportHide}
          />
        )
      }
      <ReduxdsdDetailModal
        instancePrefix={DM_COMPARE_DSDS_DSD_DETAIL_PREFIX}
        instanceState={dsdDetail}
      />
    </Fragment>
  )
};

export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps)
)(CompareDsds);
