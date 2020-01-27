import React from "react";
import styles from "./about.module.scss";
import classNames from "classnames";
import Button from "../../common/Button/Button.js";
import Util from "../../misc/Util.js";
import axios from "axios";

// JSX for about page.
const Submit = () => {
  const [uploadBody, setUploadBody] = React.useState(undefined);

  // Scroll to top of window after loading.
  React.useEffect(() => window.scrollTo(0, 0), []);
  // React.useEffect(() => {
  //   if (uploadBody !== undefined) {
  //     const el = document.getElementById("upload");
  //     if (el) el.click();
  //   }
  // }, [uploadBody]);

  const upload = () => {
    const els = document.getElementsByClassName("form-control");
    console.log(els);
    const newUploadBody = [];
    for (let elIdx = 0; elIdx < els.length; elIdx++) {
      const el = els[elIdx];
      console.log(el);
      newUploadBody.push(
        <div>
          <input name={el.name} id={el.name} value={el.value} />
        </div>
      );
    }
    setUploadBody(newUploadBody);
  };

  return (
    <div className={classNames(styles.about, "pageContainer")}>
      <div className={styles.header}>
        <div className={styles.title}>Submit data</div>
      </div>
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
                    <input
                      name="first_name"
                      class="first-name-input form-control"
                    />
                  </td>
                </tr>
                <tr>
                  <td>Last name</td>
                  <td>
                    <input
                      name="last_name"
                      class="last-name-input form-control"
                    />
                  </td>
                </tr>
                <tr>
                  <td>Organization</td>
                  <td>
                    <input name="org" class="org-input form-control" />
                  </td>
                </tr>
                <tr>
                  <td>Email address</td>
                  <td>
                    <input name="email" class="email-input form-control" />
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
                  // document.getElementById("input-report-upload").click();
                  upload();
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
                const el = document.getElementById("upload");
                if (el) el.click();
                // alert("Feature not yet implemented");
              }}
            />
            {
              <form
                onSubmit={(e, i) => {
                  e.preventDefault();
                  var formData = new FormData();
                  var imagefile = e.target.elements.file;
                  formData.append("file", imagefile.files[0]);
                  const fields = ["first_name", "last_name", "org", "email"];
                  fields.forEach(field =>
                    formData.append(field, e.target.elements[field].value)
                  );
                  axios
                    .post(e.target.action, formData, {
                      headers: {
                        "Content-Type": "multipart/form-data"
                      }
                    })
                    .then(d => console.log(d));
                }}
                action={Util.API_URL + "/upload_file"}
                method="POST"
                enctype="multipart/form-data"
              >
                <input type="file" name="file" />
                <input
                  type="hidden"
                  name="redirect"
                  value="/about/background"
                />
                {uploadBody}
                <div>
                  <input type="submit" id={"upload"} />
                </div>
              </form>
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default Submit;
