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

  renderThumbnailPicker() {
    if (this.state.showPicker) {
      console.log('showing');
      return (
        <div>The picker is going to be here</div>
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
        </form>
        {this.renderThumbnailPicker()}
      </div>
    );
  }
}

export default ThumbnailGenerator;
