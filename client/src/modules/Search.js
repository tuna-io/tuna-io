import React from 'react';

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
      console.log(data);
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
    return (
      <div>
        Your search for "{this.state.query}" returned {this.state.total} results and took {this.state.took / 1000}s.
      </div>
    )
  }
}
