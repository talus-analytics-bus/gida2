import axios from "axios";

const NodeSumsQuery = async function({
  direction = 'origin',
  ...props
}) {

  // Send request
  // Await response
  const res = await axios(
    {
      method: 'post',
      url: `${Util.API_URL}/flow_bundles_focus`,
      data,
      params: {
        direction
      }
    }
  );
  return res.data;
};

export default NodeSumsQuery;
