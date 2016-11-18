import React from 'react';
import { Link } from 'react-router';

export default React.createClass({
  logout() {
    fetch('http://127.0.0.1:3000/api/users/logout', {
      method: 'GET',
      credentials: 'same-origin',
    });
  },

export default class Nav extends React.Component {
  render() {
    return (
      <div className="nav-bar">
        <div><Link to="/">Home</Link></div>
        <div><Link to="/about">About</Link></div>
        <div><Link to="/signin">Sign in</Link></div>
        <div><Link to="/register">Register</Link></div>
        <div><Link to="/dashboard">Dashboard</Link></div>
        <div onClick={this.logout}>Logout</div>
      </div>
    );
  }
}
