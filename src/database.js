const { MongoClient } = require('mongodb');

const uri = process.env.DB_URI;

function dbConnect (callback) {
    MongoClient.connect(process.env.DB_URI, { useUnifiedTopology:true }, callback);
}

//! insert doc to db REALM collection "any"
function dbInsertANY(doc){
    return dbInsert(process.env.REALM, "any", doc);
}
function dbInsert(dbName, collectionName,doc){
    dbConnect((err, db) => {
        if(err) throw err; 
        var dbo = db.db(dbName);
        const collection = dbo.collection(collectionName);
        collection.insertOne(doc, (err) => {
            if(err) console.log("Error inserting into database.");  
            db.close();   
        });
    });
}

function dbFind(dbName, collectionName, fields){
    dbConnect((err, db) => {
        if(err) throw err; 
        var dbo = db.db(dbName);
        const collection = dbo.collection(collectionName);
        collection.find(fields, (err, res) => {
            if(err) console.log("Error finding.");  
            db.close();   
            return res;
        });
    });
}

function dbFindAndReplace(dbName, collectionName, query, upsert, doc) {
    dbConnect((err, db) => {
        if(err) throw err; 
        var dbo = db.db(dbName);
        const collection = dbo.collection(collectionName);
        collection.replaceOne(query, doc, {upsert: upsert}, (err, res) => {
            if(err) console.log("Error finding.");  
            db.close();   
            return res;
        });
    });
}

module.exports = { 
    dbConnect,
    dbInsertANY,
    dbFind,
    dbInsert,
    dbFindAndReplace 
};
