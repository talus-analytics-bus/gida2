import axios from "axios";
import Util from "./Util.js";

/**
 * Get flow bundle data from API not focused on a specific target or source
 * node.
 * @method FlowBundleGeneralQuery
 */

const FlowBundleGeneralQuery = async function({
  node_category = null,
  flow_type_ids,
  start_date,
  end_date,
  filters = {},
  summaries = {},
  include_master_summary = false,
  pair_node_id,
  ...props
}) {
  // Define URL parameters //
  const params = {
    node_category:
      node_category !== null ? node_category.join(",") : node_category,
    flow_type_ids: flow_type_ids.join(","),
    include_master_summary: include_master_summary,
    pair_node_id: pair_node_id
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
    `${Util.API_URL}/flow_bundles_general`,
    data,
    config
  );

  // Post-processing (move to API though)
  if (props.single_source_and_target === true) {
    res.data.flow_bundles = res.data.flow_bundles.filter(d => {
      return (
        ((d.source === undefined || d.source.length === 1) &&
          d.target === undefined) ||
        d.target.length === 1
      );
    });
  }

  // Return response data
  return res.data;
};

export default FlowBundleGeneralQuery;
