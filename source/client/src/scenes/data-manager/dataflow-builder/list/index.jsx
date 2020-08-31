import React from 'react';
import Call from '../../../../hocs/call';
import {
  deleteDataflowBuilderListDataflow,
  editDataflowBuilderListDataflow,
  hideDataflowBuilderListDataflowAnnotations,
  hideDataflowBuilderListDataflowLayoutAnnotations,
  hideDataflowBuilderListDataflowPreview,
  readDataflowBuilderListDataflow,
  readDataflowBuilderListDataflowPreview,
  readDataflowBuilderListDataflows,
  showDataflowBuilderListDataflowAnnotations,
  showDataflowBuilderListDataflowDownload,
  showDataflowBuilderListDataflowLayoutAnnotations,
  showDataflowBuilderListDataflowPreview,
  showDataflowBuilderListDataflowProductionModal,
} from './actions';
import {connect} from 'react-redux';
import {compose} from 'redux';
import {translate} from 'react-i18next';
import {Button, Col, Form, Icon, Input, Modal, Row} from 'antd';
import {
  GUTTER_MD,
  MARGIN_LG,
  MARGIN_MD,
  MODAL_WIDTH_LG,
  SPAN_FULL,
  SPAN_ONE_QUARTER,
  SPAN_THREE_QUARTERS,
  TABLE_COL_MIN_WIDTH_ID,
  TABLE_COL_MIN_WIDTH_NAME
} from '../../../../styles/constants';
import EnhancedModal from '../../../../components/enhanced-modal';
import {openNewTab} from '../../../../middlewares/newTab/actions';
import DataflowBuilderListDataflowProductionModal from './DataflowProductionModal';
import {getFilterStrFromServerQueryObj, getFilterStrFromViewerObj} from "../../../../utils/filter";
import DataflowDownload from "./DataflowDownload";
import {
  BUTTON_CUSTOM_ANNOTATIONS,
  BUTTON_DATA_EXPLORER,
  BUTTON_DELETE,
  BUTTON_DETAIL,
  BUTTON_DOWNLOAD,
  BUTTON_INFO,
  BUTTON_LAYOUT_ANNOTATIONS,
  BUTTON_PREVIEW,
  BUTTON_PUBLISH
} from "../../../../styles/buttons";
import DataflowBuilderCategorisations from "../tree";
import DataflowBuilderWizard from "../wizard";
import {showDataflowBuilderTree} from "../tree/actions";
import {showDataflowBuilderWizard} from "../wizard/actions";
import CustomAnnotationList from "../../../../components/custom-annotation-list";
import LayoutAnnotationList from "../../../../components/layout-annotation-list";
import {countCustomAnnotations, countLayoutAnnotations} from "../../../../utils/annotations";
import InfiniteScrollTable from "../../../../components/infinite-scroll-table";
import InfiniteScrollDataTable from "../../../../components/infinite-scroll-data-table";

const mapStateToProps = state => ({
  dataflows: state.scenes.dataManager.dataflowBuilder.shared.dataflows,
  dataflowId: state.scenes.dataManager.dataflowBuilder.components.list.dataflowId,
  dataflow: state.scenes.dataManager.dataflowBuilder.components.list.dataflow,
  dataflowPreview: state.scenes.dataManager.dataflowBuilder.components.list.dataflowPreview,
  nodeId: state.app.endpointId,
  nodes: state.config.nodes,
  dataflowAnnotations: state.scenes.dataManager.dataflowBuilder.components.list.dataflowAnnotations,
  dataflowLayoutAnnotations: state.scenes.dataManager.dataflowBuilder.components.list.dataflowLayoutAnnotations,
  endpoints: state.config.nodes,
  endpointId: state.app.endpointId,
  username: state.app.user.username
});

const mapDispatchToProps = dispatch => ({
  onCategorisationsShow: () => dispatch(showDataflowBuilderTree()),
  onWizardShow: () => dispatch(showDataflowBuilderWizard()),
  onDataflowEdit: (ddbDataflowId, dataflowTriplet, cubeId, filter) =>
    dispatch(editDataflowBuilderListDataflow(ddbDataflowId, dataflowTriplet, cubeId, filter)),
  onDataflowDelete: ddbDataflowId => dispatch(deleteDataflowBuilderListDataflow(ddbDataflowId)),
  onDataflowPreviewShow: dataflowId => dispatch(showDataflowBuilderListDataflowPreview(dataflowId)),
  onDataflowPreviewHide: () => dispatch(hideDataflowBuilderListDataflowPreview()),
  onDataflowProductionModalShow: (ddbDataflowId, dataflowTriplet) => dispatch(showDataflowBuilderListDataflowProductionModal(ddbDataflowId, dataflowTriplet)),
  onOpenNewTab: url => dispatch(openNewTab(url)),
  fetchDataflows: () =>
    dispatch(readDataflowBuilderListDataflows()),
  fetchDataflow: dataflowId => dispatch(readDataflowBuilderListDataflow(dataflowId)),
  fetchDataflowPreview: (cubeId, cubeColumns, filterStr, pageNum, pageSize, sortCols, sortByDesc) =>
    dispatch(readDataflowBuilderListDataflowPreview(cubeId, cubeColumns, filterStr, pageNum, pageSize, sortCols, sortByDesc)),
  onDownloadShow: (ddbDataflowId, cubeId, dataflowTriplet, dsdTriplet) =>
    dispatch(showDataflowBuilderListDataflowDownload(ddbDataflowId, cubeId, dataflowTriplet, dsdTriplet)),
  onAnnotationsShow: annotations => dispatch(showDataflowBuilderListDataflowAnnotations(annotations)),
  onAnnotationsHide: () => dispatch(hideDataflowBuilderListDataflowAnnotations()),
  onLayoutAnnotationsShow: annotations => dispatch(showDataflowBuilderListDataflowLayoutAnnotations(annotations)),
  onLayoutAnnotationsHide: () => dispatch(hideDataflowBuilderListDataflowLayoutAnnotations()),
});

const formItemLayout = {
  labelCol: {span: SPAN_ONE_QUARTER},
  wrapperCol: {span: SPAN_THREE_QUARTERS}
};

const DataflowBuilderList = ({
                               t,
                               dataflows,
                               dataflowId,
                               dataflow,
                               dataflowPreview,
                               nodes,
                               nodeId,
                               onCategorisationsShow,
                               onWizardShow,
                               onDataflowEdit,
                               onDataflowDelete,
                               onDataflowPreviewShow,
                               onDataflowPreviewHide,
                               onOpenNewTab,
                               onDataflowProductionModalShow,
                               fetchDataflows,
                               fetchDataflow,
                               fetchDataflowPreview,
                               onDownloadShow,
                               dataflowAnnotations,
                               dataflowLayoutAnnotations,
                               onAnnotationsShow,
                               onAnnotationsHide,
                               onLayoutAnnotationsShow,
                               onLayoutAnnotationsHide,
                               endpointId,
                               endpoints,
                               username
                             }) => {

  const productionAction = {
    ...BUTTON_PUBLISH,
    title: t('scenes.dataManager.dataflowBuilder.list.actions.production.title'),
    onClick: ({IDDataflow, ID, Agency, Version}) => onDataflowProductionModalShow(IDDataflow, {
      id: ID,
      agencyID: Agency,
      version: Version
    }),
  };
  const actions = [
    {
      ...BUTTON_PREVIEW,
      title: t('scenes.dataManager.dataflowBuilder.list.actions.preview'),
      onClick: ({IDDataflow}) => onDataflowPreviewShow(IDDataflow)
    },
    {
      ...BUTTON_INFO,
      title: t('scenes.dataManager.dataflowBuilder.list.actions.info'),
      onClick: ({cubeID, viewName}) => Modal.info({
        title: t('scenes.dataManager.dataflowBuilder.modals.info.title'),
        content: (
          <Form>
            <Row style={{marginTop: MARGIN_LG}}>
              <Col span={SPAN_FULL}>
                <Form.Item
                  label={t('data.dataflow.cubeID.shortLabel')}
                  {...formItemLayout}
                >
                  <Input value={cubeID} title={cubeID} disabled/>
                </Form.Item>
              </Col>
            </Row>
            <Row style={{marginTop: MARGIN_MD}}>
              <Col span={SPAN_FULL}>
                <Form.Item
                  label={t('data.dataflow.viewName.shortLabel')}
                  {...formItemLayout}
                >
                  <Input value={viewName} title={viewName} disabled/>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        )
      })
    },
    {
      ...BUTTON_DETAIL,
      title: t('scenes.dataManager.dataflowBuilder.list.actions.edit'),
      onClick: ({IDDataflow, ID, Agency, Version, IDCube, Filter}) =>
        onDataflowEdit(
          IDDataflow,
          {
            id: ID,
            agencyID: Agency,
            version: Version
          },
          IDCube,
          Filter
        )
    },
    {
      ...BUTTON_DOWNLOAD,
      title: t('scenes.dataManager.dataflowBuilder.list.actions.download'),
      onClick: ({IDDataflow, IDCube, ID, Agency, Version, dsdTriplet}) => onDownloadShow(
        IDDataflow,
        IDCube,
        {
          id: ID,
          agencyID: Agency,
          version: Version
        },
        dsdTriplet
      )
    },
    {
      ...BUTTON_DELETE,
      title: t('scenes.dataManager.dataflowBuilder.list.actions.delete.title'),
      onClick: ({IDDataflow, haveMetadata}) => haveMetadata
        ? Modal.warning({
          title: t('scenes.dataManager.dataflowBuilder.list.actions.delete.haveMetadata.title')
        })
        : Modal.confirm({
          title: t('scenes.dataManager.dataflowBuilder.list.actions.delete.confirm'),
          onOk() {
            onDataflowDelete(IDDataflow);
          },
          cancelText: t('commons.buttons.cancel.title')
        })
    }
  ];

  const annotationsConfig = endpoints.find(endpoint => endpoint.general.id === endpointId).annotations;
  const customAnnotationsConfig = endpoints.filter(endpoint => endpoint.general.id === endpointId)[0].annotationTabs.tabs;

  return (
    <Call
      cb={fetchDataflows}
      disabled={dataflows !== null}
    >
      <InfiniteScrollTable
        data={dataflows}
        getRowKey={({IDDataflow}) => IDDataflow}
        getIsAltRow={({isProduction}) => isProduction}
        columns={[
          {
            title: t('data.artefact.id.shortLabel'),
            dataIndex: 'ID',
            minWidth: TABLE_COL_MIN_WIDTH_ID
          },
          {
            title: t('data.artefact.agencyID.shortLabel'),
            dataIndex: 'Agency',
          },
          {
            title: t('data.artefact.name.shortLabel'),
            dataIndex: 'labels',
            minWidth: TABLE_COL_MIN_WIDTH_NAME
          },
          {
            title: t('data.artefact.version.shortLabel'),
            dataIndex: 'Version',
            widthToContent: true,
            withValuesFilter: true
          },
          {
            title: t('data.dataflow.hasTranscoding.shortLabel'),
            dataIndex: 'HasTranscoding',
            width: 30,
            withValuesFilter: true,
            render: hasTranscoding => hasTranscoding
              ? <Icon type="check"/>
              : null,
            renderText: hasTranscoding => hasTranscoding
              ? t('data.dataflow.hasTranscoding.values.true')
              : t('data.dataflow.hasTranscoding.values.false')
          },
          {
            title: t('data.dataflow.hasContentConstraint.shortLabel'),
            dataIndex: 'HasContentConstraints',
            width: 30,
            withValuesFilter: true,
            render: hasContentConstraints => hasContentConstraints
              ? <Icon type="check"/>
              : null,
            renderText: hasContentConstraints => hasContentConstraints
              ? t('data.dataflow.hasContentConstraints.values.true')
              : t('data.dataflow.hasContentConstraints.values.false')
          },
          {
            title: t('data.dataflow.isProduction.shortLabel'),
            dataIndex: 'isProduction',
            width: 30,
            withValuesFilter: true,
            render: isProduction => isProduction
              ? <Icon type="check"/>
              : null,
            renderText: isProduction => isProduction
              ? t('data.dataflow.isProduction.values.true')
              : t('data.dataflow.isProduction.values.false')
          }
        ]}
        multilangStrDataIndexes={['labels']}
        actions={[
          productionAction,
          ...actions
        ]}
        altActions={[
          productionAction,
          {
            ...BUTTON_DATA_EXPLORER,
            title: t('scenes.dataManager.dataflowBuilder.list.actions.dataExplorerPreview'),
            onClick: ({ID, Agency, Version}) =>
              onOpenNewTab(
                nodes.filter(node => node.general.id === nodeId)[0].endpoint.dataExplorerBaseURL +
                `&code=${encodeURIComponent(ID)}` +
                `&agencyId=${encodeURIComponent(Agency)}` +
                `&version=${encodeURIComponent(Version)}`
              )
          },
          ...actions
        ]}
        fixedActions={
          [
            ({annotations}) => {
              const customAnnotationsCount = countCustomAnnotations(annotations, customAnnotationsConfig);
              return (customAnnotationsCount > 0 && onAnnotationsShow)
                ? {
                  ...BUTTON_CUSTOM_ANNOTATIONS,
                  title: t('commons.actions.customAnnotations.title') + ": " + customAnnotationsCount,
                  onClick: () => onAnnotationsShow(annotations)
                }
                : null;
            }
          ]
            .concat((username && onLayoutAnnotationsShow)
              ? ({annotations}) => {
                const layoutAnnotationsCount = countLayoutAnnotations(annotations, annotationsConfig);
                return (layoutAnnotationsCount > 0)
                  ? {
                    ...BUTTON_LAYOUT_ANNOTATIONS,
                    title: t('commons.actions.layoutAnnotations.title') + ": " + layoutAnnotationsCount,
                    onClick: () => onLayoutAnnotationsShow(annotations)
                  }
                  : null
              }
              : []
            )
        }
        rightActions={
          <Row type="flex" justify="end" gutter={GUTTER_MD}>
            <Col>
              <Button onClick={onCategorisationsShow}>
                {t('scenes.dataManager.dataflowBuilder.categorisationsShowButton')}
              </Button>
              <DataflowBuilderCategorisations/>
            </Col>
            <Col>
              <Button onClick={onWizardShow} type="primary" icon="plus">
                {t('scenes.dataManager.dataflowBuilder.wizardShowButton')}
              </Button>
              <DataflowBuilderWizard/>
            </Col>
          </Row>
        }
      />
      <Call cb={fetchDataflow} cbParam={dataflowId} disabled={dataflowId === null}>
        <EnhancedModal
          visible={dataflowId !== null}
          onCancel={onDataflowPreviewHide}
          footer={<Button onClick={onDataflowPreviewHide}>{t('commons.buttons.close.title')}</Button>}
          width={MODAL_WIDTH_LG}
          title={t('scenes.dataManager.dataflowBuilder.list.previewModal.title')}
        >
          {dataflow !== null && (
            <InfiniteScrollDataTable
              data={dataflowPreview && dataflowPreview.Data}
              cols={dataflowPreview && dataflowPreview.Columns}
              rowTotal={dataflowPreview && dataflowPreview.Count}
              onChange={
                ({pageNum, pageSize, searchText, filters, sortCol, sortByDesc}) => fetchDataflowPreview(
                  dataflow !== null ? dataflow.IDCube : null,
                  dataflow !== null ? dataflow.DataflowColumns : null,
                  getFilterStrFromViewerObj(
                    dataflowPreview && dataflowPreview.Columns.filter(colName => colName !== '_OBS_VALUE'),
                    searchText,
                    filters,
                    dataflow !== null ? getFilterStrFromServerQueryObj(dataflow.Filter) : null
                  ),
                  pageNum,
                  pageSize,
                  sortCol ? [sortCol] : null,
                  sortByDesc
                )
              }
            />
          )}
        </EnhancedModal>
      </Call>
      <DataflowBuilderListDataflowProductionModal/>
      <DataflowDownload/>
      <CustomAnnotationList
        annotations={dataflowAnnotations}
        onClose={onAnnotationsHide}
      />
      <LayoutAnnotationList
        annotations={dataflowLayoutAnnotations}
        onClose={onLayoutAnnotationsHide}
      />
    </Call>
  );
};

export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps)
)(DataflowBuilderList);
