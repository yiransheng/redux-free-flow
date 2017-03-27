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
  const free = fromArrayOrElement([0, [1, [2, 3]], [4, [5, [6, 7]]]]);
  const recover = free => match(free, {
    Pure : id,
    Impure
  });
});
