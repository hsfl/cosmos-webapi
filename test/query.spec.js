var supertest = require('supertest'),
app = require('../src/index');
var assert = require('assert');



describe("POST /query/soh/windev2 { beginDate: 59326.974548611324 }", function() {
  it("it should have status code 200", function(done) {
    const data = { beginDate: 59326.974548611324 };
    supertest(app)
    .post('/query/soh/windev2')
    .send(data)
    .expect(200)
    .expect('Content-Type',/json/)
    .end(done);
  });

});

describe("POST /query/soh/windev2 ", function() {
  it("it should have status code 400", function(done) {

    supertest(app)
    .post('/query/soh/windev2')
    .expect(400)
    .end(done);
  });

});