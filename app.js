var express = require('express'),
  nano = require('nano'),
  config = require('./config'),
  mustacheExpress = require('mustache-express'),
  bodyParser = require('body-parser'),
  marked = require("marked"),
  request = require("request"),
  Busboy = require('busboy'),
  syncDesignDoc = require('./lib/syncDesignDoc');

syncDesignDoc.create(config);

var urlCouchDb = "";

marked.setOptions({
  gfm: true,
  breaks: true,
  highlight: function(code) {
    return require('highlight.js').highlightAuto(code).value;
  }
});

var options = {};
if (config.user && config.password) {
  options.user = config.user;
  options.password = config.password;
  urlCouchDb = 'http://' + config.user + ":" + config.password + "@" +
    config.host + ":" + config.port; // + "/" + config.db;
} else {
  urlCouchDb = 'http://' + config.host + ":" + config.port; // + "/" + config.db;
}

var client = nano(urlCouchDb);
var db = client.use(config.db);

var app = express();

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({
  extended: true
})); // support encoded bodies

// configure =============================================================
app.engine('html', mustacheExpress()); // register file extension mustache
app.set('view engine', 'html'); // register file extension for partials
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public')); // set static folder


app.get('/', function(req, res) {
  res.redirect('/posts');
});

app.get('/posts', function(req, res) {

  db.view(config.db, 'posts_by_date', function(err, resp) {
    if (!err) {
      var posts = resp.rows.map(function(x) {
        x.value.body = marked(x.value.body);
        return x.value;
      });
      res.render('posts', {
        head: {
          title: 'page title'
        },
        posts: posts

      });
    } else {
      res.status(500).send('Error retrieving data');
    }

  });
});

app.get('/posts/new', function(req, res) {
  res.render('new-post.html', {
    head: {
      title: 'new post'
    }
  });
});

app.post('/posts', function(req, res) {
  var post = req.body;
  post.type = 'post';
  post.postedAt = new Date();
  post.body = post.body;
  if (req.body._id) {
    db.get(req.body._id, function(err, resp) {
      if (!err) {
        resp.title = post.title;
        resp.body = post.body;
        resp.postedAt = post.postedAt;
        db.insert(resp, function(err, resp) {
          res.redirect('/posts');
        });
      } else {
        res.status(500).send('Error retrieving data');
      }
    });
  } else {
    db.insert(post, function(err, resp) {
      res.redirect('/posts');
    });
  }


});

app.get('/posts/:id/edit', function(req, res) {
  db.get(req.params.id, function(err, resp) {
    if (!err) {
      res.render('edit-post.html', {
        title: resp.title,
        body: resp.body,
        _rev: resp._rev,
        _id: resp._id
      });
    } else {
      res.status(500).send('Error retrieving data');
    }
  });
});

app.get('/posts/:id', function(req, res) {
  db.get(req.params.id, function(err, resp) {
    if (!err) {
      var attachments = resp._attachments;
      resp.body = marked(resp.body);
      var files = [];
      if (attachments) {
        for (var key in attachments) {
          files.push({
            name: key,
            option: (resp.credentials[key].isPrivate ? 'Make public' : 'Make private'),
            credentials: resp.credentials[key].isPrivate
          });
        }
        resp.files = files;
        delete resp._attachments;
      }
      res.render('post.html', resp);
    } else {
      res.status(500).send('Error retrieving data');
    }

  });
});

app.get('/posts/:id/files/:filename', function(req, res) {
  db.get(req.params.id, function(err, resp) {
    if (!err) {
      if (!resp.credentials[req.params.filename].isPrivate)
        db.attachment.get(req.params.id, req.params.filename).pipe(res);
      else
        console.log("unauthorized!");
    } else {
      res.status(500).send('Error retrieving data');
    }
  });
});

app.get('/posts/:id/files/:filename/credentials/:credentials', function(req, res) {
  db.get(req.params.id, function(err, resp) {
    if (!err) {
      console.log(resp.credentials[req.params.filename].isPrivate);
      resp.credentials[req.params.filename].isPrivate = req.params.credentials === 'true' ? false : true;
      console.log(resp.credentials[req.params.filename].isPrivate);
      db.insert(resp, function(err, r) {
        res.writeHead(303, {
          Connection: 'close',
          Location: '/posts/' + req.params.id
        })
        res.end();
      });
    } else {
      res.status(500).send('Error retrieving data');
    }
  });
});


app.get('/posts/:id/files/:filename/delete', function(req, res) {
  db.get(req.params.id, function(err, resp) {
    if (!err) {
      db.attachment.destroy(req.params.id, req.params.filename, {
        rev: resp._rev
      }, function(err, body) {
        if (!err) {
          db.get(req.params.id, function(err, resp2) {
            delete resp2.credentials[req.params.filename];
            db.insert(resp2, function(err, r) {
              res.writeHead(303, {
                Connection: 'close',
                Location: '/posts/' + req.params.id
              })
              res.end();
            });
          });
        } else {
          res.writeHead(500, {
            Connection: 'close',
            Location: '/posts'
          })
          res.end();
        }
      });
    } else {
      res.status(500).send('Error retrieving data');
    }
  });
});

app.post('/posts/:id/files', function(req, res) {

  var busboy = new Busboy({
    headers: req.headers
  });
  var fileData, fileName, mimeType, isPrivate = false;
  busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
    // console.log('File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype);
    fileName = filename;
    mimeType = mimetype;
    file.on('data', function(data) {
      fileData = data
        // console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
    });
    file.on('end', function() {
      console.log('File [' + fieldname + '] Finished');
    });
  });
  busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated) {
    console.log('Field [' + fieldname + ']: value: ' + val);
    if (val === 'on')
      isPrivate = true;
    else
      isPrivate = false;
  });

  busboy.on('finish', function() {
    console.log('Done parsing form!');
    db.get(req.params.id, function(err, resp) {
      if (!err) {
        db.attachment.insert(req.params.id, fileName, fileData, mimeType, {
            rev: resp._rev
          },
          function(err, attachResp) {
            if (!err) {
              db.get(req.params.id, function(err, resp2) {
                resp2.credentials = resp2.credentials || {};
                resp2.credentials[fileName] = {
                  isPrivate: isPrivate
                };
                db.insert(resp2, function(err, r) {
                  res.writeHead(303, {
                    Connection: 'close',
                    Location: '/posts/' + req.params.id
                  })
                  res.end();
                });
              });
            } else {
              res.status(500).send('Error retrieving data');
            }
          });
      } else {
        res.status(500).send('Error retrieving data');
      }

    });
  });
  req.pipe(busboy);

});


var server = app.listen(process.env.PORT || 8080, function() {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Server is listening at http://%s:%s', host, port);

});