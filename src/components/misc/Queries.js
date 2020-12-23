import axios from "axios";

// constants
const NONE_VALS = [null, undefined];

export const NodeSums = async function({
  format,
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
      ["format", format],
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

export const Chords = async function({ format, filters, group_by, ...props }) {
  // define params
  const params = new URLSearchParams();
  bindParams({
    params,
    toCheck: [["format", format], ["group_by", group_by]],
  });

  // Send request
  // Await response
  const res = await axios({
    method: "post",
    url: `${process.env.REACT_APP_API_URL}/post/chords`,
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
  originIds,
  targetIds,
  filters = {},
  page = 1,
  pagesize = 1e6,
  forExport = false,
}) {
  // Define POST body data
  const data = { filters };

  // Define URL params
  const params = new URLSearchParams({ page, pagesize });

  const toAdd = [["origin_ids", originIds], ["target_ids", targetIds]];
  toAdd.forEach(([key, values]) => {
    if (values.length > 0) {
      values.forEach(v => {
        params.append(key, v);
      });
    }
  });

  // if for export, only return data and props for use in other queries
  if (forExport) {
    return { params, data };
  } else {
    // Send request
    // Await response
    const res = await axios.post(
      `${process.env.REACT_APP_API_URL}/post/flows`,
      data,
      { params }
    );

    // Return response data
    return res.data;
  }
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
  if (props.format) params.append("format", props.format);

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
  iso3,
  search,
  by,
  limit,
  filters,
}) {
  const params = new URLSearchParams();
  const toCheck = [
    ["iso3", iso3],
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
