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
      <div>This is the registration page</div>
    )
  }
};
