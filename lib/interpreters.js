"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.interpreteDispatch = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _singleKey = require("single-key");

var _redux = require("redux");

var _free = require("./free");

function _Pure(x) {
  return x;
}

function _End() {
  return null;
}

var interpreteDispatch = function interpreteDispatch(store) {
  function _Read(_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
        select = _ref2[0],
        next = _ref2[1];

    return (0, _redux.compose)(run, next, select)(store.getState());
  }

  function _Dispatch(_ref3) {
    var _ref4 = _slicedToArray(_ref3, 2),
        action = _ref4[0],
        next = _ref4[1];

    store.dispatch(action);
    return run(next);
  }

  function _Effect(_ref5) {
    var _ref6 = _slicedToArray(_ref5, 2),
        factory = _ref6[0],
        next = _ref6[1];

    return Promise.resolve(factory()).then((0, _redux.compose)(run, next));
  }

  function _Impure(dsl) {
    return (0, _singleKey.match)(dsl, {
      End: _End,
      Read: _Read,
      Dispatch: _Dispatch,
      Effect: _Effect
    });
  }

  var run = function run(freeDsl) {
    var result = (0, _singleKey.match)(freeDsl, {
      Pure: _Pure,
      FlatMap: function FlatMap() {
        return run(freeDsl._expand());
      },

      Impure: _Impure
    });
    return Promise.resolve(result);
  };

  return run;
};

exports.interpreteDispatch = interpreteDispatch;