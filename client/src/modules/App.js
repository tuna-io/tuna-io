import React from 'react';
import Nav from './Nav';
import Home from './Home';
import Rebass from 'rebass';
import { Grid, Row, Col } from 'react-flexgrid';

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loggedIn: '',
      currentVideo: '',
    };

    this.authenticateUser = this.authenticateUser.bind(this);
    this.updateCurrent = this.updateCurrent.bind(this);
  }

  componentDidMount() {
    !this.state.loggedIn ? this.authenticateUser() : null;
  }

  updateCurrent(video) {
    this.setState({
      currentVideo: video,
    });
    console.log("app update called with", video);
  }

  authenticateUser() {
    fetch('/api/users/authenticate', {
      method: 'GET',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then(response => response.json())
    .then((jsonResponse) => {
      this.setState({ loggedIn: jsonResponse.username });
    })
    .catch((err) => {
      console.log(err);
    });
  }

  render() {
    return (
      <Row>
        <Col xs={2}>
          <Nav loggedIn={this.state.loggedIn} auth={this.authenticateUser} currVid={this.state.currentVideo}/>
        </Col>
        <Col xs={10}>
        {
          this.props.children ?
            React.cloneElement(
              this.props.children, {
                loggedIn: this.state.loggedIn,
                auth: this.authenticateUser,
              },
            ) : <Home loggedIn={this.state.loggedIn} auth={this.authenticateUser} updateCurrent={this.updateCurrent} />
        }
        </Col>
      </Row>
    );
  }
}

module.exports = App;
