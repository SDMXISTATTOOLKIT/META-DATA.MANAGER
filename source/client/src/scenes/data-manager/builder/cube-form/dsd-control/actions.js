import {getRequest} from '../../../../../middlewares/api/actions';
import {getDsdUrl} from '../../../../../constants/urls';

export const BUILDER_CUBE_FORM_DSD_CONTROL_DSDS_SHOW = 'BUILDER_CUBE_FORM_DSD_CONTROL_DSDS_SHOW';
export const BUILDER_CUBE_FORM_DSD_CONTROL_DSDS_HIDE = 'BUILDER_CUBE_FORM_DSD_CONTROL_DSDS_HIDE';
export const BUILDER_CUBE_FORM_DSD_CONTROL_DSDS_READ = 'BUILDER_CUBE_FORM_DSD_CONTROL_DSDS_READ';
export const BUILDER_CUBE_FORM_DSD_CONTROL_DSD_SET = 'BUILDER_CUBE_FORM_DSD_CONTROL_DSD_SET';
export const BUILDER_CUBE_FORM_DSD_CONTROL_DSD_UNSET = 'BUILDER_CUBE_FORM_DSD_CONTROL_DSD_UNSET';


export const showBuilderCubeFormDsdControlDsds = () => ({
  type: BUILDER_CUBE_FORM_DSD_CONTROL_DSDS_SHOW
});

export const hideBuilderCUbeFormDsdControlDsds = () => ({
  type: BUILDER_CUBE_FORM_DSD_CONTROL_DSDS_HIDE
});

export const readBuilderCubeFormDsdControlDsds = () => getRequest(
  BUILDER_CUBE_FORM_DSD_CONTROL_DSDS_READ,
  getDsdUrl(null, true)
);

export const setBuilderCubeFormDsdControlDsd = dsdTriplet => ({
  type: BUILDER_CUBE_FORM_DSD_CONTROL_DSD_SET,
  dsdTriplet
});

export const unsetBuilderCubeFormDsdControlDsd = () => ({
  type: BUILDER_CUBE_FORM_DSD_CONTROL_DSD_UNSET
});
