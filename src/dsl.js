import { match } from "single-key";
import { compose } from "redux";
import { isFree, Impure, liftFree } from "./free";
import { tag, identity } from "./utils";

// -- forall. v, State, Action data DSL a =
// --    End
// --  | Rollback
// --  | Dispatch Action a
// --  | Read (State -> v) (v -> a)
// --  | Effect (State -> Promise v) (v -> a)

// make it a Functor

/* eslint no-use-before-define: "off" */
const DSLPrototype = {
  map(f) {
    return match(this, {
      End: () => End,
      Rollback: next => Rollback(f(next)),
      Read([select, next]) {
        return Read(select, compose(f, next));
      },
      Dispatch([action, next]) {
        return Dispatch(action, f(next));
      },
      Effect([promiseFactory, next]) {
        return Effect(promiseFactory, compose(f, next));
      }
    });
  }
};

const DSL = tag(DSLPrototype);

const End = DSL({ End: true });
const Read = (select, next) => DSL({ Read: [select, next] });
const Dispatch = (action, next) => DSL({ Dispatch: [action, next] });
const Effect = (factory, next) => DSL({ Effect: [factory, next] });
const Rollback = next => DSL({ Rollback: next });

const end = Impure(End);
const read = select => liftFree(Read(select, identity));
const dispatch = action =>
  isFree(action) ? action : liftFree(Dispatch(action, null));
const effect = factory => liftFree(Effect(factory, identity));
const rollback = liftFree(Rollback(null));

export { end, rollback, read, dispatch, effect };
