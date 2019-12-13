import React from "react";
import classNames from "classnames";
import { DataTable } from "react-data-components";

/**
 * Simple table for displaying data (proof-of-concept)
 * @method SimpleTable
 */
const TableInstance = ({ colInfo, data, rows, ...props }) => {
  // constructor(props) {
  //   super(props);
  //   this.handleTableClick = this.handleTableClick.bind(this);
  //   this.buildTable = this.buildTable.bind(this);
  //   this.renderMapUrl = this.renderMapUrl.bind(this);
  // }

  // // GENERIC URL LINK RENDERER
  // renderUrl(val, row) {
  //   return (
  //     <a title={`Value: ${val}`} href={`/baseurl/${val}`}>
  //       <span
  //         style={{
  //           display: "inline-block",
  //           width: 92,
  //           whiteSpace: "nowrap",
  //           overflow: "hidden",
  //           textOverflow: "ellipsis"
  //         }}
  //       >
  //         {`Value: ${val}`}
  //       </span>
  //     </a>
  //   );
  // }
  //
  // renderCity(val, row) {
  //   console.log(row);
  //   if (!val) return <span>{``}</span>;
  //   else
  //     return (
  //       <a href="#" data-action-name={"linkCity"} data-city-name={row.CITY}>
  //         {val}
  //       </a>
  //     );
  // }
  //
  // renderMapUrl(val, row) {
  //   return (
  //     <a href={`https://www.google.com/maps?q=${row["LAT"]},${row["LON"]}`}>
  //       Google Maps
  //     </a>
  //   );
  // }

  const handleTableClick = dataAttrs => {
    console.log("dataAttrs");
    console.log(dataAttrs);
  };

  const buildTable = tableData => {
    // TODO rationalize
    var tableColumns = [
      { title: "Name", prop: "NAME", className: "pushState" }
      // { title: "Map", render: this.renderMapUrl, className: "text-center" }
    ];

    // TODO rationalize
    if (tableData.length === 0) return <div />;
    else
      return (
        <DataTable
          className="container"
          keys={"NAME"}
          columns={tableColumns}
          clickHandler={handleTableClick}
          initialData={tableData}
          initialPageLength={5}
          pageLengthOptions={[5, 20, 50]}
        />
      );
  };

  return buildTable([{ NAME: "MVM test" }]);
};

export default TableInstance;
