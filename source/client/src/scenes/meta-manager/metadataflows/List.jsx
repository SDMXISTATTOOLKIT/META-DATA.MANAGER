import React from 'react';
import {translate} from 'react-i18next';
import {compose} from "redux";
import Call from "../../../hocs/call";
import {
  changeMetadataflowsMetadataflowOwnershipOwners,
  createMetadataflowsMetadataflow,
  deleteMetadataflowsMetadataflow,
  deleteMetadataflowsSelectedMetadataflows,
  editMetadataflowsMetadataflow,
  hideMetadataflowsDetailAnnotations,
  hideMetadataflowsMetadataflowOwnership,
  hideMetadataflowsMetadataflowParentsAndChildren,
  readMetadataflowsListMetadataflows,
  readMetadataflowsMetadataflowOwnershipOwnersRead,
  readMetadataflowsMetadataflowOwnershipUsersRead,
  readMetadataflowsMetadataflowParentsAndChildren,
  showMetadataflowsDetailAnnotations,
  showMetadataflowsMetadataflowClone,
  showMetadataflowsMetadataflowDownload,
  showMetadataflowsMetadataflowExport,
  showMetadataflowsMetadataflowOwnership,
  submitMetadataflowsMetadataflowOwnership
} from "./actions";
import {connect} from "react-redux";
import CustomAnnotationList from "../../../components/custom-annotation-list";
import ArtefactList from "../../../components/artefact-list";
import ArtefactOwnershipModal from "../../../components/artefact-ownership-modal";
import {getStringFromArtefactTriplet} from "../../../utils/sdmxJson";

const mapStateToProps = state => ({
  permissions: state.app.user.permissions,
  metadataflows: state.scenes.metaManager.metadataflows.metadataflows,
  metadataflowAnnotations: state.scenes.metaManager.metadataflows.metadataflowAnnotations,
  metadataflowAnnotationTriplet: state.scenes.metaManager.metadataflows.metadataflowAnnotationTriplet,
  metadataflowOwnershipMetadataflowTripletStr: state.scenes.metaManager.metadataflows.metadataflowOwnershipMetadataflowTripletStr,
  metadataflowOwnershipUsers: state.scenes.metaManager.metadataflows.metadataflowOwnershipUsers,
  metadataflowOwnershipOwners: state.scenes.metaManager.metadataflows.metadataflowOwnershipOwners,
  parentsAndChildren: state.scenes.metaManager.metadataflows.parentsAndChildren
});

const mapDispatchToProps = dispatch => ({
  onCreate: () => dispatch(createMetadataflowsMetadataflow()),
  onDetail: metadataflowTriplet => dispatch(editMetadataflowsMetadataflow(metadataflowTriplet)),
  fetchMetadataflows: () => dispatch(readMetadataflowsListMetadataflows()),
  onDelete: metadataflowTriplet => dispatch(deleteMetadataflowsMetadataflow(metadataflowTriplet)),
  onAnnotationsShow: (annotations, triplet) => dispatch(showMetadataflowsDetailAnnotations(annotations, triplet)),
  onAnnotationsHide: () => dispatch(hideMetadataflowsDetailAnnotations()),
  onSelectedMetadataflowsDelete: metadataflowTriplets => dispatch(deleteMetadataflowsSelectedMetadataflows(metadataflowTriplets)),
  onDownloadShow: (artefactTriplets, lang) => dispatch(showMetadataflowsMetadataflowDownload(artefactTriplets, lang)),
  onCloneShow: artefactTriplet => dispatch(showMetadataflowsMetadataflowClone(artefactTriplet)),
  onExportShow: sourceTriplet => dispatch(showMetadataflowsMetadataflowExport(sourceTriplet)),
  onOwnershipShow: dataflowTripletStr => dispatch(showMetadataflowsMetadataflowOwnership(dataflowTripletStr)),
  onOwnershipHide: () => dispatch(hideMetadataflowsMetadataflowOwnership()),
  fetchOwnershipUsers: () => dispatch(readMetadataflowsMetadataflowOwnershipUsersRead()),
  fetchOwnershipOwners: metadataflowTripletStr => dispatch(readMetadataflowsMetadataflowOwnershipOwnersRead(metadataflowTripletStr)),
  onOwnershipOwnersChange: owners => dispatch(changeMetadataflowsMetadataflowOwnershipOwners(owners)),
  onOwnershipSubmit: (dataflowTripletStr, owners) => dispatch(submitMetadataflowsMetadataflowOwnership(dataflowTripletStr, owners)),
  fetchParentsAndChildren: (artefactType, artefactTriplet) =>
    dispatch(readMetadataflowsMetadataflowParentsAndChildren(artefactType, artefactTriplet)),
  onParentsAndChildrenHide: () => dispatch(hideMetadataflowsMetadataflowParentsAndChildren())
});

const MetadataflowsList = ({
                             metadataflows,
                             permissions,
                             onCreate,
                             onDetail,
                             fetchMetadataflows,
                             onDelete,
                             metadataflowAnnotations,
                             metadataflowAnnotationTriplet,
                             onAnnotationsShow,
                             onAnnotationsHide,
                             onSelectedMetadataflowsDelete,
                             onDownloadShow,
                             onCloneShow,
                             onExportShow,
                             metadataflowOwnershipMetadataflowTripletStr,
                             metadataflowOwnershipUsers,
                             metadataflowOwnershipOwners,
                             onOwnershipShow,
                             onOwnershipHide,
                             fetchOwnershipUsers,
                             fetchOwnershipOwners,
                             onOwnershipOwnersChange,
                             onOwnershipSubmit,
                             parentsAndChildren,
                             fetchParentsAndChildren,
                             onParentsAndChildrenHide
                           }) =>
  <Call cb={fetchMetadataflows} disabled={metadataflows !== null}>
    <ArtefactList
      artefacts={metadataflows}
      onDetailShow={onDetail}
      onCreate={onCreate}
      onDownloadShow={onDownloadShow}
      onCloneShow={onCloneShow}
      onExportShow={onExportShow}
      onDelete={onDelete}
      onSelectedItemDelete={onSelectedMetadataflowsDelete}
      onAnnotationsShow={onAnnotationsShow}
      onOwnershipShow={onOwnershipShow}
      ownershipPermissions={permissions ? permissions.metadataflowOwner : null}
      parentsAndChildren={parentsAndChildren}
      fetchParentsAndChildren={triplet => fetchParentsAndChildren("metadataflow", triplet)}
      onParentsAndChildrenHide={onParentsAndChildrenHide}
    />
    <CustomAnnotationList
      annotations={metadataflowAnnotations}
      onClose={onAnnotationsHide}
      title={metadataflowAnnotationTriplet
        ? getStringFromArtefactTriplet(metadataflowAnnotationTriplet)
        : null
      }
    />
    <ArtefactOwnershipModal
      isVisible={metadataflowOwnershipMetadataflowTripletStr !== null}
      id={metadataflowOwnershipMetadataflowTripletStr}
      onClose={onOwnershipHide}
      users={metadataflowOwnershipUsers}
      owners={metadataflowOwnershipOwners}
      fetchUsers={fetchOwnershipUsers}
      fetchOwners={() => fetchOwnershipOwners(metadataflowOwnershipMetadataflowTripletStr)}
      onOwnersChange={onOwnershipOwnersChange}
      onSubmit={() => onOwnershipSubmit(metadataflowOwnershipMetadataflowTripletStr, metadataflowOwnershipOwners)}
    />
  </Call>;

export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps)
)(MetadataflowsList);
