    /**
     * 크기 관련 데이터 저장
     * @type {*|void}
     */
    Model.Dimension = Model.Base.extend({
        models: null,
        columnModel: null,
        defaults: {
            offsetLeft: 0,
            offsetTop: 0,

            width: 0,

            headerHeight: 0,
            bodyHeight: 0,
            toolbarHeight: 0,

            rowHeight: 0,

            rsideWidth: 0,
            lsideWidth: 0,
            columnWidthList: [],

            maxScrollLeft: 0
        },
        initialize: function(attributes) {
            Model.Base.prototype.initialize.apply(this, arguments);
            this.columnModel = this.grid.columnModel;
            this.listenTo(this.columnModel, 'change', this._onWidthChange);

            this.on('change:width', this._onWidthChange, this);
            this._setColumnWidth();
            this._setBodyHeight();
        },
        /**
         * 계산한 cell의 위치를 리턴한다.
         * @param {Number|String} rowKey
         * @param {String} columnName
         * @return {{top: *, left: number, right: *, bottom: *}}
         */
        getCellPosition: function(rowKey, columnName) {
            var top, left = 0, right, bottom, i = 0,
                dataModel = this.grid.dataModel,
                offsetLeft = this.get('offsetLeft'),
                offsetTop = this.get('offsetTop'),
                rowHeight = this.get('rowHeight'),
                rowSpanData = dataModel.get(rowKey).getRowSpanData(columnName),
                rowIdx, spanCount,
                columnWidthList = this.get('columnWidthList'),
                columnFixIndex = this.grid.columnModel.get('columnFixIndex'),
                columnIdx = this.grid.columnModel.indexOfColumnName(columnName);



            if (!rowSpanData.isMainRow) {
                rowKey = rowSpanData.mainRowKey;
                rowSpanData = dataModel.get(rowKey).getRowSpanData(columnName);
            }

            spanCount = rowSpanData.count || 1;

            rowIdx = dataModel.indexOfRowKey(rowKey);

            top = Util.getTBodyHeight(rowIdx, rowHeight);
            bottom = top + Util.getTBodyHeight(spanCount, rowHeight) - 1;

            if (columnFixIndex <= columnIdx) {
                i = columnFixIndex;
            }

            for (; i < columnIdx; i++) {
                left += columnWidthList[i] + 1;
            }

            right = columnWidthList[i] + 1;

            return {
                top: top,
                left: left,
                right: right,
                bottom: bottom
            };
        },
        /**
         * 현재 화면에 보이는 row 개수를 반환
         * @return {number}
         */
        getDisplayRowCount: function() {
            return Util.getDisplayRowCount(this.get('bodyHeight') - this.get('toolbarHeight'), this.get('rowHeight'));
        },
        /**
         * _onWidthChange
         *
         * width 값 변경시 각 column 별 너비를 계산하는 로직
         * @param {object} model
         * @private
         */
        _onWidthChange: function(model) {
            var curColumnWidthList = this.get('columnWidthList');
            this._setColumnWidth(this._calculateColumnWidthList(curColumnWidthList));
        },
        /**
         * scrollX 높이를 구한다.
         * @return {number}
         */
        getScrollXSize: function() {
            return !!this.grid.option('scrollX') * this.grid.scrollBarSize;
        },
        /**
         * body height 계산
         * @private
         */
        _setBodyHeight: function() {
            var height = Util.getTBodyHeight(this.grid.option('displayRowCount'), this.get('rowHeight'));
            //TODO scroll height 예외처리
            height += this.grid.scrollBarSize;
            this.set('bodyHeight', height);
        },
        /**
         * columnWidth 를 계산하여 저장한다.
         * @param {Array} columnWidthList
         * @private
         */
        _setColumnWidth: function(columnWidthList) {
            var rsideWidth, lsideWidth = 0,
                totalWidth = this.get('width'),
                columnFixIndex = this.columnModel.get('columnFixIndex');

            columnWidthList = columnWidthList || this._getOriginalWidthList();

            for (var i = 0, len = columnWidthList.length; i < len; i++) {
                if (i < columnFixIndex) {
                    lsideWidth += columnWidthList[i] + 1;
                }
            }
            lsideWidth += 1;
            rsideWidth = totalWidth - lsideWidth;
            this.set({
                rsideWidth: rsideWidth,
                lsideWidth: lsideWidth,
                columnWidthList: columnWidthList
            });
            this.trigger('columnWidthChanged');
        },
        /**
         * 실제 너비를 계산한다.
         * @param {String} whichSide
         * @return {Number}
         */
        getTotalWidth: function(whichSide) {
            var columnWidthList = this.getColumnWidthList(whichSide),
                i, len = columnWidthList.length,
                totalWidth = 0;
            for (i = 0; i < len; i++) {
                totalWidth += columnWidthList[i] + 1;
            }
            return totalWidth;
        },
        /**
         * columnResize 발생 시 index 에 해당하는 컬럼의 width 를 변경하여 반영한다.
         * @param {Number} index
         * @param {Number} width
         */
        setColumnWidth: function(index, width) {
            width = Math.max(width, this.grid.option('minimumColumnWidth'));
            var curColumnWidthList = this.get('columnWidthList'),
                calculatedColumnWidthList;

            curColumnWidthList[index] = width;
            calculatedColumnWidthList = this._calculateColumnWidthList(curColumnWidthList);
            this._setColumnWidth(calculatedColumnWidthList);
        },
        /**
         * L side 와 R side 에 따른 columnWidthList 를 반환한다.
         * @param {String} whichSide 생략했을 때 전체 columnList 반환
         * @return {Array}
         */
        getColumnWidthList: function(whichSide) {
            whichSide = (whichSide) ? whichSide.toUpperCase() : undefined;
            var columnFixIndex = this.columnModel.get('columnFixIndex');
            var columnList = [];

            switch (whichSide) {
                case 'L':
                    columnList = this.get('columnWidthList').slice(0, columnFixIndex);
                    break;
                case 'R':
                    columnList = this.get('columnWidthList').slice(columnFixIndex);
                    break;
                default :
                    columnList = this.get('columnWidthList');
                    break;
            }
            return columnList;
        },
        /**
         * columnModel 에 설정된 width 값을 기준으로 widthList 를 작성한다.
         *
         * @return {Array}
         * @private
         */
        _getOriginalWidthList: function() {
            var columnModelList = this.columnModel.get('visibleList'),
                columnWidthList = [];
            for (var i = 0, len = columnModelList.length; i < len; i++) {
                if (columnModelList[i].width) {
                    columnWidthList.push(columnModelList[i].width);
                }else {
                    columnWidthList.push(-1);
                }
            }

            return this._calculateColumnWidthList(columnWidthList);
        },

        /**
         * 인자로 columnWidthList 배열을 받아 현재 total width 에 맞게 계산한다.
         *
         * @param {Array} columnWidthList
         * @return {Array}
         * @private
         */
        _calculateColumnWidthList: function(columnWidthList) {
            var remainWidth, unassignedWidth, remainDividedWidth,
                newColumnWidthList = [],
                totalWidth = this.get('width'),
                width = 0,
                currentWidth = 0,
                unassignedCount = 0;

            for (var i = 0, len = columnWidthList.length; i < len; i++) {
                if (columnWidthList[i] > 0) {
                    width = Math.max(this.grid.option('minimumColumnWidth'), columnWidthList[i]);
                    newColumnWidthList.push(width);
                    currentWidth += width;
                }else {
                    newColumnWidthList.push(-1);
                    unassignedCount++;
                }
            }

            remainWidth = totalWidth - currentWidth;


            if (totalWidth > currentWidth && unassignedCount === 0) {
                newColumnWidthList[newColumnWidthList.length - 1] += remainWidth;
            }

            if (totalWidth > currentWidth) {
                remainWidth = totalWidth - currentWidth;
                unassignedWidth = Math.max(this.grid.option('minimumColumnWidth'), Math.floor(remainWidth / unassignedCount));
            }else {
                unassignedWidth = this.grid.option('minimumColumnWidth');
            }

            for (var i = 0, len = newColumnWidthList.length; i < len; i++) {
                if (newColumnWidthList[i] === -1) {
                    newColumnWidthList[i] = unassignedWidth;
                }
            }

            return newColumnWidthList;
        }
    });
