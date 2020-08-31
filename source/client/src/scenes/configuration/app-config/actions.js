import {getRequest, postRequest} from "../../../middlewares/api/actions";
import {CONFIG_TYPE_APP, getConfigUrl} from "../../../constants/urls";

export const APP_CONFIG_CONFIG_READ = 'APP_CONFIG_CONFIG_READ';
export const APP_CONFIG_CONFIG_SUBMIT = 'APP_CONFIG_CONFIG_SUBMIT';
export const APP_CONFIG_USER_INTERFACE_FORM_CHANGE = 'APP_CONFIG_USER_INTERFACE_FORM_CHANGE';
export const APP_CONFIG_AGENCIES_CHANGE = 'APP_CONFIG_AGENCIES_CHANGE';
export const APP_CONFIG_DATA_MANAGEMENT_CHANGE = 'APP_CONFIG_DATA_MANAGEMENT_CHANGE';
export const APP_CONFIG_DEFAULT_HEADER_SUBMIT_STRUCTURE_CHANGE = 'APP_CONFIG_DEFAULT_HEADER_SUBMIT_STRUCTURE_CHANGE';
export const APP_CONFIG_SUPERUSER_CREDENTIALS_CHANGE = 'APP_CONFIG_SUPERUSER_CREDENTIALS_CHANGE';
export const APP_CONFIG_ENDPOINT_SETTINGS_CHANGE = 'APP_CONFIG_ENDPOINT_SETTINGS_CHANGE';

export const readAppConfigConfig = () =>
  getRequest(
    APP_CONFIG_CONFIG_READ,
    getConfigUrl(CONFIG_TYPE_APP)
  );

export const submitAppConfigConfig = config => postRequest(
  APP_CONFIG_CONFIG_SUBMIT,
  getConfigUrl(CONFIG_TYPE_APP),
  {
    ...config,
    SuperUserCredentials:
      config.SuperUserCredentials
        .map(el => ({
          ...el,
          password: el.password ? btoa(el.password) : undefined,
          confirmPassword: el.confirmPassword ? btoa(el.confirmPassword) : undefined,
        }))
  },
  t => ({
    success: t('scenes.configuration.appConfig.messages.submit.success')
  })
);

export const changeAppConfigUserInterfaceForm = fields => ({
  type: APP_CONFIG_USER_INTERFACE_FORM_CHANGE,
  fields
});

export const changeAppConfigAgenciesForm = fields => ({
  type: APP_CONFIG_AGENCIES_CHANGE,
  fields
});

export const changeAppConfigDataManagementForm = fields => ({
  type: APP_CONFIG_DATA_MANAGEMENT_CHANGE,
  fields
});

export const changeAppConfigDefaultHeaderSubmitStructureForm = fields => ({
  type: APP_CONFIG_DEFAULT_HEADER_SUBMIT_STRUCTURE_CHANGE,
  fields
});

export const changeAppConfigSuperUserCredentialsForm = fields => ({
  type: APP_CONFIG_SUPERUSER_CREDENTIALS_CHANGE,
  fields
});

export const changeAppConfigEndpointSettingsForm = fields => ({
  type: APP_CONFIG_ENDPOINT_SETTINGS_CHANGE,
  fields
});