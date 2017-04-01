import { withdraw, deposit, transfer } from "./actions";
import { Do, end, dispatch, read, effect, rollback } from "../src/index";

function readBalance(id) {
  return read(state => state[id]);
}

export default function withServer(server) {
  const callServer = (from, to, amount) => {
    return () => server.request(transfer(from, to, amount));
  };

  function transaction(from, to, amount) {
    return Do(function*() {
      const balance = yield readBalance(from);
      if (balance >= amount) {
        yield dispatch(deposit(to, amount));
        yield dispatch(withdraw(from, amount));
        const response = yield effect(callServer(from, to, amount));
        return response === "success" ? end : rollback;
      }
      return end
    });
  }
  return transaction;
}
