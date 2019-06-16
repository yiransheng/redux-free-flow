import { Action, AnyAction, Store, StoreEnhancer, Dispatch } from "redux";

declare const freeM: unique symbol;

interface FreeDSL<S, A, T> {
  [freeM]: true;

  map<U>(f: (x: T) => U): FreeDSL<S, A, U>;

  then<U>(f: (x: T) => FreeDSL<S, A, U>): FreeDSL<S, A, U>;
}

export declare function read<S, A, T>(f: (state: S) => T): FreeDSL<S, A, T>;

export declare function dispatch<S, A>(action: A): FreeDSL<S, A, void>;

export declare function effect<S, A, T>(
  factory: () => Promise<T>
): FreeDSL<S, A, T>;

export declare const end: FreeDSL<any, any, void>;

export declare const rollback: FreeDSL<any, any, void>;

export declare function isFree<S, A, T>(val: any): val is FreeDSL<S, A, T>;

export declare function Do<S, A, T>(
  generator: () => IterableIterator<FreeDSL<S, A, T>>
): FreeDSL<S, A, T>;

type ExtDispatch<S = any, A extends Action = AnyAction> = {
  (action: A | FreeDSL<S, A, void>): void;
};

export type EnhancedStore<S = any, A extends Action = AnyAction> = Store<
  S,
  A
> & { dispatch: ExtDispatch<S, A> };

export declare const enhancer: StoreEnhancer<{ dispatch: ExtDispatch }, {}>;
