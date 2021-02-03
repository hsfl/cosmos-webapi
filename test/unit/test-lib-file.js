var assert = require('assert');

const {
    listAllNodes,
    listAllAgents,
    listAllPieces,
    listAllNamespace
}  = require('../../src/utils/file');

exports.json_list_nodes = function(done){
  assert.ok(listAllNodes());
  return done();
};

exports.json_list_agents = function(done){
  assert.ok(listAllAgents());
  return done();
};
exports.json_list_pieces = function(done){
    assert.ok(listAllPieces());
    return done();
};
exports.json_list_namespace = function(done){
    assert.ok(listAllNamespace());
    return done();
};