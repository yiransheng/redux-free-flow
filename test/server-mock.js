import { defer, shuffleInPlace } from "./utils";

function createServer(reducer, initialState, loop, errorRate = 0.15) {
  let state = initialState;
  let actionQueue = [];

  const handleAction = action => {
    if (Math.random() < errorRate) {
      return false;
    }
    let prevState = state;
    state = reducer(state, action);
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
