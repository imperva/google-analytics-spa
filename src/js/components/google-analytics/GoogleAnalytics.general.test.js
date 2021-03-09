import {googleAnalyticsInit, tracker} from './GoogleAnalytics';
import Texts from '../../configs/texts';

const warnSpy = jest.spyOn(console, 'warn');
const errorSpy = jest.spyOn(console, 'error');
const gaSpy = jest.spyOn(global, 'ga');


describe('Testing setUserId', function () {

    function validateReportEventResult(userId) {
        expect(gaSpy).toHaveBeenCalledTimes(1);
        expect(gaSpy.mock.calls[0][0]).toEqual('tracker.set');
        expect(gaSpy.mock.calls[0][1]).toEqual('userId');
        expect(gaSpy.mock.calls[0][2]).toEqual(userId);
    }

    beforeAll(() => {
        googleAnalyticsInit('123', 'tracker', global.testHistory, null);
    });
    beforeEach(() => {
        gaSpy.mockClear();
    });
    afterAll(() => {
        jest.resetAllMocks();
    });


    it('should trigger ga function setting tracker name', function () {
        const USER_ID = 'mamba';
        tracker().setUserId(USER_ID);
        validateReportEventResult(USER_ID);
    });
});

describe('Testing googleAnalyticsInit', function () {

    beforeEach(() => {
        warnSpy.mockClear();
        errorSpy.mockClear();
        gaSpy.mockClear();
    });
    afterAll(() => {
        jest.resetAllMocks();
    });


    it('should throw alert when trying to init without history, but still should pass', function () {
        googleAnalyticsInit('UX-xxx','testTracker1', null, /.*/);
        expect(warnSpy).toHaveBeenCalled();
        expect(warnSpy.mock.calls[0][0]).toEqual(Texts.NO_HISTORY);
    });

    it('should print warning when theres no PerformanceObserver present', function () {
        const perfOrig = PerformanceObserver;
        window.PerformanceObserver = undefined;
        global.PerformanceObserver = undefined;
        googleAnalyticsInit('UX-xxx','testTracker1', global.testHistory, /.*/);
        expect(warnSpy).toHaveBeenCalled();
        expect(warnSpy.mock.calls[0][0]).toEqual(Texts.NO_AUTO_PERFORMANCE);

        global.PerformanceObserver = perfOrig;
    });

    it('should not track performance if null is passed for performanceConfig', function () {
        const tracker = googleAnalyticsInit('UX-xxx','testTracker1', global.testHistory, null);
        expect(tracker.performanceObserver).not.toBeDefined();
    });

    it('should fail if no tracker id was passed', function () {

        try {
            googleAnalyticsInit(null, 'testTracker1', global.testHistory, /.*/);
        } catch (e) { console.log('failed as it should');}
        expect(errorSpy).toHaveBeenCalled();
        expect(errorSpy.mock.calls[0][0]).toEqual(Texts.GA_FACTORY_FAILED);

    });
});
