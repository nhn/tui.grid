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
            this.setOwnProperties({
                timeoutForAllChecked: 0
            });
            this.listenTo(this.grid.renderModel, 'change:scrollLeft', this._onScrollLeftChange, this)
                .listenTo(this.grid.dimensionModel, 'columnWidthChanged', this._onColumnWidthChanged, this)
                .listenTo(this.grid.dataModel, 'change:_button', this._onCheckCountChange, this);

        },
        /**
         * 전체 template
         */
        template: _.template('' +
        '    <table width="100%" border="0" cellspacing="1" cellpadding="0" bgcolor="#EFEFEF">' +
        '        <colgroup><%=colGroup%></colgroup>' +
        '        <tbody><%=tBody%></tbody>' +
        '    </table>'),
        /**
         * <th> 템플릿
         */
        templateHeader: _.template('' +
        '<th columnname="<%=columnName%>" ' +
        'height="<%=height%>" ' +
        '<%if(colspan > 0) {%>' +
        'colspan=<%=colspan%> ' +
        '<%}%>' +
        '<%if(rowspan > 0) {%>' +
        'rowspan=<%=rowspan%> ' +
        '<%}%>' +
        '><%=title%></th>' +
        ''),
        /**
         * <col> 템플릿
         */
        templateCol: _.template('' +
        '<col ' +
        'columnname="<%=columnName%>" ' +
        'style="width:<%=width%>px">' +
        ''),
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
                htmlList = [];

            _.each(columnWidthList, function(width, index) {
                htmlList.push(this.templateCol({
                    columnName: columnModelList[index]['columnName'],
                    width: width
                }));
            }, this);
            return htmlList.join('');
        },
        /**
         * 그리드의 checkCount 가 변경되었을 때 수행하는 헨들러
         * @private
         */
        _onCheckCountChange: function() {
            if (this.grid.option('selectType') === 'checkbox') {
                clearTimeout(this.timeoutForAllChecked);
                this.timeoutForAllChecked = setTimeout($.proxy(this._syncCheckState, this), 10);
            }
        },
        /**
         * selectType 이 checkbox 일 때 랜더링 되는 header checkbox 엘리먼트를 반환한다.
         * @return {jQuery}
         * @private
         */
        _getHeaderMainCheckbox: function() {
            return this.$el.find('th[columnname="_button"] input');
        },
        /**
         * header 영역의 input 상태를 실제 checked 된 count 에 맞추어 반영한다.
         * @private
         */
        _syncCheckState: function() {
            if (this.grid.option('selectType') === 'checkbox') {
                var $input = this._getHeaderMainCheckbox(),
                    enableCount = 0,
                    checkedCount;
                /* istanbul ignore else */
                if ($input.length) {
                    checkedCount = this.grid.dataModel.getRowList(true).length;
                    this.grid.dataModel.forEach(function(row, key) {
                        var cellState = row.getCellState('_button');
                        if (!cellState.isDisabled && cellState.isEditable) {
                            enableCount++;
                        }
                    }, this);
                    $input.prop('checked', enableCount === checkedCount);
                }
            }
        },
        /**
         * column width 변경시 col 엘리먼트들을 조작하기 위한 헨들러
         * @private
         */
        _onColumnWidthChanged: function() {
            var columnData = this._getColumnData(),
                columnWidthList = columnData.widthList,
                $colList = this.$el.find('col');

            _.each(columnWidthList, function(columnWidth, index) {
                $colList.eq(index).css('width', columnWidth + 'px');
            });
        },
        /**
         * scroll left 값이 변경되었을 때 header 싱크를 맞추는 이벤트 핸들러
         * @param {Object} model
         * @param {Number} value
         * @private
         */
        /* istanbul ignore next: scrollLeft 를 확인할 수 없음 */
        _onScrollLeftChange: function(model, value) {
            if (this.whichSide === 'R') {
                this.el.scrollLeft = value;
            }
        },
        /**
         * 클릭 이벤트 핸들러
         * @param {Event} clickEvent
         * @private
         */
        _onClick: function(clickEvent) {
            var $target = $(clickEvent.target),
                isChecked;
            /* istanbul ignore else */
            if ($target.closest('th').attr('columnname') === '_button' && $target.is('input')) {
                isChecked = $target.prop('checked');
                isChecked ? this.grid.checkAll() : this.grid.uncheckAll();
            }
        },

        /**
         * 랜더링
         * @return {View.Layout.Header}
         */
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
        /**
         *
         * @return {{widthList: (Array|*), modelList: (Array|*)}}
         * @private
         */
        _getColumnData: function() {
            var columnModel = this.grid.columnModel,
                dimensionModel = this.grid.dimensionModel,
                columnWidthList = dimensionModel.getColumnWidthList(this.whichSide),
                columnModelList = columnModel.getVisibleColumnModelList(this.whichSide);
            return {
                widthList: columnWidthList,
                modelList: columnModelList
            };
        },

        /**
         * Header 의 body markup 을 생성한다.
         *
         * @return {string}
         * @private
         */
        _getTableBodyMarkup: function() {
            var hierarchyList = this._getColumnHierarchyList(),
                maxRowCount = this._getHierarchyMaxRowCount(hierarchyList);
            // 가공한 컬럼 모델 리스트 정보를 바탕으로 컬럼 엘리먼트들에 대한 마크업을 구성한다.
            var headerHeight = this.grid.dimensionModel.get('headerHeight'),
                rowMarkupList = new Array(maxRowCount),
                headerMarkupList = [],
                columnNameList = new Array(maxRowCount), colSpanList = [],
                rowHeight = Util.getRowHeight(maxRowCount, headerHeight) - 1,
                rowSpan = 1,
                title,
                height;

            _.each(hierarchyList, function(hierarchy, i) {
                var length = hierarchyList[i].length,
                    curHeight = 0;
                _.each(hierarchy, function(columnModel, j) {
                    var columnName = columnModel['columnName'];

                    rowSpan = (length - 1 == j && (maxRowCount - length + 1) > 1) ? (maxRowCount - length + 1) : 1;
                    height = rowHeight * rowSpan;

                    if (j === length - 1) {
                        height = (headerHeight - curHeight) - 2;
                    }else {
                        curHeight += height + 1;
                    }
                    if (columnNameList[j] == columnName) {
                        rowMarkupList[j].pop();
                        colSpanList[j] += 1;
                    }else {
                        colSpanList[j] = 1;
                    }
                    columnNameList[j] = columnName;
                    rowMarkupList[j] = rowMarkupList[j] || [];
                    rowMarkupList[j].push(this.templateHeader({
                        columnName: columnName,
                        height: height,
                        colspan: colSpanList[j],
                        rowspan: rowSpan,
                        title: columnModel['title']
                    }));
                }, this);
            }, this);
            _.each(rowMarkupList, function(rowMarkup) {
                headerMarkupList.push('<tr>' + rowMarkup.join('') + '</tr>');
            });

            return headerMarkupList.join('');
        },
        /**
         * column merge 가 설정되어 있을 때 헤더의 max row count 를 가져온다.
         *
         * @param {Array} hierarchyList
         * @return {number}
         * @private
         */
        _getHierarchyMaxRowCount: function(hierarchyList) {
            var lengthList = [0];
            _.each(hierarchyList, function(hierarchy) {
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
            _.each(columnModelList, function(model) {
                hierarchyList.push(this._getColumnHierarchy(model).reverse());
            }, this);
            return hierarchyList;
        },
        /**
         * column merge 가 설정되어 있을 때 재귀적으로 돌면서 계층구조를 형성한다.
         *
         * @param {Object} columnModelData
         * @param {Array} [resultList]
         * @return {*|Array}
         * @private
         */
        _getColumnHierarchy: function(columnModelData, resultList) {
            var columnMergeList = this.grid.option('columnMerge');
            resultList = resultList || [];
            /* istanbul ignore else */
            if (columnModelData) {
                resultList.push(columnModelData);
                /* istanbul ignore else */
                if (columnMergeList) {
                    _.each(columnMergeList, function(columnMerge, i) {
                        if ($.inArray(columnModelData['columnName'], columnMerge['columnNameList']) !== -1) {
                            resultList = this._getColumnHierarchy(columnMerge, resultList);
                        }
                    }, this);
                }
            }
            return resultList;
        }
    });

    /**
     * Reside Handler class
     * @constructor
     */
    View.Layout.Header.ResizeHandler = View.Base.extend({
        tagName: 'div',
        className: 'resize_handle_container',
        viewList: [],
        whichSide: 'R',
        events: {
            'mousedown .resize_handle' : '_onMouseDown'
        },
        /**
         * 초기화 함수
         * @param {Object} attributes
         * @param {Object} option
         */
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
        /**
         * resize handler 마크업 템플릿
         */
        template: _.template('' +
            '<div columnindex="<%=columnIndex%>" ' +
            'columnname="<%=columnName%>" ' +
            'class="resize_handle' +
            '<% if(isLast === true) ' +
            ' print(" resize_handle_last");%>' +
            '" ' +
            'style="<%=height%>" ' +
            'title="마우스 드래그를 통해 컬럼의 넓이를 변경할 수 있고,더블클릭을 통해 넓이를 초기화할 수 있습니다.">' +
            '</div>'),
        /**
         * columnWidthList 와 columnModelList 를 함께 반환한다.
         * @return {{widthList: (Array|*), modelList: (Array|*)}}
         * @private
         */
        _getColumnData: function() {
            var columnModel = this.grid.columnModel,
                dimensionModel = this.grid.dimensionModel,
                columnWidthList = dimensionModel.getColumnWidthList(this.whichSide),
                columnModelList = columnModel.getVisibleColumnModelList(this.whichSide);
            return {
                widthList: columnWidthList,
                modelList: columnModelList
            };
        },
        /**
         * resize handler 마크업을 구성한다.
         * @private
         */
        _getResizeHandlerMarkup: function() {
            var columnData = this._getColumnData(),
                columnModelList = columnData.modelList,
                resizeHandleMarkupList = [],
                headerHeight = this.grid.dimensionModel.get('headerHeight'),
                length = columnModelList.length;

            _.each(columnModelList, function(columnModel, index) {
                resizeHandleMarkupList.push(this.template({
                    columnIndex: index,
                    columnName: columnModel['columnName'],
                    isLast: index + 1 === length,
                    height: headerHeight
                }));
            }, this);
            return resizeHandleMarkupList.join('');

        },
        /**
         * 랜더링 한다.
         * @return {View.Layout.Header.ResizeHandler}
         */
        render: function() {
            var headerHeight = this.grid.dimensionModel.get('headerHeight');
            this.$el.empty();
            this.$el
                .show()
                .css({
                    'marginTop' : -headerHeight + 'px',
                    'height' : headerHeight + 'px'
                })
                .html(this._getResizeHandlerMarkup());
            this._refreshHandlerPosition();
            return this;
        },
        /**
         * 생성된 핸들러의 위치를 설정한다.
         * @private
         */
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
        /**
         * 현재 mouse move resizing 중인지 상태 flag 반환
         * @return {boolean}
         * @private
         */
        _isResizing: function() {
            return !!this.isResizing;
        },
        /**
         * mousedown 이벤트 핸들러
         * @param {event} mouseDownEvent
         * @private
         */
        _onMouseDown: function(mouseDownEvent) {
            this._startResizing(mouseDownEvent);
        },
        /**
         * mouseup 이벤트 핸들러
         * @param {event} mouseUpEvent
         * @private
         */
        _onMouseUp: function(mouseUpEvent) {
            this._stopResizing();
        },
        /**
         * mouse move 이벤트 핸들러
         * @param {event} mouseMoveEvent
         * @private
         */
        _onMouseMove: function(mouseMoveEvent) {
            /* istanbul ignore else */
            if (this._isResizing()) {
                mouseMoveEvent.preventDefault();

                var left = mouseMoveEvent.pageX - this.initialOffsetLeft,
                    width = this._calculateWidth(mouseMoveEvent.pageX),
                    index = parseInt(this.$target.attr('columnindex'), 10);

                this.$target.css('left', left + 'px');
                this.grid.dimensionModel.setColumnWidth(this._getColumnIndex(index), width);
            }
        },
        /**
         * 너비를 계산한다.
         * @param {number} pageX
         * @return {*}
         * @private
         */
        _calculateWidth: function(pageX) {
            var difference = pageX - this.initialOffsetLeft - this.initialLeft;
            return this.initialWidth + difference;
        },
        /**
         * column index 를 반환한다.
         * @param {number} index
         * @return {*}
         * @private
         */
        _getColumnIndex: function(index) {
            return this.whichSide === 'R' ? index + this.grid.columnModel.get('columnFixIndex') : index;
        },
        /**
         * resize start 세팅
         * @param {event} mouseDownEvent
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
        },
        /**
         * 소멸자
         */
        destroy: function() {
            this._stopResizing();
            this.destroyChildren();
            this.remove();
        }
    });
