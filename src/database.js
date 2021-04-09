const { MongoClient } = require('mongodb');

const uri = process.env.DB_URI;

function dbConnect (callback) {
    MongoClient.connect(process.env.DB_URI, { useUnifiedTopology:true }, callback);
}

const errorConnect = { error: "Error Connecting to MongoDB"};
const successStatus = { status: "Success"};

//! insert doc to db REALM collection "any"
function dbInsertANY(doc){
    return dbInsert(process.env.REALM, "any", doc);
}

function dbInsert(dbName, collectionName,doc, callback){
    dbConnect((err, db) => {
        if(err) {
            callback(errorConnect);
            return;
        }
        var dbo = db.db(dbName);
        const collection = dbo.collection(collectionName);
        collection.insertOne(doc, (err) => {
            if(err) callback({error: "Error inserting into database."}); 
            else callback(successStatus); 
            db.close();   
        });
    });
}

function dbFind(dbName, collectionName, query, options, callback){
    dbConnect((err, db) => {
        if(err) {
            callback(errorConnect, []); 
            return;
        }
        var dbo = db.db(dbName);
        const collection = dbo.collection(collectionName);
        collection.find(query, options).toArray((err, res) => {
            let status = {};
            if(err) status.error = "Error finding."; 
            else status.success = "Success"; 
            db.close();   
            callback(status, res);
        });
    });
}

function dbFindOne(dbName, collectionName, query, options, callback){
    dbConnect((err, db) => {
        if(err) {
            callback(errorConnect, []); 
            return; 
        }
        var dbo = db.db(dbName);
        const collection = dbo.collection(collectionName);
        collection.findOne(query, options, (err, res) => {
            let status = {};
            if(err) status.error = "Error finding."; 
            else status.success = "Success"; 
            db.close();   
            callback(status, res);
        });
    });
}

function dbFindAndReplace(dbName, collectionName, query, upsert, doc, callback) {
    dbConnect((err, db) => {
        if(err) throw err; 
        var dbo = db.db(dbName);
        const collection = dbo.collection(collectionName);
        collection.replaceOne(query, doc, {upsert: upsert}, (err, res) => {
            if(err) console.log("Error finding.");  
            db.close();   
            callback(res);
        });
    });
}

module.exports = { 
    dbConnect,
    dbInsertANY,
    dbFind,
    dbFindOne,
    dbInsert,
    dbFindAndReplace 
};
