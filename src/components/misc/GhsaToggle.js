import React from "react";
import RadioToggle from "./RadioToggle.js";

/**
 * Generic radio toggle
 * TODO implement tooltip
 * @method GhsaToggle
 */
const GhsaToggle = ({ ghsaOnly, setGhsaOnly, ...props }) => {
  const choices = [
    {
      name: "All funding",
      value: "false"
    },
    {
      name: "GHSA funding only",
      value: "true",
      tooltip:
        "The Global Health Security Agenda (GHSA) is a partnership of nations, international organizations, and non-governmental stakeholders to help build countries’ capacity to help create a world safe and secure from infectious disease threats. Only resources that have specifically been identified as being committed or disbursed under the GHSA are identified as GHSA financial resources in GIDA."
    },
    {
      name: "PHEIC funding only",
      value: "event",
      tooltip: ""
    },
    {
      name: "IHR capacity building funding only",
      value: "capacity",
      tooltip: ""
    }
  ];

  // Set disable criteria
  if (props.disabled)
    choices.forEach(d => (d.disabled = props.disabled[d.value] || false));

  return (
    <RadioToggle
      label={props.label !== undefined ? props.label : "Click to show"}
      choices={choices}
      curVal={ghsaOnly}
      callback={setGhsaOnly}
      horizontal={props.horizontal}
      selectpicker={props.selectpicker}
    />
  );
};

export default GhsaToggle;
