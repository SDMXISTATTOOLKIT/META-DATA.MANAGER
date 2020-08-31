export const SPINNER_ACTION_ADD = 'SPINNER_ACTION_ADD';
export const SPINNER_ACTION_COMPLETE = 'SPINNER_ACTION_COMPLETE';
export const SPINNER_ACTIONS_FLUSH = 'SPINNER_ACTIONS_FLUSH';

export const addSpinnerAction = (action, uuid) => ({
  type: SPINNER_ACTION_ADD,
  action,
  uuid
});

export const completeSpinnerAction = (action, uuid) => ({
  type: SPINNER_ACTION_COMPLETE,
  action,
  uuid
});

export const flushSpinnerActions = () => ({
  type: SPINNER_ACTIONS_FLUSH
});
