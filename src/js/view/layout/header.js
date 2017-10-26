/**
 * @fileoverview Header View
 * @author NHN Ent. FE Development Team
 */

'use strict';

var $ = require('jquery');
var _ = require('underscore');

var View = require('../../base/view');
var util = require('../../common/util');
var constMap = require('../../common/constMap');
var classNameConst = require('../../common/classNameConst');
var GridEvent = require('../../event/gridEvent');
var DragEventEmitter = require('../../event/dragEventEmitter');
var frameConst = constMap.frame;

var DELAY_SYNC_CHECK = 10;
var keyCodeMap = constMap.keyCode;
var ATTR_COLUMN_NAME = constMap.attrName.COLUMN_NAME;
var CELL_BORDER_WIDTH = constMap.dimension.CELL_BORDER_WIDTH;
var TABLE_BORDER_WIDTH = constMap.dimension.TABLE_BORDER_WIDTH;

// Minimum time (ms) to detect if an alert or confirm dialog has been displayed.
var MIN_INTERVAL_FOR_PAUSED = 200;

var Header;

/**
 * Get count of same columns in complex columns
 * @param {array} currentColumn - Current column's model
 * @param {array} prevColumn - Previous column's model
 * @returns {number} Count of same columns
 * @ignore
 */
function getSameColumnCount(currentColumn, prevColumn) {
    var index = 0;
    var len = Math.min(currentColumn.length, prevColumn.length);

    for (; index < len; index += 1) {
        if (currentColumn[index].name !== prevColumn[index].name) {
            break;
        }
    }

    return index;
}

/**
 * Header Layout View
 * @module view/layout/header
 * @extends module:base/view
 * @param {Object} options - options
 * @param {String} [options.whichSide=R]  R: Right, L: Left
 * @ignore
 */
Header = View.extend(/** @lends module:view/layout/header.prototype */{
    initialize: function(options) {
        View.prototype.initialize.call(this);

        _.assign(this, {
            renderModel: options.renderModel,
            coordColumnModel: options.coordColumnModel,
            selectionModel: options.selectionModel,
            focusModel: options.focusModel,
            columnModel: options.columnModel,
            dataModel: options.dataModel,
            coordRowModel: options.coordRowModel,

            viewFactory: options.viewFactory,
            domEventBus: options.domEventBus,

            headerHeight: options.headerHeight,
            whichSide: options.whichSide || frameConst.R
        });

        this.dragEmitter = new DragEventEmitter({
            type: 'header',
            domEventBus: this.domEventBus,
            onDragMove: _.bind(this._onDragMove, this)
        });

        this.listenTo(this.renderModel, 'change:scrollLeft', this._onScrollLeftChange)
            .listenTo(this.coordColumnModel, 'columnWidthChanged', this._onColumnWidthChanged)
            .listenTo(this.selectionModel, 'change:range', this._refreshSelectedHeaders)
            .listenTo(this.focusModel, 'change:columnName', this._refreshSelectedHeaders)
            .listenTo(this.dataModel, 'sortChanged', this._updateBtnSortState);

        if (this.whichSide === frameConst.L && this.columnModel.get('selectType') === 'checkbox') {
            this.listenTo(this.dataModel,
                'change:_button disabledChanged extraDataChanged add remove reset',
                _.debounce(_.bind(this._syncCheckedState, this), DELAY_SYNC_CHECK));
        }
    },

    className: classNameConst.HEAD_AREA,

    events: {
        'click': '_onClick',
        'keydown input': '_onKeydown',
        'mousedown th': '_onMouseDown'
    },

    /**
     * template
     */
    template: _.template(
        '<table class="' + classNameConst.TABLE + '">' +
            '<colgroup><%=colGroup%></colgroup>' +
            '<tbody><%=tBody%></tbody>' +
        '</table>'
    ),

    /**
     * template for <th>
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
     * templse for <col>
     */
    templateCol: _.template(
        '<col ' +
            '<%=attrColumnName%>="<%=columnName%>" ' +
            'style="width:<%=width%>px">'
    ),

    /**
     * HTML string for a button
     */
    markupBtnSort: '<a class="' + classNameConst.BTN_SORT + '"></a>',

    /**
     * col group 마크업을 생성한다.
     * @returns {string} <colgroup>에 들어갈 html 마크업 스트링
     * @private
     */
    _getColGroupMarkup: function() {
        var columnData = this._getColumnData();
        var columnWidths = columnData.widths;
        var columns = columnData.columns;
        var htmlList = [];

        _.each(columnWidths, function(width, index) {
            htmlList.push(this.templateCol({
                attrColumnName: ATTR_COLUMN_NAME,
                columnName: columns[index].name,
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
        var columnRange = this.selectionModel.get('range').column;
        var visibleColumns = this.columnModel.getVisibleColumns();
        var selectedColumns = visibleColumns.slice(columnRange[0], columnRange[1] + 1);

        return _.pluck(selectedColumns, 'name');
    },

    _onDragMove: function(gridEvent) {
        var $target = $(gridEvent.target);

        gridEvent.setData({
            columnName: $target.closest('th').attr(ATTR_COLUMN_NAME),
            isOnHeaderArea: $.contains(this.el, $target[0])
        });
    },

    /**
     * Returns an array of names of merged-column which contains every column name in the given array.
     * @param {Array.<String>} columnNames - an array of column names to test
     * @returns {Array.<String>}
     * @private
     */
    _getContainingMergedColumnNames: function(columnNames) {
        var columnModel = this.columnModel;
        var mergedColumnNames = _.pluck(columnModel.get('complexHeaderColumns'), 'name');

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
        var $ths = this.$el.find('th');
        var columnNames, mergedColumnNames;

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
     * Event handler for 'keydown' event on checkbox input
     * @param {KeyboardEvent} event - event
     * @private
     */
    _onKeydown: function(event) {
        if (event.keyCode === keyCodeMap.TAB) {
            event.preventDefault();
            this.focusModel.focusClipboard();
        }
    },

    /**
     * Mousedown event handler
     * @param {jQuery.Event} ev - MouseDown event
     * @private
     */
    _onMouseDown: function(ev) {
        var $target = $(ev.target);
        var columnName;

        if (!this._triggerPublicMousedown(ev)) {
            return;
        }

        if ($target.hasClass(classNameConst.BTN_SORT)) {
            return;
        }

        columnName = $target.closest('th').attr(ATTR_COLUMN_NAME);
        if (columnName) {
            this.dragEmitter.start(ev, {
                columnName: columnName
            });
        }
    },

    /**
     * Trigger mousedown:body event on domEventBus and returns the result
     * @param {MouseEvent} ev - MouseEvent
     * @returns {module:event/gridEvent}
     * @private
     */
    _triggerPublicMousedown: function(ev) {
        var startTime, endTime;
        var gridEvent = new GridEvent(ev, GridEvent.getTargetInfo($(ev.target)));
        var paused;

        startTime = (new Date()).getTime();
        this.domEventBus.trigger('mousedown', gridEvent);
        endTime = (new Date()).getTime();

        // check if the model window (alert or confirm) was popped up
        paused = (endTime - startTime) > MIN_INTERVAL_FOR_PAUSED;

        return !gridEvent.isStopped() && !paused;
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
    _syncCheckedState: function() {
        var checkedState = this.dataModel.getCheckedState();
        var $input, props;

        $input = this._getHeaderMainCheckbox();
        if (!$input.length) {
            return;
        }

        if (!checkedState.available) {
            props = {
                checked: false,
                disabled: true
            };
        } else {
            props = {
                checked: checkedState.available === checkedState.checked,
                disabled: false
            };
        }
        $input.prop(props);
    },

    /**
     * column width 변경시 col 엘리먼트들을 조작하기 위한 헨들러
     * @private
     */
    _onColumnWidthChanged: function() {
        var columnWidths = this.coordColumnModel.getWidths(this.whichSide);
        var $colList = this.$el.find('col');
        var coordRowModel = this.coordRowModel;

        _.each(columnWidths, function(columnWidth, index) {
            $colList.eq(index).css('width', columnWidth + CELL_BORDER_WIDTH);
        });

        // Calls syncWithDom only from the Rside to prevent calling twice.
        // Defered call to ensure that the execution occurs after both sides are rendered.
        if (this.whichSide === frameConst.R) {
            _.defer(function() {
                coordRowModel.syncWithDom();
            });
        }
    },

    /**
     * scroll left 값이 변경되었을 때 header 싱크를 맞추는 이벤트 핸들러
     * @param {Object} model    변경이 발생한 model 인스턴스
     * @param {Number} value    scrollLeft 값
     * @private
     */
    /* istanbul ignore next: scrollLeft 를 확인할 수 없음 */
    _onScrollLeftChange: function(model, value) {
        if (this.whichSide === frameConst.R) {
            this.el.scrollLeft = value;
        }
    },

    /**
     * Event handler for click event
     * @param {jQuery.Event} ev - MouseEvent
     * @private
     */
    _onClick: function(ev) {
        var $target = $(ev.target);
        var columnName = $target.closest('th').attr(ATTR_COLUMN_NAME);
        var eventData = new GridEvent(ev);

        if (columnName === '_button' && $target.is('input')) {
            eventData.setData({
                checked: $target.prop('checked')
            });
            this.domEventBus.trigger('click:headerCheck', eventData);
        } else if ($target.is('a.' + classNameConst.BTN_SORT)) {
            eventData.setData({
                columnName: columnName
            });
            this.domEventBus.trigger('click:headerSort', eventData);
        }
    },

    /**
     * 정렬 버튼의 상태를 변경한다.
     * @private
     * @param {object} sortOptions 정렬 옵션
     * @param {string} sortOptions.columnName 정렬할 컬럼명
     * @param {boolean} sortOptions.ascending 오름차순 여부
     */
    _updateBtnSortState: function(sortOptions) {
        var className;

        if (this._$currentSortBtn) {
            this._$currentSortBtn.removeClass(classNameConst.BTN_SORT_DOWN + ' ' + classNameConst.BTN_SORT_UP);
        }
        this._$currentSortBtn = this.$el.find(
            'th[' + ATTR_COLUMN_NAME + '="' + sortOptions.columnName + '"] a.' + classNameConst.BTN_SORT
        );

        className = sortOptions.ascending ? classNameConst.BTN_SORT_UP : classNameConst.BTN_SORT_DOWN;

        this._$currentSortBtn.addClass(className);
    },

    /**
     * 랜더링
     * @returns {View.Layout.Header} this
     */
    render: function() {
        var resizeHandleHeights;

        this._destroyChildren();

        this.$el.css({
            height: this.headerHeight - TABLE_BORDER_WIDTH
        }).html(this.template({
            colGroup: this._getColGroupMarkup(),
            tBody: this._getTableBodyMarkup()
        }));

        if (this.coordColumnModel.get('resizable')) {
            resizeHandleHeights = this._getResizeHandleHeights();
            this._addChildren(this.viewFactory.createHeaderResizeHandle(this.whichSide, resizeHandleHeights));
            this.$el.append(this._renderChildren());
        }

        return this;
    },

    /**
     * 컬럼 정보를 반환한다.
     * @returns {{widths: (Array|*), columns: (Array|*)}}   columnWidths 와 columns 를 함께 반환한다.
     * @private
     */
    _getColumnData: function() {
        var columnWidths = this.coordColumnModel.getWidths(this.whichSide);
        var columns = this.columnModel.getVisibleColumns(this.whichSide, true);

        return {
            widths: columnWidths,
            columns: columns
        };
    },

    /* eslint-disable complexity */
    /**
     * Header 의 body markup 을 생성한다.
     * @returns {string} header 의 테이블 body 영역에 들어갈 html 마크업 스트링
     * @private
     */
    _getTableBodyMarkup: function() {
        var hierarchyList = this._getColumnHierarchyList();
        var maxRowCount = this._getHierarchyMaxRowCount(hierarchyList);
        var headerHeight = this.headerHeight;
        var rowMarkupList = new Array(maxRowCount);
        var columnNames = new Array(maxRowCount);
        var colSpanList = [];
        var rowHeight = util.getRowHeight(maxRowCount, headerHeight) - 1;
        var rowSpan = 1;
        var height;
        var headerMarkupList;

        _.each(hierarchyList, function(hierarchy, i) {
            var length = hierarchyList[i].length;
            var curHeight = 0;

            _.each(hierarchy, function(columnModel, j) {
                var columnName = columnModel.name;
                var classNames = [
                    classNameConst.CELL,
                    classNameConst.CELL_HEAD
                ];

                if (columnModel.validation && columnModel.validation.required) {
                    classNames.push(classNameConst.CELL_REQRUIRED);
                }

                rowSpan = (length - 1 === j && (maxRowCount - length + 1) > 1) ? (maxRowCount - length + 1) : 1;
                height = rowHeight * rowSpan;

                if (j === length - 1) {
                    height = (headerHeight - curHeight) - 2;
                } else {
                    curHeight += height + 1;
                }
                if (columnNames[j] === columnName) {
                    rowMarkupList[j].pop();
                    colSpanList[j] += 1;
                } else {
                    colSpanList[j] = 1;
                }
                columnNames[j] = columnName;
                rowMarkupList[j] = rowMarkupList[j] || [];
                rowMarkupList[j].push(this.templateHeader({
                    attrColumnName: ATTR_COLUMN_NAME,
                    columnName: columnName,
                    className: classNames.join(' '),
                    height: height,
                    colspan: colSpanList[j],
                    rowspan: rowSpan,
                    title: columnModel.title,
                    btnSort: columnModel.sortable ? this.markupBtnSort : ''
                }));
            }, this);
        }, this);
        headerMarkupList = _.map(rowMarkupList, function(rowMarkup) {
            return '<tr>' + rowMarkup.join('') + '</tr>';
        });

        return headerMarkupList.join('');
    },
    /* eslint-enable complexity */

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
        var columns = this._getColumnData().columns;
        var hierarchyList;

        hierarchyList = _.map(columns, function(column) {
            return this._getColumnHierarchy(column).reverse();
        }, this);

        return hierarchyList;
    },

    /**
     * complexHeaderColumns 가 설정되어 있을 때 재귀적으로 돌면서 계층구조를 형성한다.
     * @param {Object} column - column
     * @param {Array} [results] - 결과로 메모이제이션을 이용하기 위한 인자값
     * @returns {Array}
     * @private
     */
    _getColumnHierarchy: function(column, results) {
        var complexHeaderColumns = this.columnModel.get('complexHeaderColumns');

        results = results || [];
        if (column) {
            results.push(column);
            if (complexHeaderColumns) {
                _.each(complexHeaderColumns, function(headerColumn) {
                    if ($.inArray(column.name, headerColumn.childNames) !== -1) {
                        this._getColumnHierarchy(headerColumn, results);
                    }
                }, this);
            }
        }

        return results;
    },

    /**
     * Get height values of resize handlers
     * @returns {array} Height values of resize handles
     */
    _getResizeHandleHeights: function() {
        var hierarchyList = this._getColumnHierarchyList();
        var maxRowCount = this._getHierarchyMaxRowCount(hierarchyList);
        var rowHeight = util.getRowHeight(maxRowCount, this.headerHeight) - 1;
        var handleHeights = [];
        var index = 1;
        var coulmnLen = hierarchyList.length;
        var sameColumnCount, handleHeight;

        for (; index < coulmnLen; index += 1) {
            sameColumnCount = getSameColumnCount(hierarchyList[index], hierarchyList[index - 1]);
            handleHeight = rowHeight * (maxRowCount - sameColumnCount);

            handleHeights.push(handleHeight);
        }

        handleHeights.push(rowHeight * maxRowCount); // last resize handle

        return handleHeights;
    }
});

Header.DELAY_SYNC_CHECK = DELAY_SYNC_CHECK;

module.exports = Header;
