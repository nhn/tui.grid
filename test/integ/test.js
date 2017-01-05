/* global browser */

'use strict';

describe('webdrive.io page', function() {
    it('should have the right title - the fancy generator way', function() {
        browser.url('http://webdriver.io');
        expect(browser.getTitle()).toBe('WebdriverIO - Selenium 2.0 javascript bindings for nodejs');
    });
});
