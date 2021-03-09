import {googleAnalyticsInit, tracker} from './GoogleAnalytics';

function getExceptionReportObject(exDescription, exFatal) {
    return {
        hitType: 'exception',
        exDescription: exDescription,
        exFatal: exFatal,
        transport: 'beacon'
    };
}

describe('reporting exception', function () {
    let _tracker = tracker();
    const gaSpy = jest.spyOn(global, 'ga');
    const ERROR_DESC = 'my error';
    const IF_FATAL = false;

    function validateReportEventResult(exDescription, exFatal) {
        expect(gaSpy).toHaveBeenCalledTimes(2);
        expect(gaSpy.mock.calls[1][0]).toEqual('tracker.send');
        expect(gaSpy.mock.calls[1][1]).toEqual(getExceptionReportObject(exDescription, exFatal));
    }

    beforeAll(() => {
        _tracker = googleAnalyticsInit('123', 'tracker', global.testHistory, null);
    });
    beforeEach(() => {
        gaSpy.mockClear();
    });
    afterAll(() => {
        jest.resetAllMocks();
    });


    it('should validate that ga function is called when reporting an exception', function () {
        _tracker.reportException(ERROR_DESC, IF_FATAL);
        validateReportEventResult(ERROR_DESC, IF_FATAL);
    });


});
