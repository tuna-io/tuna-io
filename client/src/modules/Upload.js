import React from 'react';
import Dropzone from 'react-dropzone';
import { Link } from 'react-router';

// TODO: render video details page instead of duplicating functionality
export default class Upload extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      file: null,
      signedUrl: null,
      videoReturned: false,

      // Upload options
      title: '',
      description: '',
      private: false,
      hash: '',
    };

    // Bind helper functions in constructor
    this.handleChange = this.handleChange.bind(this);
    this.submitVideoToCDN = this.submitVideoToCDN.bind(this);
    this.attachUsingDropzone = this.attachUsingDropzone.bind(this);
    this.renderVideoOptionsForm = this.renderVideoOptionsForm.bind(this);
  }

  // Triggered when user drops file into Dropzone
  // Use file information to retrieve signed URL
  attachUsingDropzone(files) {
    const currFile = files[0];
    this.setState({
      videoReturned: false,
      file: currFile,
      title: currFile.name,
    });

    // Fetch signed URL
    fetch('/api/s3', {
      method: 'POST',
      body: JSON.stringify({
        filename: currFile.name,
        filetype: currFile.type,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then(data => data.json())
    .then((url) => {
      this.setState({ signedUrl: url });
    })
    .catch((err) => {
      console.log('Error retrieving signed URL:', err);
    });
  }

  // Handle video options form change
  handleChange(event) {
    // Retrieve checkbox data using event.target.checked
    const value = event.target.name === 'private' ? event.target.checked : event.target.value;
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
        return fetch('/api/videos', {
          method: 'POST',
          body: JSON.stringify({
            title: this.state.title,
            creator: this.props.loggedIn,
            description: this.state.description,
            extension: this.state.file.type,
            private: this.state.private,
            url: `https://s3-us-west-1.amazonaws.com/invalidmemories/${this.state.file.name}`,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        })
        .catch(err => console.log('Error posting video to /api/videos:', err));
      })
      .then(rawResp => rawResp.json())
      .then((resp) => {
        console.log('resp.hash', resp.hash);
        this.setState({
          hash: resp.hash,
        });
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
          <div>
            <input
              name="title" type="text" onChange={this.handleChange}
              placeholder={this.state.file.name} defaultValue={this.state.file.name}
            />
          </div>
          <div>
            <input
              name="description" type="text" onChange={this.handleChange}
              placeholder="description"
            />
          </div>
          <div>
            <span>Private:</span>
            <input name="private" type="checkbox" onChange={this.handleChange} />
          </div>
          <div>
            <input name="submit" type="submit" value="Upload into cloud" />
          </div>
        </form>
      </div>
    ) : null;
  }

  // Video is rendered after a successful upload to the CDN
  renderVideoModule() {
    return this.state.hash ? (<div>See video here: <Link to={`/videos/${this.state.hash}`}>{ this.state.title }</Link></div>) 
      : null;
  }

  render() {
    return (
      <div>
        <h1>
          Upload a video!
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
      </div>
    );
  }
}
