import axios from "axios";

export const NodeSums = async function({
  direction = "origin",
  filters,
  ...props
}) {
  // Send request
  // Await response
  const res = await axios({
    method: "post",
    url: `${process.env.REACT_APP_API_URL}/post/node_sums`,
    data: { filters },
    params: {
      direction,
    },
  });
  return res.data;
};

/**
 * Get flow type data from API.
 * @method FlowType
 */

export const FlowType = async function({ flow_type_ids }) {
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
 * Get place data from API. Populates the place menu.
 * when complete.
 */

const allStakeholders = {};
export const Stakeholder = async function({
  id,
  search,
  by,
  limit,
  filters = null,
}) {
  const params = new URLSearchParams();
  const toCheck = [
    ["id", id],
    ["search", search],
    ["by", by],
    ["limit", limit],
  ];
  toCheck.forEach(([k, v]) => {
    if (![undefined, null, ""].includes(v)) {
      params.append(k, v);
    }
  });
  const gotAll = params.toString() === "";
  if (gotAll && allStakeholders[by] !== undefined) {
    return allStakeholders[by];
  }
  const res = await axios.post(
    `${process.env.REACT_APP_API_URL}/post/stakeholders`,
    { filters },
    {
      params,
    }
  );
  if (gotAll && allStakeholders[by] !== undefined) {
    allStakeholders[by] = res.data;
  } else return res.data;
};

/**
 * Get outbreak data from API.
 * @method FlowType
 */

export const Outbreak = async function({ ...props }) {
  // Define URL parameters //
  const params = {};

  // Define URL params
  const config = {
    params: params,
  };

  // Send request
  // Await response
  const res = await axios.get(
    `${process.env.REACT_APP_API_URL}/get/outbreaks`,
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
