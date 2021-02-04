var supertest = require('supertest'),
app = require('../src/index');
var assert = require('assert');

describe("GET /namespace/all ", function() {
  it("it should have status code 200", function(done) {
    supertest(app)
    .get('/namespace/all')
    .expect(200)
    .end(function(err, res){
        if (err) done(err);
        assert.ok(res.body);
        done();
      });
  });

});
describe("GET /namespace/pieces ", function() {
    it("it should have status code 200", function(done) {
      supertest(app)
      .get('/namespace/pieces')
      .expect(200)
      .end(function(err, res){
          if (err) done(err);
          assert.ok(res.body);
          done();
        });
    });
  
  });