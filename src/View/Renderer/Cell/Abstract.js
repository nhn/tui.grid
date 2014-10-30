    /**
     *  Cell Abstract
     *  상속받아 cell renderer를 구현한다.
     */
    View.Base.Renderer.Cell.Abstract = View.Base.Renderer.Cell.extend({
        /**
         * Cell factory 에서 전체 td에 eventHandler 를 attach, detach 할 때 구분자로 사용할 cellType
         */
        cellType: 'normal',
        /**
         * model 의 변화가 발생했을 때, td 를 다시 rendering 해야하는 대상 프로퍼티 목록
         */
        rerenderAttributes: ['isEditable', 'optionList', 'value'],
        /**
         * event handler
         */
        eventHandler: {},
        initialize: function() {
            View.Base.Renderer.Cell.prototype.initialize.apply(this, arguments);
        },
        focusIn: function($td) {
            //todo: cell 에서 키보드 enter 를 입력했을 때 편집모드로 전환. cell 내 input 에 focus 를 수행하는 로직. 필요에 따라 override 한다.
        },
        focusOut: function($td) {
            //todo: focus in 상태에서 키보드 esc 를 입력했을 때 편집모드를 벗어난다. cell 내 input 을 blur 시키고, 편집모드를 벗어나는 로직. 필요에 따라 override 한다.
            this.grid.focusClipboard();
        },
        /**
         *
         * @param {event} keyDownEvent
         * @private
         */
        _onKeyDown: function(keyDownEvent) {
            //todo: cell 종류에 따라 해당 input 에 keydown event handler 를 추가하여 구현한다.
            var $target = $(keyDownEvent.target),
                grid = this.grid,
                keyMap = grid.keyMap,
                isKeyIdentified = true,
                keyCode = keyDownEvent.keyCode || keyDownEvent.which;

            switch (keyCode) {
                case keyMap['ESC']:
                    this.focusOut($target);
                    break;
                case keyMap['ENTER']:
                    this.focusOut($target);
                    break;
                case keyMap['TAB']:
                    if (keyDownEvent.shiftKey) {
                        //이전 cell 로 focus 이동 후 편집모드로 전환
                    } else {
                        //이후 cell 로 focus 이동 후 편집모드로 전환
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
        /**
         * Cell data 를 인자로 받아 <td> 안에 들아갈 html string 을 반환한다.
         * @param {object} cellData
         * @param {jquery} $td
         * @param {Boolean} hasFocusedElement
         * @return  {string} html string
         * @example
         * var html = this.getContentHtml();
         * <select>
         *     <option value='1'>option1</option>
         *     <option value='2'>option1</option>
         *     <option value='3'>option1</option>
         * </select>
         */
        getContentHtml: function(cellData, $td, hasFocusedElement) {
            //todo: rerenderAttributes 에 해당하는 프로퍼티가 변경되었을 때 수행될 로직을 구현한다.
            throw this.error('Implement getContentHtml(cellData, $target) method. On re-rendering');
        },
        /**
         * model의 re renderAttributes 에 해당하지 않는 프로퍼티의 변화가 발생했을 때 수행할 메서드
         * @param {object} cellData
         * @param {jquery} $td
         * @param {Boolean} hasFocusedElement
         */
        setElementAttribute: function(cellData, $td, hasFocusedElement) {
            //todo: rerenderAttributes 에 해당하지 않는 프로퍼티가 변경되었을 때 수행할 로직을 구현한다.
            throw this.error('Implement setElementAttribute(cellData, $target) method. ');
        }
    });


