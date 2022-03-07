import React from "react"
import { Helmet } from "react-helmet"
import styles from "./about.module.scss"
import classNames from "classnames"
import { Button } from "../../common"
import Util from "../../misc/Util.js"
import axios from "axios"

// JSX for about page.
const Submit = ({ setLoadingSpinnerOn }) => {
  const [uploadBody, setUploadBody] = React.useState(undefined)
  const [fileName, setFileName] = React.useState("No file selected")
  const [status, setStatus] = React.useState(undefined)

  // Scroll to top of window after loading.
  React.useEffect(() => window.scrollTo(0, 0), [])
  React.useEffect(() => {
    if (uploadBody !== undefined) {
      const el = document.getElementById("upload")
      if (el) el.click()
    }
  }, [uploadBody])

  const upload = () => {
    const els = document.getElementsByClassName("form-control")
    const newUploadBody = []
    for (let elIdx = 0; elIdx < els.length; elIdx++) {
      const el = els[elIdx]
      newUploadBody.push(
        <div>
          <input name={el.name} id={el.name} value={el.value} />
        </div>,
      )
    }
    setUploadBody(newUploadBody)
  }

  return (
    <div className={classNames(styles.about, "pageContainer")}>
      <Helmet titleTemplate={"%s | Global Health Security Tracking"}>
        <title>About: Submit data</title>
      </Helmet>
      <div className={styles.aboutContainer}>
        <div className={styles.header}>
          <div className={styles.title}>Submit data</div>
        </div>
        <div className={styles.description}>
          <div class="section">
            <div class="description">
              <p>
                Project data may be submitted using the form below. An empty
                form may be downloaded by clicking "Download data reporting
                template". Using the structure of the data reporting template,
                please update the file with relevant, project-level information.
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
                        className={classNames(
                          "glyphicon glyphicon-download-alt",
                        )}
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
                Once the file is ready, please fill out the contact information
                in the fields provided below and upload the completed data
                reporting template by clicking "Upload Completed Data Reporting
                Template" and selecting the location where the file is saved on
                your computer. Contact information is collected only if
                follow-up questions are needed.
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
                    const el = document.getElementById("file")
                    if (el) el.click()
                  }}
                />
                <input
                  style={{ display: "none" }}
                  id="input-report-upload"
                  class="input-report-upload"
                  type="file"
                />
                <div class="file-name-text">{fileName}</div>
              </div>
              <Button
                label={"Submit data"}
                type={"primary"}
                callback={() => {
                  upload()
                }}
              />
              {status}
              {
                <form
                  onSubmit={(e, i) => {
                    e.preventDefault()
                    const el = document.getElementById("form")
                    var formData = new FormData()
                    var imagefile = el.elements.file
                    if (imagefile.files.length === 0) {
                      alert("Please upload completed data reporting template.")
                      return
                    }
                    formData.append("file", imagefile.files[0])
                    const fields = ["first_name", "last_name", "org", "email"]
                    let stop = false
                    fields.forEach(field => {
                      if (stop) return
                      if (el.elements[field].value === "") {
                        alert("Please populate all fields before submitting.")
                        stop = true
                        return
                      }
                      formData.append(field, el.elements[field].value)
                    })
                    setLoadingSpinnerOn(true)
                    axios
                      .post(el.action, formData, {
                        headers: {
                          "Content-Type": "multipart/form-data",
                        },
                      })
                      .then(res => {
                        setLoadingSpinnerOn(false)
                        if (res.status === 200) {
                          setStatus(
                            <div className={styles.success}>
                              Thank you. Your data was submitted and will be
                              reviewed.
                            </div>,
                          )
                          // Remove all form values
                          const inputEls = document.getElementsByTagName(
                            "input",
                          )
                          for (let i = 0; i < inputEls.length; i++) {
                            inputEls[i].value = ""
                            setFileName("No file selected")
                          }
                        } else {
                          setStatus(
                            <div className={styles.error}>
                              Error: Please try submitting again. If issues
                              persist, please contact{" "}
                              <a
                                target="_blank"
                                href="mailto:info@talusanalytics.com"
                              >
                                info@talusanalytics.com
                              </a>{" "}
                              for assistance.
                            </div>,
                          )
                        }
                      })
                  }}
                  action={Util.API_URL + "/upload_file"}
                  method="POST"
                  enctype="multipart/form-data"
                  id={"form"}
                >
                  <input
                    id="file"
                    type="file"
                    name="file"
                    onChange={v => {
                      if (
                        v.target.files !== undefined &&
                        v.target.files[0] !== undefined
                      ) {
                        const fn = v.target.files[0].name
                        if (!fn.includes(".xlsx") && !fn.includes(".csv")) {
                          alert(
                            "Please upload a file with extension .XLSX or .CSV",
                          )
                          v.target.value = ""
                          setFileName("No file selected")
                        } else {
                          setFileName(v.target.files[0].name)
                        }
                      }
                    }}
                  />
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
    </div>
  )
}

export default Submit
