import {
  DSD_DIMENSION_TYPE_FREQUENCY,
  DSD_DIMENSION_TYPE_MEASURE,
  DSD_DIMENSION_TYPE_NORMAL,
  DSD_DIMENSION_TYPE_TIME
} from "../../../utils/sdmxJson";

export const getSdmxDimensionTypesTranslations = t => {

  const sdmxDimensionTypesTranslations = t => ({
    [DSD_DIMENSION_TYPE_NORMAL]: t('sdmxDimensionTypes.normal'),
    [DSD_DIMENSION_TYPE_FREQUENCY]: t('sdmxDimensionTypes.frequency'),
    [DSD_DIMENSION_TYPE_TIME]: t('sdmxDimensionTypes.time'),
    [DSD_DIMENSION_TYPE_MEASURE]: t('sdmxDimensionTypes.measure')
  });

  return sdmxDimensionTypesTranslations(t !== undefined ? t : str => str);
};
