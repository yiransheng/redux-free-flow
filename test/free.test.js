import { Do, Pure, Impure, liftFree } from "../src/free";
import { compose } from "redux";
import { match } from "single-key";
import test from "tape";

const id = x => x;
const unit = null;

test("free monad to represent Nested List", t => {
  t.plan(1);
  // List functor -> Free Monad
  const fromArrayOrElement = xs => {
    return Array.isArray(xs) ? Impure(xs.map(fromArrayOrElement)) : Pure(xs);
  };
  const free = fromArrayOrElement([1, [2, [3, 4]], [5, [6, [7, 8]]]]);
  t.deepEqual(
    JSON.parse(JSON.stringify(free)),
    {
      Impure: [
        { Pure: 1 },
        { Impure: [{ Pure: 2 }, { Impure: [{ Pure: 3 }, { Pure: 4 }] }] },
        {
          Impure: [
            { Pure: 5 },
            { Impure: [{ Pure: 6 }, { Impure: [{ Pure: 7 }, { Pure: 8 }] }] }
          ]
        }
      ]
    },
    "preserves nested list structure"
  );
});

test("state monad", t => {
  // a simplified version of the actual redux dsl commands
  t.plan(2);

  const State = {
    map(f) {
      return match(this, {
        Get(getter) {
          return Get(s => f(getter(s)));
        },
        Set([val, next]) {
          return Set(val, f(next));
        }
      });
    }
  };
  const Get = get => Object.assign(Object.create(State), { Get: get });
  const Set = (val, next) =>
    Object.assign(Object.create(State), { Set: [val, next] });

  const get = liftFree(Get(id));
  const set = val => liftFree(Set(val, unit));

  const runState = (stateM, state) => {
    return match(stateM, {
      Pure: id,
      Impure: s =>
        match(s, {
          Get: getter => runState(getter(state), state),
          Set: ([val, next]) => {
            state = val;
            return runState(next, state);
          }
        })
    });
  };

  const free = () =>
    Do(function*() {
      let count = 0;
      while (count < 10) {
        count = yield get;
        yield set(count + 1);
      }
      return Pure(count);
    });

  const finalState = runState(free(), 0);
  t.equal(finalState, 10);

  // interprete free with async storage

  const stateApi = {
    value: 0,
    setValue(v) {
      this.value = v;
      return Promise.resolve();
    },
    getValue() {
      return Promise.resolve(this.value);
    }
  };

  const runStateAsync = (stateM, state) => {
    return match(stateM, {
      Pure: x => Promise.resolve(x),
      Impure: s =>
        match(s, {
          Get: getter =>
            state.getValue().then(v => runStateAsync(getter(v), state)),
          Set: ([val, next]) =>
            state.setValue(val).then(() => runStateAsync(next, state))
        })
    });
  };
  runStateAsync(free(), stateApi).then(finalState => {
    t.equal(finalState, 10);
  });
});
