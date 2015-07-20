/**
 * @fileoverview Header 관련
 * @author NHN Ent. FE Development Team
 */
/**
 * Header 레이아웃 View
 * @constructor View.Layout.Header
 */
View.Layout.Header = View.Base.extend(/**@lends View.Layout.Header.prototype */{
    tagName: 'div',
    className: 'header',
    whichSide: 'R',
    events: {
        click: '_onClick'
    },
    /**
     * 초기화 메서드
     * @param {Object} options 옵션
     *      @param {String} [options.whichSide='R']  어느 영역의 header 인지 여부.
     */
    initialize: function(options) {
        View.Base.prototype.initialize.apply(this, arguments);
        this.whichSide = options.whichSide;
        this.setOwnProperties({
            timeoutForAllChecked: 0
        });
        this.listenTo(this.grid.renderModel, 'change:scrollLeft', this._onScrollLeftChange, this)
            .listenTo(this.grid.dimensionModel, 'columnWidthChanged', this._onColumnWidthChanged, this)
            .listenTo(this.grid.dataModel, 'change:_button', this._onCheckCountChange, this)
            .listenTo(this.grid.dataModel, 'sortChanged', this._updateBtnSortState, this);
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
    '><%=title%><%=btnSort%></th>' +
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
     * 정렬 버튼을 위한 HTML 마크업
     */
    markupBtnSort: '<a class="btn_sorting"></a>',

    /**
     * col group 마크업을 생성한다.
     *
     * @return {string} <colgroup>에 들어갈 html 마크업 스트링
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
     * @return {jQuery} _butoon 컬럼 헤더의 checkbox input 엘리먼트
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
     * @param {Object} model    변경이 발생한 model 인스턴스
     * @param {Number} value    scrollLeft 값
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
     * @param {Event} clickEvent    클릭이벤트
     * @private
     */
    _onClick: function(clickEvent) {
        var $target = $(clickEvent.target),
            columnName = $target.closest('th').attr('columnname');

        /* istanbul ignore else */
        if (columnName === '_button' && $target.is('input')) {
            if ($target.prop('checked')) {
                this.grid.checkAll();
            } else {
                this.grid.uncheckAll();
            }
        } else if ($target.is('a.btn_sorting')) {
            this.grid.sort(columnName);
        }
    },
    /**
     * 정렬 버튼의 상태를 변경한다.
     * @private
     * @param {object} sortOptions 정렬 옵션
     * @param {string} sortOptions.columnName 정렬할 컬럼명
     * @param {boolean} sortOptions.isAscending 오름차순 여부
     */
    _updateBtnSortState: function(sortOptions) {
        if (this._$currentSortBtn) {
            this._$currentSortBtn.removeClass('sorting_down sorting_up');
        }
        this._$currentSortBtn = this.$el.find('th[columnname=' + sortOptions.columnName + '] a.btn_sorting');
        this._$currentSortBtn.addClass(sortOptions.isAscending ? 'sorting_up' : 'sorting_down');
    },

    /**
     * 랜더링
     * @return {View.Layout.Header} this
     */
    render: function() {
        this.destroyChildren();

        var resizeHandler = this.createView(View.Layout.Header.ResizeHandler, {
            whichSide: this.whichSide,
            grid: this.grid
        });
        if (!this.grid.option('scrollX')) {
            this.$el.css('overflow-x', 'hidden');
        }

        if (!this.grid.option('scrollY')) {
            this.$el.css('overflow-y', 'hidden');
        }

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
     * 컬럼 정보를 반환한다.
     * @return {{widthList: (Array|*), modelList: (Array|*)}}   columnWidthList 와 columnModelList 를 함께 반환한다.
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
     * @return {string} header 의 테이블 body 영역에 들어갈 html 마크업 스트링
     * @private
     */
    _getTableBodyMarkup: function() {
        var hierarchyList = this._getColumnHierarchyList(),
            maxRowCount = this._getHierarchyMaxRowCount(hierarchyList);
        // 가공한 컬럼 모델 리스트 정보를 바탕으로 컬럼 엘리먼트들에 대한 마크업을 구성한다.
        var headerHeight = this.grid.dimensionModel.get('headerHeight'),
            rowMarkupList = new Array(maxRowCount),
            columnNameList = new Array(maxRowCount),
            colSpanList = [],
            rowHeight = Util.getRowHeight(maxRowCount, headerHeight) - 1,
            rowSpan = 1,
            height,
            headerMarkupList;

        _.each(hierarchyList, function(hierarchy, i) {
            var length = hierarchyList[i].length,
                curHeight = 0;
            _.each(hierarchy, function(columnModel, j) {
                var columnName = columnModel['columnName'];

                rowSpan = (length - 1 === j && (maxRowCount - length + 1) > 1) ? (maxRowCount - length + 1) : 1;
                height = rowHeight * rowSpan;

                if (j === length - 1) {
                    height = (headerHeight - curHeight) - 2;
                } else {
                    curHeight += height + 1;
                }
                if (columnNameList[j] === columnName) {
                    rowMarkupList[j].pop();
                    colSpanList[j] += 1;
                } else {
                    colSpanList[j] = 1;
                }
                columnNameList[j] = columnName;
                rowMarkupList[j] = rowMarkupList[j] || [];
                rowMarkupList[j].push(this.templateHeader({
                    columnName: columnName,
                    height: height,
                    colspan: colSpanList[j],
                    rowspan: rowSpan,
                    title: columnModel.title,
                    btnSort: columnModel.isSortable ? this.markupBtnSort : ''
                }));
            }, this);
        }, this);
        headerMarkupList = _.map(rowMarkupList, function(rowMarkup) {
            return '<tr>' + rowMarkup.join('') + '</tr>';
        });

        return headerMarkupList.join('');
    },
    /**
     * column merge 가 설정되어 있을 때 헤더의 max row count 를 가져온다.
     *
     * @param {Array} hierarchyList 헤더 마크업 생성시 사용될 계층구조 데이터
     * @return {number} 헤더 영역의 row 최대값
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
     * @return {Array}  계층구조 리스트
     * @private
     */
    _getColumnHierarchyList: function() {
        var columnModelList = this._getColumnData().modelList,
            hierarchyList;

        hierarchyList = _.map(columnModelList, function(columnModel) {
            return this._getColumnHierarchy(columnModel).reverse();
        }, this);

        return hierarchyList;
    },
    /**
     * column merge 가 설정되어 있을 때 재귀적으로 돌면서 계층구조를 형성한다.
     *
     * @param {Object} columnModel 컬럼모델
     * @param {Array} [resultList]  결과로 메모이제이션을 이용하기 위한 인자값
     * @return {Array} 계층구조 결과값
     * @private
     */
    _getColumnHierarchy: function(columnModel, resultList) {
        var columnMergeList = this.grid.option('columnMerge');
        resultList = resultList || [];
        /* istanbul ignore else */
        if (columnModel) {
            resultList.push(columnModel);
            /* istanbul ignore else */
            if (columnMergeList) {
                _.each(columnMergeList, function(columnMerge, i) {
                    if ($.inArray(columnModel['columnName'], columnMerge['columnNameList']) !== -1) {
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
 * @constructor View.Layout.Header.ResizeHandler
 */
View.Layout.Header.ResizeHandler = View.Base.extend(/**@lends View.Layout.Header.ResizeHandler.prototype */{
    tagName: 'div',
    className: 'resize_handle_container',
    events: {
        'mousedown .resize_handle': '_onMouseDown',
        'click .resize_handle': '_onClick'
    },
    /**
     * 초기화 함수
     * @param {Object} options
     *      @param {String} [options.whichSide='R']  어느 영역의 handler 인지 여부.
     */
    initialize: function(options) {
        View.Base.prototype.initialize.apply(this, arguments);
        this.setOwnProperties({
            whichSide: options.whichSide || 'R',
            isResizing: false,     //현재 resize 발생 상황인지
            $target: null,         //이벤트가 발생한 target resize handler
            differenceLeft: 0,
            initialWidth: 0,
            initialOffsetLeft: 0,
            initialLeft: 0
        });
        this.listenTo(this.grid.dimensionModel, 'columnWidthChanged', this._refreshHandlerPosition, this);
        if (this.grid instanceof View.Base) {
            this.listenTo(this.grid, 'rendered', $.proxy(this._refreshHandlerPosition, this, true));
            this.listenTo(this.grid.dimensionModel, 'change:width', $.proxy(this._refreshHandlerPosition, this, true));
        }
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
     * @return {String} resize handler 의 html 마크업 스트링
     * @private
     */
    _getResizeHandlerMarkup: function() {
        var columnData = this._getColumnData(),
            columnModelList = columnData.modelList,
            headerHeight = this.grid.dimensionModel.get('headerHeight'),
            length = columnModelList.length,
            resizeHandleMarkupList;

        resizeHandleMarkupList = _.map(columnModelList, function(columnModel, index) {
            return this.template({
                columnIndex: index,
                columnName: columnModel.columnName,
                isLast: index + 1 === length,
                height: headerHeight
            });
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
                'marginTop': -headerHeight + 'px',
                'height': headerHeight + 'px'
            })
            .html(this._getResizeHandlerMarkup());

        //header 가 랜더링 된 이후 widthList 를 보정 하기위해 setTimeout 을 사용한다.
        this._refreshHandlerPosition(true);
        return this;
    },
    /**
     * 생성된 핸들러의 위치를 설정한다.
     * @param {boolean} isUpdateWidthList - true이면 dimensionModel의 columnWidthList를 변경해준다.
     * @private
     */
    _refreshHandlerPosition: function(isUpdateWidthList) {
        var columnData = this._getColumnData(),
            columnWidthList = columnData.widthList,
            newColumnWidthList = [],
            $resizeHandleList = this.$el.find('.resize_handle'),
            $table = this.$el.parent().find('table:first'),
            isChanged = false,
            $handler,
            columnName,
            curPos = 0,
            border = 1,
            width;

        ne.util.forEachArray($resizeHandleList, function(item, index) {
            $handler = $resizeHandleList.eq(index);
            columnName = $handler.attr('columnname');
            width = $table.find('th[columnname="' + columnName + '"]').width();
            if (ne.util.isExisty(width)) {
                isChanged = isChanged || (width !== columnWidthList[index]);
            } else {
                width = columnWidthList[index];
            }
            curPos += width + border;
            $handler.css('left', (curPos - 3) + 'px');
            newColumnWidthList.push(width);
        });

        if (isUpdateWidthList) {
            this.grid.dimensionModel.setColumnWidthList(newColumnWidthList, this.whichSide);
        }
    },
    /**
     * 현재 mouse move resizing 중인지 상태 flag 반환
     * @return {boolean}    현재 resize 중인지 여부
     * @private
     */
    _isResizing: function() {
        return !!this.isResizing;
    },
    /**
     * mousedown 이벤트 핸들러
     * @param {event} mouseDownEvent    마우스 이벤트 객체
     * @private
     */
    _onMouseDown: function(mouseDownEvent) {
        this._startResizing(mouseDownEvent);
    },
    /**
     * click 이벤트 핸들러
     * @param {Event} clickEvent 마우스 이벤트 객체
     * @private
     */
    _onClick: function(clickEvent) {
        var $target = $(clickEvent.target),
            index = parseInt($target.attr('columnindex'), 10),
            isClicked = $target.data('isClicked');

        if (isClicked) {
            this.grid.dimensionModel.restoreColumnWidth(this._getHandlerColumnIndex(index));
            this._clearClickedFlag($target);
            this._refreshHandlerPosition(true);
        } else {
            this._setClickedFlag($target);
        }
    },
    /**
     * 더블클릭을 확인하기 위한 isClicked 플래그를 설정한다.
     * @param {jQuery} $target 설정할 타겟 엘리먼트
     * @private
     */
    _setClickedFlag: function($target) {
        $target.data('isClicked', true);
        setTimeout($.proxy(this._clearClickedFlag, this, $target), 500);
    },

    /**
     * 더블클릭을 확인하기 위한 isClicked 를 제거한다.
     * @param {jQuery} $target 설정할 타겟 엘리먼트
     * @private
     */
    _clearClickedFlag: function($target) {
        $target.data('isClicked', false);
    },

    /**
     * mouseup 이벤트 핸들러
     * @private
     */
    _onMouseUp: function() {
        this._stopResizing();
    },
    /**
     * mousemove 이벤트 핸들러
     * @param {event} mouseMoveEvent    마우스 이벤트 객체
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
            this.grid.dimensionModel.setColumnWidth(this._getHandlerColumnIndex(index), width);
            this._refreshHandlerPosition(true);
        }
    },
    /**
     * 너비를 계산한다.
     * @param {number} pageX    마우스의 x 좌표
     * @return {number} x좌표를 기준으로 계산한 width 값
     * @private
     */
    _calculateWidth: function(pageX) {
        var difference = pageX - this.initialOffsetLeft - this.initialLeft;
        return this.initialWidth + difference;
    },
    /**
     * 핸들러의 index 로부터 컬럼의 index 를 반환한다.
     * @param {number} index 핸들러의 index 값
     * @return {number} 컬럼 index 값
     * @private
     */
    _getHandlerColumnIndex: function(index) {
        return this.whichSide === 'R' ? index + this.grid.columnModel.get('columnFixIndex') : index;
    },
    /**
     * resize start 세팅
     * @param {event} mouseDownEvent 마우스 이벤트
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
        $('body').css('cursor', 'col-resize');
        $(document)
            .bind('mousemove', $.proxy(this._onMouseMove, this))
            .bind('mouseup', $.proxy(this._onMouseUp, this));

        // for IE8 and under
        if ($target[0].setCapture) {
            $target[0].setCapture();
        }
    },
    /**
     * resize stop 세팅
     * @private
     */
    _stopResizing: function() {
        // for IE8 and under
        if (this.$target && this.$target[0].releaseCapture) {
            this.$target[0].releaseCapture();
        }

        this.isResizing = false;
        this.$target = null;
        this.initialLeft = 0;
        this.initialOffsetLeft = 0;
        this.initialWidth = 0;

        $('body').css('cursor', 'default');
        $(document)
            .unbind('mousemove', $.proxy(this._onMouseMove, this))
            .unbind('mouseup', $.proxy(this._onMouseUp, this));
    },
    /**
     * 소멸자
     */
    destroy: function() {
        this.stopListening();
        this._stopResizing();
        this.destroyChildren();
        this.remove();
    }
});
