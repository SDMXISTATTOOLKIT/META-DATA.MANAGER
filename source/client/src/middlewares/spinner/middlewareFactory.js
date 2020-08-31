import {flushSpinnerActions, SPINNER_ACTION_ADD, SPINNER_ACTION_COMPLETE} from './actions';

const spinnerMiddlewareFactory = timeout => {

  window.spinnerTimeout = null;

  return ({ getState, dispatch }) => next => action => {

    const result = next(action);

    switch (action.type) {
      case SPINNER_ACTION_ADD:
        if (window.spinnerTimeout !== null) {
          clearTimeout(window.spinnerTimeout);
        }
        break;
      case SPINNER_ACTION_COMPLETE:
        if (getState().middlewares.spinner.actions.filter(action => !action.isCompleted).length === 0) {
          window.spinnerTimeout = setTimeout(
            () => {
              window.spinnerTimeout = null;
              dispatch(flushSpinnerActions());
            },
            timeout
          );
        }
        break;
      default:
    }

    return result;
  };
};

export default spinnerMiddlewareFactory;
