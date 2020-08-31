// allows reusability of an action
// by adding a prefix
// params:
// - action: the action to reuse
// - prefix: the prefix to add
// returns:
// the new action with prefix
export function reuseAction(action, prefix) {
  return ({
    ...action,
    [action.label ? "label" : "type"]: prefix + (action.label || action.type) // add prefix to label or type
  });
}

// allows reusability of a reducer
// by making it responding to the same actions but with a prefix
// params:
//    - reducer: the reducer to reuse
//    - prefix: the prefix of actions
// returns:
//    the reducer responding to the same actions but with a prefix
export function reuseReducer(reducer, prefix) {
  return (state, action) => {
    if (state === undefined) { // initialization (dispatched by redux): action must be untouched
      return reducer(state, action);
    } else if ((action.label || action.type).startsWith(prefix)) { // must be managed by this reducer
      return reducer(
        state,
        {
          ...action,
          // remove prefix
          label: action.label ? action.label.substr(prefix.length) : undefined,
          type: !action.label && action.type ? action.type.substr(prefix.length) : action.type
        }
      );
    } else { // must be managed by some other reducer
      return state;
    }
  };
}

// allows a reducer to host some reusable reducers
// by nesting in the host reducer the states of the reusable reducers
// params:
//    - hostReducer: the reducer that will host other reducers
//    - hostedReducersObj: an object containing the reducers to be host
//    e.g. {hosted1: hostedReducer1, hosted2: hostedReducer2}
// returns:
//    the reducer created by extending the host reducer
export function reuseInReducer(hostReducer, hostedReducersObj) {
  return (state, action) => {
    // we have to produce an object containing a property for each new state of hosted reducers
    const hostedReducersState = {};
    for (let reducerKey of Object.keys(hostedReducersObj)) {
      hostedReducersState[reducerKey] = // create the property containing the new state of a hosted reducer...
        hostedReducersObj[reducerKey](state ? state[reducerKey] : undefined, action); // ...by calling the hosted reducer
    }
    // state returned by host reducer
    return ({
      ...hostReducer(state, action), // new state returned by host reducer own state
      ...hostedReducersState // new state returned by hosted reducers
    });
  };
}




