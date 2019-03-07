/* eslint-disable no-console,no-unused-vars,no-param-reassign,no-empty */
// import ga from '../../google/analytics';
import ga from '../../google/analyticsLoader.js';

// eslint-disable-next-line import/no-mutable-exports
export let tracker = null;

/**
 * Annotation that is used to mark the functions that must have global GA object to operate.
 * If hte global object is not found it will do nothing (noOp)
 * @param target
 * @param key
 * @param descriptor
 */
function noopNoGa( target, key, descriptor ) {
  if ( !window.ga || !target[ key ] ) {
    target[ key ] = ( ...args ) => {
    }; // override the built in function with noop
  }

  return target;
}

export class GaTracker {

  constructor( trackerId, trackerName, userId ) {
    this.trackerPrefix = '0';
    if ( !trackerName || !trackerId ) {
      console.warn( 'Could not start Google Analytics tracker! Tracker name or id is missing' );
    }

        // Were basing on the fact that google analytics code was loaded
    if ( !window.ga ) {
      console.warn( "Google Analytics was not loaded. Can't report." );
    }

        // https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference
    const properties = {
      name:                trackerName,
      userId,
      cookieDomain:        'auto',
      sampleRate:          100, // Specifies what percentage of users should be tracked
      siteSpeedSampleRate: 100, // This setting determines how often site speed tracking beacons will be sent,
      alwaysSendReferrer:  false, // Enable this setting only if you want to process other pages from your current host as referrals
    };

    this.trackerName = trackerName;
    if ( window.ga ) {
      try {
        this.tracker = ga( 'create', trackerId, properties );
      }
      catch ( e ) {
        console.error( 'Exception occurred while trying to initialize google analytics. There probably something wrong with ga() function.' );
      }
    }
  }


    /**
     * Sets user id inside the object and also inside the tracker
     * @param identifier - identifier that is used to identify this specific user across multiple sessions and / or devices
     */
  @noopNoGa
    gaSetUserId( identifier ) {
      ga( `${this.trackerName}.set`, 'userId', identifier );
    }

  setTrackerPrefix( name ) {
    this.trackerPrefix = name;
  }

  static getEnteriesByName( name, type ) {
    const perf = ( type )
            ? window.performance.getEntriesByType( type )
            : window.performance.getEntries();
    return perf.filter( p => !!p.name.match( name ) );
  }

  static getLastEntryByName( name, type ) {
    try {
      const perfs = window.performance.getEntriesByName( name, type );
      if ( !!perfs && perfs.length > 0 ) {
        return perfs[ perfs.length - 1 ];
      }
      throw new Error( `measurement "${name}" not found or performance measurement not found` );
    }
    catch ( e ) {
      throw new Error( 'window.performance.getEntriesByName is not supported' );
    }
  }

    /**
     * Reports the whole durations of the request, from initiation to last byte receipt
     * @param category
     * @param name
     * @param label
     */
  @noopNoGa
    gaReportAjaxDuration( category, name, label ) {
      try {
        const duration = GaTracker.getLastEntryByName( name, 'resource' ).duration;

        ga( `${this.trackerName}.send`, {
          hitType:        'timing',
          timingCategory: category,
          timingVar:      'duration',
          timingValue:    !duration ? null : Math.ceil( duration ),
          timingLabel:    `${this.trackerPrefix}.${this.trackerName}`,
        } );
      }
      catch ( e ) {

      }
    }

    /**
     * Reports the server waiting time until download starts
     * @param category
     * @param name
     * @param label
     */
  @noopNoGa
    gaReportAjaxWait( category, name, label ) {
      try {
        const entry = this.getLastEntryByName( name, 'resource' );

        if ( entry ) {
          ga( `${this.trackerName}.send`, {
            hitType:        'timing',
            timingCategory: category,
            timingVar:      'wait',
            timingValue:    Math.ceil( entry.responseStart - entry.requestStart ),
            timingLabel:    `${this.trackerPrefix}.${this.trackerName}`,
          } );
        }
      }
      catch ( e ) {

      }
    }

    /**
     * Reports the resource download time
     * @param category
     * @param name
     * @param label
     */
  @noopNoGa
    gaReportAjaxDownload( category, name, label ) {
      try {
        const entry = this.getLastEntryByName( name, 'resource' );

        if ( entry ) {
          ga( `${this.trackerName}.send`, {
            hitType:        'timing',
            timingCategory: category,
            timingVar:      'download',
            timingValue:    Math.ceil( entry.responseEnd - entry.responseStart ),
            timingLabel:    `${this.trackerPrefix}.${this.trackerName}`,
          } );
        }
      }
      catch ( e ) {

      }
    }

  @noopNoGa
    gaReportAction( category, action, label, value ) {
      try {
        ga( `${this.trackerName}.send`, {
          hitType:       'event',
          eventCategory: category,
          eventAction:   action,
          eventLabel:    `${this.trackerPrefix}.${this.trackerName}`,
          eventValue:    value,
        } );
      }
      catch ( e ) {
        console.error( e );
      }
    }

  @noopNoGa
    gaReportException( exDescription, isFatal ) {
      try {
        ga( `${this.trackerName}.send`, {
          hitType: 'exception',
          exDescription,
          exFatal: isFatal,
        } );
      }
      catch ( e ) {
        console.error( e );
      }
    }

  @noopNoGa
    gaReportPageLoadTime( label ) {
      try {
        const timing = window.performance.timing;
        const pageLoadTime = ( timing.loadEventStart - timing.navigationStart );

        ga( `${this.trackerName}.send`, {
          hitType:        'timing',
          timingCategory: 'TIME_TO_FIRST_PAINT',
          timingVar:      'duration',
          timingValue:    pageLoadTime,
          timingLabel:    `${this.trackerPrefix}.${this.trackerName}`,
        } );
      }
      catch ( e ) {

      }
    }

}

export function init( trackerId, trackerName, userId ) {
  try {
    tracker = new GaTracker( trackerId, trackerName, userId );
  }
  catch ( e ) {
    console.error( e );
    tracker = {};
  }

  return tracker;
}


// The type of hit. Must be one of 'pageview', 'screenview', 'event', 'transaction', 'item', 'social', 'exception', 'timing'.
