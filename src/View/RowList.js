/**
 * @fileoverview RowList View
 * @author soonyoung.park@nhnent@nhnent.com (Soonyoung Park)
 */
    /**
     * RowList View.
     * Collection 의 변화를 감지한다.
     * @constructor View.RowList
     */
    View.RowList = View.Base.extend(/**@lends View.RowList.prototype */{
        /**
         * 초기화 함수
         * @param {object} options
         *      @param {string} [options.whichSide='R']   어느 영역에 속하는 rowList 인지 여부. 'L|R' 중 하나를 지정한다.
         */
        initialize: function(options) {
            View.Base.prototype.initialize.apply(this, arguments);
            this.setOwnProperties({
                whichSide: (options && options.whichSide) || 'R',
                timeoutIdForCollection: 0,
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
         * @return {View.RowList}
         */
        render: function() {
            var html = '',
                firstRow = this.collection.at(0);

            var start = new Date();

            //alert('a');
            this.rowPainter.detachHandlerAll();
            this.destroyChildren();
            this._createRowPainter();
            //get html string
            /* istanbul ignore else */
            if (firstRow && ne.util.isExisty(firstRow.get('rowKey'))) {
                this.collection.forEach(function(row) {
                    html += this.rowPainter.getHtml(row);
                }, this);
            }
            this.$el.empty().prepend(html);
            this.rowPainter.attachHandlerAll();

            this.grid.focusClipboard();
            //var end = new Date();
            //console.log('View.RowList.addAll end', end - start);
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
    });
