'use strict';

var View = require('../../../base/view');

/**
 * 툴바 영역 resize handler
 * @constructor ResizeHandler
 */
var ResizeHandler = View.extend(/**@lends ResizeHandler.prototype */{
    tagName: 'div',
    className: 'height_resize_bar',
    events: {
        'mousedown': '_onMouseDown'
    },
    template: _.template('<a href="#" class="height_resize_handle">높이 조절</a>'),
    /**
     * 생성자 함수
     */
    initialize: function() {
        this.timeoutIdForResize = 0;
        View.prototype.initialize.apply(this, arguments);
    },
    /**
     * document 에 mousemove, mouseup 이벤트 핸들러를 추가한다.
     * @private
     */
    _attachMouseEvent: function() {
        $(document).on('mousemove', $.proxy(this._onMouseMove, this));
        $(document).on('mouseup', $.proxy(this._onMouseUp, this));
        $(document).on('selectstart', $.proxy(this._onSelectStart, this));
    },
    /**
     * document 에 mousemove, mouseup 이벤트 핸들러를 추가한다.
     * @private
     */
    _detachMouseEvent: function() {
        $(document).off('mousemove', $.proxy(this._onMouseMove, this));
        $(document).off('mouseup', $.proxy(this._onMouseUp, this));
        $(document).off('selectstart', $.proxy(this._onSelectStart, this));
    },
    /**
     * mousedown 이벤트 핸들러
     * @param {event} mouseDownEvent 마우스 이벤트
     * @private
     */
    _onMouseDown: function(mouseDownEvent) {
        mouseDownEvent.preventDefault();
        $(document.body).css('cursor', 'row-resize');
        this.grid.updateLayoutData();
        this._attachMouseEvent();
    },
    /**
     * mousemove 이벤트 핸들러
     * @param {event} mouseMoveEvent 마우스 이벤트
     * @private
     */
    _onMouseMove: function(mouseMoveEvent) {
        clearTimeout(this.timeoutIdForResize);

        var dimensionModel = this.grid.dimensionModel,
            offsetTop = dimensionModel.get('offsetTop'),
            headerHeight = dimensionModel.get('headerHeight'),
            rowHeight = dimensionModel.get('rowHeight'),
            toolbarHeight = dimensionModel.get('toolbarHeight'),
            bodyHeight = mouseMoveEvent.pageY - offsetTop - headerHeight - toolbarHeight;

        bodyHeight = Math.max(bodyHeight, rowHeight + dimensionModel.getScrollXHeight());

        //매번 수행하면 성능이 느려지므로, resize 이벤트가 발생할 시 천첮히 업데이트한다.
        this.timeoutIdForResize = setTimeout(function() {
            dimensionModel.set({
                bodyHeight: bodyHeight
            });
        }, 0);
    },

    /**
     * mouseup 이벤트 핸들러
     * @private
     */
    _onMouseUp: function() {
        $(document.body).css('cursor', 'default');
        this._detachMouseEvent();
    },

    /**
     * selection start 이벤트 핸들러
     * @param {Event} event - Event object
     * @return {boolean} - 기본 동작 방지를 위해 무조건 false 를 반환한다.
     * @private
     */
    _onSelectStart: function(event) {
        event.preventDefault();
        return false;
    },

    /**
     * 랜더링한다.
     * @return {ResizeHandler} this object
     */
    render: function() {
        this.destroyChildren();
        this.$el.html(this.template());
        return this;
    },
    /**
     * 소멸자
     */
    destroy: function() {
        this.stopListening();
        this._onMouseUp();
        this.destroyChildren();
        this.remove();
    }
});

module.exports = ResizeHandler;
