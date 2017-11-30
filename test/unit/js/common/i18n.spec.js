'use strict';

var i18n = require('common/i18n');

describe('i18n', function() {
    describe('setLanguage', function() {
        it('when setting the locale code that the grid has aleady, ' +
            'the locale messages are set and changed.', function() {
            i18n.setLanguage('en');
            expect(i18n.get('display.noData')).toBe('No data.');

            i18n.setLanguage('ko');
            expect(i18n.get('display.noData')).toBe('데이터가 존재하지 않습니다.');
        });

        it('when setting the locale code that the grid does not have, the error is thrown.', function() {
            function setLocaleCodeWithNoMessage() {
                i18n.setLanguage('fr');
            }
            expect(setLocaleCodeWithNoMessage).toThrow();
        });

        it('when setting messages for the existing locale code, ' +
            'the locale messages are changed.', function() {
            i18n.setLanguage('en', {
                display: {
                    noData: 'empty'
                }
            });
            expect(i18n.get('display.noData')).toBe('empty');
        });

        it('when setting messages for the new locale code, ' +
            'the locale messages are set and changed.', function() {
            i18n.setLanguage('fr', {
                display: {
                    noData: 'empty2'
                }
            });
            expect(i18n.get('display.noData')).toBe('empty2');
        });
    });
});
