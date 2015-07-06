/**
 * @fileoverview RowList View
 * @author NHN Ent. FE Development Team
 */
/**
 * RowList View.
 * Collection 의 변화를 감지한다.
 * @constructor View.RowList
 */
View.RowList = View.Base.extend(/**@lends View.RowList.prototype */{
    /**
     * 초기화 함수
     * @param {object} options 옵션 객체
     *      @param {string} [options.whichSide='R']   어느 영역에 속하는 rowList 인지 여부. 'L|R' 중 하나를 지정한다.
     */
    initialize: function(options) {
        View.Base.prototype.initialize.apply(this, arguments);
        this.grid.dataModel.sortOptions;

        this.setOwnProperties({
            whichSide: (options && options.whichSide) || 'R',
            timeoutIdForCollection: 0,
            timeoutIdForFocusClipboard: 0,
            sortOptions: _.clone(this.grid.dataModel.sortOptions),
            renderedRowKeys: null,
            rowPainter: null
        });
        this._createRowPainter();
        this.listenTo(this.grid.renderModel, 'rowListChanged', this.render, this);
    },
    /**
     * Rendering 에 사용할 RowPainter Instance 를 생성한다.
     * @private
     */
    _createRowPainter: function() {
        this.rowPainter = this.createView(View.Painter.Row, {
            grid: this.grid,
            $parent: this.$el,
            collection: this.collection,
            whichSide: this.whichSide
        });
    },

    /**
     * 기존에 생성되어 있던 TR요소들 중 새로 렌더링할 데이터와 중복되지 않은 목록의 TR요소만 삭제한다.
     * @param {array} dupRowKeys 중복된 데이터의 rowKey 목록
     */
    _removeOldRows: function(dupRowKeys) {
        var firstIdx = _.indexOf(this.renderedRowKeys, dupRowKeys[0]);
            lastIdx = _.indexOf(this.renderedRowKeys, _.last(dupRowKeys)),
            $rows = this.$el.children('tr');

        $rows.slice(0, firstIdx).remove();
        $rows.slice(lastIdx + 1).remove();
    },

    /**
     * 기존의 렌더링된 데이터와 중복되지 않은 목록에 대해서만 TR요소를 추가한다.
     * @param {array} rowKeys 렌더링할 데이터의 rowKey 목록
     * @param {array} dupRowKeys 중복된 데이터의 rowKey 목록
     */
    _appendNewRows: function(rowKeys, dupRowKeys) {
        var beforeRows = this.collection.slice(0, _.indexOf(rowKeys, dupRowKeys[0])),
            afterRows = this.collection.slice(_.indexOf(rowKeys, _.last(dupRowKeys)) + 1);

        this.$el.prepend(this._getRowsHtml(beforeRows));
        this.$el.append(this._getRowsHtml(afterRows));
    },

    /**
     * 전체 행목록을 갱신한다.
     */
    _resetRows: function() {
        var html = this._getRowsHtml(this.collection.models)

        // Tbody에 innerHTML을 사용할 수 없는 경우 jquery의 append() 명령을 사용한다.
        // (Tbody의 대해서는 jquery의 html() 내부적으로 append() 명령을 사용함)
        if (View.RowList.isInnerHtmlOfTbodyReadOnly) {
            this.$el.empty().append(html);
        } else {
            this.$el[0].innerHTML = html;
        }
    },

    /**
     * 행데이터 목록을 받아, HTML 문자열을 생성해서 반환한다.
     * @param rows {Model.Row[]} 행데이터 목록
     * @return {string} 생성된 HTML 문자열
     */
    _getRowsHtml: function(rows) {
        var html = _.reduce(rows, function(memo, row) {
            return memo + this.rowPainter.getHtml(row);
        }, '', this);

        return html;
    },

    /**
     * timeout을 사용해 일정 시간이 지난 후 포커스를 Clipboard로 옮긴다.
     * @param {number} delay 지연시킬 시간 (ms)
     */
    _focusClipboard: function(delay) {
        clearTimeout(this.timeoutIdForFocusClipboard);
        this.timeoutIdForFocusClipboard = setTimeout($.proxy(function() {
            this.grid.focusClipboard();
        }, this), delay);
    },

    /**
     * 랜더링한다.
     * @return {View.RowList} this 객체
     */
    render: function() {
        var rowKeys = this.collection.pluck('rowKey'),
            sortOptions = _.clone(this.grid.dataModel.sortOptions),
            isReset = false,
            dupRowKeys;

        // 정렬방식이 변경된 경우는 무조건 새로 그린다.
        if (!_.isEqual(sortOptions, this.sortOptions)) {
            isReset = true;
        } else {
            dupRowKeys = _.intersection(rowKeys, this.renderedRowKeys);
            if (_.isEmpty(rowKeys) || _.isEmpty(dupRowKeys) ||
                // 중복된 데이터가 80% 이상인 경우에는 remove/append 하는 것보다 innerHTML을 사용하는 게 더 빠름
                (!View.RowList.isInnerHtmlOfTbodyReadOnly && dupRowKeys.length / rowKeys.length > 0.8)) {
                isReset = true;
            }
        }

        if (isReset) {
            this._resetRows();
        } else {
            this._removeOldRows(dupRowKeys);
            this._appendNewRows(rowKeys, dupRowKeys);
        }

        this.rowPainter.detachHandlerAll();
        this.destroyChildren();
        this._createRowPainter();

        this.renderedRowKeys = rowKeys;
        this.sortOptions = sortOptions;

        this.rowPainter.attachHandlerAll();
        this.rowPainter.triggerResizeEventOnTextCell();

        this._focusClipboard(10);
        this._showLayer();

        return this;
    },
    /**
     * 데이터가 있다면 Layer 를 노출하고, 없는 경우 데이터 없음 레이어를 노출한다.
     * @private
     */
    _showLayer: function() {
        if (this.grid.dataModel.length) {
            this.grid.hideGridLayer();
        } else {
            this.grid.showGridLayer('empty');
        }
    }
    ///**
    // * selection 영역의 mousedown 이벤트
    // * @param {Event} mouseDownEvent
    // * @private
    // */
    //_onMouseDown: function(mouseDownEvent) {
    //    this.grid.selection.onMouseDown(mouseDownEvent);
    //}
}, {
    /**
     * @static
     * tbody 요소의 innerHTML이 읽기전용인지 여부
     */
    isInnerHtmlOfTbodyReadOnly: (ne.util.browser.msie && ne.util.browser.version <= 9)
});
