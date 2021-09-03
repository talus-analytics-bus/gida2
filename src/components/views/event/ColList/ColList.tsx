// 3rd party libs
import React, { useState, FC } from "react"
import { Link } from "react-router-dom"

// styles
import styles from "./collist.module.scss"

// utility
import { comma } from "../../../misc/Util"

// local components
import { Loading } from "../../../common"
import { ReactElement } from "react-router/node_modules/@types/react"

interface ColListProps {
  items: object[]
  max: number
  isGlobal: boolean
}

const ColList: FC<ColListProps> = ({
  items = [],
  max = 10,
  isGlobal = false,
}): ReactElement => {
  // STATE //
  const [viewAll, setViewAll] = useState(
    items.length !== 0 && items.length <= max + 1,
  )

  // FUNCTIONS //
  const getListItemJsx = (d: any) => {
    if (d.label === undefined) return null
    if (d.url !== undefined && !isGlobal) {
      return (
        <span>
          <Link to={d.url}>{d.label}</Link>
        </span>
      )
    } else return <span>{d.label}</span>
  }

  const getCountryCount = () => {
    if (isGlobal) return null
    else if (items.length === 0) return null
    else if (viewAll) {
      return comma(items.length)
    } else if (items.length > max + 1) {
      return <span className={styles.topTenLabel}>top 10 by total cases</span>
    } else return comma(items.length)
  }

  // CONSTANTS //
  const toggle = (
    <button className={styles.toggle} onClick={() => setViewAll(!viewAll)}>
      View {viewAll ? "fewer" : "all " + comma(items.length)}
    </button>
  )

  const nItems = viewAll ? items.length : max + 1
  const list1 = items.slice(0, Math.ceil(nItems / 2)).map(d => {
    return getListItemJsx(d)
  })
  const list2 = items.slice(Math.ceil(nItems / 2), nItems).map(d => {
    return getListItemJsx(d)
  })

  const list = (
    <div className={styles.items}>
      <div className={styles.itemCol}>{list1}</div>
      <div className={styles.itemCol}>{list2}</div>
      {items.length > max + 1 && toggle}
    </div>
  )

  const countryCount = !isGlobal && items.length > 0 && (
    <>({getCountryCount()})</>
  )

  // const tooltip = isGlobal && <InfoTooltip text={"Test"} />

  // JSX //
  return (
    <div className={styles.colList}>
      <div className={styles.title}>Affected countries {countryCount}</div>
      <Loading loaded={items.length > 0}>{list}</Loading>
    </div>
  )
}
export default ColList
