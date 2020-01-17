import React from "react";
import styles from "./chord.module.scss";
import TableInstance from "../../../chart/table/TableInstance.js";
import Util from "../../../misc/Util.js";
import FlowBundleGeneralQuery from "../../../misc/FlowBundleGeneralQuery.js";
import { Settings } from "../../../../App.js";
import D3Chord from "../../../chart/D3Chord/D3Chord.js";

// FC for Chord.
const Chord = ({
  chordData,
  transactionType,
  setSelectedEntity,
  selectedEntity,
  ...props
}) => {
  const [chord, setChord] = React.useState(null);

  const chordPlaceholder = (
    <TableInstance
      tableColumns={[
        {
          title: "Source region",
          prop: "source_region",
          type: "text",
          func: d => d.source[0].region
        },
        {
          title: "Source sub-region",
          prop: "source_subregion",
          type: "text",
          func: d => d.source[0].subregion
        },
        {
          title: "Source",
          prop: "source",
          type: "text",
          func: d => d.source.map(dd => dd.name).join("; ")
        },
        {
          title: "Source type",
          prop: "source_type",
          type: "text",
          func: d => d.source[0].type
        },
        {
          title: "Target region",
          prop: "target_region",
          type: "text",
          func: d => d.target[0].region
        },
        {
          title: "Target sub-region",
          prop: "target_subregion",
          type: "text",
          func: d => d.target[0].subregion
        },
        {
          title: "Target",
          prop: "target",
          type: "text",
          func: d => d.target.map(dd => dd.name).join("; ")
        },
        {
          title: "Target type",
          prop: "target_type",
          type: "text",
          func: d => d.target[0].type
        },
        {
          title: `Amount committed (${Settings.startYear} - ${
            Settings.endYear
          })`,
          prop: "committed_funds",
          type: "num",
          func: d =>
            d.flow_types.committed_funds !== undefined
              ? d.flow_types.committed_funds.focus_node_weight
              : "",
          render: d => Util.formatValue(d, "committed_funds")
        },
        {
          title: `Amount disbursed (${Settings.startYear} - ${
            Settings.endYear
          })`,
          prop: "disbursed_funds",
          type: "num",
          func: d =>
            d.flow_types.disbursed_funds !== undefined
              ? d.flow_types.disbursed_funds.focus_node_weight
              : "",
          render: d => Util.formatValue(d, "disbursed_funds")
        }
      ]}
      tableData={chordData}
    />
  );

  // Initial load: draw chord diagram
  React.useEffect(() => {
    const chordNew = new D3Chord("." + styles.chordChart, {
      chordData,
      setSelectedEntity,
      selectedEntity,
      transactionType
    });
    setChord(chordNew);
    setSelectedEntity(null);
  }, [chordData, transactionType]);
  React.useEffect(() => {
    if (chord !== null) {
      chord.params.selectedEntity = selectedEntity;
      if (selectedEntity !== null) {
        chord.highlight(selectedEntity);
      } else {
        chord.unHighlight();
      }
    }
  }, [selectedEntity]);

  return (
    <div className={styles.chord}>
      <b>Selected entity: {selectedEntity}</b>
      <div className={styles.chordChart} />
      {
        // chordPlaceholder
      }
    </div>
  );
};

// /**
//  * Returns data for the details page given the entity type and id.
//  * TODO make this work for response funding page
//  * @method getComponentData
//  * @param  {[type]}       setComponent [description]
//  * @param  {[type]}       id                  [description]
//  * @param  {[type]}       entityRole          [description]
//  */
// const getComponentData = async ({
//   setComponent,
//   flowTypeInfo,
//   ghsaOnly,
//   setGhsaOnly,
//   transactionType,
//   ...props
// }) => {
//   // Define typical base query parameters used in FlowQuery,
//   // FlowBundleFocusQuery, and FlowBundleGeneralQuery. These are adapted and
//   // modified in code below.
//   const baseQueryParams = {
//     focus_node_ids: null,
//     focus_node_type: null,
//     flow_type_ids: [1, 2],
//     start_date: `${props.minYear}-01-01`, // TODO check these two
//     end_date: `${props.maxYear}-12-31`,
//     by_neighbor: false,
//     filters: { parent_flow_info_filters: [] },
//     summaries: {},
//     include_master_summary: false,
//     single_source_and_target: true
//   };
//
//   // If core capacity filters provided, use those
//   if (props.coreCapacities.length > 0) {
//     baseQueryParams.filters.parent_flow_info_filters.push(
//       ["core_capacities"].concat(props.coreCapacities)
//     );
//   }
//
//   // If outbreak response filters provided, use those
//   // TODO
//   if (props.outbreakResponses && props.outbreakResponses.length > 0) {
//     baseQueryParams.filters.parent_flow_info_filters.push(
//       ["outbreak_responses"].concat(props.outbreakResponses)
//     );
//   }
//
//   // If GHSA page, then filter by GHSA projects.
//   if (ghsaOnly === "true")
//     baseQueryParams.filters.parent_flow_info_filters.push([
//       "ghsa_funding",
//       "True"
//     ]);
//
//   // Define queries for typical details page.
//   const queries = {
//     // Information about the entity
//     flowBundlesGeneral: FlowBundleGeneralQuery({
//       ...baseQueryParams
//     })
//   };
//
//   // Get query results.
//   const results = await Util.getQueryResults(queries);
//   console.log("results - Chord.js");
//   console.log(results);
//
//   // Feed results and other data to the details component and mount it.
//   setComponent(
//     <Chord
//       data={results.flowBundlesGeneral.flow_bundles}
//       flowTypeInfo={flowTypeInfo}
//       ghsaOnly={ghsaOnly}
//       setGhsaOnly={setGhsaOnly}
//       setComponent={setComponent}
//       activeTab={props.activeTab}
//       outbreakResponses={props.outbreakResponses}
//       coreCapacities={props.coreCapacities}
//       minYear={props.minYear}
//       maxYear={props.maxYear}
//       transactionType={transactionType}
//     />
//   );
// };
//
// const remountComponent = ({
//   component,
//   minYear,
//   maxYear,
//   ghsaOnly,
//   transactionType,
//   props
// }) => {
//   const remount =
//     component.props.minYear !== minYear ||
//     component.props.maxYear !== maxYear ||
//     component.props.ghsaOnly !== ghsaOnly ||
//     component.props.coreCapacities.toString() !==
//       props.coreCapacities.toString();
//
//   return remount;
// };
//
// export const renderChord = ({
//   component,
//   setComponent,
//   loading,
//   flowTypeInfo,
//   ghsaOnly,
//   setGhsaOnly,
//   transactionType,
//   ...props
// }) => {
//   if (loading) {
//     return <div>Loading...</div>;
//   } else if (
//     component === null ||
//     (component &&
//       remountComponent({
//         component: component,
//         props: props,
//         ghsaOnly: ghsaOnly,
//         minYear: props.minYear,
//         maxYear: props.maxYear,
//         coreCapacities: props.coreCapacities
//       }))
//   ) {
//     getComponentData({
//       setComponent: setComponent,
//       flowTypeInfo: flowTypeInfo,
//       ghsaOnly: ghsaOnly,
//       setGhsaOnly: setGhsaOnly,
//       coreCapacities: props.coreCapacities,
//       transactionType: transactionType,
//       ...props
//     });
//
//     return component ? component : <div />;
//   } else {
//     return component;
//   }
// };

export default Chord;
