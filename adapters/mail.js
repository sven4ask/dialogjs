var http = require('http'),
    url = require('url');

var handleRequest = function(req, res, next) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end("I'm going to process all the mail");
}

module.exports = handleRequest;