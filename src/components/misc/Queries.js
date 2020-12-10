import axios from "axios";

export const NodeSumsQuery = async function({
  direction = "origin",
  ...props
}) {
  // Send request
  // Await response
  const res = await axios({
    method: "post",
    url: `${process.env.REACT_APP_API_URL}/post/node_sums`,
    data: {},
    params: {
      direction,
    },
  });
  return res.data;
};

/**
 * Get flow type data from API.
 * @method FlowTypeQuery
 */

export const FlowTypeQuery = async function({ flow_type_ids }) {
  // Define URL parameters -- the ids of flow types to get info for, if any
  const params = new URLSearchParams();
  const noneVals = [null, undefined];
  if (!noneVals.includes(flow_type_ids) && typeof flow_type_ids === "object") {
    flow_type_ids.forEach(v => {
      params.append("flow_type_ids", v);
    });
  }

  // Define URL params
  const config = {
    params: params,
  };

  // Send request, await response
  const res = await axios.get(
    `${process.env.REACT_APP_API_URL}/get/flow_types`,
    config
  );

  // Return response data
  return res.data;
};

/**
 * Execute set of queries in parallel and return results asynchronously.
 * @method
 * @param  {[type]} queries [description]
 * @return {[type]}         [description]
 */
export const execute = async function({ queries }) {
  const results = {};
  for (const [k, v] of Object.entries(queries)) {
    const res = await v;
    results[k] = res;
  }
  return results;
};

export default execute;
