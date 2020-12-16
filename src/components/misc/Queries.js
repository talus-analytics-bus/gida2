import axios from "axios";

// constants
const NONE_VALS = [null, undefined];

export const NodeSums = async function({
  direction = "origin",
  filters,
  group_by,
  preserve_stakeholder_groupings = false,
  ...props
}) {
  // define params
  const params = new URLSearchParams();
  bindParams({
    params,
    toCheck: [
      ["group_by", group_by],
      ["direction", direction],
      ["preserve_stakeholder_groupings", preserve_stakeholder_groupings],
    ],
  });

  // Send request
  // Await response
  const res = await axios({
    method: "post",
    url: `${process.env.REACT_APP_API_URL}/post/node_sums`,
    data: { filters },
    params,
  });
  return res.data;
};

export /**
 * Get flow data from API.
 * @method FlowQuery
 */

const Flow = async function({
  focus_node_type,
  focus_node_ids = null,
  node_category = null,
  flow_type_ids,
  start_date,
  end_date,
  return_child_flows = true,
  bundle_child_flows = true,
  bundle_child_flows_by_neighbor = true,
  filters = {},
  pair_node_id,
  by_outbreak,
  include_general_amounts,
  page,
  page_size,
  for_export = false,
  ...props
}) {
  // Define URL parameters //
  const params = {
    focus_node_type: focus_node_type,
    focus_node_ids:
      focus_node_ids !== null ? focus_node_ids.join(",") : focus_node_ids,
    node_category:
      node_category !== null ? node_category.join(",") : node_category,
    flow_type_ids: flow_type_ids.join(","),
    return_child_flows: return_child_flows,
    bundle_child_flows: bundle_child_flows,
    bundle_child_flows_by_neighbor: bundle_child_flows_by_neighbor,
    pair_node_id: pair_node_id,
    by_outbreak: by_outbreak,
    include_general_amounts: include_general_amounts,
    for_export: for_export,
  };
  if (params.for_export !== true) {
    if (page) params.page = page;
    if (page_size) params.page_size = page_size;
  }

  // Send start and end dates if they are provided, otherwise do not send.
  end_date = typeof end_date !== "undefined" ? end_date : start_date;
  if (end_date !== undefined) params.end_date = end_date;
  if (start_date !== undefined) params.start_date = start_date;

  // Define POST body data
  const data = filters;

  if (props.paramsOnly === true) return { params: params, data: data };

  // Define URL params
  const config = {
    params: params,
  };

  // // If for export, set content type
  // if (params.for_export) {
  //   config.headers = {
  //     "Content-Type":
  //       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  //   };
  // }

  // Send request
  // Await response
  const res = await axios.post(
    `${process.env.REACT_APP_API_URL}/post/flows`,
    data,
    config
  );

  // Return response data
  return res.data;
};

/**
 * Get flow type data from API.
 * @method FlowType
 */

export const FlowType = async function({ flow_type_ids }) {
  // Define URL parameters -- the ids of flow types to get info for, if any
  const params = new URLSearchParams();
  if (!NONE_VALS.includes(flow_type_ids) && typeof flow_type_ids === "object") {
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
 * Get score data from API.
 * @method ScoreQuery
 */

export const Assessment = async function({ ...props }) {
  // Define URL parameters //
  const params = new URLSearchParams();

  if (props.id) params.append("stakeholder_id", props.id);
  if (props.scoreType) params.append("type", props.scoreType);

  // Define URL params
  const config = {
    params,
  };

  // Send request
  // Await response
  const res = await axios.get(
    `${process.env.REACT_APP_API_URL}/get/assessments`,
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

/**
 * Bind parameter values in `toCheck` to URLSearchParams instance in `params`
 * if the are not "none"-like
 * @method bindParams
 * @param  {[type]}   params  [description]
 * @param  {[type]}   toCheck [description]
 * @return {[type]}           [description]
 */
const bindParams = ({ params, toCheck }) => {
  toCheck.forEach(([k, v]) => {
    if (!NONE_VALS.includes(v)) {
      params.append(k, v);
    }
  });
};

export default execute;
