
    /**
     * Collection 의 변화를 감지하는 클래스
     */
    View.RowList = View.Base.extend({
        initialize: function(attributes) {
            View.Base.prototype.initialize.apply(this, arguments);
            this.setOwnProperties({
                whichSide: (attributes && attributes.whichSide) || 'R',
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
         * @returns {View.RowList}
         */
        render: function() {
            var html = '',
                firstRow = this.collection.at(0);
            //var start = new Date();
            //console.log('View.RowList.render start');
            this.rowPainter.detachHandlerAll();
            this.destroyChildren();
            this._createRowPainter();
            //get html string
            if (firstRow && firstRow.get('rowKey') !== 'undefined') {
                this.collection.forEach(function(row) {
                    html += this.rowPainter.getHtml(row);
                }, this);
            }
            this.$el.html('').prepend(html);
            this.rowPainter.attachHandlerAll();

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
