import { tracker } from './GoogleAnalytics';
import isEmpty from 'is-empty';
/**
 * @global
 * @summary redux middleware for sending ga events automatically
 * @description This middleware will send reports to google analytics automatically with actions passed to redux action function
 * In order to change the category from a default, you need to pass an object called "ga" with the actions object (it will be removed later)
 *
 * @example: createStore(reducer, preloadState, applyMiddleware(gaReportingMiddleware))
 *

 * Usage:
 *      @reportGoogleAnalytics
         function myAction(text) {
                return {
                    type: actionTypes.MY_ACTION,
                    filterBy: text,
                    ga: {
                      category: "myCategory",
                      label: 'mylabel',
                      action: 'my_action',
                      value: 0,
                    }
                }
            },
 */
// eslint-disable-next-line no-unused-vars
const GaReportingReduxMiddleware = store => next => ( action ) => {
    if ( action.ga ) {
        const gaAction = isEmpty(action.ga.action) ? action.type : action.ga.action;
        tracker().reportEvent( action.ga.category, gaAction, action.ga.label, action.ga.value );
    }
    return next( action );
};

export default GaReportingReduxMiddleware;
