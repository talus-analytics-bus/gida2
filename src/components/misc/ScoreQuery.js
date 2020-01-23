import axios from "axios";
import Util from "./Util.js";

/**
 * Get flow type data from API.
 * @method ScoreQuery
 */

const ScoreQuery = async function({ ...props }) {
  // Define URL parameters //
  const params = {};

  // Define URL params
  const config = {
    params: params
  };

  // Get score type (determines endpoint)
  const scoreType = props.scoreType ? props.scoreType : "jee";
  const endpoint = scoreType === "jee" ? "jee_scores" : "pvs_scores";

  // Send request
  // Await response
  // TODO support PVS scores
  const res = await axios.get(`${Util.API_URL}/${endpoint}`, config);

  // Return response data
  return res.data;
};

export default ScoreQuery;
