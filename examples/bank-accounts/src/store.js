import { compose, applyMiddleware, createStore } from "redux";
import { createLogger } from "redux-logger";
import enhancer, { isFree } from "redux-free-flow";

import reducer, { getInitialState } from "./reducer";

export default function configureStore() {
  const enhance = compose(
    enhancer,
    applyMiddleware(
      createLogger({
        level: "info",
        duration: true,
        actionTransformer: action => {
          if (isFree(action)) {
            return { type: "Transaction", payload: action };
          }
          return action;
        }
      })
    )
  );
  return enhance(createStore)(reducer, getInitialState());
}
