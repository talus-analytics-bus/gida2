import classNames from "classnames"
import React from "react"
import { Link } from "react-router-dom"
import { Button } from "../../common"
import styles from "./NotFound404.module.scss"

export const NotFound404 = () => {
  return (
    <div className={classNames(styles.notFound, "pageContainer")}>
      <h1>Page not found</h1>
      <h4>Error 404</h4>
      <Button type={"primary"} label={"Return to home"} url={"/"} />
    </div>
  )
}

export default NotFound404
