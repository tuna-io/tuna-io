import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './modules/App'
import About from './modules/About'
import Repos from './modules/Repos'
import Signin from './modules/Signin'
import Dashboard from './modules/Dashboard'
import Settings from './modules/Settings'
import Upload from './modules/Upload'
import { Router, Route, hashHistory } from 'react-router'

ReactDOM.render((
  <Router history={hashHistory}>
    <Route path="/" component={App} > 

      <Route path="/about" component={About} />
      <Route path="/repos" component={Repos} />
      <Route path="/signin" component={Signin} />
      <Route path="/dashboard" component={Dashboard} >
        <Route path="/dashboard/settings" component={Settings} />
        <Route path="/dashboard/upload" component={Upload} />
      </Route>
    </Route>
  </Router>
  ), document.getElementById('root'))
