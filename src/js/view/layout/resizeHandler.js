/**
 * @fileoverview ResizeHandler for the Header
 * @author NHN Ent. FE Development Team
 */
'use strict';

var View = require('../../base/view');

/**
 * Reside Handler class
 * @module view/layout/resizeHandler
 */
var ResizeHandler = View.extend(/**@lends module:view/layout/resizeHandler.prototype */{
    /**
     * @constructs
     * @extends module:base/view
     * @param {Object} options - Options
     *      @param {String} [options.whichSide='R']  어느 영역의 handler 인지 여부.
     */
    initialize: function(options) {
        View.prototype.initialize.apply(this, arguments);
        this.setOwnProperties({
            whichSide: options.whichSide || 'R',
            isResizing: false,     //현재 resize 발생 상황인지
            $target: null,         //이벤트가 발생한 target resize handler
            differenceLeft: 0,
            initialWidth: 0,
            initialOffsetLeft: 0,
            initialLeft: 0
        });
        this.listenTo(this.grid.dimensionModel, 'columnWidthChanged', this._refreshHandlerPosition, this);
        if (this.grid instanceof View) {
            this.listenTo(this.grid, 'rendered', $.proxy(this._refreshHandlerPosition, this));
            this.listenTo(this.grid.dimensionModel, 'change:width', $.proxy(this._refreshHandlerPosition, this));
        }
    },

    tagName: 'div',

    className: 'resize_handle_container',

    events: {
        'mousedown .resize_handle': '_onMouseDown',
        'click .resize_handle': '_onClick'
    },

    template: _.template('' +
        '<div columnindex="<%=columnIndex%>" ' +
        'columnname="<%=columnName%>" ' +
        'class="resize_handle' +
        '<% if(isLast === true) ' +
        ' print(" resize_handle_last");%>' +
        '" ' +
        'style="<%=height%>" ' +
        'title="마우스 드래그를 통해 컬럼의 넓이를 변경할 수 있고,더블클릭을 통해 넓이를 초기화할 수 있습니다.">' +
        '</div>'),

    /**
     * columnWidthList 와 columnModelList 를 함께 반환한다.
     * @return {{widthList: (Array|*), modelList: (Array|*)}} Column Data
     * @private
     */
    _getColumnData: function() {
        var columnModel = this.grid.columnModel,
            dimensionModel = this.grid.dimensionModel,
            columnWidthList = dimensionModel.getColumnWidthList(this.whichSide),
            columnModelList = columnModel.getVisibleColumnModelList(this.whichSide, true);
        return {
            widthList: columnWidthList,
            modelList: columnModelList
        };
    },

    /**
     * resize handler 마크업을 구성한다.
     * @return {String} resize handler 의 html 마크업 스트링
     * @private
     */
    _getResizeHandlerMarkup: function() {
        var columnData = this._getColumnData(),
            columnModelList = columnData.modelList,
            headerHeight = this.grid.dimensionModel.get('headerHeight'),
            length = columnModelList.length,
            resizeHandleMarkupList;

        resizeHandleMarkupList = _.map(columnModelList, function(columnModel, index) {
            return this.template({
                columnIndex: index,
                columnName: columnModel.columnName,
                isLast: index + 1 === length,
                height: headerHeight
            });
        }, this);
        return resizeHandleMarkupList.join('');
    },

    /**
     * 랜더링 한다.
     * @return {View.Layout.Header.ResizeHandler} This object
     */
    render: function() {
        var headerHeight = this.grid.dimensionModel.get('headerHeight');
        this.$el.empty();
        this.$el
            .show()
            .css({
                'marginTop': -headerHeight + 'px',
                'height': headerHeight + 'px'
            })
            .html(this._getResizeHandlerMarkup());

        //header 가 랜더링 된 이후 widthList 를 보정 하기위해 setTimeout 을 사용한다.
        this._refreshHandlerPosition();
        return this;
    },

    /**
     * 생성된 핸들러의 위치를 설정한다.
     * @private
     */
    _refreshHandlerPosition: function() {
        var columnData = this._getColumnData(),
            columnWidthList = columnData.widthList,
            $resizeHandleList = this.$el.find('.resize_handle'),
            $table = this.$el.parent().find('table:first'),
            isChanged = false,
            $handler,
            columnName,
            curPos = 0,
            border = 1,
            width;

        ne.util.forEachArray($resizeHandleList, function(item, index) {
            $handler = $resizeHandleList.eq(index);
            columnName = $handler.attr('columnname');
            width = $table.find('th[columnname="' + columnName + '"]').width();
            if (ne.util.isExisty(width)) {
                isChanged = isChanged || (width !== columnWidthList[index]);
            } else {
                width = columnWidthList[index];
            }
            curPos += width + border;
            $handler.css('left', (curPos - 3) + 'px');
        });
    },

    /**
     * 현재 mouse move resizing 중인지 상태 flag 반환
     * @return {boolean}    현재 resize 중인지 여부
     * @private
     */
    _isResizing: function() {
        return !!this.isResizing;
    },

    /**
     * mousedown 이벤트 핸들러
     * @param {event} mouseDownEvent    마우스 이벤트 객체
     * @private
     */
    _onMouseDown: function(mouseDownEvent) {
        this._startResizing(mouseDownEvent);
    },

    /**
     * click 이벤트 핸들러
     * @param {Event} clickEvent 마우스 이벤트 객체
     * @private
     */
    _onClick: function(clickEvent) {
        var $target = $(clickEvent.target),
            index = parseInt($target.attr('columnindex'), 10),
            isClicked = $target.data('isClicked');

        if (isClicked) {
            this.grid.dimensionModel.restoreColumnWidth(this._getHandlerColumnIndex(index));
            this._clearClickedFlag($target);
            this._refreshHandlerPosition();
        } else {
            this._setClickedFlag($target);
        }
    },

    /**
     * 더블클릭을 확인하기 위한 isClicked 플래그를 설정한다.
     * @param {jQuery} $target 설정할 타겟 엘리먼트
     * @private
     */
    _setClickedFlag: function($target) {
        $target.data('isClicked', true);
        setTimeout($.proxy(this._clearClickedFlag, this, $target), 500);
    },

    /**
     * 더블클릭을 확인하기 위한 isClicked 를 제거한다.
     * @param {jQuery} $target 설정할 타겟 엘리먼트
     * @private
     */
    _clearClickedFlag: function($target) {
        $target.data('isClicked', false);
    },

    /**
     * mouseup 이벤트 핸들러
     * @private
     */
    _onMouseUp: function() {
        this._stopResizing();
    },

    /**
     * mousemove 이벤트 핸들러
     * @param {event} mouseMoveEvent    마우스 이벤트 객체
     * @private
     */
    _onMouseMove: function(mouseMoveEvent) {
        var left, width, index;

        /* istanbul ignore else */
        if (this._isResizing()) {
            mouseMoveEvent.preventDefault();

            left = mouseMoveEvent.pageX - this.initialOffsetLeft;
            width = this._calculateWidth(mouseMoveEvent.pageX);
            index = parseInt(this.$target.attr('columnindex'), 10);

            this.$target.css('left', left + 'px');
            this.grid.dimensionModel.setColumnWidth(this._getHandlerColumnIndex(index), width);
            this._refreshHandlerPosition();
        }
    },

    /**
     * 너비를 계산한다.
     * @param {number} pageX    마우스의 x 좌표
     * @return {number} x좌표를 기준으로 계산한 width 값
     * @private
     */
    _calculateWidth: function(pageX) {
        var difference = pageX - this.initialOffsetLeft - this.initialLeft;
        return this.initialWidth + difference;
    },

    /**
     * 핸들러의 index 로부터 컬럼의 index 를 반환한다.
     * @param {number} index 핸들러의 index 값
     * @return {number} 컬럼 index 값
     * @private
     */
    _getHandlerColumnIndex: function(index) {
        return (this.whichSide === 'R') ? (index + this.grid.columnModel.getVisibleColumnFixCount(true)) : index;
    },

    /**
     * resize start 세팅
     * @param {event} mouseDownEvent 마우스 이벤트
     * @private
     */
    _startResizing: function(mouseDownEvent) {
        var columnData = this._getColumnData(),
            columnWidthList = columnData.widthList,
            $target = $(mouseDownEvent.target);

        this.isResizing = true;
        this.$target = $target;
        this.initialLeft = parseInt($target.css('left').replace('px', ''), 10);
        this.initialOffsetLeft = this.$el.offset().left;
        this.initialWidth = columnWidthList[$target.attr('columnindex')];
        $('body').css('cursor', 'col-resize');
        $(document)
            .bind('mousemove', $.proxy(this._onMouseMove, this))
            .bind('mouseup', $.proxy(this._onMouseUp, this));

        // for IE8 and under
        if ($target[0].setCapture) {
            $target[0].setCapture();
        }
    },

    /**
     * resize stop 세팅
     * @private
     */
    _stopResizing: function() {
        // for IE8 and under
        if (this.$target && this.$target[0].releaseCapture) {
            this.$target[0].releaseCapture();
        }

        this.isResizing = false;
        this.$target = null;
        this.initialLeft = 0;
        this.initialOffsetLeft = 0;
        this.initialWidth = 0;

        $('body').css('cursor', 'default');
        $(document)
            .unbind('mousemove', $.proxy(this._onMouseMove, this))
            .unbind('mouseup', $.proxy(this._onMouseUp, this));
    },

    /**
     * 소멸자
     */
    destroy: function() {
        this.stopListening();
        this._stopResizing();
        this.destroyChildren();
        this.remove();
    }
});

module.exports = ResizeHandler;
