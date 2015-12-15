/**
 * @fileoverview The View class that conaints a top element of the DOM structure for the grid.
 * @author NHN Ent. FE Development Team
 */
 'use strict';

var View = require('../base/view');

var Clipboard = require('./clipboard');
var LsideFrame = require('./layout/frame-lside');
var RsideFrame = require('./layout/frame-rside');
var ToolbarLayout = require('./layout/toolbar');
var StateLayer = require('./stateLayer');

/**
 * Container View
 * @module container
 */
var Container = View.extend(/**@lends module:container.prototype */{
    /**
     * @constructs
     * @extends module:base/view
     * @param {Object} options
     */
    initialize: function(options) {
        View.prototype.initialize.apply(this, arguments);

        this.children = {};

        this._initializeListener();
        this._initializeView();
        this._attachExtraEvent();

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
    _initializeView: function() {
        this.children.lside = this.createView(LsideFrame, {
            grid: this.grid
        });

        this.children.rside = this.createView(RsideFrame, {
            grid: this.grid
        });

        this.children.toolbar = this.createView(ToolbarLayout, {
            grid: this.grid
        });

        this.children.layer = this.createView(StateLayer, {
            grid: this.grid
        });

        this.children.clipboard = this.createView(Clipboard, {
            grid: this.grid
        });
    },

    /**
     * 커스텀 이벤트 리스너를 초기화한다.
     * @private
     */
    _initializeListener: function() {
        this.listenTo(this.grid.dimensionModel, 'change:bodyHeight', this._setHeight)
    },

    /**
     * event 속성에 정의되지 않은 이벤트 attach 한다.
     * @private
     */
    _attachExtraEvent: function() {
        $(window).on('resize', $.proxy(this._onWindowResize, this));
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
     * window resize  이벤트 핸들러
     * @private
     */
    _onWindowResize: function() {
        if (this.$el) {
            this.grid.dimensionModel.set('width', this.$el.width());
        }
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

        this.grid.trigger('click', eventData);
        if (eventData.isStopped()) {
            return;
        }
        if (this._isCellElement($target, true)) {
            cellInfo = this._getCellInfoFromElement($target.closest('td'));
            if (this.grid.singleClickEdit && !$target.is('input')) {
                this.grid.focusIn(cellInfo.rowKey, cellInfo.columnName);
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

        this.grid.trigger('dblclick', eventData);
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
        this.grid.trigger(eventName, eventData);
    },

    /**
     * 해당 HTML요소가 셀인지 여부를 반환한다.
     * @private
     * @param {jQuery} $target 검사할 HTML요소의 jQuery 객체
     * @param {boolean} isIncludeChild true이면 셀의 자식요소까지 포함한다.
     * @return {boolean} 셀이면 true, 아니면 false
     */
    _isCellElement: function($target, isIncludeChild) {
        var $td = isIncludeChild ? $target.closest('td') : $target;

        if (!$td.is('td')) {
            return false;
        }
        return !!($td.parent().attr('key') && $td.attr('columnname'));
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
            rowData: this.grid.getRow(rowKey)
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

        this.grid.trigger('mousedown', eventData);
        if (eventData.isStopped()) {
            return;
        }
        if (!$target.is('input, a, button, select')) {
            mouseDownEvent.preventDefault();
            this.grid.focusClipboard();
        }
    },

    /**
     * rendering 이후, 또는 bodyHeight 가 변경되었을 때, header, toolbar 의 높이를 포함하여
     * grid 의 전체 너비를 설정한다.
     * @private
     */
    _setHeight: function() {
        var bodyHeight = this.grid.dimensionModel.get('bodyHeight'),
            headerHeight = this.grid.dimensionModel.get('headerHeight'),
            toolbarHeight = this.grid.dimensionModel.get('toolbarHeight'),
            height = toolbarHeight + headerHeight + bodyHeight;

        this.$el.css('height', height);
    },

    /**
     * Render
     */
    render: function() {
        var leftLine = $('<div>').addClass('left_line'),
            rightLine = $('<div>').addClass('right_line');

        this.$el
            .addClass('grid_wrapper uio_grid')
            .attr('instanceId', this.grid.id)
            .append(this.children.layer.render().el)
            .append(this.children.lside.render().el)
            .append(this.children.rside.render().el)
            .append(this.children.toolbar.render().el)
            .append(leftLine)
            .append(rightLine)
            .append(this.children.clipboard.render().el);

        this._setHeight();
        this.grid.trigger('rendered');
    },

    /**
     * 소멸자
     */
    destroy: function() {
        this.stopListening();
        this.destroyChildren();

        this.$el.replaceWith(this.__$el);
        this.$el = this.__$el = null;
    }
});

module.exports = Container;
