/*!
 * tui-pagination.js
 * @version 3.3.1
 * @author NHNEnt FE Development Team <dl_javascript@nhnent.com>
 * @license MIT
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("tui-code-snippet"));
	else if(typeof define === 'function' && define.amd)
		define(["tui-code-snippet"], factory);
	else if(typeof exports === 'object')
		exports["Pagination"] = factory(require("tui-code-snippet"));
	else
		root["tui"] = root["tui"] || {}, root["tui"]["Pagination"] = factory((root["tui"] && root["tui"]["util"]));
})(this, function(__WEBPACK_EXTERNAL_MODULE_7__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "dist";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview The entry file of Pagination components
	 * @author NHN Ent. FE Development Team
	 */

	'use strict';

	__webpack_require__(1);

	module.exports = __webpack_require__(6);


/***/ }),
/* 1 */
/***/ (function(module, exports) {

	// removed by extract-text-webpack-plugin

/***/ }),
/* 2 */,
/* 3 */,
/* 4 */,
/* 5 */,
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var snippet = __webpack_require__(7);

	var View = __webpack_require__(8);
	var util = __webpack_require__(9);

	var defaultOption = {
	    totalItems: 10,
	    itemsPerPage: 10,
	    visiblePages: 10,
	    page: 1,
	    centerAlign: false,
	    firstItemClassName: 'tui-first-child',
	    lastItemClassName: 'tui-last-child',
	    usageStatistics: true
	};

	/**
	 * Pagination class
	 * @class Pagination
	 * @param {string|HTMLElement|jQueryObject} container - Container element or id selector
	 * @param {object} options - Option object
	 *     @param {number} [options.totalItems=10] Total item count
	 *     @param {number} [options.itemsPerPage=10] Item count per page
	 *     @param {number} [options.visiblePages=10] Display page link count
	 *     @param {number} [options.page=1] Display page after pagination draw.
	 *     @param {boolean}[options.centerAlign=false] Whether current page keep center or not
	 *     @param {string} [options.firstItemClassName='first-child'] The class name of the first item
	 *     @param {string} [options.lastItemClassName='last-child'] The class name of the last item
	 *     @param {object} [options.template] A markup string set to make element
	 *         @param {string|function} [options.template.page] HTML template
	 *         @param {string|function} [options.template.currentPage] HTML template
	 *         @param {string|function} [options.template.moveButton] HTML template
	 *         @param {string|function} [options.template.disabledMoveButton] HTML template
	 *         @param {string|function} [options.template.moreButton] HTML template
	 *     @param {boolean} [options.usageStatistics=true] Send the hostname to google analytics.
	 *         If you do not want to send the hostname, this option set to false.
	 * @example
	 * var Pagination = tui.Pagination; // or require('tui-pagination')
	 *
	 * var container = document.getElementById('pagination');
	 * var options = { // below default value of options
	 *      totalItems: 10,
	 *      itemsPerPage: 10,
	 *      visiblePages: 10,
	 *      page: 1,
	 *      centerAlign: false,
	 *      firstItemClassName: 'tui-first-child',
	 *      lastItemClassName: 'tui-last-child',
	 *      template: {
	 *          page: '<a href="#" class="tui-page-btn">{{page}}</a>',
	 *          currentPage: '<strong class="tui-page-btn tui-is-selected">{{page}}</strong>',
	 *          moveButton:
	 *              '<a href="#" class="tui-page-btn tui-{{type}}">' +
	 *                  '<span class="tui-ico-{{type}}">{{type}}</span>' +
	 *              '</a>',
	 *          disabledMoveButton:
	 *              '<span class="tui-page-btn tui-is-disabled tui-{{type}}">' +
	 *                  '<span class="tui-ico-{{type}}">{{type}}</span>' +
	 *              '</span>',
	 *          moreButton:
	 *              '<a href="#" class="tui-page-btn tui-{{type}}-is-ellip">' +
	 *                  '<span class="tui-ico-ellip">...</span>' +
	 *              '</a>'
	 *      }
	 * };
	 * var pagination = new Pagination(container, options);
	 */
	var Pagination = snippet.defineClass(/** @lends Pagination.prototype */{
	    init: function(container, options) {
	        /**
	         * Option object
	         * @type {object}
	         * @private
	         */
	        this._options = snippet.extend({}, defaultOption, options);

	        /**
	         * Current page number
	         * @type {number}
	         * @private
	         */
	        this._currentPage = 0;

	        /**
	         * View instance
	         * @type {View}
	         * @private
	         */
	        this._view = new View(container, this._options, snippet.bind(this._onClickHandler, this));

	        this._paginate();

	        if (this._options.usageStatistics) {
	            util.sendHostNameToGA();
	        }
	    },

	    /**
	     * Set current page
	     * @param {number} page - Current page
	     * @private
	     */
	    _setCurrentPage: function(page) {
	        this._currentPage = page || this._options.page;
	    },

	    /**
	     * Get last page number
	     * @returns {number} Last page number
	     * @private
	     */
	    _getLastPage: function() {
	        var lastPage = Math.ceil(this._options.totalItems / this._options.itemsPerPage);

	        return (!lastPage) ? 1 : lastPage;
	    },

	    /**
	     * Index of list in total lists
	     * @param {number} pageNumber - Page number
	     * @returns {number} Page index or number
	     * @private
	     */
	    _getPageIndex: function(pageNumber) {
	        var left, pageIndex;

	        if (this._options.centerAlign) {
	            left = Math.floor(this._options.visiblePages / 2);
	            pageIndex = pageNumber - left;
	            pageIndex = Math.max(pageIndex, 1);
	            pageIndex = Math.min(pageIndex, this._getLastPage() - this._options.visiblePages + 1);

	            return pageIndex;
	        }

	        return Math.ceil(pageNumber / this._options.visiblePages);
	    },

	    /**
	     * Get relative page
	     * @param {string} moveType - Move type ('prev' or 'next')
	     * @returns {number} Relative page number
	     * @private
	     */
	    _getRelativePage: function(moveType) {
	        var isPrevMove = (moveType === 'prev');
	        var currentPage = this.getCurrentPage();

	        return isPrevMove ? currentPage - 1 : currentPage + 1;
	    },

	    /**
	     * Get more page index
	     * @param {string} moveType - Move type ('prev' or 'next')
	     * @returns {number} Page index
	     * @private
	     */
	    _getMorePageIndex: function(moveType) {
	        var currentPageIndex = this._getPageIndex(this.getCurrentPage());
	        var pageCount = this._options.visiblePages;
	        var isPrevMove = (moveType === 'prev');
	        var pageIndex;

	        if (this._options.centerAlign) {
	            pageIndex = isPrevMove ? currentPageIndex - 1 : currentPageIndex + pageCount;
	        } else {
	            pageIndex = isPrevMove ? (currentPageIndex - 1) * pageCount : (currentPageIndex * pageCount) + 1;
	        }

	        return pageIndex;
	    },
	    /* eslint-enable complexity */

	    /**
	     * Get available page number from over number
	     * If total page is 23, but input number is 30 => return 23
	     * @param {number} page - Page number
	     * @returns {number} Replaced pgae number
	     * @private
	     */
	    _convertToValidPage: function(page) {
	        var lastPageNumber = this._getLastPage();
	        page = Math.max(page, 1);
	        page = Math.min(page, lastPageNumber);

	        return page;
	    },

	    /**
	     * Create require view set, notify view to update
	     * @param {number} page - Page number
	     * @private
	     */
	    _paginate: function(page) {
	        var viewData = this._makeViewData(page || this._options.page);
	        this._setCurrentPage(page);
	        this._view.update(viewData);
	    },

	    /**
	     * Create and get view data
	     * @param {number} page - Page number
	     * @returns {object} view data
	     * @private
	     */
	    _makeViewData: function(page) {
	        var viewData = {};
	        var lastPage = this._getLastPage();
	        var currentPageIndex = this._getPageIndex(page);
	        var lastPageListIndex = this._getPageIndex(lastPage);
	        var edges = this._getEdge(page);

	        viewData.leftPageNumber = edges.left;
	        viewData.rightPageNumber = edges.right;

	        viewData.prevMore = (currentPageIndex > 1);
	        viewData.nextMore = (currentPageIndex < lastPageListIndex);

	        viewData.page = page;
	        viewData.currentPageIndex = page;
	        viewData.lastPage = lastPage;
	        viewData.lastPageListIndex = lastPage;

	        return viewData;
	    },

	    /**
	     * Get each edge page
	     * @param {object} page - Page number
	     * @returns {{left: number, right: number}} Edge page numbers
	     * @private
	     */
	    _getEdge: function(page) {
	        var leftPageNumber, rightPageNumber, left;
	        var lastPage = this._getLastPage();
	        var visiblePages = this._options.visiblePages;
	        var currentPageIndex = this._getPageIndex(page);

	        if (this._options.centerAlign) {
	            left = Math.floor(visiblePages / 2);
	            leftPageNumber = Math.max(page - left, 1);
	            rightPageNumber = leftPageNumber + visiblePages - 1;

	            if (rightPageNumber > lastPage) {
	                leftPageNumber = Math.max(lastPage - visiblePages + 1, 1);
	                rightPageNumber = lastPage;
	            }
	        } else {
	            leftPageNumber = ((currentPageIndex - 1) * visiblePages) + 1;
	            rightPageNumber = (currentPageIndex) * visiblePages;
	            rightPageNumber = Math.min(rightPageNumber, lastPage);
	        }

	        return {
	            left: leftPageNumber,
	            right: rightPageNumber
	        };
	    },

	    /**
	     * Pagelist click event hadnler
	     * @param {?string} buttonType - Button type
	     * @param {?number} page - Page number
	     * @private
	     */
	    /* eslint-disable complexity */
	    _onClickHandler: function(buttonType, page) {
	        switch (buttonType) {
	            case 'first':
	                page = 1;
	                break;
	            case 'prev':
	                page = this._getRelativePage('prev');
	                break;
	            case 'next':
	                page = this._getRelativePage('next');
	                break;
	            case 'prevMore':
	                page = this._getMorePageIndex('prev');
	                break;
	            case 'nextMore':
	                page = this._getMorePageIndex('next');
	                break;
	            case 'last':
	                page = this._getLastPage();
	                break;
	            default:
	                if (!page) {
	                    return;
	                }
	        }

	        this.movePageTo(page);
	    },
	    /* eslint-enable complexity */

	    /**
	     * Reset pagination
	     * @param {*} totalItems - Redraw page item count
	     * @example
	     * pagination.reset();
	     * pagination.reset(100);
	     */
	    reset: function(totalItems) {
	        if (snippet.isUndefined(totalItems)) {
	            totalItems = this._options.totalItems;
	        }

	        this._options.totalItems = totalItems;
	        this._paginate(1);
	    },

	    /**
	     * Move to specific page, redraw list.
	     * Before move fire beforeMove event, After move fire afterMove event.
	     * @param {Number} targetPage - Target page
	     * @example
	     * pagination.movePageTo(10);
	     */
	    movePageTo: function(targetPage) {
	        targetPage = this._convertToValidPage(targetPage);

	        /**
	         * @event Pagination#beforeMove
	         * @type {object} evt - Custom event object
	         * @property {number} page - Moved page
	         * @example
	         * paganation.on('beforeMove', function(evt) {
	         *     var currentPage = evt.page;
	         *
	         *     if (currentPage === 10) {
	         *         return false;
	         *         // return true;
	         *     }
	         * });
	         */
	        if (!this.invoke('beforeMove', {page: targetPage})) {
	            return;
	        }

	        this._paginate(targetPage);

	        /**
	         * @event Pagination#afterMove
	         * @type {object} evt - Custom event object
	         * @property {number} page - Moved page
	         * @example
	         * paganation.on('afterMove', function(evt) {
	         *      var currentPage = evt.page;
	         *      console.log(currentPage);
	         * });
	         */
	        this.fire('afterMove', {page: targetPage});
	    },

	    /**
	     * Set total count of items
	     * @param {number} itemCount - Total item count
	     */
	    setTotalItems: function(itemCount) {
	        this._options.totalItems = itemCount;
	    },

	    /**
	     * Set count of items per page
	     * @param {number} itemCount - Item count
	     */
	    setItemsPerPage: function(itemCount) {
	        this._options.itemsPerPage = itemCount;
	    },

	    /**
	     * Get current page
	     * @returns {number} Current page
	     */
	    getCurrentPage: function() {
	        return this._currentPage || this._options.page;
	    }
	});

	snippet.CustomEvents.mixin(Pagination);

	module.exports = Pagination;


/***/ }),
/* 7 */
/***/ (function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_7__;

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var snippet = __webpack_require__(7);

	var util = __webpack_require__(9);

	var extend = snippet.extend;
	var forEach = snippet.forEach;
	var isString = snippet.isString;
	var bind = snippet.bind;
	var isHTMLNode = snippet.isHTMLNode;

	var defaultTemplate = {
	    page: '<a href="#" class="tui-page-btn">{{page}}</a>',
	    currentPage: '<strong class="tui-page-btn tui-is-selected">{{page}}</strong>',
	    moveButton:
	        '<a href="#" class="tui-page-btn tui-{{type}}">' +
	            '<span class="tui-ico-{{type}}">{{type}}</span>' +
	        '</a>',
	    disabledMoveButton:
	        '<span class="tui-page-btn tui-is-disabled tui-{{type}}">' +
	            '<span class="tui-ico-{{type}}">{{type}}</span>' +
	        '</span>',
	    moreButton:
	        '<a href="#" class="tui-page-btn tui-{{type}}-is-ellip">' +
	            '<span class="tui-ico-ellip">...</span>' +
	        '</a>'
	};
	var moveButtons = ['first', 'prev', 'next', 'last'];
	var moreButtons = ['prev', 'next'];

	var INVALID_CONTAINER_ELEMENT = 'The container element is invalid.';

	/**
	 * Pagination view class
	 * @class View
	 * @param {string|HTMLElement|jQueryObject} container - Container element or id selector
	 * @param {object} options - Option object
	 *     @param {number} [options.totalItems=10] Total item count
	 *     @param {number} [options.itemsPerPage=10] Item count per page
	 *     @param {number} [options.visiblePages=10] Display page link count
	 *     @param {number} [options.page=1] Display page after pagination draw.
	 *     @param {boolean}[options.centerAlign=false] Whether current page keep center or not
	 *     @param {string} [options.firstItemClassName='first-child'] The class name of the first item
	 *     @param {string} [options.lastItemClassName='last-child'] The class name of the last item
	 *     @param {object} [options.template] A markup string set to make element
	 *         @param {string|function} [options.template.page] HTML template
	 *         @param {string|function} [options.template.currentPage] HTML template
	 *         @param {string|function} [options.template.moveButton] HTML template
	 *         @param {string|function} [options.template.disabledMoveButton] HTML template
	 *         @param {string|function} [options.template.moreButton] HTML template
	 * @param {function} handler - Event handler
	 * @ignore
	 */
	var View = snippet.defineClass(/** @lends View.prototype */{
	    init: function(container, options, handler) {
	        /**
	         * Root element
	         * @type {HTMLElement}
	         * @private
	         */
	        this._containerElement = null;

	        /**
	         * First item's class name
	         * @type {string}
	         * @private
	         */
	        this._firstItemClassName = options.firstItemClassName;

	        /**
	         * Last item's class name
	         * @type {string}
	         * @private
	         */
	        this._lastItemClassName = options.lastItemClassName;

	        /**
	         * Default template
	         * @type {object.<string, string|function>}
	         * @private
	         */
	        this._template = extend({}, defaultTemplate, options.template);

	        /**
	         * Map of buttons
	         * @type {object.<string, HTMLElement>}
	         * @private
	         */
	        this._buttons = {};

	        /**
	         * Enabled page elements list
	         * @type {array}
	         * @private
	         */

	        this._enabledPageElements = [];

	        this._setRootElement(container);
	        this._setMoveButtons();
	        this._setDisabledMoveButtons();
	        this._setMoreButtons();
	        this._attachClickEvent(handler);
	    },
	    /* eslint-enable complexity */

	    /**
	     * Set root element
	     * @param {string|HTMLElement|jQueryObject} container - Container element or id selector
	     * @private
	     */
	    _setRootElement: function(container) {
	        if (isString(container)) {
	            container = document.getElementById(container);
	        } else if (container.jquery) {
	            container = container[0];
	        }

	        if (!isHTMLNode(container)) {
	            throw new Error(INVALID_CONTAINER_ELEMENT);
	        }

	        this._containerElement = container;
	    },

	    /**
	     * Assign move buttons to option
	     * @private
	     */
	    _setMoveButtons: function() {
	        var template = this._template.moveButton;

	        forEach(moveButtons, function(type) {
	            this._buttons[type] = util.changeTemplateToElement(template, {
	                type: type
	            });
	        }, this);
	    },

	    /**
	     * Assign disabled move buttons to option
	     * @private
	     */
	    _setDisabledMoveButtons: function() {
	        var template = this._template.disabledMoveButton;
	        var key;

	        forEach(moveButtons, function(type) {
	            key = 'disabled' + util.capitalizeFirstLetter(type);
	            this._buttons[key] = util.changeTemplateToElement(template, {
	                type: type
	            });
	        }, this);
	    },

	    /**
	     * Assign more buttons to option
	     * @private
	     */
	    _setMoreButtons: function() {
	        var template = this._template.moreButton;
	        var key;

	        forEach(moreButtons, function(type) {
	            key = type + 'More';
	            this._buttons[key] = util.changeTemplateToElement(template, {
	                type: type
	            });
	        }, this);
	    },
	    /* eslint-enable camelcase */

	    /**
	     * Get container element
	     * @returns {HTMLElement} Container element
	     * @private
	     */
	    _getContainerElement: function() {
	        return this._containerElement;
	    },

	    /**
	     * Append first button on container element
	     * @param {object} viewData - View data to render pagination
	     * @private
	     */
	    _appendFirstButton: function(viewData) {
	        var button;

	        if (viewData.page > 1) {
	            button = this._buttons.first;
	        } else {
	            button = this._buttons.disabledFirst;
	        }

	        this._getContainerElement().appendChild(button);
	    },

	    /**
	     * Append previous button on container element
	     * @param {object} viewData - View data to render pagination
	     * @private
	     */
	    _appendPrevButton: function(viewData) {
	        var button;

	        if (viewData.currentPageIndex > 1) {
	            button = this._buttons.prev;
	        } else {
	            button = this._buttons.disabledPrev;
	        }

	        this._getContainerElement().appendChild(button);
	    },

	    /**
	     * Append next button on container element
	     * @param {object} viewData - View data to render pagination
	     * @private
	     */
	    _appendNextButton: function(viewData) {
	        var button;

	        if (viewData.currentPageIndex < viewData.lastPageListIndex) {
	            button = this._buttons.next;
	        } else {
	            button = this._buttons.disabledNext;
	        }

	        this._getContainerElement().appendChild(button);
	    },

	    /**
	     * Append last button on container element
	     * @param {object} viewData - View data to render pagination
	     * @private
	     */
	    _appendLastButton: function(viewData) {
	        var button;

	        if (viewData.page < viewData.lastPage) {
	            button = this._buttons.last;
	        } else {
	            button = this._buttons.disabledLast;
	        }

	        this._getContainerElement().appendChild(button);
	    },

	    /**
	     * Append previous more button on container element
	     * @param {object} viewData - View data to render pagination
	     * @private
	     */
	    _appendPrevMoreButton: function(viewData) {
	        var button;

	        if (viewData.prevMore) {
	            button = this._buttons.prevMore;
	            util.addClass(button, this._firstItemClassName);
	            this._getContainerElement().appendChild(button);
	        }
	    },

	    /**
	     * Append next more button on container element
	     * @param {object} viewData - View data to render pagination
	     * @private
	     */
	    _appendNextMoreButton: function(viewData) {
	        var button;

	        if (viewData.nextMore) {
	            button = this._buttons.nextMore;
	            util.addClass(button, this._lastItemClassName);
	            this._getContainerElement().appendChild(button);
	        }
	    },

	    /**
	     * Append page number elements on container element
	     * @param {object} viewData - View data to render pagination
	     * @private
	     */
	    _appendPages: function(viewData) { // eslint-disable-line complexity
	        var template = this._template;
	        var firstPage = viewData.leftPageNumber;
	        var lastPage = viewData.rightPageNumber;
	        var pageItem, i;

	        for (i = firstPage; i <= lastPage; i += 1) {
	            if (i === viewData.page) {
	                pageItem = util.changeTemplateToElement(template.currentPage, {page: i});
	            } else {
	                pageItem = util.changeTemplateToElement(template.page, {page: i});
	                this._enabledPageElements.push(pageItem);
	            }

	            if (i === firstPage && !viewData.prevMore) {
	                util.addClass(pageItem, this._firstItemClassName);
	            }
	            if (i === lastPage && !viewData.nextMore) {
	                util.addClass(pageItem, this._lastItemClassName);
	            }
	            this._getContainerElement().appendChild(pageItem);
	        }
	    },

	    /**
	     * Attach click event
	     * @param {function} callback - Callback function
	     * @private
	     */
	    _attachClickEvent: function(callback) {
	        var rootElement = this._getContainerElement();

	        util.addEventListener(rootElement, 'click', bind(function(event) {
	            var target = util.getTargetElement(event);
	            var page, buttonType;

	            util.preventDefault(event);

	            buttonType = this._getButtonType(target);

	            if (!buttonType) {
	                page = this._getPageNumber(target);
	            }

	            callback(buttonType, page);
	        }, this));
	    },

	    /**
	     * Get button type to move button elements
	     * @param {HTMLElement} targetElement - Each move button element
	     * @returns {?string} Button type
	     * @private
	     */
	    _getButtonType: function(targetElement) {
	        var buttonType;
	        var buttons = this._buttons;

	        forEach(buttons, function(button, type) {
	            if (util.isContained(targetElement, button)) {
	                buttonType = type;

	                return false;
	            }

	            return true;
	        }, this);

	        return buttonType;
	    },
	    /* eslint-enable no-lonely-if */

	    /**
	     * Get number to page elements
	     * @param {HTMLElement} targetElement - Each page element
	     * @returns {?number} Page number
	     * @private
	     */
	    _getPageNumber: function(targetElement) {
	        var targetPage = this._findPageElement(targetElement);
	        var page;

	        if (targetPage) {
	            page = parseInt(targetPage.innerText, 10);
	        }

	        return page;
	    },

	    /**
	     * Find target element from page elements
	     * @param {HTMLElement} targetElement - Each page element
	     * @returns {HTMLElement} Found element
	     * @ignore
	     */
	    _findPageElement: function(targetElement) {
	        var i, length, pickedItem;

	        for (i = 0, length = this._enabledPageElements.length; i < length; i += 1) {
	            pickedItem = this._enabledPageElements[i];

	            if (util.isContained(targetElement, pickedItem)) {
	                return pickedItem;
	            }
	        }

	        return null;
	    },

	    /**
	     * Reset container element
	     * @private
	     */
	    _empty: function() {
	        this._enabledPageElements = [];

	        forEach(this._buttons, function(buttonElement, type) {
	            this._buttons[type] = buttonElement.cloneNode(true);
	        }, this);

	        this._getContainerElement().innerHTML = '';
	    },

	    /**
	     * Update view
	     * @param {object} viewData - View data to render pagination
	     * @ignore
	     */
	    update: function(viewData) {
	        this._empty();
	        this._appendFirstButton(viewData);
	        this._appendPrevButton(viewData);
	        this._appendPrevMoreButton(viewData);
	        this._appendPages(viewData);
	        this._appendNextMoreButton(viewData);
	        this._appendNextButton(viewData);
	        this._appendLastButton(viewData);
	    }
	});

	module.exports = View;


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var snippet = __webpack_require__(7);

	var util = {
	    /**
	     * Bind event to element
	     * @param {HTMLElement} element - DOM element to attach the event handler on
	     * @param {string} eventType - Event type
	     * @param {Function} callback - Event handler function
	     */
	    addEventListener: function(element, eventType, callback) {
	        if (element.addEventListener) {
	            element.addEventListener(eventType, callback, false);
	        } else {
	            element.attachEvent('on' + eventType, callback);
	        }
	    },

	    /**
	     * Prevent default event
	     * @param {Event} event - Event object
	     */
	    preventDefault: function(event) {
	        if (event.preventDefault) {
	            event.preventDefault();
	        } else {
	            event.returnValue = false;
	        }
	    },

	    /**
	     * Get target from event object
	     * @param {Event} event - Event object
	     * @returns {HTMLElement} Target element
	     */
	    getTargetElement: function(event) {
	        return event.target || event.srcElement;
	    },

	    /**
	     * Add classname
	     * @param {HTMLElement} element - Target element
	     * @param {string} className - Classname
	     */
	    addClass: function(element, className) {
	        if (!element) {
	            return;
	        }

	        if (element.className === '') {
	            element.className = className;
	        } else if (!util.hasClass(element, className)) {
	            element.className += ' ' + className;
	        }
	    },

	    /**
	     * Check the element has specific class or not
	     * @param {HTMLElement} element - A target element
	     * @param {string} className - A name of class to find
	     * @returns {boolean} Whether the element has the class
	     */
	    hasClass: function(element, className) {
	        var elClassName = util.getClass(element);

	        return elClassName.indexOf(className) > -1;
	    },

	    /**
	     * Get class name
	     * @param {HTMLElement} element - HTMLElement
	     * @returns {string} Class name
	     */
	    getClass: function(element) {
	        return element && element.getAttribute &&
	            (element.getAttribute('class') || element.getAttribute('className') || '');
	    },

	    /**
	     * Capitalize first letter
	     * @param {string} str - String to change
	     * @returns {string} Changed string
	     */
	    capitalizeFirstLetter: function(str) {
	        return str.substring(0, 1).toUpperCase() + str.substring(1, str.length);
	    },

	    /**
	     * Check the element is contained
	     * @param {HTMLElement} find - Target element
	     * @param {HTMLElement} parent - Wrapper element
	     * @returns {boolean} Whether contained or not
	     */
	    isContained: function(find, parent) {
	        if (!parent) {
	            return false;
	        }

	        return (find === parent) ? true : parent.contains(find);
	    },

	    /**
	     * Replace matched property with template
	     * @param {string} template - String of template
	     * @param {object} props - Properties
	     * @returns {string} Replaced template string
	     */
	    replaceTemplate: function(template, props) {
	        var newTemplate = template.replace(/\{\{(\w*)\}\}/g, function(value, prop) {
	            return props.hasOwnProperty(prop) ? props[prop] : '';
	        });

	        return newTemplate;
	    },

	    /**
	     * Change template string to element
	     * @param {string|Function} template - Template option
	     * @param {object} props - Template props
	     * @returns {string} Replaced template
	     */
	    changeTemplateToElement: function(template, props) {
	        var html;

	        if (snippet.isFunction(template)) {
	            html = template(props);
	        } else {
	            html = util.replaceTemplate(template, props);
	        }

	        return util.getElementFromTemplate(html);
	    },

	    /**
	     * Get element from template string
	     * @param {string} template - Template string
	     * @returns {HTMLElement} Changed element
	     */
	    getElementFromTemplate: function(template) {
	        var tempElement = document.createElement('div');

	        tempElement.innerHTML = template;

	        return tempElement.children[0];
	    },

	    /**
	     * Send information to google analytics
	     */
	    sendHostNameToGA: function() {
	        snippet.sendHostname('pagination', 'UA-129987462-1');
	    }
	};

	module.exports = util;


/***/ })
/******/ ])
});
;