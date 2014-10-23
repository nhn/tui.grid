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
        select: function(rowKey) {
            this.unselect().set('rowKey', rowKey);
            return this;
        },
        unselect: function() {
            this.set({
                'rowKey': null
            });
            return this;
        },
        focus: function(rowKey, columnName) {
            rowKey = rowKey === undefined ? this.get('rowKey') : rowKey;
            columnName = columnName === undefined ? this.get('columnName') : columnName;
            this.blur().select(rowKey);
            if (columnName) {
                this.set('columnName', columnName);
            }
            return this;
        },
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
        has: function() {
            return !(this.get('rowKey') && this.get('columnName'));
        },
        nextRowKey: function() {
            var index, row,
                dataModel = this.grid.dataModel;
            if (this.has()) {
                index = dataModel.indexOfRowKey(this.get('rowKey')) + 1;
                row = dataModel.at(index);
                return row && row.get('rowKey');
            }
        },
        prevRowKey: function() {
            var index, row,
                dataModel = this.grid.dataModel;
            if (this.has()) {
                index = dataModel.indexOfRowKey(this.get('rowKey')) - 1;
                row = dataModel.at(index);
                return row && row.get('rowKey');
            }
        },
        nextColumnName: function() {
            var index,
                columnModel = this.grid.columnModel,
                columnModelList = columnModel.getColumnModelList();
            if (this.has()) {
                index = columnModel.indexOfColumnName(this.get('columnName')) + 1;
                return columnModelList[index] && columnModelList[index]['columnName'];
            }
        },
        prevColumnName: function() {
            var index,
                columnModel = this.grid.columnModel,
                columnModelList = columnModel.getColumnModelList();
            if (this.has()) {
                index = columnModel.indexOfColumnName(this.get('columnName')) + 1;
                return columnModelList[index] && columnModelList[index]['columnName'];
            }
        }
    });
