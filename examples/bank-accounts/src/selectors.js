import { values } from "lodash";

export function getAccounts(state) {
  return { accounts: values(state.accounts) };
}
