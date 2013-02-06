var dh = require('./dialoghandler.js'),
    mail = require('./adapters/mail.js'),
    xmpp = require('./adapters/xmpp.js');
    
var port = (process.env.VMC_APP_PORT || 3000);
var host = (process.env.VCAP_APP_HOST || 'localhost');

dh.addAdapter(mail);
dh.addAdapter(xmpp);

dh.start(port, host);