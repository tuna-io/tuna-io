import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, browserHistory, IndexRoute } from 'react-router';
import App from './modules/App';
import About from './modules/About';
import Repos from './modules/Repos';
import Register from './modules/Register';
import Signin from './modules/Signin';
import Dashboard from './modules/Dashboard';
import Settings from './modules/Settings';
import Upload from './modules/Upload';
import VideoDetails from './modules/VideoDetails';
import Home from './modules/Home';
import './index.css';
import './flexgrid.css';

ReactDOM.render((
  <Router history={browserHistory}>
    <Route path="/" component={App} >
      <IndexRoute component={Home} />
      <Route path="about" component={About} />
      <Route path="repos" component={Repos} />
      <Route path="register" component={Register} />
      <Route path="signin" component={Signin} />
      <Route path="dashboard" component={Dashboard} >
        <Route path="settings" component={Settings} />
        <Route path="upload" component={Upload} />
      </Route>
      <Route path="/videos/:videoId" component={VideoDetails} />
    </Route>
  </Router>
), document.getElementById('root'));
