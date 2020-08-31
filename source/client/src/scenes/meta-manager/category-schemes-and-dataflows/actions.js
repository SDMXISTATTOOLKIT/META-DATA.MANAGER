import {allRequest, deleteRequest, putRequest, REQUEST_METHOD_GET} from "../../../middlewares/api/actions";
import {
  getCategorySchemeUrl,
  getDataflowUrl,
  getDeleteArtefactUrl,
  getUpdateArtefactsUrl
} from "../../../constants/urls";
import _ from "lodash";
import {
  getArtefactTripletFromUrn,
  getSdmxJsonFromSdmxJsonStructures,
  getSdmxJsonStructureFromArtefact,
  SDMX_JSON_CATEGORISATION_LIST_KEY
} from "../../../utils/sdmxJson";

export const CATEGORY_SCHEMES_AND_DATAFLOWS_TREE_READ = 'CATEGORY_SCHEMES_AND_DATAFLOWS_TREE_READ';
export const CATEGORY_SCHEMES_AND_DATAFLOWS_DATAFLOW_CATEGORISE = 'CATEGORY_SCHEMES_AND_DATAFLOWS_DATAFLOW_CATEGORISE';
export const CATEGORY_SCHEMES_AND_DATAFLOWS_DATAFLOW_CATEGORISATION_DELETE = 'CATEGORY_SCHEMES_AND_DATAFLOWS_DATAFLOW_CATEGORISATION_DELETE';

export const readCategorySchemesAndDataflowsTree = lang => ({
  ...allRequest(
    CATEGORY_SCHEMES_AND_DATAFLOWS_TREE_READ,
    [REQUEST_METHOD_GET, REQUEST_METHOD_GET],
    [getCategorySchemeUrl(null, true), getDataflowUrl()]
  ),
  lang
});

export const categoriseCategorySchemesAndDataflowsDataflow = (
  dataflow,
  newCategoryUrn,
  categorisations,
  from, to,
  fromSisterDfOrderedCategorisations, toSisterDfOrderedCategorisations,
  lang,
  orderAnnotationType
) => {

  if (!dataflow.categoryUrn) {

    // dataflow was uncategorised

    const categorisationId = 'CAT_' +
      dataflow.id.substr(0, 40) +
      '_' +
      String(_.random(99999)).padStart(5, '0');
    const categorisation = {
      id: categorisationId,
      agencyID: dataflow.agencyID,
      version: dataflow.version,
      name: {
        en: categorisationId
      },
      source: dataflow.urn,
      target: newCategoryUrn,
      autoAnnotations: [
        {
          type: orderAnnotationType,
          text: {[lang]: String(to)}
        }
      ]
    };

    // sister df categorisations must have order in 0..to-1 or to+1..N

    const newToSisterDfCategorisations =
      toSisterDfOrderedCategorisations
        .filter(({source}) => source !== dataflow.urn)
        .map((categoris, index) => {
          const newOrderAnnot = {
            type: orderAnnotationType,
            text: {
              ...((categoris.autoAnnotations || []).find(({type}) => type === orderAnnotationType) || {}).text || {},
              [lang]: String(index < to ? index : (index + 1))
            }
          };
          return {
            ...categoris,
            autoAnnotations: [
              ...(categoris.autoAnnotations || []).filter(({type}) => type !== orderAnnotationType),
              newOrderAnnot
            ]
          };
        });

    return putRequest(
      CATEGORY_SCHEMES_AND_DATAFLOWS_DATAFLOW_CATEGORISE,
      getUpdateArtefactsUrl(),
      getSdmxJsonFromSdmxJsonStructures(
        [
          getSdmxJsonStructureFromArtefact(categorisation),
          ...newToSisterDfCategorisations.map(getSdmxJsonStructureFromArtefact)
        ],
        SDMX_JSON_CATEGORISATION_LIST_KEY
      ),
      t => ({
        success: t('scenes.metaManager.categorySchemesAndDataflows.messages.categorisation.update.success')
      })
    )
  } else {

    // dataflow was categorised

    const newCategorisation =
      _.find(categorisations, cat => cat.source === dataflow.urn && cat.target === dataflow.categoryUrn);
    newCategorisation.target = newCategoryUrn;

    newCategorisation.autoAnnotations = [
      ...(newCategorisation.autoAnnotations || []).filter(({type}) => type !== orderAnnotationType),
      {
        type: orderAnnotationType,
        text: {
          ...((newCategorisation.autoAnnotations || []).find(({type}) => type === orderAnnotationType) || {}).text || {},
          [lang]: String(to)
        }
      }
    ];

    // sister source df categorisations must have order in 0..N-1

    const newFromSisterDfCategorisations =
      fromSisterDfOrderedCategorisations
        .filter(({source}) => source !== dataflow.urn)
        .map((categoris, index) => {
          const newOrderAnnot = {
            type: orderAnnotationType,
            text: {
              ...((categoris.autoAnnotations || []).find(({type}) => type === orderAnnotationType) || {}).text || {},
              [lang]: String(index)
            }
          };
          return {
            ...categoris,
            autoAnnotations: [
              ...(categoris.autoAnnotations || []).filter(({type}) => type !== orderAnnotationType),
              newOrderAnnot
            ]
          };
        });

    // sister target df categorisations must have order in 0..to-1 or to+1..N

    const newToSisterDfCategorisations =
      toSisterDfOrderedCategorisations
        .filter(({source}) => source !== dataflow.urn)
        .map((categoris, index) => {
          const newOrderAnnot = {
            type: orderAnnotationType,
            text: {
              ...((categoris.autoAnnotations || []).find(({type}) => type === orderAnnotationType) || {}).text || {},
              [lang]: String(index < to ? index : (index + 1))
            }
          };
          return {
            ...categoris,
            autoAnnotations: [
              ...(categoris.autoAnnotations || []).filter(({type}) => type !== orderAnnotationType),
              newOrderAnnot
            ]
          };
        });


    return putRequest(
      CATEGORY_SCHEMES_AND_DATAFLOWS_DATAFLOW_CATEGORISE,
      getUpdateArtefactsUrl(),
      getSdmxJsonFromSdmxJsonStructures(
        [
          getSdmxJsonStructureFromArtefact(newCategorisation),
          ...newFromSisterDfCategorisations.map(getSdmxJsonStructureFromArtefact),
          ...newToSisterDfCategorisations.map(getSdmxJsonStructureFromArtefact)
        ],
        SDMX_JSON_CATEGORISATION_LIST_KEY
      ),
      t => ({
        success: t('scenes.metaManager.categorySchemesAndDataflows.messages.categorisation.update.success')
      })
    )
  }
};

export const deleteCategorySchemesAndDataflowsDataflowCategorisation = (dataflow, categorisations) => {
  const categorisation =
    _.find(categorisations, cat => cat.source === dataflow.urn && cat.target === dataflow.categoryUrn);

  return deleteRequest(
    CATEGORY_SCHEMES_AND_DATAFLOWS_DATAFLOW_CATEGORISATION_DELETE,
    getDeleteArtefactUrl("Categorisation", getArtefactTripletFromUrn(categorisation.urn)),
    t => ({
      success: t('scenes.metaManager.categorySchemesAndDataflows.messages.categorisation.delete.success')
    })
  )
};