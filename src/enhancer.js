import { unpack, match } from "single-key";
import { createChangeEmitter } from "change-emitter";

import { isFree } from "./free";
import { interpreteEventSource as interpreter } from "./interpreters";
import { noop, isPromise } from "./utils";

const createEventSourceStore = (reducer, preloadedState) => {
  return {
    ...createChangeEmitter(),
    reducer,
    status: {
      Idle: null
    },
    getState() {
      // will throw if called on idle
      return match(this.status, {
        Running({ currentState }) {
          return currentState;
        }
      });
    },
    replaceReducer(reducer) {
      this.reducer = reducer;
    },
    dispatch(id, action) {
      const [status, states] = unpack(this.status);
      if (status !== "Running") {
        return false;
      }
      const { currentState, actionQueue } = states;
      actionQueue.push({ id, action });
      const nextState = this.reducer(currentState, action);
      this.status[status].currentState = nextState;
      this.emit();
      return true;
    },
    start(startingState) {
      this.status = match(this.status, {
        Idle() {
          return {
            Running: {
              startingState: startingState,
              currentState: startingState,
              actionQueue: [],
              count: 1
            }
          };
        },
        Running: states => {
          states.count++;
          return this.status;
        }
      });
      return this.status.Running.count;
    },
    rollback(id) {
      const [status, states] = unpack(this.status);
      if (status !== "Running") {
        return;
      }
      const { actionQueue, startingState } = states;
      const nextQueue = actionQueue.filter(
        ({ id: actionId }) => actionId !== id
      );
      const nextState = nextQueue.reduce(
        (state, { action }) => this.reducer(state, action),
        startingState
      );
      Object.assign(this.status[status], {
        currentState: nextState,
        actionQueue: nextQueue
      });
      this.emit();
    },
    commit(callback = noop) {
      match(this.status, {
        Running: states => {
          if (states.count === 1) {
            this.status = { Idle: null };
            callback(states.currentState);
          } else {
            states.count--;
          }
        },
        Idle: noop
      });
    }
  };
};

const SET_MAINSTORE_STATE = "DANGEROUS_DONT_USE_SET_MAINSTORE_STATE";

const liftReducer = reducer => {
  return (state, action) => {
    if (action.type === SET_MAINSTORE_STATE) {
      return action.payload;
    }
    return reducer(state, action);
  };
};

const enhancer = createStore =>
  (reducer, preloadedState, next) => {
    const eventSourceStore = createEventSourceStore(reducer, preloadedState);
    const interprete = interpreter(eventSourceStore);

    const mainStore = createStore(liftReducer(reducer), preloadedState, next);
    const {
      dispatch: mainStoreDispatch,
      replaceReducer: mainStoreReplaceReducer
    } = mainStore;

    const setMainStoreState = state => {
      mainStoreDispatch({ type: SET_MAINSTORE_STATE, payload: state });
    };

    let unlisten;
    const maybeCommit = () => {
      eventSourceStore.commit(finalState => {
        unlisten && unlisten();
        setMainStoreState(finalState);
      });
    };
    const dispatch = action => {
      if (!isFree(action)) {
        return eventSourceStore.dispatch(-1, action)
          ? action
          : mainStoreDispatch(action);
      }

      const id = eventSourceStore.start(mainStore.getState());
      if (id === 1) {
        unlisten = eventSourceStore.listen(() => {
          setMainStoreState(eventSourceStore.getState());
        });
      }
      const result = interprete(id, action);
      if (isPromise(result)) {
        result.then(maybeCommit);
      } else {
        maybeCommit();
      }
    };

    const replaceReducer = reducer => {
      mainStoreReplaceReducer(liftReducer(reducer));
      eventSourceStore.replaceReducer(reducer);
    };

    return {
      ...mainStore,
      dispatch,
      replaceReducer
    };
  };

export default enhancer;
