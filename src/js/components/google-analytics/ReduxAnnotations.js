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

export default function reportGoogleAnalytics(category = '', gaAction, label = '', value = 0) {
    function actualDecorator(target, key, descriptor) {
        const origFunctionality = target[key];
        target[key] = (...args) => {
            //run the original function in order to get the action object
            //which we will mutate later
            const result = origFunctionality(...args);

            // const {category} = result;
            result.ga = {
                category: category,
                action: !gaAction ? result.type : gaAction,
                label: label,
                value: value,
            };

            //return mutated action object
            return result;
        };

        return target;
    }
    return actualDecorator;
}
