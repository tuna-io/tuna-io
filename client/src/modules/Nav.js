import React from 'react';
import { browserHistory, Link } from 'react-router';
import { Grid, Row, Col } from 'react-flexgrid';
import { Menu, NavItem } from 'rebass';

export default class Nav extends React.Component {

  constructor(props) {
    super(props);

    this.state = {};
  }

  // onNavClick(id) {
  //   this.setState({selectedId: id});
  // }

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
      <div>
      <Row>
      <Col xs={2}>
      <Menu rounded style={{background: 'black'}}>
        <Link to="/">
          <NavItem is="a">Home</NavItem>
        </Link>
        <Link to="/about">
          <NavItem is="a">About</NavItem>
        </Link>
        {!this.props.loggedIn &&
          <Link to="/signin">
            <NavItem is="a">Sign In</NavItem>
          </Link>
        }
        {!this.props.loggedIn &&
          <Link to="/register">
            <NavItem is="a">Register</NavItem>
          </Link>
        }
        {this.props.loggedIn &&
          <Link to="/dashboard">
            <NavItem is="a">Dashboard</NavItem>
          </Link>
        }
        {this.props.loggedIn &&
          <NavItem is="a" onClick={this.logout.bind(this)}>Sign Out</NavItem>
        }
      </Menu>
      </Col>
      </Row>
      <Grid>
        <Row className="nav-bar">
          <Col xs>
            <Link to="/">Home</Link>
          </Col>
          <Col xs>
            <Link to="/about">About</Link>
          </Col>
          {!this.props.loggedIn &&
            <Col xs>
              <Link to="/signin">Sign in</Link>
            </Col>
          }
          {!this.props.loggedIn &&
            <Col xs>
              <Link to="/register">Register</Link>
            </Col>
          }
          {this.props.loggedIn &&
            <Col xs>
              <Link to="/dashboard">Dashboard (Logged in as {this.props.loggedIn})</Link>
            </Col>
          }
          {this.props.loggedIn &&
            <Col xs>
              <div onClick={this.logout.bind(this)}>Logout</div>
            </Col>
          }
        </Row>
      </Grid>
      </div>
    );
  }
}
