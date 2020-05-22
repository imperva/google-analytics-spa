import {tracker} from './GoogleAnalytics';
import Configs from '../../configs/configurations';

function getEventReportObject(category, action, label, val) {
    return {
        hitType: 'event',
        eventCategory: category,
        eventAction: action,
        eventLabel: label,
        eventValue: val,
        transport: 'beacon'
    };
}



describe('reporting events', function () {
    const CAT = 'CATEGORY';
    const ACT = 'ACTION';
    const LBL = 'label';
    const VAL = 0;
    let _tracker = tracker();
    const gaSpy = jest.spyOn(global, 'ga');

    function validateReportEventResult(category, action, label, val) {
        expect(gaSpy).toHaveBeenCalledTimes(2);
        expect(gaSpy.mock.calls[1][0]).toEqual('tracker.send');
        expect(gaSpy.mock.calls[1][1]).toEqual(getEventReportObject(category, action, label, val));
    }

    afterEach(() => {
        gaSpy.mockReset();
    });

    it('should validate that ga function is called when reporting action', function () {
        _tracker.reportAction(CAT, ACT, LBL, VAL);
        validateReportEventResult(CAT, ACT, LBL, VAL);
    });

    it('should validate that ga function is called when reporting event', function () {
        _tracker.reportEvent(CAT, ACT, LBL, VAL);
        validateReportEventResult(CAT, ACT, LBL, VAL);
    });

    it('should validate that ga function is called when reporting reportHumanAction', function () {
        _tracker.reportHumanAction(ACT, LBL, VAL);
        validateReportEventResult(Configs.ga.categories.CATEGORY_HUMAN, ACT, LBL, VAL);
    });
    it('should validate that ga function is called when reporting reportMachineAction', function () {
        _tracker.reportMachineAction(ACT, LBL, VAL);
        validateReportEventResult(Configs.ga.categories.CATEGORY_MACHINE, ACT, LBL, VAL);
    });


});
