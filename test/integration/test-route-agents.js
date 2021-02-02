var supertest = require('supertest'),
app = require('../../src/index');

exports.agents = function(done){
  supertest(app)
  .get('//agents')
  .expect(200)
  .end(done);
};

