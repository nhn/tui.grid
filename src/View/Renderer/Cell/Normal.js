    /**
     * editOption 이 적용되지 않은 cell 의 renderer
     * @class
     */
    View.Renderer.Cell.Normal = View.Base.Renderer.Cell.Interface.extend({
        initialize: function(attributes, options) {
            View.Base.Renderer.Cell.Interface.prototype.initialize.apply(this, arguments);
        },
        /**
         * Rendering 시 td 안에 들어가야 할 contentHtml string 을 반환한다
         * @param {object} cellData
         * @param {jQuery} $target
         * @return {String}
         */
        getContentHtml: function(cellData, $target) {
            var columnName = cellData.columnName,
                columnModel = this.grid.columnModel.getColumnModel(columnName),
                value = this.grid.dataModel.get(cellData.rowKey).getTagFiltered(columnName),
                rowKey = cellData.rowKey;

            if (typeof columnModel.formatter === 'function') {
                value = columnModel.formatter(value, this.grid.dataModel.get(rowKey).toJSON(), columnModel);
            }
            return value;
        },
        /**
         * model 의 onChange 시, innerHTML 변경 없이, element attribute 만 변경해야 할 때 수행된다.
         * @param {object} cellData
         * @param {jQuery} $target
         */
        setElementAttribute: function(cellData, $target) {
        }
    });

    /**
     * checkbox 혹은 radiobox 형태의 Main Button renderer
     * @class
     */
    View.Renderer.Cell.MainButton = View.Base.Renderer.Cell.Interface.extend({
        /**
         * event Handler attach 하기 위한 cell type
         */
        cellType: 'main',
        /**
         * rendering 해야하는 cellData 의 변경 목록
         */
        rerenderAttributes: ['isEditable', 'optionList'],
        eventHandler: {
            'mousedown' : '_onMouseDown',
            'change input' : '_onChange'
        },
        initialize: function(attributes, options) {
            View.Base.Renderer.Cell.Interface.prototype.initialize.apply(this, arguments);
        },
        /**
         * rendering 시 사용할 template
         */
        template: _.template('<input type="<%=type%>" name="<%=name%>" <%=checked%> <%=disabled%>/>'),
        /**
         * Rendering 시 td 안에 들어가야 할 contentHtml string 을 반환한다
         * @param {object} cellData
         * @param {jQuery} $target
         * @return {String}
         */
        getContentHtml: function(cellData, $target) {
            var isDisabled = cellData.isDisabled;
            return this.template({
                type: this.grid.option('selectType'),
                name: this.grid.id,
                checked: (!!cellData.value) ? 'checked' : '',
                disabled: isDisabled ? 'disabled' : ''
            });
        },
        setElementAttribute: function(cellData, $target) {
            $target.find('input').prop('checked', !!cellData.value);
        },
        getAttributes: function(cellData) {
            return this.getAttributesString({
                align: 'center'
            });
        },
        _onChange: function(changeEvent) {
            var $target = $(changeEvent.target),
                rowKey = this._getRowKey($target),
                columnName = this._getColumnName($target);
            this.grid.setValue(rowKey, columnName, $target.prop('checked'));
        },
        _onMouseDown: function(mouseDownEvent) {
            var $target = $(mouseDownEvent.target);
            if (!$target.is('input')) {
                $target.find('input').trigger('click');
            }
        }
    });
