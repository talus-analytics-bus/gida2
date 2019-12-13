import axios from "axios";
import Util from "./Util.js";
import { getNodeData } from "./Data.js";

/**
 * Get node data from API.
 * @method NodeQuery
 */

const NodeQuery = async function({ node_id }) {
  // Define URL parameters //
  const params = {
    node_id: node_id
  };

  // Define URL params
  const config = {
    params: params
  };

  // Placeholder: Return data
  return getNodeData(node_id);

  // // Send request
  // // Await response
  // const res = await axios.get(`${Util.API_URL}/nodes`, config);
  //
  // // Return response data
  // return res.data.flows;
};

export default NodeQuery;
