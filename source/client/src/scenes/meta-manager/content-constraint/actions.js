import {allRequest, deleteRequest, getRequest, REQUEST_METHOD_DELETE} from "../../../middlewares/api/actions";
import {getArtefactReferenceUrl, getContentConstraintUrl, getDeleteArtefactUrl} from "../../../constants/urls";
import {getStringFromArtefactTriplet} from "../../../utils/sdmxJson";

export const CONTENT_CONSTRAINTS_LIST_CONTENT_CONSTRAINTS_READ = 'CONTENT_CONSTRAINTS_LIST_CONTENT_CONSTRAINTS_READ';

export const CONTENT_CONSTRAINTS_CONTENT_CONSTRAINT_DELETE = 'CONTENT_CONSTRAINTS_CONTENT_CONSTRAINT_DELETE';
export const CONTENT_CONSTRAINTS_SELECTED_CONTENT_CONSTRAINTS_DELETE = 'CONTENT_CONSTRAINTS_SELECTED_CONTENT_CONSTRAINTS_DELETE';

export const CONTENT_CONSTRAINTS_DETAIL_ANNOTATIONS_SHOW = 'CONTENT_CONSTRAINTS_DETAIL_ANNOTATIONS_SHOW';
export const CONTENT_CONSTRAINTS_DETAIL_ANNOTATIONS_HIDE = 'CONTENT_CONSTRAINTS_DETAIL_ANNOTATIONS_HIDE';

export const CONTENT_CONSTRAINTS_CONTENT_CONSTRAINT_PARENTS_AND_CHILDREN_READ = 'CONTENT_CONSTRAINTS_CONTENT_CONSTRAINT_PARENTS_AND_CHILDREN_READ';
export const CONTENT_CONSTRAINTS_CONTENT_CONSTRAINT_PARENTS_AND_CHILDREN_HIDE = 'CONTENT_CONSTRAINTS_CONTENT_CONSTRAINT_PARENTS_AND_CHILDREN_HIDE';

export const readContentConstraintsListContentConstraints = () => getRequest(
  CONTENT_CONSTRAINTS_LIST_CONTENT_CONSTRAINTS_READ,
  getContentConstraintUrl()
);

export const deleteContentConstraintsContentConstraint = contentConstraintTriplet => deleteRequest(
  CONTENT_CONSTRAINTS_CONTENT_CONSTRAINT_DELETE,
  getDeleteArtefactUrl("ContentConstraint", contentConstraintTriplet),
  t => ({
    success: t('scenes.metaManager.commons.messages.delete.success')
  })
);

export const deleteContentConstraintsSelectedContentConstraints = contentConstraintTriplets => allRequest(
  CONTENT_CONSTRAINTS_SELECTED_CONTENT_CONSTRAINTS_DELETE,
  contentConstraintTriplets.map(() => REQUEST_METHOD_DELETE),
  contentConstraintTriplets.map(triplet => getDeleteArtefactUrl("ContentConstraint", triplet)),
  null,
  t => ({
    success: t('scenes.metaManager.commons.messages.multiDelete.success')
  }),
  contentConstraintTriplets.map(getStringFromArtefactTriplet)
);

export const showContentConstraintsDetailAnnotations = (annotations, triplet) => ({
  type: CONTENT_CONSTRAINTS_DETAIL_ANNOTATIONS_SHOW,
  annotations,
  triplet
});

export const hideContentConstraintsDetailAnnotations = () => ({
  type: CONTENT_CONSTRAINTS_DETAIL_ANNOTATIONS_HIDE
});

export const readContentConstraintsContentConstraintParentsAndChildren = (artefactType, artefactTriplet) => getRequest(
  CONTENT_CONSTRAINTS_CONTENT_CONSTRAINT_PARENTS_AND_CHILDREN_READ,
  getArtefactReferenceUrl(artefactType, artefactTriplet)
);

export const hideContentConstraintsContentConstraintParentsAndChildren = () => ({
  type: CONTENT_CONSTRAINTS_CONTENT_CONSTRAINT_PARENTS_AND_CHILDREN_HIDE
});
