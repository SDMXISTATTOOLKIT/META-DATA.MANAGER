import React, {Fragment} from 'react';
import {compose} from "redux";
import {translate} from "react-i18next";
import {connect} from "react-redux";
import {Card, Col, Row} from 'antd';
import {GUTTER_MD, MARGIN_MD, SPAN_HALF,} from '../../../styles/constants';
import MetadataSetTree from "./MetadataSetTree";
import MetadataSetDetailWrapper from "./MetadataSetDetailWrapper";
import ReportList from "../commons/ReportList";
import ReportDetailWrapper from "./ReportDetailWrapper";
import {getStringFromArtefactTriplet} from "../../../utils/sdmxJson";
import {
  getDbIdAnnotationFromAnnotations,
  getMetadataflowTripletFromAnnotations,
  METADATA_SET_ID_ANNOTATION_ID,
  REPORT_STATE_PUBLISHED
} from "../../../utils/referenceMetadata";
import {
  createMetadataSetReport,
  deleteMetadataSetReport,
  downloadMetadataSetReport,
  hideMetadataSetReport,
  hideMetadataSetReportHtmlPage,
  setMetadataSetReportStep,
  showMetadataSetReport,
  showMetadataSetReportHtmlPage,
  submitMetadataSetReport,
  submitMetadataSetUpdateReportState
} from "./actions";
import "./style.css"

const mapStateToProps = state => ({
  permissions: state.app.user.permissions,
  metadataSet: state.scenes.referenceMetadata.metadataSet.metadataSet,
  isReportVisible: state.scenes.referenceMetadata.metadataSet.isReportVisible,
  report: state.scenes.referenceMetadata.metadataSet.report,
  reportAnnotations: state.scenes.referenceMetadata.metadataSet.reportAnnotations,
  reportStructure: state.scenes.referenceMetadata.metadataSet.reportStructure,
  step: state.scenes.referenceMetadata.metadataSet.step,
  id: state.scenes.referenceMetadata.metadataSet.id,
  target: state.scenes.referenceMetadata.metadataSet.target,
  identifiableTargets: state.scenes.referenceMetadata.metadataSet.identifiableTargets,
  reportHtmlPageUrl: state.scenes.referenceMetadata.metadataSet.reportHtmlPageUrl,
  selectedAttribute: state.scenes.referenceMetadata.metadataSet.selectedAttribute
});

const mapDispatchToProps = dispatch => ({
  onReportCreate: () => dispatch(createMetadataSetReport()),
  onReportDelete: reportId => dispatch(deleteMetadataSetReport(reportId)),
  onReportShow: report => dispatch(showMetadataSetReport(report)),
  onReportHide: () => dispatch(hideMetadataSetReport()),
  onReportSubmit: (metadataSet, report, reportDbId, reportStructure, id, target, identifiableTargets, annotationsConfig, isDraft) =>
    dispatch(submitMetadataSetReport(metadataSet, report, reportDbId, reportStructure, id, target, identifiableTargets, annotationsConfig, isDraft)),
  onStepSet: (step, t) => dispatch(setMetadataSetReportStep(step, t)),
  onReportStateSubmit: (metadataSetId, reportId, newState) =>
    dispatch(submitMetadataSetUpdateReportState(metadataSetId, reportId, newState)),
  onHtmlPageShow: htmlPageUrl => dispatch(showMetadataSetReportHtmlPage(htmlPageUrl)),
  onHtmlPageHide: () => dispatch(hideMetadataSetReportHtmlPage()),
  onReportDownload: (metadataSetId, reportId, fileName, metadataApiBaseUrl) => dispatch(downloadMetadataSetReport(metadataSetId, reportId, fileName, metadataApiBaseUrl)),
});

const MetadataSet = ({
                       t,
                       permissions,
                       metadataSet,
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
                     }) => {

  const hasPermission = metadataSet && permissions && (
    !getDbIdAnnotationFromAnnotations(metadataSet, METADATA_SET_ID_ANNOTATION_ID) ||
    permissions.metadataflowOwner.includes(getStringFromArtefactTriplet(getMetadataflowTripletFromAnnotations(metadataSet)))
  );

  let reports = metadataSet ? metadataSet.reports : null;

  reports = (reports || [])
    .filter(({isPublished}) => hasPermission ? true : isPublished === REPORT_STATE_PUBLISHED)
    .map(report => ({
      ...report,
      targetId: report.target.id,
      targetReferenceValues: (report.target.referenceValues || []).map(({object}) => object).join(", ")
    }));

  return (
    <Fragment>
      <Row gutter={GUTTER_MD}>
        <Col span={SPAN_HALF}>
          <MetadataSetTree
            hasPermission={hasPermission}
          />
        </Col>
        <Col span={SPAN_HALF}>
          <MetadataSetDetailWrapper
            hasPermission={hasPermission}
          />
        </Col>
      </Row>
      {metadataSet && getDbIdAnnotationFromAnnotations(metadataSet, METADATA_SET_ID_ANNOTATION_ID) && (
        <Card
          title={t('scenes.referenceMetadata.commons.reportList.title')}
          type="inner"
          style={{marginTop: MARGIN_MD}}
        >
          <ReportList
            isDcat={false}
            ReportDetailWrapper={ReportDetailWrapper}
            hasPermission={hasPermission}
            metadataSet={metadataSet}
            reports={reports}
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
            onHtmlPageShow={onHtmlPageShow}
            onHtmlPageHide={onHtmlPageHide}
            onReportDownload={onReportDownload}
          />
        </Card>
      )}
    </Fragment>
  )
};

export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps)
)(MetadataSet);