/**
 * @fileoverview View class that conaints a top element of the DOM structure of the grid.
 * @author NHN Ent. FE Development Team
 */
 'use strict';

var View = require('../base/view');

/**
 * Container View
 * @module view/container
 */
var Container = View.extend(/**@lends module:view/container.prototype */{
    /**
     * @constructs
     * @extends module:base/view
     * @param {Object} options
     */
    initialize: function(options) {
        this.singleClickEdit = options.singleClickEdit;
        this.dimensionModel = options.dimensionModel;
        this.focusModel = options.focusModel;
        this.dataModel = options.dataModel;
        this.viewFactory = options.viewFactory;

        this._createChildViews();

        this.listenTo(this.dimensionModel, 'change:bodyHeight', this._refreshHeight);
        this.listenTo(this.dimensionModel, 'setSize', this._onSetSize);
        $(window).on('resize.grid', $.proxy(this._onResizeWindow, this));

        this.__$el = this.$el.clone();
    },

    events: {
        'click': '_onClick',
        'dblclick': '_onDblClick',
        'mousedown': '_onMouseDown',
        'mouseover': '_onMouseOver',
        'mouseout': '_onMouseOut',

        // for preventing drag
        'selectstart': '_preventDrag',
        'dragstart': '_preventDrag'
    },

    /**
     * 내부에서 사용할 view 인스턴스들을 초기화한다.
     * @private
     */
    _createChildViews: function() {
        this.children = {};

        this.children.lside = this.viewFactory.createFrame('L');
        this.children.rside = this.viewFactory.createFrame('R');
        this.children.toolbar = this.viewFactory.createToolbar();
        this.children.stateLayer = this.viewFactory.createStateLayer();
        this.children.clipboard = this.viewFactory.createClipboard();
    },

    /**
     * Event handler for resize event on window.
     */
    _onResizeWindow: function() {
        this.dimensionModel.refreshLayout();
    },

    /**
     * drag 이벤트 발생시 이벤트 핸들러
     * @returns {boolean} false
     * @private
     */
    _preventDrag: function() {
        return false;
    },

    /**
     * Event handler for 'setSize' event on Dimension
     */
    _onSetSize: function() {
        this.$el.width(this.dimensionModel.get('width'));
    },

    /**
     * click 이벤트 핸들러
     * @param {MouseEvent} mouseEvent 이벤트 객체
     * @private
     */
    _onClick: function(mouseEvent) {
        var eventData = this.createEventData(mouseEvent),
            $target = $(mouseEvent.target),
            cellInfo;

        this.trigger('click', eventData);
        if (eventData.isStopped()) {
            return;
        }
        if (this._isCellElement($target, true)) {
            cellInfo = this._getCellInfoFromElement($target.closest('td'));
            if (this.singleClickEdit && !$target.is('input')) {
                this.focusModel.focusIn(cellInfo.rowKey, cellInfo.columnName);
            }
            this._triggerCellMouseEvent('clickCell', eventData, cellInfo);
        }
    },

    /**
     * doubleClick 이벤트 핸들러
     * @param {MouseEvent} mouseEvent 이벤트 객체
     * @private
     */
    _onDblClick: function(mouseEvent) {
        var eventData = this.createEventData(mouseEvent),
            $target = $(mouseEvent.target);

        this.trigger('dblclick', eventData);
        if (eventData.isStopped()) {
            return;
        }
        if (this._isCellElement($target, true)) {
            this._triggerCellMouseEvent('dblclickCell', eventData, $target.closest('td'));
        }
    },

    /**
     * mouseover 이벤트 발생시 실행될 핸들러
     * @private
     * @param {MouseEvent} mouseEvent 마우스 이벤트 객체
     */
    _onMouseOver: function(mouseEvent) {
        var $target = $(mouseEvent.target),
            eventData;

        if (this._isCellElement($target)) {
            eventData = this.createEventData(mouseEvent);
            this._triggerCellMouseEvent('mouseoverCell', eventData, $target);
        }
    },

    /**
     * mouseout 이벤트 발생시 실행될 핸들러
     * @private
     * @param {MouseEvent} mouseEvent 마우스 이벤트 객체
     */
    _onMouseOut: function(mouseEvent) {
        var $target = $(mouseEvent.target),
            eventData;

        if (this._isCellElement($target)) {
            eventData = this.createEventData(mouseEvent);
            this._triggerCellMouseEvent('mouseoutCell', eventData, $target);
        }
    },

    /**
     * 셀과 관련된 커스텀 마우스 이벤트를 발생시킨다.
     * @private
     * @param {string} eventName 이벤트명
     * @param {MouseEvent} eventData 커스터마이징 된 마우스 이벤트 객체
     * @param {(jQuery|object)} cell 이벤트가 발생한 cell (jquery 객체이거나 rowKey, columnName, rowData를 갖는 plain 객체)
     */
    _triggerCellMouseEvent: function(eventName, eventData, cell) {
        var cellInfo = cell;
        if (cell instanceof $) {
            cellInfo = this._getCellInfoFromElement(cell);
        }
        _.extend(eventData, cellInfo);
        this.trigger(eventName, eventData);
    },

    /**
     * 해당 HTML요소가 셀인지 여부를 반환한다.
     * @private
     * @param {jQuery} $target 검사할 HTML요소의 jQuery 객체
     * @param {boolean} isIncludeChild true이면 셀의 자식요소까지 포함한다.
     * @return {boolean} 셀이면 true, 아니면 false
     */
    _isCellElement: function($target, isIncludeChild) {
        var $cell = isIncludeChild ? $target.closest('td') : $target;

        return !!($cell.is('td') && $cell.attr('columnname') && $cell.parent().attr('key'));
    },

    /**
     * HTML요소에서 셀의 rowKey와 columnName값을 찾아서 rowData와 함께 객체로 반환한다.
     * @private
     * @param {jQuery} $cell TD요소의 jquery 객체
     * @return {{rowKey: string, rowData: Data.Row, columnName: string}} 셀 관련 정보를 담은 객체
     */
    _getCellInfoFromElement: function($cell) {
        var rowKey = $cell.parent().attr('key'),
            columnName = $cell.attr('columnname');

        return {
            rowKey: rowKey,
            columnName: columnName,
            rowData: this.dataModel.getRowData(rowKey)
        };
    },

    /**
     * mousedown 이벤트 핸들러
     * @param {event} mouseDownEvent 이벤트 객체
     * @private
     */
    _onMouseDown: function(mouseDownEvent) {
        var $target = $(mouseDownEvent.target),
            eventData = this.createEventData(mouseDownEvent);

        this.trigger('mousedown', eventData);
        if (eventData.isStopped()) {
            return;
        }
        if (!$target.is('input, a, button, select')) {
            mouseDownEvent.preventDefault();
            this.focusModel.focusClipboard();
        }
    },

    /**
     * rendering 이후, 또는 bodyHeight 가 변경되었을 때, header, toolbar 의 높이를 포함하여
     * grid 의 전체 너비를 설정한다.
     * @private
     */
    _refreshHeight: function() {
        this.$el.height(this.dimensionModel.getHeight());
    },

    /**
     * Render
     */
    render: function() {
        var children = this.children,
            elements;

        elements = [
            $('<div>').addClass('left_line'),
            $('<div>').addClass('right_line'),
            children.stateLayer.render().el,
            children.lside.render().el,
            children.rside.render().el,
            children.toolbar.render().el,
            children.clipboard.render().el
        ];
        this.$el.addClass('grid_wrapper uio_grid')
            .attr('instanceId', this.gridId)
            .append(elements);

        this._refreshHeight();
        this.trigger('rendered');
    },

    /**
     * 소멸자
     */
    destroy: function() {
        this.stopListening();
        $(window).off('resize.grid');
        this.destroyChildren();

        this.$el.replaceWith(this.__$el);
        this.$el = this.__$el = null;
    }
});

module.exports = Container;
