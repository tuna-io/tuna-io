import React from 'react'
import Nav from './Nav'
import Home from './Home'
import { Link } from 'react-router'

export default React.createClass({
  render() {
    return (<div><Nav />
      {this.props.children || <Home />}
    </div>)
  }
})
