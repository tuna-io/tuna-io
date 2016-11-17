import React from 'react';
import Dropzone from 'react-dropzone';

const videoStyle = {
  'width': '600px',
  'height': '600px',
};

export default React.createClass({
  
  // upload params: file dragged into dropzone
  // sends filename to server to get signed url, then uploads the file to AWS
  upload(files) {
    var file = files[0];

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
          body: file
        });
    })
    .then((data) => {
      console.log('we got data', data, 'and', data.body);
      // return data.json();
      // var params = {
      //     'title': 'test',
      //     'url': 'https://d2bezlfyzapny1.cloudfront.net/bill_10s.mp4',
      //     'creator': 'bill',
      //     'private': false
      //   };
      // var form = new FormData();

      // for (var key in params) {
      //   form.append(key, params[key]);
      // }

      return fetch('http://localhost:3000/api/videos', {
        method: 'POST',
        body: JSON.stringify({
          'title': 'test',
          'url': 'https://d2bezlfyzapny1.cloudfront.net/bill_10s.mp4',
          'creator': 'bill',
          'private': false
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
    })
    .then((rawResp)=> {
      console.log('raw resp returned');
      return rawResp.json();
    })
    .then((resp)=> {
      console.log('fetch returned', resp);
    })
    .catch((err) => {
      console.log('error uploading', err);
    });
  },

  render() {
    return (
      <div>
        <div>
          This is the upload subpage
        </div>
        <Dropzone onDrop={ this.upload } size={ 150 }>
          <div>
            Drop some files here!
          </div>
        </Dropzone>
        <video muted='true' src="https://d2bezlfyzapny1.cloudfront.net/bill_10s.mp4" style={videoStyle}/>
      </div>
      );
  }
});
