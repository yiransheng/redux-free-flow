import test from "tape";
import setup from "./setup";

test("test", t => {
  t.plan(1);

  setup().then(({ store, server }) => {
    setTimeout(
      () => {
        console.log(store.getState());
        console.log(server.getState());
        t.equal(1, 1);
      },
      100
    );
  });
});
