import React from 'react';
import { Link } from 'react-router';

export default React.createClass({
  logout() {
    fetch('http://localhost:3000/api/users/logout', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
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
