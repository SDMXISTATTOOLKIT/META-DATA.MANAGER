import {allRequest, deleteRequest, getRequest, REQUEST_METHOD_DELETE} from "../../../middlewares/api/actions";
import {getArtefactReferenceUrl, getDeleteArtefactUrl, getDsdUrl} from "../../../constants/urls";
import {getStringFromArtefactTriplet} from "../../../utils/sdmxJson";

export const DSDS_LIST_DSDS_READ = 'DSDS_LIST_DSDS_READ';
export const DSDS_LIST_DSD_ANNOTATIONS_SHOW = 'DSDS_LIST_DSD_ANNOTATIONS_SHOW';
export const DSDS_LIST_DSD_ANNOTATIONS_HIDE = 'DSDS_LIST_DSD_ANNOTATIONS_HIDE';
export const DSDS_LIST_DSD_LAYOUT_ANNOTATIONS_SHOW = 'DSDS_LIST_DSD_LAYOUT_ANNOTATIONS_SHOW';
export const DSDS_LIST_DSD_LAYOUT_ANNOTATIONS_HIDE = 'DSDS_LIST_DSD_LAYOUT_ANNOTATIONS_HIDE';

export const DSDS_LIST_DSD_DELETE = 'DSDS_LIST_DSD_DELETE';
export const DSDS_LIST_SELECTED_DSDS_DELETE = 'DSDS_LIST_SELECTED_DSDS_DELETE';

export const DSDS_DSD_PARENTS_AND_CHILDREN_READ = 'DSDS_DSD_PARENTS_AND_CHILDREN_READ';
export const DSDS_DSD_PARENTS_AND_CHILDREN_HIDE = 'DSDS_DSD_PARENTS_AND_CHILDREN_HIDE';

export const readDsdsListDsds = () => getRequest(
  DSDS_LIST_DSDS_READ,
  getDsdUrl()
);

export const deleteDsdsListDsd = dsdTriplet => deleteRequest(
  DSDS_LIST_DSD_DELETE,
  getDeleteArtefactUrl("Dsd", dsdTriplet),
  t => ({
    success: t('scenes.metaManager.commons.messages.delete.success')
  })
);

export const deleteDsdsListSelectedDsds = dsdTriplets => allRequest(
  DSDS_LIST_SELECTED_DSDS_DELETE,
  dsdTriplets.map(() => REQUEST_METHOD_DELETE),
  dsdTriplets.map(triplet => getDeleteArtefactUrl("Dsd", triplet)),
  null,
  t => ({
    success: t('scenes.metaManager.commons.messages.multiDelete.success')
  }),
  dsdTriplets.map(getStringFromArtefactTriplet)
);

export const showDsdsListDsdAnnotations = (annotations, triplet) => ({
  type: DSDS_LIST_DSD_ANNOTATIONS_SHOW,
  annotations,
  triplet
});

export const hideDsdsListDsdAnnotations = () => ({
  type: DSDS_LIST_DSD_ANNOTATIONS_HIDE
});

export const showDsdsListDsdLayoutAnnotations = (annotations, triplet) => ({
  type: DSDS_LIST_DSD_LAYOUT_ANNOTATIONS_SHOW,
  annotations,
  triplet
});

export const hideDsdsListDsdLayoutAnnotations = () => ({
  type: DSDS_LIST_DSD_LAYOUT_ANNOTATIONS_HIDE
});

export const readDsdsDetailItemsImportFormAllCsvRows = (artefactType, artefactTriplet) => getRequest(
  DSDS_DSD_PARENTS_AND_CHILDREN_READ,
  getArtefactReferenceUrl(artefactType, artefactTriplet)
);

export const hideDsdsDetailItemsImportFormAllCsvRows = () => ({
  type: DSDS_DSD_PARENTS_AND_CHILDREN_HIDE
});
