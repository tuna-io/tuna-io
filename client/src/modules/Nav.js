import React from 'react';
import { browserHistory, Link } from 'react-router';
import { Menu, NavItem, Media, Heading, Text, Divider, InlineForm } from 'rebass';

export default class Nav extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      query: '',
      videos: [],
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    console.log('componentprops called', this.props.currVid, 'next', nextProps.currVid);
    if (this.props.currVid !== nextProps.currVid) {
      fetch(`/api/videos/recommended/${nextProps.currVid}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then(data=> {
        console.log("data is");
        return data.json();
      })
      .then((videos) => {
        const topVids = videos.map(video => video[1]).filter(hash => hash !== this.props.currVid);
        console.log(topVids);
      })
      .catch((err) => {
        console.log('error getting last vid', err);
      });
    }
  }

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
        <Link to="/about">
          <NavItem>About</NavItem>
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
          <Link to="/dashboard">
            <NavItem>Dashboard</NavItem>
          </Link>
        }
        {this.props.loggedIn &&
          <NavItem onClick={this.logout.bind(this)}>Sign Out</NavItem>
        }
        <br /> <br />
        <Divider width={1000} style={{background: 'white'}} />
        <NavItem>
          <Media align="center" img="https://place-hold.it/85x85/E5A1ED/FFFFFF">
            <Heading level={3}>
              Video
            </Heading>
            <Text>
              {this.props.currVid}
            </Text>
          </Media>
        </NavItem>
        <NavItem>
          <Media align="center" img="https://place-hold.it/85x85/E5A1ED/FFFFFF">
            <Heading level={3}>
              Video
            </Heading>
            <Text>
              {this.props.currVid}
            </Text>
          </Media>
        </NavItem>
        <NavItem>
          <Media align="center" img="https://place-hold.it/85x85/E5A1ED/FFFFFF">
            <Heading level={3}>
              Video
            </Heading>
            <Text>
              {this.props.currVid}
            </Text>
          </Media>
        </NavItem>
        <NavItem>
          <Media align="center" img="https://place-hold.it/85x85/E5A1ED/FFFFFF">
            <Heading level={3}>
              Video
            </Heading>
            <Text>
              {this.props.currVid}
            </Text>
          </Media>
        </NavItem>
      </Menu>
    );
  }
}
