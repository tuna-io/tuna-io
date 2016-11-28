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
import '../node_modules/react-dropzone-component/styles/filepicker.css';
import '../node_modules/dropzone/dist/min/dropzone.min.css';
import '../node_modules/videojs-overlay/dist/videojs-overlay.css';

const routes = {
  path: '/',
  component: App,
  childRoutes: [
    { path: 'about', component: About },
    { path: 'repos', component: Repos },
    { path: 'register', component: Register },
    { path: 'signin', component: Signin },
    { path: 'dashboard', component: Dashboard,
      childRoutes: [
        { path: 'settings', component: Settings },
        { path: 'upload', component: Upload }
      ]
    },
    { path: 'videos/:videoId', component: VideoDetails }
  ]
}

ReactDOM.render((
  <Router 
    routes={routes}
    history={browserHistory}
  />), document.getElementById('root'));

if(module.hot) {
  module.hot.accept();
}
