import test from "tape";
import setup from "./application";

test("test", {timeout: 5000}, t => {
  t.plan(1);

  setup().then(({ store, server }) => {
    const { transactionCount: _, ...storeState } = store.getState();
    const { transactionCount: __, ...serverState } = server.getState();

    t.deepEqual(
      storeState,
      serverState,
      'store state and "server" state should be consistent.'
    );
  });
});
