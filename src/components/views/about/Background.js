import React from "react";
import styles from "./about.module.scss";
import classNames from "classnames";

// JSX for about page.
const Background = ({ ...props }) => {
  // Scroll to top of window afer loading.
  React.useEffect(() => window.scrollTo(0, 0), []);
  props.setLoadingSpinnerOn(false);

  return (
    <div className={classNames(styles.about, "pageContainer")}>
      <div className={styles.aboutContainer}>
        <div className={styles.header}>
          <div className={styles.title}>Background</div>
        </div>
        <div className={styles.description}>
          <p>
            Addressing global health security requires understanding the
            intersection between biological outbreak, policy, politics,
            economics, law enforcement, and emergency. Ensuring adequate
            financing for nations, regions and international systems to prevent,
            detect and respond to biological threats initiatives is critical for
            the advancement of global health security, and requires awareness of
            the current status of funding. To identify funding requirements,
            develop a compelling case for investment, assess effectiveness of
            aid, and prioritize future funding decisions, it is necessary to
            understand who is funding what, and where, in the broad context of
            global health security.
          </p>
          <p>
            The Georgetown Infectious Disease Atlas (GIDA) Global Health
            Security Tracking site was developed to provide a shared resource to
            map the flow of committed and disbursed funds for global health
            security. GIDA Global Health Security Tracking allows both funders
            and recipients to identify gaps and prioritize future investments,
            and helps to highlight the ways in which funds can be allocated most
            effectively to have the greatest impact. This platform and effort
            will serve as the basis for mutual accountability within the global
            health security community, promoting public accounting, and
            providing an opportunity for countries, organizations, and other
            funders to showcase their successes and identify priorities for
            future investments. A paper describing this dashboard project is
            available&nbsp;
            <a
              target="_blank"
              href="https://link.springer.com/article/10.1007%2Fs10393-019-01402-w"
            >
              here
            </a>
            .
          </p>
          <p>
            GIDA Global Health Security Tracking was created by the Georgetown
            University Center for Global Health Science and Security in
            partnership with Talus Analytics. This project was funded by a grant
            to Georgetown University by the Open Philanthropy Project.&nbsp;
          </p>
          <p>
            We welcome user questions and comments. We also invite you to share
            any research conducted using GIDA Global Health Security Tracking,
            so we can link to it from the dashboard.
          </p>
          <p>
            Please submit comments or any other inquires by email at&nbsp;
            <a target="_blank" href="mailto:outbreaks@georgetown.edu">
              outbreaks@georgetown.edu
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default Background;
