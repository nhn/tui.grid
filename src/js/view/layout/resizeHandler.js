/**
 * @fileoverview ResizeHandler for the Header
 * @author NHN Ent. FE Development Team
 */
'use strict';

var _ = require('underscore');

var View = require('../../base/view');
var constMap = require('../../common/constMap');
var classNameConst = require('../../common/classNameConst');
var attrNameConst = constMap.attrName;
var CELL_BORDER_WIDTH = constMap.dimension.CELL_BORDER_WIDTH;
var RESIZE_HANDLE_WIDTH = constMap.dimension.RESIZE_HANDLE_WIDTH;

/**
 * Reside Handler class
 * @module view/layout/resizeHandler
 * @extends module:base/view
 */
var ResizeHandler = View.extend(/**@lends module:view/layout/resizeHandler.prototype */ {
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

    className: classNameConst.COLUMN_RESIZE_CONTAINER,

    events: function() {
        var eventHash = {};

        eventHash['mousedown .' + classNameConst.COLUMN_RESIZE_HANDLE] = '_onMouseDown';
        eventHash['dblclick .' + classNameConst.COLUMN_RESIZE_HANDLE] = '_onDblClick';

        return eventHash;
    },

    template: _.template(
        '<div ' +
        attrNameConst.COLUMN_INDEX + '="<%=columnIndex%>" ' +
        attrNameConst.COLUMN_NAME + '="<%=columnName%>" ' +
        'class="' + classNameConst.COLUMN_RESIZE_HANDLE + ' <%=lastClass%>" ' +
        'style="<%=height%>" ' +
        'title="마우스 드래그를 통해 컬럼의 넓이를 변경할 수 있고,더블클릭을 통해 넓이를 초기화할 수 있습니다.">' +
        '</div>'
    ),

    /**
     * Return an object that contains an array of column width and an array of column model.
     * @returns {{widthList: (Array|*), modelList: (Array|*)}} Column Data
     * @private
     */
    _getColumnData: function() {
        var columnModel = this.columnModel;
        var dimensionModel = this.dimensionModel;
        var columnWidthList = dimensionModel.getColumnWidthList(this.whichSide);
        var columnModelList = columnModel.getVisibleColumnModelList(this.whichSide, true);

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
        var columnData = this._getColumnData();
        var columnModelList = columnData.modelList;
        var headerHeight = this.dimensionModel.get('headerHeight');
        var length = columnModelList.length;
        var resizeHandleMarkupList = _.map(columnModelList, function(columnModel, index) {
            return this.template({
                lastClass: (index + 1 === length) ? classNameConst.COLUMN_RESIZE_HANDLE_LAST : '',
                columnIndex: index,
                columnName: columnModel.columnName,
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

        this.$el.empty().html(htmlStr).css({
            marginTop: -headerHeight,
            height: headerHeight,
            display: 'block'
        });
        this._refreshHandlerPosition();

        return this;
    },

    /**
     * Refresh the position of every handler.
     * @private
     */
    _refreshHandlerPosition: function() {
        var columnData = this._getColumnData();
        var columnWidthList = columnData.widthList;
        var $resizeHandleList = this.$el.find('.' + classNameConst.COLUMN_RESIZE_HANDLE);
        var handlerWidthHalf = Math.floor(RESIZE_HANDLE_WIDTH / 2);
        var curPos = 0;

        tui.util.forEachArray($resizeHandleList, function(item, index) {
            var $handler = $resizeHandleList.eq(index);
            curPos += columnWidthList[index] + CELL_BORDER_WIDTH;
            $handler.css('left', curPos - handlerWidthHalf);
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
        this._startResizing($(mouseEvent.target));
    },

    /**
     * Event handler for the 'dblclick' event
     * @param {MouseEvent} mouseEvent - mouse event
     * @private
     */
    _onDblClick: function(mouseEvent) {
        var $target = $(mouseEvent.target);
        var index = parseInt($target.attr(attrNameConst.COLUMN_INDEX), 10);

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
        var width, index;

        if (this._isResizing()) {
            mouseEvent.preventDefault();

            width = this._calculateWidth(mouseEvent.pageX);
            index = parseInt(this.$target.attr(attrNameConst.COLUMN_INDEX), 10);

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
     * @param {jQuery} $target - target element
     * @private
     */
    _startResizing: function($target) {
        var columnData = this._getColumnData();
        var columnWidthList = columnData.widthList;

        this.isResizing = true;
        this.$target = $target;
        this.initialLeft = parseInt($target.css('left').replace('px', ''), 10);
        this.initialOffsetLeft = this.$el.offset().left;
        this.initialWidth = columnWidthList[$target.attr(attrNameConst.COLUMN_INDEX)];
        $('body').css('cursor', 'col-resize');
        $(document)
            .on('mousemove', $.proxy(this._onMouseMove, this))
            .on('mouseup', $.proxy(this._onMouseUp, this));

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
