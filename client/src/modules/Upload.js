import React from 'react';
import { Link } from 'react-router';
import { Circle } from 'react-progressbar.js';
import DropzoneComponent from 'react-dropzone-component';

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

      // metadata
      duration: '',
      progress: '',
    };

    // Bind helper functions in constructor
    this.handleChange = this.handleChange.bind(this);
    this.submitVideoToCDN = this.submitVideoToCDN.bind(this);
    this.attachUsingDropzone = this.attachUsingDropzone.bind(this);
    this.renderVideoOptionsForm = this.renderVideoOptionsForm.bind(this);

    this.djsConfig = {
      addRemoveLinks: true,
      acceptedFiles: 'video/*',
      autoProcessQueue: false,
    };

    this.componentConfig = {
      iconFiletypes: ['.mov', '.mp4', '.webm', '.mkv'],
      showFiletypeIcon: true,
      postUrl: 'no-url',
    };

    this.dropzone = null;
  }

  hash(str) {
    return str.split("").reduce(function(a,b) {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a&a;
    }, 0); 
  }

  // Triggered when user drops file into Dropzone
  // Use file information to retrieve signed URL
  attachUsingDropzone(files) {
    // We can refactor this if we want to support multiple upload
    const currFile = files;
    currFile.hash = this.hash(currFile.name) + '.mp4';
    this.setState({
      videoReturned: false,
      file: currFile,
      title: currFile.hash,
    });

    // Fetch signed URL
    fetch('/api/s3', {
      method: 'POST',
      body: JSON.stringify({
        filename: currFile.hash,
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

  // Get video metadata
  getVideoMetadata(url) {
    return fetch(`/api/videos/metadata/${url}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    .then(jsonRes => jsonRes.json())
    .then(res => {
      this.setState({ duration: res });
      this.trackProgress();
    })
    .catch(err => console.log('Error retrieving metadata:', err));
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
        this.getVideoMetadata(this.state.file.hash);

        return fetch('/api/videos', {
          method: 'POST',
          body: JSON.stringify({
            title: this.state.title,
            creator: this.props.loggedIn,
            description: this.state.description,
            extension: this.state.file.type,
            private: this.state.private,
            url: `https://s3-us-west-1.amazonaws.com/invalidmemories/${this.state.file.hash}`,
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
          duration: '',
        });
      })
      .catch(err => console.log('Error uploading video to CDN:', err));
    }
  }

  // Video options form is rendered when the user has attached a file using Dropzone
  renderVideoOptionsForm() {
    return this.state.signedUrl && !this.state.duration && !this.state.hash ?
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

  trackProgress() {
    let timer = 0;

    setInterval(() => {
      if (timer <= this.state.duration) {
        timer += 0.1;
        let progress = timer / this.state.duration;
        this.setState({progress: progress});
      }
    }, 100).bind(this);
  }

  renderProgressBar() {
    return this.state.duration ? 
    (
      <div>
        <Circle
          progress={this.state.progress}
          text={'Transcribing video... ' + Math.floor(this.state.progress * 100, 2) + '%'}
          options={{strokeWidth: 5}}
          initialAnimate={true}
          containerStyle={{
            width: '200px',
            height: '200px',
          }}
          containerClassName={'.progressbar'} />
      </div>
    ) : null;
  }

  // Video is rendered after a successful upload to the CDN
  renderVideoModule() {
    return this.state.hash ? (<div>See video here: <Link to={`/videos/${this.state.hash}`}>{ this.state.title }</Link></div>)
      : null;
  }

  removeVideo() {
    console.log('this.signedurl', this.state.signedUrl);
    return this.setState({ signedUrl: '' });
  }

  render() {
    const config = this.componentConfig;
    const djsConfig = this.djsConfig;

    const eventHandlers = {
      init: dz => this.dropzone = dz,
      drop: this.attachUsingDropzone.bind(this),
      addedfile: this.attachUsingDropzone.bind(this),
    }

    return (
      <div>
        <h1>
          Upload a video!
        </h1>
        <DropzoneComponent
          config={config}
          eventHandlers={eventHandlers}
          djsConfig={djsConfig} />
        {
          this.renderVideoOptionsForm()
        }
        {
          this.renderProgressBar()
        }
        {
          this.renderVideoModule()
        }
      </div>
    );
  }
}
