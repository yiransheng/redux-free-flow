export function getInitialState() {
  return {
    "1": 100,
    "2": 100,
    "3": 100,
    "4": 100,
    "5": 100
  };
}

export const actionTypes = {
  WITHDRAW: "@@client-side/WITHDRAW",
  DEPOSIT: "@@client-side/DEPOSITE",
  TRANSFER: "@@server-side/TRANSFER"
};

export function reducer(state, action) {
  const { amount } = action.payload;
  if (amount <= 0) {
    return state;
  }
  switch (action.type) {
    case actionTypes.DEPOSIT:
      return { ...state, [action.id]: state[action.id] + amount };
    case actionTypes.WITHDRAW:
      return state[action.id] >= amount
        ? { ...state, [action.id]: state[action.id] - amount }
        : state;
    case actionTypes.TRANSFER:
      return state[action.from] >= amount
        ? {
            ...state,
            [action.from]: state[action.from] - amount,
            [action.to]: state[action.to] + amount
          }
        : state;
    default:
      return state;
  }
}
