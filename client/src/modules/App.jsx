import React from 'react';
import Nav from './Nav';
import Home from './Home';

export default React.createClass({
  render() {
    return (
      <div>
        <Nav />
        {this.props.children || <Home />}
      </div>
    )
  }
});
