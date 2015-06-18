module.exports = {
  "port": +process.env.COUCHDB_PORT || 5984,
  "host": process.env.COUCHDB_HOST || "localhost",
  "user": process.env.COUCHDB_USER || "admin",
  "password": process.env.COUCHDB_PASSWORD || "admin",
  "db": process.env.COUCHDB_DB || "blog"
};
