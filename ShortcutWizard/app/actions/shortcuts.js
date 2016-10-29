// @flow
export const INCREMENT_Shortcuts = 'INCREMENT_Shortcuts';
export const DECREMENT_Shortcuts = 'DECREMENT_Shortcuts';

export function increment() {
  return {
    type: INCREMENT_Shortcuts
  };
}

export function decrement() {
  return {
    type: DECREMENT_Shortcuts
  };
}

export function incrementIfOdd() {
  return (dispatch: Function, getState: Function) => {
    const { Shortcuts } = getState();

    if (Shortcuts % 2 === 0) {
      return;
    }

    dispatch(increment());
  };
}

export function incrementAsync(delay: number = 1000) {
  return (dispatch: Function) => {
    setTimeout(() => {
      dispatch(increment());
    }, delay);
  };
}
