import { Action, AnyAction, Store, StoreEnhancer, Dispatch } from "redux";

//! DSL Types, DSL is a Functor

type DSL<Next> = End<Next> | Rollback<Next> | Read<Next> | Effect<Next>;

// Not a general Functor, only defineds DSL functor map signature
interface FMap<T> {
  map<U>(f: (x: T) => U): DSL<U>;
}

interface End<Next> extends FMap<Next> {
  End: true;
}
interface Rollback<Next> extends FMap<Next> {
  Rollback: true;
}
interface Read<Next> extends FMap<Next> {
  Read: [<S, T>(state: S) => T, Next];
}
interface Effect<Next> extends FMap<Next> {
  Effect: [<S, T>(state: S) => Promise<T>, Next];
}

//! Free Monad

export type FreeDSL<A> = Free<DSL, A>;

type Free<F, A> = Pure<F, A> | Impure<F, A>;

// Not a general Monad, only defineds FreeDSL then, map signature
interface Monad<T> {
  map<U>(f: (x: T) => U): FreeDSL<U>;

  then<U>(f: (x: T) => FreeDSL<U>): FreeDSL<U>;
}

interface Pure<F, A> extends Monad<A> {
  Pure: A;
}
interface Impure<F, A> extends Monad<A> {
  Impure: F;
}

//! Store APIs

export declare function read<F extends (...args: any[]) => any>(
  select: F
): FreeDSL<ReturnType<F>>;

export declare function dispatch<A extends Action>(action: A): FreeDSL<void>;

export declare function effect<T>(factory: () => Promise<T>): FreeDSL<T>;

export declare const end: FreeDSL<void>;

export declare const rollback: FreeDSL<void>;

export declare function isFree<T = any>(val: any): val is FreeDSL<T>;

export declare function Do<T>(
  generator: () => IterableIterator<FreeDSL<any>>
): FreeDSL<T>;

type ExtDispatch<A extends Action = AnyAction> = {
  (action: A | FreeDSL<void>): void;
};

export type EnhancedStore<S = any, A extends Action = AnyAction> = Store<
  S,
  A
> & { dispatch: ExtDispatch };

export = StoreEnhancer<{ dispatch: ExtDispatch }, {}>;
