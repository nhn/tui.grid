'use strict';

describe('Data.Row', function() {
    var row;

    beforeEach(function() {
        row = new Data.Row({
            c1: '0-1',
            c2: '0-2'
        });
    });

    describe('isDuplicatedPublicChanged()', function() {
        beforeEach(function() {
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
});
