/**
 * @fileoverview 기본 클래스 파일
 * @author soonyoung.park@nhnent@nhnent.com (Soonyoung Park)
 */
    ne = window.ne = ne || {};
    /**
     * Grid public API
     * @constructor ne.Grid
     */
    ne.Grid = View.Base.extend(/**@lends ne.Grid.prototype */{
        /**
         * 초기화 함수
         * @param {Object} options
         */
        initialize: function(options) {
            this.core = new Core(options);
            this.listenTo(this.core, 'all', this._relayEvent, this);
        },
        /**
         * Grid 에서 발생하는 event 를 외부로 relay 한다.
         * @private
         */
        _relayEvent: function() {
            this.trigger.apply(this, arguments);
        },
        /**
         * rowKey에 해당하는 행을 비활성화 시킨다.
         * @param {(Number|String)} rowKey    행 데이터의 고유 키
         */
        disableRow: function(rowKey) {
            this.core.disableRow(rowKey);
        },
        /**
         * rowKey에 해당하는 행을 활성화시킨다.
         * @param {(Number|String)} rowKey
         */
        enableRow: function(rowKey) {
            this.core.enableRow(rowKey);
        },
        /**
         * rowKey 와 columnName 에 해당하는 값을 반환한다.
         *
         * @param {(Number|String)} rowKey    행 데이터의 고유 키
         * @param {String} columnName   컬럼 이름
         * @param {boolean} [isOriginal]  원본 데이터 리턴 여부
         * @return {(Number|String)}
         */
        getValue: function(rowKey, columnName, isOriginal) {
            return this.core.getValue(rowKey, columnName, isOriginal);
        },
        /**
         * columnName에 해당하는 column data list를 리턴한다.
         *
         * @param {String} columnName   컬럼 이름
         * @param {boolean} [isJsonString=false]  true 일 경우 JSON String 으로 반환한다.
         * @return {Array}
         */
        getColumnValues: function(columnName, isJsonString) {
            return this.core.getColumnValues(columnName, isJsonString);
        },
        /**
         * rowKey에 해당하는 행의 데이터를 리턴한다. isJsonString을 true로 설정하면 결과를 json객체로 변환하여 리턴한다.
         * @param {(Number|String)} rowKey
         * @param {Boolean} isJsonString
         * @return {Object}
         */
        getRow: function(rowKey, isJsonString) {
            return this.core.getRow(rowKey, isJsonString);
        },
        /**
         * 그리드 전체 데이터 중에서 index에 해당하는 순서의 데이터 객체를 리턴한다.
         * @param {Number} index
         * @param {Boolean} [isJsonString=false]  true 일 경우 JSON String 으로 반환한다.
         * @return {Object}
         */
        getRowAt: function(index, isJsonString) {
            return this.core.getRowAt(index, isJsonString);
        },
        /**
         * 현재 그리드에 설정된 전체 데이터의 개수를 리턴한다.
         * @return {Number}
         */
        getRowCount: function() {
            return this.core.getRowCount();
        },

        /**
         * 그리드 내에서 현재 선택된 row의 키값을 리턴한다.
         * @return {(Number|String)}
         */
        getSelectedRowKey: function() {
            return this.core.focusModel.which().rowKey;
        },
        /**
         * rowKey 와 columnName 에 해당하는 element 를 반환한다.
         * @param {(Number|String)} rowKey    행 데이터의 고유 키
         * @param {String} columnName   컬럼 이름
         * @return {jQuery} 해당 jQuery Element
         */
        getElement: function(rowKey, columnName) {
            return this.core.getElement(rowKey, columnName);
        },
        /**
         *
         * @param {(Number|String)} rowKey    행 데이터의 고유 키
         * @param {String} columnName   컬럼 이름
         * @param {(Number|String)} columnValue 할당될 값
         */
        setValue: function(rowKey, columnName, columnValue) {
            this.core.setValue(rowKey, columnName, columnValue);
        },
        /**
         *
         * @param {String} columnName   컬럼 이름
         * @param {(Number|String)} columnValue 할당될 값
         * @param {Boolean} [isCheckCellState=true] 셀의 편집 가능 여부 와 disabled 상태를 체크할지 여부
         */
        setColumnValues: function(columnName, columnValue, isCheckCellState) {
            this.core.setColumnValues(columnName, columnValue, isCheckCellState);
        },

        /**
         * rowList 를 설정한다.
         * @param {Array} rowList
         */
        setRowList: function(rowList) {
            this.core.setRowList(rowList);
        },
        /**
         * rowKey, columnName에 해당하는 셀에 포커싱한다.
         * @param {(Number|String)} rowKey    행 데이터의 고유 키
         * @param {String} columnName   컬럼 이름
         * @param {boolean} [isScrollable=false] 그리드에서 해당 영역으로 scroll 할지 여부
         */
        focus: function(rowKey, columnName, isScrollable) {
            this.core.focus(rowKey, columnName, isScrollable);
        },
        /**
         * rowIndex, columnIndex 에 해당하는 컬럼에 포커싱한다.
         * @param {(Number|String)} rowIndex
         * @param {String} columnIndex
         * @param {Boolean} isScrollable
         */
        focusAt: function(rowIndex, columnIndex, isScrollable) {
            this.core.focusAt(rowIndex, columnIndex, isScrollable);
        },
        /**
         * 셀을 편집모드로 전환한다.
         * @param {(Number|String)} rowKey    행 데이터의 고유 키
         * @param {String} columnName   컬럼 이름
         * @param {boolean} [isScrollable=false] 그리드에서 해당 영역으로 scroll 할지 여부
         * @private
         */
        focusIn: function(rowKey, columnName, isScrollable) {
            this.core.focusIn(rowKey, columnName, isScrollable);
        },
        /**
         * rowIndex, columnIndex 에 해당하는 컬럼에 포커싱 후 편진모드로 전환 한다.
         * @param {(Number|String)} rowIndex
         * @param {String} columnIndex
         * @param {Boolean} isScrollable
         */
        focusInAt: function(rowIndex, columnIndex, isScrollable) {
            this.core.focusInAt(rowIndex, columnIndex, isScrollable);
        },
        /**
         * grid 를 blur 한다.
         */
        blur: function() {
            this.core.blur();
        },
        /**
         * 전체 행을 선택한다.
         */
        checkAll: function() {
            this.core.checkAll();
        },
        /**
         * rowKey에 해당하는 행의 체크박스 및 라디오박스를 선택한다.
         * @param {(Number|String)} rowKey    행 데이터의 고유 키
         */
        check: function(rowKey) {
            this.core.check(rowKey);
        },
        /**
         * 모든 행을 선택 해제 한다.
         */
        uncheckAll: function() {
            this.core.uncheckAll();
        },
        /**
         * rowKey 에 해당하는 행의 체크박스 및 라디오박스를 선택한다.
         * @param {(Number|String)} rowKey    행 데이터의 고유 키
         */
        uncheck: function(rowKey) {
            this.core.uncheck(rowKey);
        },

        /**
         * 그리드의 모든 데이터를 삭제하고 norowlayer 클래스명을 가지는 엘리먼트를 보여준다.
         */
        clear: function() {
            this.core.clear();
        },
        /**
         * rowKey에 해당하는 그리드 데이터를 삭제한다.
         * @param {(Number|String)} rowKey    행 데이터의 고유 키
         * @param {Boolean} [isRemoveOriginalDta=false] 원본 데이터도 함께 삭제 할지 여부
         */
        removeRow: function(rowKey, isRemoveOriginalDta) {
            this.core.removeRow(rowKey, isRemoveOriginalDta);
        },

        /**
         * rowKey에 해당하는 행의 메인 체크박스를 체크할 수 있도록 활성화 시킨다.
         * @param {(Number|String)} rowKey
         */
        enableCheck: function(rowKey) {
            this.core.enableCheck(rowKey);
        },
        /**
         * rowKey에 해당하는 행의 메인 체크박스를 체크하지 못하도록 비활성화 시킨다.
         * @param {(Number|String)} rowKey
         */
        disableCheck: function(rowKey) {
            this.core.disableCheck(rowKey);
        },
        /**
         * 현재 선택된 행들의 키값만을 배열로 리턴한다.
         * @param {Boolean} [isJsonString=false]  true 일 경우 json 문자열을 리턴한다.
         * @return {Array|String}
         */
        getCheckedRowKeyList: function(isJsonString) {
            var checkedRowKeyList = this.core.getCheckedRowKeyList();
            return isJsonString ? $.toJSON(checkedRowKeyList) : checkedRowKeyList;
        },
        /**
         * 현재 선택된 행들의 모든 데이터를 배열로 리턴한다.
         * @param {Boolean} [isJsonString=false]  true 일 경우 json 문자열을 리턴한다.
         * @return {Array|String}
         */
        getCheckedRowList: function(isJsonString) {
            var checkedRowList = this.core.getCheckedRowList();
            return isJsonString ? $.toJSON(checkedRowList) : checkedRowList;
        },
        /**
         * 그리드에 설정된 컬럼모델 정보를 배열 형태로 리턴한다.
         * @return {Array}
         */
        getColumnModelList: function() {
            return this.core.getColumnModelList();
        },

        /**
         * 그리드 내에서 변경된 데이터들의 목록을 구성하여 리턴한다.
         * 리턴되는 객체에는 createList, updateList, deleteList 라는 필드가 있고,
         * 각 필드에는 변경된 데이터들이 배열로 구성되어 있다.
         * @param {Object} options
         *      @param {boolean} [options.isOnlyChecked=false] true 로 설정된 경우 checked 된 데이터 대상으로 비교 후 반환한다.
         *      @param {boolean} [options.isRaw=false] true 로 설정된 경우 내부 연산용 데이터 제거 필터링을 거치지 않는다.
         *      @param {boolean} [options.isOnlyRowKeyList=false] true 로 설정된 경우 키값만 저장하여 리턴한다.
         *      @param {Array} [options.filteringColumnList]   행 데이터 중에서 데이터 변경으로 간주하지 않을 컬럼 이름을 배열로 설정한다.
         * @return {{createList: Array, updateList: Array, deleteList: Array}}
         */
        getModifiedRowList: function(options) {
            return this.core.getModifiedRowList(options);
        },
        /**
         * 현재 그리드의 제일 끝에 행을 추가한다.
         * @param {object} rowData
         */
        appendRow: function(rowData) {
            this.core.appendRow(rowData);
        },
        /**
         * 현재 그리드의 제일 앞에 행을 추가한다.
         * @param {object} rowData
         */
        prependRow: function(rowData) {
            this.core.prependRow(rowData);
        },
        /**
         * 현재 그리드에 설정된 데이터의 변경 여부를 Boolean으로 리턴한다.
         * - getModifiedRowList() 함수의 결과값을 이용하여 입력/수정/삭제가 되었으면 true를 리턴하고 그렇지 않은 경우에는 false를 리턴한다.
         * @return {Boolean}
         */
        isChanged: function() {
            return this.core.isChanged();
        },
        /**
         * AddOn 인스턴스를 반환한다.
         * @param {String} name AddOn 이름
         * @return {instance}
         */
        getAddOn: function(name) {
            return name ? this.core.addOn[name] : this.core.addOn;
        },

        /**
         * setRowList()를 통해 그리드에 설정된 초기 데이터 상태로 복원한다.
         * 그리드에서 수정되었던 내용을 초기화하는 용도로 사용한다.
         */
        restore: function() {
            this.core.restore();
        },

        /**
         * rowKey에 해당하는 행에 대해 선택한다.
         * - checkRow()는 행에 포함된 체크박스나 라디오박스를 선택하며, selectRow()는 클릭된 행이 선택되어졌음을 시각적으로 나타내기 위해 해당 행의 배경색을 변경한다.
         *
         * @param {(Number|String)} rowKey
         */
        select: function(rowKey) {
            this.core.select(rowKey);
        },
        /**
         * 선택되었던 행에 대한 선택을 해제한다.
         */
        unselect: function() {
            this.core.unselect();
        },
        /**
         * 열 고정 위치를 변경한다.
         *
         * @param {Number} index 고정시킬 열의 인덱스
         */
        setColumnFixIndex: function(index) {
            this.core.setColumnFixIndex(index);
        },
        /**
         * columnModelList 를 재설정한다..
         * @param {Array} columnModelList
         */
        setColumnModelList: function(columnModelList) {
            this.core.setColumnModelList(columnModelList);
        },
        /**
         * addon 을 활성화한다.
         * @param {string} name addon 이름
         * @param {object} options addon 에 넘길 파라미터
         * @return {Grid}
         */
        use: function(name, options) {
            this.core.use(name, options);
            return this;
        },
        /**
         * rowList 를 반환한다.
         * @return {Array}
         */
        getRowList: function() {
            return this.core.getRowList();
        },
        /**
         * 인자로 들어온 columnName 기준으로 정렬 한다.
         * @param {String} columnName 정렬할 컬럼이름
         */
        sort: function(columnName) {
            this.core.sort(columnName);
        },
        unSort: function() {
            this.core.sort('rowKey');
        },
        /**
         * 데이터 필터링 기능 함수. 전체 그리드 데이터의 columnName에 해당하는 데이터와 columnValue를 비교하여 필터링 한 결과를 그리드에 출력한다
         * @param {String} columnName
         * @param {(String|Number)} columnValue
         */
        filterData: function(columnName, columnValue) {
            //@todo:
        },
        /**
         * 그리드를 편집할 수 있도록 막았던 포커스를 풀고 딤드를 제거한다.
         */
        enable: function() {
            //@todo:
        },
        /**
         * 그리드를 편집할 수 없도록 입력 엘리먼트들의 포커스를 막고, 옵션에 따라 딤드 처리한다.
         * @param {Boolean} [hasDimmedLayer=true]
         */
        disable: function(hasDimmedLayer) {
            //@todo:
        },
        getRowSpan: function() {
            //@todo:
        },
        /**
         * 현재 비활성화된 행들의 키값만을 배열로 리턴한다.
         * @return {Array}
         */
        getDisabledRowKeyList: function() {
            //@todo
        },
        setGridSize: function(size) {
            var dimensionModel = this.core.dimensionModel,
                width = size && size.width || dimensionModel.get('width'),
                bodyHeight = dimensionModel.get('bodyHeight'),
                headerHeight = dimensionModel.get('headerHeight'),
                toolbarHeight = dimensionModel.get('toolbarHeight');

            if (size && size.height) {
                bodyHeight = height - (headerHeight + toolbarHeight);
            }
        },
        setHeaderColumnTitle: function() {

        },
        setScrollBarPosition: function() {

        },
        refreshLayout: function() {
            //todo
        },
        addClassNameToColumn: function() {

        },
        addClassNameToRow: function() {

        },
        removeClassNameFromColumn: function() {

        },
        removeClassNameFromRow: function() {

        },
        replaceRowList: function() {

        },
        /**
         * 소멸자.
         */
        destroy: function() {
            this.core.destroy();
            this.core = null;
        }
    });

    ne.Grid.getInstanceById = function(id) {
        return Core.prototype.__instance[id];
    };


