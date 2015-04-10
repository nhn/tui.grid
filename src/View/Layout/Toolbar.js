/**
 * @fileoverview 툴바영역 클래스
 * @author soonyoung.park@nhnent@nhnent.com (Soonyoung Park)
 */
    /**
     *  툴바 영역
     *  @constructor View.Layout.Toolbar
     */
    View.Layout.Toolbar = View.Base.extend(/**@lends View.Layout.Toolbar.prototype */{
        tagName: 'div',
        className: 'toolbar',
        /**
         * 생성자 함수
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
     * 툴바 영역 컨트롤 패널 UI
     * @constructor View.Layout.Toolbar.ControlPanel
     */
    View.Layout.Toolbar.ControlPanel = View.Base.extend(/**@lends View.Layout.Toolbar.ControlPanel.prototype */{
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
         * 생성자 함수
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
     * @constructor View.Layout.Toolbar.ResizeHandler
     */
    View.Layout.Toolbar.ResizeHandler = View.Base.extend(/**@lends View.Layout.Toolbar.ResizeHandler.prototype */{
        tagName: 'div',
        className: 'height_resize_bar',
        events: {
            'mousedown': '_onMouseDown'
        },
        template: _.template('<a href="#" class="height_resize_handle">높이 조절</a>'),
        /**
         * 생성자 함수
         */
        initialize: function() {
            this.timeoutIdForResize = 0;
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
         * @param {event} mouseDownEvent 마우스 이벤트
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
         * @param {event} mouseMoveEvent 마우스 이벤트
         * @private
         */
        _onMouseMove: function(mouseMoveEvent) {
            clearTimeout(this.timeoutIdForResize);

            var dimensionModel = this.grid.dimensionModel,
                offsetTop = dimensionModel.get('offsetTop'),
                headerHeight = dimensionModel.get('headerHeight'),
                rowHeight = dimensionModel.get('rowHeight'),
                toolbarHeight = dimensionModel.get('toolbarHeight'),
                bodyHeight = mouseMoveEvent.pageY - offsetTop - headerHeight - toolbarHeight;

            bodyHeight = Math.max(bodyHeight, rowHeight + dimensionModel.getScrollXHeight());


            //매번 수행하면 성능이 느려지므로, resize 이벤트가 발생할 시 천첮히 업데이트한다.
            this.timeoutIdForResize = setTimeout(function() {
                dimensionModel.set({
                    bodyHeight: bodyHeight
                });
            }, 0);

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
         * @return {boolean}    기본 동작 방지를 위해 무조건 false 를 반환한다.
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
     * 툴바의 Pagination 영역
     * @constructor View.Layout.Toolbar.Pagination
     */
    View.Layout.Toolbar.Pagination = View.Base.extend(/**@lends Base.prototype */{
        tagName: 'div',
        className: 'pagination',
        template: _.template('' +
            '<a href="#" class="pre_end">맨앞</a>' +
            '<a href="#" class="pre">이전</a> ' +
            '<a href="#" class="next">다음</a>' +
            '<a href="#" class="next_end">맨뒤</a>'
        ),
        /**
         * 생성자 함수
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
            var PaginationClass = ne && ne.component && ne.component.Pagination,
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

