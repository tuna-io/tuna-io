import React from 'react';

export default class Register extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      'username': '',
      'email': '',
      'password': ''
    };
  }

  render() {
    return (
      <div>
        <div>Register for an account in under a minute!</div>
        <form>
          <div>
            Username:
            <input type="text" value={this.state.username} onChange={() => this.setState("username")} />
          </div>
          <div>
            Email:
            <input type="email" value={this.state.email} onChange={() => this.setState("email")} />
          </div>
          <div>
            Password:
            <input type="password" value={this.state.password} onChange={() => this.setState("password")} />
          </div>
        </form>
      </div>
    )
  }
};
