import React, {Fragment} from 'react';
import {translate} from "react-i18next";
import {connect} from "react-redux";
import {compose} from "redux";
import {Button, Icon, message, Modal} from "antd";
import {MODAL_HEIGHT_MD, MODAL_WIDTH_LG, MODAL_WIDTH_XL} from "../../../styles/constants";
import {
  BUTTON_API_LINK,
  BUTTON_DELETE,
  BUTTON_DETAIL,
  BUTTON_DOWNLOAD,
  BUTTON_INFO_PAGE,
  BUTTON_INFO_PAGE_LINK,
  BUTTON_PUBLISH,
  BUTTON_UNPUBLISH
} from "../../../styles/buttons";
import EnhancedModal from "../../../components/enhanced-modal";
import {getNodes} from "../../../utils/tree";
import copy from "copy-to-clipboard";
import {
  CATALOG_TARGET_ID,
  DATAFLOW_TARGET_ID,
  getDbIdAnnotationFromAnnotations,
  getMetadataApiDcatReportUrl,
  getMetadataApiReportUrl,
  getReportHtmlPageUrl,
  isAttributeValueValid,
  isEmptyAttribute,
  REPORT_ID_ANNOTATION_ID,
  REPORT_STATE_DRAFT,
  REPORT_STATE_NOT_PUBLISHED,
  REPORT_STATE_PUBLISHED
} from "../../../utils/referenceMetadata";
import InfiniteScrollTable from "../../../components/infinite-scroll-table";
import {REPORT_DETAILS_WIZARD_STEP_FIRST, REPORT_DETAILS_WIZARD_STEP_SECOND} from "./constants";
import {getArtefactTripletFromUrn, getStringFromArtefactTriplet} from "../../../utils/sdmxJson";
import {DataLanguageConsumer} from "../../../contexts/DataLanguage";

const $ = window.jQuery;

const mapStateToProps = state => ({
  nodeId: state.app.endpointId,
  nodes: state.config.nodes,
  appLang: state.app.language
});

export const isReportIdWarningVisible = (newId, reports) => !!(reports || []).find(({id}) => id === newId);

const getParsedValue = str => str.includes("urn:sdmx:")
  ? getStringFromArtefactTriplet(getArtefactTripletFromUrn(str))
  : str;

const ReportList = ({
                      t,
                      nodeId,
                      nodes,
                      appLang,
                      isDcat,
                      ReportDetailWrapper,
                      hasPermission,
                      metadataSet,
                      reports,
                      report,
                      reportAnnotations,
                      isReportVisible,
                      reportStructure,
                      step,
                      id,
                      target,
                      identifiableTargets,
                      reportHtmlPageUrl,
                      selectedAttribute,
                      onReportCreate,
                      onReportDelete,
                      onReportShow,
                      onReportHide,
                      onReportSubmit,
                      onStepSet,
                      onReportStateSubmit,
                      onHtmlPageShow,
                      onHtmlPageHide,
                      onReportDownload
                    }) =>

  <DataLanguageConsumer>
    {dataLanguage => {
      const lang = dataLanguage || appLang;

      const connectedNode = nodes.find(node => node.general.id === nodeId);
      const annotationsConfig = connectedNode.annotations;
      const mawsUrl = connectedNode.endpoint.maEndpoint;
      const metadataApiBaseUrl = connectedNode.endpoint.metadataBaseURL;

      const actions = [
        ({hasPermission: dfPerm}) => ({
          ...BUTTON_DETAIL,
          title: dfPerm === false
            ? t("commons.actions.detailReadOnly.title")
            : t("commons.actions.detail.title"),
          onClick: report => onReportShow(report)
        }),
        ({isPublished}) => ({
          ...BUTTON_INFO_PAGE,
          title: t("scenes.referenceMetadata.commons.reportList.actions.navigateHtmlPage.title"),
          onClick: ({id}) => onHtmlPageShow(getReportHtmlPageUrl(nodeId, metadataSet.id, id, lang)),
          disabled: isPublished !== REPORT_STATE_PUBLISHED
        }),
        ({isPublished}) => ({
          ...BUTTON_INFO_PAGE_LINK,
          title: t("scenes.referenceMetadata.commons.reportList.actions.copyHtmlUrl.title"),
          onClick: ({id}) => {
            copy(getReportHtmlPageUrl(nodeId, metadataSet.id, id, lang));
            return (
              message.info(t("scenes.referenceMetadata.commons.reportList.actions.copyHtmlUrl.message"))
            )
          },
          disabled: isPublished !== REPORT_STATE_PUBLISHED
        }),
        ({isPublished}) => ({
          ...BUTTON_API_LINK,
          title: t("scenes.referenceMetadata.commons.reportList.actions.copyCkanUrl.title"),
          onClick: ({id, target}) => {
            copy((metadataSet && isDcat && target.id === DATAFLOW_TARGET_ID)
              ? getMetadataApiDcatReportUrl(metadataApiBaseUrl, metadataSet.id, id, lang)
              : getMetadataApiReportUrl(metadataApiBaseUrl, metadataSet.id, id)
            );
            return (
              message.info(t("scenes.referenceMetadata.commons.reportList.actions.copyCkanUrl.message"))
            )
          },
          disabled: (isPublished !== REPORT_STATE_PUBLISHED || !metadataApiBaseUrl)
        }),
        ({isPublished}) => ({
          ...BUTTON_DOWNLOAD,
          title: t("commons.actions.download.title"),
          onClick: ({id}) => onReportDownload(metadataSet.id, id, `${metadataSet.id}+${id}.json`, metadataApiBaseUrl),
          disabled: ((isPublished !== REPORT_STATE_PUBLISHED && isPublished !== REPORT_STATE_NOT_PUBLISHED) || !metadataApiBaseUrl)
        }),
        ({hasPermission: dfPerm, target}) => ({
          ...BUTTON_DELETE,
          title: t("commons.actions.delete.title"),
          onClick: report => Modal.confirm({
            title: t('scenes.referenceMetadata.commons.reportList.modals.confirms.delete.title'),
            onOk() {
              onReportDelete(getDbIdAnnotationFromAnnotations(report, REPORT_ID_ANNOTATION_ID).text)
            },
            cancelText: t('commons.buttons.cancel.title')
          }),
          disabled: isDcat
            ? (!dfPerm || (target.id === CATALOG_TARGET_ID && reports !== null && reports.length > 1))
            : !hasPermission
        })
      ];

      const filteredReports = (reports || [])
        .filter(({isPublished}) => hasPermission ? true : isPublished === REPORT_STATE_PUBLISHED)
        .map(report => ({
          ...report,
          targetId: report.target.id,
          targetReferenceValues: (report.target.referenceValues || []).map(({object}) => getParsedValue(object)).join(", ")
        }));

      return (
        <Fragment>
          <InfiniteScrollTable
            data={filteredReports}
            getRowKey={({id}) => id}
            columns={[
              {
                title: t('scenes.referenceMetadata.commons.reportList.columns.id.title'),
                dataIndex: 'id',
                minWidth: 100
              },
              {
                title: t('scenes.referenceMetadata.commons.reportList.columns.structure.title'),
                dataIndex: 'targetId',
                minWidth: 100
              },
              {
                title: t('scenes.referenceMetadata.commons.reportList.columns.targetIdentifier.title'),
                dataIndex: 'targetReferenceValues',
                minWidth: isDcat ? 100 : 500
              },
              {
                title: t('data.artefact.isPublished.shortLabel'),
                dataIndex: "isPublished",
                width: 30,
                withValuesFilter: true,
                render: isPublished => isPublished === REPORT_STATE_PUBLISHED
                  ? <Icon type="check"/>
                  : isPublished === REPORT_STATE_DRAFT
                    ? <Icon type="close"/>
                    : null,
                renderText: isPublished => isPublished === REPORT_STATE_PUBLISHED
                  ? t('data.artefact.isPublished.values.published')
                  : isPublished === REPORT_STATE_DRAFT
                    ? t('data.artefact.isPublished.values.draft')
                    : t('data.artefact.isPublished.values.notPublished')
              }
            ]}
            actions={[
              ({hasPermission: dfPerm, isPublished}) => ({
                ...BUTTON_PUBLISH,
                title: t("scenes.referenceMetadata.commons.reportList.actions.publish.title"),
                onClick: ({id}) => Modal.confirm({
                  title: t('scenes.referenceMetadata.commons.reportList.modals.confirms.publish.title'),
                  onOk() {
                    onReportStateSubmit(metadataSet.id, id, REPORT_STATE_PUBLISHED)
                  },
                  cancelText: t('commons.buttons.cancel.title')
                }),
                disabled: isDcat
                  ? (isPublished === REPORT_STATE_DRAFT || !dfPerm)
                  : (isPublished === REPORT_STATE_DRAFT || !hasPermission)
              }),
              ...actions
            ]}
            altActions={[
              ({hasPermission: dfPerm, isPublished}) => ({
                ...BUTTON_UNPUBLISH,
                title: t("scenes.referenceMetadata.commons.reportList.actions.unpublish.title"),
                onClick: ({id}) => Modal.confirm({
                  title: t('scenes.referenceMetadata.commons.reportList.modals.confirms.unpublish.title'),
                  onOk() {
                    onReportStateSubmit(metadataSet.id, id, REPORT_STATE_NOT_PUBLISHED)
                  },
                  cancelText: t('commons.buttons.cancel.title')
                }),
                disabled: isDcat
                  ? (isPublished === REPORT_STATE_DRAFT || !dfPerm)
                  : (isPublished === REPORT_STATE_DRAFT || !hasPermission)

              }),
              ...actions
            ]}
            getIsAltRow={({isPublished}) => isPublished === REPORT_STATE_PUBLISHED}
            rightActions={
              <Button
                type="primary"
                icon="plus"
                onClick={onReportCreate}
                disabled={isDcat ? false : !hasPermission}
              >
                {t('scenes.referenceMetadata.commons.reportList.actions.create.title')}
              </Button>
            }
          />
          <EnhancedModal
            visible={isReportVisible}
            onCancel={onReportHide}
            title={t('scenes.referenceMetadata.commons.reportList.modals.report.title')}
            width={MODAL_WIDTH_XL}
            withDataLanguageSelector
            footer={
              <div>
                <Button onClick={onReportHide}>{t('commons.buttons.close.title')}</Button>
                <Button
                  type="primary"
                  onClick={() => {
                    if (step === REPORT_DETAILS_WIZARD_STEP_FIRST) {
                      onStepSet(REPORT_DETAILS_WIZARD_STEP_SECOND, t, mawsUrl)

                    } else {
                      if (!selectedAttribute || isAttributeValueValid(selectedAttribute)) {
                        const emptyNodes =
                          getNodes(reportStructure, "metadataAttributes", node => isEmptyAttribute(node))
                            .map(({name}) => name);

                        if (emptyNodes && emptyNodes.length > 0) {
                          Modal.confirm({
                            title: t("scenes.referenceMetadata.commons.reportList.modals.warning.emptyAttribute.title"),
                            content: (
                              <Fragment>
                                {t("scenes.referenceMetadata.commons.reportList.modals.warning.emptyAttribute.content")}:
                                {emptyNodes.map((node, index) =>
                                  <div key={index}>
                                    - {node}
                                  </div>
                                )}
                              </Fragment>
                            ),
                            onOk() {
                              onReportSubmit(metadataSet, report, reportAnnotations, reportStructure, id, target, identifiableTargets, annotationsConfig, true)
                            },
                            okText: t("scenes.referenceMetadata.commons.reportList.modals.warning.emptyAttribute.saveDraft.title")
                          })

                        } else {
                          onReportSubmit(metadataSet, report, reportAnnotations, reportStructure, id, target, identifiableTargets, annotationsConfig, false)
                        }

                      } else if (selectedAttribute && !isAttributeValueValid(selectedAttribute)) {
                        $(".report-structure-tree__waring").css({color: "#FF0000"});
                      }
                    }
                  }}
                  disabled={step === REPORT_DETAILS_WIZARD_STEP_FIRST
                    ? (
                      id === null ||
                      id.length === 0 ||
                      (report === null && isReportIdWarningVisible(id, reports)) ||
                      target === null || identifiableTargets.find(el => !el.value || el.value.length === 0)
                    )
                    : report && report.isPublished === REPORT_STATE_PUBLISHED
                      ? true
                      : isDcat
                        ? report && !report.hasPermission
                        : false
                  }
                >
                  {
                    step === REPORT_DETAILS_WIZARD_STEP_FIRST
                      ? t('commons.buttons.goForward.title')
                      : t('commons.buttons.save.title')
                  }
                </Button>
              </div>
            }
          >
            <ReportDetailWrapper
              hasPermission={hasPermission}
            />
          </EnhancedModal>
          <Modal
            visible={reportHtmlPageUrl !== null}
            title={t('scenes.referenceMetadata.commons.modals.htmlPage.title')}
            maskClosable={false}
            onCancel={onHtmlPageHide}
            width={MODAL_WIDTH_LG}
            bodyStyle={{position: "relative", height: MODAL_HEIGHT_MD, padding: 0}}
            footer={<Button onClick={onHtmlPageHide}>{t('commons.buttons.close.title')}</Button>}
          >
            {
              reportHtmlPageUrl && (
                <iframe
                  title={"title"}
                  src={reportHtmlPageUrl}
                  style={{position: "absolute", border: 0, width: "100%", height: "100%"}}
                />
              )
            }
          </Modal>
        </Fragment>
      )
    }}
  </DataLanguageConsumer>

export default compose(
  translate(),
  connect(mapStateToProps)
)(ReportList);
