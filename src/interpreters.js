import { match } from "single-key";
import { compose } from "redux";

// store :: {
//   getState : () -> IO State,
//   dispatch : (id: Int, action: Action) -> IO Bool
//   rollback : (id: Int) -> IO ()
// }
const interpreteEventSource = store => {
  // run :: (id: Int, freeDsl: Free DSL a) -> IO ()
  const run = (id, freeDsl) =>
    match(freeDsl, {
      Pure: x => null,
      Impure: dsl =>
        match(dsl, {
          End: () => null,
          Rollback(next) {
            store.rollback(id);
            return run(id, next);
          },
          Read([select, next]) {
            return compose(run.bind(null, id), next, select)(store.getState());
          },
          Dispatch([action, next]) {
            store.dispatch(id, action);
            return run(id, next);
          },
          Effect([factory, next]) {
            return Promise.resolve(factory()).then(
              compose(run.bind(null, id), next)
            );
          }
        })
    });

  return run;
};

export { interpreteEventSource };
