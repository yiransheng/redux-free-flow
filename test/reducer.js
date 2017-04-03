export function getInitialState() {
  return {
    "1": 100,
    "2": 100,
    "3": 100,
    "4": 100,
    "5": 100,
    transactionCount: 0
  };
}

export const actionTypes = {
  COMPLETE: "@@client-side/COMPLETE",
  WITHDRAW: "@@client-side/WITHDRAW",
  DEPOSIT: "@@client-side/DEPOSIT",
  TRANSFER: "@@server-side/TRANSFER"
};

export function reducer(state, action) {
  const { payload = {} } = action;
  const { amount = 0 } = payload;
  switch (action.type) {
    case actionTypes.COMPLETE:
      return { ...state, transactionCount: state.transactionCount + 1 };
    case actionTypes.DEPOSIT:
      return { ...state, [payload.id]: state[payload.id] + amount };
    case actionTypes.WITHDRAW:
      return state[payload.id] >= amount
        ? { ...state, [payload.id]: state[payload.id] - amount }
        : state;
    case actionTypes.TRANSFER:
      return state[payload.from] >= amount && payload.from !== payload.to
        ? {
            ...state,
            [payload.from]: state[payload.from] - amount,
            [payload.to]: state[payload.to] + amount
          }
        : state;
    default:
      return state;
  }
}
