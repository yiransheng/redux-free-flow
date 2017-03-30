import React from "react";
import "./log.css";

function Log(props) {
  const { title, logEntries } = props;

  return (
    <div className="log">
      <h3>{title}</h3>
      <ul>
        {logEntries.map(({ type, key, error }, index) => (
          <li
            key={key}
            style={{
              transform: `translateY(${100 * index}%)`,
              color: error ? "red" : "black"
            }}
          >
            {type}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Log;
