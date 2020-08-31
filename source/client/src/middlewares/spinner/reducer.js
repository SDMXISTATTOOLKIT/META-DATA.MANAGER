import {SPINNER_ACTION_ADD, SPINNER_ACTION_COMPLETE, SPINNER_ACTIONS_FLUSH} from './actions';

const spinnerReducer = (
  state = {
    actions: [],
  },
  action
) => {
  switch (action.type) {
    case SPINNER_ACTION_ADD:
      return {
        ...state,
        actions: [
          ...state.actions,
          ({
            ...action,
            isCompleted: false
          })
        ]
      };
    case SPINNER_ACTION_COMPLETE:
      return {
        ...state,
        actions: state.actions.map(el =>
          el.uuid === action.uuid
            ? ({
              ...el,
              isCompleted: true
            })
            : el
        )
      };
    case SPINNER_ACTIONS_FLUSH:
      return {
        ...state,
        actions: []
      };
    default:
      return state;
  }
};

export default spinnerReducer;
