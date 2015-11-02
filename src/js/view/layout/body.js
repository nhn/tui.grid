/**
 * @fileoverview Class for the body layout
 * @author NHN Ent. FE Development Team
 */
'use strict';

var View = require('../../base/view');
var SelectionLayer = require('../selectionLayer');
var BodyTableView = require('./bodyTable');

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
        View.prototype.initialize.apply(this, arguments);
        this.setOwnProperties({
            // DIV for setting rendering position of entire child-nodes of $el.
            $container: null,
            whichSide: options && options.whichSide || 'R'
        });

        this.listenTo(this.grid.dimensionModel, 'change:bodyHeight', this._onBodyHeightChange)
            .listenTo(this.grid.dataModel, 'add remove reset', this._resetContainerHeight)
            .listenTo(this.grid.renderModel, 'change:scrollTop', this._onScrollTopChange)
            .listenTo(this.grid.renderModel, 'change:scrollLeft', this._onScrollLeftChange);
    },

    tagName: 'div',

    className: 'data',

    events: {
        'scroll': '_onScroll',
        'mousedown .body_container': '_onMouseDown'
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
            height: this.grid.dimensionModel.get('totalRowHeight')
        });
    },

    /**
     * 스크롤 이벤트 핸들러
     * @param {event} scrollEvent   스크롤 이벤트
     * @private
     */
    _onScroll: function(scrollEvent) {
        var attrs = {
            scrollTop: scrollEvent.target.scrollTop
        };

        if (this.whichSide === 'R') {
            attrs.scrollLeft = scrollEvent.target.scrollLeft;
        }
        this.grid.renderModel.set(attrs);
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
     * mousedown 이벤트 핸들러
     * @param {Event} mouseDownEvent 이벤트 객체
     * @private
     */
    _onMouseDown: function(event) {
        var $td = $(event.target).closest('td'),
            $tr = $(event.target).closest('tr'),
            columnName = $td.attr('columnName'),
            rowKey = $tr.attr('key'),
            grid = this.grid,
            columnModel = grid.columnModel;

        if (grid.option('selectType') === 'radio') {
            grid.check(rowKey);
        }

        if (columnModel.isMetaColumn(columnName)) {
            // meta column clicked
        } else {
            grid.focus(rowKey, columnName);
            this._checkSelectionAction(event.pageX, event.pageY, event.shiftKey);
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
        this.grid.updateLayoutData();
        $(document)
            .on('mousemove', $.proxy(this._onMouseMove, this))
            .on('mouseup', $.proxy(this._detachDragEvents, this))
            .on('selectstart', $.proxy(this._onSelectStart, this));
    },

    /**
     * 마우스 up 이벤트가 발생하여 selection 이 끝날 때, document 에 달린 이벤트 핸들러를 제거한다.
     */
    _detachDragEvents: function() {
        this.grid.selectionModel.stopAutoScroll();
        $(document)
            .off('mousemove', $.proxy(this._onMouseMove, this))
            .off('mouseup', $.proxy(this._detachDragEvents, this))
            .off('selectstart', $.proxy(this._onSelectStart, this));
    },

    /**
     * Event handler for 'mousemove' event during drag
     * @param {MouseEvent} event - MouseEvent object
     */
    _onMouseMove: function(event) {
        var selectionModel = this.grid.selectionModel,
            pageX = event.pageX,
            pageY = event.pageY;

        if (selectionModel.hasSelection()) {
            selectionModel.updateByMousePosition(pageX, pageY);
        } else if (this._getMouseMoveDistance(pageX, pageY) > 10) {
            selectionModel.startByMousePosition(this.mouseDownX, this.mouseDownY);
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
     * @param {event} selectStartEvent 이벤트 객체
     * @returns {boolean} false
     * @private
     */
    _onSelectStart: function(event) {
        event.preventDefault();
        return false;
    },

    /**
     * Checks the state of selection model and event, and process actions related to selection.
     * @param {number} pageX - X position relative to the document
     * @param {number} pageY - Y position relative to the document
     * @param {boolean} shiftKey - True if the shiftKey was down
     */
    _checkSelectionAction: function(pageX, pageY, shiftKey) {
        var selectionModel = this.grid.selectionModel;

        if (!selectionModel.isEnabled()) {
            return;
        }
        if (shiftKey) {
            selectionModel.updateByMousePosition(pageX, pageY);
        } else {
            selectionModel.end();
        }
        this._attachDragEvents(pageX, pageY);
    },

    /**
     * rendering 한다.
     * @return {View.Layout.Body}   자기 자신
     */
    render: function() {
        var grid = this.grid,
            whichSide = this.whichSide,
            selectionLayer, bodyTableView;

        this.destroyChildren();

        if (!this.grid.option('scrollX')) {
            this.$el.css('overflow-x', 'hidden');
        }
        if (!this.grid.option('scrollY') && whichSide === 'R') {
            this.$el.css('overflow-y', 'hidden');
        }
        this.$el.css('height', grid.dimensionModel.get('bodyHeight'));

        this.$container = $(HTML_CONTAINER);
        this.$el.append(this.$container);

        bodyTableView = this.createView(BodyTableView, {
            grid: grid,
            whichSide: whichSide
        });
        selectionLayer = this.createView(SelectionLayer, {
            grid: grid,
            whichSide: whichSide
        });

        this.$container.append(
            bodyTableView.render().el,
            selectionLayer.render().el
        );
        return this;
    }
});

module.exports = Body;
