import {allRequest, deleteRequest, getRequest, REQUEST_METHOD_DELETE} from "../../../middlewares/api/actions";
import {getArtefactReferenceUrl, getCategorySchemeUrl, getDeleteArtefactUrl} from "../../../constants/urls";
import {getStringFromArtefactTriplet,} from "../../../utils/sdmxJson";

export const CATEGORY_SCHEMES_LIST_CATEGORY_SCHEMES_READ = 'CATEGORY_SCHEMES_LIST_CATEGORY_SCHEMES_READ';

export const CATEGORY_SCHEMES_CATEGORY_SCHEME_DELETE = 'CATEGORY_SCHEMES_CATEGORY_SCHEME_DELETE';
export const CATEGORY_SCHEMES_SELECTED_CATEGORY_SCHEMES_DELETE = 'CATEGORY_SCHEMES_SELECTED_CATEGORY_SCHEMES_DELETE';

export const CATEGORY_SCHEMES_DETAIL_ANNOTATIONS_SHOW = 'CATEGORY_SCHEMES_DETAIL_ANNOTATIONS_SHOW';
export const CATEGORY_SCHEMES_DETAIL_ANNOTATIONS_HIDE = 'CATEGORY_SCHEMES_DETAIL_ANNOTATIONS_HIDE';

export const CATEGORY_SCHEMES_CATEGORY_SCHEME_PARENTS_AND_CHILDREN_READ = 'CATEGORY_SCHEMES_CATEGORY_SCHEME_PARENTS_AND_CHILDREN_READ';
export const CATEGORY_SCHEMES_CATEGORY_SCHEME_PARENTS_AND_CHILDREN_HIDE = 'CATEGORY_SCHEMES_CATEGORY_SCHEME_PARENTS_AND_CHILDREN_HIDE';

export const readCategorySchemesListCategorySchemes = () => getRequest(
  CATEGORY_SCHEMES_LIST_CATEGORY_SCHEMES_READ,
  getCategorySchemeUrl()
);

export const deleteCategorySchemesCategoryScheme = categorySchemeTriplet => deleteRequest(
  CATEGORY_SCHEMES_CATEGORY_SCHEME_DELETE,
  getDeleteArtefactUrl("CategoryScheme", categorySchemeTriplet),
  t => ({
    success: t('scenes.metaManager.commons.messages.delete.success')
  })
);

export const deleteCategorySchemesSelectedCategorySchemes = categorySchemeTriplets => allRequest(
  CATEGORY_SCHEMES_SELECTED_CATEGORY_SCHEMES_DELETE,
  categorySchemeTriplets.map(() => REQUEST_METHOD_DELETE),
  categorySchemeTriplets.map(triplet => getDeleteArtefactUrl("CategoryScheme", triplet)),
  null,
  t => ({
    success: t('scenes.metaManager.commons.messages.multiDelete.success')
  }),
  categorySchemeTriplets.map(getStringFromArtefactTriplet),
  true
);

export const showCategorySchemesDetailAnnotations = (annotations, triplet) => ({
  type: CATEGORY_SCHEMES_DETAIL_ANNOTATIONS_SHOW,
  annotations,
  triplet
});

export const hideCategorySchemesDetailAnnotations = () => ({
  type: CATEGORY_SCHEMES_DETAIL_ANNOTATIONS_HIDE
});

export const readCategorySchemesCategorySchemeParentsAndChildren = (artefactType, artefactTriplet) => getRequest(
  CATEGORY_SCHEMES_CATEGORY_SCHEME_PARENTS_AND_CHILDREN_READ,
  getArtefactReferenceUrl(artefactType, artefactTriplet)
);

export const hideCategorySchemesCategorySchemeParentsAndChildren = () => ({
  type: CATEGORY_SCHEMES_CATEGORY_SCHEME_PARENTS_AND_CHILDREN_HIDE
});
