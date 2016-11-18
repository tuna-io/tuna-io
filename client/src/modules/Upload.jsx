import React from 'react';
import Dropzone from 'react-dropzone';


const videoStyle = {
  width: '800px',
  height: '800px'
};

export default class Upload extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      transcript: [{"word": "holdya", "time": 1}, {"word": "breath", "time": 2}],
      filename: "",
      videoReturned: false
    }
  }
  // upload params: file dragged into dropzone
  // sends filename to server to get signed url, then uploads the file to AWS
  upload(files) {
    var file = files[0];
    this.setState({
      videoReturned: false,
      filename: file.name
    });

    fetch('http://localhost:3000/api/s3', {
      method: 'POST',
      body: JSON.stringify({
        'filename': file.name,
        'filetype': file.type
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then((data) => {
      // need to get json of response
      return data.json();
    })
    .then((signedUrl) => {

      return fetch(signedUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'x-amz-acl': 'public-read'
          }
        });
    })
    .then((data) => {
      // console.log('we got data', data, 'and', data.body);
      // console.log('filename', file.name);
      this.setState({
        videoReturned: true
      });

      return fetch('http://localhost:3000/api/videos', {
        method: 'POST',
        body: JSON.stringify({
          'title': 'test',
          'url': 'https://s3-us-west-1.amazonaws.com/invalidmemories/' + file.name,
          'creator': 'bill',
          'private': false
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
    })
    .then((rawResp)=> {
      // console.log('raw resp returned');
      return rawResp.json();
    })
    .then((resp)=> {
      console.log('fetch returned', resp);
      var newTranscript = [];
      // console.log("fetch transcript", resp.transcript);
      resp.transcript.Words.forEach((word)=> {
        newTranscript.push({"word": word.Token, "time": word.End});
      });

      this.setState({
        transcript: newTranscript
      });
      console.log("new transcript is", this.state.transcript, this);
      this.render();
      // console.log('should have rendered');
    
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
        <Dropzone onDrop={ this.upload.bind(this) } size={ 150 }>
          <div>
            Drop some files here!
          </div>
        </Dropzone>
        <div>Transcript</div>
        <div>
          {this.state.transcript.map((pair)=> {return pair.word;}).reduce((firstword, secondword) => {return firstword + " " + secondword;})}
        </div>
        {this.state.videoReturned ? (<video autoPlay src={"https://d2bezlfyzapny1.cloudfront.net/" + this.state.filename} style={videoStyle}/>) : null }
      </div>
    )
  }
}
