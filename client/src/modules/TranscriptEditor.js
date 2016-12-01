import React from 'react';
import '../index.css';

class TranscriptEditor extends React.Component {
  constructor(props) {
    super(props);

    // Shallow copy transcript to preserve potential changes
    const transcriptCopy = props.transcript.slice();

    this.state = {
      transcript: props.transcript,
      transcriptCopy,
    };

    this.renderTranscriptAsParagraph = this.renderTranscriptAsParagraph.bind(this);
    this.renderEditableTranscript = this.renderEditableTranscript.bind(this);
    this.handleTranscriptEdit = this.handleTranscriptEdit.bind(this);
    this.submitTranscriptForm = this.submitTranscriptForm.bind(this);
  }


  // Handles form submission
  submitTranscriptForm(event) {
    event.preventDefault();

    // Wrap array of words with outer object
    const transcriptWrapper = {
      Words: this.state.transcript,
    };

    // Fetch data from API endpoint
    const apiEndpoint = `/api/videos/transcript/${this.props.videoId}`;
    fetch(apiEndpoint, {
      method: 'POST',
      body: JSON.stringify(transcriptWrapper),
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then(data => data.json())
    .then(() => {
      // Replace current transcript
      this.setState({ transcript: this.state.transcriptCopy });
    })
    .catch((err) => {
      console.log('Error updating transcript:', err);
    });
  }

  // Handles editing of every transcript word
  handleTranscriptEdit(event) {
    this.state.transcriptCopy[event.target.name].Token = event.target.value;

    this.setState({
      transcriptCopy: this.state.transcriptCopy,
    });
  }

  // Render the transcript paragraph-style
  renderTranscriptAsParagraph() {
    return (
      this.state.transcript.map(pair => pair.Token).reduce((firstword, secondword) => `${firstword} ${secondword}`)
    );
  }

  // Render an editable table
  renderEditableTranscript() {
    return (
      <div id="transcript-editor">
        <div className="transcript-table transcript-editor-box">
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
                    {pair.Begin}
                  </td>
                  <td>
                    {pair.End}
                  </td>
                  <td>
                    <input type="text" key={index} name={index} onChange={this.handleTranscriptEdit} defaultValue={pair.Token}></input>
                  </td>
                </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div className="transcript-editor-box transcript-editor-submit">
          <form onSubmit={this.submitTranscriptForm}>
            <input type="submit" value="Submit" />
          </form>
        </div>
      </div>
    );
  }

  render() {
    return (
      <div>
        <div>
          {
            this.renderEditableTranscript()
          }
        </div>
      </div>
    );
  }
}

export default TranscriptEditor;
