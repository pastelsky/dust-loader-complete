# dust-loader-complete
A complete webpack loader for DustJS files.

## Overview
dust-loader-complete is a webpack loader for DustJS files that compiles DustJS template files into their JavaScript template functions. It has two main advantages over the alternatives:
1. Instead of returning the template function itself, it returns a wrapper function that can be called directly.
2. It automatically finds all partials and requires them, which adds them into your webpack bundle.

## Installation
```
    npm install --save-dev dust-loader-complete
```
	
## Usage
There are two changes you need to make to your webpack configuration in order to use dust-loader-complete.

First, add the following to the array of loaders (assuming your dust files are saved with a .dust extension):
```javascript
    { test: /\.dust$/, loader: "dust-loader-complete" }
```
Second, provide an alias for the `dustjs-linkedin` module. dust-loader-complete writes a `var dust = require( )` method at the top of every compiled template. It needs to know how to require the DustJS module. The default is to use the alias `dustjs`:
```javascript
    alias: {
        dustjs: 'dustjs-linkedin'
    }
```
