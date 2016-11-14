import React from 'react'
import { Link } from 'react-router'

export default React.createClass({
  render() {
    return (
      <div>This is the nav bar. Links should show up
        <ul>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/signin">Sign in</Link></li>
          <li><Link to="/dashboard">Dashboard</Link></li>
        </ul>
      </div>
      )
  }
})