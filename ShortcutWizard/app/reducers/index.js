// @flow
import { combineReducers } from 'redux';
import { routerReducer as routing } from 'react-router-redux';
import Shortcuts from './Shortcuts';

const rootReducer = combineReducers({
  Shortcuts,
  routing
});

export default rootReducer;
