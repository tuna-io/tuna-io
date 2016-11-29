import React from 'react';
import _ from 'lodash';

class Transcript extends React.Component {
  constructor(props) {
    super(props);

    // Shallow copy transcript to preserve potential changes
    const transcriptCopy = _.assign({}, props.transcript);

    this.state = {
      inEditMode: false,
      transcript: props.transcript,
      transcriptCopy,
    };

    this.changeMode = this.changeMode.bind(this);
    this.renderTranscriptAsParagraph = this.renderTranscriptAsParagraph.bind(this);
    this.renderEditableTranscript = this.renderEditableTranscript.bind(this);
    this.handleTranscriptEdit = this.handleTranscriptEdit.bind(this);
    this.submitTranscriptForm = this.submitTranscriptForm.bind(this);
  }

  // Handles checkbox toggle
  changeMode(event) {
    this.setState({ inEditMode: event.target.checked });
  }

  // Handles form submission
  submitTranscriptForm(event) {
    event.preventDefault();
    // console.log(JSON.stringify(this.state.transcriptCopy[0]));

    console.log(`/api/videos/transcript/${this.props.videoId}`);
    // fetch(`/api/videos/transcript${this.props.currentVideoId}`)
    // TODO send a POST or PUT request to submit the transcript
    // Upon success, replace current transcript
  }

  // Handles editing of every transcript word
  handleTranscriptEdit(event) {
    this.state.transcriptCopy[event.target.name].word = event.target.value;

    this.setState({
      'transcriptCopy': this.state.transcriptCopy,
    });
  }

  // Render the transcript paragraph-style
  renderTranscriptAsParagraph() {
    return (
      this.state.transcript.map(pair => pair.word).reduce((firstword, secondword) => `${firstword} ${secondword}`)
    );
  }

  // Render an editable table
  renderEditableTranscript() {
    return (
      <div>
        <table>
          <thead>
            <tr>
              <th>Start</th>
              <th>End</th>
              <th>Word</th>
            </tr>
          </thead>
          <tbody>
            {this.state.transcript.map((pair, index) => (
              <tr>
                <td>
                  {pair.endtime}
                </td>
                <td>
                  {pair.starttime}
                </td>
                <td>
                  <input type="text" key={index} name={index} onChange={this.handleTranscriptEdit} defaultValue={pair.word}></input>
                </td>
              </tr>
              ))}
          </tbody>
        </table>
        <form onSubmit={this.submitTranscriptForm}>
          <input type="submit" value="Submit" />
        </form>
      </div>
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
