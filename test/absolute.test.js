var dust = require( 'dustjs' );

var template = require( 'absolute' );


describe( "absolutely-pathed partials", function( ) {
    var rendered;
    
    beforeEach( function( done ){
        dust.render( 'absolute', {}, function( err, out ) {
            if (err) return done( err );
            rendered = out;
            done();
        } );
	} );
    
    it( 'should render properly as part of the compiled template', function() {
        expect( rendered.indexOf( "<!doctype html>" ) ).to.equal( 0 );
        expect( rendered.indexOf( 'Hello world!' ) ) .to.not.equal( -1 );     
    });   
});
