import React from 'react';
import { Link } from 'react-router';
import { Grid, Row, Col } from 'react-flexgrid';
import Nav from './Nav';
import HomepageCarousel from './HomepageCarousel';


export default class Home extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      latestVideos: [],
    };

    this.renderCarousel = this.renderCarousel.bind(this);

    this.getLatestVideos();
  }

  componentDidMount() {
    !this.props.loggedIn ? this.props.auth() : null;
  }

  getLatestVideos() {
    // Create and configure AJAX request using fetch()
    // https://davidwalsh.name/fetch
    const url = '/api/videos/latest';
    const requestOptions = {
      method: 'GET',
      credentials: 'same-origin',
      headers: new Headers({ 'Content-Type': 'application/json' }),
    };
    const request = new Request(url, requestOptions);
    const context = this;

    fetch(request)
    // Return JSON-parsed object as a promise
    .then(response => response.json())
    .then((jsonResponse) => {
      // Cursorily clean data
      const validVideos = jsonResponse.filter(video => (video.url && video.url !== ''));

      context.setState({ latestVideos: validVideos });
    })
    .catch((err) => {
      console.log('Error fetching latest videos', err);
    });
  }

  renderCarousel(header) {
    return (this.state.latestVideos && this.state.latestVideos.length > 0) ?
    (
      <HomepageCarousel latestVideos={this.state.latestVideos} header={header} />
    ) : null;
  }

  render() {
    return (
      <Row>
        <Col xs={2}>
          <Nav loggedIn={this.props.loggedIn} auth={this.props.auth} />
        </Col>
        <Col xs={10}>
          <div>
            <h1>TunaVid.io - the 6th fastest fish in the sea</h1>
            <div id="latest-videos">
              {this.props.loggedIn &&
                <h3>Welcome back, {this.props.loggedIn}</h3>
              }
            </div>
            {this.renderCarousel('Latest videos')}
            {this.renderCarousel('Hottest videos')}
          </div>
        </Col>
      </Row>
    );
  }
}
