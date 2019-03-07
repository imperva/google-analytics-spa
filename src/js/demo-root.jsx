import React from 'react';
import { render } from 'react-dom';
import Demo from './Demo.jsx';

const wrapper = document.getElementById( 'react-root' );
if ( wrapper ) {
  render( <Demo />, wrapper );
}
