import React from 'react';
import EnhancedModal from "../enhanced-modal";
import {
  GUTTER_MD,
  MARGIN_MD,
  MODAL_WIDTH_LG,
  PADDING_MD,
  PADDING_SM,
  SPAN_HALF,
  TABLE_COL_MIN_WIDTH_ID,
  TABLE_COL_MIN_WIDTH_NAME
} from "../../styles/constants";
import {Button, Card, Checkbox, Col, Form, Icon, Input, Row, Select} from "antd";
import FileInput from '../file-input';
import {compose} from "redux";
import _ from "lodash";
import {translate} from 'react-i18next';
import {connect} from "react-redux";
import {getLanguageFlagIconCss, getLanguageLabel} from "../../utils/languages";
import Call from "../../hocs/call";
import {getFilterObjFromViewerObj} from "../../utils/filter";
import InfiniteScrollTable from "../infinite-scroll-table";
import InfiniteScrollDataTable from "../infinite-scroll-data-table";

const mapStateToProps = state => ({
  dataLanguages: state.config.dataManagement.dataLanguages
});

const mapPropsToFields = ({formData}) => ({
  file: Form.createFormField({value: formData ? formData.file : null}),
  language: Form.createFormField({value: formData ? formData.language : null}),
  separator: Form.createFormField({value: formData ? formData.separator : null}),
  delimiter: Form.createFormField({value: formData ? formData.delimiter : null}),
  hasHeader: Form.createFormField({value: formData ? formData.hasHeader : null}),
  hasDescriptionCol: Form.createFormField({value: formData ? formData.hasDescriptionCol : null}),
  hasParentCol: Form.createFormField({value: formData ? formData.hasParentCol : null}),
  hasOrderCol: Form.createFormField({value: formData ? formData.hasOrderCol : null}),
  hasLayoutAnnotationFullNameCol: Form.createFormField({value: formData ? formData.hasLayoutAnnotationFullNameCol : null}),
  hasLayoutAnnotationIsDefaultCol: Form.createFormField({value: formData ? formData.hasLayoutAnnotationIsDefaultCol : null})
});

const onFieldsChange = (props, fields) =>
  props.onChange(_.mapValues(fields, ({value}) => value));

const ItemsImportForm = ({
                           t,
                           form,
                           dataLanguages,
                           formData,
                           isVisible,
                           onHide,
                           onUpload,
                           onImport,
                           onAllCsvRowsShow,
                           onAllCsvRowsHide,
                           uploadCsv,
                           fetchAllCsvRows
                         }) =>
  <EnhancedModal
    visible={isVisible}
    title={t('components.itemsImportForm.title')}
    width={800}
    onCancel={onHide}
    footer={
      <div>
        <Button onClick={onHide}>{t('commons.buttons.close.title')}</Button>
        <Button
          disabled={
            formData === null ||
            formData.file === null || formData.language === null ||
            formData.separator === null || formData.separator.length !== 1 ||
            formData.hash === null
          }
          icon="check"
          type="primary"
          onClick={onImport}
        >
          {t('components.itemsImportForm.importButton.label')}
        </Button>
      </div>
    }
  >
    <Form className="advanced-form">
      <Row style={{marginBottom: MARGIN_MD}} gutter={GUTTER_MD}>
        <Col span={SPAN_HALF}>
          <Form.Item className="form-item-required" label={t('data.csv.file.label')}>
            {form.getFieldDecorator('file')(<FileInput accept={".csv"}/>)}
          </Form.Item>
        </Col>
        <Col span={SPAN_HALF}>
          <Form.Item className="form-item-required" label={t('data.commons.language.label')}>
            {form.getFieldDecorator('language')(
              <Select
                showSearch
                filterOption={(inputValue, {props}) =>
                  props.title.toLowerCase().includes(inputValue.toLowerCase())
                }
              >
                {dataLanguages.map(
                  ({code}) =>
                    <Select.Option key={code} value={code} title={getLanguageLabel(t, code)}>
                      <i
                        className={`flag-icon ${getLanguageFlagIconCss(code, dataLanguages)}`}
                        style={{marginRight: 8}}
                      />
                      {getLanguageLabel(t, code)}
                    </Select.Option>
                )}
              </Select>
            )}
          </Form.Item>
        </Col>
      </Row>
      <Row type="flex" style={{marginBottom: MARGIN_MD}} gutter={GUTTER_MD} justify="space-between">
        <Col>
          <Form.Item className="form-item-required" label={t('data.csv.separator.label')}>
            {form.getFieldDecorator('separator')(<Input maxLength={1} style={{width: 48}}/>)}
          </Form.Item>
        </Col>
        <Col>
          <Form.Item label={t('data.csv.delimiter.label')}>
            {form.getFieldDecorator('delimiter')(<Input maxLength={1} style={{width: 48}}/>)}
          </Form.Item>
        </Col>
        <Col>
          <Form.Item label={t('data.csv.hasHeader.label')}>
            {form.getFieldDecorator('hasHeader', {valuePropName: 'checked'})(<Checkbox/>)}
          </Form.Item>
        </Col>
      </Row>
      {formData && (
        <Card
          type="inner"
          title={t('components.itemsImportForm.columnsCard.title')}
          headStyle={{paddingLeft: PADDING_MD, paddingRight: PADDING_MD}}
          bodyStyle={{
            paddingLeft: PADDING_MD,
            paddingRight: PADDING_MD,
            paddingTop: PADDING_SM,
            paddingBottom: PADDING_SM
          }}
          style={{marginBottom: MARGIN_MD}}
        >
          <Row>
            <Col>
              <Form.Item label={t('components.itemsImportForm.columnsCard.hasIDCol.label')}>
                <Checkbox disabled checked/>
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col>
              <Form.Item label={t('components.itemsImportForm.columnsCard.hasNameCol.label')}>
                <Checkbox disabled checked/>
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col>
              <Form.Item label={t('components.itemsImportForm.columnsCard.hasDescriptionCol.label')}>
                {form.getFieldDecorator('hasDescriptionCol', {valuePropName: 'checked'})(<Checkbox/>)}
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col>
              <Form.Item label={t('components.itemsImportForm.columnsCard.hasParentCol.label')}>
                {form.getFieldDecorator('hasParentCol', {valuePropName: 'checked'})(<Checkbox/>)}
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col>
              <Form.Item label={t('components.itemsImportForm.columnsCard.hasOrderCol.label')}>
                {form.getFieldDecorator('hasOrderCol', {valuePropName: 'checked'})(<Checkbox/>)}
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col>
              <Form.Item label={t('components.itemsImportForm.columnsCard.hasLayoutAnnotationFullNameCol.label')}>
                {form.getFieldDecorator('hasLayoutAnnotationFullNameCol', {valuePropName: 'checked'})(<Checkbox/>)}
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col>
              <Form.Item label={t('components.itemsImportForm.columnsCard.hasLayoutAnnotationIsDefaultCol.label')}>
                {form.getFieldDecorator('hasLayoutAnnotationIsDefaultCol', {valuePropName: 'checked'})(<Checkbox/>)}
              </Form.Item>
            </Col>
          </Row>
        </Card>
      )}
      <Row type="flex" justify="end">
        <Col>
          <Button
            disabled={
              formData === null ||
              formData.file === null || formData.language === null ||
              formData.separator === null || formData.separator.length !== 1
            }
            icon="upload"
            type="primary"
            onClick={onUpload}
          >
            {t('data.csv.uploadButton.label')}
          </Button>
        </Col>
      </Row>
      {formData && formData.csvRows && (
        <div style={{marginTop: MARGIN_MD}}>
          <InfiniteScrollTable
            getRowKey={({id}) => id}
            data={formData.csvRows.filter(row => !row.isHeader)}
            height={240}
            columns={[
              {
                title: t('data.item.id.shortLabel'),
                dataIndex: 'id',
                minWidth: TABLE_COL_MIN_WIDTH_ID
              },
              {
                title: t('data.item.name.shortLabel'),
                dataIndex: 'name',
                minWidth: TABLE_COL_MIN_WIDTH_NAME
              },
              formData.hasDescriptionCol
                ? {
                  title: t('data.item.description.shortLabel'),
                  dataIndex: 'description',
                  minWidth: TABLE_COL_MIN_WIDTH_NAME
                }
                : null,
              formData.hasParentCol
                ? {
                  title: t('data.item.parent.shortLabel'),
                  dataIndex: 'parent',
                  minWidth: TABLE_COL_MIN_WIDTH_ID
                }
                : null,
              formData.hasOrderCol
                ? {
                  title: t('data.item.order.shortLabel'),
                  dataIndex: 'order',
                  widthToContent: true
                }
                : null,
              formData.hasLayoutAnnotationFullNameCol
                ? {
                  title: t('data.item.layoutAnnotationFullName.shortLabel'),
                  dataIndex: 'fullName',
                  minWidth: TABLE_COL_MIN_WIDTH_NAME
                }
                : null,
              formData.hasLayoutAnnotationIsDefaultCol
                ? {
                  title: t('data.item.layoutAnnotationIsDefault.shortLabel'),
                  dataIndex: 'isDefault',
                  width: 30,
                  withValuesFilter: true,
                  render: isDefault => (isDefault === "1" || isDefault === true || isDefault === "true" || isDefault === "True")
                    ? <Icon type="check"/>
                    : null,
                  renderText: isDefault => (isDefault === "1" || isDefault === true || isDefault === "true" || isDefault === "True")
                    ? t('data.item.layoutAnnotationIsDefault.values.true')
                    : t('data.item.layoutAnnotationIsDefault.values.false')
                }
                : null
            ]}
            rightActions={
              <Button onClick={onAllCsvRowsShow}>{t('components.itemsImportForm.showAllCsvRows.label')}</Button>
            }
          />
          <Call cb={uploadCsv} cbParam={formData.file}
                disabled={!formData.isAllCsvRowsVisible || formData.filePath !== null}>
            <EnhancedModal
              title={t('components.itemsImportForm.allCSVRowsModal.title')}
              visible={formData !== null && formData.isAllCsvRowsVisible && formData.filePath !== null}
              onCancel={onAllCsvRowsHide}
              footer={
                <Button onClick={onAllCsvRowsHide}>{t('commons.buttons.close.title')}</Button>
              }
              width={MODAL_WIDTH_LG}
            >
              {formData.filePath && (
                <InfiniteScrollDataTable
                  data={formData.allCsvRows && formData.allCsvRows.Data}
                  rowTotal={formData.allCsvRows && formData.allCsvRows.Count}
                  cols={formData.allCsvRows && formData.allCsvRows.Columns}
                  hiddenCols={['NumRow']}
                  onChange={
                    ({pageNum, pageSize, searchText, filters, sortCol, sortByDesc}) => fetchAllCsvRows(
                      pageNum,
                      pageSize,
                      getFilterObjFromViewerObj(
                        formData.allCsvRows && formData.allCsvRows.Columns.filter(colName => colName !== 'NumRow'),
                        searchText,
                        filters
                      ),
                      sortCol ? [sortCol] : null,
                      sortByDesc,
                      formData.separator,
                      formData.delimiter,
                      formData.hasHeader,
                      formData.filePath
                    )
                  }
                />
              )}
            </EnhancedModal>
          </Call>
        </div>
      )}
    </Form>
  </EnhancedModal>;

export default compose(
  translate(),
  connect(mapStateToProps),
  Form.create({mapPropsToFields, onFieldsChange})
)(ItemsImportForm);
