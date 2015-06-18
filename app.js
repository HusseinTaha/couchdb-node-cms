var express  = require('express')
  , couchdb = require('couchdb')
  , config = require('./config')
  , mustacheExpress = require('mustache-express')
  , bodyParser = require('body-parser');

var options = {};
if (config.user && config.password) {
    options.user = config.user;
    options.password = config.password;
}
var client     = couchdb.createClient(config.port, config.host, options)
  , db         = client.db(config.db);

var app = express();

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

// configure =============================================================
app.engine('html', mustacheExpress());          // register file extension mustache
app.set('view engine', 'html');                 // register file extension for partials
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public')); // set static folder


app.get('/', function(req, res) {
  res.redirect('/posts');
});

app.get('/posts', function(req, res) {

  db.view(config.db, 'posts_by_date').then(function(resp) {
    var posts = resp.rows.map(function(x) { return x.value; });
    res.render('posts', {
            head: {
                  title: 'page title'
            },
            posts: posts
            
          });
  }, function(err) {
    console.log(err);
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

  db.saveDoc(post).then(function(resp) {
    res.redirect('/posts');
  });
});

app.get('/posts/:id', function(req, res) {
  db.openDoc(req.params.id).then(function(post) {
    res.render('post.html', post );
  });
});

app.post('/posts/:id/comments', function(req, res) {
  var comment = req.body;

  db.openDoc(req.params.id).then(function(post) {
    post.comments = post.comments || [];
    post.comments.push(comment);

    db.saveDoc(post).then(function(resp) {
      res.redirect('/posts/'+req.params.id);
    });
  });
});


var server = app.listen(process.env.PORT || 8080, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Server is listening at http://%s:%s', host, port);

});
