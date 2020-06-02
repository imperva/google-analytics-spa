[![downloads per month](https://img.shields.io/npm/dm/@impervaos/google-analytics-spa.svg)](https://www.npmjs.com/package/@impervaos/google-analytics-spa)
[![node ver](https://img.shields.io/badge/node-8+-blue.svg?style=flat)](https://github.com/dwyl/esta/issues)
[![html5](https://img.shields.io/badge/HTML-5-blue.svg?style=flat)](https://github.com/dwyl/esta/issues)
![coverage](./badges/badge-lines.svg)
![tests](https://github.com/imperva/google-analytics-spa/workflows/tests/badge.svg)
[![Known Vulnerabilities](https://snyk.io/test/github/imperva/google-analytics-spa/badge.svg?targetFile=package.json)](https://snyk.io/test/github/imperva/google-analytics-spa?targetFile=package.json)
# Google Analytics automatic reporter

This library was created with Single Page Application architecture in mind.
Its goal is to provide as simple as possible usage of Google Analytics for SPAs (Single Page Applications).

#### Some of its features that come virtually without any "price tag" are
* **AUTOMATIC** reporting of virtual navigation (based on HTML5 history object) including reporting page alias and not the actual url 
* **AUTOMATICALLY** reports your REST call & navigation performance to GA - so you could monitor download, server and duration times.  
* **AUTOMATICALLY** reports the "time to first paint" for your application - i.e. how fast the users see the first meaningful page of your application (and not a blank page)
* Reporting any Redux action **AUTOMATICALLY** to GA using 'reportGoogleAnalytics' decorator and 'GaReportingReduxMiddleware' middleware
* Easily report events / pageviews / performance values 
* Written in plain javascript, i.e. ReactJs, Angular, Vue or anything else that can run JS

## Live demo
[Play with our live demo](https://04zjb.sse.codesandbox.io/)

[Edit live demo](https://codesandbox.io/embed/github/imperva/google-analytics-spa/tree/master/?fontsize=14&hidenavigation=1&theme=dark)

[![Edit @impervaos/google-analytics-spa](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/github/imperva/google-analytics-spa/tree/master/?fontsize=14&hidenavigation=1&theme=dark)

## Installation

Install the package
```bash
npm i @impervaos/google-analytics-spa 
```

## Configuration and Initialization

Add the following snippet in your **index.html** _(or whatever page that is loaded first)_*** 

```html
    <!-- Google Analytics -->
    <script>
        window.ga=window.ga||function(){(ga.q=ga.q||[]).push(arguments)};ga.l=+new Date;
    </script>
    <script defer src='https://www.google-analytics.com/analytics.js'></script>
    <!-- End Google Analytics -->
```

Add the following in your first JSX / JS file (the root of your SPA application)

<!-- MARKDOWN-MAGIC:START (CODE:src=./src/js/examples/configuration.js) -->
<!-- The below code snippet is automatically added from ./src/js/examples/configuration.js -->
```js
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
```
<!-- MARKDOWN-MAGIC:END -->

***_I decided not to embed the ga.js code, since google promissed to change it unexpectedly_

## Usage
<!-- MARKDOWN-MAGIC:START (CODE:src=./src/js/examples/usage.js) -->
<!-- The below code snippet is automatically added from ./src/js/examples/usage.js -->
```js
import { tracker } from '@impervaos/google-analytics-spa';

function myComplicatedAction() {
    try {
        performSomeComplicatedAction();
    } catch(e) {
        //in case of an error we report it to google analytics
        tracker().reportException(e.message, false);
        return;
    }

    tracker().reportEvent( 'MY_CATEGORY', 'MY_ACTION_PERFORMED', 'my_label_text', 0 );
}

//manual page view reporting (i.e. reporting that navigation was done to page http://page.com/first)
tracker().reportPage( 'my site title', 'http://page.com/first' );

//navigating to another page in the application
// @impervaos/google-analytics-spa will report navigation to page called '/virtual/path' automatically instead of reporting navigation to '/test/path'
history.push( '/test/path', gaBuildPageViewState( 'TITLE', '/virtual/path', true ) );
```
<!-- MARKDOWN-MAGIC:END -->

##Usage with Redux 
```js
import {reportGoogleAnalytics, GaReportingReduxMiddleware} from '@impervaos/google-analytics-spa';
const store = createStore(state => state, applyMiddleware(GaReportingReduxMiddleware));

//In order to use this annotation your code need to be able to process annotations
//So you might want to use something like https://babeljs.io/docs/en/babel-plugin-proposal-decorators
//In the future the decorators will be part of ES

class ReduxActions {
    @reportGoogleAnalytics('MyCategory', null, 'my label', 1)
    static doSomethingWithAnnotation() {
        return {
            type: 'DO_SOMETHING'
        };
    } 

   static doSomething() {
        return {
            type: 'DO_SOMETHING_ELSE'
        };
    }
}
//When this event is dispatched, an automatic even report will be sent to Google Analytics
//equal to: tracker().reportEvent('MyCategory','DO_SOMETHING', 'my label', 1); 
store.dispatch(ReduxActions.doSomethingWithAnnotation());

//When this event is dispatched, an automatic even report still being sent to Google Analytics
//equal to: tracker().reportEvent('','DO_SOMETHING_ELSE', '', 0); 
store.dispatch(ReduxActions.doSomething());
```

## API
<!-- MARKDOWN-MAGIC:START (JSDOC:files=./src/js/components/google-analytics/GoogleAnalytics.js&module-index-format=none&global-index-format=none&heading-depth=4&separators=true&param-list-format=list) -->

#### tracker().reportEvent
**Summary**: Reporting an event performed  
**Access**: public  
**Params**

- category <code>string</code> - event category
- action <code>string</code> - event name
- label <code>string</code> - label of the event
- value <code>number</code> - how much this event worth (usually in USD)


* * *

#### tracker().setUserId(identifier)
**Summary**: (Usually should not be used) Manually set user id (might be overriden by next requests)  
**Access**: public  
**Params**

- identifier <code>string</code> - identifier that is used to identify this specific user across multiple sessions and / or devices


* * *

#### tracker().reportLastRequestDuration(category, requestUrl, label)
Not required by default

**Summary**: Manually report the duration of last sent request<br>duration = request initiation until last byte receipt  
**Access**: public  
**Params**

- category <code>string</code> - perofmance event category
- requestUrl <code>string</code> - url of the request we want to report.<br>In case of multiple requests with this url, only the last one will be reported
- label <code>string</code> - the label of your liking for this request


* * *

#### tracker().reportLastRequestWait(category, requestUrl, label)
Not required by default

**Summary**: Reports the server waiting time until download starts  
**Access**: public  
**Params**

- category <code>string</code>
- requestUrl <code>string</code>
- label <code>string</code>


* * *

#### tracker().reportLastRequestDownloadTime(category, requestUrl, label)
Not required by default

**Summary**: Reports the resource download time  
**Access**: public  
**Params**

- category <code>string</code>
- requestUrl <code>string</code>
- label <code>string</code>


* * *

#### tracker().reportPage(title, page)
Not required by default, if you are using 'history' package

**Access**: public  
**Params**

- title <code>string</code> - reported page title
- page <code>string</code> - page url


* * *

#### tracker().reportException(exDescription, isFatal)
**Summary**: Reporting a code exception to GA  
**Access**: public  
**Params**

- exDescription <code>string</code> - what happened
- isFatal <code>boolean</code> - was the exception fatal to your code or not


* * *

<a name="googleAnalyticsInit"></a>

#### googleAnalyticsInit(trackerId, trackerName, [history], [performanceConfig], [gaProperties], [gaDimensions]) ⇒ [<code>GaTracker</code>](#GaTracker)
**Kind**: global function  
**Summary**: Run this function as soon as possible in your code in order to initialize google analytics reporting  
**Returns**: [<code>GaTracker</code>](#GaTracker) - pointer to the singleton object through which reporting is made  
**Access**: public  
**Params**

- trackerId <code>string</code> - Id of your app defined in your Google analytics account.<br>Looks like this UA-XXXXXXXX-XX
- trackerName <code>string</code> - a name to represent a GA tracker.<br>Useful if you want to have 2 separate GA trackers.<br>Can be any string.
- [history] <code>Object</code> - history object.<br>
                 We advice to use https://www.npmjs.com/package/history package.<br>
                 If not provided, automatic reporting of pages navigation will not work
- [performanceConfig] [<code>PerformanceConfig</code>](#PerformanceConfig) | <code>string</code> - automatic performance tracking purposes.
<br>Can either be regex string that filters urls that should be reported<br>Or an object of type [PerformanceConfig](#PerformanceConfig)
- [gaProperties] <code>Object</code> - list of google analytics field properties
<br>https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference
- [gaDimensions] <code>Object</code> - list of custom dimensions<br>https://support.google.com/analytics/answer/2709829?hl=en


* * *

<a name="gaBuildPageViewState"></a>

#### gaBuildPageViewState(title, virtualPath, isVirtualPathOnly) ⇒ <code>Object</code>
**Kind**: global function  
**Access**: public  
**Params**

- title <code>string</code> - reported page title
- virtualPath <code>string</code> - the virtual path
- isVirtualPathOnly <code>boolean</code> - <br>true - the virtual page will be appended to the actual path,
     <br>false - will replace the path completely with virtualPath


* * *

<a name="PerformanceConfig"></a>

#### PerformanceConfig : <code>Object</code>
Configuration object used in [googleAnalyticsInit](#googleAnalyticsInit) function

**Kind**: global typedef  
**Version**: 1.1.0  
**Properties**

- include <code>string</code> - Only requests who's URL match this regex would be reported.  
- initiatorTypes <code>Array.&lt;string&gt;</code> - Only requests who's type matches this strings would be reported.  
- category <code>function</code> - The result of this function will be sent as category of timing event  


* * *


<!-- MARKDOWN-MAGIC:END -->

## Contributing
Pull requests are welcome. 

For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
ISC License

Copyright (c) 2020, Imperva.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

Copyright © 2020 Imperva. All rights reserved 
