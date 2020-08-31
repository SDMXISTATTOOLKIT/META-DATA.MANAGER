import { NEW_TAB_OPEN } from './actions';

const newTabMiddleware = () => next => action => {

  if (action.type === NEW_TAB_OPEN) {
    window.open(action.url, '_blank');
  }

  return next(action);
};

export default newTabMiddleware;
