import { match } from "single-key";
import { compose } from "redux";
import { Impure } from "./free";

const interpreteDispatch = store => {
  const run = freeDsl => {
    const result = match(freeDsl, {
      Pure: x => x,
      FlatMap() {
        return  run(freeDsl._expand());
      },
      Impure: dsl => match(dsl, {
        End: () => null,
        Read([select, next]) {
          return compose(run, next, select)(store.getState());
        },
        Dispatch([action, next]) {
          store.dispatch(action);
          return run(next);
        },
        Effect([factory, next]) {
          return Promise.resolve(factory()).then(compose(run, next));
        }
      })
    });
    return Promise.resolve(result);
  };

  return run;
};

export { interpreteDispatch };
