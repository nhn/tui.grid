'use strict';

var $ = require('jquery');

var PainterController = require('painter/controller');
var ColumnModel = require('model/data/columnModel');
var DataModel = require('model/data/rowList');

var TreeCellPainter = require('painter/treeCell');
var classNameConst = require('common/classNameConst');
var dimensionConst = require('common/constMap').dimension;

function createPaintController() {
    var columnModel = new ColumnModel();
    var dataModel = new DataModel(null, {
        columnModel: columnModel
    });

    return new PainterController({
        columnModel: columnModel,
        dataModel: dataModel
    });
}

function createTreeCellPainter() {
    var contoller = createPaintController();

    return new TreeCellPainter({
        controller: contoller
    });
}

describe('painter.treeCell', function() {
    var treeCell, cellData, cell;

    beforeEach(function() {
        treeCell = createTreeCellPainter();
        cellData = {
            columnModel: {}
        };
    });

    describe('generateHtml() ', function() {
        var $elements;

        it('create the extra content element.', function() {
            cell = treeCell.generateHtml(cellData);
            $elements = $(cell).find('.' + classNameConst.TREE_EXTRA_CONTENT);

            expect($elements.length).toBe(1);
        });

        it('create the data content element.', function() {
            cell = treeCell.generateHtml(cellData);
            $elements = $(cell).find('.' + classNameConst.CELL_CONTENT);

            expect($elements.length).toBe(1);
        });
    });

    describe('the cell element(td) with cell data, ', function() {
        var result;

        it('when the cell data has children, the cell has collapsed button.', function() {
            cellData = $.extend(cellData, {
                hasChildren: true
            });
            cell = treeCell.generateHtml(cellData);
            result = $(cell).hasClass(classNameConst.TREE_BUTTON_COLLAPSE);

            expect(result).toBe(true);
        });

        it('when the cell data has children and row is expanded, the cell has expanded button.', function() {
            cellData = $.extend(cellData, {
                hasChildren: true,
                isExpanded: true
            });
            cell = treeCell.generateHtml(cellData);
            result = $(cell).hasClass(classNameConst.TREE_BUTTON_EXPAND);

            expect(result).toBe(true);
        });
    });

    describe('the content element with cell data, ', function() {
        var $element;

        it('the left margin is created as depth of tree.', function() {
            var depth = 10;
            var marginLeft = dimensionConst.INDENT_WIDTH * depth;

            cellData = $.extend(cellData, {
                depth: depth
            });
            $element = $(treeCell._getContentHtml(cellData));

            expect($element.css('margin-left')).toBe(marginLeft + 'px');
        });
    });

    describe('the extra element with cell data, ', function() {
        var content;

        it('the line elements are created as depth of tree.', function() {
            var depth = 5;
            var $elements;

            cellData = $.extend(cellData, {
                depth: depth
            });
            content = treeCell._getExtraContentHtml(cellData);
            $elements = $(content).find('.' + classNameConst.TREE_DEPTH);

            expect($elements.length).toBe(depth);
        });

        it('when the current cell has children, the last line element has exapand/collapse button.', function() {
            var $element;

            cellData = $.extend(cellData, {
                depth: 3,
                hasChildren: true
            });
            content = treeCell._getExtraContentHtml(cellData);
            $element = $(content).find('.' + classNameConst.TREE_DEPTH).last();

            expect($element.find('.' + classNameConst.BTN_TREE).length).toBe(1);
        });

        it('when the tree-cell use icon, the icon is created in a cell.', function() {
            var $element;

            cellData = $.extend(cellData, {
                useIcon: true
            });
            content = treeCell._getExtraContentHtml(cellData);
            $element = $(content).find('.' + classNameConst.TREE_ICON);

            expect($element.length).toBe(1);
        });
    });
});
