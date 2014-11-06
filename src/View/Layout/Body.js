    /**
     * body layout 뷰
     *
     * @type {*|void}
     */
    View.Layout.Body = View.Base.extend({
        tagName: 'div',
        className: 'data',
        template: _.template('' +
                '<div class="table_container" style="top: 0px">' +
                '    <table width="100%" border="0" cellspacing="1" cellpadding="0" bgcolor="#EFEFEF">' +
                '        <colgroup><%=colGroup%></colgroup>' +
                '        <tbody></tbody>' +
                '    </table>' +
                '</div>'),
        events: {
            'scroll': '_onScroll',
            'mousedown': '_onMouseDown'
        },
        initialize: function(attributes) {
            View.Base.prototype.initialize.apply(this, arguments);
            this.setOwnProperties({
                whichSide: attributes && attributes.whichSide || 'R',
                isScrollSync: false
            });

            this.listenTo(this.grid.dimensionModel, 'columnWidthChanged', this._onColumnWidthChanged, this)
                .listenTo(this.grid.dimensionModel, 'change:bodyHeight', this._onBodyHeightChange, this)

                .listenTo(this.grid.renderModel, 'change:scrollTop', this._onScrollTopChange, this)
                .listenTo(this.grid.renderModel, 'change:scrollLeft', this._onScrollLeftChange, this)
                .listenTo(this.grid.renderModel, 'beforeRefresh', this._onBeforeRefresh, this)
                .listenTo(this.grid.renderModel, 'rowListChanged', this._onRowListRender, this)
                .listenTo(this.grid.renderModel, 'columnModelChanged', this._onRowListRender, this);

//                .listenTo(this.grid.renderModel, 'beforeRefresh', this._onTopChange, this);

        },
        _onBodyHeightChange: function(model, value) {
            this.$el.css('height', value + 'px');
        },
        /**
         * columnWidth change 핸들러
         * @private
         */
        _onColumnWidthChanged: function() {
            var columnWidthList = this.grid.dimensionModel.getColumnWidthList(this.whichSide),
                $colList = this.$el.find('col');
            for (var i = 0; i < $colList.length; i++) {
                $colList.eq(i).css('width', columnWidthList[i] + 'px');
            }
        },
        /**
         * MouseDown event handler
         * @param {event} mouseDownEvent
         * @private
         */
        _onMouseDown: function(mouseDownEvent) {
            var focused, pos, selection = this.grid.selection;
            if (mouseDownEvent.shiftKey) {
                focused = this.grid.focusModel.indexOf(true);
                if (!selection.hasSelection()) {
                    selection.startSelection(focused.rowIdx, focused.columnIdx);
                }

                selection.attachMouseEvent(mouseDownEvent.pageX, mouseDownEvent.pageY);
                pos = selection.getIndexFromMousePosition(mouseDownEvent.pageX, mouseDownEvent.pageY);
                selection.updateSelection(pos.row, pos.column);
                this.grid.focusAt(pos.row, pos.column);
            } else {
                selection.endSelection();
                this.grid.selection.attachMouseEvent(mouseDownEvent.pageX, mouseDownEvent.pageY);
            }
        },
        /**
         * Scroll Event Handler
         * @param {event} scrollEvent
         * @private
         */
        _onScroll: function(scrollEvent) {
            if (!this.isScrollSync) {
                var obj = {};
                obj['scrollTop'] = scrollEvent.target.scrollTop;
                if (this.whichSide === 'R') {
                    obj['scrollLeft'] = scrollEvent.target.scrollLeft;
                }
                this.grid.renderModel.set('$scrollTarget', this.$el);
                this.grid.renderModel.set(obj);
            } else {
                this.isScrollSync = false;
            }
        },
        /**
         * Render model 의 Scroll left 변경 핸들러
         * @param {object} model
         * @param {Number} value
         * @private
         */
        _onScrollLeftChange: function(model, value) {
            if (this.whichSide === 'R') {
                this.el.scrollLeft = value;
            }
        },
        /**
         * Render model 의 Scroll top 변경 핸들러
         * @param {object} model
         * @param {Number} value
         * @private
         */
        _onScrollTopChange: function(model, value) {
            this.el.scrollTop = value;
        },

        /**
         * Render model 의 top 변경 핸들러
         * @private
         */
        _onTopChange: function() {
//            var top = this.grid.renderModel.get('top');
//            this.$el.children('.table_container').css('top', top + 'px');
        },
        _onBeforeRefresh: function() {
            this.isScrollSync = true;
            this.el.scrollTop = this.grid.renderModel.get('scrollTop');
        },
        _onRowListRender: function(){
            var top = this.grid.renderModel.get('top');
            this.$el.children('.table_container').css('top', top + 'px');
        },
        _getViewCollection: function() {
            return this.grid.renderModel.getCollection(this.whichSide);
        },
        render: function() {
            var selection, rowList;
            this.destroyChildren();
            this.$el.css({
                    height: this.grid.dimensionModel.get('bodyHeight')
                }).html(this.template({
                    colGroup: this._getColGroupMarkup()
                }));

            rowList = this.createView(View.RowList, {
                grid: this.grid,
                collection: this._getViewCollection(),
                el: this.$el.find('tbody'),
                whichSide: this.whichSide
            });
            rowList.render();

            //selection 을 랜더링한다.
            selection = this.addView(this.grid.selection.createLayer(this.whichSide));
            this.$el.append(selection.render().el);

            return this;
        },
        _getColGroupMarkup: function() {
            var columnModel = this.grid.columnModel,
                dimensionModel = this.grid.dimensionModel,
                columnWidthList = dimensionModel.getColumnWidthList(this.whichSide),
                columnModelList = columnModel.getVisibleColumnModelList(this.whichSide);

            var html = '';
            for (var i = 0, len = columnWidthList.length; i < len; i++) {
                html += '<col columnname="' + columnModelList[i]['columnName'] + '" style="width:' + columnWidthList[i] + 'px">';
            }
            return html;
        }
    });
