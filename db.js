const { MongoClient } = require('mongodb');

// let oldUri = 'mongodb://localhost:27017';
 let newUri = 'mongodb+srv://EbotProg:Jesus123@cluster0.sszjs9x.mongodb.net/?retryWrites=true&w=majority'

let dbConnection;
module.exports = {
    connectToDb: (cb) => {
    MongoClient.connect(newUri)
    .then((client)=>{
        dbConnection = client.db('FS_app');
        return cb();
    })
    .catch(err=>{
        console.log(err);
        return cb(err);
    })
    },
    getDb: () => dbConnection
}