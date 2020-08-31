import {allRequest, REQUEST_METHOD_GET} from '../../../../middlewares/api/actions';
import {getCategorySchemeUrl, getDataflowUrl, getDdbDataflowUrl} from '../../../../constants/urls';

export const DATAFLOW_BUILDER_TREE_SHOW = 'DATAFLOW_BUILDER_TREE_SHOW';
export const DATAFLOW_BUILDER_TREE_HIDE = 'DATAFLOW_BUILDER_TREE_HIDE';
export const DATAFLOW_BUILDER_TREE_CATEGORISED_DATAFLOWS_READ = 'DATAFLOW_BUILDER_TREE_CATEGORISED_DATAFLOWS_READ';

export const showDataflowBuilderTree = () => ({
  type: DATAFLOW_BUILDER_TREE_SHOW
});

export const hideDataflowBuilderTree = () => ({
  type: DATAFLOW_BUILDER_TREE_HIDE
});

export const readDataflowBuilderTreeCategorisedDataflows = lang => ({
  ...allRequest(
    DATAFLOW_BUILDER_TREE_CATEGORISED_DATAFLOWS_READ,
    [REQUEST_METHOD_GET, REQUEST_METHOD_GET, REQUEST_METHOD_GET],
    [getDdbDataflowUrl(), getCategorySchemeUrl(null, true), getDataflowUrl()]
  ),
  lang
});
