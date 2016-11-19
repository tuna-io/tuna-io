import React from 'react';
import Nav from './Nav';
import Home from './Home';

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      'loggedIn': '',
    };
  }

  authenticateUser() {
    fetch('http://127.0.0.1:3000/api/users/authenticate', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
    })
    .then(function(response) {
      return response.json()
    })
    .then(function(jsonResponse) {
      console.log(jsonResponse);
    })
    .catch(function(err) {
      console.log(err);
    });
  }

  componentDidMount() {
    this.state.loggedIn ? this.authenticateUser() : null;
  }

  render() {
    return (
      <div>
        <Nav />
        {this.props.children || <Home />}
      </div>
    )
  }
};
