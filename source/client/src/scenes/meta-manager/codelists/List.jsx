import React from 'react';
import {translate} from 'react-i18next';
import {compose} from "redux";
import Call from "../../../hocs/call";
import {
  deleteCodelistsCodelist,
  deleteCodelistsSelectedCodelists,
  hideCodelistsCodelistParentsAndChildren,
  hideCodelistsDetailAnnotations,
  readCodelistsCodelistParentsAndChildren,
  readCodelistsListCodelists,
  showCodelistsDetailAnnotations,
} from "./actions";
import {connect} from "react-redux";
import CustomAnnotationList from "../../../components/custom-annotation-list";
import ArtefactList from "../../../components/artefact-list";
import {
  createCodelistDetail,
  editCodelistDetail,
  showCodelistDetailClone,
  showCodelistDetailDownload,
  showCodelistDetailExport
} from "../../../redux-components/redux-codelist-detail-modal/actions";
import {reuseAction} from "../../../utils/reduxReuse";
import {MM_CODELISTS_PREFIX} from "./reducer";
import {getStringFromArtefactTriplet} from "../../../utils/sdmxJson";

const mapStateToProps = state => ({
  nodeId: state.app.endpointId,
  nodes: state.config.nodes,
  codelists: state.scenes.metaManager.codelists.codelists,
  codelistAnnotations: state.scenes.metaManager.codelists.codelistAnnotations,
  codelistAnnotationTriplet: state.scenes.metaManager.codelists.codelistAnnotationTriplet,
  parentsAndChildren: state.scenes.metaManager.codelists.parentsAndChildren
});

const mapDispatchToProps = dispatch => ({
  onCreate: defaultItemsViewMode => dispatch(reuseAction(createCodelistDetail(defaultItemsViewMode), MM_CODELISTS_PREFIX)),
  onDetail: (codelistTriplet, defaultItemsViewMode) => dispatch(reuseAction(editCodelistDetail(codelistTriplet, defaultItemsViewMode), MM_CODELISTS_PREFIX)),
  fetchCodelists: () => dispatch(readCodelistsListCodelists()),
  onCodelistDelete: codelistTriplet => dispatch(deleteCodelistsCodelist(codelistTriplet)),
  onAnnotationsShow: (annotations, triplet) => dispatch(showCodelistsDetailAnnotations(annotations, triplet)),
  onAnnotationsHide: () => dispatch(hideCodelistsDetailAnnotations()),
  onSelectedCodelistsDelete: codelistTriplets => dispatch(deleteCodelistsSelectedCodelists(codelistTriplets)),
  onDownloadShow: (artefactTriplets, lang) => dispatch(reuseAction(showCodelistDetailDownload(artefactTriplets, lang), MM_CODELISTS_PREFIX)),
  onCloneShow: artefactTriplet => dispatch(reuseAction(showCodelistDetailClone(artefactTriplet), MM_CODELISTS_PREFIX)),
  onExportShow: sourceTriplet => dispatch(reuseAction(showCodelistDetailExport(sourceTriplet), MM_CODELISTS_PREFIX)),
  fetchParentsAndChildren: (artefactType, artefactTriplet) =>
    dispatch(readCodelistsCodelistParentsAndChildren(artefactType, artefactTriplet)),
  onParentsAndChildrenHide: () => dispatch(hideCodelistsCodelistParentsAndChildren())
});

const CodelistsList = ({
                         nodeId,
                         nodes,
                         codelists,
                         onCreate,
                         onDetail,
                         fetchCodelists,
                         onCodelistDelete,
                         codelistAnnotations,
                         codelistAnnotationTriplet,
                         onAnnotationsShow,
                         onAnnotationsHide,
                         onSelectedCodelistsDelete,
                         onDownloadShow,
                         onCloneShow,
                         onExportShow,
                         parentsAndChildren,
                         fetchParentsAndChildren,
                         onParentsAndChildrenHide
                       }) => {

  const defaultItemsViewMode = nodes.find(node => node.general.id === nodeId).general.defaultItemsViewMode;

  return (
    <Call cb={fetchCodelists} disabled={codelists !== null}>
      <ArtefactList
        artefacts={codelists}
        onCreate={() => onCreate(defaultItemsViewMode)}
        onDetailShow={triplet => onDetail(triplet, defaultItemsViewMode)}
        onDownloadShow={onDownloadShow}
        onCloneShow={onCloneShow}
        onExportShow={onExportShow}
        onDelete={onCodelistDelete}
        onSelectedItemDelete={onSelectedCodelistsDelete}
        onAnnotationsShow={onAnnotationsShow}
        parentsAndChildren={parentsAndChildren}
        fetchParentsAndChildren={triplet => fetchParentsAndChildren("codelist", triplet)}
        onParentsAndChildrenHide={onParentsAndChildrenHide}
      />
      <CustomAnnotationList
        annotations={codelistAnnotations}
        onClose={onAnnotationsHide}
        title={codelistAnnotationTriplet
          ? getStringFromArtefactTriplet(codelistAnnotationTriplet)
          : null
        }
      />
    </Call>
  )
};

export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps)
)(CodelistsList);
