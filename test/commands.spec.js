var supertest = require('supertest'),
app = require('../src/index');
var assert = require('assert');

describe("POST /commands/:node {command: {event_name:'new_event'}}", function() {
  it("it should have status code 200", function(done) {
    const data = {command: {event_name:'new_event'}};
      supertest(app)
      .post('/commands/testNode')
      .send(data)
      .expect(200)
      .expect('Content-Type',/json/)
      .end(function(err, res){
        if (err) done(err);
        else {
          assert.ok(res.body.message);
          done();
        }
      });
  });

});
describe("GET /commands/:node ", function() {
  it("it should have status code 200", function(done) {
      supertest(app)
      .get('/commands/testNode')
      .expect(200)
      .expect('Content-Type',/json/)
      .end(function(err, res){
        if (err) done(err);
        else {
          assert.ok(res.body);
          done();
        }
      });
  });

});
describe("DELETE /commands/:node {event_name:'new_event', event_utc: 0}", function() {
  it("it should have status code 200", function(done) {
    const data = {event_name:'new_event', event_utc: 0};
      supertest(app)
      .delete('/commands/testNode')
      .send(data)
      .expect(200)
      .expect('Content-Type',/json/)
      .end(function(err, res){
        if (err) done(err);
        else {
          assert.ok(res.body.message);
          done();
        }
      });
  });
});
describe("DELETE /commands/:node ", function() {
  it("it should have status code 400", function(done) {
      supertest(app)
      .delete('/commands/testNode')
      .expect(400)
      .end(done);
  });
});

describe("DELETE /commands/:node {event_name:'new_event'}", function() {
  it("it should have status code 400", function(done) {
    const data = {event_name:'new_event'};
      supertest(app)
      .delete('/commands/testNode')
      .send(data)
      .expect(400)
      .end(done);
  });
});
