
    /**
     * Collection 의 변화를 감지하는 클래스
     */
    View.RowList = View.Base.extend({
        initialize: function(attributes) {
            View.Base.prototype.initialize.apply(this, arguments);
            this.setOwnProperties({
                whichSide: (attributes && attributes.whichSide) || 'R',
                timeoutIdForCollection: 0,
                rowRenderer: null
            });
            this._createRowRenderer();
            this.listenTo(this.grid.renderModel, 'rowListChanged', this.render, this);
        },

        _createRowRenderer: function() {
            this.rowRenderer = this.createView(View.Renderer.Row, {
                grid: this.grid,
                $parent: this.$el,
                collection: this.collection,
                whichSide: this.whichSide
            });
        },
        render: function() {
            var html = '';
            var start = new Date();
            console.log('View.RowList.render start');
            this.rowRenderer.detachHandler();
            this.destroyChildren();
            this._createRowRenderer();
            //get html string
            this.collection.forEach(function(row) {
                html += this.rowRenderer.getHtml(row);
            }, this);
            this.$el.html('').prepend(html);
            this.rowRenderer.attachHandler();

            var end = new Date();
            console.log('View.RowList.addAll end', end - start);
            return this;
        }
    });
