import React from 'react';

export default class Register extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      username: '',
      email: '',
      password: '',
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({[event.target.name]: event.target.value});
  }

  handleSubmit(event) {
    fetch('http://127.0.0.1:3000/api/users/register', {
      method: 'POST',
      body: JSON.stringify({
        username: this.state.username,
        email: this.state.email,
        password: this.state.password
      }),
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json'
      },
    })
    .then(function(response) {
      return response.text();
    })
    .then(function(textResponse) {
      console.log(textResponse);
    })
    .catch(function(err) {
      console.log(err);
    });

    event.preventDefault();
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
      return response.text()
    })
    .then(function(textResponse) {
      console.log(textResponse);
    })
    .catch(function(err) {
      console.log(err);
    });
  }

  componentDidMount() {
    this.authenticateUser();
  }

  render() {
    return (
      <div>
        <div>Register for an account in under a minute!</div>
        <form onSubmit={this.handleSubmit}>
          <div>
            Username:
            <input type="text" name="username" value={this.state.username} onChange={this.handleChange} />
          </div>
          <div>
            Email:
            <input type="email" name="email" value={this.state.email} onChange={this.handleChange} />
          </div>
          <div>
            Password:
            <input type="password" name="password" value={this.state.password} onChange={this.handleChange} />
          </div>
          <div>
            <input type="submit" value="Submit" />
          </div>
        </form>
      </div>
    )
  }
};
