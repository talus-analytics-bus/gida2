import React from "react";
import { Link } from "react-router-dom";
import Util from "./Util.js";

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
  return nodeList.map((node, i) => {
    const url = urlFunc(node);
    return (
      <span>
        {(otherId || id) !== node && id !== node && (
          <span>
            <Link to={url}>{node}</Link>
            {i !== nodeList.length - 1 && <span>; </span>}
          </span>
        )}
        {((otherId || id) === node || id === node) && (
          <span>
            <span>{node}</span>
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
  if (data === undefined || data.length === 0) return null;

  // Define output array
  const outputArr = [];

  // For each node,
  data.forEach(d => {
    // Create output object
    const output = {
      [nodeType !== null ? nodeType : "focus_node_id"]:
        nodeType === null ? d["focus_node_id"] : d[nodeType].join("; ")
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
      const summaries = curFtData.summaries;

      // If summaries not defined, skip this flow type
      if (summaries === undefined) return;

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

        outputArr.push({
          attribute: attribute,
          [ft]: v,
          source: d.source.join("; "),
          target: d.target.join("; ")
        });
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
