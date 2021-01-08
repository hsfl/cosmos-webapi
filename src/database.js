const { MongoClient } = require('mongodb');

const uri = process.env.DB_URI;

//const client = new MongoClient(uri);
function dbConnect (callback) {
    MongoClient.connect(process.env.DB_URI, { useUnifiedTopology:true }, callback);
}

module.exports = { dbConnect };
