#!/usr/bin/env node
const path = require( 'path' );
const cli  = require( '@imperva/vulcan/cli' );

cli( config => ( {
  paths: {
    src:        path.resolve( config.paths.projectRoot, './src' ),
    build:      path.resolve( config.paths.projectRoot, './lib' ),
    publicPath: '/',
  },
} ) );
