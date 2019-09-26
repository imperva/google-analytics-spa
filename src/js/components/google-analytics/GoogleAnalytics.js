/* eslint-disable no-console,no-undef,no-empty,no-param-reassign,prefer-rest-params,no-unused-expressions,func-names */
import Utils from '@imperva/base';
import Configs from '../../configs/configurations';
import { getAccountId } from '../../utils/navutils';


// eslint-disable-next-line import/no-mutable-exports
export let tracker;
const X_PASSPORT_ID_DIM = 'dimension1';
const USER_ACCOUNT_DIM = 'dimension2';
const ACCOUNT_ID_DIM = 'dimension3';
const EPOCH_DIM = 'dimension4';
const IS_PAYING_CUSTOMER = 'dimension5';

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

export class GaTracker {

  constructor( trackerId, trackerName, gaProperties = {} ) {
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
      userId:              getAccountId(),
      cookieDomain:        'auto',
      sampleRate:          100, // Specifies what percentage of users should be tracked
      siteSpeedSampleRate: 100, // This setting determines how often site speed tracking beacons will be sent,
      alwaysSendReferrer:  false, // Enable this setting only if you want to process other pages from your current host as referrals
    }, gaProperties );


    ga( 'create', trackerId, properties );
    ga( `${this.trackerName}.set`, X_PASSPORT_ID_DIM, window.xPassportId ); // incapsula session id
    ga( `${this.trackerName}.set`, USER_ACCOUNT_DIM, window.userAccount ); // original incapsula id
    ga( `${this.trackerName}.set`, ACCOUNT_ID_DIM, getAccountId() ); // browsed account id
    ga( `${this.trackerName}.set`, IS_PAYING_CUSTOMER, window.isPayingCustomer ); // is paying customer
  }


  /**
   * Sets user id inside the object and also inside the tracker
   * @param identifier - identifier that is used to identify this specific user across multiple sessions and / or devices
   */
  setUserId( identifier ) {
    ga( `${this.trackerName}.set`, 'userId', identifier );
  }

  /**
   * Reports the whole durations of the request, from initiation to last byte receipt
   * @param category
   * @param name
   * @param label
   */
  reportAjaxDuration( category, name, label ) {
    const entry = getLastPerformanceEntryByName( name, 'resource' );
    if ( !Utils.isEmpty( entry ) ) {
      sendDurationTime( this.trackerName, entry, category, label );
    }
  }

  /**
   * Reports the server waiting time until download starts
   * @param category
   * @param name
   * @param label
   */
  reportAjaxWait( category, name, label ) {
    const entry = getLastPerformanceEntryByName( name, 'resource' );

    if ( !Utils.isEmpty( entry ) ) {
      sendServerWaitingTime( this.trackerName, entry, category, label );
    }
  }


  /**
   * Reports the resource download time
   * @param category
   * @param name
   * @param label
   */
  reportAjaxDownload( category, name, label ) {
    const entry = getLastPerformanceEntryByName( name, 'resource' );
    if ( !Utils.isEmpty( entry ) ) {
      sendDownloadTime( this.trackerName, entry, category, label );
    }
  }

  reportHumanAction( action, label, value ) {
    this.reportAction( Configs.ga.categories.CATEGORY_HUMAN, action, label, value );
  }

  reportMachineAction( action, label, value ) {
    this.reportAction( Configs.ga.categories.CATEGORY_MACHINE, action, label, value );
  }

  /** *
   * Function reports page views
   * Although we are in SPA (single page application) we still use pages in order to better understanding the user application usage
   * In order to achieve this we are using virtual pages.
   * For example: when clicking in the dashboard on country 'china' we navigate to incidents list filtered by "china"
   * we report navigation to: /incidents/country/china
   * @param history
   */
  bindToBrowserHistory( history ) {
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

  /** **
   * This function is used to automatically bind your requests performance reports to google analytics
   *
   */
  bindToRequestsPerformance( allowOnlyRegex ) {
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

  reportTimeToFirstPaint( label = '' ) {
    try {
      const timing = window.performance.timeOrigin;
      const pageLoadTime = ( timing.loadEventStart - timing.navigationStart );
      ga( `${this.trackerName}.set`, EPOCH_DIM, Date.now() ); // utc epoch
      ga( `${this.trackerName}.send`, {
        hitType:        'timing',
        timingCategory: 'TIME_TO_FIRST_PAINT',
        timingVar:      'duration',
        timingValue:    pageLoadTime,
        timingLabel:    label,
        transport:      'beacon',
      } );
    }
    catch ( e ) {

    }
  }

}

export function googleAnalyticsInit( trackerId, trackerName, history, performanceAllowOnlyRegex = null ) {
  try {
    tracker = new GaTracker( trackerId, trackerName );
    if ( history ) {
      tracker.bindToBrowserHistory( history );
    }
    tracker.bindToRequestsPerformance( performanceAllowOnlyRegex );
  }
  catch ( e ) {
    console.error( 'failed to load google analytics. GA will not work', e );
    tracker = new GaTracker( 'invalid-id', '' );
  }

  return tracker;
}

/**
 * This function suuplies the structure that is consumed by GA when reporting a page view
 * Usually this is only used when you need to report a virtual page
 * (example: dashboard country -> incidents list filtered by country, we report incidents/country/FR
 * @param title - reported page title
 * @param virtualPath - the virtual path
 * @param isVirtualPathOnly - when true the virtual page will be appended to the actual path, false will replace it completely
 * @return {{virtualPath: *, isVirtualPathOnly: boolean, title: *}}
 */
export function gaBuildPageViewState( title, virtualPath, isVirtualPathOnly = false ) {
  return { title, virtualPath, isVirtualPathOnly };
}

// The type of hit. Must be one of 'pageview', 'screenview', 'event', 'transaction', 'item', 'social', 'exception', 'timing'.

