var supertest = require('supertest'),
app = require('../../src/index');

exports.route_nodes = function(done){
  supertest(app)
  .get('//nodes')
  .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
  .expect(200)
  .end(done);
};

