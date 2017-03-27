"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Do = exports.liftFree = exports.isFree = exports.Impure = exports.Pure = exports.FreePrototype = undefined;

var _FreePrototype;

var _singleKey = require("single-key");

var _redux = require("redux");

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

var isFreeSymbol = Symbol("free");

function _FlatMap2(_ref3) {
  var _ref4 = _toArray(_ref3),
      functor = _ref4[0],
      fns = _ref4.slice(1);

  return Impure(functor.map(function (val) {
    var result = val;
    for (var i = 0; i < fns.length; i++) {
      result = result.then(fns[i]);
      result = result._expand();
    }
    return result;
  }));
}

var FreePrototype = exports.FreePrototype = (_FreePrototype = {}, _defineProperty(_FreePrototype, isFreeSymbol, true), _defineProperty(_FreePrototype, "then", function then(f) {
  return (0, _singleKey.match)(this, {
    Pure: f,
    Impure: function Impure(functor) {
      return _FlatMap(functor, f);
    },
    FlatMap: function FlatMap(_ref) {
      var _ref2 = _toArray(_ref),
          functor = _ref2[0],
          fns = _ref2.slice(1);

      return _FlatMap.apply(undefined, [functor].concat(_toConsumableArray(fns), [f]));
    }
  });
}), _defineProperty(_FreePrototype, "_expand", function _expand() {
  var _this = this;

  return (0, _singleKey.match)(this, {
    Pure: function Pure() {
      return _this;
    },
    Impure: function Impure() {
      return _this;
    },
    FlatMap: _FlatMap2
  });
}), _defineProperty(_FreePrototype, "map", function map(f) {
  return this.then((0, _redux.compose)(Pure, f));
}), _FreePrototype);

var create = Object.create.bind(Object, FreePrototype);
var assign = Object.assign;

var Pure = function Pure(val) {
  return assign(create(), { Pure: val });
};
var Impure = function Impure(val) {
  return assign(create(), { Impure: val });
};
var _FlatMap = function _FlatMap(val) {
  for (var _len = arguments.length, fns = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    fns[_key - 1] = arguments[_key];
  }

  return assign(create(), { FlatMap: [val].concat(fns) });
};

var isFree = function isFree(value) {
  return Object(value) === value && value[isFreeSymbol];
};

var liftFree = function liftFree(functor) {
  return Impure(functor.map(Pure));
};

var Do = function Do(generator) {
  var iter = generator();
  var recurr = function recurr(val) {
    var _iter$next = iter.next(val),
        free = _iter$next.value,
        done = _iter$next.done;

    if (!done) {
      return free.then(recurr);
    } else {
      return isFree(free) ? free : Pure(null);
    }
  };
  return recurr();
};

exports.Pure = Pure;
exports.Impure = Impure;
exports.isFree = isFree;
exports.liftFree = liftFree;
exports.Do = Do;