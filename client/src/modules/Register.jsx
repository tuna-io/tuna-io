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

  authenticateUser() {
    var url = 'http://localhost:3000/api/users/authenticate';
    var requestOptions = {
      'method': 'GET',
      'headers': new Headers({
        'Content-Type': 'application/json'
      })
    };
    var request = new Request(url, requestOptions);

    fetch(request)
    .then(function(response) {
      console.log(response.json());
    })
  }

  componentDidMount() {
    console.log('component mount');
    this.authenticateUser()
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
