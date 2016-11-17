import React, { Component } from 'react';

class VideoDetails extends Component {
  constructor(props) {
    super(props);

    // Initialize state in constructor
    this.state = {
      currentVideoId: props.params.videoId,
      currentVideoDetails: null,
    };

    // Fetch initial video data. This is only called once
    this.fetchVideoFromAPI(props.params.videoId);
  }

  // Upon going to a different video details page, fetch video data
  componentWillReceiveProps(nextProps) {
    this.fetchVideoFromAPI(nextProps.params.videoId);
  }

  // Helper function to fetch video data
  fetchVideoFromAPI(videoId) {
    const url = 'http://localhost:3000/api/videos/' + videoId;
    const options = {
      method: 'GET',
      headers: new Headers({ 'Content-Type': 'application/json' }),
    };
    const request = new Request(url, options);

    fetch(request)
    .then(response => response.json())
    .then((jsonResponse) => {
      this.setState({ currentVideoDetails: jsonResponse });
    })
    .catch((err) => {
      console.log('Error fetching video with ID', videoId, err);
    });
  }

  render() {
    if (this.state.currentVideoDetails) {
      return (
        <div>
          <h1>{this.state.currentVideoDetails.title}</h1>
          <div>
            <video width="400" src={this.state.currentVideoDetails.url} controls />
          </div>
          <div>Creator: {this.state.currentVideoDetails.creator}</div>
          <div>Uploaded: {this.state.currentVideoDetails.timestamp}</div>
        </div>
      );
    }

    // Need to return valid JSX before the initial API call has returned
    return (<div />);
  }
}

export default VideoDetails;
