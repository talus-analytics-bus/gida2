import React from "react";
import styles from "./about.module.scss";
import classNames from "classnames";

// JSX for about page.
const Research = () => {
  // Scroll to top of window afer loading.
  React.useEffect(() => window.scrollTo(0, 0), []);
  return (
    <div className={classNames(styles.about, "pageContainer")}>
      <div className={styles.title}>Research</div>
      <div className={styles.description}>
        <p>
          A peer-reviewed paper describing this dashboard project is available{" "}
          <a
            target="_blank"
            href="https://link.springer.com/article/10.1007%2Fs10393-019-01402-w"
          >
            here
          </a>
          .
        </p>
        <p>
          Suggested citation: Katz, R; Graeden, E; Kerr, J; Eaneff, S.
          &ldquo;Tracking the Flow of Funds in Global Health Security.&rdquo;
          <em> EcoHealth</em> (2019) 16:298-305.
        </p>
        <p>
          We invite you to share any research conducted using GIDA, so we can
          link to it from the dashboard. Please contact us by email at{" "}
          <a target="_blank" href="mailto:ihrcosting@georgetown.edu">
            ihrcosting@georgetown.edu
          </a>
          .
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
                  Eaneff, S; Graeden, E; Katz, R. &ldquo;Capacity building under
                  the International Health Regulations (2005): Ramifications of
                  new implementation requirements in second edition Joint
                  External Evaluation&rdquo;, 2019.
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
                  href="https://www.tropicalmedicine.ox.ac.uk/news/the-global-preparedness-monitoring-board-publish-their-annual-report"
                >
                  University of Oxford, Oxford UK. &ldquo;The state of
                  governance and coordination for health emergency preparedness
                  and response&rdquo;{" "}
                  <em>
                    {" "}
                    Background report commissioned by the Global Preparedness
                    Monitoring Board
                  </em>
                  , 2019.
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Research;
