import { match } from "single-key";
import { compose } from "redux";

const isFreeSymbol = Symbol("free");

export const FreePrototype = {
  [isFreeSymbol]: true,

  then(f) {
    return match(this, {
      Pure: f,
      Impure: functor => Impure(functor.map(v => v.then(f)))
    });
  },
  map(f) {
    return this.map(compose(Pure, f));
  }
};

const create = Object.create.bind(Object, FreePrototype);
const assign = Object.assign;

const Pure = val => assign(create(), { Pure: val });
const Impure = val => assign(create(), { Impure: val });

const isFree = value => Object(value) === value && value[isFreeSymbol];

const liftFree = functor => Impure(functor.map(Pure));

const Do = generator => {
  const iter = generator();
  const recurr = val => {
    const { value: free, done } = iter.next(val);
    if (!done) {
      return free.then(recurr);
    } else {
      return isFree(free) ? free : Pure(null);
    }
  };
  return recurr();
};

export { Pure, Impure, isFree, liftFree, Do };
