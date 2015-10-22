var dust = require( 'dustjs' );

var template = require( 'comments' );


describe( "require comments", function( ) {
    
    it( 'should result in available partials', function( done ) {
        var flags = [false, false];
        
        function found( num ) {
            flags[num] = true;
            
            if (flags[0] && flags[1]) {
                done();
            }
        }
        
        dust.render( 'comments', { num: 0 }, function( err, out ) {
            if (err) return done( err );
            expect( out.indexOf( "<p>require0</p>" ) ).to.not.equal( -1 );
            found(0);            
        } );
        
        dust.render( 'comments', { num: 1 }, function( err, out ) {
            if (err) return done( err );
            expect( out.indexOf( "<p>require1</p>" ) ).to.not.equal( -1 );
            found(1);            
        } );
    });
    
   
});
