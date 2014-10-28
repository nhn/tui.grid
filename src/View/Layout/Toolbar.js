    /**
     *  툴바 영역
     *  @class
     */
    View.Layout.Toolbar = View.Base.extend({
        tagName: 'div',
        className: 'toolbar',
        initialize: function() {
            View.Base.prototype.initialize.apply(this, arguments);
        },
        render: function() {
            this.destroyChildren();
            var option = this.grid.option('toolbar'),
                resizeHandler, controlPannel;

            this.$el.empty();
            if (option && option.hasControlPannel) {
                controlPannel = this.createView(View.Layout.Toolbar.ControlPannel, {
                    grid: this.grid
                });
                this.$el.append(controlPannel.render().el).css('display', 'block');
            }

            if (option && option.hasResizeHandler) {
                resizeHandler = this.createView(View.Layout.Toolbar.ResizeHandler, {
                    grid: this.grid
                });
                this.$el.append(resizeHandler.render().el).css('display', 'block');
            }
            return this;
        }
    });
    /**
     * 툴바 영역 resize handler
     * @class
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

            bodyHeight = Math.max(bodyHeight, rowHeight + dimensionModel.getScrollXSize());
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
        render: function() {
            this.destroyChildren();
            this.$el.html(this.template());
            return this;
        }
    });
    /**
     * control pannel
     * @class
     */
    View.Layout.Toolbar.ControlPannel = View.Base.extend({
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
        initialize: function() {
            View.Base.prototype.initialize.apply(this, arguments);
        },
        render: function() {
            this.destroyChildren();
            this.$el.html(this.template());
            return this;
        }
    });
