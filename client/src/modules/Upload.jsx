import React from 'react';
import Dropzone from 'react-dropzone';

export default class Upload extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      file: null,
      signedUrl: null,
      videoReturned: false,
      transcript: "",

      // Upload options
      title: "",
      description: "",
      private: false,
    };

    // Bind helper functions in constructor
    this.handleChange = this.handleChange.bind(this);
    this.submitVideoToCDN = this.submitVideoToCDN.bind(this);
    this.attachUsingDropzone = this.attachUsingDropzone.bind(this);
    this.renderVideoOptionsForm = this.renderVideoOptionsForm.bind(this);
    this.renderVideoModule = this.renderVideoModule.bind(this);
    this.renderTranscript = this.renderTranscript.bind(this);
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
    fetch('http://localhost:3000/api/s3', {
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
        return fetch('http://localhost:3000/api/videos', {
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
        this.render();
      })
      .catch(err => console.log('Error uploading video to CDN:', err));
    }
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

  render() {
    return (
      <div>
        <h1>
          Upload a video!
        </h1>
        <Dropzone onDrop={this.attachUsingDropzone.bind(this)} size={150}>
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
      </div>
    );
  }
}
