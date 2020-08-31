import {
  CONFIG_TYPE_NODES, getCheckAgencyAssignedToAnyUserUrl,
  getCheckEndpointDMUrl,
  getCheckEndpointMAUrl,
  getCheckEndpointNSIUrl,
  getConfigUrl,
  getDeleteConfigNodeUrl,
  getMsdUrl,
  getSaveConfigNodeUrl,
  getSortNodesUrl
} from '../../../constants/urls';
import {deleteRequest, getRequest, postRequest} from '../../../middlewares/api/actions';
import {pingMetadataApi} from "../../../middlewares/metadata-api/actions";

export const NODES_CONFIG_CONFIG_READ = 'NODES_CONFIG_CONFIG_READ';
export const NODES_CONFIG_CONFIG_CHANGE = 'NODES_CONFIG_CONFIG_CHANGE';
export const NODES_CONFIG_NODE_CONFIG_SUBMIT = 'NODES_CONFIG_NODE_CONFIG_SUBMIT';
export const NODES_CONFIG_NODE_ADD = 'NODES_CONFIG_NODE_ADD';
export const NODES_CONFIG_NEW_NODE_REMOVE = 'NODES_CONFIG_NEW_NODE_REMOVE';
export const NODES_CONFIG_NODE_REMOVE = 'NODES_CONFIG_NODE_REMOVE';
export const NODES_CONFIG_NODE_SORT = 'NODES_CONFIG_NODE_SORT';
export const NODES_CONFIG_NODE_COLLAPSED_CHANGE = 'NODES_CONFIG_NODE_COLLAPSED_SET';
export const NODES_CONFIG_NODE_CHECK_ENDPOINT_NSI = 'NODES_CONFIG_NODE_CHECK_ENDPOINT_NSI';
export const NODES_CONFIG_NODE_CHECK_ENDPOINT_MA = 'NODES_CONFIG_NODE_CHECK_ENDPOINT_MA';
export const NODES_CONFIG_NODE_CHECK_ENDPOINT_DM = 'NODES_CONFIG_NODE_CHECK_ENDPOINT_DM';
export const NODES_CONFIG_NODE_CHECK_ENDPOINT_MD = 'NODES_CONFIG_NODE_CHECK_ENDPOINT_MD';
export const NODES_CONFIG_NODE_AGENCY_ASSIGNED_TO_ANY_USER_CHECK = 'NODES_CONFIG_NODE_AGENCY_ASSIGNED_TO_ANY_USER_CHECK';

export const NODES_CONFIG_MSDS_SHOW = 'NODES_CONFIG_MSDS_SHOW';
export const NODES_CONFIG_MSDS_HIDE = 'NODES_CONFIG_MSDS_HIDE';
export const NODES_CONFIG_MSDS_READ = 'NODES_CONFIG_MSDS_READ';
export const NODES_CONFIG_MSD_SET = 'NODES_CONFIG_MSD_SET';
export const NODES_CONFIG_MSD_UNSET = 'NODES_CONFIG_MSD_UNSET';

export const getNodesConfigConfig = () =>
  getRequest(
    NODES_CONFIG_CONFIG_READ,
    getConfigUrl(CONFIG_TYPE_NODES)
  );

export const changeNodesConfigConfig = config => ({
  type: NODES_CONFIG_CONFIG_CHANGE,
  config
});

export const submitNodesConfigNodeConfig = (nodeConfig, username, password) =>
  postRequest(
    NODES_CONFIG_NODE_CONFIG_SUBMIT,
    getSaveConfigNodeUrl(username, password ? btoa(password) : undefined),
    {
      ...nodeConfig,
      isNewNode: undefined,
      isCollapsed: undefined,
      isNSIPingOk: undefined,
      isMAPingOk: undefined,
      isDMPingOk: undefined
    },
    t => ({
      success: t('scenes.configuration.nodesConfig.messages.nodeSubmit.success')
    })
  );

export const addNodesConfigNode = dataLangs => ({
  type: NODES_CONFIG_NODE_ADD,
  dataLangs
});

export const removeNodesConfigNewNode = nodeIndex => ({
  type: NODES_CONFIG_NEW_NODE_REMOVE,
  nodeIndex
});

export const removeNodesConfigNode = (nodeIndex, nodeId) => ({
  ...deleteRequest(
    NODES_CONFIG_NODE_REMOVE,
    getDeleteConfigNodeUrl(nodeId),
    t => ({
      success: t('scenes.configuration.nodesConfig.messages.nodeDelete.success')
    })
  ),
  nodeIndex
});

export const sortNodesConfigNode = orderedNodes => ({
  ...postRequest(
    NODES_CONFIG_NODE_SORT,
    getSortNodesUrl(),
    orderedNodes.map(node => node.General.ID),
    t => ({
      success: t('scenes.configuration.nodesConfig.messages.nodeSort.success')
    })
  ),
  orderedNodes
});

export const changeNodesConfigNodeCollapsed = (nodeIndex, collapsed) => ({
  type: NODES_CONFIG_NODE_COLLAPSED_CHANGE,
  nodeIndex,
  collapsed
});

export const checkEndpointNSIUrl = (nodeIndex, config) => ({
  ...postRequest(
    NODES_CONFIG_NODE_CHECK_ENDPOINT_NSI,
    getCheckEndpointNSIUrl(),
    config
  ),
  nodeIndex
});

export const checkEndpointMAUrl = (nodeIndex, config) => ({
  ...postRequest(
    NODES_CONFIG_NODE_CHECK_ENDPOINT_MA,
    getCheckEndpointMAUrl(),
    config
  ),
  nodeIndex
});

export const checkEndpointDMUrl = (nodeIndex, config) => ({
  ...postRequest(
    NODES_CONFIG_NODE_CHECK_ENDPOINT_DM,
    getCheckEndpointDMUrl(),
    config
  ),
  nodeIndex
});

export const showNodesConfigMsds = nodeIndex => ({
  type: NODES_CONFIG_MSDS_SHOW,
  nodeIndex
});

export const hideNodesConfigMsds = () => ({
  type: NODES_CONFIG_MSDS_HIDE
});

export const readNodesConfigMsds = () => getRequest(
  NODES_CONFIG_MSDS_READ,
  getMsdUrl()
);

export const setNodesConfigMsd = msd => ({
  type: NODES_CONFIG_MSD_SET,
  msd
});

export const unsetNodesConfigMsd = nodeIndex => ({
  type: NODES_CONFIG_MSD_UNSET,
  nodeIndex
});

export const checkEndpointMDUrl = (nodeIndex, metadataApiUrl) => ({
  ...pingMetadataApi(
    NODES_CONFIG_NODE_CHECK_ENDPOINT_MD,
    metadataApiUrl
  ),
  nodeIndex
});

export const checkNodesConfigNodeAgencyAssignedToAnyUser = (agencyCode, nodeCode, onSuccess) => ({
  ...getRequest(
    NODES_CONFIG_NODE_AGENCY_ASSIGNED_TO_ANY_USER_CHECK,
    getCheckAgencyAssignedToAnyUserUrl(agencyCode, nodeCode)
  ),
  onSuccess
});