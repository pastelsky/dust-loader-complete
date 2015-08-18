var path = require('path');
var dust = require('dustjs-linkedin');
var assign = require('object-assign');
var loaderUtils = require('loader-utils');
var fs = require('fs');

// Create a default function for naming the template based on the path
function defaultNamingFunction( template_path, options, content ) {  
	return template_path
			.replace( '.dust', '' )					 // remove .dust file extension
			.split( path.sep ).join( '/' );	 // split at path separator and replace with a forward slash			
}

// Create a wrapper function for calling dust.render
function defaultWrapperGenerator( name ) {
  return "function( context, callback ) { dust.render( '" + name + "', context, callback ); }"
}

// Export actual loader method
module.exports = function( content ) {
  if (this.cacheable) { this.cacheable(); }
  
  // Set up default options & override them with other options
  var default_options = {
	 root: '',
   dustAlias: 'dustjs',
	 namingFn: defaultNamingFunction,
   wrapperGenerator: defaultWrapperGenerator
  };
  var global_options = this.options['dust-loader-complete'];
  var loader_options = loaderUtils.parseQuery(this.query);
  var options = assign({}, default_options, global_options, loader_options);
  
  // Fix slashes & resolve root
  options.root = path.resolve( options.root.replace( '/', path.sep ) );
 
  // Get the path
  var template_path = this.resourcePath.replace( options.root + path.sep, '' );
  
  // Create the template name
  var name = options.namingFn( template_path, options, content );

  // Compile the template
  var template = dust.compile( content, name ); 
  
  // Find any referenced templates & add them to a list of dependencies
  var reg = /{>\s?"?([\w\.\/\-_]+)"?.*\/}/g,
  	result = null,
	  deps = [];
		
  while ( (result = reg.exec( content ) ) !== null ) {
	  deps.push( "var partial" + deps.length + " = require('" + result[1] + "');" );
  }

  //a regex to see if there are any {! require("DUST_FILE") !} comments to also require
  var require_reg = /{! require\("([\w\.\/\-_\|[\]]+)\"\) !}/g;

  //a regex to check if there are any brackets in the require statment like patterns/atoms/[button|button_link]
  var bracket_reg = /\[([^\]]*)\]/g;

  //variables to hold the results from the require regex and the bracket regex
  var require_result, bracket_result;

  //if there is a require comment, parse it out even further
  while ( (require_result = require_reg.exec( content ) ) !== null ) {
    //this will check if there are any comments that have a | delimited list of files, such as {! require("patterns/atoms/[button|button_link]") !}
    bracket_result = bracket_reg.exec(require_result[1]);

    //if there is a require_result, split the files by | and include them all
    if(bracket_result) {
      var parts = bracket_result[1].split("|");
      for(var i = 0; i < parts.length; i++) {
        var output = require_result[1].replace(bracket_reg, parts[i]);
        deps.push( "var partial" + deps.length + " = require('" + output + "');" );
      }
    }
    //if there isn't a require_result, assume it was just a normal require like {! require("patterns/atoms/button") !}
    else {
      deps.push( "var partial" + deps.length + " = require('" + require_result[1] + "');" );
    }
  }


  // Return the code needed to run this template
  return "var dust = require('" + options.dustAlias + "/lib/dust'); "
  		 + deps.join( ' ' )
         + template
         + "module.exports = " + options.wrapperGenerator( name );
};
