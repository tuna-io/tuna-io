import React from 'react';
import Dropzone from 'react-dropzone';

export default class Upload extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      transcript: "",
      file: null,
      videoReturned: false,
      signedUrl: null,
      title: "",
      description: "",
      private: false,
    };
  }

  handleChange(event) {
    const value = event.target.name === "private" ? event.target.checked : event.target.value;
    this.setState({ [event.target.name]: value });
    console.log(this.state.title);
  }

  submitVideo(event) {
    event.preventDefault();

    if (this.state.signedUrl) {
      console.log('about to upload to S3');
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

        console.log('video returned from S3. data is:', data);

        // POST video metadata to the server
        console.log(this.state.title, this.state.description, this.state.private);
        return fetch('http://localhost:3000/api/videos', {
          method: 'POST',
          body: JSON.stringify({
            title: this.state.title,
            description: this.state.description,
            url: `https://s3-us-west-1.amazonaws.com/invalidmemories/${this.state.file.name}`,
            creator: 'bill',
            private: this.state.private,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        });
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
        console.log("new transcript is", this.state.transcript, this);
        this.render();
      })
      .catch((err) => {
        console.log('error uploading', err);
      });
    }
  }

  // upload params: file dragged into dropzone
  // sends filename to server to get signed url, then uploads the file to AWS
  uploadUsingDropzone(files) {
    const file = files[0];
    this.setState({
      videoReturned: false,
      file: file,
      title: file.name,
    });

    // Get the signed URL
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
    // Upload the video to the CDN
    .then((signedUrl) => {
      this.setState({ signedUrl: signedUrl });
      console.log('returned signed URL:', this.state.signedUrl);
    });
  }

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
    console.log('rendering now');
    return (
      <div>
        <div>
          This is the upload subpage
        </div>
        <Dropzone onDrop={this.uploadUsingDropzone.bind(this)} size={150}>
          <div>
            Drop some files here!
          </div>
        </Dropzone>
        {
          this.state.signedUrl ?
          (
            <div>
              <h3>Upload options</h3>
              <form onSubmit={this.submitVideo.bind(this)}>
                <input name="title" type="text" onChange={this.handleChange.bind(this)} placeholder={this.state.file.name} defaultValue={this.state.file.name} />
                <input name="description" type="text" onChange={this.handleChange.bind(this)} placeholder="description" />
                <span>Private:</span><input name="private" type="checkbox" onChange={this.handleChange.bind(this)}  />
                <input name="submit" type="submit" value="Upload into cloud" />
              </form>
            </div>
          ) : null
        }
        {
          this.state.videoReturned ?
          (
            <div>
              <h3>Your video</h3>
              <video src={`https://d2bezlfyzapny1.cloudfront.net/${this.state.file.name}`} width="400" controls />
            </div>) : null
          }
        {
          this.renderTranscript()
        }
      </div>
    );
  }
}
