import { match } from "single-key";
import { compose } from "redux";
import { isFree, Pure, liftFree } from "./free";

const DSLPrototype = {
  map(f) {
    return match(this, {
      End: () => End,
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

const create = Object.create.bind(Object, DSLPrototype);
const assign = Object.assign;
const id = x => x;

const End = assign(create(), { End: true });

const Read = (select, next) => assign(create(), { Read: [select, next] });

const Dispatch = (action, next) =>
  assign(create(), { Dispatch: [action, next] });

const Effect = (promiseFactory, next) =>
  assign(create(), { Effect: [promiseFactory, next] });

const end = Pure(end);
const read = select => liftFree(Read(select, id));
const dispatch = action =>
  isFree(action) ? action : liftFree(Dispatch(action, null));
const effect = factory => liftFree(Effect(factory, id));

export { end, read, dispatch, effect };
