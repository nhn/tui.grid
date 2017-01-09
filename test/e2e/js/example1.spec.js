'use strict';

function isSameVisual() {
    var result = browser.checkElement('#wrapper1');

    return result[0].isWithinMisMatchTolerance;
}

describe('example1', function() {
    beforeEach(function() {
        browser.url('/examples/example1.html');
    });

    it('initial render', function() {
        expect(isSameVisual()).toBe(true);
    });
});
