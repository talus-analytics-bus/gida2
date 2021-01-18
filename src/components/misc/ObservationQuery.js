// 3rd party libs
import axios from "axios";

// utility libs
import Util from "./Util.js";

// constants
const API_URL = process.env.REACT_APP_METRICS_API_URL;
const AMP_METRIC_API_URL = process.env.REACT_APP_AMP_METRICS_API_URL;
const AMP_API_URL = "https://api.covidamp.org";
const INFINITY = 1e9;

/**
 * Get observation data from API. Updates the observation data and loading status
 * when complete.
 * @method getObservations
 */

const ObservationQuery = async function({
  metric_id,
  temporal_resolution,
  start_date,
  end_date,
  spatial_resolution = "country",
  place_id,
  place_name,
  place_iso3,
  fields,
}) {
  // FUNCTIONS //
  const getLastDatumDate = async isAMP => {
    if (!isAMP) return null;
    else {
      const res = await axios({
        url: `${AMP_API_URL}/get/version`,
      });
      return res.data.data.find(
        d => d.type === "COVID-19 case data (countries)"
      ).last_datum_date;
    }
  };

  // CONSTANTS //
  end_date = typeof end_date !== "undefined" ? end_date : start_date;
  const last_datum_date = await getLastDatumDate(metric_id === 75);
  if (last_datum_date !== null) {
    end_date = last_datum_date;
    start_date = last_datum_date;
  }
  var params = {
    metric_id,
    temporal_resolution,
    spatial_resolution,
    // lag_allowed: INFINITY,
  };

  // Send start and end dates if they are provided, otherwise do not send.
  if (end_date !== undefined) params.start = end_date;
  if (start_date !== undefined) params.end = start_date;
  if (fields !== undefined) params.fields = fields.join(",");

  if (place_id !== undefined) {
    params["place_id"] = place_id;
  } else if (place_name !== undefined) {
    params["place_name"] = place_name;
  } else if (place_iso3 !== undefined) {
    params["place_iso3"] = place_iso3;
  }

  const url =
    metric_id === 75
      ? `${AMP_METRIC_API_URL}/observations`
      : `${API_URL}/observations`;

  const res = await axios({
    url,
    params,
    headers: { "If-Modified-Since": new Date().toUTCString() },
  });

  return res.data.data;
};

export default ObservationQuery;
