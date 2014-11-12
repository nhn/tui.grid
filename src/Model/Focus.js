    /**
     * Focus model
     * RowList collection 이 focus class 를 listen 한다.
     * @class
     */
    Model.Focus = Model.Base.extend({
        defaults: {
            rowKey: null,
            columnName: '',
            prevRowKey: null,
            prevColumnName: ''
        },
        initialize: function(attributes, options) {
            Model.Base.prototype.initialize.apply(this, arguments);
        },
        _savePrevious: function() {
            if (this.get('rowKey') !== null) {
                this.set('prevRowKey', this.get('rowKey'));
            }
            if (this.get('columnName')) {
                this.set('prevColumnName', this.get('columnName'));
            }
        },
        _clearPrevious: function() {
            this.set({
                prevRowKey: null,
                prevColumnName: ''
            });
        },
        /**
         * 행을 select 한다.
         * @param {Number|String} rowKey
         * @return {Model.Focus}
         */
        select: function(rowKey) {
            this.unselect().set('rowKey', rowKey);
            this.trigger('select', rowKey);
            return this;
        },
        /**
         * 행을 unselect 한다.
         * @return {Model.Focus}
         */
        unselect: function() {
            this.blur();
            this.trigger('unselect', this.get('rowKey'));
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
            this._savePrevious();
            this.blur();
            if (rowKey !== this.get('rowKey')) {
                this.select(rowKey);
            }
            if (columnName && columnName !== this.get('columnName')) {
                this.set('columnName', columnName);
            }
            this.trigger('focus', rowKey, columnName);
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
                lsideWidth = dimensionModel.get('lsideWidth'),
                rsideWidth = dimensionModel.get('rsideWidth'),

                position = dimensionModel.getCellPosition(focused.rowKey, focused.columnName),
                currentLeft = scrollLeft,
                currentRight = scrollLeft + rsideWidth;


            //수직 스크롤 조정
            if (position.top < scrollTop) {
                renderModel.set({
                    scrollTop: position.top
                });
            } else if (position.bottom > bodyHeight + scrollTop - (this.grid.option('scrollX') * this.grid.scrollBarSize)) {
                renderModel.set({
                    scrollTop: position.bottom - bodyHeight + (this.grid.option('scrollX') * this.grid.scrollBarSize)
                });
            }

            //수평 스크롤 조정
            if (!this.grid.columnModel.isLside(focused.columnName)) {
                if (position.left < currentLeft) {
                    renderModel.set({
                        scrollLeft: position.left
                    });
                } else if (position.right > currentRight) {
                    renderModel.set({
                        scrollLeft: position.right - rsideWidth + (this.grid.option('scrollY') * this.grid.scrollBarSize) + 1
                    });
                }
            }
        },
        /**
         * blur 처리한다.
         * @return {Model.Focus}
         */
        blur: function() {
            this.trigger('blur', this.get('rowKey'), this.get('columnName'));
            if (this.get('rowKey') !== null) {
                this.set('columnName', '');
            }
            return this;
        },
        /**
         * 현재 focus 정보를 반환한다.
         */
        which: function() {
            return {
                rowKey: this.get('rowKey'),
                columnName: this.get('columnName')
            };
        },
        /**
         * 현재 focus 정보를 index 기준으로 반환한다.
         */
        indexOf: function(isPrevious) {
            var rowKey = isPrevious ? this.get('prevRowKey') : this.get('rowKey'),
                columnName = isPrevious ? this.get('prevColumnName') : this.get('columnName');

            return {
                rowIdx: this.grid.dataModel.indexOfRowKey(rowKey),
                columnIdx: this.grid.columnModel.indexOfColumnName(columnName)
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
        nextRowIndex: function(offset) {
            var rowKey = this.nextRowKey(offset);
            return this.grid.dataModel.indexOfRowKey(rowKey);
        },
        prevRowIndex: function(offset) {
            var rowKey = this.prevRowKey(offset);
            return this.grid.dataModel.indexOfRowKey(rowKey);
        },
        nextColumnIndex: function() {
            var columnName = this.nextColumnName();
            return this.grid.columnModel.indexOfColumnName(columnName);
        },
        prevColumnIndex: function() {
            var columnName = this.prevColumnName();
            return this.grid.columnModel.indexOfColumnName(columnName);
        },
        /**
         * keyEvent 발생 시 다음 rowKey 를 반환한다.
         * @return {Number|String}
         */
        nextRowKey: function(offset) {
            var focused = this.which(),
                rowKey = focused.rowKey,
                count, rowSpanData;

            offset = typeof offset === 'number' ? offset : 1;
            if (offset > 1) {
                rowKey = this.findRowKey(offset);
                rowSpanData = this._getRowSpanData(rowKey, focused.columnName);
                if (!rowSpanData.isMainRow) {
                    rowKey = this.findRowKey(rowSpanData.count + offset);
                }
            } else {
                rowSpanData = this._getRowSpanData(rowKey, focused.columnName);
                if (rowSpanData.isMainRow && rowSpanData.count > 0) {
                    rowKey = this.findRowKey(rowSpanData.count);
                } else if (!rowSpanData.isMainRow) {
                    count = rowSpanData.count;
                    rowSpanData = this._getRowSpanData(rowSpanData.mainRowKey, focused.columnName);
                    rowKey = this.findRowKey(rowSpanData.count + count);
                } else {
                    rowKey = this.findRowKey(1);
                }
            }
            return rowKey;
        },

        /**
         * keyEvent 발생 시 이전 rowKey 를 반환한다.
         * @return {Number|String}
         */
        prevRowKey: function(offset) {
            var focused = this.which(),
                rowKey = focused.rowKey,
                rowSpanData;
            offset = typeof offset === 'number' ? offset : 1;
            offset *= -1;

            if (offset < -1) {
                rowKey = this.findRowKey(offset);
                rowSpanData = this._getRowSpanData(rowKey, focused.columnName);
                if (!rowSpanData.isMainRow) {
                    rowKey = this.findRowKey(rowSpanData.count + offset);
                }
            } else {
                rowSpanData = this._getRowSpanData(rowKey, focused.columnName);
                if (!rowSpanData.isMainRow) {
                    rowKey = this.findRowKey(rowSpanData.count - 1);
                } else {
                    rowKey = this.findRowKey(-1);
                }
            }
            return rowKey;
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
        },
        firstRowKey: function() {
            return this.grid.dataModel.at(0).get('rowKey');
        },
        lastRowKey: function() {
            return this.grid.dataModel.at(this.grid.dataModel.length - 1).get('rowKey');
        },
        firstColumnName: function() {
            var columnModelList = this.grid.columnModel.getVisibleColumnModelList();
            return columnModelList[0]['columnName'];
        },
        lastColumnName: function() {
            var columnModelList = this.grid.columnModel.getVisibleColumnModelList(),
                lastIndex = columnModelList.length - 1;
            return columnModelList[lastIndex]['columnName'];
        }
    });
