import React, { Component } from 'react';
import videojs from 'video.js';
import overlay from 'videojs-overlay';
import { Grid, Row, Col } from 'react-flexgrid';
import { Badge, Space, InlineForm, Panel, PanelHeader, Text, Avatar, Heading, Flex, Donut, Stat } from 'rebass';
import TimeAgo from 'react-timeago';
import Wordcloud from './Wordcloud';
import Transcript from './Transcript';

// TODO: prevent errors if there is no transcript
// TODO: make sure subtitles are still working
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

      const transcript = JSON.parse(jsonResponse.transcript);
      this.saveTranscript(transcript);

      const likes = jsonResponse.likes.split(',');
      const dislikes = jsonResponse.dislikes.split(',');
      const comments = jsonResponse.comments.split(',');
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

    likes.forEach((e) => {
      if (e.length !== 0) {
        likesArray.push(e);
      }
    });
    dislikes.forEach((e) => {
      if (e.length !== 0) {
        dislikesArray.push(e);
      }
    });
    comments.forEach((e) => {
      if (e.length !== 0) {
        comments.push(e);
      }
    });

    const videoDetails = this.state.currentVideoDetails;
    videoDetails.likes = likes.slice(1);
    videoDetails.dislikes = dislikes.slice(1);
    videoDetails.comments = comments.slice(1);

    videoDetails.likesCount = videoDetails.likes.length;
    videoDetails.dislikesCount = videoDetails.dislikes.length;
    videoDetails.ldRatio =
      videoDetails.likes.length / (videoDetails.likes.length + videoDetails.dislikes.length);
    this.setState({ currentVideoDetails: videoDetails });
  }

  // save transcript words and times
  saveTranscript(transcript) {
    const newTranscript = [];

    transcript.words.forEach(word =>
      newTranscript.push({
        word: word.token,
        starttime: word.begin,
        endtime: word.end,
      }));

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
    fetch('/api/videos/search/' + this.state.currentVideoDetails.hash + '/' + this.state.query, {
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


  findTime(time) {
    this.myVideo.currentTime = time;
  }

  loadVideoJS(input) {
    videojs(document.getElementById('my-video'), { fluid: true }, () => {
      this.myVideo = input;
      this.myPlayer = this;
    });
  }

  generateOverlay(transcript) {
    var i = 0;
    var partial = {content: '', start: i, end: i + 5,};

    for (var j = 0; j < transcript.length; j++) {
      var word = transcript[j];

      if (word.endtime >= i + 5) {
        i += 5;
        partial.content += ' ' + word.word;
        this.overlay.push(partial);
        partial = {content: '', start: i, end: i + 5,};
      } else {
        partial.content += ' ' + word.word;
      }

      if (j === transcript.length - 1) {
        partial.content += ' ' + word.word;
        this.overlay.push(partial);
      }
    }
  }

  // Transcript is rendered after server-side transcription
  renderTranscript() {
    return (
      <div>
        <h3>Transcript: </h3>
        {this.state.transcript.length ? (
          <Transcript transcript={this.state.transcript} videoId={this.props.params.videoId} />
          ) : null
        }
      </div>
    );
  }

  renderWordcloud() {
    return this.state.transcript.length ?
      (
        <Wordcloud transcript={this.state.transcript} />
      ) : null;
  }

  renderSearchForm() {
    if (this.state.transcript.length) {
      return (
        <InlineForm
          buttonLabel="Search" label="InlineForm" name="query"
          onChange={this.handleChange} onClick={this.search}
        />
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
                <button onClick={
                  this.findTime.bind(this, this.state.transcript[i].endtime)}
                >
                  {
                    Math.floor(this.state.transcript[i].endtime / 60) + ":" +
                    this.state.transcript[i].endtime % 60 + '--' +
                    this.state.transcript.slice(Math.max(i - 4, 0),
                    Math.min(i + 5, this.state.transcript.length))
                    .map(pair => pair.word)
                    .reduce((fword, sword) => `${fword} ${sword}`)
                  }
                </button>
              ))) : null }
          </div>
        </div>
      );
    }
    return null;
  }


  renderOverlay() {
    videojs(document.getElementById('my-video')).overlay({
      overlays: this.overlay,
      class: 'captions',
      align: 'bottom',
    });
  }

  render() {
    if (this.state.currentVideoDetails) {
      return (
        <Row>
          <Space x={4} />
          <Col xs={8}>
            <div>
              <video ref={input => this.loadVideoJS(input)} id="my-video"
                className="video-js vjs-sublime-skin vjs-16-9" controls preload="auto"
                width="640" height="264" poster="" data-setup="{}"
                src={this.state.currentVideoDetails.url} type="video/webm"
              />
              <button onClick={() => this.renderOverlay()}>Turn on subtitles</button>
            </div>
            <Panel theme="default">
              <PanelHeader inverted theme="default">
                {this.state.currentVideoDetails.title}
              </PanelHeader>
              <Text>
                <Row>
                  <Col xs={0}>
                    <Avatar circle size={48} src="http://lorempixel.com/output/animals-q-c-64-64-8.jpg" />
                  </Col>
                  <Col xs={1}>
                    <Heading size={5} alt>
                      {this.state.currentVideoDetails.creator}
                    </Heading>

                    <Badge rounded theme="info"> 4.5M </Badge>
                  </Col>
                </Row>
                <Row>
                  <Col xs={5}>
                    <div>
                      Uploaded:
                      <TimeAgo
                        date={this.state.currentVideoDetails.timestamp}
                      />
                    </div>
                  </Col>
                  <Col xs={3}>
                    {this.state.currentVideoDetails.private == 1 ?
                      <Badge pill rounded theme="warning">PRIVATE</Badge> :
                      <Badge pill rounded theme="success">PUBLIC</Badge>
                    }
                  </Col>
                </Row>
                <div>Description: {this.state.currentVideoDetails.description}</div>
                <Row>
                  <Col xs={2}>
                    <Stat
                      label="VIEWS"
                      value={this.state.currentVideoDetails.views}
                    />
                  </Col>
                  <Col xs={2}>
                    <Stat
                      label="LIKES"
                      value={this.state.currentVideoDetails.likesCount}
                    />
                  </Col>
                  <Col xs={2}>
                    <Stat
                      label="DISLIKES"
                      value={this.state.currentVideoDetails.dislikesCount}
                    />
                  </Col>
                  <Col xs={2}>
                    <Donut
                      color="warning" size={100} strokeWidth={12}
                      value={this.state.currentVideoDetails.ldRatio}
                    >
                      {this.state.currentVideoDetails.likesCount}/
                      {this.state.currentVideoDetails.dislikesCount +
                        this.state.currentVideoDetails.likesCount}
                    </Donut>
                  </Col>
                </Row>
              </Text>
            </Panel>
          </Col>
          <Space x={4} />
          <Col xs={3}>
            {
              this.renderSearchForm()
            }
            {
              this.renderTranscript()
            }
            {
              this.renderWordcloud()
            }
            {
              this.renderSearchResults()
            }
          </Col>
        </Row>
      );
    }
    return (<div />);
  }
}

export default VideoDetails;
