import React from 'react';
import { Link } from 'react-router';
import { Circle } from 'react-progressbar.js';
import DropzoneComponent from 'react-dropzone-component';

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

      // youtubeid
      youtubeID: '',
    };

    // Bind helper functions in constructor
    this.handleChange = this.handleChange.bind(this);
    this.submitVideoToCDN = this.submitVideoToCDN.bind(this);
    this.attachUsingDropzone = this.attachUsingDropzone.bind(this);
    this.renderVideoOptionsForm = this.renderVideoOptionsForm.bind(this);
    this.addToDb = this.addToDb.bind(this);
    this.downloadYoutube = this.downloadYoutube.bind(this);
    this.processVideo = this.processVideo.bind(this);
    this.getYoutubeID = this.getYoutubeID.bind(this);

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

  // given title, make unique hash id for video
  hash(len, an) {
    an = an && an.toLowerCase();
    var str = '', i = 0, min = an == 'a' ? 10 : 0, max = an == 'n' ? 10 : 62;
    for(; i++ < len; ) {
      var r = Math.random() * (max - min) + min << 0;
      str += String.fromCharCode(r += r > 9 ? r < 36 ? 55 : 61 : 48);
    }
    return str;
  }

  // TODO: make this work for dragged files
  // Triggered when user selects file for Dropzone
  // Use file information to retrieve signed URL
  attachUsingDropzone(files) {
    // We can refactor this if we want to support multiple upload
    const currFile = files;
    currFile.hash = this.hash(10) + '.webm';
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

  // TODO: make this work for webm format as well (server side?)
  // Get video metadata
  getVideoMetadata(url) {
    console.log("url for metadata is", url);
    return fetch(`/api/videos/metadata/${url}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then(data => data.json())
    .then((time) => {
      console.log("metadata time is", time);
      this.setState({ duration: time });
      this.trackProgress();
    })
    .catch(err => console.log('Error retrieving metadata:', err));
  }

  // send video info to server
  addToDb(){
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
  }


  // get metadata and add video to db
  processVideo(){
    this.setState({
      videoReturned: true,
    });

    // Get video metadata from the server
    this.getVideoMetadata(this.state.file.hash);

    // add info to database
    return this.addToDb()
    .then(data => data.json())
    .then((resp) => {
      console.log('resp.hash', resp.hash);
      this.setState({
        hash: resp.hash,
        duration: '',
      });
    })
    .catch(err => console.log('Error adding to db', err));
  }

  // Triggered on video options form submission
  submitVideoToCDN(event) {
    // Prevent page refresh
    event.preventDefault();

    if (this.state.signedUrl) {
      // Upload video into CDN
      return fetch(this.state.signedUrl, {
        method: 'PUT',
        body: this.state.file,
        headers: {
          'x-amz-acl': 'public-read',
        },
      })
      .then(() => {
        this.processVideo();
      })
      .catch((err) => {
        console.log('error putting to aws', err);
      });
    }
  }

  // on submit, hash youtube key and set to state
  getYoutubeID(event) {
    event.preventDefault();
    const generatedHash = this.hash(10);
    const newFilename = `${generatedHash}.mp4`;

    // youtube ids are the 11 numbers after the v=
    const id = this.state.link.split('v=')[1].slice(0, 11);
    this.setState({
      youtubeID: id,
      file: { name: newFilename, type: 'video/mp4', hash: newFilename },
      title: newFilename,
    });
  }

  // Send to server to donwload vid and then processes video
  // we can refactor this to support multiple youtube links at once
  downloadYoutube(event) {
    event.preventDefault();

    console.log('called downloadyoutube', this.state.file.name);

    // send video info to server for donwload
    return fetch('/api/videos/youtube', {
      method: 'POST',
      body: JSON.stringify({
        youtubeID: this.state.youtubeID,
        filename: this.state.file.name,
        filetype: '.mp4',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then(data => data.json())
    .then((resp) => {
      console.log('resp is', resp);
      // add video info to db
      this.processVideo();
    })
    .catch((err) => {
      console.log('error', err);
    });
  }

  // move progress bar given predicted transcription time
  trackProgress() {
    let timer = 0;

    setInterval(() => {
      if (timer <= this.state.duration) {
        timer += 0.1;
        const progress = timer / this.state.duration;
        this.setState({ progress: progress });
      }
    }, 100);
  }

  // Video options form is rendered when the user has attached a file using Dropzone
  // or linked to a youtube clip
  renderVideoOptionsForm() {
    return (this.state.signedUrl || this.state.youtubeID)
      && !this.state.duration && !this.state.hash ?
    (
      <div>
        <h3>Upload options</h3>
        <form onSubmit={this.state.signedUrl ? this.submitVideoToCDN : this.downloadYoutube}>
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

  // form for getting a youtube link
  renderYoutubeUploadForm() {
    return this.state.signedUrl ? null : (
      <div>
        <form onSubmit={this.getYoutubeID}>
          <span>Enter youtube link:</span>
          <input
            name="link" type="text"
            onChange={this.handleChange}
          />
        </form>
        <button onClick={this.getYoutubeID}> Submit </button>
      </div>
    );
  }

  // circular progress bar
  renderProgressBar() {
    return this.state.duration ?
    (
      <div>
        <Circle
          progress={this.state.progress}
          text={"Transcribing video... " + Math.floor(this.state.progress * 100, 2) + "%"}
          options={{ strokeWidth: 5 }}
          initialAnimate
          containerStyle={{
            width: "200px",
            height: "200px",
          }}
          containerClassName={".progressbar"} />
      </div>
    ) : null;
  }

  // Video is rendered after a successful upload to the CDN
  renderVideoLink() {
    return this.state.hash ? (<div>See video here: <Link to={`/videos/${this.state.hash}`}>{ this.state.title }</Link></div>)
      : null;
  }

  removeVideo() {
    console.log('this.signedurl', this.state.signedUrl);
    return this.setState({ signedUrl: '' });
  }

  // TODO: determine if event handlers can go in constructor
  render() {
    const config = this.componentConfig;
    const djsConfig = this.djsConfig;

    const eventHandlers = {
      init: dz => this.dropzone = dz,
      drop: this.attachUsingDropzone.bind(this),
      addedfile: this.attachUsingDropzone.bind(this),
    };

    return (
      <div>
        <h1>
          Upload a video!
        </h1>
        <DropzoneComponent
          config={config}
          eventHandlers={eventHandlers}
          djsConfig={djsConfig}
        />
        {
          this.renderYoutubeUploadForm()
        }
        {
          this.renderVideoOptionsForm()
        }
        {
          this.renderProgressBar()
        }
        {
          this.renderVideoLink()
        }
      </div>
    );
  }
}
