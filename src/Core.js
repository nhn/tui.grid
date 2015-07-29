'use strict';
/**
 * @fileoverview Grid Core 파일
 * @author NHN Ent. FE Development Team
 */
/**
 * Grid 코어
 * @constructor Core
 */
var Core = View.Base.extend(/**@lends Core.prototype */{
    /**
     * 스크롤바의 높이
     * @type {Number}
     */
    scrollBarSize: 17,
    lside: null,
    rside: null,
    toolbar: null,
    cellFactory: null,
    events: {
        'click': '_onClick',
        'mousedown': '_onMouseDown',
        'selectstart': '_preventDrag',
        'dragstart': '_preventDrag',
        'mouseover': '_onMouseOver',
        'mouseout': '_onMouseOut'
    },
    keyMap: {
        'TAB': 9,
        'ENTER': 13,
        'CTRL': 17,
        'ESC': 27,
        'LEFT_ARROW': 37,
        'UP_ARROW': 38,
        'RIGHT_ARROW': 39,
        'DOWN_ARROW': 40,
        'CHAR_A': 65,
        'CHAR_C': 67,
        'CHAR_F': 70,
        'CHAR_R': 82,
        'CHAR_V': 86,
        'LEFT_WINDOW_KEY': 91,
        'F5': 116,
        'BACKSPACE': 8,
        'SPACE': 32,
        'PAGE_UP': 33,
        'PAGE_DOWN': 34,
        'HOME': 36,
        'END': 35,
        'DEL': 46,
        'UNDEFINED': 229
    },
    keyName: {
        9: 'TAB',
        13: 'ENTER',
        17: 'CTRL',
        27: 'ESC',
        37: 'LEFT_ARROW',
        38: 'UP_ARROW',
        39: 'RIGHT_ARROW',
        40: 'DOWN_ARROW',
        65: 'CHAR_A',
        67: 'CHAR_C',
        70: 'CHAR_F',
        82: 'CHAR_R',
        86: 'CHAR_V',
        91: 'LEFT_WINDOW_KEY',
        116: 'F5',
        8: 'BACKSPACE',
        32: 'SPACE',
        33: 'PAGE_UP',
        34: 'PAGE_DOWN',
        36: 'HOME',
        35: 'END',
        46: 'DEL',
        229: 'UNDEFINED'
    },
    /**
     * 생성자 함수
     * @param {Object} options Grid.js 의 생성자 option 과 동일값.
     */
    initialize: function(options) {
        View.Base.prototype.initialize.apply(this, arguments);
        this.publicInstance = options.publicInstance;
        var id = Util.getUniqueKey();
        this.__instance[id] = this;
        this.id = id;

        this._initializeOptions(options);
        this._initializeProperties();

        this._initializeModel();
        this._initializeListener();
        this._initializeView();

        this._initializeScrollBar();

        this._attachExtraEvent();

        this.render();

        this.updateLayoutData();
    },
    /**
     * default 설정된 옵션에서 생성자로부터 인자로 받은 옵션들을 확장하여 옵션을 설정한다.
     * @param {Object} options Grid.js 의 생성자 option 과 동일값.
     * @private
     */
    _initializeOptions: function(options) {
        var defaultOptions = {
            columnFixIndex: 0,
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
            useDataCopy: true,
            useClientSort: true,

            toolbar: {
                hasResizeHandler: true,
                hasControlPanel: true,
                hasPagination: true
            }
        };

        this.options = $.extend(true, defaultOptions, options);
    },
    /**
     * 내부 properties 를 초기화한다.
     * @private
     */
    _initializeProperties: function() {
        this.setOwnProperties({
            'cellFactory': null,
            'selection': null,
            'columnModel': null,
            'dataModel': null,
            'renderModel': null,
            'layoutModel': null,
            'focusModel': null,
            'addOn': {},
            'view': {
                'lside': null,
                'rside': null,
                'toolbar': null,
                'clipboard': null,
                'layer': {
                    ready: null,
                    loading: null,
                    empty: null
                }
            },
            'timeoutIdForBlur': 0,
            'timeoutIdForResize': 0,
            'timeoutIdForSetRowList': 0,
            '__$el': this.$el.clone()
        });
    },
    /**
     * 내부에서 사용할 모델 instance를 초기화한다.
     *
     * Initialize data model instances
     * @private
     */
    _initializeModel: function() {
        var offset = this.$el.offset();

        //define column model
        this.columnModel = new Data.ColumnModel({
            grid: this,
            hasNumberColumn: this.option('autoNumbering'),
            keyColumnName: this.option('keyColumnName'),
            columnFixIndex: this.option('columnFixIndex'),
            selectType: this.option('selectType')
        });
        this.setColumnModelList(this.option('columnModelList'));

        //define layout model
        this.dimensionModel = new Model.Dimension({
            grid: this,
            offsetTop: offset.top,
            offsetLeft: offset.left,
            width: this.$el.width(),
            height: this.$el.height(),
            headerHeight: this.option('headerHeight'),
            rowHeight: this.option('rowHeight'),

            scrollX: !!this.option('scrollX'),
            scrollY: !!this.option('scrollY'),
            scrollBarSize: this.scrollBarSize,

            minimumColumnWidth: this.option('minimumColumnWidth'),
            displayRowCount: this.option('displayRowCount')
        });

        // define focus model
        this.focusModel = new Model.Focus({
            grid: this,
            scrollX: !!this.option('scrollX'),
            scrollY: !!this.option('scrollY'),
            scrollBarSize: this.scrollBarSize
        });

        //define rowList
        this.dataModel = new Data.RowList([], {
            grid: this,
            useClientSort: this.option('useClientSort')
        });
        this.dataModel.reset([]);

        if (this.option('notUseSmartRendering')) {
            this.renderModel = new Model.Renderer({
                grid: this
            });
        } else {
            this.renderModel = new Model.Renderer.Smart({
                grid: this
            });
        }
    },
    /**
     * 내부에서 사용할 view 인스턴스들을 초기화한다.
     * @private
     */
    _initializeView: function() {
        this.cellFactory = this.createView(View.CellFactory, {
            grid: this
        });

        this.selection = this.createView(View.Selection, {
            grid: this
        });

        //define header & body area
        this.view.lside = this.createView(View.Layout.Frame.Lside, {
            grid: this
        });

        this.view.rside = this.createView(View.Layout.Frame.Rside, {
            grid: this
        });

        this.view.toolbar = this.createView(View.Layout.Toolbar, {
            grid: this
        });

        this.view.layer.ready = this.createView(View.Layer.Ready, {
            grid: this
        });
        this.view.layer.empty = this.createView(View.Layer.Empty, {
            grid: this
        });
        this.view.layer.loading = this.createView(View.Layer.Loading, {
            grid: this
        });

        this.view.clipboard = this.createView(View.Clipboard, {
            grid: this
        });

        if (this.options && !this.options.useDataCopy) {
            this.selection.disable();
        }
    },
    /**
     * 커스텀 이벤트 리스너를 초기화한다.
     * @private
     */
    _initializeListener: function() {
        this.listenTo(this.dimensionModel, 'change:width', this._onWidthChange)
            .listenTo(this.dimensionModel, 'change:bodyHeight', this._setHeight)
            .listenTo(this.focusModel, 'select', this._onRowSelectChanged);
    },
    /**
     * scrollbar 를 초기화한다.
     * @private
     */
    _initializeScrollBar: function() {
//            if(!this.option('scrollX')) this.$el.css('overflowX', 'hidden');
//            if(!this.option('scrollY')) this.$el.css('overflowY', 'hidden');
    },
    /**
     * event 속성에 정의되지 않은 이벤트 attach 한다.
     * @private
     */
    _attachExtraEvent: function() {
        $(window).on('resize', $.proxy(this._onWindowResize, this));
        $(document).on('focusin', $.proxy(this._onBlur, this));
    },

    /**
     * 클립보드 blur 이벤트 핸들러
     * @private
     */
    _onBlur: function() {
        clearTimeout(this.timeoutIdForBlur);
        this.timeoutIdForBlur = setTimeout($.proxy(this._doBlur, this), 0);
    },
    /**
     * 실제 blur 를 한다.
     * @private
     */
    _doBlur: function() {
        if (this.$el) {
            var $focused = this.$el.find(':focus'),
                hasFocusedElement = !!$focused.length;

            if (!hasFocusedElement) {
                this.focusModel.blur();
            } else if ($focused.is('td') || $focused.is('a')) {
                this.focusClipboard();
            }
        }
    },
    /**
     * drag 이벤트 발생시 이벤트 핸들러
     * @returns {boolean}
     * @private
     */
    _preventDrag: function() {
        return false;
    },
    /**
     * window resize  이벤트 핸들러
     * @private
     */
    _onWindowResize: function() {
        var minimumWidth = this.option('minimumWidth') || 0,
            width = this.$el.width();

        if (width < minimumWidth) {
            this.$el.css('width', minimumWidth + 'px');
        } else {
            this.$el.css('width', 'auto');
        }
        this.dimensionModel.set('width', Math.max(width, minimumWidth));
    },
    /**
     * click 이벤트 핸들러
     * @param {MouseEvent} mouseEvent 이벤트 객체
     * @private
     */
    _onClick: function(mouseEvent) {
        var eventData = this.createEventData(mouseEvent),
            $target = $(mouseEvent.target);

        if (this._isCellElement($target, true)) {
            this._triggerCellMouseEvent('clickCell', eventData, $target.closest('td'));
        }
        this.trigger('click', eventData);

        if (eventData.isStopped()) {
            return;
        }
    },
    /**
     * mouseover 이벤트 발생시 실행될 핸들러
     * @private
     * @param {MouseEvent} mouseEvent 마우스 이벤트 객체
     */
    _onMouseOver: function(mouseEvent) {
        var $target = $(mouseEvent.target),
            eventData;

        if (this._isCellElement($target)) {
            eventData = this.createEventData(mouseEvent);
            this._triggerCellMouseEvent('mouseoverCell', eventData, $target);
        }
    },
    /**
     * mouseout 이벤트 발생시 실행될 핸들러
     * @private
     * @param {MouseEvent} mouseEvent 마우스 이벤트 객체
     */
    _onMouseOut: function(mouseEvent) {
        var $target = $(mouseEvent.target),
            eventData;

        if (this._isCellElement($target)) {
            eventData = this.createEventData(mouseEvent);
            this._triggerCellMouseEvent('mouseoutCell', eventData, $target);
        }
    },
    /**
     * 셀과 관련된 커스텀 마우스 이벤트를 발생시킨다.
     * @private
     * @param {string} eventName 이벤트명
     * @param {MouseEvent} eventData 커스터마이징 된 마우스 이벤트 객체
     * @param {jQuery} $cell 셀 HTML요소의 jquery 객체
     */
    _triggerCellMouseEvent: function(eventName, eventData, $cell) {
        _.extend(eventData, this._getCellInfoFromElement($cell));
        this.trigger(eventName, eventData);
    },
    /**
     * 해당 HTML요소가 셀인지 여부를 반환한다.
     * @private
     * @param {jQuery} $target 검사할 HTML요소의 jQuery 객체
     * @param {boolean} isIncludeChild true이면 셀의 자식요소까지 포함한다.
     * @return {boolean} 셀이면 true, 아니면 false
     */
    _isCellElement: function($target, isIncludeChild) {
        var $td = isIncludeChild ? $target.closest('td') : $target;

        if (!$td.is('td')) {
            return false;
        }
        return !!($td.parent().attr('key') && $td.attr('columnname'));
    },
    /**
     * HTML요소에서 셀의 rowKey와 columnName값을 찾아서 rowData와 함께 객체로 반환한다.
     * @private
     * @param {jQuery} $cell TD요소의 jquery 객체
     * @return {{rowKey: string, rowData: Data.Row, columnName: string}} 셀 관련 정보를 담은 객체
     */
    _getCellInfoFromElement: function($cell) {
        var rowKey = $cell.parent().attr('key'),
            columnName = $cell.attr('columnname');

        return {
            rowKey: rowKey,
            columnName: columnName,
            rowData: this.getRow(rowKey)
        };
    },
    /**
     * mousedown 이벤트 핸들러
     * @param {event} mouseDownEvent 이벤트 객체
     * @private
     */
    _onMouseDown: function(mouseDownEvent) {
        var $target = $(mouseDownEvent.target),
            eventData = this.createEventData(mouseDownEvent);
        this.trigger('mousedown', eventData);

        if (eventData.isStopped()) return;
        if (!($target.is('input') || $target.is('a') || $target.is('button') || $target.is('select'))) {
            mouseDownEvent.preventDefault();
            this.selection.show();
        }
        this.focusClipboard();
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
     * width 변경시 layout data 를 update 한다.
     * @private
     */
    _onWidthChange: function() {
        this.updateLayoutData();
    },
    /**
     * layout 에 필요한 크기 및 위치 데이터를 갱신한다.
     * @private
     */
    updateLayoutData: function() {
        var offset = this.$el.offset(),
            rsideTotalWidth = this.dimensionModel.getFrameWidth('R'),
            maxScrollLeft = rsideTotalWidth - this.dimensionModel.get('rsideWidth');

        this.renderModel.set({
            maxScrollLeft: maxScrollLeft
        });
        this.dimensionModel.set({
            offsetTop: offset.top,
            offsetLeft: offset.left,
            width: this.$el.width(),
            height: this.$el.height(),
            toolbarHeight: this.view.toolbar.$el.height()
        });
    },

    /**
     * option 값을 설정하거나 가져온다.
     * @param {(String|Number)} key 데이터의 key
     * @param {*} [value]   설정할 값. 두번째 값이 설정되어 있지 않다면 getter 로 활용된다.
     * @return {*}  결과값
     */
    option: function(key, value) {
        if (ne.util.isUndefined(value)) {
            this.options = this.options || {};
            return this.options[key];
        } else {
            this.options[key] = value;
            return this;
        }
    },
    /**
     * clipboard 에 focus 한다.
     */
    focusClipboard: function() {
        /* istanbul ignore next: focus 이벤트 확인이 불가함 */
        if (ne.util.isExisty(ne.util.pick(this, 'view', 'clipboard'))) {
            this.view.clipboard.$el.focus();
        }
    },

    /**
     * 랜더링한다.
     *
     * Rendering grid view
     */
    render: function() {
        var leftLine = $('<div>').addClass('left_line'),
            rightLine = $('<div>').addClass('right_line');

        this.$el.addClass('grid_wrapper')
            .addClass('uio_grid')
            .attr('instanceId', this.id)
            .append(this.view.layer.empty.render().el)
            .append(this.view.layer.loading.render().el)
            .append(this.view.layer.ready.render().el);

        this.view.layer.loading.show('초기화 중입니다.');

        this.$el.append(this.view.lside.render().el)
            .append(this.view.rside.render().el)
            .append(this.view.toolbar.render().el)
            .append(leftLine)
            .append(rightLine)
            .append(this.view.clipboard.render().el);
        this._setHeight();
        this.trigger('rendered');
    },
    /**
     * rendering 이후, 또는 bodyHeight 가 변경되었을 때, header, toolbar 의 높이를 포함하여
     * grid 의 전체 너비를 설정한다.
     * @private
     */
    _setHeight: function() {
        var bodyHeight = this.dimensionModel.get('bodyHeight'),
            headerHeight = this.dimensionModel.get('headerHeight'),
            toolbarHeight = this.view.toolbar.$el.height(),
            height = toolbarHeight + headerHeight + bodyHeight;
        this.$el.css('height', height + 'px');
        this.dimensionModel.set({
            toolbarHeight: toolbarHeight
        });
    },
    /**
     * rowKey 와 columnName 에 해당하는 값을 반환한다.
     *
     * @param {(Number|String)} rowKey    행 데이터의 고유 키
     * @param {String} columnName   컬럼 이름
     * @param {boolean} [isOriginal]  원본 데이터 리턴 여부
     * @return {(Number|String)}    조회한 셀의 값.
     */
    getValue: function(rowKey, columnName, isOriginal) {
        var value;
        if (isOriginal) {
            value = this.dataModel.getOriginal(rowKey, columnName);
        } else {
            value = this.dataModel.get(rowKey).get(columnName);
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
        var $frame = this.columnModel.isLside(columnName) ? this.view.lside.$el : this.view.rside.$el;
        rowKey = this.dataModel.getMainRowKey(rowKey, columnName);
        return $frame.find('tr[key="' + rowKey + '"]').find('td[columnname="' + columnName + '"]');
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
        this.focusModel.unselect();
    },
    /**
     * 그리드 내에서 현재 선택된 row의 키값을 리턴한다.
     * @return {(Number|String)} 행 데이터의 고유 키
     */
    getSelectedRowKey: function() {
        return this.focusModel.which().rowKey;
    },
    /**
     *
     * @param {(Number|String)} rowKey    행 데이터의 고유 키
     * @param {String} columnName   컬럼 이름
     * @param {(Number|String)} columnValue 할당될 값
     * @param {Boolean} [silent=false] 이벤트 발생 여부. true 로 변경할 상황은 거의 없다.
     */
    setValue: function(rowKey, columnName, columnValue, silent) {
        columnValue = _.isString(columnValue) ? $.trim(columnValue) : columnValue;
        var row = this.dataModel.get(rowKey),
            obj = {};
        if (row) {
            obj[columnName] = columnValue;
            row.set(obj, {
                silent: silent
            });
            return true;
        } else {
            return false;
        }
    },
    /**
     * columnName 에 해당하는 값을 전부 변경한다.
     * @param {String} columnName 컬럼명
     * @param {(Number|String)} columnValue 변경할 컬럼 값
     * @param {Boolean} [isCheckCellState=true] 셀의 편집 가능 여부 와 disabled 상태를 체크할지 여부
     * @param {Boolean} [silent=false] change 이벤트 trigger 할지 여부.
     */
    setColumnValues: function(columnName, columnValue, isCheckCellState, silent) {
        isCheckCellState = isCheckCellState === undefined ? true : isCheckCellState;
        var obj = {},
            cellState = {
                isDisabled: false,
                isEditable: true
            };
        obj[columnName] = columnValue;

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
        var callback = ne.util.bind(function() {
            this.dataModel.set(rowList, {
                parse: isParse
            });
        }, this);
        this.showGridLayer('loading');
        isParse = isParse === undefined ? true : isParse;
        //데이터 파싱에 시간이 많이 걸릴 수 있으므로, loading layer 를 먼저 보여주기 위해 timeout 을 사용한다.
        if (rowList && rowList.length > 500) {
            clearTimeout(this.timeoutIdForSetRowList);
            this.timeoutIdForSetRowList = setTimeout($.proxy(function() {
                callback();
            }, this), 0);
        } else {
            callback();
        }
    },
    /**
     * rowList 를 설정하고, setOriginalRowList 를 호출하여 원본데이터를 갱신한다.
     * @param {Array} rowList 설정할 데이터 배열 값
     * @param {boolean} [isParse=true]  backbone 의 parse 로직을 수행할지 여부
     */
    setRowList: function(rowList, isParse) {
        var callback = ne.util.bind(function() {
            this.dataModel.reset(rowList, {
                parse: isParse
            });
            this.dataModel.setOriginalRowList();
        }, this);
        this.showGridLayer('loading');
        isParse = isParse === undefined ? true : isParse;
        //데이터 파싱에 시간이 많이 걸릴 수 있으므로, loading layer 를 먼저 보여주기 위해 timeout 을 사용한다.
        if (rowList && rowList.length > 500) {
            clearTimeout(this.timeoutIdForSetRowList);
            this.timeoutIdForSetRowList = setTimeout($.proxy(function() {
                callback();
            }, this), 0);
        } else {
            callback();
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
        var cellInstance;
        this.focus(rowKey, columnName, isScrollable);
        rowKey = this.dataModel.getMainRowKey(rowKey, columnName);
        if (this.isEditable(rowKey, columnName)) {
            cellInstance = this.cellFactory.getInstance(this.columnModel.getEditType(columnName));
            cellInstance.focusIn(this.getElement(rowKey, columnName));
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
            '_button' : true
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
        return this.columnModel.get('columnModelList');
    },
    /**
     * 그리드 내에서 변경된 데이터들의 목록을 구성하여 리턴한다.
     * 리턴되는 객체에는 createList, updateList, deleteList 라는 필드가 있고,
     * 각 필드에는 변경된 데이터들이 배열로 구성되어 있다.
     * @param {Object} [options]
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
     * @param {Number} columnFixIndex 고정시킬 열의 인덱스
     */
    setColumnFixIndex: function(columnFixIndex) {
        this.option({
            columnFixIndex: columnFixIndex
        });
        this.columnModel.set({columnFixIndex: columnFixIndex});
    },
    /**
     * 현재 그리드에 설정된 데이터의 변경 여부를 Boolean으로 리턴한다.
     * - getModifiedRowList() 함수의 결과값을 이용하여 입력/수정/삭제가 되었으면 true를 리턴하고 그렇지 않은 경우에는 false를 리턴한다.
     * @return {Boolean}    데이터가 변경되었는지 여부
     */
    isChanged: function() {
        var modifiedRowMap = this.getModifiedRowList(),
            result = false;

        ne.util.forEach(modifiedRowMap, function(data) {
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
        this.replaceRowList(originalRowList, false);
    },
    /**
     * Grid Layer 를 모두 감춘다.
     */
    hideGridLayer: function() {
        _.each(this.view.layer, function(view) {
            view.hide();
        }, this);
    },
    /**
     * name 에 해당하는 Grid Layer를 보여준다.
     * @param {String} name ready|empty|loading 중 하나를 설정한다.
     */
    showGridLayer: function(name) {
        this.hideGridLayer();
        this.view.layer[name] ? this.view.layer[name].show() : null;
    },

    /**
     * pagination instance 를 반환한다.
     * @return {instance} pagination 인스턴스
     */
    getPaginationInstance: function() {
        var paginationView = this.view.toolbar.pagination;
        if (paginationView) {
            return paginationView.instance;
        }
    },
    /**
     * addon 을 활성화한다.
     * @param {string} name addon 이름
     * @param {object} options addon 에 넘길 파라미터
     * @return {Core}
     */
    use: function(name, options) {
        options = $.extend({grid: this}, options);
        if (AddOn[name]) {
            this.addOn[name] = new AddOn[name](options);
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
        rowKey = this.dataModel.getMainRowKey(rowKey, columnName);

        var editType = this.columnModel.getEditType(columnName),
            isDisabledCheck = this.dataModel.get(rowKey).getRowState().isDisabledCheck,
            deletableEditTypeList = ['text', 'text-convertible', 'text-password'],
            isDeletable = $.inArray(editType, deletableEditTypeList) !== -1,
            selectType = this.option('selectType'),
            cellState = this.getCellState(rowKey, columnName),
            isRemovable = !!(isDeletable && cellState.isEditable && !cellState.isDisabled);

        if (isRemovable) {
            this.setValue(rowKey, columnName, '', silent);
            //silent 의 경우 데이터 모델의 change 이벤트가 발생하지 않기 때문에, 강제로 checkbox 를 세팅한다.
            if (silent && selectType === 'checkbox' && !isDisabledCheck) {
                this.setValue(rowKey, '_button', true, silent);
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
            start = this._getStartIndexToPaste(),
            end = this._getEndIndexToPaste(start, data, columnModelList),
            rowIdx,
            columnIdx,
            value;

        for (rowIdx = start.rowIdx; rowIdx <= end.rowIdx; rowIdx += 1) {
            for (columnIdx = start.columnIdx; columnIdx <= end.columnIdx; columnIdx += 1) {
                value = data[rowIdx - start.rowIdx][columnIdx - start.columnIdx];
                this._setValueForPaste(rowIdx, columnIdx, columnModelList[columnIdx], value);
            }
        }

        this.selection.startSelection(start.rowIdx, start.columnIdx);
        this.selection.updateSelection(end.rowIdx, end.columnIdx);
    },
    /**
     * 붙여넣기를 실행할때 시작점이 될 셀의 인덱스를 반환한다.
     * @return {{rowIdx: number, columnIdx: number}} 행과 열의 인덱스 정보를 가진 객체
     */
    _getStartIndexToPaste: function() {
        var startIdx;

        if (this.selection.hasSelection()) {
            startIdx = this.selection.getStartIndex();
        } else {
            startIdx = this.focusModel.indexOf();
        }
        return startIdx;
    },
    /**
     * 붙여넣기를 실행할 때 끝점이 될 셀의 인덱스를 반환한다.
     * @param  {{rowIdx: number, columnIdx: number}} startIdx - 시작점이 될 셀의 인덱스
     * @param  {Array[]} data - 붙여넣기할 데이터
     * @param  {Array} columnModelList - 현재 화면에 보여지는 컬럼모델의 목록
     * @return {{rowIdx: number, columnIdx: number}} 행과 열의 인덱스 정보를 가진 객체
     */
    _getEndIndexToPaste: function(startIdx, data, columnModelList) {
        var endIdx = {
            rowIdx: Math.min(data.length + startIdx.rowIdx, this.dataModel.length) - 1,
            columnIdx: Math.min(data[0].length + startIdx.columnIdx, columnModelList.length) - 1
        }
        return endIdx;
    },
    /**
     * 지정된 인덱스의 셀이 수정 가능한 상태이면 값을 변경한다. RowSpan이 적용된 셀인 경우 MainRow인 경우에만 값을 변경한다.
     * @param  {number} rowIdx - 행 인덱스
     * @param  {number} columnIdx - 열 인덱스
     * @param  {string} value - 변경할 값
     * @param  {ColumnModel} columnModel - 해당 열 인덱스의 컬럼모델
     */
    _setValueForPaste: function(rowIdx, columnIdx, columnModel, value) {
        var row = this.dataModel.at(rowIdx),
            columnName = columnModel.columnName,
            cellStatus = row.getCellState(columnName),
            rowSpanData = row.getRowSpanData(columnName),
            attributes = {};

        if (cellStatus.isEditable && !cellStatus.isDisabled && (!rowSpanData || rowSpanData.count >= 0)) {
            attributes[columnName] = value;
            row.set(attributes);
        }
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
        this.dataModel.get(rowKey).addRowClassName(className);
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
        this.dataModel.get(rowKey).removeRowClassName(className);
    },
    /**
     * rowKey 와 columnName 에 해당하는 Cell 의 rowSpanData 를 반환한다.
     * @param {(Number|String)} rowKey 행 데이터의 고유 rowKey
     * @param {String} columnName 컬럼 이름
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
     * 데이터 필터링 기능 함수. 전체 그리드 데이터의 columnName에 해당하는 데이터와 columnValue를 비교하여 필터링 한 결과를 그리드에 출력한다
     * @todo 기능 구현
     * @param {String} columnName 컬럼 이름
     * @param {(String|Number)} columnValue 컬럼 이름
     */
    filterData: function(columnName, columnValue) {
    },
    /**
     * 그리드를 편집할 수 있도록 막았던 포커스를 풀고 딤드를 제거한다.
     * @todo 기능 구현
     */
    enable: function() {
    },
    /**
     * 그리드를 편집할 수 없도록 입력 엘리먼트들의 포커스를 막고, 옵션에 따라 딤드 처리한다.
     * @todo 기능 구현
     * @param {Boolean} [hasDimmedLayer=true]
     */
    disable: function(hasDimmedLayer) {
    },
    /**
     * 그리드의 layout 데이터를 갱신한다.
     * 그리드가 숨겨진 상태에서 초기화 되었을 경우 사옹한다.
     * @param {Boolean} [hasDimmedLayer=true]
     */
    refreshLayout: function() {
        this.dimensionModel.set('width', this.$el.width());
    },
    /**
     * 그리드의 크기 정보를 변경한다.
     * @todo 기능 구현
     * @param {object} size
     */
    setGridSize: function(size) {
        // var dimensionModel = this.dimensionModel,
        //     headerHeight = dimensionModel.get('headerHeight'),
        //     toolbarHeight = dimensionModel.get('toolbarHeight');
        //
        // dimensionModel.set('bodyHeight', height - headerHeight - toolbarHeight);
    },
    /**
     * 스크롤 핸들러의 위치를 변경한다.
     * @todo 기능 구현
     * @param {object} size
     */
    setScrollHandlerPosition: function() {},

    /**
     * 소멸자
     */
    destroy: function() {
        this.stopListening();
        this.destroyChildren();
        _.each(this, function(value, property) {
            if (property !== 'publicInstance') {
                if (value instanceof View.Base) {
                    if (value && ne.util.isFunction(value.destroy)) {
                        value.destroy();
                    }
                }
                if (property === 'view') {
                    _.each(value, function(instance, name) {
                        if (instance && ne.util.isFunction(instance.destroy)) {
                            instance.destroy();
                        }
                    }, this);
                }
            }

            if (value && ne.util.isFunction(value._destroy)) {
                value._destroy();
            }

            if (value && ne.util.isFunction(value.stopListening)) {
                value.stopListening();
            }

            if (property !== '$el' && property !== '__$el') {
                this[property] = null;
            }
        }, this);
        this.$el.replaceWith(this.__$el);
        this.$el = this.__$el = null;
    }
});

Core.prototype.__instance = Core.prototype.__instance || {};
