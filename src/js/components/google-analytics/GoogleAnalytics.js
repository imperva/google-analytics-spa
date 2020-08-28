import isEmpty from 'is-empty';
import Configs from '../../configs/configurations';
import {hash} from '../../utils/Utils';
import Texts from '../../configs/texts';
import {getLastPerformanceEntryByName} from '../../utils/PerformanceUtils';


export let _tracker;
const EPOCH_DIM = 'dimension4';

function sendDownloadTime(trackerName, entry, category = Configs.ga.categories.DEFAULT_DOWNLOAD_TIME, label = '') {
    ga(`${trackerName}.set`, EPOCH_DIM, Date.now()); // utc epoch
    ga(`${trackerName}.send`, {
        hitType: 'timing',
        timingCategory: category,
        timingVar: 'download',
        timingValue: Math.ceil(entry.responseEnd - entry.responseStart),
        timingLabel: label,
        transport: 'beacon',
    });
}

function sendServerWaitingTime(trackerName, entry, category = Configs.ga.categories.DEFAULT_WAITING_TIME, label = '') {
    ga(`${trackerName}.set`, EPOCH_DIM, Date.now()); // utc epoch
    ga(`${trackerName}.send`, {
        hitType: 'timing',
        timingCategory: category,
        timingVar: 'wait',
        timingValue: Math.ceil(entry.responseStart - entry.requestStart),
        timingLabel: label,
        transport: 'beacon',
    });
}

function sendDurationTime(trackerName, entry, category = Configs.ga.categories.DEFAULT_DURATION_TIME, label = '') {
    ga(`${trackerName}.set`, EPOCH_DIM, Date.now()); // utc epoch
    ga(`${trackerName}.send`, {
        hitType: 'timing',
        timingCategory: category,
        timingVar: 'duration',
        timingValue: !entry.duration ? null : Math.ceil(entry.duration),
        timingLabel: label,
        transport: 'beacon',
    });
}

/**
 * @ignore
 * Private function that is used to process the time to first paint records and report it to GA
 * @param trackerName
 * @param list - list of performance events from performance api
 * @param observer - the observer that calls this function - used mainly to disconnect from it after the first event was reported
 */
function sendFirstPaintEvent(trackerName, list, observer) {
    list.getEntries()
        .filter((e) => e.name === 'first-contentful-paint')
        .forEach((entry) => {
            ga(`${trackerName}.set`, EPOCH_DIM, Date.now()); // utc epoch
            ga(`${trackerName}.send`, {
                hitType: 'timing',
                timingCategory: Configs.ga.categories.TIME_TO_FIRST_PAINT,
                timingVar: 'duration',
                timingValue: entry.startTime,
                timingLabel: '',
                transport: 'beacon',
            });
        });

    observer.disconnect(); // Once we sent the first "TIME_TO_FIRST_PAINT" event we no longer need to listen
}

/**
 * @ignore
 * Function that binds to paint events and will report the time to first paint
 * This indication shows after how many millis the user saw the first meaningful indication that application was loaded
 */
function bindToFirstPaint(trackerName) {
    const performanceObserver = new PerformanceObserver(sendFirstPaintEvent.bind(this, trackerName));

    performanceObserver.observe({entryTypes: ['paint']});
}

/**
 * @ignore
 * This function is used to automatically report performance of your REST calls to google analytics
 * @param config - {string | object}
 *  *     if string  - allowOnlyRegex - Only requests who's URL matches this regex would be reported.
 *                  Reports everything if left empty;
 *      if object - {
 *          include {string}: allowOnlyRegex - Only requests who's URL match this regex would be reported.
 *          Default - allow all
 *
 *          initiatorTypes {array}: Only requests who's type matches this strings would be reported.
 *          Example: ['xmlhttprequest','fetch'] - to filter out only fetch and XMLHttpRequest calls
 *          Default: [] - i.e. do not filter anything
 *          See types here: https://developer.mozilla.org/en-US/docs/Web/API/PerformanceResourceTiming/initiatorType
 *
 *          category function {(entry) -> string}: The result of this function will be sent as category of timing event
 *          Example: entry => entry.name+'-1' would result in category name: 'www.acme.com-1'
 *          Default: 'DOWNLOAD_TIME','SERVER_WAITING_TIME','DURATION_TIME' respectively
 *      }
 */
// TODO document and add example of advanced usage
function bindToRequestsPerformance(config) {
    const GOOGLE_ANALYTICS_URL = /.*google-analytics.*collect.*/i; //disallow responding on GA requests in any case
    let performanceFilterRegex = /.*/; //allow everyone
    let categoryFormatFunction = () => undefined; //we return null here in order to have defaults set as category in every perf rep. func.
    let labelFormatFunction = () => undefined; //we return null here in order to have defaults set as category in every perf rep. func.
    let initiatorTypes = [];

    //in order to have backward compatibility we allow to pass string and object
    if (!isEmpty(config)) {
        if (typeof config === 'string' || config instanceof RegExp) {
            performanceFilterRegex = config;
        }
        else {
            if (!isEmpty(config.include)) {
                performanceFilterRegex = config.include;
            }
            if (!isEmpty(config.category)) {
                categoryFormatFunction = config.category;
            }
            if (!isEmpty(config.label)) {
                labelFormatFunction = config.label;
            }

            if (!isEmpty(config.initiatorTypes) && Array.isArray(config.initiatorTypes)) {
                initiatorTypes = config.initiatorTypes;
            }
        }
    }

    this.performanceObserver = new PerformanceObserver((list) => {
        list.getEntries().filter(entry => !entry.name.match(GOOGLE_ANALYTICS_URL))
            .filter(entry => entry.name.match(performanceFilterRegex))
            .filter(entry => isEmpty(initiatorTypes) || initiatorTypes.includes(entry.initiatorType))
            .forEach((entry) => {
                sendDownloadTime(this.trackerName, entry, categoryFormatFunction(entry), labelFormatFunction(entry));
                sendServerWaitingTime(this.trackerName, entry, categoryFormatFunction(entry), labelFormatFunction(entry));
                sendDurationTime(this.trackerName, entry, categoryFormatFunction(entry), labelFormatFunction(entry));
            });
    });

    this.performanceObserver.observe({entryTypes: ['resource']});
}

/**
 * @ignore
 * Function reports page views
 * Although we are in SPA (single page application) we still use pages in order to better understanding the user application usage
 * In order to achieve this we are using virtual pages.
 * For example: when clicking in the dashboard on country 'china' we navigate to incidents list filtered by "china"
 * we report navigation to: /incidents/country/china
 * @param {Object} history
 */
function bindToBrowserHistory(history) {
    // eslint-disable-next-line no-unused-vars
    history.listen((location, action) => {
        const virtualPath = isEmpty(location.state) || isEmpty(location.state.virtualPath) ? '' : location.state.virtualPath;
        const pageTitle = isEmpty(location.state) || isEmpty(location.state.title) ? '' : location.state.title;
        const combinedPath = isEmpty(location.state) || isEmpty(location.state.isVirtualPathOnly) || !location.state.isVirtualPathOnly
            ? (`${location.pathname}/${virtualPath}`).replace('//', '/')
            : virtualPath;

        this.reportPage(pageTitle, combinedPath);
    });
}

/**
 * @public
 */
export class GaTracker {
    constructor(trackerId, trackerName, gaProperties = {}, gaDimensions = {}) {
        this.lastResource = 0;
        this.lastMeasure = 0;

        if (!trackerId) {
            throw new Error(Texts.GA_FACTORY_NO_ID_FAILED);
        }

        // just in case that tracker name was not provided
        this.trackerName = !trackerName ? hash(6) : trackerName;


        // https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference
        const properties = Object.assign({
            name: trackerName,
            cookieDomain: 'auto',
            sampleRate: 100, // Specifies what percentage of users should be tracked
            siteSpeedSampleRate: 100, // This setting determines how often site speed tracking beacons will be sent,
            alwaysSendReferrer: false, // Enable this setting only if you want to process other pages from your current host as referrals
        }, gaProperties);

        ga('create', trackerId, properties);

        Object.entries(gaDimensions).forEach(([gaDimensionKey, gaDimensionValue]) => {
            ga(`${this.trackerName}.set`, `${gaDimensionKey}`, `${gaDimensionValue}`);
        });
    }


    /**
     * @public
     * @alias reportEvent
     * @kind instance method of tracker()
     * @summary Reporting an event performed
     * @param {string} category - event category
     * @param {string} action - event name
     * @param {string} label - label of the event
     * @param {number} value - how much this event worth (usually in USD)
     */
    reportAction(category, action, label = '', value) {
        try {
            ga(`${this.trackerName}.set`, EPOCH_DIM, Date.now()); // utc epoch
            ga(`${this.trackerName}.send`, {
                hitType: 'event',
                eventCategory: category,
                eventAction: action,
                eventLabel: label,
                eventValue: value,
                transport: 'beacon',
            });
        } catch (e) {
            console.error(e);
        }
    }

    /**
     * @public
     * @function
     * @summary (Usually should not be used) Manually set user id (might be overriden by next requests)
     * @param {string} identifier - identifier that is used to identify this specific user across multiple sessions and / or devices
     */
    setUserId(identifier) {
        ga(`${this.trackerName}.set`, 'userId', identifier);
    }

    /**
     * Not required by default
     * @public
     * @summary Manually report the duration of last sent request<br>duration = request initiation until last byte receipt
     * @param {string} category - perofmance event category
     * @param {string} requestUrl - url of the request we want to report.<br>In case of multiple requests with this url, only the last one will be reported
     * @param {string} label - the label of your liking for this request
     */
    reportLastRequestDuration(category, requestUrl, label) {
        const entry = getLastPerformanceEntryByName(requestUrl, 'resource');
        if (!isEmpty(entry)) {
            sendDurationTime(this.trackerName, entry, category, label);
        }
    }

    /**
     * Not required by default
     * @public
     * @summary Reports the server waiting time until download starts
     * @param {string} category
     * @param {string} requestUrl
     * @param {string} label
     */
    reportLastRequestWait(category, requestUrl, label) {
        const entry = getLastPerformanceEntryByName(requestUrl, 'resource');

        if (!isEmpty(entry)) {
            sendServerWaitingTime(this.trackerName, entry, category, label);
        }
    }

    /**
     * Not required by default
     * @public
     * @summary Reports the resource download time
     * @param {string} category
     * @param {string} requestUrl
     * @param {string} label
     */
    reportLastRequestDownloadTime(category, requestUrl, label) {
        const entry = getLastPerformanceEntryByName(requestUrl, 'resource');
        if (!isEmpty(entry)) {
            sendDownloadTime(this.trackerName, entry, category, label);
        }
    }

    /**
     * @ignore
     * Wrapper for action report performed by human
     * Automatically sets tha category to CATEGORY_HUMAN
     * @param {Object} action - action performed
     * @param {string} label - label of the action
     * @param {number} value - value of hte action (in $)
     */
    reportHumanAction(action, label, value) {
        this.reportAction(Configs.ga.categories.CATEGORY_HUMAN, action, label, value);
    }

    /**
     * @ignore
     * Wrapper for action report performed by the system
     * Automatically sets tha category to CATEGORY_MACHINE
     * @param {Object} action - action performed
     * @param {string} label - label of the action
     * @param {number} value - value of hte action (in $)
     */
    reportMachineAction(action, label, value) {
        this.reportAction(Configs.ga.categories.CATEGORY_MACHINE, action, label, value);
    }

    /**
     * Not required by default, if you are using 'history' package
     * @public
     * Manual report of navigation event
     * Usually there's no need to report pages manually, since they are reported automatically
     * if you include 'history' object in your initialization function
     * @param {string} title - reported page title
     * @param {string} page - page url
     */
    reportPage(title, page = window.location.pathname) {
        try {
            ga(`${this.trackerName}.set`, EPOCH_DIM, Date.now()); // utc epoch
            ga(`${this.trackerName}.send`, {
                hitType: 'pageview',
                title,
                page,
                transport: 'beacon',
            });
        } catch (e) {
            console.error(e);
        }
    }

    /***
     * @ignore
     * Syntactic sugar for reportAction function (since in GA actions are called events)
     * @param category
     * @param action
     * @param label
     * @param value
     */
    reportEvent(category, action, label, value) {
        this.reportAction(category, action, label, value);
    }

    /**
     * @public
     * @summary Reporting a code exception to GA
     * @param {string} exDescription - what happened
     * @param {boolean} isFatal - was the exception fatal to your code or not
     */
    reportException(exDescription, isFatal) {
        try {
            ga(`${this.trackerName}.set`, EPOCH_DIM, Date.now()); // utc epoch
            ga(`${this.trackerName}.send`, {
                exDescription,
                hitType: 'exception',
                exFatal: isFatal,
                transport: 'beacon',
            });
        } catch (e) {
            console.error(e);
        }
    }
}

/**
 * Configuration object used in {@link googleAnalyticsInit} function
 * @version 1.1.0
 * @typedef {Object} PerformanceConfig
 * @property {string} include - Only requests who's URL match this regex would be reported.
 * @property {string[]} initiatorTypes - Only requests who's type matches this strings would be reported.
 * @property {function} category - The result of this function will be sent as category of timing event
 *
 */

/**
 * @public
 * @summary Run this function as soon as possible in your code in order to initialize google analytics reporting
 *
 * @param {string} trackerId - Id of your app defined in your Google analytics account.<br>Looks like this UA-XXXXXXXX-XX
 * @param {string} trackerName - a name to represent a GA tracker.<br>Useful if you want to have 2 separate GA trackers.<br>Can be any string.
 * @param {Object} [history] - history object.<br>
 *                  We advice to use https://www.npmjs.com/package/history package.<br>
 *                  If not provided, automatic reporting of pages navigation will not work
 * @param {(PerformanceConfig|string)} [performanceConfig] automatic performance tracking purposes.
 * <br>Can either be regex string that filters urls that should be reported<br>Or an object of type {@link PerformanceConfig}
 * @param {Object} [gaProperties] - list of google analytics field properties
 * <br>https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference
 * @param {Object} [gaDimensions] - list of custom dimensions<br>https://support.google.com/analytics/answer/2709829?hl=en
 *
 * @return {GaTracker} pointer to the singleton object through which reporting is made
 */
export function googleAnalyticsInit(trackerId,
    trackerName,
    history,
    performanceConfig = null,
    gaProperties = {},
    gaDimensions = {}) {
    try {
        let isPerformanceObserverDefined = true;
        _tracker = new GaTracker(trackerId, trackerName, gaProperties, gaDimensions);
        if (!isEmpty(history)) {
            bindToBrowserHistory.call(_tracker, history);
        }
        else {
            console.warn(Texts.NO_HISTORY);
        }

        try {
            // eslint-disable-next-line no-unused-vars
            isPerformanceObserverDefined = !!PerformanceObserver;
        } catch (e) {
            isPerformanceObserverDefined = false;
        }

        if (isPerformanceObserverDefined) {
            bindToRequestsPerformance.call(_tracker, performanceConfig);
            bindToFirstPaint.call(_tracker, trackerName);
        }
        else {
            console.warn(Texts.NO_AUTO_PERFORMANCE);
        }

    } catch (e) {
        console.error(Texts.GA_FACTORY_FAILED, e);
        _tracker = new GaTracker('invalid-id', '', gaProperties, gaDimensions);
    } finally {
        window.__GA_TRACKER__ = _tracker;
    }

    return _tracker;
}

/**
 * @ignore
 * return the singleton object through which reporting is made
 * @returns {GaTracker}
 */
export function tracker() {
    return window.__GA_TRACKER__;
}

/**
 * @public
 * This function is a POJO that supplies the structure that is consumed by GA when reporting a page view<br>
 * Usually this is only used when you need to report a virtual page
 * @param {string} title - reported page title
 * @param {string} virtualPath - the virtual path
 * @param {boolean} isVirtualPathOnly
 *      <br>true - the virtual page will be appended to the actual path,
 *      <br>false - will replace the path completely with virtualPath
 *
 * @return {{virtualPath: string, isVirtualPathOnly: boolean, title: string}}
 */
export function gaBuildPageViewState(title, virtualPath, isVirtualPathOnly = false) {
    return {title, virtualPath, isVirtualPathOnly};
}

// The type of hit. Must be one of 'pageview', 'screenview', 'event', 'transaction', 'item', 'social', 'exception', 'timing'.
