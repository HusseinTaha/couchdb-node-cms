var nano = require('nano')
  , config = require('../config')
  , request = require("request");

var urlCouchDb = "";

var options = {};
if (config.user && config.password) {
    options.user = config.user;
    options.password = config.password;
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
    db = client.use(config.db);


    db.insert(designDoc, function(err, body) {
      if (!err)
        console.log("Design created!");
      else
        console.log("Design exists!");
    });
});
