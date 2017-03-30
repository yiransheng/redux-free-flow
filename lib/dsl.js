"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.effect = exports.dispatch = exports.read = exports.rollback = exports.end = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _singleKey = require("single-key");

var _redux = require("redux");

var _free = require("./free");

var _utils = require("./utils");

// -- forall. v, State, Action data DSL a =
// --    End
// --  | Rollback
// --  | Dispatch Action a
// --  | Read (State -> v) (v -> a)
// --  | Effect (State -> Promise v) (v -> a)

// make it a Functor

/* eslint no-use-before-define: "off" */
var DSLPrototype = {
  map: function map(f) {
    return (0, _singleKey.match)(this, {
      End: function End() {
        return _End;
      },
      Rollback: function Rollback(next) {
        return _Rollback(f(next));
      },
      Read: function Read(_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
            select = _ref2[0],
            next = _ref2[1];

        return _Read(select, (0, _redux.compose)(f, next));
      },
      Dispatch: function Dispatch(_ref3) {
        var _ref4 = _slicedToArray(_ref3, 2),
            action = _ref4[0],
            next = _ref4[1];

        return _Dispatch(action, f(next));
      },
      Effect: function Effect(_ref5) {
        var _ref6 = _slicedToArray(_ref5, 2),
            promiseFactory = _ref6[0],
            next = _ref6[1];

        return _Effect(promiseFactory, (0, _redux.compose)(f, next));
      }
    });
  }
};

var DSL = (0, _utils.tag)(DSLPrototype);

var _End = DSL({ End: true });
var _Read = function _Read(select, next) {
  return DSL({ Read: [select, next] });
};
var _Dispatch = function _Dispatch(action, next) {
  return DSL({ Dispatch: [action, next] });
};
var _Effect = function _Effect(factory, next) {
  return DSL({ Effect: [factory, next] });
};
var _Rollback = function _Rollback(next) {
  return DSL({ Rollback: next });
};

var end = (0, _free.Impure)(_End);
var read = function read(select) {
  return (0, _free.liftFree)(_Read(select, _utils.identity));
};
var dispatch = function dispatch(action) {
  return (0, _free.isFree)(action) ? action : (0, _free.liftFree)(_Dispatch(action, null));
};
var effect = function effect(factory) {
  return (0, _free.liftFree)(_Effect(factory, _utils.identity));
};
var rollback = (0, _free.liftFree)(_Rollback(null));

exports.end = end;
exports.rollback = rollback;
exports.read = read;
exports.dispatch = dispatch;
exports.effect = effect;