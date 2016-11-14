var expect = require('chai').expect;
var request = require('request');

describe('Unprotected API routes:', function() {

  beforeEach(function(done) {
    done();
  })

  describe('/api/isalive ', function() {

    var requestOptions = {
      method: 'GET',
      url: 'http://104.237.1.118:3000/api/isalive',
    };

    it('should return a response and 200 status code', function(done) {
      request(requestOptions, function(err, res, body) {
        if (err) {
          console.log('ERROR:', err);
        }

        expect(res.body).equals('I\'m Alive');
        expect(res.statusCode).to.equal(200);
        done();
      });
    });
  });
});