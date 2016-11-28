import React from 'react';
import { Col } from 'react-flexgrid';
import { Badge, Space, InlineForm, Panel, PanelHeader, Text, Avatar, Heading, Flex, Donut, Stat } from 'rebass';
import Wordcloud from './Wordcloud';
import Transcript from './Transcript';

class TranscriptionUtilities extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      searchResults: [],
      query: '',
    };

    this.search = this.search.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.findTime = this.findTime.bind(this);
  }

  handleChange(event) {
    // Retrieve checkbox data using event.target.checked
    const value = event.target.name === 'private' ? event.target.checked : event.target.value;
    this.setState({ [event.target.name]: value });
  }

  search(e) {
    e.preventDefault();
    fetch('/api/videos/search/' + this.state.currentVideoDetails.hash + '/' + this.state.query, {
      method: "GET",
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then(resp => resp.json())
    .then((newSearchResults) => {
      this.setState({
        searchResults: newSearchResults,
      });
    })
    .catch((err) => {
      console.log('error', err);
    });
  }


  findTime(time) {
    this.myVideo.currentTime = time;
  }

  // Transcript is rendered after server-side transcription
  renderTranscript() {
    return (
      <div>
        <h3>Transcript: </h3>
        {this.props.transcript.length ? (
          <Transcript transcript={this.props.transcript} />
          ) : null
        }
      </div>
    );
  }

  renderWordcloud() {
    return this.props.transcript.length ?
      (
        <Wordcloud transcript={this.props.transcript} />
      ) : null;
  }

  renderSearchForm() {
    if (this.props.transcript.length) {
      return (
        <InlineForm
          buttonLabel="Search" label="InlineForm" name="query"
          onChange={this.handleChange} onClick={this.search}
        />
      );
    }
    return null;
  }

  renderSearchResults() {
    if (this.props.transcript.length) {
      return (
        <div>
          <div> Search results: </div>
          <div>
            {this.props.searchResults ? (this.props.searchResults.map(i =>
              (
                <button onClick={
                  this.findTime.bind(this, this.props.transcript[i].endtime)}
                >
                  {
                    Math.floor(this.props.transcript[i].endtime / 60) + ":" +
                    this.props.transcript[i].endtime % 60 + '--' +
                    this.props.transcript.slice(Math.max(i - 4, 0),
                    Math.min(i + 5, this.props.transcript.length))
                    .map(pair => pair.word)
                    .reduce((fword, sword) => `${fword} ${sword}`)
                  }
                </button>
              ))) : null }
          </div>
        </div>
      );
    }
    return null;
  }

  render() {
    return (
      <Col xs={3}>
        {
          this.renderSearchForm()
        }
        {
          this.renderTranscript()
        }
        {
          this.renderWordcloud()
        }
        {
          this.renderSearchResults()
        }
      </Col>
    );
  }
}

export default TranscriptionUtilities;
