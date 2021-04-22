var supertest = require('supertest'),
app = require('../src/index');
var assert = require('assert');

/**
 * TODO update /test/tc with /dbName/collectionName/ which represents
 * dbName = REALM 
 * collectionName = node:process
 */
describe("POST /query/current/windev2:soh/ {multiple: true}", function() {
  it("it should have status code 200", function(done) {
    const data = {multiple: true};
    supertest(app)
    .post('/query/current/windev2:soh')
    .send(data)
    .expect(200)
    .expect('Content-Type',/json/)
    .end(done);
  });

});

describe("POST /query/test/tc/ {multiple: false}", function() {
  it("it should have status code 200", function(done) {
    const data = {multiple: false};
    supertest(app)
    .post('/query/test/tc')
    .send(data)
    .expect(200)
    .expect('Content-Type',/json/)
    .end(done);
  });

});