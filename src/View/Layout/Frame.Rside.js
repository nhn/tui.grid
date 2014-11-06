    /**
     * 우측 frame view
     */
    View.Layout.Frame.Rside = View.Layout.Frame.extend({
        className: 'rside_area',
        initialize: function(attributes) {
            View.Layout.Frame.prototype.initialize.apply(this, arguments);
            this.setOwnProperties({
                whichSide: 'R'
            });
        },
        _onColumnWidthChanged: function() {
            var dimensionModel = this.grid.dimensionModel;
            var marginLeft = dimensionModel.get('lsideWidth');
            var width = dimensionModel.get('rsideWidth');
            this.$el.css({
                width: width + 'px',
                marginLeft: marginLeft + 'px'
            });
        },
        beforeRender: function() {
            var dimensionModel = this.grid.dimensionModel;
            var marginLeft = dimensionModel.get('lsideWidth');
            var width = dimensionModel.get('rsideWidth');

            this.$el.css({
                display: 'block',
                width: width + 'px',
                marginLeft: marginLeft + 'px'
            });
        },
        afterRender: function() {
            var virtualScrollBar,
                $space = $('<div></div>');
            $space.css({
                height: this.grid.dimensionModel.get('headerHeight') - 2
            }).addClass('space');
            this.$el.append($space);

            if (this.grid.option('notUseSmartRendering') === false) {
                virtualScrollBar = this.createView(View.Layout.Frame.Rside.VirtualScrollBar, {
                    grid: this.grid
                });
                this.$el.append(virtualScrollBar.render().el);
//                console.log(this.$el.html());
            }
        }
    });

    /**
     * virtual scrollbar
     *
     * @type {*|void|Object}
     */
    View.Layout.Frame.Rside.VirtualScrollBar = View.Base.extend({
        tagName: 'div',
        className: 'virtual_scrollbar',

        initialize: function(attributes) {
            View.Base.prototype.initialize.apply(this, arguments);
            this.setOwnProperties({
                hasFocus: false
            });
            this.listenTo(this.grid.dataModel, 'sort add remove reset', this._setHeight, this);
            this.listenTo(this.grid.dimensionModel, 'change', this._onDimensionChange, this);
            this.listenTo(this.grid.renderModel, 'change:scrollTop', this._onScrollTopChange, this);
            this.timeoutForScroll = 0;
        },
        template: _.template('<div class="content"></div>'),
        events: {
            'scroll' : '_onScroll',
            'mousedown': '_onMouseDown'
        },
        _onMouseDown: function() {
            this.hasFocus = true;
            $(document).on('mouseup', $.proxy(this._onMouseUp, this));
        },
        _onMouseUp: function() {
            this.hasFocus = false;
            $(document).off('mouseup', $.proxy(this._onMouseUp, this));
        },
        _onScroll: function(scrollEvent) {
            clearTimeout(this.timeoutForScroll);
            if (this.hasFocus) {
                this.timeoutForScroll = setTimeout($.proxy(function() {
                    this.grid.renderModel.set('$scrollTarget', this.$el);
                    this.grid.renderModel.set('scrollTop', scrollEvent.target.scrollTop);
                }, this), 0);
            }
        },
        _onDimensionChange: function(model) {
            if (model.changed['headerHeight'] || model.changed['bodyHeight']) {
                this.render();
            }
        },

        _onScrollTopChange: function(model, value) {
            var scrollTop;
            this.el.scrollTop = value;
            scrollTop = this.el.scrollTop;
            if (scrollTop !== value) {
                this.grid.renderModel.set('scrollTop', scrollTop);
            }
        },
        render: function() {
            this.$el.css({
                height: this.grid.dimensionModel.get('bodyHeight') - this.grid.scrollBarSize,
                top: this.grid.dimensionModel.get('headerHeight'),
                display: 'block'
            }).html(this.template());
            this._setHeight();
            return this;
        },
        /**
         * virtual scrollbar 의 height 를 지정한다.
         * @private
         */
        _setHeight: function() {
            var rowHeight = this.grid.dimensionModel.get('rowHeight'),
                rowCount = this.grid.dataModel.length,
                height = rowHeight * this.grid.dataModel.length + (rowCount + 1);
            this.$el.find('.content').height(height);
        }
    });
