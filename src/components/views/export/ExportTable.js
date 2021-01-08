import React, { useState, useEffect } from "react";
import classNames from "classnames";
import styles from "./exporttable.module.scss";
import { Settings } from "../../../App.js";
import { execute, Flow } from "../../misc/Queries";
import Util from "../../misc/Util.js";
import FlowQuery from "../../misc/FlowQuery.js";
import Chevron from "../../common/Chevron/Chevron.js";
import Loading from "../../common/Loading/Loading.js";
import Pagination from "../../common/Pagination/Pagination.js";

// Content components
import TableInstance from "../../chart/table/TableInstance.js";

// FC for ExportTable.
const ExportTable = ({
  exportCols,
  curPage,
  setCurPage,
  stakeholders,
  pageLoading,
  setPageLoading,
  ...props
}) => {
  // Currently unused, will be used for dynamic page size selection.
  const [curPageSize, setCurPageSize] = useState(5);

  // define data
  const [data, setData] = useState({
    flows: { data: [], paging: { n_records: null } },
  });
  // Set n records
  props.setNRecords(data.flows.paging.n_records);

  // track where data initially loaded
  const [initLoaded, setInitLoaded] = useState(false);

  useEffect(() => setCurPage(1), [
    props.coreCapacities,
    props.funders,
    props.recipients,
    props.outbreaks,
    props.supportType,
  ]);

  const cols = [
    {
      title: "Project name",
      prop: "name",
      type: "text",
      func: d => d.name,
    },
    {
      title: "Project description",
      prop: "desc",
      type: "text",
      func: d => d.desc,
    },
    {
      title: "Data source",
      prop: "sources",
      type: "text",
      func: d =>
        d.sources !== undefined
          ? d.sources.filter(dd => dd.trim() !== "").join("; ")
          : "",
    },
    {
      title: "Core capacities",
      prop: "ccs",
      type: "text",
      func: d => (d.ccs ? d.ccs.join("; ") : ""),
    },
    {
      title: "Transaction year range",
      prop: "years",
      type: "text",
      func: d => (d.years ? d.years : ""),
    },
    {
      title: (
        <div className={styles.row}>
          <Chevron type={"funder"} />
          <div>Funder</div>
        </div>
      ),
      prop: "origins",
      type: "text",
      func: d => d.origins.map(dd => stakeholders[dd].name).join("; "),
    },
    {
      title: (
        <div className={styles.row}>
          <Chevron type={"recipient"} />
          <div>Recipient</div>
        </div>
      ),
      prop: "targets",
      type: "text",
      func: d => d.targets.map(dd => stakeholders[dd].name).join("; "),
    },
    {
      title: "Support type",
      prop: "assistance_type",
      type: "text",
      func: d => {
        if (!d.is_inkind) return "Financial assistance";
        else return "In-kind support";
      },
    },
    {
      title: `Amount committed`,
      prop: "committed_funds",
      type: "num",
      className: d => (d > 0 ? "num" : "num-with-text"),
      func: d => (d.committed_funds !== null ? d.committed_funds : ""),
      render: d => Util.formatValue(d, "committed_funds"),
    },
    {
      title: `Amount disbursed`,
      prop: "disbursed_funds",
      type: "num",
      className: d => (d > 0 ? "num" : "num-with-text"),
      func: d => (d.disbursed_funds !== null ? d.disbursed_funds : ""),
      render: d => Util.formatValue(d, "disbursed_funds"),
    },
  ].filter(d => exportCols.includes(d.prop));

  const dataTable = (
    <TableInstance
      noNativePaging={true}
      noNativeSearch={true}
      noNativeSorting={true}
      tableColumns={cols}
      tableData={data.flows.data}
    />
  );

  const getData = async () => {
    const flowQuery = getFlowQuery({ props, curPage });

    const queries = {
      // Information about the entity
      flows: flowQuery,
    };

    // Get results in parallel
    const results = await execute({ queries });
    setData(results);
    setPageLoading(false);
    if (!initLoaded) setInitLoaded(true);
  };

  // TODO call when filters change
  useEffect(() => {
    setPageLoading(true);
    getData();
  }, [curPage, curPageSize]);

  // Return JSX
  return (
    <div className={classNames("pageContainer", styles.exportTable)}>
      {
        <div>
          {
            <Pagination
              {...{
                curPage,
                setCurPage,
                setCurPageSize,
                loaded: !pageLoading,
                initLoaded,
                nPages: data.flows.paging.n_pages,
              }}
            />
          }
        </div>
      }
      <Loading loaded={initLoaded}>{dataTable}</Loading>
    </div>
  );
};

export const getFlowQuery = ({ props, curPage, forExport = false }) => {
  // Define queries for typical ExportTable page.
  const flowFilters = {};

  // CCs
  if (props.coreCapacities.length > 0) {
    flowFilters["Project_Constants.core_capacities"] = [
      ["any", props.coreCapacities.map(d => d.value)],
    ];
  }

  // assistance type
  if (props.supportType.length === 1) {
    flowFilters["Project_Constants.is_inkind"] = [
      props.supportType[0].value === "inkind",
    ];
  }

  // outbreak events
  if (props.outbreaks.length > 0) {
    flowFilters["Project.events"] = [
      ["any", "Event.id", props.outbreaks.map(d => d.value)],
    ];
  }
  const standardProps = {
    filters: flowFilters,
    originIds: props.funders.map(d => d.value),
    targetIds: props.recipients.map(d => d.value),
    pagesize: 10,
    page: curPage,
  };
  if (!forExport)
    return Flow({
      ...standardProps,
      forExport: false,
    });
  else
    return Flow({
      ...standardProps,
      forExport: true,
    });
};

export default ExportTable;
