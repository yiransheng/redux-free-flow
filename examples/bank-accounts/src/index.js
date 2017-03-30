import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { AnimationProvider } from "./hocs/withAnimations";
import App from "./App";
import configureStore from "./store";
import "./index.css";

const store = configureStore();

ReactDOM.render(
  <Provider store={store}>
    <AnimationProvider>
      <App />
    </AnimationProvider>
  </Provider>,
  document.getElementById("root")
);
