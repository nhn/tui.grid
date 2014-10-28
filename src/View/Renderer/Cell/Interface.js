    /**
     *  Cell Interface
     *  상속받아 cell renderer를 구현한다.
     */
    View.Base.Renderer.Cell.Interface = View.Base.Renderer.Cell.extend({
        /**
         * Cell factory 에서 전체 td에 eventHandler 를 attach, detach 할 때 구분자로 사용할 cellType
         */
        cellType: 'normal',
        /**
         * model 의 변화가 발생했을 때, td 를 다시 rendering 해야하는 대상 프로퍼티 목록
         */
        shouldRenderList: ['isEditable', 'optionList', 'value'],
        /**
         * event handler
         */
        eventHandler: {},
        initialize: function() {
            View.Base.Renderer.Cell.prototype.initialize.apply(this, arguments);
        },
        edit: function() {

        },
        /**
         * Cell data 를 인자로 받아 <td> 안에 들아갈 html string 을 반환한다.
         * @param {object} cellData
         * @return  {string} html string
         * @example
         * var html = this.getContentHtml();
         * <select>
         *     <option value='1'>option1</option>
         *     <option value='2'>option1</option>
         *     <option value='3'>option1</option>
         * </select>
         */
        getContentHtml: function(cellData) {
            throw this.error('Implement getContentHtml(cellData, $target) method. On re-rendering');
        },
        /**
         * model의 shouldRenderList 에 해당하지 않는 프로퍼티의 변화가 발생했을 때 수행할 메서드
         * @param {object} cellData
         * @param {jquery} $target
         */
        setElementAttribute: function(cellData, $target) {
            throw this.error('Implement setElementAttribute(cellData, $target) method. ');
        }
    });


