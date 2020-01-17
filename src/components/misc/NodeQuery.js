import axios from "axios";
import Util from "./Util.js";
import { getNodeData } from "./Data.js";

/**
 * Get node data from API.
 * @method NodeQuery
 */

const NodeQuery = async function({ node_id, ...props }) {
  if (node_id === "ghsa") {
    return getNodeData("ghsa");
  }
  // Define URL parameters //
  const params = {
    id: node_id !== undefined ? parseInt(node_id) : undefined
  };

  // Other options
  if (props.setKeys !== undefined) params.setKeys = props.setKeys;
  if (props.search !== undefined) params.search = props.search;

  // Define URL params
  const config = {
    params: params
  };

  // Placeholder: Return data
  const res = await axios.get(`${Util.API_URL}/place`, config);
  if (node_id !== undefined && node_id !== null) {
    return res.data[0];
  }
  return res.data;
};

export default NodeQuery;
