import {allRequest, deleteRequest, getRequest, REQUEST_METHOD_DELETE} from "../../../middlewares/api/actions";
import {getArtefactReferenceUrl, getConceptSchemeUrl, getDeleteArtefactUrl} from "../../../constants/urls";
import {getStringFromArtefactTriplet,} from "../../../utils/sdmxJson";

export const CONCEPT_SCHEMES_LIST_CONCEPT_SCHEMES_READ = 'CONCEPT_SCHEMES_LIST_CONCEPT_SCHEMES_READ';

export const CONCEPT_SCHEMES_CONCEPT_SCHEME_DELETE = 'CONCEPT_SCHEMES_CONCEPT_SCHEME_DELETE';
export const CONCEPT_SCHEMES_SELECTED_CONCEPT_SCHEMES_DELETE = 'CONCEPT_SCHEMES_SELECTED_CONCEPT_SCHEMES_DELETE';

export const CONCEPT_SCHEMES_DETAIL_ANNOTATIONS_SHOW = 'CONCEPT_SCHEMES_DETAIL_ANNOTATIONS_SHOW';
export const CONCEPT_SCHEMES_DETAIL_ANNOTATIONS_HIDE = 'CONCEPT_SCHEMES_DETAIL_ANNOTATIONS_HIDE';

export const CONCEPT_SCHEMES_CONCEPT_SCHEME_PARENTS_AND_CHILDREN_READ = 'CONCEPT_SCHEMES_CONCEPT_SCHEME_PARENTS_AND_CHILDREN_READ';
export const CONCEPT_SCHEMES_CONCEPT_SCHEME_PARENTS_AND_CHILDREN_HIDE = 'CONCEPT_SCHEMES_CONCEPT_SCHEME_PARENTS_AND_CHILDREN_HIDE';

export const readConceptSchemesListConceptSchemes = () => getRequest(
  CONCEPT_SCHEMES_LIST_CONCEPT_SCHEMES_READ,
  getConceptSchemeUrl()
);

export const deleteConceptSchemesConceptScheme = conceptSchemeTriplet => deleteRequest(
  CONCEPT_SCHEMES_CONCEPT_SCHEME_DELETE,
  getDeleteArtefactUrl("ConceptScheme", conceptSchemeTriplet),
  t => ({
    success: t('scenes.metaManager.commons.messages.delete.success')
  })
);

export const showConceptSchemesDetailAnnotations = (annotations, triplet) => ({
  type: CONCEPT_SCHEMES_DETAIL_ANNOTATIONS_SHOW,
  annotations,
  triplet
});

export const hideConceptSchemesDetailAnnotations = () => ({
  type: CONCEPT_SCHEMES_DETAIL_ANNOTATIONS_HIDE
});

export const deleteConceptSchemesSelectedConceptSchemes = conceptSchemeTriplets => allRequest(
  CONCEPT_SCHEMES_SELECTED_CONCEPT_SCHEMES_DELETE,
  conceptSchemeTriplets.map(() => REQUEST_METHOD_DELETE),
  conceptSchemeTriplets.map(triplet => getDeleteArtefactUrl("ConceptScheme", triplet)),
  null,
  t => ({
    success: t('scenes.metaManager.commons.messages.multiDelete.success')
  }),
  conceptSchemeTriplets.map(getStringFromArtefactTriplet),
  true
);

export const readConceptSchemesConceptSchemeParentsAndChildren = (artefactType, artefactTriplet) => getRequest(
  CONCEPT_SCHEMES_CONCEPT_SCHEME_PARENTS_AND_CHILDREN_READ,
  getArtefactReferenceUrl(artefactType, artefactTriplet)
);

export const hideConceptSchemesConceptSchemeParentsAndChildren = () => ({
  type: CONCEPT_SCHEMES_CONCEPT_SCHEME_PARENTS_AND_CHILDREN_HIDE
});
