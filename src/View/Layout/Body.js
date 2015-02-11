/**
 * @fileoverview Body View
 * @author soonyoung.park@nhnent@nhnent.com (Soonyoung Park)
 */
    /**
     * body layout 뷰
     *
     * @constructor View.Layout.Body
     */
    View.Layout.Body = View.Base.extend(/**@lends View.Layout.Body.prototype */{
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
        /**
         * 생성자 함수
         * @param {Object} options
         *      @param {String} [options.whichSide='R']  어느 영역의 body 인지 여부.
         */
        initialize: function(options) {
            View.Base.prototype.initialize.apply(this, arguments);
            this.setOwnProperties({
                whichSide: options && options.whichSide || 'R',
                isScrollSync: false
            });

            this.listenTo(this.grid.dimensionModel, 'columnWidthChanged', this._onColumnWidthChanged, this)
                .listenTo(this.grid.dimensionModel, 'change:bodyHeight', this._onBodyHeightChange, this)

                .listenTo(this.grid.renderModel, 'change:scrollTop', this._onScrollTopChange, this)
                .listenTo(this.grid.renderModel, 'change:scrollLeft', this._onScrollLeftChange, this)
                .listenTo(this.grid.renderModel, 'refresh', this._setTopPosition, this);
        },
        /**
         * DimensionModel 의 body Height 가 변경된 경우 element 의 height 를 조정한다.
         * @param {Object} model 변경이 일어난 model 인스턴스
         * @param {Number} value bodyHeight 값
         * @private
         */
        _onBodyHeightChange: function(model, value) {
            this.$el.css('height', value + 'px');
        },
        /**
         * 컬럼 너비 변경 이벤트 핸들러
         * @private
         */
        _onColumnWidthChanged: function() {
            var columnWidthList = this.grid.dimensionModel.getColumnWidthList(this.whichSide),
                $colList = this.$el.find('col');

            _.each(columnWidthList, function(width, index) {
                $colList.eq(index).css('width', width + 'px');
            });
        },
        /**
         * 마우스다운 이벤트 핸들러
         * @param {event} mouseDownEvent    마우스 이벤트
         * @private
         */
        _onMouseDown: function(mouseDownEvent) {
            var grid = this.grid,
                selection = grid.selection,
                focused,
                pos;

            if (mouseDownEvent.shiftKey) {
                focused = grid.focusModel.indexOf(true);

                if (!selection.hasSelection()) {
                    selection.startSelection(focused.rowIdx, focused.columnIdx);
                }

                selection.attachMouseEvent(mouseDownEvent.pageX, mouseDownEvent.pageY);
                pos = selection.getIndexFromMousePosition(mouseDownEvent.pageX, mouseDownEvent.pageY);
                selection.updateSelection(pos.row, pos.column);
                grid.focusAt(pos.row, pos.column);
            } else {
                selection.endSelection();
                selection.attachMouseEvent(mouseDownEvent.pageX, mouseDownEvent.pageY);
            }
        },
        /**
         * 스크롤 이벤트 핸들러
         * @param {event} scrollEvent   스크롤 이벤트
         * @private
         */
        _onScroll: function(scrollEvent) {
            var obj = {},
                renderModel = this.grid.renderModel;

            obj['scrollTop'] = scrollEvent.target.scrollTop;

            if (this.whichSide === 'R') {
                obj['scrollLeft'] = scrollEvent.target.scrollLeft;
            }
            renderModel.set(obj);
        },
        /**
         * Render model 의 Scroll left 변경 이벤트 핸들러
         * @param {object} model 변경이 일어난 모델 인스턴스
         * @param {Number} value scrollLeft 값
         * @private
         */
        _onScrollLeftChange: function(model, value) {
            /* istanbul ignore next: 부모 frame 이 없는 상태에서 테스트가 불가함*/
            if (this.whichSide === 'R') {
                this.el.scrollLeft = value;
            }
        },
        /**
         * Render model 의 Scroll top 변경 이벤트 핸들러
         * @param {object} model 변경이 일어난 모델 인스턴스
         * @param {Number} value scrollTop값
         * @private
         */
        _onScrollTopChange: function(model, value) {
            /* istanbul ignore next: 부모 frame 이 없는 상태에서 테스트가 불가함*/
            this.el.scrollTop = value;
        },
        /**
         * rowList 가 rendering 될 때 top 값을 조정한다.
         * @param {number} top  조정할 top 위치 값
         * @private
         */
        _setTopPosition: function(top) {
            this.$el.children('.table_container').css('top', top + 'px');
        },
        /**
         * rendering 한다.
         * @return {View.Layout.Body}   자기 자신
         */
        render: function() {
            var grid = this.grid,
                whichSide = this.whichSide,
                selection,
                rowList,
                collection = grid.renderModel.getCollection(whichSide);

            this.destroyChildren();

            if (!this.grid.option('scrollX')) {
                this.$el.css('overflow-x', 'hidden');
            }

            if (!this.grid.option('scrollY') && whichSide === 'R') {
                this.$el.css('overflow-y', 'hidden');
            }

            this.$el.css({
                    height: grid.dimensionModel.get('bodyHeight')
                }).html(this.template({
                    colGroup: this._getColGroupMarkup()
                }));

            rowList = this.createView(View.RowList, {
                grid: grid,
                collection: collection,
                el: this.$el.find('tbody'),
                whichSide: whichSide
            });
            rowList.render();

            //selection 을 랜더링한다.
            selection = this.addView(grid.selection.createLayer(whichSide));
            this.$el.append(selection.render().el);

            return this;
        },
        /**
         * Table 열 각각의 width 조정을 위한 columnGroup 마크업을 반환한다.
         * @return {string} <colgroup> 안에 들어갈 마크업 문자열
         * @private
         */
        _getColGroupMarkup: function() {
            var grid = this.grid,
                whichSide = this.whichSide,
                columnModel = grid.columnModel,
                dimensionModel = grid.dimensionModel,
                columnWidthList = dimensionModel.getColumnWidthList(whichSide),
                columnModelList = columnModel.getVisibleColumnModelList(whichSide),
                html = '';

            _.each(columnModelList, function(columnModel, index) {
                html += '<col columnname="' + columnModel['columnName'] + '" style="width:' + columnWidthList[index] + 'px">';
            });
            return html;
        }
    });
