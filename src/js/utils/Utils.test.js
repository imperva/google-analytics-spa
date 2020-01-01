import { hash } from './Utils';

describe('testing hash', function () {
    it('should return something that is not null', function () {
        const result = hash(10);
        expect(result).not.toBeNull();
        expect(result.length).toEqual(10);
    });

    it('should not fail if passed 0 as arg and should have 6 chars length hash returned', function () {
        expect(hash(0)).toHaveLength(6);
        expect(hash(null)).toHaveLength(6);
        expect(hash()).toHaveLength(6);
    });

});
