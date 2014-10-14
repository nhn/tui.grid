    View.Cell.Normal = View.Cell.Interface.extend({
        initialize : function(attributes, options){
            View.Cell.Interface.prototype.initialize.apply(this, arguments);
        },
        getContentHtml : function(cellData, $target){
            return cellData.value;
        },
        setElementAttribute : function(cellData, $target){
        }
    });


    View.Cell.MainButton = View.Cell.Interface.extend({
        shouldRenderList : ['isEditable', 'optionList'],
        eventHandler : {
            "mousedown" : "_onMouseDown",
            "change input" : "_onChange"
        },
        initialize : function(attributes, options){
            View.Cell.Interface.prototype.initialize.apply(this, arguments);
        },
        template : _.template('<input type="<%=type%>" name="<%=name%>" <%=checked%>/>'),
        getContentHtml : function(cellData){
            return this.template({
                type : this.grid.option('selectType'),
                name : this.grid.id,
                checked : (!!cellData.value) ? 'checked' : ''
            });
        },
        setElementAttribute : function(cellData, $target){
            $target.find('input').prop('checked', !!cellData.value);
        },
        getAttributes : function(cellData){
            return this.getAttributesString({
                align : 'center'
            });
        },
        _onChange : function(changeEvent){
            var $target = $(changeEvent.target),
                rowKey = this._getRowKey($target),
                columnName = this._getColumnName($target);
            this.grid.setValue(rowKey, columnName, $target.prop('checked'));
        },
        _onMouseDown : function(mouseDownEvent){
            var $target = $(mouseDownEvent.target);
            if(!$target.is('input')){
                $target.find('input').trigger('click');
            }
        }
    });