const mongoConnectionString = 'mongodb://localhost:27017/galleryMeta';
const {MongoClient} = require('mongodb');
let mongoDb = null;
let photoMetas = null;

MongoClient.connect(mongoConnectionString, function(err, connectedDb) {
  // assert.equal(null, err);
  console.log(`Successfully connected to {mongoConnectionString}`);
  mongoDb = connectedDb;

  photoMetas = mongoDb.collection('photoMetas');
  // db.close(); // don't want this piece

  // photoMetas.insertOne({hello: 'world'});

});

module.exports = {
  photoMetas: () => photoMetas
};