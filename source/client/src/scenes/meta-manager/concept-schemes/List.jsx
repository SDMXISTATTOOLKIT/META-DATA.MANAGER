import React from 'react';
import {translate} from 'react-i18next';
import {compose} from "redux";
import Call from "../../../hocs/call";
import {
  deleteConceptSchemesConceptScheme,
  deleteConceptSchemesSelectedConceptSchemes,
  hideConceptSchemesConceptSchemeParentsAndChildren,
  hideConceptSchemesDetailAnnotations,
  readConceptSchemesConceptSchemeParentsAndChildren,
  readConceptSchemesListConceptSchemes,
  showConceptSchemesDetailAnnotations
} from "./actions";
import {connect} from "react-redux";
import ArtefactList from "../../../components/artefact-list";
import CustomAnnotationList from "../../../components/custom-annotation-list";
import {reuseAction} from "../../../utils/reduxReuse";
import {MM_CONCEPT_SCHEMES_PREFIX} from "./reducer";
import {
  createConceptSchemeDetail,
  editConceptSchemeDetail,
  showConceptSchemeDetailClone,
  showConceptSchemeDetailExport,
  showConceptSchemeDetailDownload
} from "../../../redux-components/redux-concept-scheme-detail-modal/actions";
import {getStringFromArtefactTriplet} from "../../../utils/sdmxJson";

const mapStateToProps = state => ({
  nodeId: state.app.endpointId,
  nodes: state.config.nodes,
  conceptSchemes: state.scenes.metaManager.conceptSchemes.conceptSchemes,
  conceptSchemeAnnotations: state.scenes.metaManager.conceptSchemes.conceptSchemeAnnotations,
  conceptSchemeAnnotationTriplet: state.scenes.metaManager.conceptSchemes.conceptSchemeAnnotationTriplet,
  parentsAndChildren: state.scenes.metaManager.conceptSchemes.parentsAndChildren
});

const mapDispatchToProps = dispatch => ({
  onCreate: defaultItemsViewMode => dispatch(reuseAction(createConceptSchemeDetail(defaultItemsViewMode), MM_CONCEPT_SCHEMES_PREFIX)),
  onDetail: (conceptSchemeTriplet, defaultItemsViewMode) =>
    dispatch(reuseAction(editConceptSchemeDetail(conceptSchemeTriplet, defaultItemsViewMode), MM_CONCEPT_SCHEMES_PREFIX)),
  fetchConceptSchemes: () => dispatch(readConceptSchemesListConceptSchemes()),
  onConceptSchemeDelete: conceptSchemeTriplet => dispatch(deleteConceptSchemesConceptScheme(conceptSchemeTriplet)),
  onAnnotationsShow: (annotations, triplet) => dispatch(showConceptSchemesDetailAnnotations(annotations, triplet)),
  onAnnotationsHide: () => dispatch(hideConceptSchemesDetailAnnotations()),
  onSelectedConceptSchemesDelete: conceptSchemeTriplets => dispatch(deleteConceptSchemesSelectedConceptSchemes(conceptSchemeTriplets)),
  onDownloadShow: (artefactTriplets, lang) => dispatch(reuseAction(showConceptSchemeDetailDownload(artefactTriplets, lang), MM_CONCEPT_SCHEMES_PREFIX)),
  onCloneShow: artefactTriplet => dispatch(reuseAction(showConceptSchemeDetailClone(artefactTriplet), MM_CONCEPT_SCHEMES_PREFIX)),
  onExportShow: sourceTriplet => dispatch(reuseAction(showConceptSchemeDetailExport(sourceTriplet), MM_CONCEPT_SCHEMES_PREFIX)),
  fetchParentsAndChildren: (artefactType, artefactTriplet) =>
    dispatch(readConceptSchemesConceptSchemeParentsAndChildren(artefactType, artefactTriplet)),
  onParentsAndChildrenHide: () => dispatch(hideConceptSchemesConceptSchemeParentsAndChildren())
});

const ConceptSchemesList = ({
                              nodeId,
                              nodes,
                              conceptSchemes,
                              onCreate,
                              onDetail,
                              fetchConceptSchemes,
                              onConceptSchemeDelete,
                              conceptSchemeAnnotations,
                              conceptSchemeAnnotationTriplet,
                              onAnnotationsShow,
                              onAnnotationsHide,
                              onSelectedConceptSchemesDelete,
                              onDownloadShow,
                              onCloneShow,
                              onExportShow,
                              parentsAndChildren,
                              fetchParentsAndChildren,
                              onParentsAndChildrenHide
                            }) => {

  const defaultItemsViewMode = nodes.find(node => node.general.id === nodeId).general.defaultItemsViewMode;

  return (
    <Call cb={fetchConceptSchemes} disabled={conceptSchemes !== null}>
      <ArtefactList
        artefacts={conceptSchemes}
        onCreate={() => onCreate(defaultItemsViewMode)}
        onDetailShow={triplet => onDetail(triplet, defaultItemsViewMode)}
        onDownloadShow={onDownloadShow}
        onCloneShow={onCloneShow}
        onExportShow={onExportShow}
        onDelete={onConceptSchemeDelete}
        onSelectedItemDelete={onSelectedConceptSchemesDelete}
        onAnnotationsShow={onAnnotationsShow}
        parentsAndChildren={parentsAndChildren}
        fetchParentsAndChildren={triplet => fetchParentsAndChildren("conceptscheme", triplet)}
        onParentsAndChildrenHide={onParentsAndChildrenHide}
      />
      <CustomAnnotationList
        annotations={conceptSchemeAnnotations}
        onClose={onAnnotationsHide}
        title={conceptSchemeAnnotationTriplet
          ? getStringFromArtefactTriplet(conceptSchemeAnnotationTriplet)
          : null
        }
      />
    </Call>
  )
};

export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps)
)(ConceptSchemesList);
