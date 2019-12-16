import React from "react";
import RadioToggle from "./RadioToggle.js";

/**
 * Generic radio toggle
 * TODO implement tooltip
 * @method GhsaToggle
 */
const GhsaToggle = ({ ghsaOnly, setGhsaOnly }) => {
  return (
    <RadioToggle
      choices={[
        {
          name: "All funding",
          value: "false"
        },
        {
          name: "GHSA funding only",
          value: "true",
          tooltip:
            "The Global Health Security Agenda (GHSA) is a partnership of nations, international organizations, and non-governmental stakeholders to help build countries’ capacity to help create a world safe and secure from infectious disease threats. Only resources that have specifically been identified as being committed or disbursed under the GHSA are identified as GHSA financial resources in GIDA."
        }
      ]}
      curVal={ghsaOnly}
      callback={setGhsaOnly}
    />
  );
};

export default GhsaToggle;