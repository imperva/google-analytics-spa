import { GaTracker, googleAnalyticsInit } from './components/google-analytics/GoogleAnalytics';
import reportGoogleAnalytics from './components/google-analytics/ReduxAnnotations';
import GaReportingReduxMiddleware from './components/google-analytics/ReduxGaMiddleware';

export default {
  GaTracker,
  googleAnalyticsInit,
  reportGoogleAnalytics,
  GaReportingReduxMiddleware,
};
