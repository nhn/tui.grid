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
                whichSide: attributes && attributes.whichSide || 'R'
            });
            this.listenTo(this.grid.renderModel, 'change:scrollTop', this._onScrollTopChange, this);
            this.listenTo(this.grid.renderModel, 'change:scrollLeft', this._onScrollLeftChange, this);
            this.listenTo(this.grid.renderModel, 'beforeRefresh', this._onBeforeRefresh, this);
            this.listenTo(this.grid.renderModel, 'change:top', this._onTopChange, this);
            this.listenTo(this.grid.dimensionModel, 'columnWidthChanged', this._onColumnWidthChanged, this);
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
            this.grid.selection.attachMouseEvent(mouseDownEvent.pageX, mouseDownEvent.pageY);
        },
        /**
         * Scroll Event Handler
         * @param {event} scrollEvent
         * @private
         */
        _onScroll: function(scrollEvent) {
            var obj = {};
            obj['scrollTop'] = scrollEvent.target.scrollTop;
            if (this.whichSide === 'R') {
                obj['scrollLeft'] = scrollEvent.target.scrollLeft;
            }
            this.grid.renderModel.set(obj);
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
         * @param {object} model
         * @param {Number} value
         * @private
         */
        _onTopChange: function(model, value) {
            this.$el.children('.table_container').css('top', value + 'px');
        },
        _onBeforeRefresh: function() {
            this.el.scrollTop = this.grid.renderModel.get('scrollTop');
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
