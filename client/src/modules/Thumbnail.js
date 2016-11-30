import React from 'react';

class ThumbnailGenerator extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showPicker: false,
      newDataUrl: null,
      currentDataUrl: props.dataUrl,
    };

    this.handleShowThumbnailPicker = this.handleShowThumbnailPicker.bind(this);
    this.handleThumbnailCapture = this.handleThumbnailCapture.bind(this);
    this.handleThumbnailSave = this.handleThumbnailSave.bind(this);
    this.renderThumbnailPicker = this.renderThumbnailPicker.bind(this);
  }

  handleShowThumbnailPicker(event) {
    this.setState({ showPicker: event.target.checked });
  }

  handleThumbnailCapture(event) {
    event.preventDefault();

    const video = document.getElementById('my-video_html5_api');
    const videoWidth = video.getBoundingClientRect().width;
    const videoHeight = video.getBoundingClientRect().height;
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');

    // Draw the screenshot on the canvas. Note: Currently canvas is not responsive for small screens
    context.drawImage(video, 0, 0, videoWidth * 2, videoHeight * 2,
      0, 0, videoWidth / 2, videoHeight / 2);

    // Create Data URL and save to statej.
    this.setState({ newDataUrl: canvas.toDataURL() });
  }

  handleThumbnailSave(event) {
    event.preventDefault();

    if (this.state.newDataUrl) {
      // Retrieve the signed URL from server
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
      })
      .catch((err) => {
        console.log("Error persisting thumbnail:", err);
      });
    }
  }

  renderThumbnailPicker() {
    if (this.state.showPicker) { // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage
      const video = document.getElementById('my-video_html5_api'); // https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Pixel_manipulation_with_canvas
      const canvasWidth = video.getBoundingClientRect().width / 2;
      const canvasHeight = video.getBoundingClientRect().height / 2;

      return (
        <div>
          <div>Press Capture to select a new thumbnail!</div>
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

    return null;
  }

  render() {
    return (
      <div>
        <form>
          <span>Show thumbnail picker </span>
          <input type="checkbox" onChange={this.handleShowThumbnailPicker} />
          {
            this.state.showPicker ?
            (
              <span>
                <button onClick={this.handleThumbnailCapture}>Capture</button>
                <button onClick={this.handleThumbnailSave}>Save</button>
              </span>
            )
             : null
          }
        </form>
        {this.renderThumbnailPicker()}
      </div>
    );
  }
}

export default ThumbnailGenerator;
