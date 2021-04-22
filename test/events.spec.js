var supertest = require('supertest'),
app = require('../src/index');
var assert = require('assert');

describe("POST /event/:hsflpc03 ", function() {
    it("it should have status code 200", function(done) {
      const data = {event: {
          event_name: 'myevent',
          event_type: 0,
          event_flag: 0,
          event_data: 'agent hsflpc03 cpu soh',
          event_utc: 0,
        }};
        supertest(app)
        .post('/event/hsflpc03')
        .send(data)
        .expect(200)
        .end(done);
    });

    it("it should have output field", function(done) {
      const data = {command: "ls"};
      supertest(app)
      .post('/commands/')
      .send(data)
      .expect(200)
      .expect('Content-Type',/json/)
      .end(function(err, res){
        if (err) done(err);
        else {
          assert.ok(res.body.output);
          done();
        }
      });
  });
});