import React from "react";
import styles from "./arealine.module.scss";
import tooltipStyles from "../../common/tooltip.module.scss";
import D3AreaLine from "./D3AreaLine.js";
import Util from "../../misc/Util.js";
import ReactTooltip from "react-tooltip";

// TEMP components
import SimpleTable from "../table/SimpleTable.js";

// FC
const AreaLine = ({ data, ...props }) => {
  const [chart, setChart] = React.useState(null);
  const [tooltipData, setTooltipData] = React.useState(undefined);

  const types = ["disbursed_funds", "committed_funds"];
  const ys = [];
  types.forEach(type => {
    const y = [];
    data.forEach(d => {
      y.push({
        date_time: `${d.attribute}/01/01`,
        metric: type,
        value: d[type] === "n/a" ? 0 : d[type],
        temporal_resolution: "yearly"
      });
    });
    y.yFormat = Util.formatSIInteger;
    y.title = Util.getInitCap(Util.formatLabel(type)) + " funds";
    ys.push(y);
  });

  React.useEffect(() => {
    const chartNew = new D3AreaLine("." + styles.areaLineChart, {
      data: ys,
      setTooltipData,
      yMetricParams: {
        temporal_resolution: "yearly",
        label: "Amount (in USD)"
      }
    });
    setChart(chartNew);
  }, []);

  console.log("tooltipData");
  console.log(tooltipData);

  return (
    <div className={styles.areaLine}>
      <div className={styles.areaLineChart} />
      {
        // Tooltip for info tooltip icons.
        <ReactTooltip
          id={"areaLineTooltip"}
          type="light"
          className={tooltipStyles.tooltip}
          place="right"
          effect="float"
          getContent={() =>
            tooltipData && (
              <table>
                {tooltipData.map(d => (
                  <tr>
                    <td>{d.field}:</td>&nbsp;<td>{d.value}</td>
                  </tr>
                ))}
              </table>
            )
          }
        />
      }
    </div>
  );
};

export default AreaLine;
