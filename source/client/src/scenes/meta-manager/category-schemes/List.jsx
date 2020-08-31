import React from 'react';
import {translate} from 'react-i18next';
import {compose} from "redux";
import Call from "../../../hocs/call";
import {
  deleteCategorySchemesCategoryScheme,
  deleteCategorySchemesSelectedCategorySchemes,
  hideCategorySchemesCategorySchemeParentsAndChildren,
  hideCategorySchemesDetailAnnotations,
  readCategorySchemesCategorySchemeParentsAndChildren,
  readCategorySchemesListCategorySchemes,
  showCategorySchemesDetailAnnotations
} from "./actions";
import {connect} from "react-redux";
import CustomAnnotationList from "../../../components/custom-annotation-list";
import ArtefactList from "../../../components/artefact-list";
import {reuseAction} from "../../../utils/reduxReuse";
import {
  createCategorySchemeDetail,
  editCategorySchemeDetail,
  showCategorySchemeCategorySchemeClone,
  showCategorySchemeCategorySchemeExport,
  showCategorySchemeDetailDownload
} from "../../../redux-components/redux-category-scheme-detail-modal/actions";
import {MM_CATEGORY_SCHEMES_PREFIX} from "./reducer";
import {getStringFromArtefactTriplet} from "../../../utils/sdmxJson";

const mapStateToProps = state => ({
  nodeId: state.app.endpointId,
  nodes: state.config.nodes,
  categorySchemes: state.scenes.metaManager.categorySchemes.categorySchemes,
  categorySchemeAnnotations: state.scenes.metaManager.categorySchemes.categorySchemeAnnotations,
  categorySchemeAnnotationTriplet: state.scenes.metaManager.categorySchemes.categorySchemeAnnotationTriplet,
  parentsAndChildren: state.scenes.metaManager.categorySchemes.parentsAndChildren
});

const mapDispatchToProps = dispatch => ({
  onCreate: defaultItemsViewMode => dispatch(reuseAction(createCategorySchemeDetail(defaultItemsViewMode), MM_CATEGORY_SCHEMES_PREFIX)),
  onDetail: (categorySchemeTriplet, defaultItemsViewMode) =>
    dispatch(reuseAction(editCategorySchemeDetail(categorySchemeTriplet, defaultItemsViewMode), MM_CATEGORY_SCHEMES_PREFIX)),
  fetchCategorySchemes: () => dispatch(readCategorySchemesListCategorySchemes()),
  onCategorySchemeDelete: categorySchemeTriplet => dispatch(deleteCategorySchemesCategoryScheme(categorySchemeTriplet)),
  onAnnotationsShow: (annotations, triplet) => dispatch(showCategorySchemesDetailAnnotations(annotations, triplet)),
  onAnnotationsHide: () => dispatch(hideCategorySchemesDetailAnnotations()),
  onSelectedCategorySchemesDelete: categorySchemeTriplets =>
    dispatch(deleteCategorySchemesSelectedCategorySchemes(categorySchemeTriplets)),
  onDownloadShow: (artefactTriplets, lang) => dispatch(reuseAction(showCategorySchemeDetailDownload(artefactTriplets, lang), MM_CATEGORY_SCHEMES_PREFIX)),
  onCloneShow: artefactTriplet => dispatch(reuseAction(showCategorySchemeCategorySchemeClone(artefactTriplet), MM_CATEGORY_SCHEMES_PREFIX)),
  onExportShow: artefactTriplet => dispatch(reuseAction(showCategorySchemeCategorySchemeExport(artefactTriplet), MM_CATEGORY_SCHEMES_PREFIX)),
  fetchParentsAndChildren: (artefactType, artefactTriplet) => dispatch(readCategorySchemesCategorySchemeParentsAndChildren(artefactType, artefactTriplet)),
  onParentsAndChildrenHide: () => dispatch(hideCategorySchemesCategorySchemeParentsAndChildren())
});

const CategorySchemesList = ({
                               nodeId,
                               nodes,
                               categorySchemes,
                               onCreate,
                               onDetail,
                               fetchCategorySchemes,
                               onCategorySchemeDelete,
                               categorySchemeAnnotations,
                               categorySchemeAnnotationTriplet,
                               onAnnotationsShow,
                               onAnnotationsHide,
                               onSelectedCategorySchemesDelete,
                               onDownloadShow,
                               onCloneShow,
                               onExportShow,
                               parentsAndChildren,
                               fetchParentsAndChildren,
                               onParentsAndChildrenHide
                             }) => {

  const defaultItemsViewMode = nodes.find(node => node.general.id === nodeId).general.defaultItemsViewMode;

  return (
    <Call cb={fetchCategorySchemes} disabled={categorySchemes !== null}>
      <ArtefactList
        artefacts={categorySchemes}
        onCreate={() => onCreate(defaultItemsViewMode)}
        onDetailShow={triplet => onDetail(triplet, defaultItemsViewMode)}
        onDownloadShow={onDownloadShow}
        onCloneShow={onCloneShow}
        onExportShow={onExportShow}
        onDelete={onCategorySchemeDelete}
        onSelectedItemDelete={onSelectedCategorySchemesDelete}
        onAnnotationsShow={onAnnotationsShow}
        parentsAndChildren={parentsAndChildren}
        fetchParentsAndChildren={triplet => fetchParentsAndChildren("categoryscheme", triplet)}
        onParentsAndChildrenHide={onParentsAndChildrenHide}
      />
      <CustomAnnotationList
        annotations={categorySchemeAnnotations}
        onClose={onAnnotationsHide}
        title={categorySchemeAnnotationTriplet
          ? getStringFromArtefactTriplet(categorySchemeAnnotationTriplet)
          : null
        }
      />
    </Call>
  )
};

export default compose(
  translate(),
  connect(mapStateToProps, mapDispatchToProps)
)(CategorySchemesList);
