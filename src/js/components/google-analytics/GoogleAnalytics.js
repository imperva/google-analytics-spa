/* eslint-disable no-console,no-undef,no-empty,no-param-reassign,prefer-rest-params,no-unused-expressions,func-names */
import Utils from '@imperva/base';
import Configs from '../../configs/configurations';


// eslint-disable-next-line import/no-mutable-exports
export let tracker;
const EPOCH_DIM = 'dimension4';

// eslint-disable-next-line no-unused-vars
function getEnteriesByName( name, type ) {
  const perf = ( type )
      ? window.performance.getEntriesByType( type )
      : window.performance.getEntries();
  return perf.filter( p => !!p.name.match( name ) );
}

function getLastPerformanceEntryByName( name, type ) {
  try {
    const perfs = window.performance.getEntriesByName( name, type );
    if ( !!perfs && perfs.length > 0 ) {
      return perfs[ perfs.length - 1 ];
    }
    console.info( `measurement "${name}" not found or performance measurement not found` );
  }
  catch ( e ) {
    console.warn( 'window.performance.getEntriesByName is not supported' );
  }
  return null;
}

function sendDownloadTime( trackerName, entry, category, label = '' ) {
  ga( `${trackerName}.set`, EPOCH_DIM, Date.now() ); // utc epoch
  ga( `${trackerName}.send`, {
    hitType:        'timing',
    timingCategory: category,
    timingVar:      'download',
    timingValue:    Math.ceil( entry.responseEnd - entry.responseStart ),
    timingLabel:    label,
    transport:      'beacon',
  } );
}

function sendServerWaitingTime( trackerName, entry, category, label = '' ) {
  ga( `${trackerName}.set`, EPOCH_DIM, Date.now() ); // utc epoch
  ga( `${trackerName}.send`, {
    hitType:        'timing',
    timingCategory: category,
    timingVar:      'wait',
    timingValue:    Math.ceil( entry.responseStart - entry.requestStart ),
    timingLabel:    label,
    transport:      'beacon',
  } );
}

function sendDurationTime( trackerName, entry, category, label = '' ) {
  ga( `${trackerName}.set`, EPOCH_DIM, Date.now() ); // utc epoch
  ga( `${trackerName}.send`, {
    hitType:        'timing',
    timingCategory: category,
    timingVar:      'duration',
    timingValue:    !entry.duration ? null : Math.ceil( entry.duration ),
    timingLabel:    label,
    transport:      'beacon',
  } );
}

/**
 * Private function that is used to process the time to first paint records and report it to GA
 * @param trackerName
 * @param list - list of performance events from performance api
 * @param observer - the observer that calls this function - used mainly to disconnect from it after the first event was reported
 */
function sendFirstPaintEvent( trackerName, list, observer ) {
  list.getEntries()
      .filter( e => e.name === 'first-contentful-paint' )
      .forEach( ( entry ) => {
        ga( `${trackerName}.set`, EPOCH_DIM, Date.now() ); // utc epoch
        ga( `${trackerName}.send`, {
          hitType:        'timing',
          timingCategory: Configs.ga.categories.TIME_TO_FIRST_PAINT,
          timingVar:      'duration',
          timingValue:    entry.startTime,
          timingLabel:    '',
          transport:      'beacon',
        } );
      } );

  observer.disconnect(); // Once we sent the first "TIME_TO_FIRST_PAINT" event we no longer need to listen
}

/**
 * Function that binds to paint events and will report the time to first paint
 * This indication shows after how many millis the user saw the first meaningful indication that application was loaded
 */
function bindToFirstPaint( trackerName ) {
  const performanceObserver = new PerformanceObserver( sendFirstPaintEvent.bind( this, trackerName ) );

  performanceObserver.observe( { entryTypes: [ 'paint' ] } );
}

/**
 * This function is used to automatically report performance of your REST calls to google analytics
 * @param {string} allowOnlyRegex - Only requests whos URL matches this regex would be reported. Reports nothing if left empty;
 */
function bindToRequestsPerformance( allowOnlyRegex ) {
  if ( Utils.isEmpty( allowOnlyRegex ) ) {
    // TODO by default filter only requests that are going to the specific ms server
    this.performanceFilterRegex = allowOnlyRegex;
  }
  else {
    this.performanceFilterRegex = allowOnlyRegex;
  }

  this.performanceObserver = new PerformanceObserver( ( list ) => {
    list.getEntries()
        .filter( entry => entry.name.match( this.performanceFilterRegex ) )
        .forEach( ( entry ) => {
          sendDownloadTime( this.trackerName, entry, Configs.ga.categories.DEFAULT_DOWNLOAD_TIME );
          sendServerWaitingTime( this.trackerName, entry, Configs.ga.categories.DEFAULT_WAITING_TIME );
          sendDurationTime( this.trackerName, entry, Configs.ga.categories.DEFAULT_DURATION_TIME );
        } );
  } );

  this.performanceObserver.observe( { entryTypes: [ 'resource' ] } );
}

/** *
 * Function reports page views
 * Although we are in SPA (single page application) we still use pages in order to better understanding the user application usage
 * In order to achieve this we are using virtual pages.
 * For example: when clicking in the dashboard on country 'china' we navigate to incidents list filtered by "china"
 * we report navigation to: /incidents/country/china
 * @param {Object} history
 */
function bindToBrowserHistory( history ) {
  // eslint-disable-next-line no-unused-vars
  history.listen( ( location, action ) => {
    const virtualPath = Utils.isEmpty( location.state ) || Utils.isEmpty( location.state.virtualPath ) ? '' : location.state.virtualPath;
    const pageTitle = Utils.isEmpty( location.state ) || Utils.isEmpty( location.state.title ) ? '' : location.state.title;
    const combinedPath = Utils.isEmpty( location.state ) || Utils.isEmpty( location.state.isVirtualPathOnly ) || !location.state.isVirtualPathOnly
        ? ( `${window.location.pathname}/${virtualPath}` ).replace( '//', '/' )
        : virtualPath;

    this.reportPage( pageTitle, combinedPath );
  } );
}

export class GaTracker {

  constructor( trackerId, trackerName, gaProperties = {}, gaDimensions = {} ) {
    this.lastResource = 0;
    this.lastMeasure = 0;
    this.performanceFilterRegex = '';

    if ( !trackerId ) {
      throw new Error( 'Google Analytics tracker must receive an id! (pattern: UA-XXXXXX-xx)' +
                          '\nId can be located at your google analytics site: https://analytics.google.com' );
    }

    // just in case that tracker name was not provided
    this.trackerName = !trackerName ? Utils.hash( 6 ) : trackerName;


    // https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference
    const properties = Object.assign( {
      name:                trackerName,
      cookieDomain:        'auto',
      sampleRate:          100, // Specifies what percentage of users should be tracked
      siteSpeedSampleRate: 100, // This setting determines how often site speed tracking beacons will be sent,
      alwaysSendReferrer:  false, // Enable this setting only if you want to process other pages from your current host as referrals
    }, gaProperties );


    ga( 'create', trackerId, properties );

    Object.entries( gaDimensions ).forEach( ( [ gaDimensionKey, gaDimensionValue ] ) => {
      ga( `${this.trackerName}.set`, `${gaDimensionKey}`, `${gaDimensionValue}` );
    } );
  }


  /**
   * Sets user id inside the object and also inside the tracker
   * @param {string} identifier - identifier that is used to identify this specific user across multiple sessions and / or devices
   */
  setUserId( identifier ) {
    ga( `${this.trackerName}.set`, 'userId', identifier );
  }

  /**
   * Reports the whole durations of the request, from initiation to last byte receipt
   * @param {string} category
   * @param {string} name
   * @param {string} label
   */
  reportAjaxDuration( category, name, label ) {
    const entry = getLastPerformanceEntryByName( name, 'resource' );
    if ( !Utils.isEmpty( entry ) ) {
      sendDurationTime( this.trackerName, entry, category, label );
    }
  }

  /**
   * Reports the server waiting time until download starts
   * @param {string} category
   * @param {string} name
   * @param {string} label
   */
  reportAjaxWait( category, name, label ) {
    const entry = getLastPerformanceEntryByName( name, 'resource' );

    if ( !Utils.isEmpty( entry ) ) {
      sendServerWaitingTime( this.trackerName, entry, category, label );
    }
  }

  /**
   * Reports the resource download time
   * @param {string} category
   * @param {string} name
   * @param {string} label
   */
  reportAjaxDownload( category, name, label ) {
    const entry = getLastPerformanceEntryByName( name, 'resource' );
    if ( !Utils.isEmpty( entry ) ) {
      sendDownloadTime( this.trackerName, entry, category, label );
    }
  }

  /**
   * Wrapper for action report performed by human
   * Automatically sets tha category to CATEGORY_HUMAN
   * @param {Object} action - action performed
   * @param {string} label - label of the action
   * @param {number} value - value of hte action (in $)
   */
  reportHumanAction( action, label, value ) {
    this.reportAction( Configs.ga.categories.CATEGORY_HUMAN, action, label, value );
  }

  /**
   * Wrapper for action report performed by the system
   * Automatically sets tha category to CATEGORY_MACHINE
   * @param {Object} action - action performed
   * @param {string} label - label of the action
   * @param {number} value - value of hte action (in $)
   */
  reportMachineAction( action, label, value ) {
    this.reportAction( Configs.ga.categories.CATEGORY_MACHINE, action, label, value );
  }


  /**
   * Reports page view
   * Usually theres no need to report pages manually, since this feature is turned on automatically
   * @param {string} title - reported page title
   * @param {string} page - page url
   */
  reportPage( title, page = window.location.pathname ) {
    try {
      ga( `${this.trackerName}.set`, EPOCH_DIM, Date.now() ); // utc epoch
      ga( `${this.trackerName}.send`, {
        hitType:   'pageview',
        title,
        page,
        transport: 'beacon',
      } );
    }
    catch ( e ) {
      console.error( e );
    }
  }

  /**
   * Reporting an action performed
   * All arguments are strings
   * @param {string} category - action category
   * @param {Object} action - action itself
   * @param {string} label - label of an action
   * @param {number} value - $ value of the action
   */
  reportAction( category, action, label = '', value ) {
    try {
      ga( `${this.trackerName}.set`, EPOCH_DIM, Date.now() ); // utc epoch
      ga( `${this.trackerName}.send`, {
        hitType:       'event',
        eventCategory: category,
        eventAction:   action,
        eventLabel:    label,
        eventValue:    value,
        transport:     'beacon',
      } );
    }
    catch ( e ) {
      console.error( e );
    }
  }

  /**
   * Reporting an exception to GA
   * @param {string} exDescription
   * @param {boolean} isFatal
   */
  reportException( exDescription, isFatal ) {
    try {
      ga( `${this.trackerName}.set`, EPOCH_DIM, Date.now() ); // utc epoch
      ga( `${this.trackerName}.send`, {
        exDescription,
        hitType:   'exception',
        exFatal:   isFatal,
        transport: 'beacon',
      } );
    }
    catch ( e ) {
      console.error( e );
    }
  }

}

/**
 * Run this function as soon as possible in your code in order to initialize google analytics reporting
 *
 * @param {string} trackerId - Id of your app defined in Google analytics account, usually starts with UA-
 * @param {string} trackerName - a name to represent a GA tracker. Useful if you want to have 2 separate GA trackers
 * @param {Object} history - history object. we are using https://www.npmjs.com/package/history
 * @param {string} performanceAllowOnlyRegex - used for REST performance logging purposes. Only pages who's url matches the regex will be reported.
 * if left empty will not report anything
 * @return {GaTracker} - the singleton object through which reporting is made
 */
export function googleAnalyticsInit( trackerId, trackerName, history, performanceAllowOnlyRegex = null, gaProperties = {}, gaDimensions = {} ) {
  try {
    tracker = new GaTracker( trackerId, trackerName, gaProperties, gaDimensions );
    if ( history ) {
      bindToBrowserHistory.call( tracker, history );
    }
    bindToRequestsPerformance.call( tracker, performanceAllowOnlyRegex );
    bindToFirstPaint.call( tracker, trackerName );
  }
  catch ( e ) {
    console.error( 'failed to load google analytics. GA will not work', e );
    tracker = new GaTracker( 'invalid-id', '', gaProperties, gaDimensions );
  }

  return tracker;
}

/**
 * This function is a POJO that suplies the structure that is consumed by GA when reporting a page view
 * Usually this is only used when you need to report a virtual page
 * (example: dashboard country -> incidents list filtered by country, we report incidents/country/FR
 * @param {string} title - reported page title
 * @param {string} virtualPath - the virtual path
 * @param {string} isVirtualPathOnly - (default: false) when true the virtual page will be appended to the actual path, false will replace it completely
 * @return {{virtualPath: *, isVirtualPathOnly: boolean, title: *}}
 */
export function gaBuildPageViewState( title, virtualPath, isVirtualPathOnly = false ) {
  return { title, virtualPath, isVirtualPathOnly };
}

// The type of hit. Must be one of 'pageview', 'screenview', 'event', 'transaction', 'item', 'social', 'exception', 'timing'.

