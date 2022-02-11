import React from "react"
import styles from "./about.module.scss"
import classNames from "classnames"

// JSX for about page.
const Background = ({ ...props }) => {
  // Scroll to top of window afer loading.
  React.useEffect(() => window.scrollTo(0, 0), [])
  props.setLoadingSpinnerOn(false)

  const techAppLink = (
    <a href="/export/GHS Tracking Technical Appendix - July 2021.pdf">
      Technical Appendix
    </a>
  )

  return (
    <div className={classNames(styles.about, "pageContainer")}>
      <div className={styles.aboutContainer}>
        <div className={styles.header}>
          <div className={styles.accessibility}>
            <p>
              If you have any accessibility issues using this site, please
              contact us directly at{" "}
              <a href="mailto:accessibility@talusanalytics.com">
                accessibility@talusanalytics.com
              </a>
              .
            </p>
          </div>

          <div className={styles.title}>Background and methods</div>
          <div className={styles.description}>
            <p>
              The following sections provide the background of GHS Tracking and
              an overview of the methods used to integrate and display data. For
              additional information and details, please refer to the{" "}
              {techAppLink}.
            </p>
          </div>
        </div>
        <div className={styles.description}>
          <h3>Background</h3>
          <p>
            Addressing global health security requires understanding the
            intersection between biological outbreaks, policy, politics,
            economics, law enforcement, and emergency preparedness and response.
            Ensuring adequate financing for nations, regions and international
            systems to prevent, detect, and respond to biological threats is
            critical for the advancement of global health security, and requires
            awareness of the current status of funding. To identify funding
            requirements, develop a compelling case for investment, assess
            effectiveness of aid, and prioritize future funding decisions, it is
            necessary to understand who is funding what, and where, in the broad
            context of global health security.
          </p>
          <p>
            The Georgetown Global Health Security Tracking site was developed to
            provide a shared resource to map the flow of committed and disbursed
            funds for global health security. Global Health Security Tracking
            (GHS Tracking) allows both funders and recipients to identify gaps
            and prioritize future investments, and helps to highlight the ways
            in which funds can be allocated most effectively to have the
            greatest impact. This platform and effort will serve as the basis
            for mutual accountability within the global health security
            community, promoting public accounting, and providing an opportunity
            for countries, organizations, and other funders to showcase their
            successes and identify priorities for future investments. A paper
            describing this dashboard project is available{" "}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://link.springer.com/article/10.1007%2Fs10393-019-01402-w"
            >
              here
            </a>
            .
          </p>
          <p>
            Global Health Security Tracking was created by the Georgetown
            University Center for Global Health Science and Security in
            partnership with Talus Analytics. This project was funded by a grant
            to Georgetown University by the Open Philanthropy Project.
          </p>
          <p>
            We welcome user questions and comments. We also invite you to share
            any research conducted using Global Health Security Tracking, so we
            can link to it from the dashboard.
          </p>
          <h3>Methods overview</h3>
          <p>
            A brief description of the data in the Global Health Security (GHS)
            Tracking site and the methods used to identify and incorporate data
            follow. For additional information and details, please refer to the{" "}
            {techAppLink}.
          </p>
          <h4>Data structure: Projects and transactions</h4>
          <p>
            In the GHS Tracking site, funding and in-kind support data are
            represented as projects with one or more transactions. Projects
            reflect discrete efforts and initiatives and these often include a
            series of activities at the transaction level (e.g., different
            amounts of funding to one or more recipients). Projects have titles
            and descriptions that provide information about the effort&rsquo;s
            goals, while transactions define the amount of funding, the year it
            was provided, the funders, and the recipients. Financial
            transactions have a value (shown in the site as nominal United
            States dollars, i.e., not adjusted for inflation), whereas in-kind
            support transactions do not.
          </p>
          <h4>Funders and recipients (stakeholders)</h4>
          <p>
            Transactions occur between one or more funders and recipients,
            collectively called stakeholders. Stakeholders may be country
            governments (e.g., &ldquo;United States&rdquo;), specific government
            agencies (e.g., &ldquo;United States Agency for International
            Development (USAID)&rdquo;), or a range of non-governmental entities
            such as foundations, academic institutions, and non-governmental
            organizations (NGOs).
          </p>
          <p>
            If a government agency plays a role in a transaction, it is
            represented as the parent country in any data summaries displayed on
            the GHS Tracking site. For example, all USAID transactions are
            displayed on the United States page, and they figure in the United
            States&rsquo; subtotals wherever funding data are aggregated by
            country.
          </p>
          <h4>Data sources</h4>
          <p>
            Data for projects and transactions are collected from sources
            ranging from media reports (often the first reports of funding) to
            data submitted regularly by governments to online registries. Since
            data may be contained or reported in multiple sources from which GHS
            Tracking captures data, data obtained from different sources are
            deconflicted to avoid duplication. For example, early media reports
            announcing the start of a project may later be superseded by more
            official or detailed data about that project available after
            completion or a funder may publish reports on their website and
            submit data to external repositories and just the most recent,
            complete, or detailed source is used to capture data in GHS
            Tracking.
          </p>
          <h4>Capacity-building and event response data</h4>
          <p>
            The two main categories of funding data provided in GHS Tracking are
            (1) capacity-building data and (2) event response data (these two
            categories are also used for in-kind support). Capacity-building
            funding and support is tagged with Core Capacities, or domains
            identified and described in the{" "}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://www.paho.org/en/documents/international-health-regulations-2005-third-edition"
            >
              2005 International Health Regulations (IHR)
            </a>{" "}
            as key components of building capacity to prevent, detect, and
            respond to public health events. Additionally, GHS Tracking contains
            data for funding, and select in-kind support, provided in direct
            response to specific public health events, which currently includes
            data for those events declared Public Health Emergencies of
            International Concern (PHEICs) by the WHO under the mechanisms of
            the IHR. Note that GHS Tracking does not include national-level
            funds invested through country budgets to build capacity in their
            own country.
          </p>
          <p>
            Transactions are tagged with Core Capacities and events using a
            manual review process performed by the research team, except for
            data sourced from the International Aid Transparency Initiative
            (IATI) Registry which, due to the high volume of data, are tagged
            using an automated text matching algorithm with accompanying methods
            for manual review and recoding, as needed.
          </p>
          <p>
            More information about GHS Tracking and details on methods are
            available in the {techAppLink}.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Background
