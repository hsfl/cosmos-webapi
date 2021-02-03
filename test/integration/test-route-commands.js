var supertest = require('supertest'),
app = require('../../src/index');
var assert = require('assert');


exports.route_commands_ls = function(done){
  const data = {command: "ls"};
  supertest(app)
  .post('/commands/')
  .send(data)
  .expect(200)
  .end(function(err, result) {
    assert.ok(result.body.output);
    done();
    });
};

exports.route_commands_empty = function(done){
    const data = {command: ""};
    supertest(app)
    .post('/commands/')
    .send(data)
    .expect(200)
    .end(function(err, result) {
        assert.ok(result.body.error.includes('invalid command'));
        done();
    });
};
exports.route_commands_post_empty = function(done){

    supertest(app)
    .post('/commands/')
    .expect(200)
    .end(function(err, result) {
        assert.ok(result.body.error.includes('invalid command'));
        done();
    });
};

exports.route_commands_insert = function(done){
    const data = {command: {"event_name":"new_event"}};
    supertest(app)
    .post('/commands/testNode')
    .send(data)
    .expect(200)
    .end(function(err, result) {
        assert.ok(result.body.message);
        done();
    });
};

exports.route_commands_get = function(done){
    supertest(app)
    .get('/commands/testNode')
    .expect(200)
    .end(function(err, result) {
        assert.ok(result.body);
        done();
    });
};

exports.route_commands_delete_one = function(done){
    var data = {event_name: "new_event"};
    supertest(app)
    .delete('/commands/testNode')
    .send(data)
    .expect(200)
    .end(function(err, result) {
        assert.ok(result.body.message);
        done();
    });
};

