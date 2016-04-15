/**
 * @fileoverview ResizeHandler for the Header
 * @author NHN Ent. FE Development Team
 */
'use strict';

var View = require('../../base/view');
var ATTR_COLUMN_NAME = require('../../common/constMap').attrName.COLUMN_NAME;

/**
 * Reside Handler class
 * @module view/layout/resizeHandler
 * @extends module:base/view
 */
var ResizeHandler = View.extend(/**@lends module:view/layout/resizeHandler.prototype */{
    /**
     * @constructs
     * @param {Object} options - Options
     */
    initialize: function(options) {
        this.setOwnProperties({
            dimensionModel: options.dimensionModel,
            columnModel: options.columnModel,
            whichSide: options.whichSide || 'R',

            isResizing: false,
            $target: null,
            differenceLeft: 0,
            initialWidth: 0,
            initialOffsetLeft: 0,
            initialLeft: 0
        });
        this.listenTo(this.dimensionModel, 'change:which columnWidthChanged', this._refreshHandlerPosition);
    },

    tagName: 'div',

    className: 'resize_handle_container',

    events: {
        'mousedown .resize_handle': '_onMouseDown',
        'dblclick .resize_handle': '_onDblClick'
    },

    template: _.template(
        '<div columnindex="<%=columnIndex%>" ' +
        '<%=attrColumnName%>="<%=columnName%>" ' +
        'class="resize_handle' +
        '<% if(isLast === true) ' +
        ' print(" resize_handle_last");%>' +
        '" ' +
        'style="<%=height%>" ' +
        'title="마우스 드래그를 통해 컬럼의 넓이를 변경할 수 있고,더블클릭을 통해 넓이를 초기화할 수 있습니다.">' +
        '</div>'),

    /**
     * Return an object that contains an array of column width and an array of column model.
     * @returns {{widthList: (Array|*), modelList: (Array|*)}} Column Data
     * @private
     */
    _getColumnData: function() {
        var columnModel = this.columnModel,
            dimensionModel = this.dimensionModel,
            columnWidthList = dimensionModel.getColumnWidthList(this.whichSide),
            columnModelList = columnModel.getVisibleColumnModelList(this.whichSide, true);

        return {
            widthList: columnWidthList,
            modelList: columnModelList
        };
    },

    /**
     * Returns the HTML string of all handler.
     * @returns {String}
     * @private
     */
    _getResizeHandlerMarkup: function() {
        var columnData = this._getColumnData(),
            columnModelList = columnData.modelList,
            headerHeight = this.dimensionModel.get('headerHeight'),
            length = columnModelList.length,
            resizeHandleMarkupList;

        resizeHandleMarkupList = _.map(columnModelList, function(columnModel, index) {
            return this.template({
                attrColumnName: ATTR_COLUMN_NAME,
                columnIndex: index,
                columnName: columnModel.columnName,
                isLast: index + 1 === length,
                height: headerHeight
            });
        }, this);
        return resizeHandleMarkupList.join('');
    },

    /**
     * Render
     * @returns {module:view/layout/resizeHandler} This object
     */
    render: function() {
        var headerHeight = this.dimensionModel.get('headerHeight'),
            htmlStr = this._getResizeHandlerMarkup();

        this.$el.empty().show().html(htmlStr).css({
            marginTop: -headerHeight,
            height: headerHeight
        });
        this._refreshHandlerPosition();

        return this;
    },

    /**
     * Refresh the position of every handler.
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
            BORDER_WIDTH = 1,
            HANDLER_WIDTH_HALF = 3,
            width;

        tui.util.forEachArray($resizeHandleList, function(item, index) {
            $handler = $resizeHandleList.eq(index);
            columnName = $handler.attr(ATTR_COLUMN_NAME);
            width = $table.find('th[' + ATTR_COLUMN_NAME + '=' + columnName + ']').width();
            if (tui.util.isExisty(width)) {
                isChanged = isChanged || (width !== columnWidthList[index]);
            } else {
                width = columnWidthList[index];
            }
            curPos += width + BORDER_WIDTH;
            $handler.css('left', curPos - HANDLER_WIDTH_HALF);
        });
    },

    /**
     * Returns whether resizing is in progress or not.
     * @returns {boolean}
     * @private
     */
    _isResizing: function() {
        return !!this.isResizing;
    },

    /**
     * Event handler for the 'mousedown' event
     * @param {MouseEvent} mouseEvent - mouse event
     * @private
     */
    _onMouseDown: function(mouseEvent) {
        this._startResizing(mouseEvent);
    },

    /**
     * Event handler for the 'dblclick' event
     * @param {MouseEvent} mouseEvent - mouse event
     * @private
     */
    _onDblClick: function(mouseEvent) {
        var $target = $(mouseEvent.target),
            index = parseInt($target.attr('columnindex'), 10);

        this.dimensionModel.restoreColumnWidth(this._getHandlerColumnIndex(index));
        this._refreshHandlerPosition();
    },

    /**
     * Event handler for the 'mouseup' event
     * @private
     */
    _onMouseUp: function() {
        this._stopResizing();
    },

    /**
     * Event handler for the 'mousemove' event
     * @param {MouseEvent} mouseEvent - mouse event
     * @private
     */
    _onMouseMove: function(mouseEvent) {
        var left, width, index;

        /* istanbul ignore else */
        if (this._isResizing()) {
            mouseEvent.preventDefault();

            left = mouseEvent.pageX - this.initialOffsetLeft;
            width = this._calculateWidth(mouseEvent.pageX);
            index = parseInt(this.$target.attr('columnindex'), 10);

            this.$target.css('left', left + 'px');
            this.dimensionModel.setColumnWidth(this._getHandlerColumnIndex(index), width);
            this._refreshHandlerPosition();
        }
    },

    /**
     * Returns the width of the column based on given mouse position and the initial offset.
     * @param {number} pageX - mouse x position
     * @returns {number}
     * @private
     */
    _calculateWidth: function(pageX) {
        var difference = pageX - this.initialOffsetLeft - this.initialLeft;
        return this.initialWidth + difference;
    },

    /**
     * Find the real index (based on visibility) of the column using index value of the handler and returns it.
     * @param {number} index - index value of the handler
     * @returns {number}
     * @private
     */
    _getHandlerColumnIndex: function(index) {
        return (this.whichSide === 'R') ? (index + this.columnModel.getVisibleColumnFixCount(true)) : index;
    },

    /**
     * Start resizing
     * @param {event} mouseDownEvent - mouse event
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
     * Stop resizing
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
     * Destroy
     */
    destroy: function() {
        this.stopListening();
        this._stopResizing();
        this.remove();
    }
});

module.exports = ResizeHandler;
