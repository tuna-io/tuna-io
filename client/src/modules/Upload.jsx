import React from 'react';
import Dropzone from 'react-dropzone';


const videoStyle = {
  width: '800px',
  height: '800px',
};

export default class Upload extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      transcript: [{ word: "holdya", time: 1 }, { word: "breath", time: 2 }],
      filename: "",
      videoReturned: false,
    };
  }
  // upload params: file dragged into dropzone
  // sends filename to server to get signed url, then uploads the file to AWS
  upload(files) {
    const file = files[0];
    this.setState({
      videoReturned: false,
      filename: file.name,
    });

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
    // need to get json of response
    .then(data => data.json())
    .then(signedUrl =>
      fetch(signedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'x-amz-acl': 'public-read',
        },
      }),
    )
    .then((data) => {
      this.setState({
        videoReturned: true,
      });

      return fetch('http://localhost:3000/api/videos', {
        method: 'POST',
        body: JSON.stringify({
          title: 'test',
          url: `https://s3-us-west-1.amazonaws.com/invalidmemories/${file.name}`,
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
        <div>Transcript</div>
        <div>
          {this.state.transcript.map(pair => pair.word).reduce((firstword, secondword) => `${firstword} ${secondword}`)}
        </div>
        {this.state.videoReturned ? (<video autoPlay src={`https://d2bezlfyzapny1.cloudfront.net/${this.state.filename}`} style={videoStyle} />) : null }
      </div>
    );
  }
}
