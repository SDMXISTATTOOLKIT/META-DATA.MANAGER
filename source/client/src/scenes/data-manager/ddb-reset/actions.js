import {postRequest} from "../../../middlewares/api/actions";
import {getDdbResetUrl} from "../../../constants/urls";

const DDB_RESET_SUBMIT = 'DDB_RESET_SUBMIT';

export const submitDdbReset = () => postRequest(
  DDB_RESET_SUBMIT,
  getDdbResetUrl(),
  null,
  t => ({
    success: t('scenes.dataManager.ddbReset.submit.success')
  })
);
