    View.Renderer.Cell.Text = View.Base.Renderer.Cell.Interface.extend({
        cellType: 'text',
        shouldRenderList: ['isEditable', 'optionList'],
        initialize: function(attributes, options) {
            View.Base.Renderer.Cell.Interface.prototype.initialize.apply(this, arguments);
        },
        template: _.template('<input type="text" value="<%=value%>" name="<%=name%>" <%=disabled%>/>'),
        eventHandler: {
            'blur input' : 'onBlur'
        },
        edit: function($td) {
            $td.find('input').focus();
        },
        getContentHtml: function(cellData) {
            var value = this.grid.dataModel.get(cellData.rowKey).getTagFiltered(cellData.columnName);
            return this.template({
                value: value,
                disabled: cellData.isDisabled ? 'disabled' : '',
                name: Util.getUniqueKey()
            });
        },
        setElementAttribute: function(cellData, $target) {
            $target.find('input').prop('disabled', cellData.isDisabled);
        },
        onBlur: function(blurEvent) {
            var $target = $(blurEvent.target),
                rowKey = this._getRowKey($target),
                columnName = this._getColumnName($target);
            this.grid.setValue(rowKey, columnName, $target.val());
        }
    });
