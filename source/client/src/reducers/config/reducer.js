import {REQUEST_SUCCESS} from '../../middlewares/api/actions';
import {CONFIG_READ} from './actions';

const configReducer = (
  state = {
    nodes: [],
    userInterface: {
      defaultTableRows: null,
      maxTableRows: null,
      defaultSidebarCollapsed: null,
      defaultLanguage: null,
      languages: [],
      anonymousPages: [],
      minTreeNodesForPagination: null,
      maxTreeNodesForPagination: null,
      treePageSize: null
    },
    dataManagement: {
      cubeCodePrefix: null,
      dataLanguages: [],
      maxDescriptionLength: null
    }
  },
  action
) => {
  switch (action.type) {
    case REQUEST_SUCCESS:
      switch (action.label) {
        case CONFIG_READ:
          return {
            ...action.response,
            nodes: action.response.nodes.map(node => ({
              ...node,
              annotations: {
                ...node.annotations,
                categorisationsOrder: "ORDER" // TODO: mock
              }
            })),
            userInterface: action.response.userInterface
          };
        default:
          return state;
      }
    default:
      return state;
  }
};

export default configReducer;
