// @flow
import { INCREMENT_Shortcuts, DECREMENT_Shortcuts } from '../actions/Shortcuts';

export default function Shortcuts(state: number = 0, action: Object) {
  switch (action.type) {
    case INCREMENT_Shortcuts:
      return state + 1;
    case DECREMENT_Shortcuts:
      return state - 1;
    default:
      return state;
  }
}
