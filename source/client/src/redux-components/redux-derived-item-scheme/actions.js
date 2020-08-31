export const DERIVED_ITEM_SCHEME_ITEM_SELECT = 'DERIVED_ITEM_SCHEME_ITEM_SELECT';
export const DERIVED_ITEM_SCHEME_ITEMS_ADD = 'DERIVED_ITEM_SCHEME_ITEMS_ADD';
export const DERIVED_ITEM_SCHEME_ITEMS_REMOVE = 'DERIVED_ITEM_SCHEME_ITEMS_REMOVE';
export const DERIVED_ITEM_SCHEME_CHECKBOX_CHANGE = 'DERIVED_ITEM_SCHEME_CHECKBOX_CHANGE';
export const DERIVED_ITEM_SCHEME_CREATE_SHOW = 'DERIVED_ITEM_SCHEME_CREATE_SHOW';
export const DERIVED_ITEM_SCHEME_CREATE_CHANGE = 'DERIVED_ITEM_SCHEME_CREATE_CHANGE';
export const DERIVED_ITEM_SCHEME_CREATE_HIDE = 'DERIVED_ITEM_SCHEME_CREATE_HIDE';

export const DERIVED_ITEM_SCHEME_STATE_RESET = 'DERIVED_ITEM_SCHEME_STATE_RESET';

export const selectDerivedItemSchemeItem = (selectedArr, isSource) => ({
  type: DERIVED_ITEM_SCHEME_ITEM_SELECT,
  selectedArr,
  isSource
});

export const addDerivedItemSchemeItems = (itemTree, childrenKey) => ({
  type: DERIVED_ITEM_SCHEME_ITEMS_ADD,
  itemTree,
  childrenKey
});

export const removeDerivedItemSchemeItems = items => ({
  type: DERIVED_ITEM_SCHEME_ITEMS_REMOVE,
  items
});

export const changeDerivedItemSchemeCheckbox = checkbox => ({
  type: DERIVED_ITEM_SCHEME_CHECKBOX_CHANGE,
  checkbox
});

export const showDerivedItemSchemeCreate = () => ({
  type: DERIVED_ITEM_SCHEME_CREATE_SHOW
});

export const hideDerivedItemSchemeCreate = () => ({
  type: DERIVED_ITEM_SCHEME_CREATE_HIDE
});

export const changeDerivedItemSchemeCreate = fields => ({
  type: DERIVED_ITEM_SCHEME_CREATE_CHANGE,
  fields
});

export const resetDerivedItemSchemeState = () => ({
  type: DERIVED_ITEM_SCHEME_STATE_RESET
});