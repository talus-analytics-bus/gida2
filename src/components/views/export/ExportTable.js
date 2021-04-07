import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import classNames from "classnames";
import styles from "./exporttable.module.scss";
import { execute, Flow, Outbreak } from "../../misc/Queries";
import Util from "../../misc/Util.js";
import { Chevron, Loading, ShowMore, SmartTable } from "../../common";

const None = () => <span className={styles.none}>None</span>;

// FC for ExportTable.
const ExportTable = ({
  exportCols,
  searchText,
  sortCol,
  isDesc,
  pagesize,
  setSearchText,
  setSortCol,
  setIsDesc,
  setPagesize,
  curPage,
  setCurPage,
  stakeholders,
  pageLoading,
  setPageLoading,
  outbreaks,
  coreCapacities,
  supportType,
  funders,
  recipients,
  ...props
}) => {
  // Currently unused, will be used for dynamic page size selection.
  const [fetchingRows, setFetchingRows] = useState(false);

  // define data
  const [data, setData] = useState({
    flows: { data: [], paging: { n_records: null } },
  });
  // Set n records
  props.setNRecords(data.flows.paging.n_records);

  // track where data initially loaded
  const [initLoaded, setInitLoaded] = useState(false);

  // lookup table for outbreak names by IDs
  const [outbreakNameById, setOutbreakNameById] = useState(null);

  useEffect(() => {
    if (curPage !== 1) setCurPage(1);
    else {
      setInitLoaded(false);
      getData();
    }
  }, [coreCapacities, funders, recipients, outbreaks, supportType]);

  useEffect(() => {
    if (initLoaded) {
      getData();
    }
  }, [curPage, pagesize]);

  useEffect(() => {
    if (initLoaded) {
      if (curPage !== 1) setCurPage(1);
      else getData();
    }
  }, [sortCol, isDesc, searchText]);

  const cols = [
    {
      title: "Project name",
      prop: "name",
      entity: "Project",
      type: "text",
      func: d => d.name,
      render: d => <ShowMore {...{ text: d, charLimit: 100 }} />,
    },
    {
      title: "Project description",
      prop: "desc",
      entity: "Project",
      type: "text",
      func: d => d.desc,
      render: d => <ShowMore {...{ text: d, charLimit: 100 }} />,
    },
    {
      title: "Data source",
      prop: "sources",
      entity: "Project",
      type: "text",
      func: d =>
        d.sources !== undefined && d.sources !== null
          ? d.sources.filter(dd => dd.trim() !== "").join("; ")
          : "",
      render: d => <ShowMore {...{ text: d, charLimit: 100 }} />,
    },
    {
      title: "Core capacities",
      prop: "core_capacities",
      entity: "project_constants",
      type: "text",
      func: d => (d.core_capacities ? d.core_capacities.join("; ") : ""),
    },
    {
      title: "PHEICs",
      prop: "events",
      entity: "project_constants",
      type: "text",
      func: d => d.events || [],
      render: d => {
        const ready = outbreakNameById !== null;
        if (ready) {
          if (d.length > 0)
            return (
              ready &&
              d.map((dd, ii) => {
                const comma = ii !== d.length - 1 ? ", " : null;
                const { name, slug } = outbreakNameById[dd];
                return (
                  <>
                    <Link {...{ to: `/events/${slug}` }}>{name}</Link>
                    {comma}
                  </>
                );
              })
            );
          else return <None />;
        } else return null;
      },
    },
    {
      title: "Transaction year range",
      prop: "years",
      entity: "project_constants",
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
      entity: "project_constants",
      type: "text",
      func: d => d.origins.map(dd => stakeholders[dd].name).join("; "),
      render: d => <ShowMore {...{ text: d, charLimit: 100 }} />,
    },
    {
      title: (
        <div className={styles.row}>
          <Chevron type={"recipient"} />
          <div>Recipient</div>
        </div>
      ),
      prop: "targets",
      entity: "project_constants",
      type: "text",
      func: d => d.targets.map(dd => stakeholders[dd].name).join("; "),
    },
    {
      title: "Support type",
      prop: "assistance_type_project",
      entity: "project_constants", // TODO implement
      type: "text",
      func: d => {
        if (!d.is_inkind) return "Financial assistance";
        else return "In-kind support";
      },
    },
    {
      title: `Amount committed`,
      prop: "committed_funds",
      entity: "project_constants",
      type: "num",
      className: d => (d > 0 ? "num" : "num-with-text"),
      func: d => (d.committed_funds !== null ? d.committed_funds : ""),
      render: d => Util.formatValue(d, "committed_funds") || <None />,
    },
    {
      title: `Amount disbursed`,
      prop: "disbursed_funds",
      entity: "project_constants",
      type: "num",
      className: d => (d > 0 ? "num" : "num-with-text"),
      func: d => (d.disbursed_funds !== null ? d.disbursed_funds : ""),
      render: d => Util.formatValue(d, "disbursed_funds") || <None />,
    },
  ].filter(d => exportCols.includes(d.prop));

  const dataTable = (
    <SmartTable
      {...{
        data: data.flows.data,
        columns: cols.filter(d => d.hide !== true),
        nTotalRecords: data.flows.paging.n_records,
        loading: fetchingRows,
        curPage,
        pagesize,
        sortCol,
        isDesc,
        searchText,
        setPagesize,
        setCurPage,
        setSortCol,
        setIsDesc,
        setSearchText,
      }}
    />
  );
  // const dataTable = (
  //   <TableInstance
  //     noNativePaging={true}
  //     noNativeSearch={true}
  //     noNativeSorting={true}
  //     tableColumns={cols}
  //     tableData={data.flows.data}
  //   />
  // );

  const getData = async () => {
    const flowQuery = getFlowQueryForDataPage({
      props: { outbreaks, coreCapacities, supportType, funders, recipients },
      curPage,
      pagesize,
      isDesc,
      sortCol,
      searchText,
    });

    const queries = {
      // Information about the entity
      flows: flowQuery,
      outbreakNameById: Outbreak({ format: "names_by_id" }),
    };

    // Get results in parallel
    setFetchingRows(true);
    const results = await execute({ queries });
    setFetchingRows(false);
    setData(results);
    setPageLoading(false);
    setInitLoaded(true);
    setOutbreakNameById(results.outbreakNameById);
  };

  // Return JSX
  return (
    <div className={classNames("pageContainer", styles.exportTable)}>
      <Loading loaded={initLoaded}>{dataTable}</Loading>
    </div>
  );
};

export const getFlowQueryForDataPage = ({
  props,
  curPage,
  pagesize,
  isDesc,
  sortCol,
  searchText,
  forExport = false,
}) => {
  // Define queries for typical ExportTable page.
  const flowFilters = {};

  // core_capacities
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
    pagesize,
    page: curPage,
    isDesc,
    sortCol,
    searchText,
    fields: [
      "Project.id",
      "Project.name",
      "Project.desc",
      "project_constants.targets",
      "project_constants.origins",
      "Project.sources",
      "Project.notes",
      "project_constants.core_capacities",
      "project_constants.years",
      "project_constants.disbursed_funds",
      "project_constants.committed_funds",
      "project_constants.provided_inkind",
      "project_constants.committed_inkind",
      "project_constants.is_inkind",
      "project_constants.is_ghsa",
      "project_constants.response_or_capacity",
      "project_constants.events",
    ],
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
