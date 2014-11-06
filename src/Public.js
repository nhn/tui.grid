
    var ne = window.ne = ne || {};
    ne.Grid = View.Base.extend({
        initialize: function(options) {
            this.grid = new Grid(options);
            this.listenTo(this.grid, 'all', this._relayEvent, this);
        },
        /**
         * Grid 에서 발생하는 event 를 relay 한다.
         * @private
         */
        _relayEvent: function() {
            this.trigger.apply(this, arguments);
        },
        /**
         * rowKey 와 columnName 에 해당하는 값을 반환한다.
         *
         * @param {(Number|String)} rowKey    행 데이터의 고유 키
         * @param {String} columnName   컬럼 이름
         * @return {(Number|String)}
         */
        getValue: function(rowKey, columnName) {
            return this.grid.getValue(rowKey, columnName);
        },
        /**
         * columnName에 해당하는 column data list를 리턴한다.
         *
         * @param {String} columnName   컬럼 이름
         * @param {boolean} [isJsonString=false]  true 일 경우 JSON String 으로 반환한다.
         * @return {Array}
         */
        getColumnValue: function(columnName, isJsonString) {
            return this.grid.getColumnValue(columnName, isJsonString);
        },
        /**
         * rowKey에 해당하는 행의 데이터를 리턴한다. isJsonString을 true로 설정하면 결과를 json객체로 변환하여 리턴한다.
         * @param {(Number|String)} rowKey
         * @param {Boolean} isJsonString
         * @return {Object}
         */
        getRow: function(rowKey, isJsonString) {
            return this.grid.getRow(rowKey, isJsonString);
        },
        /**
         * 그리드 전체 데이터 중에서 index에 해당하는 순서의 데이터 객체를 리턴한다.
         * @param {Number} index
         * @return {Object}
         */
        getRowAt: function(index) {
            return this.grid.getRowAt(index);
        },
        /**
         * 현재 그리드에 설정된 전체 데이터의 개수를 리턴한다.
         * @return {Number}
         */
        getRowCount: function() {
            return this.grid.getRowCount();
        },
        getRowSpan: function() {
            //@todo:
        },
        /**
         * 그리드 내에서 현재 선택된 row의 키값을 리턴한다.
         * @return {(Number|String)}
         */
        getSelectedRowKey: function() {
            return this.grid.focusModel.which().rowKey;
        },
        /**
         * rowKey 와 columnName 에 해당하는 element 를 반환한다.
         * @param {(Number|String)} rowKey    행 데이터의 고유 키
         * @param {String} columnName   컬럼 이름
         * @return {jQuery} 해당 jQuery Element
         */
        getElement: function(rowKey, columnName) {
            return this.grid.getElement(rowKey, columnName);
        },
        /**
         *
         * @param {(Number|String)} rowKey    행 데이터의 고유 키
         * @param {String} columnName   컬럼 이름
         * @param {(Number|String)} columnValue 할당될 값
         */
        setValue: function(rowKey, columnName, columnValue) {
            this.grid.setValue(rowKey, columnName, columnValue);
        },
        /**
         *
         * @param {String} columnName   컬럼 이름
         * @param {(Number|String)} columnValue 할당될 값
         * @param {Boolean} [isCheckCellState=true] 셀의 편집 가능 여부 와 disabled 상태를 체크할지 여부
         */
        setColumnValue: function(columnName, columnValue, isCheckCellState) {
            this.grid.setColumnValue(columnName, columnValue, isCheckCellState);
        },

        /**
         * rowList 를 설정한다.
         * @param {Array} rowList
         */
        setRowList: function(rowList) {
            this.grid.setRowList(rowList);
        },
        /**
         * rowKey, columnName에 해당하는 셀에 포커싱한다.
         * @param {(Number|String)} rowKey    행 데이터의 고유 키
         * @param {String} columnName   컬럼 이름
         * @param {boolean} [isScrollable=false] 그리드에서 해당 영역으로 scroll 할지 여부
         */
        focus: function(rowKey, columnName, isScrollable) {
            this.grid.focus(rowKey, columnName, isScrollable);
        },
        /**
         * 셀을 편집모드로 전환한다.
         * @param {(Number|String)} rowKey    행 데이터의 고유 키
         * @param {String} columnName   컬럼 이름
         * @param {boolean} [isScrollable=false] 그리드에서 해당 영역으로 scroll 할지 여부
         * @private
         */
        focusIn: function(rowKey, columnName, isScrollable) {
            this.grid.focusIn(rowKey, columnName, isScrollable);
        },

        /**
         * grid 를 blur 한다.
         */
        blur: function() {
            this.grid.blur();
        },
        /**
         * 전체 행을 선택한다.
         */
        checkAll: function() {
            this.grid.checkAll();
        },
        /**
         * rowKey에 해당하는 행의 체크박스 및 라디오박스를 선택한다.
         * @param {(Number|String)} rowKey    행 데이터의 고유 키
         */
        check: function(rowKey) {
            this.grid.check(rowKey);
        },
        /**
         * 모든 행을 선택 해제 한다.
         */
        uncheckAll: function() {
            this.grid.uncheckAll();
        },
        /**
         * rowKey 에 해당하는 행의 체크박스 및 라디오박스를 선택한다.
         * @param {(Number|String)} rowKey    행 데이터의 고유 키
         */
        uncheck: function(rowKey) {
            this.grid.uncheck(rowKey);
        },


        /**
         * @deprecated
         */
        checkRowState: function() {
            //@todo:
        },
        /**
         * 그리드의 모든 데이터를 삭제하고 norowlayer 클래스명을 가지는 엘리먼트를 보여준다.
         */
        clear: function() {
            this.grid.clear();
        },
        /**
         * rowKey에 해당하는 그리드 데이터를 삭제한다.
         * @param {(Number|String)} rowKey    행 데이터의 고유 키
         * @param {Boolean} [isRemoveOriginalDta=false] 원본 데이터도 함께 삭제 할지 여부
         */
        removeRow: function(rowKey, isRemoveOriginalDta) {
            this.grid.removeRow(rowKey, isRemoveOriginalDta);
        },
        /**
         * 그리드를 편집할 수 있도록 막았던 포커스를 풀고 딤드를 제거한다.
         */
        enable: function() {
            //@todo:
        },
        /**
         * 그리드를 편집할 수 없도록 입력 엘리먼트들의 포커스를 막고, 옵션에 따라 딤드 처리한다.
         * @param [hasDimmedLayer=true]
         */
        disable: function(hasDimmedLayer) {
            //@todo:
        },
        /**
         * rowKey에 해당하는 행을 활성화시킨다.
         * @param {(Number|String)} rowKey
         */
        enableRow: function(rowKey) {
            this.grid.enableRow(rowKey);
        },
        /**
         * rowKey에 해당하는 행을 비활성화 시킨다.
         * @param {(Number|String)} rowKey    행 데이터의 고유 키
         */
        disableRow: function(rowKey) {
            this.grid.disableRow(rowKey);
        },
        /**
         * rowKey에 해당하는 행의 메인 체크박스를 체크할 수 있도록 활성화 시킨다.
         * @param {(Number|String)} rowKey
         */
        enableCheck: function(rowKey) {
            this.grid.enableCheck(rowKey);
        },
        /**
         * rowKey에 해당하는 행의 메인 체크박스를 체크하지 못하도록 비활성화 시킨다.
         * @param {(Number|String)} rowKey
         */
        disableCheck: function(rowKey) {
            this.grid.disableCheck(rowKey);
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
         * 현재 선택된 행들의 키값만을 배열로 리턴한다.
         * @param {Boolean} [isJsonString=false]  true 일 경우 json 문자열을 리턴한다.
         * @return {Array|String}
         */
        getCheckedRowKeyList: function(isJsonString) {
            var checkedRowKeyList = this.grid.getCheckedRowKeyList();
            return isJsonString ? JSON.stringify(checkedRowKeyList) : checkedRowKeyList;
        },
        /**
         * 현재 선택된 행들의 모든 데이터를 배열로 리턴한다.
         * @param {Boolean} [isJsonString=false]  true 일 경우 json 문자열을 리턴한다.
         * @return {Array|String}
         */
        getCheckedRowList: function(isJsonString) {
            var checkedRowList = this.grid.getCheckedRowList();
            return isJsonString ? JSON.stringify(checkedRowList) : checkedRowList;
        },
        /**
         * 그리드에 설정된 컬럼모델 정보를 배열 형태로 리턴한다.
         * @return {Array}
         */
        getColumnModel: function() {
            return this.grid.columnModel.get('columnModelList');
        },
        /**
         * 현재 비활성화된 행들의 키값만을 배열로 리턴한다.
         * @return {Array}
         */
        getDisabledRowKeyList: function() {
            //@todo
        },
        /**
         * 그리드 내에서 변경된 데이터들의 목록을 구성하여 리턴한다.
         * 리턴되는 객체에는 inserted, edited, deleted 라는 필드가 있고,
         * 각 필드에는 변경된 데이터들이 배열로 구성되어 있다.
         *
         * @param {Boolean} [isOnlyRowKeyList]  true로 설정하면 키값만 저장하여 리턴
         * @param {Boolean} [isJsonString]  변경된 데이터 객체를 JSON문자열로 변환하여 리턴
         * @param {Boolean} [filteringColumnList]   행 데이터 중에서 데이터 변경으로 간주하지 않을 컬럼 이름을 배열로 설정한다.
         * @return {{createList: Array, updateList: Array, deleteList: Array}}
         */
        getModifiedRowList: function(isOnlyRowKeyList, isJsonString, filteringColumnList) {
            //@todo 파라미터 옵션에 따른 데이터 형 변화
            return this.grid.getModifiedRowList(isOnlyRowKeyList, isJsonString, filteringColumnList);
        },
        /**
         * 현재 그리드의 제일 끝에 행을 추가한다.
         * @param {object} rowData
         */
        appendRow: function(rowData) {
            this.grid.appendRow(rowData);
        },
        /**
         * 현재 그리드의 제일 앞에 행을 추가한다.
         * @param {object} rowData
         */
        prependRow: function(rowData) {
            this.grid.prependRow(rowData);
        },
        /**
         * 현재 그리드에 설정된 데이터의 변경 여부를 Boolean으로 리턴한다.
         * - getModifiedRowList() 함수의 결과값을 이용하여 입력/수정/삭제가 되었으면 true를 리턴하고 그렇지 않은 경우에는 false를 리턴한다.
         * @return {Boolean}
         */
        isChanged: function() {
            this.grid.isChanged();
        },
        /**
         * AddOn 인스턴스를 반환한다.
         * @param {String} name AddOn 이름
         * @return {instance}
         */
        getAddOn: function(name) {
            return name ? this.grid.addOn[name] : this.grid.addOn;
        },

        /**
         * setRowList()를 통해 그리드에 설정된 초기 데이터 상태로 복원한다.
         * 그리드에서 수정되었던 내용을 초기화하는 용도로 사용한다.
         */
        restore: function() {
            var originalRowList = this.grid.dataModel.getOriginalRowList();
            this.grid.setRowList(originalRowList, false);
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
         * rowKey에 해당하는 행에 대해 선택한다.
         * - checkRow()는 행에 포함된 체크박스나 라디오박스를 선택하며, selectRow()는 클릭된 행이 선택되어졌음을 시각적으로 나타내기 위해 해당 행의 배경색을 변경한다.
         *
         * @param {(Number|String)} rowKey
         */
        select: function(rowKey) {
            this.grid.select(rowKey);
        },
        unselect: function() {
            this.grid.unselect();
        },
        /**
         * 열 고정 위치를 변경한다.
         *
         * @param {Number} index 고정시킬 열의 인덱스
         */
        setColumnFixIndex: function(index) {
            this.grid.setColumnFixIndex(index);
        },

        setGridSize: function(size) {
            var dimensionModel = this.grid.dimensionModel,
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
        use: function(name, options) {
            this.grid.use(name, options);
            return this;
        }
    });

    ne.Grid.getInstanceById = function(id) {
        return Grid.prototype.__instance[id];
    };


