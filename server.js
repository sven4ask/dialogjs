var express = require('express'),
    app = express(),
    mail = require('./adapters/mail.js');

app.get('/mail', mail);
app.get('/', function(req, res){
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end("This is the dialog handler. I'm going to handle all you communication\n");
});
    
app.listen(3000);
console.log("Dialog handler listening on: 3000");