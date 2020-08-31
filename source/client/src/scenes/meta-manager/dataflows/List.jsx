import React from 'react';
import {translate} from 'react-i18next';
import {compose} from "redux";
import Call from "../../../hocs/call";
import {
  changeDataflowsDataflowOwnershipOwners,
  createDataflowsDataflow,
  deleteDataflowsDataflow,
  deleteDataflowsSelectedDataflows,
  editDataflowsDataflow,
  hideDataflowsDataflowContentConstraints,
  hideDataflowsDataflowOwnership,
  hideDataflowsDataflowParentsAndChildren,
  hideDataflowsDetailAnnotations,
  hideDataflowsDetailLayoutAnnotations,
  readDataflowsDataflowOwnershipOwnersRead,
  readDataflowsDataflowOwnershipUsersRead,
  readDataflowsDataflowParentsAndChildren,
  readDataflowsListDataflows,
  showDataflowsDataflowClone,
  showDataflowsDataflowContentConstraints,
  showDataflowsDataflowDownload,
  showDataflowsDataflowExport,
  showDataflowsDataflowOwnership,
  showDataflowsDetailAnnotations,
  showDataflowsDetailLayoutAnnotations,
  submitDataflowsDataflowOwnership
} from "./actions";
import {connect} from "react-redux";
import CustomAnnotationList from "../../../components/custom-annotation-list";
import ArtefactList from "../../../components/artefact-list";
import LayoutAnnotationList from "../../../components/layout-annotation-list";
import ArtefactOwnershipModal from "../../../components/artefact-ownership-modal";
import ContentConstraintList from "./ContentConstraintList";
import {getStringFromArtefactTriplet} from "../../../utils/sdmxJson";

const mapStateToProps = state => ({
  dataflows: state.scenes.metaManager.dataflows.dataflows,
  permissions: state.app.user.permissions,
  dataflowAnnotations: state.scenes.metaManager.dataflows.dataflowAnnotations,
  dataflowLayoutAnnotations: state.scenes.metaManager.dataflows.dataflowLayoutAnnotations,
  dataflowAnnotationTriplet: state.scenes.metaManager.dataflows.dataflowAnnotationTriplet,
  dataflowOwnershipDataflowTripletStr: state.scenes.metaManager.dataflows.dataflowOwnershipDataflowTripletStr,
  dataflowOwnershipUsers: state.scenes.metaManager.dataflows.dataflowOwnershipUsers,
  dataflowOwnershipOwners: state.scenes.metaManager.dataflows.dataflowOwnershipOwners,
  parentsAndChildren: state.scenes.metaManager.dataflows.parentsAndChildren
});

const mapDispatchToProps = dispatch => ({
  onCreate: () => dispatch(createDataflowsDataflow()),
  onDetail: dataflowTriplet => dispatch(editDataflowsDataflow(dataflowTriplet)),
  fetchDataflows: () => dispatch(readDataflowsListDataflows()),
  onDataflowDelete: dataflowTriplet => dispatch(deleteDataflowsDataflow(dataflowTriplet)),
  onAnnotationsShow: (annotations, triplet) => dispatch(showDataflowsDetailAnnotations(annotations, triplet)),
  onAnnotationsHide: () => dispatch(hideDataflowsDetailAnnotations()),
  onLayoutAnnotationsShow: (annotations, triplet) => dispatch(showDataflowsDetailLayoutAnnotations(annotations, triplet)),
  onLayoutAnnotationsHide: () => dispatch(hideDataflowsDetailLayoutAnnotations()),
  onSelectedDataflowsDelete: dataflowTriplets => dispatch(deleteDataflowsSelectedDataflows(dataflowTriplets)),
  onDownloadShow: (dataflowTriplets, lang) => dispatch(showDataflowsDataflowDownload(dataflowTriplets, lang)),
  onCloneShow: artefactTriplet => dispatch(showDataflowsDataflowClone(artefactTriplet)),
  onExportShow: sourceTriplet => dispatch(showDataflowsDataflowExport(sourceTriplet)),
  onDataflowOwnershipShow: dataflowTripletStr => dispatch(showDataflowsDataflowOwnership(dataflowTripletStr)),
  onDataflowOwnershipHide: () => dispatch(hideDataflowsDataflowOwnership()),
  fetchOwnershipUsers: () => dispatch(readDataflowsDataflowOwnershipUsersRead()),
  fetchOwnershipOwners: dataflowTripletStr => dispatch(readDataflowsDataflowOwnershipOwnersRead(dataflowTripletStr)),
  onDataflowOwnershipOwnersChange: owners => dispatch(changeDataflowsDataflowOwnershipOwners(owners)),
  onDataflowOwnershipSubmit: (dataflowTripletStr, owners) => dispatch(submitDataflowsDataflowOwnership(dataflowTripletStr, owners)),
  fetchParentsAndChildren: (artefactType, artefactTriplet) =>
    dispatch(readDataflowsDataflowParentsAndChildren(artefactType, artefactTriplet)),
  onParentsAndChildrenHide: () => dispatch(hideDataflowsDataflowParentsAndChildren()),
  onContentConstraintsShow: dataflowTriplet => dispatch(showDataflowsDataflowContentConstraints(dataflowTriplet)),
  onContentConstraintsHide: () => dispatch(hideDataflowsDataflowContentConstraints()),
});

const DataflowsList = ({
                         dataflows,
                         permissions,
                         onCreate,
                         onDetail,
                         fetchDataflows,
                         onDataflowDelete,
                         dataflowAnnotations,
                         dataflowLayoutAnnotations,
                         dataflowAnnotationTriplet,
                         onAnnotationsShow,
                         onAnnotationsHide,
                         onLayoutAnnotationsShow,
                         onLayoutAnnotationsHide,
                         onSelectedDataflowsDelete,
                         onDownloadShow,
                         onCloneShow,
                         onExportShow,
                         dataflowOwnershipDataflowTripletStr,
                         dataflowOwnershipUsers,
                         dataflowOwnershipOwners,
                         onDataflowOwnershipShow,
                         onDataflowOwnershipHide,
                         fetchOwnershipUsers,
                         fetchOwnershipOwners,
                         onDataflowOwnershipOwnersChange,
                         onDataflowOwnershipSubmit,
                         parentsAndChildren,
                         fetchParentsAndChildren,
                         onParentsAndChildrenHide,
                         onContentConstraintsShow
                       }) =>
  <Call cb={fetchDataflows} disabled={dataflows !== null}>
    <ArtefactList
      artefacts={dataflows}
      onDetailShow={onDetail}
      onCreate={onCreate}
      onDownloadShow={onDownloadShow}
      onCloneShow={onCloneShow}
      onExportShow={onExportShow}
      onDelete={onDataflowDelete}
      onSelectedItemDelete={onSelectedDataflowsDelete}
      onAnnotationsShow={onAnnotationsShow}
      onLayoutAnnotationsShow={onLayoutAnnotationsShow}
      onOwnershipShow={onDataflowOwnershipShow}
      ownershipPermissions={permissions ? permissions.dataflowOwner : null}
      parentsAndChildren={parentsAndChildren}
      fetchParentsAndChildren={triplet => fetchParentsAndChildren("dataflow", triplet)}
      onParentsAndChildrenHide={onParentsAndChildrenHide}
      onContentConstraintsShow={onContentConstraintsShow}
    />
    <CustomAnnotationList
      annotations={dataflowAnnotations}
      onClose={onAnnotationsHide}
      title={dataflowAnnotationTriplet
        ? getStringFromArtefactTriplet(dataflowAnnotationTriplet)
        : null
      }
    />
    <LayoutAnnotationList
      annotations={dataflowLayoutAnnotations}
      onClose={onLayoutAnnotationsHide}
      title={dataflowAnnotationTriplet
        ? getStringFromArtefactTriplet(dataflowAnnotationTriplet)
        : null
      }
    />
    <ArtefactOwnershipModal
      isVisible={dataflowOwnershipDataflowTripletStr !== null}
      id={dataflowOwnershipDataflowTripletStr}
      onClose={onDataflowOwnershipHide}
      users={dataflowOwnershipUsers}
      owners={dataflowOwnershipOwners}
      fetchUsers={fetchOwnershipUsers}
      fetchOwners={() => fetchOwnershipOwners(dataflowOwnershipDataflowTripletStr)}
      onOwnersChange={onDataflowOwnershipOwnersChange}
      onSubmit={() => onDataflowOwnershipSubmit(dataflowOwnershipDataflowTripletStr, dataflowOwnershipOwners)}
    />
    <ContentConstraintList/>
  </Call>;

export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps)
)(DataflowsList);
