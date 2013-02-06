var mongoose = require('mongoose');

var Schema = mongoose.Schema;  

var AdapterConfig = new Schema({  
    adapterType: { type: String, required: true },  
    publicKey: { type: String, default: ""},
    preferred_language : {type: String, default: ""},
    initialAgentURL : {type: String, default: ""},
    myAddress : {type: String, default: ""},
    status: {type: String, default: ""},
    xsiURL: {type: String, default: ""},
    accessToken: {type: String, default: ""},
    accessTokenSecret : {type: String, default: ""}
});

var AdapterConfigModel = mongoose.model('AdapterConfig', AdapterConfig); 

exports.findById = function(id, callback) {
  return AdapterConfigModel.findById(id, callback);
};

exports.findByTypeAndAddress = function(type, address, callback) {
  return AdapterConfigModel.findOne({'adapterType':type, 'myAddress':address}, callback);
};

exports.findAll = function(callback) {
    return AdapterConfigModel.find(callback);
};

exports.addAdapter = function(adapter, callback) {
  var adapterConfig;
  console.log("POST: ");
  console.log(adapter);
  adapterConfig = new AdapterConfigModel(adapter);
  adapterConfig.save(callback);
};

exports.updateAdapter = function(id, adapter, callback) {
  return AdapterConfigModel.findById(id, function (err, adapterConfig) {
  	console.log(JSON.stringify(adapter));
  	// update the fields
  	for(var key in adapter) {
  	   adapterConfig[key] = adapter[key];
  	}
	return adapterConfig.save(callback);
  });
};

exports.deleteAdapter = function(id, callback) {
  return AdapterConfigModel.findById(id, function (err, adapterConfig) {
	  return adapterConfig.remove(callback);
  });
};