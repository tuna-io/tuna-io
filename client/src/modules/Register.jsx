import React from 'react';

export default class Register extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      'username': '',
      'email': '',
      'password': ''
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({[event.target.name]: event.target.value});
  }

  handleSubmit(event) {
    alert(this.state.username);
    event.preventDefault();
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
            <input type="email" value={this.state.email} onChange={this.handleChange} />
          </div>
          <div>
            Password:
            <input type="password" value={this.state.password} onChange={this.handleChange} />
          </div>
          <div>
            <input type="submit" value="Submit" />
          </div>
        </form>
      </div>
    )
  }
};
