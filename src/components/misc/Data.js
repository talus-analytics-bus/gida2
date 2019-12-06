/**
 * Totals weights by a particular summary attribute given a FlowBundle API
 * response.
 */
export const getWeightsBySummaryAttribute = ({ field, flowTypes, data }) => {
  // If no data, return null
  console.log("data - getWeightsBySummaryAttribute");
  console.log(data);
  if (data === undefined || data.length === 0) return null;

  // Define output object
  const output = {};

  // For each flow type
  flowTypes.forEach(ft => {
    // For each datum
    data.forEach(d => {
      const curFtData = d.flow_types[ft];
      if (curFtData === undefined) return;

      // get summaries
      const summaries = curFtData.summaries;

      // If summaries not defined, skip
      if (summaries === undefined) return;

      // If summary not provided for field, skip
      if (summaries[field] === undefined) return;

      console.log("summaries");
      console.log(summaries);
      // Otherwise, for each value in it
      for (let [k, v] of Object.entries(summaries[field])) {
        console.log("k");
        console.log(k);
        console.log("v");
        console.log(v);
        // If the value has not yet been seen, add it
        if (output[k] === undefined) output[k] = { [ft]: v, attribute: k };
        else {
          // Otherwise increment it or mark as unknown, as appropriate
          if (output[k][ft] === undefined || output[k][ft] === "unknown") {
            output[k][ft] = v;
          }
        }
      }
    });
  });
  console.log("output");
  console.log(output);
  // Format output as an array of objects (one object per row)
  return Object.values(output);
};
