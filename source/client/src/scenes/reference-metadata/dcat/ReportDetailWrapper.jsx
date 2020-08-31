import React from 'react';
import {connect} from "react-redux";
import {
  changeDcatDataflow,
  changeDcatReportAttribute,
  changeDcatReportId,
  createDcatReportAttribute,
  deleteDcatReportAttribute,
  downloadDcatReportAttributeAttachment,
  hideDcatDataflow,
  hideDcatReportAttributeCodes,
  hideDcatReportTargetArtefacts,
  readDcatDataflow,
  readDcatReportAttributeCodes,
  readDcatReportTargetArtefacts,
  selectDcatReportAttribute,
  selectDcatReportTarget,
  setDcatReportAttributeCode,
  setDcatReportStep,
  setDcatReportTargetArtefact,
  showDcatReportAttributeCodes,
  showDcatReportTargetArtefacts,
  submitDcatDataflow,
  unsetDcatReportAttributeCode,
  unsetDcatReportTargetArtefact,
  uploadDcatReportAttributeAttachment
} from "./actions";
import ReportDetail from "../commons/ReportDetail";
import {REPORT_STATE_PUBLISHED} from "../../../utils/referenceMetadata";

const mapStateToProps = state => ({
  metadataSet: state.scenes.referenceMetadata.dcat.metadataSet,
  msdTree: state.scenes.referenceMetadata.dcat.msdTree,
  id: state.scenes.referenceMetadata.dcat.id,
  target: state.scenes.referenceMetadata.dcat.target,
  identifiableTargets: state.scenes.referenceMetadata.dcat.identifiableTargets,
  selectedIdentifiableTarget: state.scenes.referenceMetadata.dcat.selectedIdentifiableTarget,
  report: state.scenes.referenceMetadata.dcat.report,
  reports: state.scenes.referenceMetadata.dcat.reports,
  artefacts: state.scenes.referenceMetadata.dcat.artefacts,
  reportStructure: state.scenes.referenceMetadata.dcat.reportStructure,
  selectedAttribute: state.scenes.referenceMetadata.dcat.selectedAttribute,
  step: state.scenes.referenceMetadata.dcat.step,
  isCodesVisible: state.scenes.referenceMetadata.dcat.isCodesVisible,
  codes: state.scenes.referenceMetadata.dcat.codes,
  dataflow: state.scenes.referenceMetadata.dcat.dataflow
});

const mapDispatchToProps = dispatch => ({
  onAttributeSelect: selectedAttributeKey => dispatch(selectDcatReportAttribute(selectedAttributeKey)),
  onAttributeChange: fields => dispatch(changeDcatReportAttribute(fields)),
  onAttributeCreate: () => dispatch(createDcatReportAttribute()),
  onAttributeDelete: () => dispatch(deleteDcatReportAttribute()),
  onStepSet: (step, t, mawsUrl) => dispatch(setDcatReportStep(step, t, mawsUrl)),
  onCodesShow: () => dispatch(showDcatReportAttributeCodes()),
  onCodesHide: () => dispatch(hideDcatReportAttributeCodes()),
  fetchCodes: triplet => dispatch(readDcatReportAttributeCodes(triplet)),
  onCodeSet: codeId => dispatch(setDcatReportAttributeCode(codeId)),
  onCodeUnset: () => dispatch(unsetDcatReportAttributeCode()),
  onIdChange: id => dispatch(changeDcatReportId(id)),
  onTargetSelect: target => dispatch(selectDcatReportTarget(target)),
  onArtefactsShow: identifiableTarget => dispatch(showDcatReportTargetArtefacts(identifiableTarget)),
  onArtefactsHide: () => dispatch(hideDcatReportTargetArtefacts()),
  fetchArtefacts: ({identifiableTarget, ownedDataflows}) => dispatch(readDcatReportTargetArtefacts(identifiableTarget, ownedDataflows)),
  onArtefactSet: (value, identifiableTargetId) => dispatch(setDcatReportTargetArtefact(value, identifiableTargetId)),
  onArtefactUnset: identifiableTarget => dispatch(unsetDcatReportTargetArtefact(identifiableTarget)),
  fetchDataflow: dataflowTriplet => dispatch(readDcatDataflow(dataflowTriplet)),
  onDataflowChange: fields => dispatch(changeDcatDataflow(fields)),
  onDataflowSubmit: dataflow => dispatch(submitDcatDataflow(dataflow)),
  onDataflowHide: () => dispatch(hideDcatDataflow()),
  onAttachmentUpload: file => dispatch(uploadDcatReportAttributeAttachment(file)),
  onAttachmentDownload: fileName => dispatch(downloadDcatReportAttributeAttachment(fileName))
});

const ReportDetailWrapper = ({
                               metadataSet,
                               msdTree,
                               reports,
                               id,
                               target,
                               identifiableTargets,
                               selectedIdentifiableTarget,
                               report,
                               artefacts,
                               reportStructure,
                               selectedAttribute,
                               step,
                               isCodesVisible,
                               codes,
                               dataflow,
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
                               fetchDataflow,
                               onDataflowChange,
                               onDataflowSubmit,
                               onDataflowHide,
                               onAttachmentUpload,
                               onAttachmentDownload
                             }) =>
  <ReportDetail
    isDcat={true}
    hasPermission={report === null || report.hasPermission}
    isReadOnly={report !== null && report.isPublished === REPORT_STATE_PUBLISHED}
    step={step}
    metadataSet={metadataSet}
    msdTree={msdTree}
    reports={reports}
    report={report}
    reportStructure={reportStructure}
    selectedAttribute={selectedAttribute}
    id={id}
    target={target}
    identifiableTargets={identifiableTargets}
    selectedIdentifiableTarget={selectedIdentifiableTarget}
    artefacts={artefacts}
    dataflow={dataflow}
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
    fetchDataflow={fetchDataflow}
    onDataflowChange={onDataflowChange}
    onDataflowSubmit={onDataflowSubmit}
    onDataflowHide={onDataflowHide}
    onAttachmentUpload={onAttachmentUpload}
    onAttachmentDownload={onAttachmentDownload}
  />;

export default connect(mapStateToProps, mapDispatchToProps)(ReportDetailWrapper);
