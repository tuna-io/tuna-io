import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, hashHistory } from 'react-router';
import './index.css';
import App from './modules/App';
import About from './modules/About';
import Signin from './modules/Signin';
import Dashboard from './modules/Dashboard';
import Settings from './modules/Settings';
import Upload from './modules/Upload';
import VideoDetails from './modules/VideoDetails'

ReactDOM.render((
  <Router history={hashHistory}>
    <Route path="/" component={App} >

      <Route path="/about" component={About} />
      <Route path="/signin" component={Signin} />
      <Route path="/dashboard" component={Dashboard} >
        <Route path="/dashboard/settings" component={Settings} />
        <Route path="/dashboard/upload" component={Upload} />
      </Route>
      <Route path="/videos/:videoId" component={VideoDetails} />
    </Route>
  </Router>
  ), document.getElementById('root'));
