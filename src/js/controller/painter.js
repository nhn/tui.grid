'use strict';

var PainterController = tui.util.defineClass({
    init: function(options) {
        this.focusModel = options.focusModel;
        this.dataModel = options.dataModel;
        this.columnModel = options.columnModel;
        this.selectionModel = options.selectionModel;
    },

    startEdit: function(address) {
        var result = this.focusModel.startEdit(address.rowKey, address.columnName);

        if (!result) {
            return false;
        }

        this.selectionModel.end();
        return true;
    },

    endEdit: function(address, shouldBlur, value) {
        var focusModel = this.focusModel;

        if (!focusModel.isEditingCell(address.rowKey, address.columnName)) {
            return false;
        }

        this.selectionModel.enable();

        if (!_.isUndefined(value)) {
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

        return true;
    },

    focusInNext: function(reverse) {
        var focusModel = this.focusModel,
            rowKey = focusModel.get('rowKey'),
            columnName = focusModel.get('columnName'),
            nextColumnName = reverse ? focusModel.prevColumnName() : focusModel.nextColumnName();

        if (columnName !== nextColumnName) {
            focusModel.focusIn(rowKey, nextColumnName, true);
        }
    },

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
});


module.exports = PainterController;
