import React from 'react';
import { Link } from 'react-router';
import { Grid, Row, Col } from 'react-flexgrid';
import Overview from './Overview';
import Nav from './Nav';

const backgroundStyle = {
};

export default class Dashboard extends React.Component {
  render() {
    return (
      <Row>
        <Col xs={2}>
          <Nav loggedIn={this.props.loggedIn} auth={this.props.auth} />
        </Col>
        <Col style={backgroundStyle} xs={10}>
          {
            this.props.children ?
            React.cloneElement(
              this.props.children, {
                loggedIn: this.props.loggedIn,
                auth: this.authenticateUser,
              },
            ) : <Overview loggedIn={this.props.loggedIn} auth={this.props.authenticateUser} />
          }
        </Col>
      </Row>
    );
  }
}


/*
when we want to add dashbaord links back in
<Col xs={10}>
          <div>
            <ul>
              <li><Link to="/dashboard/settings">Settings</Link></li>
              <li><Link to="/dashboard/upload">Upload</Link></li>
              {
                this.props.children ?
                React.cloneElement(
                  this.props.children, {
                    loggedIn: this.props.loggedIn,
                    auth: this.authenticateUser,
                  },
                ) : <Overview loggedIn={this.props.loggedIn} auth={this.props.authenticateUser} />
              }
            </ul>
          </div>
        </Col>
*/