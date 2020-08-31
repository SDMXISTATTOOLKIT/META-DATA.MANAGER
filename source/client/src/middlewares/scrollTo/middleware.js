import {SCROLL_TO} from './actions';

const scrollToMiddleware = () => next => action => {

  if (action.type === SCROLL_TO) {
    action.element.scrollIntoView({block: 'nearest'});
  }

  return next(action);
};

export default scrollToMiddleware;
