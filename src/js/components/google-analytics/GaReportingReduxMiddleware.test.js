import {createStore, applyMiddleware} from 'redux';
import GaReportingReduxMiddleware from './ReduxGaMiddleware';
import {validateReportEventResult} from './GoogleAnalytics.events.test';
import reportGoogleAnalytics from './ReduxAnnotations';

const ACTION_NAME = 'my_event';
const gaSpy = jest.spyOn(global, 'ga');
const reduxStore = getStore();


function getStore() {
    return createStore(state => state, applyMiddleware(GaReportingReduxMiddleware));
}

class ReduxActions {
    static reduxActionWithoutGaReporting() {
        return {
            type: ACTION_NAME,
        };
    }
    static reduxActionWithManualGaReporting() {
        return {
            type: ACTION_NAME,
            ga: {}
        };
    }

    @reportGoogleAnalytics('REDUX')
    static reduxActionAnnotated() {
        return {
            type: ACTION_NAME
        };
    }

    @reportGoogleAnalytics('REDUX2', null, 'JUST_DO_IT')
    static reduxActionAnnotatedWithActionName() {
        return {
            type: ACTION_NAME
        };
    }


}

describe('testing redux ga middleware', function () {
    let unsubscribe = () => {};

    afterEach(() => {
        gaSpy.mockReset();
        unsubscribe();
    });

    it('should not report ga event when redux action was not annotated and ga section is not present', function () {
        unsubscribe = reduxStore.subscribe(() => {
            expect(gaSpy).not.toHaveBeenCalled();
        });
        reduxStore.dispatch(ReduxActions.reduxActionWithoutGaReporting());
    });

    it('should report redux to GA, when manually adding ga section to redux action', function () {
        unsubscribe = reduxStore.subscribe(() => {
            validateReportEventResult(gaSpy, undefined, ACTION_NAME, '', undefined);
        });
        reduxStore.dispatch(ReduxActions.reduxActionWithManualGaReporting());
    });

    it('should validate event sending with annotation', function () {
        unsubscribe = reduxStore.subscribe(() => {
            validateReportEventResult(gaSpy, 'REDUX', ACTION_NAME, '', 0);
        });
        reduxStore.dispatch(ReduxActions.reduxActionAnnotated());
    });

    // it('should validate event sending with annotation with action name set', function () {
    //     unsubscribe = reduxStore.subscribe(() => {
    //         validateReportEventResult(gaSpy, 'REDUX2', 'JUST_DO_IT', '', 0);
    //     });
    //     reduxStore.dispatch(ReduxActions.reduxActionAnnotatedWithActionName());
    // });
});
