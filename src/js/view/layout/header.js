/**
 * @fileoverview Header 관련
 * @author NHN Ent. FE Development Team
 */
'use strict';

var View = require('../../base/view');
var util = require('../../util');
var ResizeHandler = require('./resizeHandler');

/**
 * Header 레이아웃 View
 * @module view/layout/header
 */
var Header = View.extend(/**@lends module:view/layout/header.prototype */{
    /**
     * @constructs
     * @extends module:base/view
     * @param {Object} options 옵션
     *      @param {String} [options.whichSide='R']  어느 영역의 header 인지 여부.
     */
    initialize: function(options) {
        View.prototype.initialize.apply(this, arguments);
        this.setOwnProperties({
            timeoutForAllChecked: 0,
            whichSide: options && options.whichSide || 'R'
        });
        this.listenTo(this.grid.renderModel, 'change:scrollLeft', this._onScrollLeftChange, this)
            .listenTo(this.grid.dimensionModel, 'columnWidthChanged', this._onColumnWidthChanged, this)
            .listenTo(this.grid.dataModel, 'change:_button', this._onCheckCountChange, this)
            .listenTo(this.grid.dataModel, 'sortChanged', this._updateBtnSortState, this);
    },

    tagName: 'div',

    className: 'header',

    events: {
        'click': '_onClick',
        'mousedown': '_onMouseDown'
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

    _onMouseDown: function(event) {
        var grid = this.grid,
            columnModel = grid.columnModel,
            columnName = $(event.target).closest('th').attr('columnName'),
            columnNames = columnModel.getUnitColumnNamesIfMerged(columnName);

        _.each(columnNames, function(name) {
            this._selectColumn(name);
        }, this);
    },

    _selectColumn: function(columnName) {
        var grid = this.grid,
            columnModel =  grid.columnModel;

        if (columnModel.isMetaColumn(columnName)) {
            return;
        }
        console.log('todo: implementation');
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
        var $input, enableCount, checkedCount;

        if (this.grid.option('selectType') !== 'checkbox') {
            return;
        }

        $input = this._getHeaderMainCheckbox();
        if (!$input.length) {
            return;
        }

        enableCount = 0;
        checkedCount = this.grid.dataModel.getRowList(true).length;
        this.grid.dataModel.forEach(function(row) {
            var cellState = row.getCellState('_button');
            if (!cellState.isDisabled && cellState.isEditable) {
                enableCount += 1;
            }
        }, this);
        $input.prop('checked', enableCount === checkedCount);
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
        var resizeHandler;

        this.destroyChildren();

        resizeHandler = this.createView(ResizeHandler, {
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
            colGroup: this._getColGroupMarkup(),
            tBody: this._getTableBodyMarkup()
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
            columnModelList = columnModel.getVisibleColumnModelList(this.whichSide, true);

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
            rowHeight = util.getRowHeight(maxRowCount, headerHeight) - 1,
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
                _.each(columnMergeList, function(columnMerge) {
                    if ($.inArray(columnModel['columnName'], columnMerge['columnNameList']) !== -1) {
                        this._getColumnHierarchy(columnMerge, resultList);
                    }
                }, this);
            }
        }
        return resultList;
    }
});

module.exports = Header;
