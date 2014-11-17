'use strict';
describe('model.rowList', function() {
    var columnModelList = [

    ];
    var rowList,
        columnModelInstance,
        dataModelInstance,
        dimensionModel,
        grid = {};
    beforeEach(function() {
        rowList = $.extend(true, [], originalData);
        columnModelInstance = grid.columnModel = new Data.ColumnModel();
        columnModelInstance.set('columnModelList', columnModelList);
        dataModelInstance = grid.dataModel = new Data.RowList([], {
            grid: grid
        });
        dimensionModel = new Model.Dimension({
            grid: grid,
            offsetLeft: 100,
            offsetTop: 200,
            width: 500,
            height: 500,
            headerHeight: 150,
            rowHeight: 100,

            scrollX: true,
            scrollBarSize: 17,

            minimumColumnWidth: 20,
            displayRowCount: 20
        });
    });
    describe('initializeVariables()', function() {
        it('변수를 초기화 하는지 확인한다.', function() {

        });
    });
});
