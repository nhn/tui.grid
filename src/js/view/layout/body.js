/**
 * @fileoverview Class for the body layout
 * @author NHN Ent. FE Development Team
 */
'use strict';

var View = require('../../base/view');

var HTML_CONTAINER = '<div class="body_container"></div>',

    // Minimum time (ms) to detect if an alert or confirm dialog has been displayed.
    MIN_INTERVAL_FOR_PAUSED = 200,

    // Minimum distance (pixel) to detect if user wants to drag when moving mouse with button pressed.
    MIN_DISATNCE_FOR_DRAG = 10;

/**
 * Class for the body layout
 * @module view/layout/body
 * @extends module:base/view
 */
var Body = View.extend(/**@lends module:view/layout/body.prototype */{
    /**
     * @constructs
     * @param {Object} options - Options
     * @param {String} [options.whichSide='R'] L or R (which side)
     */
    initialize: function(options) {
        View.prototype.initialize.call(this);

        this.setOwnProperties({
            dimensionModel: options.dimensionModel,
            dataModel: options.dataModel,
            columnModel: options.columnModel,
            renderModel: options.renderModel,
            selectionModel: options.selectionModel,
            focusModel: options.focusModel,
            viewFactory: options.viewFactory,

            // DIV for setting rendering position of entire child-nodes of $el.
            $container: null,
            whichSide: options && options.whichSide || 'R'
        });

        this.listenTo(this.dimensionModel, 'change:bodyHeight', this._onBodyHeightChange)
            .listenTo(this.dataModel, 'add remove reset', this._resetContainerHeight)
            .listenTo(this.renderModel, 'change:scrollTop', this._onScrollTopChange)
            .listenTo(this.renderModel, 'change:scrollLeft', this._onScrollLeftChange);
    },

    tagName: 'div',

    className: 'data',

    events: {
        'scroll': '_onScroll',
        'mousedown .body_container': '_onMouseDown',
        'blur input, select': '_onBlurInput'
    },

    /**
     * Event handler for 'change:bodyHeight' event on module:model/dimension
     * @param {Object} model - changed model
     * @param {Number} value - new height value
     * @private
     */
    _onBodyHeightChange: function(model, value) {
        this.$el.css('height', value + 'px');
    },

    /**
     * Resets the height of a container DIV
     */
    _resetContainerHeight: function() {
        this.$container.css({
            height: this.dimensionModel.get('totalRowHeight')
        });
    },

    /**
     * Event handler for 'scroll' event on DOM
     * @param {UIEvent} event - event object
     * @private
     */
    _onScroll: function(event) {
        var attrs = {
            scrollTop: event.target.scrollTop
        };

        if (this.whichSide === 'R') {
            attrs.scrollLeft = event.target.scrollLeft;
        }
        this.renderModel.set(attrs);
    },

    /**
     * Event handler for 'change:scrollLeft' event on module:model/renderer
     * @param {Object} model - changed model
     * @param {Number} value - new scrollLeft value
     * @private
     */
    _onScrollLeftChange: function(model, value) {
        if (this.whichSide === 'R') {
            this.el.scrollLeft = value;
        }
    },

    /**
     * Event handler for 'chage:scrollTop' event on module:model/renderer
     * @param {Object} model - changed model instance
     * @param {Number} value - new scrollTop value
     * @private
     */
    _onScrollTopChange: function(model, value) {
        this.el.scrollTop = value;
    },

    /**
     * Returns the name of the visible data columns at given index
     * @param  {Number} columnIndex - Column index
     * @returns {String} - Column name
     * @private
     */
    _getColumnNameByVisibleIndex: function(columnIndex) {
        var columns = this.columnModel.getVisibleColumnModelList(null, false);
        return columns[columnIndex].columnName;
    },

    /**
     * Mousedown event handler
     * @param {MouseEvent} event - Mousedown event
     * @private
     */
    _onMouseDown: function(event) {
        var columnModel = this.columnModel,
            $target = $(event.target),
            isInput = $target.is('input'),
            $td = $target.closest('td'),
            $tr = $target.closest('tr'),
            columnName = $td.attr('columnName'),
            rowKey = $tr.attr('key'),
            startAction = true,
            inputData = _.pick(event, 'pageX', 'pageY', 'shiftKey'),
            indexData;

        if (!$td.length) { // selection layer
            indexData = this.dimensionModel.getIndexFromMousePosition(event.pageX, event.pageY);
            columnName = this._getColumnNameByVisibleIndex(indexData.column);
        } else if (rowKey && columnName) { // valid cell
            indexData = {
                column: columnModel.indexOfColumnName(columnName, true),
                row: this.dataModel.indexOfRowKey(rowKey)
            };
            if (this.columnModel.get('selectType') === 'radio') {
                this.dataModel.check(indexData.row);
            }
        } else { // dummy cell
            startAction = false;
        }

        if (startAction) {
            this._controlStartAction(inputData, indexData, columnName, isInput);
        }
    },

    /**
     * Event handler for blur event on input element.
     * @private
     */
    _onBlurInput: function() {
        var focusModel = this.focusModel;
        _.defer(function() {
            focusModel.refreshState();
        });
    },

    /**
     * Control selection action when started
     * @param {Object} inputData - Mouse position X
     * @param   {number} inputData.pageY - Mouse position Y
     * @param   {number} inputData.pageY - Mouse position Y
     * @param   {boolean} inputData.shiftKey - Whether the shift-key is pressed.
     * @param {{column:number, row:number}} indexData - Index map object
     * @param {String} columnName - column name
     * @param {boolean} isInput - Whether the target is input element.
     * @private
     */
    _controlStartAction: function(inputData, indexData, columnName, isInput) {
        var columnModel = this.columnModel,
            selectionModel = this.selectionModel,
            columnIndex = indexData.column,
            rowIndex = indexData.row,
            startDrag = true;

        if (!selectionModel.isEnabled()) {
            return;
        }

        if (!columnModel.isMetaColumn(columnName)) {
            selectionModel.setState('cell');
            if (inputData.shiftKey && !isInput) {
                selectionModel.update(rowIndex, columnIndex);
            } else {
                startDrag = this._doFocusAtAndCheckDraggable(rowIndex, columnIndex);
                selectionModel.end();
            }
        } else if (columnName === '_number') {
            this._updateSelectionByRow(rowIndex, inputData.shiftKey);
        } else {
            startDrag = false;
        }

        if (!isInput && startDrag) {
            this._attachDragEvents(inputData.pageX, inputData.pageY);
        }
    },

    /**
     * Update selection model by row unit.
     * @param {number} rowIndex - row index
     * @param {boolean} shiftKey - true if the shift key is pressed
     * @private
     */
    _updateSelectionByRow: function(rowIndex, shiftKey) {
        if (shiftKey) {
            this.selectionModel.update(rowIndex, 0, 'row');
        } else {
            this.selectionModel.selectRow(rowIndex);
        }
    },

    /**
     * Executes the `focusModel.focusAt()` and returns the boolean value which indicates whether to start drag.
     * @param {number} rowIndex - row index
     * @param {number} columnIndex - column index
     * @returns {boolean}
     * @private
     */
    _doFocusAtAndCheckDraggable: function(rowIndex, columnIndex) {
        var startTime = (new Date()).getTime(),
            focusSuccessed = this.focusModel.focusAt(rowIndex, columnIndex),
            endTime = (new Date()).getTime(),
            hasPaused = (endTime - startTime) > MIN_INTERVAL_FOR_PAUSED;

        if (!focusSuccessed || hasPaused) {
            return false;
        }
        return true;
    },

    /**
     * Attach event handlers for drag event.
     * @param {Number} pageX - initial pageX value
     * @param {Number} pageY - initial pageY value
     */
    _attachDragEvents: function(pageX, pageY) {
        this.setOwnProperties({
            mouseDownX: pageX,
            mouseDownY: pageY
        });
        $(document)
            .on('mousemove', $.proxy(this._onMouseMove, this))
            .on('mouseup', $.proxy(this._detachDragEvents, this))
            .on('selectstart', $.proxy(this._onSelectStart, this));
    },

    /**
     * Detach all handlers which are used for drag event.
     */
    _detachDragEvents: function() {
        this.selectionModel.stopAutoScroll();
        $(document)
            .off('mousemove', this._onMouseMove)
            .off('mouseup', this._detachDragEvents)
            .off('selectstart', this._onSelectStart);
    },

    /**
     * Event handler for 'mousemove' event during drag
     * @param {MouseEvent} event - MouseEvent object
     * @private
     */
    _onMouseMove: function(event) {
        var selectionModel = this.selectionModel,
            pageX = event.pageX,
            pageY = event.pageY,
            dragged = this._getMouseMoveDistance(pageX, pageY) > MIN_DISATNCE_FOR_DRAG;

        if (selectionModel.hasSelection() || dragged) {
            selectionModel.updateByMousePosition(pageX, pageY);
        }
    },

    /**
     * Returns the distance between 'mousedown' position and specified position.
     * @param {number} pageX - X position relative to the document
     * @param {number} pageY - Y position relative to the document
     * @returns {number} Distance
     * @private
     */
    _getMouseMoveDistance: function(pageX, pageY) {
        var dx = Math.abs(this.mouseDownX - pageX),
            dy = Math.abs(this.mouseDownY - pageY);

        return Math.round(Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2)));
    },

    /**
     * Event handler to prevent default action on `selectstart` event.
     * @param {Event} event - event object
     * @returns {boolean} false
     * @private
     */
    _onSelectStart: function(event) {
        event.preventDefault();
        return false;
    },

    /**
     * renders
     * @returns {View.Layout.Body}   자기 자신
     */
    render: function() {
        var whichSide = this.whichSide;

        this._destroyChildren();

        if (!this.dimensionModel.get('scrollX')) {
            this.$el.css('overflow-x', 'hidden');
        }
        if (!this.dimensionModel.get('scrollY') && whichSide === 'R') {
            this.$el.css('overflow-y', 'hidden');
        }
        this.$el.css('height', this.dimensionModel.get('bodyHeight'));

        this.$container = $(HTML_CONTAINER);
        this.$el.append(this.$container);

        this._addChildren([
            this.viewFactory.createBodyTable(whichSide),
            this.viewFactory.createSelectionLayer(whichSide)
        ]);
        this.$container.append(this._renderChildren());
        this._resetContainerHeight();
        return this;
    }
});

module.exports = Body;
