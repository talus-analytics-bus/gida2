import axios from "axios";
import Util from "./Util.js";

/**
 * Get flow data from API.
 * @method FlowQuery
 */

const FlowQuery = async function({
  focus_node_type,
  focus_node_ids = null,
  node_category = null,
  flow_type_ids,
  start_date,
  end_date,
  return_child_flows = false,
  bundle_child_flows = false,
  bundle_child_flows_by_neighbor = false,
  filters = {}
}) {
  // Define URL parameters //
  const params = {
    focus_node_type: focus_node_type,
    focus_node_ids:
      focus_node_ids !== null ? focus_node_ids.join(",") : focus_node_ids,
    node_category:
      node_category !== null
        ? node_category.join(",")
        : node_category,
    flow_type_ids: flow_type_ids.join(","),
    return_child_flows: return_child_flows,
    bundle_child_flows: bundle_child_flows,
    bundle_child_flows_by_neighbor: bundle_child_flows_by_neighbor
  };

  // Send start and end dates if they are provided, otherwise do not send.
  end_date = typeof end_date !== "undefined" ? end_date : start_date;
  if (end_date !== undefined) params.end_date = end_date;
  if (start_date !== undefined) params.start_date = start_date;

  // Define POST body data
  const data = filters;

  // Define URL params
  const config = {
    params: params
  };

  // Send request
  // Await response
  const res = await axios.post(`${Util.API_URL}/flows`, data, config);

  // Return response data
  return res.data.flows;
};

export default FlowQuery;
