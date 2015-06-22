var nano = require('nano');


var exports = module.exports = {};

exports.create = function(config, callback){

  var urlCouchDb = "";

  if (config.user && config.password) {
      urlCouchDb = 'http://' + config.user + ":" + config.password + "@" +
        config.host + ":" + config.port ;//+ "/" + config.db;
  }else{
      urlCouchDb = 'http://' + config.host + ":" + config.port ;//+ "/" + config.db;
  }

  var client  = nano(urlCouchDb);
  var db      ;//= client.db(config.db);

  var designDoc = {
    _id: '_design/' + config.db,

    language: 'javascript',

    views: {
      'posts_by_date': {
        map: function(doc) {
          if (doc.type === 'post') {
            emit(doc.postedAt, doc);
          }
        }.toString()
      }
    }
  };

  client.db.create(config.db, function(err, body, header) {
    // specify the database we are going to use
    if(err && err.error != 'file_exists'){
      throw new Error(err.reason);
    }

    db = client.use(config.db);
    if(db){
      db.insert(designDoc, function(err, body) {
        if (!err)
          console.log("Design created!");
        else
          console.log("Design exists!");
        if (callback)
          callback(null, db);
      });
    }else{
      if (callback)
          callback("Database could not created", db);
    }
    
  });
}
