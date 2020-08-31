import {getRequest, postRequest} from '../../../../middlewares/api/actions';
import {getCubeUrl, getDsdUrl} from '../../../../constants/urls';
import {
  getArtefactTripletFromString,
  getArtefactTripletFromUrn,
  getStringFromArtefactTriplet
} from '../../../../utils/sdmxJson';
import _ from 'lodash';

export const BUILDER_CUBE_FORM_CHANGE = 'BUILDER_CUBE_FORM_CHANGE';
export const BUILDER_CUBE_FORM_CUBE_READ = 'BUILDER_CUBE_FORM_CUBE_READ';
export const BUILDER_CUBE_FORM_DSD_READ = 'BUILDER_CUBE_FORM_DSD_READ';
export const BUILDER_CUBE_FORM_SUBMIT = 'BUILDER_CUBE_FORM_SUBMIT';

export const readBuilderCubeFormDsd = dsdCode =>
  getRequest(
    BUILDER_CUBE_FORM_DSD_READ,
    getDsdUrl(getArtefactTripletFromString(dsdCode))
  );

export const changeBuilderCubeForm = fields => ({
  type: BUILDER_CUBE_FORM_CHANGE,
  fields
});

export const readBuilderCubeFormCube = cubeId =>
  getRequest(
    BUILDER_CUBE_FORM_CUBE_READ,
    getCubeUrl(cubeId)
  );

export const submitBuilderCubeForm = cube => {

  const getMapAttribute = IsTid => attr => ({
    IsTid,
    Code: IsTid ? 'TID' : attr.Code,
    IsMandatory: attr.disabled,
    AttachmentLevel: IsTid ? 'Dataset' : attr.attachmentLevel,
    CodelistCode: (
      !IsTid && attr.localRepresentation && attr.localRepresentation.enumeration &&
      getStringFromArtefactTriplet(getArtefactTripletFromUrn(attr.localRepresentation.enumeration))
    ) || null,
    refDim: (attr.attributeRelationship && attr.attributeRelationship.dimensions) || attr.otherGroupDimensions || []
  });

  const getMapDimension = IsTimeSeriesDim => dim => ({
    IsTimeSeriesDim,
    Code: dim.Code,
    CodelistCode: (
      dim.localRepresentation && dim.localRepresentation.enumeration &&
      getStringFromArtefactTriplet(getArtefactTripletFromUrn(dim.localRepresentation.enumeration))
    ) || null,
  });

  const cubeToSend = {
    Code: cube.Code,
    labels: _.pickBy(cube.labels, str => str.length > 0),
    IDCat: cube.IDCat,
    DSDCode: cube.DSDCode,
    Attributes: [
      ...cube.cubeComponents.attributes.filter(attr => attr.checked)
        .map(getMapAttribute(false)),
      ...cube.cubeComponents.tidAttributes.filter(attr => attr.checked)
        .map(getMapAttribute(true)),
    ],
    Dimensions: [
      ...cube.cubeComponents.dimensions.filter(dim => dim.checked)
        .map(getMapDimension(false)),
      ...cube.cubeComponents.timeDimensions.filter(dim => dim.checked)
        .map(getMapDimension(true))
    ],
    Measures: cube.cubeComponents.measures.map(meas => ({
      Code: meas.Code,
      IsAlphanumeric: cube.observedValueCanBeAlphanumeric
    }))
  };

  return postRequest(
    BUILDER_CUBE_FORM_SUBMIT,
    getCubeUrl(),
    cubeToSend,
    t => ({
      start: t('scenes.dataManager.builder.cubeForm.messages.submit.start'),
      success: t('scenes.dataManager.builder.cubeForm.messages.submit.success')
    })
  );
};
