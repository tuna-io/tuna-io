import React from 'react';

class Transcript extends React.Component {
  constructor(props) {
    super(props);

    this.renderTranscriptAsParagraph = this.renderTranscriptAsParagraph.bind(this);
  }

  // Render the transcript paragraph-style
  renderTranscriptAsParagraph() {
    return (
      this.props.transcript.map(pair => pair.Token).reduce((firstword, secondword) => `${firstword} ${secondword}`)
    );
  }

  render() {
    return (
      <div>
        {
          this.renderTranscriptAsParagraph()
        }
      </div>
    );
  }
}

export default Transcript;
