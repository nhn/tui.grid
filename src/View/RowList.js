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
            rowIds: null,
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
     * 기존에 생성되어 있던 TR요소들 중 목록에서 사라진 요소들을 삭제한다.
     * @param {array}
     */
    _removeOldRows: function(dupRowIds) {
        var firstIdx = _.indexOf(this.rowIds, dupRowIds[0]);
            lastIdx = _.indexOf(this.rowIds, _.last(dupRowIds)),
            $rows = this.$el.children('tr');

        $rows.slice(0, firstIdx).remove();
        $rows.slice(lastIdx + 1).remove();
    },

    _appendNewRows: function(rowIds, dupRowIds) {
        var beforeRows = this.collection.slice(0, _.indexOf(rowIds, dupRowIds[0])),
            afterRows = this.collection.slice(_.indexOf(rowIds, _.last(dupRowIds)) + 1);

        this.$el.prepend(this._getRowsHtml(beforeRows));
        this.$el.append(this._getRowsHtml(afterRows));
    },

    /**
     * el의 innerHTML을 변경한다.
     */
    _resetInnerHTML: function(html) {
        // IE7-9 에서 tbody의 innerHTML를 직접 변경할 수 없음
        if (ne.util.browser.msie && ne.util.browser.version <= 9) {
            this.$el.empty().append(html);
        } else {
            this.$el[0].innerHTML = html;
        }
    },

    /**
     *
     */
    _getRowsHtml: function(rows) {
        var html = _.reduce(rows, function(memo, row) {
            return memo + this.rowPainter.getHtml(row);
        }, '', this);

        return html;
    },

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
        var rowIds = this.collection.pluck('rowKey'),
            sortOptions = _.clone(this.grid.dataModel.sortOptions),
            isReset = false,
            dupRowIds;

        if (!_.isEqual(sortOptions, this.sortOptions)) {
            isReset = true;
        } else {
            dupRowIds = _.intersection(rowIds, this.rowIds);
            if (_.isEmpty(rowIds) || _.isEmpty(dupRowIds) || (dupRowIds.length / rowIds.length > 0.8)) {
                isReset = true;
            }
        }

        if (isReset) {
            this._resetInnerHTML(this._getRowsHtml(this.collection.models));
        } else {
            this._removeOldRows(dupRowIds);
            this._appendNewRows(rowIds, dupRowIds);
        }

        this.rowPainter.detachHandlerAll();
        this.destroyChildren();
        this._createRowPainter();

        this.rowIds = rowIds;
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
});
