import axios from "axios";
import Util from "./Util.js";

/**
 * Get flow type data from API.
 * @method FlowTypeQuery
 */

const FlowTypeQuery = async function({ flow_type_ids }) {
  // Define URL parameters //
  const params = {
    flow_type_ids: flow_type_ids.join(",")
  };

  // Define URL params
  const config = {
    params: params
  };

  // Send request
  // Await response
  const res = await axios.get(`${Util.API_URL}/flow_types`, config);

  // Return response data
  return res.data.data;
};

export default FlowTypeQuery;
