import React from 'react';
import { browserHistory, Link } from 'react-router';
import { Menu, NavItem, Media, Heading, Text, Divider, InlineForm } from 'rebass';
import Recommended from './Recommended';

export default class Nav extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      query: '',
      recVideos: [],
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
  }

  // componentWillReceiveProps(nextProps) {
  //   // this.setState({
  //   //   currVid: nextProps.currVid,
  //   // });
  // }

  logout() {
    fetch('/api/users/logout', {
      method: 'GET',
      credentials: 'same-origin',
    })
    .then(response => {
      return response.json();
    })
    .then(jsonResponse => {
      console.log("Signout Response:", jsonResponse);
      jsonResponse.success ? this.props.auth() : null;
      browserHistory.push('/');
    })
    .catch(err => {
      console.log(err);
    });
  }

  handleChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  handleSearch(event) {
    event.preventDefault();

    browserHistory.push('/search/&q=' + this.state.query);
  }

  render() {
    return (
      <Menu rounded style={{
        background: '#202121',
        height: '100vh',
        color: 'white',
      }}>
        <NavItem>
          <InlineForm
            buttonLabel="Search"
            label="PlatformSearch"
            name="query"
            onChange={this.handleChange}
            onClick={this.handleSearch}
          />
        </NavItem>
        <Link to="/">
          <NavItem>Home</NavItem>
        </Link>
        {!this.props.loggedIn &&
          <Link to="/signin">
            <NavItem>Sign In</NavItem>
          </Link>
        }
        {!this.props.loggedIn &&
          <Link to="/register">
            <NavItem>Register</NavItem>
          </Link>
        }
        {this.props.loggedIn &&
          <Link to="/dashboard/upload">
            <NavItem>Upload</NavItem>
          </Link>
        }
        {this.props.loggedIn &&
          <NavItem onClick={this.logout.bind(this)}>Sign Out</NavItem>
        }        
        {this.props.currVid ? (<Recommended currVid={this.props.currVid}/>) : null}
      </Menu>
    );
  }
}
