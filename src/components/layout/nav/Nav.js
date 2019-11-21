import React from 'react'
import classNames from 'classnames'
import { Link } from 'react-router-dom'
import styles from './nav.module.scss'
import Util from '../../../components/misc/Util.js'
import Search from './Search.js'
import logo from '../../../assets/images/measles_tracker.svg'
import iconPin from '../../../assets/images/pin.svg'
import iconFlag from '../../../assets/images/flag.svg'
import iconGlobe from '../../../assets/images/globe.svg'
import iconPage from '../../../assets/images/page.svg'
import ReactTooltip from 'react-tooltip'

const Nav = (props) => {
  const page = props.page;

  return (
    <div className={classNames(styles.nav, {[styles.loading]: props.loadingNav }, styles[page])}>

    </div>
  )
}

export default Nav
