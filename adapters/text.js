var adapterConfig = require('../routes/adapterconfig.js'),
    Session = require('../routes/session.js'),
    Question = require('../model/question.js'),
    async = require('async');

var Text = function() {
}

/**
* Process the received message
* 
* String Received message
*/
Text.prototype.processMessage = function(message) {
  var thiz=this;
  adapterConfig.findByTypeAndAddress(this.getAdapterType(), message.localAddress, function(err, adapter) {
    
    if(err) {
      thiz.sendMessage("Sorry, I can't find the account associated with this chat address...", null, message.localAddress, null, message.remoteAddress);
      return;
    }
    
    var sessionKey = thiz.getAdapterType() + "|" + message.localAddress + "|" + message.remoteAddress;
    // Load session
    Session.findByKey(sessionKey, function(err, session) {
      console.log("Load session: "+session);
      var preferred_language = adapter.preferred_language;
      var skip=false;
      if(message.message.charAt(0) === "/") {
        var cmd = message.message.substring(1);
        if(cmd.indexOf("language=")==0) {
          preferred_language = cmd.substring(9);
          thiz.sendMessage("Language changed to: "+preferred_language, null, message.localAddress, null, message.remoteAddress);
          skip=true;
        } else if(cmd.indexOf("reset")==0) {
          if(session!=null) {
            console.log("Reset session");
            session.question=null;
            session.language=preferred_language;
          }
        } else if(cmd.indexOf("help")==0) {
        
          var command = cmd.split(" ");
          var reply = "";
          if(command.length == 1) {
            reply = "The following commands are understood:\n"
                + "/help <command>\n" + "/reset \n"
                + "/language=<lang_code>\n";  
          }
          thiz.sendMessage(reply, null, message.localAddress, null, message.remoteAddress);
          return; // Can be skip, but session doesn't need to be stored.
        }        
      }
      
      // If no session create
      if(session==null) {
        session = {};
        session.key = sessionKey;
        session.adapterConfigId = adapter.id;
        session.language = preferred_language;
      }
      
      if(!skip) {
        // Get question from session
        var json = session.question;
        var question;
        // If no question load from initialAgent
        if(json == null) {
          Question.fromURL(adapter.initialAgentURL, processQuestion);
        }  else {
          Question.fromJSON(json, processQuestion);
        }
        
        function processQuestion(question) {
                    
          var reply = "I'm sorry, I don't know what to say. Please retry talking with me at a later time.";
          if(question!=null) {
            // Answer the question with message
            return question.answer(message.remoteAddress, null, message.message, function(question){
              
              console.log("Processing question:");
              console.log(question);
              
              thiz.formQuestion(question, message.remoteAddress, function(reply, question){
                
                if(question==null) {
                  Session.deleteSessionByKey(sessionKey);
                  console.log("Hangup");
                } else {
                  // Store session
                  session.question = JSON.stringify(question);
                  //console.log("Store session: "+session);
                  Session.storeSession(session);
                }
                
                thiz.sendMessage(reply, null, message.localAddress, null, message.remoteAddress);
              });
            });
          }
          thiz.sendMessage(reply, null, message.localAddress, null, message.remoteAddress);
        }
      } else {
          Session.storeSession(session);
      }
    });
  });
}

/**
* Create from a question a response
* 
* Question  The received question
* String    Remote address from user communicating with the DialogHandler
* 
* Return  String the reply which needs to be send to user
* Return  Question the current proocessed question which needs to be stored
*/
Text.prototype.formQuestion = function(question, address, callback) {
  var reply="";
  var LOOP_DETECTION = 10;
  var count = 0;
  
  readQuestion();
  
  function readQuestion() {
    //console.log("Read question: "+question.question_text);
    count++;
    if(count>LOOP_DETECTION) {
      console.log("Loop detected!!!");
      return;
    }
    
    if(question==null)
      return callback(reply, question);
    
    question.getExpandedText(function(qText){
      if (reply!="") reply+="\n";
      if(qText!=null && qText!="") reply += qText;
      console.log("Reply: "+reply);
      
      if(question.type=="closed") {
        
        // Ready all the texts of the possible answers
        var language = question.language;
        var funcs = [];
        question.answers.forEach(function(answer){
          var promise = function(text, callback) {
            answer.getExpandedText(language, function(qText){
               if(callback==null)
                text(null, qText);
              else {
                qText=text+" | "+qText;
                callback(null, qText);
              }
            });
          };
          
          funcs.push(promise);
        });
        
        async.waterfall(funcs, function(err, result){
           reply += "\n[ "+result+" ]";
           callback(reply, question);
        });
        return;
      } else if(question.type=="comment") {
        question.answer(null, null, null, function(q){
          question = q;
          readQuestion();
        });
      } else if(question.type=="referral") {
        Question.fromURL(question.url, function(q){
          question = q;
          readQuestion();
        });
      } else {
        return callback(reply, question);
      }
    });
  }
}

Text.prototype.receiveMessage = function() {
	console.log("This is an abstract function");
}

module.exports = Text;