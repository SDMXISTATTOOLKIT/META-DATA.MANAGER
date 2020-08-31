import React, {Fragment} from 'react';
import Call from '../../../hocs/call';
import {
  changeCubeListCubeOwnershipOwners,
  hideCubeListCubeOwnership,
  hideCubeListCurrentDataView,
  readCubeListCubeOwnershipOwnersRead,
  readCubeListCubeOwnershipUsersRead,
  readCubeListCubes,
  readCubeListCurrentDataView,
  removeCubeListCubeEmbargo,
  showCubeListCubeDownload,
  showCubeListCubeOwnership,
  showCubeListCurrentDataView,
  submitCubeListCubeOwnership,
  submitCubeListDeleteCube,
  submitCubeListEmptyCube
} from './actions';
import {translate} from 'react-i18next';
import {
  MARGIN_LG, MARGIN_MD,
  MODAL_WIDTH_LG, SPAN_FULL, SPAN_ONE_QUARTER, SPAN_THREE_QUARTERS,
  TABLE_COL_MIN_WIDTH_ID,
  TABLE_COL_MIN_WIDTH_NAME
} from '../../../styles/constants';
import {connect} from 'react-redux';
import {compose} from 'redux';
import EnhancedModal from '../../../components/enhanced-modal';
import CubeDownload from "./CubeDownload";
import {Button, Col, Form, Icon, Input, Modal, Row} from "antd";
import {getFilterObjFromViewerObj} from "../../../utils/filter";
import {
  BUTTON_DELETE,
  BUTTON_DETAIL,
  BUTTON_DOWNLOAD,
  BUTTON_EMPTY_CUBE,
  BUTTON_INFO,
  BUTTON_MANAGE_OWNERS,
  BUTTON_REMOVE_EMBARGO
} from "../../../styles/buttons";
import ArtefactOwnershipModal from "../../../components/artefact-ownership-modal";
import InfiniteScrollTable from "../../../components/infinite-scroll-table";
import InfiniteScrollDataTable from "../../../components/infinite-scroll-data-table";

const mapStateToProps = state => ({
  cubes: state.scenes.dataManager.cubeList.cubes,
  cubeId: state.scenes.dataManager.cubeList.cubeId,
  currentDataView: state.scenes.dataManager.cubeList.currentDataView,
  isCubeDetailVisible: state.scenes.dataManager.cubeList.isCubeDetailVisible,
  isCubeDownloadVisible: state.scenes.dataManager.cubeList.isCubeDownloadVisible,
  cubeOwnershipCubeId: state.scenes.dataManager.cubeList.cubeOwnershipCubeId,
  permissions: state.app.user.permissions,
  cubeOwnershipUsers: state.scenes.dataManager.cubeList.cubeOwnershipUsers,
  cubeOwnershipOwners: state.scenes.dataManager.cubeList.cubeOwnershipOwners
});

const formItemLayout = {
  labelCol: {span: SPAN_ONE_QUARTER},
  wrapperCol: {span: SPAN_THREE_QUARTERS}
};

const mapDispatchToProps = dispatch => ({
  onCurrentDataViewShow: cubeId => dispatch(showCubeListCurrentDataView(cubeId)),
  onCurrentDataViewHide: () => dispatch(hideCubeListCurrentDataView()),
  fetchCubes: () => dispatch(readCubeListCubes()),
  fetchCurrentDataView: (cubeId, pageNum, pageSize, filterTable, sortCols, sortByDesc) =>
    dispatch(readCubeListCurrentDataView(cubeId, pageNum, pageSize, filterTable, sortCols, sortByDesc)),
  onCubeDownloadShow: cubeId => dispatch(showCubeListCubeDownload(cubeId)),
  onCubeEmbargoRemove: cubeId => dispatch(removeCubeListCubeEmbargo(cubeId)),
  onCubeOwnershipShow: cubeId => dispatch(showCubeListCubeOwnership(cubeId)),
  onCubeOwnershipHide: () => dispatch(hideCubeListCubeOwnership()),
  fetchOwnershipUsers: () => dispatch(readCubeListCubeOwnershipUsersRead()),
  fetchOwnershipOwners: cubeCode => dispatch(readCubeListCubeOwnershipOwnersRead(cubeCode)),
  onCubeOwnershipOwnersChange: owners => dispatch(changeCubeListCubeOwnershipOwners(owners)),
  onCubeOwnershipSubmit: (cubeCode, owners) => dispatch(submitCubeListCubeOwnership(cubeCode, owners)),
  onEmptyCube: cubeId => dispatch(submitCubeListEmptyCube(cubeId)),
  onDeleteCube: cubeId => dispatch(submitCubeListDeleteCube(cubeId))
});

const CubeList = ({
                    t,
                    cubes,
                    cubeId,
                    permissions,
                    currentDataView,
                    onCurrentDataViewShow,
                    onCurrentDataViewHide,
                    fetchCubes,
                    fetchCurrentDataView,
                    isCubeDetailVisible,
                    onCubeDownloadShow,
                    onCubeEmbargoRemove,
                    onCubeOwnershipShow,
                    onCubeOwnershipHide,
                    cubeOwnershipCubeId,
                    cubeOwnershipUsers,
                    cubeOwnershipOwners,
                    fetchOwnershipUsers,
                    fetchOwnershipOwners,
                    onCubeOwnershipOwnersChange,
                    onCubeOwnershipSubmit,
                    onEmptyCube,
                    onDeleteCube
                  }) =>
  <Fragment>
    <EnhancedModal
      visible={cubeId !== null && isCubeDetailVisible}
      title={t('scenes.dataManager.cubeList.currentDataViewModal.title')}
      width={MODAL_WIDTH_LG}
      onCancel={onCurrentDataViewHide}
      footer={<Button onClick={onCurrentDataViewHide}>{t('commons.buttons.close.title')}</Button>}
    >
      <InfiniteScrollDataTable
        data={currentDataView && currentDataView.Data}
        cols={currentDataView && currentDataView.Columns}
        rowTotal={currentDataView && currentDataView.Count}
        hiddenCols={['SID']}
        onChange={
          ({pageNum, pageSize, searchText, filters, sortCol, sortByDesc}) =>
            fetchCurrentDataView(
              cubeId,
              pageNum,
              pageSize,
              getFilterObjFromViewerObj(
                currentDataView &&
                currentDataView.Columns.filter(colName => colName !== 'SID'),
                searchText,
                filters
              ),
              sortCol ? [sortCol] : null,
              sortByDesc
            )
        }
      />
    </EnhancedModal>
    <Call cb={fetchCubes} disabled={cubes !== null}>
      <InfiniteScrollTable
        data={
          cubes
            ? cubes.map(cube => ({
              ...cube,
              view: `Dataset_${cube.IDCube}_ViewCurrentData`,
              fact: `FactS${cube.IDCube}`,
              filter: `FiltS${cube.IDCube}`
            }))
            : null
        }
        getRowKey={cube => cube.Code}
        multilangStrDataIndexes={['labels']}
        columns={[
          {
            title: t('data.cube.id.label'),
            dataIndex: 'Code',
            minWidth: TABLE_COL_MIN_WIDTH_ID
          },
          {
            title: t('data.cube.name.label'),
            dataIndex: 'labels',
            minWidth: TABLE_COL_MIN_WIDTH_NAME
          },
          {
            title: t('data.cube.dsd.label'),
            dataIndex: 'DSDCode',
            minWidth: 150
          },
          {
            title: t('data.cube.lastUpdate.label'),
            dataIndex: 'LastUpdate',
            widthToContent: true,
            render: dateTime => new Date(dateTime).toLocaleString(),
            renderText: dateTime => new Date(dateTime).toLocaleString()
          },
          {
            title: t('data.cube.hasEmbargoedData.shortLabel'),
            dataIndex: 'HasEmbargoedData',
            width: 30,
            withValuesFilter: true,
            render: HasEmbargoedData => HasEmbargoedData
              ? <Icon type="check"/>
              : null,
            renderText: HasEmbargoedData => HasEmbargoedData
              ? t('data.dataflow.hasEmbargoedData.values.true')
              : t('data.dataflow.hasEmbargoedData.values.false')
          }
        ]}
        actions={[
          {
            ...BUTTON_DETAIL,
            title: t('scenes.dataManager.cubeList.actions.detail.title'),
            onClick: ({IDCube}) => onCurrentDataViewShow(IDCube)
          },
          {
            ...BUTTON_INFO,
            title: t('scenes.dataManager.cubeList.actions.info'),
            onClick: ({view, fact, filter}) => Modal.info({
              title: t('scenes.dataManager.cubeList.modals.info.title'),
              content: (
                <Form>
                  <Row style={{marginTop: MARGIN_LG}}>
                    <Col span={SPAN_FULL}>
                      <Form.Item
                        label={t('scenes.dataManager.cubeList.modals.info.view.title')}
                        {...formItemLayout}
                      >
                        <Input value={view} title={view} disabled/>
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row style={{marginTop: MARGIN_MD}}>
                    <Col span={SPAN_FULL}>
                      <Form.Item
                        label={t('scenes.dataManager.cubeList.modals.info.fact.title')}
                        {...formItemLayout}
                      >
                        <Input value={fact} title={fact} disabled/>
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row style={{marginTop: MARGIN_MD}}>
                    <Col span={SPAN_FULL}>
                      <Form.Item
                        label={t('scenes.dataManager.cubeList.modals.info.filter.title')}
                        {...formItemLayout}
                      >
                        <Input value={filter} title={filter} disabled/>
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>
              )
            })
          },
          {
            ...BUTTON_DOWNLOAD,
            title: t('scenes.dataManager.cubeList.actions.download.title'),
            onClick: ({IDCube}) => onCubeDownloadShow(IDCube)
          },
          ({HasEmbargoedData}) => HasEmbargoedData
            ? {
              ...BUTTON_REMOVE_EMBARGO,
              title: t('scenes.dataManager.cubeList.actions.removeEmbargo.title'),
              onClick: ({IDCube}) => Modal.confirm({
                title: t('scenes.dataManager.cubeList.modals.confirms.removeEmbargo.title'),
                onOk() {
                  onCubeEmbargoRemove(IDCube)
                },
                cancelText: t('commons.buttons.cancel.title')
              })
            }
            : null,
          ({Code}) => permissions.cubeOwner.includes(Code)
            ? {
              ...BUTTON_MANAGE_OWNERS,
              title: t('commons.actions.manageOwners.title'),
              onClick: cube => onCubeOwnershipShow(cube.Code)
            }
            : null,
          {
            ...BUTTON_EMPTY_CUBE,
            title: t('commons.actions.emptyCube.title'),
            onClick: ({IDCube}) => Modal.confirm({
              title: t('scenes.dataManager.cubeList.modals.confirms.emptyCube.title'),
              onOk() {
                onEmptyCube(IDCube)
              },
              cancelText: t('commons.buttons.cancel.title')
            })
          },
          {
            ...BUTTON_DELETE,
            title: t('commons.actions.delete.title'),
            onClick: ({IDCube}) => Modal.confirm({
              title: t('scenes.dataManager.cubeList.modals.confirms.delete.title'),
              onOk() {
                onDeleteCube(IDCube)
              },
              cancelText: t('commons.buttons.cancel.title')
            })
          }
        ]}
      />
    </Call>
    <CubeDownload/>
    <ArtefactOwnershipModal
      isVisible={cubeOwnershipCubeId !== null}
      id={cubeOwnershipCubeId}
      onClose={onCubeOwnershipHide}
      users={cubeOwnershipUsers}
      owners={cubeOwnershipOwners}
      fetchUsers={fetchOwnershipUsers}
      fetchOwners={() => fetchOwnershipOwners(cubeOwnershipCubeId)}
      onOwnersChange={onCubeOwnershipOwnersChange}
      onSubmit={() => onCubeOwnershipSubmit(cubeOwnershipCubeId, cubeOwnershipOwners)}
    />
  </Fragment>;

export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps)
)(CubeList);
