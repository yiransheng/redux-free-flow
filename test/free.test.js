import { Do, Pure, Impure as _Impure, liftFree } from "../src/free";
import { compose } from "redux";
import { match } from "single-key";
import test from "tape";

const id = x => x;
const unit = null;

test("free monad to represent Nested List", t => {
  t.plan(1);
  const fromArrayOrElement = xs => {
    return Array.isArray(xs) ? _Impure(xs.map(fromArrayOrElement)) : Pure(xs);
  };
  const array = [0, [1, [2, 3]], [4, [5, [6, 7]]]];
  const free = fromArrayOrElement(array);
  const recover = m => match(m, {
    Pure : id,
    Impure (xs) {
      return xs.map(recover);
    },
    FlatMap () {
      return resover(free._expand());
    }
  });
  t.deepEqual(array, recover(free));
});
