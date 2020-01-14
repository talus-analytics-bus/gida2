import React from "react";
import { Link } from "react-router-dom";
import Util from "./Util.js";
import * as d3 from "d3/dist/d3.min";

// Given the full set of JEE scores, an ISO2 code, and a set of core capacities,
// returns the average core capacity score for each defined core capacity for
// the location with the provided ISO2 code.
export const getJeeScores = ({ scores, iso2, coreCapacities }) => {
  // TODO
  if (iso2 === undefined) return [];
  const scoresForPlace = scores[iso2];
  if (scoresForPlace === undefined) return [];
  const ccsToInclude =
    coreCapacities.length > 0
      ? coreCapacities
      : core_capacities.map(cc => cc.value);
  const output = ccsToInclude.map(cc => {
    const scoreForPlace = scoresForPlace[cc];
    if (scoreForPlace === undefined)
      return {
        value: cc,
        score: null
      };
    else
      return {
        value: cc,
        score: scoreForPlace // TODO
      };
  });
  return output;
};

/**
 * Given the disbursed funds received (single value) and the data array of
 * average core capacity scores (filtered only), returns a value that is
 * higher if needs a more met in a country and lower if less met.
 * @method calculateNeedsMet
 * @param  {[type]}          disbursedFundsReceived [description]
 * @param  {[type]}          avgCapScores           [description]
 * @return {[type]}                                 [description]
 */
const debugNeedsMet = false;
export const calculateNeedsMet = ({ datum, avgCapScores }) => {
  // Get the disbursed funds received for this datum.
  const disbursedFundsReceived = datum.flow_types["disbursed_funds"]
    ? datum.flow_types["disbursed_funds"].focus_node_weight
    : undefined;

  // If undefined, then return null for the needs met value.
  if (disbursedFundsReceived === undefined && avgCapScores < 4) return 0;
  if (disbursedFundsReceived === undefined) return -9999;
  if (disbursedFundsReceived === "unknown") return -8888;
  if (avgCapScores === undefined) return -9999;
  else {
    // Finally, perform the needs met calculation if needed data are avail.
    // The numerator.
    const numerator = 10 + Math.log10(1 + disbursedFundsReceived);

    // The denominator.
    const denominator = 5.01 - avgCapScores;

    // Needs met is the numerator divided by the denominator.
    const needsMet = numerator / denominator;
    return needsMet;
  }
};

// Core capacities
// TODO move this to API/db
export const core_capacities = [
  {
    value: "P.1",
    label: "P.1 - National Legislation, Policy, and Financing",
    cat: "Prevent"
  },
  {
    value: "P.2",
    label: "P.2 - IHR Coordination, Communicaton and Advocacy",
    cat: "Prevent"
  },
  {
    value: "P.3",
    label: "P.3 - Antimicrobial Resistance (AMR)",
    cat: "Prevent"
  },
  {
    value: "P.4",
    label: "P.4 - Zoonotic Disease",
    cat: "Prevent"
  },
  {
    value: "P.5",
    label: "P.5 - Food Safety",
    cat: "Prevent"
  },
  {
    value: "P.6",
    label: "P.6 - Biosafety and Biosecurity",
    cat: "Prevent"
  },
  {
    value: "P.7",
    label: "P.7 - Immunization",
    cat: "Prevent"
  },
  {
    value: "D.1",
    label: "D.1 - National Laboratory System",
    cat: "Detect"
  },
  {
    value: "D.2",
    label: "D.2 - Real Time Surveillance",
    cat: "Detect"
  },
  {
    value: "D.3",
    label: "D.3 - Reporting",
    cat: "Detect"
  },
  {
    value: "D.4",
    label: "D.4 - Workforce Development",
    cat: "Detect"
  },
  {
    value: "R.1",
    label: "R.1 - Preparedness",
    cat: "Respond"
  },
  {
    value: "R.2",
    label: "R.2 - Emergency Response Operations",
    cat: "Respond"
  },
  {
    value: "R.3",
    label: "R.3 - Linking Public Health and Security Authorities",
    cat: "Respond"
  },
  {
    value: "R.4",
    label: "R.4 - Medical Countermeasures and Personnel Deployment",
    cat: "Respond"
  },
  {
    value: "R.5",
    label: "R.5 - Risk Communication",
    cat: "Respond"
  },
  {
    value: "PoE",
    label: "PoE - Point of Entry (PoE)",
    cat: "Other"
  },
  {
    value: "CE",
    label: "CE - Chemical Events",
    cat: "Other"
  },
  {
    value: "RE",
    label: "RE - Radiation Emergencies",
    cat: "Other"
  },
  {
    value: "General IHR",
    label: "General IHR Implementation",
    cat: "Other"
  }
];

// Core capacities grouped by core elements
// TODO move this to API/db
export const core_capacities_grouped = [
  {
    label: "Prevent",
    options: core_capacities.filter(cc => cc.cat === "Prevent")
  },
  {
    label: "Detect",
    options: core_capacities.filter(cc => cc.cat === "Detect")
  },
  {
    label: "Respond",
    options: core_capacities.filter(cc => cc.cat === "Respond")
  },
  {
    label: "Other",
    options: core_capacities.filter(cc => cc.cat === "Other")
  }
];

/**
 * Given the parameters, returns a list of links (semicolon-delimited) for the
 * list of nodes. Used mainly in populating table cells.
 * @method getNodeLinkList
 * @param  {[type]}        urlType    [description]
 * @param  {[type]}        nodeList   [description]
 * @param  {[type]}        entityRole [description]
 * @param  {[type]}        id         [description]
 * @param  {[type]}        otherId    [description]
 * @return {[type]}                   [description]
 */
export const getNodeLinkList = ({
  urlType,
  nodeList,
  entityRole,
  id,
  otherId
}) => {
  let urlFunc;
  if (urlType === "pair-table") {
    urlFunc = node => {
      const url =
        entityRole === "funder"
          ? `/pair-table/${node}/${otherId || id}`
          : `/pair-table/${id}/${node}`;
      return url;
    };
  } else if (urlType === "table") {
    urlFunc = node => {
      const url = `/table/${node}/${entityRole}`;
      return url;
    };
  } else if (urlType === "details") {
    urlFunc = node => {
      const url = `/details/${node}/${entityRole}`;
      return url;
    };
  }

  // Do not list URLs unless the node belongs to any of these types
  const urlTypes = ["country", "organization", "agency"];
  return nodeList.map((node, i) => {
    const url = urlFunc(node.id);
    const type = node.type;
    const doUrl = urlTypes.includes(type);
    const skipUrlBecauseIsTargetInRecipientCol =
      otherId && node.id === otherId && entityRole === "recipient";
    const skipUrlBecauseIsSourceInFunderCol =
      id && node.id === id && entityRole === "funder";
    const skipUrlBecauseIsOnlyNode =
      otherId === undefined && id && node.id === id;
    return (
      <span>
        {doUrl &&
          !skipUrlBecauseIsOnlyNode &&
          !skipUrlBecauseIsTargetInRecipientCol &&
          !skipUrlBecauseIsSourceInFunderCol && (
            <span>
              <Link to={url}>{node.name}</Link>
              {i !== nodeList.length - 1 && <span>; </span>}
            </span>
          )}
        {(!doUrl ||
          skipUrlBecauseIsOnlyNode ||
          skipUrlBecauseIsTargetInRecipientCol ||
          skipUrlBecauseIsSourceInFunderCol) && (
          <span>
            <span>{node.name}</span>
            {i !== nodeList.length - 1 && <span>; </span>}
          </span>
        )}
      </span>
    );
  });
};

/**
 * Given the value and the type (num, text), returns the correct AZ or numeric
 * code representing the data.
 * @method getTableCellCodeFromVal
 * @param  {[type]}                val   [description]
 * @param  {[type]}                type  [description]
 * @param  {[type]}                props [description]
 * @return {[type]}                      [description]
 */
export const getTableCellCodeFromVal = ({ val, type, ...props }) => {
  const undefinedOrNull = val === undefined || val === null;
  const unknown = val === "unknown";
  switch (type) {
    case "num":
      // If undefined or null, return -9999, which represents "n/a".
      if (undefinedOrNull) return -9999;
      // If "unknown", return -8888, which represents ("Specific amount
      // unknown").
      if (unknown) return -8888;
      else return val;

    case "text":
      // If undefined or null, return 'zzz', which represents "n/a".
      if (undefinedOrNull) return "zzz";
      // If "unknown", return 'yyy', which represents ("Specific amount
      // unknown").
      if (unknown) return "yyy";
      else return val;
    default:
      return val;
  }
};

/**
 * Given an array of objs with attribute 'func' that defines how the data need
 * to be reshaped for each datum in 'data', returns the reshaped data. This is
 * used to prepare data for TableInstance instances.
 * @method getTableRowData
 * @param  {[type]}        tableRowDefs [description]
 * @param  {[type]}        data         [description]
 * @return {[type]}                     [description]
 */
export const getTableRowData = ({
  tableRowDefs,
  data,
  filterFcn = d => true
}) => {
  const tableRows = [];
  data.forEach(d => {
    const row = {};
    tableRowDefs.forEach(def => {
      // const noDataVal = def.type === "num" ? -9999 : "zzz";
      if (def.func === undefined)
        def.func = d => {
          return d[def.prop];
        };
      row[def.prop] = getTableCellCodeFromVal({
        val: def.func(d),
        type: def.type
      });
    });
    if (filterFcn(row)) tableRows.push(row);
  });
  return tableRows;
};

/**
 * Returns true if the data are unknown amounts only, false otherwise.
 * TODO at API level instead.
 * @method isUnknownDataOnly
 * @param  {[type]}          data [description]
 * @return {Boolean}              [description]
 */
export const isUnknownDataOnly = ({ masterSummary }) => {
  let unknownOnly = true;
  for (let [k, v] of Object.entries(masterSummary.flow_types)) {
    if (v.focus_node_weight !== "unknown") {
      unknownOnly = false;
    }
  }
  return unknownOnly;
};

/**
 * Returns array with one object per target/source node in the flow dataset,
 * and key/value pairs containing the weights from the attribute summary named
 * in the "field" argument.
 * @method getSummaryAttributeWeightsByNode
 * @param  {[type]}                         field     [description]
 * @param  {[type]}                         flowTypes [description]
 * @param  {[type]}                         data      [description]
 * @param  {[type]}                         nodeType  [description]
 * @param  {[type]}                         props     [description]
 * @return {[type]}                                   [description]
 */
export const getSummaryAttributeWeightsByNode = ({
  field,
  flowTypes,
  data,
  nodeType,
  ...props
}) => {
  // If no data, return null
  if (data === undefined || data.length === 0) return [];

  // Define output array
  const outputArr = [];

  // For each node,
  data.forEach(d => {
    // Create output object
    const output = {
      [nodeType]: d[nodeType]
    };

    // Flag false if no data for any flow type, true otherwise
    let noData = true;

    // For each flow type
    flowTypes.forEach(ft => {
      // TODO reuse the code below from other function
      // "getWeightsBySummaryAttribute"
      // Get all data related to the flow type. If none, then continue to the
      // next flow type.
      const curFtData = d.flow_types[ft];
      if (curFtData === undefined) return;

      // get summaries for the current flow type (e.g., total weights by year)

      // If summaries not defined, set it to unspecified
      if (curFtData.summaries === undefined) {
        curFtData.summaries = {
          [field]: {
            Unspecified: curFtData["focus_node_weight"]
          }
        };
      }
      const summaries = curFtData.summaries;

      // If summary not provided for field, skip this flow type
      if (
        summaries[field] === undefined ||
        Object.keys(summaries[field]).length === 0
      )
        return;
      else noData = false;

      // Initialize output obj for current flow type
      output[ft] = { total: curFtData.focus_node_weight };

      // Otherwise, add all the summary field values
      for (let [k, v] of Object.entries(summaries[field])) {
        output[ft][k] = v;
      }
    });

    // Push row to output array
    if (!noData) outputArr.push(output);
  });
  return outputArr;
};

/**
 * Totals weights by a particular summary attribute given a FlowBundle API
 * response, assuming FlowBundleGeneralQuery was called
 * TODO consider adding "total" field.
 */
export const getWeightsBySummaryAttributeSimple = ({
  field,
  flowTypes,
  data,
  ...props
}) => {
  // Get value formatter
  const format = Util.getAttrFormatter("core_elements");

  // Define output array
  const outputArr = [];

  // For each flow type
  flowTypes.forEach(ft => {
    // For each datum
    data.forEach(d => {
      // Get all data related to the flow type. If none, then continue to the
      // next flow type.
      const curFtData = d.flow_types[ft];
      if (curFtData === undefined) return;

      // get summaries for the current flow type (e.g., total weights by year)
      const summaries = curFtData.summaries;

      // If summaries not defined, skip this flow type
      if (summaries === undefined) return;

      // If summary not provided for field, skip this flow type
      if (summaries[field] === undefined) return;

      // Otherwise, for each value in it
      for (let [kTmp, v] of Object.entries(summaries[field])) {
        // Format key
        const attribute = format(kTmp);
        const outputObj = {
          attribute: attribute,
          [ft]: v
        };
        const nodeTypes = [("source", "target")];
        nodeTypes.forEach(nodeType => {
          if (d[nodeType] !== undefined) {
            outputObj[nodeType] = d[nodeType].map(dd => dd.name).join("; ");
          }
        });
        outputArr.push(outputObj);
      }
    });
  });

  // Format output as an array of objects (one object per row)
  return outputArr;
};

/**
 * Totals weights by a particular summary attribute given a FlowBundle API
 * response.
 * TODO consider adding "total" field.
 */
export const getWeightsBySummaryAttribute = ({
  field,
  flowTypes,
  data,
  ...props
}) => {
  // Get value formatter
  const format = Util.getAttrFormatter("core_elements");

  // Flag true if data should be returned specific to target/source, and false
  // if it should be returned aggregated by target/source (non-specific).
  const byOtherNode =
    props.byOtherNode === true && props.otherNodeType !== undefined;

  // If no data, return null
  if (data === undefined || data.length === 0) return null;

  // Define output array
  const outputArr = [];

  // Define output object
  const output = {};

  // For each flow type
  flowTypes.forEach(ft => {
    // For each datum
    data.forEach(d => {
      // Get target or source (as specified in props object)
      const otherNodeType = byOtherNode ? props.otherNodeType : null;

      // Create string from target/source list
      const otherNodesStr = byOtherNode ? d[otherNodeType].join("; ") : null;

      // Get all data related to the flow type. If none, then continue to the
      // next flow type.
      const curFtData = d.flow_types[ft];
      if (curFtData === undefined) return;

      // get summaries for the current flow type (e.g., total weights by year)
      const summaries = curFtData.summaries;

      // If summaries not defined, skip this flow type
      if (summaries === undefined) return;

      // If summary not provided for field, skip this flow type
      if (summaries[field] === undefined) return;

      // Otherwise, for each value in it
      for (let [kTmp, v] of Object.entries(summaries[field])) {
        // Format key
        const k = format(kTmp);

        // If the value has not yet been seen,
        if (output[k] === undefined) {
          // and the final output should be separated by target/source node,
          if (byOtherNode)
            // Add an entry for the flow type, attribute, and target/source node
            output[k] = {
              [otherNodesStr]: {
                [ft]: v,
                attribute: k,
                [otherNodeType]: otherNodesStr
              }
            };
          // otherwise, simply add an entry for the flow type and attribute
          // (not specifying target/source)
          else output[k] = { [ft]: v, attribute: k };

          // If we are separating outputs by target/source node, and the
          // attribute has already been seen but not the target/source node,
        } else if (byOtherNode && output[k][otherNodesStr] === undefined)
          // Specify the target/source node value for this flow type
          output[k][otherNodesStr] = {
            [ft]: v,
            attribute: k,
            [otherNodeType]: otherNodesStr
          };
        // otherwise, the flow type/attribute/target-source node has been
        // seen before, so increment its value as appropriate
        else {
          // if we are counting target/source node,
          if (byOtherNode) {
            // increment the flow type value as appropriate
            if (
              output[k][otherNodesStr][ft] === undefined ||
              output[k][ft] === "unknown"
            ) {
              output[k][otherNodesStr][ft] = v;
            }
            // otherwise,
          } else {
            // increment the flow type value as appropriate without specifying
            // the target/source node
            if (output[k][ft] === undefined || output[k][ft] === "unknown") {
              output[k][ft] = v;
            }
          }
        }
      }
    });
  });

  // Organize the output as an array of objects rather than as a single object
  // For each key/val pair in the current output object,
  for (let [k, v] of Object.entries(output)) {
    // if we are counting target/source node,
    if (byOtherNode) {
      // For each key/val pair in that target/source node entry,
      for (let [k2, v2] of Object.entries(v)) {
        // add the value to the output array
        outputArr.push(v2);
      }
    } else {
      // add the value to the output array without tracking target/source node
      outputArr.push(v);
    }
  }

  // Format output as an array of objects (one object per row)
  return outputArr;
};

export const getNodeData = id => {
  switch (id) {
    case "ghsa":
      return {
        name: "Global Health Security Agenda (GHSA)",
        id: id
      };
    default:
      return {
        name: id,
        id: id
      };
  }
};
