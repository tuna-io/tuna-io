import React from 'react';
import Carousel from 'nuka-carousel';
import { Link } from 'react-router';

const HomepageCarousel = React.createClass({
  mixins: [Carousel.ControllerMixin],
  render() {
    const data = this.props.latestVideos.map(video => {
      return {
        thumbnailUrl: video.thumbnail ? JSON.parse(video.thumbnail).DataUrl : 'https://placeholdit.imgix.net/~text?txtsize=33&txt=350%C3%97150&w=350&h=150',
        hash: video.hash,
        title: video.title,
      };
    });

    return (
      <div>
        <h1>{this.props.header}</h1>
        <Carousel slidesToShow={3} cellAlign="left">
          {
            data.map((videoData) =>
              (
                <Link to={`/videos/${videoData.hash}`}>
                  <img src={videoData.thumbnailUrl} onLoad={() => {window.dispatchEvent(new Event('resize'));}} />
                  <div>{videoData.title}</div>
                </Link>
              ),
            )
          }
        </Carousel>
      </div>
    );
  },
});


export default HomepageCarousel;
