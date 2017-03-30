"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.identity = identity;
exports.noop = noop;
exports.isPromise = isPromise;
function identity(x) {
  return x;
}
var tag = exports.tag = function tag(proto) {
  return function (data) {
    var result = Object.create(proto);
    Object.assign(result, data);
    return result;
  };
};
function noop() {}
function isPromise(p) {
  return p && Promise.resolve(p) === p;
}