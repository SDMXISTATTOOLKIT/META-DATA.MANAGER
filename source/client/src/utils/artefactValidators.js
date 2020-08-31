import _ from "lodash";

export function isDateValid(validFrom, validTo) {
  return !validFrom || !validTo || validFrom <= validTo;
}

export function isVersionValidWithHelp(t, version) {

  const MAX_LENGTH = 10;

  if (!version || version.length === 0) {
    return ({valid: true});
  } else if (version.length > 10) { // max length 10
    return ({valid: false, help: t('validators.version.exceddsMaxLength', {maxLength: MAX_LENGTH})});
  } else if (version.indexOf(".") < 0) { // must contain "."
    return ({valid: false, help: t('validators.version.notContainsDot')});
  } else if (version.substr(version.length - 1) === ".") { // must not end with .
    return ({valid: false, help: t('validators.version.endsWithDot')});
  } else {

    const arr = version.split(".");

    if (arr.length > 3) { // max version depth is x.y.z
      return ({valid: false, help: t('validators.version.exceddsMaxDepth')});
    } else if (
      arr.filter(number => number === "0" || /^[1-9]([0-9]*)$/.test(number)).length !== arr.length
    ) { // each x, y, z must be 0 or a number
      return ({valid: false, help: t('validators.version.componentIsInvalid')});
    } else {
      return ({valid: true});
    }
  }
}

export function isDictionaryValid(dictionary) {
  return dictionary !== undefined && dictionary !== null &&
    _(dictionary)
      .pickBy(val => val !== undefined && val !== null && val.length > 0)
      .keys()
      .value().length > 0
}

export function isArtefactValid(artefact) {
  return !(
    artefact === null || artefact === undefined ||
    artefact.id === null || artefact.id.length === 0 ||
    artefact.agencyID === null || artefact.agencyID.length === 0 ||
    artefact.version === null || artefact.version.length === 0 ||
    artefact.dsd === null ||
    artefact.msd === null ||
    !isVersionValidWithHelp(f => f, artefact.version).valid ||
    !isDateValid(artefact.validFrom, artefact.validTo) ||
    !isDictionaryValid(artefact.name)
  );
}