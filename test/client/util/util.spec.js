'use strict';

describe('Client', function() {
describe('util', function() {
describe('xss.util', function() {

    it('Stores data', function() {
        xss.util.storage('item', '1');
        expect(xss.util.storage('item')).toBe('1');
        expect(xss.util.storage('item', null)).toBe('');
        localStorage.setItem('invalidjson', '/');
        expect(xss.util.storage('invalidjson')).toBe('');
        expect(xss.util.storage('nonexisting')).toBe(null);
    });

    it('Hashes', function() {
        xss.util.hash('A', '1');
        expect(location.hash).toBe('#A:1');
        expect(xss.util.hash('A')).toBe('1');
        xss.util.hash('B', '2');
        expect(location.hash).toBe('#A:1;B:2');
        xss.util.hash('B', null);
        expect(location.hash).toBe('#A:1');
        xss.util.hash();
        expect(location.hash).toBe('');
    });

    it('Pluralizes', function() {
        expect(xss.util.pluralize(1, 'A', 'B')).toBe('A');
        expect(xss.util.pluralize(2, 'A', 'B')).toBe('B');
        expect(xss.util.pluralize(1)).toBe('');
        expect(xss.util.pluralize(2)).toBe('s');
    });

    it('Formats', function() {
        expect(xss.util.format('{0}!', 'A')).toBe('A!');
        expect(xss.util.format('{0} == {0}', 'B')).toBe('B == B');
        expect(xss.util.format('{0} != {1}', 'A', 'B')).toBe('A != B');
    });

    it('Translates to game', function() {
        expect(xss.util.translateGame([0, 0])).toMatch([2, 2]);
        expect(xss.util.translateGame([2, 2])).toMatch([10, 10]);
    });

    it('Debounces', function(done) {
        var spy = jasmine.createSpy('debounce');
        var debounceSpy = xss.util.debounce(spy, 50);
        debounceSpy();
        expect(spy.calls.count()).toBe(0, 'Immediate');
        setTimeout(debounceSpy, 40);
        expect(spy.calls.count()).toBe(0, 'First extend');
        setTimeout(debounceSpy, 80);
        expect(spy.calls.count()).toBe(0, 'Second extend');
        setTimeout(function() {
            expect(spy.calls.count()).toBe(1, 'Final');
            done();
        }, 500); // Imprecise timer, cut some slack.
    });

});
});
});
