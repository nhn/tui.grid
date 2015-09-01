'use strict';

var View = require('../base/view');

/**
 * 실제 selection layer view
 * @constructor View.Selection.Layer
 */
var SelectionLayer = View.extend(/**@lends View.Selection.Layer.prototype */{
    tagName: 'div',
    className: 'selection_layer',
    events: {
        mousedown: '_onMouseDown'
    },

    /**
     * 생성자 함수
     * @param {object} options Options
     *      @param {array} options.columnWidthList  selection 레이어에 해당하는 영역의 컬럼 너비 리스트 정보
     */
    initialize: function(options) {
        View.prototype.initialize.apply(this, arguments);
        this.listenTo(this.grid.dimensionModel, 'columnWidthChanged', this._updateColumnWidthList, this);
        this.setOwnProperties({
            columnWidthList: options.columnWidthList,
            spannedRange: {
                row: [-1, -1],
                column: [-1, -1]
            },
            whichSide: 'R'
        });
    },

    /**
     * selection 영역의 mousedown 이벤트
     * @param {Event} mouseDownEvent - MousedownEvent object
     * @private
     */
    _onMouseDown: function(mouseDownEvent) {
        this.grid.selection.onMouseDown(mouseDownEvent);
    },

    /**
     * 컬럼 widthList 값의 변화가 발생했을때 이벤트 핸들러
     * @private
     */
    _updateColumnWidthList: function() {
        this.columnWidthList = this.grid.dimensionModel.getColumnWidthList(this.whichSide);
    },

    /**
     * 영역 정보를 바탕으로 selection 레이어의 크기와 위치 정보를 담은 css 스타일을 반환한다.
     * @param {{row: range, column: range}} spannedRange 인덱스 정보
     * @return {{display: string, width: string, height: string, top: string, left: string}} css 스타일 정보
     * @private
     */
    _getGeometryStyles: function(spannedRange) {
        spannedRange = spannedRange || this.indexObj;
        var style,
            i,
            border = 1,
            columnWidthList = this.columnWidthList,
            rowRange = spannedRange.row,
            columnRange = spannedRange.column,
            rowHeight = this.grid.dimensionModel.get('rowHeight'),
//                top = Util.getTBodyHeight(rowRange[0], rowHeight) + this.grid.renderModel.get('top'),
            top = Util.getHeight(rowRange[0], rowHeight) - 1,
            height = Util.getHeight(rowRange[1] - rowRange[0] + 1, rowHeight) - 2,
            len = columnWidthList.length,
            display = 'block',
            left = 0,
            width = 0;

        for (i = 0; i < columnRange[1] + 1 && i < len; i += 1) {
            //border 두께 (1px) 값도 포함하여 계산한다.
            if (i < columnRange[0]) {
                left += columnWidthList[i] + border;
            } else {
                width += columnWidthList[i] + border;
            }
        }
        //border 두께 (1px) 가 추가로 한번 더 계산되었기 때문에 -1 한다.
        width -= border;

        if (width <= 0 || height <= 0) {
            display = 'none';
        }

        style = {
            display: display,
            width: width + 'px',
            height: height + 'px',
            top: top + 'px',
            left: left + 'px'
        };
        return style;
    },

    /**
     * 레이어를 노출한다.
     * @param {{row: range, column: range}} spannedRange 인덱스 정보
     */
    show: function(spannedRange) {
        this.indexObj = spannedRange;
        this.$el.css(this._getGeometryStyles(spannedRange));
    },

    /**
     * 레이어를 숨긴다.
     */
    hide: function() {
        this.$el.css({
            display: 'none',
            width: '0px',
            height: '0px',
            top: 0,
            left: 0
        });
    },

    /**
     * 렌더링한다.
     * @return {View.Selection.Layer} this object
     */
    render: function() {
        return this;
    }
});

/**
 * 왼쪽 selection layer
 * @constructor View.Selection.Layer.Lside
 */
SelectionLayer.Lside = SelectionLayer.extend(/**@lends Layer.Lside.prototype */{
    /**
     * 생성자 함수
     */
    initialize: function() {
        View.Selection.Layer.prototype.initialize.apply(this, arguments);
        this.setOwnProperties({
            whichSide: 'L'
        });
    }
});

/**
 * 오른쪽 selection layer
 * @constructor View.Selection.Layer.Rside
 */
SelectionLayer.Rside = SelectionLayer.extend(/**@lends Layer.Rside.prototype */{
    /**
     * 생성자 함수
     */
    initialize: function() {
        View.Selection.Layer.prototype.initialize.apply(this, arguments);
        this.setOwnProperties({
            whichSide: 'R'
        });
    }
});

module.exports = SelectionLayer;
