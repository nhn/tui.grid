    /**
     *  editOption 에 list 를 가지고 있는 형태
     * @type {*|void}
     */
    View.Renderer.Cell.List = View.Base.Renderer.Cell.Interface.extend({
        shouldRenderList: ['isEditable', 'optionList'],
        eventHandler: {
        },
        initialize: function() {
            View.Base.Renderer.Cell.Interface.prototype.initialize.apply(this, arguments);
        },
        getContentHtml: function(cellData) {
            throw this.error('Implement getContentHtml(cellData, $target) method. On re-rendering');
        },
        setElementAttribute: function(cellData, $target) {
            throw this.error('Implement setElementAttribute(cellData, $target) method. ');
        }
    });


    /**
     * editType select
     * @type {*|void}
     */
    View.Renderer.Cell.List.Select = View.Renderer.Cell.List.extend({
        cellType: 'select',
        initialize: function(attributes) {
            View.Renderer.Cell.List.prototype.initialize.apply(this, arguments);
        },
        eventHandler: {
            'click' : 'onClick',
            'change select' : 'onChange'
        },

        getContentHtml: function(cellData) {
            var columnModel = this.grid.columnModel.getColumnModel(cellData.columnName),
                html = '';

            html += '<select name="' + Util.getUniqueKey() + '">';
            for (var i = 0, list = columnModel.editOption.list; i < list.length; i++) {
                html += '<option ';
                html += 'value="' + list[i].value + '"';

                if (cellData.value == list[i].value) {
                    html += ' selected';
                }
                html += ' >';
                html += list[i].text;
                html += '</option>';
            }
            html += '</select>';
            return html;

        },
        setElementAttribute: function(cellData, $target) {
            $target.find('select').val(cellData.value);
        },
        onClick: function(clickEvent) {
        },
        onChange: function(changeEvent) {
            var $target = $(changeEvent.target),
                cellAddr = this._getCellAddress($target);

            this.grid.setValue(cellAddr.rowKey, cellAddr.columnName, $target.val());
        }
    });


    /**
     * editType = radio || checkbox
     * @type {*|void}
     */
    View.Renderer.Cell.List.Button = View.Renderer.Cell.List.extend({
        cellType: 'button',
        initialize: function(attributes) {
            View.Renderer.Cell.List.prototype.initialize.apply(this, arguments);
        },
        eventHandler: {
            'click' : 'onClick',
            'change input' : 'onChange'
        },
        template: {
            input: _.template('<input type="<%=type%>" name="<%=name%>" id="<%=id%>" value="<%=value%>" <%=checked%>>'),
            label: _.template('<label for="<%=id%>" style="margin-right:10px"><%=text%></label>')
        },
        getContentHtml: function(cellData) {
            var columnModel = this.grid.columnModel.getColumnModel(cellData.columnName),
                value = cellData.value,
                checkedList = ('' + value).split(','),
                html = '',
                name = Util.getUniqueKey(),
                id;

            for (var i = 0, list = columnModel.editOption.list; i < list.length; i++) {
                id = name + '_' + list[i].value;
                html += this.template.input({
                    type: columnModel.editOption.type,
                    name: name,
                    id: id,
                    value: list[i].value,
                    checked: $.inArray('' + list[i].value, checkedList) === -1 ? '' : 'checked'
                });
                if (list[i].text) {
                    html += this.template.label({
                        id: id,
                        text: list[i].text
                    });
                }
            }

            return html;
        },
        setElementAttribute: function(cellData, $target) {
            //TODO
        },
        _getEditType: function($target) {
            var columnName = this._getColumnName($target),
                columnModel = this.grid.columnModel.getColumnModel(columnName),
                type = columnModel.editOption.type;

            return type;
        },
        onClick: function(clickEvent) {
        },
        _getCheckedList: function($target) {
            var $checkedList = $target.closest('td').find('input[type=' + this._getEditType($target) + ']:checked'),
                checkedList = [];

            for (var i = 0; i < $checkedList.length; i++) {
                checkedList.push($checkedList.eq(i).val());
            }

            return checkedList;
        },
        onChange: function(changeEvent) {
            var $target = $(changeEvent.target),
                cellAddr = this._getCellAddress($target);
            this.grid.setValue(cellAddr.rowKey, cellAddr.columnName, this._getCheckedList($target));
        },
        _getInputEl: function(value) {
            return this.$el.find('input[type=' + this.type + '][value="' + value + '"]');
        }
    });
