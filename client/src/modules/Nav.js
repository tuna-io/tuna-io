import React from 'react';
import { browserHistory, Link } from 'react-router';
import { Grid, Row, Col } from 'react-flexgrid';

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
    });
  },

  render() {
    return (
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
    );
  },
});
