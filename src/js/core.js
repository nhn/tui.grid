/**
 * @fileoverview Grid Core 파일
 * @author NHN Ent. FE Development Team
 */
 'use strict';

var Model = require('./base/model');

// data models
var ColumnModelData = require('./data/columnModel');
var RowListData = require('./data/rowList');

// models
var ToolbarModel = require('./model/toolbar');
var DimensionModel = require('./model/dimension');
var FocusModel = require('./model/focus');
var RenderModel = require('./model/renderer');
var SmartRenderModel = require('./model/renderer-smart');
var SelectionModel = require('./model/selection');

var CellFactory = require('./view/cellFactory');

var Net = require('./addon/net');
var util = require('./common/util');

var addOn = {
    Net: Net
};

var defaultOptions = {
    // user setting values
    columnFixCount: 0,
    columnModelList: [],
    keyColumnName: null,
    selectType: '',
    autoNumbering: true,
    headerHeight: 35,
    rowHeight: 27,
    displayRowCount: 10,
    minimumColumnWidth: 50,
    notUseSmartRendering: false,
    columnMerge: [],
    scrollX: true,
    scrollY: true,
    useClientSort: true,
    singleClickEdit: false,
    toolbar: {
        hasResizeHandler: true,
        hasControlPanel: true,
        hasPagination: true
    },

    // computed values for dimension
    offsetTop: 0,
    offsetLeft: 0,
    width: 0
};

/**
 * Grid Core
 * @module core
 */
var Core = Model.extend(/**@lends module:core.prototype */{
    /**
     * @constructs
     * @extends module:base/model
     * @param {Object} options Grid.js 의 생성자 option 과 동일값.
     */
    initialize: function(options) {
        options = $.extend(true, {}, defaultOptions, options);

        this.publicInstance = options.publicInstance;
        this.singleClickEdit = options.singleClickEdit;
        this.emptyMessage = options.emptyMessage;

        this.id = util.getUniqueKey();

        this._initializeProperties();
        this._initializeModel(options);
        this._initializeListener();

        this.cellFactory = new CellFactory({
            grid: this
        });
        // this.updateLayoutData();
    },

    /**
     * 내부 properties 를 초기화한다.
     * @private
     */
    _initializeProperties: function() {
        this.setOwnProperties({
            'selectionModel': null,
            'columnModel': null,
            'dataModel': null,
            'renderModel': null,
            'layoutModel': null,
            'focusModel': null,
            'addOn': {},
            'timeoutIdForSetRowList': 0
        });
    },

    /**
     * 내부에서 사용할 모델 instance를 초기화한다.
     *
     * Initialize data model instances
     * @private
     */
    _initializeModel: function(options) {
        this.columnModel = new ColumnModelData({
            grid: this,
            hasNumberColumn: options.autoNumbering,
            keyColumnName: options.keyColumnName,
            columnFixCount: options.columnFixCount,
            selectType: options.selectType,
            columnMerge: options.columnMerge
        });
        this.setColumnModelList(options.columnModelList);

        this.dataModel = new RowListData([], {
            grid: this,
            useClientSort: options.useClientSort
        });
        this.dataModel.reset([]);

        this.toolbarModel = new ToolbarModel(options.toolbar);

        this.dimensionModel = new DimensionModel({
            grid: this,
            offsetTop: options.offsetTop,
            offsetLeft: options.offsetLeft,
            width: options.width,
            headerHeight: options.headerHeight,
            rowHeight: options.rowHeight,

            scrollX: !!options.scrollX,
            scrollY: !!options.scrollY,
            scrollBarSize: this.scrollBarSize,

            minimumColumnWidth: options.minimumColumnWidth,
            displayRowCount: options.displayRowCount
        });

        this.focusModel = new FocusModel({
            grid: this,
            scrollX: !!options.scrollX,
            scrollY: !!options.scrollY,
            scrollBarSize: this.scrollBarSize
        });

        this.selectionModel = new SelectionModel({
            grid: this
        });

        if (options.notUseSmartRendering) {
            this.renderModel = new RenderModel({
                grid: this
            });
        } else {
            this.renderModel = new SmartRenderModel({
                grid: this
            });
        }
    },

    /**
     * 커스텀 이벤트 리스너를 초기화한다.
     * @private
     */
    _initializeListener: function() {
        this.listenTo(this.focusModel, 'select', this._onRowSelectChanged);
    },

    /**
     * select 된 row 가 변경된 경우 이벤트 핸들러.
     * radio select type 의 경우에 select 된 행을 check 해주는 로직을 담당한다.
     * @param {(Number|String)} rowKey 변경이 일어난 데이터의 rowKey
     * @private
     */
    _onRowSelectChanged: function(rowKey) {
        if (this.columnModel.get('selectType') === 'radio') {
            this.uncheckAll();
            this.check(rowKey);
        }
        this.trigger('selectRow', {
            rowKey: rowKey,
            rowData: this.getRow(rowKey)
        });
    },

    /**
     * If the grid has focused element, make sure that focusModel has a valid data,
     * Otherwise call focusModel.blur().
     */
    refreshFocusState: function() {
        var focusModel = this.focusModel;

        if (!this.controller.hasFocusedElement) {
            focusModel.blur();
        } else if (!focusModel.has() && !focusModel.restore()) {
            this.focusAt(0, 0);
        }
    },

    /**
     * clipboard 에 focus 한다.
     */
    focusClipboard: function() {
        this.controller.focusClipboard();
    },

    /**
     * rowKey 와 columnName 에 해당하는 값을 반환한다.
     *
     * @param {(Number|String)} rowKey    행 데이터의 고유 키
     * @param {String} columnName   컬럼 이름
     * @param {boolean} [isOriginal]  원본 데이터 리턴 여부
     * @return {(Number|String|undefined)}    조회한 셀의 값.
     */
    getValue: function(rowKey, columnName, isOriginal) {
        var value, row;
        if (isOriginal) {
            value = this.dataModel.getOriginal(rowKey, columnName);
        } else {
            row = this.dataModel.get(rowKey);
            value = row && row.get(columnName);
        }
        return value;
    },

    /**
     * columnName에 해당하는 column data list를 리턴한다.
     *
     * @param {String} columnName   컬럼명
     * @param {boolean} [isJsonString=false]  true 일 경우 JSON String 으로 반환한다.
     * @return {Array} 컬럼명에 해당하는 셀들의 데이터 리스트
     */
    getColumnValues: function(columnName, isJsonString) {
        var valueList = this.dataModel.pluck(columnName);
        return isJsonString ? $.toJSON(valueList) : valueList;
    },

    /**
     * rowKey에 해당하는 행의 데이터를 리턴한다. isJsonString을 true로 설정하면 결과를 json객체로 변환하여 리턴한다.
     * @param {(Number|String)} rowKey  행 데이터의 고유 키
     * @param {Boolean} [isJsonString=false]  true 일 경우 JSON String 으로 반환한다.
     * @return {Object} 행 데이터
     */
    getRow: function(rowKey, isJsonString) {
        var row = this.dataModel.get(rowKey);
        row = row && row.toJSON();
        return isJsonString ? $.toJSON(row) : row;
    },

    /**
     * 그리드 전체 데이터 중에서 index에 해당하는 순서의 데이터 객체를 리턴한다.
     * @param {Number} index 행의 인덱스
     * @param {Boolean} [isJsonString=false]  true 일 경우 JSON String 으로 반환한다.
     * @return {Object} 행 데이터
     */
    getRowAt: function(index, isJsonString) {
        var row = this.dataModel.at(index).toJSON();
        row = isJsonString ? $.toJSON(row) : row;
        return row;
    },

    /**
     * 현재 그리드에 설정된 전체 데이터의 개수를 리턴한다.
     * @return {Number} 데이터 개수
     */
    getRowCount: function() {
        return this.dataModel.length;
    },

    /**
     * rowKey 와 columnName 에 해당하는 td element 를 반환한다.
     * 내부적으로 자동으로 mainRowKey 를 찾아 반환한다.
     * @param {(Number|String)} rowKey    행 데이터의 고유 키
     * @param {String} columnName   컬럼 이름
     * @return {jQuery} 해당 jQuery Element
     */
    getElement: function(rowKey, columnName) {
        var isLside = this.columnModel.isLside(columnName);
        rowKey = this.dataModel.getMainRowKey(rowKey, columnName);

        return this.controller.getElement(rowKey, columnName, isLside);
    },

    /**
     * rowKey에 해당하는 행에 대해 선택한다.
     * - checkRow()는 행에 포함된 체크박스나 라디오박스를 선택하며, selectRow()는 클릭된 행이 선택되어졌음을 시각적으로 나타내기 위해 해당 행의 배경색을 변경한다.
     *
     * @param {(Number|String)} rowKey 행 데이터의 고유 키
     */
    select: function(rowKey) {
        this.focusModel.select(rowKey);
    },

    /**
     * 선택되었던 행에 대한 선택을 해제한다.
     */
    unselect: function() {
        this.focusModel.unselect(true);
    },

    /**
     * 그리드 내에서 현재 선택된 row의 키값을 리턴한다.
     * @return {(Number|String)} 행 데이터의 고유 키
     */
    getSelectedRowKey: function() {
        return this.focusModel.which().rowKey;
    },

    /**
     * Sets the vlaue of the cell identified by the specified rowKey and columnName.
     * @param {(Number|String)} rowKey    행 데이터의 고유 키
     * @param {String} columnName   컬럼 이름
     * @param {(Number|String)} columnValue 할당될 값
     * @param {Boolean} [silent=false] 이벤트 발생 여부. true 로 변경할 상황은 거의 없다.
     * @returns {Boolean} True if affected row is exist
     */
    setValue: function(rowKey, columnName, columnValue, silent) {
        var row = this.dataModel.get(rowKey),
            obj = {},
            result;

        columnValue = _.isString(columnValue) ? $.trim(columnValue) : columnValue;
        if (row) {
            obj[columnName] = columnValue;
            row.set(obj, {
                silent: silent
            });
            result = true;
        } else {
            result = false;
        }

        return result;
    },

    /**
     * columnName 에 해당하는 값을 전부 변경한다.
     * @param {String} columnName 컬럼명
     * @param {(Number|String)} columnValue 변경할 컬럼 값
     * @param {Boolean} [isCheckCellState=true] 셀의 편집 가능 여부 와 disabled 상태를 체크할지 여부
     * @param {Boolean} [silent=false] change 이벤트 trigger 할지 여부.
     */
    setColumnValues: function(columnName, columnValue, isCheckCellState, silent) {
        var obj = {},
            cellState = {
                isDisabled: false,
                isEditable: true
            };

        obj[columnName] = columnValue;
        isCheckCellState = isCheckCellState === undefined ? true : isCheckCellState;

        this.dataModel.forEach(function(row) {
            if (isCheckCellState) {
                cellState = this.getCellState(row.get('rowKey'), columnName);
            }
            if (!cellState.isDisabled && cellState.isEditable) {
                row.set(obj, {
                    silent: silent
                });
            }
        }, this);
    },

    /**
     * rowList 를 설정한다. setRowList 와 다르게 setOriginalRowList 를 호출하여 원본데이터를 갱신하지 않는다.
     * @param {Array} rowList 설정할 데이터 배열 값
     * @param {boolean} [isParse=true]  backbone 의 parse 로직을 수행할지 여부
     */
    replaceRowList: function(rowList, isParse) {
        var callback = tui.util.bind(function() {
            this.dataModel.set(rowList, {
                parse: isParse
            });
        }, this);
        this.showGridLayer('loading');
        isParse = isParse === undefined ? true : isParse;
        //데이터 파싱에 시간이 많이 걸릴 수 있으므로, loading layer 를 먼저 보여주기 위해 timeout 을 사용한다.
        if (rowList && rowList.length > 500) {
            clearTimeout(this.timeoutIdForSetRowList);
            this.timeoutIdForSetRowList = setTimeout(callback, 0);
        } else {
            callback();
        }
    },

    /**
     * rowList 를 설정하고, setOriginalRowList 를 호출하여 원본데이터를 갱신한다.
     * @param {Array} rowList 설정할 데이터 배열 값
     * @param {boolean} [isParse=true]  backbone 의 parse 로직을 수행할지 여부
     * @param {function} [callback] 완료시 호출될 함수
     */
    setRowList: function(rowList, isParse, callback) {
        var doProcess = tui.util.bind(function() {
            this.dataModel.reset(rowList, {
                parse: isParse
            });
            this.dataModel.setOriginalRowList();
            if (_.isFunction(callback)) {
                callback();
            }
        }, this);
        this.showGridLayer('loading');
        isParse = isParse === undefined ? true : isParse;
        //데이터 파싱에 시간이 많이 걸릴 수 있으므로, loading layer 를 먼저 보여주기 위해 timeout 을 사용한다.
        if (rowList && rowList.length > 500) {
            clearTimeout(this.timeoutIdForSetRowList);
            this.timeoutIdForSetRowList = setTimeout(doProcess, 0);
        } else {
            doProcess();
        }
    },

    /**
     * rowKey, columnName 에 해당하는 셀에 포커싱한다.
     * @param {(Number|String)} rowKey    행 데이터의 고유 키
     * @param {String} columnName   컬럼 이름
     * @param {boolean} [isScrollable=false] 그리드에서 해당 영역으로 scroll 할지 여부
     */
    focus: function(rowKey, columnName, isScrollable) {
        this.focusModel.focus(rowKey, columnName, isScrollable);
    },

    /**
     * 셀을 편집모드로 전환한다.
     * @param {(Number|String)} rowKey    행 데이터의 고유 키
     * @param {String} columnName   컬럼 이름
     * @param {boolean} [isScrollable=false] 그리드에서 해당 영역으로 scroll 할지 여부
     */
    focusIn: function(rowKey, columnName, isScrollable) {
        var cellPainter;
        this.focus(rowKey, columnName, isScrollable);
        rowKey = this.dataModel.getMainRowKey(rowKey, columnName);
        if (this.isEditable(rowKey, columnName)) {
            cellPainter = this.cellFactory.getInstance(this.columnModel.getEditType(columnName));
            cellPainter.focusIn(this.getElement(rowKey, columnName));
        } else {
            this.focusClipboard();
        }
    },

    /**
     * rowIndex, columnIndex 에 해당하는 컬럼에 포커싱한다.
     * @param {(Number|String)} rowIndex 행 index
     * @param {String} columnIndex 열 index
     * @param {boolean} [isScrollable=false] 그리드에서 해당 영역으로 scroll 할지 여부
     */
    focusAt: function(rowIndex, columnIndex, isScrollable) {
        var row = this.dataModel.at(rowIndex),
            column = this.columnModel.at(columnIndex, true);
        if (row && column) {
            this.focus(row.get('rowKey'), column['columnName'], isScrollable);
        }
    },

    /**
     * rowIndex, columnIndex 에 해당하는 컬럼에 포커싱 후 편진모드로 전환 한다.
     * @param {(Number|String)} rowIndex 행 index
     * @param {String} columnIndex 열 index
     * @param {boolean} [isScrollable=false] 그리드에서 해당 영역으로 scroll 할지 여부
     */
    focusInAt: function(rowIndex, columnIndex, isScrollable) {
        var row = this.dataModel.at(rowIndex),
            column = this.columnModel.at(columnIndex, true);
        if (row && column) {
            this.focusIn(row.get('rowKey'), column['columnName'], isScrollable);
        }
    },

    /**
     * 현재 포커스 된 컬럼이 있을 경우 포커스 상태를 해제한다
     */
    blur: function() {
        this.focusModel.blur();
    },

    /**
     * 전체 행을 선택한다.
     */
    checkAll: function() {
        this.setColumnValues('_button', true);
    },

    /**
     * rowKey에 해당하는 행의 체크박스 및 라디오박스를 선택한다.
     * @param {(Number|String)} rowKey    행 데이터의 고유 키
     */
    check: function(rowKey) {
        this.setValue(rowKey, '_button', true);
    },

    /**
     * 모든 행을 선택 해제 한다.
     */
    uncheckAll: function() {
        this.setColumnValues('_button', false);
    },

    /**
     * rowKey 에 해당하는 행의 체크박스 및 라디오박스를 선택한다.
     * @param {(Number|String)} rowKey    행 데이터의 고유 키
     */
    uncheck: function(rowKey) {
        this.setValue(rowKey, '_button', false);
    },

    /**
     * 그리드의 모든 데이터를 삭제하고 norowlayer 클래스명을 가지는 엘리먼트를 보여준다.
     */
    clear: function() {
        //@todo: empty 레이어 추가
        this.setRowList([]);
    },

    /**
     * rowKey에 해당하는 그리드 데이터를 삭제한다.
     * @param {(Number|String)} rowKey - 행 데이터의 고유 키
     * @param {boolean|object} options - 삭제 옵션
     * @param {boolean} options.removeOriginalData - 원본 데이터도 함께 삭제할 지 여부
     * @param {boolean} options.keepRowSpanData - rowSpan이 mainRow를 삭제하는 경우 데이터를 유지할지 여부
     */
    removeRow: function(rowKey, options) {
        this.dataModel.removeRow(rowKey, options);
    },

    /**
     * chcked된 행을 삭제한다.
     * @param {boolean} isConfirm 삭제하기 전에 confirm 메시지를 표시할지 여부
     * @return {boolean} 삭제된 행이 있으면 true, 없으면 false
     */
    removeCheckedRows: function(isConfirm) {
        var rowKeyList = this.getCheckedRowKeyList(),
            message = rowKeyList.length + '건의 데이터를 삭제하시겠습니까?';

        if (rowKeyList.length > 0 && (!isConfirm || confirm(message))) {
            _.each(rowKeyList, function(rowKey) {
                this.removeRow(rowKey);
            }, this);
            return true;
        }
        return false;
    },

    /**
     * rowKey에 해당하는 행을 활성화시킨다.
     * @param {(Number|String)} rowKey 행 데이터의 고유 키
     */
    enableRow: function(rowKey) {
        this.dataModel.get(rowKey).setRowState('');
    },

    /**
     * rowKey에 해당하는 행을 비활성화 시킨다.
     * @param {(Number|String)} rowKey    행 데이터의 고유 키
     */
    disableRow: function(rowKey) {
        this.dataModel.get(rowKey).setRowState('DISABLED');
    },

    /**
     * rowKey에 해당하는 행의 메인 체크박스를 체크할 수 있도록 활성화 시킨다.
     * @param {(Number|String)} rowKey 행 데이터의 고유 키
     */
    enableCheck: function(rowKey) {
        this.dataModel.get(rowKey).setRowState('');
    },

    /**
     * rowKey에 해당하는 행의 메인 체크박스를 체크하지 못하도록 비활성화 시킨다.
     * @param {(Number|String)} rowKey 행 데이터의 고유 키
     */
    disableCheck: function(rowKey) {
        this.dataModel.get(rowKey).setRowState('DISABLED_CHECK');
    },

    /**
     * 현재 선택된 행들의 키값만을 배열로 리턴한다.
     * @param {Boolean} [isJsonString=false]  true 일 경우 json 문자열을 리턴한다.
     * @return {Array|String} 선택된 행들의 키값 리스트.
     */
    getCheckedRowKeyList: function(isJsonString) {
        var rowKeyList = [];
        _.each(this.dataModel.where({
            _button: true
        }), function(row) {
            rowKeyList.push(row.get('rowKey'));
        }, this);
        return isJsonString ? $.toJSON(rowKeyList) : rowKeyList;
    },

    /**
     * 현재 선택된 행들의 모든 데이터를 배열로 리턴한다.
     * @param {Boolean} [isJsonString=false]  true 일 경우 json 문자열을 리턴한다.
     * @return {Array|String} 선택된 행들의 데이터값 리스트.
     */
    getCheckedRowList: function(isJsonString) {
        var checkedRowList = this.dataModel.getRowList(true);
        return isJsonString ? $.toJSON(checkedRowList) : checkedRowList;
    },

    /**
     * 그리드에 설정된 컬럼모델 정보를 배열 형태로 리턴한다.
     * @return {Array}  컬럼모델 리스트
     */
    getColumnModelList: function() {
        return this.columnModel.get('dataColumnModelList');
    },

    /**
     * 그리드 내에서 변경된 데이터들의 목록을 구성하여 리턴한다.
     * 리턴되는 객체에는 createList, updateList, deleteList 라는 필드가 있고,
     * 각 필드에는 변경된 데이터들이 배열로 구성되어 있다.
     * @param {Object} [options] Options
     *      @param {boolean} [options.isOnlyChecked=false] true 로 설정된 경우 checked 된 데이터 대상으로 비교 후 반환한다.
     *      @param {boolean} [options.isRaw=false] true 로 설정된 경우 내부 연산용 데이터 제거 필터링을 거치지 않는다.
     *      @param {boolean} [options.isOnlyRowKeyList=false] true 로 설정된 경우 키값만 저장하여 리턴한다.
     *      @param {Array} [options.filteringColumnList]   행 데이터 중에서 데이터 변경으로 간주하지 않을 컬럼 이름을 배열로 설정한다.
     * @return {{createList: Array, updateList: Array, deleteList: Array}} 옵션에 따라 반환된 수정된 데이터 목록
     */
    getModifiedRowList: function(options) {
        //@todo 파라미터 옵션에 따른 데이터 형 변화
        return this.dataModel.getModifiedRowList(options);
    },

    /**
     * 현재 그리드의 제일 끝에 행을 추가한다.
     * @param {object} [row] - row 데이터 오브젝트 없을경우 임의로 빈 데이터를 추가한다.
     * @param {object} [options] - 옵션 객체
     * @param {number} options.at - 데이터를 append 할 index
     */
    appendRow: function(row, options) {
        this.dataModel.append(row, options);
    },

    /**
     * 현재 그리드의 제일 앞에 행을 추가한다.
     * @param {object} [row]  row 데이터 오브젝트 없을경우 임의로 빈 데이터를 추가한다.
     */
    prependRow: function(row) {
        this.dataModel.prepend(row);
    },

    /**
     * 열 고정 위치를 변경한다.
     * @param {Number} columnFixCount 고정시킬 열의 인덱스
     */
    setColumnFixCount: function(columnFixCount) {
        this.columnModel.set({
            columnFixCount: columnFixCount
        });
    },

    /**
     * 현재 그리드에 설정된 데이터의 변경 여부를 Boolean으로 리턴한다.
     * - getModifiedRowList() 함수의 결과값을 이용하여 입력/수정/삭제가 되었으면 true를 리턴하고 그렇지 않은 경우에는 false를 리턴한다.
     * @return {Boolean}    데이터가 변경되었는지 여부
     */
    isChanged: function() {
        var modifiedRowMap = this.getModifiedRowList(),
            result = false;

        tui.util.forEach(modifiedRowMap, function(data) {
            if (data.length) {
                result = true;
                return false;
            }
        });

        return result;
    },

    /**
     * setRowList()를 통해 그리드에 설정된 초기 데이터 상태로 복원한다.
     * 그리드에서 수정되었던 내용을 초기화하는 용도로 사용한다.
     */
    restore: function() {
        var originalRowList = this.dataModel.getOriginalRowList();
        this.replaceRowList(originalRowList, true);
    },

    /**
     * Grid Layer 를 모두 감춘다.
     */
    hideGridLayer: function() {
        this.controller.hideGridLayer();
    },

    /**
     * name 에 해당하는 Grid Layer를 보여준다.
     * @param {String} name ready|empty|loading 중 하나를 설정한다.
     */
    showGridLayer: function(name) {
        this.controller.showGridLayer(name);
    },

    /**
     * addon 을 활성화한다.
     * @param {string} name addon 이름
     * @param {object} options addon 에 넘길 파라미터
     * @return {Core} this
     */
    use: function(name, options) {
        var Constructor = addOn[name];

        options = $.extend({grid: this}, options);
        if (Constructor) {
            this.addOn[name] = new Constructor(options);
        }
        return this;
    },

    /**
     * 정렬이 되었는지 여부 반환
     * @return {Boolean} 현재 정렬이 되어있는지 여부
     */
    isSorted: function() {
        return this.dataModel.isSortedByField();
    },

    /**
     * rowKey 와 columnName 에 해당하는 셀이 편집 가능한지 여부를 반환한다.
     * @param {(Number|String)} rowKey 행 데이터의 고유 키
     * @param {String} columnName 컬럼 이름
     * @return {Boolean} 편집 가능한지 여부
     */
    isEditable: function(rowKey, columnName) {
        var focused = this.focusModel.which(),
            dataModel = this.dataModel,
            row,
            isEditable;

        rowKey = rowKey !== undefined ? rowKey : focused.rowKey;
        columnName = columnName !== undefined ? columnName : focused.columnName;
        row = dataModel.get(rowKey);
        isEditable = row ? row.isEditable(columnName) : true;
        return isEditable;
    },

    /**
     * rowKey 와 columnName 에 해당하는 셀이 disabled 상태인지 여부를 반환한다.
     * @param {(Number|String)} rowKey 행 데이터의 고유 키
     * @param {String} columnName 컬럼 이름
     * @return {Boolean} disabled 상태인지 여부
     */
    isDisabled: function(rowKey, columnName) {
        var focused = this.focusModel.which(),
            dataModel = this.dataModel,
            row,
            isDisabled;

        rowKey = rowKey !== undefined ? rowKey : focused.rowKey;
        columnName = columnName !== undefined ? columnName : focused.columnName;
        row = dataModel.get(rowKey);
        isDisabled = row ? row.isDisabled(columnName) : false;
        return isDisabled;
    },

    /**
     * rowKey 와 columnName 에 해당하는 셀의 편집 가능여부와 disabled 상태 여부를 반환한다.
     * @param {(Number|String)} rowKey 행 데이터의 고유 키
     * @param {String} columnName 컬럼 이름
     * @return {{isEditable: boolean, isDisabled: boolean}} 편집가능한지 여부와 disabled 인지 여부.
     */
    getCellState: function(rowKey, columnName) {
        var focused = this.focusModel.which(),
            dataModel = this.dataModel;

        rowKey = rowKey !== undefined ? rowKey : focused.rowKey;
        columnName = columnName !== undefined ? columnName : focused.columnName;

        return dataModel.get(rowKey).getCellState(columnName);
    },

    /**
     * columnModelList 를 재설정한다..
     * @param {Array} columnModelList 컬럼모델 리스트
     */
    setColumnModelList: function(columnModelList) {
        this.columnModel.set('columnModelList', columnModelList);
    },

    /**
     * columnName 기준으로 정렬한다.
     * @param {String} columnName 정렬할 컬럼명
     * @param {Boolean} isAscending 오름차순 여부
     */
    sort: function(columnName, isAscending) {
        this.dataModel.sortByField(columnName, isAscending);
    },

    /**
     * 현재 그리드의 rowList 를 반환한다.
     * @return {Array} 그리드의 데이터 리스트
     */
    getRowList: function() {
        return this.dataModel.getRowList();
    },

    /**
     * rowKey 와 columnName 에 해당하는 text 형태의 셀의 값을 삭제한다.
     * @param {(Number|String)} rowKey 행 데이터의 고유 키
     * @param {String} columnName 컬럼 이름
     * @param {Boolean} [silent=false] 이벤트 발생 여부. true 로 변경할 상황은 거의 없다.
     */
    del: function(rowKey, columnName, silent) {
        var editType = this.columnModel.getEditType(columnName),
            mainRowKey = this.dataModel.getMainRowKey(rowKey, columnName),
            isDisabledCheck = this.dataModel.get(mainRowKey).getRowState().isDisabledCheck,
            deletableEditTypeList = ['text', 'text-convertible', 'text-password'],
            isDeletable = $.inArray(editType, deletableEditTypeList) !== -1,
            selectType = this.columnModel.get('selectType'),
            cellState = this.getCellState(mainRowKey, columnName),
            isRemovable = !!(isDeletable && cellState.isEditable && !cellState.isDisabled);

        if (isRemovable) {
            this.setValue(mainRowKey, columnName, '', silent);
            //silent 의 경우 데이터 모델의 change 이벤트가 발생하지 않기 때문에, 강제로 checkbox 를 세팅한다.
            if (silent && selectType === 'checkbox' && !isDisabledCheck) {
                this.setValue(mainRowKey, '_button', true, silent);
            }
        }
    },

    /**
     * 2차원 배열로 된 데이터를 받아 현재 Focus된 셀을 기준으로 하여 각각의 인덱스의 해당하는 만큼 우측 아래 방향으로
     * 이동하며 셀의 값을 변경한다. 완료한 후 적용된 셀 범위에 Selection을 지정한다.
     * @param {Array[]} data - 2차원 배열 데이터. 내부배열의 사이즈는 모두 동일해야 한다.
     */
    paste: function(data) {
        var columnModelList = this.columnModel.getVisibleColumnModelList(),
            startIdx = this._getStartIndexToPaste(),
            endIdx = this._getEndIndexToPaste(startIdx, data, columnModelList);

        // console.log('startIdx', startIdx, 'endIdx', endIdx);
        _.each(data, function(row, index) {
            this._setValueForPaste(row, startIdx.row + index, startIdx.column, endIdx.column);
        }, this);

        this.selectionModel.start(startIdx.row, startIdx.column);
        this.selectionModel.update(endIdx.row, endIdx.column);
    },

    /**
     * 붙여넣기를 실행할때 시작점이 될 셀의 인덱스를 반환한다.
     * @return {{row: number, column: number}} 행과 열의 인덱스 정보를 가진 객체
     */
    _getStartIndexToPaste: function() {
        var startIdx;

        if (this.selectionModel.hasSelection()) {
            startIdx = this.selectionModel.getStartIndex();
        } else {
            startIdx = this.focusModel.indexOf();
        }
        return startIdx;
    },

    /**
     * 붙여넣기를 실행할 때 끝점이 될 셀의 인덱스를 반환한다.
     * @param  {{row: number, column: number}} startIdx - 시작점이 될 셀의 인덱스
     * @param  {Array[]} data - 붙여넣기할 데이터
     * @param  {Array} columnModelList - 현재 화면에 보여지는 컬럼모델의 목록
     * @return {{row: number, column: number}} 행과 열의 인덱스 정보를 가진 객체
     */
    _getEndIndexToPaste: function(startIdx, data, columnModelList) {
        var endIdx = {
            row: data.length + startIdx.row - 1,
            column: Math.min(data[0].length + startIdx.column, columnModelList.length) - 1
        };
        return endIdx;
    },

    /**
     * 주어진 행 데이터를 지정된 인덱스의 컬럼에 반영한다.
     * 셀이 수정 가능한 상태일 때만 값을 변경하며, RowSpan이 적용된 셀인 경우 MainRow인 경우에만 값을 변경한다.
     * @param  {rowData} rowData - 붙여넣을 행 데이터
     * @param  {number} rowIdx - 행 인덱스
     * @param  {number} columnStartIdx - 열 시작 인덱스
     * @param  {number} columnEndIdx - 열 종료 인덱스
     */
    _setValueForPaste: function(rowData, rowIdx, columnStartIdx, columnEndIdx) {
        var row = this.dataModel.at(rowIdx),
            attributes = {},
            columnIdx, columnName, cellState, rowSpanData;

        if (!row) {
            row = this.dataModel.append({})[0];
        }
        // console.log('columnModel', this.columnModel.get('dataColumnModelList'));
        for (columnIdx = columnStartIdx; columnIdx <= columnEndIdx; columnIdx += 1) {
            columnName = this.columnModel.at(columnIdx, true).columnName;
            cellState = row.getCellState(columnName);
            rowSpanData = row.getRowSpanData(columnName);

            if (cellState.isEditable && !cellState.isDisabled && (!rowSpanData || rowSpanData.count >= 0)) {
                attributes[columnName] = rowData[columnIdx - columnStartIdx];
            }
        }
        // console.log('attributes', attributes);
        row.set(attributes);
    },

    /**
     * rowKey 와 columnName 에 해당하는 Cell 에 CSS className 을 설정한다.
     * @param {(Number|String)} rowKey 행 데이터의 고유 rowKey
     * @param {String} columnName 컬럼 이름
     * @param {String} className 지정할 디자인 클래스명
     */
    addCellClassName: function(rowKey, columnName, className) {
        this.dataModel.get(rowKey).addCellClassName(columnName, className);
    },

    /**
     * rowKey 에 해당하는 행 전체에 CSS className 을 설정한다.
     * @param {(Number|String)} rowKey 행 데이터의 고유 rowKey
     * @param {String} className 지정할 디자인 클래스명
     */
    addRowClassName: function(rowKey, className) {
        this.dataModel.get(rowKey).addClassName(className);
    },

    /**
     * rowKey 와 columnName 에 해당하는 Cell 에 CSS className 을 제거한다.
     * @param {(Number|String)} rowKey 행 데이터의 고유 rowKey
     * @param {String} columnName 컬럼 이름
     * @param {String} className 지정할 디자인 클래스명
     */
    removeCellClassName: function(rowKey, columnName, className) {
        this.dataModel.get(rowKey).removeCellClassName(columnName, className);
    },

    /**
     * rowKey 에 해당하는 행 전체에 CSS className 을 제거한다.
     * @param {(Number|String)} rowKey 행 데이터의 고유 rowKey
     * @param {String} className 지정할 디자인 클래스명
     */
    removeRowClassName: function(rowKey, className) {
        this.dataModel.get(rowKey).removeClassName(className);
    },

    /**
     * rowKey 와 columnName 에 해당하는 Cell 의 rowSpanData 를 반환한다.
     * @param {(Number|String)} rowKey 행 데이터의 고유 rowKey
     * @param {String} columnName 컬럼 이름
     * @returns {object} rowSpanData
     */
    getRowSpanData: function(rowKey, columnName) {
        var row = this.dataModel.get(rowKey);
        if (row) {
            return row.getRowSpanData(columnName);
        }
    },

    /**
     * rowKey에 해당하는 행의 인덱스를 반환한다.
     * @param {number|string} rowKey - 행 고유키
     * @return {number} - 인덱스
     */
    getIndexOfRow: function(rowKey) {
        return this.dataModel.indexOfRowKey(rowKey);
    },

    /**
     * 화면에 한번에 보여지는 행 개수를 변경한다.
     * @param {number} count - 행 개수
     */
    setDisplayRowCount: function(count) {
        this.dimensionModel.set('displayRowCount', count);
    },

    /**
     * Sets the width and height of the dimension.
     * @param {(number|null)} width - Width
     * @param {(number|null)} height - Height
     */
    setSize: function(width, height) {
        if (width > 0) {
            this.controller.setWidth(width);
        }
        if (height > 0) {
            this.dimensionModel.setHeight(height);
        }
        this.updateLayoutData();
    },

    /**
     * layout 에 필요한 크기 및 위치 데이터를 갱신한다.
     */
    updateLayoutData: function() {
        var offset = this.controller.getOffset();

        this.dimensionModel.set({
            offsetTop: offset.top,
            offsetLeft: offset.left,
            width: this.controller.getWidth()
        });
    },

    /**
     * 소멸자
     */
    destroy: function() {
        _.each(this, function(value, property) {
            if (value && tui.util.isFunction(value._destroy)) {
                value._destroy();
            }
            if (value && tui.util.isFunction(value.stopListening)) {
                value.stopListening();
            }
            this[property] = null;
        }, this);
    },

    setController: function(controller) {
        this.controller = controller;
    }
});

module.exports = Core;
