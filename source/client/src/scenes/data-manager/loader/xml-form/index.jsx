import React from 'react';
import {Button, Card, Checkbox, Col, Form, Input, Modal, Row, Select} from 'antd';
import {getLocalizedStr} from '../../../../middlewares/i18n/utils';
import {GUTTER_MD, MARGIN_MD, MODAL_WIDTH_SM, SPAN_FULL, SPAN_ONE_THIRD} from '../../../../styles/constants';
import {compose} from 'redux';
import {translate} from 'react-i18next';
import FileInput from '../../../../components/file-input';
import LoaderXmlFormRowList from './row-list';
import {connect} from 'react-redux';
import {
  changeLoaderXmlForm,
  hideLoaderXmlFormCubeTree,
  onHideLoaderXmlFormIgnoreConcurrentUploadConfirm,
  readLoaderXmlFormCategorisedCubes,
  readLoaderXmlFormCube,
  setLoaderXmlFormCube,
  showLoaderXmlFormCubeTree,
  submitLoaderXmlForm,
  unsetLoaderXmlFormCube,
  uploadLoaderXmlFormFile
} from './actions';
import Selector from '../../../../components/selector';
import EnhancedTree from '../../../../components/enhanced-tree';
import {getNode, getNodes, UNCATEGORIZED_CATEGORY_CODE} from '../../../../utils/tree';
import {DCS_ORDERED_TREE_ROOT} from '../../../../utils/treeBuilders';
import Call from '../../../../hocs/call';
import {showLoaderXmlRowList} from './row-list/actions';
import './style.css';
import EmbargoInput from '../../../../components/embargo-input';
import {getArtefactTripletFromString} from '../../../../utils/sdmxJson';
import EnhancedModal from '../../../../components/enhanced-modal';
import {normalizeId} from "../../../../utils/normalizers";

const mapStateToProps = state => ({
  appLanguage: state.app.language,
  dataLanguages: state.config.dataManagement.dataLanguages,
  categorisedCubes: state.scenes.dataManager.loader.components.xmlForm.local.categorisedCubes,
  isCubeTreeVisible: state.scenes.dataManager.loader.components.xmlForm.local.isCubeTreeVisible,
  cubeId: state.scenes.dataManager.loader.components.xmlForm.local.cubeId,
  cube: state.scenes.dataManager.loader.components.xmlForm.shared.cube,
  filePath: state.scenes.dataManager.loader.components.xmlForm.shared.filePath,
  tid: state.scenes.dataManager.loader.components.xmlForm.local.tid,
  importType: state.scenes.dataManager.loader.components.xmlForm.local.importType,
  file: state.scenes.dataManager.loader.components.xmlForm.local.file,
  embargo: state.scenes.dataManager.loader.components.xmlForm.local.embargo,
  refreshProdDf: state.scenes.dataManager.loader.components.xmlForm.local.refreshProdDf,
  checkFiltAttributes: state.scenes.dataManager.loader.components.xmlForm.local.checkFiltAttributes,
  isIgnoreConcurrentUploadConfirmVisible: state.scenes.dataManager.loader.components.xmlForm.local.isIgnoreConcurrentUploadConfirmVisible
});

const mapDispatchToProps = dispatch => ({
  onChange: fields => dispatch(changeLoaderXmlForm(fields)),
  onCubeTreeShow: () => dispatch(showLoaderXmlFormCubeTree()),
  onCubeTreeHide: () => dispatch(hideLoaderXmlFormCubeTree()),
  onCubeSet: cubeId => dispatch(setLoaderXmlFormCube(cubeId)),
  onCubeUnset: () => dispatch(unsetLoaderXmlFormCube()),
  onRowListShow: () => dispatch(showLoaderXmlRowList()),
  onFileUpload: (file, cubeId) => dispatch(uploadLoaderXmlFormFile(file, cubeId)),
  onSubmit: (importType, cubeId, dsdId, dsdAgencyId, dsdVersion, filePath, tid, cubeCode, embargo, refreshProdDf, checkFiltAttributes, ignoreConcurrentUpload) =>
    dispatch(submitLoaderXmlForm(importType, cubeId, dsdId, dsdAgencyId, dsdVersion, filePath, tid, cubeCode, embargo, refreshProdDf, checkFiltAttributes, ignoreConcurrentUpload)),
  fetchCategorisedCubes: () => dispatch(readLoaderXmlFormCategorisedCubes()),
  fetchCube: cubeId => dispatch(readLoaderXmlFormCube(cubeId)),
  onHideIgnoreConcurrentUploadConfirm: () => dispatch(onHideLoaderXmlFormIgnoreConcurrentUploadConfirm())
});

const mapPropsToFields = ({
                            cube,
                            tid,
                            importType,
                            file,
                            embargo,
                            appLanguage,
                            dataLanguage,
                            dataLanguages,
                            refreshProdDf,
                            checkFiltAttributes
                          }) => ({
  cubeId: Form.createFormField({
    value:
      cube !== null
        ? `[${cube.Code}] ${getLocalizedStr(cube.labels, dataLanguage || appLanguage, dataLanguages)}`
        : null
  }),
  tid: Form.createFormField({value: tid}),
  importType: Form.createFormField({value: importType}),
  file: Form.createFormField({value: file}),
  embargo: Form.createFormField({value: embargo}),
  refreshProdDf: Form.createFormField({value: refreshProdDf}),
  checkFiltAttributes: Form.createFormField({value: checkFiltAttributes})
});

const onFieldsChange = ({onChange}, fields) => onChange(fields);

const LoaderXmlForm = ({
                         t,
                         appLanguage,
                         dataLanguages,
                         form,
                         cubeId,
                         cube,
                         tid,
                         file,
                         filePath,
                         embargo,
                         importType,
                         isCubeTreeVisible,
                         categorisedCubes,
                         onCubeTreeShow,
                         onCubeTreeHide,
                         onCubeSet,
                         onCubeUnset,
                         onFileUpload,
                         onRowListShow,
                         onSubmit,
                         fetchCategorisedCubes,
                         fetchCube,
                         refreshProdDf,
                         checkFiltAttributes,
                         isIgnoreConcurrentUploadConfirmVisible,
                         onHideIgnoreConcurrentUploadConfirm
                       }) =>
  <Row type="flex" justify="center">
    <EnhancedModal
      visible={isCubeTreeVisible}
      title={t('scenes.dataManager.loader.xmlForm.cubeTreeModal.title')}
      footer={<Button onClick={onCubeTreeHide}>{t('commons.buttons.close.title')}</Button>}
      onCancel={onCubeTreeHide}
    >
      <Call cb={fetchCategorisedCubes} disabled={categorisedCubes !== null}>
        <div className="loader__xml-form__tree">
          <EnhancedTree
            tree={categorisedCubes}
            idKey="Code"
            nameKey="labels"
            childrenKey="children"
            catIdKey="CatCode"
            catNameKey="labels"
            unselectableKeys={
              getNodes(categorisedCubes, 'children', node => node.children)
                .map(node => node.CatCode)
            }
            hiddenIdKeys={[DCS_ORDERED_TREE_ROOT.CatCode, UNCATEGORIZED_CATEGORY_CODE]}
            getFilter={
              searchText =>
                ({Code, CatCode, labels}) => {
                  const search = searchText.toLowerCase();
                  return (Code && Code.toLowerCase()
                      .indexOf(search) >= 0) ||
                    (CatCode && CatCode.toLowerCase()
                      .indexOf(search) >= 0) ||
                    getLocalizedStr(labels, appLanguage, dataLanguages)
                      .toLowerCase()
                      .indexOf(search) >= 0;
                }
            }
            onSelect={
              selectedArr => {
                const node = getNode(
                  categorisedCubes,
                  'children',
                  node => node.children
                    ? node.CatCode === selectedArr[0]
                    : node.Code === selectedArr[0]
                );
                if (node !== null && node.children === undefined) {
                  onCubeSet(node.IDCube);
                } else {
                  onCubeUnset();
                }
              }
            }
            treeActions={[
              {
                title: t('scenes.dataManager.loader.xmlForm.cubeTreeModal.tree.refreshButton.title'),
                icon: 'sync',
                onClick: fetchCategorisedCubes
              }
            ]}
            icon="cube"
            isCustomIcon
            getIconColor={() => "#37a0f4"}
          />
        </div>
      </Call>
    </EnhancedModal>
    <Col style={{width: MODAL_WIDTH_SM}}>
      <Card type="inner">
        <Form className="advanced-form">
          <Row gutter={GUTTER_MD} style={{marginBottom: MARGIN_MD}}>
            <Col span={SPAN_FULL}>
              <Form.Item
                className="form-item-required"
                label={t('scenes.dataManager.loader.xmlForm.fields.cube.label')}
              >
                {form.getFieldDecorator('cubeId')(
                  <Selector
                    selectTitle={t('scenes.dataManager.loader.xmlForm.fields.cube.selectIcon.title')}
                    resetTitle={t('scenes.dataManager.loader.xmlForm.fields.cube.resetIcon.title')}
                    onSelect={onCubeTreeShow}
                    onReset={onCubeUnset}
                    onDetail={null}
                  />
                )}
              </Form.Item>
            </Col>
          </Row>
          <Call cb={fetchCube} cbParam={cubeId} disabled={cubeId === null}>
            {
              cube !== null && cube.Attributes.filter(({IsTid}) => IsTid).length > 0 && (
                <Row gutter={GUTTER_MD} style={{marginBottom: MARGIN_MD}}>
                  <Col span={SPAN_FULL}>
                    <Form.Item
                      className="form-item-required"
                      label={t('scenes.dataManager.loader.xmlForm.fields.tid.label')}
                    >
                      {form.getFieldDecorator('tid', {normalize: normalizeId})(<Input/>)}
                    </Form.Item>
                  </Col>
                </Row>
              )}
            <Row gutter={GUTTER_MD} style={{marginBottom: MARGIN_MD}}>
              <Col span={SPAN_FULL}>
                <Form.Item
                  className="form-item-required"
                  label={t('scenes.dataManager.loader.xmlForm.fields.importType.label')}
                >
                  {form.getFieldDecorator('importType')(
                    <Select
                      showSearch
                      filterOption={(inputValue, {props}) =>
                        props.title.toLowerCase().includes(inputValue.toLowerCase())
                      }
                      disabled={cube === null}
                    >
                      <Select.Option
                        value="SeriesAndData"
                        title={t('scenes.dataManager.loader.xmlForm.fields.importType.option.SeriesAndData')}
                      >
                        {t('scenes.dataManager.loader.xmlForm.fields.importType.option.SeriesAndData')}
                      </Select.Option>
                      <Select.Option
                        value="Series"
                        title={t('scenes.dataManager.loader.xmlForm.fields.importType.option.Series')}
                      >
                        {t('scenes.dataManager.loader.xmlForm.fields.importType.option.Series')}
                      </Select.Option>
                      <Select.Option
                        value="Data"
                        title={t('scenes.dataManager.loader.xmlForm.fields.importType.option.Data')}
                      >
                        {t('scenes.dataManager.loader.xmlForm.fields.importType.option.Data')}
                      </Select.Option>
                    </Select>
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={GUTTER_MD} style={{marginBottom: MARGIN_MD}}>
              <Col span={SPAN_FULL}>
                <Form.Item className="form-item-required" label={t('data.xml.file.label')}>
                  {form.getFieldDecorator('file')(
                    <FileInput disabled={cube === null} accept={'.xml'} isZipAllowed/>
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row type="flex" justify="center" gutter={GUTTER_MD}
                 style={{marginBottom: MARGIN_MD}}>
              <Col>
                <Form.Item>
                  <Button
                    onClick={() => onFileUpload(file, cube.IDCube)}
                    disabled={cube === null || file === null}
                    type="primary"
                    icon="upload"
                  >
                    {t('data.xml.uploadButton.label')}
                  </Button>
                </Form.Item>
              </Col>
              <Col>
                <Form.Item>
                  <Button
                    disabled={filePath === null}
                    onClick={onRowListShow}
                    icon="table"
                  >
                    {t('data.xml.tableShowButton.label')}
                  </Button>
                  <LoaderXmlFormRowList/>
                </Form.Item>
              </Col>
            </Row>
            <Row type="flex" style={{marginBottom: MARGIN_MD}}>
              <Col span={SPAN_FULL}>
                <Form.Item>
                  {form.getFieldDecorator('embargo')(<EmbargoInput disabled={filePath === null}/>)}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={SPAN_ONE_THIRD}>
                <Form.Item>
                  {(() => {

                    const submit = ignoreConcurrentUpload =>
                      onSubmit(
                        importType,
                        cube.IDCube,
                        getArtefactTripletFromString(cube.DSDCode).id,
                        getArtefactTripletFromString(cube.DSDCode).agencyID,
                        getArtefactTripletFromString(cube.DSDCode).version,
                        filePath,
                        tid,
                        cube.Code,
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
                          type="primary"
                          icon="check"
                          disabled={filePath === null}
                        >
                          {t('scenes.dataManager.loader.xmlForm.submitButton.label')}
                        </Button>
                      </Call>
                    );
                  })()}
                </Form.Item>
              </Col>
              <Col span={SPAN_ONE_THIRD}>
                <Form.Item label={t('scenes.dataManager.loader.csvForm.refreshProdDf.label')}>
                  {form.getFieldDecorator('refreshProdDf', {valuePropName: 'checked'})(
                    <Checkbox disabled={filePath === null}/>)}
                </Form.Item>
              </Col>
              <Col span={SPAN_ONE_THIRD}>
                <Form.Item label={t('scenes.dataManager.loader.csvForm.checkFiltAttributes.label')}>
                  {form.getFieldDecorator('checkFiltAttributes', {valuePropName: 'checked'})(
                    <Checkbox disabled={filePath === null}/>)}
                </Form.Item>
              </Col>
            </Row>
          </Call>
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
)(LoaderXmlForm);
