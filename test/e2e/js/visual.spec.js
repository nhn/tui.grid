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

    it('datepicker', function() {
        browser.leftClick('#grid', 300, 75);
        expect(isSameVisual()).toBe(true);
    });
});

describe('summary', function() {
    beforeEach(function() {
        loadExample('example6');
    });

    it('summary', function() {
        expect(isSameVisual()).toBe(true);
    });

    it('increase column width', function() {
        var handle = browser.element('.tui-grid-rside-area .tui-grid-column-resize-handle:nth-of-type(2)');
        var handleId = handle.value.ELEMENT;

        browser.moveTo(handleId, 3, 10);
        browser.buttonDown(0);
        browser.moveTo(handleId, 100, 10);
        browser.buttonUp(0);

        expect(isSameVisual()).toBe(true);
    });

    it('decrease column width', function() {
        var handle = browser.element('.tui-grid-rside-area .tui-grid-column-resize-handle:nth-of-type(2)');
        var handleId = handle.value.ELEMENT;

        browser.moveTo(handleId, 3, 10);
        browser.buttonDown(0);
        browser.moveTo(handleId, -100, 10);
        browser.buttonUp(0);

        expect(isSameVisual()).toBe(true);
    });

    it('selection by drag', function() {
        browser.moveToObject('.tui-grid-container', 200, 70);
        browser.buttonDown(0);
        browser.moveToObject('.tui-grid-container', 400, 300);
        browser.buttonUp(0);

        expect(isSameVisual()).toBe(true);
    });
});
