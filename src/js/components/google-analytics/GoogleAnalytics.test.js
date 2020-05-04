import 'whatwg-fetch';
import history from './__mocks__/history';
import PerformanceObserver from './__mocks__/PerformanceObserver';
import { tracker, googleAnalyticsInit } from './GoogleAnalytics';

global.ga = function ga(content) {
    console.log(content);
};
global.PerformanceObserver = PerformanceObserver;

// const REPORTED_TITLE = 0;
// const REPORTED_PATH = 1;

googleAnalyticsInit('123', 'tracker', history, '.*localhost.*');

//
// describe('reportPageViews', () => {
//     const gaReportPageSpy = jest.spyOn(tracker, 'reportPage');
//
//     // its important to reset the mocked responses in the spy function in order to be able to access always to the first call in gaReportPageSpy.mock.calls
//     afterEach(() => {
//         gaReportPageSpy.mockReset();
//     });
//
//     it('should report combined path as original when no state is passed on location', () => {
//         history.push('/test/path', null);
//
//         expect(gaReportPageSpy)
//             .toHaveBeenCalled();
//         expect(gaReportPageSpy.mock.calls[0][REPORTED_PATH])
//             .toEqual('/test/path/');
//     });
//
//     it('should make sure that page is reported when changing query param', function () {
//         history.push('/test/path?p=1', null);
//         gaReportPageSpy.mockReset();
//         history.push('/test/path?p=2', null);
//         expect(gaReportPageSpy)
//             .toHaveBeenCalled();
//     });
//     it('should report path as virtual when state isVirtualPathOnly = true', () => {
//         history.push('/test/path', gaBuildPageViewState('TITLE', '/virtual/path', true));
//
//         expect(gaReportPageSpy)
//             .toHaveBeenCalled();
//         expect(gaReportPageSpy.mock.calls[0][REPORTED_PATH])
//             .toEqual('/virtual/path');
//         expect(gaReportPageSpy.mock.calls[0][REPORTED_TITLE])
//             .toEqual('TITLE');
//     });
//
//     it('should report combined path when state isVirtualPathOnly = false and state is passed', () => {
//         history.push('/test/path', gaBuildPageViewState('COMBINED', '/virtual/path/'));
//
//         expect(gaReportPageSpy)
//             .toHaveBeenCalled();
//         expect(gaReportPageSpy.mock.calls[0][REPORTED_PATH])
//             .toEqual('/test/path/virtual/path/');
//         expect(gaReportPageSpy.mock.calls[0][REPORTED_TITLE])
//             .toEqual('COMBINED');
//     });
// });

describe('reporting events', function () {
    const gaReportActionSpy = jest.spyOn(tracker, 'reportAction');

    afterEach(() => {
        gaReportActionSpy.mockReset();
    });

    it('should validate that ga function is called when reporting event', function () {
        tracker.reportAction('CATEGORY', 'ACTION', 'label', 1);
        expect(gaReportActionSpy)
            .toHaveBeenCalled();
    });

    it('should validate that ga function is called when reporting reportHumanAction', function () {
        tracker.reportHumanAction('ACTION', 'label', 1);
        expect(gaReportActionSpy)
            .toHaveBeenCalled();
    });
    it('should validate that ga function is called when reporting reportMachineAction', function () {
        tracker.reportMachineAction('ACTION', 'label', 1);
        expect(gaReportActionSpy)
            .toHaveBeenCalled();
    });


});

describe('reporting exception', function () {
    const gaReportExceptionSpy = jest.spyOn(tracker, 'reportException');

    afterEach(() => {
        gaReportExceptionSpy.mockReset();
    });

    it('should validate that ga function is called when reporting event', function () {
        tracker.reportException('error', true);
        expect(gaReportExceptionSpy)
            .toHaveBeenCalled();
    });


});

//TODO test time to first paint
//TODO test performance reporting

/*describe('performance reporting', function () {
    const spies = [jest.spyOn(tracker, 'sendDownloadTime'), jest.spyOn(tracker, 'sendServerWaitingTime'), jest.spyOn(tracker, 'sendDurationTime')];
    const URL = 'https://httpbin.org/get';
    googleAnalyticsInit('123', 'myTrackerName', history, /.*httpbin\.org.*!/i);

    //send sample request
    // sendRequest(url);

    afterEach(() => {
        spies.forEach(s => s.mockReset());
    });


    it('should report to ga 3 requests when a request to certain api is performed', async function () {
        // const perfSpy = jest.spyOn(window, 'PerformanceObserver');

        const result = await fetch(URL);
        spies.every(s => expect(s)
            .toHaveBeenCalled());
    });

    it('should filter out certain requests if filter is provided', function () {

    });

    it('should pass all requests if no filter was provided', function () {

    });

});*/
