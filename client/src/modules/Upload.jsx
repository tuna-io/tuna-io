import React from 'react';
import Dropzone from 'react-dropzone';

export default class Upload extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      transcript: [{ word: "holdya", time: 1 }, { word: "breath", time: 2 }],
      file: null,
      videoReturned: false,
      signedUrl: null,
    };
  }

  submitVideo() {
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
        return fetch('http://localhost:3000/api/videos', {
          method: 'POST',
          body: JSON.stringify({
            title: 'test',
            url: `https://s3-us-west-1.amazonaws.com/invalidmemories/${this.state.file.name}`,
            creator: 'bill',
            private: false,
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
  upload(files) {
    const file = files[0];
    this.setState({
      videoReturned: false,
      file: file,
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

  render() {
    console.log('rendering now');
    return (
      <div>
        <div>
          This is the upload subpage
        </div>
        <Dropzone onDrop={this.upload.bind(this)} size={150}>
          <div>
            Drop some files here!
          </div>
        </Dropzone>
        <button onClick={this.submitVideo.bind(this)}>Upload into the cloud</button>
        <div>Transcript</div>
        <div>
          {this.state.transcript.map(pair => pair.word).reduce((firstword, secondword) => `${firstword} ${secondword}`)}
        </div>
        {this.state.videoReturned ? (<video src={`https://d2bezlfyzapny1.cloudfront.net/${this.state.file.name}`} width="400" controls />) : null }
      </div>
    );
  }
}
