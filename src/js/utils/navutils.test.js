import { getAccountId } from './navutils';

describe( 'Validation of account id extraction', () => {
  it( 'should make sure that correct account is extracted from CAID query param', () => {
    const caid = getAccountId( '?something=0&caid=43' );
    expect( caid ).toEqual( '43' );
  } );

  it( 'should make sure that correct account is extracted when using location.search', () => {
    global.window = Object.create( window );
        // delete location.search;
    // location.search = url;
    // Object.defineProperty( location, 'search', {
    //   value: url,
    // } );

    history.pushState( {}, 'caid location', '/caid.text?something=0&caid=43' );

    const caid = getAccountId();
    expect( caid ).toEqual( '43' );
  } );
} );
