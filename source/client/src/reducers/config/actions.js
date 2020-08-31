import {getRequest} from '../../middlewares/api/actions';
import {getAppConfigUrl} from '../../constants/urls';
import {PERSISTENCE_ACTION_KEY} from "../../middlewares/persistence/middleware";

export const CONFIG_INIT = 'CONFIG_INIT';
export const CONFIG_READ = 'CONFIG_READ';

export const initConfig = () => ({
  type: CONFIG_INIT
});

export const readConfig = (persistanceObj, doNotPing) =>
  ({
    ...getRequest(CONFIG_READ, getAppConfigUrl()),
    [PERSISTENCE_ACTION_KEY]: persistanceObj,
    doNotPing
  });
