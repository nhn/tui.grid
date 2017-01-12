'use strict';

function isSameVisual() {
    var result = browser.checkViewport();
    return result[0].isWithinMisMatchTolerance;
}

function loadExample(fileName) {
    browser.url('/examples/' + fileName + '.html');
    browser.setViewportSize({
        width: 800,
        height: 600
    });
}

describe('initial render', function() {
    it('example1', function() {
        loadExample('example1');
        expect(isSameVisual()).toBe(true);
    });

    it('example2', function() {
        loadExample('example2');
        expect(isSameVisual()).toBe(true);
    });

    it('example3', function() {
        loadExample('example3');
        expect(isSameVisual()).toBe(true);
    });
});

describe('theme', function() {
    beforeEach(function() {
        loadExample('example4');
        browser.selectorExecute('#theme', function(theme) {
            theme[0].style.display = 'none';
        });
    });

    it('theme-basic', function() {
        expect(isSameVisual()).toBe(true);
    });

    it('theme-strip', function() {
        browser.execute(function() {
            tui.Grid.applyTheme('stripe');
        });
        expect(isSameVisual()).toBe(true);
    });

    it('theme-clean', function() {
        loadExample('example4');
        browser.execute(function() {
            tui.Grid.applyTheme('clean');
        });
        expect(isSameVisual()).toBe(true);
    });
});

describe('date picker', function() {
    beforeEach(function() {
        loadExample('example5');
    });

    it('datepicker-viewMode off', function() {
        browser.leftClick('#grid', 300, 75);
        expect(isSameVisual()).toBe(true);
    });

    it('datepicker-viewMode on', function() {
        browser.moveToObject('#grid', 530, 75);
        browser.doDoubleClick();
        expect(isSameVisual()).toBe(true);
    });
});

describe('footer', function() {
    beforeEach(function() {
        loadExample('example6');
    });

    it('footer', function() {
        expect(isSameVisual()).toBe(true);
    });
});
