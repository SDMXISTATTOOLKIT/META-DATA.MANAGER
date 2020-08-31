import React from 'react';
import {translate} from 'react-i18next';
import {Card, Form, Input} from "antd";
import {compose} from "redux";
import _ from "lodash";
import {MARGIN_MD} from "../../../../styles/constants";

const mapPropsToFields = ({Annotations}) => ({
  ConceptSchemesOrder: Form.createFormField({
    value: Annotations && Annotations.ConceptSchemesOrder ? Annotations.ConceptSchemesOrder : ""
  }),
  CategorySchemesOrder: Form.createFormField({
    value: Annotations && Annotations.CategorySchemesOrder ? Annotations.CategorySchemesOrder : ""
  }),
  CodelistsOrder: Form.createFormField({
    value: Annotations && Annotations.CodelistsOrder ? Annotations.CodelistsOrder : ""
  }),
  CategorisationsOrder: Form.createFormField({
    value: Annotations && Annotations.CategorisationsOrder ? Annotations.CategorisationsOrder : ""
  }),
  LayoutRow: Form.createFormField({
    value: Annotations && Annotations.LayoutRow ? Annotations.LayoutRow : ""
  }),
  LayoutColumn: Form.createFormField({
    value: Annotations && Annotations.LayoutColumn ? Annotations.LayoutColumn : ""
  }),
  LayoutFilter: Form.createFormField({
    value: Annotations && Annotations.LayoutFilter ? Annotations.LayoutFilter : ""
  }),
  LayoutRowSection: Form.createFormField({
    value: Annotations && Annotations.LayoutRowSection ? Annotations.LayoutRowSection : ""
  }),
  LayoutDataflowKeywords: Form.createFormField({
    value: Annotations && Annotations.LayoutDataflowKeywords ? Annotations.LayoutDataflowKeywords : ""
  }),
  LayoutCriteriaSelection: Form.createFormField({
    value: Annotations && Annotations.LayoutCriteriaSelection ? Annotations.LayoutCriteriaSelection : ""
  }),
  LayoutAttachedDataFiles: Form.createFormField({
    value: Annotations && Annotations.LayoutAttachedDataFiles ? Annotations.LayoutAttachedDataFiles : ""
  }),
  LayoutDefaultPresentation: Form.createFormField({
    value: Annotations && Annotations.LayoutDefaultPresentation ? Annotations.LayoutDefaultPresentation : ""
  }),
  LayoutDecimalSeparator: Form.createFormField({
    value: Annotations && Annotations.LayoutDecimalSeparator ? Annotations.LayoutDecimalSeparator : ""
  }),
  LayoutNumberOfDecimals: Form.createFormField({
    value: Annotations && Annotations.LayoutNumberOfDecimals ? Annotations.LayoutNumberOfDecimals : ""
  }),
  LayoutReferenceMetadata: Form.createFormField({
    value: Annotations && Annotations.LayoutReferenceMetadata ? Annotations.LayoutReferenceMetadata : ""
  }),
  LayoutEmptyCellPlaceholder: Form.createFormField({
    value: Annotations && Annotations.LayoutEmptyCellPlaceholder ? Annotations.LayoutEmptyCellPlaceholder : ""
  }),
  LayoutDataflowNotes: Form.createFormField({
    value: Annotations && Annotations.LayoutDataflowNotes ? Annotations.LayoutDataflowNotes : ""
  }),
  LayoutTerritorialDimensionIds: Form.createFormField({
    value: Annotations && Annotations.LayoutTerritorialDimensionIds ? Annotations.LayoutTerritorialDimensionIds : ""
  }),
  LayoutDataflowSource: Form.createFormField({
    value: Annotations && Annotations.LayoutDataflowSource ? Annotations.LayoutDataflowSource : ""
  }),
  NotDisplayed: Form.createFormField({
    value: Annotations && Annotations.NotDisplayed ? Annotations.NotDisplayed : ""
  }),
  FullName: Form.createFormField({
    value: Annotations && Annotations.FullName ? Annotations.FullName : ""
  }),
  Default: Form.createFormField({
    value: Annotations && Annotations.Default ? Annotations.Default : ""
  }),
  DDBDataflow: Form.createFormField({
    value: Annotations && Annotations.DDBDataflow ? Annotations.DDBDataflow : ""
  }),
  CustomDSD: Form.createFormField({
    value: Annotations && Annotations.CustomDSD ? Annotations.CustomDSD : ""
  }),
  AssociatedCube: Form.createFormField({
    value: Annotations && Annotations.AssociatedCube ? Annotations.AssociatedCube : ""
  }),
  Changed: Form.createFormField({
    value: Annotations && Annotations.Changed ? Annotations.Changed : ""
  }),
  Metadataset: Form.createFormField({
    value: Annotations && Annotations.Metadataset ? Annotations.Metadataset : ""
  }),
  HaveMetadata: Form.createFormField({
    value: Annotations && Annotations.HaveMetadata ? Annotations.HaveMetadata : ""
  }),
  RestrictedForPublication: Form.createFormField({
    value: Annotations && Annotations.RestrictedForPublication ? Annotations.RestrictedForPublication : ""
  }),
  AttachedFilePath: Form.createFormField({
    value: Annotations && Annotations.AttachedFilePath ? Annotations.AttachedFilePath : ""
  }),
  DCAT_IsMultilingual: Form.createFormField({
    value: Annotations && Annotations.DCAT_IsMultilingual ? Annotations.DCAT_IsMultilingual : ""
  }),
  CustomIsPresentational: Form.createFormField({
    value: Annotations && Annotations.CustomIsPresentational ? Annotations.CustomIsPresentational : ""
  })
});

const onFieldsChange = (props, fields) =>
  props.onChange(_.mapValues(fields, ({value}) => value));

const AnnotationsForm = ({
                           t,
                           form
                         }) =>
  <Form>
    <Card
      type="inner"
      title={t("data.nodesConfig.annotations.cards.order.label")}
      style={{marginBottom: MARGIN_MD}}
    >
      <Form.Item
        className="form-item-required"
        label={t('data.nodesConfig.annotations.conceptSchemesOrderAnnotation.label')}
        style={{marginBottom: 0}}
      >
        {form.getFieldDecorator('ConceptSchemesOrder')(<Input/>)}
      </Form.Item>
      <Form.Item
        className="form-item-required"
        label={t('data.nodesConfig.annotations.categorySchemesOrderAnnotation.label')}
        style={{marginBottom: 0}}
      >
        {form.getFieldDecorator('CategorySchemesOrder')(<Input/>)}
      </Form.Item>
      <Form.Item
        className="form-item-required"
        label={t('data.nodesConfig.annotations.codelistsOrderAnnotation.label')}
        style={{marginBottom: 0}}
      >
        {form.getFieldDecorator('CodelistsOrder')(<Input/>)}
      </Form.Item>
      <Form.Item
        className="form-item-required"
        label={t('data.nodesConfig.annotations.categorisationsOrderAnnotation.label')}
        style={{marginBottom: 0}}
      >
        {form.getFieldDecorator('CategorisationsOrder')(<Input/>)}
      </Form.Item>
    </Card>
    <Card
      type="inner"
      title={t("data.nodesConfig.annotations.cards.layout.label")}
      style={{marginBottom: MARGIN_MD}}
    >
      <Form.Item
        className="form-item-required"
        label={t('data.nodesConfig.annotations.layoutRow.label')}
        style={{marginBottom: 0}}
      >
        {form.getFieldDecorator('LayoutRow')(<Input/>)}
      </Form.Item>
      <Form.Item
        className="form-item-required"
        label={t('data.nodesConfig.annotations.layoutColumn.label')}
        style={{marginBottom: 0}}
      >
        {form.getFieldDecorator('LayoutColumn')(<Input/>)}
      </Form.Item>
      <Form.Item
        className="form-item-required"
        label={t('data.nodesConfig.annotations.layoutFilter.label')}
        style={{marginBottom: 0}}
      >
        {form.getFieldDecorator('LayoutFilter')(<Input/>)}
      </Form.Item>
      <Form.Item
        className="form-item-required"
        label={t('data.nodesConfig.annotations.layoutRowSection.label')}
        style={{marginBottom: 0}}
      >
        {form.getFieldDecorator('LayoutRowSection')(<Input/>)}
      </Form.Item>
      <Form.Item
        className="form-item-required"
        label={t('data.nodesConfig.annotations.layoutDataflowKeywords.label')}
        style={{marginBottom: 0}}
      >
        {form.getFieldDecorator('LayoutDataflowKeywords')(<Input/>)}
      </Form.Item>
      <Form.Item
        className="form-item-required"
        label={t('data.nodesConfig.annotations.layoutCriteriaSelection.label')}
        style={{marginBottom: 0}}
      >
        {form.getFieldDecorator('LayoutCriteriaSelection')(<Input/>)}
      </Form.Item>
      <Form.Item
        className="form-item-required"
        label={t('data.nodesConfig.annotations.layoutAttachedDataFiles.label')}
        style={{marginBottom: 0}}
      >
        {form.getFieldDecorator('LayoutAttachedDataFiles')(<Input/>)}
      </Form.Item>
      <Form.Item
        className="form-item-required"
        label={t('data.nodesConfig.annotations.layoutDefaultPresentation.label')}
        style={{marginBottom: 0}}
      >
        {form.getFieldDecorator('LayoutDefaultPresentation')(<Input/>)}
      </Form.Item>
      <Form.Item
        className="form-item-required"
        label={t('data.nodesConfig.annotations.layoutDecimalSeparator.label')}
        style={{marginBottom: 0}}
      >
        {form.getFieldDecorator('LayoutDecimalSeparator')(<Input/>)}
      </Form.Item>
      <Form.Item
        className="form-item-required"
        label={t('data.nodesConfig.annotations.layoutNumberOfDecimals.label')}
        style={{marginBottom: 0}}
      >
        {form.getFieldDecorator('LayoutNumberOfDecimals')(<Input/>)}
      </Form.Item>
      <Form.Item
        className="form-item-required"
        label={t('data.nodesConfig.annotations.layoutReferenceMetadata.label')}
        style={{marginBottom: 0}}
      >
        {form.getFieldDecorator('LayoutReferenceMetadata')(<Input/>)}
      </Form.Item>
      <Form.Item
        className="form-item-required"
        label={t('data.nodesConfig.annotations.layoutEmptyCellPlaceholder.label')}
        style={{marginBottom: 0}}
      >
        {form.getFieldDecorator('LayoutEmptyCellPlaceholder')(<Input/>)}
      </Form.Item>
      <Form.Item
        className="form-item-required"
        label={t('data.nodesConfig.annotations.layoutDataflowNotes.label')}
        style={{marginBottom: 0}}
      >
        {form.getFieldDecorator('LayoutDataflowNotes')(<Input/>)}
      </Form.Item>
      <Form.Item
        className="form-item-required"
        label={t('data.nodesConfig.annotations.layoutTerritorialDimensionIds.label')}
        style={{marginBottom: 0}}
      >
        {form.getFieldDecorator('LayoutTerritorialDimensionIds')(<Input/>)}
      </Form.Item>
      <Form.Item
        className="form-item-required"
        label={t('data.nodesConfig.annotations.layoutDataflowSource.label')}
        style={{marginBottom: 0}}
      >
        {form.getFieldDecorator('LayoutDataflowSource')(<Input/>)}
      </Form.Item>
      <Form.Item
        className="form-item-required"
        label={t('data.nodesConfig.annotations.notDisplayed.label')}
        style={{marginBottom: 0}}
      >
        {form.getFieldDecorator('NotDisplayed')(<Input/>)}
      </Form.Item>
      <Form.Item
        className="form-item-required"
        label={t('data.nodesConfig.annotations.fullName.label')}
        style={{marginBottom: 0}}
      >
        {form.getFieldDecorator('FullName')(<Input/>)}
      </Form.Item>
      <Form.Item
        className="form-item-required"
        label={t('data.nodesConfig.annotations.default.label')}
        style={{marginBottom: 0}}
      >
        {form.getFieldDecorator('Default')(<Input/>)}
      </Form.Item>
    </Card>
    <Form.Item
      className="form-item-required"
      label={t('data.nodesConfig.annotations.dDBDataflow.label')}
      style={{marginBottom: 0}}
    >
      {form.getFieldDecorator('DDBDataflow')(<Input/>)}
    </Form.Item>
    <Form.Item
      className="form-item-required"
      label={t('data.nodesConfig.annotations.customDSD.label')}
      style={{marginBottom: 0}}
    >
      {form.getFieldDecorator('CustomDSD')(<Input/>)}
    </Form.Item>
    <Form.Item
      className="form-item-required"
      label={t('data.nodesConfig.annotations.associatedCube.label')}
      style={{marginBottom: 0}}
    >
      {form.getFieldDecorator('AssociatedCube')(<Input/>)}
    </Form.Item>
    <Form.Item
      className="form-item-required"
      label={t('data.nodesConfig.annotations.changed.label')}
      style={{marginBottom: 0}}
    >
      {form.getFieldDecorator('Changed')(<Input/>)}
    </Form.Item>
    <Form.Item
      className="form-item-required"
      label={t('data.nodesConfig.annotations.metadataset.label')}
      style={{marginBottom: 0}}
    >
      {form.getFieldDecorator('Metadataset')(<Input/>)}
    </Form.Item>
    <Form.Item
      className="form-item-required"
      label={t('data.nodesConfig.annotations.haveMetadata.label')}
      style={{marginBottom: 0}}
    >
      {form.getFieldDecorator('HaveMetadata')(<Input/>)}
    </Form.Item>
    <Form.Item
      className="form-item-required"
      label={t('data.nodesConfig.annotations.restrictedForPublication.label')}
      style={{marginBottom: 0}}
    >
      {form.getFieldDecorator('RestrictedForPublication')(<Input/>)}
    </Form.Item>
    <Form.Item
      className="form-item-required"
      label={t('data.nodesConfig.annotations.attachedFilePath.label')}
      style={{marginBottom: 0}}
    >
      {form.getFieldDecorator('AttachedFilePath')(<Input/>)}
    </Form.Item>
    <Form.Item
      className="form-item-required"
      label={t('data.nodesConfig.annotations.dcatIsMultilingual.label')}
      style={{marginBottom: 0}}
    >
      {form.getFieldDecorator('DCAT_IsMultilingual')(<Input/>)}
    </Form.Item>
    <Form.Item
      className="form-item-required"
      label={t('data.nodesConfig.annotations.customIsPresentational.label')}
      style={{marginBottom: 0}}
    >
      {form.getFieldDecorator('CustomIsPresentational')(<Input/>)}
    </Form.Item>
  </Form>;

export default compose(
  translate(),
  Form.create({mapPropsToFields, onFieldsChange})
)(AnnotationsForm);

