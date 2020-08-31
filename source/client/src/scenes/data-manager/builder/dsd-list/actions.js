import {getRequest} from '../../../../middlewares/api/actions';
import {getDsdUrl} from '../../../../constants/urls';

export const BUILDER_DSD_LIST_SHOW = 'BUILDER_DSD_LIST_SHOW';
export const BUILDER_DSD_LIST_HIDE = 'BUILDER_DSD_LIST_HIDE';
export const BUILDER_DSD_LIST_DSDS_READ = 'BUILDER_DSD_LIST_DSDS_READ';

export const showBuilderDsdList = () => ({
  type: BUILDER_DSD_LIST_SHOW
});

export const hideBuilderDsdList = () => ({
  type: BUILDER_DSD_LIST_HIDE
});

export const readBuilderDsdListDsds = () => getRequest(
  BUILDER_DSD_LIST_DSDS_READ,
  getDsdUrl(null, true)
);
