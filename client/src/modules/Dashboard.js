import React from 'react'
import Overview from './Overview'
import { Link } from 'react-router'

export default React.createClass({
  render() {
    return (
      <div>This is the dashboard page component
        <div>These are links items on the settings page</div>
        <ul>
          <li><Link to="/dashboard/settings">Settings</Link></li>
          <li><Link to="/dashboard/upload">Upload</Link></li>

          { this.props.children || <Overview />}

        </ul>
      </div>
      )
  }
})