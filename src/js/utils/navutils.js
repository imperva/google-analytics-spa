import * as QueryString from 'query-string';

/* eslint-disable import/prefer-default-export */
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


export function getAccountId() {
  extractAccountId( location.search );
}

