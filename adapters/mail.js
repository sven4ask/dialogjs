var http = require('http'),
    url = require('url');
    
var mailadapter = function() {
    
}

mailadapter.prototype._handleRequest = function(req, res, next) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end("I'm going to process all the mail");
}

mailadapter.prototype.start = function(dh) {
    
    dh.server.get('/mail', this._handleRequest);
}

module.exports = mailadapter;