    View.Layout.Frame = View.Base.extend({
        tagName: 'div',
        className: 'lside_area',
        initialize: function(attributes) {
            View.Base.prototype.initialize.apply(this, arguments);
            this.listenTo(this.grid.renderModel, 'columnModelChanged', this.render, this);
            this.listenTo(this.grid.dimensionModel, 'columnWidthChanged', this._onColumnWidthChanged, this);
            this.setOwnProperties({
                header: null,
                body: null
            });
        },
        render: function() {
            this.destroyChildren();
            this.beforeRender();

            var header = this.header = this.createView(View.Layout.Header, {
                grid: this.grid,
                whichSide: this.whichSide
            });
            var body = this.body = this.createView(View.Layout.Body, {
                grid: this.grid,
                whichSide: this.whichSide
            });

            this.$el
                .append(header.render().el)
                .append(body.render().el);

            this.afterRender();
            this.trigger('afterRender');
            return this;
        },
        beforeRender: function() {
            //@TODO: override this function
        },
        afterRender: function() {
            //@TODO: override this function
        }
    });
















