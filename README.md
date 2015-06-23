
couchdb-node-cms
================

A micro CMS for couchdb and nodejs
This project use nodejs and couchdb to  manage data from database using html templates.

## Installation

  npm install couchdb-node-cms --save

## Usage

    var express  = require('express')
  	, CmsEngine = require('couchdb-node-cms')
  	, config = require('./config');
  
    var app = express();

    // options :{
    //    config: { host: "…", port: "…", user: "", password: "" },
    //    server: expressServer,
    //    auth: authentication method,
    //    apiRoot: “/admin/v1/cms”
    // }
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
    


## Contributing

If you want to contribute, please don't hesitate and send a pull request.

## Release History

* 0.1.2 Initial release