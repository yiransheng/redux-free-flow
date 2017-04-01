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
      const balance = readBalance(from);
      if (balance >= amount) {
        yield deposit(to, amount);
        yield withdraw(from, amount);
        const response = yield effect(callServer(from, to, amount));
        yield response === "success" ? end : rollback;
      }
    });
  }
  return transaction;
}
