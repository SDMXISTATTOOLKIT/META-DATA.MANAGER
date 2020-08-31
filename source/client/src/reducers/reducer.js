import { combineReducers } from 'redux';
import appReducer from './app/reducer';
import configReducer from './config/reducer';
import scenesReducer from './scenes/reducer';
import middlewaresReducer from './middlewares/reducer';

const rootReducer = combineReducers({
  config: configReducer,
  app: appReducer,
  scenes: scenesReducer,
  middlewares: middlewaresReducer
});

export default rootReducer;
