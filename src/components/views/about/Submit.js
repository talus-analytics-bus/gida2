import React from "react";
import styles from "./about.module.scss";
import classNames from "classnames";
import Button from "../../common/Button/Button.js";

// JSX for about page.
const Submit = () => {
  // Scroll to top of window afer loading.
  React.useEffect(() => window.scrollTo(0, 0), []);
  return (
    <div className={classNames(styles.about, "pageContainer")}>
      <div className={styles.title}>Submit data</div>
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
              <Button
                callback={() =>
                  (window.location.href =
                    "/export/GIDA - Data Reporting Template.xlsx")
                }
                label={
                  <span>
                    <span
                      className={classNames("glyphicon glyphicon-download-alt")}
                    />
                    Download data reporting template
                  </span>
                }
                type={"primary"}
              />
            </div>
          </div>
        </div>
        <hr />
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
              <Button
                className={"btn-report-upload"}
                label={"Upload completed data reporting template"}
                type={"secondary"}
                callback={() => {
                  document.getElementById("input-report-upload").click();
                }}
              />
              <input
                style={{ display: "none" }}
                id="input-report-upload"
                class="input-report-upload"
                type="file"
              />
              <div class="file-name-text">No file selected</div>
            </div>
            <Button
              label={"Submit data"}
              type={"primary"}
              callback={() => {
                alert("Feature not yet implemented");
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Submit;
