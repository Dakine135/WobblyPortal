//NPM PACKAGES
var express = require("express");
// var socket = require("socket.io");
var reload = require("reload");

let port = 5000;
//setup Server
var app = express();
// var server = http.createServer(app);
// var server = app.listen(port);
// var io = socket(server);
// app.use(express.static("./client"));
console.log(`server running on port ${port}`);

// Reload code here
reload(app)
  .then(function (reloadReturned) {
    // reloadReturned is documented in the returns API in the README

    // Reload started, start web server

    var server = app.listen(port);
    app.use(express.static("./client"));
  })
  .catch(function (err) {
    console.error("Reload could not start, could not start server/sample app", err);
  });
