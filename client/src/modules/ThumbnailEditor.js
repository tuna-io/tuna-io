import React from 'react';

class ThumbnailEditor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      newDataUrl: null,
      currentDataUrl: props.dataUrl,
    };

    this.handleThumbnailCapture = this.handleThumbnailCapture.bind(this);
    this.handleThumbnailSave = this.handleThumbnailSave.bind(this);
    this.renderThumbnailPicker = this.renderThumbnailPicker.bind(this);
    this.renderSaveButton = this.renderSaveButton.bind(this);
  }

  handleThumbnailCapture(event) {
    event.preventDefault();

    const video = document.getElementById('my-video_html5_api');
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');

    debugger;

    // Draw the screenshot on the canvas. Note: Currently canvas is not responsive for small screens
    context.drawImage(video, 0, 0, videoWidth, videoHeight, 0, 0, canvas.width, canvas.height);

    // Create Data URL and save to statej.
    this.setState({ newDataUrl: canvas.toDataURL() });
  }

  handleThumbnailSave(event) {
    event.preventDefault();

    if (this.state.newDataUrl) {
      // Persist DataUrl in Redis
      fetch(`/api/videos/thumbnail/${this.props.videoID}`, {
        method: 'POST',
        body: JSON.stringify({
          DataUrl: this.state.newDataUrl,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then(res => res.json())
      .then(() => {
        this.setState({ currentDataUrl: this.state.newDataUrl });
        this.setState({ newDataUrl: null });
      })
      .catch((err) => {
        console.log("Error persisting thumbnail:", err);
      });
    }
  }

  renderThumbnailPicker() {
    const video = document.getElementById('my-video_html5_api');
    const canvasWidth = video.getBoundingClientRect().width / 2;
    const canvasHeight = video.getBoundingClientRect().height / 2;

    return (
      <div>
        <canvas id="canvas" width={canvasWidth} height={canvasHeight}></canvas>
        {
          this.state.currentDataUrl ?
          (<div>
            <div>Current thumbnail</div>
            <img src={this.state.currentDataUrl} />
          </div>) : null
        }
      </div>
    );
  }

  renderSaveButton() {
    return this.state.newDataUrl ?
    (
      <button onClick={this.handleThumbnailSave}>Save</button>
    ) : null;
  }

  render() {
    return (
      <div>
        <div>
          <h3>Press capture to create a new thumbnail</h3>
          <button onClick={this.handleThumbnailCapture}>Capture</button>
          {this.renderSaveButton()}
        </div>
        {this.renderThumbnailPicker()}
      </div>
    );
  }
}

export default ThumbnailEditor;
