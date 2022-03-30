import React from "react"
import { Helmet } from "react-helmet"
import { Link } from "react-router-dom"
import styles from "./about.module.scss"
import classNames from "classnames"

const ExtLink = ({ url, children = url, breakwords = false }) => (
  <a
    style={{ wordBreak: breakwords ? "break-all" : undefined }}
    href={url}
    rel="noopener noreferrer"
    target="_blank"
  >
    {children}
  </a>
)

// JSX for about page.
const DataSources = () => {
  // Scroll to top of window afer loading.
  React.useEffect(() => window.scrollTo(0, 0), [])
  return (
    <div className={classNames(styles.about, "pageContainer")}>
      <Helmet titleTemplate={"%s | Global Health Security Tracking"}>
        <title>About: Data sources</title>
      </Helmet>
      <div className={styles.aboutContainer}>
        <div className={styles.header}>
          <div className={styles.title}>Data sources</div>
        </div>
        <div className={styles.description}>
          <p>
            GHS Tracking currently aggregates data from a multitude of sources.
            A complete list of these sources, along with detailed descriptions,
            is included below. In addition to these data sources, we also
            receive data directly from donor countries, and users may{" "}
            <Link to="/about/submit">submit additional data</Link> for
            incorporation into the tool.
          </p>
          <p>
            For additional detail on these data sources, including inclusion and
            exclusion criteria and detailed descriptions of methods for data
            aggregation, please see the{" "}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="/export/GIDA Technical Appendix.pdf"
            >
              Technical Appendix
            </a>
            .
          </p>
        </div>
        <table>
          <tbody>
            <tr>
              <td>
                <p>Data source</p>
              </td>
              <td>
                <p>Description</p>
              </td>
            </tr>
            <tr>
              <td>
                <p>BWC Working Papers</p>
              </td>
              <td>
                <p>
                  Occasionally, Member States of the BWC submit national papers
                  describing capacity building efforts for health security. Data
                  relevant from these papers are included in GHS Tracking.
                </p>
              </td>
            </tr>
            <tr>
              <td>
                <p>CEPI Progress Reports</p>
              </td>
              <td>
                <p>
                  The Coalition for Epidemic Preparedness Innovations (CEPI) is
                  a partnership created in 2017 to bring together global
                  stakeholders to develop vaccines with the goal of stopping
                  future pandemics. During the COVID-19 pandemic that began in
                  2019, it operated as a facilitator in the COVAX Marketplace.
                  CEPI announces funding calls for vaccine candidate development
                  and coordinates partnerships to develop specific vaccines as
                  needed. CEPI releases annual progress reports that include
                  actual and planned donor funding amounts by year. More
                  information about CEPI is available at{" "}
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://cepi.net/"
                  >
                    https://cepi.net/
                  </a>
                  .
                </p>
              </td>
            </tr>
            <tr>
              <td>
                <p>Ebola Recovery Tracking Initiative</p>
              </td>
              <td>
                <p>
                  The Ebola Recovery Tracking Initiative tracks official
                  development assistance towards Ebola recovery efforts in
                  Guinea, Liberia, Sierra Leone, and the Mano River Union. The
                  initiative is a partnership between the governments of Guinea,
                  Liberia and Sierra Leone, the United Nations Office of the
                  Secretary-General&rsquo;s Special Adviser on Community Based
                  Medicine and Lessons from Haiti, and the United Nations
                  Development Programme (UNDP).&nbsp;The Ebola Recovery Tracking
                  Initiative is available online at:{" "}
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://ebolarecovery.org/"
                  >
                    https://ebolarecovery.org/
                  </a>
                  .
                </p>
              </td>
            </tr>
            <tr>
              <td>
                <p>EIU COVID-19 Health Funding Tracker</p>
              </td>
              <td>
                <p>
                  The EIU&rsquo;s COVID-19 Health Funding Tracker provides data
                  on the flow of money towards the development, production, and
                  equitable access to new COVID-19 diagnostics, therapeutics and
                  vaccines. The data are publicly available online at{" "}
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://covidfunding.eiu.com/explore"
                  >
                    https://covidfunding.eiu.com/explore
                  </a>
                  .
                </p>
              </td>
            </tr>
            <tr>
              <td>
                <p>Global Chinese Finance Dataset</p>
              </td>
              <td>
                <p>
                  AidData&rsquo;s Global Chinese Official Finance Dataset tracks
                  known projects financed by China in Africa, the Middle East,
                  Asia and the Pacific, Latin America and the Caribbean, and
                  Central and Eastern Europe from 2000-2014. The data are
                  publicly available online at{" "}
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://www.aiddata.org/data/chinese-global-official-finance-dataset"
                  >
                    https://www.aiddata.org/data/chinese-global-official-finance-dataset
                  </a>
                  .
                </p>
              </td>
            </tr>
            <tr>
              <td>
                <p>Global Health Centre Working Paper No. 18</p>
              </td>
              <td>
                <p>
                  The Global Health Centre Working Paper No. 18, "Investing for
                  a Rainy Day: Challenges in Financing National Preparedness for
                  Outbreaks," authored by Suerie Moon and Rai Vaidya, identifies
                  international investments related to national outbreak
                  preparedness from a range of funders. The paper is publicly
                  available online at{" "}
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://repository.graduateinstitute.ch/record/296613/files/wp_0018_v3.pdf"
                  >
                    https://repository.graduateinstitute.ch/record/296613/files/wp_0018_v3.pdf
                  </a>
                  .
                </p>
              </td>
            </tr>
            <tr>
              <td>
                <p>GPWG Annual Project Report (2019)</p>
              </td>
              <td>
                <p>
                  The Global Partnership Against the Spread of Weapons and
                  Materials of Mass Destruction is a G7-led, international
                  partnership created in 2002 that aims to prevent the spread of
                  weapons of mass destruction (WMD). Their 2019 Annual Project
                  Report details the contributions of countries to aid these
                  efforts in other partner countries and regions.
                </p>
              </td>
            </tr>
            <tr>
              <td>
                <p>International Aid Transparency Initiative (IATI) Registry</p>
              </td>
              <td>
                <p>
                  The International Aid Transparency Initiative (IATI) is a
                  public, voluntary registry of international aid funding
                  initiatives, and aggregates data shared by over 600
                  organizations. More information and data are available at{" "}
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://iatistandard.org/"
                  >
                    https://iatistandard.org/
                  </a>
                  .
                </p>
              </td>
            </tr>
            <tr>
              <td>
                <p>Multi-Partner Trust Fund Office Gateway</p>
              </td>
              <td>
                <p>
                  The Multi-Partner Trust Fund (MPTF) Office Gateway provides
                  access to project summaries, budgets, and expenditure
                  information for a range of efforts that are funded by UN
                  entities, including specific event responses such as to the
                  2014-2016 Ebola outbreak in West Africa, the Democratic
                  Republic of the Congo (DRC) Humanitarian Fund, and others.
                  More information about the MPTF can be found at{" "}
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://ebolaresponse.un.org/donate"
                  >
                    https://ebolaresponse.un.org/donate
                  </a>
                  , and the Gateway data can be accessed at{" "}
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="http://mptf.undp.org/"
                  >
                    http://mptf.undp.org/
                  </a>
                  .
                </p>
              </td>
            </tr>
            <tr>
              <td>
                <p>Nuclear Threat Initiative (NTI) Commitment Tracker</p>
              </td>
              <td>
                <p>
                  The Nuclear Threat Initiative (NTI) Commitment Tracker was
                  developed to track global health security funding commitments
                  and to foster accountability for existing commitments. The NTI
                  Commitment Tracker tracks financial commitments as well as
                  commitments to complete or support the JEE process, advance
                  GHSA action packages, or to participate in other activities to
                  build global health security.
                </p>
              </td>
            </tr>
            <tr>
              <td>
                <p>US White House GHSA Progress and Impact Reports</p>
              </td>
              <td>
                <p>
                  In February of 2018, the United States published its second
                  annual report on progress and impact from U.S. investment in
                  the GHSA, and in August of 2019, the third annual report was
                  published. Where specific funders, recipients, and funding
                  transactions were referenced in these reports, data were
                  incorporated into GHS Tracking. The 2018 US White House GHSA
                  Progress and Impact Report is available online at{" "}
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://www.cdc.gov/globalhealth/healthprotection/resources/pdf/GHSA-Report-_Feb-2018.pdf"
                  >
                    https://www.cdc.gov/globalhealth/healthprotection/resources/pdf/GHSA-Report-_Feb-2018.pdf
                  </a>{" "}
                  and the 2019 US White House GHSA Progress and Impact report is
                  available online at{" "}
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://www.state.gov/wp-content/uploads/2019/11/GHSAR-2019_final.pdf"
                  >
                    https://www.state.gov/wp-content/uploads/2019/11/GHSAR-2019_final.pdf
                  </a>
                  .
                </p>
              </td>
            </tr>
            <tr>
              <td>
                <p>WHO ACT-Accelerator Commitment Tracker</p>
              </td>
              <td>
                <p>
                  The WHO ACT-Accelerator (ACT-A) Commitment Tracker reports
                  pledges in support of ACT-A Pillar budgets and co-convening
                  agencies for COVID-19 response. The ACT-A Commitment Tracker
                  defines cumulative amounts committed by donor, recipient, and
                  Pillar for ACT-A financial requirements each budget year. The
                  ACT-A Commitment does not track disbursements. Additional
                  information about commitments made is available online at{" "}
                  <ExtLink
                    breakwords
                    url={
                      "https://www.who.int/publications/m/item/access-to-covid-19-tools-tracker"
                    }
                  />
                  .
                </p>
              </td>
            </tr>
            <tr>
              <td>
                <p>WHO Contingency Fund for Emergencies</p>
              </td>
              <td>
                <p>
                  The WHO Contingency Fund for Emergencies (CFE) was established
                  by the World Health Assembly in 2015 as a means to respond
                  quickly and effectively to disease outbreaks and humanitarian
                  crises. Information about commitments made to the CFE in 2020
                  is available online at{" "}
                  <ExtLink
                    breakwords
                    url={"https://apps.who.int/iris/handle/10665/342236"}
                  />
                  . Additional data on contributions to and allocations from the
                  fund from 2015 to present are found online at{" "}
                  <ExtLink
                    breakwords
                    url={
                      "https://www.who.int/emergencies/funding/" +
                      "contingency-fund-for-emergencies/" +
                      "contributions-and-allocations"
                    }
                  />
                  .
                </p>
              </td>
            </tr>
            <tr>
              <td>
                <p>World Bank Ebola Financing Research Brief</p>
              </td>
              <td>
                <p>
                  The World Bank Ebola Financing Research Brief provides
                  information about World Bank contributions for the current and
                  past Ebola outbreaks and overall pandemic preparedness.
                </p>
              </td>
            </tr>
            {/* All sources below this point should be added manually rather 
            than from copy/pasting the Airtable view. */}
            <tr>
              <td>Philanthropic databases and press releases</td>
              <td>
                Data from multiple philanthropic databases, and press releases
                are incorporated into GHS Tracking, including data from the Open
                Philanthropy Grant Database available at{" "}
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://www.openphilanthropy.org/giving/grants"
                >
                  https://www.openphilanthropy.org/giving/grants
                </a>
                .
              </td>
            </tr>
            <tr>
              <td>Private sector websites and press releases</td>
              <td>
                Data from multiple private sector websites and press releases
                are incorporated into GHS Tracking.
              </td>
            </tr>
            <tr>
              <td>Additional media statements</td>
              <td>
                Data from multiple media statements, including social media, are
                incorporated into GHS Tracking.
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
              <td>JEE mission report and executive summary data</td>
              <td>
                The Joint External Evaluation tool (JEE) measures
                country-specific progress in developing the capacities needed to
                prevent, detect, and respond to public health threats. Publicly
                available mission reports and executive summaries describing
                these evaluations are available at{" "}
                <ExtLink url={"https://extranet.who.int/sph/jee"} />.
              </td>
            </tr>
            <tr>
              <td>Data from donor countries</td>
              <td>
                In addition to the above data sources, we also receive data
                directly from donor countries.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default DataSources
