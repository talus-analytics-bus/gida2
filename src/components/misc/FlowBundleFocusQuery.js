import axios from "axios";
import Util from "./Util.js";

/**
 * Get flow bundle data from API focused on a specific target or source node.
 * @method FlowBundleFocusQuery
 */

const FlowBundleFocusQuery = async function({
  focus_node_type,
  focus_node_ids = null,
  focus_node_category = null,
  flow_type_ids,
  start_date,
  end_date,
  by_neighbor,
  filters = {},
  summaries = {}
}) {
  // Define URL parameters //
  const params = {
    focus_node_type: focus_node_type,
    focus_node_ids:
      focus_node_ids !== null ? focus_node_ids.join(",") : focus_node_ids,
    focus_node_category:
      focus_node_category !== null
        ? focus_node_category.join(",")
        : focus_node_category,
    flow_type_ids: flow_type_ids.join(","),
    by_neighbor: by_neighbor
  };

  // Send start and end dates if they are provided, otherwise do not send.
  end_date = typeof end_date !== "undefined" ? end_date : start_date;
  if (end_date !== undefined) params.end_date = end_date;
  if (start_date !== undefined) params.start_date = start_date;

  // Define POST body data
  const data = {
    ...filters,
    ...summaries
  };

  // Define URL params
  const config = {
    params: params
  };

  // Send request
  // Await response
  const res = await axios.post(
    `${Util.API_URL}/flow_bundles_focus`,
    data,
    config
  );

  // Return response data
  return res.data.data;
};

export default FlowBundleFocusQuery;
