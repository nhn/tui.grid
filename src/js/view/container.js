/**
 * @fileoverview View class that conaints a top element of the DOM structure of the grid.
 * @author NHN Ent. FE Development Team
 */
'use strict';

var _ = require('underscore');

var View = require('../base/view');
var GridEvent = require('../event/gridEvent');
var attrNameConst = require('../common/constMap').attrName;
var classNameConst = require('../common/classNameConst');

/**
 * Container View
 * @module view/container
 * @extends module:base/view
 * @param {Object} options - Options
 * @ignore
 */
var Container = View.extend(/**@lends module:view/container.prototype */{
    initialize: function(options) {
        View.prototype.initialize.call(this);

        this.gridId = options.gridId;
        this.dimensionModel = options.dimensionModel;
        this.dataModel = options.dataModel;
        this.viewFactory = options.viewFactory;
        this.domEventBus = options.domEventBus;

        this._createChildViews();

        this.listenTo(this.dimensionModel, 'setWidth', this._onSetWidth);
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
        var factory = this.viewFactory;

        this._addChildren([
            factory.createToolbar(),
            factory.createContentArea(),
            factory.createHeightResizeHandle(),
            factory.createPagination(),
            factory.createStateLayer(),
            factory.createEditingLayer(),
            factory.createDatePickerLayer(),
            factory.createClipboard()
        ]);
    },

    /**
     * Event handler for resize event on window.
     * @private
     */
    _onResizeWindow: function() {
        this.domEventBus.trigger('windowResize');
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
     * @private
     */
    _onSetWidth: function() {
        this.$el.width(this.dimensionModel.get('width'));
    },

    /**
     * Event handler for click event
     * @param {MouseEvent} ev - Mouse event
     * @private
     */
    _onClick: function(ev) {
        var eventData = new GridEvent(ev);
        var $target = $(ev.target);
        var cellInfo;

        /**
         * Occurs when a mouse button is clicked on the Grid.
         * The properties of the event object is the same as the native MouseEvent.
         * @api
         * @event tui.Grid#click
         * @type {module:event/gridEvent}
         */
        this.domEventBus.trigger('click', eventData);
        if (eventData.isStopped()) {
            return;
        }

        if (this._isCellElement($target, true)) {
            cellInfo = this._getCellInfoFromElement($target.closest('td'));
            cellInfo.isTargetInput = !$target.is('input, textarea');

            /**
             * Occurs when a mouse button is clicked on a table cell
             * The event object has all properties copied from the native MouseEvent.
             * @api
             * @event tui.Grid#clickCell
             * @type {module:event/gridEvent}
             * @property {number} rowKey - rowKey of the target cell
             * @property {string} columnName - columnName of the target cell
             * @property {Object} rowData - row data
             * @property {boolean} isTargetInput - whether the target is the input(or textarea) element
             */
            this._triggerCellMouseEvent('clickCell', eventData, cellInfo);
        }
    },

    /**
     * doubleClick 이벤트 핸들러
     * @param {MouseEvent} mouseEvent 이벤트 객체
     * @private
     */
    _onDblClick: function(mouseEvent) {
        var eventData = new GridEvent(mouseEvent);
        var $target = $(mouseEvent.target);

        /**
         * Occurs when a mouse button is double clicked on the Grid.
         * The event object has all properties copied from the native MouseEvent.
         * @api
         * @event tui.Grid#dblclick
         * @type {module:event/gridEvent}
         */
        this.domEventBus.trigger('dblclick', eventData);
        if (eventData.isStopped()) {
            return;
        }

        if (this._isCellElement($target, true)) {
            /**
             * Occurs when a mouse button is double clicked on a table cell
             * The event object has all properties copied from the native MouseEvent.
             * @api
             * @event tui.Grid#dblclickCell
             * @type {module:event/gridEvent}
             * @property {number} rowKey - rowKey of the target cell
             * @property {string} columnName - columnName of the target cell
             * @property {Object} rowData - row data containing the target cell
             */
            this._triggerCellMouseEvent('dblclickCell', eventData, $target.closest('td'));
            // @todo 2.0.0 에서 제거될 로직
            // if (eventData.rowKey === null && !eventData.isStopped()) {
            //     this.dataModel.append({}, {focus: true});
            // }
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
            eventData = new GridEvent(mouseEvent);
            /**
             * Occurs when a mouse pointer is moved onto a table cell
             * The event object has all properties copied from the native MouseEvent.
             * @api
             * @event tui.Grid#mouseoverCell
             * @type {module:event/gridEvent}
             * @property {number} rowKey - rowKey of the target cell
             * @property {string} columnName - columnName of the target cell
             * @property {Object} rowData - row data containing the target cell
             */
            this._triggerCellMouseEvent('mouseoverCell', eventData, $target);
        }
    },

    /**
     * mouseout 이벤트 발생시 실행될 핸들러
     * @private
     * @param {MouseEvent} mouseEvent 마우스 이벤트 객체
     */
    _onMouseOut: function(mouseEvent) {
        var $target = $(mouseEvent.target);
        var eventData;

        if (this._isCellElement($target)) {
            eventData = new GridEvent(mouseEvent);
            /**
             * Occurs when a mouse pointer is moved off from a table cell
             * The event object has all properties copied from the native MouseEvent.
             * @api
             * @event tui.Grid#mouseoutCell
             * @type {module:event/gridEvent}
             * @property {number} rowKey - rowKey of the target cell
             * @property {string} columnName - columnName of the target cell
             * @property {Object} rowData - row data containing the target cell
             */
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
        this.domEventBus.trigger(eventName, eventData);
    },

    /**
     * 해당 HTML요소가 셀인지 여부를 반환한다.
     * @private
     * @param {jQuery} $target 검사할 HTML요소의 jQuery 객체
     * @param {boolean} isIncludeChild true이면 셀의 자식요소까지 포함한다.
     * @returns {boolean} 셀이면 true, 아니면 false
     */
    _isCellElement: function($target, isIncludeChild) {
        var $cell = isIncludeChild ? $target.closest('td') : $target;

        return !!($cell.is('td') && $cell.attr(attrNameConst.COLUMN_NAME));
    },

    /**
     * HTML요소에서 셀의 rowKey와 columnName값을 찾아서 rowData와 함께 객체로 반환한다.
     * @private
     * @param {jQuery} $cell TD요소의 jquery 객체
     * @returns {{rowKey: string, rowData: Data.Row, columnName: string}} 셀 관련 정보를 담은 객체
     */
    _getCellInfoFromElement: function($cell) {
        var rowKey = Number($cell.attr(attrNameConst.ROW_KEY));
        var columnName = $cell.attr(attrNameConst.COLUMN_NAME);

        if (isNaN(rowKey)) {
            rowKey = null;
        }
        return {
            rowKey: rowKey,
            columnName: columnName,
            rowData: this.dataModel.getRowData(rowKey)
        };
    },

    /**
     * Event handler for 'mousedown' event
     * @param {MouseEvent} mouseEvent - Mouse event
     * @private
     */
    _onMouseDown: function(mouseEvent) {
        var $target = $(mouseEvent.target);
        var eventData = new GridEvent(mouseEvent);
        var shouldFocus = !$target.is('input, a, button, select, textarea');

        /**
         * Occurs when a mouse button is pressed on the Grid.
         * The properties of the event object is the same as the native MouseEvent.
         * @api
         * @event tui.Grid#mousedown
         * @type {module:event/gridEvent}
         */
        this.domEventBus.trigger('mousedown', eventData);

        if (shouldFocus) {
            mouseEvent.preventDefault();

            // fix IE8 bug (cancelling event doesn't prevent focused element from losing foucs)
            $target[0].unselectable = true;

            this.domEventBus.trigger('mousedown:focus', eventData);
        }
    },

    /**
     * Render
     * @returns {module:view/container} this object
     */
    render: function() {
        var childElements = this._renderChildren();

        this.$el.addClass(classNameConst.CONTAINER)
            .attr(attrNameConst.GRID_ID, this.gridId)
            .append(childElements);

        this._triggerChildrenAppended();
        // @todo 2.0.0 에서 제거될 코드
        // this.trigger('rendered');

        return this;
    },

    /**
     * Destroy
     */
    destroy: function() {
        this.stopListening();
        $(window).off('resize.grid');
        this._destroyChildren();

        this.$el.replaceWith(this.__$el);
        this.$el = this.__$el = null;
    }
});

module.exports = Container;
