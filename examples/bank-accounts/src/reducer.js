import { match } from "single-key";

export const getInitialState = () => {
  return {
    accounts: {
      "1": { id: 1, amount: 100, name: "Checking" },
      "2": { id: 2, amount: 100, name: "Saving" },
      "3": { id: 3, amount: 100, name: "Card 1" },
      "4": { id: 4, amount: 100, name: "Card 2" },
      "5": { id: 5, amount: 100, name: "Card 3" }
    },
    actionLogs: [],
    acctSelection: {
      None: null
    }
  };
};

const baseReducer = (state, action) => {
  switch (action.type) {
    case "ANIMATE_START":
      return (() => {
        const id = action.payload;
        const account = state.accounts[id];
        const accounts = {
          ...state.accounts,
          [id]: { ...account, animating: true }
        };
        return { ...state, accounts };
      })();
    case "ANIMATE_END":
      return (() => {
        const id = action.payload;
        const account = state.accounts[id];
        const accounts = {
          ...state.accounts,
          [id]: { ...account, animating: false }
        };
        return { ...state, accounts };
      })();
    case "SELECT_ACCOUNT":
      const acctId = action.payload;
      const acctSelection = match(state.acctSelection, {
        None: () => ({ From: acctId }),
        From: from =>
          from === acctId ? { None: null } : { Both: [from, acctId] },
        Both: ([from, to]) =>
          from === acctId
            ? { None: null }
            : to === acctId ? { From: from } : { Both: [from, acctId] }
      });
      return { ...state, acctSelection };
    case "UNSELECT_ACCOUNTS":
      return { ...state, acctSelection: { None: null } };
    case "WITHDRAW":
      const { id, amount } = action.payload;
      const account = state.accounts[id];
      const balance = account.amount;
      return {
        ...state,
        accounts: {
          ...state.accounts,
          [id]: { ...account, amount: balance - amount }
        }
      };
    case "DEPOSIT":
      return baseReducer(state, {
        payload: {
          ...action.payload,
          amount: -action.payload.amount
        },
        type: "WITHDRAW"
      });

    default:
      return state;
  }
};

const loggedActions = new Set([
  "WITHDRAW",
  "DEPOSIT",
  "CALLING_SERVER",
  "TRANSFER_SUCCESS",
  "TRANSFER_FAIL"
]);

let counter = 0;
const reducer = (state, action) => {
  if (!loggedActions.has(action.type)) {
    return baseReducer(state, action);
  }
  const { actionLogs } = state;
  const logAction = { key: `k_${++counter}`, ...action };
  return {
    ...baseReducer(state, action),
    actionLogs: [logAction, ...actionLogs].slice(0, 10)
  };
};

export default reducer;
