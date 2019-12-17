import React from "react";
import { Link } from "react-router-dom";
import RadioToggle from "./RadioToggle.js";

/**
 * Generic radio toggle
 * TODO implement tooltip
 * @method EntityRoleToggle
 */
const EntityRoleToggle = ({ entityRole, redirectUrlFunc, callback }) => {
  const onClick = (v, jsx) => {
    console.log("Did callback: " + redirectUrlFunc(v));
    return <Link to={redirectUrlFunc(v)}>{jsx}</Link>;
  };

  return (
    <RadioToggle
      choices={[
        {
          name: "Funder",
          value: "funder"
        },
        {
          name: "Recipient",
          value: "recipient"
        }
      ]}
      curVal={entityRole}
      onClick={onClick}
      callback={callback}
    />
  );
};

export default EntityRoleToggle;
