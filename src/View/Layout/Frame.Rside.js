/**
 * @fileoverview Left Side Frame, Virtual Scrollbar 정의
 * @author soonyoung.park@nhnent@nhnent.com (Soonyoung Park)
 */
    /**
     * right side 프레임 클래스
     * @constructor View.Layout.Frame.Rside
     */
    View.Layout.Frame.Rside = View.Layout.Frame.extend(/**@lends View.Layout.Frame.Rside.prototype */{
        className: 'rside_area',
        /**
         * 초기화 함수
         */
        initialize: function() {
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
         * 랜더링하기 전 수행되는 메서드
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
         * 랜더링 후 수행되는 메서드
         * @private
         */
        afterRender: function() {
            var virtualScrollBar,
                $space = $('<div></div>'),
                height = this.grid.dimensionModel.get('headerHeight') - 2;  //높이에서 상 하단 border 값 2를 뺀다.

            $space.css({
                height: height + 'px'
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
     * @constructor View.Layout.Frame.Rside.VirtualScrollBar
     */
    View.Layout.Frame.Rside.VirtualScrollBar = View.Base.extend(/**@lends View.Layout.Frame.Rside.VirtualScrollBar.prototype */{
        tagName: 'div',
        className: 'virtual_scrollbar',
        /**
         * 생성자 함수
         */
        initialize: function() {
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
         * 마우스 down 이벤트 핸들러
         * 스크롤 핸들러를 직접 조작할 경우 rendering 성능 향상을 위해 매번 랜더링 하지 않고 한번에 랜더링 하기위해
         * hasFocus 내부 변수를 할당하고, document 에 mouseup 이벤트 핸들러를 바인딩한다.
         * @private
         */
        _onMouseDown: function() {
            this.hasFocus = true;
            $(document).on('mouseup', $.proxy(this._onMouseUp, this));
        },
        /**
         * 마우스 up 이벤트 핸들러
         * 바인딩 해제한다.
         * @private
         */
        _onMouseUp: function() {
            this.hasFocus = false;
            $(document).off('mouseup', $.proxy(this._onMouseUp, this));
        },
        /**
         * scroll 이벤트 발생시 renderModel 의 scroll top 값을 변경하여 frame 과 body 의 scrollTop 값을 동기화한다.
         * @param {event} scrollEvent 스크롤 이벤트
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
         * @param {object} model 변경이 발생한 모델
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
         * @param {object} model 변경이 발생한 모델
         * @param {number} value scrollTop 값
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
            var grid = this.grid,
                height = grid.dimensionModel.get('bodyHeight') - grid.scrollBarSize,
                top = grid.dimensionModel.get('headerHeight');
            this.$el.css({
                height: height + 'px',
                top: top + 'px',
                display: 'block'
            }).html(this.template());
            this._setHeight();
            return this;
        },
        /**
         * virtual scrollbar 의 height 를 설정한다.
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
