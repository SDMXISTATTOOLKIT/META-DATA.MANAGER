import React from 'react';
import {connect} from "react-redux";
import {
  changeMetadataSetReportAttribute,
  changeMetadataSetReportId,
  createMetadataSetReportAttribute,
  deleteMetadataSetReportAttribute,
  downloadMetadataSetReportAttributeAttachment,
  hideMetadataSetReportAttributeCodes,
  hideMetadataSetReportTargetArtefacts,
  readMetadataSetReportAttributeCodes,
  readMetadataSetReportTargetArtefacts,
  selectMetadataSetReportAttribute,
  selectMetadataSetReportTarget,
  setMetadataSetReportAttributeCode,
  setMetadataSetReportStep,
  setMetadataSetReportTargetArtefact,
  showMetadataSetReportAttributeCodes,
  showMetadataSetReportTargetArtefacts,
  unsetMetadataSetReportAttributeCode,
  unsetMetadataSetReportTargetArtefact,
  uploadMetadataSetReportAttributeAttachment
} from "./actions";
import ReportDetail from "../commons/ReportDetail";
import {REPORT_STATE_PUBLISHED} from "../../../utils/referenceMetadata";

const mapStateToProps = state => ({
  metadataSet: state.scenes.referenceMetadata.metadataSet.metadataSet,
  msdTree: state.scenes.referenceMetadata.metadataSet.msdTree,
  report: state.scenes.referenceMetadata.metadataSet.report,
  id: state.scenes.referenceMetadata.metadataSet.id,
  target: state.scenes.referenceMetadata.metadataSet.target,
  identifiableTargets: state.scenes.referenceMetadata.metadataSet.identifiableTargets,
  selectedIdentifiableTarget: state.scenes.referenceMetadata.metadataSet.selectedIdentifiableTarget,
  artefacts: state.scenes.referenceMetadata.metadataSet.artefacts,
  reportStructure: state.scenes.referenceMetadata.metadataSet.reportStructure,
  selectedAttribute: state.scenes.referenceMetadata.metadataSet.selectedAttribute,
  step: state.scenes.referenceMetadata.metadataSet.step,
  isCodesVisible: state.scenes.referenceMetadata.metadataSet.isCodesVisible,
  codes: state.scenes.referenceMetadata.metadataSet.codes
});

const mapDispatchToProps = dispatch => ({
  onAttributeSelect: selectedAttributeKey => dispatch(selectMetadataSetReportAttribute(selectedAttributeKey)),
  onAttributeChange: fields => dispatch(changeMetadataSetReportAttribute(fields)),
  onAttributeCreate: () => dispatch(createMetadataSetReportAttribute()),
  onAttributeDelete: () => dispatch(deleteMetadataSetReportAttribute()),
  onStepSet: (step, t) => dispatch(setMetadataSetReportStep(step, t)),
  onCodesShow: () => dispatch(showMetadataSetReportAttributeCodes()),
  onCodesHide: () => dispatch(hideMetadataSetReportAttributeCodes()),
  fetchCodes: triplet => dispatch(readMetadataSetReportAttributeCodes(triplet)),
  onCodeSet: codeId => dispatch(setMetadataSetReportAttributeCode(codeId)),
  onCodeUnset: () => dispatch(unsetMetadataSetReportAttributeCode()),
  onIdChange: id => dispatch(changeMetadataSetReportId(id)),
  onTargetSelect: target => dispatch(selectMetadataSetReportTarget(target)),
  onArtefactsShow: identifiableTarget => dispatch(showMetadataSetReportTargetArtefacts(identifiableTarget)),
  onArtefactsHide: () => dispatch(hideMetadataSetReportTargetArtefacts()),
  fetchArtefacts: ({identifiableTarget}) => dispatch(readMetadataSetReportTargetArtefacts(identifiableTarget)),
  onArtefactSet: (value, identifiableTargetId) => dispatch(setMetadataSetReportTargetArtefact(value, identifiableTargetId)),
  onArtefactUnset: identifiableTarget => dispatch(unsetMetadataSetReportTargetArtefact(identifiableTarget)),
  onAttachmentUpload: file => dispatch(uploadMetadataSetReportAttributeAttachment(file)),
  onAttachmentDownload: fileName => dispatch(downloadMetadataSetReportAttributeAttachment(fileName))
});

const ReportDetailWrapper = ({
                               hasPermission,
                               metadataSet,
                               msdTree,
                               report,
                               id,
                               target,
                               identifiableTargets,
                               selectedIdentifiableTarget,
                               artefacts,
                               reportStructure,
                               selectedAttribute,
                               step,
                               isCodesVisible,
                               codes,
                               onAttributeSelect,
                               onAttributeChange,
                               onAttributeCreate,
                               onAttributeDelete,
                               onStepSet,
                               onCodesShow,
                               onCodesHide,
                               fetchCodes,
                               onCodeSet,
                               onCodeUnset,
                               onIdChange,
                               onTargetSelect,
                               onArtefactsShow,
                               onArtefactsHide,
                               fetchArtefacts,
                               onArtefactSet,
                               onArtefactUnset,
                               onAttachmentUpload,
                               onAttachmentDownload
                             }) =>
  <ReportDetail
    isDcat={false}
    hasPermission={hasPermission}
    isReadOnly={report !== null && report.isPublished === REPORT_STATE_PUBLISHED}
    step={step}
    metadataSet={metadataSet}
    msdTree={msdTree}
    reports={(metadataSet && metadataSet.reports) ? metadataSet.reports : []}
    report={report}
    reportStructure={reportStructure}
    selectedAttribute={selectedAttribute}
    id={id}
    target={target}
    identifiableTargets={identifiableTargets}
    selectedIdentifiableTarget={selectedIdentifiableTarget}
    artefacts={artefacts}
    isCodesVisible={isCodesVisible}
    codes={codes}
    onAttributeSelect={onAttributeSelect}
    onAttributeChange={onAttributeChange}
    onAttributeCreate={onAttributeCreate}
    onAttributeDelete={onAttributeDelete}
    onStepSet={onStepSet}
    onCodesShow={onCodesShow}
    onCodesHide={onCodesHide}
    fetchCodes={fetchCodes}
    onCodeSet={onCodeSet}
    onCodeUnset={onCodeUnset}
    onIdChange={onIdChange}
    onTargetSelect={onTargetSelect}
    onArtefactsShow={onArtefactsShow}
    onArtefactsHide={onArtefactsHide}
    fetchArtefacts={fetchArtefacts}
    onArtefactSet={onArtefactSet}
    onArtefactUnset={onArtefactUnset}
    onAttachmentUpload={onAttachmentUpload}
    onAttachmentDownload={onAttachmentDownload}
  />;

export default connect(mapStateToProps, mapDispatchToProps)(ReportDetailWrapper);
