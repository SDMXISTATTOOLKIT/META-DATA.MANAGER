export const getSdmxTypesTranslations = t => {

  const sdmxTypesTranslations = t => ({
    codelist: t('sdmxTypes.codelist'),
    categoryscheme: t('sdmxTypes.categoryScheme'),
    conceptscheme: t('sdmxTypes.conceptScheme'),
    dataflow: t('sdmxTypes.dataflow'),
    datastructure: t('sdmxTypes.dsd'),
    metadataflow: t('sdmxTypes.metadataflow'),
    agencyscheme: t('sdmxTypes.agencyScheme'),
    contentconstraint: t('sdmxTypes.contentConstraint'),
  });

  return sdmxTypesTranslations(t !== undefined ? t : str => str);
};
