    /**
     * right side 프레임 클래스
     * @constructor
     */
    View.Layout.Frame.Rside = View.Layout.Frame.extend({
        className: 'rside_area',
        /**
         * 초기화 함수
         * @param {Object} attributes
         */
        initialize: function(attributes) {
            View.Layout.Frame.prototype.initialize.apply(this, arguments);
            this.setOwnProperties({
                whichSide: 'R'
            });
        },
        /**
         * 컬럼 width 값이 변경되었을때 이벤트 핸들러
         * @private
         */
        _onColumnWidthChanged: function() {
            var dimensionModel = this.grid.dimensionModel,
                marginLeft = dimensionModel.get('lsideWidth'),
                width = dimensionModel.get('rsideWidth');

            this.$el.css({
                width: width + 'px',
                marginLeft: marginLeft + 'px'
            });
        },
        /**
         * rendering 하기 전에 수행하는 함수
         * @private
         */
        beforeRender: function() {
            var dimensionModel = this.grid.dimensionModel,
                marginLeft = dimensionModel.get('lsideWidth'),
                width = dimensionModel.get('rsideWidth');

            this.$el.css({
                display: 'block',
                width: width + 'px',
                marginLeft: marginLeft + 'px'
            });
        },
        /**
         * rendering 하기 전에 수행하는 함수
         * @private
         */
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
            }
        }
    });

    /**
     * virtual scrollbar
     *
     * @constructor
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
        /**
         * mousedown 이벤트 핸들러
         * rendering 성능 향상을 위해 document 에 mouseup 이벤트 핸들러를 바인딩한다.
         * @private
         */
        _onMouseDown: function() {
            this.hasFocus = true;
            $(document).on('mouseup', $.proxy(this._onMouseUp, this));
        },
        /**
         * mouseup 이벤트 핸들러
         * 바인딩 해제한다.
         * @private
         */
        _onMouseUp: function() {
            this.hasFocus = false;
            $(document).off('mouseup', $.proxy(this._onMouseUp, this));
        },
        /**
         * scroll 이벤트 발생시 renderModel 의 scroll top 값을 변경하여 frame 과 body 의 scrollTop 값을 동기화한다.
         * @param {event} scrollEvent
         * @private
         */
        _onScroll: function(scrollEvent) {
            clearTimeout(this.timeoutForScroll);
            if (this.hasFocus) {
                this.timeoutForScroll = setTimeout($.proxy(function() {
                    this.grid.renderModel.set('scrollTop', scrollEvent.target.scrollTop);
                }, this), 0);
            }
        },
        /**
         * 크기 값이 변경될 때 해당 사항을 반영한다.
         * @param {event} model
         * @private
         */
        _onDimensionChange: function(model) {
            if (model.changed['headerHeight'] || model.changed['bodyHeight']) {
                this.render();
            }
        },
        /**
         * scrollTop 이 변경된다면 scrollTop 값을 갱신하고,
         * scrollTop 값 자체가 잘못된 경우 renderModel 의 scrollTop 값을 정상값으로 갱신한다.
         * @param {object} model
         * @param {number} value
         * @private
         */
        _onScrollTopChange: function(model, value) {
            var scrollTop;
            this.el.scrollTop = value;
            scrollTop = this.el.scrollTop;
            if (scrollTop !== value) {
                this.grid.renderModel.set('scrollTop', scrollTop);
            }
        },
        /**
         * 랜더링한다.
         * @return {View.Layout.Frame.Rside.VirtualScrollBar}
         */
        render: function() {
            var grid = this.grid;
            this.$el.css({
                height: grid.dimensionModel.get('bodyHeight') - grid.scrollBarSize,
                top: grid.dimensionModel.get('headerHeight'),
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
            var grid = this.grid,
                rowHeight = grid.dimensionModel.get('rowHeight'),
                rowCount = grid.dataModel.length,
                height = rowHeight * grid.dataModel.length + (rowCount + 1);

            this.$el.find('.content').height(height);
        },
        /**
         * 소멸자
         */
        destroy: function() {
            this._onMouseUp();
            this.destroyChildren();
            this.remove();
        }
    });
