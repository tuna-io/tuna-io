import React from 'react';
import Dropzone from 'react-dropzone';

// TODO: render video details page instead of duplicating functionality
export default class Upload extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      file: null,
      signedUrl: null,
      videoReturned: false,
      transcript: '',

      // Upload options
      title: '',
      description: '',
      private: false,

      transcript: [{"word": "coming soon...", "time": 1}],
      filename: "",
      videoReturned: false,
      query: "",
      searchResults: [],
      searchReturned: false
    };
    
    // Bind helper functions in constructor
    this.handleChange = this.handleChange.bind(this);
    this.submitVideoToCDN = this.submitVideoToCDN.bind(this);
    this.attachUsingDropzone = this.attachUsingDropzone.bind(this);
    this.renderVideoOptionsForm = this.renderVideoOptionsForm.bind(this);
    this.renderVideoModule = this.renderVideoModule.bind(this);
    this.renderTranscript = this.renderTranscript.bind(this);
    this.search = this.search.bind(this);
  }

  // Triggered when user drops file into Dropzone
  // Use file information to retrieve signed URL
  attachUsingDropzone(files) {
    const file = files[0];
    this.setState({
      videoReturned: false,
      file: file,
      title: file.name,
    });

    // Fetch signed URL
    fetch('http://127.0.0.1:3000/api/s3', {
      method: 'POST',
      body: JSON.stringify({
        filename: file.name,
        filetype: file.type,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then(data => data.json())
    .then((signedUrl) => {
      this.setState({ signedUrl: signedUrl });
    })
    .catch(err => console.log('Error retrieving signed URL:', err));
  }

  // Handle video options form change
  handleChange(event) {
    // Retrieve checkbox data using event.target.checked
    const value = event.target.name === "private" ? event.target.checked : event.target.value;
    this.setState({ [event.target.name]: value });
  }

  // Triggered on video options form submission
  submitVideoToCDN(event) {
    // Prevent page refresh
    event.preventDefault();

    if (this.state.signedUrl) {
      // Upload video into CDN
      fetch(this.state.signedUrl, {
        method: 'PUT',
        body: this.state.file,
        headers: {
          'x-amz-acl': 'public-read',
        },
      })
      .then((data) => {
        this.setState({
          videoReturned: true,
        });

        // Post video metadata to the server
        return fetch('http://127.0.0.1:3000/api/videos', {
          method: 'POST',
          body: JSON.stringify({
            title: this.state.title,
            description: this.state.description,
            url: `https://s3-us-west-1.amazonaws.com/invalidmemories/${this.state.file.name}`,
            creator: 'bill', // TODO REMOVE USER HARDCODING WHEN USER AUTHENTICATION IS DONE
            private: this.state.private,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        })
        .catch(err => console.log('Error posting video to /api/videos:', err));
      })
      .then(rawResp => rawResp.json())
      .then((resp) => {
        // Parse transcript
        const newTranscript = [];
        resp.transcript.Words.forEach(word =>
          newTranscript.push({ word: word.Token, time: word.End }));

        this.setState({
          transcript: newTranscript,
        });
      })
      .catch(err => console.log('Error uploading video to CDN:', err));
    }
  }

  search(e){
    e.preventDefault();

    fetch("http://127.0.0.1:3000/api/videos/search/de5af6e0b1a73ca5ea8d97ef1d7802c2/" + this.state.query, {
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
      // this.render();
    })
    .catch((err)=> {
      console.log('error', err);
    });
  }

  // Video options form is rendered when the user has attached a file using Dropzone
  renderVideoOptionsForm() {
    return this.state.signedUrl ?
    (
      <div>
        <h3>Upload options</h3>
        <form onSubmit={this.submitVideoToCDN}>
          <div><input name="title" type="text" onChange={this.handleChange} placeholder={this.state.file.name} defaultValue={this.state.file.name} /></div>
          <div><input name="description" type="text" onChange={this.handleChange} placeholder="description" /></div>
          <div><span>Private:</span><input name="private" type="checkbox" onChange={this.handleChange} /></div>
          <div><input name="submit" type="submit" value="Upload into cloud" /></div>
        </form>
      </div>
    ) : null;
  }

  // Video is rendered after a successful upload to the CDN
  renderVideoModule() {
    return this.state.videoReturned ?
    (
      <div>
        <h3>Your video</h3>
        <video src={`https://d2bezlfyzapny1.cloudfront.net/${this.state.file.name}`} width="400" controls />
      </div>
    ) : null;
  }

  // Transcript is rendered after server-side transcription
  renderTranscript() {
    if (this.state.videoReturned) {
      if (this.state.transcript) {
        return (
          <div>
            <h3>Transcript</h3>
            <div>
              {this.state.transcript.map(pair => pair.word).reduce((firstword, secondword) => `${firstword} ${secondword}`)}
            </div>
          </div>
        );
      }

      return (
        <h3>Creating transcript</h3>
      );
    }

    return null;
  }

  // search form to find words in query
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

  // render results as word and time
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
    return (
      <div>
        <h1>
          Upload a video! {this.props.loggedIn}
        </h1>
        <Dropzone onDrop={this.attachUsingDropzone} size={150}>
          <div>
            Drop some files here!
          </div>
        </Dropzone>
        {
          this.renderVideoOptionsForm()
        }
        {
          this.renderVideoModule()
        }
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
}