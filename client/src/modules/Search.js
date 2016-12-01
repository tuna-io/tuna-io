import React from 'react';
import TimeAgo from 'react-timeago';
import { PageHeader } from 'rebass';

export default class Search extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      query: props.params.query,
      took: '',
      results: '',
    };

    this.renderSearchResults(props.params.query);
  }

  renderSearchResults(query) {
    return fetch(`/api/search/videos/${query}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then(jsonData => jsonData.json())
    .then(data => {
      this.setState({
        took: data.took,
        results: data.hits.hits,
        total: data.hits.total,
      });

      console.log(this.state.results);
    })
    .catch(err => console.log('Error with search:', err));
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ query: nextProps.params.query });

    this.renderSearchResults(nextProps.params.query);
  }

  render() {
    console.log()
    return (
      <div>
        <PageHeader
          description={`Search returned ${this.state.total} results, taking ${this.state.took / 1000}s.`}
          heading={`Results for ${this.state.query}`}
        />
        Your search for {this.state.query} returned {this.state.total} results and took {this.state.took / 1000}s.
        {this.state.results && this.state.results.map(video =>
          (
            <div>
            {video._source.title}
            {video._source.url}
            {video._source.creator}
            <img src={JSON.parse(video._source.thumbnail).DataUrl} />
            <TimeAgo date={new Date(video._source.timestamp)} />
            </div>
          )
        )}
      </div>
    )
  }
}
