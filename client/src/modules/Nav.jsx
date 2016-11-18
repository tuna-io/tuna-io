import React from 'react';
import { Link } from 'react-router';

export default React.createClass({
  logout() {
    fetch('http://127.0.0.1:3000/api/users/logout', {
      method: 'GET',
      credentials: 'same-origin',
    });
  },

  render() {
    return (
      <div>This is the nav bar. Links should show up
        <ul>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/signin">Sign in</Link></li>
          <li><Link to="/register">Register</Link></li>
          <li><Link to="/dashboard">Dashboard</Link></li>
          <li onClick={this.logout}>Logout</li>
        </ul>
      </div>
      )
  }
});
