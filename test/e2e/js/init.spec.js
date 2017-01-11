'use strict';

function isSameVisual() {
    var result = browser.checkElement('#grid');
    return result[0].isWithinMisMatchTolerance;
}

function testExampleRender(fileName) {
    browser.url('/examples/' + fileName + '.html');
    expect(isSameVisual()).toBe(true);
}

describe('initial render', function() {
    it('example1', function() {
        testExampleRender('example1');
    });

    // it('example2', function() {
    //     testExampleRender('example2');
    // });

    // it('example3', function() {
    //     testExampleRender('example3');
    // });

    // it('example4', function() {
    //     testExampleRender('example4');
    // });

    // it('example5', function() {
    //     testExampleRender('example5');
    // });

    // it('example6', function() {
    //     testExampleRender('example6');
    // });
});
