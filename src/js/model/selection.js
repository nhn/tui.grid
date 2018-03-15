/**
 * @fileoverview Selection Model class
 * @author NHN Ent. FE Development Lab
 */

'use strict';

var $ = require('jquery');
var _ = require('underscore');

var Model = require('../base/model');
var GridEvent = require('../event/gridEvent');

var util = require('../common/util');
var typeConst = require('../common/constMap').selectionType;

/**
 * Selection Model class
 * @module model/selection
 * @extends module:base/view
 * @param {Object} attr - Attributes
 * @param {Object} options - Options
 * @ignore
 */
var Selection = Model.extend(/** @lends module:model/selection.prototype */{
    initialize: function(attr, options) {
        var domEventBus;

        Model.prototype.initialize.apply(this, arguments);

        _.assign(this, {
            dataModel: options.dataModel,
            columnModel: options.columnModel,
            dimensionModel: options.dimensionModel,
            focusModel: options.focusModel,
            renderModel: options.renderModel,
            coordRowModel: options.coordRowModel,
            coordConverterModel: options.coordConverterModel,
            domEventBus: options.domEventBus,

            inputRange: null,
            minimumColumnRange: null,
            intervalIdForAutoScroll: null,
            scrollPixelScale: 40,
            enabled: true,
            selectionType: typeConst.CELL,
            selectionUnit: attr.selectionUnit
        });

        this.listenTo(this.dataModel, 'add remove sort reset', this.end);
        this.listenTo(this.dataModel, 'paste', this._onPasteData);

        if (this.isEnabled() && options.domEventBus) {
            domEventBus = options.domEventBus;
            this.listenTo(domEventBus, 'dragstart:header', this._onDragStartHeader);
            this.listenTo(domEventBus, 'dragmove:header', this._onDragMoveHeader);
            this.listenTo(domEventBus, 'dragmove:body', this._onDragMoveBody);
            this.listenTo(domEventBus, 'dragend:body', this._onDragEndBody);
            this.listenTo(domEventBus, 'mousedown:body', this._onMouseDownBody);
            this.listenTo(domEventBus, 'key:move key:edit', this._onKeyMoveOrEdit);
            this.listenTo(domEventBus, 'key:select', this._onKeySelect);
            this.listenTo(domEventBus, 'key:delete', this._onKeyDelete);
        }

        this.on('change:range', this._triggerSelectionEvent);
    },

    defaults: {
        /**
         * Selection range
         * ex) {row: [0, 1], column: [1, 2]}
         * @type {{row: array, column: array}}
         */
        range: null
    },

    /**
     * Event handler for 'dragstart:header' event on domEventBus
     * @param {module:event/gridEvent} gridEvent - GridEvent
     * @private
     */
    _onDragStartHeader: function(gridEvent) {
        var columnModel = this.columnModel;
        var columnNames = columnModel.getUnitColumnNamesIfMerged(gridEvent.columnName);
        var columnRange;

        if (_.some(columnNames, util.isMetaColumn)) {
            gridEvent.stop();

            return;
        }

        columnRange = this._getColumnRangeWithNames(columnNames);

        if (gridEvent.shiftKey) {
            this.update(0, columnRange[1], typeConst.COLUMN);
            this._extendColumnSelection(columnRange, gridEvent.pageX, gridEvent.pageY);
        } else {
            this.minimumColumnWidth = columnRange;
            this.selectColumn(columnRange[0]);
            this.update(0, columnRange[1]);
        }
    },

    /**
     * Event handler for 'dragmove:header' event on domEventBus
     * @param {module:event/gridEvent} gridEvent - GridEvent
     * @private
     */
    _onDragMoveHeader: function(gridEvent) {
        var columnModel = this.columnModel;
        var columnNames, columnRange;

        if (gridEvent.isOnHeaderArea && !gridEvent.columnName) {
            return;
        }

        columnNames = columnModel.getUnitColumnNamesIfMerged(gridEvent.columnName);
        if (columnNames.length) {
            columnRange = this._getColumnRangeWithNames(columnNames);
        }
        this._extendColumnSelection(columnRange, gridEvent.pageX, gridEvent.pageY);
    },

    /**
     * Event handler for key:move/key:edit fevent on domEventBus
     * @private
     */
    _onKeyMoveOrEdit: function() {
        this.end();
    },

    /**
     * Event handler for key:select event on domEventBus
     * @param {module:event/gridEvent} ev - GridEvent
     * @private
     */
    _onKeySelect: function(ev) { // eslint-disable-line complexity
        var address = this._getRecentAddress();
        var lastRowIndex = this.dataModel.length - 1;
        var lastColummnIndex = this.columnModel.getVisibleColumns().length - 1;

        switch (ev.command) {
            case 'up':
                address.row -= 1;
                break;
            case 'down':
                address.row += 1;
                break;
            case 'left':
                address.column -= 1;
                break;
            case 'right':
                address.column += 1;
                break;
            case 'pageUp':
                address.row = this.coordRowModel.getPageMovedIndex(address.row, false);
                break;
            case 'pageDown':
                address.row = this.coordRowModel.getPageMovedIndex(address.row, true);
                break;
            case 'firstColumn':
                address.column = 0;
                break;
            case 'lastColumn':
                address.column = lastColummnIndex;
                break;
            case 'firstCell':
                address.row = 0;
                address.column = 0;
                break;
            case 'lastCell':
                address.row = lastRowIndex;
                address.column = lastColummnIndex;
                break;
            case 'all':
                this.selectAll();
                address = null;
                break;
            default:
                address = null;
        }

        if (address) {
            this.update(address.row, address.column, this.getSelectionUnit());
            this._scrollTo(address.row, address.column);
        }
    },

    /**
     * Event handler for key:delete event on domEventBus
     * @private
     */
    _onKeyDelete: function() {
        var dataModel = this.dataModel;
        var focused;

        if (this.hasSelection()) {
            dataModel.delRange(this.get('range'));
        } else {
            focused = this.focusModel.which();
            dataModel.del(focused.rowKey, focused.columnName);
        }
    },

    /**
     * Return an address of recently extended cell
     * @returns {{row: number, column:number}} index
     * @private
     */
    _getRecentAddress: function() {
        var focusedIndex = this.focusModel.indexOf();
        var selectionRange = this.get('range');
        var index = _.assign({}, focusedIndex);
        var selectionRowRange, selectionColumnRange;

        if (selectionRange) {
            selectionRowRange = selectionRange.row;
            selectionColumnRange = selectionRange.column;

            index.row = selectionRowRange[0];
            index.column = selectionColumnRange[0];

            if (selectionRowRange[1] > focusedIndex.row) {
                index.row = selectionRowRange[1];
            }
            if (selectionColumnRange[1] > focusedIndex.column) {
                index.column = selectionColumnRange[1];
            }
        }

        return index;
    },

    /**
     * Returns whether the given address is valid
     * @param {{row: number, column: number}} address - address
     * @returns {boolean}
     * @private
     */
    _isValidAddress: function(address) {
        return !!this.dataModel.at(address.row) && !!this.columnModel.at(address.colummn);
    },

    /**
     * Scrolls to the position of given address
     * @param {number} rowIndex - row index
     * @param {number} columnIndex - column index
     * @private
     */
    _scrollTo: function(rowIndex, columnIndex) {
        var row = this.dataModel.at(rowIndex);
        var column = this.columnModel.at(columnIndex);
        var rowKey, columnName, selectionType, scrollPosition;

        if (!row || !column) {
            return;
        }

        rowKey = row.get('rowKey');
        columnName = column.name;
        scrollPosition = this.coordConverterModel.getScrollPosition(rowKey, columnName);
        if (scrollPosition) {
            selectionType = this.getType();
            if (selectionType === typeConst.COLUMN) {
                delete scrollPosition.scrollTop;
            } else if (selectionType === typeConst.ROW) {
                delete scrollPosition.scrollLeft;
            }
            this.renderModel.set(scrollPosition);
        }
    },

    /**
     * Examine the type of selection with given column index
     * @param {Number} columnIndex - columnIndex
     * @returns {String}
     * @private
     */
    _getTypeByColumnIndex: function(columnIndex) {
        var visibleColumns = this.columnModel.getVisibleColumns(null, true);
        var columnName = visibleColumns[columnIndex].name;

        switch (columnName) {
            case '_button':
                return null;
            case '_number':
                return typeConst.ROW;
            default:
                return typeConst.CELL;
        }
    },

    /**
     * Event handler for 'mousedown:body' event on domEventBus
     * @param {module:event/gridEvent} gridEvent - GridEvent
     * @private
     */
    _onMouseDownBody: function(gridEvent) {
        var address = this.coordConverterModel.getIndexFromMousePosition(gridEvent.pageX, gridEvent.pageY, true);
        var selType = this._getTypeByColumnIndex(address.column);
        var rowIndex, columnIndex;

        if (!selType) {
            return;
        }

        rowIndex = address.row;
        columnIndex = address.column - this.columnModel.getVisibleMetaColumnCount();

        if (gridEvent.shiftKey) {
            this.update(rowIndex, Math.max(columnIndex, 0));
        } else if (selType === typeConst.ROW) {
            this.selectRow(rowIndex);
        } else {
            this.focusModel.focusAt(rowIndex, columnIndex);
            this.end();
        }
    },

    /**
     * Event handler for 'dragmove:body' event on domEventBus
     * @param {module:event/gridEvent} gridEvent - GridEvent
     * @private
     */
    _onDragMoveBody: function(gridEvent) {
        var address = this.coordConverterModel.getIndexFromMousePosition(gridEvent.pageX, gridEvent.pageY);

        this.update(address.row, address.column, this.getSelectionUnit());
        this._setScrolling(gridEvent.pageX, gridEvent.pageY);
    },

    /**
     * Event handler for 'dragend:body' event on domEventBus
     * @private
     */
    _onDragEndBody: function() {
        this.stopAutoScroll();
    },

    /**
     * Event handler for 'paste' event on DataModel
     * @param {Object} range - Range
     */
    _onPasteData: function(range) {
        this.start(range.startIdx.row, range.startIdx.column);
        this.update(range.endIdx.row, range.endIdx.column);
    },

    /**
     * Returns the range of column index of given column names
     * @param {Array.<string>} columnNames - column names
     * @returns {Array.<number>}
     * @private
     */
    _getColumnRangeWithNames: function(columnNames) {
        var columnModel = this.columnModel;
        var columnIndexes = _.map(columnNames, function(name) {
            return columnModel.indexOfColumnName(name, true);
        });
        var minMax = util.getMinMax(columnIndexes);

        return [minMax.min, minMax.max];
    },

    /**
     * Set selection type
     * @param {string} type - Selection type (CELL, ROW, COLUMN)
     */
    setType: function(type) {
        this.selectionType = typeConst[type] || this.selectionType;
    },

    /**
     * Returns the selection type (using internal state)
     * @returns {string} type - Selection type (CELL, ROW, COLUMN)
     */
    getType: function() {
        return this.selectionType;
    },

    /**
     * Returns the selection unit (by options)
     * @returns {string} unit - Selection unit (CELL, ROW)
     */
    getSelectionUnit: function() {
        return this.get('selectionUnit').toUpperCase();
    },

    /**
     * Enables the selection.
     */
    enable: function() {
        this.enabled = true;
    },

    /**
     * Disables the selection.
     */
    disable: function() {
        this.end();
        this.enabled = false;
    },

    /**
     * Returns whether the selection is enabled.
     * @returns {boolean} True if the selection is enabled.
     */
    isEnabled: function() {
        return this.enabled;
    },

    /**
     * Starts the selection.
     * @param {Number} rowIndex - Row index
     * @param {Number} columnIndex - Column index
     * @param {string} type - Selection type
     */
    start: function(rowIndex, columnIndex, type) {
        if (!this.isEnabled()) {
            return;
        }

        this.setType(type);
        this.inputRange = {
            row: [rowIndex, rowIndex],
            column: [columnIndex, columnIndex]
        };
        this._resetRangeAttribute();
    },

    /**
     * Updates the selection range.
     * @param {number} rowIndex - Row index
     * @param {number} columnIndex - Column index
     * @param {string} [type] - Selection type
     */
    update: function(rowIndex, columnIndex, type) { // eslint-disable-line complexity
        var focusedIndex;

        if (!this.enabled ||
            (type !== typeConst.COLUMN && rowIndex < 0) ||
            (type !== typeConst.ROW && columnIndex < 0)) {
            return;
        }

        if (!this.hasSelection()) {
            focusedIndex = this.focusModel.indexOf();
            if (type === typeConst.ROW) {
                this.start(focusedIndex.row, 0, typeConst.ROW);
            } else {
                this.start(focusedIndex.row, focusedIndex.column, typeConst.CELL);
            }
        } else {
            this.setType(type);
        }

        this._updateInputRange(rowIndex, columnIndex);
        this._resetRangeAttribute();
    },

    /**
     * Update input range (end range, not start range)
     * @param {number} rowIndex - Row index
     * @param {number} columnIndex - Column index
     * @private
     */
    _updateInputRange: function(rowIndex, columnIndex) {
        var inputRange = this.inputRange;

        if (this.selectionType === typeConst.ROW) {
            columnIndex = this.columnModel.getVisibleColumns().length - 1;
        } else if (this.selectionType === typeConst.COLUMN) {
            rowIndex = this.dataModel.length - 1;
        }

        inputRange.row[1] = rowIndex;
        inputRange.column[1] = columnIndex;
    },

    /**
     * Extend column selection
     * @param {undefined|Array} columnIndexes - Column indexes
     * @param {number} pageX - Mouse position X
     * @param {number} pageY - Mouse positino Y
     * @private
     */
    _extendColumnSelection: function(columnIndexes, pageX, pageY) {
        var minimumColumnRange = this.minimumColumnRange;
        var index = this.coordConverterModel.getIndexFromMousePosition(pageX, pageY);
        var range = {
            row: [0, this.dataModel.length - 1],
            column: []
        };
        var minMax;

        if (!columnIndexes || !columnIndexes.length) {
            columnIndexes = [index.column];
        }

        this._setScrolling(pageX, pageY);
        if (minimumColumnRange) {
            minMax = util.getMinMax(columnIndexes.concat(minimumColumnRange));
        } else {
            columnIndexes.push(this.inputRange.column[0]);
            minMax = util.getMinMax(columnIndexes);
        }
        range.column.push(minMax.min, minMax.max);
        this._resetRangeAttribute(range);
    },

    /**
     * Set auto scrolling for selection
     * @param {number} pageX - Mouse position X
     * @param {number} pageY - Mouse positino Y
     * @private
     */
    _setScrolling: function(pageX, pageY) {
        var overflow = this.dimensionModel.getOverflowFromMousePosition(pageX, pageY);

        this.stopAutoScroll();
        if (this._isAutoScrollable(overflow.x, overflow.y)) {
            this.intervalIdForAutoScroll = setInterval(
                _.bind(this._adjustScroll, this, overflow.x, overflow.y)
            );
        }
    },

    /**
     * selection 영역 선택을 종료하고 selection 데이터를 초기화한다.
     */
    end: function() {
        this.inputRange = null;
        this.unset('range');
        this.minimumColumnRange = null;
    },

    /**
     * Stops the auto-scroll interval.
     */
    stopAutoScroll: function() {
        if (!_.isNull(this.intervalIdForAutoScroll)) {
            clearInterval(this.intervalIdForAutoScroll);
            this.intervalIdForAutoScroll = null;
        }
    },

    /**
     * Select all data in a row
     * @param {Number} rowIndex - Row idnex
     */
    selectRow: function(rowIndex) {
        if (this.isEnabled()) {
            this.focusModel.focusAt(rowIndex, 0);
            this.start(rowIndex, 0, typeConst.ROW);
            this.update(rowIndex, this.columnModel.getVisibleColumns().length - 1);
        }
    },

    /**
     * Select all data in a column
     * @param {Number} columnIdx - Column index
     */
    selectColumn: function(columnIdx) {
        if (this.isEnabled()) {
            this.focusModel.focusAt(0, columnIdx);
            this.start(0, columnIdx, typeConst.COLUMN);
            this.update(this.dataModel.length - 1, columnIdx);
        }
    },

    /**
     * Selects all data range.
     */
    selectAll: function() {
        if (this.isEnabled()) {
            this.start(0, 0, typeConst.CELL);
            this.update(this.dataModel.length - 1, this.columnModel.getVisibleColumns().length - 1);
        }
    },

    /**
     * Returns the row and column indexes of the starting position.
     * @returns {{row: number, column: number}} Objects containing indexes
     */
    getStartIndex: function() {
        var range = this.get('range');

        return {
            row: range.row[0],
            column: range.column[0]
        };
    },

    /**
     * Returns the row and column indexes of the ending position.
     * @returns {{row: number, column: number}} Objects containing indexes
     */
    getEndIndex: function() {
        var range = this.get('range');

        return {
            row: range.row[1],
            column: range.column[1]
        };
    },

    /**
     * selection 데이터가 존재하는지 확인한다.
     * @returns {boolean} selection 데이터 존재여부
     */
    hasSelection: function() {
        return !!this.get('range');
    },

    /**
     * Returns whether given range is a single cell. (include merged cell)
     * @param {Array.<String>} columnNames - columnNames
     * @param {Array.<Object>} rowList - rowList
     * @returns {Boolean}
     */
    _isSingleCell: function(columnNames, rowList) {
        var isSingleColumn = columnNames.length === 1;
        var isSingleRow = rowList.length === 1;
        var isSingleMergedCell = isSingleColumn && !isSingleRow &&
            (rowList[0].getRowSpanData(columnNames[0]).count === rowList.length);

        return (isSingleColumn && isSingleRow) || isSingleMergedCell;
    },

    /**
     * Returns the string value of all cells in the selection range as a single string.
     * @returns {String}
     */
    getValuesToString: function() {
        var self = this;
        var rowList = this._getRangeRowList();
        var columnNames = this._getRangeColumnNames();
        var rowValues = _.map(rowList, function(row) {
            return _.map(columnNames, function(columnName) {
                return self.getValueToString(row.get('rowKey'), columnName);
            }).join('\t');
        });

        if (this._isSingleCell(columnNames, rowList)) {
            return rowValues[0];
        }

        return rowValues.join('\n');
    },

    /**
     * Returns the string value of a single cell by copy options.
     * @param {Nubmer} rowKey - Row key
     * @param {Number} columnName - Column name
     * @returns {String}
     */
    getValueToString: function(rowKey, columnName) {
        var columnModel = this.columnModel;
        var cellData = this.renderModel.getCellData(rowKey, columnName);
        var copyOptions = columnModel.getCopyOptions(columnName);
        var column = columnModel.getColumnModel(columnName);
        var row = this.dataModel.get(rowKey);
        var value = row.getValueString(columnName);
        var text;

        if (copyOptions.customValue) {
            text = this._getCustomValue(
                copyOptions.customValue,
                value,
                row.toJSON(),
                column
            );
        } else if (copyOptions.useListItemText) {
            text = value;
        } else if (copyOptions.useFormattedValue) {
            text = cellData.formattedValue;
        } else {
            text = value;
        }

        return text;
    },

    /**
     * If the column has a 'copyOptions.customValue' function, exeucute it and returns the result.
     * @param {String} customValue - value to display
     * @param {String} value - value to display
     * @param {Object} rowAttrs - All attributes of the row
     * @param {Object} column - Column info
     * @returns {String}
     * @private
     */
    _getCustomValue: function(customValue, value, rowAttrs, column) {
        var result;

        if (_.isFunction(customValue)) {
            result = customValue(value, rowAttrs, column);
        } else {
            result = customValue;
        }

        return result;
    },

    /**
     * Returns an array of selected row list
     * @returns {Array.<module:model/data/row>}
     * @private
     */
    _getRangeRowList: function() {
        var rowRange = this.get('range').row;

        return this.dataModel.slice(rowRange[0], rowRange[1] + 1);
    },

    /**
     * Returns an array of selected column names
     * @returns {Array.<string>}
     * @private
     */
    _getRangeColumnNames: function() {
        var columnRange = this.get('range').column;
        var columns = this.columnModel.getVisibleColumns().slice(columnRange[0], columnRange[1] + 1);

        return _.pluck(columns, 'name');
    },

    /**
     * 마우스 드래그로 selection 선택 시 auto scroll 조건에 해당하는지 반환한다.
     * @param {Number} overflowX    가로축 기준 영역 overflow 값
     * @param {Number} overflowY    세로축 기준 영역 overflow 값
     * @returns {boolean} overflow 되었는지 여부
     * @private
     */
    _isAutoScrollable: function(overflowX, overflowY) {
        return !(overflowX === 0 && overflowY === 0);
    },

    /**
     * Adjusts scrollTop and scrollLeft value.
     * @param {Number} overflowX    가로축 기준 영역 overflow 값
     * @param {Number} overflowY    세로축 기준 영역 overflow 값
     * @private
     */
    _adjustScroll: function(overflowX, overflowY) {
        var renderModel = this.renderModel;

        if (overflowX) {
            this._adjustScrollLeft(overflowX, renderModel.get('scrollLeft'), renderModel.get('maxScrollLeft'));
        }
        if (overflowY) {
            this._adjustScrollTop(overflowY, renderModel.get('scrollTop'), renderModel.get('maxScrollTop'));
        }
    },

    /**
     * Adjusts scrollLeft value.
     * @param  {number} overflowX - 1 | 0 | -1
     * @param  {number} scrollLeft - Current scrollLeft value
     * @param  {number} maxScrollLeft - Max scrollLeft value
     * @private
     */
    _adjustScrollLeft: function(overflowX, scrollLeft, maxScrollLeft) {
        var adjusted = scrollLeft;
        var pixelScale = this.scrollPixelScale;

        if (overflowX < 0) {
            adjusted = Math.max(0, scrollLeft - pixelScale);
        } else if (overflowX > 0) {
            adjusted = Math.min(maxScrollLeft, scrollLeft + pixelScale);
        }
        this.renderModel.set('scrollLeft', adjusted);
    },

    /**
     * Adjusts scrollTop value.
     * @param  {number} overflowY - 1 | 0 | -1
     * @param  {number} scrollTop - Current scrollTop value
     * @param  {number} maxScrollTop - Max scrollTop value
     * @private
     */
    _adjustScrollTop: function(overflowY, scrollTop, maxScrollTop) {
        var adjusted = scrollTop;
        var pixelScale = this.scrollPixelScale;

        if (overflowY < 0) {
            adjusted = Math.max(0, scrollTop - pixelScale);
        } else if (overflowY > 0) {
            adjusted = Math.min(maxScrollTop, scrollTop + pixelScale);
        }
        this.renderModel.set('scrollTop', adjusted);
    },

    /**
     * Expands the 'this.inputRange' if rowspan data exists, and resets the 'range' attributes to the value.
     * @param {{column: number[], row: number[]}} [inputRange] - Input range. Default is this.inputRange
     * @private
     */
    _resetRangeAttribute: function(inputRange) { // eslint-disable-line complexity
        var dataModel = this.dataModel;
        var hasSpannedRange, spannedRange, tmpRowRange;

        inputRange = inputRange || this.inputRange;
        if (!inputRange) {
            this.set('range', null);

            return;
        }

        spannedRange = {
            row: _.sortBy(inputRange.row),
            column: _.sortBy(inputRange.column)
        };

        if (dataModel.isRowSpanEnable() && this.selectionType === typeConst.CELL) {
            do {
                tmpRowRange = _.assign([], spannedRange.row);
                spannedRange = this._getRowSpannedIndex(spannedRange);

                hasSpannedRange = (
                    spannedRange.row[0] !== tmpRowRange[0] ||
                    spannedRange.row[1] !== tmpRowRange[1]
                );
            } while (hasSpannedRange);
            this._setRangeMinMax(spannedRange.row, spannedRange.column);
        }

        this.set('range', spannedRange);
    },

    /**
     * Trigger 'selection' event
     * @private
     */
    _triggerSelectionEvent: function() {
        var range = this.get('range');
        var dataModel = this.dataModel;
        var columnModel = this.columnModel;
        var rowRange, columnRange, gridEvent;
        var startRow, endRow, startColumn, endColumn;

        if (!range) {
            return;
        }

        rowRange = range.row;
        columnRange = range.column;

        startRow = dataModel.getRowDataAt(rowRange[0]);
        startColumn = columnModel.at(columnRange[0]);
        endRow = dataModel.getRowDataAt(rowRange[1]);
        endColumn = columnModel.at(columnRange[1]);

        if (!startRow || !endRow || !startColumn || !endColumn) {
            return;
        }

        gridEvent = new GridEvent(null, {
            range: {
                start: [startRow.rowKey, startColumn.name],
                end: [endRow.rowKey, endColumn.name]
            }
        });

        /**
         * Occurs when selecting cells
         * @event Grid#selection
         * @type {module:event/gridEvent}
         * @property {Object} range - Range of selection
         * @property {Array} range.start - Info of start cell (ex: [rowKey, columName])
         * @property {Array} range.end - Info of end cell (ex: [rowKey, columnName])
         * @property {Grid} instance - Current grid instance
         */
        this.trigger('selection', gridEvent);
    },

    /**
     * Set min, max value of range(row, column)
     * @param {Array} rowRange - Row range
     * @param {Array} columnRange - Column range
     * @private
     */
    _setRangeMinMax: function(rowRange, columnRange) {
        if (rowRange) {
            rowRange[0] = Math.max(0, rowRange[0]);
            rowRange[1] = Math.min(this.dataModel.length - 1, rowRange[1]);
        }

        if (columnRange) {
            columnRange[0] = Math.max(0, columnRange[0]);
            columnRange[1] = Math.min(this.columnModel.getVisibleColumns().length - 1, columnRange[1]);
        }
    },

    /**
     * row start index 기준으로 rowspan 을 확인하며 startRangeList 업데이트 하는 함수
     * @param {object} param - parameters
     * @private
     */
    _concatRowSpanIndexFromStart: function(param) {
        var startIndex = param.startIndex;
        var endIndex = param.endIndex;
        var columnName = param.columnName;
        var rowSpanData = param.startRowSpanDataMap && param.startRowSpanDataMap[columnName];
        var startIndexList = param.startIndexList;
        var endIndexList = param.endIndexList;
        var spannedIndex;

        if (!rowSpanData) {
            return;
        }

        if (!rowSpanData.isMainRow) {
            spannedIndex = startIndex + rowSpanData.count;
            startIndexList.push(spannedIndex);
        } else {
            spannedIndex = startIndex + rowSpanData.count - 1;
            if (spannedIndex > endIndex) {
                endIndexList.push(spannedIndex);
            }
        }
    },

    /**
     * row end index 기준으로 rowspan 을 확인하며 endRangeList 를 업데이트 하는 함수
     * @param {object} param - parameters
     * @private
     */
    _concatRowSpanIndexFromEnd: function(param) {
        var endIndex = param.endIndex;
        var columnName = param.columnName;
        var rowSpanData = param.endRowSpanDataMap && param.endRowSpanDataMap[columnName];
        var endIndexList = param.endIndexList;
        var dataModel = param.dataModel;
        var spannedIndex, tmpRowSpanData;

        if (!rowSpanData) {
            return;
        }

        if (!rowSpanData.isMainRow) {
            spannedIndex = endIndex + rowSpanData.count;
            tmpRowSpanData = dataModel.at(spannedIndex).getRowSpanData(columnName);
            spannedIndex += tmpRowSpanData.count - 1;
            if (spannedIndex > endIndex) {
                endIndexList.push(spannedIndex);
            }
        } else {
            spannedIndex = endIndex + rowSpanData.count - 1;
            endIndexList.push(spannedIndex);
        }
    },

    /**
     * rowSpan 된 Index range 를 반환한다.
     * @param {{row: Array, column: Array}} spannedRange 인덱스 정보
     * @returns {{row: Array, column: Array}} New Range
     * @private
     */
    _getRowSpannedIndex: function(spannedRange) {
        var columns = this.columnModel.getVisibleColumns()
            .slice(spannedRange.column[0], spannedRange.column[1] + 1);
        var dataModel = this.dataModel;
        var startIndexList = [spannedRange.row[0]];
        var endIndexList = [spannedRange.row[1]];
        var startRow = dataModel.at(spannedRange.row[0]);
        var endRow = dataModel.at(spannedRange.row[1]);
        var newSpannedRange = $.extend({}, spannedRange);
        var startRowSpanDataMap, endRowSpanDataMap, param;

        if (!startRow || !endRow) {
            return newSpannedRange;
        }

        startRowSpanDataMap = dataModel.at(spannedRange.row[0]).getRowSpanData();
        endRowSpanDataMap = dataModel.at(spannedRange.row[1]).getRowSpanData();

        // 모든 열을 순회하며 각 열마다 설정된 rowSpan 정보에 따라 인덱스를 업데이트 한다.
        _.each(columns, function(columnModel) {
            param = {
                columnName: columnModel.name,
                startIndex: spannedRange.row[0],
                endIndex: spannedRange.row[1],
                endRowSpanDataMap: endRowSpanDataMap,
                startRowSpanDataMap: startRowSpanDataMap,
                startIndexList: startIndexList,
                endIndexList: endIndexList,
                dataModel: dataModel
            };
            this._concatRowSpanIndexFromStart(param);
            this._concatRowSpanIndexFromEnd(param);
        }, this);

        newSpannedRange.row = [Math.min.apply(null, startIndexList), Math.max.apply(null, endIndexList)];

        return newSpannedRange;
    }
});

module.exports = Selection;
