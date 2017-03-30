"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _singleKey = require("single-key");

var _changeEmitter = require("change-emitter");

var _free = require("./free");

var _interpreters = require("./interpreters");

var _utils = require("./utils");

var createEventSourceStore = function createEventSourceStore(reducer, preloadedState) {
  return _extends({}, (0, _changeEmitter.createChangeEmitter)(), {
    reducer: reducer,
    status: {
      Idle: null
    },
    getState: function getState() {
      // will throw if called on idle
      return (0, _singleKey.match)(this.status, {
        Running: function Running(_ref) {
          var currentState = _ref.currentState;

          return currentState;
        }
      });
    },
    replaceReducer: function replaceReducer(reducer) {
      this.reducer = reducer;
    },
    dispatch: function dispatch(id, action) {
      var _unpack = (0, _singleKey.unpack)(this.status),
          _unpack2 = _slicedToArray(_unpack, 2),
          status = _unpack2[0],
          states = _unpack2[1];

      if (status !== "Running") {
        return false;
      }
      var currentState = states.currentState,
          actionQueue = states.actionQueue;

      actionQueue.push({ id: id, action: action });
      var nextState = this.reducer(currentState, action);
      this.status[status].currentState = nextState;
      this.emit();
      return true;
    },
    start: function start(startingState) {
      var _this = this;

      this.status = (0, _singleKey.match)(this.status, {
        Idle: function Idle() {
          return {
            Running: {
              startingState: startingState,
              currentState: startingState,
              actionQueue: [],
              count: 1
            }
          };
        },

        Running: function Running(states) {
          states.count++;
          return _this.status;
        }
      });
      return this.status.Running.count;
    },
    rollback: function rollback(id) {
      var _this2 = this;

      var _unpack3 = (0, _singleKey.unpack)(this.status),
          _unpack4 = _slicedToArray(_unpack3, 2),
          status = _unpack4[0],
          states = _unpack4[1];

      if (status !== "Running") {
        return;
      }
      var actionQueue = states.actionQueue,
          startingState = states.startingState;

      var nextQueue = actionQueue.filter(function (_ref2) {
        var actionId = _ref2.id;
        return actionId !== id;
      });
      var nextState = nextQueue.reduce(function (state, _ref3) {
        var action = _ref3.action;
        return _this2.reducer(state, action);
      }, startingState);
      Object.assign(this.status[status], {
        currentState: nextState,
        actionQueue: nextQueue
      });
      this.emit();
    },
    commit: function commit() {
      var _this3 = this;

      var callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _utils.noop;

      (0, _singleKey.match)(this.status, {
        Running: function Running(states) {
          if (states.count === 1) {
            _this3.status = { Idle: null };
            callback(states.currentState);
          } else {
            states.count--;
          }
        },
        Idle: _utils.noop
      });
    }
  });
};

var SET_MAINSTORE_STATE = "DANGEROUS_DONT_USE_SET_MAINSTORE_STATE";

var liftReducer = function liftReducer(reducer) {
  return function (state, action) {
    if (action.type === SET_MAINSTORE_STATE) {
      return action.payload;
    }
    return reducer(state, action);
  };
};

var enhancer = function enhancer(createStore) {
  return function (reducer, preloadedState, next) {
    var eventSourceStore = createEventSourceStore(reducer, preloadedState);
    var interprete = (0, _interpreters.interpreteEventSource)(eventSourceStore);

    var mainStore = createStore(liftReducer(reducer), preloadedState, next);
    var mainStoreDispatch = mainStore.dispatch,
        mainStoreReplaceReducer = mainStore.replaceReducer;


    var setMainStoreState = function setMainStoreState(state) {
      mainStoreDispatch({ type: SET_MAINSTORE_STATE, payload: state });
    };

    var unlisten = void 0;
    var maybeCommit = function maybeCommit() {
      eventSourceStore.commit(function (finalState) {
        unlisten && unlisten();
        setMainStoreState(finalState);
      });
    };
    var dispatch = function dispatch(action) {
      if (!(0, _free.isFree)(action)) {
        return eventSourceStore.dispatch(-1, action) ? action : mainStoreDispatch(action);
      }

      var id = eventSourceStore.start(mainStore.getState());
      if (id === 1) {
        unlisten = eventSourceStore.listen(function () {
          setMainStoreState(eventSourceStore.getState());
        });
      }
      var result = interprete(id, action);
      if ((0, _utils.isPromise)(result)) {
        result.then(maybeCommit);
      } else {
        maybeCommit();
      }
    };

    var replaceReducer = function replaceReducer(reducer) {
      mainStoreReplaceReducer(liftReducer(reducer));
      eventSourceStore.replaceReducer(reducer);
    };

    return _extends({}, mainStore, {
      dispatch: dispatch,
      replaceReducer: replaceReducer
    });
  };
};

exports.default = enhancer;