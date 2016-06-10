/**
 * @fileoverview Header 관련
 * @author NHN Ent. FE Development Team
 */
'use strict';

var View = require('../../base/view');
var util = require('../../common/util');
var constMap = require('../../common/constMap');
var classNameConst = require('../../common/classNameConst');

var DELAY_SYNC_CHECK = 10;
var SEL_TYPE_COLUMN = constMap.selectionType.COLUMN;
var ATTR_COLUMN_NAME = constMap.attrName.COLUMN_NAME;
var CELL_BORDER_WIDTH = constMap.dimension.CELL_BORDER_WIDTH;
var TABLE_BORDER_WIDTH = constMap.dimension.TABLE_BORDER_WIDTH;

/**
 * Header 레이아웃 View
 * @module view/layout/header
 * @extends module:base/view
 */
var Header = View.extend(/**@lends module:view/layout/header.prototype */{
    /**
     * @constructs
     * @param {Object} options 옵션
     * @param {String} [options.whichSide='R']  어느 영역의 header 인지 여부.
     */
    initialize: function(options) {
        View.prototype.initialize.call(this);

        this.setOwnProperties({
            renderModel: options.renderModel,
            dimensionModel: options.dimensionModel,
            selectionModel: options.selectionModel,
            focusModel: options.focusModel,
            columnModel: options.columnModel,
            dataModel: options.dataModel,
            viewFactory: options.viewFactory,
            timeoutForAllChecked: 0,
            whichSide: options.whichSide || 'R'
        });

        this.listenTo(this.renderModel, 'change:scrollLeft', this._onScrollLeftChange)
            .listenTo(this.dimensionModel, 'columnWidthChanged', this._onColumnWidthChanged)
            .listenTo(this.selectionModel, 'change:range', this._refreshSelectedHeaders)
            .listenTo(this.focusModel, 'change:columnName', this._refreshSelectedHeaders)
            .listenTo(this.dataModel, 'change:_button', this._onCheckCountChange)
            .listenTo(this.dataModel, 'sortChanged', this._updateBtnSortState);
    },

    className: classNameConst.HEAD_AREA,

    events: {
        'click': '_onClick',
        'mousedown th': '_onMouseDown'
    },

    /**
     * 전체 template
     */
    template: _.template(
        '<table class="' + classNameConst.TABLE + '">' +
            '<colgroup><%=colGroup%></colgroup>' +
            '<tbody><%=tBody%></tbody>' +
        '</table>'
    ),

    /**
     * <th> 템플릿
     */
    templateHeader: _.template(
        '<th <%=attrColumnName%>="<%=columnName%>" ' +
            'class="<%=className%>" ' +
            'height="<%=height%>" ' +
            '<%if(colspan > 0) {%>' +
               'colspan=<%=colspan%> ' +
            '<%}%>' +
            '<%if(rowspan > 0) {%>' +
                'rowspan=<%=rowspan%> ' +
            '<%}%>' +
        '>' +
        '<%=title%><%=btnSort%>' +
        '</th>'
    ),

    /**
     * <col> 템플릿
     */
    templateCol: _.template(
        '<col ' +
            '<%=attrColumnName%>="<%=columnName%>" ' +
            'style="width:<%=width%>px">'
    ),

    /**
     * 정렬 버튼을 위한 HTML 마크업
     */
    markupBtnSort: '<a class="' + classNameConst.BTN_SORT + '"></a>',

    /**
     * col group 마크업을 생성한다.
     * @returns {string} <colgroup>에 들어갈 html 마크업 스트링
     * @private
     */
    _getColGroupMarkup: function() {
        var columnData = this._getColumnData(),
            columnWidthList = columnData.widthList,
            columnModelList = columnData.modelList,
            htmlList = [];

        _.each(columnWidthList, function(width, index) {
            htmlList.push(this.templateCol({
                attrColumnName: ATTR_COLUMN_NAME,
                columnName: columnModelList[index].columnName,
                width: width + CELL_BORDER_WIDTH
            }));
        }, this);
        return htmlList.join('');
    },

    /**
     * Returns an array of names of columns in selection range.
     * @private
     * @returns {Array.<String>}
     */
    _getSelectedColumnNames: function() {
        var columnRange = this.selectionModel.get('range').column,
            visibleColumns = this.columnModel.getVisibleColumnModelList(),
            selectedColumns = visibleColumns.slice(columnRange[0], columnRange[1] + 1);

        return _.pluck(selectedColumns, 'columnName');
    },

    /**
     * Returns an array of names of merged-column which contains every column name in the given array.
     * @param {Array.<String>} columnNames - an array of column names to test
     * @returns {Array.<String>}
     * @private
     */
    _getContainingMergedColumnNames: function(columnNames) {
        var columnModel = this.columnModel,
            mergedColumnNames = _.pluck(columnModel.get('columnMerge'), 'columnName');

        return _.filter(mergedColumnNames, function(mergedColumnName) {
            var unitColumnNames = columnModel.getUnitColumnNamesIfMerged(mergedColumnName);
            return _.every(unitColumnNames, function(name) {
                return _.contains(columnNames, name);
            });
        });
    },

    /**
     * Refreshes selected class of every header element (th)
     * @private
     */
    _refreshSelectedHeaders: function() {
        var $ths = this.$el.find('th'),
            columnNames, mergedColumnNames;

        if (this.selectionModel.hasSelection()) {
            columnNames = this._getSelectedColumnNames();
        } else if (this.focusModel.has(true)) {
            columnNames = [this.focusModel.get('columnName')];
        }

        $ths.removeClass(classNameConst.CELL_SELECTED);
        if (columnNames) {
            mergedColumnNames = this._getContainingMergedColumnNames(columnNames);
            _.each(columnNames.concat(mergedColumnNames), function(columnName) {
                $ths.filter('[' + ATTR_COLUMN_NAME + '="' + columnName + '"]').addClass(classNameConst.CELL_SELECTED);
            });
        }
    },

    /**
     * Mousedown event handler
     * @param {jQuery.Event} event - MouseDown event
     * @private
     */
    _onMouseDown: function(event) {
        var columnName, columnNames;

        if (!this.selectionModel.isEnabled() || $(event.target).is('a.' + classNameConst.BTN_SORT)) {
            return;
        }

        columnName = $(event.target).closest('th').attr(ATTR_COLUMN_NAME);
        if (!columnName) {
            return;
        }

        columnNames = this.columnModel.getUnitColumnNamesIfMerged(columnName);

        if (!this._hasMetaColumn(columnNames)) {
            this._controlStartAction(columnNames, event.pageX, event.pageY, event.shiftKey);
        }
    },

    /**
     * Control selection action when started
     * @param {Array} columnNames - An array of column names
     * @param {number} pageX - Mouse position X
     * @param {number} pageY - Mouse position Y
     * @param {boolean} shiftKey - Whether the shift-key is pressed.
     * @private
     */
    _controlStartAction: function(columnNames, pageX, pageY, shiftKey) {
        var columnModel = this.columnModel,
            columnIndexes = _.map(columnNames, function(name) {
                return columnModel.indexOfColumnName(name, true);
            });

        if (shiftKey) {
            this._startColumnSelectionWithShiftKey(columnIndexes, pageX, pageY);
        } else {
            this._startColumnSelectionWithoutShiftKey(columnIndexes);
        }
        this._attachDragEvents();
    },

    /**
     * Start column selection with shiftKey pressed
     * @param {Array.<number>} columnIndexes - Indexes of columns
     * @param {number} pageX - Mouse position X
     * @param {number} pageY - Mouse position Y
     * @private
     */
    _startColumnSelectionWithShiftKey: function(columnIndexes, pageX, pageY) {
        var selectionModel = this.selectionModel;
        var max = Math.max.apply(null, columnIndexes);

        selectionModel.update(0, max, SEL_TYPE_COLUMN);
        selectionModel.extendColumnSelection(columnIndexes, pageX, pageY);
    },

    /**
     * Start column selection when shiftKey is not pressed
     * @param {Array.<number>} columnIndexes - Indexes of columns
     * @private
     */
    _startColumnSelectionWithoutShiftKey: function(columnIndexes) {
        var selectionModel = this.selectionModel,
            minMax = util.getMinMax(columnIndexes),
            min = minMax.min,
            max = minMax.max;

        selectionModel.setMinimumColumnRange([min, max]);
        selectionModel.selectColumn(min);
        selectionModel.update(0, max);
    },

    /**
     * Attach mouse drag event
     * @private
     */
    _attachDragEvents: function() {
        $(document)
            .on('mousemove', $.proxy(this._onMouseMove, this))
            .on('mouseup', $.proxy(this._detachDragEvents, this))
            .on('selectstart', $.proxy(this._onSelectStart, this));
    },

    /**
     * Detach mouse drag event
     * @private
     */
    _detachDragEvents: function() {
        this.selectionModel.stopAutoScroll();
        $(document)
            .off('mousemove', this._onMouseMove)
            .off('mouseup', this._detachDragEvents)
            .off('selectstart', this._onSelectStart);
    },

    /**
     * Mousemove event handler
     * @param {jQuery.Event} event - MouseMove event
     * @private
     */
    _onMouseMove: function(event) {
        var columnModel = this.columnModel,
            isExtending = true,
            columnName = $(event.target).closest('th').attr(ATTR_COLUMN_NAME),
            columnNames, columnIndexes;

        if (columnName) {
            columnNames = columnModel.getUnitColumnNamesIfMerged(columnName);
            columnIndexes = _.map(columnNames, function(name) {
                return columnModel.indexOfColumnName(name, true);
            });
        } else if ($.contains(this.el, event.target)) {
            isExtending = false;
        }

        if (isExtending) {
            this.selectionModel.extendColumnSelection(columnIndexes, event.pageX, event.pageY);
        }
    },

    /**
     * Whether this columnNames array has a meta column name.
     * @param {Array} columnNames - An array of column names
     * @returns {boolean} Has a meta column name or not.
     * @private
     */
    _hasMetaColumn: function(columnNames) {
        return _.some(columnNames, function(name) {
            return util.isMetaColumn(name);
        });
    },

    /**
     * Selectstart event handler
     * @param {jQuery.Event} event - Mouse event
     * @returns {boolean} false for preventDefault
     * @private
     */
    _onSelectStart: function(event) {
        event.preventDefault();
        return false;
    },

    /**
     * 그리드의 checkCount 가 변경되었을 때 수행하는 헨들러
     * @private
     */
    _onCheckCountChange: function() {
        if (this.columnModel.get('selectType') === 'checkbox') {
            clearTimeout(this.timeoutForAllChecked);
            this.timeoutForAllChecked = setTimeout($.proxy(this._syncCheckState, this), DELAY_SYNC_CHECK);
        }
    },

    /**
     * selectType 이 checkbox 일 때 랜더링 되는 header checkbox 엘리먼트를 반환한다.
     * @returns {jQuery} _butoon 컬럼 헤더의 checkbox input 엘리먼트
     * @private
     */
    _getHeaderMainCheckbox: function() {
        return this.$el.find('th[' + ATTR_COLUMN_NAME + '="_button"] input');
    },

    /**
     * header 영역의 input 상태를 실제 checked 된 count 에 맞추어 반영한다.
     * @private
     */
    _syncCheckState: function() {
        var $input, enableCount, checkedCount;

        if (!this.columnModel || this.columnModel.get('selectType') !== 'checkbox') {
            return;
        }

        $input = this._getHeaderMainCheckbox();
        if (!$input.length) {
            return;
        }

        enableCount = 0;
        checkedCount = this.dataModel.getRowList(true).length;
        this.dataModel.forEach(function(row) {
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
            $colList.eq(index).css('width', columnWidth + CELL_BORDER_WIDTH);
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
     * @param {jQuery.Event} clickEvent 클릭이벤트
     * @private
     */
    _onClick: function(clickEvent) {
        var $target = $(clickEvent.target),
            columnName = $target.closest('th').attr(ATTR_COLUMN_NAME);

        if (columnName === '_button' && $target.is('input')) {
            if ($target.prop('checked')) {
                this.dataModel.checkAll();
            } else {
                this.dataModel.uncheckAll();
            }
        } else if ($target.is('a.' + classNameConst.BTN_SORT)) {
            this.dataModel.sortByField(columnName);
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
            this._$currentSortBtn.removeClass(classNameConst.BTN_SORT_DOWN + ' ' + classNameConst.BTN_SORT_UP);
        }
        this._$currentSortBtn = this.$el.find(
            'th[' + ATTR_COLUMN_NAME + '="' + sortOptions.columnName + '"] a.' + classNameConst.BTN_SORT
        );
        this._$currentSortBtn.addClass(sortOptions.isAscending ?
            classNameConst.BTN_SORT_UP : classNameConst.BTN_SORT_DOWN
        );
    },

    /**
     * 랜더링
     * @returns {View.Layout.Header} this
     */
    render: function() {
        this._destroyChildren();

        if (this.whichSide === 'R' && !this.dimensionModel.get('scrollY')) {
            this.$el.addClass(classNameConst.NO_SCROLL_Y);
        }

        this.$el.css({
            height: this.dimensionModel.get('headerHeight') - TABLE_BORDER_WIDTH
        }).html(this.template({
            colGroup: this._getColGroupMarkup(),
            tBody: this._getTableBodyMarkup()
        }));

        this._addChildren(this.viewFactory.createHeaderResizeHandler(this.whichSide));
        this.$el.append(this._renderChildren());
        return this;
    },

    /**
     * 컬럼 정보를 반환한다.
     * @returns {{widthList: (Array|*), modelList: (Array|*)}}   columnWidthList 와 columnModelList 를 함께 반환한다.
     * @private
     */
    _getColumnData: function() {
        var columnModel = this.columnModel,
            dimensionModel = this.dimensionModel,
            columnWidthList = dimensionModel.getColumnWidthList(this.whichSide),
            columnModelList = columnModel.getVisibleColumnModelList(this.whichSide, true);

        return {
            widthList: columnWidthList,
            modelList: columnModelList
        };
    },

    /**
     * Header 의 body markup 을 생성한다.
     * @returns {string} header 의 테이블 body 영역에 들어갈 html 마크업 스트링
     * @private
     */
    _getTableBodyMarkup: function() {
        var hierarchyList = this._getColumnHierarchyList(),
            maxRowCount = this._getHierarchyMaxRowCount(hierarchyList);
        // 가공한 컬럼 모델 리스트 정보를 바탕으로 컬럼 엘리먼트들에 대한 마크업을 구성한다.
        var headerHeight = this.dimensionModel.get('headerHeight'),
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
                var columnName = columnModel.columnName;
                var classNames = [
                    classNameConst.CELL,
                    classNameConst.CELL_HEAD
                ];

                if (columnModel.isRequired) {
                    classNames.push(classNameConst.CELL_REQRUIRED);
                }

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
                    attrColumnName: ATTR_COLUMN_NAME,
                    columnName: columnName,
                    className: classNames.join(' '),
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
     * @param {Array} hierarchyList 헤더 마크업 생성시 사용될 계층구조 데이터
     * @returns {number} 헤더 영역의 row 최대값
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
     * @returns {Array}  계층구조 리스트
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
     * @returns {Array} 계층구조 결과값
     * @private
     */
    _getColumnHierarchy: function(columnModel, resultList) {
        var columnMergeList = this.columnModel.get('columnMerge');
        resultList = resultList || [];
        /* istanbul ignore else */
        if (columnModel) {
            resultList.push(columnModel);
            /* istanbul ignore else */
            if (columnMergeList) {
                _.each(columnMergeList, function(columnMerge) {
                    if ($.inArray(columnModel.columnName, columnMerge.columnNameList) !== -1) {
                        this._getColumnHierarchy(columnMerge, resultList);
                    }
                }, this);
            }
        }
        return resultList;
    }
});

module.exports = Header;
