import React from 'react';
import { browserHistory } from 'react-router';

export default class Signin extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      username: '',
      password: '',
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  handleSubmit(event) {

    fetch('/api/users/login', {
      method: 'POST',
      body: JSON.stringify({
        username: this.state.username,
        password: this.state.password,
      }),
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
    .then(response => response.json())
    .then((jsonResponse) => {
      console.log('Signin Response:', jsonResponse);
      if (jsonResponse.username) {
        this.props.auth();
        browserHistory.push('/');
      }
    })
    .catch((err) => {
      console.log(err);
    });

    event.preventDefault();
  }

  render() {
    return (
      <div>
        <div>Sign in to your existing account!</div>
        <form onSubmit={this.handleSubmit}>
          <div>
            Username:
            <input
              type="text" name="username" value={this.state.username} onChange={this.handleChange}
            />
          </div>
          <div>
            Password:
            <input
              type="password" name="password" value={this.state.password}
              onChange={this.handleChange}
            />
          </div>
          <div>
            <input type="submit" value="Submit" />
          </div>
        </form>
      </div>
    );
  }
}
