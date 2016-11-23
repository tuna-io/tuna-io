import React from 'react';
import { browserHistory, Link } from 'react-router';
import { Menu, NavItem } from 'rebass';

export default class Nav extends React.Component {

  constructor(props) {
    super(props);

    this.state = {};
  }

  logout() {
    fetch('/api/users/logout', {
      method: 'GET',
      credentials: 'same-origin',
    })
    .then(response => {
      return response.json();
    })
    .then(jsonResponse => {
      console.log("Signout Response:", jsonResponse);
      jsonResponse.success ? this.props.auth() : null;
      browserHistory.push('/');
    })
    .catch(err => {
      console.log(err);
    });
  }

  render() {
    return (
      <Menu rounded style={{
        background: '#202121',
        height: '100vh',
        color: 'white',
      }}>
        <Link to="/">
          <NavItem>Home</NavItem>
        </Link>
        <Link to="/about">
          <NavItem>About</NavItem>
        </Link>
        {!this.props.loggedIn &&
          <Link to="/signin">
            <NavItem>Sign In</NavItem>
          </Link>
        }
        {!this.props.loggedIn &&
          <Link to="/register">
            <NavItem>Register</NavItem>
          </Link>
        }
        {this.props.loggedIn &&
          <Link to="/dashboard">
            <NavItem>Dashboard</NavItem>
          </Link>
        }
        {this.props.loggedIn &&
          <NavItem onClick={this.logout.bind(this)}>Sign Out</NavItem>
        }
      </Menu>
    );
  }
}
