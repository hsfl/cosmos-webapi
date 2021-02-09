const { MongoClient } = require('mongodb');

const uri = process.env.DB_URI;

function dbConnect (callback) {
    MongoClient.connect(process.env.DB_URI, { useUnifiedTopology:true }, callback);
}

//! insert doc to db REALM collection "any"
function dbInsertANY(doc){
    dbConnect((err, db) => {
        if(err) throw err; 
        var dbo = db.db(process.env.REALM);
        const collection = dbo.collection("any");
        collection.insertOne(doc, (err) => {
            if(err) console.log("Error inserting into database.");  
            db.close();   
        });
    });
}

module.exports = { 
    dbConnect,
    dbInsertANY 
};
