import React, {Fragment} from 'react';
import {translate} from "react-i18next";
import {connect} from "react-redux";
import {compose} from "redux";
import {Alert, Button, Col, Divider, Form, Input, Row, Select, Steps} from "antd";
import ReportStructureTree from "../../../components/report-structure-tree";
import {ARTEFACT_TYPES, REPORT_DETAILS_WIZARD_STEP_FIRST, REPORT_DETAILS_WIZARD_STEP_SECOND} from "./constants";
import {
  MARGIN_MD,
  MARGIN_SM,
  MODAL_WIDTH_LG,
  SPAN_ONE_THIRD,
  SPAN_THREE_QUARTERS,
  SPAN_TWO_THIRDS
} from "../../../styles/constants";
import Call from "../../../hocs/call";
import EnhancedModal from "../../../components/enhanced-modal";
import {
  getArtefactTripletFromUrn,
  getStringFromArtefactTriplet,
  getUrnFromArtefactTriplet,
  SDMX_JSON_METADATAFLOW_URN_NAMESPACE
} from "../../../utils/sdmxJson";
import Selector from "../../../components/selector";
import ArtefactList from "../../../components/artefact-list";
import ItemList from "../../../components/item-list";
import {isReportIdWarningVisible} from "./ReportList";
import {isArtefactValid} from "../../../utils/artefactValidators";
import ArtefactForm, {ARTEFACT_FORM_MODE_EDIT, ARTEFACT_FORM_MODE_READ} from "../../../components/artefact-form";
import {getNode} from "../../../utils/tree";
import {
  CATALOG_IDENTIFIER,
  CATALOG_TARGET_ID,
  DATAFLOW_TARGET_ID,
  getMetadataflowTripletFromAnnotations
} from "../../../utils/referenceMetadata";

const mapStateToProps = state => ({
  nodeId: state.app.endpointId,
  nodes: state.config.nodes,
  permissions: state.app.user.permissions,
  dataLanguages: state.config.dataManagement.dataLanguages
});

const formItemLayout = {
  labelCol: {span: SPAN_ONE_THIRD},
  wrapperCol: {span: SPAN_TWO_THIRDS}
};

const ReportDetail = ({
                        t,
                        nodes,
                        nodeId,
                        permissions,
                        dataLanguages,
                        isDcat,
                        hasPermission,
                        isReadOnly,
                        step,
                        metadataSet,
                        msdTree,
                        report,
                        reports,
                        reportStructure,
                        selectedAttribute,
                        id,
                        target,
                        identifiableTargets,
                        selectedIdentifiableTarget,
                        artefacts,
                        dataflow,
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
                        fetchDataflow,
                        onDataflowChange,
                        onDataflowSubmit,
                        onDataflowHide,
                        onAttachmentUpload,
                        onAttachmentDownload
                      }) => {

  const connectedNode = nodes.find(node => node.general.id === nodeId);
  const mawsUrl = connectedNode.endpoint.maEndpoint;

  const attributeTitle = getNode(reportStructure, "metadataAttributes", ({id}) => id === "DCAT_AP_IT_DATASET_TITLE");
  const dataLangs = dataLanguages.map(({code}) => code);

  return (
    <Fragment>
      <Row type="flex" justify="center">
        <Col span={SPAN_THREE_QUARTERS}>
          <Steps current={step} size="small">
            <Steps.Step
              icon={
                <Button
                  shape="circle"
                  type={step === REPORT_DETAILS_WIZARD_STEP_FIRST ? 'primary' : null}
                  onClick={() => onStepSet(REPORT_DETAILS_WIZARD_STEP_FIRST, t, mawsUrl)}
                  size="small"
                >
                  1
                </Button>
              }
              title={
                <div
                  style={{cursor: 'pointer'}}
                  onClick={() => onStepSet(REPORT_DETAILS_WIZARD_STEP_FIRST, t, mawsUrl)}
                >
                  {t("scenes.referenceMetadata.commons.reportDetails.steps.first.label")}
                </div>
              }
            />
            <Steps.Step
              icon={
                <Button
                  shape="circle"
                  size="small"
                  type={step === REPORT_DETAILS_WIZARD_STEP_SECOND ? 'primary' : null}
                  onClick={() => onStepSet(REPORT_DETAILS_WIZARD_STEP_SECOND, t, mawsUrl)}
                  disabled={(
                    id === null ||
                    id.length === 0 ||
                    (report === null && isReportIdWarningVisible(id, reports)) ||
                    target === null || identifiableTargets.find(el => !el.value || el.value.length === 0)
                  )}
                >
                  2
                </Button>
              }
              title={
                <div
                  style={(
                    id === null ||
                    id.length === 0 ||
                    (report === null && isReportIdWarningVisible(id, reports)) ||
                    target === null || identifiableTargets.find(el => !el.value || el.value.length === 0)
                  )
                    ? null
                    : {cursor: 'pointer'}
                  }
                  onClick={() => (
                    id === null ||
                    id.length === 0 ||
                    (report === null && isReportIdWarningVisible(id, reports)) ||
                    target === null || identifiableTargets.find(el => !el.value || el.value.length === 0)
                  )
                    ? null
                    : onStepSet(REPORT_DETAILS_WIZARD_STEP_SECOND, t, mawsUrl)
                  }
                >
                  {t("scenes.referenceMetadata.commons.reportDetails.steps.second.label")}
                </div>
              }
            />
          </Steps>
        </Col>
      </Row>
      <div style={{marginTop: MARGIN_MD}}>
        <Divider/>
        {
          isReadOnly
            ? (
              <Alert
                type="warning"
                showIcon
                message={t('scenes.referenceMetadata.commons.reportDetails.alerts.isReadOnly.label')}
              />
            )
            : (
              isDcat &&
              target === DATAFLOW_TARGET_ID &&
              step === REPORT_DETAILS_WIZARD_STEP_SECOND &&
              (!attributeTitle || !attributeTitle.texts || dataLangs.find(lang => (attributeTitle.texts[lang] || "").length === 0)) && (
                <Alert
                  type="warning"
                  showIcon
                  message={t('scenes.referenceMetadata.commons.reportDetails.alerts.missingDataflowAttribute.label')}
                />
              )
            )
        }
        {
          step === REPORT_DETAILS_WIZARD_STEP_FIRST
            ? (
              <Fragment>
                <Row style={{marginBottom: MARGIN_MD}}>
                  <Form.Item
                    label={t('scenes.referenceMetadata.commons.reportDetails.report.id.label')}
                    className="form-item-required"
                    hasFeedback
                    validateStatus={(report === null && isReportIdWarningVisible(id, reports)) ? "warning" : null}
                    help={(report === null && isReportIdWarningVisible(id, reports))
                      ? t("scenes.referenceMetadata.commons.reportDetails.report.id.alreadyUsed.help")
                      : undefined
                    }
                    {...formItemLayout}
                  >
                    <Input
                      value={id}
                      onChange={e => onIdChange(e.target.value)}
                      disabled={report !== null}
                    />
                  </Form.Item>
                </Row>
                <Row style={{marginBottom: MARGIN_MD}}>
                  <Form.Item
                    label={t('scenes.referenceMetadata.commons.reportDetails.target.id.label')}
                    className="form-item-required"
                    {...formItemLayout}
                  >
                    <Select
                      showSearch
                      filterOption={(inputValue, {props}) =>
                        props.title.toLowerCase().includes(inputValue.toLowerCase())
                      }
                      value={target}
                      onSelect={value => {
                        onTargetSelect(value);
                        isDcat && value === CATALOG_TARGET_ID && onArtefactSet(getUrnFromArtefactTriplet(getMetadataflowTripletFromAnnotations(metadataSet), SDMX_JSON_METADATAFLOW_URN_NAMESPACE), CATALOG_IDENTIFIER);
                      }}
                      disabled={report !== null || !hasPermission || isReadOnly}
                      style={{width: "100%"}}
                    >
                      {msdTree
                        .filter(({target}) => isDcat ?
                          (target !== CATALOG_TARGET_ID || !(reports || []).find(({target}) => target.id === CATALOG_TARGET_ID))
                          : true
                        )
                        .map(({target}) =>
                          <Select.Option key={target} value={target} title={target}>
                            {target}
                          </Select.Option>
                        )}
                    </Select>
                  </Form.Item>
                </Row>
                {identifiableTargets
                  ? (identifiableTargets.map(identifiableTarget =>
                    <Row key={identifiableTarget.id} style={{marginBottom: MARGIN_SM}}>
                      <Form.Item
                        label={identifiableTarget.objectType}
                        className="form-item-required"
                        {...formItemLayout}
                      >
                        {isDcat && target === CATALOG_TARGET_ID
                          ? (
                            <Input
                              value={getStringFromArtefactTriplet(getMetadataflowTripletFromAnnotations(metadataSet))}
                              disabled
                            />
                          )
                          : ARTEFACT_TYPES.map(({type}) => type).includes(identifiableTarget.objectType.toLowerCase())
                            ? (
                              <Selector
                                value={identifiableTarget.value ? getStringFromArtefactTriplet(getArtefactTripletFromUrn(identifiableTarget.value)) : null}
                                selectTitle={t('scenes.referenceMetadata.commons.reportDetails.selector.select.title')}
                                resetTitle={t('scenes.referenceMetadata.commons.reportDetails.selector.reset.title')}
                                detailTitle={t('scenes.referenceMetadata.commons.reportDetails.selector.detail.title')}
                                onSelect={() => onArtefactsShow(identifiableTarget)}
                                onReset={() => onArtefactUnset(identifiableTarget)}
                                onDetail={(isDcat && identifiableTarget.objectType === "Dataflow")
                                  ? () => fetchDataflow(getArtefactTripletFromUrn(identifiableTarget.value))
                                  : null
                                }
                                disabled={!hasPermission || isReadOnly}
                              />
                            )
                            : (
                              <Input
                                value={identifiableTarget.value}
                                onChange={e => onArtefactSet(e.target.value, identifiableTarget.id)}
                                disabled={!hasPermission || isReadOnly}
                              />
                            )
                        }
                      </Form.Item>
                    </Row>
                  ))
                  : null
                }
              </Fragment>
            )
            : (
              <ReportStructureTree
                reportStructure={reportStructure}
                selectedAttribute={selectedAttribute}
                disabled={!hasPermission || isReadOnly}
                onAttributeSelect={onAttributeSelect}
                onAttributeChange={onAttributeChange}
                onAttributeCreate={onAttributeCreate}
                onAttributeDelete={onAttributeDelete}
                onCodesShow={onCodesShow}
                onCodeUnset={onCodeUnset}
                isDcatReport={isDcat}
                onFileUpload={onAttachmentUpload}
                onFileDownload={onAttachmentDownload}
              />
            )
        }
      </div>
      <EnhancedModal
        visible={isCodesVisible}
        onCancel={onCodesHide}
        title={t('scenes.referenceMetadata.commons.reportDetails.modals.codeList.title')}
        width={MODAL_WIDTH_LG}
        footer={<Button onClick={onCodesHide}>{t('commons.buttons.close.title')}</Button>}
      >
        <Call
          cb={fetchCodes}
          cbParam={
            (selectedAttribute && selectedAttribute.localRepresentation && selectedAttribute.localRepresentation.enumeration)
              ? getArtefactTripletFromUrn(selectedAttribute.localRepresentation.enumeration)
              : null
          }
          disabled={selectedAttribute === null || selectedAttribute.localRepresentation.enumeration === null}
        >
          <ItemList
            data={codes}
            onRowClick={({id}) => onCodeSet(id)}
            hideOrderCol
          />
        </Call>
      </EnhancedModal>
      <EnhancedModal
        visible={dataflow !== null && dataflow !== undefined}
        onCancel={onDataflowHide}
        title={t('scenes.referenceMetadata.commons.reportDetails.modals.dataflowDetail.title')}
        width={MODAL_WIDTH_LG}
        withDataLanguageSelector
        footer={
          <Fragment>
            <Button onClick={onDataflowHide}>{t('commons.buttons.close.title')}</Button>
            <Button
              type="primary"
              onClick={() => onDataflowSubmit(dataflow)}
              disabled={dataflow && !isArtefactValid(dataflow)}
            >
              {t('commons.buttons.save.title')}
            </Button>
          </Fragment>
        }
      >
        <ArtefactForm
          artefact={dataflow}
          mode={(hasPermission && !isReadOnly)
            ? ARTEFACT_FORM_MODE_EDIT
            : ARTEFACT_FORM_MODE_READ
          }
          onChange={onDataflowChange}
        />
      </EnhancedModal>
      <EnhancedModal
        visible={selectedIdentifiableTarget !== null}
        onCancel={onArtefactsHide}
        title={t('scenes.referenceMetadata.commons.reportDetails.modals.artefactList.title')}
        width={MODAL_WIDTH_LG}
        footer={<Button onClick={onArtefactsHide}>{t('commons.buttons.close.title')}</Button>}
      >
        <Call
          cb={fetchArtefacts}
          cbParam={{
            identifiableTarget: selectedIdentifiableTarget,
            ownedDataflows: (permissions && permissions.dataflowOwner) ? permissions.dataflowOwner : []
          }}
          disabled={selectedIdentifiableTarget === null}
        >
          <ArtefactList
            artefacts={artefacts}
            onRowClick={({id, agencyID, version}) => onArtefactSet({id, agencyID, version})}
          />
        </Call>
      </EnhancedModal>
    </Fragment>
  )
}

export default compose(
  translate(),
  connect(mapStateToProps)
)(ReportDetail);
