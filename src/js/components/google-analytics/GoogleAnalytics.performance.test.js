import 'whatwg-fetch';
import {googleAnalyticsInit, tracker} from './GoogleAnalytics';

//TODO test time to first paint
//TODO test performance reporting

export function getPerformanceReportObject(timingVar, category, lbl, val) {
    return {
        hitType: 'timing',
        timingCategory: category,
        timingLabel: lbl,
        timingValue: val,
        timingVar: timingVar,
        transport: 'beacon'
    };
}

export function validateReportPerformanceResult(spy, hitType, category, lbl, val) {
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.mock.calls[1][0]).toEqual('tracker.send');
    expect(spy.mock.calls[1][1]).toEqual(getPerformanceReportObject(hitType, category, lbl, val));
}

describe('performance automatic reporting', function () {
    const URL = 'https://httpbin.org/get';
    const CATEGORY_MANUAL = 'CATEGORY_MANUAL';
    const gaSpy = jest.spyOn(global, 'ga');

    beforeAll(() => {
        googleAnalyticsInit('123', 'tracker', global.testHistory, /.*/);
    });
    beforeEach(() => {
        gaSpy.mockClear();
    });
    afterAll(() => {
        jest.resetAllMocks();
    });


    it('manual reporting should report download time of the last call', function () {
        tracker().reportLastRequestDownloadTime(CATEGORY_MANUAL, URL, '');
        validateReportPerformanceResult(gaSpy, 'download', CATEGORY_MANUAL, '', 10);
    });
    it('manual reporting should report duration of the last call', function () {
        tracker().reportLastRequestDuration(CATEGORY_MANUAL, URL, '');
        validateReportPerformanceResult(gaSpy, 'duration', CATEGORY_MANUAL, '', 10);
    });
    it('manual reporting should report wait time of the last call', function () {
        tracker().reportLastRequestWait(CATEGORY_MANUAL, URL, '');
        validateReportPerformanceResult(gaSpy, 'wait', CATEGORY_MANUAL, '', 10);
    });
    it('manual duration reporting should report the received time ', function () {
        tracker().reportDuration(15, CATEGORY_MANUAL, URL, '');
        validateReportPerformanceResult(gaSpy, 'duration', CATEGORY_MANUAL, '', 15);
    });

    // it('should allow manual report of the last REST request performance', async function () {
    //     const CATEGORY = 'MANUAL';
    //     const data = await fetch(URL);
    //     expect(data).toEqual('');
    // });

    // return fetch(URL).then( data => {
    //     tracker().reportAjaxDownload(CATEGORY, URL, 'dl');
    //     expect(gaSpy).toHaveBeenCalled(1);
    //     expect(gaSpy.mock.calls[0][0]).toEqual('tracker.set');
    //     expect(gaSpy.mock.calls[1][0]).toEqual('tracker.send');
    //     console.log(data);
    // });
    // });

    // it('should report to ga 3 requests when a request to certain api is performed', async function () {
    //     // const perfSpy = jest.spyOn(window, 'PerformanceObserver');
    //
    //     const result = await fetch(URL);
    //     spies.every(s => expect(s)
    //         .toHaveBeenCalled());
    // });
    //
    // it('should filter out certain requests if filter is provided', function () {
    //
    // });
    //
    // it('should pass all requests if no filter was provided', function () {
    //
    // });

});
