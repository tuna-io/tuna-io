import React from 'react';
import { Grid, Row, Col } from 'react-flexgrid';

class VideoMetadata extends React.Component {
  render() {
    return (
      <div>
        <Row>
          <Col xs={0}>
            <Avatar circle size={48} src="http://lorempixel.com/output/animals-q-c-64-64-8.jpg" />
          </Col>
          <Col xs={1}>
            <Heading size={5} alt>
              {this.props.currentVideoDetails.creator}
            </Heading>

            <Badge rounded theme="info"> 4.5M </Badge>
          </Col>
        </Row>
        <Row>
          <Col xs={5}>
            <div>
              Uploaded:
              <TimeAgo
                date={this.props.currentVideoDetails.timestamp}
              />
            </div>
          </Col>
          <Col xs={3}>
            {this.props.currentVideoDetails.private == 1 ?
              <Badge pill rounded theme="warning">PRIVATE</Badge> :
              <Badge pill rounded theme="success">PUBLIC</Badge>
            }
          </Col>
        </Row>
        <div>Description: {this.props.currentVideoDetails.description}</div>
        <Row>
          <Col xs={2}>
            <Stat
              label="VIEWS"
              value={this.props.currentVideoDetails.views}
            />
          </Col>
          <Col xs={2}>
            <Stat
              label="LIKES"
              value={this.props.currentVideoDetails.likesCount}
            />
          </Col>
          <Col xs={2}>
            <Stat
              label="DISLIKES"
              value={this.props.currentVideoDetails.dislikesCount}
            />
          </Col>
          <Col xs={2}>
            <Donut
              color="warning" size={100} strokeWidth={12}
              value={this.props.currentVideoDetails.ldRatio}
            >
              {this.props.currentVideoDetails.likesCount}/
              {this.props.currentVideoDetails.dislikesCount +
                this.props.currentVideoDetails.likesCount}
            </Donut>
          </Col>
        </Row>
      </div>
    );
  }
}

export default VideoMetadata;
