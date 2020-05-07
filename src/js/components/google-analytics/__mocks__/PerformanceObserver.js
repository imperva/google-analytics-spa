/* eslint-disable no-unused-vars,no-console,class-methods-use-this */


export default class PerformanceObserver {
    constructor(callback) {
        // console.info('created PerformanceObserver');
        const performanceEntries = {
            getEntries: () => []
        };
        callback(performanceEntries, this);
    }

    observe() {

    }

    disconnect() {

    }
}
