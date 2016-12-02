import React from 'react';
import { Link } from 'react-router';
import { Grid, Row, Col } from 'react-flexgrid';
import Nav from './Nav';
import HomepageCarousel from './HomepageCarousel';

const carouselStyle = {
  color: "#e2e2e2",
  backgroundColor: "#191919",
  padding: "10px 20px 30px",
  margin: "35px 30px 5px 15px",
};

const homeStyle = {
  backgroundColor: "#3a3a3a",
};

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
      <Row style={homeStyle}>
        <Col xs={2}>
          <Nav loggedIn={this.props.loggedIn} auth={this.props.auth} />
        </Col>
        <Col xs={10}>
          <div>
            <div style={carouselStyle}>
              {this.renderCarousel('New uploads')}
            </div>
            <div style={carouselStyle}>
              {this.renderCarousel('Trending')}
            </div>
          </div>
        </Col>
      </Row>
    );
  }
}
