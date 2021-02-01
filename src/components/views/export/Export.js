import React, { useState } from "react";
import classNames from "classnames";
import styles from "./export.module.scss";
import { Settings } from "../../../App.js";
import Util from "../../misc/Util.js";
import { execute, Stakeholder, Outbreak } from "../../misc/Queries";
import FlowQuery from "../../misc/FlowQuery.js";
import NodeQuery from "../../misc/NodeQuery.js";
import OutbreakQuery from "../../misc/OutbreakQuery.js";
import Drawer from "../../common/Drawer/Drawer.js";
import Checkbox from "../../common/Checkbox/Checkbox.js";
import FilterDropdown from "../../common/FilterDropdown/FilterDropdown.js";
import { core_capacities } from "../../misc/Data.js";
import Button from "../../common/Button/Button.js";
import axios from "axios";

// Content components
import ExportTable, { getFlowQuery } from "./ExportTable.js";

// FC for Export.
const Export = ({ data, setLoadingSpinnerOn, ...props }) => {
  const [coreCapacities, setCoreCapacities] = useState([]);
  const [supportType, setSupportType] = useState([]);
  const [funders, setFunders] = useState([]);
  const [recipients, setRecipients] = useState([]);
  const [outbreaks, setOutbreaks] = useState([]);
  const [exportTable, setExportTable] = useState(null);
  const [nRecords, setNRecords] = useState(0);
  const [curPage, setCurPage] = useState(1);
  const [exportAction, setExportAction] = useState(undefined);
  const [exportBody, setExportBody] = useState(undefined);

  // if page is changed, show pagination loading
  const [pageLoading, setPageLoading] = useState(false);

  const showClear =
    coreCapacities.length > 0 ||
    supportType.length > 0 ||
    funders.length > 0 ||
    outbreaks.length > 0 ||
    recipients.length > 0;

  const cols = [
    ["name", "Project name", true],
    ["desc", "Project description"],
    ["sources", "Data source"],
    ["ccs", "Core capacities"],
    ["origins", "Funder"],
    ["targets", "Recipient"],
    ["assistance_type", "Support type"],
    ["years", "Transaction year range"],
    [
      "committed_funds",
      `Amount committed`,
      // `Amount committed (${Settings.startYear} - ${Settings.endYear})`,
    ],
    [
      "disbursed_funds",
      `Amount disbursed`,
      // `Amount disbursed (${Settings.startYear} - ${Settings.endYear})`,
    ],
  ];

  const [exportCols, setExportCols] = useState(cols.map(d => d[0]));
  const remove = (arr, aTmp) => {
    const a = aTmp;
    let what,
      L = a.length,
      ax;
    while (L > 1 && arr.length) {
      what = a[--L];
      while ((ax = arr.indexOf(what)) !== -1) {
        arr.splice(ax, 1);
      }
    }
    return arr;
  };

  const updateExportCols = value => {
    const shouldRemove = exportCols.includes(value);
    const editableExportCols = [...exportCols];

    if (shouldRemove)
      setExportCols(editableExportCols.filter(d => d !== value));
    else {
      editableExportCols.push(value);
      setExportCols(editableExportCols.sort());
    }
  };

  const dataTable = (
    <ExportTable
      {...{
        outbreaks,
        coreCapacities,
        supportType,
        funders,
        recipients,
        exportCols,
        setNRecords,
        component: exportTable,
        setComponent: setExportTable,
        curPage,
        setCurPage,
        stakeholders: data.stakeholders,
        pageLoading,
        setPageLoading,
      }}
    />
  );

  const filterTest = (
    <FilterDropdown
      {...{
        label: "",
        options: core_capacities,
        placeholder: "Funding by core capacity",
        onChange: setCoreCapacities,
      }}
    />
  );

  const clearSelections = () => {
    setCoreCapacities([]);
    setSupportType([]);
    setFunders([]);
    setRecipients([]);
    setOutbreaks([]);
  };

  const download = () => {
    // Erase download cookie.
    Util.createCookie("download_completed", "no");
    getFlowQuery({
      curPage,
      props: {
        funders,
        recipients,
        coreCapacities,
        outbreaks,
        supportType,
      },
      forExport: true,
      ...props,
    }).then(paramsTmp => {
      // URL query params
      const params = paramsTmp.params;

      // POST body JSON
      const data = paramsTmp.data;
      data.cols = cols.filter(d => exportCols.includes(d[0]));

      const queryString = params.toString();

      const exportBodyRows = [];
      for (let key in data) {
        const d = data[key];
        exportBodyRows.push(
          <div>
            <input
              {...{
                name: key,
                id: key,
                value: JSON.stringify(d),
              }}
            />
          </div>
        );
      }
      const exportBody = exportBodyRows;
      setExportAction(
        process.env.REACT_APP_API_URL + "/post/export?" + queryString
      );
      setExportBody(exportBody);
    });
  };

  const exportFlowJsx = (
    <form action={exportAction} method="POST">
      {exportBody}
      <div>
        <button id={"download"}>Send request to POST</button>
      </div>
      //{" "}
    </form>
  );

  // When download data button is pressed, and form data are updated,
  // perform the POST request.
  React.useEffect(() => {
    if (exportAction !== undefined && exportBody !== undefined) {
      const el = document.getElementById("download");
      if (el) {
        el.click();
        const downloadCompletedCheck = setInterval(() => {
          if (Util.readCookie("download_completed") === "yes") {
            clearInterval(downloadCompletedCheck);
          }
        }, 500);
      }
    }
  }, [exportAction, exportBody]);

  // Return JSX
  return (
    <div className={classNames("pageContainer", styles.export)}>
      <div className={styles.header}>
        <div className={styles.title}>Download data</div>
      </div>

      <Drawer
        {...{
          label: "Select data",
          contentSections: [
            <div>
              <div className={styles.sectionHeader}>
                <div>Select filters to apply to selected data.</div>
                <Button
                  style={{ visibility: showClear ? "visible" : "hidden" }}
                  callback={clearSelections}
                  label={"Clear selections"}
                  type={"secondary"}
                />
              </div>
              <div className={styles.filters}>
                <FilterDropdown
                  {...{
                    label: "",
                    options: core_capacities,
                    placeholder: "Funding by core capacity",
                    onChange: setCoreCapacities,
                    curValues: coreCapacities,
                  }}
                />
                <FilterDropdown
                  {...{
                    label: "",
                    options: [
                      { value: "financial", label: "Direct financial support" },
                      { value: "inkind", label: "In-kind support" },
                    ],
                    placeholder: "Support type",
                    onChange: setSupportType,
                    curValues: supportType,
                    isSearchable: false,
                  }}
                />
                <FilterDropdown
                  {...{
                    label: "",
                    options: Object.values(data.stakeholders).map(d => {
                      return { value: d.id, label: d.name };
                    }),
                    placeholder: "Funder",
                    onChange: setFunders,
                    curValues: funders,
                  }}
                />
                <FilterDropdown
                  {...{
                    label: "",
                    options: Object.values(data.stakeholders).map(d => {
                      return { value: d.id, label: d.name };
                    }),
                    placeholder: "Recipient",
                    onChange: setRecipients,
                    curValues: recipients,
                  }}
                />
                <FilterDropdown
                  {...{
                    label: "",
                    options: data.outbreaks.map(d => {
                      return { value: d.id, label: d.name };
                    }),
                    placeholder: "Event response",
                    onChange: setOutbreaks,
                    curValues: outbreaks,
                  }}
                />
              </div>
            </div>,
            <div>
              <div>
                <div className={styles.sectionHeader}>
                  Choose data fields to include in table/download.
                </div>
                <div className={styles.sectionContent}>
                  <div className={styles.checkboxes}>
                    {cols.map(
                      d =>
                        !d[2] && (
                          <Checkbox
                            {...{
                              label: d[1],
                              value: d[0],
                              curChecked: exportCols.includes(d[0]),
                              callback: updateExportCols,
                            }}
                          />
                        )
                    )}
                  </div>
                  <div>
                    <Button
                      callback={download}
                      label={
                        <span>
                          <span
                            className={classNames(
                              "glyphicon glyphicon-download-alt"
                            )}
                          />
                          {!showClear ? (
                            <>
                              Download all available data
                              {nRecords !== undefined && nRecords !== null && (
                                <>
                                  {" "}
                                  ({Util.comma(nRecords)}{" "}
                                  {nRecords !== 1 ? "records" : "record"})
                                </>
                              )}
                            </>
                          ) : (
                            `Download selected data (${Util.comma(nRecords)} ${
                              nRecords !== 1 ? "records" : "record"
                            })`
                          )}
                        </span>
                      }
                      type={"primary"}
                    />
                  </div>
                  {exportFlowJsx}
                </div>
              </div>
            </div>,
          ],
        }}
      />
      {dataTable}
    </div>
  );
};

export const renderExport = ({
  component,
  setComponent,
  setLoadingSpinnerOn,
  loading,
}) => {
  // Get data
  if (loading) {
    return <div className={"placeholder"} />;
  } else if (component === null) {
    getComponentData({
      setComponent: setComponent,
      setLoadingSpinnerOn,
    });

    return component ? component : <div className={"placeholder"} />;
  } else {
    return component;
  }
};

/**
 * Returns data for the details page given the entity type and id.
 * TODO make this work for special detail pages like GHSA and response
 * @method getComponentData
 * @param  {[type]}       setDetailsComponent [description]
 * @param  {[type]}       id                  [description]
 * @param  {[type]}       entityRole          [description]
 */
const getComponentData = async ({ setComponent, setLoadingSpinnerOn }) => {
  // Set base query params for FlowBundleFocusQuery and FlowBundleGeneralQuery

  const baseQueryParams = {
    focus_node_ids: null,
    focus_node_type: "source",
    flow_type_ids: [5],
    start_date: `${Settings.startYear}-01-01`,
    end_date: `${Settings.endYear}-12-31`,

    // Add filters as appropriate.
    filters: {},
  };

  // Set base query params for FlowQuery
  const baseFlowQueryParams = JSON.parse(JSON.stringify(baseQueryParams));

  // Define queries for typical Export page.
  const queries = {
    // Information about the entity
    stakeholders: Stakeholder({ by: "id" }),
    outbreaks: Outbreak({}),
  };

  // Get results in parallel
  const results = await execute({ queries });

  // Set the component
  setComponent(
    <Export data={results} setLoadingSpinnerOn={setLoadingSpinnerOn} />
  );
};

export default Export;
