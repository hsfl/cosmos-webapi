var supertest = require('supertest'),
app = require('../src/index');
var assert = require('assert');

describe("POST /exec/ {}", function() {
  it("it should have status code 400", function(done) {
    supertest(app)
    .post('/exec/')
    .send({})
    .expect(400)
    .end(done);
  });

});

describe("POST /exec/ {command: 'ls'}", function() {
    it("it should have status code 200", function(done) {
      const data = {command: "ls"};
        supertest(app)
        .post('/exec/')
        .send(data)
        .expect(200)
        .expect('Content-Type',/json/)
        .end(done);
    });

    it("it should have output field", function(done) {
      const data = {command: "ls"};
      supertest(app)
      .post('/exec/')
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

describe("POST /exec/ {command: 'ls -l'}", function() {
  it("it should have status code 200", function(done) {
    const data = {command: "ls -l"};
      supertest(app)
      .post('/exec/')
      .send(data)
      .expect(200)
      .expect('Content-Type',/json/)
      .end(done);
  });

  it("it should have output field", function(done) {
    const data = {command: "ls -l"};
    supertest(app)
    .post('/exec/')
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

describe("POST /exec/agent {command: 'list'}", function() {
  it("it should have status code 400", function(done) {
    const data = {command: "list"};
      supertest(app)
      .post('/exec/agent')
      .send(data)
      .expect(400)
      .end(done);
  });
});

describe("POST /exec/agent/virtualhost.hsfl.hawaii.edu/file", function() {
  it("it should have status code 200", function(done) {
    const data = {command: "ls"};
      supertest(app)
      .post('/exec/agent/virtualhost.hsfl.hawaii.edu/file')
      .send(data)
      .expect(200)
      .expect('Content-Type',/json/)
      .end(done);
  });

  it("it should have output field", function(done) {
    const data = {command: "ls"};
    supertest(app)
    .post('exec/agent/virtualhost.hsfl.hawaii.edu/file')
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

