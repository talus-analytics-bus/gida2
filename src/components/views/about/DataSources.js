import React from "react";
import { Link } from "react-router-dom";
import styles from "./about.module.scss";
import classNames from "classnames";

// JSX for about page.
const DataSources = () => {
  // Scroll to top of window afer loading.
  React.useEffect(() => window.scrollTo(0, 0), []);
  return (
    <div className={classNames(styles.about, "pageContainer")}>
      <div className={styles.header}>
        <div className={styles.title}>Data sources</div>
      </div>
      <div className={styles.description}>
        <p>
          GIDA currently aggregates data from a multitude of sources. A complete
          list of these sources, along with detailed descriptions, is included
          below. In addition to these data sources, we also receive data
          directly from donor countries, and users may{" "}
          <Link to="/about/submit">submit additional data</Link> for
          incorporation into the tool.
        </p>
        <p>
          For additional detail on these data sources, including inclusion and
          exclusion criteria and detailed descriptions of methods for data
          aggregation, please see the{" "}
          <a target="_blank" href="/export/GIDA Technical Appendix.pdf">
            Technical Appendix
          </a>
          .
        </p>
        <table>
          <tbody>
            <tr>
              <td>Data source</td>
              <td>Description</td>
            </tr>
            <tr>
              <td>International Aid Transparency Initiative (IATI)</td>
              <td>
                The International Aid Transparency Initiative (IATI) is a
                public, voluntary registry of international aid funding
                initiatives, and aggregates data shared by over 600
                organizations. IATI data from selected sectors are included in
                the dashboard. Data were accessed via&nbsp;
                <a target="_blank" href="http://d-portal.org/">
                  d-portal
                </a>
                .&nbsp;
              </td>
            </tr>
            <tr>
              <td>Article X Compendiums</td>
              <td>
                A compendium of projects related to Article X of the Biological
                and Toxin Weapons Convention was submitted by Canada, Denmark,
                the European Union, Finland, Germany, Italy, Japan, Netherlands,
                Spain, Sweden, the United Kingdom, and the United States of
                America. The compendium includes detailed information on Article
                X-relevant projects implemented and/or funded by GP members
                since December 2016. Data is pulled from this paper every year
                it is submitted.
              </td>
            </tr>
            <tr>
              <td>Nuclear Threat Initiative (NTI) Commitment Tracker</td>
              <td>
                The Nuclear Threat Initiative (NTI) Commitment Tracker was
                developed to track global health security funding commitments
                and to foster accountability for existing commitments. The NTI
                Commitment Tracker tracks financial commitments as well as
                commitments to complete or support the JEE process, advance GHSA
                action packages, or to participate in other activities to build
                global health security.&nbsp;
              </td>
            </tr>
            <tr>
              <td>WHO Contingency Fund for Emergencies</td>
              <td>
                In March of 2018, Canada, Denmark, Estonia, Germany, the
                Republic of Korea, Kuwait, Luxembourg, Malta, Netherlands,
                Norway, and the United Kingdom of Great Britain and Northern
                Ireland announced their commitments to the World Health
                Organization (WHO) Contingency Fund for Emergencies. These funds
                are intended to support the rapid financing of response
                operations. Information about the WHO Contingency Fund for
                Emergencies is available{" "}
                <a
                  target="_blank"
                  href="http://origin.who.int/mediacentre/news/releases/2018/contingency-fund-emergencies/en/"
                >
                  online
                </a>
                . Additional contributions to the fund are found{" "}
                <a
                  target="_blank"
                  href="http://origin.who.int/emergencies/funding/contingency-fund/en/"
                >
                  here
                </a>
                .
              </td>
            </tr>
            <tr>
              <td>1540 Assistance Database</td>
              <td>
                The 1540 database was developed by the 1540 Committee pursuant
                to UNSC Resolution 1540 (2004), for the purpose of providing
                additional information on the national implementation of
                regulations and measures related to the resolution. Information
                about the 1540 Assistance Database is available{" "}
                <a
                  target="_blank"
                  href="https://www.un.org/en/sc/1540/national-implementation/legislative-database/general-information.shtml"
                >
                  online
                </a>
                .
              </td>
            </tr>
            <tr>
              <td>Ebola Recovery Tracking Initiative</td>
              <td>
                The Ebola Recovery Tracking Initiative tracks official
                development assistance towards Ebola recovery efforts in Guinea,
                Liberia, Sierra Leone, and the Mano River Union. The initiative
                is a partnership between the governments of Guinea, Liberia and
                Sierra Leone, the United Nations Office of the
                Secretary-General&rsquo;s Special Adviser on Community Based
                Medicine and Lessons from Haiti, and the United Nations
                Development Programme (UNDP). The Ebola Recovery Tracking
                Initiative is available{" "}
                <a target="_blank" href="https://ebolarecovery.org/">
                  online
                </a>
                .
              </td>
            </tr>
            <tr>
              <td>US White House GHSA Progress and Impact Report</td>
              <td>
                In February of 2018, the United States published its second
                annual report on progress and impact from U.S. investment in the
                GHSA. Where specific funders, recipients, and funding
                transactions were referenced in this report, data were
                incorporated into the dashboard. The 2018 US GHSA Progress and
                Impact Report is publicly available&nbsp;
                <a
                  target="_blank"
                  href="https://www.ghsagenda.org/docs/default-source/default-document-library/global-health-security-agenda-2017-progress-and-impact-from-u-s-investments.pdf"
                >
                  online
                </a>
                . We capture data from all US national reports on GHSA.
              </td>
            </tr>
            <tr>
              <td>Global Chinese Finance Dataset</td>
              <td>
                AidData&rsquo;s Global Chinese Official Finance Dataset tracks
                known projects financed by China in Africa, the Middle East,
                Asia and the Pacific, Latin America and the Caribbean, and
                Central and Eastern Europe from 2000-2014. The data are publicly
                available{" "}
                <a
                  target="_blank"
                  href="https://www.aiddata.org/data/chinese-global-official-finance-dataset"
                >
                  online
                </a>
                .
              </td>
            </tr>
            <tr>
              <td>Global Health Centre Working Paper No. 18</td>
              <td>
                The Global Health Centre Working Paper No. 18, "Investing for a
                Rainy Day: Challenges in Financing National Preparedness for
                Outbreaks", authored by Suerie Moon and Rai Vaidya, identifies
                international investments related to national outbreak
                preparedness from a range of funders. The paper is publicly
                available{" "}
                <a
                  target="_blank"
                  href="https://repository.graduateinstitute.ch/record/296613/files/wp_0018_v3.pdf"
                >
                  online
                </a>
                .
              </td>
            </tr>
            <tr>
              <td>World Bank Ebola Financing Research Brief</td>
              <td>
                The Ebola Financing Research Brief provides information about
                World Bank contributions for the current and past Ebola
                outbreaks and overall pandemic preparedness.
              </td>
            </tr>
            <tr>
              <td>BWC Working Papers</td>
              <td>
                Occasionally, Members States of the BWC submit national papers
                describing capacity building efforts for health security. We
                capture data from those papers relevant to GIDA.
              </td>
            </tr>
            <tr>
              <td>Philanthropic Databases and Press Releases</td>
              <td>
                Data from multiple philanthropic databases, and press releases
                are incorporated into the dashboard, including data from the
                Open Philanthropy Grant Database.
              </td>
            </tr>
            <tr>
              <td>Private Sector Websites and Press Releases</td>
              <td>
                Data from multiple private sector websites and press releases
                are incorporated into the dashboard.
              </td>
            </tr>
            <tr>
              <td>Additional Media Statements</td>
              <td>
                Data from multiple media statements are incorporated into the
                dashboard.
              </td>
            </tr>
            <tr>
              <td>Additional peer reviewed publications</td>
              <td>
                In addition to the above data sources, we also receive and
                review peer reviewed publications describing both financial and
                in-kind support from countries and organizations
              </td>
            </tr>
            <tr>
              <td>Resolve ReadyScore data</td>
              <td>
                Resolve ReadyScores assess a country's ability to find, stop and
                prevent health threats, and are determined based on the results
                of country-level Joint External Evaluations (JEEs). ReadyScore
                data are publicly available{" "}
                <a
                  target="_blank"
                  href="https://preventepidemics.org/ready-score-map/"
                >
                  online
                </a>
                .
              </td>
            </tr>
            <tr>
              <td>JEE mission report and executive summary data</td>
              <td>
                The Joint External Evaluation tool (JEE) measures
                country-specific progress in developing the capacities needed to
                prevent, detect, and respond to public health threats. Publicly
                available mission reports and executive summaries describing
                these evaluations are available{" "}
                <a
                  target="_blank"
                  href="https://www.who.int/ihr/procedures/mission-reports/en/"
                >
                  online
                </a>
                .
              </td>
            </tr>
            <tr>
              <td>Data from Donor Countries</td>
              <td>
                In addition to the above data sources, we also receive data
                directly from donor countries.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataSources;
