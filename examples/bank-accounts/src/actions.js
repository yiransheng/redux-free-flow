import { Do } from "redux-free-flow";
import { rollback, read, dispatch, end, effect } from "redux-free-flow";
import { uniqueId } from "lodash";
import createServer from "./server-mock.js";

export function readBalance(id) {
  return read(state => state.accounts[id].amount);
}
export function withdraw(id, amount) {
  return Do(function*() {
    const balance = yield readBalance(id);
    if (balance >= amount) {
      return dispatch({
        type: "WITHDRAW",
        key: uniqueId(),
        payload: { id, amount }
      });
    } else {
      return end;
    }
  });
}
export function deposit(id, amount) {
  return dispatch({
    type: "DEPOSIT",
    key: uniqueId(),
    payload: { id, amount }
  });
}

const timeout = time => {
  return new Promise(resolve => {
    setTimeout(resolve, time);
  });
};
const delay = time => effect(() => timeout(time));

const server = createServer();
const transferOnServer = (from, to, amount) =>
  effect(server.endpoints.transfer.bind(null, from, to, amount));

export function transfer(fromAccount, toAccount, amount) {
  return Do(function*() {
    const balance = yield readBalance(fromAccount);
    if (balance >= amount) {
      yield withdraw(fromAccount, amount);
      yield delay(500);
      yield deposit(toAccount, amount);
      return read(() => true);
    }
    yield dispatch({
      type: "ERROR_INSUFFICIENT_FUNDS",
      key: uniqueId(),
      error: true
    });
    return read(() => false);
  });
}

export function transferMoney(from, to, amount) {
  return Do(function*() {
    const clientSuccess = yield transfer(from, to, amount);
    if (clientSuccess) {
      yield dispatch({ type: "CALLING_SERVER", key: uniqueId() });
      const serverResponse = yield transferOnServer(from, to, amount);
      if (serverResponse === "success") {
        yield dispatch({ type: "TRANSFER_SUCCESS", key: uniqueId() });
      } else {
        yield rollback;
        yield dispatch({ type: "TRANSFER_FAIL", key: uniqueId(), error: true });
      }
    }
  });
}
