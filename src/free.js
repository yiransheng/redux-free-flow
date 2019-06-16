import { match } from "single-key";
import { compose } from "redux";
import { tag } from "./utils";

const isFreeSymbol = Symbol("free");

/* eslint no-use-before-define: "off" */
export const FreePrototype = {
  [isFreeSymbol]: true,

  then(f) {
    return match(this, {
      Pure: f,
      Impure: functor => Impure(functor.map(x => x.then(f)))
    });
  },
  andThen(f) {
    return match(this, {
      Pure: f,
      Impure: functor => Impure(functor.map(x => x.then(f)))
    });
  },
  map(f) {
    return this.then(compose(Pure, f));
  }
};

const Free = tag(FreePrototype);

const Pure = value => Free({ Pure: value });
const Impure = functor => Free({ Impure: functor });

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
