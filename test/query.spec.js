var supertest = require('supertest'),
app = require('../src/index');
var assert = require('assert');

/**
 * TODO update /test/tc with /dbName/collectionName/ which represents
 * dbName = REALM 
 * collectionName = node:process
 */
describe("GET /query/test/tc/ {multiple: true}", function() {
  it("it should have status code 200", function(done) {
    const data = {multiple: true};
    supertest(app)
    .get('/query/test/tc')
    .send(data)
    .expect(200)
    .end(done);
  });

});