/* eslint-disable */
import { googleAnalyticsInit } from '@impervaos/google-analytics-spa';
import { createBrowserHistory } from 'history';

//[OPTIONAL] You dont have to use the 'history' package
// However if you do, page navigation would be traced and reported to GA automatically
const history = createBrowserHistory({ basename: '' });

//This is your GA application id.
//from https://analytics.google.com/analytics/web/#/.../admin/property/settings (your GA property page)
const myGaApplicationId = 'UA-XXXXXXX-XX';
//[OPTIONAL] The name of your tracker, in case you will be using multiple trackers
const myTrackerName = 'MyTrackerName';
//--------------------
//performance reporting configuration
// it can be either regex - and then only the requests whos urls can be matched using this regex will be reported
//for example: if my backend requests go to http://some.com/api/v1/getMyData we would set this parameter to /.*api\/v1/
// OR it can be an object {include: {regex}, initi: [{string}...{string}], category: {function}}
//  *          See types here: https://developer.mozilla.org/en-US/docs/Web/API/PerformanceResourceTiming/initiatorType

const performanceRegex = {include: /.*my_api.*/i, initiatorTypes: ['xmlhttprequest','fetch'], category: e => e.name.replace('.','_')};

//every request will also piggyback these dimensions with it
//For example: user email or any other custom dimension that you need to better track your application usage
//read more here https://support.google.com/analytics/answer/2709829?hl=en
const customDimensions = {
    dimension1: MyUserDetails.email,
    dimension2: MyUserSession.id,
    dimension3: Date.now(), //example: session start timestamp
};
//[OPTIONAL] In case you would like to track your users using "GA User explorer" you need to provide GA
// with a unique identifier per user.
// If you would not provide this identifier, google will generate a random id
//GA tracker properties (https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference)
const properties = { userId: MyUserDetails.id }; //example reporting userId

googleAnalyticsInit( myGaApplicationId,
    myTrackerName,
    history,
    performanceRegex,
    properties,
    customDimensions
);
