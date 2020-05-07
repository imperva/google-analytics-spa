import { tracker } from './GoogleAnalytics';

/**
 * Used with conjunction with redux
 * Usage: createStore(reducer, preloadState, applyMiddleware(gaReportingMiddleware))
 *
 * This middleware will send reports to google analytics automatically with actions passed to redux action function
 * In order to change the category from a default, you need to pass an object called "ga" with the actions object (it will be removed later)
 *
 * Usage:
 *      @reportGoogleAnalytics
         function myAction(text) {
                return {
                    type: actionTypes.MY_ACTION,
                    filterBy: text,
                    ga: {
                      category: "myCategory"
                    }
                }
            },

 */
// eslint-disable-next-line no-unused-vars
const GaReportingReduxMiddleware = store => next => ( action ) => {
    const nextState = next( action ); // reduce state to the next stage

    if ( action.ga ) {
        tracker().gaReportAction( action.ga.category, action.type, null, 0 );
    }
    return nextState;
};

export default GaReportingReduxMiddleware;
