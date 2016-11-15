import React from 'react';
import Dropzone from 'react-dropzone';

export default React.createClass({
  
  // upload params: file dragged into dropzone
  // sends filename to server to get signed url, then uploads the file to AWS
  upload(files) {
    var file = files[0];

    fetch('http://localhost:3001/api/s3', {
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
    }).then((signedUrl) => {

      return fetch(signedUrl, {
          method: 'PUT',
          body: file
        });
    })
    .then((data) => {
      console.log('we got data', data);
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
      </div>
      );
  }
})