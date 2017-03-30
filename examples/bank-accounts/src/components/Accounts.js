import React from "react";
import withAnimation from "../hocs/withAnimations";
import { format } from "currency-formatter";
import "./accounts.css";

function* interpolateInteger(prevProps, nextProps) {
  const { balance: b1 } = prevProps;
  const { balance: b2 } = nextProps;
  if (b1 !== b2) {
    const diff = b2 - b1;
    const change = Math.round(diff * 100 / 24);
    for (let i = 0; i < 23; i++) {
      const step = {
        balance: (b1 * 100 + change * i) / 100
      };
      yield step;
    }
    yield nextProps;
  } else {
    yield nextProps;
  }
}
const Balance = withAnimation(interpolateInteger)(props => {
  const { balance } = props;
  return (
    <div className="aligner acct-cell">
      <span className="acct-balance">{format(balance, { code: "USD" })}</span>
    </div>
  );
});
const AccountName = ({ id, name, selection }) => {
  return (
    <div className="aligner acct-cell">
      <span className="acct-id">{id}</span>
      <span className="acct-name">{name}</span>
      {selection && <span className="acct-hl">{selection}</span>}
    </div>
  );
};
const Account = ({ account, selection, onClick }) => {
  return (
    <div
      className="acct-row"
      onClick={onClick && onClick.bind(null, account.id)}
      style={{ cursor: onClick ? "pointer" : "auto" }}
    >
      <AccountName {...account} selection={selection} />
      <Balance balance={account.amount} />
    </div>
  );
};
const AccountsContainer = props => {
  return (
    <div className="acct">
      <div className="acct-title">
        <div className="acct-name acct-cell">
          Accounts
        </div>
      </div>
      {props.children}
    </div>
  );
};

export { Account, AccountsContainer };
