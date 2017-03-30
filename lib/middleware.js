"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _free = require("./free");

var _interpreters = require("./interpreters");

var createMiddleware = function createMiddleware() {
  return function (storeApi) {
    var interpreter = (0, _interpreters.interpreteDispatch)(storeApi);
    var replaceDispatch = function replaceDispatch(next) {
      var currentTransaction = null;
      var interprete = function interprete(transaction) {
        return interpreter(transaction).then(function () {
          currentTransaction = null;
        });
      };

      return function (action) {
        if (!(0, _free.isFree)(action)) {
          return next(action);
        }
        if (currentTransaction) {
          currentTransaction = currentTransaction.then(function () {
            return interprete(action);
          });
        } else {
          currentTransaction = interprete(action);
        }
      };
    };
    return replaceDispatch;
  };
};

exports.default = createMiddleware;