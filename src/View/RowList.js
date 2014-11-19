
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
            this.listenTo(this.grid.renderModel, 'rowListChanged', this._onRowListChange, this);
        },

        _createRowPainter: function() {
            this.rowPainter = this.createView(View.Painter.Row, {
                grid: this.grid,
                $parent: this.$el,
                collection: this.collection,
                whichSide: this.whichSide
            });
        },
        _onRowListChange: function() {
            var $scrollTarget = this.grid.renderModel.get('$scrollTarget');
            this.render();
        },
        render: function() {
            var html = '',
                firstRow = this.collection.at(0);
            var start = new Date();
//            console.log('View.RowList.render start');
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

            var end = new Date();
//            console.log('View.RowList.addAll end', end - start);
            this._showLayer();
            return this;
        },
        _showLayer: function() {
            if (this.grid.dataModel.length) {
                this.grid.hideGridLayer();
            } else {
                this.grid.showGridLayer('empty');
            }
        }
    });
