import React, {Fragment} from 'react';
import {Button, Col, Divider, Form, Input, Modal, Radio, Row} from "antd";
import {
  GUTTER_MD,
  GUTTER_SM,
  MARGIN_MD,
  MODAL_WIDTH_LG,
  MODAL_WIDTH_MD,
  SPAN_FULL,
  SPAN_ONE_THIRD,
  SPAN_TWO_THIRDS
} from "../../../../styles/constants";
import Call from '../../../../hocs/call';
import {
  changeDataflowBuilderListDataflowTranscodingMode,
  hideDataflowBuilderListDataflowProductionModal,
  hideDataflowBuilderListDataflowTranscodingFromCCList,
  readDataflowBuilderListDataflowTranscodingFromCCList,
  readDataflowBuilderListonDataflowMappingSetId,
  setDataflowBuilderListDataflowContentConstraint,
  setDataflowBuilderListDataflowMappingSet,
  setDataflowBuilderListDataflowProductionFlag,
  setDataflowBuilderListDataflowTranscoding,
  setDataflowBuilderListDataflowTranscodingFromCC,
  setDataflowBuilderListDataflowTranscodingFromCCContentConstraint,
  showDataflowBuilderListDataflowTranscodingFromCCList,
  unsetDataflowBuilderListDataflowContentConstraint,
  unsetDataflowBuilderListDataflowMappingSet,
  unsetDataflowBuilderListDataflowTranscoding,
  unsetDataflowBuilderListDataflowTranscodingFromCCContentConstraint
} from "./actions";
import {compose} from "redux";
import {connect} from "react-redux";
import {translate} from 'react-i18next';
import EnhancedModal from '../../../../components/enhanced-modal';
import {
  DATAFLOW_BUILDER_LIST_DATAFLOW_PRODUCTION_MODAL_MODE_AUTO,
  DATAFLOW_BUILDER_LIST_DATAFLOW_PRODUCTION_MODAL_MODE_CC
} from "./reducer";
import Selector from "../../../../components/selector";
import {getStringFromArtefactTriplet} from "../../../../utils/sdmxJson";
import ArtefactList from "../../../../components/artefact-list";

const labelStyle = {
  fontSize: 14,
  fontWeight: 500,
  color: "rgba(0,0,0,0.85)"
};

const disabledLabelStyle = {
  fontSize: 14,
  fontWeight: 500,
  color: "rgba(0,0,0,0.35)"
};

const mapStateToProps = state => ({
  dataflows: state.scenes.dataManager.dataflowBuilder.shared.dataflows,
  dataflowProductionModalDDBDataflowId: state.scenes.dataManager.dataflowBuilder.components.list.dataflowProductionModalDDBDataflowId,
  dataflowProductionModalDataflowTriplet: state.scenes.dataManager.dataflowBuilder.components.list.dataflowProductionModalDataflowTriplet,
  dataflowProductionModalMappingSetId: state.scenes.dataManager.dataflowBuilder.components.list.dataflowProductionModalMappingSetId,
  dataflowProductionModalTranscodingMode: state.scenes.dataManager.dataflowBuilder.components.list.dataflowProductionModalTranscodingMode,
  dataflowProductionModalTranscodingContentConstraintTriplet: state.scenes.dataManager.dataflowBuilder.components.list.dataflowProductionModalTranscodingContentConstraintTriplet,
  isDataflowProductionModalTranscodingContentConstraintListVisible: state.scenes.dataManager.dataflowBuilder.components.list.isDataflowProductionModalTranscodingContentConstraintListVisible,
  dataflowProductionModalTranscodingContentConstraints: state.scenes.dataManager.dataflowBuilder.components.list.dataflowProductionModalTranscodingContentConstraints
});

const mapDispatchToProps = dispatch => ({
  onMappingSetCreate:
    (ddbDataflowId, defaultValue) => dispatch(setDataflowBuilderListDataflowMappingSet(ddbDataflowId, defaultValue)),
  onMappingSetDelete: ddbDataflowId => dispatch(unsetDataflowBuilderListDataflowMappingSet(ddbDataflowId)),
  onTranscodingModeChange: mode => dispatch(changeDataflowBuilderListDataflowTranscodingMode(mode)),
  onTranscodingFromCCContentConstraintSet: contentConstraintTriplet => dispatch(setDataflowBuilderListDataflowTranscodingFromCCContentConstraint(contentConstraintTriplet)),
  onTranscodingFromCCContentConstraintUnset: () => dispatch(unsetDataflowBuilderListDataflowTranscodingFromCCContentConstraint()),
  onTranscodingCreate: ddbDataflowId => dispatch(setDataflowBuilderListDataflowTranscoding(ddbDataflowId)),
  onTranscodingFromCCCreate: (ddbDataflowId, contentConstraintTriplet) =>
    dispatch(setDataflowBuilderListDataflowTranscodingFromCC(ddbDataflowId, contentConstraintTriplet)),
  onTranscodingFromCCListShow: () => dispatch(showDataflowBuilderListDataflowTranscodingFromCCList()),
  onTranscodingFromCCListHide: () => dispatch(hideDataflowBuilderListDataflowTranscodingFromCCList()),
  onTranscodingDelete: ddbDataflowId => dispatch(unsetDataflowBuilderListDataflowTranscoding(ddbDataflowId)),
  onContentConstraintCreate: ddbDataflowId => dispatch(setDataflowBuilderListDataflowContentConstraint(ddbDataflowId)),
  onContentConstraintDelete:
    ddbDataflowId => dispatch(unsetDataflowBuilderListDataflowContentConstraint(ddbDataflowId)),
  onSetProductionFlag: (ddbDataflowId, isProduction) =>
    dispatch(setDataflowBuilderListDataflowProductionFlag(ddbDataflowId, isProduction)),
  onHide: () => dispatch(hideDataflowBuilderListDataflowProductionModal()),
  fetchDataflowMappingSetId: ddbDataflowId => dispatch(readDataflowBuilderListonDataflowMappingSetId(ddbDataflowId)),
  fetchTranscodingFromCCList: dataflowTriplet => dispatch(readDataflowBuilderListDataflowTranscodingFromCCList(dataflowTriplet))
});

const formItemLayout = {
  labelCol: {span: SPAN_ONE_THIRD},
  wrapperCol: {span: SPAN_TWO_THIRDS}
};

const CreateMappingSetForm = Form.create()(
  ({form, t, modal, onMappingSetCreate}) =>
    <Form>
      <Row style={{marginBottom: MARGIN_MD, marginTop: MARGIN_MD}}>
        <Col span={SPAN_FULL}>
          <Form.Item
            {...formItemLayout}
            label={t("scenes.dataManager.dataflowBuilder.list.actions.productionModal.mappingSet.createButton.confirm.defaultValue.label")}
          >
            {form.getFieldDecorator('defaultValue')(<Input/>)}
          </Form.Item>
        </Col>
      </Row>
      <Row type="flex" style={{marginTop: MARGIN_MD}} justify="end" gutter={GUTTER_MD}>
        <Col>
          <Button onClick={() => modal.destroy()}>
            {t("scenes.dataManager.dataflowBuilder.list.actions.productionModal.mappingSet.createButton.confirm.cancelButton.title")}
          </Button>
        </Col>
        <Col>
          <Button
            type="primary"
            onClick={
              () => {
                modal.destroy();
                onMappingSetCreate(form.getFieldValue('defaultValue'))
              }
            }
          >
            {t("scenes.dataManager.dataflowBuilder.list.actions.productionModal.mappingSet.createButton.confirm.okButton.title")}
          </Button>
        </Col>
      </Row>
    </Form>
);

const DataflowBuilderListDataflowProductionModal = ({
                                                      t,
                                                      dataflows,
                                                      dataflowProductionModalDDBDataflowId,
                                                      dataflowProductionModalDataflowTriplet,
                                                      dataflowProductionModalMappingSetId,
                                                      onMappingSetCreate,
                                                      onMappingSetDelete,
                                                      dataflowProductionModalTranscodingMode,
                                                      dataflowProductionModalTranscodingContentConstraintTriplet,
                                                      isDataflowProductionModalTranscodingContentConstraintListVisible,
                                                      onTranscodingModeChange,
                                                      onTranscodingFromCCListShow,
                                                      onTranscodingFromCCListHide,
                                                      dataflowProductionModalTranscodingContentConstraints,
                                                      onTranscodingFromCCContentConstraintSet,
                                                      onTranscodingFromCCContentConstraintUnset,
                                                      onTranscodingFromCCCreate,
                                                      onTranscodingCreate,
                                                      onTranscodingDelete,
                                                      onContentConstraintCreate,
                                                      onContentConstraintDelete,
                                                      onSetProductionFlag,
                                                      onHide,
                                                      fetchDataflowMappingSetId,
                                                      fetchTranscodingFromCCList
                                                    }) => {
  const dataflowProductionModalDataflow =
    dataflows && dataflowProductionModalDDBDataflowId
      ? dataflows.filter(df => df.IDDataflow === dataflowProductionModalDDBDataflowId)[0]
      : null;
  return (
    <Call
      cb={fetchDataflowMappingSetId}
      cbParam={dataflowProductionModalDataflow !== null ? dataflowProductionModalDataflow.IDDataflow : null}
      disabled={dataflowProductionModalDataflow === null}
    >
      <EnhancedModal
        visible={dataflowProductionModalDDBDataflowId !== null}
        onCancel={onHide}
        footer={
          <Button onClick={onHide}>
            {t("scenes.dataManager.dataflowBuilder.list.actions.productionModal.buttons.close.title")}
          </Button>
        }
        width={MODAL_WIDTH_MD}
        title={t('scenes.dataManager.dataflowBuilder.list.actions.productionModal.title')}
      >
        <Fragment>
          <Row justify="space-between" type="flex" style={{marginBottom: MARGIN_MD}}>
            <Col style={labelStyle}>
              {t("scenes.dataManager.dataflowBuilder.list.actions.productionModal.mappingSet.label")}
            </Col>
            <Col>
              <Row gutter={GUTTER_SM} justify="end" type="flex">
                <Col>
                  <Button
                    disabled={
                      dataflowProductionModalMappingSetId === undefined ||
                      dataflowProductionModalDataflow === null ||
                      dataflowProductionModalMappingSetId !== null
                    }
                    size="small"
                    type="primary"
                    onClick={
                      () => {
                        let modal = Modal.confirm();
                        modal.update({
                          title: t("scenes.dataManager.dataflowBuilder.list.actions.productionModal.mappingSet.createButton.confirm.title"),
                          content:
                            <CreateMappingSetForm
                              t={t}
                              modal={modal}
                              onMappingSetCreate={
                                defaultValue =>
                                  onMappingSetCreate(dataflowProductionModalDataflow.IDDataflow, defaultValue)
                              }
                            />,
                          okButtonProps: {style: {display: 'none'}},
                          cancelButtonProps: {style: {display: 'none'}},
                        })
                      }
                    }>
                    {t("scenes.dataManager.dataflowBuilder.list.actions.productionModal.mappingSet.createButton.title")}
                  </Button>
                </Col>
                <Col>
                  <Button
                    disabled={
                      dataflowProductionModalDataflow === null || dataflowProductionModalMappingSetId === null || dataflowProductionModalMappingSetId === undefined}
                    size="small"
                    type="primary"
                    onClick={
                      () => Modal.confirm({
                        title: t("scenes.dataManager.dataflowBuilder.list.actions.productionModal.mappingSet.deleteButton.confirm.title"),
                        onOk() {
                          onMappingSetDelete(dataflowProductionModalDataflow.IDDataflow);
                        },
                        cancelText: t('commons.buttons.cancel.title')
                      })
                    }
                  >
                    {t("scenes.dataManager.dataflowBuilder.list.actions.productionModal.mappingSet.deleteButton.title")}
                  </Button>
                </Col>
              </Row>
            </Col>
          </Row>
          <Divider/>
          <Row gutter={GUTTER_MD} style={{marginBottom: MARGIN_MD}}>
            <Col style={dataflowProductionModalMappingSetId !== null ? labelStyle : disabledLabelStyle}>
              {t("scenes.dataManager.dataflowBuilder.list.actions.productionModal.transcoding.label")}
            </Col>
          </Row>
          <Row justify="space-between" type="flex">
            <Col>
              <Row gutter={GUTTER_SM} type="flex">
                <Col>
                  <Radio.Group
                    value={dataflowProductionModalTranscodingMode}
                    onChange={({target}) => onTranscodingModeChange(target.value)}
                    size="small"
                    disabled={
                      dataflowProductionModalMappingSetId === null ||
                      dataflowProductionModalMappingSetId === undefined ||
                      (dataflowProductionModalDataflow && dataflowProductionModalDataflow.HasTranscoding)
                    }
                  >
                    <Radio.Button
                      value={DATAFLOW_BUILDER_LIST_DATAFLOW_PRODUCTION_MODAL_MODE_AUTO}
                    >
                      {t("scenes.dataManager.dataflowBuilder.list.actions.productionModal.buttons.transcodingRadio.auto.title")}
                    </Radio.Button>
                    <Radio.Button
                      value={DATAFLOW_BUILDER_LIST_DATAFLOW_PRODUCTION_MODAL_MODE_CC}
                    >
                      {t("scenes.dataManager.dataflowBuilder.list.actions.productionModal.buttons.transcodingRadio.fromContentConstraint.title")}
                    </Radio.Button>
                  </Radio.Group>
                </Col>
                <Col>
                  {dataflowProductionModalTranscodingMode === DATAFLOW_BUILDER_LIST_DATAFLOW_PRODUCTION_MODAL_MODE_CC &&
                  dataflowProductionModalMappingSetId !== null &&
                  dataflowProductionModalMappingSetId !== undefined &&
                  dataflowProductionModalDataflow &&
                  !dataflowProductionModalDataflow.HasTranscoding && (
                    <Fragment>
                      <Selector
                        selectTitle={t("scenes.dataManager.dataflowBuilder.list.actions.productionModal.buttons.transcodingCCSelector.select.title")}
                        resetTitle={t("scenes.dataManager.dataflowBuilder.list.actions.productionModal.buttons.transcodingCCSelector.reset.title")}
                        onSelect={onTranscodingFromCCListShow}
                        onReset={onTranscodingFromCCContentConstraintUnset}
                        value={
                          dataflowProductionModalTranscodingContentConstraintTriplet
                            ? getStringFromArtefactTriplet(dataflowProductionModalTranscodingContentConstraintTriplet)
                            : null
                        }
                        size="small"
                      >
                        {t("scenes.dataManager.dataflowBuilder.list.actions.productionModal.transcoding.selectButton.title")}
                      </Selector>
                      <EnhancedModal
                        visible={isDataflowProductionModalTranscodingContentConstraintListVisible}
                        title={t("scenes.dataManager.dataflowBuilder.list.actions.productionModal.transcodingContentConstraintList.title")}
                        onCancel={onTranscodingFromCCListHide}
                        footer={<Button
                          onClick={onTranscodingFromCCListHide}>{t('commons.buttons.close.title')}</Button>}
                        width={MODAL_WIDTH_LG}
                      >
                        <Call
                          cb={fetchTranscodingFromCCList}
                          cbParam={dataflowProductionModalDataflowTriplet}
                          disabled={!isDataflowProductionModalTranscodingContentConstraintListVisible}
                        >
                          <ArtefactList
                            artefacts={dataflowProductionModalTranscodingContentConstraints}
                            onRowClick={
                              ({id, agencyID, version}) => onTranscodingFromCCContentConstraintSet({
                                id,
                                agencyID,
                                version
                              })}
                          />
                        </Call>
                      </EnhancedModal>
                    </Fragment>
                  )}
                </Col>
              </Row>
            </Col>
            <Col>
              <Row gutter={GUTTER_SM} type="flex" justify="end">
                <Col>
                  <Button
                    disabled={
                      dataflowProductionModalDataflow === null ||
                      dataflowProductionModalMappingSetId === null ||
                      dataflowProductionModalMappingSetId === undefined ||
                      dataflowProductionModalDataflow.HasTranscoding ||
                      (
                        dataflowProductionModalTranscodingMode === DATAFLOW_BUILDER_LIST_DATAFLOW_PRODUCTION_MODAL_MODE_CC &&
                        dataflowProductionModalTranscodingContentConstraintTriplet === null
                      )
                    }
                    size="small"
                    type="primary"
                    onClick={
                      () => Modal.confirm({
                        title: t("scenes.dataManager.dataflowBuilder.list.actions.productionModal.transcoding.createButton.confirm.title"),
                        onOk() {
                          if (dataflowProductionModalTranscodingMode === DATAFLOW_BUILDER_LIST_DATAFLOW_PRODUCTION_MODAL_MODE_AUTO) {
                            onTranscodingCreate(dataflowProductionModalDataflow.IDDataflow);
                          } else {
                            onTranscodingFromCCCreate(dataflowProductionModalDataflow.IDDataflow, dataflowProductionModalTranscodingContentConstraintTriplet)
                          }
                        },
                        cancelText: t('commons.buttons.cancel.title')
                      })
                    }
                  >
                    {t("scenes.dataManager.dataflowBuilder.list.actions.productionModal.transcoding.createButton.title")}
                  </Button>
                </Col>
                <Col>
                  <Button
                    disabled={
                      dataflowProductionModalDataflow === null ||
                      dataflowProductionModalMappingSetId === null ||
                      dataflowProductionModalMappingSetId === undefined ||
                      !dataflowProductionModalDataflow.HasTranscoding
                    }
                    size="small"
                    type="primary"
                    onClick={
                      () => Modal.confirm({
                        title: t("scenes.dataManager.dataflowBuilder.list.actions.productionModal.transcoding.deleteButton.confirm.title"),
                        onOk() {
                          onTranscodingDelete(dataflowProductionModalDataflow.IDDataflow);
                        },
                        cancelText: t('commons.buttons.cancel.title')
                      })
                    }
                  >
                    {t("scenes.dataManager.dataflowBuilder.list.actions.productionModal.transcoding.deleteButton.title")}
                  </Button>
                </Col>
              </Row>
            </Col>
          </Row>
          <Divider/>
          <Row gutter={GUTTER_MD} justify="space-between" type="flex">
            <Col
              style={
                dataflowProductionModalDataflow !== null &&
                dataflowProductionModalMappingSetId !== null && dataflowProductionModalDataflow.HasTranscoding
                  ? labelStyle
                  : disabledLabelStyle
              }
            >
              {t("scenes.dataManager.dataflowBuilder.list.actions.productionModal.contentConstraint.label")}
            </Col>
            <Col>
              <Row gutter={GUTTER_SM} justify="end" type="flex">
                <Col>
                  <Button
                    disabled={
                      dataflowProductionModalDataflow === null ||
                      dataflowProductionModalMappingSetId === undefined ||
                      dataflowProductionModalMappingSetId === null ||
                      !dataflowProductionModalDataflow.HasTranscoding ||
                      dataflowProductionModalDataflow.HasContentConstraints
                    }
                    size="small"
                    type="primary"
                    onClick={
                      () => Modal.confirm({
                        title: t("scenes.dataManager.dataflowBuilder.list.actions.productionModal.contentConstraint.createButton.confirm.title"),
                        onOk() {
                          onContentConstraintCreate(dataflowProductionModalDataflow.IDDataflow);
                        },
                        cancelText: t('commons.buttons.cancel.title')
                      })
                    }
                  >
                    {t("scenes.dataManager.dataflowBuilder.list.actions.productionModal.contentConstraint.createButton.title")}
                  </Button>
                </Col>
                <Col>
                  <Button
                    disabled={
                      dataflowProductionModalDataflow === null ||
                      dataflowProductionModalMappingSetId === undefined ||
                      dataflowProductionModalMappingSetId === null ||
                      !dataflowProductionModalDataflow.HasTranscoding ||
                      !dataflowProductionModalDataflow.HasContentConstraints
                    }
                    size="small"
                    type="primary"
                    onClick={
                      () => Modal.confirm({
                        title: t("scenes.dataManager.dataflowBuilder.list.actions.productionModal.contentConstraint.deleteButton.confirm.title"),
                        onOk() {
                          onContentConstraintDelete(dataflowProductionModalDataflow.IDDataflow);
                        },
                        cancelText: t('commons.buttons.cancel.title')
                      })
                    }
                  >
                    {t("scenes.dataManager.dataflowBuilder.list.actions.productionModal.contentConstraint.deleteButton.title")}
                  </Button>
                </Col>
              </Row>
            </Col>
          </Row>
          <Divider/>
          <Row gutter={GUTTER_MD} justify="space-between" type="flex">
            <Col
              style={
                dataflowProductionModalDataflow !== null &&
                (
                  dataflowProductionModalMappingSetId !== null ||
                  dataflowProductionModalDataflow.HasTranscoding ||
                  dataflowProductionModalDataflow.hasContentConstraint
                )
                  ? labelStyle
                  : disabledLabelStyle
              }
            >
              {t("scenes.dataManager.dataflowBuilder.list.actions.productionModal.production.label")}
            </Col>
            <Col>
              <Row gutter={GUTTER_SM} justify="end" type="flex">
                <Col>
                  <Button
                    disabled={
                      dataflowProductionModalDataflow === null ||
                      dataflowProductionModalMappingSetId === undefined ||
                      (
                        dataflowProductionModalMappingSetId === null &&
                        !dataflowProductionModalDataflow.HasTranscoding &&
                        !dataflowProductionModalDataflow.hasContentConstraint
                      ) ||
                      dataflowProductionModalDataflow.isProduction
                    }
                    size="small"
                    type="primary"
                    onClick={
                      () => Modal.confirm({
                        title: t("scenes.dataManager.dataflowBuilder.list.actions.productionModal.production.publishButton.confirm.title"),
                        onOk() {
                          onSetProductionFlag(dataflowProductionModalDataflow.IDDataflow, false);
                        },
                        cancelText: t('commons.buttons.cancel.title')
                      })
                    }
                  >
                    {t("scenes.dataManager.dataflowBuilder.list.actions.productionModal.production.publishButton.title")}
                  </Button>
                </Col>
                <Col>
                  <Button
                    disabled={
                      dataflowProductionModalDataflow === null ||
                      dataflowProductionModalMappingSetId === undefined ||
                      (
                        dataflowProductionModalMappingSetId === null &&
                        !dataflowProductionModalDataflow.HasTranscoding &&
                        !dataflowProductionModalDataflow.hasContentConstraint
                      ) || !dataflowProductionModalDataflow.isProduction
                    }
                    size="small"
                    type="primary"
                    onClick={
                      () => Modal.confirm({
                        title: t("scenes.dataManager.dataflowBuilder.list.actions.productionModal.production.removeButton.confirm.title"),
                        onOk() {
                          onSetProductionFlag(dataflowProductionModalDataflow.IDDataflow, true);
                        },
                        cancelText: t('commons.buttons.cancel.title')
                      })
                    }
                  >
                    {t("scenes.dataManager.dataflowBuilder.list.actions.productionModal.production.removeButton.title")}
                  </Button>
                </Col>
              </Row>
            </Col>
          </Row>
        </Fragment>
      </EnhancedModal>
    </Call>
  );
};

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  translate(),
)(DataflowBuilderListDataflowProductionModal);
