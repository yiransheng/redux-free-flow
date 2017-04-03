import { createStore } from "redux";
import enhancer from "../src/enhancer";

import { reducer, getInitialState } from "./reducer";
import createServer from "./server-mock";
import withServer from "./transaction";
import { defer, loopAsync } from "./utils";

function waitStore(store, transactionCount) {
  return new Promise(resolve => {
    const unsub = store.subscribe(() => {
      if (store.getState().transactionCount >= transactionCount) {
        unsub();
        resolve();
      }
    });
  });
}

function setup() {
  const store = createStore(reducer, getInitialState(), enhancer);

  const loop = loopAsync();
  const server = createServer(reducer, getInitialState(), loop);
  const transaction = withServer(server);
  loop.eachTick(() => {
    const from = Math.floor(Math.random() * 5) + 1;
    const to = Math.floor(Math.random() * 5) + 1;
    const amount = Math.floor(Math.random() * 100);
    store.dispatch(transaction(from, to, amount));
  });

  return Promise.all([loop.run(20), waitStore(store, 20)]).then(() => {
    return { store, server };
  });
}

export default setup;
