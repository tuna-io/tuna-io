import React, { Component } from 'react';
import videojs from 'video.js';
import overlay from 'videojs-overlay';
import { Grid, Row, Col } from 'react-flexgrid';
import { Badge, Space } from 'rebass';

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


    this.myVideo;
    this.myPlayer;
    this.overlay = [];

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
    const url = `/api/videos/get/${videoId}`;
    const options = {
      method: 'GET',
      headers: new Headers({ 'Content-Type': 'application/json' }),
    };
    const request = new Request(url, options);

    fetch(request)
    .then(response => response.json())
    .then((jsonResponse) => {
      this.setState({ currentVideoDetails: jsonResponse });

      var transcript = JSON.parse(jsonResponse.transcript);
      this.saveTranscript(transcript);

      var likes = jsonResponse.likes.split(',')
      var dislikes = jsonResponse.dislikes.split(',')
      var comments = jsonResponse.comments.split(',')
      this.parseMetadata(likes, dislikes, comments);
    })
    .catch((err) => {
      console.log('Error fetching video with ID', videoId, err);
    });
  }

  parseMetadata(likes, dislikes, comments) {
    const likesArray = [];
    const dislikesArray = [];
    const commentsArray = [];

    likes.forEach(e => {
      if (e.length !== 0) {
        likesArray.push(e);
      }
    });
    dislikes.forEach(e => {
      if (e.length !== 0) {
        dislikesArray.push(e);
      }
    })
    comments.forEach(e => {
      if (e.length !== 0) {
        comments.push(e);
      }
    })

    const videoDetails = this.state.currentVideoDetails;
    videoDetails.likes = likes.slice(1);
    videoDetails.dislikes = dislikes.slice(1);
    videoDetails.comments = comments.slice(1);
    this.setState({currentVideoDetails: videoDetails});
  }

  // save transcript words and times
  saveTranscript(transcript) {
    const newTranscript = [];

    transcript.Words.forEach(word =>
      newTranscript.push({ 
        word: word.Token,
        starttime: word.Begin,
        endtime: word.End
      })
    );

    this.setState({
      transcript: newTranscript,
    });

    this.generateOverlay(newTranscript);
  }

  handleChange(event) {
    // Retrieve checkbox data using event.target.checked
    const value = event.target.name === 'private' ? event.target.checked : event.target.value;
    this.setState({ [event.target.name]: value });
  }

  search(e) {
    e.preventDefault();
    fetch("/api/videos/search/" + this.state.currentVideoDetails.hash + "/" + this.state.query, {
      method: "GET",
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


  findTime(time, event) {
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
            {this.state.searchResults ? (this.state.searchResults.map((i)=> {
              return (
                <button onClick={
                  this.findTime.bind(this, this.state.transcript[i].endtime)}>
                  {
                    Math.floor(this.state.transcript[i].endtime / 60) + ":" +
                    this.state.transcript[i].endtime % 60 + '--' +
                    this.state.transcript.slice(Math.max(i - 4, 0),
                    Math.min(i + 5, this.state.transcript.length))
                    .map(pair => pair.word)
                    .reduce((fword, sword) => {
                      return `${fword} ${sword}`
                    })
                  }
                </button>
              )
            })) : null }
          </div>
        </div>
      );
    }
    return null;
  }

  loadVideoJS(input) {
    videojs(document.getElementById('my-video'), {fluid: true}, () => {
      this.myVideo = input;
      this.myPlayer = this;
    });
  }

  generateOverlay(transcript) {
    transcript.forEach(word => {
      this.overlay.push({
        content: word.word,
        start: word.starttime,
        end: word.endtime,
        align: 'bottom'
      });
    });
  }

  renderOverlay() {
    videojs(document.getElementById('my-video')).overlay({
      overlays: this.overlay
    });
  }

  render() {
    if (this.state.currentVideoDetails) {

      return (
        <Row>
          <Space x={4} />
          <Col xs={8}>
            <div>
              <video ref={(input) => this.loadVideoJS(input)} id="my-video"
                className="video-js vjs-sublime-skin vjs-16-9" controls preload="auto"
                width="640" height="264" poster="" data-setup="{}"
                src={this.state.currentVideoDetails.url} type="video/webm" />
              <button onClick={() => this.renderOverlay()}>Turn on subtitles</button>
            </div>
            <h1>{this.state.currentVideoDetails.title}</h1>
            <div>Creator: {this.state.currentVideoDetails.creator}</div>
            <div>Uploaded: {this.state.currentVideoDetails.timestamp}</div>
            <div>Description: {this.state.currentVideoDetails.description}</div>
            <div>Extension: {this.state.currentVideoDetails.extension}</div>
            <div>Views: {this.state.currentVideoDetails.views}</div>
            <div>Likes: {this.state.currentVideoDetails.likes.length}</div>
            <div>Dislikes: {this.state.currentVideoDetails.dislikes.length}</div> 
            {console.log(this.state.currentVideoDetails.private)}
            {this.state.currentVideoDetails.private == 1 ?
              <Badge pill rounded theme="warning">PRIVATE</Badge> : 
              <Badge pill rounded theme="success">PUBLIC</Badge>
            }
          </Col>
          <Space x={4} />
          <Col xs={3}>
            {
              this.renderTranscript()
            }
            {
              this.renderSearchForm()
            }
            {
              this.renderSearchResults()
            }
          </Col>
        </Row>
      );
    } else {
      return (<div />);
    }
  }
}

export default VideoDetails;
