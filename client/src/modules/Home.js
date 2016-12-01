import React from 'react';
import { Link } from 'react-router';

export default class Home extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      latestVideos: [],
    };
  }

  componentDidMount() {
    !this.props.loggedIn ? this.props.auth() : null;
  }

  componentWillMount() {
    // Get latest videos in componentWillMount to get the latest videos for
    // every homepage visit
    this.getLatestVideos();
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
      // jsonResponse should contain an array of objects
      console.log('Latest videos:', jsonResponse);

      // Cursorily clean data
      const validVideos = jsonResponse.filter(video => (video.url && video.url !== ''));

      context.setState({ latestVideos: validVideos });
    })
    .catch((err) => {
      console.log('Error fetching latest videos', err);
    });
  }

  render() {
    return (
      <div>
        <h1>TunaVid.io - the 6th fastest fish in the sea</h1>
        <div id="latest-videos">
          {this.props.loggedIn &&
            <div>Welcome back, {this.props.loggedIn}, here are your personal recommendations</div>
          }
          <div>Latest videos</div>
          <div>
            { this.state.latestVideos.map(video =>
              (
                <div className="video-preview" key={video.creator + video.url}>
                  <div><Link to={`/videos/${video.hash}`} onClick={() => this.props.updateCurrent(video.hash)}>{ video.title }</Link></div>
                  <video width="400" controls>
                    <source src={video.url} type="video/mp4" />
                  </video>
                </div>
              ),
            ) }
          </div>
        </div>
      </div>
    );
  }
}
