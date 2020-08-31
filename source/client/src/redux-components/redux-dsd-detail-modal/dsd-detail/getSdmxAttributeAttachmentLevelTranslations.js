export const getSdmxAttributeAttachmentLevelTranslations = t => {

  const sdmxAttributeAttachmentLevelTranslations = t => ({
    Series: t('sdmxAttributeAttachmentLevel.series'),
    Observation: t('sdmxAttributeAttachmentLevel.observation'),
    Group: t('sdmxAttributeAttachmentLevel.group'),
    Dataset: t('sdmxAttributeAttachmentLevel.dataset')
  });

  return sdmxAttributeAttachmentLevelTranslations(t !== undefined ? t : str => str);
};

