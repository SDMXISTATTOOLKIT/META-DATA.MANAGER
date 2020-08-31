import {allRequest, deleteRequest, getRequest, REQUEST_METHOD_DELETE} from "../../../middlewares/api/actions";
import {getArtefactReferenceUrl, getCodelistUrl, getDeleteArtefactUrl} from "../../../constants/urls";
import {getStringFromArtefactTriplet} from "../../../utils/sdmxJson";

export const CODELISTS_LIST_CODELISTS_READ = 'CODELISTS_LIST_CODELISTS_READ';

export const CODELISTS_CODELIST_DELETE = 'CODELISTS_CODELIST_DELETE';
export const CODELISTS_SELECTED_CODELISTS_DELETE = 'CODELISTS_SELECTED_CODELISTS_DELETE';

export const CODELISTS_DETAIL_ANNOTATIONS_SHOW = 'CODELISTS_DETAIL_ANNOTATIONS_SHOW';
export const CODELISTS_DETAIL_ANNOTATIONS_HIDE = 'CODELISTS_DETAIL_ANNOTATIONS_HIDE';

export const CODELISTS_CODELIST_PARENTS_AND_CHILDREN_READ = 'CODELISTS_CODELIST_PARENTS_AND_CHILDREN_READ';
export const CODELISTS_CODELIST_PARENTS_AND_CHILDREN_HIDE = 'CODELISTS_CODELIST_PARENTS_AND_CHILDREN_HIDE';


export const readCodelistsListCodelists = () => getRequest(
  CODELISTS_LIST_CODELISTS_READ,
  getCodelistUrl()
);

export const deleteCodelistsCodelist = codelistTriplet => deleteRequest(
  CODELISTS_CODELIST_DELETE,
  getDeleteArtefactUrl("CodeList", codelistTriplet),
  t => ({
    success: t('scenes.metaManager.commons.messages.delete.success')
  })
);

export const showCodelistsDetailAnnotations = (annotations, triplet) => ({
  type: CODELISTS_DETAIL_ANNOTATIONS_SHOW,
  annotations,
  triplet
});

export const hideCodelistsDetailAnnotations = () => ({
  type: CODELISTS_DETAIL_ANNOTATIONS_HIDE
});

export const deleteCodelistsSelectedCodelists = codelistTriplets => allRequest(
  CODELISTS_SELECTED_CODELISTS_DELETE,
  codelistTriplets.map(() => REQUEST_METHOD_DELETE),
  codelistTriplets.map(triplet => getDeleteArtefactUrl("CodeList", triplet)),
  null,
  t => ({
    success: t('scenes.metaManager.commons.messages.multiDelete.success')
  }),
  codelistTriplets.map(getStringFromArtefactTriplet),
  true
);

export const readCodelistsCodelistParentsAndChildren = (artefactType, artefactTriplet) => getRequest(
  CODELISTS_CODELIST_PARENTS_AND_CHILDREN_READ,
  getArtefactReferenceUrl(artefactType, artefactTriplet)
);

export const hideCodelistsCodelistParentsAndChildren = () => ({
  type: CODELISTS_CODELIST_PARENTS_AND_CHILDREN_HIDE
});
