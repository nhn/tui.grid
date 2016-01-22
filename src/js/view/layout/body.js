/**
 * @fileoverview Class for the body layout
 * @author NHN Ent. FE Development Team
 */
'use strict';

var View = require('../../base/view');

var HTML_CONTAINER = '<div class="body_container"></div>';

/**
 * Class for the body layout
 * @module view/layout/body
 */
var Body = View.extend(/**@lends module:view/layout/body.prototype */{
    /**
     * @constructs
     * @extends module:base/view
     * @param {Object} options - Options
     *      @param {String} [options.whichSide='R'] L or R (which side)
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
     * DimensionModel 의 body Height 가 변경된 경우 element 의 height 를 조정한다.
     * @param {Object} model 변경이 일어난 model 인스턴스
     * @param {Number} value bodyHeight 값
     * @private
     */
    _onBodyHeightChange: function(model, value) {
        this.$el.css('height', value + 'px');
    },

    /**
     * Resets the height of a container div.
     */
    _resetContainerHeight: function() {
        this.$container.css({
            height: this.dimensionModel.get('totalRowHeight')
        });
    },

    /**
     * 스크롤 이벤트 핸들러
     * @param {jQuery.Event} scrollEvent   스크롤 이벤트
     * @private
     */
    _onScroll: function(scrollEvent) {
        var attrs = {
            scrollTop: scrollEvent.target.scrollTop
        };

        if (this.whichSide === 'R') {
            attrs.scrollLeft = scrollEvent.target.scrollLeft;
        }
        this.renderModel.set(attrs);
    },

    /**
     * Render model 의 Scroll left 변경 이벤트 핸들러
     * @param {object} model 변경이 일어난 모델 인스턴스
     * @param {Number} value scrollLeft 값
     * @private
     */
    _onScrollLeftChange: function(model, value) {
        if (this.whichSide === 'R') {
            this.el.scrollLeft = value;
        }
    },

    /**
     * Render model 의 Scroll top 변경 이벤트 핸들러
     * @param {object} model 변경이 일어난 모델 인스턴스
     * @param {Number} value scrollTop값
     * @private
     */
    _onScrollTopChange: function(model, value) {
        this.el.scrollTop = value;
    },

    /**
     * Returns the name of the visible data columns at given index
     * @param  {Number} columnIndex - Column index
     * @return {String} - Column name
     */
    _getColumnNameByVisibleIndex: function(columnIndex) {
        var columns = this.columnModel.getVisibleColumnModelList(null, false);
        return columns[columnIndex].columnName;
    },

    /**
     * Mousedown event handler
     * @param {jQuery.Event} event
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
            indexObj;

        if (!$td.length) { // selection layer
            indexObj = this.dimensionModel.getIndexFromMousePosition(event.pageX, event.pageY);
            columnName = this._getColumnNameByVisibleIndex(indexObj.column);
        } else if (rowKey && columnName) { // valid cell
            indexObj = {
                column: columnModel.indexOfColumnName(columnName, true),
                row: this.dataModel.indexOfRowKey(rowKey)
            };
            if (this.columnModel.get('selectType') === 'radio') {
                this.dataModel.check(indexObj.row);
            }
        } else { // dummy cell
            startAction = false;
        }

        if (startAction) {
            this._controlStartAction(event.pageX, event.pageY, event.shiftKey, indexObj, columnName, isInput);
        }
    },

    /**
     * Event handler for blur event on input element.
     * @private
     */
    _onBlurInput: function(event) {
        var focusModel = this.focusModel;
        _.defer(function() {
            focusModel.refreshState();
        });
    },

    /**
     * Control selection action when started
     * @param {number} pageX - Mouse position X
     * @param {number} pageY - Mouse position Y
     * @param {boolean} shiftKey - Whether the shift-key is pressed.
     * @param {{columnName:string, column:number, row:number}} indexObj
     * @param {boolean} isInput - Whether the target is input element.
     * @private
     */
    _controlStartAction: function(pageX, pageY, shiftKey, indexObj, columnName, isInput) {
        var columnModel = this.columnModel,
            selectionModel = this.selectionModel,
            columnIndex = indexObj.column,
            rowIndex = indexObj.row;

        if (!selectionModel.isEnabled()) {
            return;
        }

        if (!isInput) {
            this._attachDragEvents(pageX, pageY);
        }
        if (!columnModel.isMetaColumn(columnName)) {
            selectionModel.setState('cell');
            if (shiftKey && !isInput) {
                selectionModel.update(rowIndex, columnIndex);
            } else {
                this.focusModel.focusAt(rowIndex, columnIndex);
                selectionModel.end();
            }
        } else if (columnName === '_number') {
            if (shiftKey) {
                selectionModel.update(rowIndex, 0, 'row');
            } else {
                selectionModel.selectRow(rowIndex);
            }
        } else {
            this._detachDragEvents();
        }
    },

    /**
     * 마우스 down 이벤트가 발생하여 selection 을 시작할 때, selection 영역을 계산하기 위해 document 에 이벤트 핸들러를 추가한다.
     * @param {Number} pageX    초기값으로 설정할 마우스 x좌표
     * @param {Number} pageY    초기값으로 설정할 마우스 y 좌표
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
     * 마우스 up 이벤트가 발생하여 selection 이 끝날 때, document 에 달린 이벤트 핸들러를 제거한다.
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
     * @param {jQuery.Event} event - MouseEvent object
     */
    _onMouseMove: function(event) {
        var selectionModel = this.selectionModel,
            pageX = event.pageX,
            pageY = event.pageY,
            isMoved = this._getMouseMoveDistance(pageX, pageY) > 10;

        if (selectionModel.hasSelection() || isMoved) {
            selectionModel.updateByMousePosition(pageX, pageY);
        }
    },

    /**
     * Returns the distance between 'mousedown' position and specified position.
     * @param {number} pageX - X position relative to the document
     * @param {number} pageY - Y position relative to the document
     * @return {number} Distance
     * @private
     */
    _getMouseMoveDistance: function(pageX, pageY) {
        var dx = Math.abs(this.mouseDownX - pageX),
            dy = Math.abs(this.mouseDownY - pageY);

        return Math.round(Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2)));
    },

    /**
     * select start 이벤트를 방지한다.
     * @param {jQuery.Event} event selectStart 이벤트 객체
     * @returns {boolean} false
     * @private
     */
    _onSelectStart: function(event) {
        event.preventDefault();
        return false;
    },

    /**
     * rendering 한다.
     * @return {View.Layout.Body}   자기 자신
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
