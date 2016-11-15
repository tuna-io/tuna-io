import React from 'react';
import Dropzone from 'react-dropzone';

export default React.createClass({
  upload(files) {
    // console.log('file is', files[0]);
    var file = files[0];
    // console.log('file type and name', file.name, file.type);


    // var params = {
    //   Bucket: 'invalidmemories',
    //   Key: file.name,
    //   Expires: 300,
    //   ContentType: file.type
    // };

    fetch('http://localhost:3001/api/videos/sign', {
      method: 'GET',
      body: {
        'filename': file.name,
        'filetype': file.type
      }
    })
    .then((signedUrl) => {
      console.log('signedUrl is', signedUrl);
      return fetch('https://invalidmemories.s3-us-west-1.amazonaws.com/test.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAJL6WCO6QEBOZCTQA%2F20161115%2Fus-west-1%2Fs3%2Faws4_request&X-Amz-Date=20161115T054525Z&X-Amz-Expires=900&X-Amz-SignedHeaders=host&X-Amz-Signature=8284486127d84f1ccf080e2b1732d8cbbcaf280d6a436046fdbe755d8a900e7a', {
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