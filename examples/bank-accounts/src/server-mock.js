import { random } from "lodash";
import { getInitialState } from "./reducer.js";

const timeout = time => new Promise(resolve => setTimeout(resolve, time));

const createServer = function() {
  let accounts = getInitialState().accounts;

  const transfer = (fromId, toId, amount) => {
    let result;
    if (
      accounts[fromId] &&
      accounts[toId] &&
      accounts[fromId].amount >= amount &&
      Math.random() < 0.55
    ) {
      accounts[fromId].amount -= amount;
      accounts[toId].amount += amount;
      result = "success";
    } else {
      result = "error";
    }
    return timeout(random(500, 1000)).then(() => result);
  };

  const server = {
    endpoints: {
      transfer: (fromId, toId, amount) =>
        timeout(random(500, 1000)).then(() => transfer(fromId, toId, amount))
    }
  };
  return server;
};

export default createServer;
