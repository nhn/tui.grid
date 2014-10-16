    /**
     * Header 레이아웃 View
     * @type {*|void}
     */
    View.Layout.Header = View.Base.extend({
        tagName: 'div',
        className: 'header',
        viewList: [],
        whichSide: 'R',
        events: {
            'click' : '_onClick'
        },
        initialize: function(attributes, option) {
            View.Base.prototype.initialize.apply(this, arguments);
            this.whichSide = attributes.whichSide;
            this.viewList = [];
            this.listenTo(this.grid.renderModel, 'change:scrollLeft', this._onScrollLeftChange, this);
            this.listenTo(this.grid.dimensionModel, 'columnWidthChanged', this._onColumnWidthChanged, this);

        },
        _onColumnWidthChanged: function() {
            var columnData = this._getColumnData(),
                columnWidthList = columnData.widthList,
                $colList = this.$el.find('col');
//            console.log(columnWidthList[0],columnWidthList[1],columnWidthList[2]);

            for (var i = 0; i < $colList.length; i++) {
                $colList.eq(i).css('width', columnWidthList[i] + 'px');
            }
        },
        _onScrollLeftChange: function(model, value) {
            if (this.whichSide === 'R') {
                this.el.scrollLeft = value;
            }
        },
        _onClick: function(clickEvent) {
            var $target = $(clickEvent.target);
            if ($target.closest('th').attr('columnname') === '_button') {

            }
        },
        template: _.template('' +
                '    <table width="100%" border="0" cellspacing="1" cellpadding="0" bgcolor="#EFEFEF">' +
                '        <colgroup><%=colGroup%></colgroup>' +
                '        <tbody><%=tBody%></tbody>' +
                '    </table>'),
        render: function() {
            this.destroyChildren();
            var resizeHandler = this.createView(View.Layout.Header.ResizeHandler, {
                whichSide: this.whichSide,
                grid: this.grid
            });
            this.$el.css({
                height: this.grid.dimensionModel.get('headerHeight')
            }).html(this.template({
                'colGroup' : this._getColGroupMarkup(),
                'tBody' : this._getTableBodyMarkup()
            }));


            this.$el.append(resizeHandler.render().el);
            return this;
        },

        _getColumnData: function() {
            var columnModel = this.grid.columnModel,
                dimensionModel = this.grid.dimensionModel,
                columnWidthList = dimensionModel.getColumnWidthList(this.whichSide),
                columnModelList = columnModel.getColumnModelList(this.whichSide);
            return {
                widthList: columnWidthList,
                modelList: columnModelList
            };
        },
        /**
         * col group 마크업을 생성한다.
         *
         * @return {string}
         * @private
         */
        _getColGroupMarkup: function() {
            var columnData = this._getColumnData(),
                columnWidthList = columnData.widthList,
                columnModelList = columnData.modelList,
                html = '';

            for (var i = 0, len = columnWidthList.length; i < len; i++) {
                html += '<col columnname="' + columnModelList[i]['columnName'] + '" style="width:' + columnWidthList[i] + 'px">';
            }
            return html;
        },
        _getHeaderHeight: function() {
            return this.grid.dimensionModel.get('headerHeight');
        },
        /**
         * Header 의 body markup 을 생성한다.
         *
         * @return {string}
         * @private
         */
        _getTableBodyMarkup: function() {
            var hierarchyList = this._getColumnHierarchyList();
            var maxRowCount = this._getHierarchyMaxRowCount(hierarchyList);
            // 가공한 컬럼 모델 리스트 정보를 바탕으로 컬럼 엘리먼트들에 대한 마크업을 구성한다.
            var columnData = this._getColumnData(),
                headerHeight = this._getHeaderHeight(),
                rowMarkupList = new Array(maxRowCount),
                headerMarkupList = [],
                height, curHeight;

            var columnModel, columnName = '', sRole = '', sHeight = '', colSpan = '', sRowSpan = '';
            var aColumnName = new Array(maxRowCount), colSpanList = [];
            var length, rowSpan = 1, title;
            var rowHeight = Util.getRowHeight(maxRowCount, headerHeight) - 1;

            for (var i = 0; i < hierarchyList.length; i++) {
                length = hierarchyList[i].length;
                curHeight = 0;
                for (var j = 0; j < length; j++) {
                    rowSpan = (length - 1 == j && (maxRowCount - length + 1) > 1) ? (maxRowCount - length + 1) : 1;
                    columnModel = hierarchyList[i][j];

                    height = rowHeight * rowSpan;
                    if (j === length - 1) {
                        height = (headerHeight - curHeight) - 2;
                    }else {
                        curHeight += height + 1;
                    }
                    if (aColumnName[j] == columnModel['columnName']) {
                        rowMarkupList[j].pop();
                        colSpanList[j] += 1;
                    }else {
                        colSpanList[j] = 1;
                    }
                    aColumnName[j] = columnModel['columnName'];
                    columnName = " columnName='" + columnModel['columnName'] + "'";
                    sHeight = " height='" + height + "'";
                    sRowSpan = rowSpan > 1 ? " rowSpan='" + rowSpan + "'" : '';
                    colSpan = (colSpanList[j] > 1) ? " colSpan='" + colSpanList[j] + "'" : '';
                    rowMarkupList[j] = rowMarkupList[j] || [];
                    title = columnModel['title'];
                    rowMarkupList[j].push('<th'+ columnName + sRole + sHeight + sRowSpan + colSpan + '>'+ title + '</th>');
                }
            }
            for (var i = 0; i < rowMarkupList.length; i++) {
                headerMarkupList.push('<tr>'+ rowMarkupList[i].join('') + '</tr>');
            }

            return headerMarkupList.join('');
        },
        /**
         * column merge 가 설정되어 있을 때 헤더의 max row count 를 가져온다.
         *
         * @param hierarchyList
         * @return {number}
         * @private
         */
        _getHierarchyMaxRowCount: function(hierarchyList) {
            var maxRowCount = 1,
                lengthList = [];
            _.each(hierarchyList, function(hierarchy, index) {
                lengthList.push(hierarchy.length);
            }, this);
            return Math.max.apply(Math, lengthList);
        },
        /**
         * column merge 가 설정되어 있을 때 헤더의 계층구조 리스트를 가져온다.
         * @return {Array}
         * @private
         */
        _getColumnHierarchyList: function() {
            var columnModelList = this._getColumnData().modelList;
            var hierarchyList = [];
            _.each(columnModelList, function(model, index) {
                hierarchyList.push(this._getColumnHierarchy(model).reverse());
            }, this);
            return hierarchyList;
        },
        /**
         * column merge 가 설정되어 있을 때 재귀적으로 돌면서 계층구조를 형성한다.
         *
         * @param columnModelData
         * @param resultList
         * @return {*|Array}
         * @private
         */
        _getColumnHierarchy: function(columnModelData, resultList) {
            var columnMerge = this.grid.option('columnMerge'),
                resultList = resultList || [];

            if (columnModelData) {
                resultList.push(columnModelData);
                if (columnMerge) {
                    for (var i = 0; i < columnMerge.length; i++) {
                        if ($.inArray(columnModelData['columnName'], columnMerge[i]['columnNameList']) !== -1) {
                            resultList = this._getColumnHierarchy(columnMerge[i], resultList);
                        }
                    }
                }
            }
            return resultList;
        }
    });
    View.Layout.Header.ResizeHandler = View.Base.extend({
        tagName: 'div',
        className: 'resize_handle_container',
        viewList: [],
        whichSide: 'R',
        events: {
            'mousedown .resize_handle' : '_onMouseDown'
        },
        initialize: function(attributes, option) {
            View.Base.prototype.initialize.apply(this, arguments);
            this.setOwnProperties({
                whichSide: attributes.whichSide,
                isResizing: false,     //현재 resize 발생 상황인지
                $target: null,         //이벤트가 발생한 target resize handler
                differenceLeft: 0,
                initialWidth: 0,
                initialOffsetLeft: 0,
                initialLeft: 0
            });
            this.listenTo(this.grid.dimensionModel, 'columnWidthChanged', this._refreshHandlerPosition, this);
        },
        _getColumnData: function() {
            var columnModel = this.grid.columnModel,
                dimensionModel = this.grid.dimensionModel,
                columnWidthList = dimensionModel.getColumnWidthList(this.whichSide),
                columnModelList = columnModel.getColumnModelList(this.whichSide);
            return {
                widthList: columnWidthList,
                modelList: columnModelList
            };
        },
        _getResizeHandler: function() {
            var columnData = this._getColumnData(),
                columnModelList = columnData.modelList,
                resizeHandleMarkupList = [],
                headerHeight = this.grid.dimensionModel.get('headerHeight');

            for (var i = 0; i < columnModelList.length; i++) {
                resizeHandleMarkupList.push("<div columnIndex='" + i + "'" +
                    " columnName='" + columnModelList[i]['columnName'] +
                    "' class='resize_handle" +
                    (i + 1 == columnModelList.length ? ' resize_handle_last' : '') +
                    "' style='height:" + headerHeight + 'px;' +
//                    "background:red;opacity:1" +
                    "'" +
                    " title='마우스 드래그를 통해 컬럼의 넓이를 변경할 수 있고,\n더블클릭을 통해 넓이를 초기화할 수 있습니다.'></div>");
            }
            return resizeHandleMarkupList.join('');

        },
        render: function() {
            var headerHeight = this.grid.dimensionModel.get('headerHeight');
            this.$el.empty();
            this.$el
                .show()
                .css({
                    'marginTop' : -headerHeight + 'px',
                    'height' : headerHeight + 'px'
                })
                .html(this._getResizeHandler());
            this._refreshHandlerPosition();
            return this;
        },
        _refreshHandlerPosition: function() {
            var columnData = this._getColumnData(),
                columnWidthList = columnData.widthList,
                $resizeHandleList = this.$el.find('.resize_handle'),
                curPos = 0;

            for (var i = 0, len = $resizeHandleList.length; i < len; i++) {
                curPos += columnWidthList[i] + 1;
                $resizeHandleList.eq(i).css('left', (curPos - 3) + 'px');
            }

        },

        _isResizing: function() {
            return !!this.isResizing;
        },
        _onMouseDown: function(mouseDownEvent) {
            this._startResizing(mouseDownEvent);
        },
        _onMouseUp: function(mouseUpEvent) {
            this._stopResizing();
            this.isResizing = false;
        },
        _onMouseMove: function(mouseMoveEvent) {
            if (this._isResizing()) {
                mouseMoveEvent.preventDefault();

                var left = mouseMoveEvent.pageX - this.initialOffsetLeft;

                this.$target.css('left', left + 'px');

                var width = this._calculateWidth(mouseMoveEvent.pageX);
                var index = parseInt(this.$target.attr('columnindex'), 10);
                this.grid.dimensionModel.setColumnWidth(this._getColumnIndex(index), width);

            }
        },
        _calculateWidth: function(pageX) {
            var difference = pageX - this.initialOffsetLeft - this.initialLeft;
            return this.initialWidth + difference;
        },
        _getColumnIndex: function(index) {
            return this.whichSide === 'R' ? index + this.grid.columnModel.get('columnFixIndex') : index;
        },
        /**
         * resize start 세팅
         * @param mouseDownEvent
         * @private
         */
        _startResizing: function(mouseDownEvent) {
            var columnData = this._getColumnData(),
                columnWidthList = columnData.widthList,
                $target = $(mouseDownEvent.target);


            this.isResizing = true;
            this.$target = $target;
            this.initialLeft = parseInt($target.css('left').replace('px', ''), 10);
            this.initialOffsetLeft = this.$el.offset().left;
            this.initialWidth = columnWidthList[$target.attr('columnindex')];
            this.grid.$el
                .bind('mousemove', $.proxy(this._onMouseMove, this))
                .bind('mouseup', $.proxy(this._onMouseUp, this))
                .css('cursor', 'col-resize');

        },
        /**
         * resize stop 세팅
         * @private
         */
        _stopResizing: function() {
            this.isResizing = false;
            this.$target = null;
            this.initialLeft = 0;
            this.initialOffsetLeft = 0;
            this.initialWidth = 0;
            this.grid.$el
                .unbind('mousemove', $.proxy(this._onMouseMove, this))
                .unbind('mouseup', $.proxy(this._onMouseUp, this))
                .css('cursor', 'default');
        }
    });
