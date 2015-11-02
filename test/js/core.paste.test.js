'use strict';

var Core = require('../../src/js/core');

describe('grid.core.paste()', function() {
    var grid, $empty;

    function createColumnModelList(names) {
        var models = [];
        ne.util.forEachArray(names, function(name, editType) {
            models.push({
                title: name,
                columnName: name,
                editOption: {
                    type: editType || 'text'
                }
            });
        });
        return models;
    }

    jasmine.getFixtures().fixturesPath = 'base/';
    loadFixtures('test/fixtures/empty.html');
    $empty = $('#empty').hide();

    afterEach(function() {
        grid.destroy();
    });

    describe('텍스트 컬럼 (text, text-convertible)', function() {
        beforeEach(function() {
            var columnModelList = createColumnModelList(['c1', 'c2', 'c3']);
            columnModelList[1].editOption.type = 'text-convertible';

            grid = new Core({
                el: $empty,
                columnModelList: columnModelList
            });
            grid.setRowList([
                {
                    c1: '0-1',
                    c2: '0-2',
                    c3: '0-3'
                }, {
                    c1: '1-1',
                    c2: '1-2',
                    c3: '1-3'
                }, {
                    c1: '2-1',
                    c2: '2-2',
                    c3: '2-3'
                }
            ]);
        });

        it('단일 데이터 붙여넣기', function() {
            grid.focus(2, 'c2');
            grid.paste([['New2-2']]);
            expect(grid.getValue(2, 'c2')).toBe('New2-2');
        });

        it('2 x 2 배열 붙여넣기', function() {
            grid.focus(1, 'c1');
            grid.paste([
                ['New1-1', 'New1-2'],
                ['New2-1', 'New2-2']
            ]);
            expect(grid.getValue(1, 'c1')).toBe('New1-1');
            expect(grid.getValue(1, 'c2')).toBe('New1-2');
            expect(grid.getValue(2, 'c1')).toBe('New2-1');
            expect(grid.getValue(2, 'c2')).toBe('New2-2');
        });

        it('컬럼 범위를 넘어가는 값은 무시한다.', function() {
            grid.focus(2, 'c3');
            grid.paste([['New2-3', 'New2-4', 'New2-5']]);
            expect(grid.getValue(2, 'c3')).toBe('New2-3');
        });

        it('행 범위를 넘어가는 값이 있으면 행을 추가해준다.', function() {
            grid.focus(2, 'c2');
            grid.paste([
                ['New2-2', 'New2-3'],
                ['New3-2', 'New3-3']
            ]);
            expect(grid.getValue(2, 'c2')).toBe('New2-2');
            expect(grid.getValue(2, 'c3')).toBe('New2-3');
            expect(grid.getValue(3, 'c2')).toBe('New3-2');
            expect(grid.getValue(3, 'c3')).toBe('New3-3');
        });

        it('붙여넣기가 끝나면 변경된 범위만큼 셀렉션을 만들어준다.', function() {
            var startIdx, endIdx;
            grid.focus(0, 'c1');
            grid.paste([
                ['New1-1', 'New1-2'],
                ['New2-1', 'New2-2']
            ]);
            startIdx = grid.selectionModel.getStartIndex();
            endIdx = grid.selectionModel.getEndIndex();

            expect(startIdx.rowIdx).toBe(0);
            expect(startIdx.columnIdx).toBe(0);
            expect(endIdx.rowIdx).toBe(1);
            expect(endIdx.columnIdx).toBe(1);
        });
    });

    describe('편집 불가능한 셀은 값을 변경하지 않고 넘어간다', function() {
        it(': editOption이 없는 열', function() {
            var columnModelList = createColumnModelList(['c1', 'c2']);
            columnModelList[1].editOption = null;
            grid = new Core({
                el: $empty,
                columnModelList: columnModelList
            });
            grid.setRowList([{
                    c1: '0-1',
                    c2: '0-2'
                }, {
                    c1: '1-1',
                    c2: '1-2'
                }
            ]);
            grid.focus(0, 'c1');
            grid.paste([
                ['New0-1', 'New0-2'],
                ['New1-1', 'New1-2']
            ]);
            expect(grid.getValue(0, 'c1')).toBe('New0-1');
            expect(grid.getValue(0, 'c2')).toBe('0-2');
            expect(grid.getValue(1, 'c1')).toBe('New1-1');
            expect(grid.getValue(1, 'c2')).toBe('1-2');
        });

        it(': disabled', function() {
            grid = new Core({
                el: $empty,
                columnModelList: createColumnModelList(['c1', 'c2'])
            });
            grid.setRowList([
                {
                    _extraData: {
                        rowState: 'DISABLED'
                    },
                    c1: '0-1',
                    c2: '0-2'
                }, {
                    c1: '1-1',
                    c2: '1-2'
                }
            ]);
            grid.focus(0, 'c1');
            grid.paste([
                ['New0-1', 'New0-2'],
                ['New1-1', 'New1-2']
            ]);
            expect(grid.getValue(0, 'c1')).toBe('0-1');
            expect(grid.getValue(0, 'c2')).toBe('0-2');
            expect(grid.getValue(1, 'c1')).toBe('New1-1');
            expect(grid.getValue(1, 'c2')).toBe('New1-2');
        });
    });

    it('숨겨진 컬럼은 제외하고 처리한다.', function() {
        var columnModelList = createColumnModelList(['c1', 'c2', 'c3']);
        columnModelList[1].isHidden = true;
        grid = new Core({
            el: $empty,
            columnModelList: columnModelList
        });
        grid.setRowList([
            {
                c1: '0-1',
                c2: '0-2',
                c3: '0-3'
            }, {
                c1: '1-1',
                c2: '1-2',
                c3: '1-3'
            }
        ]);
        grid.focus(0, 'c1');
        grid.paste([
            ['New0-1', 'New0-3'],
            ['New1-1', 'New1-3']
        ]);
        expect(grid.getValue(0, 'c1')).toBe('New0-1');
        expect(grid.getValue(0, 'c2')).toBe('0-2');
        expect(grid.getValue(0, 'c3')).toBe('New0-3');
        expect(grid.getValue(1, 'c1')).toBe('New1-1');
        expect(grid.getValue(1, 'c2')).toBe('1-2');
        expect(grid.getValue(1, 'c3')).toBe('New1-3');
    });


    it('RowSpan이 적용된 컬럼일 경우 MainRow의 값만 변경한다', function() {
        grid = new Core({
            el: $empty,
            columnModelList: createColumnModelList(['c1', 'c2'])
        });
        grid.setRowList([
            {
                _extraData: {
                    rowSpan: {
                        c2: 2
                    }
                },
                c1: '0-1',
                c2: '0-2'
            }, {
                c1: '1-1',
                c2: '1-2'
            }
        ]);
        grid.focus(0, 'c1');
        grid.paste([
            ['New0-1', 'New0-2'],
            ['New1-1', 'New1-2']
        ]);
        expect(grid.getValue(0, 'c1')).toBe('New0-1');
        expect(grid.getValue(0, 'c2')).toBe('New0-2');
        expect(grid.getValue(1, 'c1')).toBe('New1-1');
        expect(grid.getValue(1, 'c2')).toBe('New0-2');
    });

    it('셀렉션이 존재하는 경우 포커스된 셀이 아닌 셀렉션의 왼쪽 상단 셀을 기준으로 붙여넣기 한다', function() {
        grid = new Core({
            el: $empty,
            columnModelList: createColumnModelList(['c1', 'c2', 'c3'])
        });
        grid.setRowList([
            {
                c1: '0-1',
                c2: '0-2',
                c3: '0-3'
            }, {
                c1: '1-1',
                c2: '1-2',
                c3: '1-3'
            }, {
                c1: '2-1',
                c2: '2-2',
                c3: '2-3'
            }
        ]);
        grid.selectionModel.start(0, 0);
        grid.selectionModel.update(1, 1);
        grid.focus(1, 'c2');
        grid.paste([
            ['New0-1', 'New0-2'],
            ['New1-1', 'New1-2']
        ]);
        expect(grid.getValue(0, 'c1')).toBe('New0-1');
        expect(grid.getValue(0, 'c2')).toBe('New0-2');
        expect(grid.getValue(1, 'c1')).toBe('New1-1');
        expect(grid.getValue(1, 'c2')).toBe('New1-2');
    });
});
