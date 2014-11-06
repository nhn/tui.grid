(function(){
/**
 * @fileoverview 페이지네이션의 뷰를 생성하고, 이벤트를 건다.
 * (pug.Pagination 에서 분리)
 * @author 이제인(jein.yi@nhnent.com)
 */


var ne = ne || {};
ne.Component = ne.Component || {};

/**
 *
 * @constructor
 * @param {DataObject} options 옵션 객체
 * 		@param {Number} [options.itemCount=10] 리스트의 전체 아이템 개수
 * 		@param {Number} [options.itemPerPage=10] 한 페이지에 표시 될 아이템의 개수를 정의한다.
 * 		@param {Number} [options.pagePerPageList=10] 페이지 목록에 표시 될 페이지의 개수를 정의한다.
 * 		@param {Number} [options.page=1] Pagination 컴포넌트가 로딩되었을 때 보여 주는 페이지이다. 기본값으로는 1이 설정된다. 아래의 이미지에서는 12페이지를 선택한 경우이다.
 * 		@param {String} [options.moveUnit="pagelist"] 이전/다음 버튼을 누르는 경우 한 페이지씩(page) 또는 페이지 목록(pagelist) 단위로 이동하게 해주는 설정 값이다.
 * 			<ul>
 * 				<li>pagelist : nPagePerPageList로 설정한 값 기준으로 이동한다.(기본값 기준으로 10페이지)</li>
 * 				<li>page : 한 페이지 씩 이동한다.</li>
 * 			</ul>
 * 		@param {Boolean}[options.isCenterAlign=false] 현재 페이지가 항상 가운데에 오도록 정렬해주는 값이다. 이전 또는 다음 버튼을 눌러서 페이지를 이동하는 경우 이동 된 페이지가 중앙에 오게 된다.<br/>※ 이 값을 true로 할 경우엔 moveUnit이 항상 "page"로 설정되어야 한다.
 * 		@param {String} [options.insertTextNode=""] 페이지 목록에서 페이지의 마크업들을 연결해주는 문자열이다. 설정 값에 따라서 각각의 페이지를 보여주는 노드 (예 <a href="#">11</a><a href="#">12</a>에서 a태그)를 "\n" 또는 " "등으로 설정해서 변경할 수 있다. (위의 예에서는 a태그 사이의 간격이 한 줄 또는 하나의 공백문자로 변경되게 된다.)<br/>※ 주의할 점은 이 옵션에 따라 렌더링이 달라질 수 있다는 점이다.
 * 		@param {String} [options.classPrefix=""] 클래스명 접두어
 * 		@param {String} [options.firstItemClassName="first-child"] 페이지 목록에서 첫 번째 페이지 항목에 추가되는 클래스명
 * 		@param {String} [options.lastItemClassName="last-child"] 페이지 목록에서 마지막 페이지 항목에 추가되는 클래스명
 * 		@param {String} [options.pageTemplate="<a href='#'>{=page}</a>"] 1, 2, 3, .. 과 같은 페이지를 보여주는 엘리먼트를 어떤 마크업으로 보여줄 지를 설정한다. {=page}가 페이지 번호로 교체된다.
 * 		@param {String} [options.currentPageTemplate="<strong>{=page}</strong>"] 페이지 목록에서 보여주고 있는 현재 페이지를 어떻게 보여줄 지 설정하는 마크업 템플릿이다. {=page}가 현재 페이지 번호로 교체된다.
 * 		@param {jQueryObject} [options.$pre_endOn] 페이지 목록에서 페이지의 맨 처음으로 이동하는 버튼으로 사용되는 엘리먼트이다. 처음으로 이동할 수 있는 경우만 노출되며 값을 지정하지 않거나 pre_end 클래스 명을 가진 a 엘리먼트가 존재하지 않으면 버튼이 생성되지 않는다.<br/>기본 값 : 페이지 목록 엘리먼트 아래의 pre_end 클래스 명을 가지고 있는 a 엘리먼트
 * 		@param {jQueryObject} [options.$preOn] 페이지 목록에서 이전 페이지 또는 이전 페이지목록으로 이동하는 버튼으로 사용되는 엘리먼트이다. 이전으로 이동할 수 있는 경우만 노출되며 값을 지정하지 않거나 pre 클래스 명을 가진 a 엘리먼트가 존재하지 않으면 버튼이 생성되지 않는다.<br/>기본 값 : 페이지 목록 엘리먼트 아래의 pre 클래스 명을 가지고 있는 a 엘리먼트
 * 		@param {jQueryObject} [options.$nextOn] 페이지 목록에서 다음 페이지 또는 다음 페이지목록으로 이동하는 버튼으로 사용되는 엘리먼트이다. 다음으로 이동할 수 있는 경우만 노출되며 값을 지정하지 않거나 next 클래스 명을 가진 a 엘리먼트가 존재하지 않으면 버튼이 생성되지 않는다.<br/>기본 값 : 페이지 목록 엘리먼트 아래의 next 클래스 명을 가지고 있는 a 엘리먼트
 * 		@param {jQueryObject} [options.$lastOn] 페이지 목록에서 페이지의 맨 마지막으로 이동하는 버튼으로 사용되는 엘리먼트이다. 마지막으로 이동할 수 있는 경우만 노출되며 값을 지정하지 않거나 next_end 클래스 명을 가진 a 엘리먼트가 존재하지 않으면 버튼이 생성되지 않는다.<br/>기본 값 : 페이지 목록 엘리먼트 아래의 next_end 클래스 명을 가지고 있는 a 엘리먼트
 * 		@param {jQueryObject} [options.$pre_endOff] elFirstPageLinkOn과는 반대로 처음으로 이동할 수 없는 경우에 사용자에게 비활성화된 상태를 보여주기 위한 엘리먼트이다. 값을 지정하지 않거나 pre_end 클래스 명을 가진 span 엘리먼트가 존재하지 않으면 버튼이 생성되지 않는다.<br/>기본 값 : 페이지 목록 엘리먼트 아래의 pre_end 클래스 명을 가지고 있는 span 엘리먼트
 * 		@param {jQueryObject} [options.$preOff] elPrevPageLinkOn과는 반대로 이전으로 이동할 수 없는 경우에 사용자에게 비활성화된 상태를 보여주기 위한 엘리먼트이다. 값을 지정하지 않거나 pre 클래스 명을 가진 span 엘리먼트가 존재하지 않으면 버튼이 생성되지 않는다.<br/>기본 값 : 페이지 목록 엘리먼트 아래의 pre 클래스 명을 가지고 있는 span 엘리먼트
 * 		@param {jQueryObject} [options.$nextOff] elNextPageLinkOn과는 반대로 다음으로 이동할 수 없는 경우에 사용자에게 비활성화된 상태를 보여주기 위한 엘리먼트이다. 값을 지정하지 않거나 next 클래스 명을 가진 span 엘리먼트가 존재하지 않으면 버튼이 생성되지 않는다.<br/>기본 값 : 페이지 목록 엘리먼트 아래의 next 클래스 명을 가지고 있는 span 엘리먼트
 * 		@param {jQueryObject} [options.$lastOff] zelLastPageLinkOn과는 반대로 마지막으로 이동할 수 없는 경우에 사용자에게 비활성화된 상태를 보여주기 위한 엘리먼트이다. 값을 지정하지 않거나 next_end 클래스 명을 가진 span 엘리먼트가 존재하지 않으면 버튼이 생성되지 않는다.<br/>기본 값 : 페이지 목록 엘리먼트 아래의 next_end 클래스 명을 가지고 있는 span 엘리먼트
 * @param {jQueryObject} $element 페이지목록을 생성할 jQuery객체가 랩핑된 엘리먼트
 *
 */
ne.Component.Pagination = function(options, $element) {
    // 기본옵션
    var defaultOption = {
        itemCount: 10,
        itemPerPage: 10,
        pagePerPageList: 10,
        page: 1,
        moveUnit: 'pagelist',
        isCenterAlign: false,
        insertTextNode: '',
        classPrefix: '',
        firstItemClassName: 'first-child',
        lastItemClassName: 'last-child',
        pageTemplate: '<a href="#">{=page}</a>',
        currentPageTemplate: '<strong>{=page}</strong>'
    };

    /**
     * 옵션객체
     * @type {Object}
     * @private
     */
    this._options = $.extend(defaultOption, options);
    /**
     * 이벤트 핸들러 저장객체
     *
     * @type {Object}
     * @private
     */
    this._eventHandler = {};

    // 뷰 생성
    /**
     * 뷰객체
     * @type {PaginationView}
     * @private
     */
    this._view = new ne.Component.PaginationView(this._options, $element);
    this._view.attachEvent('click', $.proxy(this._onClickPageList, this));
    // 페이지 초기화(이동)
    this.movePageTo(this._getOption('page'), false);

};


/**
 * 페이징을 다시 그린다
 *
 * @param {*} itemCount 다시 그릴 페이지의 아이템 갯수
 */
ne.Component.Pagination.prototype.reset = function(itemCount) {

    var isExist = (itemCount !== null) && (itemCount !== undefined);

    if (!isExist) {
        itemCount = this._getOption('itemCount');
    }

    this._setOption('itemCount', itemCount);
    this.movePageTo(1, false);
};

/**
 * 옵션값을 가져온다
 *
 * @param {String} optionKey 가져올 옵션 키 값
 * @private
 * @returns {*}
 *
 */
ne.Component.Pagination.prototype._getOption = function(optionKey) {

    return this._options[optionKey];

};


/**
 * 지정한 페이지로 이동하고, 페이지 목록을 다시 그린다
 * 이동하기 전엔 beforeMove라는 커스텀 이벤트를 발생시키고, 이동후에는 afterMove라는 커스텀 이벤터를 발생시킨다.
 *
 * @param {Number} targetPage 이동할 페이지
 * @param {Boolean} isisRunCustomEvent [isisRunCustomEvent=true] 커스텀 이벤트의 발생 여부
 */
ne.Component.Pagination.prototype.movePageTo = function(targetPage, isRunCustomEvent) {

    isRunCustomEvent = !!(isRunCustomEvent || isRunCustomEvent === undefined);

    targetPage = this._convertToAvailPage(targetPage);

    this._currentPage = targetPage;

    if (isRunCustomEvent) {
        /**
         * 페이지 이동이 수행되기 직전에 발생
         *
         * @param {ComponentEvent} eventData
         * @param {String} eventData.eventType 커스텀 이벤트명
         * @param {Number} eventData.page 이동하게 될 페이지
         * @param {Function} eventData.stop 페이지 이동을 정지한다
         * @example
         * paganation.attach("beforeMove", function(eventData) {
            // 사용자  클릭의 결과로 이동한 페이지
            var currentPage = eventData.page;
         });
         */

        if (!this.fireEvent('beforeMove', { page: targetPage })) {
            return;
        }
    }

    this._paginate(targetPage);

    if (isRunCustomEvent) {
        /**
         * 페이지 이동이 완료된 시점에서 발생
         *
         * @param {ComponentEvent} eventData
         * @param {String} eventData.eventType 커스텀 이벤트명
         * @param {Number} eventData.page 사용자 클릭의 결과로 이동한 페이지
         * @example
         * paganation.attach("beforeMove", function(eventData) {
            // 사용자  클릭의 결과로 이동한 페이지
            var currentPage = eventData.page;
         });
         */
        this.fireEvent('afterMove', { page: targetPage });
    }
};


/**
 * 옵션값을 변경한다
 *
 * @param {String} optionKey 변경할 옵션 키 값
 * @param {*} optionValue 변경할 옵션 값
 * @private
 */
ne.Component.Pagination.prototype._setOption = function(optionKey, optionValue) {

    this._options[optionKey] = optionValue;

};

/**
 * 현재 페이지를 가져온다
 *
 * @returns {Number} 현재 페이지
 */
ne.Component.Pagination.prototype.getCurrentPage = function() {

    return this._currentPage || this._options['page'];

};

/**
 * 해당 페이지의 첫번째 아이템이 전체중 몇번째 인지 구한다
 *
 * @param {Number} pageNumber 해당 페이지 번호
 * @returns {number}
 */
ne.Component.Pagination.prototype.getIndexOfFirstItem = function(pageNumber) {

    return this._getOption('itemPerPage') * (pageNumber - 1) + 1;

};

/**
 * 마지막 페이지 숫자를 구함
 *
 * @returns {number} 마지막 페이지 숫자
 * @private
 */
ne.Component.Pagination.prototype._getLastPage = function() {
    return Math.ceil(this._getOption('itemCount') / this._getOption('itemPerPage'));

};


/**
 * 몇번째 페이지 리스트인지 구함
 *
 * @param {Number} pageNumber
 * @return {Number} 페이지 리스트 순번
 * @private
 */
ne.Component.Pagination.prototype._getPageIndex = function(pageNumber) {
    //현재 페이지 리스트가 중앙에 와야할때
    if (this._getOption('isCenterAlign')) {
        var left = Math.floor(this._getOption('pagePerPageList') / 2),
            pageIndex = pageNumber - left;

        pageIndex = Math.max(pageIndex, 1);
        pageIndex = Math.min(pageIndex, this._getLastPage());
        return pageIndex;
    }
    return Math.ceil(pageNumber / this._getOption("pagePerPageList"));
};

/**
 * 이전, 다음 버튼을 클릭할 때 제공받을 페이지 숫자를 구한다
 *
 * @param {String} relativeName 어떤 영역으로 옮겨갈지 정한다(pre_end, next_end, pre, next)
 * @return {Number} 해당되는 페이지 숫자
 * @private
 *
 */
ne.Component.Pagination.prototype._getRelativePage = function(relativeName) {
    var page = null,
        isMovePage = this._getOption('moveUnit') === 'page',
        currentPageIndex = this._getPageIndex(this.getCurrentPage());
    switch (relativeName) {
        case 'pre_end' :
            page = 1;
            break;

        case 'next_end' :
            page = this._getLastPage();
            break;

        case 'pre':
            page = isMovePage ? this.getCurrentPage() - 1 : (currentPageIndex - 1) * this._getOption('pagePerPageList');
            break;

        case 'next':
            page = isMovePage ? this.getCurrentPage() + 1 : (currentPageIndex) * this._getOption('pagePerPageList') + 1;
            break;
    }

    return page;
};

/**
 * 페이지 숫자를 받으면 현재 페이지 범위내로 변경하여 반환한다.
 * 예를들어 총 페이지수가 23인데 30이라는 수를 넣으면 23을 반환받는다. 숫자가 1보다 작으면 1을 반환받는다.
 *
 * @param {Number} page
 * @returns {number} 페이지 범위내로 확인된 숫자
 * @private
 */
ne.Component.Pagination.prototype._convertToAvailPage = function(page) {
    var lastPageNumber = this._getLastPage();
    page = Math.max(page, 1);
    page = Math.min(page, lastPageNumber);
    return page;
};


/**
 * 페이지를 그리는데 필요한 뷰셋을 만들고, 뷰에 업데이트를 요청한다
 *
 * @param {Number} page
 * @private
 */
ne.Component.Pagination.prototype._paginate = function(page){

    // 뷰의 버튼 및 페이지를 모두 제거 및 복사
    this._view.empty();

    var viewSet = {};

    viewSet.lastPage = this._getLastPage();
    viewSet.currentPageIndex = this._getPageIndex(page);
    viewSet.lastPageListIndex = this._getPageIndex(viewSet.lastPage);
    viewSet.page = page;

    this._view.update(viewSet, page);
};

/**
 * 페이지네이션 이벤트 핸들
 *
 * @param {JQueryEvent} event
 * @private
 */
ne.Component.Pagination.prototype._onClickPageList = function(event) {

    event.preventDefault();

    var page = null,
        targetElement = $(event.target),
        targetPage;

    if (this._view.isIn(targetElement, this._getOption('$pre_endOn'))) {
        page = this._getRelativePage('pre_end');
    } else if (this._view.isIn(targetElement, this._getOption('$preOn'))) {
        page = this._getRelativePage('pre');
    } else if (this._view.isIn(targetElement, this._getOption('$nextOn'))) {
        page = this._getRelativePage('next');
    } else if (this._view.isIn(targetElement, this._getOption('$lastOn'))) {
        page = this._getRelativePage('next_end');
    } else {

        targetPage = this._view.getPageElement(targetElement);

        if (targetPage && targetPage.length) {
            page = parseInt(targetPage.text(), 10);
        } else {
            return;
        }
    }

    /**
     페이지 이동을 위한 숫자나 버튼을 클릭했을때 발생

     @param {ComponentEvent} eventData
     @param {String} eventData.eventType 커스텀 이벤트명
     @param {Number} eventData.page 클릭해서 이동할 페이지
     @param {Function} eventData.stop 페이지 이동을 정지한다

     **/

    var isFired = this.fireEvent("click", {"page" : page});
    if (!isFired) {
        return;
    }

    this.movePageTo(page);
};

/**
 * 커스텀 이벤트를 등록시킨다
 * @param {String|Object} eventType
 * @param {Function} handlerToAttach
 * @returns {ne.Component.Pagination}
 */
ne.Component.Pagination.prototype.attach = function(eventType, handlerToAttach) {
    if (arguments.length === 1) {
        var eventType,
            handler;
        for (eventType in arguments[0]) {
            handler = arguments[0][eventType];
            this.attach(eventType, handler);
        }
        return this;
    }

    var handlerList = this._eventHandler[eventType];
    if (typeof handlerList === 'undefined'){
        handlerList = this._eventHandler[eventType] = [];
    }
    handlerList.push(handlerToAttach);

    return this;
};



/**
 * 이벤트를 발생시킨다.
 *
 * @param {String} eventType 커스텀 이벤트명
 * @param {Object} eventObject 커스텀 이벤트 핸들러에 전달되는 객체.
 * @return {Boolean} 핸들러의 커스텀 이벤트객체에서 stop메서드가 수행되면 false를 리턴
 */
ne.Component.Pagination.prototype.fireEvent = function(eventType, eventObject) {
    eventObject = eventObject || {};

    var inlineHandler = this['on' + eventType],
        handlerList = this._eventHandler[eventType] || [],
        hasInlineHandler = $.isFunction(inlineHandler),
        hasHandlerList = handlerList.length > 0;

    if (!hasInlineHandler && !hasHandlerList) {
        return true;
    }

    handlerList = handlerList.concat(); //fireEvent수행시 핸들러 내부에서 detach되어도 최초수행시의 핸들러리스트는 모두 수행하게 하기위한 복사
    eventObject.eventType = eventType;

    if (!eventObject._aExtend) {
        eventObject._aExtend = [];

        eventObject.stop = function(){
            if (eventObject._aExtend.length > 0) {
                eventObject._aExtend[eventObject._aExtend.length - 1].canceled = true;
            }
        };
    }

    eventObject._aExtend.push({
        type: eventType,
        canceled: false
    });

    var argument = [eventObject],
        i,
        length;

    for (i = 2, length = arguments.length; i < length; i++){
        argument.push(arguments[i]);
    }

    if (hasInlineHandler) {
        inlineHandler.apply(this, argument);
    }

    if (hasHandlerList) {
        var handler;
        for (i = 0; (handler = handlerList[i]); i++) {
            handler.apply(this, argument);
        }
    }

    return !eventObject._aExtend.pop().canceled;
};

/**
 * @fileoverview 페이지네이션, 화면에 그려지는 요소들을 관리한다
 * (pug.Pagination 에서 분리)
 * @author 이제인(jein.yi@nhnent.com)
 */


var ne = ne || {};
ne.Component = ne.Component || {};

/**
 * @constructor
 * @param {Object} options 옵션 객체
 * @param {Object} $element 루트 엘리먼트
 *
 */
ne.Component.PaginationView = function(options, $element) {
    /**
     * 페이지네이션의 루트 엘리먼트
     *
     * @type {jQueryObject}
     * @private
     */
    this._element = $element;
    /**
     * 페이지네이션 지정 옵션
     *
     * @type {Object}
     * @private
     */
    this._options = options;
    /**
     * 컴포넌트에 저장되는 셀렉터
     *
     * @type {Object}
     * @private
     */
    this._elementSelector = {};
    /**
     * 선택된 엘리먼트들을 캐싱해두는 객체
     *
     * @type {Object}
     * @private
     */
    this._cachedElement = {};
    /**
     * 발생한 이벤트를 캐싱하는 데이터
     *
     * @type {Object}
     * @private
     */
    this._eventData = {};

    $.extend(options, {
        $pre_endOn: options['$pre_endOn'] || $('a.' + this._wrapPrefix('pre_end'), this._element),
        $preOn: options['$preOn'] || $('a.' + this._wrapPrefix('pre'), this._element),
        $nextOn: options['$nextOn'] || $('a.' + this._wrapPrefix('next'), this._element),
        $lastOn: options['$lastOn'] || $('a.' + this._wrapPrefix('next_end'), this._element),
        $pre_endOff: options['$pre_endOff'] || $('span.' + this._wrapPrefix('pre_end'), this._element),
        $preOff: options['$preOff'] || $('span.' + this._wrapPrefix('pre'), this._element),
        $nextOff: options['$nextOff'] || $('span.' + this._wrapPrefix('next'), this._element),
        $lastOff: options['$lastOff'] || $('span.' + this._wrapPrefix('next_end'), this._element)
    });

    this._element.addClass(this._wrapPrefix('loaded'));
}



/**
 * 뷰를 업데이트 한다
 *
 * @param {Object} viewSet 뷰갱신에 대한 값들
 */
ne.Component.PaginationView.prototype.update = function(viewSet) {
    this._addTextNode();
    this._setPageResult(viewSet.lastPage);

    var options = this._options,
        edges = this._getEdge(viewSet),
        leftPageNumber = edges.left,
        rightPageNumber = edges.right;

    viewSet.leftPageNumber = leftPageNumber;
    viewSet.rightPageNumber = rightPageNumber;

    if (options.moveUnit === 'page') {
        viewSet.currentPageIndex = viewSet.page;
        viewSet.lastPageIndex = viewSet.lastPage;
    }

    this._setFirst(viewSet);
    this._setPrev(viewSet);
    this._setPageNumbers(viewSet);
    this._setNext(viewSet);
    this._setLast(viewSet);
};

/**
 * 포함관계를 본다
 *
 * @param {JQueryObject} $find 포함되어있는 체크할 대상
 * @param {JQueryObject} $parent 포함하고 있는지 체크할 대상
 * @returns {boolean}
 */
ne.Component.PaginationView.prototype.isIn = function($find, $parent) {
    if (!$parent) {
        return false;
    }
    return ($find[0] === $parent[0]) ? true : $.contains($parent, $find);
};

/**
 * 기준 엘리먼트를 구한다
 *
 * @returns {JQueryObject}
 */
ne.Component.PaginationView.prototype.getBaseElement = function() {
    return this._element;
};


/**
 * 기준엘리먼트를 초기화 시킨다
 */
ne.Component.PaginationView.prototype.empty = function(){

    var options = this._options,
        $pre_endOn = options.$pre_endOn,
        $preOn = options.$preOn,
        $nextOn = options.$nextOn,
        $lastOn = options.$lastOn,
        $pre_endOff = options.$pre_endOff,
        $preOff = options.$preOff,
        $nextOff = options.$nextOff,
        $lastOff = options.$lastOff;

    options.$pre_endOn = this._clone($pre_endOn);
    options.$preOn = this._clone($preOn);
    options.$lastOn = this._clone($lastOn);
    options.$nextOn = this._clone($nextOn);
    options.$pre_endOff = this._clone($pre_endOff);
    options.$preOff = this._clone($preOff);
    options.$lastOff = this._clone($lastOff);
    options.$nextOff = this._clone($nextOff);

    this._pageItemList = [];

    this._element.empty();
};



/**
 * 페이지 숫자를 담은 엘리먼트 중 원하는 엘리먼트를 찾는다.
 *
 * @param {jQueryObject|HTMLElement} el 목록 중에서 찾을 target 엘리먼트
 * @return {jQueryObject} 있을 경우 해당 엘리먼트 jQuery 객체를 반환하며, 없으면 null을 반환한다.
 */

ne.Component.PaginationView.prototype.getPageElement = function(el) {

    var i,
        length,
        pickedItem;

    for (i = 0, length = this._pageItemList.length; i < length; i++) {
        pickedItem = this._pageItemList[i];
        if (this.isIn(el, pickedItem)) {
            return pickedItem;
        }
    }
    return null;
};


/**
 * targetElement 엘리먼트에 eventType 이벤트의 콜백함수로 callback 함수를 등록한다.
 * - 컴포넌트 내에서 _attachEventHandler() 메서드를 이용하여 이벤트를 등록하는 경우, 내부에 해당 이벤트 정보들을 저장하게 되며,
 *   추후 컴포넌트의 destroy 시에 이 정보를 이용하여 자동으로 이벤트 해제를 수행하게 된다.
 *
 * @param {String} eventType 등록할 이벤트 명
 * @param {Function} callback 해당 이벤트가 발생 시에 호출할 콜백함수
 * @return {String} eventType 과 random 값이 "_" 로 연결된 유일한 key 값.
 */
ne.Component.PaginationView.prototype.attachEvent = function(eventType, callback) {

    var targetElement = this._element,
        isSavedElement = typeof(targetElement) === 'string' && this._elementSelector[targetElement];

    if (isSavedElement) {
        targetElement = this._getElement(targetElement, true);
    }

    if (targetElement && eventType && callback) {

        var key = eventType + '_' + parseInt(Math.random() * 10000000, 10);

        $(targetElement).bind(eventType, null, callback);

        this._eventData[key] = {
            targetElement: targetElement,
            eventType: eventType,
            callback: callback
        };

        return key;
    }
};


/**
 * 루트 엘리먼트객체를 돌려준다.
 *
 * @returns {jQueryObject}
 */
ne.Component.PaginationView.prototype.getElement = function() {

    return this._element;

};

/**
 * 클래스명에 Prefix 를 붙힘
 * Prefix는 options.classPrefix를 참조, 붙혀질 때 기존 클래스명의 언더바(_) 문자는 하이픈(-)으로 변환됨
 *
 * @param {String} className
 * @returns {*}
 * @private
 */
ne.Component.PaginationView.prototype._wrapPrefix = function(className) {
    var classPrefix = this._options['classPrefix'];
    return classPrefix ? classPrefix + className.replace(/_/g, '-') : className;
};

/**
 * 페이지표시 마크업 사이사이에 options.insertTextNode를 끼어넣어준다.
 * @private
 */
ne.Component.PaginationView.prototype._addTextNode = function() {

    var textNode = this._options['insertTextNode'];
    this._element.append(document.createTextNode(textNode));

};

/**
 * 엘리먼트 복제, html은 동일하나 jQuery객체상태를 초기화 하여 반환된다.
 * @returns {*}
 * @private
 */
ne.Component.PaginationView.prototype._clone = function($link) {

    if ($link && $link.length && $link.get(0).cloneNode) {
        return $($link.get(0).cloneNode(true));
    }
    return $link;

};

/**
 * 페이지 결과값에 따른, 결과클래스를 입힌다.
 * @param {Number} lastNum
 * @private
 */
ne.Component.PaginationView.prototype._setPageResult = function(lastNum) {

    if (lastNum === 0) {
        this._element.addClass(this._wrapPrefix('no-result'));
    } else if (lastNum === 1) {
        this._element.addClass(this._wrapPrefix('only-one')).removeClass(this._wrapPrefix('no-result'));
    } else {
        this._element.removeClass(this._wrapPrefix('only-one')).removeClass(this._wrapPrefix('no-result'));
    }

};


/**
 * 현재페이지의 양 끝페이지를 구한다
 *
 * @param viewSet
 * @returns {{left: *, right: *}}
 * @private
 */

ne.Component.PaginationView.prototype._getEdge = function(viewSet) {

    var options = this._options,
        leftPageNumber,
        rightPageNumber,
        left;

    if (options.isCenterAlign) {

        left = Math.floor(options.pagePerPageList / 2);
        leftPageNumber = viewSet.page - left;
        leftPageNumber = Math.max(leftPageNumber, 1);
        rightPageNumber = leftPageNumber + options.pagePerPageList - 1;

        if (rightPageNumber > viewSet.lastPage) {
            leftPageNumber = viewSet.lastPage - options.pagePerPageList + 1;
            leftPageNumber = Math.max(leftPageNumber, 1);
            rightPageNumber = viewSet.lastPage;
        }

    } else {

        leftPageNumber = (viewSet.currentPageIndex - 1) * options.pagePerPageList + 1;
        rightPageNumber = (viewSet.currentPageIndex) * options.pagePerPageList;
        rightPageNumber = Math.min(rightPageNumber, viewSet.lastPage);

    }

    return {
        left: leftPageNumber,
        right: rightPageNumber
    };
};

/**
 * 첫번째 페이지인지 여부에 따라 첫번째페이지로 가는 링크를 노출할지 결정한다.
 *
 * @param {Object} viewSet
 * @private
 */
ne.Component.PaginationView.prototype._setFirst = function(viewSet) {
    var options = this._options;
    if (viewSet.page > 1) {
        if (options.$pre_endOn) {
            this._element.append(options.$pre_endOn);
            this._addTextNode();
        }
    } else {
        if (options.$pre_endOff) {
            this._element.append(options.$pre_endOff);
            this._addTextNode();
        }
    }

};

/**
 * 이전페이지가 있는지 여부에 따른 오브젝트 활성화
 *
 * @param {Object} viewSet
 * @private
 *
 */
ne.Component.PaginationView.prototype._setPrev = function(viewSet) {
    var options = this._options;

    if (viewSet.currentPageIndex > 1) {
        if (options.$preOn) {
            this._element.append(options.$preOn);
            this._addTextNode();
        }
    } else {
        if (options.$preOff) {
            this._element.append(options.$preOff);
            this._addTextNode();
        }
    }
};

/**
 * 다음페이지가 있는지 여부에 따른 오브젝트 활성화
 *
 * @param {Obejct} viewSet
 * @private
 */
ne.Component.PaginationView.prototype._setNext = function(viewSet) {
    var options = this._options;

    if (viewSet.currentPageIndex < viewSet.lastPageListIndex) {
        if (options.$nextOn) {
            this._element.append(options.$nextOn);
            this._addTextNode();
        }
    } else {
        if (options.$nextOff) {
            this._element.append(options.$nextOff);
            this._addTextNode();
        }
    }

};

/**
 * 마지막페이지가 있는지 여부에 따른 오브젝트 활성화
 *
 * @param {Object} viewSet
 * @private
 */
ne.Component.PaginationView.prototype._setLast = function(viewSet) {

    var options = this._options;

    if (viewSet.page < viewSet.lastPage) {
        if (options.$lastOn) {
            this._element.append(options.$lastOn);
            this._addTextNode();
        }
    } else {
        if (options.$lastOff) {
            this._element.append(options.$lastOff);
            this._addTextNode();
        }
    }

};

/**
 * 페이지 넘버링을 한다
 *
 * @param {Object} viewSet
 * @private
 */
ne.Component.PaginationView.prototype._setPageNumbers = function(viewSet) {
    var $pageItem,
        firstPage = viewSet.leftPageNumber,
        lastPage = viewSet.rightPageNumber,
        options = this._options,
        i;

    for (i = firstPage; i <= lastPage; i++) {
        if (i == viewSet.page) {
            $pageItem = $(options.currentPageTemplate.replace('{=page}', i.toString()));
        } else {
            $pageItem = $(options.pageTemplate.replace('{=page}', i.toString()));
            this._pageItemList.push($pageItem);
        }

        if (i == firstPage) {
            $pageItem.addClass(this._wrapPrefix(options['firstItemClassName']));
        }
        if (i == lastPage) {
            $pageItem.addClass(this._wrapPrefix(options['lastItemClassName']));
        }
        this._element.append($pageItem);

        this._addTextNode();
    }
};

    if (typeof window.console == 'undefined' || !window.console || !window.console.log) window.console = {'log' : function() {}, 'error' : function() {}};
    /**
     * define data container
     * @type {{Layout: {}, Data: {}, Cell: {}}}
     */
    var View = {
            CellFactory: null,
            Layout: {},
            Layer: {},
            Renderer: {
                Row: null,
                Cell: {}
            }
        },
        Model = {},
        Data = {},
        Collection = {},
        AddOn = {};

    /**
     * Model Base Class
     */
    Model.Base = Backbone.Model.extend({
        initialize: function(attributes, options) {
            var grid = attributes && attributes.grid || this.collection && this.collection.grid || null;
            this.setOwnProperties({
                grid: grid
            });

        },

        setOwnProperties: function(properties) {
            _.each(properties, function(value, key) {
                this[key] = value;
            }, this);
        }
    });
    /**
     * Collection Base Class
     */
    Collection.Base = Backbone.Collection.extend({
        initialize: function(attributes) {
            var grid = attributes && attributes.grid || this.collection && this.collection.grid || null;
            this.setOwnProperties({
                grid: grid
            });
            this.reset([], {silent: true});
        },
        clear: function() {
            this.each(function(model) {
                model.stopListening();
                model = null;
            });

            return this;
        },
        setOwnProperties: function(properties) {
            _.each(properties, function(value, key) {
                this[key] = value;
            }, this);
        }
    });

    /**
     * View base class
     * @constructor
     */
    View.Base = Backbone.View.extend({
        initialize: function(attributes) {
            var grid = attributes && attributes.grid || this.collection && this.collection.grid || null;
            this.setOwnProperties({
                grid: grid,
                __viewList: []
            });
        },
        error: function(message) {
            var error = function() {
                this.name = 'PugException';
                this.message = message || 'error';
//                this.methodName = methodName;
//                this.caller = arguments.caller;
            };
            error.prototype = new Error();
            return new error();
        },
        /**
         * setOwnPropertieserties
         *
         * @param {object} properties
         */
        setOwnProperties: function(properties) {
            _.each(properties, function(value, key) {
                this[key] = value;
            }, this);
        },

        /**
         * create view
         * @param {class} clazz
         * @param {object} params
         * @return {class} instance
         */
        createView: function(clazz, params) {
            var instance = new clazz(params);
            if (!this.hasOwnProperty('__viewList')) {
                this.setOwnProperties({
                    __viewList: []
                });
            }
            this.__viewList.push(instance);
            return instance;
        },
        addView: function(instance) {
            if (!this.hasOwnProperty('__viewList')) {
                this.setOwnProperties({
                    __viewList: []
                });
            }
            this.__viewList.push(instance);
            return instance;
        },
        destroy: function() {
            this.destroyChildren();
            this.remove();
        },
        createEventData: function(eventData) {
            eventData = eventData || {};
            eventData.stop = function() {
                this._isStoped = true;
            };
            eventData.isStopped = function() {
                return this._isStoped;
            };
            eventData._isStoped = eventData._isStoped || false;
            return eventData;
        },
        destroyChildren: function() {
            if (this.__viewList instanceof Array) {
                while (this.__viewList.length !== 0) {
                    this.__viewList.pop().destroy();
                }
            }
        }
    });
    /**
     * Renderer Base Class
     * @extends {View.Base}
     * @constructor
     */
    View.Base.Renderer = View.Base.extend({
        eventHandler: {},
        initialize: function(attributes) {
            View.Base.prototype.initialize.apply(this, arguments);
            this._initializeEventHandler();
        },
        /**
         * eventHandler 초기화
         * @private
         */
        _initializeEventHandler: function() {
            var eventHandler = {};
            _.each(this.eventHandler, function(methodName, eventName) {
                var tmp = eventName.split(' '),
                    event = tmp[0],
                    selector = tmp[1] || '';

                eventHandler[event] = {
                    selector: selector,
                    handler: $.proxy(this[methodName], this)
                };
            }, this);
            this.setOwnProperties({
                _eventHandler: eventHandler
            });
        },
        _attachHandler: function($el) {
            _.each(this._eventHandler, function(obj, eventName) {
                var handler = obj.handler,
                    selector = obj.selector,
                    $target = $el;
                if (selector) {
                    $target = $el.find(selector);
                }
                if ($target.length > 0) {
                    $target.on(eventName, handler);
                }
            }, this);
        },
        _detachHandler: function($el) {
            _.each(this._eventHandler, function(obj, eventName) {
                var handler = obj.handler,
                    selector = obj.selector,
                    $target = $el;
                if (selector) {
                    $target = $el.find(selector);
                }
                if ($target.length > 0) {
                    $target.off(eventName, handler);
                }
            }, this);
        },
        getHtml: function() {
            throw this.error('implement getHtml() method');
        }
    });



    var Util = {
        getTBodyHeight: function(rowCount, rowHeight) {
            return rowCount === 0 ? rowCount : rowCount * (rowHeight + 1) + 1;
        },
        getDisplayRowCount: function(tbodyHeight, rowHeight) {
            return Math.ceil((tbodyHeight - 1) / (rowHeight + 1));
        },
        getRowHeight: function(rowCount, tbodyHeight) {
            return Math.floor(((tbodyHeight - 1) / rowCount));
        },
        /**
         * input 타입의 엘리먼트의 커서를 가장 끝으로 이동한다.
         * @param {element} target HTML input 엘리먼트
         */
        setCursorToEnd: function(target) {
            target.focus();
            var length = target.value.length;

            if (target.setSelectionRange) {
                target.setSelectionRange(length, length);
            } else if (target.createTextRange) {
                var range = target.createTextRange();
                range.collapse(true);
                range.moveEnd('character', length);
                range.moveStart('character', length);
                range.select();
            }
        },
        /**
         *
         * @param target
         * @param dist
         * @returns {boolean}
         */
        isEqual: function(target, dist) {
            var i, len, pro;
            if (typeof target !== typeof dist) {
                return false;
            }

            if (target instanceof Array) {
                len = target.length;
                if (len !== dist.length) {
                    return false;
                } else {
                    for (i = 0; i < len; i++) {
                        if (target[i] !== dist[i]) {
                            return false;
                        }
                    }
                }
            } else if (typeof target === 'object') {
                for (pro in target) {
                    if (target[pro] !== dist[pro]) {
                        return false;
                    }
                }
            } else {
                if (target !== dist) {
                    return false;
                }
            }
            return true;
        },
        /**
         * html Tag 문자가 포함되었는지 확인
         * @param {String} string
         * @return {boolean}
         */
        hasTagString: function(string) {
            return /[<>&"']/.test(string);
        },
        /**
         * Grid 에서 필요한 형태로 HTML tag 를 제거한다.
         * @param {string} htmlString
         * @return {*}
         */
        stripTags: function(htmlString) {
            htmlString = htmlString.replace(/[\n\r\t]/g, '');
            if (this.hasTagString(htmlString)) {
                if (/<img/.test(htmlString)) {
                    var matchResult = htmlString.match(/<img[^>]*\ssrc=[\"']?([^>\"']+)[\"']?[^>]*>/);
                    htmlString = matchResult ? matchResult[1] : '';
                } else {
                    htmlString = htmlString.replace(/<button.*?<\/button>/g, '');
                }
                htmlString = this.decodeHTMLEntity(htmlString.replace(/<\/?(?:h[1-5]|[a-z]+(?:\:[a-z]+)?)[^>]*>/ig, ''));
            }
            return htmlString;
        },
        /**
         * Create unique key
         * @return {string}
         * @private
         */
        getUniqueKey: function() {
            var rand = String(parseInt(Math.random() * 10000000000, 10));
            return new Date().getTime() + rand;
        },
        /**
         * 전달된 문자열에 모든 HTML Entity 타입의 문자열을 원래의 문자로 반환
         * @method decodeHTMLEntity
         * @param {String} html HTML Entity 타입의 문자열
         * @return {String} 원래 문자로 변환된 문자열
         * @example
         var htmlEntityString = "A &#039;quote&#039; is &lt;b&gt;bold&lt;/b&gt;"
         var result = Util.decodeHTMLEntity(htmlEntityString); //결과값 : "A 'quote' is <b>bold</b>"
         */
        decodeHTMLEntity: function(html) {
            var entities = {'&quot;' : '"', '&amp;' : '&', '&lt;' : '<', '&gt;' : '>', '&#39;' : '\'', '&nbsp;' : ' '};
            return html.replace(/&amp;|&lt;|&gt;|&quot;|&#39;|&nbsp;/g, function(m0) {
                return entities[m0] ? entities[m0] : m0;
            });
        },
        /**
         * 전달된 문자열을 HTML Entity 타입의 문자열로 반환
         * @method encodeHTMLEntity
         * @param {String} html 문자열
         * @return {String} html HTML Entity 타입의 문자열로 변환된 문자열
         * @example
         var htmlEntityString = "<script> alert('test');</script><a href='test'>"
         var result = Util.encodeHTMLEntity(htmlEntityString);
         //결과값 : "&lt;script&gt; alert('test');&lt;/script&gt;&lt;a href='test'&gt;"
         */
        encodeHTMLEntity: function(html) {
            var entities = {'"': 'quot', '&': 'amp', '<': 'lt', '>': 'gt', '\'': '#39'};
            return html.replace(/[<>&"']/g, function(m0) {
                return entities[m0] ? '&' + entities[m0] + ';' : m0;
            });
        },
        /**
         * $form 에 정의된 인풋 엘리먼트들의 값을 모아서 DataObject 로 구성하여 반환한다.
         * @param {jQuery} $form jQuery()로 감싼 폼엘리먼트
         * @return {object} form 내의 데이터들을 key:value 형태의 DataObject 로 반환한다.
         **/
        getFormData: function($form) {
            var result = {};
            var valueList = $form.serializeArray();

            $.each(valueList, function() {
                if (result[this.name] !== undefined) {
                    if (!result[this.name].push) {
                        result[this.name] = [result[this.name]];
                    }
                    result[this.name].push(this.value || '');
                } else {
                    result[this.name] = this.value || '';
                }
            });
            return result;
        },
        /**
         * 폼 안에 있는 모든 인풋 엘리먼트를 배열로 리턴하거나, elementName에 해당하는 인풋 엘리먼트를 리턴한다.
         * @method getFormElement
         * @param {jquery} $form jQuery()로 감싼 폼엘리먼트
         * @param {String} [elementName] 특정 이름의 인풋 엘리먼트만 가져오고 싶은 경우 전달하며, 생략할 경우 모든 인풋 엘리먼트를 배열 형태로 리턴한다.
         * @return {jQuery}  jQuery 로 감싼 엘리먼트를 반환한다.
         */
        getFormElement: function($form, elementName) {
            if ($form) {
                var formElement;
                if (elementName) {
                    formElement = $form.prop('elements')[elementName + ''];
                } else {
                    formElement = $form.prop('elements');
                }
                return $(formElement);
            }
        },
        /**
         * 파라미터로 받은 데이터 객체를 이용하여 폼에 값을 설정한다.
         *
         * @method setFormData
         * @param {jQuery} $form jQuery()로 감싼 폼엘리먼트
         * @param {Object} formData 폼에 설정할 폼 데이터 객체
         **/
        setFormData: function($form, formData) {
            for (var x in formData) {
                if (formData.hasOwnProperty(x)) {
                    this.setFormElementValue($form, x, formData[x]);
                }
            }
        },
        /**
         * 배열의 값들을 전부 String 타입으로 변환한다.
         * @method _changeToStringInArray
         * @private
         * @param {Array}  arr 변환할 배열
         * @return {Array} 변환된 배열 결과 값
         */
        changeToStringInArray: function(arr) {
            for (var i = 0; i < arr.length; i++) {
                arr[i] = String(arr[i]);
            }
            return arr;
        },
        /**
         * elementName에 해당하는 인풋 엘리먼트에 formValue 값을 설정한다.
         * -인풋 엘리먼트의 이름을 기준으로 하기에 라디오나 체크박스 엘리먼트에 대해서도 쉽게 값을 설정할 수 있다.
         * @method setValue
         * @param {jQuery} $form jQuery()로 감싼 폼엘리먼트
         * @param {String}  elementName 값을 설정할 인풋 엘리먼트의 이름
         * @param {String|Array} formValue 인풋 엘리먼트에 설정할 값으로 체크박스나 멀티플 셀렉트박스인 경우에는 배열로 설정할 수 있다.
         **/
        setFormElementValue: function($form, elementName, formValue) {
            var i, j, index, targetOption;
            var elementList = this.getFormElement($form, elementName, true);
            if (!elementList) {
                return;
            }
            elementList = elementList.nodeType == 1 ? [elementList] : elementList;

            for (var i = 0, targetElement; i < elementList.length; i++) {
                targetElement = elementList[i];
                switch (targetElement.type) {
                    case 'radio':
                        targetElement.checked = (targetElement.value == formValue);
                        break;
                    case 'checkbox':
                        if ($.isArray(formValue)) {
                            targetElement.checked = $.inArray(targetElement.value, this.changeToStringInArray(formValue)) !== -1;
                        }else {
                            targetElement.checked = (targetElement.value == formValue);
                        }
                        break;
                    case 'select-one':
                        index = -1;
                        for (j = 0; j < targetElement.options.length; j++) {
                            targetOption = targetElement.options[j];
                            if (targetOption.value == formValue || targetOption.text == formValue) {
                                index = j;
                                continue;
                            }
                        }
                        targetElement.selectedIndex = index;
                        break;
                    case 'select-multiple':
                        if ($.isArray(formValue)) {
                            formValue = this.changeToStringInArray(formValue);
                            for (j = 0; j < targetElement.options.length; j++) {
                                targetOption = targetElement.options[j];
                                targetOption.selected = $.inArray(targetOption.value, formValue) !== -1 ||
                                    $.inArray(targetOption.text, formValue) !== -1;
                            }
                        }else {
                            index = -1;
                            for (j = 0; j < targetElement.options.length; j++) {
                                targetOption = targetElement.options[j];
                                if (targetOption.value == formValue || targetOption.text == formValue) {
                                    index = j;
                                    continue;
                                }
                            }
                            targetElement.selectedIndex = index;
                        }
                        break;
                    default:
                        targetElement.value = formValue;
                }
            }
        },
        /**
         * object 를 query string 으로 변경한다.
         * @param {object} dataObj
         * @return {string} query string
         */
        toQueryString: function(dataObj) {
            var name, val,
                queryList = [];

            for (name in dataObj) {
                val = dataObj[name];

                if (typeof val !== 'string' && typeof val !== 'number') {
                    val = JSON.stringify(val);
                }
                val = encodeURIComponent(val);
                queryList.push(name + '=' + val);
            }
            return queryList.join('&');
        },
        /**
         * queryString 을 object 형태로 변형한다.
         * @param {String} queryString
         * @return {Object} 변환한 Object
         */
        toQueryObject: function(queryString) {
            var queryList = queryString.split('&'),
                tmp, key, val, i, len = queryList.length,
                obj = {};
            for (i = 0; i < len; i++) {
                tmp = queryList[i].split('=');
                key = tmp[0];
                val = decodeURIComponent(tmp[1]);
                try {
                    val = $.parseJSON(val);
                } catch (e) {}
                obj[key] = val;
            }
            return obj;
        }

    };

    /**
     * ColumnModel
     * @type {*|void}
     */
    Data.ColumnModel = Model.Base.extend({
        defaults: {
            keyColumnName: null,
            columnFixIndex: 0,  //columnFixIndex
            columnModelList: [],
            visibleList: [],

            columnModelMap: {},
            relationListMap: {}
        },
        initialize: function(attributes) {
            Model.Base.prototype.initialize.apply(this, arguments);
            this.on('change', this._onChange, this);

        },
        _appendDefaultColumn: function(data) {
            var columnModelList = $.extend(true, [], data),
                prependList = [],
                selectType = this.grid.option('selectType'),
                hasNumber = false,
                hasChecked = false,
                preparedColumnModel = {
                    '_number' : {
                        columnName: '_number',
                        title: 'No.',
                        width: 60
                    },
                    '_button' : {
                        columnName: '_button',
                        editOption: {
                            type: selectType,
                            list: [{
                                value: 'selected'
                            }]
                        },
                        width: 50
                    }
                };

            if (selectType === 'checkbox') {
                preparedColumnModel['_button'].title = '<input type="checkbox"/>';
            }else if (selectType === 'radio') {
                preparedColumnModel['_button'].title = '선택';
            }else {
                preparedColumnModel['_button'].isHidden = true;
            }

            _.each(columnModelList, function(columnModel, idx) {
                var columnName = columnModel.columnName;
                if (columnName === '_number') {
                    columnModelList[idx] = $.extend(columnModel, preparedColumnModel['_number']);
                    hasNumber = true;
                }else if (columnName === '_button') {
                    columnModelList[idx] = $.extend(columnModel, preparedColumnModel['_button']);
                    hasChecked = true;
                }
            }, this);

            if (!hasNumber) {
                prependList.push(preparedColumnModel['_number']);
            }
            if (!hasChecked) {
                prependList.push(preparedColumnModel['_button']);
            }
            columnModelList = _.union(prependList, columnModelList);
            return columnModelList;
        },
        /**
         * columnName 에 해당하는 index를 반환한다.
         * @param {string} columnName
         * @param {Boolean} isVisible (default:true)
         * @return {number} index
         */
        indexOfColumnName: function(columnName, isVisible) {
            isVisible = (isVisible === undefined);
            var columnModelList = isVisible ? this.getVisibleColumnModelList() : this.get('columnModelList'),
                i = 0, len = columnModelList.length;
            for (; i < len; i++) {
                if (columnModelList[i]['columnName'] === columnName) {
                    return i;
                }
            }
            return -1;
        },
        /**
         * index 에 해당하는 columnModel 을 반환한다.
         * @param {Number} index
         * @param {Boolean} isVisible
         * @return {*}
         */
        at: function(index, isVisible) {
            var columnModelList = isVisible ? this.getVisibleColumnModelList() : this.get('columnModelList');
            return columnModelList[index];
        },
        /**
         * columnName 이 L Side 에 있는 column 인지 반환한다.
         * @param {String} columnName
         */
        isLside: function(columnName) {
            return this.get('columnFixIndex') > this.indexOfColumnName(columnName);
        },
        getVisibleColumnModelList: function(whichSide) {
            whichSide = (whichSide) ? whichSide.toUpperCase() : undefined;
            var columnModelList = [],
                columnFixIndex = this.get('columnFixIndex');
            switch (whichSide) {
                case 'L':
                    columnModelList = this.get('visibleList').slice(0, columnFixIndex);
                    break;
                case 'R':
                    columnModelList = this.get('visibleList').slice(columnFixIndex);
                    break;
                default :
                    columnModelList = this.get('visibleList');
                    break;
            }
            return columnModelList;
        },
        getColumnModel: function(columnName) {
            return this.get('columnModelMap')[columnName];
        },
        /**
         * 컬럼 모델로부터 editType 을 반환한다.
         * @param {string} columnName
         * @return {string}
         */
        getEditType: function(columnName) {
            var columnModel = this.getColumnModel(columnName),
                editType = 'normal';
            if (columnName === '_button' || columnName === '_number') {
                editType = columnName;
            } else if (columnModel && columnModel['editOption'] && columnModel['editOption']['type']) {
                editType = columnModel['editOption']['type'];
            }
            return editType;
        },
        _getVisibleList: function() {
            return _.filter(this.get('columnModelList'), function(item) {return !item['isHidden']});
        },
        /**
         * 각 columnModel 의 relationList 를 모아 relationListMap 를 생성하여 반환한다.
         * @return {*}
         * @private
         */
        _getRelationMart: function() {
            var columnModelList = this.get('columnModelList'),
                columnName, columnModel, relationList,
                relationListMap = {},
                i, len = columnModelList.length;

            for (i = 0; i < len; i++) {
                columnName = columnModelList[i]['columnName'];

                if (columnModelList[i].relationList) {
                    relationList = columnModelList[i].relationList;
                    relationListMap[columnName] = relationList;
                }
            }
            return relationListMap;

        },
        _onChange: function(model) {
            if (model.changed['columnModelList']) {
                this.set({
                    columnModelList: this._appendDefaultColumn(model.changed['columnModelList'])
                },{
                    silent: true
                });
            }
            var visibleList = this._getVisibleList();

            this.set({
                visibleList: visibleList,
                lsideList: visibleList.slice(0, this.get('columnFixIndex')),
                rsideList: visibleList.slice(this.get('columnFixIndex')),
                columnModelMap: _.indexBy(this.get('columnModelList'), 'columnName'),
                relationListMap: this._getRelationMart()
            }, {
                silent: true
            });
        }

    });

    /**
     * Row Data 모델
     * @class
     */
    Data.Row = Model.Base.extend({
        idAttribute: 'rowKey',
        defaults: {
            _extraData: {
                'rowState' : null,
                'selected' : false,
                'focused' : ''
            }
        },
        initialize: function() {
            Model.Base.prototype.initialize.apply(this, arguments);
        },
        /**
         * extraData 로 부터 rowState 를 object 형태로 반환한다.
         * @return {{isDisabled: boolean, isDisabledCheck: boolean}}
         * @private
         */
        getRowState: function() {
            var extraData = this.get('_extraData'),
                rowState = extraData && extraData['rowState'],
                isDisabledCheck = false,
                isDisabled = false,
                isChecked = false,
                classNameList = [];

            if (rowState) {
                switch (rowState) {
                    case 'DISABLED':
                        isDisabled = true;
                        break;
                    case 'DISABLED_CHECK':
                        isDisabledCheck = true;
                        break;
                    case 'CHECKED':
                        isChecked = true;
                }
            }
            isDisabledCheck = isDisabled ? isDisabled : isDisabledCheck;
            if (isDisabled) {
                classNameList.push('disabled');
            }

            return {
                isDisabled: isDisabled,
                isDisabledCheck: isDisabledCheck,
                isChecked: isChecked,
                classNameList: classNameList
            };
        },
        /**
         * getRowSpanData
         *
         * rowSpan 설정값을 반환한다.
         * @param {String} columnName
         * @return {*|{count: number, isMainRow: boolean, mainRowKey: *}}
         */
        getRowSpanData: function(columnName) {
            var extraData = this.get('_extraData'), defaultData;
            if (!columnName) {
                return extraData['rowSpanData'];
            }else {
                extraData = this.get('_extraData');
                defaultData = {
                    count: 0,
                    isMainRow: true,
                    mainRowKey: this.get('rowKey')
                };
                return extraData && extraData['rowSpanData'] && extraData['rowSpanData'][columnName] || defaultData;
            }
        },
        /**
         * html string 을 encoding 한다.
         * columnModel 에 notUseHtmlEntity 가 설정된 경우는 동작하지 않는다.
         *
         * @param {String} columnName
         * @return {String}
         * @private
         */
        getTagFiltered: function(columnName) {
            var columnModel = this.grid.columnModel.getColumnModel(columnName),
                editType = this.grid.columnModel.getEditType(columnName),
                value = this.get(columnName),
                notUseHtmlEntity = columnModel.notUseHtmlEntity;
            if (!notUseHtmlEntity && (!editType || editType === 'text') && Util.hasTagString(value)) {
                value = Util.encodeHTMLEntity(value);
            }
            return value;
        },
        /**
         * type 인자에 맞게 value type 을 convert 한다.
         * List 형태에서 editOption.list 에서 검색을 위해 value type 해당 type 에 맞게 변환한다.
         * @param {Number|String} value
         * @param {String} type
         * @return {Number|String}
         * @private
         */
        _convertValueType: function(value, type) {
            if (type === 'string') {
                return value.toString();
            } else if (type === 'number') {
                return value * 1;
            } else {
                return value;
            }
        },
        /**
         * List type 의 경우 실제 데이터와 editOption.list 의 데이터가 다르기 때문에
         * text 로 전환해서 반환할 때 처리를 하여 변환한다.
         *
         * @param {Number|String} value
         * @param {Object} columnModel
         * @return {string}
         * @private
         */
        _getListTypeVisibleText: function(value, columnModel) {
            var columnName = columnModel['columnName'],
                resultOptionList = this.getRelationResult(['optionListChange'])[columnName],
                editOptionList = resultOptionList && resultOptionList['optionList'] ?
                    resultOptionList['optionList'] : columnModel.editOption.list,
                typeExpected, valueList;

            typeExpected = typeof editOptionList[0].value;
            valueList = value.toString().split(',');
            if (typeExpected !== typeof valueList[0]) {
                _.each(valueList, function(val, index) {
                    valueList[index] = this._convertValueType(val, typeExpected);
                }, this);
            }
            _.each(valueList, function(val, index) {
                var item = _.findWhere(editOptionList, {value: val});
                valueList[index] = item && item.text || '';
            }, this);

            return valueList.join(',');
        },
        /**
         * getRelationResult
         * 컬럼모델에 정의된 relation 을 수행한 결과를 반환한다.
         *
         * @param {Array}   callbackNameList 반환값의 결과를 확인할 대상 callbackList. (default : ['optionListChange', 'isDisable', 'isEditable'])
         * @return {{columnName: {attribute: resultValue}}}
         */
        getRelationResult: function(callbackNameList) {
            callbackNameList = callbackNameList || ['optionListChange', 'isDisable', 'isEditable'];

            var callback, attribute, columnList,
                value,
                rowKey = this.get('rowKey'),
                rowData = this.toJSON(),
                relationListMap = this.grid.columnModel.get('relationListMap'),
                relationResult = {};

            //columnModel 에 저장된 relationListMap 을 순회하며 데이터를 가져온다.
            // relationListMap 구조 {columnName : relationList}
            _.each(relationListMap, function(relationList, columnName) {
                value = rowData[columnName];

                //relationList 를 순회하며 수행한다.
                _.each(relationList, function(relation) {
                    columnList = relation.columnList;

                    //각 relation 에 걸려있는 콜백들을 수행한다.
                    _.each(callbackNameList, function(callbackName) {
                        callback = relation[callbackName];
                        if (typeof callback === 'function') {
                            attribute = '';
                            switch (callbackName) {
                                case 'optionListChange':
                                    attribute = 'optionList';
                                    break;
                                case 'isDisable':
                                    attribute = 'isDisabled';
                                    break;
                                case 'isEditable':
                                    attribute = 'isEditable';
                                    break;
                            }
                            if (attribute) {
                                //relation 에 걸려있는 컬럼들의 값을 변경한다.
                                _.each(columnList, function(targetColumnName) {
                                    relationResult[targetColumnName] = relationResult[targetColumnName] || {};
                                    relationResult[targetColumnName][attribute] = callback(value, rowData);
                                }, this);
                            }
                        }
                    }, this);
                }, this);
            }, this);
            return relationResult;
        },
        /**
         * 화면에 보여지는 데이터를 반환한다.
         * @param {String} columnName
         * @return {*}
         */
        getVisibleText: function(columnName) {
            var columnModel = this.grid.columnModel,
                value = this.get(columnName),
                editType, model,
                listTypeMap = {
                    'select': true,
                    'radio': true,
                    'checkbox': true
                };

            if (columnModel) {
                editType = columnModel.getEditType(columnName);
                model = columnModel.getColumnModel(columnName);
                //list type 의 editType 이 존재하는 경우
                if (listTypeMap[editType]) {
                    if (model.editOption && model.editOption.list && model.editOption.list[0].value) {
                        value = this._getListTypeVisibleText(value, model);
                    } else {
                       throw this.error('Check "' + columnName + '"\'s editOption.list property out in your ColumnModel.');
                    }
                } else {
                    //editType 이 없는 경우, formatter 가 있다면 formatter를 적용한다.
                    if (typeof model.formatter === 'function') {
                        value = Util.stripTags(model.formatter(this.getTagFiltered(columnName), this.toJSON(), model));
                    }
                }
            }
            return value;
        }

    });
    /**
     * 실제 데이터 RowList 콜렉션
     * @class
     */
    Data.RowList = Collection.Base.extend({
        model: Data.Row,

        initialize: function(attributes) {
            Collection.Base.prototype.initialize.apply(this, arguments);
            this.setOwnProperties({
                _sortKey: 'rowKey',
                _originalRowList: [],
                _originalRowMap: {},
                _startIndex: attributes.startIndex || 1,
                _privateProperties: [
                    '_button',
                    '_number',
                    '_extraData'
                ]
            });
            this.listenTo(this.grid.focusModel, 'change', this._onFocusChange, this);
            this.on('change', this._onChange, this);
            this.on('change:_button', this._onCheckChange, this);
    //            this.on('sort add remove reset', this._onSort, this);
            this.on('sort', this._onSort, this);
            this.on('all', this.test1, this);
        },
        test1: function() {
                console.log('#####TEST', arguments);
        },
        /**
         * rowKey 의 index를 가져온다.
         * @param {Number|String} rowKey
         * @return {Number}
         */
        indexOfRowKey: function(rowKey) {
            return this.indexOf(this.get(rowKey));
        },
        _onSort: function() {
            this._refreshNumber();
        },
        _refreshNumber: function() {
            for (var i = 0; i < this.length; i++) {
                this.at(i).set('_number', this._startIndex + i, {silent: true});
            }
        },

        _isPrivateProperty: function(name) {
            return $.inArray(name, this._privateProperties) !== -1;
        },
        _onChange: function(row) {
            var getChangeEvent = function(row, columnName) {
                return {
                    'rowKey' : row.get('rowKey'),
                    'columnName' : columnName,
                    'columnData' : row.get(columnName)
                };
            };
            _.each(row.changed, function(value, columnName) {
                if (!this._isPrivateProperty(columnName)) {
                    var columnModel = this.grid.columnModel.getColumnModel(columnName);
                    if (!columnModel) return;
                    var rowSpanData = row.getRowSpanData(columnName);

                    var changeEvent = getChangeEvent(row, columnName);
                    var obj;
                    //beforeChangeCallback 수행
                    if (columnModel.editOption && columnModel.editOption.changeBeforeCallback) {
                        if (columnModel.editOption.changeBeforeCallback(changeEvent) === false) {
                            obj = {};
                            obj[columnName] = row.previous(columnName);
                            row.set(obj);
                            row.trigger('restore', {
                                changed: obj
                            });
                            return;
                        }
                    }
                    //sorted 가 되지 않았다면, rowSpan 된 데이터들도 함께 update
                    if (!this.isSortedByField()) {
                        if (!rowSpanData['isMainRow']) {
                            this.get(rowSpanData['mainRowKey']).set(columnName, value);
                        }else {
                            var index = this.indexOfRowKey(row.get('rowKey'));
                            for (var i = 0; i < rowSpanData['count'] - 1; i++) {
                                this.at(i + 1 + index).set(columnName, value);
                            }
                        }
                    }

                    changeEvent = getChangeEvent(row, columnName);
                    //afterChangeCallback 수행
                    if (columnModel.editOption && columnModel.editOption.changeAfterCallback) {
                        columnModel.editOption.changeAfterCallback(changeEvent);
                    }
                    //check가 disable 이 아닐 경우에만.
                    if (!row.getRowState().isDisabledCheck) {
                        row.set('_button', true);
                    }
                }
            }, this);
        },
        _onCheckChange: function(row) {
            var columnModel = this.grid.columnModel.getColumnModel('_button'),
                selectType = this.grid.option('selectType'),
                rowKey = row.get('rowKey'),
                checkedList;
            if (selectType === 'radio') {
                checkedList = this.where({
                    '_button' : true
                });
                _.each(checkedList, function(checked, key) {
                    if (rowKey != checked.get('rowKey')) {
                        checked.set({
                            '_button' : false
                        }, {
                            silent: true
                        });
                    }
                });
            }
        },
        /**
         * 정렬이 되었는지 여부 반환
         * @return {Boolean}
         */
        isSortedByField: function() {
            return this._sortKey !== 'rowKey';
        },
        sortByField: function(fieldName) {
            this._sortKey = fieldName;
            this.sort();
        },
        comparator: function(item) {
            if (this.isSortedByField()) {
                return item.get(this._sortKey) * 1;
            }
        },
        /**
         * cell 값을 변경한다.
         * @param rowKey
         * @param columnName
         * @param columnValue
         * @param silent
         * @return {boolean}
         */
        setValue: function(rowKey, columnName, columnValue, silent) {
            var row = this.get(rowKey),
                obj = {};
            if (row) {
                obj[columnName] = columnValue;
                row.set(obj, {
                    silent: silent
                });
                return true;
            }else {
                return false;
            }
        },
        /**
         * column 에 해당하는 값을 전부 변경한다.
         * @param columnName
         * @param columnValue
         * @param silent
         */
        setColumnValue: function(columnName, columnValue, silent) {
            var obj = {};
            obj[columnName] = columnValue;
            this.forEach(function(row, key) {
                row.set(obj, {
                    silent: silent
                });
            }, this);
        },
        /**
         * rowState 를 설정한다.
         * @param {(Number|String)} rowKey
         * @param {string} rowState DISABLED|DISABLED_CHECK|CHECKED
         * @param {boolean} silent
         */
        setRowState: function(rowKey, rowState, silent) {
            this.setExtraData(rowKey, {rowState: rowState}, silent);
        },
        setExtraData: function(rowKey, value, silent) {
            var row = this.get(rowKey),
                obj = {}, extraData;

            if (row) {
                //적용
                extraData = _.clone(row.get('_extraData'));
                extraData = $.extend(extraData, value);
                obj['_extraData'] = extraData;
                row.set(obj, {
                    silent: silent
                });
                return true;
            }else {
                return false;
            }
        },
        _onFocusChange: function(focusModel) {
            var selected = true,
                rowKey = focusModel.get('rowKey');
            _.each(focusModel.changed, function(value, name) {
                if (name === 'rowKey') {
                    if (value === null) {
                        value = focusModel.previous('rowKey');
                        selected = false;
                    }
                    this.setExtraData(value, { selected: selected});

                } else if (name === 'columnName') {
                    this.setExtraData(rowKey, { focused: value});
                }
            }, this);
        },

        parse: function(data) {
            data = data && data['contents'] || data;
            this.setOriginalRowList(this._formatData(data));
            return this._originalRowList;
        },

        /**
         * originalRowList 와 originalRowMap 을 생성한다.
         * @param {Array} [rowList] rowList 가 없을 시 현재 collection 데이터를 originalRowList 로 저장한다.
         * @private
         */
        setOriginalRowList: function(rowList) {
            this._originalRowList = rowList || this.toJSON();
            this._originalRowMap = _.indexBy(this._originalRowList, 'rowKey');
        },
        /**
         *
         * @param {boolean} [isClone=true]
         * @return {Array}
         */
        getOriginalRowList: function(isClone) {
            isClone = isClone === undefined ? true : isClone;
            return isClone ? _.clone(this._originalRowList) : this._originalRowList;
        },
        /**
         * 원본 row 데이터를 반환한다.
         * @param {(Number|String)} rowKey
         * @return {Object}
         */
        getOriginalRow: function(rowKey) {
            return _.clone(this._originalRowMap[rowKey]);
        },
        /**
         * rowKey 와 columnName 에 해당하는 데이터를 반환한다.
         * @param {(Number|String)} rowKey
         * @param {String} columnName
         * @return {(Number|String)}
         */
        getOriginal: function(rowKey, columnName) {
            return _.clone(this._originalRowMap[rowKey][columnName]);
        },

        /**
         * rowList 에서 내부에서만 사용하는 property 를 제거하고 반환한다.
         * @param {Array} rowList
         * @return {Array}
         * @private
         */
        _filter: function(rowList) {
            var obj, filteredRowList = [];

            for (var i = 0, len = rowList.length; i < len; i++) {
                obj = {};
                //_로 시작하는 property 들은 제거한다.
                _.each(rowList[i], function(value, key) {
                    if (!this._isPrivateProperty(key)) {
                        obj[key] = value;
                    }
                }, this);
                filteredRowList.push(obj);
            }
            return filteredRowList;
        },
        /**
         * 수정된 rowList 를 반환한다.
         * @param {boolean} [isOnlyChecked=false] true 로 설정된 경우 checked 된 데이터 대상으로 비교 후 반환한다.
         * @param {boolean} [isRaw=false] true 로 설정된 경우 내부 연산용 데이터 제거 필터링을 거치지 않는다.
         * @return {{createList: Array, updateList: Array, deleteList: Array}}
         */
        getModifiedRowList: function(isOnlyChecked, isRaw) {
            var original = isRaw ? this._originalRowList : this._filter(this._originalRowList),
                current = isRaw ? this.toJSON() : this._filter(this.toJSON()),
                result = {
                    'createList' : [],
                    'updateList' : [],
                    'deleteList' : []
                };

            original = _.indexBy(original, 'rowKey');
            current = _.indexBy(current, 'rowKey');

            // 추가/ 수정된 행 추출
            _.each(current, function(obj, rowKey) {
                if (!isOnlyChecked || (isOnlyChecked && this.get(rowKey).get('_button'))) {
                    if (!original[rowKey]) {
                        result.createList.push(obj);
                    } else if (JSON.stringify(obj) !== JSON.stringify(original[rowKey])) {
                        result.updateList.push(obj);
                    }
                }
            }, this);

            //삭제된 행 추출
            _.each(original, function(obj, rowKey) {
                if (!isOnlyChecked || (isOnlyChecked && this.get(rowKey).get('_button'))) {
                    if (!current[rowKey]) {
                        result.deleteList.push(obj);
                    }
                }
            }, this);
            return result;
        },
        /**
         * rowList 를 반환한다.
         * @param {boolean} [isOnlyChecked=false] true 로 설정된 경우 checked 된 데이터 대상으로 비교 후 반환한다.
         * @param {boolean} [isRaw=false] true 로 설정된 경우 내부 연산용 데이터 제거 필터링을 거치지 않는다.
         */
        getRowList: function(isOnlyChecked, isRaw) {
            var rowList;
            if (isOnlyChecked) {
                rowList = this.where({
                    '_button' : true
                });
            } else {
                rowList = this.toJSON();
            }
            return isRaw ? rowList : this._filter(rowList);
        },
        _formatData: function(data) {
            function setExtraRowSpanData(extraData, columnName, rowSpanData) {
                extraData['rowSpanData'] = extraData && extraData['rowSpanData'] || {};
                extraData['rowSpanData'][columnName] = rowSpanData;
            }
            function isSetExtraRowSpanData(extraData, columnName) {
                return !!(extraData['rowSpanData'] && extraData['rowSpanData'][columnName]);
            }

            var rowList = data,
                keyColumnName = this.grid.columnModel.get('keyColumnName'),
                len = rowList.length,
                subCount, rowSpan, extraData, row, childRow, count, rowKey, rowState, i, j;


            for (i = 0; i < len; i++) {
                row = rowList[i];
                rowKey = (keyColumnName === null) ? i : row[keyColumnName];    //rowKey 설정 keyColumnName 이 없을 경우 자동 생성
                row['rowKey'] = rowKey;
                row['_extraData'] = rowList[i]['_extraData'] || {};
                extraData = row['_extraData'];
                rowSpan = row['_extraData']['rowSpan'];
                rowState = row['_extraData']['rowState'];

                //rowState 값 따라 button 의 상태를 결정한다.
                row['_button'] = rowState === 'CHECKED';

                if (!this.isSortedByField()) {
                    //extraData 의 rowSpanData 를 가공한다.
                    if (rowSpan) {
                        _.each(rowSpan, function(count, columnName) {
                            if (!isSetExtraRowSpanData(extraData, columnName)) {
                                setExtraRowSpanData(extraData, columnName, {
                                    count: count,
                                    isMainRow: true,
                                    mainRowKey: rowKey
                                });
                                //rowSpan 된 데이터의 자식 데이터를 설정한다.
                                subCount = -1;
                                for (j = i + 1; j < i + count; j++) {
                                    childRow = rowList[j];
                                    childRow[columnName] = row[columnName];
                                    childRow['_extraData'] = childRow['_extraData'] || {};
                                    setExtraRowSpanData(childRow['_extraData'], columnName, {
                                        count: subCount--,
                                        isMainRow: false,
                                        mainRowKey: rowKey
                                    });
                                }
                            }
                        }, this);
                    }
                }else {
                    if (rowList[i]['_extraData']) {
                        rowList[i]['_extraData']['rowSpan'] = null;
                    }
                }
            }
            return rowList;
        },
        _getEmptyRow: function() {
            var columnModelList = this.grid.columnModel.get('columnModelList');
            var data = {};
            for (var i = 0; i < columnModelList.length; i++) {
                data[columnModelList[i]['columnName']] = '';
            }
            return data;
        },
        /**
         * rowKey에 해당하는 그리드 데이터를 삭제한다.
         * @param {(Number|String)} rowKey    행 데이터의 고유 키
         * @param {Boolean} [isRemoveOriginalData=false] 원본 데이터도 삭제 여부
         */
        removeRow: function(rowKey, isRemoveOriginalData) {
            var row = this.get(rowKey);
            if (row) {
                this.remove(row);
                if (isRemoveOriginalData) {
                    this.setOriginalRowList();
                }
            }

        },
        append: function(rowData, at) {
            at = at !== undefined ? at : this.length;

            var rowList,
                modelList = [],
                keyColumnName = this.grid.columnModel.get('keyColumnName'),
                len = this.length,
                rowData = rowData || this._getEmptyRow();

            //리스트가 아닐경우 리스트 형태로 변경
            if (!(rowData instanceof Array)) {
                rowData = [rowData];
            }
            //model type 으로 변경
            rowList = this._formatData(rowData);

            _.each(rowList, function(row, index) {
                row['rowKey'] = (keyColumnName) ? row[keyColumnName] : len + index;
                modelList.push(new Data.Row(row, {collection: this}));
            }, this);
            this.add(modelList, {
                at: at,
                merge: true
            });
            this._refreshNumber();
        },
        prepend: function(rowData) {
            //리스트가 아닐경우 리스트 형태로 변경
            this.append(rowData, 0);
        }
    });

    /**
     * View 에서 Rendering 시 바라보는 객체
     * @type {*|void}
     */
    Model.Renderer = Model.Base.extend({
        defaults: {
            top: 0,
            scrollTop: 0,
            $scrollTarget: null,
            scrollLeft: 0,
            maxScrollLeft: 0,
            startIdx: 0,
            endIdx: 0,
            startNumber: 1,
            lside: null,
            rside: null
        },
        initialize: function(attributes) {
            Model.Base.prototype.initialize.apply(this, arguments);

            this.setOwnProperties({
                timeoutIdForRowListChange: 0,
                timeoutIdForRefresh: 0,
                isColumnModelChanged: false
            });

            //원본 rowList 의 상태 값 listening
            this.listenTo(this.grid.columnModel, 'all', this._onColumnModelChange, this);
            this.listenTo(this.grid.dataModel, 'add remove sort reset', this._onRowListChange, this);

            //lside 와 rside 별 Collection 생성
            var lside = new Model.RowList({
                grid: this.grid
            });
            var rside = new Model.RowList({
                grid: this.grid
            });
            this.set({
                lside: lside,
                rside: rside
            });
        },
        initializeVariables: function() {
            this.set({
                top: 0,
                scrollTop: 0,
                $scrollTarget: null,
                scrollLeft: 0,
                startIdx: 0,
                endIdx: 0,
                startNumber: 1
            });
        },
        test: function(model) {
            console.log('change', model.changed);
        },
        getCollection: function(whichSide) {
            whichSide = (whichSide) ? whichSide.toUpperCase() : undefined;
            var collection;
            switch (whichSide) {
                case 'L':
                    collection = this.get('lside');
                    break;
                case 'R':
                    collection = this.get('rside');
                    break;
                default :
                    collection = this.get('rside');
                    break;
            }
            return collection;
        },
        _onColumnModelChange: function() {
            this.set({
                'scrollTop' : 0,
                'top' : 0,
                'startIdx' : 0,
                'endIdx' : 0
            });
            this.isColumnModelChanged = true;
            clearTimeout(this.timeoutIdForRefresh);
            this.timeoutIdForRefresh = setTimeout($.proxy(this.refresh, this), 0);
        },
        _onRowListChange: function() {
            this.grid.selection.endSelection();
            clearTimeout(this.timeoutIdForRefresh);
            this.timeoutIdForRefresh = setTimeout($.proxy(this.refresh, this), 0);
        },
        /**
         * rendering 할 index 범위를 결정한다.
         * Smart rendering 을 사용하지 않을 경우 전체 범위로 랜더링한다.
         * @private
         */
        _setRenderingRange: function() {
            this.set({
                'startIdx' : 0,
                'endIdx' : this.grid.dataModel.length - 1
            });
        },
        refresh: function() {
            this.trigger('beforeRefresh');

            this._setRenderingRange();
            //TODO : rendering 해야할 데이터만 가져온다.
            var len, i,
                columnFixIndex = this.grid.columnModel.get('columnFixIndex'),
                columnList = this.grid.columnModel.get('visibleList'),
                columnNameList = _.pluck(columnList, 'columnName'),

                lsideColumnList = columnNameList.slice(0, columnFixIndex),
                rsideColumnList = columnNameList.slice(columnFixIndex),

                lsideRowList = [],
                rsideRowList = [],
                lsideRow = [],
                rsideRow = [],
                startIdx = this.get('startIdx'),
                endIdx = this.get('endIdx');



            var start = new Date();
            var num = this.get('startNumber') + startIdx;
//            console.log('render', startIdx, endIdx);
            for (i = startIdx; i < endIdx + 1; i++) {
                var rowModel = this.grid.dataModel.at(i);
                var rowKey = rowModel.get('rowKey');
                //데이터 초기화
                lsideRow = {
                    '_extraData' : rowModel.get('_extraData'),
                    'rowKey' : rowKey
                };
                rsideRow = {
                    '_extraData' : rowModel.get('_extraData'),
                    'rowKey' : rowKey
                };

                //lside 데이터 먼저 채운다.
                _.each(lsideColumnList, function(columnName) {
                    if (columnName == '_number') {
                        lsideRow[columnName] = num++;
                    } else {
                        lsideRow[columnName] = rowModel.get(columnName);
                    }
                }, this);

                _.each(rsideColumnList, function(columnName) {
                    if (columnName == '_number') {
                        rsideRow[columnName] = num++;
                    } else {
                        rsideRow[columnName] = rowModel.get(columnName);
                    }
                }, this);

                lsideRowList.push(lsideRow);
                rsideRowList.push(rsideRow);
            }
            this.get('lside').clear().reset(lsideRowList, {
                parse: true
            });
            this.get('rside').clear().reset(rsideRowList, {
                parse: true
            });

            i = startIdx;
            len = rsideRowList.length + startIdx;
            for (; i < len; i++) {
                this.executeRelation(i);
            }

            var end = new Date();
//            console.log('render done', end - start);
            if (this.isColumnModelChanged === true) {
                this.trigger('columnModelChanged');
                this.isColumnModelChanged = false;
            }else {
//                clearTimeout(this.timeoutIdForRowListChange);
//                this.timeoutIdForRowListChange = setTimeout($.proxy(function() {
//                    this.trigger('rowListChanged');
//                }, this), 10);
                this.trigger('rowListChanged');
            }

            this.trigger('afterRefresh');
        },
        /**
         * columnName 으로 lside 와 rside rendering collection 중 하나를 반환한다.
         * @param {String} columnName
         * @return {Collection}
         * @private
         */
        _getRowListDivision: function(columnName) {
            var lside = this.get('lside'),
                rside = this.get('rside');

            if (lside.at(0) && lside.at(0).get(columnName)) {
                return lside;
            } else {
                return rside;
            }
        },
        /**
         * CellData 를 가져온다.
         * @param rowKey
         * @param columnName
         * @return {*}
         */
        getCellData: function(rowKey, columnName) {
            var collection = this._getRowListDivision(columnName),
                row = collection.get(rowKey);
            if (row) {
               return row.get(columnName);
            }
        },
        /**
         * rowIndex 에 해당하는 relation 을 수행한다.
         * @param {Number} rowIndex
         */
        executeRelation: function(rowIndex) {
            var relationResult = this.grid.dataModel.at(rowIndex).getRelationResult(),
                renderIdx = rowIndex - this.get('startIdx'),
                rowModel;

            _.each(relationResult, function(changes, columnName) {
                rowModel = this._getRowListDivision(columnName).at(renderIdx);
                if (rowModel) {
                    this._getRowListDivision(columnName).at(renderIdx).setCell(columnName, changes);
                }
            }, this);
        }

    });

    Model.Cell = Model.Base.extend({
        defaults: {
            rowKey: '',
            columnName: '',
            value: '',

            //Rendering properties
            rowSpan: 0,
            isMainRow: true,
            mainRowKey: '',
            isEditable: false,
            optionList: [],

            //Change attribute properties
            isDisabled: false,
            className: '',
            selected: false,
            focused: false
        },
        initialize: function(attributes) {
            Model.Base.prototype.initialize.apply(this, arguments);
            this.setOwnProperties({
                _model: attributes._model || null,
                attrProperties: [
                    'isDisabled',
                    'className',
                    'selected',
                    'focused'
                ]

            });

            var columnName = attributes.columnName;

            //model 의 변경사항을 listen 한다.
            this.listenTo(this._model, 'change:' + columnName, this._onModelChange, this);
            this.on('change', this._onChange, this);

        },
        _onModelChange: function(row, value) {
            var columnModel = this.grid.columnModel.getColumnModel(this.get('columnName'));
            //@TODO : execute affect option

            if (columnModel.affectOption) {
                //@TODO:do AffectOption
            }

            this.set('value', value);
        },
        _onChange: function(cell) {
            var shouldRender = false;
            _.each(cell.changed, function(value, key) {
                if ($.inArray(key, this.attrProperties) === -1) {
                    shouldRender = true;
                }
            }, this);
            if (shouldRender === true) {
                this.trigger('render', cell);
            }else {
                this.trigger('changeAttr', cell);
            }
        },
        setValue: function(value) {
            this._model.set(this.get('columnName'), value);
        }
    });

    /**
     * 크기 관련 데이터 저장
     * @type {*|void}
     */
    Model.Dimension = Model.Base.extend({
        models: null,
        columnModel: null,
        defaults: {
            offsetLeft: 0,
            offsetTop: 0,

            width: 0,

            headerHeight: 0,
            bodyHeight: 0,
            toolbarHeight: 0,

            rowHeight: 0,

            rsideWidth: 0,
            lsideWidth: 0,
            columnWidthList: [],

            maxScrollLeft: 0
        },
        initialize: function(attributes) {
            Model.Base.prototype.initialize.apply(this, arguments);
            this.columnModel = this.grid.columnModel;
            this.listenTo(this.columnModel, 'change', this._onWidthChange);

            this.on('change:width', this._onWidthChange, this);
            this._setColumnWidth();
            this._setBodyHeight();
        },
        /**
         * 계산한 cell의 위치를 리턴한다.
         * @param {Number|String} rowKey
         * @param {String} columnName
         * @return {{top: *, left: number, right: *, bottom: *}}
         */
        getCellPosition: function(rowKey, columnName) {
            var top, left = 0, right, bottom, i = 0,
                dataModel = this.grid.dataModel,
                offsetLeft = this.get('offsetLeft'),
                offsetTop = this.get('offsetTop'),
                rowHeight = this.get('rowHeight'),
                rowSpanData = dataModel.get(rowKey).getRowSpanData(columnName),
                rowIdx, spanCount,
                columnWidthList = this.get('columnWidthList'),
                columnFixIndex = this.grid.columnModel.get('columnFixIndex'),
                columnIdx = this.grid.columnModel.indexOfColumnName(columnName);



            if (!rowSpanData.isMainRow) {
                rowKey = rowSpanData.mainRowKey;
                rowSpanData = dataModel.get(rowKey).getRowSpanData(columnName);
            }

            spanCount = rowSpanData.count || 1;

            rowIdx = dataModel.indexOfRowKey(rowKey);

            top = Util.getTBodyHeight(rowIdx, rowHeight);
            bottom = top + Util.getTBodyHeight(spanCount, rowHeight) - 1;

            if (columnFixIndex <= columnIdx) {
                i = columnFixIndex;
            }

            for (; i < columnIdx; i++) {
                left += columnWidthList[i] + 1;
            }

            right = left + columnWidthList[i] + 1;

            return {
                top: top,
                left: left,
                right: right,
                bottom: bottom
            };
        },
        /**
         * 현재 화면에 보이는 row 개수를 반환
         * @return {number}
         */
        getDisplayRowCount: function() {
            return Util.getDisplayRowCount(this.get('bodyHeight') - this.get('toolbarHeight'), this.get('rowHeight'));
        },
        /**
         * _onWidthChange
         *
         * width 값 변경시 각 column 별 너비를 계산하는 로직
         * @param {object} model
         * @private
         */
        _onWidthChange: function(model) {
            var curColumnWidthList = this.get('columnWidthList');
            this._setColumnWidth(this._calculateColumnWidthList(curColumnWidthList));
        },
        /**
         * scrollX 높이를 구한다.
         * @return {number}
         */
        getScrollXSize: function() {
            return !!this.grid.option('scrollX') * this.grid.scrollBarSize;
        },
        /**
         * body height 계산
         * @private
         */
        _setBodyHeight: function() {
            var height = Util.getTBodyHeight(this.grid.option('displayRowCount'), this.get('rowHeight'));
            //TODO scroll height 예외처리
            height += this.grid.scrollBarSize;
            this.set('bodyHeight', height);
        },
        /**
         * columnWidth 를 계산하여 저장한다.
         * @param {Array} columnWidthList
         * @private
         */
        _setColumnWidth: function(columnWidthList) {
            var rsideWidth, lsideWidth = 0,
                totalWidth = this.get('width'),
                columnFixIndex = this.columnModel.get('columnFixIndex');

            columnWidthList = columnWidthList || this._getOriginalWidthList();

            for (var i = 0, len = columnWidthList.length; i < len; i++) {
                if (i < columnFixIndex) {
                    lsideWidth += columnWidthList[i] + 1;
                }
            }
            lsideWidth += 1;
            rsideWidth = totalWidth - lsideWidth;
            this.set({
                rsideWidth: rsideWidth,
                lsideWidth: lsideWidth,
                columnWidthList: columnWidthList
            });
            this.trigger('columnWidthChanged');
        },
        /**
         * 실제 너비를 계산한다.
         * @param {String} whichSide
         * @return {Number}
         */
        getTotalWidth: function(whichSide) {
            var columnWidthList = this.getColumnWidthList(whichSide),
                i, len = columnWidthList.length,
                totalWidth = 0;
            for (i = 0; i < len; i++) {
                totalWidth += columnWidthList[i] + 1;
            }
            return totalWidth;
        },
        /**
         * columnResize 발생 시 index 에 해당하는 컬럼의 width 를 변경하여 반영한다.
         * @param {Number} index
         * @param {Number} width
         */
        setColumnWidth: function(index, width) {
            width = Math.max(width, this.grid.option('minimumColumnWidth'));
            var curColumnWidthList = this.get('columnWidthList'),
                calculatedColumnWidthList;

            curColumnWidthList[index] = width;
            calculatedColumnWidthList = this._calculateColumnWidthList(curColumnWidthList);
            this._setColumnWidth(calculatedColumnWidthList);
        },
        /**
         * L side 와 R side 에 따른 columnWidthList 를 반환한다.
         * @param {String} whichSide 생략했을 때 전체 columnList 반환
         * @return {Array}
         */
        getColumnWidthList: function(whichSide) {
            whichSide = (whichSide) ? whichSide.toUpperCase() : undefined;
            var columnFixIndex = this.columnModel.get('columnFixIndex');
            var columnList = [];

            switch (whichSide) {
                case 'L':
                    columnList = this.get('columnWidthList').slice(0, columnFixIndex);
                    break;
                case 'R':
                    columnList = this.get('columnWidthList').slice(columnFixIndex);
                    break;
                default :
                    columnList = this.get('columnWidthList');
                    break;
            }
            return columnList;
        },
        /**
         * columnModel 에 설정된 width 값을 기준으로 widthList 를 작성한다.
         *
         * @return {Array}
         * @private
         */
        _getOriginalWidthList: function() {
            var columnModelList = this.columnModel.get('visibleList'),
                columnWidthList = [];
            for (var i = 0, len = columnModelList.length; i < len; i++) {
                if (columnModelList[i].width) {
                    columnWidthList.push(columnModelList[i].width);
                }else {
                    columnWidthList.push(-1);
                }
            }

            return this._calculateColumnWidthList(columnWidthList);
        },

        /**
         * 인자로 columnWidthList 배열을 받아 현재 total width 에 맞게 계산한다.
         *
         * @param {Array} columnWidthList
         * @return {Array}
         * @private
         */
        _calculateColumnWidthList: function(columnWidthList) {
            var remainWidth, unassignedWidth, remainDividedWidth,
                newColumnWidthList = [],
                totalWidth = this.get('width'),
                width = 0,
                currentWidth = 0,
                unassignedCount = 0;

            for (var i = 0, len = columnWidthList.length; i < len; i++) {
                if (columnWidthList[i] > 0) {
                    width = Math.max(this.grid.option('minimumColumnWidth'), columnWidthList[i]);
                    newColumnWidthList.push(width);
                    currentWidth += width;
                }else {
                    newColumnWidthList.push(-1);
                    unassignedCount++;
                }
            }

            remainWidth = totalWidth - currentWidth;


            if (totalWidth > currentWidth && unassignedCount === 0) {
                newColumnWidthList[newColumnWidthList.length - 1] += remainWidth;
            }

            if (totalWidth > currentWidth) {
                remainWidth = totalWidth - currentWidth;
                unassignedWidth = Math.max(this.grid.option('minimumColumnWidth'), Math.floor(remainWidth / unassignedCount));
            }else {
                unassignedWidth = this.grid.option('minimumColumnWidth');
            }

            for (var i = 0, len = newColumnWidthList.length; i < len; i++) {
                if (newColumnWidthList[i] === -1) {
                    newColumnWidthList[i] = unassignedWidth;
                }
            }

            return newColumnWidthList;
        }
    });

    /**
     * Focus model
     * RowList collection 이 focus class 를 listen 한다.
     * @class
     */
    Model.Focus = Model.Base.extend({
        defaults: {
            rowKey: null,
            columnName: '',
            prevRowKey: null,
            prevColumnName: ''
        },
        initialize: function(attributes, options) {
            Model.Base.prototype.initialize.apply(this, arguments);
        },
        _savePrevious: function() {
            if (this.get('rowKey') !== null) {
                this.set('prevRowKey', this.get('rowKey'));
            }
            if (this.get('columnName')) {
                this.set('prevColumnName', this.get('columnName'));
            }
        },
        _clearPrevious: function() {
            this.set({
                prevRowKey: null,
                prevColumnName: ''
            });
        },
        /**
         * 행을 select 한다.
         * @param {Number|String} rowKey
         * @return {Model.Focus}
         */
        select: function(rowKey) {
            this.unselect().set('rowKey', rowKey);
            return this;
        },
        /**
         * 행을 unselect 한다.
         * @return {Model.Focus}
         */
        unselect: function() {
            this.set({
                'rowKey': null
            });
            return this;
        },
        /**
         * focus 처리한다.
         * @param {Number|String} rowKey
         * @param {String} columnName
         * @param {Boolean} isScrollable
         * @return {Model.Focus}
         */
        focus: function(rowKey, columnName, isScrollable) {
            rowKey = rowKey === undefined ? this.get('rowKey') : rowKey;
            columnName = columnName === undefined ? this.get('columnName') : columnName;
            this._savePrevious();

            if (rowKey !== this.get('rowKey')) {
                this.blur().select(rowKey);
            }
            if (columnName && columnName !== this.get('columnName')) {
                this.set('columnName', columnName);
            }
            if (isScrollable) {
                //todo scrolltop 및 left 값 조정하는 로직 필요.
                this._adjustScroll();
            }
            return this;
        },
        _adjustScroll: function() {
            var focused = this.which(),
                dimensionModel = this.grid.dimensionModel,
                renderModel = this.grid.renderModel,
                scrollTop = renderModel.get('scrollTop'),
                scrollLeft = renderModel.get('scrollLeft'),
                bodyHeight = dimensionModel.get('bodyHeight'),
                lsideWidth = dimensionModel.get('lsideWidth'),
                rsideWidth = dimensionModel.get('rsideWidth'),

                position = dimensionModel.getCellPosition(focused.rowKey, focused.columnName),
                currentLeft = scrollLeft,
                currentRight = scrollLeft + rsideWidth;


            //수직 스크롤 조정
            if (position.top < scrollTop) {
                renderModel.set({
                    scrollTop: position.top
                });
            } else if (position.bottom > bodyHeight + scrollTop - (this.grid.option('scrollX') * this.grid.scrollBarSize)) {
                renderModel.set({
                    scrollTop: position.bottom - bodyHeight + (this.grid.option('scrollX') * this.grid.scrollBarSize)
                });
            }

            //수평 스크롤 조정
            if (!this.grid.columnModel.isLside(focused.columnName)) {
                if (position.left < currentLeft) {
                    renderModel.set({
                        scrollLeft: position.left
                    });
                } else if (position.right > currentRight) {
                    renderModel.set({
                        scrollLeft: position.right - rsideWidth + (this.grid.option('scrollY') * this.grid.scrollBarSize) + 1
                    });
                }
            }
        },
        /**
         * blur 처리한다.
         * @return {Model.Focus}
         */
        blur: function() {
//            console.log("*********************************");
//            this._clearPrevious();
            if (this.get('rowKey') !== null) {
                this.set('columnName', '');
            }
            return this;
        },
        /**
         * 현재 focus 정보를 반환한다.
         */
        which: function() {
            return {
                rowKey: this.get('rowKey'),
                columnName: this.get('columnName')
            };
        },
        /**
         * 현재 focus 정보를 index 기준으로 반환한다.
         */
        indexOf: function(isPrevious) {
            var rowKey = isPrevious ? this.get('prevRowKey') : this.get('rowKey'),
                columnName = isPrevious ? this.get('prevColumnName') : this.get('columnName');

            return {
                rowIdx: this.grid.dataModel.indexOfRowKey(rowKey),
                columnIdx: this.grid.columnModel.indexOfColumnName(columnName)
            };
        },
        /**
         * 현재 focus를 가지고 있는지 여부를 리턴한다.
         * @return {boolean}
         */
        has: function() {
            return !!(this.get('rowKey') !== undefined && this.get('columnName'));
        },
        /**
         * 현재 focus 된 row 기준으로 offset 만큼 이동한 rowKey 를 반환한다.
         * @param {Number} offset
         * @return {Number|String} rowKey
         */
        findRowKey: function(offset) {
            var index, row,
                dataModel = this.grid.dataModel;
            if (this.has()) {
                index = Math.max(Math.min(dataModel.indexOfRowKey(this.get('rowKey')) + offset, this.grid.dataModel.length - 1), 0);
                row = dataModel.at(index);
                return row && row.get('rowKey');
            }
        },
        /**
         * 현재 focus 된 column 기준으로 offset 만큼 이동한 columnName 을 반환한다.
         * @param {Number} offset
         * @return {String} columnName
         */
        findColumnName: function(offset) {
            var index,
                columnModel = this.grid.columnModel,
                columnModelList = columnModel.getVisibleColumnModelList();
            if (this.has()) {
                index = Math.max(Math.min(columnModel.indexOfColumnName(this.get('columnName')) + offset, columnModelList.length - 1), 0);
                return columnModelList[index] && columnModelList[index]['columnName'];
            }
        },
        /**
         * rowSpanData 를 반환한다.
         * @param {Number|String} rowKey
         * @param {String} columnName
         * @return {*|{count: number, isMainRow: boolean, mainRowKey: *}|*}
         * @private
         */
        _getRowSpanData: function(rowKey, columnName) {
            return this.grid.dataModel.get(rowKey).getRowSpanData(columnName);
        },
        nextRowIndex: function(offset) {
            var rowKey = this.nextRowKey(offset);
            return this.grid.dataModel.indexOfRowKey(rowKey);
        },
        prevRowIndex: function(offset) {
            var rowKey = this.prevRowKey(offset);
            return this.grid.dataModel.indexOfRowKey(rowKey);
        },
        nextColumnIndex: function() {
            var columnName = this.nextColumnName();
            return this.grid.columnModel.indexOfColumnName(columnName);
        },
        prevColumnIndex: function() {
            var columnName = this.prevColumnName();
            return this.grid.columnModel.indexOfColumnName(columnName);
        },
        /**
         * keyEvent 발생 시 다음 rowKey 를 반환한다.
         * @return {Number|String}
         */
        nextRowKey: function(offset) {
            var focused = this.which(),
                rowKey = focused.rowKey,
                count, rowSpanData;

            offset = typeof offset === 'number' ? offset : 1;
            if (offset > 1) {
                rowKey = this.findRowKey(offset);
                rowSpanData = this._getRowSpanData(rowKey, focused.columnName);
                if (!rowSpanData.isMainRow) {
                    rowKey = this.findRowKey(rowSpanData.count + offset);
                }
            } else {
                rowSpanData = this._getRowSpanData(rowKey, focused.columnName);
                if (rowSpanData.isMainRow && rowSpanData.count > 0) {
                    rowKey = this.findRowKey(rowSpanData.count);
                } else if (!rowSpanData.isMainRow) {
                    count = rowSpanData.count;
                    rowSpanData = this._getRowSpanData(rowSpanData.mainRowKey, focused.columnName);
                    rowKey = this.findRowKey(rowSpanData.count + count);
                } else {
                    rowKey = this.findRowKey(1);
                }
            }
            return rowKey;
        },

        /**
         * keyEvent 발생 시 이전 rowKey 를 반환한다.
         * @return {Number|String}
         */
        prevRowKey: function(offset) {
            var focused = this.which(),
                rowKey = focused.rowKey,
                rowSpanData;
            offset = typeof offset === 'number' ? offset : 1;
            offset *= -1;

            if (offset < -1) {
                rowKey = this.findRowKey(offset);
                rowSpanData = this._getRowSpanData(rowKey, focused.columnName);
                if (!rowSpanData.isMainRow) {
                    rowKey = this.findRowKey(rowSpanData.count + offset);
                }
            } else {
                rowSpanData = this._getRowSpanData(rowKey, focused.columnName);
                if (!rowSpanData.isMainRow) {
                    rowKey = this.findRowKey(rowSpanData.count - 1);
                } else {
                    rowKey = this.findRowKey(-1);
                }
            }
            return rowKey;
        },
        /**
         * keyEvent 발생 시 다음 columnName 을 반환한다.
         * @return {String}
         */
        nextColumnName: function() {
            return this.findColumnName(1);
        },
        /**
         * keyEvent 발생 시 다음 columnName 을 반환한다.
         * @return {String}
         */
        prevColumnName: function() {
            return this.findColumnName(-1);
        },
        firstRowKey: function() {
            return this.grid.dataModel.at(0).get('rowKey');
        },
        lastRowKey: function() {
            return this.grid.dataModel.at(this.grid.dataModel.length - 1).get('rowKey');
        },
        firstColumnName: function() {
            var columnModelList = this.grid.columnModel.getVisibleColumnModelList();
            return columnModelList[0]['columnName'];
        },
        lastColumnName: function() {
            var columnModelList = this.grid.columnModel.getVisibleColumnModelList(),
                lastIndex = columnModelList.length - 1;
            return columnModelList[lastIndex]['columnName'];
        }
    });

    Model.Renderer.Smart = Model.Renderer.extend({
        initialize: function() {
            Model.Renderer.prototype.initialize.apply(this, arguments);
            this.on('change:scrollTop', this._onChange, this);
            this.listenTo(this.grid.dimensionModel, 'change:bodyHeight', this._onChange, this);
            this.setOwnProperties({
                hiddenRowCount: 10,
                criticalPoint: 3
            });
        },
        _onChange: function() {
            if (this._isRenderable() === true) {
                this.refresh();
            }
        },
        /**
         * SmartRendering 을 사용하여 rendering 할 index 범위를 결정한다.
         * @private
         */
        _setRenderingRange: function() {
            var top,
                scrollTop = this.get('scrollTop'),
                rowHeight = this.grid.dimensionModel.get('rowHeight'),
                bodyHeight = this.grid.dimensionModel.get('bodyHeight'),
                displayRowCount = this.grid.dimensionModel.getDisplayRowCount(),
                startIdx = Math.max(0, Math.ceil(scrollTop / (rowHeight + 1)) - this.hiddenRowCount),
                endIdx = Math.min(this.grid.dataModel.length - 1,
                    Math.floor(startIdx + this.hiddenRowCount + displayRowCount + this.hiddenRowCount)),
                startRow, endRow, minList, maxList;

            if (!this.grid.isSorted()) {
                minList = [];
                maxList = [];
                startRow = this.grid.dataModel.at(startIdx);
                endRow = this.grid.dataModel.at(endIdx);
                if (startRow && endRow) {
                    _.each(startRow.get('_extraData')['rowSpanData'], function(data, columnName)  {
                        if (!data.isMainRow) {
                            minList.push(data.count);
                        }
                    }, this);

                    _.each(endRow.get('_extraData')['rowSpanData'], function(data, columnName) {
                        if (data.count > 0) {
                            maxList.push(data.count);
                        }
                    }, this);

                    if (minList.length > 0) {
                        startIdx += Math.min.apply(Math, minList);
                    }
                    if (maxList.length > 0) {
                        endIdx += Math.max.apply(Math, maxList);
                    }
                }
            }

            top = (startIdx === 0) ? 0 : Util.getTBodyHeight(startIdx, rowHeight) - 1;

            this.set({
                top: top,
                startIdx: startIdx,
                endIdx: endIdx
            });

        },

        _isRenderable: function() {
            var scrollTop = this.get('scrollTop'),
                rowHeight = this.grid.dimensionModel.get('rowHeight'),
                bodyHeight = this.grid.dimensionModel.get('bodyHeight'),
                displayRowCount = this.grid.dimensionModel.getDisplayRowCount(),
                rowCount = this.grid.dataModel.length,
                displayStartIdx = Math.max(0, Math.ceil(scrollTop / (rowHeight + 1))),
                displayEndIdx = Math.min(this.grid.dataModel.length - 1, Math.floor((scrollTop + bodyHeight) / (rowHeight + 1))),
                startIdx = this.get('startIdx'),
                endIdx = this.get('endIdx');
            console.log('#########GAP', endIdx - startIdx, displayRowCount);
            if ((startIdx !== 0 && startIdx + this.criticalPoint > displayStartIdx) ||
                endIdx !== rowCount - 1 && (endIdx < rowCount && (endIdx - this.criticalPoint < displayEndIdx))) {
                console.log(startIdx + this.criticalPoint, displayStartIdx);
                console.log(endIdx - this.criticalPoint, displayEndIdx);
                return true;
            }else {
                return false;
            }

        }
    });

    /**
     * row model
     * @type {*|void}
     */
    Model.Row = Model.Base.extend({
        idAttribute: 'rowKey',
        defaults: {
        },
        initialize: function(attributes, options) {
            Model.Base.prototype.initialize.apply(this, arguments);
            var rowKey = attributes && attributes['rowKey'];

            if (this.grid.dataModel.get(rowKey)) {
                this.listenTo(this.grid.dataModel.get(rowKey), 'change', this._onDataModelChange, this);
                this.listenTo(this.grid.dataModel.get(rowKey), 'restore', this._onDataModelChange, this);
            }
        },
        /**
         * dataModel 이 변경시 model 데이터를 함께 업데이트 하는 핸들러
         * @param {Object} model
         * @private
         */
        _onDataModelChange: function(model) {
            _.each(model.changed, function(value, columnName) {
                if (columnName === '_extraData') {
                    // 랜더링시 필요한 정보인 extra data 가 변경되었을 때 rowSpan 된
                    // row model 에 연결된 focus, select, disable 를 업데이트 한다.
                    this.updateRowSpanned();
                }else {
                    this.setCell(columnName, {
                        value: value
                    });
                }
            }, this);
        },

        /**
         * extra data 를 토대로 rowSpanned 된 render model 의 정보를 업데이트 한다.
         */
        updateRowSpanned: function(isRowSpanDataOnly) {
            if (this.collection) {
                var columnModel = this.grid.columnModel.getVisibleColumnModelList(),
                    model = this.grid.dataModel.get(this.get('rowKey')),
                    extraData = model.get('_extraData'),
                    selected = extraData['selected'] || false,
                    focusedColumnName = extraData['focused'],
                    rowState = model.getRowState(),
                    param;

                _.each(columnModel, function(column, key) {
                    var mainRowKey,
                        columnName = column['columnName'],
                        cellData = this.get(columnName),
                        rowModel = this,
                        focused = (columnName === focusedColumnName),
                        isDisabled = columnName === '_button' ? rowState.isDisabledCheck : rowState.isDisabled;

                    if (cellData) {
                        if (!this.grid.isSorted()) {
                            if (!cellData['isMainRow']) {
                                rowModel = this.collection.get(cellData['mainRowKey']);
                            }
                        }

                        if (rowModel && !isRowSpanDataOnly || (isRowSpanDataOnly && !cellData['isMainRow'])) {
                            param = {
                                focused: focused,
                                selected: selected,
                                className: rowState.classNameList.join(' ')
                            };
                            if (isDisabled) {
                                param.isDisabled = true;
                            }
                            rowModel.setCell(columnName, param);
                        }
                    }
                }, this);
            }
        },
        parse: function(data) {
            //affect option 을 먼저 수행한다.
            var grid = this.collection.grid,
                dataModel = grid.dataModel,
                rowKey = data['rowKey'];

            _.each(data, function(value, columnName) {
                var rowSpanData,
                    focused = data['_extraData']['focused'] === columnName,
                    selected = !!data['_extraData']['selected'],
                    rowState = dataModel.get(rowKey).getRowState(),
                    isDisabled = rowState.isDisabled,
                    isEditable = grid.isEditable(rowKey, columnName),
                    defaultRowSpanData = {
                        mainRowKey: rowKey,
                        count: 0,
                        isMainRow: true
                    };

                if (columnName !== 'rowKey' && columnName !== '_extraData') {

                    if (grid.isSorted()) {
                        rowSpanData = defaultRowSpanData;
                    }else {
                        rowSpanData = data['_extraData'] && data['_extraData']['rowSpanData'] && data['_extraData']['rowSpanData'][columnName] || defaultRowSpanData;
                    }
                    isDisabled = columnName === '_button' ? rowState.isDisabledCheck : isDisabled;

                    data[columnName] = {
                        rowKey: rowKey,
                        columnName: columnName,
                        value: value,

                        //Rendering properties
                        rowSpan: rowSpanData.count,
                        isMainRow: rowSpanData.isMainRow,
                        mainRowKey: rowSpanData.mainRowKey,
                        //Change attribute properties
                        isEditable: isEditable,
                        isDisabled: isDisabled,
                        optionList: [],
                        className: rowState.classNameList.join(' '),
                        focused: focused,
                        selected: selected,

                        changed: []    //변경된 프로퍼티 목록들
                    };
                }
            }, this);
//            this.executeAffectList(data);
            return data;
        },

        /**
         * Cell 의 값을 변경한다.
         * @param {String} columnName
         * @param {{key: value}} param
         */
        setCell: function(columnName, param) {
            if (this.get(columnName)) {
                var data = _.clone(this.get(columnName)),
                    isValueChanged = false,
                    changed = [],
                    rowIndex,
                    rowKey = this.get(columnName)['rowKey'];

                for (var name in param) {

                    if (!Util.isEqual(data[name], param[name])) {
                        isValueChanged = (name === 'value') ? true : isValueChanged;
                        data[name] = param[name];
                        changed.push(name);
                    }
                }
                if (changed.length) {
                    data['changed'] = changed;
                    this.set(columnName, data);
                    if (isValueChanged) {
                        //value 가 변경되었을 경우 relation 을 수행한다.
                        rowIndex = this.grid.dataModel.indexOfRowKey(rowKey);
                        this.grid.renderModel.executeRelation(rowIndex);
                    }
                }
            }
        }
    });

    /**
     * view model rowList collection
     * @type {*|void}
     */
    Model.RowList = Collection.Base.extend({
        model: Model.Row,
        initialize: function(attributes) {
            Collection.Base.prototype.initialize.apply(this, arguments);
            this.on('reset', this._onReset, this);
        },
        _onReset: function() {
            var focused = this.grid.focusModel.which(),
                model = this.get(focused.rowKey);
            //랜더링시 rowSpan 된 view 들의 정보를 업데이트한다.
            if (model) {
                model.updateRowSpanned();
            }
        }

    });

/**
 * body layout 뷰
 *
 * @type {*|void}
 */
View.Layer.Base = View.Base.extend({
    initialize: function(attributes) {
        View.Base.prototype.initialize.apply(this, arguments);
        this.setOwnProperties({
            text: '기본 텍스트'
        });
        this.listenTo(this.grid.dimensionModel, 'change', this._resize, this);
    },
    template: _.template('' +
        '<div>' +
        '    <%=text%>' +
        '    <div class="loading_img"></div>' +
        '</div>'),
    render: function(text) {
        this.$el.html(this.template({
            text: text || this.text
        })).css('display', 'none');
        return this;
    },

    show: function(text) {
        this.render(text).$el.css('display', 'block')
            .css('zIndex', 1);
        this._resize();
    },
    hide: function() {
        this.$el.css('display', 'none');
    },
    _resize: function() {
        if (this.$el.css('display') === 'block') {
            var headerHeight = this.grid.dimensionModel.get('headerHeight'),
                bodyHeight = this.grid.dimensionModel.get('bodyHeight');
            this.$el.css('marginTop', headerHeight + 'px')
                .css('height', bodyHeight + 'px');
        }
    }
});
/**
 * body layout 뷰
 *
 * @type {*|void}
 */
View.Layer.Empty = View.Layer.Base.extend({
    className: 'no_row_layer',
    initialize: function(attributes) {
        View.Layer.Base.prototype.initialize.apply(this, arguments);
        this.setOwnProperties({
            text: '데이터가 존재하지 않습니다.'
        });
    },
    template: _.template('<%=text%>')
});

/**
 * body layout 뷰
 *
 * @type {*|void}
 */
View.Layer.Loading = View.Layer.Base.extend({
    className: 'loading_layer',
    initialize: function(attributes) {
        View.Layer.Base.prototype.initialize.apply(this, arguments);
        this.text = '요청을 처리 중입니다.';
    },
    template: _.template('' +
        '<div>' +
        '    <%=text%>' +
        '    <div class="loading_img"></div>' +
        '</div>')
});

View.Layer.Ready = View.Layer.Base.extend({
    className: 'initializing_layer',
    initialize: function(attributes) {
        View.Layer.Base.prototype.initialize.apply(this, arguments);
        this.text = '초기화 중 입니다.';
    }
});

    View.Layout.Frame = View.Base.extend({
        tagName: 'div',
        className: 'lside_area',
        initialize: function(attributes) {
            View.Base.prototype.initialize.apply(this, arguments);
            this.listenTo(this.grid.renderModel, 'columnModelChanged', this.render, this);
            this.listenTo(this.grid.dimensionModel, 'columnWidthChanged', this._onColumnWidthChanged, this);
            this.setOwnProperties({
                header: null,
                body: null
            });
        },
        render: function() {
            this.destroyChildren();
            this.beforeRender();

            var header = this.header = this.createView(View.Layout.Header, {
                grid: this.grid,
                whichSide: this.whichSide
            });
            var body = this.body = this.createView(View.Layout.Body, {
                grid: this.grid,
                whichSide: this.whichSide
            });

            this.$el
                .append(header.render().el)
                .append(body.render().el);

            this.afterRender();
            this.trigger('afterRender');
            return this;
        },
        beforeRender: function() {
            //@TODO: override this function
        },
        afterRender: function() {
            //@TODO: override this function
        }
    });

















    /**
     * body layout 뷰
     *
     * @type {*|void}
     */
    View.Layout.Body = View.Base.extend({
        tagName: 'div',
        className: 'data',
        template: _.template('' +
                '<div class="table_container" style="top: 0px">' +
                '    <table width="100%" border="0" cellspacing="1" cellpadding="0" bgcolor="#EFEFEF">' +
                '        <colgroup><%=colGroup%></colgroup>' +
                '        <tbody></tbody>' +
                '    </table>' +
                '</div>'),
        events: {
            'scroll': '_onScroll',
            'mousedown': '_onMouseDown'
        },
        initialize: function(attributes) {
            View.Base.prototype.initialize.apply(this, arguments);
            this.setOwnProperties({
                whichSide: attributes && attributes.whichSide || 'R'
            });

            this.listenTo(this.grid.dimensionModel, 'columnWidthChanged', this._onColumnWidthChanged, this)
                .listenTo(this.grid.dimensionModel, 'change:bodyHeight', this._onBodyHeightChange, this)
                .listenTo(this.grid.renderModel, 'change:top', this._onTopChange, this)
                .listenTo(this.grid.renderModel, 'change:scrollTop', this._onScrollTopChange, this)
                .listenTo(this.grid.renderModel, 'change:scrollLeft', this._onScrollLeftChange, this)
                .listenTo(this.grid.renderModel, 'beforeRefresh', this._onBeforeRefresh, this);

        },
        _onBodyHeightChange: function(model, value) {
            this.$el.css('height', value + 'px');
        },
        /**
         * columnWidth change 핸들러
         * @private
         */
        _onColumnWidthChanged: function() {
            var columnWidthList = this.grid.dimensionModel.getColumnWidthList(this.whichSide),
                $colList = this.$el.find('col');
            for (var i = 0; i < $colList.length; i++) {
                $colList.eq(i).css('width', columnWidthList[i] + 'px');
            }
        },
        /**
         * MouseDown event handler
         * @param {event} mouseDownEvent
         * @private
         */
        _onMouseDown: function(mouseDownEvent) {
            var focused, pos, selection = this.grid.selection;
            if (mouseDownEvent.shiftKey) {
                focused = this.grid.focusModel.indexOf(true);
                if (!selection.hasSelection()) {
                    selection.startSelection(focused.rowIdx, focused.columnIdx);
                }

                selection.attachMouseEvent(mouseDownEvent.pageX, mouseDownEvent.pageY);
                pos = selection.getIndexFromMousePosition(mouseDownEvent.pageX, mouseDownEvent.pageY);
                selection.updateSelection(pos.row, pos.column);
                this.grid.focusAt(pos.row, pos.column);
            } else {
                selection.endSelection();
                this.grid.selection.attachMouseEvent(mouseDownEvent.pageX, mouseDownEvent.pageY);
            }
        },
        /**
         * Scroll Event Handler
         * @param {event} scrollEvent
         * @private
         */
        _onScroll: function(scrollEvent) {
            var obj = {};
            obj['scrollTop'] = scrollEvent.target.scrollTop;
            if (this.whichSide === 'R') {
                obj['scrollLeft'] = scrollEvent.target.scrollLeft;
            }
            this.grid.renderModel.set('$scrollTarget', this.$el);
            this.grid.renderModel.set(obj);
        },
        /**
         * Render model 의 Scroll left 변경 핸들러
         * @param {object} model
         * @param {Number} value
         * @private
         */
        _onScrollLeftChange: function(model, value) {
            if (this.whichSide === 'R') {
                this.el.scrollLeft = value;
            }
        },
        /**
         * Render model 의 Scroll top 변경 핸들러
         * @param {object} model
         * @param {Number} value
         * @private
         */
        _onScrollTopChange: function(model, value) {
            this.el.scrollTop = value;
        },

        /**
         * Render model 의 top 변경 핸들러
         * @param {object} model
         * @param {Number} value
         * @private
         */
        _onTopChange: function(model, value) {
            this.$el.children('.table_container').css('top', value + 'px');
        },
        _onBeforeRefresh: function() {
            this.el.scrollTop = this.grid.renderModel.previous('scrollTop');
        },
        _getViewCollection: function() {
            return this.grid.renderModel.getCollection(this.whichSide);
        },
        render: function() {
            var selection, rowList;
            this.destroyChildren();
            this.$el.css({
                    height: this.grid.dimensionModel.get('bodyHeight')
                }).html(this.template({
                    colGroup: this._getColGroupMarkup()
                }));

            rowList = this.createView(View.RowList, {
                grid: this.grid,
                collection: this._getViewCollection(),
                el: this.$el.find('tbody'),
                whichSide: this.whichSide
            });
            rowList.render();

            //selection 을 랜더링한다.
            selection = this.addView(this.grid.selection.createLayer(this.whichSide));
            this.$el.append(selection.render().el);

            return this;
        },
        _getColGroupMarkup: function() {
            var columnModel = this.grid.columnModel,
                dimensionModel = this.grid.dimensionModel,
                columnWidthList = dimensionModel.getColumnWidthList(this.whichSide),
                columnModelList = columnModel.getVisibleColumnModelList(this.whichSide);

            var html = '';
            for (var i = 0, len = columnWidthList.length; i < len; i++) {
                html += '<col columnname="' + columnModelList[i]['columnName'] + '" style="width:' + columnWidthList[i] + 'px">';
            }
            return html;
        }
    });

    View.Layout.Frame.Lside = View.Layout.Frame.extend({
        className: 'lside_area',
        initialize: function(attributes) {
            View.Layout.Frame.prototype.initialize.apply(this, arguments);
            this.setOwnProperties({
                whichSide: 'L'
            });
        },
        _onColumnWidthChanged: function() {
            var width = this.grid.dimensionModel.get('lsideWidth');
            this.$el.css({
                width: width + 'px'
            });
        },
        beforeRender: function() {
            var width = this.grid.dimensionModel.get('lsideWidth');
            this.$el.css({
                display: 'block',
                width: width + 'px'
            });
        }
    });

    /**
     * 우측 frame view
     */
    View.Layout.Frame.Rside = View.Layout.Frame.extend({
        className: 'rside_area',
        initialize: function(attributes) {
            View.Layout.Frame.prototype.initialize.apply(this, arguments);
            this.setOwnProperties({
                whichSide: 'R'
            });
        },
        _onColumnWidthChanged: function() {
            var dimensionModel = this.grid.dimensionModel;
            var marginLeft = dimensionModel.get('lsideWidth');
            var width = dimensionModel.get('rsideWidth');
            this.$el.css({
                width: width + 'px',
                marginLeft: marginLeft + 'px'
            });
        },
        beforeRender: function() {
            var dimensionModel = this.grid.dimensionModel;
            var marginLeft = dimensionModel.get('lsideWidth');
            var width = dimensionModel.get('rsideWidth');

            this.$el.css({
                display: 'block',
                width: width + 'px',
                marginLeft: marginLeft + 'px'
            });
        },
        afterRender: function() {
            var virtualScrollBar,
                $space = $('<div></div>');
            $space.css({
                height: this.grid.dimensionModel.get('headerHeight') - 2
            }).addClass('space');
            this.$el.append($space);

            if (this.grid.option('notUseSmartRendering') === false) {
                virtualScrollBar = this.createView(View.Layout.Frame.Rside.VirtualScrollBar, {
                    grid: this.grid
                });
                this.$el.append(virtualScrollBar.render().el);
//                console.log(this.$el.html());
            }
        }
    });

    /**
     * virtual scrollbar
     *
     * @type {*|void|Object}
     */
    View.Layout.Frame.Rside.VirtualScrollBar = View.Base.extend({
        tagName: 'div',
        className: 'virtual_scrollbar',

        initialize: function(attributes) {
            View.Base.prototype.initialize.apply(this, arguments);
            this.listenTo(this.grid.dataModel, 'sort add remove reset', this._setHeight, this);
            this.listenTo(this.grid.dimensionModel, 'change', this._onDimensionChange, this);
            this.listenTo(this.grid.renderModel, 'change:scrollTop', this._onScrollTopChange, this);
            this.timeoutForScroll = 0;
        },
        template: _.template('<div class="content"></div>'),
        events: {
            'scroll' : '_onScroll'
        },
        _onScroll: function(scrollEvent) {
            clearTimeout(this.timeoutForScroll);
            this.timeoutForScroll = setTimeout($.proxy(function() {
                this.grid.renderModel.set('$scrollTarget', this.$el);
                this.grid.renderModel.set('scrollTop', scrollEvent.target.scrollTop);
            }, this), 10);
        },
        _onDimensionChange: function(model) {
            if (model.changed['headerHeight'] || model.changed['bodyHeight']) {
                this.render();
            }
        },

        _onScrollTopChange: function(model, value) {
            var scrollTop;
            this.el.scrollTop = value;
            scrollTop = this.el.scrollTop;
            if (scrollTop !== value) {
                this.grid.renderModel.set('scrollTop', scrollTop);
            }
        },
        render: function() {
            this.$el.css({
                height: this.grid.dimensionModel.get('bodyHeight') - this.grid.scrollBarSize,
                top: this.grid.dimensionModel.get('headerHeight'),
                display: 'block'
            }).html(this.template());
            this._setHeight();
            return this;
        },
        /**
         * virtual scrollbar 의 height 를 지정한다.
         * @private
         */
        _setHeight: function() {
            var rowHeight = this.grid.dimensionModel.get('rowHeight'),
                rowCount = this.grid.dataModel.length,
                height = rowHeight * this.grid.dataModel.length + (rowCount + 1);
            this.$el.find('.content').height(height);
        }
    });

    /**
     * Header 레이아웃 View
     * @type {*|void}
     */
    View.Layout.Header = View.Base.extend({
        tagName: 'div',
        className: 'header',
        viewList: [],
        whichSide: 'R',
        events: {
            'click' : '_onClick'
        },
        initialize: function(attributes, option) {
            View.Base.prototype.initialize.apply(this, arguments);
            this.whichSide = attributes.whichSide;
            this.viewList = [];
            this.setOwnProperties({
                timeoutForAllChecked: 0
            });
            this.listenTo(this.grid.renderModel, 'change:scrollLeft', this._onScrollLeftChange, this)
                .listenTo(this.grid.dimensionModel, 'columnWidthChanged', this._onColumnWidthChanged, this)
                .listenTo(this.grid.dataModel, 'change:_button', this._onCheckCountChange, this);

        },
        /**
         * 그리드의 checkCount 가 변경되었을 때 수행하는 헨들러
         * @private
         */
        _onCheckCountChange: function() {
            if (this.grid.option('selectType') === 'checkbox') {
                clearTimeout(this.timeoutForAllChecked);
                this.timeoutForAllChecked = setTimeout($.proxy(this._syncCheckstate, this), 10);
            }
        },
        /**
         * header 영역의 input 상태를 실제 checked 된 count 에 맞추어 반영한다.
         * @private
         */
        _syncCheckstate: function() {
            if (this.grid.option('selectType') === 'checkbox') {
                var $input = this.$el.find('th[columnname="_button"] input');
                if ($input.length) {
                    $input.prop('checked', this.grid.dataModel.length === this.grid.getCheckedRowList().length);
                }
            }
        },
        _onColumnWidthChanged: function() {
            var columnData = this._getColumnData(),
                columnWidthList = columnData.widthList,
                $colList = this.$el.find('col');

            for (var i = 0; i < $colList.length; i++) {
                $colList.eq(i).css('width', columnWidthList[i] + 'px');
            }
        },
        _onScrollLeftChange: function(model, value) {
            if (this.whichSide === 'R') {
                this.el.scrollLeft = value;
            }
        },
        _onClick: function(clickEvent) {
            var $target = $(clickEvent.target),
                isChecked;

            if ($target.closest('th').attr('columnname') === '_button' && $target.is('input')) {
                isChecked = $target.prop('checked');
                isChecked ? this.grid.checkAll() : this.grid.uncheckAll();
            }
        },
        template: _.template('' +
                '    <table width="100%" border="0" cellspacing="1" cellpadding="0" bgcolor="#EFEFEF">' +
                '        <colgroup><%=colGroup%></colgroup>' +
                '        <tbody><%=tBody%></tbody>' +
                '    </table>'),
        render: function() {
            this.destroyChildren();
            var resizeHandler = this.createView(View.Layout.Header.ResizeHandler, {
                whichSide: this.whichSide,
                grid: this.grid
            });
            this.$el.css({
                height: this.grid.dimensionModel.get('headerHeight')
            }).html(this.template({
                'colGroup' : this._getColGroupMarkup(),
                'tBody' : this._getTableBodyMarkup()
            }));


            this.$el.append(resizeHandler.render().el);
            return this;
        },

        _getColumnData: function() {
            var columnModel = this.grid.columnModel,
                dimensionModel = this.grid.dimensionModel,
                columnWidthList = dimensionModel.getColumnWidthList(this.whichSide),
                columnModelList = columnModel.getVisibleColumnModelList(this.whichSide);
            return {
                widthList: columnWidthList,
                modelList: columnModelList
            };
        },
        /**
         * col group 마크업을 생성한다.
         *
         * @return {string}
         * @private
         */
        _getColGroupMarkup: function() {
            var columnData = this._getColumnData(),
                columnWidthList = columnData.widthList,
                columnModelList = columnData.modelList,
                html = '';

            for (var i = 0, len = columnWidthList.length; i < len; i++) {
                html += '<col columnname="' + columnModelList[i]['columnName'] + '" style="width:' + columnWidthList[i] + 'px">';
            }
            return html;
        },
        _getHeaderHeight: function() {
            return this.grid.dimensionModel.get('headerHeight');
        },
        /**
         * Header 의 body markup 을 생성한다.
         *
         * @return {string}
         * @private
         */
        _getTableBodyMarkup: function() {
            var hierarchyList = this._getColumnHierarchyList();
            var maxRowCount = this._getHierarchyMaxRowCount(hierarchyList);
            // 가공한 컬럼 모델 리스트 정보를 바탕으로 컬럼 엘리먼트들에 대한 마크업을 구성한다.
            var columnData = this._getColumnData(),
                headerHeight = this._getHeaderHeight(),
                rowMarkupList = new Array(maxRowCount),
                headerMarkupList = [],
                height, curHeight;

            var columnModel, columnName = '', sRole = '', sHeight = '', colSpan = '', sRowSpan = '';
            var aColumnName = new Array(maxRowCount), colSpanList = [];
            var length, rowSpan = 1, title;
            var rowHeight = Util.getRowHeight(maxRowCount, headerHeight) - 1;

            for (var i = 0; i < hierarchyList.length; i++) {
                length = hierarchyList[i].length;
                curHeight = 0;
                for (var j = 0; j < length; j++) {
                    rowSpan = (length - 1 == j && (maxRowCount - length + 1) > 1) ? (maxRowCount - length + 1) : 1;
                    columnModel = hierarchyList[i][j];

                    height = rowHeight * rowSpan;
                    if (j === length - 1) {
                        height = (headerHeight - curHeight) - 2;
                    }else {
                        curHeight += height + 1;
                    }
                    if (aColumnName[j] == columnModel['columnName']) {
                        rowMarkupList[j].pop();
                        colSpanList[j] += 1;
                    }else {
                        colSpanList[j] = 1;
                    }
                    aColumnName[j] = columnModel['columnName'];
                    columnName = " columnName='" + columnModel['columnName'] + "'";
                    sHeight = " height='" + height + "'";
                    sRowSpan = rowSpan > 1 ? " rowSpan='" + rowSpan + "'" : '';
                    colSpan = (colSpanList[j] > 1) ? " colSpan='" + colSpanList[j] + "'" : '';
                    rowMarkupList[j] = rowMarkupList[j] || [];
                    title = columnModel['title'];
                    rowMarkupList[j].push('<th' + columnName + sRole + sHeight + sRowSpan + colSpan + '>' + title + '</th>');
                }
            }
            for (var i = 0; i < rowMarkupList.length; i++) {
                headerMarkupList.push('<tr>' + rowMarkupList[i].join('') + '</tr>');
            }

            return headerMarkupList.join('');
        },
        /**
         * column merge 가 설정되어 있을 때 헤더의 max row count 를 가져온다.
         *
         * @param hierarchyList
         * @return {number}
         * @private
         */
        _getHierarchyMaxRowCount: function(hierarchyList) {
            var maxRowCount = 1,
                lengthList = [];
            _.each(hierarchyList, function(hierarchy, index) {
                lengthList.push(hierarchy.length);
            }, this);
            return Math.max.apply(Math, lengthList);
        },
        /**
         * column merge 가 설정되어 있을 때 헤더의 계층구조 리스트를 가져온다.
         * @return {Array}
         * @private
         */
        _getColumnHierarchyList: function() {
            var columnModelList = this._getColumnData().modelList;
            var hierarchyList = [];
            _.each(columnModelList, function(model, index) {
                hierarchyList.push(this._getColumnHierarchy(model).reverse());
            }, this);
            return hierarchyList;
        },
        /**
         * column merge 가 설정되어 있을 때 재귀적으로 돌면서 계층구조를 형성한다.
         *
         * @param columnModelData
         * @param resultList
         * @return {*|Array}
         * @private
         */
        _getColumnHierarchy: function(columnModelData, resultList) {
            var columnMerge = this.grid.option('columnMerge'),
                resultList = resultList || [];

            if (columnModelData) {
                resultList.push(columnModelData);
                if (columnMerge) {
                    for (var i = 0; i < columnMerge.length; i++) {
                        if ($.inArray(columnModelData['columnName'], columnMerge[i]['columnNameList']) !== -1) {
                            resultList = this._getColumnHierarchy(columnMerge[i], resultList);
                        }
                    }
                }
            }
            return resultList;
        }
    });
    View.Layout.Header.ResizeHandler = View.Base.extend({
        tagName: 'div',
        className: 'resize_handle_container',
        viewList: [],
        whichSide: 'R',
        events: {
            'mousedown .resize_handle' : '_onMouseDown'
        },
        initialize: function(attributes, option) {
            View.Base.prototype.initialize.apply(this, arguments);
            this.setOwnProperties({
                whichSide: attributes.whichSide,
                isResizing: false,     //현재 resize 발생 상황인지
                $target: null,         //이벤트가 발생한 target resize handler
                differenceLeft: 0,
                initialWidth: 0,
                initialOffsetLeft: 0,
                initialLeft: 0
            });
            this.listenTo(this.grid.dimensionModel, 'columnWidthChanged', this._refreshHandlerPosition, this);
        },
        _getColumnData: function() {
            var columnModel = this.grid.columnModel,
                dimensionModel = this.grid.dimensionModel,
                columnWidthList = dimensionModel.getColumnWidthList(this.whichSide),
                columnModelList = columnModel.getVisibleColumnModelList(this.whichSide);
            return {
                widthList: columnWidthList,
                modelList: columnModelList
            };
        },
        _getResizeHandler: function() {
            var columnData = this._getColumnData(),
                columnModelList = columnData.modelList,
                resizeHandleMarkupList = [],
                headerHeight = this.grid.dimensionModel.get('headerHeight');

            for (var i = 0; i < columnModelList.length; i++) {
                resizeHandleMarkupList.push("<div columnIndex='" + i + "'" +
                    " columnName='" + columnModelList[i]['columnName'] +
                    "' class='resize_handle" +
                    (i + 1 == columnModelList.length ? ' resize_handle_last' : '') +
                    "' style='height:" + headerHeight + 'px;' +
//                    "background:red;opacity:1" +
                    "'" +
                    " title='마우스 드래그를 통해 컬럼의 넓이를 변경할 수 있고,\n더블클릭을 통해 넓이를 초기화할 수 있습니다.'></div>");
            }
            return resizeHandleMarkupList.join('');

        },
        render: function() {
            var headerHeight = this.grid.dimensionModel.get('headerHeight');
            this.$el.empty();
            this.$el
                .show()
                .css({
                    'marginTop' : -headerHeight + 'px',
                    'height' : headerHeight + 'px'
                })
                .html(this._getResizeHandler());
            this._refreshHandlerPosition();
            return this;
        },
        _refreshHandlerPosition: function() {
            var columnData = this._getColumnData(),
                columnWidthList = columnData.widthList,
                $resizeHandleList = this.$el.find('.resize_handle'),
                curPos = 0;

            for (var i = 0, len = $resizeHandleList.length; i < len; i++) {
                curPos += columnWidthList[i] + 1;
                $resizeHandleList.eq(i).css('left', (curPos - 3) + 'px');
            }

        },

        _isResizing: function() {
            return !!this.isResizing;
        },
        _onMouseDown: function(mouseDownEvent) {
            this._startResizing(mouseDownEvent);
        },
        _onMouseUp: function(mouseUpEvent) {
            this._stopResizing();
            this.isResizing = false;
        },
        _onMouseMove: function(mouseMoveEvent) {
            if (this._isResizing()) {
                mouseMoveEvent.preventDefault();

                var left = mouseMoveEvent.pageX - this.initialOffsetLeft;

                this.$target.css('left', left + 'px');

                var width = this._calculateWidth(mouseMoveEvent.pageX);
                var index = parseInt(this.$target.attr('columnindex'), 10);
                this.grid.dimensionModel.setColumnWidth(this._getColumnIndex(index), width);

            }
        },
        _calculateWidth: function(pageX) {
            var difference = pageX - this.initialOffsetLeft - this.initialLeft;
            return this.initialWidth + difference;
        },
        _getColumnIndex: function(index) {
            return this.whichSide === 'R' ? index + this.grid.columnModel.get('columnFixIndex') : index;
        },
        /**
         * resize start 세팅
         * @param mouseDownEvent
         * @private
         */
        _startResizing: function(mouseDownEvent) {
            var columnData = this._getColumnData(),
                columnWidthList = columnData.widthList,
                $target = $(mouseDownEvent.target);


            this.isResizing = true;
            this.$target = $target;
            this.initialLeft = parseInt($target.css('left').replace('px', ''), 10);
            this.initialOffsetLeft = this.$el.offset().left;
            this.initialWidth = columnWidthList[$target.attr('columnindex')];
            this.grid.$el
                .bind('mousemove', $.proxy(this._onMouseMove, this))
                .bind('mouseup', $.proxy(this._onMouseUp, this))
                .css('cursor', 'col-resize');

        },
        /**
         * resize stop 세팅
         * @private
         */
        _stopResizing: function() {
            this.isResizing = false;
            this.$target = null;
            this.initialLeft = 0;
            this.initialOffsetLeft = 0;
            this.initialWidth = 0;
            this.grid.$el
                .unbind('mousemove', $.proxy(this._onMouseMove, this))
                .unbind('mouseup', $.proxy(this._onMouseUp, this))
                .css('cursor', 'default');
        }
    });

    /**
     *  툴바 영역
     *  @class
     */
    View.Layout.Toolbar = View.Base.extend({
        tagName: 'div',
        className: 'toolbar',
        initialize: function() {
            View.Base.prototype.initialize.apply(this, arguments);
            this.setOwnProperties({
                controlPanel: null,
                resizeHandler: null,
                pagination: null
            });
        },
        render: function() {
            this.destroyChildren();
            var option = this.grid.option('toolbar'),
                resizeHandler, controlPanel, pagination;

            this.$el.empty();
            if (option && option.hasControlPanel) {
                controlPanel = this.createView(View.Layout.Toolbar.ControlPanel, {
                    grid: this.grid
                });
                this.$el.append(controlPanel.render().el).css('display', 'block');
            }

            if (option && option.hasResizeHandler) {
                resizeHandler = this.createView(View.Layout.Toolbar.ResizeHandler, {
                    grid: this.grid
                });
                this.$el.append(resizeHandler.render().el).css('display', 'block');
            }

            if (option && option.hasPagination) {
                pagination = this.createView(View.Layout.Toolbar.Pagination, {
                    grid: this.grid
                });
                this.$el.append(pagination.render().el).css('display', 'block');
            }
            this.setOwnProperties({
                controlPanel: controlPanel,
                resizeHandler: resizeHandler,
                pagination: pagination
            });
            return this;
        }
    });
    /**
     * Pagination 영역
     * @class
     */
    View.Layout.Toolbar.Pagination = View.Base.extend({
        tagName: 'div',
        className: 'pagination',
        template: _.template('' +
            '<a href="#" class="pre_end">맨앞</a><a href="#" class="pre">이전</a> <a href="#" class="next">다음</a><a href="#" class="next_end">맨뒤</a>'
        ),
        initialize: function() {
            View.Base.prototype.initialize.apply(this, arguments);

        },
        render: function() {
            this.destroyChildren();
            this.$el.empty().html(this.template());
            this._setPaginationInstance();
            return this;
        },
        _setPaginationInstance: function() {
            var PaginationClass = ne && ne.Component && ne.Component.Pagination,
                pagination = null;
            if (!this.instance && PaginationClass) {
                pagination = new PaginationClass({
                    itemCount: 1,
                    itemPerPage: 1
                }, this.$el);
            }
            this.setOwnProperties({
                instance: pagination
            });
        }
    });
    /**
     * 툴바 영역 resize handler
     * @class
     */
    View.Layout.Toolbar.ResizeHandler = View.Base.extend({
        tagName: 'div',
        className: 'height_resize_bar',
        events: {
            'mousedown': '_onMouseDown'
        },
        template: _.template('<a href="#" class="height_resize_handle">높이 조절</a>'),
        initialize: function() {
            View.Base.prototype.initialize.apply(this, arguments);
        },
        /**
         * document 에 mousemove, mouseup 이벤트 핸들러를 추가한다.
         * @private
         */
        _attachMouseEvent: function() {
            $(document).on('mousemove', $.proxy(this._onMouseMove, this));
            $(document).on('mouseup', $.proxy(this._onMouseUp, this));
            $(document).on('selectstart', $.proxy(this._onSelectStart, this));
        },
        /**
         * document 에 mousemove, mouseup 이벤트 핸들러를 추가한다.
         * @private
         */
        _detachMouseEvent: function() {
            $(document).off('mousemove', $.proxy(this._onMouseMove, this));
            $(document).off('mouseup', $.proxy(this._onMouseUp, this));
            $(document).off('selectstart', $.proxy(this._onSelectStart, this));
        },
        /**
         * mousedown 이벤트 핸들러
         * @param {event} mouseDownEvent
         * @private
         */
        _onMouseDown: function(mouseDownEvent) {
            mouseDownEvent.preventDefault();
            $(document.body).css('cursor', 'row-resize');
            this.grid.updateLayoutData();
            this._attachMouseEvent();
        },
        /**
         * mousemove 이벤트 핸들러
         * @param {event} mouseMoveEvent
         * @private
         */
        _onMouseMove: function(mouseMoveEvent) {
            var dimensionModel = this.grid.dimensionModel,
                offsetTop = dimensionModel.get('offsetTop'),
                headerHeight = dimensionModel.get('headerHeight'),
                rowHeight = dimensionModel.get('rowHeight'),
                toolbarHeight = dimensionModel.get('toolbarHeight'),
                bodyHeight = mouseMoveEvent.pageY - offsetTop - headerHeight - toolbarHeight;

            bodyHeight = Math.max(bodyHeight, rowHeight + dimensionModel.getScrollXSize());
            dimensionModel.set({
                bodyHeight: bodyHeight
            });
        },
        /**
         * mouseup 이벤트 핸들러
         * @private
         */
        _onMouseUp: function() {
            $(document.body).css('cursor', 'default');
            this._detachMouseEvent();
        },
        /**
         * selection start 이벤트 핸들러
         * @return {boolean}
         * @private
         */
        _onSelectStart: function(e) {
            e.preventDefault();
            return false;
        },
        render: function() {
            this.destroyChildren();
            this.$el.html(this.template());
            return this;
        }
    });
    /**
     * control panel
     * @class
     */
    View.Layout.Toolbar.ControlPanel = View.Base.extend({
        tagName: 'div',
        className: 'btn_setup',
        template: _.template(
            '<a href="#" class="excel_download_button btn_text excel_all" style="display: inline-block;">' +
                '<span><em class="f_bold p_color5">전체엑셀다운로드</em></span>' +
            '</a>' +
            '<a href="#" class="excel_download_button btn_text excel_grid" style="display: inline-block;">' +
                '<span><em class="excel">엑셀다운로드</em></span>' +
            '</a>' +
            '<a href="#" class="grid_configurator_button btn_text" style="display: none;">' +
                '<span><em class="grid">그리드설정</em></span>' +
            '</a>'),
        initialize: function() {
            View.Base.prototype.initialize.apply(this, arguments);
        },
        render: function() {
            this.destroyChildren();
            this.$el.html(this.template());
            return this;
        }
    });


    /**
     * Row Renderer
     * 성능 향상을 위해 Row Rendering 을 위한 클래스 생성
     */
    View.Renderer.Row = View.Base.Renderer.extend({
        eventHandler: {
            'click' : '_onClick',
            'mousedown' : '_onMouseDown'
        },
        /**
         * TR 마크업 생성시 사용할 템플릿
         */
        baseTemplate: _.template('' +
            '<tr ' +
            'key="<%=key%>" ' +
            'style="height: <%=height%>px;">' +
            '<%=contents%>' +
            'class="<%=className%>" ' +
            '</tr>'),
        /**
         * 초기화 함수
         * @param {object} attributes
         */
        initialize: function(attributes) {
            View.Base.Renderer.prototype.initialize.apply(this, arguments);

            var whichSide = (attributes && attributes.whichSide) || 'R';

            this.setOwnProperties({
                $parent: attributes.$parent,        //부모 element
                collection: attributes.collection,    //change 를 감지할 collection
                whichSide: whichSide,
                columnModelList: this.grid.columnModel.getVisibleColumnModelList(whichSide),
                cellHandlerList: [],
                _isEventAttached: false
            });

            //listener 등록
            this.collection.forEach(function(row) {
                this.listenTo(row, 'change', this._onModelChange, this);
            }, this);
        },
        destroy: function() {
            this.detachHandler();
            this.destroyChildren();
            this.remove();
        },
        /**
         * attachHandler
         * event handler 를 전체 tr에 한번에 붙인다.
         */
        attachHandler: function() {
            this._attachHandler(this.$parent);
            this.grid.cellFactory.attachHandler(this.$parent);
            this._isEventAttached = true;
        },
        /**
         * detach eventHandler
         * event handler 를 전체 tr에서 제거한다.
         */
        detachHandler: function() {
            if (this._isEventAttached) {
                this._detachHandler(this.$parent);
                this.grid.cellFactory.detachHandler(this.$parent);
            }
        },
        _onClick: function(clickEvent) {
            console.log('click', clickEvent);
        },
        /**
         * mousedown 이벤트 핸들러
         * @param {event} mouseDownEvent
         * @private
         */
        _onMouseDown: function(mouseDownEvent) {
            var $td = $(mouseDownEvent.target).closest('td'),
                $tr = $(mouseDownEvent.target).closest('tr'),
                columnName = $td.attr('columnName'),
                rowKey = $tr.attr('key');
            this.grid.focus(rowKey, columnName);
            if (this.grid.option('selectType') === 'radio') {
                this.grid.check(rowKey);
            }
        },
        /**
         * model 변경 시
         * @param {object} model
         * @private
         */
        _onModelChange: function(model) {
            var editType, cellInstance, rowState;

            _.each(model.changed, function(cellData, columnName) {
                if (columnName !== '_extraData') {
                    //editable 프로퍼티가 false 라면 normal type 으로 설정한다.
                    editType = this._getEditType(columnName, cellData);
                    cellInstance = this.grid.cellFactory.getInstance(editType);
                    cellInstance.onModelChange(cellData, this._getTrElement(cellData.rowKey));
                } else {
                    rowState = cellData.rowState;
                    if (rowState) {
                        this._setRowState(rowState, this._getTrElement(cellData.rowKey));
                    }
                }
            }, this);
        },
        _setRowState: function(rowState, $tr) {
//            $tr.addClass
        },
        /**
         * tr 엘리먼트를 찾아서 반환한다.
         * @param {string|number} rowKey
         * @return {jquery}
         * @private
         */
        _getTrElement: function(rowKey) {
            return this.$parent.find('tr[key="' + rowKey + '"]');
        },
        /**
         * cellData 의 idEditable 프로퍼티에 따른 editType 을 반환한다.
         * @param {String} columnName
         * @param {Object} cellData
         * @return {String}
         * @private
         */
        _getEditType: function(columnName, cellData) {
            var editType = this.grid.columnModel.getEditType(columnName);
            if (!cellData.isEditable && columnName !== '_number') {
                editType = 'normal';
            }
            return editType;
        },
        /**
         * html 마크업을 반환
         * @param {object} model
         * @return {string} html html 스트링
         */
        getHtml: function(model) {
            var columnModelList = this.columnModelList,
                columnModel = this.grid.columnModel,
                cellFactory = this.grid.cellFactory,
                columnName, cellData, editType, cellInstance,
                html = '';
            this.cellHandlerList = [];
            for (var i = 0, len = columnModelList.length; i < len; i++) {
                columnName = columnModelList[i]['columnName'];
                cellData = model.get(columnName);
                if (cellData && cellData['isMainRow']) {
                    editType = this._getEditType(columnName, cellData);
                    cellInstance = cellFactory.getInstance(editType);
                    html += cellInstance.getHtml(cellData);
                    this.cellHandlerList.push({
                        selector: 'td[columnName="' + columnName + '"]',
                        cellInstance: cellInstance
                    });
                }
            }
            return this.baseTemplate({
                key: model.get('rowKey'),
                height: this.grid.dimensionModel.get('rowHeight'),
                contents: html,
                className: ''
            });
        }
    });

    /**
     * Cell Renderer Base
     * @extends {View.Base.Renderer}
     * @constructor
     */
    View.Base.Renderer.Cell = View.Base.Renderer.extend({
        /**
         * model 의 변화가 발생했을 때, td 를 다시 rendering 해야하는 대상 프로퍼티 목록. 필요에 따라 확장 시 재정의 한다.
         */
        rerenderAttributes: ['isEditable', 'optionList', 'value'],

        /**
         * keyDownEvent 발생시 기본 동작 switch
         */
        _defaultKeyDownSwitch: {
            'ESC': function(keyDownEvent, param) {
                this.focusOut(param.$target);
            },
            'ENTER': function(keyDownEvent, param) {
                this.focusOut(param.$target);
            },
            'TAB': function(keyDownEvent, param) {
                this.grid.focusClipboard();
                if (keyDownEvent.shiftKey) {
                    //이전 cell 로 focus 이동 후 편집모드로 전환
                    this.grid.focusIn(param.rowKey, param.focusModel.prevColumnName(), true);
                } else {
                    //이후 cell 로 focus 이동 후 편집모드로 전환
                    this.grid.focusIn(param.rowKey, param.focusModel.nextColumnName(), true);
                }
            },
            _default: function(keyDownEvent, param) {
            }
        },
        /**
         * event handler
         */
        eventHandler: {},
        initialize: function(attributes, options) {
            View.Base.Renderer.prototype.initialize.apply(this, arguments);
            this._initializeEventHandler();
            this.setOwnProperties({
                _keyDownSwitch: $.extend({}, this._defaultKeyDownSwitch)
            });
        },

        baseTemplate: _.template('<td ' +
            ' columnName="<%=columnName%>"' +
            ' <%=rowSpan%>' +
            ' class="<%=className%>"' +
            ' <%=attributes%>' +
            ' data-edit-type="<%=editType%>"' +
            '>' +
            '<%=content%>' +
            '</td>'),

        /**
         * focus in 상태에서 키보드 esc 를 입력했을 때 편집모드를 벗어난다. cell 내 input 을 blur 시키고, 편집모드를 벗어나는 로직.
         * 필요에 따라 override 한다.
         * @param {jQuery} $td
         */
        focusOut: function($td) {
            this.grid.focusClipboard();
        },
        /**
         * RowRenderer 에서 Render model 변경 감지 시 RowRenderer 에서 호출하는 onChange 핸들러
         * @param {object} cellData
         * @param {jQuery} $tr
         */
        onModelChange: function(cellData, $tr) {
            var rowKey = $tr.attr('key'),
                $td = this.grid.getElement(rowKey, cellData.columnName),
                isRerender = false,
                isValueChanged = $.inArray('value', cellData.changed) !== -1,
                hasFocusedElement;

            this._setFocusedClass(cellData, $td);

            for (var i = 0; i < this.rerenderAttributes.length; i++) {
                if ($.inArray(this.rerenderAttributes[i], cellData.changed) !== -1) {
                    isRerender = true;
                    break;
                }
            }

            $td.attr('class', this._getClassNameList(cellData).join(' '));

            hasFocusedElement = !!($td.find(':focus').length);

            if (isRerender === true) {
                this.render(cellData, $td, hasFocusedElement);
                if (hasFocusedElement) {
                    this.focusIn($td);
                }
            } else {
                this.setElementAttribute(cellData, $td, hasFocusedElement);
            }
        },
        /**
         * eventHandler 를 attach 한다.
         * @param {jQuery} $target
         */
        attachHandler: function($target) {
            this._attachHandler($target);
        },
        /**
         * eventHandler 를 detach 한다.
         * @param $target
         */
        detachHandler: function($target) {
            this._detachHandler($target);
        },
        /**
         * 실제 rendering 한다.
         * @param {object} cellData
         * @param {jQuery} $td
         * @param {Boolean} hasFocusedElement
         */
        render: function(cellData, $td, hasFocusedElement) {
            this._detachHandler($td);
            $td.data('edit-type', this.getEditType()).html(this.getContentHtml(cellData, $td, hasFocusedElement));
            this._attachHandler($td);
        },


        _getKeyDownSwitchVariables: function(keyDownEvent) {
            var grid = this.grid,
                keyCode = keyDownEvent.keyCode || keyDownEvent.which,
                focused = grid.focusModel.which(),
                rowKey = focused.rowKey,
                columnName = focused.columnName;
            return {
                keyDownEvent: keyDownEvent,
                $target: $(keyDownEvent.target),
                focusModel: grid.focusModel,
                rowKey: rowKey,
                columnName: columnName,
                keyName: grid.keyName[keyCode]
            };
        },
        _setKeyDownSwitch: function(keyName, fn) {
            if (typeof keyName === 'object') {
                this._keyDownSwitch = $.extend(this._keyDownSwitch, keyName);
            } else {
                this._keyDownSwitch[keyName] = fn;
            }
        },
        _executeKeyDownSwitch: function(keyDownEvent) {
            var keyCode = keyDownEvent.keyCode || keyDownEvent.which,
                keyName = this.grid.keyName[keyCode];
            (this._keyDownSwitch[keyName] || this._keyDownSwitch['_default']).call(this, keyDownEvent, this._getKeyDownSwitchVariables(keyDownEvent));
            return !!this._keyDownSwitch[keyName];
        },
        /**
         *
         * @param {event} keyDownEvent
         * @private
         */
        _onKeyDown: function(keyDownEvent) {
            //todo: cell 종류에 따라 해당 input 에 keydown event handler 를 추가하여 구현한다.
            if (this._executeKeyDownSwitch(keyDownEvent)) {
                keyDownEvent.preventDefault();
            }
        },
        /**
         * td에 selected 와 focused css 클래스를 할당한다.
         * @param {object} cellData
         * @param {jQuery} $target
         * @private
         */
        _setFocusedClass: function(cellData, $target) {
            (cellData.selected === true) ? $target.addClass('selected') : $target.removeClass('selected');
            (cellData.focused === true) ? $target.addClass('focused') : $target.removeClass('focused');
        },

        /**
         * cellData 정보에서 className 을 추출한다.
         * @param {Object} cellData
         * @return {Array}
         * @private
         */
        _getClassNameList: function(cellData) {
            var classNameList = [],
                classNameMap = {},
                columnName = cellData.columnName,
                privateColumnList = ['_button', '_number'],
                isPrivateColumnName = $.inArray(columnName, privateColumnList) !== -1,
                i, len;

            cellData.className ? classNameList.push(cellData.className) : null;
            cellData.selected ? classNameList.push('selected') : null;
            cellData.focused ? classNameList.push('focused') : null;
            cellData.isEditable && !isPrivateColumnName ? classNameList.push('editable') : null;
            cellData.isDisabled && !isPrivateColumnName ? classNameList.push('disabled') : null;

            len = classNameList.length;
            //중복제거
            for (i = 0; i < len; i++) {
                classNameMap[classNameList[i]] = true;
            }
            classNameList = [];
            _.each(classNameMap, function(val, className) {
                classNameList.push(className);
            }, this);
            return classNameList;
        },
        /**
         * RowRenderer 에서 한번에 table 을 랜더링 할 때 사용하기 위해
         * td 단위의 html 문자열을 반환한다.
         * @param {object} cellData
         * @return {string}
         */
        getHtml: function(cellData) {
            return this.baseTemplate({
                columnName: cellData.columnName,
                rowSpan: cellData.rowSpan ? 'rowSpan="' + cellData.rowSpan + '"' : '',
                className: this._getClassNameList(cellData).join(' '),
                attributes: this.getAttributes(cellData),
                editType: this.getEditType(),
                content: this.getContentHtml(cellData)
            });
        },
        getAttributesString: function(attributes) {
            var str = '';
            _.each(attributes, function(value, key) {
                str += ' ' + key + '="' + value + '"';
            }, this);
            return str;
        },
        getEventHandler: function() {
            return this._eventHandler;
        },

        /**
         * implement this.
         * @private
         */
        getAttributes: function(cellData) {
            return '';
        },
        _getColumnName: function($target) {
            return $target.closest('td').attr('columnName');
        },
        _getRowKey: function($target) {
            return $target.closest('tr').attr('key');
        },
        _getCellData: function($target) {
            return this.grid.renderModel.getCellData(this._getRowKey($target), this._getColumnName($target));
        },
        _getCellAddress: function($target) {
            return {
                rowKey: this._getRowKey($target),
                columnName: this._getColumnName($target)
            };
        }
    });


    /**
     * Cell Renderer 추가 시 반드시 필요한 Interface 정의
     * @interface
     */
    View.Base.Renderer.Cell.Interface = function() {};
    /**
     * 자기 자신의 인스턴스의 editType 을 반환한다.
     * @return {String} editType 'normal|button|select|button|text|text-convertible'
     */
    View.Base.Renderer.Cell.Interface.prototype.getEditType = function() {};
    /**
     * cell 에서 키보드 enter 를 입력했을 때 편집모드로 전환. cell 내 input 에 focus 를 수행하는 로직. 필요에 따라 override 한다.
     * @param $td
     */
    View.Base.Renderer.Cell.Interface.prototype.focusIn = function($td) {};
    /**
     * focus in 상태에서 키보드 esc 를 입력했을 때 편집모드를 벗어난다. cell 내 input 을 blur 시키고, 편집모드를 벗어나는 로직. 필요에 따라 override 한다.
     * @param {jQuery} $td
     */
//    View.Base.Renderer.Cell.Interface.prototype.focusOut = function($td) {};
    /**
     * Cell data 를 인자로 받아 <td> 안에 들아갈 html string 을 반환한다.
     * re renderAttributes 에 해당하는 프로퍼티가 변경되었을 때 수행될 로직을 구현한다.
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
    View.Base.Renderer.Cell.Interface.prototype.getContentHtml = function(cellData, $td, hasFocusedElement) {};
    /**
     * model의 re renderAttributes 에 해당하지 않는 프로퍼티의 변화가 발생했을 때 수행할 메서드
     * re renderAttributes 에 해당하지 않는 프로퍼티가 변경되었을 때 수행할 로직을 구현한다.
     * @param {object} cellData
     * @param {jquery} $td
     * @param {Boolean} hasFocusedElement
     */
    View.Base.Renderer.Cell.Interface.prototype.setElementAttribute = function(cellData, $td, hasFocusedElement) {};


    /**
     * editOption 에 list 를 가지고 있는 형태의 추상 클래스
     * @implements {View.Base.Renderer.Cell.Interface}
     * @class
     */
    View.Renderer.Cell.List = View.Base.Renderer.Cell.extend({
        rerenderAttributes: ['isEditable', 'optionList'],
        eventHandler: {
        },
        initialize: function() {
            View.Base.Renderer.Cell.prototype.initialize.apply(this, arguments);
        },
        focusIn: function($td) {},
        getEditType: function() {},
        getContentHtml: function(cellData) {
            throw this.error('Implement getContentHtml(cellData, $target) method. On re-rendering');
        },
        setElementAttribute: function(cellData, $target) {
            throw this.error('Implement setElementAttribute(cellData, $target) method. ');
        },
        _getOptionList: function(cellData) {
            var columnModel = this.grid.columnModel.getColumnModel(cellData.columnName);
            return cellData.optionList && cellData.optionList.length ? cellData.optionList : columnModel.editOption.list;
        },
        _onBlur: function(blurEvent) {
            var $target = $(blurEvent.target);
            $target.closest('td').data('isFocused', false);
        },
        _onFocus: function(focusEvent) {
            var $target = $(focusEvent.target);
            $target.closest('td').data('isFocused', true);
        }
    });

    /**
     * select type 의 Cell renderer
     *
     * @extends {View.Renderer.Cell.List}
     * @class
     */
    View.Renderer.Cell.List.Select = View.Renderer.Cell.List.extend({
        initialize: function(attributes) {
            View.Renderer.Cell.List.prototype.initialize.apply(this, arguments);

            this._setKeyDownSwitch({
                'ESC': function(keyDownEvent, param) {
                    this.focusOut(param.$target);
                },
                'ENTER': function(keyDownEvent, param) {
                    this.focusOut(param.$target);
                }
            });
        },
        eventHandler: {
            'change select' : '_onChange',
            'keydown select' : '_onKeyDown',
            'blur select' : '_onBlur',
            'focus select' : '_onFocus'
        },

        focusIn: function($td) {
            //todo: cell 에서 키보드 enter 를 입력했을 때 cell 내 input 에 focus 를 수행하는 로직을 구현한다.
            $td.find('select').focus();
        },
        getEditType: function() {
            return 'select';
        },
        getContentHtml: function(cellData, $td, hasFocusedElement) {
//            console.log('!!!!getContentHtml', cellData.optionList);
            var list = this._getOptionList(cellData),
                html = '',
                isDisabled = cellData.isDisabled,
                len = list.length;

            html += '<select name="' + Util.getUniqueKey() + '"';
            html += isDisabled ? ' disabled ' : '';
            html += '>';

            for (var i = 0; i < len; i++) {
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
        setElementAttribute: function(cellData, $td, hasFocusedElement) {
//            console.log('!!!!setElementAttribute', cellData.optionList);
            var $select = $td.find('select');
            hasFocusedElement ? $select.blur() : null;
            $select.val(cellData.value);
            hasFocusedElement ? $select.focus() : null;

        },
        _onChange: function(changeEvent) {
            var $target = $(changeEvent.target),
                cellAddr = this._getCellAddress($target),
                grid = this.grid;
            grid.setValue(cellAddr.rowKey, cellAddr.columnName, $target.val());
        }
    });


    /**
     * checkbox, radio button type 의 Cell renderer
     *
     * @extends {View.Renderer.Cell.List}
     * @class
     */
    View.Renderer.Cell.List.Button = View.Renderer.Cell.List.extend({
        initialize: function(attributes) {
            View.Renderer.Cell.List.prototype.initialize.apply(this, arguments);
            this._setKeyDownSwitch({
                'UP_ARROW': function() {},
                'DOWN_ARROW': function() {},
                'PAGE_UP': function() {},
                'PAGE_DOWN': function() {},
                'ENTER': function(keyDownEvent, param) {
                    param.$target.trigger('click');
                },
                'LEFT_ARROW': function(keyDownEvent, param) {
                    this._focusPrevInput(param.$target);
                },
                'RIGHT_ARROW': function(keyDownEvent, param) {
                    this._focusNextInput(param.$target);
                },
                'ESC': function(keyDownEvent, param) {
                    this.focusOut(param.$target);
                },
                'TAB': function(keyDownEvent, param) {
                    if (keyDownEvent.shiftKey) {
                        //이전 cell 로 focus 이동
                        if (!this._focusPrevInput(param.$target)) {
                            this.grid.focusIn(param.rowKey, param.focusModel.prevColumnName(), true);
                        }
                    } else {
                        //이후 cell 로 focus 이동
                        if (!this._focusNextInput(param.$target)) {
                            this.grid.focusIn(param.rowKey, param.focusModel.nextColumnName(), true);
                        }
                    }
                }
            });
        },
        eventHandler: {
            'change input' : '_onChange',
            'keydown input' : '_onKeyDown'
        },
        template: {
            input: _.template('<input type="<%=type%>" name="<%=name%>" id="<%=id%>" value="<%=value%>" <%=checked%> <%=disabled%> />'),
            label: _.template('<label for="<%=id%>" style="margin-right:10px"><%=text%></label>')
        },
        getEditType: function() {
            return 'button';
        },
        focusIn: function($td) {
            //todo: cell 에서 키보드 enter 를 입력했을 때 cell 내 input 에 focus 를 수행하는 로직을 구현한다.
            $td.find('input').eq(0).focus();
        },
        _focusNextInput: function($currentInput) {
            var $next = $currentInput;
            do {
                $next = $next.next();
            } while ($next.length && !$next.is('input'));
            if ($next.length) {
                $next.focus();
                return true;
            } else {
                return false;
            }
        },
        _focusPrevInput: function($currentInput) {
            var $prev = $currentInput;
            do {
                $prev = $prev.prev();
            } while ($prev.length && !$prev.is('input'));
            if ($prev.length) {
                $prev.focus();
                return true;
            } else {
                return false;
            }
        },

        getContentHtml: function(cellData) {
            var list = this._getOptionList(cellData),
                len = list.length,
                columnModel = this.grid.columnModel.getColumnModel(cellData.columnName),
                value = cellData.value,
                checkedList = ('' + value).split(','),
                html = '',
                name = Util.getUniqueKey(),
                isDisabled = cellData.isDisabled,
                id;

            for (var i = 0; i < len; i++) {
                id = name + '_' + list[i].value;
                html += this.template.input({
                    type: columnModel.editOption.type,
                    name: name,
                    id: id,
                    value: list[i].value,
                    checked: $.inArray('' + list[i].value, checkedList) === -1 ? '' : 'checked',
                    disabled: isDisabled ? 'disabled' : ''
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

        setElementAttribute: function(cellData, $td) {
            //TODO
            var value = cellData.value,
                checkedList = ('' + value).split(','),
                len = checkedList.length,
                i;
            $td.find('input:checked').prop('checked', false);
            for (i = 0; i < len; i++) {
                $td.find('input[value="' + checkedList[i] + '"]').prop('checked', true);
            }
        },
        _getCheckedList: function($target) {
            var $checkedList = $target.closest('td').find('input:checked'),
                checkedList = [];

            for (var i = 0; i < $checkedList.length; i++) {
                checkedList.push($checkedList.eq(i).val());
            }

            return checkedList;
        },
        _onChange: function(changeEvent) {
            var $target = $(changeEvent.target),
                cellAddr = this._getCellAddress($target);
            this.grid.setValue(cellAddr.rowKey, cellAddr.columnName, this._getCheckedList($target).join(','));
        }

    });

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

    /**
     * text-textbox 변환 가능한 cell renderer
     * @extends {View.Base.Renderer.Cell}
     * @implements {View.Base.Renderer.Cell.Interface}
     * @class
     */
    View.Renderer.Cell.Text = View.Base.Renderer.Cell.extend({
        rerenderAttributes: ['isEditable'],
        eventHandler: {
            'blur input' : '_onBlur',
            'keydown input': '_onKeyDown',
            'focus input': '_onFocus'
        },
        initialize: function(attributes, options) {
            View.Base.Renderer.Cell.prototype.initialize.apply(this, arguments);
            this.setOwnProperties({
                originalText: ''
            });

            this._setKeyDownSwitch({
                'UP_ARROW': function() {},
                'DOWN_ARROW': function() {},
                'PAGE_UP': function() {},
                'PAGE_DOWN': function() {},
                'ENTER': function(keyDownEvent, param) {
                    this.focusOut(param.$target);
                },
                'ESC': function(keyDownEvent, param) {
                    this._restore(param.$target);
                    this.focusOut(param.$target);
                }
            });
        },
        template: _.template('<input type="text" value="<%=value%>" name="<%=name%>" <%=disabled%>/>'),
        getEditType: function() {
            return 'text';
        },
        _onFocus: function(focusEvent) {
            var $input = $(focusEvent.target);
            this.originalText = $input.val();
            this.grid.selection.disable();
        },
        focusIn: function($td) {
            var $input = $td.find('input');
            Util.setCursorToEnd($input.get(0));
            $input.focus().select();

        },
        focusOut: function() {
            this.grid.focusClipboard();
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
            var isValueChanged = $.inArray('value', cellData.changed) !== -1,
                $input = $target.find('input');

            isValueChanged ? $input.val(cellData.value) : null;
            $input.prop('disabled', cellData.isDisabled);
        },
        /**
         * 원래 text 와 비교하여 값이 변경 되었는지 여부를 판단한다.
         * @param {jQuery} $input
         * @return {Boolean}
         * @private
         */
        _isEdited: function($input) {
            return $input.val() !== this.originalText;
        },
        /**
         * 원래 text로 값을 되돌린다.
         * @param {jQuery} $input
         * @private
         */
        _restore: function($input) {
            $input.val(this.originalText);
        },
        /**
         * blur event handler
         * @param {event} blurEvent
         * @private
         */
        _onBlur: function(blurEvent) {
            console.log('!!!!!!!!!!!!!!!!!!!!!!!!!blur');
            var $target = $(blurEvent.target),
                rowKey = this._getRowKey($target),
                columnName = this._getColumnName($target);
            if (this._isEdited($target)) {
                this.grid.setValue(rowKey, columnName, $target.val());
            }
            this.grid.selection.enable();
        }
    });


    /**
     * text-textbox 변환 가능한 cell renderer
     * @extends {View.Base.Renderer.Cell.Text}
     * @implements {View.Base.Renderer.Cell.Interface}
     * @class
     */
    View.Renderer.Cell.Text.Convertible = View.Renderer.Cell.Text.extend({
        rerenderAttributes: ['isEditable', 'value'],
        eventHandler: {
            'click': '_onClick',
            'blur input' : '_onBlurConvertible',
            'keydown input': '_onKeyDown',
            'focus input': '_onFocus'
        },
        initialize: function(attributes, options) {
            View.Renderer.Cell.Text.prototype.initialize.apply(this, arguments);
            this.setOwnProperties({
                timeoutIdForClick: 0
            });
        },
        getEditType: function() {
            return 'text-convertible';
        },
        focusIn: function($td) {
            this._startEdit($td);
        },
        focusOut: function($td) {
            this._endEdit($td);
            this.grid.focusClipboard();
        },
        getContentHtml: function(cellData) {
            var value = this.grid.dataModel.get(cellData.rowKey).getTagFiltered(cellData.columnName),
                $td = this.grid.getElement(cellData.rowKey, cellData.columnName),
                isEdit = !!($td.length && $td.data('isEdit'));

            if (!isEdit) {
                return value;
            } else {
                return this.template({
                    value: value,
                    disabled: cellData.isDisabled ? 'disabled' : '',
                    name: Util.getUniqueKey()
                });
            }
        },
        setElementAttribute: function() {},
        /**
         * blur event handler
         * @param {event} blurEvent
         * @private
         */
        _onBlurConvertible: function(blurEvent) {
            var $target = $(blurEvent.target),
                $td = $target.closest('td');
            this._onBlur(blurEvent);
            this._endEdit($td);
        },
        /**
         * text를 textbox 로 교체한다.
         * @param {Element} $td
         * @private
         */
        _startEdit: function($td) {
            var isEdit = $td.data('isEdit'),
                $input;
            if (!isEdit && this.grid.isEditable(this._getRowKey($td), this._getColumnName($td))) {
                $td.data('isEdit', true);
                this.render(this._getCellData($td), $td);
                $input = $td.find('input');
                this.originalText = $input.val();
                Util.setCursorToEnd($input.get(0));
                $input.focus().select();

            }
        },
        /**
         * textbox를  text로 교체한다.
         * @param {Element} $td
         * @private
         */
        _endEdit: function($td) {
            var isEdit = $td.data('isEdit');
            if (isEdit) {
                $td.data('isEdit', false);
                this.render(this._getCellData($td), $td);
            }
        },
        /**
         * click Event handler
         * @param {event} clickEvent
         * @private
         */
        _onClick: function(clickEvent) {
            var $target = $(clickEvent.target),
                $td = $target.closest('td'),
                isClicked = $td.data('clicked');

            if (isClicked) {
                this._startEdit($td);
            } else {
                $td.data('clicked', true);
                clearTimeout(this.timeoutIdForClick);
                this.timeoutIdForClick = setTimeout(function() {
                    $td.data('clicked', false);
                }, 400);
            }
        }
    });


    /**
     * Cell Factory
     */
    View.CellFactory = View.Base.extend({
        initialize: function(attributes, options) {
            View.Base.prototype.initialize.apply(this, arguments);
            var args = {
                grid: this.grid
            };
            this._initializeInstances();
        },
        _initializeInstances: function() {
            var instances = {},
                args = {
                    grid: this.grid
                },
                instanceList = [
                    new View.Renderer.Cell.MainButton(args),
                    new View.Renderer.Cell.Normal.Number(args),
                    new View.Renderer.Cell.Normal(args),
                    new View.Renderer.Cell.Text(args),
                    new View.Renderer.Cell.List.Button(args),
                    new View.Renderer.Cell.List.Select(args),
                    new View.Renderer.Cell.Text.Convertible(args)
                ];

            _.each(instanceList, function(instance, name) {
                instances[instance.getEditType()] = instance;
            }, this);

            this.setOwnProperties({
                instances: instances
            });
        },
        getInstance: function(editType) {
            var instance = this.instances[editType];
            if (!instance) {
                if (editType === 'radio' || editType === 'checkbox') {
                    instance = this.instances['button'];
                } else {
                    instance = this.instances['normal'];
                }
            }
            return instance;
        },
        attachHandler: function($parent) {
            var $tdList = $parent.find('td'),
                $td,
                editType;
            for (var i = 0; i < $tdList.length; i++) {
                $td = $tdList.eq(i);
                editType = $td.data('edit-type');
                this.instances[editType].attachHandler($td);
            }
        },
        detachHandler: function($parent) {
            var $tdList = $parent.find('td'),
                $td,
                editType;
            for (var i = 0; i < $tdList.length; i++) {
                $td = $tdList.eq(i);
                editType = $td.data('edit-type');
                this.instances[editType].detachHandler($td);
            }
        }
    });

    /**
     * clipboard view class
     * @class
     */
    View.Clipboard = View.Base.extend({
        tagName: 'textarea',
        className: 'clipboard',
        events: {
            'keydown': '_onKeydown',
            'focus': '_onFocus',
            'blur': '_onBlur'
        },
        /**
         * clipboard focus event handler
         * @private
         */
        _onFocus: function() {
            console.log('clipboard focus');
        },
        /**
         * clipboard blur event handler
         * @private
         */
        _onBlur: function() {
            console.log('clipboard blur');
        },
        initialize: function(attributes, option) {
            View.Base.prototype.initialize.apply(this, arguments);
            this.setOwnProperties({
                timeoutIdForCopy: 0,
                timeoutIdForKeyIn: 0,
                isLocked: false
            });
        },
        render: function() {
//            this.$el.css({
//                'top': 0,
//                'left': 0,
//                'width': '100px',
//                'height': '20px'
//            });
            return this;
        },
        _lock: function() {
            clearTimeout(this.timeoutIdForKeyIn);
            this.isLocked = true;
            this.timeoutIdForKeyIn = setTimeout($.proxy(this._unlock, this), 10);
        },
        _unlock: function() {
            this.isLocked = false;},

        /**
         * keyDown event handler
         * @param {event} keyDownEvent
         * @private
         */
        _onKeydown: function(keyDownEvent) {
            var keyCode = keyDownEvent.keyCode || keyDownEvent.which;
            if (this.isLocked) {
                keyDownEvent.preventDefault();
                return false;
            } else {
                if (keyDownEvent.shiftKey && (keyDownEvent.ctrlKey || keyDownEvent.metaKey)) {
                    this._keyInWithShiftAndCtrl(keyDownEvent);
                } else if (keyDownEvent.shiftKey) {
                    this._keyInWithShift(keyDownEvent);
                } else if (keyDownEvent.ctrlKey || keyDownEvent.metaKey) {
                    this._keyInWithCtrl(keyDownEvent);
                } else {
                    this._keyIn(keyDownEvent);
                }
                this._lock();
            }
        },
        /**
         * ctrl, shift 둘다 눌리지 않은 상태에서의 key down event 핸들러
         * @param {event} keyDownEvent
         * @private
         */
        _keyIn: function(keyDownEvent) {
            var grid = this.grid,
                keyMap = grid.keyMap,
                focusModel = grid.focusModel,
                selection = grid.selection,
                focused = focusModel.which(),
                rowKey = focused.rowKey,
                columnName = focused.columnName,
                displayRowCount = grid.dimensionModel.getDisplayRowCount(),
                isKeyIdentified = true,
                keyCode = keyDownEvent.keyCode || keyDownEvent.which;

            switch (keyCode) {
                case keyMap['UP_ARROW']:
                    grid.focus(focusModel.prevRowKey(), columnName, true);
                    break;
                case keyMap['DOWN_ARROW']:
                    grid.focus(focusModel.nextRowKey(), columnName, true);
                    break;
                case keyMap['LEFT_ARROW']:
                    grid.focus(rowKey, focusModel.prevColumnName(), true);
                    break;
                case keyMap['RIGHT_ARROW']:
                    grid.focus(rowKey, focusModel.nextColumnName(), true);
                    break;
                case keyMap['PAGE_UP']:
                    grid.focus(focusModel.prevRowKey(displayRowCount - 1), columnName, true);
                    break;
                case keyMap['PAGE_DOWN']:
                    grid.focus(focusModel.nextRowKey(displayRowCount - 1), columnName, true);
                    break;
                case keyMap['HOME']:
                    grid.focus(rowKey, focusModel.firstColumnName(), true);
                    break;
                case keyMap['END']:
                    grid.focus(rowKey, focusModel.lastColumnName(), true);
                    break;
                //space 와 enter 는 동일동작
                case keyMap['SPACE']:
                case keyMap['ENTER']:
                    this._onEnterSpace(rowKey, columnName);
                    break;
                case keyMap['DEL']:
                    this._del(rowKey, columnName);
                    break;
                case keyMap['TAB']:
                    grid.focusIn(rowKey, focusModel.nextColumnName(), true);
                    break;
                case keyMap['CHAR_V']:
                    break;
                default:
                    isKeyIdentified = false;
            }
            keyDownEvent.preventDefault();
            selection.endSelection();
            return isKeyIdentified;
        },
        /**
         * enter 또는 space 가 입력되었을 때, 처리하는 로직
         * @param {(number|string)} rowKey
         * @param {string} columnName
         * @private
         */
        _onEnterSpace: function(rowKey, columnName) {
            var cellInstance,
                grid = this.grid,
                editType = this.grid.columnModel.getEditType(columnName);
            if (editType === '_button') {
                cellInstance = this.grid.cellFactory.getInstance(editType);
                cellInstance.toggle(grid.getElement(rowKey, columnName));
            } else {
                grid.focusIn(rowKey, columnName);
            }
        },
        /**
         * shift 가 눌린 상태에서의 key down event handler
         * @param {event} keyDownEvent
         * @private
         */
        _keyInWithShift: function(keyDownEvent) {
            var grid = this.grid,
                keyMap = grid.keyMap,
                focusModel = grid.focusModel,
                columnModelList = grid.columnModel.getVisibleColumnModelList(),
                focusedIndex = grid.focusModel.indexOf(),
                focused = focusModel.which(),
                isKeyIdentified = true,
                displayRowCount = grid.dimensionModel.getDisplayRowCount(),
                keyCode = keyDownEvent.keyCode || keyDownEvent.which;

            switch (keyCode) {
                case keyMap['UP_ARROW']:
                    this._updateSelectionByKeyIn(focusModel.prevRowIndex(), focusedIndex.columnIdx);
                    break;
                case keyMap['DOWN_ARROW']:
                    this._updateSelectionByKeyIn(focusModel.nextRowIndex(), focusedIndex.columnIdx);
                    break;
                case keyMap['LEFT_ARROW']:
                    this._updateSelectionByKeyIn(focusedIndex.rowIdx, focusModel.prevColumnIndex());
                    break;
                case keyMap['RIGHT_ARROW']:
                    this._updateSelectionByKeyIn(focusedIndex.rowIdx, focusModel.nextColumnIndex());
                    break;
                case keyMap['PAGE_UP']:
                    this._updateSelectionByKeyIn(focusModel.prevRowIndex(displayRowCount - 1), focusedIndex.columnIdx);
                    break;
                case keyMap['PAGE_DOWN']:
                    this._updateSelectionByKeyIn(focusModel.nextRowIndex(displayRowCount - 1), focusedIndex.columnIdx);
                    break;
                case keyMap['HOME']:
                    this._updateSelectionByKeyIn(focusedIndex.rowIdx, 0);
                    break;
                case keyMap['END']:
                    this._updateSelectionByKeyIn(focusedIndex.rowIdx, columnModelList.length - 1);
                    break;
                case keyMap['ENTER']:
                    break;
                case keyMap['TAB']:
                    grid.focusIn(focused.rowKey, focusModel.prevColumnName(), true);
                    break;
                case keyMap['CHAR_V']:
                    break;
                default:
                    isKeyIdentified = false;
            }
            keyDownEvent.preventDefault();
            return isKeyIdentified;
        },
        /**
         * ctrl 가 눌린 상태에서의 key down event handler
         * @param {event} keyDownEvent
         * @private
         */
        _keyInWithCtrl: function(keyDownEvent) {
            var grid = this.grid,
                keyMap = grid.keyMap,
                focusModel = grid.focusModel,
                isKeyIdentified = true,
                keyCode = keyDownEvent.keyCode || keyDownEvent.which;

            switch (keyCode) {
                case keyMap['CHAR_A']:
                    this.grid.selection.selectAll();
                    break;
                case keyMap['CHAR_C']:
                    this._copyToClipboard();
                    break;
                case keyMap['HOME']:
                    grid.focus(focusModel.firstRowKey(), focusModel.firstColumnName(), true);
                    break;
                case keyMap['END']:
                    grid.focus(focusModel.lastRowKey(), focusModel.lastColumnName(), true);
                    break;
                case keyMap['CHAR_V']:
                    break;
                default:
                    isKeyIdentified = false;
            }
            return isKeyIdentified;
        },
        /**
         * ctrl, shift 둘다 눌린 상태에서의 key down event handler
         * @param {event} keyDownEvent
         * @private
         */
        _keyInWithShiftAndCtrl: function(keyDownEvent) {
            var grid = this.grid,
                keyMap = grid.keyMap,
                isKeyIdentified = true,
                columnModelList = grid.columnModel.getVisibleColumnModelList(),
                keyCode = keyDownEvent.keyCode || keyDownEvent.which;

            switch (keyCode) {
                case keyMap['HOME']:
                    this._updateSelectionByKeyIn(0, 0);
                    break;
                case keyMap['END']:
                    this._updateSelectionByKeyIn(grid.dataModel.length - 1, columnModelList.length - 1);
                    break;
                default:
                    isKeyIdentified = false;
            }

            keyDownEvent.preventDefault();
            return isKeyIdentified;
        },
        /**
         * text type 의 editOption cell 의 data 를 빈 스트링으로 세팅한다.
         * @private
         */
        _del: function() {
            var grid = this.grid,
                selection = grid.selection,
                dataModel = grid.dataModel,
                focused = grid.focusModel.which(),
                columnModelList = grid.columnModel.getVisibleColumnModelList(),
                rowKey = focused.rowKey,
                columnName = focused.columnName,
                range, i, j;

            if (selection.hasSelection()) {
                //다수의 cell 을 제거 할 때에는 silent 로 데이터를 변환한 후 한번에 랜더링을 refresh 한다.
                range = selection.getRange();
                for (i = range.row[0]; i < range.row[1] + 1; i++) {
                    rowKey = dataModel.at(i).get('rowKey');
                    for (j = range.column[0]; j < range.column[1] + 1; j++) {
                        columnName = columnModelList[j]['columnName'];
                        grid.del(rowKey, columnName, true);
                    }
                }
                grid.renderModel.refresh();
            } else {
                grid.del(rowKey, columnName);
            }
        },



        /**
         * keyIn 으로 selection 영역을 update 한다. focus 로직도 함께 수행한다.
         * @param {Number} rowIndex
         * @param {Number} columnIndex
         * @private
         */
        _updateSelectionByKeyIn: function(rowIndex, columnIndex) {
            var selection = this.grid.selection,
                focused = this.grid.focusModel.indexOf();

            if (!selection.hasSelection()) {
                selection.startSelection(focused.rowIdx, focused.columnIdx);
            }
            selection.updateSelection(rowIndex, columnIndex);
            this.grid.focusAt(rowIndex, columnIndex, true);
        },

        /**
         * clipboard 의 String 을 반환한다.
         * @return {String}
         * @private
         */
        _getClipboardString: function() {
            var text,
                selection = this.grid.selection,
//                focused = this.grid.dataModel.getFocused();
                focused = this.grid.focusModel.which();
            if (selection.isShown()) {
                text = this.grid.selection.getSelectionToString();
            } else {
                text = this.grid.dataModel.get(focused.rowKey).getVisibleText(focused.columnName);
            }
            return text;
        },
        /**
         * 현재 그리드의 data 를 clipboard 에 copy 한다.
         * @private
         */
        _copyToClipboard: function() {
            var text = this._getClipboardString();
            if (window.clipboardData) {
                if (window.clipboardData.setData('Text', text)) {
                    this.$el.select();
                }else {
                    this.$el.val('').select();
                }
            } else {
                this.$el.val(text).select();
            }
            this.timeoutIdForCopy = setTimeout($.proxy(function() {
                this.$el.val('');
            }, this), 0);
        }
    });


    /**
     * Collection 의 변화를 감지하는 클래스
     */
    View.RowList = View.Base.extend({
        initialize: function(attributes) {
            View.Base.prototype.initialize.apply(this, arguments);
            this.setOwnProperties({
                whichSide: (attributes && attributes.whichSide) || 'R',
                timeoutIdForCollection: 0,
                rowRenderer: null
            });
            this._createRowRenderer();
            this.listenTo(this.grid.renderModel, 'rowListChanged', this._onRowListChange, this);
        },

        _createRowRenderer: function() {
            this.rowRenderer = this.createView(View.Renderer.Row, {
                grid: this.grid,
                $parent: this.$el,
                collection: this.collection,
                whichSide: this.whichSide
            });
        },
        _onRowListChange: function() {
            var $scrollTarget = this.grid.renderModel.get('$scrollTarget');
            clearTimeout(this.timeoutIdForCollection);
            if ($scrollTarget && $scrollTarget.hasClass('virtual_scrollbar')) {
                this.timeoutIdForCollection = setTimeout($.proxy(this.render, this), 0);
            } else {
                this.render();
            }
        },
        render: function() {
            var html = '',
                firstRow = this.collection.at(0);
            var start = new Date();
            console.log('View.RowList.render start');
            this.rowRenderer.detachHandler();
            this.destroyChildren();
            this._createRowRenderer();
            //get html string
            if (firstRow && firstRow.get('rowKey') !== 'undefined') {
                this.collection.forEach(function(row) {
                    html += this.rowRenderer.getHtml(row);
                }, this);
            }
            this.$el.html('').prepend(html);
            this.rowRenderer.attachHandler();

            var end = new Date();
            console.log('View.RowList.addAll end', end - start);
            this._showLayer();
            return this;
        },
        _showLayer: function() {
            if (this.grid.dataModel.length) {
                this.grid.hideGridLayer();
            } else {
                this.grid.showGridLayer('empty');
            }
        }
    });

    /**
     *  selection layer 의 컨트롤을 담당하는 틀래스
     *  @class
     */
    View.Selection = View.Base.extend({
        events: {},
        initialize: function(attributes, option) {
            View.Base.prototype.initialize.apply(this, arguments);
            this.setOwnProperties({
                //메서드 호출시 range 값
                range: {
                    column: [-1, -1],
                    row: [-1, -1]
                },
                //rowspan 처리후 Selection box 의 range
                spannedRange: {
                    column: [-1, -1],
                    row: [-1, -1]
                },
                lside: null,
                rside: null,

                pageX: 0,
                pageY: 0,

                intervalIdForAutoScroll: 0,
                isEnable: true,
                _isShown: false
            });
            this.listenTo(this.grid.dimensionModel, 'columnWidthChanged', this._onColumnWidthChanged, this);
        },
        /**
         * selection 을 disable 한다.
         */
        enable: function() {
            this.isEnable = true;
        },
        /**
         * selection 을 disable 한다.
         */
        disable: function() {
            this.endSelection();
            this.isEnable = false;
        },
        /**
         * 마우스 down 이벤트가 발생하여 selection 을 시작할 때, selection 영역을 계산하기 위해 document 에 이벤트 핸들러를 추가한다.
         * @param {Number} pageX
         * @param {Number} pageY
         */
        attachMouseEvent: function(pageX, pageY) {
            if (this.isEnable) {
                this.setOwnProperties({
                    pageX: pageX,
                    pageY: pageY
                });
                this.grid.updateLayoutData();
                $(document).on('mousemove', $.proxy(this._onMouseMove, this));
                $(document).on('mouseup', $.proxy(this._onMouseUp, this));
                $(document).on('selectstart', $.proxy(this._onSelectStart, this));
            }
        },
        /**
         * 마우스 up 이벤트가 발생하여 selection 이 끝날 때, document 에 달린 이벤트 핸들러를 제거한다.
         */
        detachMouseEvent: function() {
            clearInterval(this.intervalIdForAutoScroll);
            $(document).off('mousemove', $.proxy(this._onMouseMove, this));
            $(document).off('mouseup', $.proxy(this._onMouseUp, this));
            $(document).off('selectstart', $.proxy(this._onSelectStart, this));
        },
        /**
         * mouse move event handler
         * @param {event} mouseMoveEvent
         * @private
         */
        _onMouseMove: function(mouseMoveEvent) {
            var pos;
            clearInterval(this.intervalIdForAutoScroll);
            if (this.hasSelection()) {
                pos = this.getIndexFromMousePosition(mouseMoveEvent.pageX, mouseMoveEvent.pageY);
                this.updateSelection(pos.row, pos.column);
                this.grid.focusAt(pos.row, pos.column);
                if (this._isAutoScrollable(pos.overflowX, pos.overflowY)) {
                    this.intervalIdForAutoScroll = setInterval($.proxy(this._adjustScroll, this, pos.overflowX, pos.overflowY));
                }
            } else if (this._getDistance(mouseMoveEvent) > 10) {
                pos = this.getIndexFromMousePosition(this.pageX, this.pageY);
                this.startSelection(pos.row, pos.column);
            }
        },
        /**
         * 마우스 드래그로 selection 선택 시 auto scroll 조건에 해당하는지 반환.
         * @param {Number} overflowX
         * @param {Number} overflowY
         * @return {boolean}
         * @private
         */
        _isAutoScrollable: function(overflowX, overflowY) {
            return !(overflowX === 0 && overflowY === 0);
        },
        /**
         *
         * @param {Number} overflowX
         * @param {Number} overflowY
         * @private
         */
        _adjustScroll: function(overflowX, overflowY) {
            var renderModel = this.grid.renderModel,
                scrollLeft = renderModel.get('scrollLeft'),
                maxScrollLeft = renderModel.get('maxScrollLeft'),
                scrollTop = renderModel.get('scrollTop');
            if (overflowX < 0) {
                renderModel.set('scrollLeft', Math.min(Math.max(0, scrollLeft - 40), maxScrollLeft));
            } else if (overflowX > 0) {
                renderModel.set('scrollLeft', Math.min(Math.max(0, scrollLeft + 40), maxScrollLeft));
            }

            if (overflowY < 0) {
                renderModel.set('scrollTop', Math.max(0, scrollTop - 40));
            } else if (overflowY > 0) {
                renderModel.set('scrollTop', Math.max(0, scrollTop + 40));
            }
        },
        /**
         * mousedown 이 일어난 지점부터의 거리를 구한다.
         * @param {event} mouseMoveEvent
         * @return {number|*}
         * @private
         */
        _getDistance: function(mouseMoveEvent) {
            var pageX = mouseMoveEvent.pageX,
                pageY = mouseMoveEvent.pageY,
                x = Math.abs(this.pageX - pageX),
                y = Math.abs(this.pageY - pageY);
            return Math.round(Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)));
        },
        /**
         * mouse up event handler
         * @param {event} mouseUpEvent
         * @private
         */
        _onMouseUp: function(mouseUpEvent) {
            this.detachMouseEvent();
        },
        /**
         * 마우스 위치 정보에 해당하는 row 와 column index 를 반환한다.
         * @param {Number} pageX
         * @param {Number} pageY
         * @return {{row: number, column: number, overflowX: number, overflowY: number}}
         */
        getIndexFromMousePosition: function(pageX, pageY) {
            var containerPos = this._getContainerPosition(pageX, pageY),
                dimensionModel = this.grid.dimensionModel,
                renderModel = this.grid.renderModel,
                columnWidthList = dimensionModel.getColumnWidthList(),
                scrollTop = renderModel.get('scrollTop'),
                scrollLeft = renderModel.get('scrollLeft'),
                totalColumnWidth = dimensionModel.getTotalWidth(),
                dataPosY = containerPos.pageY + scrollTop,
                dataPosX = containerPos.pageX,
                overflowX = 0,
                overflowY = 0,
                isLside = (dimensionModel.get('lsideWidth') > containerPos.pageX),
                len = columnWidthList.length,
                curWidth = 0,
                height = this.grid.option('scrollX') ?
                    dimensionModel.get('bodyHeight') - this.grid.scrollBarSize : dimensionModel.get('bodyHeight'),
                width = this.grid.option('scrollY') ?
                    dimensionModel.get('width') - this.grid.scrollBarSize : dimensionModel.get('width'),
                rowIdx, columnIdx, i;


            if (!isLside) {
                dataPosX = dataPosX + scrollLeft;
            }
            rowIdx = Math.max(0, Math.min(Math.floor(dataPosY / (dimensionModel.get('rowHeight') + 1)), this.grid.dataModel.length - 1));

            if (containerPos.pageY < 0) {
                overflowY = -1;
            } else if (containerPos.pageY > height) {
                overflowY = 1;
            }

            if (containerPos.pageX < 0) {
                overflowX = -1;
            } else if (containerPos.pageX > width) {
                overflowX = 1;
            }

            if (dataPosX < 0) {
                columnIdx = 0;
            } else if (totalColumnWidth < dataPosX) {
                columnIdx = len - 1;
            } else {
                for (i = 0; i < len; i++) {
                    curWidth += columnWidthList[i] + 1;
                    if (dataPosX <= curWidth) {
                        columnIdx = i;
                        break;
                    }
                }
            }

            return {
                row: rowIdx,
                column: columnIdx,
                overflowX: overflowX,
                overflowY: overflowY
            };
        },
        getRange: function() {
            return $.extend(true, {}, this.spannedRange);
        },
        /**
         *  현재 selection 범위에 대한 string 을 반환한다.
         *  @return {String}
         */
        getSelectionToString: function() {
            var columnModelList = this.grid.columnModel.get('columnModelList')
                    .slice(this.spannedRange.column[0], this.spannedRange.column[1] + 1),
                filteringMap = {
                    '_button': true
                },
                len = columnModelList.length,
                columnNameList = [],
                tmpString = [],
                strings = [],
                columnLen, i, j, rowList, string;

            for (i = 0; i < len; i++) {
                columnNameList.push(columnModelList[i]['columnName']);
            }
            rowList = this.grid.dataModel.slice(this.spannedRange.row[0], this.spannedRange.row[1] + 1);

            len = rowList.length;
            columnLen = columnNameList.length;
            for (i = 0; i < len; i++) {
                tmpString = [];
                for (j = 0; j < columnLen; j++) {
                    if (!filteringMap[columnNameList[j]]) {
                        tmpString.push(rowList[i].getVisibleText(columnNameList[j]));
                    }
                }
                strings.push(tmpString.join('\t'));
            }
            string = strings.join('\n');
            return string;
        },
        /**
         * 실제로 랜더링될 selection layer view 를 생성 후 반환한다.
         * @param {String} whichSide
         * @return {*}
         */
        createLayer: function(whichSide) {
            var clazz = whichSide === 'R' ? View.Selection.Layer.Rside : View.Selection.Layer.Lside,
                layer = this._getLayer(whichSide);

            layer && layer.destroy ? layer.destroy() : null;
            layer = this.createView(clazz, {
                grid: this.grid,
                columnWidthList: this.grid.dimensionModel.getColumnWidthList(whichSide)
            });
            whichSide === 'R' ? this.rside = layer : this.lside = layer;
            return layer;
        },
        /**
         * 전체 영역을 선택한다.
         */
        selectAll: function() {
            this.startSelection(0, 0);
            this.updateSelection(this.grid.dataModel.length - 1, this.grid.columnModel.getVisibleColumnModelList().length - 1);
        },
        /**
         * selection 영역 선택을 시작한다.
         * @param {Number} rowIndex
         * @param {Number} columnIndex
         */
        startSelection: function(rowIndex, columnIndex) {
            this.range.row[0] = this.range.row[1] = rowIndex;
            this.range.column[0] = this.range.column[1] = columnIndex;
            this.show();
        },
        /**
         * selection 영역 선택을 확장한다.
         * @param {Number} rowIndex
         * @param {Number} columnIndex
         */
        updateSelection: function(rowIndex, columnIndex) {
            this.range.row[1] = rowIndex;
            this.range.column[1] = columnIndex;
            this.show();
        },
        /**
         * selection 영역 선택을 종료하고 selection 데이터를 초기화한다.
         */
        endSelection: function() {
            this.range.row[0] = this.range.row[1] = this.range.column[0] = this.range.column[1] = -1;
            this.spannedRange.row[0] = this.spannedRange.row[1] = this.spannedRange.column[0] = this.spannedRange.column[1] = -1;
            this.hide();
            this.detachMouseEvent();
        },
        /**
         * dimension model 의 columnWidth 가 변경되었을 경우 크기를 재 계산하여 rendering 한다.
         * @private
         */
        _onColumnWidthChanged: function() {
            this.show();
        },
        /**
         * 현재 selection range 정보를 기반으로 selection Layer 를 노출한다.
         */
        show: function() {
            if (this.hasSelection()) {
                this._isShown = true;
                var tmpRowRange,
                    columnFixIndex = this.grid.columnModel.get('columnFixIndex'),
                    rowHeight = this.grid.dimensionModel.get('rowHeight'),
                    startRow = Math.min.apply(Math, this.range.row),
                    endRow = Math.max.apply(Math, this.range.row),
                    startColumn = Math.min.apply(Math, this.range.column),
                    endColumn = Math.max.apply(Math, this.range.column),
                    spannedRange = {
                        row: [startRow, endRow],
                        column: [startColumn, endColumn]
                    };
                if (!this.grid.isSorted()) {
                    tmpRowRange = $.extend([], spannedRange.row);

                    //rowSpan 처리를 위해 startIndex 와 endIndex 의 모든 데이터 mainRow 일때까지 loop 를 수행한다.
                    do {
                        tmpRowRange = $.extend([], spannedRange.row);
                        spannedRange = this._getRowSpannedIndex(spannedRange);
                    } while (spannedRange.row[0] !== tmpRowRange[0] ||
                        spannedRange.row[1] !== tmpRowRange[1]);

                }
                this.spannedRange = spannedRange;
                this.lside.show(spannedRange);
                this.rside.show({
                    row: spannedRange.row,
                    column: [Math.max(-1, spannedRange.column[0] - columnFixIndex), Math.max(-1, spannedRange.column[1] - columnFixIndex)]
                });
                //selection 이 생성될 때에는 무조건 input 에 focus 가 가지 않도록 clipboard에 focus 를 준다.
                this.grid.focusClipboard();
            }
        },
        /**
         * selection layer 를 숨긴다. 데이터는 초기화 되지 않는다.
         */
        hide: function() {
            this._isShown = false;
            this.lside.hide();
            this.rside.hide();
        },
        /**
         * 현재 selection 레이어가 노출되어 있는지 확인한다.
         * @return {boolean|*}
         */
        isShown: function() {
            return this._isShown;
        },
        /**
         * Selection Layer View 를 반환한다.
         * @param {String} whichSide
         * @return {*|View.Selection.rside}
         * @private
         */
        _getLayer: function(whichSide) {
            return whichSide === 'R' ? this.rside : this.lside;
        },
        /**
         * 마우스 위치 정보에 해당하는 grid container 기준 pageX 와 pageY 를 반환한다.
         * @param {Number} pageX
         * @param {Number} pageY
         * @return {{pageX: number, pageY: number}}
         * @private
         */
        _getContainerPosition: function(pageX, pageY) {
            var dimensionModel = this.grid.dimensionModel,
                containerPosX = pageX - dimensionModel.get('offsetLeft'),
                containerPosY = pageY - (dimensionModel.get('offsetTop') + dimensionModel.get('headerHeight') + 2);

            return {
                pageX: containerPosX,
                pageY: containerPosY
            };
        },
        /**
         * select start event handler
         * @param {event} selectStartEvent
         * @private
         */
        _onSelectStart: function(selectStartEvent) {
            selectStartEvent.preventDefault();
        },

        /**
         * selection 데이터가 존재하는지 확인한다.
         * @return {boolean}
         * @private
         */
        hasSelection: function() {
            return !(this.range.row[0] === -1);
        },

        /**
         * rowSpan 된 Index range 를 반환한다.
         * @param {{row: [startIdx, endIdx], column: [startIdx, endIdx]}} spannedRange 인덱스 정보
         * @private
         */
        _getRowSpannedIndex: function(spannedRange) {
            var columnModelList = this.grid.columnModel.get('columnModelList')
                    .slice(spannedRange.column[0], spannedRange.column[1] + 1),
                dataModel = this.grid.dataModel,
                len = columnModelList.length,
                startIndexList = [spannedRange.row[0]],
                endIndexList = [spannedRange.row[1]],
                startRow = dataModel.at(spannedRange.row[0]),
                endRow = dataModel.at(spannedRange.row[1]),
                newSpannedRange = $.extend({}, spannedRange);

            if (startRow && endRow) {
                var startRowSpanDataMap = dataModel.at(spannedRange.row[0]).getRowSpanData(),
                    endRowSpanDataMap = dataModel.at(spannedRange.row[1]).getRowSpanData(),
                    columnName, param;

                /**
                 * row start index 기준으로 rowspan 을 확인하며 startRangeList 업데이트 하는 함수
                 * @param {object} param
                 */
                function concatRowSpanIndexFromStart(param) {
                    var startIndex = param.startIndex,
                        endIndex = param.endIndex,
                        rowSpanData = param.startRowSpanDataMap && param.startRowSpanDataMap[columnName],
                        startIndexList = param.startIndexList,
                        endIndexList = param.endIndexList,
                        spannedIndex;

                    if (rowSpanData) {
                        if (!rowSpanData['isMainRow']) {
                            spannedIndex = startIndex + rowSpanData['count'];
                            startIndexList.push(spannedIndex);
                        } else {
                            spannedIndex = startIndex + rowSpanData['count'] - 1;
                            if (spannedIndex > endIndex) {
                                endIndexList.push(spannedIndex);
                            }
                        }
                    }
                }

                /**
                 * row end index 기준으로 rowspan 을 확인하며 endRangeList 를 업데이트 하는 함수
                 * @param {object} param
                 */
                function concatRowSpanIndexFromEnd(param) {
                    var endIndex = param.endIndex,
                        columnName = param.columnName,
                        rowSpanData = param.endRowSpanDataMap && param.endRowSpanDataMap[columnName],
                        endIndexList = param.endIndexList,
                        dataModel = param.dataModel,
                        spannedIndex, tmpRowSpanData;

                    if (rowSpanData) {
                        if (!rowSpanData['isMainRow']) {
                            spannedIndex = endIndex + rowSpanData['count'];
                            tmpRowSpanData = dataModel.at(spannedIndex).getRowSpanData(columnName);
                            spannedIndex += tmpRowSpanData['count'] - 1;
                            if (spannedIndex > endIndex) {
                                endIndexList.push(spannedIndex);
                            }
                        } else {
                            spannedIndex = endIndex + rowSpanData['count'] - 1;
                            endIndexList.push(spannedIndex);
                        }
                    }
                }

                for (var i = 0; i < len; i++) {
                    columnName = columnModelList[i]['columnName'];
                    param = {
                        columnName: columnName,
                        startIndex: spannedRange.row[0],
                        endIndex: spannedRange.row[1],
                        endRowSpanDataMap: endRowSpanDataMap,
                        startRowSpanDataMap: startRowSpanDataMap,
                        startIndexList: startIndexList,
                        endIndexList: endIndexList,
                        dataModel: dataModel
                    };
                    concatRowSpanIndexFromStart(param);
                    concatRowSpanIndexFromEnd(param);
                }

                newSpannedRange.row = [Math.min.apply(Math, startIndexList), Math.max.apply(Math, endIndexList)];
            }
            return newSpannedRange;
        }
    });

    /**
     * 실제 selection layer view
     * @class
     */
    View.Selection.Layer = View.Base.extend({
        tagName: 'div',
        className: 'selection_layer',
        initialize: function(attributes, option) {
            View.Base.prototype.initialize.apply(this, arguments);
            this.listenTo(this.grid.renderModel, 'change:scrollTop', this._onScrollTopChange, this);
            this.listenTo(this.grid.renderModel, 'beforeRefresh', this._onBeforeRefresh, this);
            this.listenTo(this.grid.dimensionModel, 'columnWidthChanged', this._updateColumnWidthList, this);
            this.setOwnProperties({
                columnWidthList: attributes.columnWidthList,
                spannedRange: {
                    row: [-1, -1],
                    column: [-1, -1]
                },
                whichSide: 'R'
            });
        },
        _updateColumnWidthList: function() {
            this.columnWidthList = this.grid.dimensionModel.getColumnWidthList(this.whichSide);
        },
        _onScrollTopChange: function() {

        },
        _onBeforeRefresh: function() {

        },
        /**
         * top 값과 height 값을 반환한다.
         * @param {{row: [startIdx, endIdx], column: [startIdx, endIdx]}} spannedRange 인덱스 정보
         * @return {{display: string, width: string, height: string, top: string, left: string}}
         * @private
         */
        _getGeometryStyles: function(spannedRange) {
            spannedRange = spannedRange || this.indexObj;
            var style, i,
                columnWidthList = this.columnWidthList,
                rowRange = spannedRange.row,
                columnRange = spannedRange.column,
                rowHeight = this.grid.dimensionModel.get('rowHeight'),
//                top = Util.getTBodyHeight(rowRange[0], rowHeight) + this.grid.renderModel.get('top'),
                top = Util.getTBodyHeight(rowRange[0], rowHeight) + 1,
                height = Util.getTBodyHeight(rowRange[1] - rowRange[0] + 1, rowHeight) - 3,
                len = columnWidthList.length,
                display = 'block',
                left = 0,
                width = 0;

            for (i = 0; i < columnRange[1] + 1 && i < len; i++) {
                if (i < columnRange[0]) {
                    left += columnWidthList[i] + 1;
                } else {
                    width += columnWidthList[i] + 1;
                }
            }
            width -= 1;

            if (width <= 0 || height <= 0) {
                display = 'none';
            }

            style = {
                display: display,
                width: width + 'px',
                height: height + 'px',
                top: top + 'px',
                left: left + 'px'
            };
            return style;
        },
        /**
         *
         * @param {{row: [startIdx, endIdx], column: [startIdx, endIdx]}} spannedRange 인덱스 정보
         */
        show: function(spannedRange) {
            this.indexObj = spannedRange;
            this.$el.css(this._getGeometryStyles(spannedRange));
        },
        /**
         * selection 을 숨긴다.
         */
        hide: function() {
            this.$el.css({
                display: 'none',
                width: '0px',
                height: '0px',
                top: 0,
                left: 0
            });
        },
        render: function() {
            return this;
        }
    });
    /**
     * 왼쪽 selection layer
     * @class
     */
    View.Selection.Layer.Lside = View.Selection.Layer.extend({
        initialize: function(attributes, option) {
            View.Selection.Layer.prototype.initialize.apply(this, arguments);
            this.setOwnProperties({
                whichSide: 'L'
            });
        }
    });
    /**
     * 오른쪽 selection layer
     * @class
     */
    View.Selection.Layer.Rside = View.Selection.Layer.extend({
        initialize: function(attributes, option) {
            View.Selection.Layer.prototype.initialize.apply(this, arguments);
            this.setOwnProperties({
                whichSide: 'R'
            });
        }
    });

    /**
     * Network 모듈 addon
     */
    AddOn.Net = View.Base.extend({
        events: {
            'submit': '_onSubmit'
        },
        initialize: function(attributes) {
            View.Base.prototype.initialize.apply(this, arguments);
            var defaultOptions = {
                    initialRequest: true,
                    api: {
                        'readData': 'http://fetech.nhnent.com/svnrun/fetech/shopping/demo/php/api/dummy_request.php',
                        'updateData': '',
                        'deleteData': '',
                        'modifyData': '',
                        'downloadData': '',
                        'downloadAllData': ''
                    },
                    perPage: 500,
                    enableAjaxHistory: true
                },
                options = $.extend(true, defaultOptions, attributes),
                pagination = this.grid.getPaginationInstance();

            this.setOwnProperties({
                curPage: 1,
                perPage: options.perPage,
                options: options,
                router: null,
                pagination: pagination,
                requestedFormData: null,
                isLocked: false
            });
            this._initializeDataModelNetwork();
            this._initializeRouter();
            this._initializePagination();

            if (options.initialRequest) {
                this.readDataAt(1, false);
            }
        },
        _initializePagination: function() {
            var pagination = this.pagination;
            if (pagination) {
                pagination._setOption('itemPerPage', this.perPage);
                pagination._setOption('itemCount', 1);
                pagination.attach('beforeMove', $.proxy(this._onPageBeforeMove, this));
            }
        },
        /**
         * dataModel 이 network 통신을 할 수 있도록 설정한다.
         * @private
         */
        _initializeDataModelNetwork: function() {
            this.grid.dataModel.url = this.options.api.readData;
            this.grid.dataModel.sync = $.proxy(this._sync, this);
        },
        /**
         * ajax history 를 사용하기 위한 router 를 초기화한다.
         * @private
         */
        _initializeRouter: function() {
            if (this.options.enableAjaxHistory) {
                //router 생성
                this.router = new AddOn.Net.Router({
                    grid: this.grid,
                    net: this
                });
                Backbone.history.start();
            }
        },
        /**
         * pagination 에서 before page move가 발생했을 때 이벤트 핸들러
         * @param {{page:number}} customEvent
         * @private
         */
        _onPageBeforeMove: function(customEvent) {
            var page = customEvent.page;
            if (this.curPage !== page) {
                this.readDataAt(page, true);
            }
        },
        /**
         * form 의 submit 이벤트 발생시 이벤트 핸들러
         * @param {event} submitEvent
         * @private
         */
        _onSubmit: function(submitEvent) {
            submitEvent.preventDefault();
            /*
            page 이동시 form input 을 수정하더라도,
            formData 를 유지하기 위해 데이터를 기록한다.
             */
            this.readDataAt(1, false);
        },

        /**
         * 폼 데이터를 설정한다.
         * @param {Object} formData
         */
        setFormData: function(formData) {
            //form data 를 실제 form 에 반영한다.
            Util.setFormData(this.$el, formData);
        },

        /**
         * fetch 수행 이후 custom ajax 동작 처리를 위해 Backbone 의 기본 sync 를 오버라이드 하기위한 메서드.
         * @param {String} method
         * @param {Object} model
         * @param {Object} options
         * @private
         */
        _sync: function(method, model, options) {
            var params;
            if (method === 'read') {
                options = options || {};
                params = $.extend({}, options);
                if (!options.url) {
                    params.url = _.result(model, 'url');
                }
                this._ajax(params);
            } else {
                Backbone.sync.call(Backbone, method, model, options);
            }
        },
        /**
         * network 통신에 대한 lock 을 건다.
         */
        lock: function() {
            this.grid.showGridLayer('loading');
            this.isLocked = true;
        },
        /**
         * network 통신에 대해 unlock 한다.
         * loading layer hide 는 rendering 하는 로직에서 수행한다.
         */
        unlock: function() {
            this.isLocked = false;
        },

        /**
         * form 으로 지정된 엘리먼트의 Data 를 반환한다.
         * @return {object}
         * @private
         */
        _getFormData: function() {
            return Util.getFormData(this.$el);
        },
        /**
         * DataModel 에서 Backbone.fetch 수행 이후 success 콜백
         * @param {object} dataModel grid 의 dataModel
         * @param {object} responseData
         * @param {object} options
         * @private
         */
        _onReadSuccess: function(dataModel, responseData, options) {
            var pagination = this.pagination,
                page, totalCount;

            //pagination 처리
            if (pagination && responseData.pagination) {
                page = responseData.pagination.page;
                totalCount = responseData.pagination.totalCount;
                pagination._setOption('itemPerPage', this.perPage);
                pagination._setOption('itemCount', totalCount);
//                pagination.reset(totalCount);
//                console.log('totalCount', totalCount);
                pagination.movePageTo(page);
                this.curPage = page;
            }
        },
        /**
         * DataModel 에서 Backbone.fetch 수행 이후 error 콜백
         * @param {object} dataModel grid 의 dataModel
         * @param {object} responseData
         * @param {object} options
         * @private
         */
        _onReadError: function(dataModel, responseData, options) {

        },
        /**
         * 데이터 조회 요청.
         * @param {object} data 요청시 사용할 request 파라미터
         */
        readData: function(data) {
            var startNumber = 1,
                grid = this.grid;
            if (!this.isLocked) {
                grid.renderModel.initializeVariables();
                this.lock();
                this.requestedFormData = _.clone(data);
                this.curPage = data.page || this.curPage;
                startNumber = (this.curPage - 1) * this.perPage + 1;
                grid.renderModel.set({
                    startNumber: startNumber
                });

                data.columnModel = JSON.stringify(this.grid.columnModel.get('columnModelList'));
//                data.columnModel = grid.columnModel.get('columnModelList');
                grid.dataModel.fetch({
                    requestType: 'readData',
                    data: data,
                    type: 'POST',
                    success: $.proxy(this._onReadSuccess, this),
                    error: $.proxy(this._onReadError, this),
                    reset: true
                });
            }
        },
        /**
         * 현재 form data 기준으로, page 에 해당하는 데이터를 조회 한다.
         * @param {Number} page
         * @param {Boolean} isUsingRequestedData
         */
        readDataAt: function(page, isUsingRequestedData) {
            isUsingRequestedData = isUsingRequestedData === undefined ? true : isUsingRequestedData;
            var data = isUsingRequestedData ? this.requestedFormData : this._getFormData();
            data.page = page;
            data.perPage = this.perPage;

            if (this.router) {
                this.router.navigate('read/' + Util.toQueryString(data), {
                    trigger: false
                });
            }
            this.readData(data);
        },
        createData: function(options) {
            this.send('createData', options);
        },
        updateData: function(options) {
            this.send('updateData', options);
        },
        deleteData: function(options) {
            this.send('deleteData', options);
        },
        modifyData: function(options) {
            this.send('modifyData', options);
        },
        downloadData: function() {

        },
        downloadAllData: function() {

        },
        send: function(requestType, options) {
            var dataModel = this.grid.dataModel,
                defaultOptions = {
                    url: this.options.api[requestType],
                    type: null,
                    hasData: true,
                    isOnlyChecked: true,
                    isOnlyModified: true,
                    isSkipConfirm: false
                },
                checkMap = {
                    'createData': ['createList'],
                    'updateData': ['updateList'],
                    'deleteData': ['deleteList'],
                    'modifyData': ['createList', 'updateList', 'deleteList']
                },
                checkList = checkMap[requestType],
                newOptions = $.extend(defaultOptions, options),
                hasData = newOptions.hasData,
                isOnlyModified = newOptions.isOnlyModified,
                isOnlyChecked = newOptions.isOnlyChecked,
                isSkipConfirm = newOptions.isSkipConfirm,
                param = {},
                data = $.extend({}, this.requestedFormData),
                dataMap, count = 0;

            if (hasData) {
                if (isOnlyModified) {
                    //{createList: [], updateList:[], deleteList: []} 에 담는다.
                    dataMap = dataModel.getModifiedRowList(isOnlyChecked);
                    _.each(dataMap, function(list, name) {
                        if ($.inArray(name, checkList) !== -1) {
                            count += list.length;
                        }
                        dataMap[name] = JSON.stringify(list);
                    }, this);
                } else {
                    //{rowList: []} 에 담는다.
                    dataMap = {rowList: dataModel.getRowList(isOnlyChecked)};
                    count = dataMap.rowList.length;
                }
            }

            if (isSkipConfirm || this._ask(requestType, count)) {
                data = $.extend(data, dataMap);
                param = {
                    requestType: requestType,
                    url: newOptions.url,
                    data: data,
                    type: newOptions.type
                };
                this._ajax(param);
            }


        },
        _ask: function(requestType, count) {
            var textMap = {
                    'createData': '입력',
                    'updateData': '수정',
                    'deleteData': '삭제',
                    'modifyData': '반영'
                },
                actionName = textMap[requestType];
            if (count > 0) {
                return confirm(count + '건의 데이터를 ' + actionName + '하시겠습니까?');
            } else {
                alert(actionName + '할 데이터가 없습니다.');
                return false;
            }
        },
        /**
         * ajax 통신을 한다.
         * @param {{requestType: string, url: string, data: object, type: string, dataType: string}} options ajax 요청 파라미터
         * @private
         */
        _ajax: function(options) {
            var eventData = this.createEventData(options.data);
            this.grid.trigger('beforeRequest', eventData);
            if (eventData.isStopped()) return;
            options = $.extend({requestType: ''}, options);

            var params = {
                'url' : options.url,
                'data' : options.data || {},
                'type' : options.type || 'POST',
                'dataType' : options.dataType || 'json',
                'complete' : $.proxy(this._onComplete, this, options.complete, options),
                'success' : $.proxy(this._onSuccess, this, options.success, options),
                'error' : $.proxy(this._onError, this, options.error, options)
            };
            $.ajax(params);
        },
        _onComplete: function(callback, jqXHR, status) {
            this.unlock();
        },
        /**
         * ajax success 이벤트 핸들러
         * @param {Function} callback
         * @param {{requestType: string, url: string, data: object, type: string, dataType: string}} options ajax 요청 파라미터
         * @param {Object} responseData
         * @param {number} status
         * @param {object} jqXHR
         * @private
         */
        _onSuccess: function(callback, options, responseData, status, jqXHR) {
            var message = responseData && responseData['message'],
                eventData = this.createEventData({
                    httpStatus: status,
                    requestType: options.requestType,
                    requestParameter: options.data,
                    responseData: responseData
                });
            this.grid.trigger('onResponse', eventData);
            if (eventData.isStopped()) return;
            if (responseData && responseData['result']) {
                this.grid.trigger('onSuccessResponse', eventData);
                if (eventData.isStopped()) return;
                callback && typeof callback === 'function' ? callback(responseData['data'] || {}, status, jqXHR) : null;
            } else {
                //todo: 오류 처리
                this.grid.trigger('onFailResponse', eventData);
                if (eventData.isStopped()) return;
                message ? alert(message) : null;
            }
        },
        /**
         * ajax error 이벤트 핸들러
         * @param {Function} callback
         * @param {{requestType: string, url: string, data: object, type: string, dataType: string}} options ajax 요청 파라미터
         * @param {object} jqXHR
         * @param {number} status
         * @param {String} errorMessage
         * @private
         */
        _onError: function(callback, options, jqXHR, status, errorMessage) {
            var eventData = this.createEventData({
                httpStatus: status,
                requestType: options.requestType,
                requestParameter: options.data,
                responseData: null
            });
            this.grid.hideGridLayer();

            this.grid.trigger('onResponse', eventData);
            if (eventData.isStopped()) return;

            this.grid.trigger('onErrorResponse', eventData);
            if (eventData.isStopped()) return;

            if (jqXHR.readyState > 1) {
                alert('데이터 요청 중에 에러가 발생하였습니다.\n\n다시 시도하여 주시기 바랍니다.');
            }
        }
    });
    /**
     * Ajax History 관리를 위한 Router AddOn
     */
    AddOn.Net.Router = Backbone.Router.extend({
        routes: {
            'read/:queryStr': 'read'
        },
        initialize: function(attributes) {
            this.setOwnProperties({
                grid: attributes && attributes.grid || null,
                net: attributes && attributes.net || null
            });
        },
        /**
         * read
         * @param {String} queryStr
         */
        read: function(queryStr) {
            var data = Util.toQueryObject(queryStr);
            //formData 를 설정한다.
            this.net.setFormData(data);
            //그 이후 read
            this.net.readData(data);
        },
        setOwnProperties: function(properties) {
            _.each(properties, function(value, key) {
                this[key] = value;
            }, this);
        }
    });

    var Grid = View.Base.extend({
        scrollBarSize: 17,
        minimumHeight: 150, //그리드의 최소 높이값
        lside: null,
        rside: null,
        toolbar: null,
        cellFactory: null,


        events: {
            'click' : '_onClick',
            'mousedown' : '_onMouseDown'
        },
        keyMap: {
            'TAB': 9,
            'ENTER': 13,
            'CTRL': 17,
            'ESC': 27,
            'LEFT_ARROW': 37,
            'UP_ARROW': 38,
            'RIGHT_ARROW': 39,
            'DOWN_ARROW': 40,
            'CHAR_A': 65,
            'CHAR_C': 67,
            'CHAR_F': 70,
            'CHAR_R': 82,
            'CHAR_V': 86,
            'LEFT_WINDOW_KEY': 91,
            'F5': 116,
            'BACKSPACE': 8,
            'SPACE': 32,
            'PAGE_UP': 33,
            'PAGE_DOWN': 34,
            'HOME': 36,
            'END': 35,
            'DEL': 46,
            'UNDEFINED': 229
        },
        keyName: {
            9: 'TAB',
            13: 'ENTER',
            17: 'CTRL',
            27: 'ESC',
            37: 'LEFT_ARROW',
            38: 'UP_ARROW',
            39: 'RIGHT_ARROW',
            40: 'DOWN_ARROW',
            65: 'CHAR_A',
            67: 'CHAR_C',
            70: 'CHAR_F',
            82: 'CHAR_R',
            86: 'CHAR_V',
            91: 'LEFT_WINDOW_KEY',
            116: 'F5',
            8: 'BACKSPACE',
            32: 'SPACE',
            33: 'PAGE_UP',
            34: 'PAGE_DOWN',
            36: 'HOME',
            35: 'END',
            46: 'DEL',
            229: 'UNDEFINED'
        },
        initialize: function(options) {
            View.Base.prototype.initialize.apply(this, arguments);
            var id = Util.getUniqueKey();
            this.__instance[id] = this;
            console.log(options);

            var defaultOptions = {
                form: null,
                debug: false,
                columnFixIndex: 0,
                columnModelList: [],
                keyColumnName: null,
                selectType: '',

                autoNumbering: true,

                headerHeight: 35,
                rowHeight: 27,
                displayRowCount: 10,
                minimumColumnWidth: 50,
                notUseSmartRendering: false,
                columnMerge: [],
                minimumWidth: 300,      //grid의 최소 너비

                scrollX: true,
                scrollY: true,
                useDataCopy: true,

                toolbar: {
                    hasResizeHandler: true,
                    hasControlPanel: true,
                    hasPagination: true
                }
            };




            options = $.extend(true, defaultOptions, options);

            this.setOwnProperties({
                'cellFactory': null,
                'selection': null,
                'columnModel': null,
                'dataModel': null,
                'renderModel': null,
                'layoutModel': null,
                'focusModel': null,
                'addOn': {},
                'view': {
                    'lside': null,
                    'rside': null,
                    'toolbar': null,
                    'clipboard': null,
                    'layer': {
                        ready: null,
                        loading: null,
                        empty: null
                    }
                },
                'id' : id,
                'options' : options,
                'timeoutIdForResize': 0,
                'timeoutIdForSetRowList': 0,
                '__$el': this.$el.clone()
            });

            this._initializeModel();
            this._initializeListener();
            this._initializeView();

            this._initializeScrollBar();

            this._attachExtraEvent();

            this.render();

            this.updateLayoutData();

        },
        /**
         * rowKey 와 columnName 에 해당하는 값을 반환한다.
         *
         * @param {(Number|String)} rowKey    행 데이터의 고유 키
         * @param {String} columnName   컬럼 이름
         * @param {boolean} [isOriginal]  HTMLElement 리턴 여부
         * @return {(Number|String)}
         */
        getValue: function(rowKey, columnName, isOriginal) {

        },
        /**
         * columnName에 해당하는 column data list를 리턴한다.
         *
         * @param {String} columnName   컬럼 이름
         * @param {boolean} [isJsonString=false]  true 일 경우 JSON String 으로 반환한다.
         * @return {Array}
         */
        getColumnValue: function(columnName, isJsonString) {

        },
        /**
         * rowKey에 해당하는 행의 데이터를 리턴한다. isJsonString을 true로 설정하면 결과를 json객체로 변환하여 리턴한다.
         * @param {(Number|String)} rowKey
         * @param {Boolean} isJsonString
         * @return {Object}
         */
        getRow: function(rowKey, isJsonString) {
            var row = this.grid.dataModel.get(rowKey).toJSON();
            row = isJsonString ? $.toJSON(row) : row;
            return row;
        },
        /**
         * 그리드 전체 데이터 중에서 index에 해당하는 순서의 데이터 객체를 리턴한다.
         * @param {Number} index
         * @return {Object}
         */
        getRowAt: function(index) {
            return this.grid.dataModel.at(index).toJSON();
        },
        /**
         * 현재 그리드에 설정된 전체 데이터의 개수를 리턴한다.
         * @return {Number}
         */
        getRowCount: function() {
            return this.grid.dataModel.length;
        },
        getRowSpan: function() {

        },
        /**
         * 그리드 내에서 현재 선택된 row의 키값을 리턴한다.
         * @return {(Number|String)}
         */
        getSelectedRowKey: function() {
            return this.grid.focusModel.which().rowKey;
        },
        /**
         * rowKey 와 columnName 에 해당하는 td element 를 반환한다.
         * @param {(Number|String)} rowKey    행 데이터의 고유 키
         * @param {String} columnName   컬럼 이름
         * @return {jQuery} 해당 jQuery Element
         */
        getElement: function(rowKey, columnName) {
            var $frame = this.columnModel.isLside(columnName) ? this.view.lside.$el : this.view.rside.$el;
            return $frame.find('tr[key="' + rowKey + '"]').find('td[columnname="' + columnName + '"]');
        },
        /**
         *
         * @param {(Number|String)} rowKey    행 데이터의 고유 키
         * @param {String} columnName   컬럼 이름
         * @param {(Number|String)} columnValue 할당될 값
         * @param {Boolean} [silent=false] 이벤트 발생 여부. true 로 변경할 상황은 거의 없다.
         */
        setValue: function(rowKey, columnName, columnValue, silent) {
            //@TODO : rowKey to String
            columnValue = typeof columnValue === 'string' ? $.trim(columnValue) : columnValue;
            this.dataModel.setValue(rowKey, columnName, columnValue, silent);
        },
        /**
         *
         * @param {String} columnName   컬럼 이름
         * @param {(Number|String)} columnValue 할당될 값
         * @param {Boolean} [silent=false] 이벤트 발생 여부. true 로 변경할 상황은 거의 없다.
         */
        setColumnValue: function(columnName, columnValue, silent) {
            columnValue = typeof columnValue === 'string' ? $.trim(columnValue) : columnValue;
            this.dataModel.setColumnValue(columnName, columnValue, silent);
        },
        /**
         * setRowList
         * @TODO: Naming 고민중..
         * set row list data
         * @param {Array} rowList
         * @param {boolean} [isParse=true]
         */
        setRowList: function(rowList, isParse) {
            this.showGridLayer('loading');
            isParse = isParse === undefined ? true : isParse;
            //데이터 파싱에 시간이 많이 걸릴 수 있으므로, loading layer 를 먼저 보여주기 위해 timeout 을 사용한다.
            clearTimeout(this.timeoutIdForSetRowList);
            this.timeoutIdForSetRowList = setTimeout($.proxy(function() {
                this.dataModel.set(rowList, {
                    parse: isParse
                });
            }, this), 0);
        },
        /**
         * rowKey, columnName에 해당하는 셀에 포커싱한다.
         * @param {(Number|String)} rowKey    행 데이터의 고유 키
         * @param {String} columnName   컬럼 이름
         * @param {boolean} [isScrollable=false] 그리드에서 해당 영역으로 scroll 할지 여부
         */
        focus: function(rowKey, columnName, isScrollable) {
            this.focusModel.focus(rowKey, columnName, isScrollable);
        },
        /**
         * 셀을 편집모드로 전환한다.
         * @param {(Number|String)} rowKey    행 데이터의 고유 키
         * @param {String} columnName   컬럼 이름
         * @param {boolean} [isScrollable=false] 그리드에서 해당 영역으로 scroll 할지 여부
         * @private
         */
        focusIn: function(rowKey, columnName, isScrollable) {
            var cellInstance;
            this.focus(rowKey, columnName, isScrollable);
            rowKey = this.getMainRowKey(rowKey, columnName);
            if (this.isEditable(rowKey, columnName)) {
                cellInstance = this.cellFactory.getInstance(this.columnModel.getEditType(columnName));
                cellInstance.focusIn(this.getElement(rowKey, columnName));
            } else {
                this.focusClipboard();
            }
        },
        /**
         * rowIndex, columnIndex 에 해당하는 컬럼에 포커싱한다.
         * @param {(Number|String)} rowIndex
         * @param {String} columnIndex
         * @param {Boolean} isScrollable
         */
        focusAt: function(rowIndex, columnIndex, isScrollable) {
            var row = this.dataModel.at(rowIndex),
                column = this.columnModel.at(columnIndex);
            if (row && column) {
                this.focus(row.get('rowKey'), column['columnName'], isScrollable);
            }
        },
        /**
         * rowIndex, columnIndex 에 해당하는 컬럼에 포커싱 후 편진모드로 전환 한다.
         * @param {(Number|String)} rowIndex
         * @param {String} columnIndex
         * @param {Boolean} isScrollable
         */
        focusInAt: function(rowIndex, columnIndex, isScrollable) {
            var row = this.dataModel.at(rowIndex),
                column = this.columnModel.at(columnIndex);
            if (row && column) {
                this.focusIn(row.get('rowKey'), column['columnName'], isScrollable);
            }
        },
        /**
         * 현재 포커스 된 컬럼이 있을 경우 포커스 상태를 해제한다
         */
        blur: function() {
            this.focusModel.blur();
        },
        /**
         * 전체 행을 선택한다.
         */
        checkAll: function() {
            this.dataModel.setColumnValue('_button', true);
        },
        /**
         * rowKey에 해당하는 행의 체크박스 및 라디오박스를 선택한다.
         * @param {(Number|String)} rowKey    행 데이터의 고유 키
         */
        check: function(rowKey) {
            this.setValue(rowKey, '_button', true);
        },
        /**
         * 모든 행을 선택 해제 한다.
         */
        uncheckAll: function() {
            this.dataModel.setColumnValue('_button', false);
        },
        /**
         * rowKey 에 해당하는 행의 체크박스 및 라디오박스를 선택한다.
         * @param {(Number|String)} rowKey    행 데이터의 고유 키
         */
        uncheck: function(rowKey) {
            this.setValue(rowKey, '_button', false);
        },


        /**
         * @deprecated
         */
        checkRowState: function() {

        },
        /**
         * 그리드의 모든 데이터를 삭제하고 norowlayer 클래스명을 가지는 엘리먼트를 보여준다.
         */
        clear: function() {
            //@todo: empty 레이어 추가
            this.setRowList([]);
        },
        /**
         * rowKey에 해당하는 그리드 데이터를 삭제한다.
         * @param {(Number|String)} rowKey    행 데이터의 고유 키
         * @param {Boolean} [isRemoveOriginalData=false] 원본 데이터도 삭제 여부
         */
        removeRow: function(rowKey, isRemoveOriginalData) {
            this.dataModel.removeRow(rowKey, isRemoveOriginalData);
        },
        /**
         * 그리드를 편집할 수 있도록 막았던 포커스를 풀고 딤드를 제거한다.
         */
        enable: function() {

        },
        /**
         * 그리드를 편집할 수 없도록 입력 엘리먼트들의 포커스를 막고, 옵션에 따라 딤드 처리한다.
         * @param {Boolean} [hasDimmedLayer=true]
         */
        disable: function(hasDimmedLayer) {

        },
        /**
         * rowKey에 해당하는 행을 활성화시킨다.
         * @param {(Number|String)} rowKey
         */
        enableRow: function(rowKey) {
            this.grid.dataModel.setRowState(rowKey, '');
        },
        /**
         * rowKey에 해당하는 행을 비활성화 시킨다.
         * @param {(Number|String)} rowKey    행 데이터의 고유 키
         */
        disableRow: function(rowKey) {
            this.grid.dataModel.setRowState(rowKey, 'DISABLED');
        },
        /**
         * rowKey에 해당하는 행의 메인 체크박스를 체크할 수 있도록 활성화 시킨다.
         * @param {(Number|String)} rowKey
         */
        enableCheck: function(rowKey) {
            this.grid.dataModel.setRowState(rowKey, '');
        },
        /**
         * rowKey에 해당하는 행의 메인 체크박스를 체크하지 못하도록 비활성화 시킨다.
         * @param {(Number|String)} rowKey
         */
        disableCheck: function(rowKey) {
            this.grid.dataModel.setRowState(rowKey, 'DISABLED_CHECK');
        },


        /**
         * 데이터 필터링 기능 함수. 전체 그리드 데이터의 columnName에 해당하는 데이터와 columnValue를 비교하여 필터링 한 결과를 그리드에 출력한다
         * @param {String} columnName
         * @param {(String|Number)} columnValue
         */
        filterData: function(columnName, columnValue) {

        },
        /**
         * 현재 선택된 행들의 키값만을 배열로 리턴한다.
         * @param {Boolean} [isJsonString=false]  true 일 경우 json 문자열을 리턴한다.
         * @return {Array|String}
         */
        getCheckedRowKeyList: function(isJsonString) {
            var rowKeyList = [];
            _.each(this.dataModel.where({
                '_button' : true
            }), function(row) {
                rowKeyList.push(row.get('rowKey'));
            }, this);
            return rowKeyList;
        },
        /**
         * 현재 선택된 행들의 모든 데이터를 배열로 리턴한다.
         * @param {Boolean} [isJsonString=false]  true 일 경우 json 문자열을 리턴한다.
         * @return {Array|String}
         */
        getCheckedRowList: function(isJsonString) {
            return this.dataModel.getRowList(true);
        },
        /**
         * 그리드에 설정된 컬럼모델 정보를 배열 형태로 리턴한다.
         * @return {Array}
         */
        getColumnModel: function() {
            return this.grid.columnModel.get('columnModelList');
        },
        /**
         * 현재 비활성화된 행들의 키값만을 배열로 리턴한다.
         * @return {Array}
         */
        getDisabledRowKeyList: function() {
            //@todo
        },
        /**
         * 그리드 내에서 변경된 데이터들의 목록을 구성하여 리턴한다.
         * 리턴되는 객체에는 inserted, edited, deleted 라는 필드가 있고,
         * 각 필드에는 변경된 데이터들이 배열로 구성되어 있다.
         *
         * @param {Boolean} [isRowKeyList]  true로 설정하면 키값만 저장하여 리턴
         * @param {Boolean} [isJsonString]  변경된 데이터 객체를 JSON문자열로 변환하여 리턴
         * @param {Boolean} [filteringColumnList]   행 데이터 중에서 데이터 변경으로 간주하지 않을 컬럼 이름을 배열로 설정한다.
         * @return {Array}
         */
        getModifiedRowList: function(isRowKeyList, isJsonString, filteringColumnList) {
            //@todo 파라미터 옵션에 따른 데이터 형 변화
            return this.dataModel.getModifiedRowList();
        },

        /**
         * 현재 그리드의 제일 끝에 행을 추가한다.
         * @param {object} rowData
         */
        appendRow: function(row) {
            this.dataModel.append(row);
        },
        /**
         * 현재 그리드의 제일 앞에 행을 추가한다.
         * @param {object} rowData
         */
        prependRow: function(row) {
            this.dataModel.prepend(row);
        },
        /**
         * 열 고정 위치를 변경한다.
         *
         * @param {Number} index 고정시킬 열의 인덱스
         */
        setColumnFixIndex: function(columnFixIndex) {
            this.option({
                columnFixIndex: columnFixIndex
            });
            this.columnModel.set({columnFixIndex: columnFixIndex});
        },

        /**
         * 현재 그리드에 설정된 데이터의 변경 여부를 Boolean으로 리턴한다.
         * - getModifiedRowList() 함수의 결과값을 이용하여 입력/수정/삭제가 되었으면 true를 리턴하고 그렇지 않은 경우에는 false를 리턴한다.
         * @return {Boolean}
         */
        isChanged: function() {

        },
        /**
         * setRowList()를 통해 그리드에 설정된 초기 데이터 상태로 복원한다.
         * 그리드에서 수정되었던 내용을 초기화하는 용도로 사용한다.
         */
        restore: function() {
            var originalRowList = this.grid.dataModel.getOriginalRowList();
            this.grid.setRowList(originalRowList, false);
        },
        refreshLayout: function() {
            //todo
        },
        addClassNameToColumn: function() {

        },
        addClassNameToRow: function() {

        },
        removeClassNameFromColumn: function() {

        },
        removeClassNameFromRow: function() {

        },
        replaceRowList: function() {

        },
        /**
         * rowKey에 해당하는 행에 대해 선택한다.
         * - checkRow()는 행에 포함된 체크박스나 라디오박스를 선택하며, selectRow()는 클릭된 행이 선택되어졌음을 시각적으로 나타내기 위해 해당 행의 배경색을 변경한다.
         *
         * @param {(Number|String)} rowKey
         */
        select: function(rowKey) {

        },

        setGridSize: function(size) {
            var dimensionModel = this.grid.dimensionModel,
                width = size && size.width || dimensionModel.get('width'),
                bodyHeight = dimensionModel.get('bodyHeight'),
                headerHeight = dimensionModel.get('headerHeight'),
                toolbarHeight = dimensionModel.get('toolbarHeight');

            if (size && size.height) {
                bodyHeight = height - (headerHeight + toolbarHeight);
            }
        },
        setHeaderColumnTitle: function() {

        },
        setScrollBarPosition: function() {

        },


        /**
         * Grid Layer 를 모두 감춘다.
         */
        hideGridLayer: function() {
            _.each(this.view.layer, function(view, name) {
                view.hide();
            }, this);
        },
        /**
         * name 에 해당하는 Grid Layer를 보여준다.
         * @param {String} name ready|empty|loading
         */
        showGridLayer: function(name) {
            this.hideGridLayer();
            this.view.layer[name] ? this.view.layer[name].show() : null;
        },

        /**
         * pagination instance 를 반환한다.
         * @return {instance|*|exports.scopeToPunc.instance|exports.baseTags.instance}
         */
        getPaginationInstance: function() {
            var paginationView = this.view.toolbar.pagination;
            if (paginationView) {
                return paginationView.instance;
            }
        },
        /**
         * addon 을 활성화한다.
         * @param {string} name addon 이름
         * @param {object} options addon 에 넘길 파라미터
         * @return {Grid}
         */
        use: function(name, options) {
            options = $.extend({grid: this}, options);
            if (AddOn[name]) {
                this.addOn[name] = new AddOn[name](options);
            }
            return this;
        },

        /**
         * event 속성에 정의되지 않은 이벤트 attach 하는 메서드
         * @private
         */
        _attachExtraEvent: function() {
            $(window).on('resize', $.proxy(this._onWindowResize, this));
        },
        /**
         * window resize  이벤트 핸들러
         * @param {event} resizeEvent
         * @private
         */
        _onWindowResize: function(resizeEvent) {
            var width = Math.max(this.option('minimumWidth'), this.$el.css('width', '100%').width());
            this.dimensionModel.set('width', width);
        },
        _initializeListener: function() {
            this.listenTo(this.dimensionModel, 'change:width', this._onWidthChange);
            this.listenTo(this.dimensionModel, 'change:bodyHeight', this._setHeight);
        },


        /**
         * layout 에 필요한 크기 및 위치 데이터를 갱신한다.
         * @private
         */
        updateLayoutData: function() {
            var offset = this.$el.offset(),
                rsideTotalWidth = this.dimensionModel.getTotalWidth('R'),
                maxScrollLeft = rsideTotalWidth - this.dimensionModel.get('rsideWidth');

            this.renderModel.set({
                maxScrollLeft: maxScrollLeft
            });
            this.dimensionModel.set({
                offsetTop: offset.top,
                offsetLeft: offset.left,
                width: this.$el.width(),
                height: this.$el.height(),
                toolbarHeight: this.view.toolbar.$el.height()
            });
        },
        /**
         * width 변경시 layout data 를 update 한다.
         * @private
         */
        _onWidthChange: function() {
            this.updateLayoutData();
        },

        option: function(key, value) {
            if (value === undefined) {
                return this.options[key];
            }else {
                this.options[key] = value;
                return this;
            }
        },
        _onClick: function(clickEvent) {
            var $target = $(clickEvent.target),
                eventData = this.createEventData(clickEvent);
            this.trigger('click', eventData);
            if (eventData.isStopped()) return;

            if (!($target.is('input') || $target.is('a') || $target.is('button') || $target.is('select') || $target.is('label'))) {
            }


        },
        _onMouseDown: function(mouseDownEvent) {
            var $target = $(mouseDownEvent.target),
                eventData = this.createEventData(mouseDownEvent);
            this.trigger('mousedown', eventData);

            if (eventData.isStopped()) return;
            if (!($target.is('input') || $target.is('a') || $target.is('button') || $target.is('select'))) {
                mouseDownEvent.preventDefault();
                this.focusClipboard();
                this.selection.show();
            }
        },
        focusClipboard: function() {
            this.view.clipboard.$el.focus();
        },
        /**
         * _initializeModel
         *
         * Initialize data model instances
         * @param options
         * @private
         */
        _initializeModel: function() {
            var offset = this.$el.offset();

            //define column model
            this.columnModel = new Data.ColumnModel({
                grid: this,
                keyColumnName: this.option('keyColumnName'),
                columnFixIndex: this.option('columnFixIndex')
            });
            this.setColumnModelList(this.option('columnModelList'));

            //define layout model
            this.dimensionModel = new Model.Dimension({
                grid: this,
                offsetTop: offset.top,
                offsetLeft: offset.left,
                width: this.$el.width(),
                height: this.$el.height(),
                headerHeight: this.option('headerHeight'),
                rowHeight: this.option('rowHeight')
            });

            // define focus model
            this.focusModel = new Model.Focus({
                grid: this
            });

            //define rowList
            this.dataModel = new Data.RowList({
                grid: this
            });
            this.dataModel.reset([]);

            if (this.option('notUseSmartRendering') === true) {
                this.renderModel = new Model.Renderer({
                    grid: this
                });
            }else {
                this.renderModel = new Model.Renderer.Smart({
                    grid: this
                });
            }

            this.cellFactory = this.createView(View.CellFactory, { grid: this });
        },
        /**
         * _initializeView
         *
         * Initialize view instances
         * @private
         */
        _initializeView: function() {
            this.cellFactory = this.createView(View.CellFactory, {
                grid: this
            });

            this.selection = this.createView(View.Selection, {
                grid: this
            });

            //define header & body area
            this.view.lside = this.createView(View.Layout.Frame.Lside, {
                grid: this
            });

            this.view.rside = this.createView(View.Layout.Frame.Rside, {
                grid: this
            });

            this.view.toolbar = this.createView(View.Layout.Toolbar, {
                grid: this
            });

            this.view.layer.ready = this.createView(View.Layer.Ready, {
                grid: this
            });
            this.view.layer.empty = this.createView(View.Layer.Empty, {
                grid: this
            });
            this.view.layer.loading = this.createView(View.Layer.Loading, {
                grid: this
            });

            this.view.clipboard = this.createView(View.Clipboard, {
                grid: this
            });
        },

        _initializeScrollBar: function() {
//            if(!this.option('scrollX')) this.$el.css('overflowX', 'hidden');
//            if(!this.option('scrollY')) this.$el.css('overflowY', 'hidden');
        },

        /**
         * render
         *
         * Rendering grid view
         */
        render: function() {
            var leftLine = $('<div>').addClass('left_line'),
                rightLine = $('<div>').addClass('right_line');

            this.$el.addClass('grid_wrapper')
                .addClass('uio_grid')
                .attr('instanceId', this.id)
                .append(this.view.layer.empty.render().el)
                .append(this.view.layer.loading.render().el)
                .append(this.view.layer.ready.render().el);

            this.view.layer.loading.show('초기화 중입니다.');

            this.$el.append(this.view.lside.render().el)
                .append(this.view.rside.render().el)
                .append(this.view.toolbar.render().el)
                .append(leftLine)
                .append(rightLine)
                .append(this.view.clipboard.render().el);
            this._setHeight();
        },
        _setHeight: function() {
            var bodyHeight = this.dimensionModel.get('bodyHeight'),
                headerHeight = this.dimensionModel.get('headerHeight'),
                toolbarHeight = this.view.toolbar.$el.height(),
                height = toolbarHeight + headerHeight + bodyHeight;
            this.$el.css('height', height + 'px');
            this.dimensionModel.set({
                toolbarHeight: toolbarHeight
            });
        },
        /**
         * 정렬이 되었는지 여부 반환
         * @return {Boolean}
         */
        isSorted: function() {
            return this.dataModel.isSortedByField();
        },
        /**
         * rowKey 와 columnName 을 받아 edit 가능한 cell 인지를 반환한다.
         * @param {(Number|String)} rowKey
         * @param {String} columnName
         * @return {Boolean}
         */
        isEditable: function(rowKey, columnName) {
            var focused = this.focusModel.which(),
                notEditableTypeList = ['_number', 'normal'];

            rowKey = rowKey !== undefined ? rowKey : focused.rowKey;
            columnName = columnName !== undefined ? columnName : focused.columnName;

            var columnModel = this.columnModel,
                dataModel = this.dataModel,
                editType = columnModel.getEditType(columnName),
                row, relationResult;

            if ($.inArray(editType, notEditableTypeList) !== -1) {
                return false;
            } else {
                row = dataModel.get(rowKey);
                relationResult = row.getRelationResult()[columnName];
                return !(relationResult && (relationResult['isDisabled'] || relationResult['isEditable'] === false));
            }
        },

        setColumnModelList: function(columnModelList) {
            this.columnModel.set('columnModelList', columnModelList);
        },
        /**
         * sort by columnName
         *
         * @param columnName
         */
        sort: function(columnName) {
            this.dataModel.sortByField(columnName);
        },
        getRowList: function() {
            return this.dataModel.getRowList();
        },


        /**
         * mainRowKey 를 반환한다.
         * @param {(Number|String)} rowKey
         * @param {String} columnName
         * @return {(Number|String)}
         */
        getMainRowKey: function(rowKey, columnName) {
            var row = this.dataModel.get(rowKey);
            if (!this.isSorted()) {
                rowKey = row ? row.getRowSpanData(columnName).mainRowKey : rowKey;
            }
            return rowKey;
        },
        /**
         * rowKey 와 columnName 에 해당하는 text 형태의 셀의 값을 삭제한다.
         * @param {(Number|String)} rowKey
         * @param {String} columnName
         * @param {Boolean} silent
         */
        del: function(rowKey, columnName, silent) {
            rowKey = this.getMainRowKey(rowKey, columnName);

            var editType = this.columnModel.getEditType(columnName),
                isDisabledCheck = this.dataModel.get(rowKey).getRowState().isDisabledCheck,
                deletableEditTypeList = ['text', 'text-convertible'],
                isDeletable = $.inArray(editType, deletableEditTypeList) !== -1,
                selectType = this.option('selectType');

            if (isDeletable && this.isEditable(rowKey, columnName)) {
                this.setValue(rowKey, columnName, '', silent);
                //silent 의 경우 데이터 모델의 change 이벤트가 발생하지 않기 때문에, 강제로 checkbox 를 세팅한다.
                if (silent && selectType === 'checkbox' && !isDisabledCheck) {
                    this.setValue(rowKey, '_button', true, silent);
                }
            }
        },

        /**
         * @deprecated
         * @param whichSide
         * @return {*}
         * @private
         */
        _getDataCollection: function(whichSide) {
            return this.renderModel.get(whichSide);
        },

        destroy: function() {

            this.stopListening();
            this.destroyChildren();
            this.$el.replaceWith(this.__$el);
            for (var property in this) {
                this[property] = null;
                delete this[property];
            }
        }
    });

    Grid.prototype.__instance = Grid.prototype.__instance || {};

    var ne = window.ne = ne || {};
    ne.Grid = View.Base.extend({
        initialize: function(options) {
            this.grid = new Grid(options);
            this.listenTo(this.grid, 'all', this._relayEvent, this);
        },
        /**
         * Grid 에서 발생하는 event 를 relay 한다.
         * @param eventName
         * @param params
         * @private
         */
        _relayEvent: function(eventName, params) {
            this.trigger.apply(this, arguments);
        },
        /**
         * rowKey 와 columnName 에 해당하는 값을 반환한다.
         *
         * @param {(Number|String)} rowKey    행 데이터의 고유 키
         * @param {String} columnName   컬럼 이름
         * @param {boolean} [isOriginal]  HTMLElement 리턴 여부
         * @return {(Number|String)}
         */
        get: function(rowKey, columnName, isOriginal) {

        },
        /**
         * columnName에 해당하는 column data list를 리턴한다.
         *
         * @param {String} columnName   컬럼 이름
         * @param {boolean} [isJsonString=false]  true 일 경우 JSON String 으로 반환한다.
         * @return {Array}
         */
        getColumn: function(columnName, isJsonString) {

        },
        /**
         * rowKey에 해당하는 행의 데이터를 리턴한다. isJsonString을 true로 설정하면 결과를 json객체로 변환하여 리턴한다.
         * @param rowKey
         * @param isJsonString
         * @return {Object}
         */
        getRow: function(rowKey, isJsonString) {
            var row = this.grid.dataModel.get(rowKey).toJSON(),
                rowData = isJsonString ? $.toJSON(row) : row;
            return rowData;
        },
        /**
         * 그리드 전체 데이터 중에서 index에 해당하는 순서의 데이터 객체를 리턴한다.
         * @param {Number} index
         * @return {Object}
         */
        getRowAt: function(index) {
            return this.grid.dataModel.at(index).toJSON();
        },
        /**
         * 현재 그리드에 설정된 전체 데이터의 개수를 리턴한다.
         * @return {Number}
         */
        getRowCount: function() {
            return this.grid.dataModel.length;
        },
        getRowSpan: function() {

        },
        /**
         * 그리드 내에서 현재 선택된 row의 키값을 리턴한다.
         * @return {(Number|String)}
         */
        getSelectedRowKey: function() {
            return this.grid.focusModel.which().rowKey;
        },
        /**
         * rowKey 와 columnName 에 해당하는 element 를 반환한다.
         * @param {(Number|String)} rowKey    행 데이터의 고유 키
         * @param {String} columnName   컬럼 이름
         * @return {jQuery} 해당 jQuery Element
         */
        getElement: function(rowKey, columnName) {
            return this.grid.getElement(rowKey, columnName);
        },
        /**
         *
         * @param {(Number|String)} rowKey    행 데이터의 고유 키
         * @param {String} columnName   컬럼 이름
         * @param {(Number|String)} columnValue 할당될 값
         */
        set: function(rowKey, columnName, columnValue) {

        },
        /**
         *
         * @param {String} columnName   컬럼 이름
         * @param {(Number|String)} columnValue 할당될 값
         */
        setColumn: function(columnName, columnValue) {

        },

        /**
         * @TODO: Naming 고민중..
         */
        setRowList: function(rowList) {
            this.grid.setRowList(rowList);
        },
        /**
         * rowKey, columnName에 해당하는 셀에 포커싱한다.
         * @param {(Number|String)} rowKey    행 데이터의 고유 키
         * @param {String} columnName   컬럼 이름
         * @param {boolean} [isScrollable=false] 그리드에서 해당 영역으로 scroll 할지 여부
         */
        focus: function(rowKey, columnName, isScrollable) {
            this.grid.focus(rowKey, columnName, isScrollable);
        },
        /**
         * 셀을 편집모드로 전환한다.
         * @param {(Number|String)} rowKey    행 데이터의 고유 키
         * @param {String} columnName   컬럼 이름
         * @param {boolean} [isScrollable=false] 그리드에서 해당 영역으로 scroll 할지 여부
         * @private
         */
        focusIn: function(rowKey, columnName, isScrollable) {
            this.grid.focusIn(rowKey, columnName, isScrollable);
        },

        /**
         * grid 를 blur 한다.
         */
        blur: function() {
            this.grid.blur();
        },
        /**
         * 전체 행을 선택한다.
         */
        checkAll: function() {
            this.grid.checkAll();
        },
        /**
         * rowKey에 해당하는 행의 체크박스 및 라디오박스를 선택한다.
         * @param {(Number|String)} rowKey    행 데이터의 고유 키
         */
        check: function(rowKey) {
            this.grid.check(rowKey);
        },
        /**
         * 모든 행을 선택 해제 한다.
         */
        uncheckAll: function() {

        },
        /**
         * rowKey 에 해당하는 행의 체크박스 및 라디오박스를 선택한다.
         * @param {(Number|String)} rowKey    행 데이터의 고유 키
         */
        uncheck: function(rowKey) {

        },


        /**
         * @deprecated
         */
        checkRowState: function() {

        },
        /**
         * 그리드의 모든 데이터를 삭제하고 norowlayer 클래스명을 가지는 엘리먼트를 보여준다.
         */
        clear: function() {
            //@todo: empty 레이어 추가
        },
        /**
         * rowKey에 해당하는 그리드 데이터를 삭제한다.
         * @param {(Number|String)} rowKey    행 데이터의 고유 키
         * @param {Boolean} [isRemoveOriginalDta=false] 원본 데이터도 삭제 여부
         */
        removeRow: function(rowKey, isRemoveOriginalDta) {

        },
        /**
         * 그리드를 편집할 수 있도록 막았던 포커스를 풀고 딤드를 제거한다.
         */
        enable: function() {

        },
        /**
         * 그리드를 편집할 수 없도록 입력 엘리먼트들의 포커스를 막고, 옵션에 따라 딤드 처리한다.
         * @param [hasDimmedLayer=true]
         */
        disable: function(hasDimmedLayer) {

        },
        /**
         * rowKey에 해당하는 행을 활성화시킨다.
         * @param {(Number|String)} rowKey
         */
        enableRow: function(rowKey) {
            this.grid.dataModel.setRowState(rowKey, '');
        },
        /**
         * rowKey에 해당하는 행을 비활성화 시킨다.
         * @param {(Number|String)} rowKey    행 데이터의 고유 키
         */
        disableRow: function(rowKey) {
            this.grid.dataModel.setRowState(rowKey, 'DISABLED');
        },
        /**
         * rowKey에 해당하는 행의 메인 체크박스를 체크할 수 있도록 활성화 시킨다.
         * @param {(Number|String)} rowKey
         */
        enableCheck: function(rowKey) {
            this.grid.dataModel.setRowState(rowKey, '');
        },
        /**
         * rowKey에 해당하는 행의 메인 체크박스를 체크하지 못하도록 비활성화 시킨다.
         * @param {(Number|String)} rowKey
         */
        disableCheck: function(rowKey) {
            this.grid.dataModel.setRowState(rowKey, 'DISABLED_CHECK');
        },


        /**
         * 데이터 필터링 기능 함수. 전체 그리드 데이터의 columnName에 해당하는 데이터와 columnValue를 비교하여 필터링 한 결과를 그리드에 출력한다
         * @param {String} columnName
         * @param {(String|Number)} columnValue
         */
        filterData: function(columnName, columnValue) {

        },
        /**
         * 현재 선택된 행들의 키값만을 배열로 리턴한다.
         * @param {Boolean} [isJsonString=false]  true 일 경우 json 문자열을 리턴한다.
         * @return {Array|String}
         */
        getCheckedRowKeyList: function(isJsonString) {
            var checkedRowKeyList = this.grid.getCheckedRowKeyList();
            return isJsonString ? $.toJSON(checkedRowKeyList) : checkedRowKeyList;
        },
        /**
         * 현재 선택된 행들의 모든 데이터를 배열로 리턴한다.
         * @param {Boolean} [isJsonString=false]  true 일 경우 json 문자열을 리턴한다.
         * @return {Array|String}
         */
        getCheckedRowList: function(isJsonString) {
            var checkedRowList = this.grid.getCheckedRowList();
            return isJsonString ? $.toJSON(checkedRowList) : checkedRowList;
        },
        /**
         * 그리드에 설정된 컬럼모델 정보를 배열 형태로 리턴한다.
         * @return {Array}
         */
        getColumnModel: function() {
            return this.grid.columnModel.get('columnModelList');
        },
        /**
         * 현재 비활성화된 행들의 키값만을 배열로 리턴한다.
         * @return {Array}
         */
        getDisabledRowKeyList: function() {
            //@todo
        },
        /**
         * 그리드 내에서 변경된 데이터들의 목록을 구성하여 리턴한다.
         * 리턴되는 객체에는 inserted, edited, deleted 라는 필드가 있고,
         * 각 필드에는 변경된 데이터들이 배열로 구성되어 있다.
         *
         * @param {Boolean} [isRowKeyList]  true로 설정하면 키값만 저장하여 리턴
         * @param {Boolean} [isJsonString]  변경된 데이터 객체를 JSON문자열로 변환하여 리턴
         * @param {Boolean} [filteringColumnList]   행 데이터 중에서 데이터 변경으로 간주하지 않을 컬럼 이름을 배열로 설정한다.
         * @return {Array}
         */
        getModifiedRowList: function(isRowKeyList, isJsonString, filteringColumnList) {
            //@todo 파라미터 옵션에 따른 데이터 형 변화
            return this.grid.getModifiedRowList();
        },
        /**
         * 현재 그리드의 제일 끝에 행을 추가한다.
         * @param {object} rowData
         */
        appendRow: function(rowData) {
            this.grid.appendRow(rowData);
        },
        /**
         * 현재 그리드의 제일 앞에 행을 추가한다.
         * @param {object} rowData
         */
        prependRow: function(rowData) {
            this.grid.prependRow(rowData);
        },
        /**
         * 현재 그리드에 설정된 데이터의 변경 여부를 Boolean으로 리턴한다.
         * - getModifiedRowList() 함수의 결과값을 이용하여 입력/수정/삭제가 되었으면 true를 리턴하고 그렇지 않은 경우에는 false를 리턴한다.
         * @return {Boolean}
         */
        isChanged: function() {

        },
        getAddon: function(name) {
            return name ? this.grid.addOn[name] : this.grid.addOn;
        },

        /**
         * setRowList()를 통해 그리드에 설정된 초기 데이터 상태로 복원한다.
         * 그리드에서 수정되었던 내용을 초기화하는 용도로 사용한다.
         */
        restore: function() {
            var originalRowList = this.grid.dataModel.getOriginalRowList();
            this.grid.setRowList(originalRowList, false);
        },
        refreshLayout: function(){
            //todo
        },
        addClassNameToColumn: function() {

        },
        addClassNameToRow: function() {

        },
        removeClassNameFromColumn: function() {

        },
        removeClassNameFromRow: function() {

        },
        replaceRowList: function() {

        },
        /**
         * rowKey에 해당하는 행에 대해 선택한다.
         * - checkRow()는 행에 포함된 체크박스나 라디오박스를 선택하며, selectRow()는 클릭된 행이 선택되어졌음을 시각적으로 나타내기 위해 해당 행의 배경색을 변경한다.
         *
         * @param {(Number|String)} rowKey
         */
        select: function(rowKey) {

        },
        /**
         * 열 고정 위치를 변경한다.
         *
         * @param {Number} index 고정시킬 열의 인덱스
         */
        setColumnFixIndex: function(index) {
            this.grid.setColumnFixIndex(index);
        },

        setGridSize: function(size) {
            var dimensionModel = this.grid.dimensionModel,
                width = size && size.width || dimensionModel.get('width'),
                bodyHeight = dimensionModel.get('bodyHeight'),
                headerHeight = dimensionModel.get('headerHeight'),
                toolbarHeight = dimensionModel.get('toolbarHeight');

            if (size && size.height) {
                bodyHeight = height - (headerHeight + toolbarHeight);
            }
        },
        setHeaderColumnTitle: function() {

        },
        setScrollBarPosition: function() {

        },
        use: function(name, options) {
            this.grid.use(name, options);
            return this;
        }
    });

    ne.Grid.getInstanceById = function(id) {
        return Grid.prototype.__instance[id];
    };



})();