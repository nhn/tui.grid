'use strict';

var _ = require('underscore');
var ColumnModelData = require('model/data/columnModel');
var RowListData = require('model/data/rowList');
var Summary = require('model/summary');
var typeConst = require('common/constMap').summaryType;

function create(data, columnContent, defaultContent) {
    var columnModel = new ColumnModelData({
        columns: [
            {
                name: 'c1',
                editOptions: {
                    type: 'text'
                }
            },
            {
                name: 'c2',
                editOptions: {
                    type: 'text'
                }
            }
        ]
    });
    var dataModel = new RowListData([], {
        columnModel: columnModel
    });
    dataModel.setData(data);

    return new Summary(null, {
        dataModel: dataModel,
        columnModel: columnModel,
        columnContent: columnContent,
        defaultContent: defaultContent
    });
}

describe('model/summary', function() {
    describe('getValue() with initial data: ', function() {
        var data = [
            {c1: 1},
            {c1: 2},
            {c1: 3},
            {c1: 4}
        ];

        it('sum/avg/count/min/max', function() {
            var summary = create(data, {
                c1: {template: function() {}}
            });

            expect(summary.getValue('c1', typeConst.SUM)).toBe(10);
            expect(summary.getValue('c1', typeConst.AVG)).toBe(2.5);
            expect(summary.getValue('c1', typeConst.MIN)).toBe(1);
            expect(summary.getValue('c1', typeConst.MAX)).toBe(4);
            expect(summary.getValue('c1', typeConst.CNT)).toBe(4);
        });

        it('Treat every NaN value as a number 0', function() {
            var summary = create([
                {c1: 1},
                {c2: '1'}, // change to number 1
                {
                    c1: null,
                    c2: 'hoho'
                },
                {
                    c1: null,
                    c2: false
                }
            ], {
                c1: {template: function() {}},
                c2: {template: function() {}}
            });

            expect(summary.getValue('c1', typeConst.SUM)).toBe(1);
            expect(summary.getValue('c2', typeConst.SUM)).toBe(1);
        });
    });

    describe('Should update summary values when dataModel is changed - ', function() {
        var summary;

        beforeEach(function() {
            summary = create([
                {
                    c1: 1,
                    c2: 1
                },
                {
                    c1: 2,
                    c2: 2
                }
            ], {
                c1: {template: function() {}},
                c2: {template: function() {}}
            });
        });

        it('Add', function() {
            summary.dataModel.appendRow({
                c1: 3,
                c2: 3
            });

            expect(summary.getValue('c1', typeConst.SUM)).toBe(6);
            expect(summary.getValue('c2', typeConst.SUM)).toBe(6);
        });

        it('Remove', function() {
            summary.dataModel.removeRow(1);

            expect(summary.getValue('c1', typeConst.SUM)).toBe(1);
            expect(summary.getValue('c2', typeConst.SUM)).toBe(1);
        });

        it('Update', function() {
            summary.dataModel.setValue(1, 'c1', 3);

            expect(summary.getValue('c1', typeConst.SUM)).toBe(4);
        });

        it('Reset', function() {
            summary.dataModel.setData([
                {
                    c1: 3,
                    c2: 4
                },
                {
                    c1: 3,
                    c2: 4
                }
            ]);

            expect(summary.getValue('c1', typeConst.SUM)).toBe(6);
            expect(summary.getValue('c2', typeConst.SUM)).toBe(8);
        });

        it('Delete Range', function() {
            summary.dataModel.delRange({
                row: [0, 0],
                column: [0, 0]
            });

            expect(summary.getValue('c1', typeConst.SUM)).toBe(2);
        });
    });

    describe('If template is null or useAutoSummary is false', function() {
        var summary;

        beforeEach(function() {
            summary = create([
                {c1: 1},
                {c2: 1}
            ], {
                c1: {},
                c2: {
                    useAutoSummary: false,
                    template: function() {}
                }
            });
        });

        it('initial value should not be calculated', function() {
            expect(summary.getValue('c1', typeConst.SUM)).toBe(null);
            expect(summary.getValue('c2', typeConst.SUM)).toBe(null);
        });

        it('change events on dataModel should be ignored', function() {
            summary.dataModel.setValue(1, 'c1', 3);
            summary.dataModel.setValue(1, 'c2', 3);

            expect(summary.getValue('c1', typeConst.SUM)).toBe(null);
            expect(summary.getValue('c2', typeConst.SUM)).toBe(null);
        });
    });

    describe('If defaultContent is not null', function() {
        var summary;
        var data = [
            {
                c1: 1,
                c2: 1
            },
            {
                c1: 2,
                c2: 2
            }
        ];

        describe('and useAutoSummary is not false', function() {
            var defTemplate = function() {};

            beforeEach(function() {
                summary = create(data, null, {template: defTemplate});
            });

            it('initial value should be calculated', function() {
                expect(summary.getValue('c1', typeConst.SUM)).toBe(3);
                expect(summary.getValue('c2', typeConst.SUM)).toBe(3);
            });

            it('change events on dataModel should be calculated', function() {
                summary.dataModel.setValue(1, 'c1', 3);
                summary.dataModel.setValue(1, 'c2', 3);

                expect(summary.getValue('c1', typeConst.SUM)).toBe(4);
                expect(summary.getValue('c2', typeConst.SUM)).toBe(4);
            });

            it('template should be assigned to all columns', function() {
                expect(summary.getTemplate('c1')).toBe(defTemplate);
                expect(summary.getTemplate('c2')).toBe(defTemplate);
            });
        });

        describe('and useAutoSummary is false', function() {
            beforeEach(function() {
                summary = create(data, null, {
                    useAutoSummary: false,
                    template: function() {}
                });
            });

            it('initial value should not be calculated', function() {
                expect(summary.getValue('c1', typeConst.SUM)).toBe(null);
            });

            it('change events on dataModel should be ignored', function() {
                summary.dataModel.setValue(1, 'c2', 3);
                expect(summary.getValue('c1', typeConst.SUM)).toBe(null);
            });
        });

        describe('and columnContent exist', function() {
            var c1Template = function() {};
            var c2Template = function() {};
            var defTemplate = function() {};

            beforeEach(function() {
                summary = create(data, {
                    c1: {
                        useAutoSummary: false,
                        template: c1Template
                    },
                    c2: {
                        template: c2Template
                    }
                }, {
                    template: defTemplate
                });
            });

            it('useAutoSummary should be overridden', function() {
                expect(summary.getValue('c1', typeConst.SUM)).toBe(null);
                expect(summary.getValue('c2', typeConst.SUM)).toBe(3);
            });

            it('template shuoud be overridden', function() {
                expect(summary.getTemplate('c1')).toBe(c1Template);
                expect(summary.getTemplate('c2')).toBe(c2Template);
            });
        });

        describe('and useAutoSummary is false but columnContent.useAutoSummary is not false', function() {
            beforeEach(function() {
                summary = create(data, {
                    c1: {
                        template: function() {}
                    }
                }, {
                    useAutoSummary: false,
                    template: function() {}
                });
            });

            it('useAutoSummary should be overridden', function() {
                expect(summary.getValue('c1', typeConst.SUM)).toBe(3);
            });
        });
    });

    describe('When summary map is changed, change event should be triggered ', function() {
        var changeSpy, summary;

        beforeEach(function() {
            changeSpy = jasmine.createSpy();
            summary = create([
                {
                    c1: 1,
                    c2: 1
                },
                {
                    c1: 2,
                    c2: 2
                }
            ], {
                c1: {template: function() {}},
                c2: {template: function() {}}
            });

            summary.on('change', changeSpy);
        });

        it('for each column', function() {
            summary.dataModel.appendRow({
                c1: 3,
                c2: 3
            });

            expect(changeSpy).toHaveBeenCalledWith('c1', summary.getValue('c1'));
            expect(changeSpy).toHaveBeenCalledWith('c2', summary.getValue('c2'));
        });

        it('only for changed column', function() {
            summary.dataModel.setValue(0, 'c1', 0);

            expect(changeSpy.calls.count()).toBe(1);
            expect(changeSpy.calls.argsFor(0)[0]).toBe('c1');
        });
    });

    describe('when setColumnContent is called', function() {
        it('getValue() should return value of changed column', function() {
            var summary = create([{c1: 1}, {c1: 2}]);

            summary.setColumnContent('c1', {
                template: function() {
                    return '';
                }
            }, true);

            expect(summary.getValue('c1')).toEqual({
                sum: 3,
                min: 1,
                max: 2,
                avg: 1.5,
                cnt: 2
            });
        });

        it('change event should be triggered', function() {
            var summary = create([{c1: 1}, {c1: 2}]);
            var changeSpy = jasmine.createSpy('change');

            summary.on('change', changeSpy);
            summary.setColumnContent('c1', {
                template: function() {
                    return '';
                }
            }, true);

            expect(changeSpy).toHaveBeenCalledWith('c1', {
                sum: 3,
                min: 1,
                max: 2,
                avg: 1.5,
                cnt: 2
            });
        });
    });

    describe('getValues(): ', function() {
        var summary;

        beforeEach(function() {
            summary = create([
                {
                    c1: 1,
                    c2: 2
                },
                {
                    c1: 2,
                    c2: 4
                },
                {
                    c1: 3,
                    c2: 6
                }
            ], {
                c1: {template: function() {}},
                c2: {template: function() {}}
            });

        });

        it('If columnName is specified, returns summary value of the column', function() {
            expect(summary.getValues('c1')).toEqual({
                sum: 6,
                min: 1,
                max: 3,
                avg: 2,
                cnt: 3
            });
        });

        it('If columnName is not specified, returns all summary values', function() {
            expect(summary.getValues()).toEqual({
                c1: {
                    sum: 6,
                    min: 1,
                    max: 3,
                    avg: 2,
                    cnt: 3
                },
                c2: {
                    sum: 12,
                    min: 2,
                    max: 6,
                    avg: 4,
                    cnt: 3
                }
            });
        });
    });
});
