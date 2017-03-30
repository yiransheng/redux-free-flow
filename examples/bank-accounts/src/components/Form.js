import React from "react";
import { connect } from "react-redux";
import { noop } from "lodash";

import { match } from "single-key";
import { compose, withProps } from "recompose";

import { transferMoney } from "../actions";

import "./form.css";

// transform action form

const enhanceForm = compose(
  connect(
    () => ({}),
    (dispatch, props) => ({
      onSubmit: match(
        props.acctSelection,
        {
          Both([from, to]) {
            return e => {
              e.preventDefault();
              const formData = new FormData(e.target);
              dispatch(transferMoney(from, to, +formData.get("amount")));
            };
          }
        },
        noop
      )
    })
  ),
  withProps(props => {
    return match(props.acctSelection, {
      None: () => ({ from: "", to: "" }),
      From: from => ({ from, to: "" }),
      Both: ([from, to]) => ({ from, to })
    });
  })
);

const Form = enhanceForm(props => {
  const { from, to, onSubmit } = props;

  return (
    <div className="form">
      <div style={{ textAlign: "right" }}>{"Select Accounts: \u2192"}</div>
      <form onSubmit={onSubmit}>
        <span className="form-control" key="from">
          <label htmlFor="from">From Account </label>
          <input type="text" name="from" disabled value={from} />
        </span>
        <span className="form-control" key="to">
          <label htmlFor="to">To Account </label>
          <input type="text" name="to" disabled value={to} />
        </span>
        <span className="form-control" key="amount">
          <label htmlFor="amount">Transfer Amount </label>
          <input type="number" name="amount" />
        </span>
        <span className="form-control" key="submit">
          <button type="submit">Transfer Money</button>
        </span>
      </form>
    </div>
  );
});

export default Form;
