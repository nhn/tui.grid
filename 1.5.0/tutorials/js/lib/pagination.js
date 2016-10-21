(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
tui.util.defineNamespace('tui.component');
tui.component.Pagination = require('./src/js/pagination.js');

},{"./src/js/pagination.js":2}],2:[function(require,module,exports){
/**
 * @fileoverview Core of pagination component, create pagination view and attach events.
 * (from pug.Pagination)
 * @author NHN entertainment FE dev team(dl_javascript@nhnent.com)
 * @dependency jquery-1.8.3.min.js, code-snippet.js
 */

var View = require('./view.js');

/**
 * Pagination core class
 * @constructor Pagination
 *
 */
var Pagination = tui.util.defineClass(/**@lends Pagination.prototype */{
    /**
     * Initialize
     * @param {DataObject} options Option object
     * 		@param {Number} [options.itemCount=10] Total item count
     * 		@param {Number} [options.itemPerPage=10] Item count per page
     * 		@param {Number} [options.pagePerPageList=10] Display page link count
     * 		@param {Number} [options.page=1] page Display page after pagination draw.
     * 		@param {String} [options.moveUnit="pagelist"] Page move unit.
     * 			<ul>
     * 				<li>pagelist : Move page for unit</li>
     * 				<li>page : Move one page</li>
     * 			</ul>
     * 		@param {Boolean}[options.isCenterAlign=false] Whether current page keep center or not
     * 		@param {String} [options.insertTextNode=""] The coupler between page links
     * 		@param {String} [options.classPrefix=""] A prefix of class name
     * 		@param {String} [options.firstItemClassName="first-child"] The class name is granted first page link item
     * 		@param {String} [options.lastItemClassName="last-child"] The class name is granted first page link item
     * 		@param {String} [options.pageTemplate="<a href='#'>{=page}</a>"] The markup template to show page item such as 1, 2, 3, .. {=page} will be changed each page number.
     * 		@param {String} [options.currentPageTemplate="<strong>{=page}</strong>"] The markup template for current page {=page} will be changed current page number.
     * 		@param {jQueryObject} [options.$pre_endOn] The button element to move first page. If this option is not exist and the element that has class 'pre_end', component do not create this button.
     * 		@param {jQueryObject} [options.$preOn] The button element to move previouse page. If this option is not exist and the element that has class 'pre', component do not create this button.
     * 		@param {jQueryObject} [options.$nextOn] The button element to move next page. If this option is not exist and the element that has class 'next', component do not create this button.
     * 		@param {jQueryObject} [options.$lastOn] The button element to move last page. If this option is not exist and the element that has class 'last', component do not create this button.
     * 		@param {jQueryObject} [options.$pre_endOff] The element to show that pre_endOn button is not enable. If this option is not exist and the element that has class 'pre_endOff', component do not create this button.
     * 		@param {jQueryObject} [options.$preOff] The element to show that preOn button is not enable. If this option is not exist and the element that has class 'preOff', component do not create this button.
     * 		@param {jQueryObject} [options.$nextOff] The element to show that nextOn button is not enable. If this option is not exist and the element that has class 'nextOff', component do not create this button.
     * 		@param {jQueryObject} [options.$lastOff] The element to show that lastOn button is not enable. If this option is not exist and the element that has class 'lastOff', component do not create this button.
     * @param {jQueryObject} $element Pagination container
     */
    init: function(options, $element) {
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


        if (options.itemCount === 0) {
            /**
             * Option object
             * @type {Object}
             * @private
             */
            this._options = defaultOption;
        } else {
            this._options = tui.util.extend(defaultOption, options);
        }

        /**
         * Event handler savor
         * @type {Object}
         * @private
         */
        this._events = {};

        /**
         * view instance
         * @type {PaginationView}
         * @private
         */
        this._view = new View(this._options, $element);
        this._view.attachEvent('click', tui.util.bind(this._onClickPageList, this));

        this.movePageTo(this.getOption('page'), false);
    },

    /**
     * Reset pagination
     * @api
     * @param {*} itemCount Redraw page item count
     * @example
     *  pagination.reset();
     */
    reset: function(itemCount) {

        var isExist = tui.util.isExisty((itemCount !== null) && (itemCount !== undefined));

        if (!isExist) {
            itemCount = this.getOption('itemCount');
        }

        this.setOption('itemCount', itemCount);
        this.movePageTo(1, false);
    },

    /**
     * Get options
     * @param {String} optionKey Option key
     * @private
     * @returns {*}
     */
    getOption: function(optionKey) {
        return this._options[optionKey];
    },

    /**
     * Move to specific page, redraw list.
     * Befor move fire beforeMove event, After move fire afterMove event.
     * @api
     * @param {Number} targetPage Target page
     * @param {Boolean} isNotRunCustomEvent [isNotRunCustomEvent=true] Whether custom event fire or not
     * @example
     *  pagination.reset();
     */
    movePageTo: function(targetPage, isNotRunCustomEvent) {

        targetPage = this._convertToAvailPage(targetPage);
        this._currentPage = targetPage;

        if (!isNotRunCustomEvent) {
            /**
             * Fire 'beforeMove' event(CustomEvent)
             * @api
             * @event Pagination#beforeMove
             * @param {componentEvent} eventData
             * @param {String} eventData.eventType Custom event name
             * @param {Number} eventData.page Target page
             * @param {Function} eventData.stop Stop move specific page
             * @example
             * paganation.on("beforeMove", function(eventData) {
                var currentPage = eventData.page;
             });
             */

            if (!this.invoke('beforeMove', { page: targetPage })) {
                return;
            }
        }

        this._paginate(targetPage);

        if (isNotRunCustomEvent) {
            /**
             * Fire 'afterMove'
             * @api
             * @event Pagination#afterMove
             * @param {componentEvent} eventData
             * @param {String} eventData.eventType Custom event name
             * @param {Number} eventData.page Moved page
             * @example
             * paganation.on("beforeMove", function(eventData) {
            var currentPage = eventData.page;
         });
             */
            this.fire('afterMove', { page: targetPage });
        }
    },

    /**
     * Change option value
     * @param {String} optionKey The target option key
     * @param {*} optionValue The target option value
     * @private
     */
    setOption: function(optionKey, optionValue) {
        this._options[optionKey] = optionValue;
    },

    /**
     * Get current page
     * @returns {Number} Current page
     */
    getCurrentPage: function() {
        return this._currentPage || this._options['page'];
    },

    /**
     * Get item  index from list
     * @param {Number} pageNumber Page number
     * @returns {number}
     */
    getIndexOfFirstItem: function(pageNumber) {
        return this.getOption('itemPerPage') * (pageNumber - 1) + 1;
    },

    /**
     * Get Last page number
     * @returns {number}
     * @private
     */
    _getLastPage: function() {
        return Math.ceil(this.getOption('itemCount') / this.getOption('itemPerPage'));
    },

    /**
     * Index of list in total lists
     * @param {Number} pageNumber Page number
     * @return {Number}
     * @private
     */
    _getPageIndex: function(pageNumber) {
        // IsCenterAlign == true case
        if (this.getOption('isCenterAlign')) {
            var left = Math.floor(this.getOption('pagePerPageList') / 2),
                pageIndex = pageNumber - left;
            pageIndex = Math.max(pageIndex, 1);
            pageIndex = Math.min(pageIndex, this._getLastPage() - this.getOption('pagePerPageList') + 1);
            return pageIndex;
        }
        return Math.ceil(pageNumber / this.getOption("pagePerPageList"));
    },

    /**
     * Get page number of prev, next pages
     * @param {String} relativeName Directions(pre_end, next_end, pre, next)
     * @return {Number}
     * @private
     *     */
    _getRelativePage: function(relativeName) {
        var page = null,
            isMovePage = this.getOption('moveUnit') === 'page',
            currentPageIndex = this._getPageIndex(this.getCurrentPage());
        if(this.getOption('isCenterAlign')) {
            if (relativeName === 'pre') {
                page = isMovePage ? this.getCurrentPage() - 1 : currentPageIndex - 1;
            } else {
                page = isMovePage ? this.getCurrentPage() + 1 : currentPageIndex + this.getOption('pagePerPageList');
            }
        } else {
            if (relativeName === 'pre') {
                page = isMovePage ? this.getCurrentPage() - 1 : (currentPageIndex - 1) * this.getOption('pagePerPageList');
            } else {
                page = isMovePage ? this.getCurrentPage() + 1 : currentPageIndex * this.getOption('pagePerPageList') + 1;
            }
        }
        return page;
    },

    /**
     * Get avail page number from over number
     * If total page is 23, but input number is 30 => return 23
     * @param {Number} page Page number
     * @returns {number}
     * @private
     */
    _convertToAvailPage: function(page) {
        var lastPageNumber = this._getLastPage();
        page = Math.max(page, 1);
        page = Math.min(page, lastPageNumber);
        return page;
    },

    /**
     * Create require view set, notify view to update.
     * @param {Number} page
     * @private
     */
    _paginate: function(page){

        // 뷰의 버튼 및 페이지를 모두 제거 및 복사
        this._view.empty();

        var viewSet = {};

        viewSet.lastPage = this._getLastPage();
        viewSet.currentPageIndex = this._getPageIndex(page);
        viewSet.lastPageListIndex = this._getPageIndex(viewSet.lastPage);
        viewSet.page = page;

        this._view.update(viewSet, page);
    },

    /**
     * Pagelist click event hadnler
     * @param {JQueryEvent} event
     * @private
     */
    _onClickPageList: function(event) {

        event.preventDefault();
        var page = null,
            targetElement = $(event.target),
            targetPage;

        if (this._view.isIn(targetElement, this.getOption('$pre_endOn'))) {
            page = 1;
        } else if (this._view.isIn(targetElement, this.getOption('$lastOn'))) {
            page = this._getLastPage();
        } else if (this._view.isIn(targetElement, this.getOption('$preOn'))) {
            page = this._getRelativePage('pre');
        } else if (this._view.isIn(targetElement, this.getOption('$nextOn'))) {
            page = this._getRelativePage('next');
        } else {

            targetPage = this._view.getPageElement(targetElement);

            if (targetPage && targetPage.length) {
                page = parseInt(targetPage.text(), 10);
            } else {
                return;
            }
        }

        /**
         Fire 'click' custom event when page button clicked
         @param {componentEvent} eventData
         @param {String} eventData.eventType Custom event name
         @param {Number} eventData.page Page to move
         @param {Function} eventData.stop Stop page move
         **/

        var isFired = this.invoke("click", {"page" : page});
        if (!isFired) {
            return;
        }

        this.movePageTo(page);
    }
});
// CustomEvent  Mixin
tui.util.CustomEvents.mixin(Pagination);

module.exports = Pagination;

},{"./view.js":3}],3:[function(require,module,exports){
/**
 * @fileoverview Pagination view manage all of draw elements
 * (from pug.Pagination)
 * @author NHN entertainment FE dev team Jein Yi(jein.yi@nhnent.com)
 * @dependency pagination.js
 */
/**
 * @constructor View
 * @param {Object} options Option object
 * @param {Object} $element Container element
 *
 */
var View = tui.util.defineClass(/** @lends View.prototype */{
    init: function(options, $element) {
        /**
         * Pagination root element
         * @type {jQueryObject}
         * @private
         */
        this._element = $element;

        /**
         * Pagination options
         * @type {Object}
         * @private
         */
        this._options = options;

        /**
         * Selectors
         * @type {Object}
         * @private
         */
        this._elementSelector = {};

        /**
         * Page item list
         * @type {Array}
         * @private
         */
        this._pageItemList = [];

        tui.util.extend(options, {
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
    },

    /**
     * Update view
     * @param {Object} viewSet Values of each pagination view components
     */
    update: function(viewSet) {
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
            viewSet.lastPageListIndex = viewSet.lastPage;
        }

        this._setFirst(viewSet);
        this._setPrev(viewSet);
        this._setPageNumbers(viewSet);
        this._setNext(viewSet);
        this._setLast(viewSet);
    },

    /**
     * Check include
     * @param {JQueryObject} $find Target element
     * @param {JQueryObject} $parent Wrapper element
     * @returns {boolean}
     */
    isIn: function($find, $parent) {
        if (!$parent) {
            return false;
        }
        return ($find[0] === $parent[0]) ? true : $.contains($parent, $find);
    },

    /**
     * Get base(root) element
     * @returns {JQueryObject}
     */
    getBaseElement: function() {
        return this.getElement();
    },

    /**
     * Reset base element
     */
    empty: function(){

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
    },

    /**
     * Find target element from page elements
     * @param {jQueryObject|HTMLElement} el Target element
     * @return {jQueryObject}
     */
    getPageElement: function(el) {

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
    },

    /**
     * Attach Events
     * @param {String} eventType Event name to attach
     * @param {Function} callback Callback function
     */
    attachEvent: function(eventType, callback) {

        var targetElement = this._element,
            isSavedElement = tui.util.isString(targetElement) && this._elementSelector[targetElement];

        if (isSavedElement) {
            targetElement = this._getElement(targetElement, true);
        }

        if (targetElement && eventType && callback) {
            $(targetElement).bind(eventType, null, callback);
        }
    },

    /**
     * Get root element
     * @returns {jQueryObject}
     */
    getElement: function() {
        return this._element;
    },

    /**
     * Return className added prefix
     * @param {String} className Class name to be wrapping
     * @returns {*}
     * @private
     */
    _wrapPrefix: function(className) {
        var classPrefix = this._options['classPrefix'];
        return classPrefix ? classPrefix + className.replace(/_/g, '-') : className;
    },

    /**
     * Put insertTextNode between page items
     * @private
     */
    _addTextNode: function() {
        var textNode = this._options['insertTextNode'];
        this._element.append(document.createTextNode(textNode));
    },

    /**
     * Clone element
     * @returns {*}
     * @private
     */
    _clone: function($link) {

        if ($link && $link.length && $link.get(0).cloneNode) {
            return $($link.get(0).cloneNode(true));
        }
        return $link;

    },

    /**
     * Wrapping class by page result
     * @param {Number} lastNum Last page number
     * @private
     */
    _setPageResult: function(lastNum) {

        if (lastNum === 0) {
            this._element.addClass(this._wrapPrefix('no-result'));
        } else if (lastNum === 1) {
            this._element.addClass(this._wrapPrefix('only-one')).removeClass(this._wrapPrefix('no-result'));
        } else {
            this._element.removeClass(this._wrapPrefix('only-one')).removeClass(this._wrapPrefix('no-result'));
        }

    },

    /**
     * Get each edge page
     * @param {object} viewSet Pagination view elements set
     * @returns {{left: *, right: *}}
     * @private
     */
    _getEdge: function(viewSet) {

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
    },

    /**
     * Decide to show first page link by whether first page or not
     * @param {object} viewSet Pagination view elements set
     * @private
     */
    _setFirst: function(viewSet) {
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

    },

    /**
     * Decide to show previous page link by whether first page or not
     * @param {object} viewSet Pagination view elements set
     * @private
     */
    _setPrev: function(viewSet) {
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
    },
    /**
     * Decide to show next page link by whether first page or not
     * @param {object} viewSet Pagination view elements set
     * @private
     */
    _setNext: function(viewSet) {
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

    },
    /**
     * Decide to show last page link by whether first page or not
     * @param {object} viewSet Pagination view elements set
     * @private
     */
    _setLast: function(viewSet) {

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

    },
    /**
     * Set page number that will be drawn
     * @param {object} viewSet Pagination view elements set
     * @private
     */
    _setPageNumbers: function(viewSet) {
        var $pageItem,
            firstPage = viewSet.leftPageNumber,
            lastPage = viewSet.rightPageNumber,
            options = this._options,
            i;

        for (i = firstPage; i <= lastPage; i++) {
            if (i === viewSet.page) {
                $pageItem = $(options.currentPageTemplate.replace('{=page}', i.toString()));
            } else {
                $pageItem = $(options.pageTemplate.replace('{=page}', i.toString()));
                this._pageItemList.push($pageItem);
            }

            if (i === firstPage) {
                $pageItem.addClass(this._wrapPrefix(options['firstItemClassName']));
            }
            if (i === lastPage) {
                $pageItem.addClass(this._wrapPrefix(options['lastItemClassName']));
            }
            this._element.append($pageItem);
            this._addTextNode();
        }
    }
});

module.exports = View;

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsInNyYy9qcy9wYWdpbmF0aW9uLmpzIiwic3JjL2pzL3ZpZXcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ0dWkudXRpbC5kZWZpbmVOYW1lc3BhY2UoJ3R1aS5jb21wb25lbnQnKTtcbnR1aS5jb21wb25lbnQuUGFnaW5hdGlvbiA9IHJlcXVpcmUoJy4vc3JjL2pzL3BhZ2luYXRpb24uanMnKTtcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBDb3JlIG9mIHBhZ2luYXRpb24gY29tcG9uZW50LCBjcmVhdGUgcGFnaW5hdGlvbiB2aWV3IGFuZCBhdHRhY2ggZXZlbnRzLlxuICogKGZyb20gcHVnLlBhZ2luYXRpb24pXG4gKiBAYXV0aG9yIE5ITiBlbnRlcnRhaW5tZW50IEZFIGRldiB0ZWFtKGRsX2phdmFzY3JpcHRAbmhuZW50LmNvbSlcbiAqIEBkZXBlbmRlbmN5IGpxdWVyeS0xLjguMy5taW4uanMsIGNvZGUtc25pcHBldC5qc1xuICovXG5cbnZhciBWaWV3ID0gcmVxdWlyZSgnLi92aWV3LmpzJyk7XG5cbi8qKlxuICogUGFnaW5hdGlvbiBjb3JlIGNsYXNzXG4gKiBAY29uc3RydWN0b3IgUGFnaW5hdGlvblxuICpcbiAqL1xudmFyIFBhZ2luYXRpb24gPSB0dWkudXRpbC5kZWZpbmVDbGFzcygvKipAbGVuZHMgUGFnaW5hdGlvbi5wcm90b3R5cGUgKi97XG4gICAgLyoqXG4gICAgICogSW5pdGlhbGl6ZVxuICAgICAqIEBwYXJhbSB7RGF0YU9iamVjdH0gb3B0aW9ucyBPcHRpb24gb2JqZWN0XG4gICAgICogXHRcdEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5pdGVtQ291bnQ9MTBdIFRvdGFsIGl0ZW0gY291bnRcbiAgICAgKiBcdFx0QHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLml0ZW1QZXJQYWdlPTEwXSBJdGVtIGNvdW50IHBlciBwYWdlXG4gICAgICogXHRcdEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5wYWdlUGVyUGFnZUxpc3Q9MTBdIERpc3BsYXkgcGFnZSBsaW5rIGNvdW50XG4gICAgICogXHRcdEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5wYWdlPTFdIHBhZ2UgRGlzcGxheSBwYWdlIGFmdGVyIHBhZ2luYXRpb24gZHJhdy5cbiAgICAgKiBcdFx0QHBhcmFtIHtTdHJpbmd9IFtvcHRpb25zLm1vdmVVbml0PVwicGFnZWxpc3RcIl0gUGFnZSBtb3ZlIHVuaXQuXG4gICAgICogXHRcdFx0PHVsPlxuICAgICAqIFx0XHRcdFx0PGxpPnBhZ2VsaXN0IDogTW92ZSBwYWdlIGZvciB1bml0PC9saT5cbiAgICAgKiBcdFx0XHRcdDxsaT5wYWdlIDogTW92ZSBvbmUgcGFnZTwvbGk+XG4gICAgICogXHRcdFx0PC91bD5cbiAgICAgKiBcdFx0QHBhcmFtIHtCb29sZWFufVtvcHRpb25zLmlzQ2VudGVyQWxpZ249ZmFsc2VdIFdoZXRoZXIgY3VycmVudCBwYWdlIGtlZXAgY2VudGVyIG9yIG5vdFxuICAgICAqIFx0XHRAcGFyYW0ge1N0cmluZ30gW29wdGlvbnMuaW5zZXJ0VGV4dE5vZGU9XCJcIl0gVGhlIGNvdXBsZXIgYmV0d2VlbiBwYWdlIGxpbmtzXG4gICAgICogXHRcdEBwYXJhbSB7U3RyaW5nfSBbb3B0aW9ucy5jbGFzc1ByZWZpeD1cIlwiXSBBIHByZWZpeCBvZiBjbGFzcyBuYW1lXG4gICAgICogXHRcdEBwYXJhbSB7U3RyaW5nfSBbb3B0aW9ucy5maXJzdEl0ZW1DbGFzc05hbWU9XCJmaXJzdC1jaGlsZFwiXSBUaGUgY2xhc3MgbmFtZSBpcyBncmFudGVkIGZpcnN0IHBhZ2UgbGluayBpdGVtXG4gICAgICogXHRcdEBwYXJhbSB7U3RyaW5nfSBbb3B0aW9ucy5sYXN0SXRlbUNsYXNzTmFtZT1cImxhc3QtY2hpbGRcIl0gVGhlIGNsYXNzIG5hbWUgaXMgZ3JhbnRlZCBmaXJzdCBwYWdlIGxpbmsgaXRlbVxuICAgICAqIFx0XHRAcGFyYW0ge1N0cmluZ30gW29wdGlvbnMucGFnZVRlbXBsYXRlPVwiPGEgaHJlZj0nIyc+ez1wYWdlfTwvYT5cIl0gVGhlIG1hcmt1cCB0ZW1wbGF0ZSB0byBzaG93IHBhZ2UgaXRlbSBzdWNoIGFzIDEsIDIsIDMsIC4uIHs9cGFnZX0gd2lsbCBiZSBjaGFuZ2VkIGVhY2ggcGFnZSBudW1iZXIuXG4gICAgICogXHRcdEBwYXJhbSB7U3RyaW5nfSBbb3B0aW9ucy5jdXJyZW50UGFnZVRlbXBsYXRlPVwiPHN0cm9uZz57PXBhZ2V9PC9zdHJvbmc+XCJdIFRoZSBtYXJrdXAgdGVtcGxhdGUgZm9yIGN1cnJlbnQgcGFnZSB7PXBhZ2V9IHdpbGwgYmUgY2hhbmdlZCBjdXJyZW50IHBhZ2UgbnVtYmVyLlxuICAgICAqIFx0XHRAcGFyYW0ge2pRdWVyeU9iamVjdH0gW29wdGlvbnMuJHByZV9lbmRPbl0gVGhlIGJ1dHRvbiBlbGVtZW50IHRvIG1vdmUgZmlyc3QgcGFnZS4gSWYgdGhpcyBvcHRpb24gaXMgbm90IGV4aXN0IGFuZCB0aGUgZWxlbWVudCB0aGF0IGhhcyBjbGFzcyAncHJlX2VuZCcsIGNvbXBvbmVudCBkbyBub3QgY3JlYXRlIHRoaXMgYnV0dG9uLlxuICAgICAqIFx0XHRAcGFyYW0ge2pRdWVyeU9iamVjdH0gW29wdGlvbnMuJHByZU9uXSBUaGUgYnV0dG9uIGVsZW1lbnQgdG8gbW92ZSBwcmV2aW91c2UgcGFnZS4gSWYgdGhpcyBvcHRpb24gaXMgbm90IGV4aXN0IGFuZCB0aGUgZWxlbWVudCB0aGF0IGhhcyBjbGFzcyAncHJlJywgY29tcG9uZW50IGRvIG5vdCBjcmVhdGUgdGhpcyBidXR0b24uXG4gICAgICogXHRcdEBwYXJhbSB7alF1ZXJ5T2JqZWN0fSBbb3B0aW9ucy4kbmV4dE9uXSBUaGUgYnV0dG9uIGVsZW1lbnQgdG8gbW92ZSBuZXh0IHBhZ2UuIElmIHRoaXMgb3B0aW9uIGlzIG5vdCBleGlzdCBhbmQgdGhlIGVsZW1lbnQgdGhhdCBoYXMgY2xhc3MgJ25leHQnLCBjb21wb25lbnQgZG8gbm90IGNyZWF0ZSB0aGlzIGJ1dHRvbi5cbiAgICAgKiBcdFx0QHBhcmFtIHtqUXVlcnlPYmplY3R9IFtvcHRpb25zLiRsYXN0T25dIFRoZSBidXR0b24gZWxlbWVudCB0byBtb3ZlIGxhc3QgcGFnZS4gSWYgdGhpcyBvcHRpb24gaXMgbm90IGV4aXN0IGFuZCB0aGUgZWxlbWVudCB0aGF0IGhhcyBjbGFzcyAnbGFzdCcsIGNvbXBvbmVudCBkbyBub3QgY3JlYXRlIHRoaXMgYnV0dG9uLlxuICAgICAqIFx0XHRAcGFyYW0ge2pRdWVyeU9iamVjdH0gW29wdGlvbnMuJHByZV9lbmRPZmZdIFRoZSBlbGVtZW50IHRvIHNob3cgdGhhdCBwcmVfZW5kT24gYnV0dG9uIGlzIG5vdCBlbmFibGUuIElmIHRoaXMgb3B0aW9uIGlzIG5vdCBleGlzdCBhbmQgdGhlIGVsZW1lbnQgdGhhdCBoYXMgY2xhc3MgJ3ByZV9lbmRPZmYnLCBjb21wb25lbnQgZG8gbm90IGNyZWF0ZSB0aGlzIGJ1dHRvbi5cbiAgICAgKiBcdFx0QHBhcmFtIHtqUXVlcnlPYmplY3R9IFtvcHRpb25zLiRwcmVPZmZdIFRoZSBlbGVtZW50IHRvIHNob3cgdGhhdCBwcmVPbiBidXR0b24gaXMgbm90IGVuYWJsZS4gSWYgdGhpcyBvcHRpb24gaXMgbm90IGV4aXN0IGFuZCB0aGUgZWxlbWVudCB0aGF0IGhhcyBjbGFzcyAncHJlT2ZmJywgY29tcG9uZW50IGRvIG5vdCBjcmVhdGUgdGhpcyBidXR0b24uXG4gICAgICogXHRcdEBwYXJhbSB7alF1ZXJ5T2JqZWN0fSBbb3B0aW9ucy4kbmV4dE9mZl0gVGhlIGVsZW1lbnQgdG8gc2hvdyB0aGF0IG5leHRPbiBidXR0b24gaXMgbm90IGVuYWJsZS4gSWYgdGhpcyBvcHRpb24gaXMgbm90IGV4aXN0IGFuZCB0aGUgZWxlbWVudCB0aGF0IGhhcyBjbGFzcyAnbmV4dE9mZicsIGNvbXBvbmVudCBkbyBub3QgY3JlYXRlIHRoaXMgYnV0dG9uLlxuICAgICAqIFx0XHRAcGFyYW0ge2pRdWVyeU9iamVjdH0gW29wdGlvbnMuJGxhc3RPZmZdIFRoZSBlbGVtZW50IHRvIHNob3cgdGhhdCBsYXN0T24gYnV0dG9uIGlzIG5vdCBlbmFibGUuIElmIHRoaXMgb3B0aW9uIGlzIG5vdCBleGlzdCBhbmQgdGhlIGVsZW1lbnQgdGhhdCBoYXMgY2xhc3MgJ2xhc3RPZmYnLCBjb21wb25lbnQgZG8gbm90IGNyZWF0ZSB0aGlzIGJ1dHRvbi5cbiAgICAgKiBAcGFyYW0ge2pRdWVyeU9iamVjdH0gJGVsZW1lbnQgUGFnaW5hdGlvbiBjb250YWluZXJcbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbihvcHRpb25zLCAkZWxlbWVudCkge1xuICAgICAgICB2YXIgZGVmYXVsdE9wdGlvbiA9IHtcbiAgICAgICAgICAgIGl0ZW1Db3VudDogMTAsXG4gICAgICAgICAgICBpdGVtUGVyUGFnZTogMTAsXG4gICAgICAgICAgICBwYWdlUGVyUGFnZUxpc3Q6IDEwLFxuICAgICAgICAgICAgcGFnZTogMSxcbiAgICAgICAgICAgIG1vdmVVbml0OiAncGFnZWxpc3QnLFxuICAgICAgICAgICAgaXNDZW50ZXJBbGlnbjogZmFsc2UsXG4gICAgICAgICAgICBpbnNlcnRUZXh0Tm9kZTogJycsXG4gICAgICAgICAgICBjbGFzc1ByZWZpeDogJycsXG4gICAgICAgICAgICBmaXJzdEl0ZW1DbGFzc05hbWU6ICdmaXJzdC1jaGlsZCcsXG4gICAgICAgICAgICBsYXN0SXRlbUNsYXNzTmFtZTogJ2xhc3QtY2hpbGQnLFxuICAgICAgICAgICAgcGFnZVRlbXBsYXRlOiAnPGEgaHJlZj1cIiNcIj57PXBhZ2V9PC9hPicsXG4gICAgICAgICAgICBjdXJyZW50UGFnZVRlbXBsYXRlOiAnPHN0cm9uZz57PXBhZ2V9PC9zdHJvbmc+J1xuICAgICAgICB9O1xuXG5cbiAgICAgICAgaWYgKG9wdGlvbnMuaXRlbUNvdW50ID09PSAwKSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIE9wdGlvbiBvYmplY3RcbiAgICAgICAgICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzLl9vcHRpb25zID0gZGVmYXVsdE9wdGlvbjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX29wdGlvbnMgPSB0dWkudXRpbC5leHRlbmQoZGVmYXVsdE9wdGlvbiwgb3B0aW9ucyk7XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogRXZlbnQgaGFuZGxlciBzYXZvclxuICAgICAgICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fZXZlbnRzID0ge307XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIHZpZXcgaW5zdGFuY2VcbiAgICAgICAgICogQHR5cGUge1BhZ2luYXRpb25WaWV3fVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fdmlldyA9IG5ldyBWaWV3KHRoaXMuX29wdGlvbnMsICRlbGVtZW50KTtcbiAgICAgICAgdGhpcy5fdmlldy5hdHRhY2hFdmVudCgnY2xpY2snLCB0dWkudXRpbC5iaW5kKHRoaXMuX29uQ2xpY2tQYWdlTGlzdCwgdGhpcykpO1xuXG4gICAgICAgIHRoaXMubW92ZVBhZ2VUbyh0aGlzLmdldE9wdGlvbigncGFnZScpLCBmYWxzZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlc2V0IHBhZ2luYXRpb25cbiAgICAgKiBAYXBpXG4gICAgICogQHBhcmFtIHsqfSBpdGVtQ291bnQgUmVkcmF3IHBhZ2UgaXRlbSBjb3VudFxuICAgICAqIEBleGFtcGxlXG4gICAgICogIHBhZ2luYXRpb24ucmVzZXQoKTtcbiAgICAgKi9cbiAgICByZXNldDogZnVuY3Rpb24oaXRlbUNvdW50KSB7XG5cbiAgICAgICAgdmFyIGlzRXhpc3QgPSB0dWkudXRpbC5pc0V4aXN0eSgoaXRlbUNvdW50ICE9PSBudWxsKSAmJiAoaXRlbUNvdW50ICE9PSB1bmRlZmluZWQpKTtcblxuICAgICAgICBpZiAoIWlzRXhpc3QpIHtcbiAgICAgICAgICAgIGl0ZW1Db3VudCA9IHRoaXMuZ2V0T3B0aW9uKCdpdGVtQ291bnQnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc2V0T3B0aW9uKCdpdGVtQ291bnQnLCBpdGVtQ291bnQpO1xuICAgICAgICB0aGlzLm1vdmVQYWdlVG8oMSwgZmFsc2UpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgb3B0aW9uc1xuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBvcHRpb25LZXkgT3B0aW9uIGtleVxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHJldHVybnMgeyp9XG4gICAgICovXG4gICAgZ2V0T3B0aW9uOiBmdW5jdGlvbihvcHRpb25LZXkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX29wdGlvbnNbb3B0aW9uS2V5XTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogTW92ZSB0byBzcGVjaWZpYyBwYWdlLCByZWRyYXcgbGlzdC5cbiAgICAgKiBCZWZvciBtb3ZlIGZpcmUgYmVmb3JlTW92ZSBldmVudCwgQWZ0ZXIgbW92ZSBmaXJlIGFmdGVyTW92ZSBldmVudC5cbiAgICAgKiBAYXBpXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHRhcmdldFBhZ2UgVGFyZ2V0IHBhZ2VcbiAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IGlzTm90UnVuQ3VzdG9tRXZlbnQgW2lzTm90UnVuQ3VzdG9tRXZlbnQ9dHJ1ZV0gV2hldGhlciBjdXN0b20gZXZlbnQgZmlyZSBvciBub3RcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqICBwYWdpbmF0aW9uLnJlc2V0KCk7XG4gICAgICovXG4gICAgbW92ZVBhZ2VUbzogZnVuY3Rpb24odGFyZ2V0UGFnZSwgaXNOb3RSdW5DdXN0b21FdmVudCkge1xuXG4gICAgICAgIHRhcmdldFBhZ2UgPSB0aGlzLl9jb252ZXJ0VG9BdmFpbFBhZ2UodGFyZ2V0UGFnZSk7XG4gICAgICAgIHRoaXMuX2N1cnJlbnRQYWdlID0gdGFyZ2V0UGFnZTtcblxuICAgICAgICBpZiAoIWlzTm90UnVuQ3VzdG9tRXZlbnQpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogRmlyZSAnYmVmb3JlTW92ZScgZXZlbnQoQ3VzdG9tRXZlbnQpXG4gICAgICAgICAgICAgKiBAYXBpXG4gICAgICAgICAgICAgKiBAZXZlbnQgUGFnaW5hdGlvbiNiZWZvcmVNb3ZlXG4gICAgICAgICAgICAgKiBAcGFyYW0ge2NvbXBvbmVudEV2ZW50fSBldmVudERhdGFcbiAgICAgICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBldmVudERhdGEuZXZlbnRUeXBlIEN1c3RvbSBldmVudCBuYW1lXG4gICAgICAgICAgICAgKiBAcGFyYW0ge051bWJlcn0gZXZlbnREYXRhLnBhZ2UgVGFyZ2V0IHBhZ2VcbiAgICAgICAgICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGV2ZW50RGF0YS5zdG9wIFN0b3AgbW92ZSBzcGVjaWZpYyBwYWdlXG4gICAgICAgICAgICAgKiBAZXhhbXBsZVxuICAgICAgICAgICAgICogcGFnYW5hdGlvbi5vbihcImJlZm9yZU1vdmVcIiwgZnVuY3Rpb24oZXZlbnREYXRhKSB7XG4gICAgICAgICAgICAgICAgdmFyIGN1cnJlbnRQYWdlID0gZXZlbnREYXRhLnBhZ2U7XG4gICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgKi9cblxuICAgICAgICAgICAgaWYgKCF0aGlzLmludm9rZSgnYmVmb3JlTW92ZScsIHsgcGFnZTogdGFyZ2V0UGFnZSB9KSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX3BhZ2luYXRlKHRhcmdldFBhZ2UpO1xuXG4gICAgICAgIGlmIChpc05vdFJ1bkN1c3RvbUV2ZW50KSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEZpcmUgJ2FmdGVyTW92ZSdcbiAgICAgICAgICAgICAqIEBhcGlcbiAgICAgICAgICAgICAqIEBldmVudCBQYWdpbmF0aW9uI2FmdGVyTW92ZVxuICAgICAgICAgICAgICogQHBhcmFtIHtjb21wb25lbnRFdmVudH0gZXZlbnREYXRhXG4gICAgICAgICAgICAgKiBAcGFyYW0ge1N0cmluZ30gZXZlbnREYXRhLmV2ZW50VHlwZSBDdXN0b20gZXZlbnQgbmFtZVxuICAgICAgICAgICAgICogQHBhcmFtIHtOdW1iZXJ9IGV2ZW50RGF0YS5wYWdlIE1vdmVkIHBhZ2VcbiAgICAgICAgICAgICAqIEBleGFtcGxlXG4gICAgICAgICAgICAgKiBwYWdhbmF0aW9uLm9uKFwiYmVmb3JlTW92ZVwiLCBmdW5jdGlvbihldmVudERhdGEpIHtcbiAgICAgICAgICAgIHZhciBjdXJyZW50UGFnZSA9IGV2ZW50RGF0YS5wYWdlO1xuICAgICAgICAgfSk7XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXMuZmlyZSgnYWZ0ZXJNb3ZlJywgeyBwYWdlOiB0YXJnZXRQYWdlIH0pO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENoYW5nZSBvcHRpb24gdmFsdWVcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gb3B0aW9uS2V5IFRoZSB0YXJnZXQgb3B0aW9uIGtleVxuICAgICAqIEBwYXJhbSB7Kn0gb3B0aW9uVmFsdWUgVGhlIHRhcmdldCBvcHRpb24gdmFsdWVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHNldE9wdGlvbjogZnVuY3Rpb24ob3B0aW9uS2V5LCBvcHRpb25WYWx1ZSkge1xuICAgICAgICB0aGlzLl9vcHRpb25zW29wdGlvbktleV0gPSBvcHRpb25WYWx1ZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGN1cnJlbnQgcGFnZVxuICAgICAqIEByZXR1cm5zIHtOdW1iZXJ9IEN1cnJlbnQgcGFnZVxuICAgICAqL1xuICAgIGdldEN1cnJlbnRQYWdlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2N1cnJlbnRQYWdlIHx8IHRoaXMuX29wdGlvbnNbJ3BhZ2UnXTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGl0ZW0gIGluZGV4IGZyb20gbGlzdFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBwYWdlTnVtYmVyIFBhZ2UgbnVtYmVyXG4gICAgICogQHJldHVybnMge251bWJlcn1cbiAgICAgKi9cbiAgICBnZXRJbmRleE9mRmlyc3RJdGVtOiBmdW5jdGlvbihwYWdlTnVtYmVyKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldE9wdGlvbignaXRlbVBlclBhZ2UnKSAqIChwYWdlTnVtYmVyIC0gMSkgKyAxO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgTGFzdCBwYWdlIG51bWJlclxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0TGFzdFBhZ2U6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gTWF0aC5jZWlsKHRoaXMuZ2V0T3B0aW9uKCdpdGVtQ291bnQnKSAvIHRoaXMuZ2V0T3B0aW9uKCdpdGVtUGVyUGFnZScpKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSW5kZXggb2YgbGlzdCBpbiB0b3RhbCBsaXN0c1xuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBwYWdlTnVtYmVyIFBhZ2UgbnVtYmVyXG4gICAgICogQHJldHVybiB7TnVtYmVyfVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldFBhZ2VJbmRleDogZnVuY3Rpb24ocGFnZU51bWJlcikge1xuICAgICAgICAvLyBJc0NlbnRlckFsaWduID09IHRydWUgY2FzZVxuICAgICAgICBpZiAodGhpcy5nZXRPcHRpb24oJ2lzQ2VudGVyQWxpZ24nKSkge1xuICAgICAgICAgICAgdmFyIGxlZnQgPSBNYXRoLmZsb29yKHRoaXMuZ2V0T3B0aW9uKCdwYWdlUGVyUGFnZUxpc3QnKSAvIDIpLFxuICAgICAgICAgICAgICAgIHBhZ2VJbmRleCA9IHBhZ2VOdW1iZXIgLSBsZWZ0O1xuICAgICAgICAgICAgcGFnZUluZGV4ID0gTWF0aC5tYXgocGFnZUluZGV4LCAxKTtcbiAgICAgICAgICAgIHBhZ2VJbmRleCA9IE1hdGgubWluKHBhZ2VJbmRleCwgdGhpcy5fZ2V0TGFzdFBhZ2UoKSAtIHRoaXMuZ2V0T3B0aW9uKCdwYWdlUGVyUGFnZUxpc3QnKSArIDEpO1xuICAgICAgICAgICAgcmV0dXJuIHBhZ2VJbmRleDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gTWF0aC5jZWlsKHBhZ2VOdW1iZXIgLyB0aGlzLmdldE9wdGlvbihcInBhZ2VQZXJQYWdlTGlzdFwiKSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBwYWdlIG51bWJlciBvZiBwcmV2LCBuZXh0IHBhZ2VzXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHJlbGF0aXZlTmFtZSBEaXJlY3Rpb25zKHByZV9lbmQsIG5leHRfZW5kLCBwcmUsIG5leHQpXG4gICAgICogQHJldHVybiB7TnVtYmVyfVxuICAgICAqIEBwcml2YXRlXG4gICAgICogICAgICovXG4gICAgX2dldFJlbGF0aXZlUGFnZTogZnVuY3Rpb24ocmVsYXRpdmVOYW1lKSB7XG4gICAgICAgIHZhciBwYWdlID0gbnVsbCxcbiAgICAgICAgICAgIGlzTW92ZVBhZ2UgPSB0aGlzLmdldE9wdGlvbignbW92ZVVuaXQnKSA9PT0gJ3BhZ2UnLFxuICAgICAgICAgICAgY3VycmVudFBhZ2VJbmRleCA9IHRoaXMuX2dldFBhZ2VJbmRleCh0aGlzLmdldEN1cnJlbnRQYWdlKCkpO1xuICAgICAgICBpZih0aGlzLmdldE9wdGlvbignaXNDZW50ZXJBbGlnbicpKSB7XG4gICAgICAgICAgICBpZiAocmVsYXRpdmVOYW1lID09PSAncHJlJykge1xuICAgICAgICAgICAgICAgIHBhZ2UgPSBpc01vdmVQYWdlID8gdGhpcy5nZXRDdXJyZW50UGFnZSgpIC0gMSA6IGN1cnJlbnRQYWdlSW5kZXggLSAxO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBwYWdlID0gaXNNb3ZlUGFnZSA/IHRoaXMuZ2V0Q3VycmVudFBhZ2UoKSArIDEgOiBjdXJyZW50UGFnZUluZGV4ICsgdGhpcy5nZXRPcHRpb24oJ3BhZ2VQZXJQYWdlTGlzdCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKHJlbGF0aXZlTmFtZSA9PT0gJ3ByZScpIHtcbiAgICAgICAgICAgICAgICBwYWdlID0gaXNNb3ZlUGFnZSA/IHRoaXMuZ2V0Q3VycmVudFBhZ2UoKSAtIDEgOiAoY3VycmVudFBhZ2VJbmRleCAtIDEpICogdGhpcy5nZXRPcHRpb24oJ3BhZ2VQZXJQYWdlTGlzdCcpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBwYWdlID0gaXNNb3ZlUGFnZSA/IHRoaXMuZ2V0Q3VycmVudFBhZ2UoKSArIDEgOiBjdXJyZW50UGFnZUluZGV4ICogdGhpcy5nZXRPcHRpb24oJ3BhZ2VQZXJQYWdlTGlzdCcpICsgMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcGFnZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGF2YWlsIHBhZ2UgbnVtYmVyIGZyb20gb3ZlciBudW1iZXJcbiAgICAgKiBJZiB0b3RhbCBwYWdlIGlzIDIzLCBidXQgaW5wdXQgbnVtYmVyIGlzIDMwID0+IHJldHVybiAyM1xuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBwYWdlIFBhZ2UgbnVtYmVyXG4gICAgICogQHJldHVybnMge251bWJlcn1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jb252ZXJ0VG9BdmFpbFBhZ2U6IGZ1bmN0aW9uKHBhZ2UpIHtcbiAgICAgICAgdmFyIGxhc3RQYWdlTnVtYmVyID0gdGhpcy5fZ2V0TGFzdFBhZ2UoKTtcbiAgICAgICAgcGFnZSA9IE1hdGgubWF4KHBhZ2UsIDEpO1xuICAgICAgICBwYWdlID0gTWF0aC5taW4ocGFnZSwgbGFzdFBhZ2VOdW1iZXIpO1xuICAgICAgICByZXR1cm4gcGFnZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlIHJlcXVpcmUgdmlldyBzZXQsIG5vdGlmeSB2aWV3IHRvIHVwZGF0ZS5cbiAgICAgKiBAcGFyYW0ge051bWJlcn0gcGFnZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3BhZ2luYXRlOiBmdW5jdGlvbihwYWdlKXtcblxuICAgICAgICAvLyDrt7DsnZgg67KE7Yq8IOuwjyDtjpjsnbTsp4Drpbwg66qo65GQIOygnOqxsCDrsI8g67O17IKsXG4gICAgICAgIHRoaXMuX3ZpZXcuZW1wdHkoKTtcblxuICAgICAgICB2YXIgdmlld1NldCA9IHt9O1xuXG4gICAgICAgIHZpZXdTZXQubGFzdFBhZ2UgPSB0aGlzLl9nZXRMYXN0UGFnZSgpO1xuICAgICAgICB2aWV3U2V0LmN1cnJlbnRQYWdlSW5kZXggPSB0aGlzLl9nZXRQYWdlSW5kZXgocGFnZSk7XG4gICAgICAgIHZpZXdTZXQubGFzdFBhZ2VMaXN0SW5kZXggPSB0aGlzLl9nZXRQYWdlSW5kZXgodmlld1NldC5sYXN0UGFnZSk7XG4gICAgICAgIHZpZXdTZXQucGFnZSA9IHBhZ2U7XG5cbiAgICAgICAgdGhpcy5fdmlldy51cGRhdGUodmlld1NldCwgcGFnZSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFBhZ2VsaXN0IGNsaWNrIGV2ZW50IGhhZG5sZXJcbiAgICAgKiBAcGFyYW0ge0pRdWVyeUV2ZW50fSBldmVudFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX29uQ2xpY2tQYWdlTGlzdDogZnVuY3Rpb24oZXZlbnQpIHtcblxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB2YXIgcGFnZSA9IG51bGwsXG4gICAgICAgICAgICB0YXJnZXRFbGVtZW50ID0gJChldmVudC50YXJnZXQpLFxuICAgICAgICAgICAgdGFyZ2V0UGFnZTtcblxuICAgICAgICBpZiAodGhpcy5fdmlldy5pc0luKHRhcmdldEVsZW1lbnQsIHRoaXMuZ2V0T3B0aW9uKCckcHJlX2VuZE9uJykpKSB7XG4gICAgICAgICAgICBwYWdlID0gMTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl92aWV3LmlzSW4odGFyZ2V0RWxlbWVudCwgdGhpcy5nZXRPcHRpb24oJyRsYXN0T24nKSkpIHtcbiAgICAgICAgICAgIHBhZ2UgPSB0aGlzLl9nZXRMYXN0UGFnZSgpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX3ZpZXcuaXNJbih0YXJnZXRFbGVtZW50LCB0aGlzLmdldE9wdGlvbignJHByZU9uJykpKSB7XG4gICAgICAgICAgICBwYWdlID0gdGhpcy5fZ2V0UmVsYXRpdmVQYWdlKCdwcmUnKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl92aWV3LmlzSW4odGFyZ2V0RWxlbWVudCwgdGhpcy5nZXRPcHRpb24oJyRuZXh0T24nKSkpIHtcbiAgICAgICAgICAgIHBhZ2UgPSB0aGlzLl9nZXRSZWxhdGl2ZVBhZ2UoJ25leHQnKTtcbiAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgdGFyZ2V0UGFnZSA9IHRoaXMuX3ZpZXcuZ2V0UGFnZUVsZW1lbnQodGFyZ2V0RWxlbWVudCk7XG5cbiAgICAgICAgICAgIGlmICh0YXJnZXRQYWdlICYmIHRhcmdldFBhZ2UubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgcGFnZSA9IHBhcnNlSW50KHRhcmdldFBhZ2UudGV4dCgpLCAxMCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgRmlyZSAnY2xpY2snIGN1c3RvbSBldmVudCB3aGVuIHBhZ2UgYnV0dG9uIGNsaWNrZWRcbiAgICAgICAgIEBwYXJhbSB7Y29tcG9uZW50RXZlbnR9IGV2ZW50RGF0YVxuICAgICAgICAgQHBhcmFtIHtTdHJpbmd9IGV2ZW50RGF0YS5ldmVudFR5cGUgQ3VzdG9tIGV2ZW50IG5hbWVcbiAgICAgICAgIEBwYXJhbSB7TnVtYmVyfSBldmVudERhdGEucGFnZSBQYWdlIHRvIG1vdmVcbiAgICAgICAgIEBwYXJhbSB7RnVuY3Rpb259IGV2ZW50RGF0YS5zdG9wIFN0b3AgcGFnZSBtb3ZlXG4gICAgICAgICAqKi9cblxuICAgICAgICB2YXIgaXNGaXJlZCA9IHRoaXMuaW52b2tlKFwiY2xpY2tcIiwge1wicGFnZVwiIDogcGFnZX0pO1xuICAgICAgICBpZiAoIWlzRmlyZWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMubW92ZVBhZ2VUbyhwYWdlKTtcbiAgICB9XG59KTtcbi8vIEN1c3RvbUV2ZW50ICBNaXhpblxudHVpLnV0aWwuQ3VzdG9tRXZlbnRzLm1peGluKFBhZ2luYXRpb24pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFBhZ2luYXRpb247XG4iLCIvKipcbiAqIEBmaWxlb3ZlcnZpZXcgUGFnaW5hdGlvbiB2aWV3IG1hbmFnZSBhbGwgb2YgZHJhdyBlbGVtZW50c1xuICogKGZyb20gcHVnLlBhZ2luYXRpb24pXG4gKiBAYXV0aG9yIE5ITiBlbnRlcnRhaW5tZW50IEZFIGRldiB0ZWFtIEplaW4gWWkoamVpbi55aUBuaG5lbnQuY29tKVxuICogQGRlcGVuZGVuY3kgcGFnaW5hdGlvbi5qc1xuICovXG4vKipcbiAqIEBjb25zdHJ1Y3RvciBWaWV3XG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyBPcHRpb24gb2JqZWN0XG4gKiBAcGFyYW0ge09iamVjdH0gJGVsZW1lbnQgQ29udGFpbmVyIGVsZW1lbnRcbiAqXG4gKi9cbnZhciBWaWV3ID0gdHVpLnV0aWwuZGVmaW5lQ2xhc3MoLyoqIEBsZW5kcyBWaWV3LnByb3RvdHlwZSAqL3tcbiAgICBpbml0OiBmdW5jdGlvbihvcHRpb25zLCAkZWxlbWVudCkge1xuICAgICAgICAvKipcbiAgICAgICAgICogUGFnaW5hdGlvbiByb290IGVsZW1lbnRcbiAgICAgICAgICogQHR5cGUge2pRdWVyeU9iamVjdH1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX2VsZW1lbnQgPSAkZWxlbWVudDtcblxuICAgICAgICAvKipcbiAgICAgICAgICogUGFnaW5hdGlvbiBvcHRpb25zXG4gICAgICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9vcHRpb25zID0gb3B0aW9ucztcblxuICAgICAgICAvKipcbiAgICAgICAgICogU2VsZWN0b3JzXG4gICAgICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9lbGVtZW50U2VsZWN0b3IgPSB7fTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogUGFnZSBpdGVtIGxpc3RcbiAgICAgICAgICogQHR5cGUge0FycmF5fVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fcGFnZUl0ZW1MaXN0ID0gW107XG5cbiAgICAgICAgdHVpLnV0aWwuZXh0ZW5kKG9wdGlvbnMsIHtcbiAgICAgICAgICAgICRwcmVfZW5kT246IG9wdGlvbnNbJyRwcmVfZW5kT24nXSB8fCAkKCdhLicgKyB0aGlzLl93cmFwUHJlZml4KCdwcmVfZW5kJyksIHRoaXMuX2VsZW1lbnQpLFxuICAgICAgICAgICAgJHByZU9uOiBvcHRpb25zWyckcHJlT24nXSB8fCAkKCdhLicgKyB0aGlzLl93cmFwUHJlZml4KCdwcmUnKSwgdGhpcy5fZWxlbWVudCksXG4gICAgICAgICAgICAkbmV4dE9uOiBvcHRpb25zWyckbmV4dE9uJ10gfHwgJCgnYS4nICsgdGhpcy5fd3JhcFByZWZpeCgnbmV4dCcpLCB0aGlzLl9lbGVtZW50KSxcbiAgICAgICAgICAgICRsYXN0T246IG9wdGlvbnNbJyRsYXN0T24nXSB8fCAkKCdhLicgKyB0aGlzLl93cmFwUHJlZml4KCduZXh0X2VuZCcpLCB0aGlzLl9lbGVtZW50KSxcbiAgICAgICAgICAgICRwcmVfZW5kT2ZmOiBvcHRpb25zWyckcHJlX2VuZE9mZiddIHx8ICQoJ3NwYW4uJyArIHRoaXMuX3dyYXBQcmVmaXgoJ3ByZV9lbmQnKSwgdGhpcy5fZWxlbWVudCksXG4gICAgICAgICAgICAkcHJlT2ZmOiBvcHRpb25zWyckcHJlT2ZmJ10gfHwgJCgnc3Bhbi4nICsgdGhpcy5fd3JhcFByZWZpeCgncHJlJyksIHRoaXMuX2VsZW1lbnQpLFxuICAgICAgICAgICAgJG5leHRPZmY6IG9wdGlvbnNbJyRuZXh0T2ZmJ10gfHwgJCgnc3Bhbi4nICsgdGhpcy5fd3JhcFByZWZpeCgnbmV4dCcpLCB0aGlzLl9lbGVtZW50KSxcbiAgICAgICAgICAgICRsYXN0T2ZmOiBvcHRpb25zWyckbGFzdE9mZiddIHx8ICQoJ3NwYW4uJyArIHRoaXMuX3dyYXBQcmVmaXgoJ25leHRfZW5kJyksIHRoaXMuX2VsZW1lbnQpXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLl9lbGVtZW50LmFkZENsYXNzKHRoaXMuX3dyYXBQcmVmaXgoJ2xvYWRlZCcpKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVXBkYXRlIHZpZXdcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gdmlld1NldCBWYWx1ZXMgb2YgZWFjaCBwYWdpbmF0aW9uIHZpZXcgY29tcG9uZW50c1xuICAgICAqL1xuICAgIHVwZGF0ZTogZnVuY3Rpb24odmlld1NldCkge1xuICAgICAgICB0aGlzLl9hZGRUZXh0Tm9kZSgpO1xuICAgICAgICB0aGlzLl9zZXRQYWdlUmVzdWx0KHZpZXdTZXQubGFzdFBhZ2UpO1xuXG4gICAgICAgIHZhciBvcHRpb25zID0gdGhpcy5fb3B0aW9ucyxcbiAgICAgICAgICAgIGVkZ2VzID0gdGhpcy5fZ2V0RWRnZSh2aWV3U2V0KSxcbiAgICAgICAgICAgIGxlZnRQYWdlTnVtYmVyID0gZWRnZXMubGVmdCxcbiAgICAgICAgICAgIHJpZ2h0UGFnZU51bWJlciA9IGVkZ2VzLnJpZ2h0O1xuXG4gICAgICAgIHZpZXdTZXQubGVmdFBhZ2VOdW1iZXIgPSBsZWZ0UGFnZU51bWJlcjtcbiAgICAgICAgdmlld1NldC5yaWdodFBhZ2VOdW1iZXIgPSByaWdodFBhZ2VOdW1iZXI7XG5cbiAgICAgICAgaWYgKG9wdGlvbnMubW92ZVVuaXQgPT09ICdwYWdlJykge1xuICAgICAgICAgICAgdmlld1NldC5jdXJyZW50UGFnZUluZGV4ID0gdmlld1NldC5wYWdlO1xuICAgICAgICAgICAgdmlld1NldC5sYXN0UGFnZUxpc3RJbmRleCA9IHZpZXdTZXQubGFzdFBhZ2U7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9zZXRGaXJzdCh2aWV3U2V0KTtcbiAgICAgICAgdGhpcy5fc2V0UHJldih2aWV3U2V0KTtcbiAgICAgICAgdGhpcy5fc2V0UGFnZU51bWJlcnModmlld1NldCk7XG4gICAgICAgIHRoaXMuX3NldE5leHQodmlld1NldCk7XG4gICAgICAgIHRoaXMuX3NldExhc3Qodmlld1NldCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENoZWNrIGluY2x1ZGVcbiAgICAgKiBAcGFyYW0ge0pRdWVyeU9iamVjdH0gJGZpbmQgVGFyZ2V0IGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge0pRdWVyeU9iamVjdH0gJHBhcmVudCBXcmFwcGVyIGVsZW1lbnRcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICBpc0luOiBmdW5jdGlvbigkZmluZCwgJHBhcmVudCkge1xuICAgICAgICBpZiAoISRwYXJlbnQpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gKCRmaW5kWzBdID09PSAkcGFyZW50WzBdKSA/IHRydWUgOiAkLmNvbnRhaW5zKCRwYXJlbnQsICRmaW5kKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGJhc2Uocm9vdCkgZWxlbWVudFxuICAgICAqIEByZXR1cm5zIHtKUXVlcnlPYmplY3R9XG4gICAgICovXG4gICAgZ2V0QmFzZUVsZW1lbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRFbGVtZW50KCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlc2V0IGJhc2UgZWxlbWVudFxuICAgICAqL1xuICAgIGVtcHR5OiBmdW5jdGlvbigpe1xuXG4gICAgICAgIHZhciBvcHRpb25zID0gdGhpcy5fb3B0aW9ucyxcbiAgICAgICAgICAgICRwcmVfZW5kT24gPSBvcHRpb25zLiRwcmVfZW5kT24sXG4gICAgICAgICAgICAkcHJlT24gPSBvcHRpb25zLiRwcmVPbixcbiAgICAgICAgICAgICRuZXh0T24gPSBvcHRpb25zLiRuZXh0T24sXG4gICAgICAgICAgICAkbGFzdE9uID0gb3B0aW9ucy4kbGFzdE9uLFxuICAgICAgICAgICAgJHByZV9lbmRPZmYgPSBvcHRpb25zLiRwcmVfZW5kT2ZmLFxuICAgICAgICAgICAgJHByZU9mZiA9IG9wdGlvbnMuJHByZU9mZixcbiAgICAgICAgICAgICRuZXh0T2ZmID0gb3B0aW9ucy4kbmV4dE9mZixcbiAgICAgICAgICAgICRsYXN0T2ZmID0gb3B0aW9ucy4kbGFzdE9mZjtcblxuICAgICAgICBvcHRpb25zLiRwcmVfZW5kT24gPSB0aGlzLl9jbG9uZSgkcHJlX2VuZE9uKTtcbiAgICAgICAgb3B0aW9ucy4kcHJlT24gPSB0aGlzLl9jbG9uZSgkcHJlT24pO1xuICAgICAgICBvcHRpb25zLiRsYXN0T24gPSB0aGlzLl9jbG9uZSgkbGFzdE9uKTtcbiAgICAgICAgb3B0aW9ucy4kbmV4dE9uID0gdGhpcy5fY2xvbmUoJG5leHRPbik7XG4gICAgICAgIG9wdGlvbnMuJHByZV9lbmRPZmYgPSB0aGlzLl9jbG9uZSgkcHJlX2VuZE9mZik7XG4gICAgICAgIG9wdGlvbnMuJHByZU9mZiA9IHRoaXMuX2Nsb25lKCRwcmVPZmYpO1xuICAgICAgICBvcHRpb25zLiRsYXN0T2ZmID0gdGhpcy5fY2xvbmUoJGxhc3RPZmYpO1xuICAgICAgICBvcHRpb25zLiRuZXh0T2ZmID0gdGhpcy5fY2xvbmUoJG5leHRPZmYpO1xuXG4gICAgICAgIHRoaXMuX3BhZ2VJdGVtTGlzdCA9IFtdO1xuXG4gICAgICAgIHRoaXMuX2VsZW1lbnQuZW1wdHkoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRmluZCB0YXJnZXQgZWxlbWVudCBmcm9tIHBhZ2UgZWxlbWVudHNcbiAgICAgKiBAcGFyYW0ge2pRdWVyeU9iamVjdHxIVE1MRWxlbWVudH0gZWwgVGFyZ2V0IGVsZW1lbnRcbiAgICAgKiBAcmV0dXJuIHtqUXVlcnlPYmplY3R9XG4gICAgICovXG4gICAgZ2V0UGFnZUVsZW1lbnQ6IGZ1bmN0aW9uKGVsKSB7XG5cbiAgICAgICAgdmFyIGksXG4gICAgICAgICAgICBsZW5ndGgsXG4gICAgICAgICAgICBwaWNrZWRJdGVtO1xuXG4gICAgICAgIGZvciAoaSA9IDAsIGxlbmd0aCA9IHRoaXMuX3BhZ2VJdGVtTGlzdC5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgcGlja2VkSXRlbSA9IHRoaXMuX3BhZ2VJdGVtTGlzdFtpXTtcbiAgICAgICAgICAgIGlmICh0aGlzLmlzSW4oZWwsIHBpY2tlZEl0ZW0pKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBpY2tlZEl0ZW07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEF0dGFjaCBFdmVudHNcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRUeXBlIEV2ZW50IG5hbWUgdG8gYXR0YWNoXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgQ2FsbGJhY2sgZnVuY3Rpb25cbiAgICAgKi9cbiAgICBhdHRhY2hFdmVudDogZnVuY3Rpb24oZXZlbnRUeXBlLCBjYWxsYmFjaykge1xuXG4gICAgICAgIHZhciB0YXJnZXRFbGVtZW50ID0gdGhpcy5fZWxlbWVudCxcbiAgICAgICAgICAgIGlzU2F2ZWRFbGVtZW50ID0gdHVpLnV0aWwuaXNTdHJpbmcodGFyZ2V0RWxlbWVudCkgJiYgdGhpcy5fZWxlbWVudFNlbGVjdG9yW3RhcmdldEVsZW1lbnRdO1xuXG4gICAgICAgIGlmIChpc1NhdmVkRWxlbWVudCkge1xuICAgICAgICAgICAgdGFyZ2V0RWxlbWVudCA9IHRoaXMuX2dldEVsZW1lbnQodGFyZ2V0RWxlbWVudCwgdHJ1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGFyZ2V0RWxlbWVudCAmJiBldmVudFR5cGUgJiYgY2FsbGJhY2spIHtcbiAgICAgICAgICAgICQodGFyZ2V0RWxlbWVudCkuYmluZChldmVudFR5cGUsIG51bGwsIGNhbGxiYWNrKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgcm9vdCBlbGVtZW50XG4gICAgICogQHJldHVybnMge2pRdWVyeU9iamVjdH1cbiAgICAgKi9cbiAgICBnZXRFbGVtZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2VsZW1lbnQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJldHVybiBjbGFzc05hbWUgYWRkZWQgcHJlZml4XG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGNsYXNzTmFtZSBDbGFzcyBuYW1lIHRvIGJlIHdyYXBwaW5nXG4gICAgICogQHJldHVybnMgeyp9XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfd3JhcFByZWZpeDogZnVuY3Rpb24oY2xhc3NOYW1lKSB7XG4gICAgICAgIHZhciBjbGFzc1ByZWZpeCA9IHRoaXMuX29wdGlvbnNbJ2NsYXNzUHJlZml4J107XG4gICAgICAgIHJldHVybiBjbGFzc1ByZWZpeCA/IGNsYXNzUHJlZml4ICsgY2xhc3NOYW1lLnJlcGxhY2UoL18vZywgJy0nKSA6IGNsYXNzTmFtZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUHV0IGluc2VydFRleHROb2RlIGJldHdlZW4gcGFnZSBpdGVtc1xuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2FkZFRleHROb2RlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHRleHROb2RlID0gdGhpcy5fb3B0aW9uc1snaW5zZXJ0VGV4dE5vZGUnXTtcbiAgICAgICAgdGhpcy5fZWxlbWVudC5hcHBlbmQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodGV4dE5vZGUpKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2xvbmUgZWxlbWVudFxuICAgICAqIEByZXR1cm5zIHsqfVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2Nsb25lOiBmdW5jdGlvbigkbGluaykge1xuXG4gICAgICAgIGlmICgkbGluayAmJiAkbGluay5sZW5ndGggJiYgJGxpbmsuZ2V0KDApLmNsb25lTm9kZSkge1xuICAgICAgICAgICAgcmV0dXJuICQoJGxpbmsuZ2V0KDApLmNsb25lTm9kZSh0cnVlKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICRsaW5rO1xuXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFdyYXBwaW5nIGNsYXNzIGJ5IHBhZ2UgcmVzdWx0XG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IGxhc3ROdW0gTGFzdCBwYWdlIG51bWJlclxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3NldFBhZ2VSZXN1bHQ6IGZ1bmN0aW9uKGxhc3ROdW0pIHtcblxuICAgICAgICBpZiAobGFzdE51bSA9PT0gMCkge1xuICAgICAgICAgICAgdGhpcy5fZWxlbWVudC5hZGRDbGFzcyh0aGlzLl93cmFwUHJlZml4KCduby1yZXN1bHQnKSk7XG4gICAgICAgIH0gZWxzZSBpZiAobGFzdE51bSA9PT0gMSkge1xuICAgICAgICAgICAgdGhpcy5fZWxlbWVudC5hZGRDbGFzcyh0aGlzLl93cmFwUHJlZml4KCdvbmx5LW9uZScpKS5yZW1vdmVDbGFzcyh0aGlzLl93cmFwUHJlZml4KCduby1yZXN1bHQnKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9lbGVtZW50LnJlbW92ZUNsYXNzKHRoaXMuX3dyYXBQcmVmaXgoJ29ubHktb25lJykpLnJlbW92ZUNsYXNzKHRoaXMuX3dyYXBQcmVmaXgoJ25vLXJlc3VsdCcpKTtcbiAgICAgICAgfVxuXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBlYWNoIGVkZ2UgcGFnZVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB2aWV3U2V0IFBhZ2luYXRpb24gdmlldyBlbGVtZW50cyBzZXRcbiAgICAgKiBAcmV0dXJucyB7e2xlZnQ6ICosIHJpZ2h0OiAqfX1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRFZGdlOiBmdW5jdGlvbih2aWV3U2V0KSB7XG5cbiAgICAgICAgdmFyIG9wdGlvbnMgPSB0aGlzLl9vcHRpb25zLFxuICAgICAgICAgICAgbGVmdFBhZ2VOdW1iZXIsXG4gICAgICAgICAgICByaWdodFBhZ2VOdW1iZXIsXG4gICAgICAgICAgICBsZWZ0O1xuXG4gICAgICAgIGlmIChvcHRpb25zLmlzQ2VudGVyQWxpZ24pIHtcblxuICAgICAgICAgICAgbGVmdCA9IE1hdGguZmxvb3Iob3B0aW9ucy5wYWdlUGVyUGFnZUxpc3QgLyAyKTtcbiAgICAgICAgICAgIGxlZnRQYWdlTnVtYmVyID0gdmlld1NldC5wYWdlIC0gbGVmdDtcbiAgICAgICAgICAgIGxlZnRQYWdlTnVtYmVyID0gTWF0aC5tYXgobGVmdFBhZ2VOdW1iZXIsIDEpO1xuICAgICAgICAgICAgcmlnaHRQYWdlTnVtYmVyID0gbGVmdFBhZ2VOdW1iZXIgKyBvcHRpb25zLnBhZ2VQZXJQYWdlTGlzdCAtIDE7XG5cbiAgICAgICAgICAgIGlmIChyaWdodFBhZ2VOdW1iZXIgPiB2aWV3U2V0Lmxhc3RQYWdlKSB7XG4gICAgICAgICAgICAgICAgbGVmdFBhZ2VOdW1iZXIgPSB2aWV3U2V0Lmxhc3RQYWdlIC0gb3B0aW9ucy5wYWdlUGVyUGFnZUxpc3QgKyAxO1xuICAgICAgICAgICAgICAgIGxlZnRQYWdlTnVtYmVyID0gTWF0aC5tYXgobGVmdFBhZ2VOdW1iZXIsIDEpO1xuICAgICAgICAgICAgICAgIHJpZ2h0UGFnZU51bWJlciA9IHZpZXdTZXQubGFzdFBhZ2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgbGVmdFBhZ2VOdW1iZXIgPSAodmlld1NldC5jdXJyZW50UGFnZUluZGV4IC0gMSkgKiBvcHRpb25zLnBhZ2VQZXJQYWdlTGlzdCArIDE7XG4gICAgICAgICAgICByaWdodFBhZ2VOdW1iZXIgPSAodmlld1NldC5jdXJyZW50UGFnZUluZGV4KSAqIG9wdGlvbnMucGFnZVBlclBhZ2VMaXN0O1xuICAgICAgICAgICAgcmlnaHRQYWdlTnVtYmVyID0gTWF0aC5taW4ocmlnaHRQYWdlTnVtYmVyLCB2aWV3U2V0Lmxhc3RQYWdlKTtcblxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGxlZnQ6IGxlZnRQYWdlTnVtYmVyLFxuICAgICAgICAgICAgcmlnaHQ6IHJpZ2h0UGFnZU51bWJlclxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBEZWNpZGUgdG8gc2hvdyBmaXJzdCBwYWdlIGxpbmsgYnkgd2hldGhlciBmaXJzdCBwYWdlIG9yIG5vdFxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB2aWV3U2V0IFBhZ2luYXRpb24gdmlldyBlbGVtZW50cyBzZXRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXRGaXJzdDogZnVuY3Rpb24odmlld1NldCkge1xuICAgICAgICB2YXIgb3B0aW9ucyA9IHRoaXMuX29wdGlvbnM7XG4gICAgICAgIGlmICh2aWV3U2V0LnBhZ2UgPiAxKSB7XG4gICAgICAgICAgICBpZiAob3B0aW9ucy4kcHJlX2VuZE9uKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fZWxlbWVudC5hcHBlbmQob3B0aW9ucy4kcHJlX2VuZE9uKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9hZGRUZXh0Tm9kZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKG9wdGlvbnMuJHByZV9lbmRPZmYpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9lbGVtZW50LmFwcGVuZChvcHRpb25zLiRwcmVfZW5kT2ZmKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9hZGRUZXh0Tm9kZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRGVjaWRlIHRvIHNob3cgcHJldmlvdXMgcGFnZSBsaW5rIGJ5IHdoZXRoZXIgZmlyc3QgcGFnZSBvciBub3RcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdmlld1NldCBQYWdpbmF0aW9uIHZpZXcgZWxlbWVudHMgc2V0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2V0UHJldjogZnVuY3Rpb24odmlld1NldCkge1xuICAgICAgICB2YXIgb3B0aW9ucyA9IHRoaXMuX29wdGlvbnM7XG5cbiAgICAgICAgaWYgKHZpZXdTZXQuY3VycmVudFBhZ2VJbmRleCA+IDEpIHtcbiAgICAgICAgICAgIGlmIChvcHRpb25zLiRwcmVPbikge1xuICAgICAgICAgICAgICAgIHRoaXMuX2VsZW1lbnQuYXBwZW5kKG9wdGlvbnMuJHByZU9uKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9hZGRUZXh0Tm9kZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKG9wdGlvbnMuJHByZU9mZikge1xuICAgICAgICAgICAgICAgIHRoaXMuX2VsZW1lbnQuYXBwZW5kKG9wdGlvbnMuJHByZU9mZik7XG4gICAgICAgICAgICAgICAgdGhpcy5fYWRkVGV4dE5vZGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG4gICAgLyoqXG4gICAgICogRGVjaWRlIHRvIHNob3cgbmV4dCBwYWdlIGxpbmsgYnkgd2hldGhlciBmaXJzdCBwYWdlIG9yIG5vdFxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB2aWV3U2V0IFBhZ2luYXRpb24gdmlldyBlbGVtZW50cyBzZXRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXROZXh0OiBmdW5jdGlvbih2aWV3U2V0KSB7XG4gICAgICAgIHZhciBvcHRpb25zID0gdGhpcy5fb3B0aW9ucztcblxuICAgICAgICBpZiAodmlld1NldC5jdXJyZW50UGFnZUluZGV4IDwgdmlld1NldC5sYXN0UGFnZUxpc3RJbmRleCkge1xuICAgICAgICAgICAgaWYgKG9wdGlvbnMuJG5leHRPbikge1xuICAgICAgICAgICAgICAgIHRoaXMuX2VsZW1lbnQuYXBwZW5kKG9wdGlvbnMuJG5leHRPbik7XG4gICAgICAgICAgICAgICAgdGhpcy5fYWRkVGV4dE5vZGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChvcHRpb25zLiRuZXh0T2ZmKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fZWxlbWVudC5hcHBlbmQob3B0aW9ucy4kbmV4dE9mZik7XG4gICAgICAgICAgICAgICAgdGhpcy5fYWRkVGV4dE5vZGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBEZWNpZGUgdG8gc2hvdyBsYXN0IHBhZ2UgbGluayBieSB3aGV0aGVyIGZpcnN0IHBhZ2Ugb3Igbm90XG4gICAgICogQHBhcmFtIHtvYmplY3R9IHZpZXdTZXQgUGFnaW5hdGlvbiB2aWV3IGVsZW1lbnRzIHNldFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3NldExhc3Q6IGZ1bmN0aW9uKHZpZXdTZXQpIHtcblxuICAgICAgICB2YXIgb3B0aW9ucyA9IHRoaXMuX29wdGlvbnM7XG5cbiAgICAgICAgaWYgKHZpZXdTZXQucGFnZSA8IHZpZXdTZXQubGFzdFBhZ2UpIHtcbiAgICAgICAgICAgIGlmIChvcHRpb25zLiRsYXN0T24pIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9lbGVtZW50LmFwcGVuZChvcHRpb25zLiRsYXN0T24pO1xuICAgICAgICAgICAgICAgIHRoaXMuX2FkZFRleHROb2RlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAob3B0aW9ucy4kbGFzdE9mZikge1xuICAgICAgICAgICAgICAgIHRoaXMuX2VsZW1lbnQuYXBwZW5kKG9wdGlvbnMuJGxhc3RPZmYpO1xuICAgICAgICAgICAgICAgIHRoaXMuX2FkZFRleHROb2RlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgIH0sXG4gICAgLyoqXG4gICAgICogU2V0IHBhZ2UgbnVtYmVyIHRoYXQgd2lsbCBiZSBkcmF3blxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB2aWV3U2V0IFBhZ2luYXRpb24gdmlldyBlbGVtZW50cyBzZXRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXRQYWdlTnVtYmVyczogZnVuY3Rpb24odmlld1NldCkge1xuICAgICAgICB2YXIgJHBhZ2VJdGVtLFxuICAgICAgICAgICAgZmlyc3RQYWdlID0gdmlld1NldC5sZWZ0UGFnZU51bWJlcixcbiAgICAgICAgICAgIGxhc3RQYWdlID0gdmlld1NldC5yaWdodFBhZ2VOdW1iZXIsXG4gICAgICAgICAgICBvcHRpb25zID0gdGhpcy5fb3B0aW9ucyxcbiAgICAgICAgICAgIGk7XG5cbiAgICAgICAgZm9yIChpID0gZmlyc3RQYWdlOyBpIDw9IGxhc3RQYWdlOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChpID09PSB2aWV3U2V0LnBhZ2UpIHtcbiAgICAgICAgICAgICAgICAkcGFnZUl0ZW0gPSAkKG9wdGlvbnMuY3VycmVudFBhZ2VUZW1wbGF0ZS5yZXBsYWNlKCd7PXBhZ2V9JywgaS50b1N0cmluZygpKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICRwYWdlSXRlbSA9ICQob3B0aW9ucy5wYWdlVGVtcGxhdGUucmVwbGFjZSgnez1wYWdlfScsIGkudG9TdHJpbmcoKSkpO1xuICAgICAgICAgICAgICAgIHRoaXMuX3BhZ2VJdGVtTGlzdC5wdXNoKCRwYWdlSXRlbSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChpID09PSBmaXJzdFBhZ2UpIHtcbiAgICAgICAgICAgICAgICAkcGFnZUl0ZW0uYWRkQ2xhc3ModGhpcy5fd3JhcFByZWZpeChvcHRpb25zWydmaXJzdEl0ZW1DbGFzc05hbWUnXSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGkgPT09IGxhc3RQYWdlKSB7XG4gICAgICAgICAgICAgICAgJHBhZ2VJdGVtLmFkZENsYXNzKHRoaXMuX3dyYXBQcmVmaXgob3B0aW9uc1snbGFzdEl0ZW1DbGFzc05hbWUnXSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5fZWxlbWVudC5hcHBlbmQoJHBhZ2VJdGVtKTtcbiAgICAgICAgICAgIHRoaXMuX2FkZFRleHROb2RlKCk7XG4gICAgICAgIH1cbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBWaWV3O1xuIl19
