import React from 'react';

class Transcript extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      inEditMode: false,
    };

    this.changeMode = this.changeMode.bind(this);
  }

  changeMode(event) {
    this.setState({ inEditMode: event.target.checked });
  }

  render() {
    return (
      <div>
        <span>Edit mode: </span><input type="checkbox" onChange={this.changeMode} />
        <div>
          {
            !this.state.inEditMode ?
            this.props.transcript.map(pair => pair.word).reduce((firstword, secondword) => `${firstword} ${secondword}`) : null
          }
        </div>
      </div>
    );
  }
}

export default Transcript;
