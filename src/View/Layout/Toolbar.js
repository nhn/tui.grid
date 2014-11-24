    /**
     *  툴바 영역
     *  @constructor
     */
    View.Layout.Toolbar = View.Base.extend({
        tagName: 'div',
        className: 'toolbar',
        /**
         * 초기화 함수
         */
        initialize: function() {
            View.Base.prototype.initialize.apply(this, arguments);
            this.setOwnProperties({
                controlPanel: null,
                resizeHandler: null,
                pagination: null
            });
        },
        /**
         * 랜더링한다.
         * @return {View.Layout.Toolbar}
         */
        render: function() {
            this.destroyChildren();
            var option = this.grid.option('toolbar'),
                resizeHandler, controlPanel, pagination;

            this.$el.empty();
            if (option && option.hasControlPanel) {
                controlPanel = this.createView(View.Layout.Toolbar.ControlPanel, {
                    grid: this.grid
                });
                this.$el.append(controlPanel.render().el).css('display', 'block');
            }

            if (option && option.hasResizeHandler) {
                resizeHandler = this.createView(View.Layout.Toolbar.ResizeHandler, {
                    grid: this.grid
                });
                this.$el.append(resizeHandler.render().el).css('display', 'block');
            }

            if (option && option.hasPagination) {
                pagination = this.createView(View.Layout.Toolbar.Pagination, {
                    grid: this.grid
                });
                this.$el.append(pagination.render().el).css('display', 'block');
            }
            this.setOwnProperties({
                controlPanel: controlPanel,
                resizeHandler: resizeHandler,
                pagination: pagination
            });
            return this;
        }
    });
    /**
     * control panel
     * @constructor
     */
    View.Layout.Toolbar.ControlPanel = View.Base.extend({
        tagName: 'div',
        className: 'btn_setup',
        template: _.template(
                '<a href="#" class="excel_download_button btn_text excel_all" style="display: inline-block;">' +
                '<span><em class="f_bold p_color5">전체엑셀다운로드</em></span>' +
                '</a>' +
                '<a href="#" class="excel_download_button btn_text excel_grid" style="display: inline-block;">' +
                '<span><em class="excel">엑셀다운로드</em></span>' +
                '</a>' +
                '<a href="#" class="grid_configurator_button btn_text" style="display: none;">' +
                '<span><em class="grid">그리드설정</em></span>' +
                '</a>'),
        /**
         * 초기화 함수
         */
        initialize: function() {
            View.Base.prototype.initialize.apply(this, arguments);
        },
        /**
         * 랜더링한다.
         * @return {View.Layout.Toolbar.ControlPanel}
         */
        render: function() {
            this.destroyChildren();
            this.$el.html(this.template());
            return this;
        }
    });
    /**
     * 툴바 영역 resize handler
     * @constructor
     */
    View.Layout.Toolbar.ResizeHandler = View.Base.extend({
        tagName: 'div',
        className: 'height_resize_bar',
        events: {
            'mousedown': '_onMouseDown'
        },
        template: _.template('<a href="#" class="height_resize_handle">높이 조절</a>'),
        initialize: function() {
            View.Base.prototype.initialize.apply(this, arguments);
        },
        /**
         * document 에 mousemove, mouseup 이벤트 핸들러를 추가한다.
         * @private
         */
        _attachMouseEvent: function() {
            $(document).on('mousemove', $.proxy(this._onMouseMove, this));
            $(document).on('mouseup', $.proxy(this._onMouseUp, this));
            $(document).on('selectstart', $.proxy(this._onSelectStart, this));
        },
        /**
         * document 에 mousemove, mouseup 이벤트 핸들러를 추가한다.
         * @private
         */
        _detachMouseEvent: function() {
            $(document).off('mousemove', $.proxy(this._onMouseMove, this));
            $(document).off('mouseup', $.proxy(this._onMouseUp, this));
            $(document).off('selectstart', $.proxy(this._onSelectStart, this));
        },
        /**
         * mousedown 이벤트 핸들러
         * @param {event} mouseDownEvent
         * @private
         */
        _onMouseDown: function(mouseDownEvent) {
            mouseDownEvent.preventDefault();
            $(document.body).css('cursor', 'row-resize');
            this.grid.updateLayoutData();
            this._attachMouseEvent();
        },
        /**
         * mousemove 이벤트 핸들러
         * @param {event} mouseMoveEvent
         * @private
         */
        _onMouseMove: function(mouseMoveEvent) {
            var dimensionModel = this.grid.dimensionModel,
                offsetTop = dimensionModel.get('offsetTop'),
                headerHeight = dimensionModel.get('headerHeight'),
                rowHeight = dimensionModel.get('rowHeight'),
                toolbarHeight = dimensionModel.get('toolbarHeight'),
                bodyHeight = mouseMoveEvent.pageY - offsetTop - headerHeight - toolbarHeight;

            bodyHeight = Math.max(bodyHeight, rowHeight + dimensionModel.getScrollXHeight());
            dimensionModel.set({
                bodyHeight: bodyHeight
            });
        },
        /**
         * mouseup 이벤트 핸들러
         * @private
         */
        _onMouseUp: function() {
            $(document.body).css('cursor', 'default');
            this._detachMouseEvent();
        },
        /**
         * selection start 이벤트 핸들러
         * @return {boolean}
         * @private
         */
        _onSelectStart: function(e) {
            e.preventDefault();
            return false;
        },
        /**
         * 랜더링한다.
         * @return {View.Layout.Toolbar.ResizeHandler}
         */
        render: function() {
            this.destroyChildren();
            this.$el.html(this.template());
            return this;
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
    /**
     * Pagination 영역
     * @constructor
     */
    View.Layout.Toolbar.Pagination = View.Base.extend({
        tagName: 'div',
        className: 'pagination',
        template: _.template('' +
            '<a href="#" class="pre_end">맨앞</a>' +
            '<a href="#" class="pre">이전</a> ' +
            '<a href="#" class="next">다음</a>' +
            '<a href="#" class="next_end">맨뒤</a>'
        ),
        /**
         * 초기화 한다.
         */
        initialize: function() {
            View.Base.prototype.initialize.apply(this, arguments);
            this.setOwnProperties({
                instance: null
            });
        },
        /**
         * pagination 을 rendering 한다.
         * @return {View.Layout.Toolbar.Pagination}
         */
        render: function() {
            this.destroyChildren();
            this.$el.empty().html(this.template());
            this._setPaginationInstance();
            return this;
        },
        /**
         * pagination instance 를 설정한다.
         * @private
         */
        _setPaginationInstance: function() {
            var PaginationClass = ne && ne.Component && ne.Component.Pagination,
                pagination = this.instance;
            if (!pagination && PaginationClass) {
                pagination = new PaginationClass({
                    itemCount: 1,
                    itemPerPage: 1
                }, this.$el);
            }
            this.setOwnProperties({
                instance: pagination
            });
        }
    });

