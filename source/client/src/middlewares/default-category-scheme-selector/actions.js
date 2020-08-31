import {getRequest} from '../api/actions';
import {getCategorySchemeUrl, getImportDCSUrl} from '../../constants/urls';

export const DEFAULT_CATEGORY_SCHEME_SELECTOR_SHOW = 'DEFAULT_CATEGORY_SCHEME_SELECTOR_SHOW';
export const DEFAULT_CATEGORY_SCHEME_SELECTOR_HIDE = 'DEFAULT_CATEGORY_SCHEME_SELECTOR_HIDE';
export const DEFAULT_CATEGORY_SCHEME_SELECTOR_CATEGORY_SCHEMES_READ = 'DEFAULT_CATEGORY_SCHEME_SELECTOR_CATEGORY_SCHEMES_READ';
export const DEFAULT_CATEGORY_SCHEME_SELECTOR_SUBMIT = 'DEFAULT_CATEGORY_SCHEME_SELECTOR_SUBMIT';

export const showDefaultCategorySchemeSelector = () => ({
  type: DEFAULT_CATEGORY_SCHEME_SELECTOR_SHOW
});

export const hideDefaultCategorySchemeSelector = () => ({
  type: DEFAULT_CATEGORY_SCHEME_SELECTOR_HIDE
});

export const readDefaultCategorySchemeSelectorCategorySchemes = () =>
  getRequest(
    DEFAULT_CATEGORY_SCHEME_SELECTOR_CATEGORY_SCHEMES_READ,
    getCategorySchemeUrl()
  );

export const submitDefaultCategorySchemeSelector = categorySchemeTriplet =>
  getRequest(
    DEFAULT_CATEGORY_SCHEME_SELECTOR_SUBMIT,
    getImportDCSUrl(
      categorySchemeTriplet.id,
      categorySchemeTriplet.agencyID,
      categorySchemeTriplet.version
    ),
    t => ({
      start: t('middlewares.defaultCategorySchemeSelector.messages.submit.start'),
      success: t('middlewares.defaultCategorySchemeSelector.messages.submit.success')
    })
  );
