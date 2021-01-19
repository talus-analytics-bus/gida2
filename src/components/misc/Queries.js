// 3rd party libs
import axios from "axios";
import * as d3 from "d3/dist/d3.min";

// local libs
import ObservationQuery from "./ObservationQuery";

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
  originIds = [],
  targetIds = [],
  filters = {},
  page = 1,
  pagesize = 1e6,
  forExport = false,
  format = [],
}) {
  // Define POST body data
  const data = { filters };

  // Define URL params
  const params = new URLSearchParams({ page, pagesize });

  const toAdd = [
    ["origin_ids", originIds],
    ["target_ids", targetIds],
    ["format", format],
  ];
  toAdd.forEach(([key, values]) => {
    if (values !== undefined && values.length > 0) {
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

  if (props.id !== undefined) params.append("stakeholder_id", props.id);
  if (props.scoreType) params.append("assessment_type", props.scoreType);
  if (props.format) params.append("format", props.format);
  if (props.fields)
    props.fields.forEach(f => {
      params.append("fields", f);
    });
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
  if (params.get("id") === "ghsa" && params.get("by") === null) {
    return {
      id: "ghsa",
      name: "GHSA",
    };
  }
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
 */

export const Outbreak = async function({ id, slug, format, ...props }) {
  // Define URL parameters //
  const params = new URLSearchParams();
  bindParams({
    params,
    toCheck: [["id", id], ["slug", slug], ["format", format]],
  });

  // Define URL params
  const config = {
    params,
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

// sort metric responses by value amount
const sortByValAmount = (a, b) => {
  if (a.value > b.value) return -1;
  else if (a.value < b.value) return 1;
  else return 0;
};

export const CumulativeCasesOrDeaths = async ({ casesOrDeaths, eventData }) => {
  // return cumulative cases by country for all countries that have
  // observations with `metric_id`
  const metric_id =
    casesOrDeaths === "cases"
      ? eventData.case_data_id
      : eventData.death_data_id;
  if (metric_id === null) {
    if (NONE_VALS.includes(eventData.cases_and_deaths_json)) {
      return "Unavailable";
    } else {
      return eventData.cases_and_deaths_json.map(d => {
        return { value: d[casesOrDeaths] };
      });
      // return d3.sum(eventData.cases_and_deaths_json, d => d[casesOrDeaths]);
    }
  } else {
    const res = await ObservationQuery({
      metric_id,
      temporal_resolution: "daily",
      spatial_resolution: "country",
    });
    return res.sort(sortByValAmount);
  }
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
