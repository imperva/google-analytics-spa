import {googleAnalyticsInit, tracker} from './GoogleAnalytics';

// const REPORTED_TITLE = 0;
// const REPORTED_PATH = 1;

//the important part here is to spy after the actual ga function, right before its send to the stratosphere
const gaSpy = jest.spyOn(global, 'ga');


function getPageViewSendObject(title, path) {
    return {
        hitType: 'pageview',
        title: title,
        page: path,
        transport: 'beacon'
    };
}

function validatePageViewCall(title, path) {
    expect(gaSpy).toHaveBeenCalled();
    expect(gaSpy.mock.calls[0][0]).toEqual('tracker.set');
    expect(gaSpy.mock.calls[1][0]).toEqual('tracker.send');
    expect(gaSpy.mock.calls[1][1]).toEqual(getPageViewSendObject(title, path));
}

describe('reportPageViews', () => {
    let _tracker;
    let gaReportPageSpy;
    const PATH = '/some/page';
    const PAGE_TITLE = 'test page';

    // its important to reset the mocked responses in the spy function in order to be able to access always to the first call in gaReportPageSpy.mock.calls
    beforeAll(() => {
        _tracker = googleAnalyticsInit('123', 'tracker', global.testHistory, null);
        gaReportPageSpy = jest.spyOn(_tracker, 'reportPage');

    });
    beforeEach(() => {
        gaReportPageSpy.mockClear();
        gaSpy.mockClear();
    });
    afterAll(() => {
        jest.resetAllMocks();
    });


    it('should be able to trigger direct pageView call', function () {
        tracker().reportPage(PAGE_TITLE, PATH);
        validatePageViewCall(PAGE_TITLE, PATH);
    });

    it('should be report function without a title', function () {
        tracker().reportPage(null, PATH);
        validatePageViewCall(null, PATH);
    });

    it('should report combined path as original when no state is passed on location', () => {
        const PATH = '/test/path/1/';
        global.testHistory.push(PATH, null);

        // expect(gaSpy)
        //     .toHaveBeenCalled();
        // expect(gaSpy.mock.calls[0][REPORTED_PATH])
        //     .toEqual('/test/path/');
        //
        validatePageViewCall('', PATH);
    });

    it('should make sure that page is reported when changing query param', function () {
        global.testHistory.push('/test/path?p=1', null);
        gaReportPageSpy.mockReset();
        global.testHistory.push('/test/path?p=2', null);
        expect(gaReportPageSpy)
            .toHaveBeenCalled();
    });
    // it('should report path as virtual when state isVirtualPathOnly = true', () => {
    //     global.testHistory.push('/test/path', gaBuildPageViewState('TITLE', '/virtual/path', true));
    //
    //     expect(gaReportPageSpy)
    //         .toHaveBeenCalled();
    //     expect(gaReportPageSpy.mock.calls[0][REPORTED_PATH])
    //         .toEqual('/virtual/path');
    //     expect(gaReportPageSpy.mock.calls[0][REPORTED_TITLE])
    //         .toEqual('TITLE');
    // });
    //
    // it('should report combined path when state isVirtualPathOnly = false and state is passed', () => {
    //     global.testHistory.push('/test/path', gaBuildPageViewState('COMBINED', '/virtual/path/'));
    //
    //     expect(gaReportPageSpy)
    //         .toHaveBeenCalled();
    //     expect(gaReportPageSpy.mock.calls[0][REPORTED_PATH])
    //         .toEqual('/test/path/virtual/path/');
    //     expect(gaReportPageSpy.mock.calls[0][REPORTED_TITLE])
    //         .toEqual('COMBINED');
    // });
});

