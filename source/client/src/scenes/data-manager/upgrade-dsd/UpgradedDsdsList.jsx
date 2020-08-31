import React, {Fragment} from "react";
import {translate} from 'react-i18next';
import {
  compareUpgradeDsdDsds,
  downloadUpgradeDsdImportDsdDsdsCompare,
  hideUpgradeDsdCodelistCompareReport,
  hideUpgradeDsdDsdsCompare,
  hideUpgradeDsdDsdUpgrade,
  hideUpgradeDsdImportDsd,
  hideUpgradeDsdImportDsdReport,
  hideUpgradeDsdUpgradedDsds,
  readUpgradeDsdCodelistCompareReport,
  readUpgradeDsdUpgradedDsds,
  setUpgradeDsdImportDsdFile,
  showUpgradeDsdDsdUpgrade,
  showUpgradeDsdImportDsd,
  startUpgradeDsdImportDsdImport,
  submitUpgradeDsdImportDsdDsdsCompare,
  submitUpgradeDsdImportDsdFile,
  upgradeUpgradeDsdDsd,
  uploadUpgradeDsdImportDsdFile
} from "./actions";
import {connect} from "react-redux";
import {compose} from "redux";
import {Alert, Button, Card, Col, Form, Icon, Input, Modal, Row} from "antd";
import _ from "lodash";
import {
  GUTTER_MD,
  GUTTER_SM,
  MARGIN_MD,
  MODAL_WIDTH_LG,
  MODAL_WIDTH_MD,
  SPAN_FULL,
  SPAN_ONE_THIRD,
  SPAN_TWO_THIRDS,
  TABLE_COL_MIN_WIDTH_ID,
  TABLE_COL_MIN_WIDTH_NAME
} from "../../../styles/constants";
import EnhancedModal from "../../../components/enhanced-modal";
import Call from "../../../hocs/call";
import {BUTTON_DSD_COMPARE, BUTTON_DSD_UPGRADE} from "../../../styles/buttons";
import {getArtefactTripletFromUrn, getStringFromArtefactTriplet} from "../../../utils/sdmxJson";
import DsdsCompareReport from "../../../components/dsds-compare-report";
import {DM_UPGRADE_DSD_CODELIST_DETAIL_PREFIX} from "./reducer";
import {reuseAction} from "../../../utils/reduxReuse";
import {showCodelistDetail} from "../../../redux-components/redux-codelist-detail-modal/actions";
import InfiniteScrollTable from "../../../components/infinite-scroll-table";
import FileInput from "../../../components/file-input";

const IMPORT_STRUCTURES_REPORT_STATUS_SUCCESS = "Success";
const IMPORT_STRUCTURES_REPORT_STATUS_WARNING = "Warning";
const IMPORT_STRUCTURES_REPORT_STATUS_ERROR = "Error";
const IMPORT_STRUCTURES_REPORT_STATUS_FAILURE = "Failure";

const mapStateToProps = state => ({
  nodeId: state.app.endpointId,
  nodes: state.config.nodes,
  appLanguage: state.app.language,
  isUpgradedDsdsVisible: state.scenes.dataManager.upgradeDsd.isUpgradedDsdsVisible,
  sourceDsdTriplet: state.scenes.dataManager.upgradeDsd.sourceDsdTriplet,
  targetDsdTriplet: state.scenes.dataManager.upgradeDsd.targetDsdTriplet,
  upgradedDsds: state.scenes.dataManager.upgradeDsd.upgradedDsds,
  isCompareReportVisible: state.scenes.dataManager.upgradeDsd.isCompareReportVisible,
  compareReport: state.scenes.dataManager.upgradeDsd.compareReport,
  isUpgradeVisible: state.scenes.dataManager.upgradeDsd.isUpgradeVisible,
  upgradeReport: state.scenes.dataManager.upgradeDsd.upgradeReport,
  codelistCompareReport: state.scenes.dataManager.upgradeDsd.codelistCompareReport,
  codelistDetail: state.scenes.dataManager.upgradeDsd.codelistDetail,
  isImportDsdVisible: state.scenes.dataManager.upgradeDsd.isImportDsdVisible,
  dsdFile: state.scenes.dataManager.upgradeDsd.dsdFile,
  isImportEnabled: state.scenes.dataManager.upgradeDsd.isImportEnabled,
  importDsdHash: state.scenes.dataManager.upgradeDsd.importDsdHash,
  importDsdItems: state.scenes.dataManager.upgradeDsd.importDsdItems,
  importDsdReport: state.scenes.dataManager.upgradeDsd.importDsdReport,
});

const mapDispatchToProps = dispatch => ({
  fetchUpgradedDsds: dsdTriplet => dispatch(readUpgradeDsdUpgradedDsds(dsdTriplet)),
  onUpgradedDsdsHide: () => dispatch(hideUpgradeDsdUpgradedDsds()),
  onDsdsCompare: ({sourceDsdTriplet, targetDsdTriplet, showModal}) =>
    dispatch(compareUpgradeDsdDsds(sourceDsdTriplet, targetDsdTriplet, showModal)),
  onDsdsCompareHide: () => dispatch(hideUpgradeDsdDsdsCompare()),
  onDsdUpgradeShow: dsdTriplet => dispatch(showUpgradeDsdDsdUpgrade(dsdTriplet)),
  onDsdUpgrade: compareReport => dispatch(upgradeUpgradeDsdDsd(compareReport)),
  onDsdUpgradeHide: success => dispatch(hideUpgradeDsdDsdUpgrade(success)),
  fetchCodelistCompareReport: (sourceCodelistTriplet, targetCodelistTriplet) =>
    dispatch(readUpgradeDsdCodelistCompareReport(sourceCodelistTriplet, targetCodelistTriplet)),
  onCodelistCompareReportHide: () => dispatch(hideUpgradeDsdCodelistCompareReport()),
  onCodelistDetailShow: (codelistTriplet, defaultItemsViewMode) =>
    dispatch(reuseAction(showCodelistDetail(codelistTriplet, defaultItemsViewMode), DM_UPGRADE_DSD_CODELIST_DETAIL_PREFIX)),
  onImportDsdShow: () => dispatch(showUpgradeDsdImportDsd()),
  onImportDsdHide: () => dispatch(hideUpgradeDsdImportDsd()),
  onFileSet: file => dispatch(setUpgradeDsdImportDsdFile(file)),
  onDsdImportDsdsCompare: ({sourceDsdTriplet, dsdFile, showModal}) =>
    dispatch(submitUpgradeDsdImportDsdDsdsCompare(sourceDsdTriplet, dsdFile, showModal)),
  onDsdsCompareDownload: (srcTriplet, targetTriplet, targetFile, lang) =>
    dispatch(downloadUpgradeDsdImportDsdDsdsCompare(srcTriplet, targetTriplet, targetFile, lang)),
  onImportDsdStart: () => dispatch(startUpgradeDsdImportDsdImport()),
  onImportDsdFileUpload: file => dispatch(uploadUpgradeDsdImportDsdFile(file)),
  onImportDsdFileSubmit: ({importDsdItems, importDsdHash}) => dispatch(submitUpgradeDsdImportDsdFile(importDsdItems, importDsdHash)),
  onImportDsdImportHide: () => dispatch(hideUpgradeDsdImportDsdReport()),
});

const getColSpan = upgradeReport =>
  SPAN_FULL / _.keys(_.pickBy({...upgradeReport, deleted: undefined}, arr => arr && arr.length > 0)).length;

const UpgradedDsdsList = ({
                            t,
                            nodeId,
                            nodes,
                            appLanguage,
                            isUpgradedDsdsVisible,
                            sourceDsdTriplet,
                            targetDsdTriplet,
                            upgradedDsds,
                            isCompareReportVisible,
                            compareReport,
                            isUpgradeVisible,
                            upgradeReport,
                            codelistCompareReport,
                            codelistDetail,
                            isImportDsdVisible,
                            dsdFile,
                            isImportEnabled,
                            importDsdHash,
                            importDsdItems,
                            importDsdReport,
                            fetchUpgradedDsds,
                            onUpgradedDsdsHide,
                            onDsdsCompare,
                            onDsdsCompareHide,
                            onDsdUpgradeShow,
                            onDsdUpgrade,
                            onDsdUpgradeHide,
                            fetchCodelistCompareReport,
                            onCodelistCompareReportHide,
                            onCodelistDetailShow,
                            onImportDsdShow,
                            onImportDsdHide,
                            onFileSet,
                            onDsdImportDsdsCompare,
                            onDsdsCompareDownload,
                            onImportDsdStart,
                            onImportDsdFileUpload,
                            onImportDsdFileSubmit,
                            onImportDsdImportHide
                          }) => {

  const defaultItemsViewMode = nodes.find(node => node.general.id === nodeId).general.defaultItemsViewMode;
  const importDsdSelectedItems = (importDsdItems || []).filter(({isOk}) => isOk);

  return (
    <Fragment>

      {/*upgradedDsds*/}
      <Call
        cb={fetchUpgradedDsds}
        cbParam={sourceDsdTriplet}
        disabled={!sourceDsdTriplet || upgradedDsds !== null}
      >
        <EnhancedModal
          visible={isUpgradedDsdsVisible}
          onCancel={onUpgradedDsdsHide}
          title={t('scenes.dataManager.upgradeDsd.modals.upgradedDsdList.title')}
          withDataLanguageSelector
          width={MODAL_WIDTH_LG}
          footer={<Button onClick={onUpgradedDsdsHide}>{t('commons.buttons.close.title')}</Button>}
        >
          <InfiniteScrollTable
            data={upgradedDsds || []}
            getRowKey={({id, agency, version}) => `${id}+${agency}+${version}`}
            columns={[
              {
                title: t('data.artefact.id.shortLabel'),
                dataIndex: 'id',
                minWidth: TABLE_COL_MIN_WIDTH_ID
              },
              {
                title: t('data.artefact.agencyID.shortLabel'),
                dataIndex: 'agency',
                widthToContent: true,
                withValuesFilter: true
              },
              {
                title: t('data.artefact.name.shortLabel'),
                dataIndex: 'names',
                minWidth: TABLE_COL_MIN_WIDTH_NAME
              },
              {
                title: t('data.artefact.version.shortLabel'),
                dataIndex: 'version',
                widthToContent: true,
                withValuesFilter: true
              },
              {
                title: t('data.artefact.isFinal.shortLabel'),
                dataIndex: "isFinal",
                width: 30,
                withValuesFilter: true,
                render: isFinal => isFinal
                  ? <Icon type="check"/>
                  : null,
                renderText: isFinal => isFinal
                  ? t('data.artefact.isFinal.values.final')
                  : t('data.artefact.isFinal.values.notFinal'),
              }
            ]}
            multilangStrDataIndexes={["names"]}
            actions={[
              {
                ...BUTTON_DSD_COMPARE,
                title: t('commons.actions.compareDsds.title'),
                onClick: ({id, agency, version}) => onDsdsCompare({
                  sourceDsdTriplet,
                  targetDsdTriplet: {id, agencyID: agency, version},
                  showModal: true
                })
              },
              {
                ...BUTTON_DSD_UPGRADE,
                title: t('commons.actions.upgradeDsd.title'),
                onClick: ({id, agency, version}) => Modal.confirm({
                  title: t('scenes.dataManager.upgradeDsd.modals.confirms.upgrade.title'),
                  onOk() {
                    onDsdUpgradeShow({id, agencyID: agency, version});
                  },
                  cancelText: t('commons.buttons.cancel.title')
                })
              }
            ]}
            rightActions={
              <Button
                type="primary"
                onClick={onImportDsdShow}
              >
                {t('scenes.dataManager.upgradeDsd.modals.upgradedDsdList.buttons.import.title')}
              </Button>
            }
          />
        </EnhancedModal>
      </Call>

      {/*import form*/}
      <EnhancedModal
        visible={isImportDsdVisible}
        onCancel={onImportDsdHide}
        title={t('scenes.dataManager.upgradeDsd.modals.importDsdFromFile.title')}
        withDataLanguageSelector
        width={MODAL_WIDTH_MD}
        footer={
          <div>
            <Button onClick={onImportDsdHide}>{t('commons.buttons.close.title')}</Button>
            <Button
              type="primary"
              onClick={onImportDsdStart}
              disabled={!dsdFile}
            >
              {t('scenes.dataManager.upgradeDsd.modals.importDsdFromFile.importDsdInMsdb.title')}
            </Button>
          </div>
        }
      >
        <Fragment>
          <Row style={{marginBottom: MARGIN_MD}}>
            <Form.Item
              label={t('scenes.dataManager.upgradeDsd.modals.importDsdFromFile.dsd.label')}
              className="form-item-required"
              labelCol={{span: SPAN_ONE_THIRD}}
              wrapperCol={{span: SPAN_TWO_THIRDS}}
            >
              <FileInput
                value={dsdFile}
                accept={'.xml'}
                onChange={file => onFileSet(file)}
              />
            </Form.Item>
          </Row>
          <Row type="flex" justify="end" gutter={GUTTER_SM} style={{marginBottom: MARGIN_MD}}>
            <Col>
              <Button
                type="primary"
                onClick={() => onDsdImportDsdsCompare({sourceDsdTriplet, dsdFile, showModal: true})}
                disabled={!dsdFile}
              >
                {t('scenes.dataManager.upgradeDsd.modals.importDsdFromFile.compareDsds.title')}
              </Button>
            </Col>
          </Row>
        </Fragment>
      </EnhancedModal>

      {/*compare report*/}
      <EnhancedModal
        visible={isCompareReportVisible}
        onCancel={onDsdsCompareHide}
        title={t('scenes.dataManager.upgradeDsd.modals.compareDsdsReport.title')}
        withDataLanguageSelector
        width={MODAL_WIDTH_LG}
        footer={
          <div>
            <Button onClick={onDsdsCompareHide}>{t('commons.buttons.close.title')}</Button>
            <Button
              type="primary"
              onClick={() => onDsdsCompareDownload(sourceDsdTriplet, targetDsdTriplet, dsdFile, appLanguage)}
            >
              {t('commons.buttons.download.title')}
            </Button>
          </div>
        }
      >
        {
          compareReport && compareReport.compare === false && (
            <Alert
              type="warning"
              showIcon
              message={t('scenes.dataManager.upgradeDsd.modals.compareDsdsReport.incompatibleDsds.title')}
            />
          )
        }

        <Row type="flex" justify="space-between" style={{marginBottom: MARGIN_MD}}>
          <Col span={10}>
            <Input
              value={compareReport ? compareReport.sourceDsd : ''}
              title={compareReport ? compareReport.sourceDsd : ''}
              disabled
            />
          </Col>
          <Col span={10}>
            <Input
              value={compareReport ? compareReport.targetDsd : ''}
              title={compareReport ? compareReport.targetDsd : ''}
              disabled
            />
          </Col>
        </Row>
        <DsdsCompareReport
          report={compareReport}
          codelistDetail={codelistDetail}
          codelistDetailInstancePrefix={DM_UPGRADE_DSD_CODELIST_DETAIL_PREFIX}
          onCodelistDetailShow={triplet => onCodelistDetailShow(triplet, defaultItemsViewMode)}
          codelistCompareReport={codelistCompareReport}
          fetchCodelistCompareReport={fetchCodelistCompareReport}
          onCodelistCompareReportHide={onCodelistCompareReportHide}
        />
      </EnhancedModal>

      {/*compare and upgrade*/}
      <Call
        cb={onDsdsCompare}
        cbParam={{sourceDsdTriplet, targetDsdTriplet, showModal: false}}
        disabled={!sourceDsdTriplet || !targetDsdTriplet || isUpgradeVisible === false}
      >
        {
          compareReport && isUpgradeVisible === true && (
            compareReport.compare === false
              ? (
                <Call
                  cb={() => Modal.warning({
                    title: t('scenes.dataManager.upgradeDsd.modals.cannotUpgradeDsd.title'),
                    onOk() {
                      onDsdUpgradeHide(false)
                    },
                    onCancel() {
                      onDsdUpgradeHide(false)
                    }
                  })}
                >
                  <span/>
                </Call>
              )
              : (
                <Call cb={onDsdUpgrade} cbParam={compareReport}>
                  <EnhancedModal
                    visible={upgradeReport !== null}
                    onCancel={() => onDsdUpgradeHide(true)}
                    title={t('scenes.dataManager.upgradeDsd.modals.upgradeDsdReport.title')}
                    withDataLanguageSelector
                    footer={
                      <div>
                        <Button onClick={() => onDsdUpgradeHide(true)}>{t('commons.buttons.close.title')}</Button>
                        <Button
                          type="primary"
                          onClick={() => onDsdsCompareDownload(sourceDsdTriplet, targetDsdTriplet, dsdFile, appLanguage)}
                        >
                          {t('commons.buttons.download.title')}
                        </Button>
                      </div>
                    }
                  >
                    <Row type="flex" gutter={GUTTER_MD}>
                      {
                        upgradeReport && upgradeReport.upgrade && upgradeReport.upgrade.length > 0 && (
                          <Col span={getColSpan(upgradeReport)}>
                            <Card
                              type="inner"
                              title={
                                <Row type="flex" gutter={GUTTER_MD} justify="start">
                                  <Col>
                                    <Icon type="check-circle" theme="filled" style={{color: 'green'}}/>
                                  </Col>
                                  <Col>
                                    {t("scenes.dataManager.upgradeDsd.modals.upgradeDsdReport.updated.title")}
                                  </Col>
                                </Row>
                              }
                              bodyStyle={{
                                height: 320,
                                overflow: 'auto'
                              }}
                            >
                              {
                                upgradeReport.upgrade.map(({id, agency, version}, index) =>
                                  <Row key={index}>
                                    {getStringFromArtefactTriplet({id, agencyID: agency, version})}
                                  </Row>
                                )
                              }
                            </Card>
                          </Col>
                        )
                      }
                      {
                        upgradeReport && upgradeReport.reCreated && upgradeReport.reCreated.length > 0 && (
                          <Col span={getColSpan(upgradeReport)}>
                            <Card
                              type="inner"
                              title={
                                <Row type="flex" gutter={GUTTER_MD} justify="start">
                                  <Col>
                                    <Icon type="exclamation-circle" theme="filled" style={{color: 'orange'}}/>
                                  </Col>
                                  <Col>
                                    {t("scenes.dataManager.upgradeDsd.modals.upgradeDsdReport.notUpdated.title")}
                                  </Col>
                                </Row>
                              }
                              bodyStyle={{
                                height: 320,
                                overflow: 'auto'
                              }}
                            >
                              {
                                upgradeReport.reCreated.map(({id, agency, version}, index) =>
                                  <Row key={index}>
                                    {getStringFromArtefactTriplet({id, agencyID: agency, version})}
                                  </Row>
                                )
                              }
                            </Card>
                          </Col>
                        )
                      }
                      {
                        upgradeReport && upgradeReport.notChanged && upgradeReport.notChanged.length > 0 && (
                          <Col span={getColSpan(upgradeReport)}>
                            <Card
                              type="inner"
                              title={
                                <Row type="flex" gutter={GUTTER_MD} justify="start">
                                  <Col>
                                    <Icon type="exclamation-circle" theme="filled" style={{color: 'orange'}}/>
                                  </Col>
                                  <Col>
                                    {t("scenes.dataManager.upgradeDsd.modals.upgradeDsdReport.notChanged.title")}
                                  </Col>
                                </Row>
                              }
                              bodyStyle={{
                                height: 320,
                                overflow: 'auto'
                              }}
                            >
                              {
                                upgradeReport.notChanged.map(({id, agency, version}, index) =>
                                  <Row key={index}>
                                    {getStringFromArtefactTriplet({id, agencyID: agency, version})}
                                  </Row>
                                )
                              }
                            </Card>
                          </Col>
                        )
                      }
                      {
                        upgradeReport && upgradeReport.fail && upgradeReport.fail.length > 0 && (
                          <Col span={getColSpan(upgradeReport)}>
                            <Card
                              type="inner"
                              title={
                                <Row type="flex" gutter={GUTTER_MD} justify="start">
                                  <Col>
                                    <Icon type="close-circle" theme="filled" style={{color: 'red'}}/>
                                  </Col>
                                  <Col>
                                    {t("scenes.dataManager.upgradeDsd.modals.upgradeDsdReport.deleted.title")}
                                  </Col>
                                </Row>
                              }
                              bodyStyle={{
                                height: 320,
                                overflow: 'auto'
                              }}
                            >
                              {
                                upgradeReport.fail.map(({id, agency, version}, index) =>
                                  <Row key={index}>
                                    {getStringFromArtefactTriplet({id, agencyID: agency, version})}
                                  </Row>
                                )
                              }
                            </Card>
                          </Col>
                        )
                      }
                    </Row>
                  </EnhancedModal>
                </Call>
              )
          )
        }
      </Call>

      {/*compare and import*/}
      <Call
        cb={onDsdImportDsdsCompare}
        cbParam={{sourceDsdTriplet, dsdFile, showModal: false}}
        disabled={!sourceDsdTriplet || !dsdFile || isImportEnabled === false}
      >
        {
          compareReport && isImportEnabled === true && (
            compareReport.compare === false
              ? (
                <Call
                  cb={() => Modal.warning({
                    title: t('scenes.dataManager.upgradeDsd.modals.cannotUpgradeDsd.title'),
                    onOk() {
                      onImportDsdImportHide()
                    },
                    onCancel() {
                      onImportDsdImportHide()
                    }
                  })}
                >
                  <span/>
                </Call>
              )
              : (
                <Call
                  cb={onImportDsdFileUpload}
                  cbParam={dsdFile}
                  disabled={!dsdFile || !!importDsdItems || !!importDsdHash}
                >
                  <Call
                    cb={onImportDsdFileSubmit}
                    cbParam={{
                      importDsdItems: importDsdSelectedItems,
                      importDsdHash
                    }}
                    disabled={!importDsdItems || !importDsdHash}
                  >
                    <EnhancedModal
                      visible={importDsdReport !== null}
                      onCancel={onImportDsdImportHide}
                      title={t('scenes.dataManager.upgradeDsd.modals.importDsdReport.title')}
                      footer={<Button onClick={onImportDsdImportHide}>{t('commons.buttons.close.title')}</Button>}
                    >
                      {
                        (importDsdSelectedItems && importDsdSelectedItems.length > 0 && importDsdReport)
                          ? (
                            importDsdReport.map(({maintainableObject, status, result}, index) => {
                              const triplet = getArtefactTripletFromUrn(maintainableObject);
                              return (
                                <Fragment key={index}>
                                  <Row type="flex" justify="space-between"
                                       style={index > 0 ? {marginTop: MARGIN_MD} : null}>
                                    <Col>
                                      {`${importDsdItems.filter(item =>
                                        item.id === triplet.id && item.agency === triplet.agencyID && item.version === triplet.version
                                      )[0].type} [${getStringFromArtefactTriplet(triplet)}]`}
                                    </Col>
                                    <Col>
                                      {status === IMPORT_STRUCTURES_REPORT_STATUS_SUCCESS && (
                                        <Fragment>
                                          {`${t('scenes.utilities.importStructures.reportModal.status.success')} `}
                                          <Icon type="check-circle" theme="filled" style={{color: 'green'}}/>
                                        </Fragment>
                                      )}
                                      {status === IMPORT_STRUCTURES_REPORT_STATUS_WARNING && (
                                        <Fragment>
                                          {`${t('scenes.utilities.importStructures.reportModal.status.warning')} `}
                                          <Icon type="exclamation-circle" theme="filled" style={{color: 'orange'}}/>
                                        </Fragment>
                                      )}
                                      {status === IMPORT_STRUCTURES_REPORT_STATUS_ERROR && (
                                        <Fragment>
                                          {`${t('scenes.utilities.importStructures.reportModal.status.error')} `}
                                          <Icon type="close-circle" theme="filled" style={{color: 'red'}}/>
                                        </Fragment>
                                      )}
                                      {status === IMPORT_STRUCTURES_REPORT_STATUS_FAILURE && (
                                        <Fragment>
                                          {`${t('scenes.utilities.importStructures.reportModal.status.error')} `}
                                          <Icon type="close-circle" theme="filled" style={{color: 'red'}}/>
                                        </Fragment>
                                      )}
                                    </Col>
                                  </Row>
                                  {status !== IMPORT_STRUCTURES_REPORT_STATUS_SUCCESS && (
                                    <i>{result}</i>
                                  )}
                                </Fragment>
                              );
                            })
                          )
                          :
                          <span>{t("scenes.dataManager.upgradeDsd.modals.importDsdReport.nothingImported.placeholder")}</span>
                      }
                    </EnhancedModal>
                  </Call>
                </Call>
              )
          )
        }
      </Call>

    </Fragment>
  )
};

export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps)
)(UpgradedDsdsList);