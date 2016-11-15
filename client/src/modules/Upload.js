import React from 'react';
import Dropzone from 'react-dropzone';

export default React.createClass({
  upload(files) {
    // console.log('file is', files[0]);
    var file = files[0];
    // console.log('file type and name', file.name, file.type);

    fetch('http://localhost:3001/api/videos/sign', {
      method: 'POST',
      body: {
        'filename': file.name,
        'filetype': file.type
      }
    })
    .then((data) => {
      console.log('signedUrl is', data);
      console.log('json is', data.json);
      return fetch('https://invalidmemories.s3-us-west-1.amazonaws.com/test.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAJL6WCO6QEBOZCTQA%2F20161115%2Fus-west-1%2Fs3%2Faws4_request&X-Amz-Date=20161115T184651Z&X-Amz-Expires=900&X-Amz-SignedHeaders=host&X-Amz-Signature=1ebeb11dee8b36d85abafe8009cf958385fa5f6aa1b4ed6baa24d818253c5c3f', {
          method: 'PUT',
          headers: {
            'Content-Type': file.type
          },
          body: file
        });
    })
    .then((data) => {
      console.log('we got data', data);
    })
    .catch((err) => {
      console.log('error uploading', err);
    });
        // axios.post(signedUrl, file, options)
        // .then((result)=> {
        //   console.log('ax uploaded', result);
        // })
        // .catch((err) => {
        //   console.log('ax err', err);
        // });
        // return data;
    //   }
    // });
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