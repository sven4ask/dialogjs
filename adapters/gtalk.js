var XmppAdapter = require('./xmpp.js'),
  adapterConfig = require('../routes/adapterconfig.js');

var GTalkAdapter = function() {
  this.host = 'talk.google.com';
  this.port = 5222;
}

GTalkAdapter.prototype = new XmppAdapter;

GTalkAdapter.prototype.getAdapterType = function() {
  return "GTALK";
}

module.exports = GTalkAdapter;