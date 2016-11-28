import React from 'react';
import _ from 'lodash';

class Transcript extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      inEditMode: false,
    };

    this.changeMode = this.changeMode.bind(this);
    this.renderTranscriptAsParagraph = this.renderTranscriptAsParagraph.bind(this);
    this.renderEditableTranscript = this.renderEditableTranscript.bind(this);
    this.handleTranscriptEdit = this.handleTranscriptEdit.bind(this);
    this.submitTranscriptForm = this.submitTranscriptForm.bind(this);
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
            {this.props.transcript.map((pair, index) => (
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

  handleTranscriptEdit(event) {
    console.log(event.target.name, event.target.value);
  }

  submitTranscriptForm(event) {
    event.preventDefault();
    console.log('form submitted');
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
