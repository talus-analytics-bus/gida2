import axios from "axios";
import Util from "./Util.js";

/**
 * Get outbreak data from API.
 * @method FlowType
 */

const OutbreakQuery = async function({ ...props }) {
  // Define URL parameters //
  const params = {};

  // Define URL params
  const config = {
    params: params
  };

  // Send request
  // Await response
  const res = await axios.get(`${Util.API_URL}/outbreaks`, config);

  // Return response data
  return res.data;
};

export default OutbreakQuery;
