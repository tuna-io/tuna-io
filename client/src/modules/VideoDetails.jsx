import React, { Component } from 'react';
import videojs from 'video.js';

// TODO: prevent errors if there is no transcript
// TODO: remove duplicate code in upload
class VideoDetails extends Component {
  constructor(props) {
    super(props);

    // Initialize state in constructor
    this.state = {
      currentVideoId: props.params.videoId,
      currentVideoDetails: null,

      // Transcript format: [{'word': 'coming', 'time': 1}, {'word': 'soon', 'time': 2}]
      transcript: [],
      query: '',
      searchResults: [],
      currentTime: 24,
    };

    this.search = this.search.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.findTime = this.findTime.bind(this);
    this.myVideo;
    // Fetch initial video data. This is only called once
    this.fetchVideoFromAPI(props.params.videoId);
  }

  // Upon going to a different video details page, fetch video data
  componentWillReceiveProps(nextProps) {
    this.fetchVideoFromAPI(nextProps.params.videoId);
  }

  // Helper function to fetch video data
  fetchVideoFromAPI(videoId) {
    const url = `http://127.0.0.1:3000/api/videos/${videoId}`;
    const options = {
      method: 'GET',
      headers: new Headers({ 'Content-Type': 'application/json' }),
    };
    const request = new Request(url, options);

    fetch(request)
    .then(response => response.json())
    .then((jsonResponse) => {
      const transcript = JSON.parse(jsonResponse.transcript);
      this.saveTranscript(transcript);
      this.setState({ currentVideoDetails: jsonResponse });
      this.myVideo = this.refs.myVideo;
    })
    .catch((err) => {
      console.log('Error fetching video with ID', videoId, err);
    });
  }

  // save transcript words and times
  saveTranscript(transcript) {
    const newTranscript = [];
    transcript.Words.forEach((word) => {
      newTranscript.push({ word: word.Token, time: Math.floor(word.End) });
    });
    this.setState({
      transcript: newTranscript,
    });
  }

  handleChange(event) {
    // Retrieve checkbox data using event.target.checked
    const value = event.target.name === 'private' ? event.target.checked : event.target.value;
    this.setState({ [event.target.name]: value });
  }

  search(e) {
    e.preventDefault();
    // console.log('search hash', this.state.currentVideoDetails.hash);
    fetch('http://127.0.0.1:3000/api/videos/search/' + this.state.currentVideoDetails.hash + '/' + this.state.query, {
      method: 'GET',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then(resp => resp.json())
    .then((newSearchResults) => {
      this.setState({
        searchResults: newSearchResults,
      });
    })
    .catch((err) => {
      console.log('error', err);
    });
  }

  findTime(time) {
    console.log('time is', time);
    this.myVideo.currentTime = time;
  }
  // Transcript is rendered after server-side transcription
  renderTranscript() {
    return (
      <div>
        <h3>Transcript: </h3>
        {this.state.transcript.length ? (
          <div>
            {this.state.transcript.map(pair => pair.word).reduce((firstword, secondword) => `${firstword} ${secondword}`)}
          </div>
          ) : null
        }
      </div>
    );
  }

  renderSearchForm() {
    if (this.state.transcript.length) {
      return (
        <form onSubmit={this.search}>
          Search:
          <input type="text" name="query" onChange={this.handleChange} />
          <input type="submit" value="Submit" />
        </form>
      );
    }
    return null;
  }

  renderSearchResults() {
    if (this.state.transcript.length) {
      return (
        <div>
          <div> Search results: </div>
          <div>
            {this.state.searchResults ? (this.state.searchResults.map(i =>
              (
                <button onClick={this.findTime(this.state.transcript[i].time)}>
                  {
                    Math.floor(this.state.transcript[i].time / 60) + ':' + (this.state.transcript[i].time % 60) + '--' +
                    this.state.transcript.slice(Math.max(i - 4, 0), Math.min(i + 5, this.state.transcript.length))
                    .map(pair => pair.word)
                    .reduce((fword, sword) => `${fword} ${sword}`)
                  }
                </button>
              ))) : null
            }
          </div>
        </div>
      );
    }
    return null;
  }

  componentDidMount() {
    videojs(document.getElementById('my-video'), {}, function() {
      console.log("done");
    });
  }

  testHandler() {
    videojs(document.getElementById('my-video'), {}, function() {
      console.log("done");
    });
  }


  render() {
    debugger;
    if (this.state.currentVideoDetails) {
      console.log(this.state.currentVideoDetails);

      return (
        <div>
          <h1>{this.state.currentVideoDetails.title}</h1>
          <div>
            <video ref="myVideo" controls width="400" >
              <source src={this.state.currentVideoDetails.url} type="video/mp4"/>
            </video>
          <button onClick={this.testHandler}> HELLO </button>
          <video ref={this.testHandler} id="my-video" className="video-js vjs-sublime-skin" controls preload="auto" width="640" height="264" poster="" data-setup="{}" src={this.state.currentVideoDetails.url} type="video/webm" />


          </div>
          <div>Creator: {this.state.currentVideoDetails.creator}</div>
          <div>Uploaded: {this.state.currentVideoDetails.timestamp}</div>
          <div>Description: {this.state.currentVideoDetails.description}</div>
          <div>Extension: {this.state.currentVideoDetails.extension}</div>
          <div>Views: {this.state.currentVideoDetails.views}</div>
          <div>Likes: {this.state.currentVideoDetails.likes}</div>
          <div>Dislikes: {this.state.currentVideoDetails.dislikes}</div>
          <div>Private: {this.state.currentVideoDetails.private}</div>
          {
            this.renderTranscript()
          }
          {
            this.renderSearchForm()
          }
          {
            this.renderSearchResults()
          }
        </div>
      );
    }

    // Need to return valid JSX before the initial API call has returned
    return (<div />);
  }
}

export default VideoDetails;
