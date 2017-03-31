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

test("end", t => {
  t.plan(1);
  const interpret = (freeDsl) => {
    return match(freeDsl, {
      Pure : x => x,
      Impure : dsl => match(dsl, {
        End : constant("end")
      })
    });
  }
  t.equal(interpret(end), "end");
});

test("rollback", t => {
  t.plan(1);
  const interpret = (freeDsl) => {
    return match(freeDsl, {
      Pure : x => x,
      Impure : dsl => match(dsl, {
        Rollback : constant("rollback")
      })
    });
  }
  t.equal(interpret(rollback), "rollback");
});

test("compose all dsls with a toy interpreter", t => {
  
  t.plan(4);

  const mutable = {
    _mutated : false,
    readCount : 0,
    reads : [1,2,3,4,5,6],
    writes: [],
    read() {
      this._mutated = true;
      return this.reads[this.readCount++];
    },
    write(v) {
      this._mutated = true;
      this.writes.push(v); 
    },
    clear() {
      this._mutated = true;
      this.writes.length = 0;
    }
  };

  const interpret = (freeDsl) => {
    return match(freeDsl, {
      Pure : x => x,
      Impure : dsl => match(dsl, {
        End: x => null,
        Read([_, next]) {
          return interpret(next(mutable.read()));
        },
        Dispatch([v, next]) {
          mutable.write(v);
          return interpret(next);
        },
        Rollback(next) {
          mutable.clear();
          return interpret(next);
        }
      })
    });
  }

  const commands = Do(function* () {
    let i = -1;
    let sum = 0;
    while (true) {
      i = yield read();
      sum += i;
      yield dispatch(sum);
      if (i > 4) {
        yield rollback;
        yield dispatch(sum);
        break;
      }
    }
  });
  t.equal(mutable._mutated, false, "has not been mutated");
  t.deepEqual(mutable.writes, [], "has not been mutated");
  interpret(commands);

  t.equal(mutable.readCount, 5);
  t.deepEqual(mutable.writes, [15], "now mutated");
});
