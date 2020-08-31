export const categorisationsSorterFactory = (annotationType, lang) => (a, b) => {

  const aOrderAnnot = a.autoAnnotations && a.autoAnnotations.length && a.autoAnnotations.find(({type}) => type === annotationType);
  const bOrderAnnot = b.autoAnnotations && b.autoAnnotations.length && b.autoAnnotations.find(({type}) => type === annotationType);

  if (aOrderAnnot && aOrderAnnot.text && aOrderAnnot.text[lang] && bOrderAnnot && bOrderAnnot.text && bOrderAnnot.text[lang]) {
    return Number(aOrderAnnot.text[lang]) - Number(bOrderAnnot.text[lang]);
  } else {
    return 0;
  }
};