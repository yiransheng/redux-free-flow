import { defer, shuffleInPlace } from "./utils";

function invariant(state) {
  return Object.keys(state)
    .map(k => state[k]).reduce((a,b)=>a+b, 0) === 500;
}

function createServer(reducer, initialState, loop, errorRate = 0.5) {
  let state = initialState;
  let actionQueue = [];

  const handleAction = action => {
    if (Math.random() < errorRate) {
      return false;
    }
    const prevState = state;
    state = reducer(prevState, action);
    return state !== prevState;
  };

  const request = action => {
    const deferred = defer();
    actionQueue.push({ action, deferred });
    return deferred.promise;
  };

  loop.eachTick(() => {
    shuffleInPlace(actionQueue);
    while (actionQueue.length) {
      const { deferred, action } = actionQueue.pop();
      deferred.resolve(handleAction(action) ? "success" : "error");
    }
  });

  return {
    request,
    getState() {
      return state;
    }
  };
}

export default createServer;
