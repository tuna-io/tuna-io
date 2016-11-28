import React from 'react';

class Transcript extends React.Component {
  render() {
    return (
      <div>
        {this.props.transcript.map(pair => pair.word).reduce((firstword, secondword) => `${firstword} ${secondword}`)}
      </div>
    );
  }
}

export default Transcript;
