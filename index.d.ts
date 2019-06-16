import { Action, AnyAction, Store, StoreEnhancer, Dispatch } from "redux";

export interface FreeDSL<S, A, T> {
  map<U>(f: (x: T) => U): _Map<U, { [indirect]: ThisType<_UnionAll<S, A, T>> }>;

  then<M extends FreeDSL<S, A, unknown>>(
    f: (x: T) => M
  ): _AndThen<ValueType<M>, { [indirect]: ThisType<_UnionAll<S, A, T>> }>;

  andThen<M extends FreeDSL<S, A, unknown>>(
    f: (x: T) => M
  ): _AndThen<ValueType<M>, { [indirect]: ThisType<_UnionAll<S, A, T>> }>;
}

declare const __read__: unique symbol;

declare const __effect__: unique symbol;

declare const __dispatch__: unique symbol;

declare const __end__: unique symbol;

declare const __rollback__: unique symbol;

declare const __and_then__: unique symbol;

declare const __map__: unique symbol;

declare const indirect: unique symbol;

interface _Read<S, T> extends FreeDSL<S, unknown, T> {
  [__read__]: true;
}

interface _Dispatch<A> extends FreeDSL<unknown, A, void> {
  [__dispatch__]: true;
}

interface _Effect<T> extends FreeDSL<unknown, unknown, T> {
  [__effect__]: true;
}

interface _End extends FreeDSL<unknown, unknown, void> {
  [__end__]: true;
}

interface _Rollback extends FreeDSL<unknown, unknown, void> {
  [__rollback__]: true;
}

interface _AndThen<T, F extends { [indirect]: any }>
  extends FreeDSL<
    StateType<F[typeof indirect]>,
    ActionType<F[typeof indirect]>,
    T
  > {
  [__and_then__]: true;
}

interface _Map<T, F extends { [indirect]: any }>
  extends FreeDSL<
    StateType<F[typeof indirect]>,
    ActionType<F[typeof indirect]>,
    T
  > {
  [__map__]: true;
}

type _UnionAll<S, A, T> =
  | _Read<S, T>
  | _Dispatch<A>
  | _Effect<T>
  | _Rollback
  | _End
  | _AndThen<T, { [indirect]: _UnionAll<S, A, any> }>;

type StateType<M> = M extends FreeDSL<infer S, unknown, unknown> ? S : never;

type ActionType<M> = M extends FreeDSL<unknown, infer A, unknown> ? A : never;

type ValueType<M> = M extends FreeDSL<unknown, unknown, infer T> ? T : never;

export declare function read<S, T>(f: (state: S) => T): _Read<S, T>;

export declare function dispatch<A>(action: A): _Dispatch<A>;

export declare function effect<T>(factory: () => Promise<T>): _Effect<T>;

export declare const end: _End;

export declare const rollback: _Rollback;

export declare function isFree<S, A, T>(val: any): val is FreeDSL<S, A, T>;

export declare function Do<S, A, T>(
  generator: () => IterableIterator<FreeDSL<unknown, unknown, unknown>>
): FreeDSL<S, A, T>;

type ExtDispatch<S = any, A extends Action = AnyAction> = {
  (action: A | FreeDSL<S, A, void>): void;
};

export type EnhancedStore<S = any, A extends Action = AnyAction> = Store<
  S,
  A
> & { dispatch: ExtDispatch<S, A> };

export declare const enhancer: StoreEnhancer<{ dispatch: ExtDispatch }, {}>;
