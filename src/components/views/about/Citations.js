import React from "react"
import styles from "./about.module.scss"
import classNames from "classnames"

// JSX for about page.
const Citations = () => {
  // Scroll to top of window afer loading.
  React.useEffect(() => window.scrollTo(0, 0), [])
  return (
    <div className={classNames(styles.about, "pageContainer")}>
      <div className={styles.aboutContainer}>
        <div className={styles.header}>
          <div className={styles.title}>Citations and data use</div>
        </div>
        <div className={styles.description}>
          <p>
            A peer-reviewed paper describing this dashboard project is available{" "}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://link.springer.com/article/10.1007%2Fs10393-019-01402-w"
            >
              here
            </a>
            , with the following suggested citation:
          </p>
          <p className={styles.citation}>
            Katz, R; Graeden, E; Kerr, J; Eaneff, S. “Tracking the Flow of Funds
            in Global Health Security.” EcoHealth (2019) 16:298-305.
          </p>
          <p>
            The Georgetown University Center for Global Health Science and
            Security, working with Talus Analytics, has created and maintains
            this site for use by researchers, decision-makers and other
            interested parties. We encourage you to use the data from this site.
            If you do, though, please use the following citation:{" "}
          </p>
          <p className={styles.citation}>
            Georgetown University Center for Global Health Science & Security.
            Global Health Security Tracking. Washington, DC: Georgetown
            University. Available at https://tracking.ghscosting.org/
          </p>
          <p>
            We ask that you let us know if you publish anything using data from
            this site, so we can link to it. Contact us at{" "}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="mailto:outbreaks@georgetown.edu"
            >
              outbreaks@georgetown.edu
            </a>
            .
          </p>
          <p>
            These tools and underlying datasets are available for use under the
            Creative Commons Attribution By License agreement (
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://creativecommons.org/licenses/by/4.0/"
            >
              https://creativecommons.org/licenses/by/4.0/
            </a>
            ), with appropriate reference and acknowledgement of the original
            research team.
          </p>
          <p>
            In addition to direct downloads from the sites, we are happy to work
            with your team to provide automated access via API or other data
            sharing method. Please contact us at{" "}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="mailto:outbreaks@georgetown.edu"
            >
              outbreaks@georgetown.edu
            </a>{" "}
            for more information.
          </p>
          <table>
            <tbody>
              <tr>
                <td>Research effort</td>
                <td>Reference</td>
              </tr>

              <tr>
                <td>
                  Global Health Center report on Financing National Preparedness
                  for Outbreaks
                </td>
                <td>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://repository.graduateinstitute.ch/record/296613/files/wp_0018_v3.pdf"
                  >
                    Moon, S; and Vaidya, R. &ldquo;Investing for a Rainy Day:
                    Challenges in Financing National Preparedness for
                    Outbreaks.&rdquo;{" "}
                    <em>Global Health Centre Working Paper No. 18</em>, 2018.
                  </a>
                </td>
              </tr>
              <tr>
                <td>
                  Georgetown Center for Global Health Science and Security and
                  Talus Analytics report on JEE 2.0 implementation
                </td>
                <td>
                  <a target="_blank" href="export/Eaneff et al. JEE 2.0.pdf">
                    Eaneff, S; Graeden, E; Katz, R. &ldquo;Capacity building
                    under the International Health Regulations (2005):
                    Ramifications of new implementation requirements in second
                    edition Joint External Evaluation&rdquo;, 2019.
                  </a>
                </td>
              </tr>
              <tr>
                <td>
                  University of Oxford report commissioned by the Global
                  Preparedness Monitoring Board
                </td>
                <td>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://www.tropicalmedicine.ox.ac.uk/news/the-global-preparedness-monitoring-board-publish-their-annual-report"
                  >
                    University of Oxford, Oxford UK. &ldquo;The state of
                    governance and coordination for health emergency
                    preparedness and response&rdquo;{" "}
                    <em>
                      {" "}
                      Background report commissioned by the Global Preparedness
                      Monitoring Board
                    </em>
                    , 2019.
                  </a>
                </td>
              </tr>
              <tr>
                <td>
                  Analysis of funding for the Ebola epidemic and Zika outbreak
                  between 2014 and 2019
                </td>
                <td>
                  <a
                    href={"https://gh.bmj.com/content/6/4/e003923"}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Quirk, EJ; Gheorghe, A; Hauck, K. "A systematic examination
                    of international funding flows for Ebola virus and Zika
                    virus outbreaks 2014–2019: donors, recipients and funding
                    purposes." <em>BMJ Global Health, 6</em>(4), e003923, 2021.
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Citations
