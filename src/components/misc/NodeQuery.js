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
    id: parseInt(node_id)
  };

  // Define URL params
  const config = {
    params: params
  };

  // Placeholder: Return data
  const res = await axios.get(`${Util.API_URL}/place`, config);
  return res.data;

  // // Send request
  // // Await response
  // const res = await axios.get(`${Util.API_URL}/nodes`, config);
  //
  // // Return response data
  // return res.data.flows;
};

export default NodeQuery;
