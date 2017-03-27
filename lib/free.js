"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Do = exports.liftFree = exports.isFree = exports.Impure = exports.Pure = exports.FreePrototype = undefined;

var _FreePrototype;

var _singleKey = require("single-key");

var _redux = require("redux");

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var isFreeSymbol = Symbol("free");

var FreePrototype = exports.FreePrototype = (_FreePrototype = {}, _defineProperty(_FreePrototype, isFreeSymbol, true), _defineProperty(_FreePrototype, "then", function then(f) {
  function _ref(v) {
    return v.then(f);
  }

  return (0, _singleKey.match)(this, {
    Pure: f,
    Impure: function Impure(functor) {
      return _Impure(functor.map(_ref));
    }
  });
}), _defineProperty(_FreePrototype, "map", function map(f) {
  return this.map((0, _redux.compose)(Pure, f));
}), _FreePrototype);

var create = Object.create.bind(Object, FreePrototype);
var assign = Object.assign;

var Pure = function Pure(val) {
  return assign(create(), { Pure: val });
};
var _Impure = function _Impure(val) {
  return assign(create(), { Impure: val });
};

var isFree = function isFree(value) {
  return Object(value) === value && value[isFreeSymbol];
};

var liftFree = function liftFree(functor) {
  return _Impure(functor.map(Pure));
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
exports.Impure = _Impure;
exports.isFree = isFree;
exports.liftFree = liftFree;
exports.Do = Do;