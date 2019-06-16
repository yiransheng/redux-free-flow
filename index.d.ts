import { Action, AnyAction, Store, StoreEnhancer, Dispatch } from "redux";

export interface FreeDSL<S, A, T> {
  __phantomState: S;
  __phantomAction: A;

  map(this: _End, f: () => void): _Map<void, _End>;

  map(this: _Rollback, f: () => void): _Map<void, _Rollback>;

  map<U>(this: _Read<S, T>, f: (x: T) => U): _Map<U, _Read<S, T>>;

  map<U>(this: _Effect<T>, f: (x: T) => U): _Map<U, _Effect<T>>;

  map<U>(this: _Dispatch<A>, f: () => U): _Map<U, _Dispatch<A>>;

  map<U, M>(this: _Map<T, M>, f: (x: T) => U): _Map<U, _Map<T, M>>;

  map<U, L, R>(this: _AndThen<T, L, R>,f: (x: T) => U):
    _Map<U, _AndThen<T, L, R>>;

  andThen<M extends FreeDSL<unknown, unknown, unknown>>(this: _End, f: (x: T) => M):
    _AndThen<ValueType<M>, M, _End>;

  andThen<M extends FreeDSL<unknown, unknown, unknown>>(this: _Rollback, f: (x: T) => M):
    _AndThen<ValueType<M>, M, _Rollback>;

  andThen<M extends FreeDSL<unknown, A, unknown>>(this: _Dispatch<A>,f: (x: T) => M):
    _AndThen<ValueType<M>, M, _Dispatch<A>>;
    
  andThen<M extends FreeDSL<S, unknown, unknown>>(this: _Read<S, T>,f: (x: T) => M):
    _AndThen<ValueType<M>, M, _Read<S, T>>;

  andThen<M extends FreeDSL<S, unknown, unknown>>(this: _Effect<T>,f: (x: T) => M):
    _AndThen<ValueType<M>, M, _Effect<T>>;

  andThen<M extends FreeDSL<S, unknown, unknown>,N>(this: _Map<T, N>, f: (x: T) => M):
    _AndThen<ValueType<M>, M, _Map<T, N>>;

  andThen<M extends FreeDSL<S, unknown, unknown>,L,R>(this: _AndThen<T, L, R>, f: (x: T) => M):
    _AndThen<ValueType<M>, M, _AndThen<T, L, R>>;

  andThen(this: any, f: (...args:[]) => any): never;

  map(this: any, f: (...args:[]) => any): never;
}

type StateType<M> = M extends FreeDSL<infer S, any, any> ? S : never;
type ActionType<M> = M extends FreeDSL<any, infer A, any> ? A : never;
type ValueType<M> = M extends FreeDSL<any, any, infer T> ? T : never;


declare const __read__: unique symbol;
declare const __effect__: unique symbol;
declare const __dispatch__: unique symbol;
declare const __end__: unique symbol;
declare const __rollback__: unique symbol;
declare const __and_then__: unique symbol;
declare const __map__: unique symbol;

interface _Read<S, T> extends FreeDSL<S, never, T> {
  [__read__]: true; 
}
interface _Dispatch<A> extends FreeDSL<never, A, void> {
  [__dispatch__]: true;
}
interface _Effect<T> extends FreeDSL<never, never, T> {
  [__effect__]: true;
}
interface _End extends FreeDSL<never, never, void> {
  [__end__]: true;
}
interface _Rollback extends FreeDSL<never, never, void> {
  [__rollback__]: true;
}
interface _Map<T, M> extends 
  FreeDSL<
    StateType<M>,
    ActionType<M>,
    T
  > {
  [__map__]: true;
}
interface _AndThen<T, L, R> extends 
  FreeDSL<
    StateType<L>|StateType<R>,
    ActionType<L>|ActionType<R>,
    T
  > {
  [__and_then__]: true;
}

export declare function read<S, T>(f: (state: S) => T): _Read<S, T>;

export declare function dispatch<A>(action: A): _Dispatch<A>;

export declare function effect<T>(
  factory: () => Promise<T>
): _Effect<T>;

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
