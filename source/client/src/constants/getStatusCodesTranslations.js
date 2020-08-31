export const getStatusCodesTranslations = t => {

  const statusCodesTranslations = t => ({
    401: t('errors.statusCodes.401'),
    403: t('errors.statusCodes.403'),
  });

  return statusCodesTranslations(t !== undefined ? t : str => str);
};
