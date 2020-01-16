import { tracker, googleAnalyticsInit } from './components/google-analytics/GoogleAnalytics';
import reportGoogleAnalytics from './components/google-analytics/ReduxAnnotations';
import GaReportingReduxMiddleware from './components/google-analytics/ReduxGaMiddleware';

export {
    tracker,
    googleAnalyticsInit,
    reportGoogleAnalytics,
    GaReportingReduxMiddleware,
};
