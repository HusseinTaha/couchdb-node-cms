var couchdb = require('couchdb')
  , config = require('../config')
  , request = require("request");

var client  = couchdb.createClient(config.port, config.host, { user: config.user, password: config.password });
var db      = client.db(config.db);


request.put('http://' + config.user + ":" + config.password + "@" +
  config.host + ":" + config.port + "/" + config.db, 
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

