import { createStore } from "redux";
import enhancer from "../src/enhancer";

import { reducer, getInitialState } from "./reducer";
import createServer from "./server-mock";
import withServer from "./transaction";
import { loopAsync } from "./utils";

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

  return loop.run(10).then(() => {
    return { store, server }; 
  });
}

export default setup;
