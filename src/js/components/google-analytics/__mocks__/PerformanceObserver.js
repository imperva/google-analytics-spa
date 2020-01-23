/* eslint-disable no-unused-vars,no-console,class-methods-use-this */

const list = {
    getEntries: () => {
        return []; //TODO implement list of entries
    }
};

export default class PerformanceObserver {
    constructor(callback) {
        console.info('created PerformanceObserver');
        const list = [];
        callback(list);
    }

    observe() {

    }

    disconnect() {

    }
}
