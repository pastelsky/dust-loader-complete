var dust = require( 'dustjs' );

var template = require( 'relative' );

describe( "relatively-pathed partials", function( ) {
    var rendered;
    
    beforeEach( function( done ){
        dust.render( 'relative', {}, function( err, out ) {
            if (err) return done( err );
            rendered = out;
            done();
        } );
	} );
    
    it( 'should render properly as part of the compiled template', function() {
        expect( rendered.indexOf( "<!doctype html>" ) ).to.equal( 0 );        
    } );
    
    it( 'should properly pass parameters into the partial', function() {
        expect( rendered.indexOf( "<title>Relative</title>" ) ).to.not.equal( -1 );
    } );
    
    it( 'should render partials that have a space before the partial name', function() {
        expect( rendered.indexOf( "Hello world!" ) ).to.not.equal( -1 );
    } );
    
    it( 'should render partials with a syntax like {> partial /} (no quotes)', function() {
        expect( rendered.indexOf( "Hello world!" ) ).to.not.equal( -1 );
    } );
   
} );
