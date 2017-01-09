'use strict';

function isSameVisual() {
    var result = browser.checkElement('#grid');

    return result[0].isWithinMisMatchTolerance;
}

describe('example2', function() {
    beforeEach(function() {
        browser.url('/examples/example2.html');
    });

    it('initial render', function() {
        expect(isSameVisual()).toBe(true);
    });
});
