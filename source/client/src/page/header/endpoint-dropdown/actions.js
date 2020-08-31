import { getRequest } from '../../../middlewares/api/actions';
import { getNodePingUrl } from '../../../constants/urls';

export const ENDPOINT_DROPDOWN_NODE_PING = 'ENDPOINT_DROPDOWN_NODE_PING';

export const pingNode = () => getRequest(
  ENDPOINT_DROPDOWN_NODE_PING,
  getNodePingUrl()
);
