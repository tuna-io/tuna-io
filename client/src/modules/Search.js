import React from 'react';

export default class Search extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      query: props.params.query,
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
    .then(data => console.log(data))
    .catch(err => console.log('Error with search:', err));
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ query: nextProps.params.query });

    this.renderSearchResults(nextProps.params.query);
  }

  render() {
    return (
      <div>{this.state.query}</div>
    )
  }
}
