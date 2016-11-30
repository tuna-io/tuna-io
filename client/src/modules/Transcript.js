import React from 'react';

class Transcript extends React.Component {
  constructor(props) {
    super(props);

    // Shallow copy transcript to preserve potential changes
    const transcriptCopy = props.transcript.slice();

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

    fetch(`/api/search/crud/videos/${this.props.videoId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then(data => console.log('Successfully updated ElasticSearch', data))
    .catch(err => console.log('Error updating ElasticSearch', err));
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
