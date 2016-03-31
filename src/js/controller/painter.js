'use strict';

var PainterController = tui.util.defineClass({
    init: function(options) {
        this.focusModel = options.focusModel;
        this.dataModel = options.dataModel;
        this.columnModel = options.columnModel;
        this.selectionModel = options.selectionModel;
    },

    startEdit: function(rowKey, columnName) {
        this.selectionModel.end();
        this.focusModel.startEdit(rowKey, columnName);
    },

    endEdit: function(shouldBlur, value) {
        var focusModel = this.focusModel,
            address = focusModel.get('editingAddress');

        if (!address) {
            return;
        }

        console.log('endEdit', shouldBlur, value);
        this.selectionModel.enable();

        if (!_.isUndefined(value)) {
            console.log('setValue', value);
            this.dataModel.setValue(address.rowKey, address.columnName, value);
            this.dataModel.get(address.rowKey).validateCell(address.columnName);
        }
        focusModel.endEdit();

        if (shouldBlur) {
            focusModel.focusClipboard();
        } else {
            _.defer(function() {
                focusModel.refreshState();
            });
        }
    },

    focusInNext: function(oppositeDirection) {
        var focusModel = this.focusModel,
            rowKey = focusModel.get('rowKey'),
            columnName;

        if (oppositeDirection) {
            columnName = focusModel.prevColumnName();
        } else {
            columnName = focusModel.nextColumnName();
        }

        focusModel.focusIn(rowKey, columnName, true);
    },

    refreshFocusState: function() {
        this.focusModel.refreshState();
    },

    // setValue: function(rowKey, columnName, value) {
    //     this.dataModel.setValue(rowKey, columnName, value);
    // },

    // enableSelection: function() {
    //     this.selectionModel.enable();
    // },

    // endSelection: function() {
    //     this.selectionModel.end();
    // },

    executeCustomInputEventHandler: function(event, cellInfo) {
        var columnModel = this.columnModel.getColumnModel(cellInfo.columnName),
            eventType = event.type,
            eventHandler;

        if (eventType === 'focusin') {
            eventType = 'focus';
        } else if (eventType === 'focusout') {
            eventType = 'blur';
        }

        eventHandler = tui.util.pick(columnModel, 'editOption', 'inputEvents', eventType);

        if (_.isFunction(eventHandler)) {
            return eventHandler(event, cellInfo);
        }

        return null;
    },

    appendEmptyRowAndFocus: function() {
        this.dataModel.append({}, {
            focus: true
        });
    }

    /**
     * Validates the cell data identified by given rowKey and columnName.
     * @param {String} rowKey - Row key
     * @param {String} columnName - Column name
     */
    // validateCell: function(rowKey, columnName) {
    //     var row = this.dataModel.get(rowKey);
    //     row.validateCell(columnName);
    // }
});


module.exports = PainterController;
