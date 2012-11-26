var dh = require('./dialoghandler.js'),
    mail = require('./adapters/mail.js');

dh.addAdapter(mail);

dh.start(3000);