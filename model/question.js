var request = require('request'),
    Answer = require('./answer.js'),
    _ = require('underscore'),
    async = require('async');

var Question = function() {
  this.question_id=null;
  this.requester=null;
  this.responder=null;
  this.question_text=null;
  this.answers=null;
  this.type=null;
  this.url=null;
}

Question.prototype.answer = function(address, answerId, answerInput, callback) {
  var answer=null;
  var thiz=this;
  if(this.type=="open") {
    this.processAnswer(this.answers[0], answerInput, address, callback);
  } else if(this.type=="comment" || this.type=="referral") {
    if(this.answers == null || this.answers.length ==0 )
      return callback(null);
    this.processAnswer(this.answers[0], answerInput, address, callback);
  } else if(answerId!=null) {
    
    for(var x in this.answers) {
      if(this.answers[x].id == answerId) {
        this.processAnswer(this.answers[x], answerInput, address, callback);
        break;
      }
    }    
  } else if(answerInput!=null){
    answerInput = answerInput.trim();
    
    console.log("Answer closed question");
    
    // Check if the answer input matches the text
    var funcs = [];
    var finalAnswer = null;
    if(this.answers!=null) {
      async.forEach(this.answers, function(answer){
         var promise = function(callback) {
           answer.getExpandedText(this.language, function(text) {
             if(text.toLowerCase() == answerInput.toLowerCase())
                return callback(null, answer);
             
             return callback(null, null);
           });
         }
         funcs.push(promise);
      });
    }
    
    async.parallel(funcs, function(err, results){
      async.forEach(results, function(answer, cb){
        if(answer!=null) {
          return thiz.processAnswer(answer, answerInput, address, callback);
        }        
        // Memory leak?
        cb();
      }, function(err){
        return thiz.processAnswer(null, answerInput, address, callback);
      });
    });
    
    // Check if input is integer and then give the position
    //this.processAnswer(null, answerInput, address, callback);
  }
}

Question.prototype.getExpandedText = function(callback) {
  var url = this.question_text;
  if(url==null || url=="") return callback("");
  if(url.indexOf("text://")==0) return callback(url.substring(7));
  if(this.language!=null && this.language!="") {
    url+=url.indexOf("?")>0?"&":"?";
    url+="preferred_language="+this.language;
  }
  request(url, function(e, r, body) {
    if(!e) {
      return callback(body);
    }
    
    callback("");
  });
}

Question.prototype.getExpandedRequest = function(callback) {
  var url = this.requester;
  if(url==null || url=="") return callback("");
  if(url.indexOf("text://")) return callback(url.substring(7));
  if(this.language!=null && this.language!="") {
    url+=url.indexOf("?")>0?"&":"?";
    url+="preferred_language="+this.language;
  }
  request(url, function(e, r, body) { 
    if(!e) {
      return calback(body);
    }
    
    callback("");
  });
}

Question.prototype.processAnswer = function(answer, answerInput, responder, callback) {
  if(answer==null && this.type!="comment") {
    return callback(this);
  }
  
  var newQ = null;
  
  var answerPost = {};
  answerPost.question_id=this.question_id;
  answerPost.answer_id=answer.answer_id;
  answerPost.answer_text=answerInput;
  answerPost.responder=responder;
  
  request.post(answer.callback, JSON.stringify(answerPost), function(e, r, body){
    console.log("Received next question:");
    console.log(JSON.parse(body));
    if(!e) {
      newQ = _.extend(new Question(), JSON.parse(body));
      newQ.language = this.language;
      newQ.parseAnswers();      
    }
    
    callback(newQ);
  });
}

Question.prototype.parseAnswers = function() {
  for(var x in this.answers) {
    this.answers[x] = Answer.fromObject(this.answers[x]);
  }
}

Question.fromURL = function(url, callback) {
  
  console.log("Getting question from:"+url);
  
  request(url, function(e, r, body) {
    if(!e) {
      console.log("Received question:");
      console.log(body);
      
      try {
        body = JSON.parse(body);
      } catch(ex) {
        return callback(null);
      }
      
      question = _.extend(new Question(), body);
      question.parseAnswers();
      
      return callback(question);
    } else {
      console.log(e);
    }    
    
    callback(null);
  });  
}

Question.fromJSON = function(json, callback) {
    console.log("Load question: "+json);
    
    question = _.extend(new Question(), JSON.parse(json));
    question.parseAnswers();
    callback(question);
}

module.exports = Question;