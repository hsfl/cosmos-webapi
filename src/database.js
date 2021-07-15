const { MongoClient } = require('mongodb');
const { within30Days, MJD2daysjs, mjdToString } = require('./utils/time');
const dayjs = require('dayjs');

function dbConnect (callback) {
    MongoClient.connect(process.env.DB_URI, { useUnifiedTopology:true }, callback);
}

const errorConnect = { error: "Error Connecting to MongoDB"};
const successStatus = { status: "Success"};

//! insert doc to db 'current' collection `${node}:soh`
function dbInsertSOH(doc, node){
    return dbInsert('current', `${node}:soh`, doc);
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

function dbInsertByUTC(collectionName, doc, callback) {
    let dbName = 'current'; 
    if(doc.node_utc){
        dbName = dbNameByMJD(doc.node_utc);
    }
    // console.log(`[DBINSERT] ${dbName}-${collectionName} ${JSON.stringify(doc)}`);

    dbInsert(dbName, collectionName, doc, callback);
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
        if(err) {
            callback(err, {}); 
            return;
        }
        var dbo = db.db(dbName);
        const collection = dbo.collection(collectionName);
        collection.replaceOne(query, doc, {upsert: upsert}, (err, res) => {
            db.close();   
            callback(err, res);
        });
    });
}

function dbDeleteOne(dbName, collectionName, doc, callback){
    dbConnect(function(err, db) {
        if (err) throw err;
    
        var dbo = db.db(dbName);
        const collection = dbo.collection(collectionName);
    
        collection.deleteOne(doc, (err, result) => {
          db.close();
          callback(err, result);
        });
    });
}
/**
 * 
 * @param {Number} mjd 
 */
function dbNameByMJD(mjd) {
    if(within30Days(mjd)) return 'current';
    else return mjdToString(mjd).substring(0,7);
}

function dbFindQuery(startMJD, collectionName, query, options, callback) {
    dbConnect((err, db) => {
        if(err) {
            callback(errorConnect, []); 
            return;
        }
        if(within30Days(startMJD)) {
            dbName ='current';
        }
        else {
            dbName = MJD2daysjs(startMJD).format('YYYY-MM');
        }
        // console.log(`QUERY ${dbName} ${collectionName}`);
        db.db(dbName).collection(collectionName).find(query, options).toArray((err, res) => {
            if(err) console.log(err);

            callback(res);
            db.close();
        });

        
    });
}

module.exports = { 
    dbInsertByUTC,
    dbFind,
    dbFindOne,
    dbInsert,
    dbFindAndReplace,
    dbDeleteOne,
    dbNameByMJD,
    dbFindQuery
};
