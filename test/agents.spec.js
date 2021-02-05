var supertest = require('supertest'),
app = require('../src/index');
var assert = require('assert');

describe("GET //agents ", function() {
  it("it should have status code 200", function(done) {
    supertest(app)
    .get('//agents')
    .expect(200)
    .end(function(err, res){
        if (err) done(err);
        assert.ok(res.body);
        done();
      });
  });

});