import React from 'react';
import Nav from './Nav';
import Home from './Home';
import Rebass from 'rebass';

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loggedIn: '',
    };

    this.authenticateUser = this.authenticateUser.bind(this);
  }

  componentDidMount() {
    !this.state.loggedIn ? this.authenticateUser() : null;
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
      <div>
        <Nav loggedIn={this.state.loggedIn} auth={this.authenticateUser} />
        {
          this.props.children ?
          React.cloneElement(
            this.props.children, {
              loggedIn: this.state.loggedIn,
              auth: this.authenticateUser,
            },
          ) : <Home loggedIn={this.state.loggedIn} auth={this.authenticateUser} />
        }
      </div>
    );
  }
}

module.exports = App;
