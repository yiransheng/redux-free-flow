import React from "react";
import { connect } from "react-redux";
import { Account, AccountsContainer } from "./components/Accounts";
import Form from "./components/Form";
import Log from "./components/Log";

import { match } from "single-key";
import { compose, withProps } from "recompose";

import { getAccounts } from "./selectors";

// accounts table

const enhanceAccounts = compose(
  connect(getAccounts),
  withProps(props => {
    return {
      selected: match(props.acctSelection, {
        None: () => ({}),
        Both: ([from, to]) => ({
          [from]: "from",
          [to]: "to"
        }),
        From: from => ({ [from]: "from" })
      })
    };
  })
);
const Accounts = enhanceAccounts(({ accounts, onSelect, selected }) => {
  return (
    <AccountsContainer>
      {accounts.map(acct => (
        <Account
          account={acct}
          key={acct.id}
          onClick={onSelect}
          selection={selected[acct.id]}
        />
      ))}
    </AccountsContainer>
  );
});

// log

const Actions = connect(state => {
  return { logEntries: state.actionLogs, title: "Redux Actions" };
})(Log);

// App
const withUiState = connect(
  state => {
    return {
      acctSelection: state.acctSelection
    };
  },
  dispatch => {
    return {
      selectAccount: id => dispatch({ type: "SELECT_ACCOUNT", payload: id })
    };
  }
);

const App = withUiState(props => {
  const { acctSelection, selectAccount } = props;
  return (
    <div className="app">
      <Accounts onSelect={selectAccount} acctSelection={acctSelection} />
      <Form acctSelection={acctSelection} />
      <Actions />
    </div>
  );
});

export default App;
