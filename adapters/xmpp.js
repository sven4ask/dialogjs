var xmpp = require('simple-xmpp'),
	Text = require('./text.js'),
	adapterConfig = require('../routes/adapterconfig.js');

var XmppAdapter = function() {
  this.host = 'talk.google.com';
  this.port = 5222;
}

XmppAdapter.prototype = new Text;

XmppAdapter.prototype.start = function(dh) {
	
	var thiz=this;
	this.conns = {};
	
	adapterConfig.findAll(function(err, adapters) {
		for(var x in adapters) {
			var adapter = adapters[x];
			if(adapter.adapterType == thiz.getAdapterType()) {
				var xmppConn = {};
				xmppConn.from = adapter.accessToken;
				
				xmppConn.conn = new xmpp.SimpleXMPP();
				thiz.addListeners(xmppConn);
				
        console.log("Going to connect to host: "+thiz.host+" for user: "+adapter.accessToken+" with pass: "+adapter.accessTokenSecret);
        
				xmppConn.conn.connect({
				  jid         : adapter.accessToken,
				  password    : adapter.accessTokenSecret,
				  host        : thiz.host,
				  port        : thiz.post
				});
				thiz.conns[adapter.accessToken] = xmppConn;
			}
		}
	});
}

XmppAdapter.prototype.stop = function(adapter) {
  for(var x in conns) {
  
    if(conns[x].from == adapter.accessToken) {
      delete conns[x].conn;
    }
  }
}

XmppAdapter.prototype.addListeners = function(xmppConn) {
	
	var thiz=this;
	xmppConn.conn.on('online', function() {
		console.log('Yes, '+xmppConn.from+' is connected!');
    // Do get roster to receive invitations
    xmppConn.conn.getRoster();
	});
	
	xmppConn.conn.on('chat', function(from, text) {
		
		var message = {};
		message.localAddress = xmppConn.from;
		message.message = text;
		message.remoteAddress = from;
		thiz.processMessage(message);
	});
	
	xmppConn.conn.on('subscribe', function(from) {
		console.log('Received invitation from: '+from);
    xmppConn.conn.acceptSubscription(from);
		console.log('Accepted invitation from: '+from);
	});

	xmppConn.conn.on('error', function(err) {
		console.error(err);
	});
}

XmppAdapter.prototype.sendMessage = function(reply, subject, localAddress, fromName, remoteAddress, toName) {
  var conn = this.conns[localAddress].conn
  console.log("Send: "+reply+" to: "+remoteAddress);
  conn.send(remoteAddress, reply);
}

XmppAdapter.prototype.getAdapterType = function() {
  return "XMPP";
}

module.exports = XmppAdapter;