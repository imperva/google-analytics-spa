/* eslint-disable no-unused-vars,no-param-reassign */
/**
 * This annotation can be used when using ReduxGaMiddleware in order to mark redux action to automatically send an event to GA
 *
 * Usage:
 *          @reportGoogleAnalytics
 *          function xxx (..... ) {
 *              your code here
 *          }

 */
export default function reportGoogleAnalytics( target, key, descriptor ) {
  const origFunctionality = target[ key ];
  target[ key ] = ( ...args ) => {
    const result = origFunctionality( ...args );

    const category = ( result.category );

    result.ga = {
      category,
      label: '',
    };

    return result;
  };
}
