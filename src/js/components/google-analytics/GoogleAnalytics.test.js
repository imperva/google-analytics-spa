import history from './__mocks__/history';
import PerformanceObserver from './__mocks__/PerformanceObserver';
import { tracker, googleAnalyticsInit, gaBuildPageViewState } from './GoogleAnalytics';

global.ga = function ga( content ) {
    console.log( content );
};
// global.window.location.pathname = 'http://localhost/';
global.PerformanceObserver = PerformanceObserver;

// jest.mock("infra/GoogleAnalytics");

const REPORTED_TITLE = 0;
const REPORTED_PATH = 1;

googleAnalyticsInit( '123', 'tracker', history, '.*localhost.*' );


describe( 'reportPageViews', () => {
    const gaReportPageSpy = jest.spyOn( tracker, 'reportPage' );

    // its important to reset the mocked responses in the spy function in order to be able to access always to the first call in gaReportPageSpy.mock.calls
    afterEach( () => {
        gaReportPageSpy.mockReset();
    } );

    it( 'should report combined path as original when no state is passed on location', () => {
        history.push( '/test/path', null );

        expect( gaReportPageSpy ).toHaveBeenCalled();
        expect( gaReportPageSpy.mock.calls[ 0 ][ REPORTED_PATH ] ).toEqual( '/test/path/' );
    } );

    it( 'should report path as virtual when state isVirtualPathOnly = true', () => {
        history.push( '/test/path', gaBuildPageViewState( 'TITLE', '/virtual/path', true ) );

        expect( gaReportPageSpy ).toHaveBeenCalled();
        expect( gaReportPageSpy.mock.calls[ 0 ][ REPORTED_PATH ] ).toEqual( '/virtual/path' );
        expect( gaReportPageSpy.mock.calls[ 0 ][ REPORTED_TITLE ] ).toEqual( 'TITLE' );
    } );

    it( 'should report combined path when state isVirtualPathOnly = false and state is passed', () => {
        history.push( '/test/path', gaBuildPageViewState( 'COMBINED', '/virtual/path/' ) );

        expect( gaReportPageSpy ).toHaveBeenCalled();
        expect( gaReportPageSpy.mock.calls[ 0 ][ REPORTED_PATH ] ).toEqual( '/test/path/virtual/path/' );
        expect( gaReportPageSpy.mock.calls[ 0 ][ REPORTED_TITLE ] ).toEqual( 'COMBINED' );
    } );
} );

