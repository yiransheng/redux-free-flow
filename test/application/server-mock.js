import { defer, shuffleInPlace } from "./utils";

function createServer(reducer, initialState, errorRate = 0.5) {
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

  const response = () => {
    shuffleInPlace(actionQueue);
    while (actionQueue.length) {
      const { deferred, action } = actionQueue.pop();
      deferred.resolve(handleAction(action) ? "success" : "error");
    }
  };

  return {
    request,
    response,
    getState() {
      return state;
    }
  };
}

export default createServer;
