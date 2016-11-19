import React from 'react';
import Nav from './Nav';
import Home from './Home';

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loggedIn: '',
    };

    this.authenticateUser = this.authenticateUser.bind(this);
  }

  authenticateUser() {
    var context = this;
    console.log('Calling authenticateUser()');

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
      context.setState({loggedIn: jsonResponse.username});
    })
    .catch(function(err) {
      console.log(err);
    });
  }

  componentDidMount() {
    console.log('this.state.loggedIn:', this.state.loggedIn);
    console.log('true?', !!this.state.loggedIn);
    !this.state.loggedIn ? this.authenticateUser() : null;
  }

  render() {
    return (
      <div>
        <Nav loggedIn={this.state.loggedIn} auth={this.authenticateUser} />
        {
          React.cloneElement(
            this.props.children, {
              loggedIn: this.state.loggedIn,
              auth: this.authenticateUser,
            }
          ) || 
          <Home loggedIn={this.state.loggedIn} auth={this.authenticateUser} />
        }
      </div>
    )
  }
};
