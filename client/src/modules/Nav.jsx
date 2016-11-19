import React from 'react';
import { browserHistory, Link } from 'react-router';
import { Grid, Row, Col } from 'react-flexbox-grid/lib/index'

export default React.createClass({
  logout() {
    fetch('http://127.0.0.1:3000/api/users/logout', {
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
    })
  },

  render() {
    return (
      <Grid>
        <Row className="nav-bar">
          <Col xs={3} sm={3} md={3} lg={3}>
            <div><Link to="/">Home</Link></div>
          </Col>
          <Col xs={3} sm={3} md={3} lg={3}>
            <div><Link to="/about">About</Link></div>
          </Col>
          {!this.props.loggedIn &&
            <Col xs={3} sm={3} md={3} lg={3}>
              <div><Link to="/signin">Sign in</Link></div>
              <div><Link to="/register">Register</Link></div>
            </Col>
          }
          {this.props.loggedIn &&
            <Col xs={3} sm={3} md={3} lg={3}>
              <div><Link to="/dashboard">Dashboard (Logged in as {this.props.loggedIn})</Link></div>
              <div onClick={this.logout.bind(this)}>Logout</div>
            </Col>
          }
        </Row>
      </Grid>
    );
  },
});
