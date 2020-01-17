import React from "react";
import styles from "./about.module.scss";

// JSX for about page.
const Submit = () => {
  // Scroll to top of window afer loading.
  React.useEffect(() => window.scrollTo(0, 0), []);
  return (
    <div className={styles.about}>
      <div className={styles.title}>Data sources</div>
      <div className={styles.description}>
        <div class="section">
          <div class="description">
            <p>
              Project data may be submitted using the form below. An empty form
              may be downloaded by clicking "Download data reporting template".
              Using the structure of the data reporting template, please update
              the file with relevant, project-level information.
            </p>
          </div>
          <div class="upload-button-container">
            <div>
              <button
                type="button"
                class="btn btn-default btn-report-download"
                onClick={() =>
                  (window.location.href =
                    "/export/GIDA - Data Reporting Template.xlsx")
                }
              >
                Download data reporting template
              </button>
            </div>
          </div>
        </div>
        <div class="section">
          <div class="description">
            <p>
              Once the file is ready, please fill out the contact information in
              the fields provided below and upload the completed data reporting
              template by clicking "Upload Completed Data Reporting Template"
              and selecting the location where the file is saved on your
              computer. Contact information is collected only if follow-up
              questions are needed.
            </p>
            <p>
              Data will be reviewed before being incorporated into the tool.
            </p>
          </div>
          <div class="submit-form-container">
            <table className={styles.submitForm}>
              <tbody>
                <tr>
                  <td>First name</td>
                  <td>
                    <input class="first-name-input form-control" />
                  </td>
                </tr>
                <tr>
                  <td>Last name</td>
                  <td>
                    <input class="last-name-input form-control" />
                  </td>
                </tr>
                <tr>
                  <td>Organization</td>
                  <td>
                    <input class="org-input form-control" />
                  </td>
                </tr>
                <tr>
                  <td>Email address</td>
                  <td>
                    <input class="email-input form-control" />
                  </td>
                </tr>
              </tbody>
            </table>
            <div>
              <button type="button" class="btn-report-upload">
                Upload completed data reporting template
              </button>
              <input
                id="input-report-upload"
                class="input-report-upload"
                type="file"
              />
              <div class="file-name-text">No file selected</div>
            </div>
            <div>
              <button type="button" class="submit-button">
                Submit data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Submit;
