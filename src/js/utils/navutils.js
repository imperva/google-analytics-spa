/* eslint-disable import/prefer-default-export */
import * as QueryString from 'query-string';


function extractAccountId( locationSearch ) {
  if ( !locationSearch ) {
    return locationSearch;
  }

  try {
    return QueryString.parse( locationSearch ).caid;
  }
  catch ( e ) {
    return locationSearch;
  }
}


export function getAccountId( queryParams = location.search ) {
  return extractAccountId( queryParams );
}

