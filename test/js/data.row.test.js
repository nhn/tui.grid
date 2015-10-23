'use strict';

var RowData = require('../../src/js/data/row');

describe('RowData', function() {
    describe('isDuplicatedPublicChanged()', function() {
        var row;

        beforeEach(function() {
            row = new RowData({
                c1: '0-1',
                c2: '0-2'
            }, {parse: true});
            jasmine.clock().install();
        });

        afterEach(function() {
            jasmine.clock().uninstall();
        });

        it('10ms 내에 같은 객체로 함수 호출이 일어나면 true를 반환한다.', function() {
            expect(row.isDuplicatedPublicChanged({value: 1})).toBe(false);
            expect(row.isDuplicatedPublicChanged({value: 2})).toBe(false);
            expect(row.isDuplicatedPublicChanged({value: 2})).toBe(true);
        });

        it('10ms 후에는 같은 객체로 호출이 일어나도 false를 반환한다.', function() {
            row.isDuplicatedPublicChanged({value: 1});
            jasmine.clock().tick(10);
            expect(row.isDuplicatedPublicChanged({value: 1})).toBe(false);
        });
    });

    describe('setRowState(), getRowState()', function() {
        var row;

        beforeEach(function() {
            row = new RowData({
                text: 'hello'
            }, {parse: true});
        });

        it('default', function() {
            var expected = {
                isDisabled: false,
                isDisabledCheck: false,
                isChecked: false
            };
            expect(row.getRowState()).toEqual(expected);
        });

        it('set DISABLED', function() {
            var expected = {
                isDisabled: true,
                isDisabledCheck: true,
                isChecked: false
            };

            row.setRowState('DISABLED');
            expect(row.getRowState()).toEqual(expected);
        });

        it('set CHECKED', function() {
            var expected = {
                isDisabled: false,
                isDisabledCheck: false,
                isChecked: true
            };

            row.setRowState('CHECKED');
            expect(row.getRowState()).toEqual(expected);
        });

        it('set DISABLE_CHECK', function() {
            var expected = {
                isDisabled: false,
                isDisabledCheck: true,
                isChecked: false
            };

            row.setRowState('DISABLED_CHECK');
            expect(row.getRowState()).toEqual(expected);
        });
    });
});
