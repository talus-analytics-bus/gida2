import React from 'react'
import { Route, Switch, BrowserRouter } from 'react-router-dom'
import axios from 'axios'
import Modal from 'reactjs-popup'
import classNames from 'classnames';
import * as d3 from 'd3/dist/d3.min';
import ReactTooltip from 'react-tooltip';
import BrowserDetection from 'react-browser-detection';

// layout
import Nav from './components/layout/nav/Nav.js'
import Footer from './components/layout/footer/Footer.js'

// map
import Map from './components/map/Map'
import Util from './components/misc/Util.js'

// views
import Details from './components/views/details/Details.js'
import Global from './components/views/global/Global.js'
import About from './components/views/about/About.js'

// styles
import styles from './App.module.scss'
import './components/views/details/details.module.scss'
import infoTooltipStyles from './components/misc/infotooltip.module.scss';
import 'material-design-icons/iconfont/material-icons.css'

// queries
import ObservationQuery from './components/misc/ObservationQuery.js'
import PlaceQuery from './components/misc/PlaceQuery.js'
import TrendQuery from './components/misc/TrendQuery.js'

// charts
import MiniLine from './components/views/global/content/MiniLine.js'
import Scatter from './components/views/global/content/Scatter.js'
import PagingBar from './components/views/global/content/PagingBar.js'

//: React.FC
const App = () => {

  // Track whether the component is still loading.
  const [loading, setLoading] = React.useState(true)

  async function getAppData() {
    setLoading(false);
  }

  // JSX for main app.
  return (
    <div>
      <BrowserRouter>
        <Nav />
        <Switch>
          <div>
            <Route exact path='/' component={ () => { return <div>Hello, world!</div>; } } />
          </div>
        </Switch>
      </BrowserRouter>
    </div>
  )
}

export default App
