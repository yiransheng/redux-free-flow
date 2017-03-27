"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _free = require("./free");

var _interpreters = require("./interpreters");

function _ref3(storeApi) {
  var interpreter = (0, _interpreters.interpreteDispatch)(storeApi);
  var replaceDispatch = function replaceDispatch(next) {
    var currentTransaction = null;

    function _ref() {
      currentTransaction = null;
    }

    var interprete = function interprete(transaction) {
      return interpreter(transaction).then(_ref);
    };

    return function (action) {
      if (!(0, _free.isFree)(action)) {
        return next(action);
      }

      function _ref2() {
        return interprete(action);
      }

      if (currentTransaction) {
        currentTransaction = currentTransaction.then(_ref2);
      } else {
        currentTransaction = interprete(action);
      }
    };
  };
  return replaceDispatch;
}

var createMiddleware = function createMiddleware() {
  return _ref3;
};

exports.default = createMiddleware;