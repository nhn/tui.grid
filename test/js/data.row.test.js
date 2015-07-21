'use strict';

describe('Data.Row', function() {
    describe('isDuplicatedPublicChanged()', function() {
        var row;

        beforeEach(function() {
            row = new Data.Row({
                c1: '0-1',
                c2: '0-2'
            });
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

    describe('setExtraData()', function() {
        var row;

        beforeEach(function() {
            row = new Data.Row({
                _extraData: {
                    rowSpan: {text: 3}
                },
                text: 'hello'
            });
        });

        it('extraData 데이터를 확장하여 추가한다.', function() {
            row.setExtraData({
                rowState: 'DISABLED'
            });
            expect(row.get('_extraData')).toEqual({
                rowSpan: {text: 3},
                rowState: 'DISABLED'
            });
        });

        it('extraData에 이미 존재하는 필드는 값이 변경된다.', function() {
            row.setExtraData({
                rowSpan: {text: 5}
            });
            expect(row.get('_extraData')).toEqual({
                rowSpan: {text: 5}
            });
        });

        describe('change 이벤트', function() {
            var callback;

            beforeEach(function() {
                callback = jasmine.createSpy('callback');
                row.on('change', callback);
            });

            it('값이 변경되면 발생한다.', function() {
                row.setExtraData({
                    rowSpan: {text: 5}
                });
                expect(callback).toHaveBeenCalled();
            });

            it('값이 변경되지 않거나 silent를 true로 지정하면 발생하지 않는다.', function() {
                row.setExtraData({
                    rowSpan: {text: 3} // same value
                });
                expect(callback).not.toHaveBeenCalled();

                row.setExtraData({
                    rowSpan: {text: 5}
                }, {
                    silent: true
                });
                expect(callback).not.toHaveBeenCalled();
            });
        });
    });

    describe('setRowState()', function() {
        var row;

        beforeEach(function() {
            row = new Data.Row({
                text: 'hello'
            });
        });

        it('extraData의 rowState 값을 변경한다.', function() {
            row.setRowState('DISABLED');
            expect(row.get('_extraData').rowState).toBe('DISABLED');

            row.setRowState('CHECKED');
            expect(row.get('_extraData').rowState).toBe('CHECKED');
        });
    });
});
