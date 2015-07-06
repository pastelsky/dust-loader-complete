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

// Export actual loader method
module.exports = function( content ) {
  if (this.cacheable) { this.cacheable(); }
  
  // Set up default options & override them with other options
  var default_options = {
	 root: '',
   dustAlias: 'dustjs',
	 namingFn: defaultNamingFunction
  };
  var global_options = this.options['dust-loader-safe'];
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
  var reg = /{>\s?"?([\w\.\/\-_]+)"? ?\/}/g,
  	result = null,
	  deps = [];
		
  while ( (result = reg.exec( content ) ) !== null ) {
	  deps.push( "var partial" + deps.length + " = require('" + result[1] + "');" );
  }
  
  // Return the code needed to run this template
  return "var dust = require('" + options.dustAlias + "'); "
  		 + deps.join( ' ' )
         + template
         + "module.exports = function ( context, callback ) { dust.render( '" + name + "', context, callback ); };";
};
