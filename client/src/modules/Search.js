import React from 'react';

export default class Search extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      query: props.params.query,
    };

  }

  componentDidMount() {
    console.log('this.query', this.state.query);
  }

  render() {
    return (
      <div>{this.state.query}</div>
    )
  }
}
