import test from "tape";
import setup from "./setup";


test("test", t => {
  t.plan(1);

  setup().then(({ store, server }) => {
    const storeState = store.getState();
    const serverState = server.getState();
    console.log("store", storeState);
    console.log("server", serverState);
    t.deepEqual(storeState, serverState);
  });
});
