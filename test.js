var express  = require('express')
	// , CmsEngine = require('couchdb-node-cms')
	, CmsEngine = require('./lib/main')
	, config = require('./config');

var app = express();

var cmsEngine = new CmsEngine({
   config: config,
   server: app,
   auth: function(){},
   apiRoot: '/admin'
 });

cmsEngine.start();

var server = app.listen(process.env.PORT || 8080, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Server is listening at http://%s:%s', host, port);

});