var couchdb = require('couchdb')
  , config = require('../config')
  , request = require("request");

var urlCouchDb = "";

var options = {};
if (config.user && config.password) {
    options.user = config.user;
    options.password = config.password;
    urlCouchDb = 'http://' + config.user + ":" + config.password + "@" +
      config.host + ":" + config.port + "/" + config.db;
}else{
    urlCouchDb = 'http://' + config.host + ":" + config.port + "/" + config.db;
}

var client  = couchdb.createClient(config.port, config.host, options);
var db      = client.db(config.db);



request.put(urlCouchDb, 
  function (error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log("Database " + config.db + " created.");
    }else if(error){
      console.log(error);
    }else{
      console.log("Database " + config.db + " exists.");
    }
});

 
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

db.saveDoc(designDoc).then(function(resp) {
  console.log('updated design doc!');
}, function(err) {
  console.log('error updating design doc: '+require('util').inspect(err));
});

