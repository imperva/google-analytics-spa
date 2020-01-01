export default {
    NO_HISTORY: 'history dependency was not found. \n' +
                'Automatic page navigation will not be reported.\n' +
                'You can still report page navigation using: report().reportPage(my-title, my-path)',
    NO_AUTO_PERFORMANCE: 'PerformanceObserver is not supported on this browser.\n' +
                         ' Automatic performance will not be reported.',
    GA_FACTORY_FAILED: 'failed to load @impervaos/google-analytics-spa. It will not work due to: ',
    GA_FACTORY_NO_ID_FAILED: 'Google Analytics tracker must receive an id! (pattern: UA-XXXXXX-xx)'
                             + '\nId can be located at your google analytics site: https://analytics.google.com',
    PERF_NOT_SUPPORTED: 'window.performance.getEntriesByName is not supported',
    measurmentNotFoundError: perfName => `measurement "${perfName}" not found or performance measurement not found`
};
