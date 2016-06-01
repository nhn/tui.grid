(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
tui.util.defineNamespace('tui.component.Pagination', require('./src/js/pagination.js'));

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
     * @param {*} itemCount Redraw page item count
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
     *
     */
    getOption: function(optionKey) {
        return this._options[optionKey];
    },

    /**
     * Move to specific page, redraw list.
     * Befor move fire beforeMove event, After move fire afterMove event.
     * @param {Number} targetPage Target page
     * @param {Boolean} isNotRunCustomEvent [isNotRunCustomEvent=true] Whether custom event fire or not
     */
    movePageTo: function(targetPage, isNotRunCustomEvent) {

        targetPage = this._convertToAvailPage(targetPage);
        this._currentPage = targetPage;

        if (!isNotRunCustomEvent) {
            /**
             * Fire 'beforeMove' event(CustomEvent)
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsInNyYy9qcy9wYWdpbmF0aW9uLmpzIiwic3JjL2pzL3ZpZXcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeFVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidHVpLnV0aWwuZGVmaW5lTmFtZXNwYWNlKCd0dWkuY29tcG9uZW50LlBhZ2luYXRpb24nLCByZXF1aXJlKCcuL3NyYy9qcy9wYWdpbmF0aW9uLmpzJykpO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IENvcmUgb2YgcGFnaW5hdGlvbiBjb21wb25lbnQsIGNyZWF0ZSBwYWdpbmF0aW9uIHZpZXcgYW5kIGF0dGFjaCBldmVudHMuXG4gKiAoZnJvbSBwdWcuUGFnaW5hdGlvbilcbiAqIEBhdXRob3IgTkhOIGVudGVydGFpbm1lbnQgRkUgZGV2IHRlYW0oZGxfamF2YXNjcmlwdEBuaG5lbnQuY29tKVxuICogQGRlcGVuZGVuY3kganF1ZXJ5LTEuOC4zLm1pbi5qcywgY29kZS1zbmlwcGV0LmpzXG4gKi9cblxudmFyIFZpZXcgPSByZXF1aXJlKCcuL3ZpZXcuanMnKTtcblxuLyoqXG4gKiBQYWdpbmF0aW9uIGNvcmUgY2xhc3NcbiAqIEBjb25zdHJ1Y3RvciBQYWdpbmF0aW9uXG4gKlxuICovXG52YXIgUGFnaW5hdGlvbiA9IHR1aS51dGlsLmRlZmluZUNsYXNzKC8qKkBsZW5kcyBQYWdpbmF0aW9uLnByb3RvdHlwZSAqL3tcbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXplXG4gICAgICogQHBhcmFtIHtEYXRhT2JqZWN0fSBvcHRpb25zIE9wdGlvbiBvYmplY3RcbiAgICAgKiBcdFx0QHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLml0ZW1Db3VudD0xMF0gVG90YWwgaXRlbSBjb3VudFxuICAgICAqIFx0XHRAcGFyYW0ge051bWJlcn0gW29wdGlvbnMuaXRlbVBlclBhZ2U9MTBdIEl0ZW0gY291bnQgcGVyIHBhZ2VcbiAgICAgKiBcdFx0QHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLnBhZ2VQZXJQYWdlTGlzdD0xMF0gRGlzcGxheSBwYWdlIGxpbmsgY291bnRcbiAgICAgKiBcdFx0QHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLnBhZ2U9MV0gcGFnZSBEaXNwbGF5IHBhZ2UgYWZ0ZXIgcGFnaW5hdGlvbiBkcmF3LlxuICAgICAqIFx0XHRAcGFyYW0ge1N0cmluZ30gW29wdGlvbnMubW92ZVVuaXQ9XCJwYWdlbGlzdFwiXSBQYWdlIG1vdmUgdW5pdC5cbiAgICAgKiBcdFx0XHQ8dWw+XG4gICAgICogXHRcdFx0XHQ8bGk+cGFnZWxpc3QgOiBNb3ZlIHBhZ2UgZm9yIHVuaXQ8L2xpPlxuICAgICAqIFx0XHRcdFx0PGxpPnBhZ2UgOiBNb3ZlIG9uZSBwYWdlPC9saT5cbiAgICAgKiBcdFx0XHQ8L3VsPlxuICAgICAqIFx0XHRAcGFyYW0ge0Jvb2xlYW59W29wdGlvbnMuaXNDZW50ZXJBbGlnbj1mYWxzZV0gV2hldGhlciBjdXJyZW50IHBhZ2Uga2VlcCBjZW50ZXIgb3Igbm90XG4gICAgICogXHRcdEBwYXJhbSB7U3RyaW5nfSBbb3B0aW9ucy5pbnNlcnRUZXh0Tm9kZT1cIlwiXSBUaGUgY291cGxlciBiZXR3ZWVuIHBhZ2UgbGlua3NcbiAgICAgKiBcdFx0QHBhcmFtIHtTdHJpbmd9IFtvcHRpb25zLmNsYXNzUHJlZml4PVwiXCJdIEEgcHJlZml4IG9mIGNsYXNzIG5hbWVcbiAgICAgKiBcdFx0QHBhcmFtIHtTdHJpbmd9IFtvcHRpb25zLmZpcnN0SXRlbUNsYXNzTmFtZT1cImZpcnN0LWNoaWxkXCJdIFRoZSBjbGFzcyBuYW1lIGlzIGdyYW50ZWQgZmlyc3QgcGFnZSBsaW5rIGl0ZW1cbiAgICAgKiBcdFx0QHBhcmFtIHtTdHJpbmd9IFtvcHRpb25zLmxhc3RJdGVtQ2xhc3NOYW1lPVwibGFzdC1jaGlsZFwiXSBUaGUgY2xhc3MgbmFtZSBpcyBncmFudGVkIGZpcnN0IHBhZ2UgbGluayBpdGVtXG4gICAgICogXHRcdEBwYXJhbSB7U3RyaW5nfSBbb3B0aW9ucy5wYWdlVGVtcGxhdGU9XCI8YSBocmVmPScjJz57PXBhZ2V9PC9hPlwiXSBUaGUgbWFya3VwIHRlbXBsYXRlIHRvIHNob3cgcGFnZSBpdGVtIHN1Y2ggYXMgMSwgMiwgMywgLi4gez1wYWdlfSB3aWxsIGJlIGNoYW5nZWQgZWFjaCBwYWdlIG51bWJlci5cbiAgICAgKiBcdFx0QHBhcmFtIHtTdHJpbmd9IFtvcHRpb25zLmN1cnJlbnRQYWdlVGVtcGxhdGU9XCI8c3Ryb25nPns9cGFnZX08L3N0cm9uZz5cIl0gVGhlIG1hcmt1cCB0ZW1wbGF0ZSBmb3IgY3VycmVudCBwYWdlIHs9cGFnZX0gd2lsbCBiZSBjaGFuZ2VkIGN1cnJlbnQgcGFnZSBudW1iZXIuXG4gICAgICogXHRcdEBwYXJhbSB7alF1ZXJ5T2JqZWN0fSBbb3B0aW9ucy4kcHJlX2VuZE9uXSBUaGUgYnV0dG9uIGVsZW1lbnQgdG8gbW92ZSBmaXJzdCBwYWdlLiBJZiB0aGlzIG9wdGlvbiBpcyBub3QgZXhpc3QgYW5kIHRoZSBlbGVtZW50IHRoYXQgaGFzIGNsYXNzICdwcmVfZW5kJywgY29tcG9uZW50IGRvIG5vdCBjcmVhdGUgdGhpcyBidXR0b24uXG4gICAgICogXHRcdEBwYXJhbSB7alF1ZXJ5T2JqZWN0fSBbb3B0aW9ucy4kcHJlT25dIFRoZSBidXR0b24gZWxlbWVudCB0byBtb3ZlIHByZXZpb3VzZSBwYWdlLiBJZiB0aGlzIG9wdGlvbiBpcyBub3QgZXhpc3QgYW5kIHRoZSBlbGVtZW50IHRoYXQgaGFzIGNsYXNzICdwcmUnLCBjb21wb25lbnQgZG8gbm90IGNyZWF0ZSB0aGlzIGJ1dHRvbi5cbiAgICAgKiBcdFx0QHBhcmFtIHtqUXVlcnlPYmplY3R9IFtvcHRpb25zLiRuZXh0T25dIFRoZSBidXR0b24gZWxlbWVudCB0byBtb3ZlIG5leHQgcGFnZS4gSWYgdGhpcyBvcHRpb24gaXMgbm90IGV4aXN0IGFuZCB0aGUgZWxlbWVudCB0aGF0IGhhcyBjbGFzcyAnbmV4dCcsIGNvbXBvbmVudCBkbyBub3QgY3JlYXRlIHRoaXMgYnV0dG9uLlxuICAgICAqIFx0XHRAcGFyYW0ge2pRdWVyeU9iamVjdH0gW29wdGlvbnMuJGxhc3RPbl0gVGhlIGJ1dHRvbiBlbGVtZW50IHRvIG1vdmUgbGFzdCBwYWdlLiBJZiB0aGlzIG9wdGlvbiBpcyBub3QgZXhpc3QgYW5kIHRoZSBlbGVtZW50IHRoYXQgaGFzIGNsYXNzICdsYXN0JywgY29tcG9uZW50IGRvIG5vdCBjcmVhdGUgdGhpcyBidXR0b24uXG4gICAgICogXHRcdEBwYXJhbSB7alF1ZXJ5T2JqZWN0fSBbb3B0aW9ucy4kcHJlX2VuZE9mZl0gVGhlIGVsZW1lbnQgdG8gc2hvdyB0aGF0IHByZV9lbmRPbiBidXR0b24gaXMgbm90IGVuYWJsZS4gSWYgdGhpcyBvcHRpb24gaXMgbm90IGV4aXN0IGFuZCB0aGUgZWxlbWVudCB0aGF0IGhhcyBjbGFzcyAncHJlX2VuZE9mZicsIGNvbXBvbmVudCBkbyBub3QgY3JlYXRlIHRoaXMgYnV0dG9uLlxuICAgICAqIFx0XHRAcGFyYW0ge2pRdWVyeU9iamVjdH0gW29wdGlvbnMuJHByZU9mZl0gVGhlIGVsZW1lbnQgdG8gc2hvdyB0aGF0IHByZU9uIGJ1dHRvbiBpcyBub3QgZW5hYmxlLiBJZiB0aGlzIG9wdGlvbiBpcyBub3QgZXhpc3QgYW5kIHRoZSBlbGVtZW50IHRoYXQgaGFzIGNsYXNzICdwcmVPZmYnLCBjb21wb25lbnQgZG8gbm90IGNyZWF0ZSB0aGlzIGJ1dHRvbi5cbiAgICAgKiBcdFx0QHBhcmFtIHtqUXVlcnlPYmplY3R9IFtvcHRpb25zLiRuZXh0T2ZmXSBUaGUgZWxlbWVudCB0byBzaG93IHRoYXQgbmV4dE9uIGJ1dHRvbiBpcyBub3QgZW5hYmxlLiBJZiB0aGlzIG9wdGlvbiBpcyBub3QgZXhpc3QgYW5kIHRoZSBlbGVtZW50IHRoYXQgaGFzIGNsYXNzICduZXh0T2ZmJywgY29tcG9uZW50IGRvIG5vdCBjcmVhdGUgdGhpcyBidXR0b24uXG4gICAgICogXHRcdEBwYXJhbSB7alF1ZXJ5T2JqZWN0fSBbb3B0aW9ucy4kbGFzdE9mZl0gVGhlIGVsZW1lbnQgdG8gc2hvdyB0aGF0IGxhc3RPbiBidXR0b24gaXMgbm90IGVuYWJsZS4gSWYgdGhpcyBvcHRpb24gaXMgbm90IGV4aXN0IGFuZCB0aGUgZWxlbWVudCB0aGF0IGhhcyBjbGFzcyAnbGFzdE9mZicsIGNvbXBvbmVudCBkbyBub3QgY3JlYXRlIHRoaXMgYnV0dG9uLlxuICAgICAqIEBwYXJhbSB7alF1ZXJ5T2JqZWN0fSAkZWxlbWVudCBQYWdpbmF0aW9uIGNvbnRhaW5lclxuICAgICAqL1xuICAgIGluaXQ6IGZ1bmN0aW9uKG9wdGlvbnMsICRlbGVtZW50KSB7XG4gICAgICAgIHZhciBkZWZhdWx0T3B0aW9uID0ge1xuICAgICAgICAgICAgaXRlbUNvdW50OiAxMCxcbiAgICAgICAgICAgIGl0ZW1QZXJQYWdlOiAxMCxcbiAgICAgICAgICAgIHBhZ2VQZXJQYWdlTGlzdDogMTAsXG4gICAgICAgICAgICBwYWdlOiAxLFxuICAgICAgICAgICAgbW92ZVVuaXQ6ICdwYWdlbGlzdCcsXG4gICAgICAgICAgICBpc0NlbnRlckFsaWduOiBmYWxzZSxcbiAgICAgICAgICAgIGluc2VydFRleHROb2RlOiAnJyxcbiAgICAgICAgICAgIGNsYXNzUHJlZml4OiAnJyxcbiAgICAgICAgICAgIGZpcnN0SXRlbUNsYXNzTmFtZTogJ2ZpcnN0LWNoaWxkJyxcbiAgICAgICAgICAgIGxhc3RJdGVtQ2xhc3NOYW1lOiAnbGFzdC1jaGlsZCcsXG4gICAgICAgICAgICBwYWdlVGVtcGxhdGU6ICc8YSBocmVmPVwiI1wiPns9cGFnZX08L2E+JyxcbiAgICAgICAgICAgIGN1cnJlbnRQYWdlVGVtcGxhdGU6ICc8c3Ryb25nPns9cGFnZX08L3N0cm9uZz4nXG4gICAgICAgIH07XG5cblxuICAgICAgICBpZiAob3B0aW9ucy5pdGVtQ291bnQgPT09IDApIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogT3B0aW9uIG9iamVjdFxuICAgICAgICAgICAgICogQHR5cGUge09iamVjdH1cbiAgICAgICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXMuX29wdGlvbnMgPSBkZWZhdWx0T3B0aW9uO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fb3B0aW9ucyA9IHR1aS51dGlsLmV4dGVuZChkZWZhdWx0T3B0aW9uLCBvcHRpb25zKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBFdmVudCBoYW5kbGVyIHNhdm9yXG4gICAgICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9ldmVudHMgPSB7fTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogdmlldyBpbnN0YW5jZVxuICAgICAgICAgKiBAdHlwZSB7UGFnaW5hdGlvblZpZXd9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl92aWV3ID0gbmV3IFZpZXcodGhpcy5fb3B0aW9ucywgJGVsZW1lbnQpO1xuICAgICAgICB0aGlzLl92aWV3LmF0dGFjaEV2ZW50KCdjbGljaycsIHR1aS51dGlsLmJpbmQodGhpcy5fb25DbGlja1BhZ2VMaXN0LCB0aGlzKSk7XG5cbiAgICAgICAgdGhpcy5tb3ZlUGFnZVRvKHRoaXMuZ2V0T3B0aW9uKCdwYWdlJyksIGZhbHNlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVzZXQgcGFnaW5hdGlvblxuICAgICAqIEBwYXJhbSB7Kn0gaXRlbUNvdW50IFJlZHJhdyBwYWdlIGl0ZW0gY291bnRcbiAgICAgKi9cbiAgICByZXNldDogZnVuY3Rpb24oaXRlbUNvdW50KSB7XG5cbiAgICAgICAgdmFyIGlzRXhpc3QgPSB0dWkudXRpbC5pc0V4aXN0eSgoaXRlbUNvdW50ICE9PSBudWxsKSAmJiAoaXRlbUNvdW50ICE9PSB1bmRlZmluZWQpKTtcblxuICAgICAgICBpZiAoIWlzRXhpc3QpIHtcbiAgICAgICAgICAgIGl0ZW1Db3VudCA9IHRoaXMuZ2V0T3B0aW9uKCdpdGVtQ291bnQnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc2V0T3B0aW9uKCdpdGVtQ291bnQnLCBpdGVtQ291bnQpO1xuICAgICAgICB0aGlzLm1vdmVQYWdlVG8oMSwgZmFsc2UpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgb3B0aW9uc1xuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBvcHRpb25LZXkgT3B0aW9uIGtleVxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHJldHVybnMgeyp9XG4gICAgICpcbiAgICAgKi9cbiAgICBnZXRPcHRpb246IGZ1bmN0aW9uKG9wdGlvbktleSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fb3B0aW9uc1tvcHRpb25LZXldO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBNb3ZlIHRvIHNwZWNpZmljIHBhZ2UsIHJlZHJhdyBsaXN0LlxuICAgICAqIEJlZm9yIG1vdmUgZmlyZSBiZWZvcmVNb3ZlIGV2ZW50LCBBZnRlciBtb3ZlIGZpcmUgYWZ0ZXJNb3ZlIGV2ZW50LlxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSB0YXJnZXRQYWdlIFRhcmdldCBwYWdlXG4gICAgICogQHBhcmFtIHtCb29sZWFufSBpc05vdFJ1bkN1c3RvbUV2ZW50IFtpc05vdFJ1bkN1c3RvbUV2ZW50PXRydWVdIFdoZXRoZXIgY3VzdG9tIGV2ZW50IGZpcmUgb3Igbm90XG4gICAgICovXG4gICAgbW92ZVBhZ2VUbzogZnVuY3Rpb24odGFyZ2V0UGFnZSwgaXNOb3RSdW5DdXN0b21FdmVudCkge1xuXG4gICAgICAgIHRhcmdldFBhZ2UgPSB0aGlzLl9jb252ZXJ0VG9BdmFpbFBhZ2UodGFyZ2V0UGFnZSk7XG4gICAgICAgIHRoaXMuX2N1cnJlbnRQYWdlID0gdGFyZ2V0UGFnZTtcblxuICAgICAgICBpZiAoIWlzTm90UnVuQ3VzdG9tRXZlbnQpIHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogRmlyZSAnYmVmb3JlTW92ZScgZXZlbnQoQ3VzdG9tRXZlbnQpXG4gICAgICAgICAgICAgKiBAcGFyYW0ge2NvbXBvbmVudEV2ZW50fSBldmVudERhdGFcbiAgICAgICAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBldmVudERhdGEuZXZlbnRUeXBlIEN1c3RvbSBldmVudCBuYW1lXG4gICAgICAgICAgICAgKiBAcGFyYW0ge051bWJlcn0gZXZlbnREYXRhLnBhZ2UgVGFyZ2V0IHBhZ2VcbiAgICAgICAgICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGV2ZW50RGF0YS5zdG9wIFN0b3AgbW92ZSBzcGVjaWZpYyBwYWdlXG4gICAgICAgICAgICAgKiBAZXhhbXBsZVxuICAgICAgICAgICAgICogcGFnYW5hdGlvbi5vbihcImJlZm9yZU1vdmVcIiwgZnVuY3Rpb24oZXZlbnREYXRhKSB7XG4gICAgICAgICAgICAgICAgdmFyIGN1cnJlbnRQYWdlID0gZXZlbnREYXRhLnBhZ2U7XG4gICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgKi9cblxuICAgICAgICAgICAgaWYgKCF0aGlzLmludm9rZSgnYmVmb3JlTW92ZScsIHsgcGFnZTogdGFyZ2V0UGFnZSB9KSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX3BhZ2luYXRlKHRhcmdldFBhZ2UpO1xuXG4gICAgICAgIGlmIChpc05vdFJ1bkN1c3RvbUV2ZW50KSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEZpcmUgJ2FmdGVyTW92ZSdcbiAgICAgICAgICAgICAqIEBwYXJhbSB7Y29tcG9uZW50RXZlbnR9IGV2ZW50RGF0YVxuICAgICAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50RGF0YS5ldmVudFR5cGUgQ3VzdG9tIGV2ZW50IG5hbWVcbiAgICAgICAgICAgICAqIEBwYXJhbSB7TnVtYmVyfSBldmVudERhdGEucGFnZSBNb3ZlZCBwYWdlXG4gICAgICAgICAgICAgKiBAZXhhbXBsZVxuICAgICAgICAgICAgICogcGFnYW5hdGlvbi5vbihcImJlZm9yZU1vdmVcIiwgZnVuY3Rpb24oZXZlbnREYXRhKSB7XG4gICAgICAgICAgICB2YXIgY3VycmVudFBhZ2UgPSBldmVudERhdGEucGFnZTtcbiAgICAgICAgIH0pO1xuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0aGlzLmZpcmUoJ2FmdGVyTW92ZScsIHsgcGFnZTogdGFyZ2V0UGFnZSB9KTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDaGFuZ2Ugb3B0aW9uIHZhbHVlXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IG9wdGlvbktleSBUaGUgdGFyZ2V0IG9wdGlvbiBrZXlcbiAgICAgKiBAcGFyYW0geyp9IG9wdGlvblZhbHVlIFRoZSB0YXJnZXQgb3B0aW9uIHZhbHVlXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBzZXRPcHRpb246IGZ1bmN0aW9uKG9wdGlvbktleSwgb3B0aW9uVmFsdWUpIHtcbiAgICAgICAgdGhpcy5fb3B0aW9uc1tvcHRpb25LZXldID0gb3B0aW9uVmFsdWU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBjdXJyZW50IHBhZ2VcbiAgICAgKiBAcmV0dXJucyB7TnVtYmVyfSBDdXJyZW50IHBhZ2VcbiAgICAgKi9cbiAgICBnZXRDdXJyZW50UGFnZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9jdXJyZW50UGFnZSB8fCB0aGlzLl9vcHRpb25zWydwYWdlJ107XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBpdGVtICBpbmRleCBmcm9tIGxpc3RcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gcGFnZU51bWJlciBQYWdlIG51bWJlclxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAgICovXG4gICAgZ2V0SW5kZXhPZkZpcnN0SXRlbTogZnVuY3Rpb24ocGFnZU51bWJlcikge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRPcHRpb24oJ2l0ZW1QZXJQYWdlJykgKiAocGFnZU51bWJlciAtIDEpICsgMTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IExhc3QgcGFnZSBudW1iZXJcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX2dldExhc3RQYWdlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIE1hdGguY2VpbCh0aGlzLmdldE9wdGlvbignaXRlbUNvdW50JykgLyB0aGlzLmdldE9wdGlvbignaXRlbVBlclBhZ2UnKSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEluZGV4IG9mIGxpc3QgaW4gdG90YWwgbGlzdHNcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gcGFnZU51bWJlciBQYWdlIG51bWJlclxuICAgICAqIEByZXR1cm4ge051bWJlcn1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9nZXRQYWdlSW5kZXg6IGZ1bmN0aW9uKHBhZ2VOdW1iZXIpIHtcbiAgICAgICAgLy8gSXNDZW50ZXJBbGlnbiA9PSB0cnVlIGNhc2VcbiAgICAgICAgaWYgKHRoaXMuZ2V0T3B0aW9uKCdpc0NlbnRlckFsaWduJykpIHtcbiAgICAgICAgICAgIHZhciBsZWZ0ID0gTWF0aC5mbG9vcih0aGlzLmdldE9wdGlvbigncGFnZVBlclBhZ2VMaXN0JykgLyAyKSxcbiAgICAgICAgICAgICAgICBwYWdlSW5kZXggPSBwYWdlTnVtYmVyIC0gbGVmdDtcbiAgICAgICAgICAgIHBhZ2VJbmRleCA9IE1hdGgubWF4KHBhZ2VJbmRleCwgMSk7XG4gICAgICAgICAgICBwYWdlSW5kZXggPSBNYXRoLm1pbihwYWdlSW5kZXgsIHRoaXMuX2dldExhc3RQYWdlKCkgLSB0aGlzLmdldE9wdGlvbigncGFnZVBlclBhZ2VMaXN0JykgKyAxKTtcbiAgICAgICAgICAgIHJldHVybiBwYWdlSW5kZXg7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIE1hdGguY2VpbChwYWdlTnVtYmVyIC8gdGhpcy5nZXRPcHRpb24oXCJwYWdlUGVyUGFnZUxpc3RcIikpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgcGFnZSBudW1iZXIgb2YgcHJldiwgbmV4dCBwYWdlc1xuICAgICAqIEBwYXJhbSB7U3RyaW5nfSByZWxhdGl2ZU5hbWUgRGlyZWN0aW9ucyhwcmVfZW5kLCBuZXh0X2VuZCwgcHJlLCBuZXh0KVxuICAgICAqIEByZXR1cm4ge051bWJlcn1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqICAgICAqL1xuICAgIF9nZXRSZWxhdGl2ZVBhZ2U6IGZ1bmN0aW9uKHJlbGF0aXZlTmFtZSkge1xuICAgICAgICB2YXIgcGFnZSA9IG51bGwsXG4gICAgICAgICAgICBpc01vdmVQYWdlID0gdGhpcy5nZXRPcHRpb24oJ21vdmVVbml0JykgPT09ICdwYWdlJyxcbiAgICAgICAgICAgIGN1cnJlbnRQYWdlSW5kZXggPSB0aGlzLl9nZXRQYWdlSW5kZXgodGhpcy5nZXRDdXJyZW50UGFnZSgpKTtcbiAgICAgICAgaWYodGhpcy5nZXRPcHRpb24oJ2lzQ2VudGVyQWxpZ24nKSkge1xuICAgICAgICAgICAgaWYgKHJlbGF0aXZlTmFtZSA9PT0gJ3ByZScpIHtcbiAgICAgICAgICAgICAgICBwYWdlID0gaXNNb3ZlUGFnZSA/IHRoaXMuZ2V0Q3VycmVudFBhZ2UoKSAtIDEgOiBjdXJyZW50UGFnZUluZGV4IC0gMTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcGFnZSA9IGlzTW92ZVBhZ2UgPyB0aGlzLmdldEN1cnJlbnRQYWdlKCkgKyAxIDogY3VycmVudFBhZ2VJbmRleCArIHRoaXMuZ2V0T3B0aW9uKCdwYWdlUGVyUGFnZUxpc3QnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChyZWxhdGl2ZU5hbWUgPT09ICdwcmUnKSB7XG4gICAgICAgICAgICAgICAgcGFnZSA9IGlzTW92ZVBhZ2UgPyB0aGlzLmdldEN1cnJlbnRQYWdlKCkgLSAxIDogKGN1cnJlbnRQYWdlSW5kZXggLSAxKSAqIHRoaXMuZ2V0T3B0aW9uKCdwYWdlUGVyUGFnZUxpc3QnKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcGFnZSA9IGlzTW92ZVBhZ2UgPyB0aGlzLmdldEN1cnJlbnRQYWdlKCkgKyAxIDogY3VycmVudFBhZ2VJbmRleCAqIHRoaXMuZ2V0T3B0aW9uKCdwYWdlUGVyUGFnZUxpc3QnKSArIDE7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHBhZ2U7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBhdmFpbCBwYWdlIG51bWJlciBmcm9tIG92ZXIgbnVtYmVyXG4gICAgICogSWYgdG90YWwgcGFnZSBpcyAyMywgYnV0IGlucHV0IG51bWJlciBpcyAzMCA9PiByZXR1cm4gMjNcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gcGFnZSBQYWdlIG51bWJlclxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfY29udmVydFRvQXZhaWxQYWdlOiBmdW5jdGlvbihwYWdlKSB7XG4gICAgICAgIHZhciBsYXN0UGFnZU51bWJlciA9IHRoaXMuX2dldExhc3RQYWdlKCk7XG4gICAgICAgIHBhZ2UgPSBNYXRoLm1heChwYWdlLCAxKTtcbiAgICAgICAgcGFnZSA9IE1hdGgubWluKHBhZ2UsIGxhc3RQYWdlTnVtYmVyKTtcbiAgICAgICAgcmV0dXJuIHBhZ2U7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSByZXF1aXJlIHZpZXcgc2V0LCBub3RpZnkgdmlldyB0byB1cGRhdGUuXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHBhZ2VcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9wYWdpbmF0ZTogZnVuY3Rpb24ocGFnZSl7XG5cbiAgICAgICAgLy8g67ew7J2YIOuyhO2KvCDrsI8g7Y6Y7J207KeA66W8IOuqqOuRkCDsoJzqsbAg67CPIOuzteyCrFxuICAgICAgICB0aGlzLl92aWV3LmVtcHR5KCk7XG5cbiAgICAgICAgdmFyIHZpZXdTZXQgPSB7fTtcblxuICAgICAgICB2aWV3U2V0Lmxhc3RQYWdlID0gdGhpcy5fZ2V0TGFzdFBhZ2UoKTtcbiAgICAgICAgdmlld1NldC5jdXJyZW50UGFnZUluZGV4ID0gdGhpcy5fZ2V0UGFnZUluZGV4KHBhZ2UpO1xuICAgICAgICB2aWV3U2V0Lmxhc3RQYWdlTGlzdEluZGV4ID0gdGhpcy5fZ2V0UGFnZUluZGV4KHZpZXdTZXQubGFzdFBhZ2UpO1xuICAgICAgICB2aWV3U2V0LnBhZ2UgPSBwYWdlO1xuXG4gICAgICAgIHRoaXMuX3ZpZXcudXBkYXRlKHZpZXdTZXQsIHBhZ2UpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBQYWdlbGlzdCBjbGljayBldmVudCBoYWRubGVyXG4gICAgICogQHBhcmFtIHtKUXVlcnlFdmVudH0gZXZlbnRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9vbkNsaWNrUGFnZUxpc3Q6IGZ1bmN0aW9uKGV2ZW50KSB7XG5cbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdmFyIHBhZ2UgPSBudWxsLFxuICAgICAgICAgICAgdGFyZ2V0RWxlbWVudCA9ICQoZXZlbnQudGFyZ2V0KSxcbiAgICAgICAgICAgIHRhcmdldFBhZ2U7XG5cbiAgICAgICAgaWYgKHRoaXMuX3ZpZXcuaXNJbih0YXJnZXRFbGVtZW50LCB0aGlzLmdldE9wdGlvbignJHByZV9lbmRPbicpKSkge1xuICAgICAgICAgICAgcGFnZSA9IDE7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5fdmlldy5pc0luKHRhcmdldEVsZW1lbnQsIHRoaXMuZ2V0T3B0aW9uKCckbGFzdE9uJykpKSB7XG4gICAgICAgICAgICBwYWdlID0gdGhpcy5fZ2V0TGFzdFBhZ2UoKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl92aWV3LmlzSW4odGFyZ2V0RWxlbWVudCwgdGhpcy5nZXRPcHRpb24oJyRwcmVPbicpKSkge1xuICAgICAgICAgICAgcGFnZSA9IHRoaXMuX2dldFJlbGF0aXZlUGFnZSgncHJlJyk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5fdmlldy5pc0luKHRhcmdldEVsZW1lbnQsIHRoaXMuZ2V0T3B0aW9uKCckbmV4dE9uJykpKSB7XG4gICAgICAgICAgICBwYWdlID0gdGhpcy5fZ2V0UmVsYXRpdmVQYWdlKCduZXh0Jyk7XG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIHRhcmdldFBhZ2UgPSB0aGlzLl92aWV3LmdldFBhZ2VFbGVtZW50KHRhcmdldEVsZW1lbnQpO1xuXG4gICAgICAgICAgICBpZiAodGFyZ2V0UGFnZSAmJiB0YXJnZXRQYWdlLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHBhZ2UgPSBwYXJzZUludCh0YXJnZXRQYWdlLnRleHQoKSwgMTApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgIEZpcmUgJ2NsaWNrJyBjdXN0b20gZXZlbnQgd2hlbiBwYWdlIGJ1dHRvbiBjbGlja2VkXG4gICAgICAgICBAcGFyYW0ge2NvbXBvbmVudEV2ZW50fSBldmVudERhdGFcbiAgICAgICAgIEBwYXJhbSB7U3RyaW5nfSBldmVudERhdGEuZXZlbnRUeXBlIEN1c3RvbSBldmVudCBuYW1lXG4gICAgICAgICBAcGFyYW0ge051bWJlcn0gZXZlbnREYXRhLnBhZ2UgUGFnZSB0byBtb3ZlXG4gICAgICAgICBAcGFyYW0ge0Z1bmN0aW9ufSBldmVudERhdGEuc3RvcCBTdG9wIHBhZ2UgbW92ZVxuICAgICAgICAgKiovXG5cbiAgICAgICAgdmFyIGlzRmlyZWQgPSB0aGlzLmludm9rZShcImNsaWNrXCIsIHtcInBhZ2VcIiA6IHBhZ2V9KTtcbiAgICAgICAgaWYgKCFpc0ZpcmVkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLm1vdmVQYWdlVG8ocGFnZSk7XG4gICAgfVxufSk7XG4vLyBDdXN0b21FdmVudCAgTWl4aW5cbnR1aS51dGlsLkN1c3RvbUV2ZW50cy5taXhpbihQYWdpbmF0aW9uKTtcblxubW9kdWxlLmV4cG9ydHMgPSBQYWdpbmF0aW9uO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFBhZ2luYXRpb24gdmlldyBtYW5hZ2UgYWxsIG9mIGRyYXcgZWxlbWVudHNcbiAqIChmcm9tIHB1Zy5QYWdpbmF0aW9uKVxuICogQGF1dGhvciBOSE4gZW50ZXJ0YWlubWVudCBGRSBkZXYgdGVhbSBKZWluIFlpKGplaW4ueWlAbmhuZW50LmNvbSlcbiAqIEBkZXBlbmRlbmN5IHBhZ2luYXRpb24uanNcbiAqL1xuLyoqXG4gKiBAY29uc3RydWN0b3IgVmlld1xuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgT3B0aW9uIG9iamVjdFxuICogQHBhcmFtIHtPYmplY3R9ICRlbGVtZW50IENvbnRhaW5lciBlbGVtZW50XG4gKlxuICovXG52YXIgVmlldyA9IHR1aS51dGlsLmRlZmluZUNsYXNzKC8qKiBAbGVuZHMgVmlldy5wcm90b3R5cGUgKi97XG4gICAgaW5pdDogZnVuY3Rpb24ob3B0aW9ucywgJGVsZW1lbnQpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFBhZ2luYXRpb24gcm9vdCBlbGVtZW50XG4gICAgICAgICAqIEB0eXBlIHtqUXVlcnlPYmplY3R9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLl9lbGVtZW50ID0gJGVsZW1lbnQ7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFBhZ2luYXRpb24gb3B0aW9uc1xuICAgICAgICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fb3B0aW9ucyA9IG9wdGlvbnM7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFNlbGVjdG9yc1xuICAgICAgICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fZWxlbWVudFNlbGVjdG9yID0ge307XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFBhZ2UgaXRlbSBsaXN0XG4gICAgICAgICAqIEB0eXBlIHtBcnJheX1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX3BhZ2VJdGVtTGlzdCA9IFtdO1xuXG4gICAgICAgIHR1aS51dGlsLmV4dGVuZChvcHRpb25zLCB7XG4gICAgICAgICAgICAkcHJlX2VuZE9uOiBvcHRpb25zWyckcHJlX2VuZE9uJ10gfHwgJCgnYS4nICsgdGhpcy5fd3JhcFByZWZpeCgncHJlX2VuZCcpLCB0aGlzLl9lbGVtZW50KSxcbiAgICAgICAgICAgICRwcmVPbjogb3B0aW9uc1snJHByZU9uJ10gfHwgJCgnYS4nICsgdGhpcy5fd3JhcFByZWZpeCgncHJlJyksIHRoaXMuX2VsZW1lbnQpLFxuICAgICAgICAgICAgJG5leHRPbjogb3B0aW9uc1snJG5leHRPbiddIHx8ICQoJ2EuJyArIHRoaXMuX3dyYXBQcmVmaXgoJ25leHQnKSwgdGhpcy5fZWxlbWVudCksXG4gICAgICAgICAgICAkbGFzdE9uOiBvcHRpb25zWyckbGFzdE9uJ10gfHwgJCgnYS4nICsgdGhpcy5fd3JhcFByZWZpeCgnbmV4dF9lbmQnKSwgdGhpcy5fZWxlbWVudCksXG4gICAgICAgICAgICAkcHJlX2VuZE9mZjogb3B0aW9uc1snJHByZV9lbmRPZmYnXSB8fCAkKCdzcGFuLicgKyB0aGlzLl93cmFwUHJlZml4KCdwcmVfZW5kJyksIHRoaXMuX2VsZW1lbnQpLFxuICAgICAgICAgICAgJHByZU9mZjogb3B0aW9uc1snJHByZU9mZiddIHx8ICQoJ3NwYW4uJyArIHRoaXMuX3dyYXBQcmVmaXgoJ3ByZScpLCB0aGlzLl9lbGVtZW50KSxcbiAgICAgICAgICAgICRuZXh0T2ZmOiBvcHRpb25zWyckbmV4dE9mZiddIHx8ICQoJ3NwYW4uJyArIHRoaXMuX3dyYXBQcmVmaXgoJ25leHQnKSwgdGhpcy5fZWxlbWVudCksXG4gICAgICAgICAgICAkbGFzdE9mZjogb3B0aW9uc1snJGxhc3RPZmYnXSB8fCAkKCdzcGFuLicgKyB0aGlzLl93cmFwUHJlZml4KCduZXh0X2VuZCcpLCB0aGlzLl9lbGVtZW50KVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5fZWxlbWVudC5hZGRDbGFzcyh0aGlzLl93cmFwUHJlZml4KCdsb2FkZWQnKSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFVwZGF0ZSB2aWV3XG4gICAgICogQHBhcmFtIHtPYmplY3R9IHZpZXdTZXQgVmFsdWVzIG9mIGVhY2ggcGFnaW5hdGlvbiB2aWV3IGNvbXBvbmVudHNcbiAgICAgKi9cbiAgICB1cGRhdGU6IGZ1bmN0aW9uKHZpZXdTZXQpIHtcbiAgICAgICAgdGhpcy5fYWRkVGV4dE5vZGUoKTtcbiAgICAgICAgdGhpcy5fc2V0UGFnZVJlc3VsdCh2aWV3U2V0Lmxhc3RQYWdlKTtcblxuICAgICAgICB2YXIgb3B0aW9ucyA9IHRoaXMuX29wdGlvbnMsXG4gICAgICAgICAgICBlZGdlcyA9IHRoaXMuX2dldEVkZ2Uodmlld1NldCksXG4gICAgICAgICAgICBsZWZ0UGFnZU51bWJlciA9IGVkZ2VzLmxlZnQsXG4gICAgICAgICAgICByaWdodFBhZ2VOdW1iZXIgPSBlZGdlcy5yaWdodDtcblxuICAgICAgICB2aWV3U2V0LmxlZnRQYWdlTnVtYmVyID0gbGVmdFBhZ2VOdW1iZXI7XG4gICAgICAgIHZpZXdTZXQucmlnaHRQYWdlTnVtYmVyID0gcmlnaHRQYWdlTnVtYmVyO1xuXG4gICAgICAgIGlmIChvcHRpb25zLm1vdmVVbml0ID09PSAncGFnZScpIHtcbiAgICAgICAgICAgIHZpZXdTZXQuY3VycmVudFBhZ2VJbmRleCA9IHZpZXdTZXQucGFnZTtcbiAgICAgICAgICAgIHZpZXdTZXQubGFzdFBhZ2VMaXN0SW5kZXggPSB2aWV3U2V0Lmxhc3RQYWdlO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fc2V0Rmlyc3Qodmlld1NldCk7XG4gICAgICAgIHRoaXMuX3NldFByZXYodmlld1NldCk7XG4gICAgICAgIHRoaXMuX3NldFBhZ2VOdW1iZXJzKHZpZXdTZXQpO1xuICAgICAgICB0aGlzLl9zZXROZXh0KHZpZXdTZXQpO1xuICAgICAgICB0aGlzLl9zZXRMYXN0KHZpZXdTZXQpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDaGVjayBpbmNsdWRlXG4gICAgICogQHBhcmFtIHtKUXVlcnlPYmplY3R9ICRmaW5kIFRhcmdldCBlbGVtZW50XG4gICAgICogQHBhcmFtIHtKUXVlcnlPYmplY3R9ICRwYXJlbnQgV3JhcHBlciBlbGVtZW50XG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICovXG4gICAgaXNJbjogZnVuY3Rpb24oJGZpbmQsICRwYXJlbnQpIHtcbiAgICAgICAgaWYgKCEkcGFyZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICgkZmluZFswXSA9PT0gJHBhcmVudFswXSkgPyB0cnVlIDogJC5jb250YWlucygkcGFyZW50LCAkZmluZCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCBiYXNlKHJvb3QpIGVsZW1lbnRcbiAgICAgKiBAcmV0dXJucyB7SlF1ZXJ5T2JqZWN0fVxuICAgICAqL1xuICAgIGdldEJhc2VFbGVtZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0RWxlbWVudCgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXNldCBiYXNlIGVsZW1lbnRcbiAgICAgKi9cbiAgICBlbXB0eTogZnVuY3Rpb24oKXtcblxuICAgICAgICB2YXIgb3B0aW9ucyA9IHRoaXMuX29wdGlvbnMsXG4gICAgICAgICAgICAkcHJlX2VuZE9uID0gb3B0aW9ucy4kcHJlX2VuZE9uLFxuICAgICAgICAgICAgJHByZU9uID0gb3B0aW9ucy4kcHJlT24sXG4gICAgICAgICAgICAkbmV4dE9uID0gb3B0aW9ucy4kbmV4dE9uLFxuICAgICAgICAgICAgJGxhc3RPbiA9IG9wdGlvbnMuJGxhc3RPbixcbiAgICAgICAgICAgICRwcmVfZW5kT2ZmID0gb3B0aW9ucy4kcHJlX2VuZE9mZixcbiAgICAgICAgICAgICRwcmVPZmYgPSBvcHRpb25zLiRwcmVPZmYsXG4gICAgICAgICAgICAkbmV4dE9mZiA9IG9wdGlvbnMuJG5leHRPZmYsXG4gICAgICAgICAgICAkbGFzdE9mZiA9IG9wdGlvbnMuJGxhc3RPZmY7XG5cbiAgICAgICAgb3B0aW9ucy4kcHJlX2VuZE9uID0gdGhpcy5fY2xvbmUoJHByZV9lbmRPbik7XG4gICAgICAgIG9wdGlvbnMuJHByZU9uID0gdGhpcy5fY2xvbmUoJHByZU9uKTtcbiAgICAgICAgb3B0aW9ucy4kbGFzdE9uID0gdGhpcy5fY2xvbmUoJGxhc3RPbik7XG4gICAgICAgIG9wdGlvbnMuJG5leHRPbiA9IHRoaXMuX2Nsb25lKCRuZXh0T24pO1xuICAgICAgICBvcHRpb25zLiRwcmVfZW5kT2ZmID0gdGhpcy5fY2xvbmUoJHByZV9lbmRPZmYpO1xuICAgICAgICBvcHRpb25zLiRwcmVPZmYgPSB0aGlzLl9jbG9uZSgkcHJlT2ZmKTtcbiAgICAgICAgb3B0aW9ucy4kbGFzdE9mZiA9IHRoaXMuX2Nsb25lKCRsYXN0T2ZmKTtcbiAgICAgICAgb3B0aW9ucy4kbmV4dE9mZiA9IHRoaXMuX2Nsb25lKCRuZXh0T2ZmKTtcblxuICAgICAgICB0aGlzLl9wYWdlSXRlbUxpc3QgPSBbXTtcblxuICAgICAgICB0aGlzLl9lbGVtZW50LmVtcHR5KCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEZpbmQgdGFyZ2V0IGVsZW1lbnQgZnJvbSBwYWdlIGVsZW1lbnRzXG4gICAgICogQHBhcmFtIHtqUXVlcnlPYmplY3R8SFRNTEVsZW1lbnR9IGVsIFRhcmdldCBlbGVtZW50XG4gICAgICogQHJldHVybiB7alF1ZXJ5T2JqZWN0fVxuICAgICAqL1xuICAgIGdldFBhZ2VFbGVtZW50OiBmdW5jdGlvbihlbCkge1xuXG4gICAgICAgIHZhciBpLFxuICAgICAgICAgICAgbGVuZ3RoLFxuICAgICAgICAgICAgcGlja2VkSXRlbTtcblxuICAgICAgICBmb3IgKGkgPSAwLCBsZW5ndGggPSB0aGlzLl9wYWdlSXRlbUxpc3QubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHBpY2tlZEl0ZW0gPSB0aGlzLl9wYWdlSXRlbUxpc3RbaV07XG4gICAgICAgICAgICBpZiAodGhpcy5pc0luKGVsLCBwaWNrZWRJdGVtKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBwaWNrZWRJdGVtO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBdHRhY2ggRXZlbnRzXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50VHlwZSBFdmVudCBuYW1lIHRvIGF0dGFjaFxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIENhbGxiYWNrIGZ1bmN0aW9uXG4gICAgICovXG4gICAgYXR0YWNoRXZlbnQ6IGZ1bmN0aW9uKGV2ZW50VHlwZSwgY2FsbGJhY2spIHtcblxuICAgICAgICB2YXIgdGFyZ2V0RWxlbWVudCA9IHRoaXMuX2VsZW1lbnQsXG4gICAgICAgICAgICBpc1NhdmVkRWxlbWVudCA9IHR1aS51dGlsLmlzU3RyaW5nKHRhcmdldEVsZW1lbnQpICYmIHRoaXMuX2VsZW1lbnRTZWxlY3Rvclt0YXJnZXRFbGVtZW50XTtcblxuICAgICAgICBpZiAoaXNTYXZlZEVsZW1lbnQpIHtcbiAgICAgICAgICAgIHRhcmdldEVsZW1lbnQgPSB0aGlzLl9nZXRFbGVtZW50KHRhcmdldEVsZW1lbnQsIHRydWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRhcmdldEVsZW1lbnQgJiYgZXZlbnRUeXBlICYmIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAkKHRhcmdldEVsZW1lbnQpLmJpbmQoZXZlbnRUeXBlLCBudWxsLCBjYWxsYmFjayk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHJvb3QgZWxlbWVudFxuICAgICAqIEByZXR1cm5zIHtqUXVlcnlPYmplY3R9XG4gICAgICovXG4gICAgZ2V0RWxlbWVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9lbGVtZW50O1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gY2xhc3NOYW1lIGFkZGVkIHByZWZpeFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBjbGFzc05hbWUgQ2xhc3MgbmFtZSB0byBiZSB3cmFwcGluZ1xuICAgICAqIEByZXR1cm5zIHsqfVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3dyYXBQcmVmaXg6IGZ1bmN0aW9uKGNsYXNzTmFtZSkge1xuICAgICAgICB2YXIgY2xhc3NQcmVmaXggPSB0aGlzLl9vcHRpb25zWydjbGFzc1ByZWZpeCddO1xuICAgICAgICByZXR1cm4gY2xhc3NQcmVmaXggPyBjbGFzc1ByZWZpeCArIGNsYXNzTmFtZS5yZXBsYWNlKC9fL2csICctJykgOiBjbGFzc05hbWU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFB1dCBpbnNlcnRUZXh0Tm9kZSBiZXR3ZWVuIHBhZ2UgaXRlbXNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9hZGRUZXh0Tm9kZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB0ZXh0Tm9kZSA9IHRoaXMuX29wdGlvbnNbJ2luc2VydFRleHROb2RlJ107XG4gICAgICAgIHRoaXMuX2VsZW1lbnQuYXBwZW5kKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHRleHROb2RlKSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENsb25lIGVsZW1lbnRcbiAgICAgKiBAcmV0dXJucyB7Kn1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9jbG9uZTogZnVuY3Rpb24oJGxpbmspIHtcblxuICAgICAgICBpZiAoJGxpbmsgJiYgJGxpbmsubGVuZ3RoICYmICRsaW5rLmdldCgwKS5jbG9uZU5vZGUpIHtcbiAgICAgICAgICAgIHJldHVybiAkKCRsaW5rLmdldCgwKS5jbG9uZU5vZGUodHJ1ZSkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAkbGluaztcblxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBXcmFwcGluZyBjbGFzcyBieSBwYWdlIHJlc3VsdFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBsYXN0TnVtIExhc3QgcGFnZSBudW1iZXJcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXRQYWdlUmVzdWx0OiBmdW5jdGlvbihsYXN0TnVtKSB7XG5cbiAgICAgICAgaWYgKGxhc3ROdW0gPT09IDApIHtcbiAgICAgICAgICAgIHRoaXMuX2VsZW1lbnQuYWRkQ2xhc3ModGhpcy5fd3JhcFByZWZpeCgnbm8tcmVzdWx0JykpO1xuICAgICAgICB9IGVsc2UgaWYgKGxhc3ROdW0gPT09IDEpIHtcbiAgICAgICAgICAgIHRoaXMuX2VsZW1lbnQuYWRkQ2xhc3ModGhpcy5fd3JhcFByZWZpeCgnb25seS1vbmUnKSkucmVtb3ZlQ2xhc3ModGhpcy5fd3JhcFByZWZpeCgnbm8tcmVzdWx0JykpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fZWxlbWVudC5yZW1vdmVDbGFzcyh0aGlzLl93cmFwUHJlZml4KCdvbmx5LW9uZScpKS5yZW1vdmVDbGFzcyh0aGlzLl93cmFwUHJlZml4KCduby1yZXN1bHQnKSk7XG4gICAgICAgIH1cblxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgZWFjaCBlZGdlIHBhZ2VcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdmlld1NldCBQYWdpbmF0aW9uIHZpZXcgZWxlbWVudHMgc2V0XG4gICAgICogQHJldHVybnMge3tsZWZ0OiAqLCByaWdodDogKn19XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfZ2V0RWRnZTogZnVuY3Rpb24odmlld1NldCkge1xuXG4gICAgICAgIHZhciBvcHRpb25zID0gdGhpcy5fb3B0aW9ucyxcbiAgICAgICAgICAgIGxlZnRQYWdlTnVtYmVyLFxuICAgICAgICAgICAgcmlnaHRQYWdlTnVtYmVyLFxuICAgICAgICAgICAgbGVmdDtcblxuICAgICAgICBpZiAob3B0aW9ucy5pc0NlbnRlckFsaWduKSB7XG5cbiAgICAgICAgICAgIGxlZnQgPSBNYXRoLmZsb29yKG9wdGlvbnMucGFnZVBlclBhZ2VMaXN0IC8gMik7XG4gICAgICAgICAgICBsZWZ0UGFnZU51bWJlciA9IHZpZXdTZXQucGFnZSAtIGxlZnQ7XG4gICAgICAgICAgICBsZWZ0UGFnZU51bWJlciA9IE1hdGgubWF4KGxlZnRQYWdlTnVtYmVyLCAxKTtcbiAgICAgICAgICAgIHJpZ2h0UGFnZU51bWJlciA9IGxlZnRQYWdlTnVtYmVyICsgb3B0aW9ucy5wYWdlUGVyUGFnZUxpc3QgLSAxO1xuXG4gICAgICAgICAgICBpZiAocmlnaHRQYWdlTnVtYmVyID4gdmlld1NldC5sYXN0UGFnZSkge1xuICAgICAgICAgICAgICAgIGxlZnRQYWdlTnVtYmVyID0gdmlld1NldC5sYXN0UGFnZSAtIG9wdGlvbnMucGFnZVBlclBhZ2VMaXN0ICsgMTtcbiAgICAgICAgICAgICAgICBsZWZ0UGFnZU51bWJlciA9IE1hdGgubWF4KGxlZnRQYWdlTnVtYmVyLCAxKTtcbiAgICAgICAgICAgICAgICByaWdodFBhZ2VOdW1iZXIgPSB2aWV3U2V0Lmxhc3RQYWdlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIGxlZnRQYWdlTnVtYmVyID0gKHZpZXdTZXQuY3VycmVudFBhZ2VJbmRleCAtIDEpICogb3B0aW9ucy5wYWdlUGVyUGFnZUxpc3QgKyAxO1xuICAgICAgICAgICAgcmlnaHRQYWdlTnVtYmVyID0gKHZpZXdTZXQuY3VycmVudFBhZ2VJbmRleCkgKiBvcHRpb25zLnBhZ2VQZXJQYWdlTGlzdDtcbiAgICAgICAgICAgIHJpZ2h0UGFnZU51bWJlciA9IE1hdGgubWluKHJpZ2h0UGFnZU51bWJlciwgdmlld1NldC5sYXN0UGFnZSk7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBsZWZ0OiBsZWZ0UGFnZU51bWJlcixcbiAgICAgICAgICAgIHJpZ2h0OiByaWdodFBhZ2VOdW1iZXJcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRGVjaWRlIHRvIHNob3cgZmlyc3QgcGFnZSBsaW5rIGJ5IHdoZXRoZXIgZmlyc3QgcGFnZSBvciBub3RcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdmlld1NldCBQYWdpbmF0aW9uIHZpZXcgZWxlbWVudHMgc2V0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2V0Rmlyc3Q6IGZ1bmN0aW9uKHZpZXdTZXQpIHtcbiAgICAgICAgdmFyIG9wdGlvbnMgPSB0aGlzLl9vcHRpb25zO1xuICAgICAgICBpZiAodmlld1NldC5wYWdlID4gMSkge1xuICAgICAgICAgICAgaWYgKG9wdGlvbnMuJHByZV9lbmRPbikge1xuICAgICAgICAgICAgICAgIHRoaXMuX2VsZW1lbnQuYXBwZW5kKG9wdGlvbnMuJHByZV9lbmRPbik7XG4gICAgICAgICAgICAgICAgdGhpcy5fYWRkVGV4dE5vZGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChvcHRpb25zLiRwcmVfZW5kT2ZmKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fZWxlbWVudC5hcHBlbmQob3B0aW9ucy4kcHJlX2VuZE9mZik7XG4gICAgICAgICAgICAgICAgdGhpcy5fYWRkVGV4dE5vZGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIERlY2lkZSB0byBzaG93IHByZXZpb3VzIHBhZ2UgbGluayBieSB3aGV0aGVyIGZpcnN0IHBhZ2Ugb3Igbm90XG4gICAgICogQHBhcmFtIHtvYmplY3R9IHZpZXdTZXQgUGFnaW5hdGlvbiB2aWV3IGVsZW1lbnRzIHNldFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgX3NldFByZXY6IGZ1bmN0aW9uKHZpZXdTZXQpIHtcbiAgICAgICAgdmFyIG9wdGlvbnMgPSB0aGlzLl9vcHRpb25zO1xuXG4gICAgICAgIGlmICh2aWV3U2V0LmN1cnJlbnRQYWdlSW5kZXggPiAxKSB7XG4gICAgICAgICAgICBpZiAob3B0aW9ucy4kcHJlT24pIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9lbGVtZW50LmFwcGVuZChvcHRpb25zLiRwcmVPbik7XG4gICAgICAgICAgICAgICAgdGhpcy5fYWRkVGV4dE5vZGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChvcHRpb25zLiRwcmVPZmYpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9lbGVtZW50LmFwcGVuZChvcHRpb25zLiRwcmVPZmYpO1xuICAgICAgICAgICAgICAgIHRoaXMuX2FkZFRleHROb2RlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8qKlxuICAgICAqIERlY2lkZSB0byBzaG93IG5leHQgcGFnZSBsaW5rIGJ5IHdoZXRoZXIgZmlyc3QgcGFnZSBvciBub3RcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdmlld1NldCBQYWdpbmF0aW9uIHZpZXcgZWxlbWVudHMgc2V0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2V0TmV4dDogZnVuY3Rpb24odmlld1NldCkge1xuICAgICAgICB2YXIgb3B0aW9ucyA9IHRoaXMuX29wdGlvbnM7XG5cbiAgICAgICAgaWYgKHZpZXdTZXQuY3VycmVudFBhZ2VJbmRleCA8IHZpZXdTZXQubGFzdFBhZ2VMaXN0SW5kZXgpIHtcbiAgICAgICAgICAgIGlmIChvcHRpb25zLiRuZXh0T24pIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9lbGVtZW50LmFwcGVuZChvcHRpb25zLiRuZXh0T24pO1xuICAgICAgICAgICAgICAgIHRoaXMuX2FkZFRleHROb2RlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAob3B0aW9ucy4kbmV4dE9mZikge1xuICAgICAgICAgICAgICAgIHRoaXMuX2VsZW1lbnQuYXBwZW5kKG9wdGlvbnMuJG5leHRPZmYpO1xuICAgICAgICAgICAgICAgIHRoaXMuX2FkZFRleHROb2RlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgIH0sXG4gICAgLyoqXG4gICAgICogRGVjaWRlIHRvIHNob3cgbGFzdCBwYWdlIGxpbmsgYnkgd2hldGhlciBmaXJzdCBwYWdlIG9yIG5vdFxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB2aWV3U2V0IFBhZ2luYXRpb24gdmlldyBlbGVtZW50cyBzZXRcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9zZXRMYXN0OiBmdW5jdGlvbih2aWV3U2V0KSB7XG5cbiAgICAgICAgdmFyIG9wdGlvbnMgPSB0aGlzLl9vcHRpb25zO1xuXG4gICAgICAgIGlmICh2aWV3U2V0LnBhZ2UgPCB2aWV3U2V0Lmxhc3RQYWdlKSB7XG4gICAgICAgICAgICBpZiAob3B0aW9ucy4kbGFzdE9uKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fZWxlbWVudC5hcHBlbmQob3B0aW9ucy4kbGFzdE9uKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9hZGRUZXh0Tm9kZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKG9wdGlvbnMuJGxhc3RPZmYpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9lbGVtZW50LmFwcGVuZChvcHRpb25zLiRsYXN0T2ZmKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9hZGRUZXh0Tm9kZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICB9LFxuICAgIC8qKlxuICAgICAqIFNldCBwYWdlIG51bWJlciB0aGF0IHdpbGwgYmUgZHJhd25cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gdmlld1NldCBQYWdpbmF0aW9uIHZpZXcgZWxlbWVudHMgc2V0XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBfc2V0UGFnZU51bWJlcnM6IGZ1bmN0aW9uKHZpZXdTZXQpIHtcbiAgICAgICAgdmFyICRwYWdlSXRlbSxcbiAgICAgICAgICAgIGZpcnN0UGFnZSA9IHZpZXdTZXQubGVmdFBhZ2VOdW1iZXIsXG4gICAgICAgICAgICBsYXN0UGFnZSA9IHZpZXdTZXQucmlnaHRQYWdlTnVtYmVyLFxuICAgICAgICAgICAgb3B0aW9ucyA9IHRoaXMuX29wdGlvbnMsXG4gICAgICAgICAgICBpO1xuXG4gICAgICAgIGZvciAoaSA9IGZpcnN0UGFnZTsgaSA8PSBsYXN0UGFnZTsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoaSA9PT0gdmlld1NldC5wYWdlKSB7XG4gICAgICAgICAgICAgICAgJHBhZ2VJdGVtID0gJChvcHRpb25zLmN1cnJlbnRQYWdlVGVtcGxhdGUucmVwbGFjZSgnez1wYWdlfScsIGkudG9TdHJpbmcoKSkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAkcGFnZUl0ZW0gPSAkKG9wdGlvbnMucGFnZVRlbXBsYXRlLnJlcGxhY2UoJ3s9cGFnZX0nLCBpLnRvU3RyaW5nKCkpKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9wYWdlSXRlbUxpc3QucHVzaCgkcGFnZUl0ZW0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoaSA9PT0gZmlyc3RQYWdlKSB7XG4gICAgICAgICAgICAgICAgJHBhZ2VJdGVtLmFkZENsYXNzKHRoaXMuX3dyYXBQcmVmaXgob3B0aW9uc1snZmlyc3RJdGVtQ2xhc3NOYW1lJ10pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpID09PSBsYXN0UGFnZSkge1xuICAgICAgICAgICAgICAgICRwYWdlSXRlbS5hZGRDbGFzcyh0aGlzLl93cmFwUHJlZml4KG9wdGlvbnNbJ2xhc3RJdGVtQ2xhc3NOYW1lJ10pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuX2VsZW1lbnQuYXBwZW5kKCRwYWdlSXRlbSk7XG4gICAgICAgICAgICB0aGlzLl9hZGRUZXh0Tm9kZSgpO1xuICAgICAgICB9XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gVmlldztcbiJdfQ==
