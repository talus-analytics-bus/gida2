import axios from "axios";
import Util from "./Util.js";
import { fetchPost } from "./Data.js";

/**
 * Get flow bundle data from API focused on a specific target or source node.
 * @method FlowBundleFocusQuery
 */

const FlowBundleFocusQuery = async function({
  focus_node_type,
  focus_node_ids = null,
  node_category = null,
  flow_type_ids,
  start_date,
  end_date,
  by_neighbor,
  filters = {},
  summaries = {},
  include_master_summary = false,
  pair_node_id,
  by_node_categories = null,
  by_outbreak = false,
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
    by_neighbor: by_neighbor,
    include_master_summary: include_master_summary,
    pair_node_id: pair_node_id,
    by_outbreak: by_outbreak,
    by_node_categories:
      by_node_categories !== null
        ? by_node_categories.join(",")
        : by_node_categories
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
  return res.data;
  // const res = await axios.post(
  //   `${Util.API_URL}/flow_bundles_focus`,
  //   data,
  //   config
  // );

  // Post-processing (move to API though)
  if (props.single_source_and_target === true) {
    res.data.flow_bundles = res.data.flow_bundles.filter(d => {
      return (
        ((d.sources === undefined || d.sources.length === 1) &&
          d.targets === undefined) ||
        d.targets.length === 1
      );
    });
  }

  // Return response data
  return res.data;
};

export default FlowBundleFocusQuery;
