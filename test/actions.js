import { actionTypes } from "./reducer";

export function withdraw(id, amount) {
  return {
    type: actionTypes.WITHDRAW,
    payload: { id, amount }
  };
}
export function deposit(id, amount) {
  return {
    type: actionTypes.DEPOSIT,
    payload: { id, amount }
  };
}
export function transfer(from, to, amount) {
  return {
    type: actionTypes.TRANSFER,
    payload: { from, to, amount }
  };
}
