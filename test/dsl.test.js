import test from "tape";
import { match } from "single-key";

import { isFree, Do } from "../src/free";
import { read, dispatch, end, rollback, effect } from "../src/dsl";

const constant = value => () => value;

test("dsl functions should return values with correct types", t => {
  t.plan(5);

  t.true(isFree(end), "end typechecks");
  t.true(isFree(rollback), "rollback typechecks");

  t.true(isFree(read(x => x)), "read(function) typechecks");
  t.true(isFree(dispatch({ type: "A" })), "dispatch(object) typechecks");
  t.true(isFree(effect(() => Promise.resolve(1))), "effect(function) typechecks");

});

test("read", t => {

  t.plan(3);

  const interpret = (freeDsl) => {
    return match(freeDsl, {
      Pure : x => x,
      Impure : dsl => match(dsl, {
        Read([select, next]) {
          return interpret(next(select()));
        }
      })
    });
  }

  const readOne = read(constant(1));
  const readTwo = readOne.then(a => read(constant(a+1)));
  const readZero = readOne.map(constant(0));

  t.equal(interpret(readOne), 1);
  t.equal(interpret(readTwo), 2);
  t.equal(interpret(readZero), 0);

});

test("dispatch", t => {

  t.plan(1);

  const actions = [];
  const doDispatch = action => actions.push(action);

  const interpret = (freeDsl) => {
    return match(freeDsl, {
      Pure : x => x,
      Impure : dsl => match(dsl, {
        Dispatch([action, next]) {
          doDispatch(action);
          return interpret(next);
        }
      })
    });
  }

  interpret(Do(function* () {
    yield dispatch(1);
    yield dispatch(2);
    yield dispatch(3);
  }));


  t.deepEqual(actions, [1,2,3]);

});
