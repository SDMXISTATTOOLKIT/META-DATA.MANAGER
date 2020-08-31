import {getRequest, postRequest} from '../../../../middlewares/api/actions';
import {getCreateDdbDataflowUrl, getDataflowUrl, getDsdUrl, getUpdateDdbDataflowUrl} from '../../../../constants/urls';
import {
  getArtefactTripletFromString,
  getSdmxJsonFromSdmxJsonStructures,
  getSdmxJsonStructureFromArtefact,
  getUrnFromArtefactTriplet,
  SDMX_JSON_CATEGORISATION_LIST_KEY,
  SDMX_JSON_DATAFLOW_LIST_KEY,
  SDMX_JSON_DATAFLOW_URN_NAMESPACE,
  SDMX_JSON_DSD_URN_NAMESPACE
} from '../../../../utils/sdmxJson';
import _ from 'lodash';
import {getFilterObjFromStr, getServerQueryObj} from "../../../../utils/filter";

export const DATAFLOW_BUILDER_WIZARD_SHOW = 'DATAFLOW_BUILDER_WIZARD_SHOW';
export const DATAFLOW_BUILDER_WIZARD_HIDE = 'DATAFLOW_BUILDER_WIZARD_HIDE';
export const DATAFLOW_BUILDER_WIZARD_STEP_SET = 'DATAFLOW_BUILDER_WIZARD_STEP_SET';
export const DATAFLOW_BUILDER_WIZARD_SUBMIT = 'DATAFLOW_BUILDER_WIZARD_SUBMIT';
export const DATAFLOW_BUILDER_WIZARD_DATAFLOW_READ = 'DATAFLOW_BUILDER_WIZARD_DATAFLOW_READ';
export const DATAFLOW_BUILDER_WIZARD_DSD_FOR_LAYOUT_ANNOTATIONS_READ = 'DATAFLOW_BUILDER_WIZARD_DSD_FOR_LAYOUT_ANNOTATIONS_READ';

export const showDataflowBuilderWizard = () => ({
  type: DATAFLOW_BUILDER_WIZARD_SHOW
});

export const hideDataflowBuilderWizard = () => ({
  type: DATAFLOW_BUILDER_WIZARD_HIDE
});

export const setDataflowBuilderWizardStep = step => ({
  type: DATAFLOW_BUILDER_WIZARD_STEP_SET,
  step
});

export const submitDataflowBuilderWizard =
  (dataflow, cube, filter, categoriesUrns, header, ddbDataflowId, cubeCode) => {

    const cubeColumns =
      _.flatten(Object.keys(cube.columns)
        .map(key => cube.columns[key]));

    const dataflowUrn = getUrnFromArtefactTriplet(
      {
        id: dataflow.id,
        agencyID: dataflow.agencyID,
        version: dataflow.version
      },
      SDMX_JSON_DATAFLOW_URN_NAMESPACE
    );

    const getHeaderSenderOrReceiver = obj => ({
      id: obj.organisationId,
      name: obj.organisationName && obj.organisationName.length ? {en: obj.organisationName} : null,
      contacts: (
        (obj.contactName && obj.contactName.length) ||
        (obj.contactDepartment && obj.contactDepartment.length) ||
        (obj.contactRole && obj.contactRole.length) ||
        (obj.contactEmail && obj.contactEmail.length)
      )
        ? [{
          name: (obj.contactName && obj.contactName.length)
            ? {en: obj.contactName}
            : null,
          department: (obj.contactDepartment && obj.contactDepartment.length)
            ? {en: obj.contactDepartment}
            : null,
          role: (obj.contactRole && obj.contactRole.length)
            ? {en: obj.contactRole}
            : null,
          email: (obj.contactEmail && obj.contactEmail.length)
            ? [obj.contactEmail]
            : null
        }]
        : undefined
    });

    return ({
      reportFileName: cubeCode,
      ...postRequest(
        DATAFLOW_BUILDER_WIZARD_SUBMIT,
        ddbDataflowId ? getUpdateDdbDataflowUrl() : getCreateDdbDataflowUrl(),
        {
          ddbDF: {
            IDDataflow: ddbDataflowId || undefined,
            ID: dataflow.id,
            Agency: dataflow.agencyID,
            Version: dataflow.version,
            labels: _.pickBy(dataflow.name, str => str.length > 0),
            IDCube: cube.IDCube,
            DataflowColumns:
              cubeColumns
                .filter(({checked}) => checked === true)
                .map(({ColName}) => ColName),
            filter: getServerQueryObj(null, getFilterObjFromStr(filter)).Filter
          },
          msdbDF: getSdmxJsonFromSdmxJsonStructures(
            [
              getSdmxJsonStructureFromArtefact({
                ...dataflow,
                name: _.pickBy(dataflow.name, str => str.length > 0),
                structure:
                  getUrnFromArtefactTriplet(
                    getArtefactTripletFromString(cube.DSDCode),
                    SDMX_JSON_DSD_URN_NAMESPACE
                  )
              })
            ],
            SDMX_JSON_DATAFLOW_LIST_KEY
          ),
          msdbCat: getSdmxJsonFromSdmxJsonStructures(
            [
              ...categoriesUrns.map(catUrn => {
                const categorisationId = 'CAT_' +
                  dataflow.id.substr(0, 40) +
                  '_' +
                  String(_.random(99999))
                    .padStart(5, '0');
                return getSdmxJsonStructureFromArtefact({
                  id: categorisationId,
                  agencyID: dataflow.agencyID,
                  version: dataflow.version,
                  name: {
                    en: categorisationId
                  },
                  source: dataflowUrn,
                  target: catUrn
                });
              })
            ],
            SDMX_JSON_CATEGORISATION_LIST_KEY
          ),
          header:
            header !== null
              ? ({
                ...header,
                sender: header.sender ? getHeaderSenderOrReceiver(header.sender) : null,
                receiver: (header.receiver && header.receiver.organisationId && header.receiver.organisationId.length)
                  ? [getHeaderSenderOrReceiver(header.receiver)]
                  : null,
                dataSetAgencyId: header.dataSetAgencyId,
                parentId: dataflowUrn
              })
              : undefined
        },
        t => ({
          start:
            ddbDataflowId
              ? t('scenes.dataManager.dataflowBuilder.wizard.messages.edit.start')
              : t('scenes.dataManager.dataflowBuilder.wizard.messages.create.start'),
          success:
            ddbDataflowId
              ? t('scenes.dataManager.dataflowBuilder.wizard.messages.edit.success')
              : t('scenes.dataManager.dataflowBuilder.wizard.messages.create.success')
        })
      )
    });
  };

export const readDataflowBuilderWizardDataflow = dataflowTriplet => getRequest(
  DATAFLOW_BUILDER_WIZARD_DATAFLOW_READ,
  getDataflowUrl(dataflowTriplet)
);

export const readDataflowBuilderWizardDsdForLayoutAnnotations = dsdTriplet => getRequest(
  DATAFLOW_BUILDER_WIZARD_DSD_FOR_LAYOUT_ANNOTATIONS_READ,
  getDsdUrl(dsdTriplet)
);