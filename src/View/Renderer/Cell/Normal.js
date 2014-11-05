    /**
     * editOption 이 적용되지 않은 cell 의 renderer
     * @class
     * @extends {View.Base.Renderer.Cell}
     * @implements {View.Base.Renderer.Cell.Interface}
     */
    View.Renderer.Cell.Normal = View.Base.Renderer.Cell.extend({
        initialize: function(attributes, options) {
            View.Base.Renderer.Cell.prototype.initialize.apply(this, arguments);
        },
        getEditType: function() {
            return 'normal';
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
        focusIn: function() {
            this.grid.focusClipboard();
        },
        /**
         * model 의 onChange 시, innerHTML 변경 없이, element attribute 만 변경해야 할 때 수행된다.
         * @param {object} cellData
         * @param {jQuery} $target
         */
        setElementAttribute: function(cellData, $target) {
        }
    });

    View.Renderer.Cell.Normal.Number = View.Renderer.Cell.Normal.extend({
        rerenderAttributes: [],
        initialize: function(attributes, options) {
            View.Renderer.Cell.Normal.prototype.initialize.apply(this, arguments);
        },
        getEditType: function() {
            return '_number';
        },
        /**
         * Rendering 시 td 안에 들어가야 할 contentHtml string 을 반환한다
         * @param {object} cellData
         * @param {jQuery} $target
         * @return {String}
         */
        getContentHtml: function(cellData, $target) {
            return cellData.value;
        }
    });
    /**
     * checkbox 혹은 radiobox 형태의 Main Button renderer
     * @class
     * @extends {View.Base.Renderer.Cell}
     * @implements {View.Base.Renderer.Cell.Interface}
     */
    View.Renderer.Cell.MainButton = View.Base.Renderer.Cell.extend({
        /**
         * rendering 해야하는 cellData 의 변경 목록
         */
        rerenderAttributes: ['isEditable', 'optionList'],
        eventHandler: {
            'mousedown' : '_onMouseDown',
            'change input' : '_onChange',
            'keydown input' : '_onKeyDown'
        },
        initialize: function(attributes, options) {
            View.Base.Renderer.Cell.prototype.initialize.apply(this, arguments);
            this._setKeyDownSwitch({
                'UP_ARROW': function() {},
                'DOWN_ARROW': function() {},
                'ENTER': function(keyDownEvent, param) {
                    this.focusOut(param.$target);
                },
                'LEFT_ARROW': function(keyDownEvent, param) {
                    this._focusPrevInput(param.$target);
                },
                'RIGHT_ARROW': function(keyDownEvent, param) {
                    this._focusPrevInput(param.$target);
                },
                'ESC': function(keyDownEvent, param) {
                    this._restore(param.$target);
                    this.focusOut(param.$target);
                }
            });
        },
        /**
         * rendering 시 사용할 template
         */
        template: _.template('<input type="<%=type%>" name="<%=name%>" <%=checked%> <%=disabled%>/>'),
        getEditType: function() {
            return '_button';
        },
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
        focusIn: function($td) {
//            $td.find('input').focus();
        },
        /**
         * checked 를 toggle 한다.
         * @param {jQuery} $td
         */
        toggle: function($td) {
            var $input = $td.find('input');
            if (this.grid.option('selectType') === 'checkbox') {
                $input.trigger('click');
            }
        },
        setElementAttribute: function(cellData, $target) {
            var $input = $target.find('input'),
                isChecked = $input.prop('checked');
            if (isChecked !== !!cellData.value) {
                $input.prop('checked', cellData.value);
            }
        },
        getAttributes: function(cellData) {
            return this.getAttributesString({
                align: 'center'
            });
        },
        _onChange: function(changeEvent) {
            var $target = $(changeEvent.target),
                rowKey = this._getRowKey($target);
            this.grid.setValue(rowKey, '_button', $target.prop('checked'));
        },
        _onMouseDown: function(mouseDownEvent) {
            var $target = $(mouseDownEvent.target);
            if (!$target.is('input')) {
                $target.find('input').trigger('click');
            }
        }
    });
