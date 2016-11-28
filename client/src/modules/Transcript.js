import React from 'react';

class Transcript extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      inEditMode: false,
    };

    this.changeMode = this.changeMode.bind(this);
    this.renderTranscriptAsParagraph = this.renderTranscriptAsParagraph.bind(this);
    this.renderEditableTranscript = this.renderEditableTranscript.bind(this);
  }

  changeMode(event) {
    this.setState({ inEditMode: event.target.checked });
  }

  renderTranscriptAsParagraph() {
    return (
      this.props.transcript.map(pair => pair.word).reduce((firstword, secondword) => `${firstword} ${secondword}`)
    );
  }

  renderEditableTranscript() {
    return (
      <table>
        <thead>
          <tr>
            <th>Start</th>
            <th>End</th>
            <th>Word</th>
          </tr>
        </thead>
        <tbody>
          {this.props.transcript.map(pair => (
            <tr>
              <td>
                {pair.endtime}
              </td>
              <td>
                {pair.starttime}
              </td>
              <td>
                {pair.word}
              </td>
            </tr>
            ))}
        </tbody>
      </table>
    );
  }

  render() {
    return (
      <div>
        <span>Edit mode: </span><input type="checkbox" onChange={this.changeMode} />
        <div>
          {
            !this.state.inEditMode ?
            this.renderTranscriptAsParagraph() : this.renderEditableTranscript()
          }
        </div>
      </div>
    );
  }
}

export default Transcript;
