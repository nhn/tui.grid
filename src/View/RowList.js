/**
 * @fileoverview RowList View
 * @author NHN Ent. FE Development Team
 */
/**
 * RowList View.
 * Collection 의 변화를 감지한다.
 * @constructor View.RowList
 */
View.RowList = View.Base.extend(/**@lends View.RowList.prototype */{
    /**
     * 초기화 함수
     * @param {object} options 옵션 객체
     *      @param {string} [options.whichSide='R']   어느 영역에 속하는 rowList 인지 여부. 'L|R' 중 하나를 지정한다.
     */
    initialize: function(options) {
        var focusModel, whichSide;

        View.Base.prototype.initialize.apply(this, arguments);

        whichSide = (options && options.whichSide) || 'R';
        this.setOwnProperties({
            whichSide: whichSide,
            bodyView: options.bodyView,
            columnModelList: this.grid.columnModel.getVisibleColumnModelList(whichSide),
            timeoutIdForCollection: 0,
            timeoutIdForFocusClipboard: 0,
            sortOptions: null,
            renderedRowKeys: null,
            rowPainter: null
        });

        this._createRowPainter();
        this._delegateTableEventsFromBody();
        this._focusClipboardDebounced = _.debounce(this._focusClipboard, 10);

        focusModel = this.grid.focusModel;
        this.listenTo(this.collection, 'change', this._onModelChange)
            .listenTo(focusModel, 'select', this._onSelect, this)
            .listenTo(focusModel, 'unselect', this._onUnselect, this)
            .listenTo(focusModel, 'focus', this._onFocus, this)
            .listenTo(focusModel, 'blur', this._onBlur, this)
            .listenTo(this.grid.renderModel, 'rowListChanged', this.render, this)
            .listenTo(this.grid.dimensionModel, 'columnWidthChanged', _.debounce(this._onColumnWidthChanged, 200));
    },

    /**
     * Rendering 에 사용할 RowPainter Instance 를 생성한다.
     * @private
     */
    _createRowPainter: function() {
        this.rowPainter = new View.Painter.Row({
            grid: this.grid,
            columnModelList: this.columnModelList
        });
    },

    /**
     * 기존에 생성되어 있던 TR요소들 중 새로 렌더링할 데이터와 중복되지 않은 목록의 TR요소만 삭제한다.
     * @param {array} dupRowKeys 중복된 데이터의 rowKey 목록
     */
    _removeOldRows: function(dupRowKeys) {
        var firstIdx = _.indexOf(this.renderedRowKeys, dupRowKeys[0]);
            lastIdx = _.indexOf(this.renderedRowKeys, _.last(dupRowKeys)),
            $rows = this.$el.children('tr');

        $rows.slice(0, firstIdx).remove();
        $rows.slice(lastIdx + 1).remove();
    },

    /**
     * 기존의 렌더링된 데이터와 중복되지 않은 목록에 대해서만 TR요소를 추가한다.
     * @param {array} rowKeys 렌더링할 데이터의 rowKey 목록
     * @param {array} dupRowKeys 중복된 데이터의 rowKey 목록
     */
    _appendNewRows: function(rowKeys, dupRowKeys) {
        var beforeRows = this.collection.slice(0, _.indexOf(rowKeys, dupRowKeys[0])),
            afterRows = this.collection.slice(_.indexOf(rowKeys, _.last(dupRowKeys)) + 1);

        this.$el.prepend(this._getRowsHtml(beforeRows));
        this.$el.append(this._getRowsHtml(afterRows));
    },

    /**
     * 전체 행목록을 갱신한다.
     */
    _resetRows: function() {
        var html = this._getRowsHtml(this.collection.models),
            $tbody;

        if (View.RowList.isInnerHtmlOfTbodyReadOnly) {
            $tbody = this.bodyView.redrawTable(html);
            this.setElement($tbody, false); // table이 다시 생성되었기 때문에 tbody의 참조를 갱신해준다.
        } else {
            this.$el[0].innerHTML = html;
        }
    },

    /**
     * 행데이터 목록을 받아, HTML 문자열을 생성해서 반환한다.
     * @param rows {Model.Row[]} 행데이터 목록
     * @return {string} 생성된 HTML 문자열
     */
    _getRowsHtml: function(rows) {
        return _.map(rows, this.rowPainter.getHtml, this.rowPainter).join('');
    },

    /**
     * timeout을 사용해 일정 시간이 지난 후 포커스를 Clipboard로 옮긴다.
     * @param {number} delay 지연시킬 시간 (ms)
     */
    _focusClipboard: function(delay) {
        try {
            this.grid.focusClipboard();
        } catch (e) {
            // prevent Error from running test cases (caused by setTimeout in _.debounce())
        }
    },

    /**
     * dimensionModel의 columnWidthChanged 이벤트가 발생했을때 실행되는 핸들러 함수
     * (렌더링 속도를 고려해 debounce를 통해 실행)
     */
    _onColumnWidthChanged: function() {
        try {
            this._resetInputWidthInTextCells();
        } catch (e) {
            // prevent Error from running test cases (caused by setTimeout in _.debounce())
        }
    },
    /**
     * text, text-password 타입의 셀에 resize 이벤트를 발생시킨다.
     */
    _resetInputWidthInTextCells: function() {
        var $textCells = this.$el.find('td[edit-type=text], td[edit-type=text-password]');

        _.each($textCells, function(td) {
            var $td = $(td),
                cellPainter = this.grid.cellFactory.getInstance($td.attr('edit-type'));

            if (cellPainter) {
                cellPainter.resetInputWidth($td);
            }
        }, this);
    },

    /**
     * tr 엘리먼트를 찾아서 반환한다.
     * @param {(string|number)} rowKey rowKey 대상의 키값
     * @return {jquery} 조회한 tr jquery 엘리먼트
     * @private
     */
    _getRowElement: function(rowKey) {
        return this.$el.find('tr[key="' + rowKey + '"]');
    },

    /**
     * focusModel 의 select 이벤트 발생시 이벤트 핸들러
     * @param {(Number|String)} rowKey 대상의 키값
     * @private
     */
    _onSelect: function(rowKey) {
        this._setCssSelect(rowKey, true);
    },

    /**
     * focusModel 의 unselect 이벤트 발생시 이벤트 핸들러
     * @param {(Number|String)} rowKey 대상의 키값
     * @private
     */
    _onUnselect: function(rowKey) {
        this._setCssSelect(rowKey, false);
    },

    /**
     * 인자로 넘어온 rowKey 에 해당하는 행(각 TD)에 Select 디자인 클래스를 적용한다.
     * @param {(Number|String)} rowKey 대상의 키값
     * @param {Boolean} isSelected  css select 를 수행할지 unselect 를 수행할지 여부
     * @private
     */
    _setCssSelect: function(rowKey, isSelected) {
        var grid = this.grid,
            columnModelList = this.columnModelList,
            columnName,
            $trCache = {},
            $tr, $td,
            mainRowKey;

        _.each(columnModelList, function(columnModel) {
            columnName = columnModel['columnName'];
            mainRowKey = grid.dataModel.getMainRowKey(rowKey, columnName);

            $trCache[mainRowKey] = $trCache[mainRowKey] || this._getRowElement(mainRowKey);
            $tr = $trCache[mainRowKey];
            $td = $tr.find('td[columnname="' + columnName + '"]');
            if ($td.length) {
                isSelected ? $td.addClass('selected') : $td.removeClass('selected');
            }
        }, this);
    },

    /**
     * focusModel 의 blur 이벤트 발생시 해당 $td 를 찾고, focus 클래스를 제거한다.
     * @param {(Number|String)} rowKey 대상의 키값
     * @param {String} columnName 컬럼명
     * @private
     */
    _onBlur: function(rowKey, columnName) {
        var $td = this.grid.getElement(rowKey, columnName);
        if ($td.length) {
            $td.removeClass('focused');
        }
    },

    /**
     * focusModel 의 _onFocus 이벤트 발생시 해당 $td 를 찾고, focus 클래스를 추가한다.
     * @param {(Number|String)} rowKey 대상의 키값
     * @param {String} columnName 컬럼명
     * @private
     */
    _onFocus: function(rowKey, columnName) {
        var $td = this.grid.getElement(rowKey, columnName);
        if ($td.length) {
            $td.addClass('focused');
        }
    },

    /**
     * 랜더링한다.
     * @return {View.RowList} this 객체
     */
    render: function() {
        var rowKeys = this.collection.pluck('rowKey'),
            sortOptions = _.clone(this.grid.dataModel.sortOptions),
            dupRowKeys;

        // 정렬방식이 변경된 경우는 무조건 새로 그린다.
        if (!_.isEqual(sortOptions, this.sortOptions)) {
            this._resetRows();
        } else {
            dupRowKeys = _.intersection(rowKeys, this.renderedRowKeys);
            if (_.isEmpty(rowKeys) || _.isEmpty(dupRowKeys) ||
                // 중복된 데이터가 40% 이상인 경우에는 remove/append 하는 것보다 innerHTML을 사용하는 게 더 빠름
                (dupRowKeys.length / rowKeys.length > 0.4)) {
                this._resetRows();
            } else {
                this._removeOldRows(dupRowKeys);
                this._appendNewRows(rowKeys, dupRowKeys);
            }
        }

        this.renderedRowKeys = rowKeys;
        this.sortOptions = sortOptions;

        // this._resetInputWidthInTextCells();
        this._focusClipboardDebounced();
        this._showLayer();

        return this;
    },

    /**
     * 테이블 내부(TR,TD)에서 발생하는 이벤트를 View.Layout.Body에게 넘겨 해당 요소들에게 위임하도록 설정한다.
     * @private
     */
    _delegateTableEventsFromBody: function() {
        this.bodyView.attachDelegatedHandler('tr', this.rowPainter.getEventHandlerInfo());

        _.each(this.grid.cellFactory.instances, function(instance, editType) {
            var selector = 'td[edit-type=' + editType + ']',
                handlerInfo = instance.getEventHandlerInfo();

            this.bodyView.attachDelegatedHandler(selector, handlerInfo);
        }, this);
    },

    /**
     * modelChange 이벤트 발생시 실행되는 핸들러 함수.
     * @param {Model.Row} model Row 모델 객체
     * @private
     */
    _onModelChange: function(model) {
        var $tr =  this._getRowElement(model.get('rowKey'));
        this.rowPainter.onModelChange(model, $tr);
    },

    /**
     * 데이터가 있다면 Layer 를 노출하고, 없는 경우 데이터 없음 레이어를 노출한다.
     * @private
     */
    _showLayer: function() {
        if (this.grid.dataModel.length) {
            this.grid.hideGridLayer();
        } else {
            this.grid.showGridLayer('empty');
        }
    }
}, {
    /**
     * @static
     * tbody 요소의 innerHTML이 읽기전용인지 여부
     */
    isInnerHtmlOfTbodyReadOnly: (ne.util.browser.msie && ne.util.browser.version <= 9)
});
