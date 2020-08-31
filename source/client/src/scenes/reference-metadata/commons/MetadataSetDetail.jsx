import React, {Fragment} from 'react';
import {compose} from "redux";
import {translate} from 'react-i18next';
import {connect} from "react-redux";
import {Button, Col, Form, Input, Row} from 'antd';
import {
  GUTTER_MD,
  MARGIN_MD,
  MODAL_WIDTH_LG,
  SPAN_HALF,
  SPAN_ONE_QUARTER,
  SPAN_THREE_QUARTERS
} from "../../../styles/constants";
import LocalizedDatePicker from "../../../components/localized-date-picker";
import _ from "lodash";
import {normalizeId, normalizeInt} from "../../../utils/normalizers";
import Selector from "../../../components/selector";
import Call from "../../../hocs/call";
import ArtefactList from "../../../components/artefact-list";
import EnhancedModal from "../../../components/enhanced-modal";
import {getArtefactTripletFromUrn, getStringFromArtefactTriplet} from "../../../utils/sdmxJson";
import AnnotationsForm from "../../../components/annotations-form";
import {getDbIdAnnotationFromAnnotations, METADATA_SET_ID_ANNOTATION_ID} from "../../../utils/referenceMetadata";
import {isDateValid} from "../../../utils/artefactValidators";
import DelayedMultilanguageZoomableTextArea from "../../../components/delayed-multilanguage-zoomable-textarea";

const mapStateToProps = state => ({
  permissions: state.app.user.permissions
});

const mapPropsToFields = ({metadataSet}) => ({
  id: Form.createFormField({value: metadataSet ? metadataSet.id : null}),
  name: Form.createFormField({value: metadataSet ? metadataSet.name : null}),
  metadataflowTriplet: Form.createFormField({
    value: (metadataSet && metadataSet.metadataflowTriplet)
      ? getStringFromArtefactTriplet(metadataSet.metadataflowTriplet)
      : null
  }),
  msdTriplet: Form.createFormField({
    value: (metadataSet && metadataSet.structureRef)
      ? getStringFromArtefactTriplet(getArtefactTripletFromUrn(metadataSet.structureRef))
      : null
  }),
  reportingBegin: Form.createFormField({value: metadataSet ? metadataSet.reportingBegin : null}),
  reportingEnd: Form.createFormField({value: metadataSet ? metadataSet.reportingEnd : null}),
  validFrom: Form.createFormField({value: metadataSet ? metadataSet.validFrom : null}),
  validTo: Form.createFormField({value: metadataSet ? metadataSet.validTo : null}),
  publicationYear: Form.createFormField({value: metadataSet ? metadataSet.publicationYear : null}),
  publicationPeriod: Form.createFormField({value: metadataSet ? metadataSet.publicationPeriod : null}),
});

const onFieldsChange = (props, fields) => props.onMetadataSetChange(_.mapValues(fields, ({value}) => value));

export const METADATA_SET_DETAIL_MODE_CREATE = "METADATA_SET_DETAIL_MODE_CREATE";
export const METADATA_SET_DETAIL_MODE_READ = "METADATA_SET_DETAIL_MODE_READ";
export const METADATA_SET_DETAIL_MODE_EDIT = "METADATA_SET_DETAIL_MODE_EDIT";

const formItemLayout = isDcat => ({
  labelCol: isDcat ? {span: SPAN_ONE_QUARTER} : undefined,
  wrapperCol: isDcat ? {span: SPAN_THREE_QUARTERS} : undefined
});

const rowStyle = isDcat => ({
  marginBottom: isDcat ? MARGIN_MD : undefined,
  marginLeft: isDcat ? MARGIN_MD : undefined,
  marginRight: isDcat ? MARGIN_MD : undefined,
});

const datePickerProps = {
  format: 'DD/MM/YYYY'
};

export const isMetadataSetIdWarningVisible = (metadataSet, metadataSets) => {

  if (metadataSet && !getDbIdAnnotationFromAnnotations(metadataSet, METADATA_SET_ID_ANNOTATION_ID)) {
    return !!(metadataSets || []).find(({id}) => id === metadataSet.id)

  } else {
    return false;
  }
};

const MetadataSetDetail = ({
                             t,
                             form,
                             permissions,
                             isDcat,
                             mode = METADATA_SET_DETAIL_MODE_READ,
                             metadataSet,
                             isMetadataflowsVisible,
                             metadataflows,
                             metadataSets,
                             onMetadataSetChange,
                             onMetadataflowsShow,
                             onMetadataflowsHide,
                             fetchMetadataflows,
                             onMetadataflowSet,
                             onMetadataflowUnset
                           }) =>
  <Fragment>
    {
      metadataSet && (
        <Fragment>
          <Form>
            <Row gutter={GUTTER_MD} style={rowStyle(isDcat)}>
              <Col span={SPAN_HALF}>
                <Form.Item
                  label={t("scenes.referenceMetadata.commons.metadataSetDetail.id.label")}
                  className="form-item-required"
                  hasFeedback
                  validateStatus={isMetadataSetIdWarningVisible(metadataSet, metadataSets) ? "warning" : null}
                  help={isMetadataSetIdWarningVisible(metadataSet, metadataSets)
                    ? t("scenes.referenceMetadata.commons.metadataSetDetail.id.alreadyUsed.help")
                    : undefined
                  }
                  {...formItemLayout(isDcat)}
                >
                  {form.getFieldDecorator("id", {normalize: normalizeId})(
                    <Input
                      title={form.getFieldValue("id")}
                      disabled={mode !== METADATA_SET_DETAIL_MODE_CREATE}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={SPAN_HALF}>
                <Form.Item
                  label={t("scenes.referenceMetadata.commons.metadataSetDetail.name.label")}
                  className="form-item-required"
                  {...formItemLayout(isDcat)}
                >
                  {form.getFieldDecorator("name")(
                    <DelayedMultilanguageZoomableTextArea
                      disabled={mode === METADATA_SET_DETAIL_MODE_READ}
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={GUTTER_MD} style={rowStyle(isDcat)}>
              <Col span={SPAN_HALF}>
                <Form.Item
                  label={t("scenes.referenceMetadata.commons.metadataSetDetail.metadataflow.label")}
                  className="form-item-required"
                  {...formItemLayout(isDcat)}
                >
                  {form.getFieldDecorator("metadataflowTriplet")(
                    <Selector
                      selectTitle={t('scenes.referenceMetadata.commons.metadataSetDetail.metadataflow.selector.select.title')}
                      resetTitle={t('scenes.referenceMetadata.commons.metadataSetDetail.metadataflow.selector.reset.title')}
                      onSelect={onMetadataflowsShow}
                      onReset={onMetadataflowUnset}
                      disabled={mode === METADATA_SET_DETAIL_MODE_READ}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={SPAN_HALF}>
                <Form.Item
                  label={t("scenes.referenceMetadata.commons.metadataSetDetail.msd.label")}
                  className="form-item-required"
                  {...formItemLayout(isDcat)}
                >
                  {form.getFieldDecorator("msdTriplet")(
                    <Input disabled/>
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={GUTTER_MD} style={rowStyle(isDcat)}>
              <Col span={SPAN_HALF}>
                <Form.Item
                  label={t("scenes.referenceMetadata.commons.metadataSetDetail.reportingBegin.label")}
                  {...formItemLayout(isDcat)}
                >
                  {form.getFieldDecorator("reportingBegin")(
                    <LocalizedDatePicker
                      disabled={mode === METADATA_SET_DETAIL_MODE_READ}
                      {...datePickerProps}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={SPAN_HALF}>
                <Form.Item
                  label={t("scenes.referenceMetadata.commons.metadataSetDetail.reportingEnd.label")}
                  {...formItemLayout(isDcat)}
                  hasFeedback
                  validateStatus={metadataSet && !isDateValid(metadataSet.reportingBegin, metadataSet.reportingEnd) ? "warning" : null}
                  help={metadataSet && !isDateValid(metadataSet.reportingBegin, metadataSet.reportingEnd) ? t("commons.helps.invalidDateRange.label") : null}
                >
                  {form.getFieldDecorator("reportingEnd")(
                    <LocalizedDatePicker
                      disabled={mode === METADATA_SET_DETAIL_MODE_READ}
                      {...datePickerProps}
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={GUTTER_MD} style={rowStyle(isDcat)}>
              <Col span={SPAN_HALF}>
                <Form.Item
                  label={t("scenes.referenceMetadata.commons.metadataSetDetail.validFrom.label")}
                  {...formItemLayout(isDcat)}
                >
                  {form.getFieldDecorator("validFrom")(
                    <LocalizedDatePicker
                      disabled={mode === METADATA_SET_DETAIL_MODE_READ}
                      {...datePickerProps}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={SPAN_HALF}>
                <Form.Item
                  label={t("scenes.referenceMetadata.commons.metadataSetDetail.validTo.label")}
                  {...formItemLayout(isDcat)}
                  hasFeedback
                  validateStatus={metadataSet && !isDateValid(metadataSet.validFrom, metadataSet.validTo) ? "warning" : null}
                  help={metadataSet && !isDateValid(metadataSet.validFrom, metadataSet.validTo) ? t("commons.helps.invalidDateRange.label") : null}
                >
                  {form.getFieldDecorator("validTo")(
                    <LocalizedDatePicker
                      disabled={mode === METADATA_SET_DETAIL_MODE_READ}
                      {...datePickerProps}
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={GUTTER_MD} style={rowStyle(isDcat)}>
              <Col span={SPAN_HALF}>
                <Form.Item
                  label={t("scenes.referenceMetadata.commons.metadataSetDetail.publicationYear.label")}
                  {...formItemLayout(isDcat)}
                >
                  {form.getFieldDecorator("publicationYear", {normalize: normalizeInt})(
                    <Input
                      title={form.getFieldValue("publicationYear")}
                      disabled={mode === METADATA_SET_DETAIL_MODE_READ}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={SPAN_HALF}>
                <Form.Item
                  label={t("scenes.referenceMetadata.commons.metadataSetDetail.publicationPeriod.label")}
                  {...formItemLayout(isDcat)}
                >
                  {form.getFieldDecorator("publicationPeriod")(
                    <Input
                      title={form.getFieldValue("publicationPeriod")}
                      disabled={mode === METADATA_SET_DETAIL_MODE_READ}
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
          </Form>
          <AnnotationsForm
            annotations={metadataSet ? metadataSet.annotations : null}
            onChange={onMetadataSetChange}
            genericOnly
            isGenericOneLinePerField={!isDcat}
            disabled={mode === METADATA_SET_DETAIL_MODE_READ}
          />
        </Fragment>
      )
    }
    <EnhancedModal
      visible={isMetadataflowsVisible}
      onCancel={onMetadataflowsHide}
      title={t('scenes.referenceMetadata.commons.metadataSetDetail.modals.metadataflowsList.title')}
      width={MODAL_WIDTH_LG}
      footer={<Button onClick={onMetadataflowsHide}>{t('commons.buttons.close.title')}</Button>}
    >
      <Call
        cb={fetchMetadataflows}
        cbParam={(permissions && permissions.metadataflowOwner)
          ? permissions.metadataflowOwner
          : []
        }
      >
        <ArtefactList
          artefacts={metadataflows}
          onRowClick={({id, agencyID, version, structure}) => onMetadataflowSet({id, agencyID, version}, structure)}
        />
      </Call>
    </EnhancedModal>
  </Fragment>;

export default compose(
  translate(),
  connect(mapStateToProps),
  Form.create({mapPropsToFields, onFieldsChange})
)(MetadataSetDetail);
