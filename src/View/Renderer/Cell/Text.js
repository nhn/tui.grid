    View.Renderer.Cell.Text = View.Base.Renderer.Cell.Interface.extend({
        cellType: 'text',
        shouldRenderList: ['isEditable', 'optionList'],
        initialize: function(attributes, options) {
            View.Base.Renderer.Cell.Interface.prototype.initialize.apply(this, arguments);
        },
        template: _.template('<input type="text" value="<%=value%>" name="<%=name%>" />'),
        eventHandler: {
            'blur input' : 'onBlur'
        },
        getContentHtml: function(cellData) {
            var value = this.grid.dataModel.get(cellData.rowKey).getTagFiltered(cellData.columnName);
            return this.template({
                value: value,
                name: Util.getUniqueKey(),
                checked: (!!cellData.value) ? 'checked' : ''
            });
        },
        setElementAttribute: function(cellData, $target) {

        },
        onBlur: function(blurEvent) {
            var $target = $(blurEvent.target),
                rowKey = this._getRowKey($target),
                columnName = this._getColumnName($target);
            console.log($target.val());
            this.grid.setValue(rowKey, columnName, $target.val());
        }
    });
