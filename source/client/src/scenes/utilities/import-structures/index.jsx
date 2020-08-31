import React, {Fragment} from 'react';
import {Button, Col, Form, Icon, Row} from "antd";
import {
  GUTTER_MD,
  MARGIN_MD,
  SPAN_FULL,
  TABLE_COL_MIN_WIDTH_ID,
  TABLE_COL_MIN_WIDTH_NAME
} from "../../../styles/constants";
import {
  changeImportStructuresForm,
  hideImportStructuresReport,
  resetImportStructures,
  selectImportStructuresAllItems,
  selectImportStructuresItem,
  submitImportStructures,
  uploadImportStructuresFile
} from "./actions";
import _ from 'lodash';
import {getArtefactTripletFromUrn, getStringFromArtefactTriplet} from "../../../utils/sdmxJson";
import EnhancedModal from "../../../components/enhanced-modal";
import FileInput from "../../../components/file-input";
import {connect} from "react-redux";
import {compose} from "redux";
import {translate} from 'react-i18next';
import InfiniteScrollTable from "../../../components/infinite-scroll-table";

const mapStateToProps = state => ({
  file: state.scenes.utilities.importStructures.file,
  items: state.scenes.utilities.importStructures.items,
  hash: state.scenes.utilities.importStructures.hash,
  report: state.scenes.utilities.importStructures.report,
  selectedItems: state.scenes.utilities.importStructures.selectedItems
});

const mapDispatchToProps = dispatch => ({
  onChange: fields => dispatch(changeImportStructuresForm(fields)),
  onFileUpload: file => dispatch(uploadImportStructuresFile(file)),
  onSubmit: (structures, hash) => dispatch(submitImportStructures(structures, hash)),
  onReportHide: () => dispatch(hideImportStructuresReport()),
  onReset: () => dispatch(resetImportStructures()),
  onItemSelect: (item, selected) => dispatch(selectImportStructuresItem(item, selected)),
  onAllItemsSelect: items => dispatch(selectImportStructuresAllItems(items))
});

const mapPropsToFields = ({file}) => ({
  file: Form.createFormField({value: file})
});

const onFieldsChange = (props, fields) =>
  props.onChange(_.mapValues(fields, ({value}) => value));

const IMPORT_STRUCTURES_REPORT_STATUS_SUCCESS = "Success";
const IMPORT_STRUCTURES_REPORT_STATUS_WARNING = "Warning";
const IMPORT_STRUCTURES_REPORT_STATUS_ERROR = "Error";
const IMPORT_STRUCTURES_REPORT_STATUS_FAILURE = "Failure";

const ImportStructures = ({
                            t,
                            form,
                            file,
                            items,
                            selectedItems,
                            hash,
                            report,
                            onFileUpload,
                            onSubmit,
                            onReportHide,
                            onReset,
                            onItemSelect,
                            onAllItemsSelect
                          }) =>
  <Fragment>
    <EnhancedModal
      visible={report !== null}
      title={t('scenes.utilities.importStructures.reportModal.title')}
      onCancel={onReportHide}
      footer={<Button onClick={onReportHide}>{t('commons.buttons.close.title')}</Button>}
    >
      {
        items !== null && report !== null
          ? (
            report.map(({maintainableObject, status, result}, index) => {
              const triplet = getArtefactTripletFromUrn(maintainableObject);
              return (
                <Fragment key={index}>
                  <Row type="flex" justify="space-between" style={index > 0 ? {marginTop: MARGIN_MD} : null}>
                    <Col>
                      {(() => {
                        const item = items.filter(item =>
                          item.id === triplet.id && item.agency === triplet.agencyID && item.version === triplet.version
                        )[0];
                        return (
                          item.type + " " +
                          "[" + getStringFromArtefactTriplet(triplet) + "] " +
                          (item.isFinal
                              ? t("data.artefact.isFinal.values.final")
                              : t("data.artefact.isFinal.values.notFinal")
                          ).toLowerCase()
                        );
                      })()}
                    </Col>
                    <Col>
                      {status === IMPORT_STRUCTURES_REPORT_STATUS_SUCCESS && (
                        <Fragment>
                          {`${t('scenes.utilities.importStructures.reportModal.status.success')} `}
                          <Icon type="check-circle" theme="filled" style={{color: 'green'}}/>
                        </Fragment>
                      )}
                      {status === IMPORT_STRUCTURES_REPORT_STATUS_WARNING && (
                        <Fragment>
                          {`${t('scenes.utilities.importStructures.reportModal.status.warning')} `}
                          <Icon type="exclamation-circle" theme="filled" style={{color: 'orange'}}/>
                        </Fragment>
                      )}
                      {status === IMPORT_STRUCTURES_REPORT_STATUS_ERROR && (
                        <Fragment>
                          {`${t('scenes.utilities.importStructures.reportModal.status.error')} `}
                          <Icon type="close-circle" theme="filled" style={{color: 'red'}}/>
                        </Fragment>
                      )}
                      {status === IMPORT_STRUCTURES_REPORT_STATUS_FAILURE && (
                        <Fragment>
                          {`${t('scenes.utilities.importStructures.reportModal.status.error')} `}
                          <Icon type="close-circle" theme="filled" style={{color: 'red'}}/>
                        </Fragment>
                      )}
                    </Col>
                  </Row>
                  {status !== IMPORT_STRUCTURES_REPORT_STATUS_SUCCESS && (
                    <i>{result}</i>
                  )}
                </Fragment>
              );
            })
          )
          : null
      }
    </EnhancedModal>
    <Row type="flex" justify="center">
      <Col span={SPAN_FULL}>
        <Row type="flex" justify="center">
          <Col>
            <Row type="flex" align="middle" gutter={GUTTER_MD} justify="center">
              <Col style={{width: 480}}>
                <Form className="advanced-form">
                  <Form.Item className="form-item-required" label={t('data.csv.file.label')}>
                    {form.getFieldDecorator('file')(
                      <FileInput accept={".xml"}/>
                    )}
                  </Form.Item>
                </Form>
              </Col>
              <Col>
                <Button
                  icon="upload"
                  type="primary"
                  onClick={() => onFileUpload(file)}
                  disabled={file === null}
                >
                  {t('data.xml.uploadButton.label')}
                </Button>
              </Col>
              {items !== null && (
                <Col>
                  <Button
                    icon="delete"
                    onClick={onReset}
                    disabled={items === null}
                  >
                    {t('scenes.utilities.importStructures.resetButton.label')}
                  </Button>
                </Col>
              )}
            </Row>
          </Col>
        </Row>
        {items !== null && file !== null && (
          <Fragment>
            <Row type="flex" style={{marginTop: MARGIN_MD}}>
              <Col span={SPAN_FULL}>
                <InfiniteScrollTable
                  data={items}
                  getRowKey={({id, agency, version, type}) => type + getStringFromArtefactTriplet({id, agencyID: agency, version})}
                  showAllRows
                  getIsDisabledRow={({isOk}) => !isOk}
                  columns={[
                    {
                      title: t('data.artefact.type.shortLabel'),
                      dataIndex: 'type',
                      minWidth: TABLE_COL_MIN_WIDTH_ID,
                      withValuesFilter: true
                    },
                    {
                      title: t('data.artefact.id.shortLabel'),
                      dataIndex: 'id',
                      minWidth: TABLE_COL_MIN_WIDTH_ID
                    },
                    {
                      title: t('data.artefact.agencyID.shortLabel'),
                      dataIndex: 'agency',
                      widthToContent: true,
                      withValuesFilter: true
                    },
                    {
                      title: t('data.artefact.name.shortLabel'),
                      dataIndex: 'name',
                      minWidth: TABLE_COL_MIN_WIDTH_NAME
                    },
                    {
                      title: t('data.artefact.version.shortLabel'),
                      dataIndex: 'version',
                      widthToContent: true,
                      withValuesFilter: true
                    },
                    {
                      title: t('data.artefact.isFinal.shortLabel'),
                      dataIndex: "isFinal",
                      width: 30,
                      withValuesFilter: true,
                      render: isFinal => isFinal
                        ? <Icon type="check"/>
                        : null,
                      renderText: isFinal => isFinal
                        ? t('data.artefact.isFinal.values.final')
                        : t('data.artefact.isFinal.values.notFinal')
                    }
                  ]}
                  multilangStrDataIndexes={['name']}
                  rowSelection={{
                    selectedRowKeys: (selectedItems || []).map(({id, agency, version, type}) =>
                      type + getStringFromArtefactTriplet({id, agencyID: agency, version})
                    ),
                    getCheckboxProps: ({isOk}) => ({
                      disabled: !isOk
                    }),
                    onSelect: (itemKey, selected) => onItemSelect(
                      items.find(({id, agency, version, type}) =>
                        type + getStringFromArtefactTriplet({id, agencyID: agency, version}) === itemKey),
                      selected
                    ),
                    onSelectAll: selected => selected
                      ? onAllItemsSelect(items.filter(({isOk}) => isOk))
                      : onAllItemsSelect(null)
                  }}
                  rightActions={
                    <Button
                      icon="check"
                      type="primary"
                      onClick={() => onSubmit(selectedItems, hash)}
                      disabled={!selectedItems || selectedItems.length === 0}
                    >
                      {t('scenes.utilities.importStructures.table.import.submit.title')}
                    </Button>
                  }
                />
              </Col>
            </Row>
          </Fragment>
        )}
      </Col>
    </Row>
  </Fragment>;

export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps),
  Form.create({mapPropsToFields, onFieldsChange})
)(ImportStructures);
