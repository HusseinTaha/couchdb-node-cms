var config = {
  "port": +process.env.COUCHDB_PORT || 5984,
  "host": process.env.COUCHDB_HOST || "localhost",
  "db": process.env.COUCHDB_DB || "blog"
};

if (typeof process.env.COUCHDB_USER == "undefined")
  config.user = "admin";
else
  config.user = process.env.COUCHDB_USER;

if (typeof process.env.COUCHDB_PASSWORD == "undefined")
  config.password = "admin";
else
  config.password = process.env.COUCHDB_PASSWORD;

module.exports = config;
