import {postRequest} from "../../../middlewares/api/actions";
import {getRemoveTempTablesUrl} from "../../../constants/urls";

const REMOVE_TEMP_TABLES_SUBMIT = 'REMOVE_TEMP_TABLES_SUBMIT';

export const submitRemoveTempTables = () => postRequest(
  REMOVE_TEMP_TABLES_SUBMIT,
  getRemoveTempTablesUrl(),
  null,
  t => ({
    success: t('scenes.dataManager.removeTempTables.submit.success')
  }),
);
