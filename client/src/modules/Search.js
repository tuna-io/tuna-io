import React from 'react';
import TimeAgo from 'react-timeago';
import { PageHeader, Block, Media, Heading, Text } from 'rebass';
import { Grid, Row, Col } from 'react-flexgrid';
import { Link } from 'react-router';

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
    console.log()
    return (
      <div>
        <PageHeader
          description={`Search returned ${this.state.total} result(s), taking ${this.state.took / 1000}s.`}
          heading={`Results for "${this.state.query}"`}
        />
        {this.state.results && this.state.results.map(video =>
          (
          <Grid>
            <Block
              borderLeft
              borderColor="red"
              color="black"
              px={2}
            >
              <Row>
                <Col xs={2}>
                  <img src={JSON.parse(video._source.thumbnail).DataUrl} height="86" width="153" />
                </Col>
                <Col xs={10}>
                  <Heading
                    level={2}
                    size={0}
                  >
                    <Link to={`/videos/${video._source.hash}`}>
                      {video._source.title}
                    </Link>
                  </Heading>
                  <Text>
                    <Col xs={2}>
                      {video._source.creator}
                    </Col>
                    <Col xs={3}>
                      <TimeAgo date={new Date(video._source.timestamp)} />
                    </Col>
                  </Text>
                </Col>
              </Row>
            </Block>
          </Grid>
          )
        )}
      </div>
    )
  }
}
