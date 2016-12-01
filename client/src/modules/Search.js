import React from 'react';

export default class Search extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      query: props.params.query,
    };

  }

  componentDidMount() {
    fetch(`/api/search/videos/${this.state.query}`, {
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

    fetch(`/api/search/videos/${this.state.query}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then(jsonData => jsonData.json())
    .then(data => console.log(data))
    .catch(err => console.log('Error with search:', err));
  }

  render() {
    return (
      <div>{this.state.query}</div>
    )
  }
}
