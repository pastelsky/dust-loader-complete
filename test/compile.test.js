'use strict';

var fs = require('fs');
var path = require('path');
var assign = require('object-assign');
var expect = require('expect.js');
var mkdirp = require('mkdirp');
var rimraf = require('rimraf');
var webpack = require('webpack');

describe('dust-loader-safe', function() {

  var outputDir = path.resolve(__dirname, './output/loader');
  var dustLoader = path.resolve(__dirname, '../');
  
  var globalConfig = {
    
    entry: './test/fixtures/entry.js',
    resolve: {
      root: path.join( __dirname, 'fixtures' ),
		  extensions: ['', '.webpack.js', '.web.js', '.js', '.dust'],
      alias: {
        dustjs: 'dustjs-linkedin'
      }
    },
    output: {
      path: outputDir,
      filename: '[id].loader.js',
    },
    module: {
      loaders: [
        {
          test: /\.dust$/,
          loader: dustLoader,
          exclude: /node_modules/,
          query: { root: "test/fixtures" }
        }
      ]
    }
  };
  
  console.log( globalConfig.resolve.root );
  
  function checkOutputFile(outputDir, done) {
     fs.readdir(outputDir, function(err, files) {
        expect(err).to.be(null);
        expect(files.length).to.equal(1);
                
        fs.readFile(path.resolve(outputDir, files[0]), function(err, data) {
          expect(err).to.be(null);
          var str = data.toString();
          
          expect(str.indexOf('Cannot find module')).to.be(-1);
          
          return done();
        });
      });
  }

  // Clean generated cache files before each test
  // so that we can call each test with an empty state.
  beforeEach(function(done) {
    rimraf(outputDir, function(err) {
      if (err) { return done(err); }
      mkdirp(outputDir, done);
    });
  });
  
  after( function( done ) {
    rimraf( outputDir, function(err) {
      if (err) { return done(err); }
      else { return done(); }
    } );
  } );
  
  describe( 'when compiling a dust template', function() {
    it( 'should require any relatively-pathed partials', function( done ) {
      var config = assign( {}, globalConfig, {
        entry: './test/fixtures/relative.js'
      } );
  
      webpack(config, function(err, stats) {
        expect(err).to.be(null);
        checkOutputFile( outputDir, done );
      });
    });
    
    it( 'should require absolutely-pathed partials when provided with a proper resolve.root', function( done ) {
      var config = assign( {}, globalConfig, {
        entry: './test/fixtures/absolute.js'
      } );
  
      webpack(config, function(err, stats) {
        expect(err).to.be(null);
        checkOutputFile( outputDir, done );
      });
    });
    
  } );
  

  
});
