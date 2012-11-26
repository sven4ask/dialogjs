var express = require('express'),
    http = require('http');
    
// create namespace
dh = {};

dh.server = express();
dh._adapters = new Array();

dh.addAdapter = function(adapter) {
    
    var instance = new adapter();
    instance.start(dh); 
    dh._adapters.push(instance);
}

dh.start = function(port) {       
    
    dh.server.get('/', function(req, res){
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end("This is the dialog handler, which will handle all you communication");
    });
        
    // start server
    dh.server.listen(port);
    console.log("Dailog Handler started on port: "+port);
}

exports.start = dh.start;
exports.addAdapter = dh.addAdapter;