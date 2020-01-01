import {getLastPerformanceEntryByName} from './PerformanceUtils';

describe('Performance utils', function () {
    it('should ', function () {
        const resource = getLastPerformanceEntryByName('google.com', 'resource');
        expect(resource.name).toEqual('google.com');
        expect(resource.type).toEqual('resource');
        expect(resource.duration).toEqual(10);
    });
});
