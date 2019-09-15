/* eslint-disable no-unused-vars,no-param-reassign */
/**
 * Its possible to provide "category" field in preceding annotation, so you can mark the desired category field using annotation
 * so it would look like this:
 *          @reportGoogleAnalytics
 *              @myCategory
 *                  function xxx (.....
 * @param target
 * @param key
 * @param descriptor
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
