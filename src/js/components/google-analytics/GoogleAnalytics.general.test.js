import {tracker} from './GoogleAnalytics';


describe('Testing setUserId', function () {
    const gaSpy = jest.spyOn(global, 'ga');

    function validateReportEventResult(userId) {
        expect(gaSpy).toHaveBeenCalledTimes(1);
        expect(gaSpy.mock.calls[0][0]).toEqual('tracker.set');
        expect(gaSpy.mock.calls[0][1]).toEqual('userId');
        expect(gaSpy.mock.calls[0][2]).toEqual(userId);
    }

    afterEach(() => {
        gaSpy.mockReset();
    });


    it('should trigger ga function setting tracker name', function () {
        const USER_ID = 'mamba';
        tracker().setUserId(USER_ID);
        validateReportEventResult(USER_ID);
    });
});

