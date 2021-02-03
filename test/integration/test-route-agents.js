var supertest = require('supertest'),
app = require('../../src/index');

exports.route_agents = function(done){
  supertest(app)
  .get('//agents')
  .set('Accept', 'application/json')
  .expect('Content-Type', /json/)
  .expect(200)
  .end(done);
};

