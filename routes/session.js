var mongoose = require('mongoose');

var Schema = mongoose.Schema;  

var SessionSchema = new Schema({  
    key: { type: String, required: true},
    question : { type: String},
    adapterConfigId: { type: String},
    language: { type: String}
});

var SessionModel = mongoose.model('Session', SessionSchema); 
var Session = function() {}

Session.findById = function(id, callback) {
  return SessionModel.findById(id, callback);
};

Session.findByKey = function(key, callback) {
  return SessionModel.findOne({"key": key}, callback);
};

Session.findAll = function(callback) {
    return SessionModel.find(callback);
};

Session.addSession = function(session, callback) {
  var session;
  console.log("POST: ");
  console.log(session);
  session = new SessionModel(session);
  session.save(callback);
};

Session.updateSession = function(id, session, callback) {
  return SessionModel.findById(id, function (err, oldSession) {
  	console.log(JSON.stringify(session));
  	// update the fields
  	for(var key in session) {
       oldSession[key] = session[key];
  	}
  return oldSession.save(callback);
  });
};

Session.storeSession = function(session, callback) {
  if(session.id!=null) {
    return Session.updateSession(session.id, session, callback);
  }
  session = new SessionModel(session);
  session.save(callback);
}

Session.deleteSession = function(id, callback) {
  return SessionModel.findById(id, function (err, session) {
    if(!err)
      return session.remove(callback);
  });
};

Session.deleteSessionByKey = function(key, callback) {
  return SessionModel.findOne({"key": key}, function (err, session) {
    if(session!=null)
      return session.remove(callback);
  });
};

module.exports = Session;