/**
 * @fileoverview Row Painter 정의
 * @author NHN Ent. FE Development Team
 */
'use strict';

var Painter = require('../../base/painter');

/**
 * Row Painter
 * 성능 향상을 위해 Row Painter 를 위한 클래스 생성
 * @module painter/row
 */
var RowPainter = ne.util.defineClass(Painter,/**@lends module:painter/row.prototype */{
    /**
     * @constructs
     * @extends module:painter
     * @param {object} options - Options
     *      @param {string} [options.whichSide='R']   어느 영역에 속하는 row 인지 여부. 'L|R' 중 하나를 지정한다.
     *      @param {object} options.collection change 를 감지할 collection 객체
     */
    init: function(options) {
        Painter.apply(this, arguments);

        this.setOwnProperties({
            columnModelList: options.columnModelList
        });
    },

    eventHandler: {
        'mousedown': '_onMouseDown'
    },

    baseTemplate: _.template(
        '' +
        '<tr ' +
        'key="<%=key%>" ' +
        'class="<%=className%>" ' +
        'style="height: <%=height%>px;">' +
        '<%=contents%>' +
        '</tr>'
    ),

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
        $(document).on('mousemove', $.proxy(this._onMouseMove, this));
        $(document).on('mouseup', $.proxy(this._detachDragEvents, this));
        $(document).on('selectstart', $.proxy(this._onSelectStart, this));
    },

    /**
     * 마우스 up 이벤트가 발생하여 selection 이 끝날 때, document 에 달린 이벤트 핸들러를 제거한다.
     */
    _detachDragEvents: function() {
        this.grid.selectionModel.stopAutoScroll();
        $(document).off('mousemove', $.proxy(this._onMouseMove, this));
        $(document).off('mouseup', $.proxy(this._detachDragEvents, this));
        $(document).off('selectstart', $.proxy(this._onSelectStart, this));
    },

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
     * mousedown 이 일어난 지점부터의 거리를 구한다.
     * @param {event} mouseMoveEvent 이벤트 객체
     * @return {number} 처음 위치좌표로 부터의 거리.
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
     * model 변경 시 이벤트 핸들러
     * @param {object} model - 변화가 일어난 모델 인스턴스
     * @param {jQuery} $tr - jquery object for tr element
     */
    onModelChange: function(model, $tr) {
        var editType,
            cellInstance;

        _.each(model.changed, function(cellData, columnName) {
            if (columnName !== '_extraData') {
                editType = this._getEditType(columnName, cellData);
                cellInstance = this.grid.cellFactory.getInstance(editType);
                cellInstance.onModelChange(cellData, $tr);
            }
        }, this);
    },

    /**
     * cellData 의 isEditable 프로퍼티에 따른 editType 을 반환한다.
     * editable 프로퍼티가 false 라면 normal type 으로 설정한다.
     * @param {string} columnName 컬럼명
     * @param {Object} cellData 셀 데이터
     * @return {string} cellFactory 에서 사용될 editType
     * @private
     */
    _getEditType: function(columnName, cellData) {
        var editType = this.grid.columnModel.getEditType(columnName);
        if (!cellData.isEditable && columnName !== '_number') {
            editType = 'normal';
        }
        return editType;
    },

    /**
     * 등록된 Cell Painter들의 이름을 key로 갖고, instance를 value로 갖는 객체를 반환한다.
     * @returns {object} CellFactory
     */
    getCellPainters: function() {
        return this.grid.cellFactory.instances;
    },

    /**
     * tr html 마크업을 반환한다.
     * @param {object} model 마크업을 생성할 모델 인스턴스
     * @return {string} tr 마크업 문자열
     */
    getHtml: function(model) {
        var columnModelList = this.columnModelList,
            cellFactory = this.grid.cellFactory,
            html = '',
            columnName, cellData, editType, cellInstance;

        if (ne.util.isUndefined(model.get('rowKey'))) {
           return html;
        }

        _.each(columnModelList, function(columnModel) {
            columnName = columnModel['columnName'];
            cellData = model.get(columnName);
            /* istanbul ignore else */
            if (cellData && cellData['isMainRow']) {
                editType = this._getEditType(columnName, cellData);
                cellInstance = cellFactory.getInstance(editType);
                html += cellInstance.getHtml(cellData);
            }
        }, this);

        return this.baseTemplate({
            key: model.get('rowKey'),
            height: this.grid.dimensionModel.get('rowHeight') + RowPainter._extraHeight,
            contents: html,
            className: ''
        });
    },

    static: {
        /**
         * IE7에서만 TD의 border만큼 높이가 늘어나는 버그에 대한 예외처리를 위한 값
         * @memberof RowPainter
         * @static
         */
        _extraHeight: (function() {
            var value = 0;
            if (ne.util.browser.msie && ne.util.browser.version === 7) {
                // css에서 IE7에 대해서만 padding의 높이를 위아래 1px씩 주고 있음 (border가 생겼을 때는 0)
                value = -2;
            }
            return value;
        }())
    }
});

module.exports = RowPainter;
