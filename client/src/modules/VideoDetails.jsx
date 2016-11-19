import React, { Component } from 'react';

// TODO: prevent errors if there is no transcript
// TODO: remove duplicate code in upload
class VideoDetails extends Component {
  constructor(props) {
    super(props);

    // Initialize state in constructor
    this.state = {
      currentVideoId: props.params.videoId,
      currentVideoDetails: null,
      transcript: [{"word": "coming soon...", "time": 1}],
      query: "",
      searchResults: [],
      searchReturned: false,
    };

    this.search = this.search.bind(this);
    this.handleChange = this.handleChange.bind(this);
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
      this.setState({ currentVideoDetails: jsonResponse });
      console.log("hash is", jsonResponse.hash);
      var transcript = JSON.parse(jsonResponse.transcript);
      this.saveTranscript(transcript);
    })
    .catch((err) => {
      console.log('Error fetching video with ID', videoId, err);
    });
  }

  // save transcript words and times
  saveTranscript(transcript){
    const newTranscript = [];
    transcript.Words.forEach(word =>
      newTranscript.push({ word: word.Token, time: word.End })
    );
    this.setState({
      transcript: newTranscript,
    });
  }

  handleChange(event) {
    // Retrieve checkbox data using event.target.checked
    const value = event.target.name === "private" ? event.target.checked : event.target.value;
    this.setState({ [event.target.name]: value });
  }

  search(e){
    e.preventDefault();
    console.log("search hash", this.state.currentVideoDetails.hash);
    fetch("http://127.0.0.1:3000/api/videos/search/" + this.state.currentVideoDetails.hash + "/" + this.state.query, {
      method: "GET",
      credentials: 'same-origin',
      headers: {
        "Content-Type": "application/json"
      }
    })
    .then((resp)=> {
      return resp.json();
    })
    .then((searchResults)=>{
      console.log("search results are", searchResults);
      this.setState({
        searchResults: searchResults,
        searchReturned: true
      });
    })
    .catch((err)=> {
      console.log('error', err);
    });
  }

  // Transcript is rendered after server-side transcription
  renderTranscript() {
    return (
      <div>
        <h3>Transcript</h3>
        <div>
          {this.state.transcript.map(pair => pair.word).reduce((firstword, secondword) => `${firstword} ${secondword}`)}
        </div>
      </div>
    );
  }

  renderSearchForm() {
    if (this.state.transcript.length > 1) {
      return (
        <form onSubmit={this.search}>
          Search:
          <input type="text" name="query" onChange={this.handleChange}/>
          <input type="submit" value="Submit" />
        </form>
      );
    }
  }

  renderSearchResults(){
    if (this.state.transcript.length > 1) {
      return (
        <div>
          <div> Search results: </div>
          <div>
            {this.state.searchReturned ? (this.state.searchResults.map((i)=> {
                console.log("word is", this.state.transcript[i].word);
                return (<div>{"Word: " + this.state.transcript[i].word + ", Time: " + this.state.transcript[i].time}</div>)
                })
              ) : null 
            }
          </div>
        </div>
      );
    }
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
