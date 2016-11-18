import React from 'react';
import { Link } from 'react-router';

export default class Home extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      'latestVideos' : []
    };
  }

  componentWillMount() {
    // Get latest videos in componentWillMount to get the latest videos for every homepage visit
    this.getLatestVideos();
  }

  getLatestVideos() {
    // Create and configure AJAX request using fetch(): https://davidwalsh.name/fetch
    var url = 'http://localhost:3000/api/videos/latest';
    var requestOptions = {
      'method': 'GET', 
      'headers': new Headers({ 'Content-Type': 'application/json' })
    };
    var request = new Request(url, requestOptions);
    var context = this;

    fetch(request)
    .then(function(response) {
      // Return JSON-parsed object as a promise
      return response.json();
    })
    .then(function(jsonResponse) {
      // jsonResponse should contain an array of objects
      console.log('Latest videos:', jsonResponse);

      // Cursorily clean data
      var validVideos = jsonResponse.filter(function(video) {
        return video.url && video.url !== "" 
      });

      context.setState({'latestVideos': validVideos});
    }) 
    .catch(function(err) {
      console.log('Error fetching latest videos', err)
    });
  }

  render() {
    return (
      <div id="latest-videos">
        <div>Latest videos</div>
        <div>
          { this.state.latestVideos.map(function(video) {
            return (
              <div className="video-preview" key={ video.creator + video.url }>
                <div><Link to={ '/videos/' + video.hash } >{ video.title }</Link></div>
                <video width="400" controls>
                  <source src={ video.url } type="video/mp4" />
                </video>
              </div>
            )
          }) }
        </div>
      </div>
    )
  }
};
