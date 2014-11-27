/**
 * @fileoverview 페이지네이션의 뷰를 생성하고, 이벤트를 건다.
 * (pug.Pagination 에서 분리)
 * @author 이제인(jein.yi@nhnent.com)
 */


var ne = window.ne || {};
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
 * @return {*}
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
 * @return {Number} 현재 페이지
 */
ne.Component.Pagination.prototype.getCurrentPage = function() {

    return this._currentPage || this._options['page'];

};

/**
 * 해당 페이지의 첫번째 아이템이 전체중 몇번째 인지 구한다
 *
 * @param {Number} pageNumber 해당 페이지 번호
 * @return {number}
 */
ne.Component.Pagination.prototype.getIndexOfFirstItem = function(pageNumber) {

    return this._getOption('itemPerPage') * (pageNumber - 1) + 1;

};

/**
 * 마지막 페이지 숫자를 구함
 *
 * @return {number} 마지막 페이지 숫자
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
 * @return {number} 페이지 범위내로 확인된 숫자
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
 * @return {ne.Component.Pagination}
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
 * @return {boolean}
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
 * @return {JQueryObject}
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
 * @return {jQueryObject}
 */
ne.Component.PaginationView.prototype.getElement = function() {

    return this._element;

};

/**
 * 클래스명에 Prefix 를 붙힘
 * Prefix는 options.classPrefix를 참조, 붙혀질 때 기존 클래스명의 언더바(_) 문자는 하이픈(-)으로 변환됨
 *
 * @param {String} className
 * @return {*}
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
 * @return {*}
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
 * @return {{left: *, right: *}}
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
