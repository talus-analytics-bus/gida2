/**
 * Totals weights by a particular summary attribute given a FlowBundle API
 * response.
 */
export const getWeightsBySummaryAttribute = ({
  field,
  flowTypes,
  data,
  ...props
}) => {
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
      for (let [k, v] of Object.entries(summaries[field])) {
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
