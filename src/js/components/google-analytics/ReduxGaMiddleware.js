/* eslint-disable no-unused-vars */
import { tracker } from './GoogleAnalytics';

/**
 * This middleware will send reports to google analytics with actions passed to redux
 * As most of the application actions are done via redux we will capture most of them here
 * Actions that need to be reported must have an object called ga present
 */
const GaReportingReduxMiddleware = store => next => ( action ) => {
  const nextState = next( action ); // reduce state to the next stage

  if ( action.ga ) {
    tracker.gaReportAction( action.ga.category, action.type, null, 0 );
  }
  return nextState;
};

export default GaReportingReduxMiddleware;
