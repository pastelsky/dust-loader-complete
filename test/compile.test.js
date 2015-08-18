'use strict';

var fs = require('fs');
var path = require('path');
var assign = require('object-assign');
var mkdirp = require('mkdirp');
var rimraf = require('rimraf');
var webpack = require('webpack');

var assert = require('chai').assert;
var expect = require('chai').expect;

describe('dust-loader-complete', function() {

	var outputDir = path.resolve(__dirname, './output');
	var outputFile = 'pack_to_test.js';
	var outputPath = path.join(outputDir, outputFile);
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
			filename: outputFile,
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

	function checkOutputFile(outputDir, done, customChecks) {
		fs.readdir(outputDir, function(err, files) {
			// check for errors
			expect( err ).to.be.null;

			// make sure a file was generated
			expect(files.length).to.be.above(0);

			fs.readFile(outputPath, function(err, data) {
				// check for errors
				expect( err ).to.be.null;

				// convert data to string
				var str = data.toString();

				// make sure packed file includes the register function for the partials
				assert.isAbove( str.indexOf( 'dust.register("dust\\/master"' ), -1, "dust/master is included in packed file" );
				assert.isAbove( str.indexOf( 'dust.register("dust\\/include"' ), -1, "dust/include is included in packed file" );

				// make sure packed file doesn't include the phrase "Cannot find module"
				assert.isBelow( str.indexOf( 'Cannot find module' ), 0, "All partials were found" );

				// do any custom checks
				if ( customChecks ) {
					customChecks( str );
				}

				return done();
			});
		});
	}

	// Remove test file before each test
	beforeEach( function( done ) {
		rimraf( outputPath, function( err ) {
			if (err) { return done( err ); }
			else { return done(); }
		} );
	} );

	// Remove output directory after all tests are done
	after( function( done ) {
		rimraf( outputDir, function( err ) {
			if (err) { return done( err ); }
			else { return done(); }
		} );
	} );

	describe( 'when requiring a dust template from JavaScript', function() {
		it( 'should allow requiring templates via relative paths', function( done ) {
			var config = assign( {}, globalConfig, {
				entry: './test/fixtures/sibling/sibling.js'
			} );

			webpack( config, function( err, stats ) {
				expect( err ).to.be.null;
				checkOutputFile( outputDir, done );
			} );
		} );
	} );

	describe( 'when compiling a dust template', function() {

		it( 'should require any relatively-pathed partials', function( done ) {
			var config = assign( {}, globalConfig, {
				entry: './test/fixtures/relative.js'
			} );

			webpack( config, function( err, stats ) {
				expect( err ).to.be.null;
				checkOutputFile( outputDir, done );
			});
		});

		it( 'should require absolutely-pathed partials when provided with a proper resolve.root', function( done ) {
			var config = assign( {}, globalConfig, {
				entry: './test/fixtures/absolute.js'
			} );

			webpack( config, function( err, stats ) {
				expect( err ).to.be.null;
				checkOutputFile( outputDir, done );
			});
		});

		it( 'should allow a space in between the partial opening tag and the partial name', function( done ) {
			var config = assign( {}, globalConfig, {
				entry: './test/fixtures/space.js'
			} );

			webpack( config, function( err, stats ) {
				expect( err ).to.be.null;
				checkOutputFile( outputDir, done );
			} );
		} );

		it( 'should allow parameters to be passed in to the partial', function( done ) {
			var config = assign( {}, globalConfig, {
				entry: './test/fixtures/parameters.js'
			} );

			webpack( config, function( err, stats ) {
				expect( err ).to.be.null;
				checkOutputFile( outputDir, done );
			} );
		} );

		describe("{! require !} comments", function() {

			it( 'should require files written in this form: {! require("./master") !}', function( done ) {
				var config = assign( {}, globalConfig, {
					entry: './test/fixtures/require1'
				} );

				webpack( config, function( err, stats ) {
					expect( err ).to.be.null;
					checkOutputFile( outputDir, done );
				} );
			});

			it( 'should require all files written piped together in the form of: {! require("./[include|master]") !}', function( done ) {
				var config = assign( {}, globalConfig, {
					entry: './test/fixtures/require2'
				} );

				webpack( config, function( err, stats ) {
					expect( err ).to.be.null;
					checkOutputFile( outputDir, done );
				} );
			});
		});

	} );


	describe( 'the dustAlias option', function() {
		it( 'should specify which webpack alias to require to find the DustJS module', function( done ) {
			var config = assign( {}, globalConfig, {
				entry: './test/fixtures/relative.js',
				resolve: {
					root: path.join( __dirname, 'fixtures' ),
					extensions: ['', '.webpack.js', '.web.js', '.js', '.dust'],
					alias: {
						templating: 'dustjs-linkedin'
					}
				},
				module: {
					loaders: [
						{
							test: /\.dust$/,
							loader: dustLoader,
							exclude: /node_modules/,
							query: {
								root: "test/fixtures",
								dustAlias: "templating"
							}
						}
					]
				}
			} );

			webpack( config, function( err, stats ) {
				expect( err ).to.be.null;
				checkOutputFile( outputDir, done );
			} );

		} );

		describe( 'the wrapperGenerator option ', function() {

			it( 'should execute the specified function generating a wrapper function for the dust.render method', function( done ) {
				function generator(name) {
					return "function( context, callback ) { " + "var base = dust.makeBase( { test: 'stuff' } ); " + "base.push( context ); " + "dust.render( '" + name + "', context, callback ); }";
				};

				var config = assign( {}, globalConfig, {
					entry: './test/fixtures/relative.js',
					module: {
						loaders: [
							{
								test: /\.dust$/,
								loader: dustLoader,
								exclude: /node_modules/,
								query: {
									root: "test/fixtures"
								}
							}
						]
					},
					'dust-loader-complete': {
						wrapperGenerator: generator
					}

				} );

				webpack( config, function( err, stats ) {
					expect( err ).to.be.null;

					checkOutputFile( outputDir, done, function (pack) {
						assert.isAbove( pack.indexOf( "var base = dust.makeBase( { test: 'stuff' } );" ), -1, "wrapperGenerator has been called" );
					} );

				} );

			} );

		} );

	} );


});
