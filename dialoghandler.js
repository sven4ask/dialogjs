var express = require('express'),
    http = require('http'),
    mongoose = require('mongoose'),
    adapterConfig = require('./routes/adapterconfig.js'),
    Session = require('./routes/session.js');
    
// create namespace
dh = {};


dh.generate_mongo_url = function(obj){
  obj.hostname = (obj.hostname || 'localhost');
  obj.port = (obj.port || 27017);
  obj.db = (obj.db || 'test');

  if(obj.username && obj.password){
    return "mongodb://" + obj.username + ":" + obj.password + "@" + obj.hostname + ":" + obj.port + "/" + obj.db;
  }
  else{
    return "mongodb://" + obj.hostname + ":" + obj.port + "/" + obj.db;
  }
}

// Connect to database
if(process.env.VCAP_SERVICES){
  var env = JSON.parse(process.env.VCAP_SERVICES);
  var mongo = env['mongodb-2.0'][0]['credentials'];
}
else{
  var mongo = {"hostname":"localhost","port":27017, "name":"","db":"dialog"}
}
var mongourl=dh.generate_mongo_url(mongo);
mongoose.connect(mongourl);

// Create express server
dh.server = express();

// add the routes
dh.server.configure(function () {
	dh.server.use(express.bodyParser());
});

dh._adapters = new Array();

dh.addAdapter = function(adapter) {
    
    var instance = new adapter();
    instance.start(dh); 
    dh._adapters.push(instance);
}

dh.start = function(port, host) {       
    
    dh.server.get('/', function(req, res){
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end("This is the dialog handler, which will handle all you communication");
    });
    
    dh.server.get('/adapters', function(req, res) {
    	adapterConfig.findAll(function (err, adapters) {
        if (!err) {
          return res.send(adapters);
        } else {
          return console.log(err);
        }
		  });
    });
    
    dh.server.post('/adapters', function (req, res){
      adapterConfig.addAdapter(req.body, function (err, adapter) {
        if (!err) {
          console.log("created");
          return res.send(adapter);
        } else {
          return console.log(err);
        }
      });
	});
	
	
	dh.server.delete('/adapters/:id', function (req, res){
	  adapterConfig.deleteAdapter(req.params.id, function (err) {
        if (!err) {
          console.log("removed");
          return res.send('');
        } else {
          console.log(err);
        }
      });
	});
	
	dh.server.put('/adapters/:id', function (req, res){
	  adapterConfig.updateAdapter(req.params.id, req.body, function (err, adapter) {
  	    if (!err) {
		  console.log("updated");
		  return res.send(adapter);
	    } else {
		  console.log(err);
	    }
	  });
	});
    
  dh.server.get('/session', function(req, res) {
    Session.findAll(function (err, sessions) {
      if (!err) {
        return res.send(sessions);
      } else {
        return console.log(err);
      }
    });
  });
  
  dh.server.delete('/session/:id', function (req, res){
    Session.deleteSession(req.params.id, function (err) {
      if (!err) {
        console.log("removed");
        return res.send('');
      } else {
        console.log(err);
      }
    });
  });
      
  // start server
  dh.server.listen(port, host);
  console.log("Dailog Handler started on port: "+port);
}



exports.start = dh.start;
exports.addAdapter = dh.addAdapter;