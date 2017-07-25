# redux-free-flow

[![Build Status](https://travis-ci.org/yiransheng/redux-free-flow.svg?branch=master)](https://travis-ci.org/yiransheng/redux-free-flow)

# What it does

It let's you write pure, composable and versatile redux store interactions (both sync and async) like this:

```javascript
import { Do, dispatch, effect, end, rollback } from "redux-free-flow";
import { withdraw, deposit, readBalance } from "./account-actions";
import { callApiToTransfer } from "./api-utils";

export function transferMoney(fromAccount, toAccount, amount) {
  return Do(function*() {
    const balance = yield readBalance(fromAccount);
    if (balance >= amount) {
      // sync dispatch
      yield withdraw(fromAccount, amount);
      yield deposit(toAccount, amount);
      // async and effectual
      const response = yield effect(
        callApiToTransfer.bind(null, fromAccount, toAccount, amount));
      if (response === "success") {
        yield end;
      } else {
        yield rollback;
      }
    } else {
      yield dispatch({ type: "ERROR_INSUFFICIENT_FUNDS" });
    }
  });
}
// later
store.dispatch(transferMoney(21, 23, 1000));
```

Yes, `dispatch({ type: "ERROR_INSUFFICIENT_FUNDS" })` is pure - it does not dispatch actions, instead it's an expression evaluates to some data structure to be interpreted later (when dispatched by `redux` store). This small snippet of code does the following once dispatched:

* Use `getState` (by `readBalance`) to get account balance of `fromAccount`
* Check if the account has enough funds to transfer
  * If so, dispatches two actions, `withdraw` and `deposit` atomically
  * makes an api call to tell the server this transfer transaction has happened
  * conclude everything if api response indicates a server-side success
    * otherwise, rollback the entire transaction
* If not enough funds, dispatches an error action `{ type: "ERROR_INSUFFICIENT_FUNDS" }`

# Example

[Demo Link](https://gusty-houses.surge.sh)

[Source](./examples/bank-accounts)

# How it Works

The inspirations of this enhancer are:

* Free Monad, DSL / Interpreter pattern
* Event Sourcing Systems
* `redux-saga` `co` `async-await` etc. 
* transactional semantics

`dispatch`, `effect`, `rollback` etc are all functions that return data structures which encodes the shape and control flow of effectful computations (`redux` store api calls). In fact, the underlying data structure here is a Free Monad. If you don't know what it is don't worry, for the purpose of using these library, they are just immutable objects with `then` method. For example:

```javascript
const callDispatch = dispatch({ type: "SOME_ACTION" });
const twiceDispatch = callDispatch.then(() => {
  return callDispatch;
});
```

You'd write these store interactions just like how you would write promise chains - and the final interaction when dispatched will do almost exactly what you think it does.

Furthermore, a handy generator oriented helper `Do` is provided to make code more readable. `Haskell` has `do` notation, `Scala` has `for` comprehension, and javaScript has `co` and `async-wait` syntax for flattening out nested promise chains. `Do` lets you use `generator`s to rewrite the code above to:

```javascript
const twiceDispatch = () => Do(function* () {
  yield callDispatch;
  yield callDispatch;
});
```

* Note: `Do(function* { .. })` is no-longer pure as `generators` are stateful, making the resulting interactions interpretable **only once**. It is better to wrap `Do` calls inside a function, and every time you dispatch the same interaction, call the function again for a new iterator.

## Comparisons with Other Libraries

* Isn't this like `redux-thunk`?

Kinda. `redux-thunks` gives you the freedom to consult `getState` and do multiple and possibly async `dispatch` calls. But `thunks` are effectful and not composable. You cannot easily take the return value of a `thunk` and use it as inputs of other `thunks` easily, nor can you rollback `thunk` actions without big changes to reducer. This library gives you all the raw power of `redux-thunk` but non of the effectful nastiness...

* `redux-saga`

Think an DSL / interaction / free monad (I haven't come up a name yet...) as a one-time saga. It doesn't have access to actions from other dispatch calls, but the general idea is similar: declarative and composable async control flows.

* `redux-loop`

DSL / Interactions / free monads are move expressive than `redux-loop` `Effects / Cmds`. They incorporate both read, sync dispatch and async effects in one unified framework. Oh, and rollbacks...

# API

Installation and Integration:

```shell
yarn add redux-free-flow
```

```javascript
import enhancer from "redux-free-flow";

const store = createStore(reducer, preloadedState, enhancer);
// or
const store = compose(...otherEnhancers, enhancer)(createStore)(reducer, preloadedState)
```

** Note: This library assumes all actions are plain objects, it will not work with other middlewares and enhancers that gives you the ability to use non-plain-object actions (such as `redux-thunk`, `redux-promise`) . In other words, an `action` must be something you `reducer` can understand.

Core apis:

* `read`
* `dispatch`
* `effect`
* `end`
* `rollback`

Don't worry too much about the type signature.

###  read

```javascript
read(select : State -> A) : Free DSL A
```

Given a `select` function, `read` produces a command to read value from store, "returned" value is `select(store.getState())`, the value can be accessed like:

```
read(select)
  .then(currentValue => { .. })
```

### dispatch

```javascript
dispatch(action: PlainObject) : Free DSL Unit
```

`dispatch` takes an plain object (action), and returns a command that dispatches the action when executed. 

For example:

```
store.dispatch(
  read(state => state.counter)
    .then(counter => {
      if (counter > 0) {
        return dispatch({ type: DECREMENT });
      }
      return end;
    })
)
```

This will dispatch an `DECREMENT` action only if store's `counter` value is positive. `redux` takes `dispatch` out of action creators from `flux`, now I am putting it back in...

### effect

```
effect(promiseFactory: () -> Promise A) : Free DSL A
```

`effect` takes a function that returns a promise and stores it. When interpreted, the function gets called, and when the promise it returns resolves, the value becomes available to the next `then` function in the DSL chain.

### end

```
end :: Free DSL Unit
```

The termination of a transaction, `end` is automatically assumed for any chain of commands, if the last one is not `end`.

### rollback

```
rollback :: Free DSL Unit
```

The most magical of them all. When encountered by the internal interpreter, all dispatched action from the given transaction so far will be taken out history as if they never happened! Other concurrent actions (and transactions) remain intact.



# Performance

Dispatching a free monad switches redux store to a "event sourcing" mode. What it  means is all actions dispatched (including vanilla ones) gets added to a queue (this is why `rollback` is possible). If you have a long running or perpetual thing going on like this:

```javascript
const forever = () => Do(function* () {
  yield effect(timeout(1000));
  yield forever();
})
```

You'd either running into a infinite loop (if everything is sync) or a async loop (if `effect` is used like above) with memory leak from the action queue.

# Is it production ready?

## No.

It's a complex piece of machinery, there for sure are bugs. Also lots of edge case handling code is missing.

