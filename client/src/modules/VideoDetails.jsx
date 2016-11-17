import React, { Component } from 'react';

class VideoDetails extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentVideoId: props.params.videoId,
      currentVideoDetails: null,
    };

    // make API call
    this.fetchVideoFromAPI(props.params.videoId);
  }

  componentWillReceiveProps(nextProps) {
    this.fetchVideoFromAPI(nextProps.params.videoId);
  }

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
    console.log('rendering. state:', this.state);

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

    return (<div />);
  }
}

export default VideoDetails;
