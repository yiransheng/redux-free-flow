"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.interpreteEventSource = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _singleKey = require("single-key");

var _redux = require("redux");

// store :: {
//   getState : () -> IO State,
//   dispatch : (id: Int, action: Action) -> IO Bool
//   rollback : (id: Int) -> IO ()
// }
var interpreteEventSource = function interpreteEventSource(store) {
  // run :: (id: Int, freeDsl: Free DSL a) -> IO ()
  var run = function run(id, freeDsl) {
    return (0, _singleKey.match)(freeDsl, {
      Pure: function Pure(x) {
        return null;
      },
      Impure: function Impure(dsl) {
        return (0, _singleKey.match)(dsl, {
          End: function End() {
            return null;
          },
          Rollback: function Rollback(next) {
            store.rollback(id);
            return run(id, next);
          },
          Read: function Read(_ref) {
            var _ref2 = _slicedToArray(_ref, 2),
                select = _ref2[0],
                next = _ref2[1];

            return (0, _redux.compose)(run.bind(null, id), next, select)(store.getState());
          },
          Dispatch: function Dispatch(_ref3) {
            var _ref4 = _slicedToArray(_ref3, 2),
                action = _ref4[0],
                next = _ref4[1];

            store.dispatch(id, action);
            return run(id, next);
          },
          Effect: function Effect(_ref5) {
            var _ref6 = _slicedToArray(_ref5, 2),
                factory = _ref6[0],
                next = _ref6[1];

            return Promise.resolve(factory()).then((0, _redux.compose)(run.bind(null, id), next));
          }
        });
      }
    });
  };

  return run;
};

exports.interpreteEventSource = interpreteEventSource;