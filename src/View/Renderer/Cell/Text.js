    View.Renderer.Cell.Text = View.Base.Renderer.Cell.Interface.extend({
        cellType: 'text',
        shouldRenderList: ['isEditable', 'optionList'],
        eventHandler: {
            'blur input' : '_onBlur',
            'keydown input': '_onKeyDown'
        },
        initialize: function(attributes, options) {
            View.Base.Renderer.Cell.Interface.prototype.initialize.apply(this, arguments);
            this.setOwnProperties({
                originalText: ''
            });
        },
        template: _.template('<input type="text" value="<%=value%>" name="<%=name%>" <%=disabled%>/>'),

        focusIn: function($td) {
            var $input = $td.find('input');
            this.originalText = $input.val();
            $input.focus();

        },
        focusOut: function() {
            this.grid.focusClipboard();
        },
        _isEdited: function($input) {
            return $input.val() !== this.originalText;
        },
        _restore: function($input) {
            $input.val(this.originalText);
        },
        /**
         * keyDown event handler
         * @param {event} keyDownEvent
         * @private
         */
        _onKeyDown: function(keyDownEvent) {
            var $target = $(keyDownEvent.target),
                grid = this.grid,
                keyMap = grid.keyMap,
                isKeyIdentified = true,
                keyCode = keyDownEvent.keyCode || keyDownEvent.which;

            switch (keyCode) {
                case keyMap['ESC']:
                    this._restore($target);
                    this.focusOut();
                    break;
                case keyMap['ENTER']:
                    this.focusOut();
                    break;
                case keyMap['TAB']:
                    if (keyDownEvent.shiftKey) {
                        //이전
                    } else {
                        //이후
                    }
                    break;
                default:
                    isKeyIdentified = false;
                    break;
            }
            if (isKeyIdentified) {
                keyDownEvent.preventDefault();
            }
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
        _onBlur: function(blurEvent) {

            var $target = $(blurEvent.target),
                rowKey = this._getRowKey($target),
                columnName = this._getColumnName($target);
            if (this._isEdited($target)) {
                this.grid.setValue(rowKey, columnName, $target.val());
            }
        }
    });
