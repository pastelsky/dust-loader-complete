var dust = require( 'dustjs' );

var simple = require( 'simple' );
var variable = require( 'variable' );


describe("dust-loader-complete", function( ) {
    it( 'should allow dust to find the required template by name', function( done ) {
        dust.render( 'simple', {}, function( err, out ) {
            expect( err ).to.be.null;
            expect( out ).to.equal( 'Hello, world!' );
            done();
        } );
    });
    
    it( 'should render the template by calling the returned function', function( done ) {
        simple( {}, function( err, out ) {
            expect( err ).to.be.null;
            expect( out ).to.equal( 'Hello, world!' );
            done();
        } );
    } );
    
    it( 'should not attempt to pack or compile any partial with a dust variable in its name', function( done ) {
        dust.render( 'multi/require{num}', {}, function( err, out ) {
            expect( err ).to.not.be.null;
            done();
        } );
    } );
    
});
