import { isFree } from "./free";
import { interpreteDispatch } from "./interpreters";

const createMiddleware = () =>
  storeApi => {
    const interpreter = interpreteDispatch(storeApi);
    const replaceDispatch = next => {
      let currentTransaction = null;
      const interprete = transaction =>
        interpreter(transaction).then(() => {
          currentTransaction = null;
        });

      return action => {
        if (!isFree(action)) {
          return next(action);
        }
        if (currentTransaction) {
          currentTransaction = currentTransaction.then(() =>
            interprete(action));
        } else {
          currentTransaction = interprete(action);
        }
      };
    };
    return replaceDispatch;
  };

export default createMiddleware;
