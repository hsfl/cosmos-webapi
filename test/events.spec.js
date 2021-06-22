var supertest = require('supertest'),
app = require('../src/index');
var assert = require('assert');

describe("POST /events/hsflpc03 ", function() {
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
});