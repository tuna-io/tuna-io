import React from 'react';
import videojs from 'video.js';

Video = React.createClass({
  componentDidMount: function() {
    var video, wrapper;
    wrapper = document.createElement('div');
    wrapper.innerHTML = "<video id='attachmentVideo' class='video-js vjs-default-skin' controls preload='auto' width='640' height='264' poster='" + this.props.thumbnail + "'><source src='" + this.props.url + "' type='video/mp4' /><p className='vjs-no-js'>To view this video please enable JavaScript, and consider upgrading to a web browser that <a href='http://videojs.com/html5-video-support/' target='_blank'>supports HTML5 video</a></p></video>";
    video = wrapper.firstChild;
    this.refs.target.getDOMNode().appendChild(video);
    return videojs(video, {});
  },
  render: function() {
    return (
      <div id="attachmentViewer">
        <h2>{this.props.title}</h2>
        <div id="attachmentVideoContainer" ref="target" />
      </div>
    );
  }
});