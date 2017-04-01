import test from "tape";
import setup from "./setup";

test("test", t => {
  t.plan(1);

  setup()
    .then(store => {
      console.log(store.getState());
      t.equal(1,1);
    });

});
