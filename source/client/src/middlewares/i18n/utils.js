export const getLocalizedStr = (multilangStr, prefLang, dataLangs) => {

  if (multilangStr === null || multilangStr === undefined || multilangStr === {}) {
    return null
  }
  if (typeof (multilangStr) === "string") {
    return multilangStr
  }
  if (multilangStr[prefLang]) {
    return multilangStr[prefLang];
  }
  for (let {code} of dataLangs) {
    if (multilangStr[code]) {
      return multilangStr[code];
    }
  }
  return multilangStr[Object.keys(multilangStr)[0]];
};