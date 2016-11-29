import React from 'react';

class ThumbnailGenerator extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showPicker: false,
    };

    this.handleShowThumbnailPicker = this.handleShowThumbnailPicker.bind(this);
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

    canvas.getContext('2d').drawImage(video, 0, 0, videoWidth * 2, videoHeight * 2, 0, 0, videoWidth / 2, videoHeight / 2);
  }

  handleThumbnailSave(event) {
    event.preventDefault();

    // Save the image to a CDN
  }

  renderThumbnailPicker() {
    if (this.state.showPicker) { // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage
      const video = document.getElementById('my-video_html5_api');
      const canvasWidth = video.getBoundingClientRect().width / 2;
      const canvasHeight = video.getBoundingClientRect().height / 2;

      return (
        <div>
          <canvas id="canvas" width={canvasWidth} height={canvasHeight}></canvas>
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
                <button onClick={this.handleThumbnailCapture}>Save</button>
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
