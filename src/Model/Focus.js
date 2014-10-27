    /**
     * Focus model
     * RowList collection 이 focus class 를 listen 한다.
     * @class
     */
    Model.Focus = Model.Base.extend({
        defaults: {
            rowKey: null,
            columnName: ''
        },
        initialize: function(attributes, options) {
            Model.Base.prototype.initialize.apply(this, arguments);
        },
        /**
         * 행을 select 한다.
         * @param {Number|String} rowKey
         * @return {Model.Focus}
         */
        select: function(rowKey) {
            this.unselect().set('rowKey', rowKey);
            return this;
        },
        /**
         * 행을 unselect 한다.
         * @return {Model.Focus}
         */
        unselect: function() {
            this.set({
                'rowKey': null
            });
            return this;
        },
        /**
         * focus 처리한다.
         * @param {Number|String} rowKey
         * @param {String} columnName
         * @param {Boolean} isScrollable
         * @return {Model.Focus}
         */
        focus: function(rowKey, columnName, isScrollable) {
            rowKey = rowKey === undefined ? this.get('rowKey') : rowKey;
            columnName = columnName === undefined ? this.get('columnName') : columnName;
            if (rowKey !== this.get('rowKey')) {
                this.blur().select(rowKey);
            }
            if (columnName && columnName !== this.get('columnName')) {
                this.set('columnName', columnName);
            }
            if (isScrollable) {
                //todo scrolltop 및 left 값 조정하는 로직 필요.
                this._adjustScroll();
            }

            return this;
        },
        _adjustScroll: function() {
            var focused = this.which(),
                dimensionModel = this.grid.dimensionModel,
                renderModel = this.grid.renderModel,
                scrollTop = renderModel.get('scrollTop'),
                scrollLeft = renderModel.get('scrollLeft'),
                bodyHeight = dimensionModel.get('bodyHeight'),
                position = dimensionModel.getCellPosition(focused.rowKey, focused.columnName);


            if (position.top < scrollTop) {
                renderModel.set({
                    scrollTop: position.top
                });
            } else if (position.bottom > bodyHeight + scrollTop - (this.grid.option('scrollX') * this.grid.scrollBarSize)) {

                renderModel.set({
                    scrollTop: position.bottom - bodyHeight + (this.grid.option('scrollX') * this.grid.scrollBarSize)
                });
            }

            //스크롤 right 도 필요함.
            if (!this.grid.columnModel.isLside(focused.columnName)) {

            }

//            console.log(renderModel.get('scrollTop'), renderModel.get('scrollLeft'))

        },
        /**
         * blur 처리한다.
         * @return {Model.Focus}
         */
        blur: function() {
            if (this.get('rowKey') !== null) {
                this.set('columnName', '');
            }
            return this;
        },
        /**
         * 현재 focus 된 element 를 반환한다.
         */
        which: function() {
            return {
                rowKey: this.get('rowKey'),
                columnName: this.get('columnName')
            };
        },
        /**
         * 현재 focus를 가지고 있는지 여부를 리턴한다.
         * @return {boolean}
         */
        has: function() {
            return !!(this.get('rowKey') !== undefined && this.get('columnName'));
        },
        /**
         * 현재 focus 된 row 기준으로 offset 만큼 이동한 rowKey 를 반환한다.
         * @param {Number} offset
         * @return {Number|String} rowKey
         */
        findRowKey: function(offset) {
            var index, row,
                dataModel = this.grid.dataModel;
            if (this.has()) {
                index = Math.max(Math.min(dataModel.indexOfRowKey(this.get('rowKey')) + offset, this.grid.dataModel.length - 1), 0);
                row = dataModel.at(index);
                return row && row.get('rowKey');
            }
        },
        /**
         * 현재 focus 된 column 기준으로 offset 만큼 이동한 columnName 을 반환한다.
         * @param {Number} offset
         * @return {String} columnName
         */
        findColumnName: function(offset) {
            var index,
                columnModel = this.grid.columnModel,
                columnModelList = columnModel.getVisibleColumnModelList();
            if (this.has()) {
                index = Math.max(Math.min(columnModel.indexOfColumnName(this.get('columnName')) + offset, columnModelList.length - 1), 0);
                return columnModelList[index] && columnModelList[index]['columnName'];
            }
        },
        /**
         * rowSpanData 를 반환한다.
         * @param {Number|String} rowKey
         * @param {String} columnName
         * @return {*|{count: number, isMainRow: boolean, mainRowKey: *}|*}
         * @private
         */
        _getRowSpanData: function(rowKey, columnName) {
            return this.grid.dataModel.get(rowKey).getRowSpanData(columnName);
        },
        /**
         * keyEvent 발생 시 다음 rowKey 를 반환한다.
         * @return {Number|String}
         */
        nextRowKey: function() {
            var focused = this.which(),
                count,
                rowSpanData = this._getRowSpanData(focused.rowKey, focused.columnName);

            if (rowSpanData.isMainRow && rowSpanData.count > 0) {
                return this.findRowKey(rowSpanData.count);
            } else if (!rowSpanData.isMainRow) {
                count = rowSpanData.count;
                rowSpanData = this._getRowSpanData(rowSpanData.mainRowKey, focused.columnName);
                return this.findRowKey(rowSpanData.count + count);
            } else {
                return this.findRowKey(1);
            }
        },
        /**
         * keyEvent 발생 시 이전 rowKey 를 반환한다.
         * @return {Number|String}
         */
        prevRowKey: function() {
            var focused = this.which(),
                rowSpanData = this._getRowSpanData(focused.rowKey, focused.columnName);

            if (!rowSpanData.isMainRow) {
                return this.findRowKey(rowSpanData.count - 1);
            } else {
                return this.findRowKey(-1);
            }
        },
        /**
         * keyEvent 발생 시 다음 columnName 을 반환한다.
         * @return {String}
         */
        nextColumnName: function() {
            return this.findColumnName(1);
        },
        /**
         * keyEvent 발생 시 다음 columnName 을 반환한다.
         * @return {String}
         */
        prevColumnName: function() {
            return this.findColumnName(-1);
        }
    });
