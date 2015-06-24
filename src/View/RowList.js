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
        this.setOwnProperties({
            whichSide: (options && options.whichSide) || 'R',
            timeoutIdForCollection: 0,
            timeoutIdForFocusClipboard: 0,
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
     * 랜더링한다.
     * @return {View.RowList} this 객체
     */
    render: function() {
        var self = this,
            html = '',
            firstRow = this.collection.at(0);

        this.rowPainter.detachHandlerAll();
        this.destroyChildren();
        this._createRowPainter();

        if (firstRow && ne.util.isExisty(firstRow.get('rowKey'))) {
            this.collection.forEach(function(row) {
                html += this.rowPainter.getHtml(row);
            }, this);
        }
        this.$el.empty().prepend(html);
        this.rowPainter.attachHandlerAll();
        this.rowPainter.triggerResizeEventOnTextCell();

        clearTimeout(this.timeoutIdForFocusClipboard);
        this.timeoutIdForFocusClipboard = setTimeout(function() {
            if (ne.util.pick(self, 'grid', 'focusClipboard')) {
                self.grid.focusClipboard();
            }
        }, 10);

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
