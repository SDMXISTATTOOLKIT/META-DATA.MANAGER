import React, {Fragment} from 'react';
import Call from "../../../hocs/call";
import {compose} from "redux";
import {translate} from "react-i18next";
import {connect} from "react-redux";
import {Button, Col, message, Modal, Row} from "antd";
import {getArtefactTripletFromUrn, getStringFromArtefactTriplet} from "../../../utils/sdmxJson";
import {
  changeDcatMetadataSet,
  createDcatMetadataSet,
  createDcatReport,
  deleteDcatMetadataSet,
  deleteDcatReport,
  downloadDcatReport,
  hideDcatMetadataflows,
  hideDcatMetadataSet,
  hideDcatMetadataSetHtmlPage,
  hideDcatMetadataSetReports,
  hideDcatReport,
  hideDcatReportHtmlPage,
  readDcatConceptSchemes,
  readDcatMetadataflows,
  readDcatMetadataSet,
  readDcatMetadataSetReports,
  readDcatMetadataSets,
  setDcatMetadataflow,
  setDcatReportStep,
  showDcatMetadataflows,
  showDcatMetadataSet,
  showDcatMetadataSetHtmlPage,
  showDcatMetadataSetReports,
  showDcatReport,
  showDcatReportHtmlPage,
  submitDcatMetadataSet,
  submitDcatReport,
  submitDcatUpdateReportState,
  unsetDcatMetadataflow
} from "./actions";
import {PATH_NODES_CONFIGURATION} from "../../../constants/paths";
import {
  GUTTER_SM,
  MODAL_HEIGHT_MD,
  MODAL_WIDTH_LG,
  TABLE_COL_MIN_WIDTH_ID,
  TABLE_COL_MIN_WIDTH_NAME
} from "../../../styles/constants";
import InfiniteScrollTable from "../../../components/infinite-scroll-table";
import EnhancedModal from "../../../components/enhanced-modal";
import {
  getDbIdAnnotationFromAnnotations,
  getDcatMetadataSetCategoryHtmlPageUrl,
  getMetadataApiDcatMetadataSetUrl,
  getMetadataflowTripletFromAnnotations,
  METADATA_SET_ID_ANNOTATION_ID
} from "../../../utils/referenceMetadata";
import {
  BUTTON_API_LINK,
  BUTTON_DELETE,
  BUTTON_DETAIL,
  BUTTON_INFO_PAGE,
  BUTTON_INFO_PAGE_LINK,
  BUTTON_REPORTS
} from "../../../styles/buttons";
import copy from "copy-to-clipboard";
import MetadataSetDetail, {
  isMetadataSetIdWarningVisible,
  METADATA_SET_DETAIL_MODE_CREATE,
  METADATA_SET_DETAIL_MODE_EDIT,
  METADATA_SET_DETAIL_MODE_READ
} from "../commons/MetadataSetDetail";
import {isDateValid, isDictionaryValid} from "../../../utils/artefactValidators";
import ReportList from "../commons/ReportList";
import ReportDetailWrapper from "./ReportDetailWrapper";

const mapStateToProps = state => ({
  nodeId: state.app.endpointId,
  nodes: state.config.nodes,
  appLang: state.app.language,
  dataLangs: state.config.dataManagement.dataLanguages,
  permissions: state.app.user.permissions,
  conceptSchemeTriplets: state.scenes.referenceMetadata.dcat.conceptSchemeTriplets,
  metadataSetId: state.scenes.referenceMetadata.dcat.metadataSetId,
  isMetadataSetVisible: state.scenes.referenceMetadata.dcat.isMetadataSetVisible,
  metadataSet: state.scenes.referenceMetadata.dcat.metadataSet,
  metadataSets: state.scenes.referenceMetadata.dcat.metadataSets,
  metadataSetHtmlPageUrl: state.scenes.referenceMetadata.dcat.metadataSetHtmlPageUrl,
  isReportsVisible: state.scenes.referenceMetadata.dcat.isReportsVisible,
  reports: state.scenes.referenceMetadata.dcat.reports,
  isReportVisible: state.scenes.referenceMetadata.dcat.isReportVisible,
  report: state.scenes.referenceMetadata.dcat.report,
  reportAnnotations: state.scenes.referenceMetadata.dcat.reportAnnotations,
  reportStructure: state.scenes.referenceMetadata.dcat.reportStructure,
  step: state.scenes.referenceMetadata.dcat.step,
  id: state.scenes.referenceMetadata.dcat.id,
  target: state.scenes.referenceMetadata.dcat.target,
  identifiableTargets: state.scenes.referenceMetadata.dcat.identifiableTargets,
  reportHtmlPageUrl: state.scenes.referenceMetadata.dcat.reportHtmlPageUrl,
  isMetadataflowsVisible: state.scenes.referenceMetadata.dcat.isMetadataflowsVisible,
  metadataflows: state.scenes.referenceMetadata.dcat.metadataflows,
  selectedAttribute: state.scenes.referenceMetadata.dcat.selectedAttribute
});

const mapDispatchToProps = dispatch => ({
  fetchMetadataSets: ({msdTriplet, ownedMetadataflows}) => dispatch(readDcatMetadataSets(msdTriplet, ownedMetadataflows)),
  onMetadataSetShow: metadataSetId => dispatch(showDcatMetadataSet(metadataSetId)),
  onMetadataSetHide: () => dispatch(hideDcatMetadataSet()),
  fetchMetadataSet: (metadataSetId) => dispatch(readDcatMetadataSet(metadataSetId)),
  onMetadataSetCreate: () => dispatch(createDcatMetadataSet()),
  onMetadataSetChange: fields => dispatch(changeDcatMetadataSet(fields)),
  onMetadataSetSubmit: metadataSet => dispatch(submitDcatMetadataSet(metadataSet)),
  onMetadataSetDelete: metadataSet => dispatch(deleteDcatMetadataSet(metadataSet)),
  onReportsShow: metadataSetId => dispatch(showDcatMetadataSetReports(metadataSetId)),
  onReportsHide: () => dispatch(hideDcatMetadataSetReports()),
  fetchReports: ({metadataSetId, ownedDataflows, ownedMetadataflows}) =>
    dispatch(readDcatMetadataSetReports(metadataSetId, ownedDataflows, ownedMetadataflows)),
  fetchConceptSchemes: ({conceptSchemeTriplets, appLang, dataLangs}) =>
    dispatch(readDcatConceptSchemes(conceptSchemeTriplets, appLang, dataLangs)),
  onMetadataflowsShow: () => dispatch(showDcatMetadataflows()),
  onMetadataflowsHide: () => dispatch(hideDcatMetadataflows()),
  fetchMetadataflows: (ownedMetadataflows, msdUrn) => dispatch(readDcatMetadataflows(ownedMetadataflows, msdUrn)),
  onMetadataflowSet: (triplet, msdUrn) => dispatch(setDcatMetadataflow(triplet, msdUrn)),
  onMetadataflowUnset: () => dispatch(unsetDcatMetadataflow()),
  onMetadataSetHtmlPageShow: htmlPageUrl => dispatch(showDcatMetadataSetHtmlPage(htmlPageUrl)),
  onMetadataSetHtmlPageHide: () => dispatch(hideDcatMetadataSetHtmlPage()),
  onReportCreate: () => dispatch(createDcatReport()),
  onReportDelete: reportId => dispatch(deleteDcatReport(reportId)),
  onReportShow: report => dispatch(showDcatReport(report)),
  onReportHide: () => dispatch(hideDcatReport()),
  onReportSubmit: (metadataSet, report, reportAnnotations, reportStructure, id, target, identifiableTargets, annotationsConfig, isDraft) =>
    dispatch(submitDcatReport(metadataSet, report, reportAnnotations, reportStructure, id, target, identifiableTargets, annotationsConfig, isDraft)),
  onStepSet: (step, t, mawsUrl) => dispatch(setDcatReportStep(step, t, mawsUrl)),
  onReportStateSubmit: (metadataSetId, reportId, newState) =>
    dispatch(submitDcatUpdateReportState(metadataSetId, reportId, newState)),
  onReportHtmlPageShow: htmlPageUrl => dispatch(showDcatReportHtmlPage(htmlPageUrl)),
  onReportHtmlPageHide: () => dispatch(hideDcatReportHtmlPage()),
  onReportDownload: (metadataSetId, reportId, fileName, metadataApiBaseUrl) => dispatch(downloadDcatReport(metadataSetId, reportId, fileName, metadataApiBaseUrl)),
});

const DCAT = ({
                t,
                nodes,
                nodeId,
                appLang,
                dataLangs,
                permissions,
                metadataSets,
                metadataSetId,
                isMetadataSetVisible,
                metadataSet,
                conceptSchemeTriplets,
                isMetadataflowsVisible,
                metadataflows,
                metadataSetHtmlPageUrl,
                reportHtmlPageUrl,
                isReportsVisible,
                reports,
                isReportVisible,
                step,
                report,
                reportAnnotations,
                reportStructure,
                id,
                target,
                identifiableTargets,
                selectedAttribute,
                fetchMetadataSets,
                onMetadataSetShow,
                onMetadataSetHide,
                fetchMetadataSet,
                onMetadataSetCreate,
                onMetadataSetChange,
                onMetadataSetSubmit,
                onMetadataSetDelete,
                fetchConceptSchemes,
                onReportsShow,
                onReportsHide,
                fetchReports,
                onMetadataflowsShow,
                onMetadataflowsHide,
                fetchMetadataflows,
                onMetadataflowSet,
                onMetadataflowUnset,
                onMetadataSetHtmlPageShow,
                onMetadataSetHtmlPageHide,
                onReportCreate,
                onReportDelete,
                onReportShow,
                onReportHide,
                onReportSubmit,
                onStepSet,
                onReportStateSubmit,
                onReportHtmlPageShow,
                onReportHtmlPageHide,
                onReportDownload
              }) => {

  const connectedNode = nodes.find(node => node.general.id === nodeId);
  const metadataApiBaseUrl = connectedNode.endpoint.metadataBaseURL;
  const msdUrn = connectedNode.dcatapit.msd;
  const msdTriplet = msdUrn
    ? getArtefactTripletFromUrn(connectedNode.dcatapit.msd)
    : null;

  const metadataflowTriplet = metadataSet
    ? getMetadataflowTripletFromAnnotations(metadataSet)
    : null;
  const hasMetadataflowPermission = permissions && metadataflowTriplet &&
    permissions.metadataflowOwner.includes(getStringFromArtefactTriplet(metadataflowTriplet));

  const ownedDataflows = (permissions && permissions.dataflowOwner) ? permissions.dataflowOwner : [];
  const ownedMetadataflows = (permissions && permissions.metadataflowOwner) ? permissions.metadataflowOwner : [];

  return msdTriplet
    ? (
      <Fragment>
        <Call
          cb={fetchMetadataSets}
          cbParam={{msdTriplet, ownedMetadataflows}}
          disabled={metadataSets !== null}
        >
          <Call
            cb={fetchConceptSchemes}
            cbParam={{conceptSchemeTriplets, appLang, dataLangs}}
            disabled={conceptSchemeTriplets === null}
          >
            <InfiniteScrollTable
              data={metadataSets}
              getRowKey={({id}) => id}
              columns={[
                {
                  title: t('data.artefact.id.shortLabel'),
                  dataIndex: 'id',
                  minWidth: TABLE_COL_MIN_WIDTH_ID
                },
                {
                  title: t('data.artefact.name.shortLabel'),
                  dataIndex: 'name',
                  minWidth: TABLE_COL_MIN_WIDTH_NAME
                },
                {
                  title: t('scenes.referenceMetadata.dcat.metadataSetList.columns.mdfId.shortLabel'),
                  dataIndex: 'mdfId',
                  minWidth: TABLE_COL_MIN_WIDTH_ID
                },
                {
                  title: t('scenes.referenceMetadata.dcat.metadataSetList.columns.mdfAgency.shortLabel'),
                  dataIndex: 'mdfAgency',
                  widthToContent: true,
                  withValuesFilter: true
                },
                {
                  title: t('scenes.referenceMetadata.dcat.metadataSetList.columns.mdfVersion.shortLabel'),
                  dataIndex: 'mdfVersion',
                  widthToContent: true,
                  withValuesFilter: true
                }
              ]}
              multilangStrDataIndexes={["name"]}
              actions={[
                ({hasPermission: dfPerm}) => ({
                  ...BUTTON_DETAIL,
                  title: dfPerm === false
                    ? t("commons.actions.detailReadOnly.title")
                    : t("commons.actions.detail.title"),
                  onClick: ({id}) => onMetadataSetShow(id)
                }),
                () => ({
                  ...BUTTON_REPORTS,
                  title: t('scenes.referenceMetadata.dcat.metadataSetList.actions.showReportList.title'),
                  onClick: ({id}) => onReportsShow(id)
                }),
                () => ({
                  ...BUTTON_INFO_PAGE,
                  title: t('scenes.referenceMetadata.dcat.metadataSetList.actions.navigateCategoryHtmlPage.title'),
                  onClick: ({id}) => onMetadataSetHtmlPageShow(getDcatMetadataSetCategoryHtmlPageUrl(nodeId, id, appLang))
                }),
                () => ({
                  ...BUTTON_INFO_PAGE_LINK,
                  title: t('scenes.referenceMetadata.dcat.metadataSetList.actions.copyCategoryHtmlPageUrl.title'),
                  onClick: ({id}) => {
                    copy(getDcatMetadataSetCategoryHtmlPageUrl(nodeId, id, appLang));
                    return message.info(t("scenes.referenceMetadata.dcat.metadataSetList.actions.copyCategoryHtmlPageUrl.message"))
                  }
                }),
                () => ({
                  ...BUTTON_API_LINK,
                  title: t('scenes.referenceMetadata.dcat.metadataSetList.actions.copyCkanUrl.title'),
                  onClick: ({id}) => {
                    copy(getMetadataApiDcatMetadataSetUrl(metadataApiBaseUrl, id, appLang));
                    return message.info(t("scenes.referenceMetadata.dcat.metadataSetList.actions.copyCkanUrl.message"))
                  },
                  disabled: !metadataApiBaseUrl
                }),
                ({hasPermission: mdfPerm}) => ({
                  ...BUTTON_DELETE,
                  title: t("commons.actions.delete.title"),
                  onClick: ({id}) => Modal.confirm({
                    title: t('scenes.referenceMetadata.dcat.metadataSetList.actions.delete.title'),
                    onOk() {
                      onMetadataSetDelete(id)
                    },
                    cancelText: t('commons.buttons.cancel.title')
                  }),
                  disabled: !mdfPerm
                })
              ]}
              rightActions={
                <Button
                  type="primary"
                  icon="plus"
                  onClick={onMetadataSetCreate}
                >
                  {t('scenes.referenceMetadata.dcat.metadataSetList.actions.create.title')}
                </Button>
              }
            />
          </Call>
        </Call>
        <EnhancedModal
          visible={isMetadataSetVisible}
          onCancel={onMetadataSetHide}
          title={t('scenes.referenceMetadata.dcat.modals.metadataSetDetail.title')}
          width={MODAL_WIDTH_LG}
          withDataLanguageSelector
          footer={
            <Row type="flex" justify="end" gutter={GUTTER_SM}>
              <Col>
                <Button onClick={onMetadataSetHide}>{t('commons.buttons.close.title')}</Button>
              </Col>
              {
                (!(metadataSet && !!getDbIdAnnotationFromAnnotations(metadataSet, METADATA_SET_ID_ANNOTATION_ID)) ||
                  hasMetadataflowPermission) && (
                  <Col>
                    <Button
                      onClick={() => onMetadataSetSubmit(metadataSet)}
                      type="primary"
                      disabled={
                        !metadataSet ||
                        !metadataSet.id || metadataSet.id.length === 0 ||
                        isMetadataSetIdWarningVisible(metadataSet, metadataSets) ||
                        !isDictionaryValid(metadataSet.name) ||
                        !metadataSet.metadataflowTriplet ||
                        !metadataSet.structureRef ||
                        (metadataSet.reportingBegin !== null && metadataSet.reportingEnd !== null && !isDateValid(metadataSet.reportingBegin, metadataSet.reportingEnd)) ||
                        (metadataSet.validFrom !== null && metadataSet.validTo !== null && !isDateValid(metadataSet.validFrom, metadataSet.validTo))
                      }
                    >
                      {t("commons.buttons.save.title")}
                    </Button>
                  </Col>
                )
              }
            </Row>
          }
        >
          <Call
            cb={fetchMetadataSet}
            cbParam={metadataSetId}
            disabled={!metadataSetId || !msdTriplet || metadataSet !== null}
          >
            <MetadataSetDetail
              isDcat={true}
              mode={(metadataSet && getDbIdAnnotationFromAnnotations(metadataSet, METADATA_SET_ID_ANNOTATION_ID) !== undefined)
                ? hasMetadataflowPermission
                  ? METADATA_SET_DETAIL_MODE_EDIT
                  : METADATA_SET_DETAIL_MODE_READ
                : METADATA_SET_DETAIL_MODE_CREATE
              }
              metadataSet={metadataSet}
              metadataSets={metadataSets}
              onMetadataSetChange={onMetadataSetChange}
              isMetadataflowsVisible={isMetadataflowsVisible}
              metadataflows={metadataflows}
              onMetadataflowsShow={onMetadataflowsShow}
              onMetadataflowsHide={onMetadataflowsHide}
              fetchMetadataflows={ownedMetadataflows => fetchMetadataflows(ownedMetadataflows, msdUrn)}
              onMetadataflowSet={onMetadataflowSet}
              onMetadataflowUnset={onMetadataflowUnset}
            />
          </Call>
        </EnhancedModal>
        <EnhancedModal
          visible={isReportsVisible}
          onCancel={onReportsHide}
          title={t('scenes.referenceMetadata.dcat.modals.reportList.title')}
          width={MODAL_WIDTH_LG}
          withDataLanguageSelector
          footer={
            <Row type="flex" justify="end" gutter={GUTTER_SM}>
              <Col>
                <Button onClick={onReportsHide}>{t('commons.buttons.close.title')}</Button>
              </Col>
            </Row>
          }
        >
          <Call
            cb={fetchReports}
            cbParam={{metadataSetId, ownedDataflows, ownedMetadataflows}}
            disabled={!metadataSetId || reports !== null}
          >
            <ReportList
              isDcat={true}
              ReportDetailWrapper={ReportDetailWrapper}
              hasPermission={true}
              metadataSet={metadataSet}
              reports={reports ? reports.sort((a, b) => a.target.id.localeCompare(b.target.id)) : null}
              report={report}
              reportAnnotations={reportAnnotations}
              isReportVisible={isReportVisible}
              reportStructure={reportStructure}
              step={step}
              id={id}
              target={target}
              identifiableTargets={identifiableTargets}
              reportHtmlPageUrl={reportHtmlPageUrl}
              selectedAttribute={selectedAttribute}
              onReportCreate={onReportCreate}
              onReportDelete={onReportDelete}
              onReportShow={onReportShow}
              onReportHide={onReportHide}
              onReportSubmit={onReportSubmit}
              onStepSet={onStepSet}
              onReportStateSubmit={onReportStateSubmit}
              onHtmlPageShow={onReportHtmlPageShow}
              onHtmlPageHide={onReportHtmlPageHide}
              onReportDownload={onReportDownload}
            />
          </Call>
        </EnhancedModal>
        <Modal
          visible={metadataSetHtmlPageUrl !== null}
          title={t('scenes.referenceMetadata.commons.modals.htmlPage.title')}
          maskClosable={false}
          onCancel={onMetadataSetHtmlPageHide}
          width={MODAL_WIDTH_LG}
          bodyStyle={{position: "relative", height: MODAL_HEIGHT_MD, padding: 0}}
          footer={<Button onClick={onMetadataSetHtmlPageHide}>{t('commons.buttons.close.title')}</Button>}
        >
          {
            metadataSetHtmlPageUrl && (
              <iframe
                title={"title"}
                src={metadataSetHtmlPageUrl}
                style={{position: "absolute", border: 0, width: "100%", height: "100%"}}
              />
            )
          }
        </Modal>
      </Fragment>
    )
    : (
      <Call
        cb={() => Modal.warning({
          title: t('scenes.referenceMetadata.dcat.noDcatMsd.title'),
          content:
            <Fragment>
              {`${t('scenes.referenceMetadata.dcat.noDcatMsd.content')} `}
              <a
                href={`./#${PATH_NODES_CONFIGURATION}`}
                style={{textDecoration: "underline"}}
              >
                {t('scenes.referenceMetadata.dcat.nodesConfigLink.label')}
              </a>
            </Fragment>
        })}
      >
        <span/>
      </Call>
    )
};

export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps)
)(DCAT);