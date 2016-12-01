import React from 'react';
import { browserHistory, Link } from 'react-router';
import { Menu, NavItem, Media, Heading, Text, Divider } from 'rebass';

export default class Recommended extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      recVideos: [],
    };
  }

  componentDidMount() {
    console.log('componentprops called', this.props.currVid);
    fetch(`/api/videos/recommended/${this.props.currVid}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then(data=> {
      return data.json();
    })
    .then((videos) => {
      const topVids = videos.map((video) => { return {hash: video[1], dataUrl: JSON.parse(video[2]).DataUrl}})
                            .filter(vidObj => vidObj.hash !== this.props.currVid);
      this.setState({
        recVideos: topVids,
      });
      console.log(topVids[0]);
    })
    .catch((err) => {
      console.log('error getting last vid', err);
    });
  }

  render() {
    return (
      <Menu rounded style={{
        background: '#202121',
        height: '100vh',
        color: 'white',
      }}>
        <Divider width={1000} style={{ background: 'white' }} />
        {this.state.recVideos.map(video =>
          (
            <NavItem>
              <Link to={`/videos/${video.hash}`}>
                <img width="50px" height="50px" src={video.dataUrl} />
                  <Heading level={3}>
                    {video.hash}
                  </Heading>
              </Link>
            </NavItem>
          ))
        }
      </Menu>
    );
  }
}
