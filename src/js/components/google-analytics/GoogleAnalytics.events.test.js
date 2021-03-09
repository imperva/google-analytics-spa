import {googleAnalyticsInit} from './GoogleAnalytics';
import Configs from '../../configs/configurations';

const gaSpy = jest.spyOn(global, 'ga');

export function getEventReportObject(category, action, label, val) {
    return {
        hitType: 'event',
        eventCategory: category,
        eventAction: action,
        eventLabel: label,
        eventValue: val,
        transport: 'beacon'
    };
}

export function validateReportEventResult(spy, category, action, label, val) {
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy.mock.calls[1][0]).toEqual('tracker.send');
    expect(spy.mock.calls[1][1]).toEqual(getEventReportObject(category, action, label, val));
}

describe('reporting events', function () {
    const CAT = 'CATEGORY';
    const ACT = 'ACTION';
    const LBL = 'label';
    const VAL = 0;
    let _tracker;

    beforeAll(() => {
        _tracker = googleAnalyticsInit('123', 'tracker', global.testHistory, null);
    });
    beforeEach(() => {
        gaSpy.mockClear();
    });
    afterAll(() => {
        jest.resetAllMocks();
    });

    it('should validate that ga function is called twice when reporting action', function () {
        _tracker.reportAction(CAT, ACT, LBL, VAL);
        validateReportEventResult(gaSpy, CAT, ACT, LBL, VAL);
    });

    it('should validate that ga function is called twice when reporting event', function () {
        _tracker.reportEvent(CAT, ACT, LBL, VAL);
        validateReportEventResult(gaSpy, CAT, ACT, LBL, VAL);
    });

    it('should validate that ga function is called twice when reporting reportHumanAction', function () {
        _tracker.reportHumanAction(ACT, LBL, VAL);
        validateReportEventResult(gaSpy, Configs.ga.categories.CATEGORY_HUMAN, ACT, LBL, VAL);
    });
    it('should validate that ga function is called twice when reporting reportMachineAction', function () {
        _tracker.reportMachineAction(ACT, LBL, VAL);
        validateReportEventResult(gaSpy, Configs.ga.categories.CATEGORY_MACHINE, ACT, LBL, VAL);
    });


});
