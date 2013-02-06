
var JSOL = function(){  
}

JSOL.parse = function(text) {
  text = text.replace(trim, "");
      // Make sure the incoming text is actual JSOL (or Javascript Object Literal)
      // Logic borrowed from http://json.org/json2.js
    if ( /^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, "@")
         .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]")
         .replace(/(?:^|:|,)(?:\s*\[)+/g, ":")
         /** everything up to this point is json2.js **/
         /** this is the 5th stage where it accepts unquoted keys **/
         .replace(/\w*\s*\:/g, ":")) ) {
      return text;
    } else {
      return null;
    }
}

module.exports = JSON;