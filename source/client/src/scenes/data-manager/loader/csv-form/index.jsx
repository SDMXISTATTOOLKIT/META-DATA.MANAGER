import React from 'react';
import {Button, Card, Checkbox, Col, Form, Input, Modal, Row, Select} from 'antd';
import LoaderCsvFormMappingControl from './mapping-control';
import {GUTTER_MD, MARGIN_MD, MODAL_WIDTH_SM, SPAN_FULL, SPAN_HALF, SPAN_ONE_THIRD} from '../../../../styles/constants';
import {
  changeLoaderCsvForm,
  onHideLoaderCsvFormIgnoreConcurrentUploadConfirm,
  submitLoaderCsvForm,
  uploadLoaderCsvFormFile
} from './actions';
import {translate} from 'react-i18next';
import {compose} from 'redux';
import FileInput from '../../../../components/file-input';
import {connect} from 'react-redux';
import LoaderCsvFormRowList from './row-list';
import {showLoaderCsvFormRowList} from './row-list/actions';
import {userMustNotInsertTid} from './utils';
import EmbargoInput from '../../../../components/embargo-input';
import {normalizeId} from "../../../../utils/normalizers";
import Call from "../../../../hocs/call";

const mapStateToProps = state => ({
  mappingId: state.scenes.dataManager.loader.components.csvForm.shared.mappingId,
  mapping: state.scenes.dataManager.loader.components.csvForm.shared.mapping,
  mappingCube: state.scenes.dataManager.loader.components.csvForm.shared.mappingCube,
  tid: state.scenes.dataManager.loader.components.csvForm.shared.tid,
  importType: state.scenes.dataManager.loader.components.csvForm.local.importType,
  file: state.scenes.dataManager.loader.components.csvForm.local.file,
  separator: state.scenes.dataManager.loader.components.csvForm.shared.separator,
  delimiter: state.scenes.dataManager.loader.components.csvForm.shared.delimiter,
  hasHeader: state.scenes.dataManager.loader.components.csvForm.shared.hasHeader,
  hasDotStatFormat: state.scenes.dataManager.loader.components.csvForm.shared.hasDotStatFormat,
  csvServerPath: state.scenes.dataManager.loader.components.csvForm.shared.csvServerPath,
  embargo: state.scenes.dataManager.loader.components.csvForm.local.embargo,
  refreshProdDf: state.scenes.dataManager.loader.components.csvForm.local.refreshProdDf,
  checkFiltAttributes: state.scenes.dataManager.loader.components.csvForm.local.checkFiltAttributes,
  isIgnoreConcurrentUploadConfirmVisible: state.scenes.dataManager.loader.components.csvForm.local.isIgnoreConcurrentUploadConfirmVisible
});

const mapDispatchToProps = dispatch => ({
  onChange: fields => dispatch(changeLoaderCsvForm(fields)),
  onFileUpload: (file, mappingCubeId) => dispatch(uploadLoaderCsvFormFile(file, mappingCubeId)),
  onRowListShow: () => dispatch(showLoaderCsvFormRowList()),
  onSubmit: (separator, delimiter, hasHeader, importType, cubeId, mappingId, filePath, tid, cubeCode, idMappingSpecialTimePeriod, embargo, refreshProdDf, checkFiltAttributes, ignoreConcurrentUpload) =>
    dispatch(submitLoaderCsvForm(separator, delimiter, hasHeader, importType, cubeId, mappingId, filePath, tid, cubeCode, idMappingSpecialTimePeriod, embargo, refreshProdDf, checkFiltAttributes, ignoreConcurrentUpload)),
  onHideIgnoreConcurrentUploadConfirm: () => dispatch(onHideLoaderCsvFormIgnoreConcurrentUploadConfirm())
});

const mapPropsToFields = ({
                            mapping,
                            tid,
                            importType,
                            file,
                            separator,
                            delimiter,
                            hasHeader,
                            hasDotStatFormat,
                            embargo,
                            refreshProdDf,
                            checkFiltAttributes
                          }) => ({
  mappingId: Form.createFormField({value: mapping !== null ? `[${mapping.Name}] ${mapping.Description || ''}` : null}),
  tid: Form.createFormField({value: tid}),
  importType: Form.createFormField({value: importType}),
  file: Form.createFormField({value: file}),
  separator: Form.createFormField({value: separator}),
  delimiter: Form.createFormField({value: delimiter}),
  hasHeader: Form.createFormField({value: hasHeader}),
  hasDotStatFormat: Form.createFormField({value: hasDotStatFormat}),
  embargo: Form.createFormField({value: embargo}),
  refreshProdDf: Form.createFormField({value: refreshProdDf}),
  checkFiltAttributes: Form.createFormField({value: checkFiltAttributes})
});

const onFieldsChange = (props, fields) => props.onChange(fields);

const LoaderCsvForm = ({
                         t,
                         form,
                         mappingId,
                         mapping,
                         mappingCube,
                         tid,
                         importType,
                         file,
                         separator,
                         hasHeader,
                         hasDotStatFormat,
                         delimiter,
                         csvServerPath,
                         onFileUpload,
                         onRowListShow,
                         onSubmit,
                         embargo,
                         refreshProdDf,
                         checkFiltAttributes,
                         isIgnoreConcurrentUploadConfirmVisible,
                         onHideIgnoreConcurrentUploadConfirm
                       }) =>
  <Row type="flex" justify="center">
    <Col style={{width: MODAL_WIDTH_SM}}>
      <Card type="inner">
        <Form className="advanced-form">
          <Row gutter={GUTTER_MD} style={{marginBottom: MARGIN_MD}}>
            <Col span={SPAN_FULL}>
              <Form.Item className="form-item-required"
                         label={t('scenes.dataManager.loader.csvForm.fields.mapping.label')}>
                <LoaderCsvFormMappingControl form={form}/>
              </Form.Item>
            </Col>
          </Row>
          {!userMustNotInsertTid(mapping, mappingCube) && (
            <Row gutter={GUTTER_MD} style={{marginBottom: MARGIN_MD}}>
              <Col span={SPAN_FULL}>
                <Form.Item className="form-item-required"
                           label={t('scenes.dataManager.loader.csvForm.fields.tid.label')}>
                  {form.getFieldDecorator('tid', {normalize: normalizeId})(<Input/>)}
                </Form.Item>
              </Col>
            </Row>
          )}
          <Row gutter={GUTTER_MD} style={{marginBottom: MARGIN_MD}}>
            <Col span={SPAN_FULL}>
              <Form.Item label={t('scenes.dataManager.loader.csvForm.fields.attributesFile.label')}>
                <Checkbox checked={false} onChange={() => Modal.error({title: t('errors.notImplemented')})}/>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={GUTTER_MD} style={{marginBottom: MARGIN_MD}}>
            <Col span={SPAN_FULL}>
              <Form.Item
                className="form-item-required"
                label={t('scenes.dataManager.loader.csvForm.fields.importType.label')}
              >
                {form.getFieldDecorator('importType')(
                  <Select
                    showSearch
                    filterOption={(inputValue, {props}) =>
                      props.title.toLowerCase().includes(inputValue.toLowerCase())
                    }
                    disabled={
                      mappingId === null ||
                      (
                        !userMustNotInsertTid(mapping, mappingCube)
                        &&
                        (tid === null || tid.length === 0)
                      )
                    }
                  >
                    <Select.Option
                      value="SeriesAndData"
                      title={t('scenes.dataManager.loader.csvForm.fields.importType.option.SeriesAndData')}
                    >
                      {t('scenes.dataManager.loader.csvForm.fields.importType.option.SeriesAndData')}
                    </Select.Option>
                    <Select.Option
                      value="Series"
                      title={t('scenes.dataManager.loader.csvForm.fields.importType.option.Series')}
                    >
                      {t('scenes.dataManager.loader.csvForm.fields.importType.option.Series')}
                    </Select.Option>
                    <Select.Option
                      value="Data"
                      title={t('scenes.dataManager.loader.csvForm.fields.importType.option.Data')}
                    >
                      {t('scenes.dataManager.loader.csvForm.fields.importType.option.Data')}
                    </Select.Option>
                  </Select>
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={GUTTER_MD} style={{marginBottom: MARGIN_MD}}>
            <Col span={SPAN_FULL}>
              <Form.Item className="form-item-required" label={t('data.csv.file.label')}>
                {form.getFieldDecorator('file')(
                  <FileInput
                    disabled={
                      mappingId === null ||
                      (
                        !userMustNotInsertTid(mapping, mappingCube)
                        &&
                        (tid === null || tid.length === 0)
                      )
                    }
                    accept={'.csv'}
                    isZipAllowed
                  />
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={GUTTER_MD} style={{marginBottom: MARGIN_MD}}>
            <Col span={SPAN_HALF}>
              <Form.Item className="form-item-required" label={t('data.csv.separator.label')}>
                {form.getFieldDecorator('separator')(
                  <Input
                    disabled={
                      mappingId === null ||
                      (
                        !userMustNotInsertTid(mapping, mappingCube)
                        &&
                        (tid === null || tid.length === 0)
                      )
                    }
                    maxLength={1}
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={SPAN_HALF}>
              <Form.Item label={t('data.csv.delimiter.label')}>
                {form.getFieldDecorator('delimiter')(
                  <Input
                    disabled={
                      mappingId === null ||
                      (
                        !userMustNotInsertTid(mapping, mappingCube)
                        &&
                        (tid === null || tid.length === 0)
                      )
                    }
                    maxLength={1}
                  />
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={GUTTER_MD} style={{marginBottom: MARGIN_MD}}>
            <Col span={SPAN_HALF}>
              <Form.Item label={t('data.csv.hasHeader.label')}>
                {form.getFieldDecorator('hasHeader', {valuePropName: 'checked'})(
                  <Checkbox
                    disabled={
                      mappingId === null ||
                      (
                        !userMustNotInsertTid(mapping, mappingCube)
                        &&
                        (tid === null || tid.length === 0)
                      )
                    }
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={SPAN_HALF}>
              <Form.Item label={t('data.csv.hasDotStatFormat.label')}>
                {form.getFieldDecorator('hasDotStatFormat', {valuePropName: 'checked'})(
                  <Checkbox
                    disabled={
                      mappingId === null ||
                      (
                        !userMustNotInsertTid(mapping, mappingCube)
                        &&
                        (tid === null || tid.length === 0)
                      )
                    }
                  />)}
              </Form.Item>
            </Col>
          </Row>
          <Row type="flex" justify="center" gutter={GUTTER_MD} style={{marginBottom: MARGIN_MD}}>
            <Col>
              <Form.Item>
                <Button
                  onClick={() => onFileUpload(file, mappingCube.IDCube)}
                  disabled={
                    (
                      !userMustNotInsertTid(mapping, mappingCube)
                      &&
                      (tid === null || tid.length === 0)
                    ) ||
                    mappingCube === null ||
                    file === null ||
                    separator === null ||
                    separator.length === 0 ||
                    hasHeader === null
                  }
                  type="primary"
                  icon="upload"
                >
                  {t('data.csv.uploadButton.label')}
                </Button>
              </Form.Item>
            </Col>
            <Col>
              <Form.Item>
                <Button onClick={onRowListShow} disabled={csvServerPath === null} icon="table">
                  {t('data.csv.tableShowButton.label')}
                </Button>
                <LoaderCsvFormRowList/>
              </Form.Item>
            </Col>
          </Row>
          <Row type="flex" style={{marginBottom: MARGIN_MD}}>
            <Col span={SPAN_FULL}>
              <Form.Item>
                {form.getFieldDecorator('embargo')(
                  <EmbargoInput disabled={csvServerPath === null}/>
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={SPAN_ONE_THIRD}>
              <Form.Item>
                {(() => {
                  const submit = ignoreConcurrentUpload => onSubmit(
                    separator,
                    !!delimiter ? delimiter : null,
                    hasHeader, importType,
                    mappingCube.IDCube,
                    mappingId,
                    csvServerPath,
                    tid,
                    mappingCube.Code,
                    hasDotStatFormat ? mappingId : null,
                    embargo ? embargo.enabled : false,
                    refreshProdDf,
                    checkFiltAttributes,
                    ignoreConcurrentUpload
                  );
                  return (
                    <Call
                      cb={() => Modal.confirm({
                        title: t('scenes.dataManager.loader.confirms.ignoreConcurrentUpload.title'),
                        content: t('scenes.dataManager.loader.confirms.ignoreConcurrentUpload.content'),
                        onOk() {
                          submit(true);
                          onHideIgnoreConcurrentUploadConfirm();
                        },
                        onCancel() {
                          onHideIgnoreConcurrentUploadConfirm();
                        },
                        cancelText: t('commons.buttons.cancel.title')
                      })}
                      disabled={!isIgnoreConcurrentUploadConfirmVisible}
                    >
                      <Button
                        onClick={() => submit()}
                        disabled={
                          mappingId === null || mappingCube === null || importType === null ||
                          (
                            !userMustNotInsertTid(mapping, mappingCube)
                            &&
                            (tid === null || tid.length === 0)
                          )
                          ||
                          separator === null || separator.length === 0 || hasHeader === null || csvServerPath === null
                        }
                        type="primary"
                        icon="check"
                      >
                        {t('scenes.dataManager.loader.csvForm.submitButton.label')}
                      </Button>
                    </Call>
                  );
                })()}
              </Form.Item>
            </Col>
            <Col span={SPAN_ONE_THIRD}>
              <Form.Item label={t('scenes.dataManager.loader.csvForm.refreshProdDf.label')}>
                {form.getFieldDecorator('refreshProdDf', {valuePropName: 'checked'})(
                  <Checkbox disabled={csvServerPath === null}/>)}
              </Form.Item>
            </Col>
            <Col span={SPAN_ONE_THIRD}>
              <Form.Item label={t('scenes.dataManager.loader.csvForm.checkFiltAttributes.label')}>
                {form.getFieldDecorator('checkFiltAttributes', {valuePropName: 'checked'})(
                  <Checkbox disabled={csvServerPath === null}/>)}
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
    </Col>
  </Row>;

export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps),
  Form.create({
    mapPropsToFields,
    onFieldsChange
  })
)(LoaderCsvForm);
