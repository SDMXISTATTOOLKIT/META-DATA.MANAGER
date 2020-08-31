export const getLanguageLabel = (t, langCode) => {

  const langTranslation = t(`languages.${langCode}`);

  return langTranslation !== `languages.${langCode}`
    ? langTranslation
    : langCode.toUpperCase();
};

export const getLanguageFlagIconCss = (langCode, langsConfig) => {

  const langsConfigEl = langsConfig.find(({code}) => code === langCode);

  return `flag-icon-${langsConfigEl ? langsConfigEl.flag : langCode}`
};
