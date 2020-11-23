const { MongoClient } = require('mongodb');

const uri = process.env.DB_URI;

const client = new MongoClient(uri);

module.exports = client;
