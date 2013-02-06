var request = require('request'),
    _ = require('underscore');

var Answer = function() {
  this.answer_text=null;
  this.answer_id=null;
  this.callback=null;
}

Answer.prototype.getExpandedText = function(language, callback) {
  var url = this.answer_text;
  if(url==null || url=="") return callback("");
  if(url.indexOf("text://")!=-1) return callback(url.substring(7));
  if(language!=null && language!="") {
    url+=url.indexOf("?")>0?"&":"?";
    url+="preferred_language="+language;
  }
  request(url, function(e, r, body) { 
    if(!e) {
      return callback(body);
    }
    
    callback("");
  });
}

Answer.fromObject = function(answer) {
    return _.extend(new Answer(), answer);
}

module.exports = Answer;