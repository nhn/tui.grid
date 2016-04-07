/**
 * @fileoverview tui-grid
 * @author NHN Ent. FE Development Team
 * @version 1.2.0
 * @license MIT
 * @link https://github.com/nhnent/tui.grid
 */
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * @fileoverview Router for Addon.Net
 * @author NHN Ent. FE Development Team
 */
'use strict';

/**
 * Router for Addon.Net
 * @module addon/net-router
 */
var Router = Backbone.Router.extend(/**@lends module:addon/net-router.prototype */{
    /**
     * @constructs
     * @param  {object} attributes - Attributes
     */
    initialize: function(attributes) {
        this.net = attributes.net;
    },

    routes: {
        'read/:queryStr': 'read'
    }
});

module.exports = Router;

},{}],2:[function(require,module,exports){
/**
 * @fileoverview Network 모듈 addon
 * @author NHN Ent. FE Development Team
 */
'use strict';

var View = require('../base/view'),
    Router = require('./net-router'),
    util = require('../common/util'),
    formUtil = require('../common/formUtil'),
    GridEvent = require('../common/gridEvent');

var renderStateMap = require('../common/constMap').renderState;
var DELAY_FOR_LOADING_STATE = 200;

/**
 * Net Addon
 * @module addon/net
 * @mixes module:base/common
 */
var Net = View.extend(/**@lends module:addon/net.prototype */{
    /**
     * @constructs
     * @param {object} options
     *      @param {jquery} options.el   form 엘리먼트
     *      @param {boolean} [options.initialRequest=true]   Net 인스턴스 생성과 동시에 readData request 요청을 할 지 여부.
     *      @param {object} [options.api]   사용할 API URL 리스트
     *          @param {string} [options.api.readData]  데이터 조회 API 주소
     *          @param {string} [options.api.createData] 데이터 생성 API 주소
     *          @param {string} [options.api.updateData] 데이터 업데이트 API 주소
     *          @param {string} [options.api.modifyData] 데이터 수정 API 주소 (생성/조회/삭제 한번에 처리하는 API 주소)
     *          @param {string} [options.api.deleteData] 데이터 삭제 API 주소
     *      @param {number} [options.perPage=500]  한 페이지당 보여줄 item 개수
     *      @param {boolean} [options.enableAjaxHistory=true]   ajaxHistory 를 사용할지 여부
     * @example
     *   <form id="data_form">
     *   <input type="text" name="query"/>
     *   </form>
     *   <script>
     *      var net,
     *          grid = new tui.Grid({
     *                 //...option 생략...
     *          });
     *
     *      //Net AddOn 을 그리드 내부에서 인스턴스화 하며 초기화 한다.
     *      grid.use('Net', {
     *         el: $('#data_form'),         //필수 - form 엘리먼트
     *         initialRequest: true,   //(default: true) Net 인스턴스 생성과 동시에 readData request 요청을 할 지 여부.
     *         perPage: 500,           //(default: 500) 한 페이지당 load 할 데이터 개수
     *         enableAjaxHistory: true, //(default: true) ajaxHistory 를 사용할지 여부
     *         //사용할 API URL 리스트
     *         api: {
     *             'readData': './api/read',                       //데이터 조회 API 주소
     *             'createData': './api/create',                   //데이터 생성 API 주소
     *             'updateData': './api/update',                   //데이터 업데이트 API 주소
     *             'deleteData': './api/delete',                   //데이터 삭제 API 주소
     *             'modifyData': './api/modify',                   //데이터 수정 API 주소 (생성/조회/삭제 한번에 처리하는 API 주소)
     *             'downloadExcel': './api/download/excel',        //엑셀 다운로드 (현재페이지) API 주소
     *             'downloadExcelAll': './api/download/excelAll'   //엑셀 다운로드 (전체 데이터) API 주소
     *         }
     *      });
     *       //이벤트 핸들러 바인딩
     *       grid.on('beforeRequest', function(data) {
     *          //모든 dataRequest 시 호출된다.
     *      }).on('response', function(data) {
     *          //response 이벤트 핸들러
     *          //성공/실패와 관계없이 response 를 받을 떄 호출된다.
     *      }).on('successResponse', function(data) {
     *          //successResponse 이벤트 핸들러
     *          //response.result 가 true 일 때 호출된다.
     *      }).on('failResponse', function(data) {
     *          //failResponse 이벤트 핸들러
     *          //response.result 가 false 일 때 호출된다.
     *      }).on('errorResponse', function(data) {
     *          //ajax error response 이벤트 핸들러
     *      });
     *
     *      //grid 로부터 사용할 net 인스턴스를 가져온다.
     *      net = grid.getAddOn('Net');
     *
     *      //request 관련 자세한 옵션은 Net#request 를 참고한다.
     *      //createData API 요청
     *      net.request('createData');
     *
     *      //updateData API 요청
     *      net.request('updateData');
     *
     *      //deleteData API 요청
     *      net.request('deleteData');
     *
     *      //modifyData API 요청
     *      net.request('modifyData');
     *   </script>
     */

    initialize: function(options) {
        var defaultOptions;

        defaultOptions = {
            initialRequest: true,
            api: {
                readData: '',
                createData: '',
                updateData: '',
                deleteData: '',
                modifyData: '',
                downloadExcel: '',
                downloadExcelAll: ''
            },
            perPage: 500,
            enableAjaxHistory: true
        };
        options = $.extend(true, defaultOptions, options); // deep extend

        this.setOwnProperties({
            // models
            dataModel: options.dataModel,
            toolbarModel: options.toolbarModel,
            renderModel: options.renderModel,

            // extra objects
            router: null,
            pagination: options.toolbarModel.get('pagination'),

            // configs
            api: options.api,
            enableAjaxHistory: options.enableAjaxHistory,
            perPage: options.perPage,

            // state data
            curPage: 1,
            timeoutIdForDelay: null,
            requestedFormData: null,
            isLocked: false,
            lastRequestedReadData: null
        });

        this._initializeDataModelNetwork();
        this._initializeRouter();
        this._initializePagination();
        this._showToolbarExcelBtns();

        this.listenTo(this.dataModel, 'sortChanged', this._onSortChanged, this);

        if (options.initialRequest) {
            if (!this.lastRequestedReadData) {
                this._readDataAt(1, false);
            }
        }
    },

    tagName: 'form',

    events: {
        submit: '_onSubmit'
    },

    /**
     * pagination instance 를 초기화 한다.
     * @private
     */
    _initializePagination: function() {
        var pagination = this.pagination;
        if (pagination) {
            pagination.setOption('itemPerPage', this.perPage);
            pagination.setOption('itemCount', 1);
            pagination.on('beforeMove', $.proxy(this._onPageBeforeMove, this));
        }
    },

    /**
     * Event listener for 'route:read' event on Router
     * @param  {String} queryStr - Query string
     * @private
     */
    _onRouterRead: function(queryStr) {
        var data = util.toQueryObject(queryStr);
        this._requestReadData(data);
    },

    /**
     * dataModel 이 network 통신을 할 수 있도록 설정한다.
     * @private
     */
    _initializeDataModelNetwork: function() {
        this.dataModel.url = this.api.readData;
        this.dataModel.sync = $.proxy(this._sync, this);
    },

    /**
     * ajax history 를 사용하기 위한 router 를 초기화한다.
     * @private
     */
    _initializeRouter: function() {
        if (this.enableAjaxHistory) {
            this.router = new Router({
                net: this
            });
            this.listenTo(this.router, 'route:read', this._onRouterRead);

            if (!Backbone.History.started) {
                Backbone.history.start();
            }
        }
    },

    /**
     * Shows the excel-buttons in a toolbar (control-panel) area if the matching api exist.
     * @private
     */
    _showToolbarExcelBtns: function() {
        var toolbarModel = this.toolbarModel,
            api = this.api;

        if (!toolbarModel) {
            return;
        }

        if (api.downloadExcel) {
            toolbarModel.set('isExcelButtonVisible', true);
        }
        if (api.downloadExcelAll) {
            toolbarModel.set('isExcelAllButtonVisible', true);
        }
    },

    /**
     * pagination 에서 before page move가 발생했을 때 이벤트 핸들러
     * @param {{page:number}} customEvent pagination 으로부터 전달받는 이벤트 객체
     * @private
     */
    _onPageBeforeMove: function(customEvent) {
        var page = customEvent.page;
        if (this.curPage !== page) {
            this._readDataAt(page, true);
        }
    },

    /**
     * form 의 submit 이벤트 발생시 이벤트 핸들러
     * @param {event} submitEvent   submit 이벤트 객체
     * @private
     */
    _onSubmit: function(submitEvent) {
        submitEvent.preventDefault();
        this._readDataAt(1, false);
    },

    /**
     * 폼 데이터를 설정한다.
     * @param {Object} data - 폼 데이터 정보
     * @private
     */
    _setFormData: function(data) {
        var formData = _.clone(data);
        _.each(this.lastRequestedReadData, function(value, key) {
            if ((_.isUndefined(formData[key]) || _.isNull(formData[key])) && value) {
                formData[key] = '';
            }
        });
        formUtil.setFormData(this.$el, formData);
    },

    /**
     * fetch 수행 이후 custom ajax 동작 처리를 위해 Backbone 의 기본 sync 를 오버라이드 하기위한 메서드.
     * @param {String} method   router 로부터 전달받은 method 명
     * @param {Object} model    fetch 를 수행한 dataModel
     * @param {Object} options  request 정보
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
            Backbone.sync(Backbone, method, model, options);
        }
    },

    /**
     * network 통신에 대한 _lock 을 건다.
     * @private
     */
    _lock: function() {
        var renderModel = this.renderModel;

        this.timeoutIdForDelay = setTimeout(function() {
            renderModel.set('state', renderStateMap.LOADING);
        }, DELAY_FOR_LOADING_STATE);

        this.isLocked = true;
    },

    /**
     * network 통신에 대해 unlock 한다.
     * loading layer hide 는 rendering 하는 로직에서 수행한다.
     * @private
     */
    _unlock: function() {
        if (this.timeoutIdForDelay !== null) {
            clearTimeout(this.timeoutIdForDelay);
            this.timeoutIdForDelay = null;
        }

        this.isLocked = false;
    },

    /**
     * form 으로 지정된 엘리먼트의 Data 를 반환한다.
     * @returns {object} formData 데이터 오브젝트
     * @private
     */
    _getFormData: function() {
        /* istanbul ignore next*/
        return formUtil.getFormData(this.$el);
    },

    /**
     * DataModel 에서 Backbone.fetch 수행 이후 success 콜백
     * @param {object} dataModel grid 의 dataModel
     * @param {object} responseData 응답 데이터
     * @private
     */
    _onReadSuccess: function(dataModel, responseData) {
        var pagination = this.pagination,
            page, totalCount;

        dataModel.setOriginalRowList();

        if (pagination && responseData.pagination) {
            page = responseData.pagination.page;
            totalCount = responseData.pagination.totalCount;
            pagination.setOption('itemPerPage', this.perPage);
            pagination.setOption('itemCount', totalCount);
            pagination.movePageTo(page);
            this.curPage = page;
        }
    },

    /**
     * DataModel 에서 Backbone.fetch 수행 이후 error 콜백
     * @param {object} dataModel grid 의 dataModel
     * @param {object} responseData 응답 데이터
     * @param {object} options  ajax 요청 정보
     * @private
     */
    _onReadError: function(dataModel, responseData, options) {}, // eslint-disable-line

    /**
     * Requests 'readData' with last requested data.
     * @api
     */
    reloadData: function() {
        this._requestReadData(this.lastRequestedReadData);
    },

    /**
     * Requests 'readData' to the server. The last requested data will be extended with new data.
     * @api
     * @param {Number} page - Page number
     * @param {Object} data - Data(parameters) to send to the server
     * @param {Boolean} resetData - If set to true, last requested data will be ignored.
     */
    readData: function(page, data, resetData) {
        if (resetData) {
            if (!data) {
                data = {};
            }
            data.perPage = this.perPage;
            this._changeSortOptions(data, this.dataModel.sortOptions);
        } else {
            data = _.assign({}, this.lastRequestedReadData, data);
        }
        data.page = page;
        this._requestReadData(data);
    },

    /**
     * 데이터 조회 요청.
     * @param {object} data 요청시 사용할 request 파라미터
     * @private
     */
    _requestReadData: function(data) {
        var startNumber = 1;

        this._setFormData(data);

        if (!this.isLocked) {
            this.renderModel.initializeVariables();
            this._lock();

            this.requestedFormData = _.clone(data);
            this.curPage = data.page || this.curPage;
            startNumber = (this.curPage - 1) * this.perPage + 1;
            this.renderModel.set({
                startNumber: startNumber
            });

            //마지막 요청한 reloadData에서 사용하기 위해 data 를 저장함.
            this.lastRequestedReadData = _.clone(data);
            this.dataModel.fetch({
                requestType: 'readData',
                data: data,
                type: 'POST',
                success: $.proxy(this._onReadSuccess, this),
                error: $.proxy(this._onReadError, this),
                reset: true
            });
            this.dataModel.setSortOptionValues(data.sortColumn, data.sortAscending);
        }

        if (this.router) {
            this.router.navigate('read/' + util.toQueryString(data), {
                trigger: false
            });
        }
    },

    /**
     * sortChanged 이벤트 발생시 실행되는 함수
     * @private
     * @param {object} sortOptions 정렬 옵션
     * @param {string} sortOptions.sortColumn 정렬할 컬럼명
     * @param {boolean} sortOptions.isAscending 오름차순 여부
     */
    _onSortChanged: function(sortOptions) {
        if (sortOptions.isRequireFetch) {
            this._readDataAt(1, true, sortOptions);
        }
    },

    /**
     * 데이터 객체의 정렬 옵션 관련 값을 변경한다.
     * @private
     * @param {object} data 데이터 객체
     * @param {object} sortOptions 정렬 옵션
     * @param {string} sortOptions.sortColumn 정렬할 컬럼명
     * @param {boolean} sortOptions.isAscending 오름차순 여부
     */
    _changeSortOptions: function(data, sortOptions) {
        if (!sortOptions) {
            return;
        }
        if (sortOptions.columnName === 'rowKey') {
            delete data.sortColumn;
            delete data.sortAscending;
        } else {
            data.sortColumn = sortOptions.columnName;
            data.sortAscending = sortOptions.isAscending;
        }
    },

    /**
     * 현재 form data 기준으로, page 에 해당하는 데이터를 조회 한다.
     * @param {Number} page 조회할 페이지 정보
     * @param {Boolean} [isUsingRequestedData=true] page 단위 검색이므로, form 수정여부와 관계없이 처음 보낸 form 데이터로 조회할지 여부를 결정한다.
     * @param {object} sortOptions 정렬 옵션
     * @param {string} sortOptions.sortColumn 정렬할 컬럼명
     * @param {boolean} sortOptions.isAscending 오름차순 여부
     * @private
     */
    _readDataAt: function(page, isUsingRequestedData, sortOptions) {
        var data;

        isUsingRequestedData = _.isUndefined(isUsingRequestedData) ? true : isUsingRequestedData;
        data = isUsingRequestedData ? this.requestedFormData : this._getFormData();
        data.page = page;
        data.perPage = this.perPage;
        this._changeSortOptions(data, sortOptions);
        this._requestReadData(data);
    },

    /**
     * 서버로 API request 한다.
     * @api
     * @param {String} requestType 요청 타입. 'createData|updateData|deleteData|modifyData' 중 하나를 인자로 넘긴다.
     * @param {object} options Options
     *      @param {String} [options.url]  url 정보. 생략시 Net 에 설정된 api 옵션 정보로 요청한다.
     *      @param {String} [options.hasDataParam=true] rowList 데이터 파라미터를 포함하여 보낼지 여부
     *      @param {String} [options.isOnlyChecked=true]  선택(Check)된 row 에 대한 목록 데이터를 포함하여 요청한다.
     *      isOnlyModified 도 설정되었을 경우, 선택&변경된 목록을 요청한다.
     *      @param {String} [options.isOnlyModified=true]  수정된 행 데이터 목록을 간추려 요청한다.
     *      isOnlyChecked 도 설정되었을 경우, 선택&변경된 목록을 요청한다.
     *      @param {String} [options.isSkipConfirm=false]  confirm 메세지를 보여줄지 여부를 지정한다.
     */
    request: function(requestType, options) {
        var defaultOptions = {
                url: this.api[requestType],
                type: null,
                hasDataParam: true,
                isOnlyChecked: true,
                isOnlyModified: true,
                isSkipConfirm: false
            },
            newOptions = $.extend(defaultOptions, options),
            param = this._getRequestParam(requestType, newOptions);

        if (param) {
            this._ajax(param);
        }
    },

    /**
     * Change window.location to registered url for downloading data
     * @api
     * @param {string} type - Download type. 'excel' or 'excelAll'.
     *        Will be matched with API 'downloadExcel', 'downloadExcelAll'.
     */
    download: function(type) {
        var apiName = 'download' + util.toUpperCaseFirstLetter(type),
            data = this.requestedFormData,
            url = this.api[apiName],
            paramStr;

        if (type === 'excel') {
            data.page = this.curPage;
            data.perPage = this.perPage;
        } else {
            data = _.omit(data, 'page', 'perPage');
        }

        paramStr = $.param(data);
        window.location = url + '?' + paramStr;
    },

    /**
     * Set number of rows per page and reload current page
     * @api
     * @param {number} perPage - Number of rows per page
     */
    setPerPage: function(perPage) {
        this.perPage = perPage;
        this._readDataAt(1);
    },

    /**
     * 서버로 요청시 사용될 파라미터 중 Grid 의 데이터에 해당하는 데이터를 Option 에 맞추어 반환한다.
     * @param {String} requestType  요청 타입. 'createData|updateData|deleteData|modifyData' 중 하나를 인자로 넘긴다.
     * @param {Object} [options] Options
     *      @param {boolean} [options.hasDataParam=true] request 데이터에 rowList 관련 데이터가 포함될 지 여부.
     *      @param {boolean} [options.isOnlyModified=true] rowList 관련 데이터 중 수정된 데이터만 포함할 지 여부
     *      @param {boolean} [options.isOnlyChecked=true] rowList 관련 데이터 중 checked 된 데이터만 포함할 지 여부
     * @returns {{count: number, data: {requestType: string, url: string, data: object,
     *      type: string, dataType: string}}} 옵션 조건에 해당하는 그리드 데이터 정보
     * @private
     */
    _getDataParam: function(requestType, options) {
        var dataModel = this.dataModel,
            checkMap = {
                createData: ['createList'],
                updateData: ['updateList'],
                deleteData: ['deleteList'],
                modifyData: ['createList', 'updateList', 'deleteList']
            },
            checkList = checkMap[requestType],
            data = {},
            count = 0,
            dataMap;

        options = _.defaults(options || {}, {
            hasDataParam: true,
            isOnlyModified: true,
            isOnlyChecked: true
        });

        if (options.hasDataParam) {
            if (options.isOnlyModified) {
                //{createList: [], updateList:[], deleteList: []} 에 담는다.
                dataMap = dataModel.getModifiedRowList({
                    isOnlyChecked: options.isOnlyChecked
                });
                _.each(dataMap, function(list, name) {
                    if (_.contains(checkList, name) && list.length) {
                        count += list.length;
                        data[name] = $.toJSON(list);
                    }
                }, this);
            } else {
                //{rowList: []} 에 담는다.
                data.rowList = dataModel.getRowList(options.isOnlyChecked);
                count = data.rowList.length;
            }
        }

        return {
            data: data,
            count: count
        };
    },

    /**
     * requestType 에 따라 서버에 요청할 파라미터를 반환한다.
     * @param {String} requestType 요청 타입. 'createData|updateData|deleteData|modifyData' 중 하나를 인자로 넘긴다.
     * @param {Object} [options] Options
     *      @param {String} [options.url=this.api[requestType]] 요청할 url.
     *      지정하지 않을 시 option 으로 넘긴 API 중 request Type 에 해당하는 url 로 지정됨
     *      @param {String} [options.type='POST'] request method 타입
     *      @param {boolean} [options.hasDataParam=true] request 데이터에 rowList 관련 데이터가 포함될 지 여부.
     *      @param {boolean} [options.isOnlyModified=true] rowList 관련 데이터 중 수정된 데이터만 포함할 지 여부
     *      @param {boolean} [options.isOnlyChecked=true] rowList 관련 데이터 중 checked 된 데이터만 포함할 지 여부
     * @returns {{requestType: string, url: string, data: object, type: string, dataType: string}}
     *      ajax 호출시 사용될 option 파라미터
     * @private
     */
    _getRequestParam: function(requestType, options) {
        var defaultOptions = {
                url: this.api[requestType],
                type: null,
                hasDataParam: true,
                isOnlyModified: true,
                isOnlyChecked: true
            },
            newOptions = $.extend(defaultOptions, options),
            dataParam = this._getDataParam(requestType, newOptions),
            param = null;

        if (newOptions.isSkipConfirm || this._isConfirmed(requestType, dataParam.count)) {
            param = {
                requestType: requestType,
                url: newOptions.url,
                data: dataParam.data,
                type: newOptions.type
            };
        }
        return param;
    },

    /**
     * requestType 에 따른 컨펌 메세지를 노출한다.
     * @param {String} requestType 요청 타입. 'createData|updateData|deleteData|modifyData' 중 하나를 인자로 넘긴다.
     * @param {Number} count   전송될 데이터 개수
     * @returns {boolean}    계속 진행할지 여부를 반환한다.
     * @private
     */
    _isConfirmed: function(requestType, count) {
        var result = false;

        /* istanbul ignore next: confirm 을 확인할 수 없읔 */
        if (count > 0) {
            result = confirm(this._getConfirmMessage(requestType, count));
        } else {
            alert(this._getConfirmMessage(requestType, count));
        }
        return result;
    },

    /**
     * confirm message 를 반환한다.
     * @param {String} requestType 요청 타입. 'createData|updateData|deleteData|modifyData' 중 하나를 인자로 넘긴다.
     * @param {Number} count 전송될 데이터 개수
     * @returns {string} 생성된 confirm 메세지
     * @private
     */
    _getConfirmMessage: function(requestType, count) {
        var textMap = {
                'createData': '입력',
                'updateData': '수정',
                'deleteData': '삭제',
                'modifyData': '반영'
            },
            actionName = textMap[requestType],
            message;

        if (count > 0) {
            message = count + '건의 데이터를 ' + actionName + '하시겠습니까?';
        } else {
            message = actionName + '할 데이터가 없습니다.';
        }
        return message;
    },

    /**
     * ajax 통신을 한다.
     * @param {{requestType: string, url: string, data: object, type: string, dataType: string}} options ajax 요청 파라미터
     * @private
     */
    _ajax: function(options) {
        var eventData = new GridEvent(options.data),
            params;

        this.trigger('beforeRequest', eventData);
        if (eventData.isStopped()) {
            return;
        }

        options = $.extend({requestType: ''}, options);
        params = {
            url: options.url,
            data: options.data || {},
            type: options.type || 'POST',
            dataType: options.dataType || 'json',
            complete: $.proxy(this._onComplete, this, options.complete, options),
            success: $.proxy(this._onSuccess, this, options.success, options),
            error: $.proxy(this._onError, this, options.error, options)
        };
        if (options.url) {
            $.ajax(params);
        }
    },

    /**
     * ajax complete 이벤트 핸들러
     * @param {Function} callback   통신 완료 이후 수행할 콜백함수
     * @param {object} jqXHR    jqueryXHR  객체
     * @param {number} status   http status 정보
     * @private
     */
    _onComplete: function(callback, jqXHR, status) { // eslint-disable-line no-unused-vars
        this._unlock();
    },

    /**
     * ajax success 이벤트 핸들러
     * @param {Function} callback Callback function
     * @param {{requestType: string, url: string, data: object, type: string, dataType: string}} options ajax 요청 파라미터
     * @param {Object} responseData 응답 데이터
     * @param {number} status   http status 정보
     * @param {object} jqXHR    jqueryXHR  객체
     * @private
     */
    _onSuccess: function(callback, options, responseData, status, jqXHR) {
        var message = responseData && responseData.message,
            eventData = new GridEvent({
                httpStatus: status,
                requestType: options.requestType,
                requestParameter: options.data,
                responseData: responseData
            });

        this.trigger('response', eventData);
        if (eventData.isStopped()) {
            return;
        }
        if (responseData && responseData.result) {
            this.trigger('successResponse', eventData);
            if (eventData.isStopped()) {
                return;
            }
            if (_.isFunction(callback)) {
                callback(responseData.data || {}, status, jqXHR);
            }
        } else {
            this.trigger('failResponse', eventData);
            if (eventData.isStopped()) {
                return;
            }
            if (message) {
                alert(message);
            }
        }
    },

    /**
     * ajax error 이벤트 핸들러
     * @param {Function} callback Callback function
     * @param {{requestType: string, url: string, data: object, type: string, dataType: string}} options ajax 요청 파라미터
     * @param {object} jqXHR    jqueryXHR  객체
     * @param {number} status   http status 정보
     * @param {String} errorMessage 에러 메세지
     * @private
     */
    _onError: function(callback, options, jqXHR, status) {
        var eventData = new GridEvent({
            httpStatus: status,
            requestType: options.requestType,
            requestParameter: options.data,
            responseData: null
        });
        this.renderModel.set('state', renderStateMap.DONE);

        this.trigger('response', eventData);
        if (eventData.isStopped()) {
            return;
        }

        this.trigger('errorResponse', eventData);
        if (eventData.isStopped()) {
            return;
        }

        if (jqXHR.readyState > 1) {
            alert('데이터 요청 중에 에러가 발생하였습니다.\n\n다시 시도하여 주시기 바랍니다.');
        }
    }
});

module.exports = Net;

},{"../base/view":7,"../common/constMap":8,"../common/formUtil":9,"../common/gridEvent":10,"../common/util":11,"./net-router":1}],3:[function(require,module,exports){
/**
 * @fileoverview Base class for Collections
 * @author NHN Ent. FE Development Team
 */
'use strict';

var common = require('./common');

/**
 * Base class for Collection
 * @module base/collection
 * @mixes module:base/common
 */
var Collection = Backbone.Collection.extend(/**@lends module:base/collection.prototype */{
    /**
     * collection 내 model 들의 event listener 를 제거하고 메모리에서 해제한다.
     * @returns {object} this object
     */
    clear: function() {
        this.each(function(model) {
            model.stopListening();
            model = null;
        });
        this.reset([], {silent: true});

        return this;
    }
});

_.assign(Collection.prototype, common);

module.exports = Collection;

},{"./common":4}],4:[function(require,module,exports){
/**
 * @fileoverview Mixin object for base class
 * @author NHN Ent. FE Development Team
 */
'use strict';

/**
 * Mixin object for base class
 * @mixin
 * @exports module:base/common
 */
var common = {
    /**
     * 주어진 객체의 프라퍼티들을 this에 복사해서 추가한다.
     * @param  {object} properties 추가할 프라퍼티 객체
     */
    setOwnProperties: function(properties) {
        _.each(properties, function(value, key) {
            this[key] = value;
        }, this);
    }
};
module.exports = common;

},{}],5:[function(require,module,exports){
/**
 * @fileoverview Base class for Models
 * @author NHN Ent. FE Development Team
 */
'use strict';

var common = require('./common');

/**
 * Base class for Models
 * @module base/model
 * @mixes module:base/common
 */
var Model = Backbone.Model.extend(/**@lends module:base/model.prototype*/{});

_.assign(Model.prototype, common);

module.exports = Model;

},{"./common":4}],6:[function(require,module,exports){
/**
 * @fileoverview Base class for Painters
 * @author NHN Ent. FE Development Team
 */
'use strict';

/**
 * Base class for Painters
 * The Painter class is implentation of 'flyweight' pattern for the View class.
 * This aims to act like a View class but doesn't create an instance of each view items
 * to improve rendering performance.
 * @module base/painter
 */
var Painter = tui.util.defineClass(/**@lends module:base/painter.prototype */{
    /**
     * @constructs
     * @param {Object} options - options
     */
    init: function(options) {
        this.controller = options.controller;
    },

    /**
     * key-value object contains event names as keys and handler names as values
     * @type {Object}
     */
    events: {},

    /**
     * css selector to use delegated event handlers by '$.on()' method.
     * @type {String}
     */
    selector: '',

    /**
     * Returns the cell address of the target element.
     * @param {jQuery} $target - target element
     * @returns {{rowKey: String, columnName: String}}
     * @private
     */
    _getCellAddress: function($target) {
        var $addressHolder = $target.closest('[data-row-key]');

        return {
            rowKey: $addressHolder.attr('data-row-key'),
            columnName: $addressHolder.attr('data-column-name')
        };
    },

    /**
     * Attaches all event handlers to the $target element.
     * @param {jquery} $target - target element
     * @param {String} parentSelector - selector of a parent element
     */
    attachEventHandlers: function($target, parentSelector) {
        _.each(this.events, function(methodName, eventName) {
            var boundHandler = _.bind(this[methodName], this),
                selector = parentSelector + ' ' + this.selector;

            $target.on(eventName, selector, boundHandler);
        }, this);
    },

    /**
     * Generates a HTML string from given data, and returns it.
     * @abstract
     */
    generateHtml: function() {
        throw new Error('implement generateHtml() method');
    }
});

module.exports = Painter;

},{}],7:[function(require,module,exports){
/**
 * @fileoverview Base class for Views
 * @author NHN Ent. FE Development Team
 */
'use strict';

var common = require('./common');

/**
 * Base class for Views
 * @module base/view
 * @mixes module:base/common
 */
var View = Backbone.View.extend(/**@lends module:base/view.prototype */{
    /**
     * @constructs
     */
    initialize: function() {
        this._children = [];
    },

    /**
     * 에러 객체를 반환한다.
     * @param {String} message - Error message
     * @returns {error} 에러객체
     */
    error: function(message) {
        var GridError = function() {
            this.name = 'Grid Exception';
            this.message = message || 'error';
        };
        GridError.prototype = new Error();
        return new GridError();
    },

    /**
     * Add children views
     * @param {(Object|Array)} views - View instance of Array of view instances
     * @private
     */
    _addChildren: function(views) {
        if (!_.isArray(views)) {
            views = [views];
        }
        [].push.apply(this._children, views);
    },

    /**
     * Render children and returns thier elements as array.
     * @returns {array.<HTMLElement>} An array of element of children
     */
    _renderChildren: function() {
        var elements = _.map(this._children, function(view) {
            return view.render().el;
        });
        return elements;
    },

    /**
     * 자식 View를 제거한 뒤 자신도 제거한다.
     */
    destroy: function() {
        this.stopListening();
        this._destroyChildren();
        this.remove();
    },

    /**
     * 등록되어있는 자식 View 들을 제거한다.
     */
    _destroyChildren: function() {
        if (this._children) {
            while (this._children.length > 0) {
                this._children.pop().destroy();
            }
        }
    }
});

_.assign(View.prototype, common);

module.exports = View;

},{"./common":4}],8:[function(require,module,exports){
/**
* @fileoverview Object that conatins constant values
* @author NHN Ent. FE Development Team
*/
'use strict';

var keyCode = {
    TAB: 9,
    ENTER: 13,
    CTRL: 17,
    ESC: 27,
    LEFT_ARROW: 37,
    UP_ARROW: 38,
    RIGHT_ARROW: 39,
    DOWN_ARROW: 40,
    CHAR_A: 65,
    CHAR_C: 67,
    CHAR_F: 70,
    CHAR_R: 82,
    CHAR_V: 86,
    LEFT_WINDOW_KEY: 91,
    F5: 116,
    BACKSPACE: 8,
    SPACE: 32,
    PAGE_UP: 33,
    PAGE_DOWN: 34,
    HOME: 36,
    END: 35,
    DEL: 46,
    UNDEFINED: 229
};

module.exports = {
    keyCode: keyCode,
    keyName: _.invert(keyCode),
    renderState: {
        LOADING: 'LOADING',
        DONE: 'DONE',
        EMPTY: 'EMPTY'
    },
    dimension: {
        CELL_BORDER_WIDTH: 1,
        TABLE_BORDER_WIDTH: 1
    }
};

},{}],9:[function(require,module,exports){
/**
 * @fileoverview Utilities for form data, form element
 * @author NHN Ent. Fe Development Team
 */
'use strict';

/**
 * @module formUtil
 */
var formUtil = {
    /**
     * form 의 input 요소 값을 설정하기 위한 객체
     * @alias form.setInput
     * @memberof module:util
     */
    setInput: {
        /**
         * 배열의 값들을 전부 String 타입으로 변환한다.
         * @ignore
         * @param {Array}  arr 변환할 배열
         * @returns {Array} 변환된 배열 결과 값
         */
        '_changeToStringInArray': function(arr) {
            _.each(arr, function(value, i) {
                arr[i] = String(value);
            });
            return arr;
        },

        /**
         * radio type 의 input 요소의 값을 설정한다.
         * @ignore
         * @param {HTMLElement} targetElement - Target element
         * @param {String} formValue - Form value
         */
        'radio': function(targetElement, formValue) {
            targetElement.checked = (targetElement.value === formValue);
        },

        /**
         * radio type 의 input 요소의 값을 설정한다.
         * @ignore
         * @memberof module:util
         * @param {HTMLElement} targetElement - Target element
         * @param {String} formValue - Form value
         */
        'checkbox': function(targetElement, formValue) {
            if (_.isArray(formValue)) {
                targetElement.checked = $.inArray(targetElement.value, this._changeToStringInArray(formValue)) !== -1;
            } else {
                targetElement.checked = (targetElement.value === formValue);
            }
        },

        /**
         * select-one type 의 input 요소의 값을 설정한다.
         * @ignore
         * @param {HTMLElement} targetElement - Target element
         * @param {String} formValue - Form value
         */
        'select-one': function(targetElement, formValue) {
            var options = tui.util.toArray(targetElement.options);

            targetElement.selectedIndex = _.findIndex(options, function(option) {
                return option.value === formValue || option.text === formValue;
            });
        },

        /**
         * select-multiple type 의 input 요소의 값을 설정한다.
         * @ignore
         * @param {HTMLElement} targetElement - Target element
         * @param {String} formValue - Form value
         */
        'select-multiple': function(targetElement, formValue) {
            var options = tui.util.toArray(targetElement.options);

            if (_.isArray(formValue)) {
                formValue = this._changeToStringInArray(formValue);
                _.each(options, function(targetOption) {
                    targetOption.selected = $.inArray(targetOption.value, formValue) !== -1 ||
                    $.inArray(targetOption.text, formValue) !== -1;
                });
            } else {
                this['select-one'].apply(this, arguments);
            }
        },

        /**
         * input 요소의 값을 설정하는 default 로직
         * @memberof module:util
         * @param {HTMLElement} targetElement - Target element
         * @param {String} formValue - Form value
         */
        'defaultAction': function(targetElement, formValue) {
            targetElement.value = formValue;
        }
    },

    /**
     * $form 에 정의된 인풋 엘리먼트들의 값을 모아서 DataObject 로 구성하여 반환한다.
     * @memberof module:util
     * @alias form.getFormData
     * @param {jQuery} $form jQuery()로 감싼 폼엘리먼트
     * @returns {object} form 내의 데이터들을 key:value 형태의 DataObject 로 반환한다.
     **/
    getFormData: function($form) {
        var result = {},
            valueList = $form.serializeArray(),
            isExisty = tui.util.isExisty;

        _.each(valueList, function(obj) {
            var value = obj.value || '',
                name = obj.name;

            if (isExisty(result[name])) {
                result[name] = [].concat(result[name], value);
            } else {
                result[name] = value;
            }
        });

        return result;
    },

    /**
     * 폼 안에 있는 모든 인풋 엘리먼트를 배열로 리턴하거나, elementName에 해당하는 인풋 엘리먼트를 리턴한다.
     * @memberof module:util
     * @alias form.getFormElement
     * @param {jQuery} $form jQuery()로 감싼 폼엘리먼트
     * @param {String} [elementName] 특정 이름의 인풋 엘리먼트만 가져오고 싶은 경우 전달하며, 생략할 경우 모든 인풋 엘리먼트를 배열 형태로 리턴한다.
     * @returns {jQuery} jQuery 로 감싼 엘리먼트를 반환한다.
     */
    getFormElement: function($form, elementName) {
        var formElement;
        if ($form && $form.length) {
            if (elementName) {
                formElement = $form.prop('elements')[String(elementName)];
            } else {
                formElement = $form.prop('elements');
            }
        }
        return $(formElement);
    },

    /**
     * 파라미터로 받은 데이터 객체를 이용하여 폼내에 해당하는 input 요소들의 값을 설정한다.
     * @memberof module:util
     * @alias form.setFormData
     * @param {jQuery} $form jQuery()로 감싼 폼엘리먼트
     * @param {Object} formData 폼에 설정할 폼 데이터 객체
     **/
    setFormData: function($form, formData) {
        _.each(formData, function(value, property) {
            this.setFormElementValue($form, property, value);
        }, this);
    },

    /**
     * elementName에 해당하는 인풋 엘리먼트에 formValue 값을 설정한다.
     * -인풋 엘리먼트의 이름을 기준으로 하기에 라디오나 체크박스 엘리먼트에 대해서도 쉽게 값을 설정할 수 있다.
     * @memberof module:util
     * @alias form.setFormElementValue
     * @param {jQuery} $form jQuery()로 감싼 폼엘리먼트
     * @param {String}  elementName 값을 설정할 인풋 엘리먼트의 이름
     * @param {String|Array} formValue 인풋 엘리먼트에 설정할 값으로 체크박스나 멀티플 셀렉트박스인 경우에는 배열로 설정할 수 있다.
     **/
    setFormElementValue: function($form, elementName, formValue) {
        var $elementList = this.getFormElement($form, elementName),
            type;

        if (!$elementList.length) {
            return;
        }
        if (!_.isArray(formValue)) {
            formValue = String(formValue);
        }

        $elementList = tui.util.isHTMLTag($elementList) ? [$elementList] : $elementList;
        $elementList = tui.util.toArray($elementList);
        _.each($elementList, function(targetElement) {
            type = this.setInput[targetElement.type] ? targetElement.type : 'defaultAction';
            this.setInput[type](targetElement, formValue);
        }, this);
    },

    /**
     * input 타입의 엘리먼트의 커서를 가장 끝으로 이동한다.
     * @memberof module:util
     * @alias form.setCursorToEnd
     * @param {HTMLElement} target HTML input 엘리먼트
     */
    setCursorToEnd: function(target) {
        var length = target.value.length,
            range;

        target.focus();
        if (target.setSelectionRange) {
            try {
                target.setSelectionRange(length, length);
            } catch (e) {
                // to prevent unspecified error in IE (occurs when running test)
            }
        } else if (target.createTextRange) {
            range = target.createTextRange();
            range.collapse(true);
            range.moveEnd('character', length);
            range.moveStart('character', length);
            try {
                range.select();
            } catch (e) {
                // to prevent unspecified error in IE (occurs when running test)
            }
        }
    }
};

module.exports = formUtil;

},{}],10:[function(require,module,exports){
/**
 * @fileoverview Event class for public event of Grid
 * @author NHN Ent. FE Development Team
 */
'use strict';

/**
 * Event class for public event of Grid
 * @module common/gridEvent
 */
var GridEvent = tui.util.defineClass(/**@lends module:common/gridEvent.prototype */{
    /**
     * @constructs
     * @param {Object} data - Event data for handler
     */
    init: function(data) {
        this._stopped = false;
        this.setData(data);
    },

    /**
     * Sets data
     * @param {Object} data - data
     */
    setData: function(data) {
        _.extend(this, data);
    },

    /**
     * Stops propogation of this event.
     * @api
     */
    stop: function() {
        this._stopped = true;
    },

    /**
     * Returns whether this event is stopped.
     * @returns {Boolean}
     */
    isStopped: function() {
        return this._stopped;
    }
});

module.exports = GridEvent;

},{}],11:[function(require,module,exports){
/**
* @fileoverview 유틸리티 메서드 모음
* @author NHN Ent. FE Development Team
*/
'use strict';

var CELL_BORDER_WIDTH = require('./constMap').dimension.CELL_BORDER_WIDTH;

/**
* util 모듈
* @module util
*/
var util = {
    uniqueId: 0,
    /**
     * HTML Attribute 설정 시 필요한 문자열을 가공한다.
     * @memberof module:util
     * @param {{key:value}} attributes  문자열로 가공할 attribute 데이터
     * @returns {string} html 마크업에 포함될 문자열
     * @example
     var str = util.getAttributesString({
            'class': 'focused disabled',
            'width': '100',
            'height': '200'
      });

     =>
     class="focused disabled" width="100" height="200"
     */
    getAttributesString: function(attributes) {
        var str = '';
        _.each(attributes, function(value, key) {
            str += ' ' + key + '="' + value + '"';
        }, this);
        return str;
    },

    /**
     * 배열의 합을 반환한다.
     * @memberof module:util
     * @param {number[]} list   총 합을 구할 number 타입 배열
     * @returns {number} 합산한 결과값
     */
    sum: function(list) {
        return _.reduce(list, function(memo, value) {
            memo += value;
            return memo;
        }, 0);
    },

    /**
     * Returns the minimum value and the maximum value of the values in array.
     * @param {Array} arr - Target array
     * @returns {{min: number, max: number}} Min and Max
     * @see {@link http://jsperf.com/getminmax}
     */
    getMinMax: function(arr) {
        return {
            min: Math.min.apply(null, arr),
            max: Math.max.apply(null, arr)
        };
    },

    /**
     * Returns the table height including height of rows and borders.
     * @memberof module:util
     * @param {number} rowCount - row count
     * @param {number} rowHeight - row height
     * @returns {number}
     */
    getHeight: function(rowCount, rowHeight) {
        return rowCount === 0 ? rowCount : rowCount * (rowHeight + CELL_BORDER_WIDTH);
    },

    /**
     * Returns the count of rows based on table height and row height.
     * @memberof module:util
     * @param {number} tableHeight - table height
     * @param {number} rowHeight - individual row height
     * @returns {number}
     */
    getDisplayRowCount: function(tableHeight, rowHeight) {
        return Math.ceil(tableHeight / (rowHeight + CELL_BORDER_WIDTH));
    },

    /**
     * Returns the individual height of a row bsaed on the count of rows and table height.
     * @memberof module:util
     * @param {number} rowCount - row count
     * @param {number} tableHeight - table height
     * @returns {number} 한 행당 높이값
     */
    getRowHeight: function(rowCount, tableHeight) {
        return rowCount === 0 ? 0 : Math.floor(((tableHeight - CELL_BORDER_WIDTH) / rowCount));
    },

    /**
     * Returns whether the column of a given name is meta-column.
     * @param {String} columnName - column name
     * @returns {Boolean}
     */
    isMetaColumn: function(columnName) {
        return _.contains(['_button', '_number'], columnName);
    },

    /**
     * target 과 dist 의 값을 비교하여 같은지 여부를 확인하는 메서드
     * === 비교 연산자를 사용하므로, object 의 경우 1depth 까지만 지원함.
     * @memberof module:util
     * @param {*} target    동등 비교할 target
     * @param {*} dist      동등 비교할 dist
     * @returns {boolean}    동일한지 여부
     */
    isEqual: function(target, dist) {
        var isDiff,
            compareObject = function(targetObj, distObj) {
                var result = false;

                tui.util.forEach(targetObj, function(item, key) {
                    result = (item === distObj[key]);
                    return result;
                });
                return result;
            };

        if (typeof target !== typeof dist) {
            return false;
        } else if (_.isArray(target) && target.length !== dist.length) {
            return false;
        } else if (_.isObject(target)) {
            isDiff = !compareObject(target, dist) || !compareObject(dist, target);
            return !isDiff;
        } else if (target !== dist) {
            return false;
        }
        return true;
    },

    /**
     * Returns whether the string blank.
     * @memberof module:util
     * @param {*} target - target object
     * @returns {boolean} True if target is undefined or null or ''
     */
    isBlank: function(target) {
        if (_.isString(target)) {
            return !target.length;
        }
        return _.isUndefined(target) || _.isNull(target);
    },

    /**
     * Grid 에서 필요한 형태로 HTML tag 를 제거한다.
     * @memberof module:util
     * @param {string} htmlString   html 마크업 문자열
     * @returns {String} HTML tag 에 해당하는 부분을 제거한 문자열
     */
    stripTags: function(htmlString) {
        var matchResult;
        htmlString = htmlString.replace(/[\n\r\t]/g, '');
        if (tui.util.hasEncodableString(htmlString)) {
            if (/<img/i.test(htmlString)) {
                matchResult = htmlString.match(/<img[^>]*\ssrc=[\"']?([^>\"']+)[\"']?[^>]*>/i);
                htmlString = matchResult ? matchResult[1] : '';
            } else {
                htmlString = htmlString.replace(/<button.*?<\/button>/gi, '');
            }
            htmlString = $.trim(tui.util.decodeHTMLEntity(
                htmlString.replace(/<\/?(?:h[1-5]|[a-z]+(?:\:[a-z]+)?)[^>]*>/ig, '')
            ));
        }
        return htmlString;
    },

    /**
     * Create unique key
     * @memberof module:util
     * @returns {number} unique key 를 반환한다.
     */
    getUniqueKey: function() {
        this.uniqueId += 1;
        return this.uniqueId;
    },

    /**
     * object 를 query string 으로 변경한다.
     * @memberof module:util
     * @param {object} dataObj  쿼리 문자열으로 반환할 객체
     * @returns {string} 변환된 쿼리 문자열
     */
    toQueryString: function(dataObj) {
        var queryList = [];

        _.each(dataObj, function(value, name) {
            if (!_.isString(value) && !_.isNumber(value)) {
                value = $.toJSON(value);
            }
            value = encodeURIComponent(value);
            if (value) {
                queryList.push(name + '=' + value);
            }
        });

        return queryList.join('&');
    },

    /**
     * queryString 을 object 형태로 변형한다.
     * @memberof module:util
     * @param {String} queryString 쿼리 문자열
     * @returns {Object} 변환한 Object
     */
    toQueryObject: function(queryString) {
        var queryList = queryString.split('&'),
            obj = {};

        _.each(queryList, function(query) {
            var tmp = query.split('='),
                key, value;

            key = tmp[0];
            value = decodeURIComponent(tmp[1]);
            try {
                value = $.parseJSON(value);
            } catch(e) {} // eslint-disable-line

            if (!_.isNull(value)) {
                obj[key] = value;
            }
        });

        return obj;
    },

    /**
     * type 인자에 맞게 value type 을 convert 한다.
     * Data.Row 의 List 형태에서 editOption.list 에서 검색을 위해,
     * value type 해당 type 에 맞게 변환한다.
     * @memberof module:util
     * @param {*} value 컨버팅할 value
     * @param {String} type 컨버팅 될 타입
     * @returns {*}  타입 컨버팅된 value
     */
    convertValueType: function(value, type) {
        if (type === 'string') {
            return String(value);
        } else if (type === 'number') {
            return Number(value);
        } else if (type === 'boolean') {
            return Boolean(value);
        }
        return value;
    },

    /**
     * Capitalize first character of the target string.
     * @param  {string} string Target string
     * @returns {string} Converted new string
     */
    toUpperCaseFirstLetter: function(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    },

    /**
     * Returns a number whose value is limited to the given range.
     * @param {Number} value - A number to force within given min-max range
     * @param {Number} min - The lower boundary of the output range
     * @param {Number} max - The upper boundary of the output range
     * @returns {number} A number in the range [min, max]
     * @Example
     *      // limit the output of this computation to between 0 and 255
     *      value = clamp(value, 0, 255);
     */
    clamp: function(value, min, max) {
        var temp;
        if (min > max) { // swap
            temp = min;
            min = max;
            max = temp;
        }
        return Math.max(min, Math.min(value, max));
    },

    /**
     * Returns whether the browser is IE7
     * @returns {boolean} True if the browser is IE7
     */
    isBrowserIE7: function() {
        var browser = tui.util.browser;
        return browser.msie && browser.version === 7; // eslint-disable-line no-magic-numbers
    }
};

module.exports = util;

},{"./constMap":8}],12:[function(require,module,exports){
/**
 * @fileoverview This class offers methods that can be used to get the current state of DOM element.
 * @author NHN Ent. FE Development Team
 */
'use strict';

/**
 * Class for offering methods that can be used to get the current state of DOM element.
 * @module domState
 */
var DomState = tui.util.defineClass(/**@lends module:domState.prototype */{
    /**
     * @constructs
     * @param {jQuery} $el - jQuery object of the container element.
     */
    init: function($el) {
        this.$el = $el;
    },

    /**
     * Returns the element of the table-cell identified by rowKey and columnName
     * @param {(Number|String)} rowKey - Row key
     * @param {String} columnName - Column name
     * @returns {jQuery} Cell(TD) element
     */
    getElement: function(rowKey, columnName) {
        return this.$el.find('tr[key="' + rowKey + '"]').find('td[data-column-name=' + columnName + ']');
    },

    /**
     * Returns the offset of the container element
     * @returns {{top: Number, left: Number}} Offset object
     */
    getOffset: function() {
        return this.$el.offset();
    },

    /**
     * Returns the width of the container element
     * @returns {Number} Width of the container element
     */
    getWidth: function() {
        return this.$el.width();
    },

    /**
     * Returns the height of the parent of container element.
     * @returns {Number} Height of the parent of container element
     */
    getParentHeight: function() {
        return this.$el.parent().height();
    },

    /**
     * Returns whether there's child element having focus.
     * @returns {boolean} True if there's child element having focus
     */
    hasFocusedElement: function() {
        return !!this.$el.find(':focus').length;
    }
});

module.exports = DomState;

},{}],13:[function(require,module,exports){
/**
 * @fileoverview The tui.Grid class for the external API.
 * @author NHN Ent. FE Development Team
 */
'use strict';

/**
 * Grid public API
 *
 * @param {Object} options
 *      @param {number} [options.columnFixCount=0] - Column index for fixed column. The columns indexed from 0 to this
 *          value will always be shown on the left side. {@link tui.Grid#setColumnFixCount|setColumnFixCount}
 *          can be used for setting this value dynamically.
 *      @param {string} [options.selectType=''] - Type of buttons shown next to the _number(rowKey) column.
 *          The string value 'checkbox' or 'radiobox' can be used.
 *          If not specified, the button column will not be shown.
 *      @param {boolean} [options.autoNumbering=true] - Specifies whether to assign a auto increasing number
 *          to each rows when rendering time.
 *      @param {number} [options.headerHeight=35] - The height of header area.
 *          When rows in header are multiple (merged column), this value must be the total height of rows.
 *      @param {number} [options.rowHeight=27] - The height of each rows.
 *      @param {number} [options.displayRowCount=10] - The number of rows to be shown in the table area.
 *          Total height of grid will be set based on this value.
 *      @param {number} [options.minimumColumnWidth=50] - Minimum width of each columns.
 *      @param {boolean} [options.useClientSort=true] - If set to true, sorting will be executed by client itself
 *          without server.
 *      @param {boolean} [options.singleClickEdit=false] - If set to true, editable cell in the view-mode will be
 *          changed to edit-mode by a single click.
 *      @param {boolean} [options.scrollX=true] - Specifies whether to show horizontal scrollbar.
 *      @param {boolean} [options.scrollY=true] - Specifies whether to show vertical scrollbar.
 *      @param {boolean} [options.fitToParentHeight=false] - If set to true, the height of the grid will expand to
 *          fit the height of parent element.
 *      @param {boolean} [options.showDummyRows=false] - If set to true, empty area will be filled with dummy rows.
 *      @param {string} [options.keyColumnName=null] - The name of the column to be used to identify each rows.
 *          If not specified, unique value for each rows will be created internally.
 *      @param {Object} [options.toolbar] - The object for configuring toolbar UI.
 *          @param {boolean} [options.toolbar.hasResizeHandler=true] - Specifies whether to use the resize hendler.
 *          @param {boolean} [options.toolbar.hasControlPanel=true] - Specifies whether to use the control panel.
 *          @param {boolean} [options.toolbar.hasPagination=true] - Specifies whether to use the pagination.
 *      @param {array} options.columnModelList - The configuration of the grid columns.
 *          @param {string} options.columnModelList.columnName - The name of the column.
 *          @param {boolean} [options.columnModelList.isEllipsis=false] - If set to true, ellipsis will be used
 *              for overflowing content.
 *          @param {string} [options.columnModelList.align=left] - Horizontal alignment of the column content.
 *              Available values are 'left', 'center', 'right'.
 *          @param {string} [options.columnModelList.className] - The name of the class to be used for all cells of
 *              the column.
 *          @param {string} [options.columnModelList.title] - The title of the column to be shown on the header.
 *          @param {number} [options.columnModelList.width] - The width of the column. The unit is pixel.
 *          @param {boolean} [options.columnModelList.isHidden] - If set to true, the column will not be shown.
 *          @param {boolean} [options.columnModelList.isFixedWidth=false] - If set to true, the width of the column
 *              will not be changed.
 *          @param {boolean} [options.columnModelList.isRequired=false] - If set to true, the data of the column
 *              will be checked to be not empty whenever data is changed or calling {@link tui.Grid#validate}.
 *          @param {string} [options.columnModelList.defaultValue] - The default value to be shown when the column
 *              doesn't have a value.
 *          @param {function} [options.columnModelList.formatter] - The function that formats the value of the cell.
 *              The retrurn value of the function will be shown as the value of the cell.
 *          @param {boolean} [options.columnModelList.notUseHtmlEntity=false] - If set to true, the value of the cell
 *              will not be encoded as HTML entities.
 *          @param {boolean} [options.columnModelList.isIgnore=false] - If set to true, the value of the column will be
 *               ignored when setting up the list of modified rows.
 *          @param {boolean} [options.columnModelList.isSortable=false] - If set to true, sort button will be shown on
 *              the right side of the column header, which executes the sort action when clicked.
 *          @param {Array} [options.columnModelList.editOption] - The object for configuring editing UI.
 *              @param {string} [options.columnModelList.editOption.type='normal'] - The string value that specifies
 *                  the type of the editing UI.
 *                  Available values are 'text', 'password', 'select', 'radio', 'checkbox'.
 *              @param {boolean} [options.columnModelList.editOption.useViewMode=true] - If set to true, default mode
 *                  of the cell will be the 'view-mode'. The mode will be switched to 'edit-mode' only when user
 *                  double click or press 'ENTER' key on the cell. If set to false, the cell will always show the
 *                  input elements as a default.
 *              @param {Array} [options.columnModelList.editOption.list] - Specifies the option list for the
 *                  'select', 'radio', 'checkbox' type. The item of the array must contain properties named
 *                  'text' and 'value'. (e.g. [{text: 'option1', value: 1}, {...}])
 *              @param {function} [options.columnModelList.editOption.changeBeforeCallback] - The function that will be
 *                   called before changing the value of the cell. If returns false, the changing will be canceled.
 *              @param {function} [options.columnModelList.editOption.changeAfterCallback] - The function that will be
 *                  called after changing the value of the cell.
 *              @param {(string|function)} [options.columnModelList.editOption.beforeContent] - The HTML string to be
 *                  shown left to the value. If it's a function, the return value will be used.
 *              @param {(string|function)} [options.columnModelList.editOption.afterContent] - The HTML string to be
 *                  shown right to the value. If it's a function, the return value will be used.
 *              @param {function} [options.columnModelList.editOption.converter] - The function whose
 *                  return value (HTML) represents the UI of the cell. If the return value is
 *                  falsy(null|undefined|false), default UI will be shown.
 *              @param {Object} [options.columnModelList.editOption.inputEvents] - The object that has an event name
 *                  as a key and event handler as a value for events on input element.
 *          @param {Array} [options.columnModelList.relationList] - Specifies relation between this and other column.
 *              @param {array} [options.columnModelList.relationList.columnList] - Array of the names of target columns.
 *              @param {function} [options.columnModelList.relationList.isDisabled] - If returns true, target columns
 *                  will be disabled.
 *              @param {function} [options.columnModelList.relationList.isEditable] - If returns true, target columns
 *                  will be editable.
 *              @param {function} [options.columnModelList.relationList.optionListChange] - The function whose return
 *                  value specifies the option list for the 'select', 'radio', 'checkbox' type.
 *                  The options list of target columns will be replaced with the return value of this function.
 *      @param {array} options.columnMerge - The array that specifies the merged column.
 *          This options does not merge the cells of multiple columns into a single cell.
 *          This options only effects to the headers of the multiple columns, creates a new parent header
 *          that includes the headers of spcified columns, and sets up the hierarchy.
 * @constructor tui.Grid
 * @example
     <div id='grid'></div>
     <script>
 var grid = new tui.Grid({
    el: $('#grid'),
    columnFixCount: 2,  //(default=0)
    selectType: 'checkbox', //(default='')
    autoNumbering: true, //(default=true)
    headerHeight: 100, //(default=35)
    rowHeight: 27, // (default=27)
    displayRowCount: 10, //(default=10)
    fitToParentHeight: true // (default=false)
    showDummyRows: false // (default=false)
    minimumColumnWidth: 50, //(default=50)
    scrollX: true, //(default:true)
    scrollY: true, //(default:true)
    keyColumnName: 'column1', //(default:null)
    toolbar: {
        hasResizeHandler: true, //(default:true)
        hasControlPanel: true,  //(default:true)
        hasPagination: true     //(default:true)
    },
    columnModelList: [
        {
            title: 'normal title',
            columnName: 'column0',
            className: 'bg_red',
            width: 100,
            isEllipsis: false,
            notUseHtmlEntity: false,
            defaultValue: 'empty',
            isIgnore: false
        },
        {
            title: 'hidden column',
            columnName: 'column1',
            isHidden: true
        },
        {
            title: 'formatter example',
            columnName: 'column2',
            formatter: function(value, row) {
                return '<img src="' + value + '" />';
            }
        },
        {
            title: 'converter example',
            columnName: 'column3',
            editOption: {
                type: 'text',
                converter: function(value, row) {
                    if (row.rowKey % 2 === 0) {
                        return 'Plain text value : ' + value;
                    }
                }
            }
        },
        {
            title: 'normal text input column',
            columnName: 'column4',
            editOption: {
                type: 'text',
                beforeContent: 'price:',
                afterContent: '$'
            },
            // - param {Object}  changeEvent
            //      - param {(number|string)} changeEvent.rowKey - The rowKey of the target cell
            //      - param {(number|string)} changeEvent.columnName - The field(column) name of the target cell
            //      - param {*} changeEvent.value - The changed value of the target cell
            //      - param {Object} changeEvent.instance - The instance of the Grid
            // - returns {boolean}
            changeBeforeCallback: function(changeEvent) {
                if (!/[0-9]+/.test(changeEvent.value)) {
                    alert('Integer only.');
                    return false;
                }
            },
            // - param {Object}  changeEvent
            //      - param {(number|string)} changeEvent.rowKey - The rowKey of the target cell
            //      - param {(number|string)} changeEvent.columnName - The field(column) name of the target
            //      - param {*} changeEvent.value - The changed value of the target cell
            //      - param {Object} changeEvent.instance - - The instance of the Grid
            // - returns {boolean}
            //
            changeAfterCallback: function(changeEvent) {}
        },
        {
            title: 'password input column',
            columnName: 'column5',
            width: 100,
            isRequired: true,
            isFixedWidth: true,
            editOption: {
                type: 'password',
                beforeContent: 'password:'
            }
        },
        {
            title: 'text input when editing mode',
            columnName: 'column6',
            editOption: {
                type: 'text',
                useViewMode: fales
            },
            isIgnore: true
        },
        {
            title: 'select box',
            columnName: 'column7',
            editOption: {
                type: 'select',
                list: [
                    {text: '1', value: 1},
                    {text: '2', value: 2},
                    {text: '3', value: 3},
                    {text: '4', value: 4}
                ]
            },
            relationList: [
                {
                    columnList: ['column8', 'column9'],
                    // - param {*} value - The changed value of the target cell
                    // - param {Object} rowData - The data of the row that contains the target cell
                    // - return {boolean}
                    isDisabled: function(value, rowData) {
                        return value == 2;
                    },
                    // - param {*} value - The changed value of the target cell
                    // - param {Object} rowData - The data of the row that contains the target cell
                    // - return {boolean}
                    //
                    isEditable: function(value, rowData) {
                        return value != 3;
                    },
                    // - param {*} value - The changed value of the target cell
                    // - param {Object} rowData - The data of the row that contains the target cell
                    // - return {{text: string, value: number}[]}
                    optionListChange: function(value, rowData) {
                        if (value == 1) {
                            console.log('changev return');
                            return [
                                { text: 'option 1', value: 1},
                                { text: 'option 2', value: 2},
                                { text: 'option 3', value: 3},
                                { text: 'option 4', value: 4}
                            ];
                        }
                    }
                }
            ]
        },
        {
            title: 'checkbox',
            columnName: 'column8',
            editOption: {
                type: 'checkbox',
                list: [
                    {text: 'option 1', value: 1},
                    {text: 'option 2', value: 2},
                    {text: 'option 3', value: 3},
                    {text: 'option 4', value: 4}
                ]
            }
        },
        {
            title: 'radio button',
            columnName: 'column9',
            editOption: {
                type: 'radio',
                list: [
                    {text: 'option 1', value: 1},
                    {text: 'option 2', value: 2},
                    {text: 'option 3', value: 3},
                    {text: 'option 4', value: 4}
                ]
            }
        },
    ],
    columnMerge: [
        {
            'columnName' : 'mergeColumn1',
            'title' : '1 + 2',
            'columnNameList' : ['column1', 'column2']
        },
        {
            'columnName' : 'mergeColumn2',
            'title' : '1 + 2 + 3',
            'columnNameList' : ['mergeColumn1', 'column3']
        },
        {
            'columnName' : 'mergeColumn3',
            'title' : '1 + 2 + 3 + 4 + 5',
            'columnNameList' : ['mergeColumn2', 'column4', 'column5']
        }
    ]
});

     </script>
 *
 */
var View = require('./base/view');
var ModelManager = require('./model/manager');
var ViewFactory = require('./view/factory');
var DomState = require('./domState');
var PublicEventEmitter = require('./publicEventEmitter');
var PainterManager = require('./painter/manager');
var PainterController = require('./painter/controller');
var NetAddOn = require('./addon/net');
var util = require('./common/util');

var instanceMap = {};

 /**
  * Toast UI
  * @namespace
  */
tui = window.tui = tui || {};

tui.Grid = View.extend(/**@lends tui.Grid.prototype */{
    /**
     * Initializes the instance.
     * @param {Object} options - Options set by user
     */
    initialize: function(options) {
        var domState = new DomState(this.$el);

        this.id = util.getUniqueKey();
        this.modelManager = this._createModelManager(options, domState);
        this.painterManager = this._createPainterManager();
        this.container = this._createContainerView(options, domState);
        this.publicEventEmitter = this._createPublicEventEmitter();

        this.container.render();
        this.refreshLayout();

        this.addOn = {};
        instanceMap[this.id] = this;
    },

    /**
     * Creates core model and returns it.
     * @param {Object} options - Options set by user
     * @returns {module:model/manager} - New model manager object
     * @private
     */
    _createModelManager: function(options, domState) {
        var modelOptions = _.assign({}, options, {
            gridId: this.id
        });

        _.omit(modelOptions, 'el', 'singleClickEdit');

        return new ModelManager(modelOptions, domState);
    },

    /**
     * Creates painter manager and returns it
     * @returns {module:painter/manager}
     * @private
     */
    _createPainterManager: function() {
        var controller = new PainterController({
            focusModel: this.modelManager.focusModel,
            dataModel: this.modelManager.dataModel,
            columnModel: this.modelManager.columnModel,
            selectionModel: this.modelManager.selectionModel
        });

        return new PainterManager({
            gridId: this.id,
            selectType: this.modelManager.columnModel.get('selectType'),
            controller: controller
        });
    },

    /**
     * Creates container view and returns it
     * @param  {Object} options - Options set by user
     * @returns {module:view/container} - New container view object
     * @private
     */
    _createContainerView: function(options, domState) {
        var viewFactory = new ViewFactory({
            modelManager: this.modelManager,
            painterManager: this.painterManager,
            domState: domState
        });

        return viewFactory.createContainer({
            el: this.$el,
            singleClickEdit: options.singleClickEdit
        });
    },

    /**
     * Creates public event emitter and returns it.
     * @returns {module:publicEventEmitter} - New public event emitter
     * @private
     */
    _createPublicEventEmitter: function() {
        var emitter = new PublicEventEmitter(this);

        emitter.listenToFocusModel(this.modelManager.focusModel);
        emitter.listenToContainerView(this.container);

        return emitter;
    },

    /**
     * Disables all rows.
     * @api
     */
    disable: function() {
        this.modelManager.dataModel.setDisabled(true);
    },

    /**
     * Enables all rows.
     * @api
     */
    enable: function() {
        this.modelManager.dataModel.setDisabled(false);
    },

    /**
     * Disables the row identified by the rowkey.
     * @api
     * @param {(number|string)} rowKey - The unique key of the target row
     */
    disableRow: function(rowKey) {
        this.modelManager.dataModel.disableRow(rowKey);
    },

    /**
     * Enables the row identified by the rowKey.
     * @api
     * @param {(number|string)} rowKey - The unique key of the target row
     */
    enableRow: function(rowKey) {
        this.modelManager.dataModel.enableRow(rowKey);
    },

    /**
     * Returns the value of the cell identified by the rowKey and columnName.
     * @api
     * @param {(number|string)} rowKey - The unique key of the target row.
     * @param {string} columnName - The name of the column
     * @param {boolean} [isOriginal] - It set to true, the original value will be return.
     * @returns {(number|string)} - The value of the cell
     */
    getValue: function(rowKey, columnName, isOriginal) {
        return this.modelManager.dataModel.getValue(rowKey, columnName, isOriginal);
    },

    /**
     * Returns a list of all values in the specified column.
     * @api
     * @param {string} columnName - The name of the column
     * @param {boolean} [isJsonString=false] - It set to true, return value will be converted to JSON string.
     * @returns {(Array|string)} - A List of all values in the specified column. (or JSON string of the list)
     */
    getColumnValues: function(columnName, isJsonString) {
        return this.modelManager.dataModel.getColumnValues(columnName, isJsonString);
    },

    /**
     * Returns the object that contains all values in the specified row.
     * @api
     * @param {(number|string)} rowKey - The unique key of the target row
     * @param {boolean} [isJsonString=false] - If set to true, return value will be converted to JSON string.
     * @returns {(Object|string)} - The object that contains all values in the row. (or JSON string of the object)
     */
    getRow: function(rowKey, isJsonString) {
        return this.modelManager.dataModel.getRowData(rowKey, isJsonString);
    },

    /**
     * Returns the object that contains all values in the row at specified index.
     * @api
     * @param {number} index - The index of the row
     * @param {Boolean} [isJsonString=false] - If set to true, return value will be converted to JSON string.
     * @returns {Object|string} - The object that contains all values in the row. (or JSON string of the object)
     */
    getRowAt: function(index, isJsonString) {
        return this.modelManager.dataModel.getRowDataAt(index, isJsonString);
    },

    /**
     * Returns the total number of the rows.
     * @api
     * @returns {number} - The total number of the rows
     */
    getRowCount: function() {
        return this.modelManager.dataModel.length;
    },

    /**
     * Returns the rowKey of the currently selected row.
     * @api
     * @returns {(number|string)} - The rowKey of the row
     */
    getSelectedRowKey: function() {
        return this.modelManager.focusModel.which().rowKey;
    },

    /**
     * Returns the jquery object of the cell identified by the rowKey and columnName.
     * @api
     * @param {(number|string)} rowKey - The unique key of the row
     * @param {string} columnName - The name of the column
     * @returns {jQuery} - The jquery object of the cell element
     */
    getElement: function(rowKey, columnName) {
        return this.modelManager.dataModel.getElement(rowKey, columnName);
    },

    /**
     * Sets the value of the cell identified by the specified rowKey and columnName.
     * @api
     * @param {(number|string)} rowKey - The unique key of the row
     * @param {string} columnName - The name of the column
     * @param {(number|string)} columnValue - The value to be set
     */
    setValue: function(rowKey, columnName, columnValue) {
        this.modelManager.dataModel.setValue(rowKey, columnName, columnValue);
    },

    /**
     * Sets the all values in the specified column.
     * @api
     * @param {string} columnName - The name of the column
     * @param {(number|string)} columnValue - The value to be set
     * @param {Boolean} [isCheckCellState=true] - If set to true, only editable and not disabled cells will be affected.
     */
    setColumnValues: function(columnName, columnValue, isCheckCellState) {
        this.modelManager.dataModel.setColumnValues(columnName, columnValue, isCheckCellState);
    },

    /**
     * Replace all rows with the specified list. This will not change the original data.
     * @api
     * @param {Array} rowList - A list of new rows
     */
    replaceRowList: function(rowList) {
        this.modelManager.dataModel.replaceRowList(rowList);
    },

    /**
     * Replace all rows with the specified list. This will change the original data.
     * @api
     * @param {Array} rowList - A list of new rows
     * @param {function} callback - The function that will be called when done.
     */
    setRowList: function(rowList, callback) {
        this.modelManager.dataModel.setRowList(rowList, true, callback);
    },

    /**
     * Sets focus on the cell identified by the specified rowKey and columnName.
     * @api
     * @param {(number|string)} rowKey - The unique key of the row
     * @param {string} columnName - The name of the column
     * @param {boolean} [isScrollable=false] - If set to true, the view will scroll to the cell element.
     */
    focus: function(rowKey, columnName, isScrollable) {
        this.modelManager.focusModel.focusClipboard();
        this.modelManager.focusModel.focus(rowKey, columnName, isScrollable);
    },

    /**
     * Sets focus on the cell at the specified index of row and column.
     * @api
     * @param {(number|string)} rowIndex - The index of the row
     * @param {string} columnIndex - The index of the column
     * @param {boolean} [isScrollable=false] - If set to true, the view will scroll to the cell element.
     */
    focusAt: function(rowIndex, columnIndex, isScrollable) {
        this.modelManager.focusModel.focusAt(rowIndex, columnIndex, isScrollable);
    },

    /**
     * Sets focus on the cell at the specified index of row and column and starts to edit.
     * @api
     * @param {(number|string)} rowKey - The unique key of the row
     * @param {string} columnName - The name of the column
     * @param {boolean} [isScrollable=false] - If set to true, the view will scroll to the cell element.
     */
    focusIn: function(rowKey, columnName, isScrollable) {
        this.modelManager.focusModel.focusIn(rowKey, columnName, isScrollable);
    },

    /**
     * Sets focus on the cell at the specified index of row and column and starts to edit.
     * @api
     * @param {(number|string)} rowIndex - The index of the row
     * @param {string} columnIndex - The index of the column
     * @param {boolean} [isScrollable=false] - If set to true, the view will scroll to the cell element.     */
    focusInAt: function(rowIndex, columnIndex, isScrollable) {
        this.modelManager.focusModel.focusInAt(rowIndex, columnIndex, isScrollable);
    },

    /**
     * Makes view ready to get keyboard input.
     * @api
     */
    readyForKeyControl: function() {
        this.modelManager.focusModel.focusClipboard();
    },

    /**
     * Removes focus from the focused cell.
     * @api
     */
    blur: function() {
        this.modelManager.focusModel.blur();
    },

    /**
     * Checks all rows.
     * @api
     */
    checkAll: function() {
        this.modelManager.dataModel.checkAll();
    },

    /**
     * Checks the row identified by the specified rowKey.
     * @api
     * @param {(number|string)} rowKey - The unique key of the row
     */
    check: function(rowKey) {
        this.modelManager.dataModel.check(rowKey);
    },

    /**
     * Unchecks all rows.
     * @api
     */
    uncheckAll: function() {
        this.modelManager.dataModel.uncheckAll();
    },

    /**
     * Unchecks the row identified by the specified rowKey.
     * @api
     * @param {(number|string)} rowKey - The unique key of the row
     */
    uncheck: function(rowKey) {
        this.modelManager.dataModel.uncheck(rowKey);
    },

    /**
     * Removes all rows.
     * @api
     */
    clear: function() {
        this.modelManager.dataModel.setRowList([]);
    },

    /**
     * Removes the row identified by the specified rowKey.
     * @api
     * @param {(number|string)} rowKey - The unique key of the row
     * @param {(boolean|object)} [options] - Options. If the type is boolean, this value is equivalent to
     *     options.removeOriginalData.
     * @param {boolean} [options.removeOriginalData] - If set to true, the original data will be removed.
     * @param {boolean} [options.keepRowSpanData] - If set to true, the value of the merged cells will not be
     *     removed although the target is first cell of them.
     */
    removeRow: function(rowKey, options) {
        if (tui.util.isBoolean(options) && options) {
            options = {
                removeOriginalData: true
            };
        }
        this.modelManager.dataModel.removeRow(rowKey, options);
    },

    /**
     * Removes all checked rows.
     * @api
     * @param {boolean} isConfirm - If set to true, confirm message will be shown before remove.
     * @returns {boolean} - True if there's at least one row removed.
     */
    removeCheckedRows: function(isConfirm) {
        var rowKeyList = this.getCheckedRowKeyList(),
            message = rowKeyList.length + '건의 데이터를 삭제하시겠습니까?';

        if (rowKeyList.length > 0 && (!isConfirm || confirm(message))) {
            _.each(rowKeyList, function(rowKey) {
                this.modelManager.dataModel.removeRow(rowKey);
            }, this);
            return true;
        }
        return false;
    },

    /**
     * Enables the row identified by the rowKey to be able to check.
     * @api
     * @param {(number|string)} rowKey - The unique key of the row
     */
    enableCheck: function(rowKey) {
        this.modelManager.dataModel.enableCheck(rowKey);
    },

    /**
     * Disables the row identified by the spcified rowKey to not be abled to check.
     * @api
     * @param {(number|string)} rowKey - The unique keyof the row.
     */
    disableCheck: function(rowKey) {
        this.modelManager.dataModel.disableCheck(rowKey);
    },

    /**
     * Returns a list of the rowKey of checked rows.
     * @api
     * @param {Boolean} [isJsonString=false] - If set to true, return value will be converted to JSON string.
     * @returns {Array|string} - A list of the rowKey. (or JSON string of the list)
     */
    getCheckedRowKeyList: function(isJsonString) {
        var checkedRowList = this.modelManager.dataModel.getRowList(true),
            checkedRowKeyList = _.pluck(checkedRowList, 'rowKey');

        return isJsonString ? $.toJSON(checkedRowKeyList) : checkedRowKeyList;
    },

    /**
     * Returns a list of the checked rows.
     * @api
     * @param {Boolean} [isJsonString=false] - If set to true, return value will be converted to JSON string.
     * @returns {Array|string} - A list of the checked rows. (or JSON string of the list)
     */
    getCheckedRowList: function(isJsonString) {
        var checkedRowList = this.modelManager.dataModel.getRowList(true);

        return isJsonString ? $.toJSON(checkedRowList) : checkedRowList;
    },

    /**
     * Returns a list of the column model.
     * @api
     * @returns {Array} - A list of the column model.
     */
    getColumnModelList: function() {
        return this.modelManager.columnModel.get('dataColumnModelList');
    },

    /**
     * Returns the object that contains the lists of changed data compared to the original data.
     * The object has properties 'createList', 'updateList', 'deleteList'.
     * @api
     * @param {Object} [options] Options
     *      @param {boolean} [options.isOnlyChecked=false] - If set to true, only checked rows will be considered.
     *      @param {boolean} [options.isRaw=false] - If set to true, the data will contains
     *          the row data for internal use.
     *      @param {boolean} [options.isOnlyRowKeyList=false] - If set to true, only keys of the changed
     *          rows will be returned.
     *      @param {Array} [options.filteringColumnList] - A list of column name to be excluded.
     * @returns {{createList: Array, updateList: Array, deleteList: Array}} - Object that contains the result list.
     */
    getModifiedRowList: function(options) {
        return this.modelManager.dataModel.getModifiedRowList(options);
    },

    /**
     * Insert the new row with specified data to the end of table.
     * @api
     * @param {object} [row] - The data for the new row
     * @param {object} [options] - Options
     * @param {number} [options.at] - The index at which new row will be inserted
     * @param {boolean} [options.extendPrevRowSpan] - If set to true and the previous row at target index
     *        has a rowspan data, the new row will extend the existing rowspan data.
     * @param {boolean} [options.focus] - If set to true, move focus to the new row after appending
     */
    appendRow: function(row, options) {
        this.modelManager.dataModel.append(row, options);
    },

    /**
     * Insert the new row with specified data to the beginning of table.
     * @api
     * @param {object} [row] - The data for the new row
     * @param {object} [options] - Options
     * @param {boolean} [options.focus] - If set to true, move focus to the new row after appending
     */
    prependRow: function(row, options) {
        this.modelManager.dataModel.prepend(row, options);
    },

    /**
     * Returns true if there are at least one row changed.
     * @api
     * @returns {boolean} - True if there are at least one row changed.
     */
    isChanged: function() {
        return this.modelManager.dataModel.isChanged();
    },

    /**
     * Returns the instance of specified AddOn.
     * @api
     * @param {string} name - The name of the AddOn
     * @returns {instance} addOn - The instance of the AddOn
     */
    getAddOn: function(name) {
        return name ? this.addOn[name] : this.addOn;
    },

    /**
     * Restores the data to the original data.
     * (Original data is set by {@link tui.Grid#setRowList|setRowList}
     * @api
     */
    restore: function() {
        this.modelManager.dataModel.restore();
    },

    /**
     * Selects the row identified by the rowKey.
     * @api
     * @param {(number|string)} rowKey - The unique key of the row
     */
    select: function(rowKey) {
        var firstColumn = this.modelManager.columnModel.at(0, true);

        this.modelManager.focusModel.focus(rowKey, firstColumn.columnName);
    },

    /**
     * Unselects selected rows.
     * @api
     */
    unselect: function() {
        this.modelManager.focusModel.unselect(true);
    },

    /**
     * Sets the count of fixed column.
     * @api
     * @param {number} count - The count of column to be fixed
     */
    setColumnFixCount: function(count) {
        this.modelManager.columnModel.set('columnFixCount', count);
    },

    /**
     * Sets the list of column model.
     * @api
     * @param {Array} columnModelList - A new list of column model
     */
    setColumnModelList: function(columnModelList) {
        this.modelManager.columnModel.set('columnModelList', columnModelList);
    },

    /**
     * Create an specified AddOn and use it on this instance.
     * @api
     * @param {string} name - The name of the AddOn to use.
     * @param {object} options - The option objects for configuring the AddON.
     * @returns {tui.Grid} - This instance.
     */
    use: function(name, options) {
        if (name === 'Net') {
            options = $.extend({
                toolbarModel: this.modelManager.toolbarModel,
                renderModel: this.modelManager.renderModel,
                dataModel: this.modelManager.dataModel
            }, options);
            this.addOn.Net = new NetAddOn(options);
            this.publicEventEmitter.listenToNetAddon(this.addOn.Net);
        }
        return this;
    },

    /**
     * Returns a list of all rows.
     * @api
     * @returns {Array} - A list of all rows
     */
    getRowList: function() {
        return this.modelManager.dataModel.getRowList();
    },

    /**
     * Sorts all rows by the specified column.
     * @api
     * @param {string} columnName - The name of the column to be used to compare the rows
     * @param {boolean} [isAscending] - Whether the sort order is ascending.
     *        If not specified, use the negative value of the current order.
     */
    sort: function(columnName, isAscending) {
        this.modelManager.dataModel.sortByField(columnName, isAscending);
    },

    /**
     * Unsorts all rows. (Sorts by rowKey).
     * @api
     */
    unSort: function() {
        this.sort('rowKey');
    },

    /**
     * Adds the specified css class to cell element identified by the rowKey and className
     * @api
     * @param {(number|string)} rowKey - The unique key of the row
     * @param {string} columnName - The name of the column
     * @param {string} className - The css class name to add
     */
    addCellClassName: function(rowKey, columnName, className) {
        this.modelManager.dataModel.get(rowKey).addCellClassName(columnName, className);
    },

    /**
     * Adds the specified css class to all cell elements in the row identified by the rowKey
     * @api
     * @param {(number|string)} rowKey - The unique key of the row
     * @param {string} className - The css class name to add
     */
    addRowClassName: function(rowKey, className) {
        this.modelManager.dataModel.get(rowKey).addClassName(className);
    },

    /**
     * Removes the specified css class from the cell element indentified by the rowKey and columnName.
     * @api
     * @param {(number|string)} rowKey - The unique key of the row
     * @param {string} columnName - The name of the column
     * @param {string} className - The css class name to be removed
     */
    removeCellClassName: function(rowKey, columnName, className) {
        this.modelManager.dataModel.get(rowKey).removeCellClassName(columnName, className);
    },

    /**
     * Removes the specified css class from all cell elements in the row identified by the rowKey.
     * @api
     * @param {(number|string)} rowKey - The unique key of the row
     * @param {string} className - The css class name to be removed
     */
    removeRowClassName: function(rowKey, className) {
        this.modelManager.dataModel.get(rowKey).removeClassName(className);
    },

    /**
     * Returns the rowspan data of the cell identified by the rowKey and columnName.
     * @api
     * @param {(number|string)} rowKey - The unique key of the row
     * @param {string} columnName - The name of the column
     * @returns {Object} - Row span data
     */
    getRowSpanData: function(rowKey, columnName) {
        return this.modelManager.dataModel.getRowSpanData(rowKey, columnName);
    },

    /**
     * Returns the index of the row indentified by the rowKey.
     * @api
     * @param {number|string} rowKey - The unique key of the row
     * @returns {number} - The index of the row
     */
    getIndexOfRow: function(rowKey) {
        return this.modelManager.dataModel.indexOfRowKey(rowKey);
    },

    /**
     * Sets the number of rows to be shown in the table area.
     * @api
     * @param {number} count - The number of rows
     */
    setDisplayRowCount: function(count) {
        this.modelManager.dimensionModel.set('displayRowCount', count);
    },

    /**
     * Sets the width and height of the dimension.
     * @api
     * @param  {(number|null)} width - The width of the dimension
     * @param  {(number|null)} height - The height of the dimension
     */
    setSize: function(width, height) {
        this.modelManager.dimensionModel.setSize(width, height);
    },

    /**
     * Refresh the layout view. Use this method when the view was rendered while hidden.
     * @api
     */
    refreshLayout: function() {
        this.modelManager.dimensionModel.refreshLayout();
    },

    /**
     * Show columns
     * @api
     * @param {...string} arguments - Column names to show
     */
    showColumn: function() {
        var args = tui.util.toArray(arguments);
        this.modelManager.columnModel.setHidden(args, false);
    },

    /**
     * Hide columns
     * @api
     * @param {...string} arguments - Column names to hide
     */
    hideColumn: function() {
        var args = tui.util.toArray(arguments);
        this.modelManager.columnModel.setHidden(args, true);
    },

    /**
     * Validates all data and returns the result.
     * Return value is an array which contains only rows which have invalid cell data.
     * @returns {Array.<Object>} An array of error object
     * @api
     * @example
     // return value example
    [
        {
            rowKey: 1,
            errors: [
                {
                    columnName: 'c1',
                    errorCode: 'REQUIRED'
                },
                {
                    columnName: 'c2',
                    errorCode: 'REQUIRED'
                }
            ]
        },
        {
            rowKey: 3,
            errors: [
                {
                    columnName: 'c2',
                    errorCode: 'REQUIRED'
                }
            ]
        }
    ]
     */
    validate: function() {
        return this.modelManager.dataModel.validate();
    },

    /**
     * Destroys the instance.
     * @api
     */
    destroy: function() {
        this.modelManager.destroy();
        this.container.destroy();
        this.modelManager = this.container = null;
    }
});

/**
 * Returns an instance of the grid associated to the id.
 * @api
 * @static
 * @param  {number} id - ID of the target grid
 * @returns {tui.Grid} - Grid instance
 */
tui.Grid.getInstanceById = function(id) {
    return instanceMap[id];
};

},{"./addon/net":2,"./base/view":7,"./common/util":11,"./domState":12,"./model/manager":20,"./painter/controller":28,"./painter/manager":35,"./publicEventEmitter":37,"./view/factory":41}],14:[function(require,module,exports){
/**
 * @fileoverview 컬럼 모델
 * @author NHN Ent. FE Development Team
 */
'use strict';

var Model = require('../../base/model'),
    util = require('../../common/util');

/**
 * 컬럼 모델 데이터를 다루는 객체
 * @module model/data/columnModel
 * @extends module:base/model
 */
var ColumnModel = Model.extend(/**@lends module:model/data/columnModel.prototype */{
    /**
     * @constructs
     */
    initialize: function() {
        Model.prototype.initialize.apply(this, arguments);
        this.textType = {
            'normal': true,
            'text': true,
            'password': true
        };
        this._setColumnModelList(this.get('columnModelList'));
        this.on('change', this._onChange, this);
    },

    defaults: {
        keyColumnName: null,
        columnFixCount: 0,
        metaColumnModelList: [],
        dataColumnModelList: [],
        visibleList: [], // 이 리스트는 메타컬럼/데이터컬럼 구분하지 않고 저장
        hasNumberColumn: true,
        selectType: '',
        columnModelMap: {},
        relationListMap: {},
        columnMerge: []
    },

    /**
     * 메타컬럼모델들을 초기화한다.
     * @param {Array} source - 사용자가 입력한 메타컬럼의 셋팅값
     * @returns {Array} dset - 초기화가 완료된 메타컬럼 모델 리스트
     * @private
     */
    _initializeMetaColumns: function(source) {
        var dest = [];

        this._initializeButtonColumn(dest);
        this._initializeNumberColumn(dest);
        this._overwriteColumnModelList(dest, source);
        return dest;
    },

    /**
     * overwrite column model list
     * @param {Array} dest - destination model list
     * @param {Array} source - source model list
     * @private
     */
    _overwriteColumnModelList: function(dest, source) {
        _.each(source, function(columnModel) {
            this._extendColumnList(columnModel, dest);
        }, this);
    },

    /**
     * 인자로 넘어온 metaColumnModelList 에 설정값에 맞게 number column 을 추가한다.
     * @param {Array} metaColumnModelList - Meta column model list
     * @private
     */
    _initializeNumberColumn: function(metaColumnModelList) {
        var hasNumberColumn = this.get('hasNumberColumn'),
            numberColumn = {
                columnName: '_number',
                align: 'center',
                title: 'No.',
                isFixedWidth: true,
                width: 60
            };
        if (!hasNumberColumn) {
            numberColumn.isHidden = true;
        }

        this._extendColumnList(numberColumn, metaColumnModelList);
    },

    /**
     * 인자로 넘어온 metaColumnModelList 에 설정값에 맞게 button column 을 추가한다.
     * @param {Array} metaColumnModelList - Meta column model listt
     * @private
     */
    _initializeButtonColumn: function(metaColumnModelList) {
        var selectType = this.get('selectType'),
            buttonColumn = {
                columnName: '_button',
                isHidden: false,
                align: 'center',
                editOption: {
                    type: 'mainButton'
                },
                isFixedWidth: true,
                width: 40
            };

        if (selectType === 'checkbox') {
            buttonColumn.title = '<input type="checkbox"/>';
        } else if (selectType === 'radio') {
            buttonColumn.title = '선택';
        } else {
            buttonColumn.isHidden = true;
        }

        this._extendColumnList(buttonColumn, metaColumnModelList);
    },

    /**
     * column을 추가(push)한다.
     * - 만약 columnName 에 해당하는 columnModel 이 이미 존재한다면 해당 columnModel 을 columnObj 로 확장한다.
     * @param {object} columnObj 추가할 컬럼모델
     * @param {Array} columnModelList 컬럼모델 배열
     * @private
     */
    _extendColumnList: function(columnObj, columnModelList) {
        var columnName = columnObj.columnName,
            index = _.findIndex(columnModelList, {columnName: columnName});

        if (index === -1) {
            columnModelList.push(columnObj);
        } else {
            columnModelList[index] = $.extend(columnModelList[index], columnObj);
        }
    },

    /**
     * index 에 해당하는 columnModel 을 반환한다.
     * @param {Number} index    조회할 컬럼모델의 인덱스 값
     * @param {Boolean} isVisible [isVisible=false] 화면에 노출되는 컬럼모델 기준으로 찾을것인지 여부.
     * @returns {object} 조회한 컬럼 모델
     */
    at: function(index, isVisible) {
        var columnModelList = isVisible ? this.getVisibleColumnModelList() : this.get('dataColumnModelList');
        return columnModelList[index];
    },

    /**
     * columnName 에 해당하는 index를 반환한다.
     * @param {string} columnName   컬럼명
     * @param {Boolean} isVisible [isVisible=false] 화면에 노출되는 컬럼모델 기준으로 반환할 것인지 여부.
     * @returns {number} index   컬럼명에 해당하는 인덱스 값
     */
    indexOfColumnName: function(columnName, isVisible) {
        var columnModelList;

        if (isVisible) {
            columnModelList = this.getVisibleColumnModelList();
        } else {
            columnModelList = this.get('dataColumnModelList');
        }
        return _.findIndex(columnModelList, {columnName: columnName});
    },

    /**
     * columnName 이 열고정 영역에 있는 column 인지 반환한다.
     * @param {String} columnName   컬럼명
     * @returns {Boolean} 열고정 영역에 존재하는 컬럼인지 여부
     */
    isLside: function(columnName) {
        var index = this.indexOfColumnName(columnName, true);

        return (index > -1) && (index < this.get('columnFixCount'));
    },

    /**
     * 화면에 노출되는 (!isHidden) 컬럼 모델 리스트를 반환한다.
     * @param {String} [whichSide] 열고정 영역인지, 열고정이 아닌 영역인지 여부. 지정하지 않았을 경우 전체 visibleList를 반환한다.
     * @param {boolean} [withMeta=false] 메타컬럼 포함 여부. 지정하지 않으면 데이터컬럼리스트 기준으로 반환한다.
     * @returns {Array}  조회한 컬럼모델 배열
     */
    getVisibleColumnModelList: function(whichSide, withMeta) {
        var startIndex = withMeta ? 0 : this.getVisibleMetaColumnCount(),
            visibleColumnFixCount = this.getVisibleColumnFixCount(withMeta),
            columnModelList;

        whichSide = whichSide && whichSide.toUpperCase();

        if (whichSide === 'L') {
            columnModelList = this.get('visibleList').slice(startIndex, visibleColumnFixCount);
        } else if (whichSide === 'R') {
            columnModelList = this.get('visibleList').slice(visibleColumnFixCount);
        } else {
            columnModelList = this.get('visibleList').slice(startIndex);
        }

        return columnModelList;
    },

    /**
     * 현재 보여지고 있는 메타컬럼의 카운트를 반환한다.
     * @returns {number} count
     */
    getVisibleMetaColumnCount: function() {
        var models = this.get('metaColumnModelList'),
            totalLength = models.length,
            hiddenLength = _.where(models, {
                isHidden: true
            }).length;

        return (totalLength - hiddenLength);
    },

    /**
     * 현재 노출되는 컬럼들 중, 고정된 컬럼들(L-side)의 갯수를 반환한다.
     * @param {boolean} [withMeta=false] 현재 보여지고 있는 메타컬럼의 count를 합칠지 여부
     * @returns {number} Visible columnFix count
     */
    getVisibleColumnFixCount: function(withMeta) {
        var count = this.get('columnFixCount'),
            fixedColumns = _.first(this.get('dataColumnModelList'), count),
            visibleFixedColumns = _.filter(fixedColumns, function(column) {
                return !column.isHidden;
            }),
            visibleCount = visibleFixedColumns.length;

        if (withMeta) {
            visibleCount += this.getVisibleMetaColumnCount();
        }
        return visibleCount;
    },

    /**
     * 인자로 받은 columnName 에 해당하는 columnModel 을 반환한다.
     * @param {String} columnName   컬럼명
     * @returns {Object} 컬럼명에 해당하는 컬럼모델
     */
    getColumnModel: function(columnName) {
        return this.get('columnModelMap')[columnName];
    },

    /**
     * columnName 에 해당하는 컬럼의 타입이 textType 인지 확인한다.
     * 랜더링시 html 태그 문자열을 제거할때 사용됨.
     * @param {String} columnName 컬럼명
     * @returns {boolean} text 타입인지 여부
     */
    isTextType: function(columnName) {
        return !!this.textType[this.getEditType(columnName)];
    },

    /**
     * 컬럼 모델로부터 editType 을 반환한다.
     * @param {string} columnName The name of the target column
     * @returns {string} 해당하는 columnName 의 editType 을 반환한다.
     */
    getEditType: function(columnName) {
        var columnModel = this.getColumnModel(columnName),
            editType = 'normal';

        if (columnName === '_button' || columnName === '_number') {
            editType = columnName;
        } else if (columnModel && columnModel.editOption && columnModel.editOption.type) {
            editType = columnModel.editOption.type;
        }

        return editType;
    },

    /**
     * 인자로 받은 컬럼 모델에서 !isHidden 를 만족하는 리스트를 추려서 반환한다.
     * @param {Array} metaColumnModelList 메타 컬럼 모델 리스트
     * @param {Array} dataColumnModelList 데이터 컬럼 모델 리스트
     * @returns {Array}  isHidden 이 설정되지 않은 전체 컬럼 모델 리스트
     * @private
     */
    _makeVisibleColumnModelList: function(metaColumnModelList, dataColumnModelList) {
        metaColumnModelList = metaColumnModelList || this.get('metaColumnModelList');
        dataColumnModelList = dataColumnModelList || this.get('dataColumnModelList');

        return _.filter(metaColumnModelList.concat(dataColumnModelList), function(item) {
            return !item.isHidden;
        });
    },

    /**
     * 각 columnModel 의 relationList 를 모아 주체가 되는 columnName 기준으로 relationListMap 를 생성하여 반환한다.
     * @param {Array} columnModelList - Column Model List
     * @returns {{}|{columnName1: Array, columnName1: Array}} columnName 기준으로 생성된 relationListMap
     * @private
     */
    _getRelationListMap: function(columnModelList) {
        var columnName,
            relationListMap = {};

        _.each(columnModelList, function(columnModel) {
            columnName = columnModel.columnName;
            if (columnModel.relationList) {
                relationListMap[columnName] = columnModel.relationList;
            }
        });
        return relationListMap;
    },

    /**
     * isIgnore 가 true 로 설정된 columnName 의 list 를 반환한다.
     * @returns {Array} isIgnore 가 true 로 설정된 columnName 배열.
     */
    getIgnoredColumnNameList: function() {
        var columnModelLsit = this.get('dataColumnModelList'),
            ignoreColumnNameList = [];
        _.each(columnModelLsit, function(columnModel) {
            if (columnModel.isIgnore) {
                ignoreColumnNameList.push(columnModel.columnName);
            }
        });
        return ignoreColumnNameList;
    },

    /**
     * 인자로 받은 columnModel 을 _number, _button 에 대하여 기본 형태로 가공한 뒤,
     * 메타컬럼과 데이터컬럼을 분리하여 저장한다.
     * @param {Array} columnModelList   컬럼모델 배열
     * @param {number} [columnFixCount]   열고정 카운트
     * @private
     */
    _setColumnModelList: function(columnModelList, columnFixCount) {
        var division, relationListMap, visibleList, metaColumnModelList, dataColumnModelList;

        columnModelList = $.extend(true, [], columnModelList);
        if (tui.util.isUndefined(columnFixCount)) {
            columnFixCount = this.get('columnFixCount');
        }

        division = _.partition(columnModelList, function(model) {
            return util.isMetaColumn(model.columnName);
        }, this);
        metaColumnModelList = this._initializeMetaColumns(division[0]);
        dataColumnModelList = division[1];

        relationListMap = this._getRelationListMap(dataColumnModelList);
        visibleList = this._makeVisibleColumnModelList(metaColumnModelList, dataColumnModelList);
        this.set({
            metaColumnModelList: metaColumnModelList,
            dataColumnModelList: dataColumnModelList,
            columnModelMap: _.indexBy(metaColumnModelList.concat(dataColumnModelList), 'columnName'),
            relationListMap: relationListMap,
            columnFixCount: Math.max(0, columnFixCount),
            visibleList: visibleList
        }, {
            silent: true
        });
        this.unset('columnModelList', {
            silent: true
        });
        this.trigger('columnModelChange');
    },

    /**
     * change 이벤트 발생시 핸들러
     * @param {Object} model change 이벤트가 발생한 model 객체
     * @private
     */
    _onChange: function(model) {
        var changed = model.changed,
            columnFixCount = changed.columnFixCount,
            columnModelList = changed.columnModelList;

        if (!columnModelList) {
            columnModelList = this.get('dataColumnModelList');
        }
        this._setColumnModelList(columnModelList, columnFixCount);
    },

    /**
     * Set 'isHidden' property of column model to true or false
     * @param {Array} columnNames - Column names to set 'isHidden' property
     * @param {boolean} isHidden - Hidden flag for setting
     */
    setHidden: function(columnNames, isHidden) {
        var name, names, columnModel, visibleList;

        while (columnNames.length) {
            name = columnNames.shift();
            columnModel = this.getColumnModel(name);

            if (columnModel) {
                columnModel.isHidden = isHidden;
            } else {
                names = this.getUnitColumnNamesIfMerged(name);
                columnNames.push.apply(columnNames, names);
            }
        }

        visibleList = this._makeVisibleColumnModelList(
            this.get('metaColumnModelList'),
            this.get('dataColumnModelList')
        );
        this.set('visibleList', visibleList, {
            silent: true
        });
        this.trigger('columnModelChange');
    },

    /**
     * Get unit column names
     * @param {string} columnName - columnName
     * @returns {Array.<string>} Unit column names
     */
    getUnitColumnNamesIfMerged: function(columnName) {
        var columnMergeInfoList = this.get('columnMerge'),
            stackForSearch = [],
            searchedNames = [],
            name, columnModel, columnMergeInfoItem;

        stackForSearch.push(columnName);
        while (stackForSearch.length) {
            name = stackForSearch.shift();
            columnModel = this.getColumnModel(name);

            if (columnModel) {
                searchedNames.push(name);
            } else {
                columnMergeInfoItem = _.findWhere(columnMergeInfoList, {
                    columnName: name
                });
                if (columnMergeInfoItem) {
                    stackForSearch.push.apply(stackForSearch, columnMergeInfoItem.columnNameList);
                }
            }
        }
        return _.uniq(searchedNames);
    }
});

module.exports = ColumnModel;

},{"../../base/model":5,"../../common/util":11}],15:[function(require,module,exports){
/**
 * @fileoverview Grid 의 Data Source 에 해당하는 Model 정의
 * @author NHN Ent. FE Development Team
 */
'use strict';

/**
 * Data 중 각 행의 데이터 모델 (DataSource)
 * @module data/row
 * @extends module:base/model
 */
var ExtraDataManager = tui.util.defineClass(/**@lends module:model/data/extraData.prototype */{
    /**
     * @constructs
     * @param {Object} data - Data object
     */
    init: function(data) {
        this.data = data;
    },

    /**
     * Returns rowSpan data
     * @param  {string} columnName - column name
     * @param  {(number|string)} rowKey - rowKey
     * @param  {boolean} isRowSpanEnable - Boolean value whether row span is enable.
     * @returns {*|{count: number, isMainRow: boolean, mainRowKey: *}} rowSpan data
     */
    getRowSpanData: function(columnName, rowKey, isRowSpanEnable) {
        var rowSpanData = null;

        if (isRowSpanEnable) {
            rowSpanData = this.data.rowSpanData;
            if (columnName && rowSpanData) {
                rowSpanData = rowSpanData[columnName];
            }
        }

        if (!rowSpanData && columnName) {
            rowSpanData = {
                count: 0,
                isMainRow: true,
                mainRowKey: rowKey
            };
        }
        return rowSpanData;
    },

    /**
     * Returns the object that contains rowState info.
     * @returns {{isDisabled: boolean, isDisabledCheck: boolean, isChecked: boolean}} rowState 정보
     */
    getRowState: function() {
        var result = {
            isDisabledCheck: false,
            isDisabled: false,
            isChecked: false
        };

        switch (this.data.rowState) {
            case 'DISABLED':
                result.isDisabled = true;
                // intentional no break
            case 'DISABLED_CHECK': // eslint-disable-line no-fallthrough
                result.isDisabledCheck = true;
                break;
            case 'CHECKED':
                result.isChecked = true;
            default: // eslint-disable-line no-fallthrough
        }
        return result;
    },

    /**
     * Sets the rowSate.
     * @param {string} rowState - 'DISABLED' | 'DISABLED_CHECK' | 'CHECKED'
     */
    setRowState: function(rowState) {
        this.data.rowState = rowState;
    },

    /**
     * Sets the rowSpanData.
     * @param {string} columnName - Column name
     * @param {object} data - Data
     */
    setRowSpanData: function(columnName, data) {
        var rowSpanData = _.assign({}, this.data.rowSpanData);

        if (!columnName) {
            return;
        }
        if (!data) {
            if (rowSpanData[columnName]) {
                delete rowSpanData[columnName];
            }
        } else {
            rowSpanData[columnName] = data;
        }
        this.data.rowSpanData = rowSpanData;
    },

    /**
     * Adds className to the cell
     * @param {String} columnName - Column name
     * @param {String} className - Class name
     */
    addCellClassName: function(columnName, className) {
        var classNameData, classNameList;

        classNameData = this.data.className || {};
        classNameData.column = classNameData.column || {};
        classNameList = classNameData.column[columnName] || [];

        if (!_.contains(classNameList, className)) {
            classNameList.push(className);
            classNameData.column[columnName] = classNameList;
            this.data.className = classNameData;
        }
    },

    /**
     * Adds className to the row
     * @param {String} className - Class name
     */
    addClassName: function(className) {
        var classNameData, classNameList;

        classNameData = this.data.className || {};
        classNameList = classNameData.row || [];

        if (tui.util.inArray(className, classNameList) === -1) {
            classNameList.push(className);
            classNameData.row = classNameList;
            this.data.className = classNameData;
        }
    },

    /**
     * Returns the list of className.
     * @param {String} [columnName] - If specified, the result will only conatins class names of cell.
     * @returns {Array} - The array of class names.
     */
    getClassNameList: function(columnName) {
        var classNameData = this.data.className,
            arrayPush = Array.prototype.push,
            classNameList = [];

        if (classNameData) {
            if (classNameData.row) {
                arrayPush.apply(classNameList, classNameData.row);
            }
            if (columnName && classNameData.column && classNameData.column[columnName]) {
                arrayPush.apply(classNameList, classNameData.column[columnName]);
            }
        }
        return classNameList;
    },

    /**
     * className 이 담긴 배열로부터 특정 className 을 제거하여 반환한다.
     * @param {Array} classNameList 디자인 클래스명 리스트
     * @param {String} className    제거할 클래스명
     * @returns {Array}  제거된 디자인 클래스명 리스트
     * @private
     */
    _removeClassNameFromArray: function(classNameList, className) {
        //배열 요소가 'class1 class2' 와 같이 두개 이상의 className을 포함할 수 있어, join & split 함.
        var singleNameList = classNameList.join(' ').split(' ');
        return _.without(singleNameList, className);
    },

    /**
     * rowKey 와 columnName 에 해당하는 Cell 에 CSS className 을 제거한다.
     * @param {String} columnName 컬럼 이름
     * @param {String} className 지정할 디자인 클래스명
     */
    removeCellClassName: function(columnName, className) {
        var classNameData = this.data.className;

        if (tui.util.pick(classNameData, 'column', columnName)) {
            classNameData.column[columnName] =
                this._removeClassNameFromArray(classNameData.column[columnName], className);
            this.data.className = classNameData;
        }
    },

    /**
     * rowKey 에 해당하는 행 전체에 CSS className 을 제거한다.
     * @param {String} className 지정할 디자인 클래스명
     */
    removeClassName: function(className) {
        var classNameData = this.data.className;

        if (classNameData && classNameData.row) {
            classNameData.row = this._removeClassNameFromArray(classNameData.row, className);
            this.className = classNameData;
        }
    }
});

module.exports = ExtraDataManager;

},{}],16:[function(require,module,exports){
/**
 * @fileoverview Grid 의 Data Source 에 해당하는 Model 정의
 * @author NHN Ent. FE Development Team
 */
'use strict';

var Model = require('../../base/model');
var ExtraDataManager = require('./extraDataManager');
var util = require('../../common/util');

// Propertie names that indicate meta data
var PRIVATE_PROPERTIES = [
    '_button',
    '_number',
    '_extraData'
];

// Error code for validtaion
var VALID_ERR_REQUIRED = 'REQUIRED';

/**
 * Data 중 각 행의 데이터 모델 (DataSource)
 * @module model/data/row
 * @extends module:base/model
 */
var Row = Model.extend(/**@lends module:model/data/row.prototype */{
    /**
     * @constructs
     */
    initialize: function() {
        Model.prototype.initialize.apply(this, arguments);
        this.extraDataManager = new ExtraDataManager(this.get('_extraData'));

        this.columnModel = this.collection.columnModel;
        this.validateMap = {};
        this.on('change', this._onChange, this);
    },

    idAttribute: 'rowKey',

    /**
     * Overrides Backbone's parse method for extraData not to be null.
     * @override
     * @param  {object} data - initial data
     * @returns {object} - parsed data
     */
    parse: function(data) {
        if (!data._extraData) {
            data._extraData = {};
        }
        return data;
    },

    /**
     * Event handler for change event in _extraData.
     * Reset _extraData value with cloned object to trigger 'change:_extraData' event.
     * @private
     */
    _triggerExtraDataChangeEvent: function() {
        this.trigger('extraDataChanged', this.get('_extraData'));
    },

    /**
     * Event handler for 'change' event.
     * Executes callback functions, sync rowspan data, and validate data.
     * @private
     */
    _onChange: function() {
        var publicChanged = _.omit(this.changed, PRIVATE_PROPERTIES);

        if (this.isDuplicatedPublicChanged(publicChanged)) {
            return;
        }
        _.each(publicChanged, function(value, columnName) {
            var columnModel = this.columnModel.getColumnModel(columnName);
            if (!columnModel) {
                return;
            }
            if (!this._executeChangeBeforeCallback(columnName)) {
                return;
            }
            this.collection.syncRowSpannedData(this, columnName, value);
            this._executeChangeAfterCallback(columnName);
            this.validateCell(columnName, true);
        }, this);
    },

    /**
     * Validate the cell data of given columnName and returns the error code.
     * @param  {Object} columnName - Column name
     * @returns {String} Error code
     * @private
     */
    _validateCellData: function(columnName) {
        var columnModel = this.columnModel.getColumnModel(columnName),
            value = this.get(columnName),
            errorCode = '';

        if (columnModel.isRequired && util.isBlank(value)) {
            errorCode = VALID_ERR_REQUIRED;
        }
        return errorCode;
    },

    /**
     * Validate a cell of given columnName.
     * If the data is invalid, add 'invalid' class name to the cell.
     * @param {String} columnName - Target column name
     * @param {Boolean} isDataChanged - True if data is changed (called by onChange handler)
     * @returns {String} - Error code
     */
    validateCell: function(columnName, isDataChanged) {
        var errorCode;

        if (!isDataChanged && (columnName in this.validateMap)) {
            return this.validateMap[columnName];
        }

        errorCode = this._validateCellData(columnName);
        if (errorCode) {
            this.addCellClassName(columnName, 'invalid');
        } else {
            this.removeCellClassName(columnName, 'invalid');
        }
        this.validateMap[columnName] = errorCode;

        return errorCode;
    },

    /**
     * columnModel 에 정의된 changeCallback 을 수행할 때 전달핼 이벤트 객체를 생성한다.
     * @param {String} columnName 컬럼명
     * @returns {{rowKey: (number|string), columnName: string, columnData: *, instance: {object}}}
     *          changeCallback 에 전달될 이벤트 객체
     * @private
     */
    _createChangeCallbackEvent: function(columnName) {
        return {
            rowKey: this.get('rowKey'),
            columnName: columnName,
            value: this.get(columnName),
            instance: tui.Grid.getInstanceById(this.collection.gridId)
        };
    },

    /**
     * columnModel 에 정의된 changeBeforeCallback 을 수행한다.
     * changeBeforeCallback 의 결과가 false 일 때, 데이터를 복원후 false 를 반환한다.
     * @param {String} columnName   컬럼명
     * @returns {boolean} changeBeforeCallback 수행 결과값
     * @private
     */
    _executeChangeBeforeCallback: function(columnName) {
        var columnModel = this.columnModel.getColumnModel(columnName),
            changeEvent, obj;

        if (columnModel.editOption && columnModel.editOption.changeBeforeCallback) {
            changeEvent = this._createChangeCallbackEvent(columnName);

            if (columnModel.editOption.changeBeforeCallback(changeEvent) === false) {
                obj = {};
                obj[columnName] = this.previous(columnName);
                this.set(obj);
                this.trigger('restore', columnName);
                return false;
            }
        }
        return true;
    },

    /**
     * columnModel 에 정의된 changeAfterCallback 을 수행한다.
     * @param {String} columnName - 컬럼명
     * @returns {boolean} changeAfterCallback 수행 결과값
     * @private
     */
    _executeChangeAfterCallback: function(columnName) {
        var columnModel = this.columnModel.getColumnModel(columnName),
            changeEvent;

        if (columnModel.editOption && columnModel.editOption.changeAfterCallback) {
            changeEvent = this._createChangeCallbackEvent(columnName);
            return !!(columnModel.editOption.changeAfterCallback(changeEvent));
        }
        return true;
    },

    /**
     * Returns the Array of private property names
     * @returns {array} An array of private property names
     */
    getPrivateProperties: function() {
        return PRIVATE_PROPERTIES;
    },

    /**
     * Returns the object that contains rowState info.
     * @returns {{isDisabled: boolean, isDisabledCheck: boolean, isChecked: boolean}} rowState 정보
     */
    getRowState: function() {
        return this.extraDataManager.getRowState();
    },

    /**
     * Returns an array of all className, related with given columnName.
     * @param {String} columnName - Column name
     * @returns {Array.<String>} - An array of classNames
     */
    getClassNameList: function(columnName) {
        var columnModel = this.columnModel.getColumnModel(columnName),
            isMetaColumn = util.isMetaColumn(columnName),
            classNameList = this.extraDataManager.getClassNameList(columnName),
            cellState = this.getCellState(columnName);

        if (columnModel.className) {
            classNameList.push(columnModel.className);
        }
        if (columnModel.isEllipsis) {
            classNameList.push('ellipsis');
        }
        if (columnModel.isRequired) {
            classNameList.push('required');
        }
        if (isMetaColumn) {
            classNameList.push('meta_column');
        } else if (cellState.isEditable) {
            classNameList.push('editable');
        }
        if (cellState.isDisabled) {
            classNameList.push('disabled');
        }

        return this._makeUniqueStringArray(classNameList);
    },

    /**
     * Returns a new array, which splits all comma-separated strings in the targetList and removes duplicated item.
     * @param  {Array} targetArray - Target array
     * @returns {Array} - New array
     */
    _makeUniqueStringArray: function(targetArray) {
        var singleStringArray = _.uniq(targetArray.join(' ').split(' '));
        return _.without(singleStringArray, '');
    },

    /**
     * Returns the state of the cell identified by a given column name.
     * @param {String} columnName - column name
     * @returns {{isEditable: boolean, isDisabled: boolean}}
     */
    getCellState: function(columnName) {
        var notEditableTypeList = ['_number', 'normal'],
            columnModel = this.columnModel,
            isDisabled = this.collection.isDisabled,
            isEditable = true,
            editType = columnModel.getEditType(columnName),
            rowState, relationResult;

        relationResult = this.executeRelationCallbacksAll(['isDisabled', 'isEditable'])[columnName];
        rowState = this.getRowState();

        if (!isDisabled) {
            if (columnName === '_button') {
                isDisabled = rowState.isDisabledCheck;
            } else {
                isDisabled = rowState.isDisabled;
            }
            isDisabled = isDisabled || !!(relationResult && relationResult.isDisabled);
        }

        if (_.contains(notEditableTypeList, editType)) {
            isEditable = false;
        } else {
            isEditable = !(relationResult && relationResult.isEditable === false);
        }

        return {
            isEditable: isEditable,
            isDisabled: isDisabled
        };
    },

    /**
     * Returns whether the cell identified by a given column name is editable.
     * @param {String} columnName - column name
     * @returns {Boolean}
     */
    isEditable: function(columnName) {
        var cellState = this.getCellState(columnName);

        return !cellState.isDisabled && cellState.isEditable;
    },

    /**
     * Returns whether the cell identified by a given column name is disabled.
     * @param {String} columnName - column name
     * @returns {Boolean}
     */
    isDisabled: function(columnName) {
        var cellState = this.getCellState(columnName);

        return cellState.isDisabled;
    },

    /**
     * getRowSpanData
     * rowSpan 설정값을 반환한다.
     * @param {String} [columnName] 인자가 존재하지 않을 경우, 행 전체의 rowSpanData 를 맵 형태로 반환한다.
     * @returns {*|{count: number, isMainRow: boolean, mainRowKey: *}}   rowSpan 설정값
     */
    getRowSpanData: function(columnName) {
        var isRowSpanEnable = this.collection.isRowSpanEnable(),
            rowKey = this.get('rowKey');

        return this.extraDataManager.getRowSpanData(columnName, rowKey, isRowSpanEnable);
    },

    /**
     * rowSpanData를 설정한다.
     * @param {string} columnName - 컬럼명
     * @param {object} data - rowSpan 정보를 가진 객체
     */
    setRowSpanData: function(columnName, data) {
        this.extraDataManager.setRowSpanData(columnName, data);
        this._triggerExtraDataChangeEvent();
    },

    /**
     * rowState 를 설정한다.
     * @param {string} rowState 해당 행의 상태값. 'DISABLED|DISABLED_CHECK|CHECKED' 중 하나를 설정한다.
     * @param {boolean} silent 내부 change 이벤트 발생 여부
     */
    setRowState: function(rowState, silent) {
        this.extraDataManager.setRowState(rowState);
        if (!silent) {
            this._triggerExtraDataChangeEvent();
        }
    },

    /**
     * rowKey 와 columnName 에 해당하는 Cell 에 CSS className 을 설정한다.
     * @param {String} columnName 컬럼 이름
     * @param {String} className 지정할 디자인 클래스명
     */
    addCellClassName: function(columnName, className) {
        this.extraDataManager.addCellClassName(columnName, className);
        this._triggerExtraDataChangeEvent();
    },

    /**
     * rowKey에 해당하는 행 전체에 CSS className 을 설정한다.
     * @param {String} className 지정할 디자인 클래스명
     */
    addClassName: function(className) {
        this.extraDataManager.addClassName(className);
        this._triggerExtraDataChangeEvent();
    },

    /**
     * rowKey 와 columnName 에 해당하는 Cell 에 CSS className 을 제거한다.
     * @param {String} columnName 컬럼 이름
     * @param {String} className 지정할 디자인 클래스명
     */
    removeCellClassName: function(columnName, className) {
        this.extraDataManager.removeCellClassName(columnName, className);
        this._triggerExtraDataChangeEvent();
    },

    /**
     * rowKey 에 해당하는 행 전체에 CSS className 을 제거한다.
     * @param {String} className 지정할 디자인 클래스명
     */
    removeClassName: function(className) {
        this.extraDataManager.removeClassName(className);
        this._triggerExtraDataChangeEvent();
    },

    /**
     * ctrl + c 로 복사 기능을 사용할 때 list 형태(select, button, checkbox)의 cell 의 경우, 해당 value 에 부합하는 text로 가공한다.
     * List type 의 경우 데이터 값과 editOption.list 의 text 값이 다르기 때문에
     * text 로 전환해서 반환할 때 처리를 하여 변환한다.
     *
     * @param {String} columnName   컬럼명
     * @returns {String} text 형태로 가공된 문자열
     * @private
     */
    _getListTypeVisibleText: function(columnName) {
        var value = this.get(columnName),
            columnModel = this.columnModel.getColumnModel(columnName),
            resultOptionList, editOptionList, typeExpected, valueList;

        if (tui.util.isExisty(tui.util.pick(columnModel, 'editOption', 'list'))) {
            resultOptionList = this.executeRelationCallbacksAll(['optionListChange'])[columnName];
            editOptionList = resultOptionList && resultOptionList.optionList ?
                    resultOptionList.optionList : columnModel.editOption.list;

            typeExpected = typeof editOptionList[0].value;
            valueList = value.toString().split(',');
            if (typeExpected !== typeof valueList[0]) {
                valueList = _.map(valueList, function(val) {
                    return util.convertValueType(val, typeExpected);
                });
            }
            _.each(valueList, function(val, index) {
                var item = _.findWhere(editOptionList, {value: val});
                valueList[index] = item && item.value || '';
            }, this);

            return valueList.join(',');
        }
        return '';
    },

    /**
     * Returns whether the given edit type is list type.
     * @param {String} editType - edit type
     * @returns {Boolean}
     * @private
     */
    _isListType: function(editType) {
        return _.contains(['select', 'radio', 'checkbox'], editType);
    },

    /**
     * change 이벤트 발생시 동일한 changed 객체의 public 프라퍼티가 동일한 경우 중복 처리를 막기 위해 사용한다.
     * 10ms 내에 같은 객체로 함수 호출이 일어나면 true를 반환한다.
     * @param {object} publicChanged 비교할 객체
     * @returns {boolean} 중복이면 true, 아니면 false
     */
    isDuplicatedPublicChanged: function(publicChanged) {
        if (this._timeoutIdForChanged && _.isEqual(this._lastPublicChanged, publicChanged)) {
            return true;
        }
        clearTimeout(this._timeoutIdForChanged);
        this._timeoutIdForChanged = setTimeout(_.bind(function() {
            this._timeoutIdForChanged = null;
        }, this), 10); // eslint-disable-line no-magic-numbers
        this._lastPublicChanged = publicChanged;

        return false;
    },

    /**
     * Returns the text string to be used when copying the cell value to clipboard.
     * @param {String} columnName - column name
     * @returns {String}
     */
    getValueString: function(columnName) {
        var editType = this.columnModel.getEditType(columnName);
        var column = this.columnModel.getColumnModel(columnName);
        var value = this.get(columnName);

        if (this._isListType(editType)) {
            if (tui.util.isExisty(tui.util.pick(column, 'editOption', 'list', 0, 'value'))) {
                value = this._getListTypeVisibleText(columnName);
            } else {
                throw this.error('Check "' + columnName + '"\'s editOption.list property out in your ColumnModel.');
            }
        } else if (editType === 'password') {
            value = '';
        }

        if (!_.isUndefined(value)) {
            value = String(value);
        }

        return value;
    },

    /**
     * 컬럼모델에 정의된 relation 들을 수행한 결과를 반환한다. (기존 affectOption)
     * @param {Array} callbackNameList 반환값의 결과를 확인할 대상 callbackList.
     *        (default : ['optionListChange', 'isDisabled', 'isEditable'])
     * @returns {{}|{columnName: {attribute: *}}} row 의 columnName 에 적용될 속성값.
     */
    executeRelationCallbacksAll: function(callbackNameList) {
        var rowData = this.attributes,
            relationListMap = this.columnModel.get('relationListMap'),
            result = {};

        if (_.isEmpty(callbackNameList)) {
            callbackNameList = ['optionListChange', 'isDisabled', 'isEditable'];
        }

        _.each(relationListMap, function(relationList, columnName) {
            var value = rowData[columnName];

            _.each(relationList, function(relation) {
                this._executeRelationCallback(relation, callbackNameList, value, rowData, result);
            }, this);
        }, this);

        return result;
    },

    /**
     * Returns a name of attribute matching given callbackName.
     * @param {string} callbackName - callback name
     * @private
     * @returns {string}
     */
    _getRelationResultAttrName: function(callbackName) {
        switch (callbackName) {
            case 'optionListChange':
                return 'optionList';
            case 'isDisabled':
                return 'isDisabled';
            case 'isEditable':
                return 'isEditable';
            default:
                return '';
        }
    },

    /**
     * Executes relation callback
     * @param {object} relation - relation object
     *   @param {array} relation.columnList - target column list
     *   @param {function} [relation.isDisabled] - callback function for isDisabled attribute
     *   @param {function} [relation.isEditable] - callback function for isDisabled attribute
     *   @param {function} [relation.optionListChange] - callback function for changing option list
     * @param {array} callbackNameList - an array of callback names
     * @param {(string|number)} value - cell value
     * @param {object} rowData - all value of the row
     * @param {object} result - object to store the result of callback functions
     * @private
     */
    _executeRelationCallback: function(relation, callbackNameList, value, rowData, result) {
        var rowState = this.getRowState(),
            targetColumnNames = relation.columnList;

        _.each(callbackNameList, function(callbackName) {
            var attrName, callback;

            if (!rowState.isDisabled || callbackName !== 'isDisabled') {
                callback = relation[callbackName];
                if (typeof callback === 'function') {
                    attrName = this._getRelationResultAttrName(callbackName);
                    if (attrName) {
                        _.each(targetColumnNames, function(targetColumnName) {
                            result[targetColumnName] = result[targetColumnName] || {};
                            result[targetColumnName][attrName] = callback(value, rowData);
                        }, this);
                    }
                }
            }
        }, this);
    }
}, {
    privateProperties: PRIVATE_PROPERTIES
});

module.exports = Row;

},{"../../base/model":5,"../../common/util":11,"./extraDataManager":15}],17:[function(require,module,exports){
/**
 * @fileoverview Grid 의 Data Source 에 해당하는 Collection 정의
 * @author NHN Ent. FE Development Team
 */
'use strict';

var Collection = require('../../base/collection');
var Row = require('./row');

/**
 * Raw 데이터 RowList 콜렉션. (DataSource)
 * Grid.setRowList 를 사용하여 콜렉션을 설정한다.
 * @module model/data/rowList
 * @extends module:base/collection
 */
var RowList = Collection.extend(/**@lends module:model/data/rowList.prototype */{
    /**
     * @param {Array} models    콜랙션에 추가할 model 리스트
     * @param {Object} options   생성자의 option 객체
     * @constructs
     */
    initialize: function(models, options) {
        Collection.prototype.initialize.apply(this, arguments);
        this.setOwnProperties({
            columnModel: options.columnModel,
            domState: options.domState,
            gridId: options.gridId,
            lastRowKey: -1,
            originalRowList: [],
            originalRowMap: {},
            startIndex: options.startIndex || 1,
            sortOptions: {
                columnName: 'rowKey',
                isAscending: true,
                useClient: (_.isBoolean(options.useClientSort) ? options.useClientSort : true)
            },

            /**
             * Whether the all rows are disabled.
             * This state is not related to individual state of each rows.
             * @type {Boolean}
             */
            isDisabled: false
        });
        if (!this.sortOptions.useClient) {
            this.comparator = null;
        }
    },

    model: Row,

    /**
     * Backbone 이 collection 생성 시 내부적으로 parse 를 호출하여 데이터를 포멧에 맞게 파싱한다.
     * @param {Array} data  원본 데이터
     * @returns {Array}  파싱하여 가공된 데이터
     */
    parse: function(data) {
        data = data && data.contents || data;
        return this._formatData(data);
    },

    /**
     * 데이터의 _extraData 를 분석하여, Model 에서 사용할 수 있도록 가공한다.
     * _extraData 필드에 rowSpanData 를 추가한다.
     * @param {Array} data  가공할 데이터
     * @returns {Array} 가공된 데이터
     * @private
     */
    _formatData: function(data) {
        var rowList = _.filter(data, _.isObject);

        _.each(rowList, function(row, i) {
            rowList[i] = this._baseFormat(rowList[i]);
            if (this.isRowSpanEnable()) {
                this._setExtraRowSpanData(rowList, i);
            }
        }, this);

        return rowList;
    },

    /**
     * row 를 기본 포멧으로 wrapping 한다.
     * 추가적으로 rowKey 를 할당하고, rowState 에 따라 checkbox 의 값을 할당한다.
     *
     * @param {object} row  대상 row 데이터
     * @param {number} index    해당 row 의 인덱스 정보. rowKey 를 자동 생성할 경우 사용된다.
     * @returns {object} 가공된 row 데이터
     * @private
     */
    _baseFormat: function(row) {
        var defaultExtraData = {
                rowSpan: null,
                rowSpanData: null,
                rowState: null
            },
            keyColumnName = this.columnModel.get('keyColumnName'),
            rowKey = (keyColumnName === null) ? this._createRowKey() : row[keyColumnName];

        row._extraData = $.extend(defaultExtraData, row._extraData);
        row._button = row._extraData.rowState === 'CHECKED';
        row.rowKey = rowKey;
        return row;
    },

    /**
     * 새로운 rowKey를 생성해서 반환한다.
     * @returns {number} 생성된 rowKey
     * @private
     */
    _createRowKey: function() {
        this.lastRowKey += 1;
        return this.lastRowKey;
    },

    /**
     * 랜더링시 사용될 extraData 필드에 rowSpanData 값을 세팅한다.
     * @param {Array} rowList - 전체 rowList 배열. rowSpan 된 경우 자식 row 의 데이터도 가공해야 하기 때문에 전체 list 를 인자로 넘긴다.
     * @param {number} index - 해당 배열에서 extraData 를 설정할 배열
     * @returns {Array} rowList - 가공된 rowList
     * @private
     */
    _setExtraRowSpanData: function(rowList, index) {
        var row = rowList[index],
            rowSpan = row && row._extraData && row._extraData.rowSpan,
            rowKey = row && row.rowKey,
            subCount, childRow, i;

        function hasRowSpanData(row, columnName) { // eslint-disable-line no-shadow, require-jsdoc
            var extraData = row._extraData;
            return !!(extraData.rowSpanData && extraData.rowSpanData[columnName]);
        }
        function setRowSpanData(row, columnName, rowSpanData) { // eslint-disable-line no-shadow, require-jsdoc
            var extraData = row._extraData;
            extraData.rowSpanData = extraData && extraData.rowSpanData || {};
            extraData.rowSpanData[columnName] = rowSpanData;
            return extraData;
        }

        if (rowSpan) {
            _.each(rowSpan, function(count, columnName) {
                if (!hasRowSpanData(row, columnName)) {
                    setRowSpanData(row, columnName, {
                        count: count,
                        isMainRow: true,
                        mainRowKey: rowKey
                    });
                    //rowSpan 된 row 의 자식 rowSpanData 를 가공한다.
                    subCount = -1;
                    for (i = index + 1; i < index + count; i += 1) {
                        childRow = rowList[i];
                        childRow[columnName] = row[columnName];
                        childRow._extraData = childRow._extraData || {};
                        setRowSpanData(childRow, columnName, {
                            count: subCount,
                            isMainRow: false,
                            mainRowKey: rowKey
                        });
                        subCount -= 1;
                    }
                }
            });
        }
        return rowList;
    },

    /**
     * originalRowList 와 originalRowMap 을 생성한다.
     * @param {Array} [rowList] rowList 가 없을 시 현재 collection 데이터를 originalRowList 로 저장한다.
     * @returns {Array} format 을 거친 데이터 리스트.
     */
    setOriginalRowList: function(rowList) {
        this.originalRowList = rowList ? this._formatData(rowList) : this.toJSON();
        this.originalRowMap = _.indexBy(this.originalRowList, 'rowKey');
        return this.originalRowList;
    },

    /**
     * 원본 데이터 리스트를 반환한다.
     * @param {boolean} [isClone=true]  데이터 복제 여부.
     * @returns {Array}  원본 데이터 리스트 배열.
     */
    getOriginalRowList: function(isClone) {
        isClone = _.isUndefined(isClone) ? true : isClone;
        return isClone ? _.clone(this.originalRowList) : this.originalRowList;
    },

    /**
     * 원본 row 데이터를 반환한다.
     * @param {(Number|String)} rowKey  데이터의 키값
     * @returns {Object} 해당 행의 원본 데이터값
     */
    getOriginalRow: function(rowKey) {
        return _.clone(this.originalRowMap[rowKey]);
    },

    /**
     * rowKey 와 columnName 에 해당하는 원본 데이터를 반환한다.
     * @param {(Number|String)} rowKey  데이터의 키값
     * @param {String} columnName   컬럼명
     * @returns {(Number|String)}    rowKey 와 컬럼명에 해당하는 셀의 원본 데이터값
     */
    getOriginal: function(rowKey, columnName) {
        return _.clone(this.originalRowMap[rowKey][columnName]);
    },

    /**
     * mainRowKey 를 반환한다.
     * @param {(Number|String)} rowKey  데이터의 키값
     * @param {String} columnName   컬럼명
     * @returns {(Number|String)}    rowKey 와 컬럼명에 해당하는 셀의 main row 키값
     */
    getMainRowKey: function(rowKey, columnName) {
        var row = this.get(rowKey),
            rowSpanData;
        if (this.isRowSpanEnable()) {
            rowSpanData = row && row.getRowSpanData(columnName);
            rowKey = rowSpanData ? rowSpanData.mainRowKey : rowKey;
        }
        return rowKey;
    },

    /**
     * rowKey 에 해당하는 index를 반환한다.
     * @param {(Number|String)} rowKey 데이터의 키값
     * @returns {Number} 키값에 해당하는 row의 인덱스
     */
    indexOfRowKey: function(rowKey) {
        return this.indexOf(this.get(rowKey));
    },

    /**
     * rowSpan 이 적용되어야 하는지 여부를 반환한다.
     * 랜더링시 사용된다.
     * - sorted, 혹은 filterd 된 경우 false 를 리턴한다.
     * @returns {boolean}    랜더링 시 rowSpan 을 해야하는지 여부
     */
    isRowSpanEnable: function() {
        return !this.isSortedByField();
    },

    /**
     * 현재 RowKey가 아닌 다른 컬럼에 의해 정렬된 상태인지 여부를 반환한다.
     * @returns {Boolean}    정렬된 상태인지 여부
     */
    isSortedByField: function() {
        return this.sortOptions.columnName !== 'rowKey';
    },

    /**
     * 정렬옵션 객체의 값을 변경하고, 변경된 값이 있을 경우 sortChanged 이벤트를 발생시킨다.
     * @param {string} columnName 정렬할 컬럼명
     * @param {boolean} isAscending 오름차순 여부
     * @param {boolean} isRequireFetch 서버 데이타의 갱신이 필요한지 여부
     */
    setSortOptionValues: function(columnName, isAscending, isRequireFetch) {
        var options = this.sortOptions,
            isChanged = false;

        if (_.isUndefined(columnName)) {
            columnName = 'rowKey';
        }
        if (_.isUndefined(isAscending)) {
            isAscending = true;
        }

        if (options.columnName !== columnName || options.isAscending !== isAscending) {
            isChanged = true;
        }
        options.columnName = columnName;
        options.isAscending = isAscending;

        if (isChanged) {
            this.trigger('sortChanged', {
                columnName: columnName,
                isAscending: isAscending,
                isRequireFetch: isRequireFetch
            });
        }
    },

    /**
     * 주어진 컬럼명을 기준으로 오름/내림차순 정렬한다.
     * @param {string} columnName 정렬할 컬럼명
     * @param {boolean} isAscending 오름차순 여부
     */
    sortByField: function(columnName, isAscending) {
        var options = this.sortOptions;

        if (_.isUndefined(isAscending)) {
            isAscending = (options.columnName === columnName) ? !options.isAscending : true;
        }
        this.setSortOptionValues(columnName, isAscending, !options.useClient);

        if (options.useClient) {
            this.sort();
        }
    },

    /**
     * rowList 를 반환한다.
     * @param {boolean} [isOnlyChecked=false] true 로 설정된 경우 checked 된 데이터 대상으로 비교 후 반환한다.
     * @param {boolean} [isRaw=false] true 로 설정된 경우 내부 연산용 데이터 제거 필터링을 거치지 않는다.
     * @returns {Array} Row List
     */
    getRowList: function(isOnlyChecked, isRaw) {
        var rowList, checkedRowList;

        if (isOnlyChecked) {
            checkedRowList = this.where({
                '_button': true
            });
            rowList = [];
            _.each(checkedRowList, function(checkedRow) {
                rowList.push(checkedRow.attributes);
            }, this);
        } else {
            rowList = this.toJSON();
        }
        return isRaw ? rowList : this._removePrivateProp(rowList);
    },

    /**
     * row Data 값에 변경이 발생했을 경우, sorting 되지 않은 경우에만
     * rowSpan 된 데이터들도 함께 update 한다.
     *
     * @param {object} row row 모델
     * @param {String} columnName   변경이 발생한 컬럼명
     * @param {(String|Number)} value 변경된 값
     */
    syncRowSpannedData: function(row, columnName, value) {
        var index, rowSpanData, i;

        //정렬 되지 않았을 때만 rowSpan 된 데이터들도 함께 update 한다.
        if (this.isRowSpanEnable()) {
            rowSpanData = row.getRowSpanData(columnName);
            if (!rowSpanData.isMainRow) {
                this.get(rowSpanData.mainRowKey).set(columnName, value);
            } else {
                index = this.indexOfRowKey(row.get('rowKey'));
                for (i = 0; i < rowSpanData.count - 1; i += 1) {
                    this.at(i + 1 + index).set(columnName, value);
                }
            }
        }
    },

    /**
     * Backbone 에서 sort() 실행시 내부적으로 사용되는 메소드.
     * @param {Row} a 비교할 앞의 모델
     * @param {Row} b 비교할 뒤의 모델
     * @returns {number} a가 b보다 작으면 -1, 같으면 0, 크면 1. 내림차순이면 반대.
     */
    comparator: function(a, b) {
        var columnName = this.sortOptions.columnName,
            isAscending = this.sortOptions.isAscending,
            valueA = a.get(columnName),
            valueB = b.get(columnName),
            result = 0;

        if (valueA < valueB) {
            result = -1;
        } else if (valueA > valueB) {
            result = 1;
        }

        if (!isAscending) {
            result = -result;
        }
        return result;
    },

    /**
     * rowList 에서 내부에서만 사용하는 property 를 제거하고 반환한다.
     * @param {Array} rowList   내부에 설정된 rowList 배열
     * @returns {Array}  private 프로퍼티를 제거한 결과값
     * @private
     */
    _removePrivateProp: function(rowList) {
        return _.map(rowList, function(row) {
            return _.omit(row, Row.privateProperties);
        });
    },

    /**
     * rowKey 에 해당하는 그리드 데이터를 삭제한다.
     * @param {(Number|String)} rowKey - 행 데이터의 고유 키
     * @param {object} options - 삭제 옵션
     * @param {boolean} options.removeOriginalData - 원본 데이터도 함께 삭제할 지 여부
     * @param {boolean} options.keepRowSpanData - rowSpan이 mainRow를 삭제하는 경우 데이터를 유지할지 여부
     */
    removeRow: function(rowKey, options) {
        var row = this.get(rowKey),
            rowSpanData, nextRow, removedData;

        if (!row) {
            return;
        }

        if (options && options.keepRowSpanData) {
            removedData = _.clone(row.attributes);
        }
        rowSpanData = _.clone(row.getRowSpanData());
        nextRow = this.at(this.indexOf(row) + 1);

        this.remove(row, {
            silent: true
        });
        this._syncRowSpanDataForRemove(rowSpanData, nextRow, removedData);

        if (options && options.removeOriginalData) {
            this.setOriginalRowList();
        }
        this.trigger('remove');
    },

    /**
     * 삭제된 행에 rowSpan이 적용되어 있었을 때, 관련된 행들의 rowSpan데이터를 갱신한다.
     * @param {object} rowSpanData - 삭제된 행의 rowSpanData
     * @param {Row} nextRow - 삭제된 다음 행의 모델
     * @param {object} [removedData] - 삭제된 행의 데이터 (삭제옵션의 keepRowSpanData가 true인 경우에만 넘겨짐)
     * @private
     */
    _syncRowSpanDataForRemove: function(rowSpanData, nextRow, removedData) {
        if (!rowSpanData) {
            return;
        }
        _.each(rowSpanData, function(data, columnName) {
            var mainRowSpanData = {},
                mainRow, startOffset, spanCount;

            if (data.isMainRow) {
                if (data.count === 1) {
                    // if isMainRow is true and count is 1, rowSpanData is meaningless
                    return;
                }
                mainRow = nextRow;
                spanCount = data.count - 1;
                startOffset = 1;
                if (spanCount > 1) {
                    mainRowSpanData.mainRowKey = mainRow.get('rowKey');
                    mainRowSpanData.isMainRow = true;
                }
                mainRow.set(columnName, (removedData ? removedData[columnName] : ''), {
                    silent: true
                });
            } else {
                mainRow = this.get(data.mainRowKey);
                spanCount = mainRow.getRowSpanData(columnName).count - 1;
                startOffset = -data.count;
            }

            if (spanCount > 1) {
                mainRowSpanData.count = spanCount;
                mainRow.setRowSpanData(columnName, mainRowSpanData);
                this._updateSubRowSpanData(mainRow, columnName, startOffset, spanCount);
            } else {
                mainRow.setRowSpanData(columnName, null);
            }
        }, this);
    },

    /**
     * append, prepend 시 사용할 dummy row를 생성한다.
     * @returns {Object} 값이 비어있는 더미 row 데이터
     * @private
     */
    _createDummyRow: function() {
        var columnModelList = this.columnModel.get('dataColumnModelList'),
            data = {};

        _.each(columnModelList, function(columnModel) {
            data[columnModel.columnName] = '';
        }, this);

        return data;
    },

    /**
     * Insert the new row with specified data to the end of table.
     * @param {(Array|Object)} [rowData] - The data for the new row
     * @param {Object} [options] - Options
     * @param {Number} [options.at] - The index at which new row will be inserted
     * @param {Boolean} [options.extendPrevRowSpan] - If set to true and the previous row at target index
     *        has a rowspan data, the new row will extend the existing rowspan data.
     * @param {Boolean} [options.focus] - If set to true, move focus to the new row after appending
     * @returns {Array.<module:model/data/row>} Row model list
     */
    append: function(rowData, options) {
        var modelList = this._createModelList(rowData),
            addOptions;

        options = _.extend({at: this.length}, options);
        addOptions = {
            at: options.at,
            add: true,
            silent: true
        };

        this.add(modelList, addOptions);
        this._syncRowSpanDataForAppend(options.at, modelList.length, options.extendPrevRowSpan);
        this.trigger('add', modelList, options);

        return modelList;
    },

    /**
     * 현재 rowList 에 최상단에 데이터를 append 한다.
     * @param {Object} rowData  prepend 할 행 데이터
     * @param {object} [options] - Options
     * @param {boolean} [options.focus] - If set to true, move focus to the new row after appending
     * @returns {Array.<module:model/data/row>} Row model list
     */
    prepend: function(rowData, options) {
        options = options || {};
        options.at = 0;

        return this.append(rowData, options);
    },

    /**
     * rowKey에 해당하는 행의 데이터를 리턴한다. isJsonString을 true로 설정하면 결과를 json객체로 변환하여 리턴한다.
     * @param {(Number|String)} rowKey  행 데이터의 고유 키
     * @param {Boolean} [isJsonString=false]  true 일 경우 JSON String 으로 반환한다.
     * @returns {Object} 행 데이터
     */
    getRowData: function(rowKey, isJsonString) {
        var row = this.get(rowKey),
            rowData = row ? row.toJSON() : null;

        return isJsonString ? $.toJSON(rowData) : rowData;
    },

    /**
     * 그리드 전체 데이터 중에서 index에 해당하는 순서의 데이터 객체를 리턴한다.
     * @param {Number} index 행의 인덱스
     * @param {Boolean} [isJsonString=false]  true 일 경우 JSON String 으로 반환한다.
     * @returns {Object} 행 데이터
     */
    getRowDataAt: function(index, isJsonString) {
        var row = this.at(index),
            rowData = row ? row.toJSON() : null;

        return isJsonString ? $.toJSON(row) : rowData;
    },

    /**
     * rowKey 와 columnName 에 해당하는 값을 반환한다.
     * @param {(Number|String)} rowKey    행 데이터의 고유 키
     * @param {String} columnName   컬럼 이름
     * @param {boolean} [isOriginal]  원본 데이터 리턴 여부
     * @returns {(Number|String|undefined)}    조회한 셀의 값.
     */
    getValue: function(rowKey, columnName, isOriginal) {
        var value, row;

        if (isOriginal) {
            value = this.getOriginal(rowKey, columnName);
        } else {
            row = this.get(rowKey);
            value = row && row.get(columnName);
        }
        return value;
    },

    /**
     * Sets the vlaue of the cell identified by the specified rowKey and columnName.
     * @param {(Number|String)} rowKey    행 데이터의 고유 키
     * @param {String} columnName   컬럼 이름
     * @param {(Number|String)} columnValue 할당될 값
     * @param {Boolean} [silent=false] 이벤트 발생 여부. true 로 변경할 상황은 거의 없다.
     * @returns {Boolean} True if affected row is exist
     */
    setValue: function(rowKey, columnName, columnValue, silent) {
        var row = this.get(rowKey),
            obj = {},
            result;

        columnValue = _.isString(columnValue) ? $.trim(columnValue) : columnValue;
        if (row) {
            obj[columnName] = columnValue;
            row.set(obj, {
                silent: silent
            });
            result = true;
        } else {
            result = false;
        }

        return result;
    },

    /**
     * columnName에 해당하는 column data list를 리턴한다.
     * @param {String} columnName   컬럼명
     * @param {boolean} [isJsonString=false]  true 일 경우 JSON String 으로 반환한다.
     * @returns {Array} 컬럼명에 해당하는 셀들의 데이터 리스트
     */
    getColumnValues: function(columnName, isJsonString) {
        var valueList = this.pluck(columnName);
        return isJsonString ? $.toJSON(valueList) : valueList;
    },

    /**
     * columnName 에 해당하는 값을 전부 변경한다.
     * @param {String} columnName 컬럼명
     * @param {(Number|String)} columnValue 변경할 컬럼 값
     * @param {Boolean} [isCheckCellState=true] 셀의 편집 가능 여부 와 disabled 상태를 체크할지 여부
     * @param {Boolean} [silent=false] change 이벤트 trigger 할지 여부.
     */
    setColumnValues: function(columnName, columnValue, isCheckCellState, silent) {
        var obj = {},
            cellState = {
                isDisabled: false,
                isEditable: true
            };

        obj[columnName] = columnValue;
        isCheckCellState = _.isUndefined(isCheckCellState) ? true : isCheckCellState;

        this.forEach(function(row) {
            if (isCheckCellState) {
                cellState = row.getCellState(columnName);
            }
            if (!cellState.isDisabled && cellState.isEditable) {
                row.set(obj, {
                    silent: silent
                });
            }
        }, this);
    },

    /**
     * rowKey 와 columnName 에 해당하는 Cell 의 rowSpanData 를 반환한다.
     * @param {(Number|String)} rowKey 행 데이터의 고유 rowKey
     * @param {String} columnName 컬럼 이름
     * @returns {object} rowSpanData
     */
    getRowSpanData: function(rowKey, columnName) {
        var row = this.get(rowKey);
        return row ? row.getRowSpanData(columnName) : null;
    },

    /**
     * Returns true if there are at least one row changed.
     * @returns {boolean} - True if there are at least one row changed.
     */
    isChanged: function() {
        var modifiedRowsArr = _.values(this.getModifiedRowList());

        return _.some(modifiedRowsArr, function(modifiedRows) {
            return modifiedRows.length > 0;
        });
    },

    /**
     * Enables or Disables all rows.
     * @param  {Boolean} isDisabled - Whether disabled or not
     */
    setDisabled: function(isDisabled) {
        if (this.isDisabled !== isDisabled) {
            this.isDisabled = isDisabled;
            this.trigger('disabledChanged');
        }
    },

    /**
     * rowKey에 해당하는 행을 활성화시킨다.
     * @param {(Number|String)} rowKey 행 데이터의 고유 키
     */
    enableRow: function(rowKey) {
        this.get(rowKey).setRowState('');
    },

    /**
     * rowKey에 해당하는 행을 비활성화 시킨다.
     * @param {(Number|String)} rowKey    행 데이터의 고유 키
     */
    disableRow: function(rowKey) {
        this.get(rowKey).setRowState('DISABLED');
    },

    /**
     * rowKey에 해당하는 행의 메인 체크박스를 체크할 수 있도록 활성화 시킨다.
     * @param {(Number|String)} rowKey 행 데이터의 고유 키
     */
    enableCheck: function(rowKey) {
        this.get(rowKey).setRowState('');
    },

    /**
     * rowKey에 해당하는 행의 메인 체크박스를 체크하지 못하도록 비활성화 시킨다.
     * @param {(Number|String)} rowKey 행 데이터의 고유 키
     */
    disableCheck: function(rowKey) {
        this.get(rowKey).setRowState('DISABLED_CHECK');
    },

    /**
     * rowKey에 해당하는 행의 체크박스 및 라디오박스를 선택한다.
     * @param {(Number|String)} rowKey    행 데이터의 고유 키
     * @param {Boolean} [silent] 이벤트 발생 여부
     */
    check: function(rowKey, silent) {
        var isDisabledCheck = this.get(rowKey).getRowState().isDisabledCheck,
            selectType = this.columnModel.get('selectType');

        if (!isDisabledCheck && selectType) {
            if (selectType === 'radio') {
                this.uncheckAll();
            }
            this.setValue(rowKey, '_button', true, silent);
        }
    },

    /**
     * rowKey 에 해당하는 행의 체크박스 및 라디오박스를 선택한다.
     * @param {(Number|String)} rowKey    행 데이터의 고유 키
     * @param {Boolean} [silent] 이벤트 발생 여부
     */
    uncheck: function(rowKey, silent) {
        this.setValue(rowKey, '_button', false, silent);
    },

    /**
     * 전체 행을 선택한다.
     * TODO: disableCheck 행 처리
     */
    checkAll: function() {
        this.setColumnValues('_button', true);
    },

    /**
     * 모든 행을 선택 해제 한다.
     */
    uncheckAll: function() {
        this.setColumnValues('_button', false);
    },

    /**
     * 주어진 데이터로 모델 목록을 생성하여 반환한다.
     * @param {object|array} rowData - 모델을 생성할 데이터. Array일 경우 여러개를 동시에 생성한다.
     * @returns {Row[]} 생성된 모델 목록
     */
    _createModelList: function(rowData) {
        var modelList = [],
            rowList;

        rowData = rowData || this._createDummyRow();
        if (!_.isArray(rowData)) {
            rowData = [rowData];
        }
        rowList = this._formatData(rowData);

        _.each(rowList, function(row) {
            var model = new Row(row, {
                collection: this,
                parse: true
            });
            modelList.push(model);
        }, this);

        return modelList;
    },

    /**
     * 새로운 행이 추가되었을 때, 관련된 주변 행들의 rowSpan 데이터를 갱신한다.
     * @param {number} index - 추가된 행의 인덱스
     * @param {number} length - 추가된 행의 개수
     * @param {boolean} extendPrevRowSpan - 이전 행의 rowSpan 데이터가 있는 경우 합칠지 여부
     */
    _syncRowSpanDataForAppend: function(index, length, extendPrevRowSpan) {
        var prevRow = this.at(index - 1);

        if (!prevRow) {
            return;
        }
        _.each(prevRow.getRowSpanData(), function(data, columnName) {
            var mainRow, mainRowData, startOffset, spanCount;

            // count 값은 mainRow인 경우 '전체 rowSpan 개수', 아닌 경우는 'mainRow까지의 거리 (음수)'를 의미한다.
            // 0이면 rowSpan 되어 있지 않다는 의미이다.
            if (data.count === 0) {
                return;
            }
            if (data.isMainRow) {
                mainRow = prevRow;
                mainRowData = data;
                startOffset = 1;
            } else {
                mainRow = this.get(data.mainRowKey);
                mainRowData = mainRow.getRowSpanData()[columnName];
                // 루프를 순회할 때 의미를 좀더 명확하게 하기 위해 양수값으로 변경해서 offset 처럼 사용한다.
                startOffset = -data.count + 1;
            }

            if (mainRowData.count > startOffset || extendPrevRowSpan) {
                mainRowData.count += length;
                spanCount = mainRowData.count;

                this._updateSubRowSpanData(mainRow, columnName, startOffset, spanCount);
            }
        }, this);
    },

    /**
     * 특정 컬럼의 rowSpan 데이터를 주어진 범위만큼 갱신한다.
     * @param {Row} mainRow - rowSpan의 첫번째 행
     * @param {string} columnName - 컬럼명
     * @param {number} startOffset - mainRow로부터 몇번째 떨어진 행부터 갱신할지를 지정하는 값
     * @param {number} spanCount - span이 적용될 행의 개수
     */
    _updateSubRowSpanData: function(mainRow, columnName, startOffset, spanCount) {
        var mainRowIdx = this.indexOf(mainRow),
            mainRowKey = mainRow.get('rowKey'),
            row, offset;

        for (offset = startOffset; offset < spanCount; offset += 1) {
            row = this.at(mainRowIdx + offset);
            row.set(columnName, mainRow.get(columnName), {
                silent: true
            });
            row.setRowSpanData(columnName, {
                count: -offset,
                mainRowKey: mainRowKey,
                isMainRow: false
            });
        }
    },

    /**
     * 해당 row가 수정된 Row인지 여부를 반환한다.
     * @param {Object} row - row 데이터
     * @param {Object} originalRow - 원본 row 데이터
     * @param {Array} filteringColumnList - 비교에서 제외할 컬럼명
     * @returns {boolean} - 수정여부
     */
    _isModifiedRow: function(row, originalRow, filteringColumnList) {
        var filtered = _.omit(row, filteringColumnList);
        var result = _.some(filtered, function(value, columnName) {
            if (typeof value === 'object') {
                return ($.toJSON(value) !== $.toJSON(originalRow[columnName]));
            }
            return value !== originalRow[columnName];
        }, this);

        return result;
    },

    /**
     * 수정된 rowList 를 반환한다.
     * @param {Object} options 옵션 객체
     *      @param {boolean} [options.isOnlyChecked=false] true 로 설정된 경우 checked 된 데이터 대상으로 비교 후 반환한다.
     *      @param {boolean} [options.isRaw=false] true 로 설정된 경우 내부 연산용 데이터 제거 필터링을 거치지 않는다.
     *      @param {boolean} [options.isOnlyRowKeyList=false] true 로 설정된 경우 키값만 저장하여 리턴한다.
     *      @param {Array} [options.filteringColumnList]   행 데이터 중에서 데이터 변경으로 간주하지 않을 컬럼 이름을 배열로 설정한다.
     * @returns {{createList: Array, updateList: Array, deleteList: Array}} options 조건에 해당하는 수정된 rowList 정보
     */
    getModifiedRowList: function(options) {
        var isRaw = options && options.isRaw,
            isOnlyChecked = options && options.isOnlyChecked,
            isOnlyRowKeyList = options && options.isOnlyRowKeyList,
            original = isRaw ? this.originalRowList : this._removePrivateProp(this.originalRowList),
            current = isRaw ? this.toJSON() : this._removePrivateProp(this.toJSON()),
            filteringColumnList = options && options.filteringColumnList,
            result = {
                createList: [],
                updateList: [],
                deleteList: []
            };

        original = _.indexBy(original, 'rowKey');
        current = _.indexBy(current, 'rowKey');
        filteringColumnList = _.union(filteringColumnList, this.columnModel.getIgnoredColumnNameList());

        // 추가/ 수정된 행 추출
        _.each(current, function(row, rowKey) {
            var originalRow = original[rowKey],
                item = isOnlyRowKeyList ? row.rowKey : row;

            if (!isOnlyChecked || (isOnlyChecked && this.get(rowKey).get('_button'))) {
                if (!originalRow) {
                    result.createList.push(item);
                } else if (this._isModifiedRow(row, originalRow, filteringColumnList)) {
                    result.updateList.push(item);
                }
            }
        }, this);

        //삭제된 행 추출
        _.each(original, function(obj, rowKey) {
            var item = isOnlyRowKeyList ? obj.rowKey : obj;
            if (!current[rowKey]) {
                result.deleteList.push(item);
            }
        }, this);
        return result;
    },

    /**
     * rowList 를 설정한다. setRowList 와 다르게 setOriginalRowList 를 호출하여 원본데이터를 갱신하지 않는다.
     * @param {Array} rowList 설정할 데이터 배열 값
     * @param {boolean} [isParse=true]  backbone 의 parse 로직을 수행할지 여부
     * @param {Function} [callback] callback function
     */
    replaceRowList: function(rowList, isParse, callback) {
        if (!rowList) {
            rowList = [];
        }
        if (_.isUndefined(isParse)) {
            isParse = true;
        }
        this.trigger('beforeReset', rowList.length);

        this.lastRowKey = -1;
        this.reset(rowList, {
            parse: isParse
        });

        if (_.isFunction(callback)) {
            callback();
        }
    },

    /**
     * rowList 를 설정하고, setOriginalRowList 를 호출하여 원본데이터를 갱신한다.
     * @param {Array} rowList 설정할 데이터 배열 값
     * @param {boolean} [isParse=true]  backbone 의 parse 로직을 수행할지 여부
     * @param {function} [callback] 완료시 호출될 함수
     */
    setRowList: function(rowList, isParse, callback) {
        var wrappedCallback = _.bind(function() {
            this.setOriginalRowList();
            if (_.isFunction(callback)) {
                callback();
            }
        }, this);

        this.replaceRowList(rowList, isParse, wrappedCallback);
    },

    /**
     * setRowList()를 통해 그리드에 설정된 초기 데이터 상태로 복원한다.
     * 그리드에서 수정되었던 내용을 초기화하는 용도로 사용한다.
     */
    restore: function() {
        var originalRowList = this.getOriginalRowList();
        this.replaceRowList(originalRowList, true);
    },

    /**
     * rowKey 와 columnName 에 해당하는 text 형태의 셀의 값을 삭제한다.
     * @param {(Number|String)} rowKey 행 데이터의 고유 키
     * @param {String} columnName 컬럼 이름
     * @param {Boolean} [silent=false] 이벤트 발생 여부. true 로 변경할 상황은 거의 없다.
     */
    del: function(rowKey, columnName, silent) {
        var mainRowKey = this.getMainRowKey(rowKey, columnName),
            cellState = this.get(mainRowKey).getCellState(columnName),
            editType = this.columnModel.getEditType(columnName),
            isDeletableType = _.contains(['text', 'password'], editType);

        if (isDeletableType && cellState.isEditable && !cellState.isDisabled) {
            this.setValue(mainRowKey, columnName, '', silent);
        }
    },

    /**
     * 2차원 배열로 된 데이터를 받아 현재 Focus된 셀을 기준으로 하여 각각의 인덱스의 해당하는 만큼 우측 아래 방향으로
     * 이동하며 셀의 값을 변경한다. 완료한 후 적용된 셀 범위에 Selection을 지정한다.
     * @param {Array[]} data - 2차원 배열 데이터. 내부배열의 사이즈는 모두 동일해야 한다.
     * @param {{row: number, column: number}} startIdx - 시작점이 될 셀의 인덱스
     */
    paste: function(data, startIdx) {
        var endIdx = this._getEndIndexToPaste(data, startIdx);

        _.each(data, function(row, index) {
            this._setValueForPaste(row, startIdx.row + index, startIdx.column, endIdx.column);
        }, this);

        this.trigger('paste', {
            startIdx: startIdx,
            endIdx: endIdx
        });
    },

    /**
     * Validates all data and returns the result.
     * Return value is an array which contains only rows which have invalid cell data.
     * @returns {Array.<Object>} An array of error object
     * @example
        [
            {
                rowKey: 1,
                errors: [
                    {
                        columnName: 'c1',
                        errorCode: 'REQUIRED'
                    },
                    {
                        columnName: 'c2',
                        errorCode: 'REQUIRED'
                    }
                ]
            },
            {
                rowKey: 3,
                errors: [
                    {
                        columnName: 'c2',
                        errorCode: 'REQUIRED'
                    }
                ]
            }
        ]
     */
    validate: function() {
        var errorRows = [],
            requiredColumnNames = _.chain(this.columnModel.getVisibleColumnModelList())
                .filter(function(columnModel) {
                    return columnModel.isRequired === true;
                })
                .pluck('columnName')
                .value();

        this.each(function(row) {
            var errorCells = [];
            _.each(requiredColumnNames, function(columnName) {
                var errorCode = row.validateCell(columnName);
                if (errorCode) {
                    errorCells.push({
                        columnName: columnName,
                        errorCode: errorCode
                    });
                }
            });
            if (errorCells.length) {
                errorRows.push({
                    rowKey: row.get('rowKey'),
                    errors: errorCells
                });
            }
        });
        return errorRows;
    },

    /**
     * 붙여넣기를 실행할 때 끝점이 될 셀의 인덱스를 반환한다.
     * @param  {Array[]} data - 붙여넣기할 데이터
     * @param  {{row: number, column: number}} startIdx - 시작점이 될 셀의 인덱스
     * @returns {{row: number, column: number}} 행과 열의 인덱스 정보를 가진 객체
     */
    _getEndIndexToPaste: function(data, startIdx) {
        var columnModelList = this.columnModel.getVisibleColumnModelList(),
            rowIdx = data.length + startIdx.row - 1,
            columnIdx = Math.min(data[0].length + startIdx.column, columnModelList.length) - 1;

        return {
            row: rowIdx,
            column: columnIdx
        };
    },

    /**
     * 주어진 행 데이터를 지정된 인덱스의 컬럼에 반영한다.
     * 셀이 수정 가능한 상태일 때만 값을 변경하며, RowSpan이 적용된 셀인 경우 MainRow인 경우에만 값을 변경한다.
     * @param  {rowData} rowData - 붙여넣을 행 데이터
     * @param  {number} rowIdx - 행 인덱스
     * @param  {number} columnStartIdx - 열 시작 인덱스
     * @param  {number} columnEndIdx - 열 종료 인덱스
     */
    _setValueForPaste: function(rowData, rowIdx, columnStartIdx, columnEndIdx) {
        var row = this.at(rowIdx),
            columnModel = this.columnModel,
            attributes = {},
            columnIdx, columnName, cellState, rowSpanData;

        if (!row) {
            row = this.append({})[0];
        }
        for (columnIdx = columnStartIdx; columnIdx <= columnEndIdx; columnIdx += 1) {
            columnName = columnModel.at(columnIdx, true).columnName;
            cellState = row.getCellState(columnName);
            rowSpanData = row.getRowSpanData(columnName);

            if (cellState.isEditable && !cellState.isDisabled && (!rowSpanData || rowSpanData.count >= 0)) {
                attributes[columnName] = rowData[columnIdx - columnStartIdx];
            }
        }
        row.set(attributes);
    },

    /**
     * rowKey 와 columnName 에 해당하는 td element 를 반환한다.
     * 내부적으로 자동으로 mainRowKey 를 찾아 반환한다.
     * @param {(Number|String)} rowKey    행 데이터의 고유 키
     * @param {String} columnName   컬럼 이름
     * @returns {jQuery} 해당 jQuery Element
     */
    getElement: function(rowKey, columnName) {
        var mainRowKey = this.getMainRowKey(rowKey, columnName);
        return this.domState.getElement(mainRowKey, columnName);
    }
});

module.exports = RowList;

},{"../../base/collection":3,"./row":16}],18:[function(require,module,exports){
/**
 * @fileoverview 크기에 관련된 데이터를 다루는 모델
 * @author NHN Ent. FE Development Team
 */
'use strict';
var Model = require('../base/model');
var util = require('../common/util');
var dimensionConstMap = require('../common/constMap').dimension;

var TABLE_BORDER_WIDTH = dimensionConstMap.TABLE_BORDER_WIDTH;
var CELL_BORDER_WIDTH = dimensionConstMap.CELL_BORDER_WIDTH;

/**
 * 크기 관련 데이터 저장
 * @module model/dimension
 * @extends module:base/model
 */
var Dimension = Model.extend(/**@lends module:model/dimension.prototype */{
    /**
     * @constructs
     * @param {Object} attrs - Attributes
     * @param {Object} options - Options
     */
    initialize: function(attrs, options) {
        Model.prototype.initialize.apply(this, arguments);

        /**
         * An array of the fixed flags of the columns
         * @private
         * @type {boolean[]}
         */
        this._columnWidthFixedFlags = null;

        /**
         * An array of the minimum width of the columns
         * @private
         * @type {number[]}
         */
        this._minColumnWidthList = null;

        this.columnModel = options.columnModel;
        this.dataModel = options.dataModel;
        this.domState = options.domState;

        this.listenTo(this.columnModel, 'columnModelChange', this._initColumnWidthVariables);
        this.listenTo(this.dataModel, 'add remove reset', this._resetTotalRowHeight);

        this.on('change:width', this._onWidthChange, this);
        this.on('change:bodyHeight', this._resetDisplayRowCount, this);
        this.on('change:displayRowCount', this._resetBodyHeight, this);

        this._initColumnWidthVariables();
        this._resetBodyHeight();
    },

    models: null,

    columnModel: null,

    defaults: {
        offsetLeft: 0,
        offsetTop: 0,

        width: 0,

        headerHeight: 0,
        bodyHeight: 0,
        toolbarHeight: 65,

        rowHeight: 0,
        totalRowHeight: 0,

        rsideWidth: 0,
        lsideWidth: 0,
        columnWidthList: [],

        minimumColumnWidth: 0,
        displayRowCount: 1,
        scrollBarSize: 17,
        scrollX: true,
        scrollY: true,
        fitToParentHeight: false
    },

    /**
     * 전체 넓이에서 스크롤바, border등의 넓이를 제외하고 실제 셀의 넓이에 사용되는 값만 반환한다.
     * @param {number} columnLength - 컬럼의 개수
     * @returns {number} 사용가능한 전체 셀의 넓이
     * @private
     */
    _getAvailableTotalWidth: function(columnLength) {
        var totalWidth = this.get('width'),
            borderCount = columnLength + 1 + (this.isDivisionBorderDoubled() ? 1 : 0),
            totalBorderWidth = borderCount * CELL_BORDER_WIDTH,
            availableTotalWidth = totalWidth - this.getScrollYWidth() - totalBorderWidth;

        return availableTotalWidth;
    },

    /**
     * Makes all width of columns not less than minimumColumnWidth.
     * @param {number[]} columnWidthList - 컬럼 넓이값 배열
     * @returns {number[]} - 수정된 새로운 넓이값 배열
     * @private
     */
    _applyMinimumColumnWidth: function(columnWidthList) {
        var minWidthList = this._minColumnWidthList,
            appliedList = _.clone(columnWidthList);

        _.each(appliedList, function(width, index) {
            var minWidth = minWidthList[index];
            if (width < minWidth) {
                appliedList[index] = minWidth;
            }
        });
        return appliedList;
    },

    /**
     * Resets the 'totalRowHeight' attribute.
     * @private
     */
    _resetTotalRowHeight: function() {
        var rowHeight = this.get('rowHeight'),
            rowCount = this.dataModel.length;

        this.set('totalRowHeight', util.getHeight(rowCount, rowHeight));
    },

    /**
     * Resets the 'displayRowCount' attribute.
     * @private
     */
    _resetDisplayRowCount: function() {
        var actualBodyHeight, displayRowCount;

        // To prevent recursive call with _resetBodyHeight (called by change:displayRowCount event)
        if (_.has(this.changed, 'displayRowCount')) {
            return;
        }
        actualBodyHeight = this.get('bodyHeight') - this.getScrollXHeight();
        displayRowCount = util.getDisplayRowCount(actualBodyHeight, this.get('rowHeight'));

        this.set('displayRowCount', displayRowCount);
    },

    /**
     * Sets the width of columns whose width is not assigned by distributing extra width to them equally.
     * @param {number[]} columnWidthList - An array of column widths
     * @returns {number[]} - A new array of column widths
     * @private
     */
    _fillEmptyColumnWidth: function(columnWidthList) {
        var totalWidth = this._getAvailableTotalWidth(columnWidthList.length),
            remainTotalWidth = totalWidth - util.sum(columnWidthList),
            emptyIndexes = [];

        _.each(columnWidthList, function(width, index) {
            if (!width) {
                emptyIndexes.push(index);
            }
        });
        return this._distributeExtraWidthEqually(columnWidthList, remainTotalWidth, emptyIndexes);
    },

    /**
     * Adds extra widths of the column equally.
     * @param {number[]} columnWidthList - An array of column widths
     * @param {number} totalExtraWidth - Total extra width
     * @returns {number[]} - A new array of column widths
     * @private
     */
    _addExtraColumnWidth: function(columnWidthList, totalExtraWidth) {
        var fixedFlags = this._columnWidthFixedFlags,
            columnIndexes = [];

        _.each(fixedFlags, function(flag, index) {
            if (!flag) {
                columnIndexes.push(index);
            }
        });
        return this._distributeExtraWidthEqually(columnWidthList, totalExtraWidth, columnIndexes);
    },

    /**
     * Reduces excess widths of the column equally.
     * @param {number[]} columnWidthList - An array of column widths
     * @param {number} totalExcessWidth - Total excess width (negative number)
     * @returns {number[]} - A new array of column widths
     * @private
     */
    _reduceExcessColumnWidth: function(columnWidthList, totalExcessWidth) {
        var minWidthList = this._minColumnWidthList,
            fixedFlags = this._columnWidthFixedFlags,
            availableList = [];

        _.each(columnWidthList, function(width, index) {
            if (!fixedFlags[index]) {
                availableList.push({
                    index: index,
                    width: width - minWidthList[index]
                });
            }
        });
        return this._reduceExcessColumnWidthSub(_.clone(columnWidthList), totalExcessWidth, availableList);
    },

    /**
     * Reduce the (remaining) excess widths of the column.
     * This method will be called recursively by _reduceExcessColumnWidth.
     * @param {number[]} columnWidthList - An array of column Width
     * @param {number} totalRemainWidth - Remaining excess width (negative number)
     * @param {object[]} availableList - An array of infos about available column.
     *                                 Each item of the array has {index:number, width:number}.
     * @returns {number[]} - A new array of column widths
     * @private
     */
    _reduceExcessColumnWidthSub: function(columnWidthList, totalRemainWidth, availableList) {
        var avgValue = Math.round(totalRemainWidth / availableList.length),
            newAvailableList = [],
            columnIndexes;

        _.each(availableList, function(available) {
            // note that totalRemainWidth and avgValue are negative number.
            if (available.width < Math.abs(avgValue)) {
                totalRemainWidth += available.width;
                columnWidthList[available.index] -= available.width;
            } else {
                newAvailableList.push(available);
            }
        });
        // call recursively until all available width are less than average
        if (availableList.length > newAvailableList.length) {
            return this._reduceExcessColumnWidthSub(columnWidthList, totalRemainWidth, newAvailableList);
        }
        columnIndexes = _.pluck(availableList, 'index');
        return this._distributeExtraWidthEqually(columnWidthList, totalRemainWidth, columnIndexes);
    },

    /**
     * Distributes the extra width equally to each column at specified indexes.
     * @param {number[]} columnWidthList - An array of column width
     * @param {number} extraWidth - Extra width
     * @param {number[]} columnIndexes - An array of indexes of target columns
     * @returns {number[]} - A new array of column widths
     * @private
     */
    _distributeExtraWidthEqually: function(columnWidthList, extraWidth, columnIndexes) {
        var length = columnIndexes.length,
            avgValue = Math.round(extraWidth / length),
            errorValue = (avgValue * length) - extraWidth, // to correct total width
            resultList = _.clone(columnWidthList);

        _.each(columnIndexes, function(columnIndex) {
            resultList[columnIndex] += avgValue;
        });
        resultList[_.last(columnIndexes)] -= errorValue;

        return resultList;
    },

    /**
     * Adjust the column widths to make them fit into the dimension.
     * @param {number[]} columnWidthList - An array of column width
     * @param {boolean} [fitToReducedTotal] - If set to true and the total width is smaller than dimension(width),
     *                                    the column widths will be reduced.
     * @returns {number[]} - A new array of column widths
     * @private
     */
    _adjustColumnWidthList: function(columnWidthList, fitToReducedTotal) {
        var columnLength = columnWidthList.length,
            availableWidth = this._getAvailableTotalWidth(columnLength),
            totalExtraWidth = availableWidth - util.sum(columnWidthList),
            fixedCount = _.filter(this._columnWidthFixedFlags).length,
            adjustedList;

        if (totalExtraWidth > 0) {
            if (columnLength > fixedCount) {
                adjustedList = this._addExtraColumnWidth(columnWidthList, totalExtraWidth);
            } else {
                // If all column has fixed width, add extra width to the last column.
                adjustedList = _.clone(columnWidthList);
                adjustedList[columnLength - 1] += totalExtraWidth;
            }
        } else if (fitToReducedTotal && totalExtraWidth < 0) {
            adjustedList = this._reduceExcessColumnWidth(columnWidthList, totalExtraWidth);
        } else {
            adjustedList = columnWidthList;
        }
        return adjustedList;
    },

    /**
     * columnModel 에 설정된 넓이값을 기준으로 컬럼넓이와 관련된 변수들의 값을 초기화한다.
     * @private
     */
    _initColumnWidthVariables: function() {
        var columnModelList = this.columnModel.getVisibleColumnModelList(null, true),
            commonMinWidth = this.get('minimumColumnWidth'),
            widthList = [],
            fixedFlags = [],
            minWidthList = [];

        _.each(columnModelList, function(columnModel) {
            var width = columnModel.width > 0 ? columnModel.width : 0,
                minWidth = Math.max(width, commonMinWidth);

            // Meta columns are not affected by common 'minimumColumnWidth' value
            if (util.isMetaColumn(columnModel.columnName)) {
                minWidth = width;
            }

            // If the width is not assigned (in other words, the width is not positive number),
            // set it to zero (no need to worry about minimum width at this point)
            // so that #_fillEmptyColumnWidth() can detect which one is empty.
            // After then, minimum width will be applied by #_applyMinimumColumnWidth().
            widthList.push(width ? minWidth : 0);
            minWidthList.push(minWidth);
            fixedFlags.push(!!columnModel.isFixedWidth);
        }, this);

        this._columnWidthFixedFlags = fixedFlags;
        this._minColumnWidthList = minWidthList;

        this._setColumnWidthVariables(this._calculateColumnWidth(widthList), true);
    },

    /**
     * calculate column width list
     * @param {Array.<Number>} widthList - widthList
     * @returns {Array.<Number>}
     * @private
     */
    _calculateColumnWidth: function(widthList) {
        widthList = this._fillEmptyColumnWidth(widthList);
        widthList = this._applyMinimumColumnWidth(widthList);
        widthList = this._adjustColumnWidthList(widthList);

        return widthList;
    },

    /**
     * Returns whether division border (between meta column and data column) is doubled or not.
     * Division border should be doubled only if visible fixed data column exists.
     * @returns {Boolean}
     */
    isDivisionBorderDoubled: function() {
        return this.columnModel.getVisibleColumnFixCount() > 0;
    },

    /**
     * L, R 중 하나를 입력받아 frame 의 너비를 구한다.
     * @param {String} [whichSide]  지정하지 않을 경우 전체 너비.
     * @returns {Number} 해당 frame 의 너비
     */
    getFrameWidth: function(whichSide) {
        var columnFixCount = this.columnModel.getVisibleColumnFixCount(true),
            columnWidthList = this.getColumnWidthList(whichSide),
            frameWidth = this._getFrameWidth(columnWidthList);

        if (_.isUndefined(whichSide) && columnFixCount > 0) {
            frameWidth += CELL_BORDER_WIDTH;
        }
        return frameWidth;
    },

    /**
     * widthList 로부터 보더 값을 포함하여 계산한 frameWidth 를 구한다.
     * @param {Array} widthList 너비 리스트 배열
     * @returns {Number} 계산된 frame 너비값
     * @private
     */
    _getFrameWidth: function(widthList) {
        var frameWidth = 0;
        if (widthList.length) {
            frameWidth = util.sum(widthList) + ((widthList.length + 1) * CELL_BORDER_WIDTH);
        }
        return frameWidth;
    },

    /**
     * columnWidthList 로 부터, lside 와 rside 의 전체 너비를 계산하여 저장한다.
     * @param {array} columnWidthList - 컬럼 넓이값 배열
     * @param {boolean} [isSaveWidthList] - 저장 여부. true이면 넓이값 배열을 originalWidthList로 저장한다.
     * @private
     */
    _setColumnWidthVariables: function(columnWidthList, isSaveWidthList) {
        var totalWidth = this.get('width'),
            columnFixCount = this.columnModel.getVisibleColumnFixCount(true),
            maxLeftSideWidth = this._getMaxLeftSideWidth(),
            rsideWidth, lsideWidth, lsideWidthList, rsideWidthList;

        lsideWidthList = columnWidthList.slice(0, columnFixCount);
        rsideWidthList = columnWidthList.slice(columnFixCount);

        lsideWidth = this._getFrameWidth(lsideWidthList);
        if (maxLeftSideWidth && maxLeftSideWidth < lsideWidth) {
            lsideWidthList = this._adjustLeftSideWidthList(lsideWidthList, maxLeftSideWidth);
            lsideWidth = this._getFrameWidth(lsideWidthList);
            columnWidthList = lsideWidthList.concat(rsideWidthList);
        }
        rsideWidth = totalWidth - lsideWidth;

        this.set({
            columnWidthList: columnWidthList,
            rsideWidth: rsideWidth,
            lsideWidth: lsideWidth
        });

        if (isSaveWidthList) {
            this.set('originalWidthList', _.clone(columnWidthList));
        }
        this.trigger('columnWidthChanged');
    },

    /**
     * 열 고정 영역의 minimum width 값을 구한다.
     * @returns {number} 열고정 영역의 최소 너비값.
     * @private
     */
    _getMinLeftSideWidth: function() {
        var minimumColumnWidth = this.get('minimumColumnWidth'),
            columnFixCount = this.columnModel.getVisibleColumnFixCount(true),
            minWidth = 0,
            borderWidth;

        if (columnFixCount) {
            borderWidth = (columnFixCount + 1) * CELL_BORDER_WIDTH;
            minWidth = borderWidth + (minimumColumnWidth * columnFixCount);
        }
        return minWidth;
    },

    /**
     * 열 고정 영역의 maximum width 값을 구한다.
     * @returns {number} 열고정 영역의 최대 너비값.
     * @private
     */
    _getMaxLeftSideWidth: function() {
        var maxWidth = Math.ceil(this.get('width') * 0.9); // eslint-disable-line no-magic-number

        if (maxWidth) {
            maxWidth = Math.max(maxWidth, this._getMinLeftSideWidth());
        }
        return maxWidth;
    },

    /**
     * 계산한 cell 의 위치를 리턴한다.
     * @param {Number|String} rowKey - 데이터의 키값
     * @param {String} columnName - 칼럼명
     * @returns {{top: number, left: number, right: number, bottom: number}} - cell의 위치
     * @todo TC
     */
    getCellPosition: function(rowKey, columnName) {
        var dataModel = this.dataModel,
            columnModel = this.columnModel,
            rowHeight = this.get('rowHeight'),
            row = dataModel.get(rowKey),
            metaColumnCount = columnModel.getVisibleMetaColumnCount(),
            columnWidthList = this.get('columnWidthList').slice(metaColumnCount),
            columnFixCount = columnModel.getVisibleColumnFixCount(),
            columnIdx = columnModel.indexOfColumnName(columnName, true),
            rowSpanData,
            rowIdx, spanCount,
            top, left, right, bottom, i;

        if (!row) {
            return {};
        }

        rowSpanData = dataModel.get(rowKey).getRowSpanData(columnName);

        if (!rowSpanData.isMainRow) {
            rowKey = rowSpanData.mainRowKey;
            rowSpanData = dataModel.get(rowKey).getRowSpanData(columnName);
        }

        spanCount = rowSpanData.count || 1;

        rowIdx = dataModel.indexOfRowKey(rowKey);

        top = util.getHeight(rowIdx, rowHeight);
        bottom = top + util.getHeight(spanCount, rowHeight) - CELL_BORDER_WIDTH;

        left = i = 0;
        if (columnFixCount <= columnIdx) {
            i = columnFixCount;
        }
        for (; i < columnIdx; i += 1) {
            left += columnWidthList[i] + CELL_BORDER_WIDTH;
        }
        right = left + columnWidthList[i] + CELL_BORDER_WIDTH;

        return {
            top: top,
            left: left,
            right: right,
            bottom: bottom
        };
    },

    /**
     * Return scroll position from the received index
     * @param {Number|String} rowKey - Row-key of target cell
     * @param {String} columnName - Column name of target cell
     * @returns {{scrollLeft: ?Number, scrollTop: ?Number}} Position to scroll
     */
    getScrollPosition: function(rowKey, columnName) {
        var isRsideColumn = !this.columnModel.isLside(columnName),
            targetPosition = this.getCellPosition(rowKey, columnName),
            bodySize = this._getBodySize(),
            scrollDirection = this._judgeScrollDirection(targetPosition, isRsideColumn, bodySize);

        return this._makeScrollPosition(scrollDirection, targetPosition, bodySize);
    },

    /**
     * Calc body size of grid except scrollBar
     * @returns {{height: number, totalWidth: number, rsideWidth: number}} Body size
     * @private
     */
    _getBodySize: function() {
        var lsideWidth = this.get('lsideWidth'),
            rsideWidth = this.get('rsideWidth') - this.getScrollYWidth(),
            height = this.get('bodyHeight') - this.getScrollXHeight();

        return {
            height: height,
            rsideWidth: rsideWidth,
            totalWidth: lsideWidth + rsideWidth
        };
    },

    /**
     * Judge scroll direction.
     * @param {{top: number, bottom: number, left: number, right: number}} targetPosition - Position of target element
     * @param {boolean} isRsideColumn - Whether the target cell is in rside
     * @param {{height: number, rsideWidth: number}} bodySize - Using cached bodySize
     * @returns {{isUp: boolean, isDown: boolean, isLeft: boolean, isRight: boolean}} Direction
     * @private
     */
    _judgeScrollDirection: function(targetPosition, isRsideColumn, bodySize) {
        var renderModel = this.renderModel,
            currentTop = renderModel.get('scrollTop'),
            currentLeft = renderModel.get('scrollLeft'),
            isUp, isDown, isLeft, isRight;

        isUp = targetPosition.top < currentTop;
        isDown = !isUp && (targetPosition.bottom > (currentTop + bodySize.height));
        if (isRsideColumn) {
            isLeft = targetPosition.left < currentLeft;
            isRight = !isLeft && (targetPosition.right > (currentLeft + bodySize.rsideWidth - 1));
        } else {
            isLeft = isRight = false;
        }

        return {
            isUp: isUp,
            isDown: isDown,
            isLeft: isLeft,
            isRight: isRight
        };
    },

    /**
     * Make scroll position
     * @param {{isUp: boolean, isDown: boolean, isLeft: boolean, isRight: boolean}} scrollDirection - Direction
     * @param {{top: number, bottom: number, left: number, right: number}} targetPosition - Position of target element
     * @param {{height: number, rsideWidth: number}} bodySize - Using cached bodySize
     * @returns {{scrollLeft: ?Number, scrollTop: ?Number}} Position to scroll
     * @private
     */
    _makeScrollPosition: function(scrollDirection, targetPosition, bodySize) {
        var pos = {};

        if (scrollDirection.isUp) {
            pos.scrollTop = targetPosition.top;
        } else if (scrollDirection.isDown) {
            pos.scrollTop = targetPosition.bottom - bodySize.height;
        }

        if (scrollDirection.isLeft) {
            pos.scrollLeft = targetPosition.left;
        } else if (scrollDirection.isRight) {
            pos.scrollLeft = targetPosition.right - bodySize.rsideWidth + TABLE_BORDER_WIDTH;
        }

        return pos;
    },

    /**
     * Calc and get overflow values from container position
     * @param {Number} pageX - Mouse X-position based on page
     * @param {Number} pageY - Mouse Y-position based on page
     * @returns {{x: number, y: number}} Mouse-overflow
     */
    getOverflowFromMousePosition: function(pageX, pageY) {
        var containerPos = this._rebasePositionToContainer(pageX, pageY),
            bodySize = this._getBodySize();

        return this._judgeOverflow(containerPos, bodySize);
    },

    /**
     * Judge overflow
     * @param {{x: number, y: number}} containerPosition - Position values based on container
     * @param {{height: number, totalWidth: number, rsideWidth: number}} bodySize - Real body size
     * @returns {{x: number, y: number}} Overflow values
     * @private
     */
    _judgeOverflow: function(containerPosition, bodySize) {
        var containerX = containerPosition.x,
            containerY = containerPosition.y,
            overflowY = 0,
            overflowX = 0;

        if (containerY < 0) {
            overflowY = -1;
        } else if (containerY > bodySize.height) {
            overflowY = 1;
        }

        if (containerX < 0) {
            overflowX = -1;
        } else if (containerX > bodySize.totalWidth) {
            overflowX = 1;
        }

        return {
            x: overflowX,
            y: overflowY
        };
    },

    /**
     * Get cell index from mouse position
     * @param {Number} pageX - Mouse X-position based on page
     * @param {Number} pageY - Mouse Y-position based on page
     * @param {boolean} [withMeta] - Whether the meta columns go with this calculation
     * @returns {{row: number, column: number}} Cell index
     */
    getIndexFromMousePosition: function(pageX, pageY, withMeta) {
        var containerPos = this._rebasePositionToContainer(pageX, pageY);

        return {
            row: this._calcRowIndexFromPositionY(containerPos.y),
            column: this._calcColumnIndexFromPositionX(containerPos.x, withMeta)
        };
    },

    /**
     * Calc and get column index from Y-position based on the container
     * @param {number} containerY - X-position based on the container
     * @returns {number} Row index
     * @private
     */
    _calcRowIndexFromPositionY: function(containerY) {
        var cellY = containerY + this.renderModel.get('scrollTop'),
            tempIndex = Math.floor(cellY / (this.get('rowHeight') + CELL_BORDER_WIDTH)),
            min = 0,
            max = Math.max(min, this.dataModel.length - 1);

        return util.clamp(tempIndex, min, max);
    },

    /**
     * Calc and get column index from X-position based on the container
     * @param {number} containerX - X-position based on the container
     * @param {boolean} withMeta - Whether the meta columns go with this calculation
     * @returns {number} Column index
     * @private
     */
    _calcColumnIndexFromPositionX: function(containerX, withMeta) {
        var columnWidthList = this.getColumnWidthList(),
            totalColumnWidth = this.getFrameWidth(),
            cellX = containerX,
            isRsidePosition = containerX >= this.get('lsideWidth'),
            adjustableIndex = (withMeta) ? 0 : this.columnModel.getVisibleMetaColumnCount(),
            columnIndex = 0;

        if (isRsidePosition) {
            cellX += this.renderModel.get('scrollLeft');
        }

        if (cellX >= totalColumnWidth) {
            columnIndex = columnWidthList.length - 1;
        } else {
            tui.util.forEachArray(columnWidthList, function(width, index) { // eslint-disable-line consistent-return
                width += CELL_BORDER_WIDTH;
                columnIndex = index;

                if (cellX > width) {
                    cellX -= width;
                } else {
                    return false;
                }
            });
        }

        return Math.max(0, columnIndex - adjustableIndex);
    },

    /**
     * 마우스 위치 정보에 해당하는 grid container 기준 pageX 와 pageY 를 반환한다.
     * @param {Number} pageX    마우스 x 좌표
     * @param {Number} pageY    마우스 y 좌표
     * @returns {{x: number, y: number}} 그리드 container 기준의 x, y 값
     * @private
     */
    _rebasePositionToContainer: function(pageX, pageY) {
        var containerPosX = pageX - this.get('offsetLeft'),
            containerPosY = pageY - (this.get('offsetTop') + this.get('headerHeight') + 2);

        return {
            x: containerPosX,
            y: containerPosY
        };
    },

    /**
     * columnFixCount 가 적용되었을 때, window resize 시 left side 의 너비를 조정한다.
     * @param {Array} lsideWidthList    열고정 영역의 너비 리스트 배열
     * @param {Number} totalWidth   grid 전체 너비
     * @returns {Array} 열고정 영역의 너비 리스트
     * @private
     */
    _adjustLeftSideWidthList: function(lsideWidthList, totalWidth) {
        var i = lsideWidthList.length - 1,
            minimumColumnWidth = this.get('minimumColumnWidth'),
            currentWidth = this._getFrameWidth(lsideWidthList),
            diff = currentWidth - totalWidth,
            changedWidth;
        if (diff > 0) {
            while (i >= 0 && diff > 0) {
                changedWidth = Math.max(minimumColumnWidth, lsideWidthList[i] - diff);
                diff -= lsideWidthList[i] - changedWidth;
                lsideWidthList[i] = changedWidth;
                i -= 1;
            }
        } else if (diff < 0) {
            lsideWidthList[i] += Math.abs(diff);
        }
        return lsideWidthList;
    },

    /**
     * Resets the 'bodyHeight' attribute.
     * @private
     */
    _resetBodyHeight: function() {
        var rowListHeight;

        // To prevent recursive call with _resetDisplayRowCount (called by change:bodyHeight event)
        if (_.has(this.changed, 'bodyHeight')) {
            return;
        }
        rowListHeight = util.getHeight(this.get('displayRowCount'), this.get('rowHeight'));
        this.set('bodyHeight', rowListHeight + this.getScrollXHeight());
    },

    /**
     * Return height of X-scrollBar.
     * If no X-scrollBar, return 0
     * @returns {number} Height of X-scrollBar
     */
    getScrollXHeight: function() {
        return (this.get('scrollX') ? this.get('scrollBarSize') : 0);
    },

    /**
     * Return width of Y-scrollBar.
     * If no Y-scrollBar, return 0
     * @returns {number} Width of Y-scrollBar
     */
    getScrollYWidth: function() {
        return (this.get('scrollY') ? this.get('scrollBarSize') : 0);
    },

    /**
     * width 값 변경시 각 column 별 너비를 계산한다.
     * @private
     */
    _onWidthChange: function() {
        var widthList = this._adjustColumnWidthList(this.get('columnWidthList'), true);
        this._setColumnWidthVariables(widthList);
    },

    /**
     * columnResize 발생 시 index 에 해당하는 컬럼의 width 를 변경하여 반영한다.
     * @param {Number} index    너비를 변경할 컬럼의 인덱스
     * @param {Number} width    변경할 너비 pixel값
     */
    setColumnWidth: function(index, width) {
        var columnWidthList = this.get('columnWidthList'),
            fixedFlags = this._columnWidthFixedFlags,
            minWidth = this._minColumnWidthList[index],
            adjustedList;

        if (!fixedFlags[index] && columnWidthList[index]) {
            columnWidthList[index] = Math.max(width, minWidth);
            // makes width of the target column fixed temporarily
            // to not be influenced while adjusting column widths.
            fixedFlags[index] = true;
            adjustedList = this._adjustColumnWidthList(columnWidthList);
            fixedFlags[index] = false;
            this._setColumnWidthVariables(adjustedList);
        }
    },

    /**
     * Returns the height of table body.
     * @param  {number} height - The height of the dimension
     * @returns {number} The height of the table body
     * @private
     */
    _calcRealBodyHeight: function(height) {
        return height - this.get('headerHeight') - this.get('toolbarHeight') - TABLE_BORDER_WIDTH;
    },

    /**
     * Returns the minimum height of table body.
     * @returns {number} The minimum height of table body
     * @private
     */
    _getMinBodyHeight: function() {
        return this.get('rowHeight') + (CELL_BORDER_WIDTH * 2) + this.getScrollXHeight();
    },

    /**
     * Sets the height of the dimension.
     * (Resets the bodyHeight and displayRowCount relative to the dimension height)
     * @param  {number} height - The height of the dimension
     * @private
     */
    _setHeight: function(height) {
        this.set('bodyHeight', Math.max(this._calcRealBodyHeight(height), this._getMinBodyHeight()));
    },

    /**
     * Sets the width and height of the dimension.
     * @param {(Number|Null)} width - Width
     * @param {(Number|Null)} height - Height
     */
    setSize: function(width, height) {
        if (width > 0) {
            this.set('width', width);
        }
        if (height > 0) {
            this._setHeight(height);
        }
        this.trigger('setSize');
    },

    /**
     * Returns the height of the dimension.
     * @returns {Number} Height
     */
    getHeight: function() {
        return this.get('bodyHeight') + this.get('headerHeight') + this.get('toolbarHeight');
    },

    /**
     * layout 에 필요한 크기 및 위치 데이터를 갱신한다.
     */
    refreshLayout: function() {
        var domState = this.domState,
            offset = domState.getOffset();

        this.set({
            offsetTop: offset.top,
            offsetLeft: offset.left,
            width: domState.getWidth()
        });

        if (this.get('fitToParentHeight')) {
            this._setHeight(domState.getParentHeight());
        }
    },

    /**
     * 초기 너비로 돌린다.
     * @param {Number} index    너비를 변경할 컬럼의 인덱스
     */
    restoreColumnWidth: function(index) {
        var orgWidth = this.get('originalWidthList')[index];
        this.setColumnWidth(index, orgWidth);
    },

    /**
     * L side 와 R side 에 따른 columnWidthList 를 반환한다.
     * @param {String} [whichSide] 어느 영역인지 여부. 'L|R' 중 하나를 인자로 넘긴다. 생략시 전체 columnList 반환
     * @returns {Array}  조회한 영역의 columnWidthList
     */
    getColumnWidthList: function(whichSide) {
        var columnFixCount = this.columnModel.getVisibleColumnFixCount(true),
            columnWidthList = [];

        switch (whichSide) {
            case 'l':
            case 'L':
                columnWidthList = this.get('columnWidthList').slice(0, columnFixCount);
                break;
            case 'r':
            case 'R':
                columnWidthList = this.get('columnWidthList').slice(columnFixCount);
                break;
            default :
                columnWidthList = this.get('columnWidthList');
                break;
        }
        return columnWidthList;
    }
});

module.exports = Dimension;

},{"../base/model":5,"../common/constMap":8,"../common/util":11}],19:[function(require,module,exports){
/**
 * @fileoverview Focus 관련 데이터 처리름 담당한다.
 * @author NHN Ent. FE Development Team
 */
'use strict';

var Model = require('../base/model'),
    util = require('../common/util'),
    GridEvent = require('../common/gridEvent');

/**
 * Focus model
 * RowList collection 이 focus class 를 listen 한다.
 * @module model/focus
 * @extends module:base/model
 */
var Focus = Model.extend(/**@lends module:model/focus.prototype */{
    /**
     * @constructs
     * @param {Object} attrs - Attributes
     * @param {Object} options - Options
     */
    initialize: function(attrs, options) {
        Model.prototype.initialize.apply(this, arguments);

        this.dataModel = options.dataModel;
        this.columnModel = options.columnModel;
        this.dimensionModel = options.dimensionModel;
        this.domState = options.domState;

        this.listenTo(this.dataModel, 'reset', this._onResetData);
    },

    defaults: {
        /**
         * row key of the current cell
         * @type {String|Number}
         */
        rowKey: null,

        /**
         * column name of the current cell
         * @type {String}
         */
        columnName: '',

        /**
         * row key of the previously focused cell
         * @type {String|Number}
         */
        prevRowKey: null,

        /**
         * column name of the previously focused cell
         * @type {String}
         */
        prevColumnName: '',

        /**
         * address of the editing cell.
         * @type {{rowKey:(String|Number), columnName:String}}
         */
        editingAddress: null
    },

    /**
     * Event handler for 'reset' event on dataModel.
     * @private
     */
    _onResetData: function() {
        this.unselect(true);
    },

    /**
     * Saves previous data.
     * @private
     */
    _savePrevious: function() {
        if (this.get('rowKey') !== null) {
            this.set('prevRowKey', this.get('rowKey'));
        }
        if (this.get('columnName')) {
            this.set('prevColumnName', this.get('columnName'));
        }
    },

    /**
     * Clear previous data.
     * @private
     */
    _clearPrevious: function() {
        this.set({
            prevRowKey: null,
            prevColumnName: ''
        });
    },

    /**
     * Returns whether given rowKey and columnName is equal to current value
     * @param {(Number|String)} rowKey - row key
     * @param {String} columnName - column name
     * @param {Boolean} isMainRowKey - true if the target row key is main row
     * @returns {Boolean} - True if equal
     */
    isCurrentCell: function(rowKey, columnName, isMainRowKey) {
        var curColumnName = this.get('columnName');
        var curRowKey = this.get('rowKey');

        if (isMainRowKey) {
            curRowKey = this.dataModel.getMainRowKey(curRowKey, curColumnName);
        }

        return String(curRowKey) === String(rowKey) && curColumnName === columnName;
    },

    /**
     * Selects the given row
     * @param {Number|String} rowKey - Rowkey of the target row
     * @returns {Boolean} True is success
     */
    select: function(rowKey) {
        var eventData = new GridEvent(),
            currentRowKey = this.get('rowKey');

        if (String(currentRowKey) === String(rowKey)) {
            return true;
        }

        eventData.setData({
            rowKey: rowKey,
            prevRowKey: currentRowKey,
            rowData: this.dataModel.getRowData(rowKey)
        });
        this.trigger('select', eventData);
        if (eventData.isStopped()) {
            this._cancelSelect();
            return false;
        }

        this.set('rowKey', rowKey);
        if (this.columnModel.get('selectType') === 'radio') {
            this.dataModel.check(rowKey);
        }
        return true;
    },

    /**
     * Cancel select
     * @private
     */
    _cancelSelect: function() {
        var prevColumnName = this.get('prevColumnName');
        this.set('columnName', prevColumnName);
        this.trigger('focus', this.get('rowKey'), prevColumnName);
    },

    /**
     * 행을 unselect 한다.
     * @param {boolean} blur - The boolean value whether to invoke blur
     */
    unselect: function(blur) {
        if (blur) {
            this.blur();
        }
        this.set({
            rowKey: null
        });
    },

    /**
     * Focus to the cell identified by given rowKey and columnName.
     * @param {Number|String} rowKey - rowKey
     * @param {String} columnName - columnName
     * @param {Boolean} isScrollable - if set to true, move scroll position to focused position
     * @returns {Boolean} true if focused cell is changed
     */
    focus: function(rowKey, columnName, isScrollable) {
        if (!this._isValidCell(rowKey, columnName) ||
            util.isMetaColumn(columnName) ||
            this.isCurrentCell(rowKey, columnName)) {
            return true;
        }

        this.blur();
        if (!this.select(rowKey)) {
            return false;
        }

        this.set('columnName', columnName);
        this.trigger('focus', rowKey, columnName);

        if (isScrollable) {
            this.scrollToFocus();
        }
        return true;
    },

    /**
     * Focus to the cell identified by given rowIndex and columnIndex.
     * @param {(Number|String)} rowIndex - rowIndex
     * @param {String} columnIndex - columnIndex
     * @param {boolean} [isScrollable=false] - if set to true, scroll to focused cell
     * @returns {Boolean} true if success
     */
    focusAt: function(rowIndex, columnIndex, isScrollable) {
        var row = this.dataModel.at(rowIndex),
            column = this.columnModel.at(columnIndex, true),
            result = false;

        if (row && column) {
            result = this.focus(row.get('rowKey'), column.columnName, isScrollable);
        }

        return result;
    },

    /**
     * Focus to the cell identified by given rowKey and columnName and change it to edit-mode if editable.
     * @param {(Number|String)} rowKey - rowKey
     * @param {String} columnName - columnName
     * @param {boolean} [isScrollable=false] - if set to true, scroll to focused cell
     * @returns {Boolean} true if success
     */
    focusIn: function(rowKey, columnName, isScrollable) {
        var result = this.focus(rowKey, columnName, isScrollable);

        if (result) {
            rowKey = this.dataModel.getMainRowKey(rowKey, columnName);

            if (this.dataModel.get(rowKey).isEditable(columnName)) {
                this.finishEditing();
                this.startEditing(rowKey, columnName);
            } else {
                this.focusClipboard();
            }
        }

        return result;
    },

    /**
     * Focus to the cell identified by given rowIndex and columnIndex and change it to edit-mode if editable.
     * @param {(Number|String)} rowIndex - rowIndex
     * @param {String} columnIndex - columnIndex
     * @param {Boolean} [isScrollable=false] - if set to true, scroll to focused cell
     * @returns {Boolean} true if success
     */
    focusInAt: function(rowIndex, columnIndex, isScrollable) {
        var row = this.dataModel.at(rowIndex),
            column = this.columnModel.at(columnIndex, true),
            result = false;

        if (row && column) {
            result = this.focusIn(row.get('rowKey'), column.columnName, isScrollable);
        }
        return result;
    },

    /**
     * clipboard 에 focus 한다.
     */
    focusClipboard: function() {
        this.trigger('focusClipboard');
    },

    /**
     * If the grid has an element which has a focus, make sure that focusModel has a valid data,
     * Otherwise call focusModel.blur().
     */
    refreshState: function() {
        var restored;

        if (!this.domState.hasFocusedElement()) {
            this.blur();
        } else if (!this.has()) {
            restored = this.restore();
            if (!restored) {
                this.focusAt(0, 0);
            }
        }
    },

    /**
     * Scroll to focus
     */
    scrollToFocus: function() {
        var rowKey = this.get('rowKey'),
            columnName = this.get('columnName'),
            scrollPosition = this.dimensionModel.getScrollPosition(rowKey, columnName);

        if (!tui.util.isEmpty(scrollPosition)) {
            this.renderModel.set(scrollPosition);
        }
    },

    /**
     * 디자인 blur 처리한다.
     * @returns {Model.Focus} This object
     */
    blur: function() {
        var columnName = this.get('columnName');

        if (!this.has()) {
            return this;
        }

        if (this.has(true)) {
            this._savePrevious();
        }

        if (this.get('rowKey') !== null) {
            this.set('columnName', '');
        }
        this.trigger('blur', this.get('rowKey'), columnName);

        return this;
    },

    /**
     * 현재 focus 정보를 반환한다.
     * @returns {{rowKey: (number|string), columnName: string}} 현재 focus 정보에 해당하는 rowKey, columnName
     */
    which: function() {
        return {
            rowKey: this.get('rowKey'),
            columnName: this.get('columnName')
        };
    },

    /**
     * 현재 focus 정보를 index 기준으로 반환한다.
     * @param {boolean} isPrevious 이전 focus 정보를 반환할지 여부
     * @returns {{row: number, column: number}} The object that contains index info
     */
    indexOf: function(isPrevious) {
        var rowKey = isPrevious ? this.get('prevRowKey') : this.get('rowKey'),
            columnName = isPrevious ? this.get('prevColumnName') : this.get('columnName');

        return {
            row: this.dataModel.indexOfRowKey(rowKey),
            column: this.columnModel.indexOfColumnName(columnName, true)
        };
    },

    /**
     * Returns whether has focus.
     * @param {boolean} checkValid - if set to true, check whether the current cell is valid.
     * @returns {boolean} True if has focus.
     */
    has: function(checkValid) {
        var rowKey = this.get('rowKey'),
            columnName = this.get('columnName');

        if (checkValid) {
            return this._isValidCell(rowKey, columnName);
        }
        return !util.isBlank(rowKey) && !util.isBlank(columnName);
    },

    /**
     * Restore previous focus data.
     * @returns {boolean} True if restored
     */
    restore: function() {
        var prevRowKey = this.get('prevRowKey'),
            prevColumnName = this.get('prevColumnName'),
            restored = false;

        if (this._isValidCell(prevRowKey, prevColumnName)) {
            this.focus(prevRowKey, prevColumnName);
            restored = true;
        }
        return restored;
    },

    /**
     * Returns whether the cell identified by given rowKey and columnName is editing now.
     * @param {Number} rowKey - row key
     * @param {String} columnName - column name
     * @returns {Boolean}
     */
    isEditingCell: function(rowKey, columnName) {
        var address = this.get('editingAddress');

        return address &&
            (String(address.rowKey) === String(rowKey)) &&
            (address.columnName === columnName);
    },

    /**
     * Starts editing a cell identified by given rowKey and columnName, and returns the result.
     * @param {(String|Number)} rowKey - row key
     * @param {String} columnName - column name
     * @returns {Boolean} true if succeeded, false otherwise.
     */
    startEditing: function(rowKey, columnName) {
        if (this.get('editingAddress') ||
            !this.isCurrentCell(rowKey, columnName, true) ||
            !this.dataModel.get(rowKey).isEditable(columnName)) {
            return false;
        }

        this.set('editingAddress', {
            rowKey: rowKey,
            columnName: columnName
        });

        return true;
    },

    /**
     * Finishes editing the current cell, and returns the result.
     * @returns {Boolean} - true if an editing cell exist, false otherwise.
     */
    finishEditing: function() {
        if (!this.get('editingAddress')) {
            return false;
        }

        this.set('editingAddress', null);

        return true;
    },

    /**
     * Returns whether the specified cell is exist
     * @param {String|Number} rowKey - Rowkey
     * @param {String} columnName - ColumnName
     * @returns {boolean} True if exist
     * @private
     */
    _isValidCell: function(rowKey, columnName) {
        var isValidRowKey = !util.isBlank(rowKey) && !!this.dataModel.get(rowKey),
            isValidColumnName = !util.isBlank(columnName) && !!this.columnModel.getColumnModel(columnName);

        return isValidRowKey && isValidColumnName;
    },

    /**
     * 현재 focus 된 row 기준으로 offset 만큼 이동한 rowKey 를 반환한다.
     * @param {Number} offset   이동할 offset
     * @returns {?Number|String} rowKey   offset 만큼 이동한 위치의 rowKey
     * @private
     */
    _findRowKey: function(offset) {
        var index, row,
            dataModel = this.dataModel,
            rowKey = null;

        if (this.has(true)) {
            index = Math.max(
                Math.min(
                    dataModel.indexOfRowKey(this.get('rowKey')) + offset,
                    this.dataModel.length - 1
                ), 0
            );
            row = dataModel.at(index);
            if (row) {
                rowKey = row.get('rowKey');
            }
        }
        return rowKey;
    },

    /**
     * 현재 focus 된 column 기준으로 offset 만큼 이동한 columnName 을 반환한다.
     * @param {Number} offset   이동할 offset
     * @returns {?String} columnName  offset 만큼 이동한 위치의 columnName
     * @private
     */
    _findColumnName: function(offset) {
        var index,
            columnModel = this.columnModel,
            columnModelList = columnModel.getVisibleColumnModelList(),
            columnIndex = columnModel.indexOfColumnName(this.get('columnName'), true),
            columnName = null;

        if (this.has(true)) {
            index = Math.max(Math.min(columnIndex + offset, columnModelList.length - 1), 0);
            columnName = columnModelList[index] && columnModelList[index].columnName;
        }
        return columnName;
    },

    /**
     * rowSpanData 를 반환한다.
     * @param {Number|String} rowKey    조회할 데이터의 키값
     * @param {String} columnName   컬럼명
     * @returns {*|{count: number, isMainRow: boolean, mainRowKey: *}|*} rowSpanData 정보
     * @private
     */
    _getRowSpanData: function(rowKey, columnName) {
        return this.dataModel.get(rowKey).getRowSpanData(columnName);
    },

    /**
     * offset 만큼 뒤로 이동한 row 의 index 를 반환한다.
     * @param {number} offset   이동할 offset
     * @returns {Number} 이동한 위치의 row index
     */
    nextRowIndex: function(offset) {
        var rowKey = this.nextRowKey(offset);
        return this.dataModel.indexOfRowKey(rowKey);
    },

    /**
     * offset 만큼 앞으로 이동한 row의 index를 반환한다.
     * @param {number} offset 이동할 offset
     * @returns {Number} 이동한 위치의 row index
     */
    prevRowIndex: function(offset) {
        var rowKey = this.prevRowKey(offset);
        return this.dataModel.indexOfRowKey(rowKey);
    },

    /**
     * 다음 컬럼의 인덱스를 반환한다.
     * @returns {Number} 다음 컬럼의 index
     */
    nextColumnIndex: function() {
        var columnName = this.nextColumnName();
        return this.columnModel.indexOfColumnName(columnName, true);
    },

    /**
     * 이전 컬럼의 인덱스를 반환한다.
     * @returns {Number} 이전 컬럼의 인덱스
     */
    prevColumnIndex: function() {
        var columnName = this.prevColumnName();
        return this.columnModel.indexOfColumnName(columnName, true);
    },

    /**
     * keyEvent 발생 시 호출될 메서드로,
     * rowSpan 정보 까지 계산된 다음 rowKey 를 반환한다.
     * @param {number}  offset 이동할 offset
     * @returns {Number|String} offset 만큼 이동한 위치의 rowKey
     */
    nextRowKey: function(offset) {
        var focused = this.which(),
            rowKey = focused.rowKey,
            count, rowSpanData;

        offset = (typeof offset === 'number') ? offset : 1;
        if (offset > 1) {
            rowKey = this._findRowKey(offset);
            rowSpanData = this._getRowSpanData(rowKey, focused.columnName);
            if (!rowSpanData.isMainRow) {
                rowKey = this._findRowKey(rowSpanData.count + offset);
            }
        } else {
            rowSpanData = this._getRowSpanData(rowKey, focused.columnName);
            if (rowSpanData.isMainRow && rowSpanData.count > 0) {
                rowKey = this._findRowKey(rowSpanData.count);
            } else if (!rowSpanData.isMainRow) {
                count = rowSpanData.count;
                rowSpanData = this._getRowSpanData(rowSpanData.mainRowKey, focused.columnName);
                rowKey = this._findRowKey(rowSpanData.count + count);
            } else {
                rowKey = this._findRowKey(1);
            }
        }
        return rowKey;
    },

    /**
     * keyEvent 발생 시 호출될 메서드로,
     * rowSpan 정보 까지 계산된 이전 rowKey 를 반환한다.
     * @param {number}  offset 이동할 offset
     * @returns {Number|String} offset 만큼 이동한 위치의 rowKey
     */
    prevRowKey: function(offset) {
        var focused = this.which(),
            rowKey = focused.rowKey,
            rowSpanData;
        offset = typeof offset === 'number' ? offset : 1;
        offset *= -1;

        if (offset < -1) {
            rowKey = this._findRowKey(offset);
            rowSpanData = this._getRowSpanData(rowKey, focused.columnName);
            if (!rowSpanData.isMainRow) {
                rowKey = this._findRowKey(rowSpanData.count + offset);
            }
        } else {
            rowSpanData = this._getRowSpanData(rowKey, focused.columnName);
            if (!rowSpanData.isMainRow) {
                rowKey = this._findRowKey(rowSpanData.count - 1);
            } else {
                rowKey = this._findRowKey(-1);
            }
        }
        return rowKey;
    },

    /**
     * keyEvent 발생 시 호출될 메서드로, 다음 columnName 을 반환한다.
     * @returns {String} 다음 컬럼명
     */
    nextColumnName: function() {
        return this._findColumnName(1);
    },

    /**
     * keyEvent 발생 시 호출될 메서드로, 이전 columnName 을 반환한다.
     * @returns {String} 이전 컬럼명
     */
    prevColumnName: function() {
        return this._findColumnName(-1);
    },

    /**
     * 첫번째 row 의 key 를 반환한다.
     * @returns {(string|number)} 첫번째 row 의 키값
     */
    firstRowKey: function() {
        return this.dataModel.at(0).get('rowKey');
    },

    /**
     * 마지막 row의 key 를 반환한다.
     * @returns {(string|number)} 마지막 row 의 키값
     */
    lastRowKey: function() {
        return this.dataModel.at(this.dataModel.length - 1).get('rowKey');
    },

    /**
     * 첫번째 columnName 을 반환한다.
     * @returns {string} 첫번째 컬럼명
     */
    firstColumnName: function() {
        var columnModelList = this.columnModel.getVisibleColumnModelList();
        return columnModelList[0].columnName;
    },

    /**
     * 마지막 columnName 을 반환한다.
     * @returns {string} 마지막 컬럼명
     */
    lastColumnName: function() {
        var columnModelList = this.columnModel.getVisibleColumnModelList(),
            lastIndex = columnModelList.length - 1;
        return columnModelList[lastIndex].columnName;
    }
});

module.exports = Focus;

},{"../base/model":5,"../common/gridEvent":10,"../common/util":11}],20:[function(require,module,exports){
/**
 * @fileoverview Model Manager
 * @author NHN Ent. FE Development Team
 */
'use strict';

var ColumnModelData = require('./data/columnModel');
var RowListData = require('./data/rowList');
var ToolbarModel = require('./toolbar');
var DimensionModel = require('./dimension');
var FocusModel = require('./focus');
var RenderModel = require('./renderer');
var SmartRenderModel = require('./renderer-smart');
var SelectionModel = require('./selection');

var defaultOptions = {
    columnFixCount: 0,
    columnModelList: [],
    keyColumnName: null,
    selectType: '',
    autoNumbering: true,
    headerHeight: 35,
    rowHeight: 27,
    fitToParentHeight: false,
    showDummyRows: false,
    displayRowCount: 10,
    minimumColumnWidth: 50,
    notUseSmartRendering: false,
    columnMerge: [],
    scrollX: true,
    scrollY: true,
    useClientSort: true,
    singleClickEdit: false,
    toolbar: {
        hasResizeHandler: true,
        hasControlPanel: true,
        hasPagination: true
    }
};

/**
 * Model Manager
 * @module modelManager
 */
var ModelManager = tui.util.defineClass(/**@lends module:modelManager.prototype */{
    /**
     * @constructs
     * @param {Object} options - Options to create models
     * @param {module/domState} domState - DomState instance
     */
    init: function(options, domState) {
        options = $.extend(true, {}, defaultOptions, options);

        this.gridId = options.gridId;

        this.columnModel = this._createColumnModel(options);
        this.dataModel = this._createDataModel(options, domState);
        this.toolbarModel = this._createToolbarModel(options);
        this.dimensionModel = this._createDimensionModel(options, domState);
        this.focusModel = this._createFocusModel(domState);
        this.renderModel = this._createRenderModel(options);
        this.selectionModel = this._createSelectionModel();

        // todo: remove dependency
        this.focusModel.renderModel = this.renderModel;
        this.dimensionModel.renderModel = this.renderModel;
    },

    /**
     * Creates an instance of column model and returns it.
     * @param  {Object} options - Options
     * @returns {module:data/columnModel} A new instance
     * @private
     */
    _createColumnModel: function(options) {
        return new ColumnModelData({
            hasNumberColumn: options.autoNumbering,
            keyColumnName: options.keyColumnName,
            columnFixCount: options.columnFixCount,
            selectType: options.selectType,
            columnMerge: options.columnMerge,
            columnModelList: options.columnModelList
        });
    },

    /**
     * Creates an instance of data model and returns it.
     * @param  {Object} options - Options
     * @param  {module:domState} domState - domState
     * @returns {module:data/rowList} - A new instance
     * @private
     */
    _createDataModel: function(options, domState) {
        return new RowListData([], {
            gridId: this.gridId,
            domState: domState,
            columnModel: this.columnModel,
            useClientSort: options.useClientSort
        });
    },

    /**
     * Creates an instance of toolbar model and returns it.
     * @param  {Object} options - Options
     * @returns {module:model/toolbar} - A new instance
     * @private
     */
    _createToolbarModel: function(options) {
        return new ToolbarModel(options.toolbar);
    },

    /**
     * Creates an instance of dimension model and returns it.
     * @param  {Object} options - Options
     * @param  {module:domState} domState - domState
     * @returns {module:model/dimension} - A new instance
     * @private
     */
    _createDimensionModel: function(options, domState) {
        var attrs = {
            headerHeight: options.headerHeight,
            rowHeight: options.rowHeight,
            fitToParentHeight: options.fitToParentHeight,
            scrollX: !!options.scrollX,
            scrollY: !!options.scrollY,
            minimumColumnWidth: options.minimumColumnWidth,
            displayRowCount: options.displayRowCount
        };
        if (!this.toolbarModel.isVisible()) {
            attrs.toolbarHeight = 0;
        }

        return new DimensionModel(attrs, {
            columnModel: this.columnModel,
            dataModel: this.dataModel,
            domState: domState
        });
    },

    /**
     * Creates an instance of focus model and returns it.
     * @param  {module:domState} domState - DomState instance
     * @returns {module:model/focus} - A new instance
     * @private
     */
    _createFocusModel: function(domState) {
        return new FocusModel(null, {
            columnModel: this.columnModel,
            dataModel: this.dataModel,
            dimensionModel: this.dimensionModel,
            renderModel: this.renderModel,
            domState: domState
        });
    },

    /**
     * Creates an instance of seleciton model and returns it.
     * @returns {module:model/selection} - A new instance
     * @private
     */
    _createSelectionModel: function() {
        return new SelectionModel(null, {
            columnModel: this.columnModel,
            dataModel: this.dataModel,
            dimensionModel: this.dimensionModel,
            renderModel: this.renderModel,
            focusModel: this.focusModel
        });
    },

    /**
     * Creates an instance of render model and returns it.
     * @param  {Object} options - Options
     * @returns {module:model/render} - A new instance
     * @private
     */
    _createRenderModel: function(options) {
        var attrs, renderOptions, Constructor;

        attrs = {
            emptyMessage: options.emptyMessage,
            showDummyRows: options.showDummyRows
        };
        renderOptions = {
            columnModel: this.columnModel,
            dataModel: this.dataModel,
            dimensionModel: this.dimensionModel,
            focusModel: this.focusModel
        };
        Constructor = options.notUseSmartRendering ? RenderModel : SmartRenderModel;

        return new Constructor(attrs, renderOptions);
    },

    /**
     * Destroy
     */
    destroy: function() {
        _.each(this, function(value, property) {
            if (value && tui.util.isFunction(value._destroy)) {
                value._destroy();
            }
            if (value && tui.util.isFunction(value.stopListening)) {
                value.stopListening();
            }
            this[property] = null;
        }, this);
    }
});

module.exports = ModelManager;

},{"./data/columnModel":14,"./data/rowList":17,"./dimension":18,"./focus":19,"./renderer":22,"./renderer-smart":21,"./selection":25,"./toolbar":26}],21:[function(require,module,exports){
/**
 * @fileoverview 스마트 랜더링을 지원하는 Renderer 모ㄷ델
 * @author NHN Ent. FE Development Team
 */
'use strict';

var Renderer = require('./renderer');
var util = require('../common/util');

/**
 *  View 에서 Rendering 시 사용할 객체
 *  Smart Rendering 을 지원한다.
 *  @module model/renderer-smart
 * @extends module:model/renderer
 */
var SmartRenderer = Renderer.extend(/**@lends module:model/renderer-smart.prototype */{
    /**
     * @constructs
     */
    initialize: function() {
        Renderer.prototype.initialize.apply(this, arguments);
        this.on('change:scrollTop', this._onChange, this);
        this.listenTo(this.dimensionModel, 'change:bodyHeight', this._onChange, this);

        this.setOwnProperties({
            hiddenRowCount: 10,
            criticalPoint: 3
        });
    },
    /**
     * bodyHeight 가 변경 되었을때 이벤트 핸들러
     * @private
     */
    _onChange: function() {
        if (this._isRenderable(this.get('scrollTop'))) {
            this.refresh();
        }
    },

    /**
     * SmartRendering 을 사용하여 rendering 할 index 범위를 결정한다.
     * @param {Number} scrollTop    랜더링 범위를 결정하기 위한 현재 scrollTop 위치 값
     * @private
     */
    _setRenderingRange: function(scrollTop) {
        var dimensionModel = this.dimensionModel,
            dataModel = this.dataModel,
            rowHeight = dimensionModel.get('rowHeight'),
            displayRowCount = dimensionModel.get('displayRowCount'),
            startIndex = Math.max(0, Math.ceil(scrollTop / (rowHeight + 1)) - this.hiddenRowCount),
            endIndex = Math.min(dataModel.length - 1, startIndex + displayRowCount + (this.hiddenRowCount * 2)),
            top;

        if (dataModel.isRowSpanEnable()) {
            startIndex += this._getStartRowSpanMinCount(startIndex);
            endIndex += this._getEndRowSpanMaxCount(endIndex);
        }
        top = (startIndex === 0) ? 0 : util.getHeight(startIndex, rowHeight);

        this.set({
            top: top,
            startIndex: startIndex,
            endIndex: endIndex
        });
    },

    /**
     * 렌더링을 시작하는 행에 rowSpan 정보가 있으면, count 값이 가장 작은 행의 값을 반환한다.
     * @param {number} startIndex 시작하는 행의 Index
     * @returns {number} rowSpan의 count 값 (0 이하)
     * @private
     */
    _getStartRowSpanMinCount: function(startIndex) {
        var firstRow = this.dataModel.at(startIndex),
            result = 0,
            counts;

        if (firstRow) {
            counts = _.pluck(firstRow.getRowSpanData(), 'count');
            counts.push(0); // count가 음수인 경우(mainRow가 아닌 경우)에만 최소값을 구함. 없으면 0
            result = _.min(counts);
        }
        return result;
    },

    /**
     * 렌더링할 마지막 행에 rowSpan 정보가 있으면, count 값이 가장 큰 행의 값을 반환한다.
     * @param {number} endIndex 마지막 행의 Index
     * @returns {number} rowSpan의 count 값 (0 이상)
     * @private
     */
    _getEndRowSpanMaxCount: function(endIndex) {
        var lastRow = this.dataModel.at(endIndex),
            result = 0,
            counts;

        if (lastRow) {
            counts = _.pluck(lastRow.getRowSpanData(), 'count');
            counts.push(0); // count가 양수인 경우(mainRow인 경우)에만 최대값을 구함. 없으면 0
            result = _.max(counts);
        }
        return result;
    },
    /**
     * scrollTop 값 에 따라 rendering 해야하는지 판단한다.
     * @param {Number} scrollTop 랜더링 범위를 결정하기 위한 현재 scrollTop 위치 값
     * @returns {boolean}    랜더링 해야할지 여부
     * @private
     */
    _isRenderable: function(scrollTop) {
        var dimensionModel = this.dimensionModel,
            dataModel = this.dataModel,
            rowHeight = dimensionModel.get('rowHeight'),
            bodyHeight = dimensionModel.get('bodyHeight'),
            rowCount = dataModel.length,
            displayStartIdx = Math.max(0, Math.ceil(scrollTop / (rowHeight + 1))),
            displayEndIdx = Math.min(dataModel.length - 1, Math.floor((scrollTop + bodyHeight) / (rowHeight + 1))),
            startIndex = this.get('startIndex'),
            endIndex = this.get('endIndex');

        //시작 지점이 임계점 이하로 올라갈 경우 return true
        if (startIndex !== 0) {
            if (startIndex + this.criticalPoint > displayStartIdx) {
                return true;
            }
        }
        //마지막 지점이 임계점 이하로 내려갔을 경우 return true
        if (endIndex !== rowCount - 1) {
            if (endIndex - this.criticalPoint < displayEndIdx) {
                return true;
            }
        }
        return false;
    }
});

module.exports = SmartRenderer;

},{"../common/util":11,"./renderer":22}],22:[function(require,module,exports){
/**
 * @fileoverview Rendering 모델
 * @author NHN Ent. FE Development Team
 */
'use strict';

var Model = require('../base/model');
var RowList = require('./rowList');
var renderStateMap = require('../common/constMap').renderState;

var DATA_LENGTH_FOR_LOADING = 1000;

/**
 * View 에서 Rendering 시 사용할 객체
 * @module model/renderer
 * @extends module:base/model
 */
var Renderer = Model.extend(/**@lends module:model/renderer.prototype */{
    /**
     * @constructs
     * @param {Object} attrs - Attributes
     * @param {Object} options - Options
     */
    initialize: function(attrs, options) {
        var lside, rside, rowListOptions;

        this.setOwnProperties({
            dataModel: options.dataModel,
            columnModel: options.columnModel,
            focusModel: options.focusModel,
            dimensionModel: options.dimensionModel
        });

        rowListOptions = {
            dataModel: this.dataModel,
            columnModel: this.columnModel,
            focusModel: this.focusModel
        };

        lside = new RowList([], rowListOptions);
        rside = new RowList([], rowListOptions);
        this.set({
            lside: lside,
            rside: rside
        });

        this.listenTo(this.columnModel, 'all', this._onColumnModelChange)
            .listenTo(this.dataModel, 'remove sort reset', this._onDataModelChange)
            .listenTo(this.dataModel, 'add', this._onAddDataModel)
            .listenTo(this.dataModel, 'beforeReset', this._onBeforeResetData)
            .listenTo(lside, 'valueChange', this._executeRelation)
            .listenTo(rside, 'valueChange', this._executeRelation)
            .listenTo(this.focusModel, 'change:editingAddress', this._onEditingAddressChange)
            .listenTo(this.focusModel, 'focus blur', this._onFocusOrBlur)
            .listenTo(this.dimensionModel, 'change:width', this._updateMaxScrollLeft)
            .listenTo(this.dimensionModel, 'change:totalRowHeight change:scrollBarSize change:bodyHeight',
                this._updateMaxScrollTop);

        if (this.get('showDummyRows')) {
            this.listenTo(this.dimensionModel, 'change:displayRowCount', this._resetDummyRows);
        }

        this._onChangeLayoutBound = _.bind(this._onChangeLayout, this);

        this.listenTo(this.dimensionModel, 'columnWidthChanged', this.finishEditing);

        this._updateMaxScrollLeft();
    },

    defaults: {
        top: 0,
        scrollTop: 0,
        scrollLeft: 0,
        maxScrollLeft: 0,
        maxScrollTop: 0,
        startIndex: 0,
        endIndex: 0,
        startNumber: 1,
        lside: null,
        rside: null,
        showDummyRows: false,
        dummyRowCount: 0,

        // text that will be shown if no data to render (custom value set by user)
        emptyMessage: null,

        // constMap.renderState
        state: renderStateMap.DONE
    },

    /**
     * Event handler for change:scrollTop and change:scrollLeft.
     * @private
     */
    _onChangeLayout: function() {
        this.focusModel.finishEditing();
        this.focusModel.focusClipboard();
    },

    /**
     * Event handler for 'chage:width' event on Dimension.
     * @private
     */
    _updateMaxScrollLeft: function() {
        var dimension = this.dimensionModel,
            maxScrollLeft = dimension.getFrameWidth('R') - dimension.get('rsideWidth') +
                dimension.getScrollYWidth();

        this.set('maxScrollLeft', maxScrollLeft);
    },

    /**
     * Event handler to reset 'maxScrollTop' attribute.
     * @private
     */
    _updateMaxScrollTop: function() {
        var dimension = this.dimensionModel,
            maxScrollTop = dimension.get('totalRowHeight') - dimension.get('bodyHeight') +
                dimension.get('scrollBarSize');

        this.set('maxScrollTop', maxScrollTop);
    },

    /**
     * Event handler for 'beforeReset' event on dataModel
     * @param {number} dataLength - the length of data
     * @private
     */
    _onBeforeResetData: function(dataLength) {
        if (dataLength > DATA_LENGTH_FOR_LOADING) {
            this.set('state', renderStateMap.LOADING);
        }
    },

    /**
     * Event handler for 'focus' and 'blur' events on focusModel
     * @param {Number|String} rowKey - row key
     * @param {String} columnName - column name
     * @private
     */
    _onFocusOrBlur: function(rowKey, columnName) {
        var mainRowKey = this.dataModel.getMainRowKey(rowKey, columnName);
        var rowModel = this._getRowModel(mainRowKey, columnName);

        if (rowModel) {
            rowModel.updateClassName(columnName);
        }
    },

    /**
     * Event handler for 'change:editingAddress' event on focusModel
     * @param {module:model/focus} focusModel - focus model
     * @param {{rowKey: Number, columnName: String}} address - address
     * @private
     */
    _onEditingAddressChange: function(focusModel, address) {
        var target = address;
        var editing = true;
        var self = this;

        if (!address) {
            target = focusModel.previous('editingAddress');
            editing = false;
        }
        this._updateCellData(target.rowKey, target.columnName, {
            isEditing: editing
        });

        this._triggerEditingStateChanged(target.rowKey, target.columnName);

        // defered call to prevent 'change:scrollLeft' or 'change:scrollTop' event
        // triggered by module:view/layout/body._onScroll()
        // when module:model/focus.scrollToFocus() method is called.
        _.defer(function() {
            self._toggleChangeLayoutEventHandlers(editing);
        });
    },

    /**
     * Toggle event handler for change:scrollTop and change:scrollLeft event.
     * @param {Boolean} editing - whether currently editing
     * @private
     */
    _toggleChangeLayoutEventHandlers: function(editing) {
        var renderEventName = 'change:scrollTop change:scrollLeft';
        var dimensionEventName = 'columnWidthChanged';

        if (editing) {
            this.listenToOnce(this.dimensionModel, dimensionEventName, this._onChangeLayoutBound);
            this.once(renderEventName, this._onChangeLayoutBound);
        } else {
            this.stopListening(this.dimensionModel, dimensionEventName, this._onChangeLayoutBound);
            this.off(renderEventName, this._onChangeLayoutBound);
        }
    },

    /**
     * Triggers the 'editingStateChanged' event if the cell data identified by
     * given row key and column name has the useViewMode:true option.
     * @param {String} rowKey - row key
     * @param {String} columnName - column name
     * @private
     */
    _triggerEditingStateChanged: function(rowKey, columnName) {
        var cellData = this.getCellData(rowKey, columnName);

        if (tui.util.pick(cellData, 'columnModel', 'editOption', 'useViewMode') !== false) {
            this.trigger('editingStateChanged', cellData);
        }
    },

    /**
     * Updates the view-data of the cell identified by given rowKey and columnName.
     * @param {(String|Number)} rowKey - row key
     * @param {String} columnName - column name
     * @param {Object} cellData - cell data
     * @private
     */
    _updateCellData: function(rowKey, columnName, cellData) {
        var rowModel = this._getRowModel(rowKey, columnName);

        if (rowModel) {
            rowModel.setCell(columnName, cellData);
        }
    },

    /**
     * Initializes own properties.
     * (called by module:addon/net)
     */
    initializeVariables: function() {
        this.set({
            top: 0,
            scrollTop: 0,
            scrollLeft: 0,
            startIndex: 0,
            endIndex: 0,
            startNumber: 1
        });
    },

    /**
     * 열고정 영역 또는 열고정이 아닌 영역에 대한 Render Collection 을 반환한다.
     * @param {String} [whichSide='R']    어느 영역인지 여부. 'L|R' 중에 하나의 값을 넘긴다.
     * @returns {Object} collection  해당 영역의 랜더 데이터 콜랙션
     */
    getCollection: function(whichSide) {
        return this.get(tui.util.isString(whichSide) ? whichSide.toLowerCase() + 'side' : 'rside');
    },

    /**
     * Data.ColumnModel 이 변경되었을 때 열고정 영역 frame, 열고정 영역이 아닌 frame 의 list 를 재생성 하기 위한 이벤트 핸들러
     * @private
     */
    _onColumnModelChange: function() {
        this.set({
            scrollTop: 0,
            top: 0,
            startIndex: 0,
            endIndex: 0
        });
        this.refresh(true);
    },

    /**
     * Event handler for change
     * @private
     */
    _onDataModelChange: function() {
        this.refresh(false, true);
    },

    /**
     * Event handler for 'add' event on dataModel.
     * @param  {module:model/data/rowList} dataModel - data model
     * @param  {Object} options - options for appending. See {@link module:model/data/rowList#append}
     * @private
     */
    _onAddDataModel: function(dataModel, options) {
        this.refresh(false, true);

        if (options.focus) {
            this.focusModel.focusAt(options.at, 0);
        }
    },

    /**
     * Resets dummy rows and trigger 'rowListChanged' event.
     * @private
     */
    _resetDummyRows: function() {
        this._clearDummyRows();
        this._fillDummyRows();
        this.trigger('rowListChanged');
    },

    /**
     * rendering 할 index 범위를 결정한다.
     * Smart rendering 을 사용하지 않을 경우 전체 범위로 랜더링한다.
     * @private
     */
    _setRenderingRange: function() {
        this.set({
            startIndex: 0,
            endIndex: this.dataModel.length - 1
        });
    },

    /**
     * Returns the new data object for rendering based on rowDataModel and specified column names.
     * @param  {Object} rowDataModel - Instance of module:model/data/row
     * @param  {Array.<String>} columnNames - Column names
     * @param  {Number} height - the height of the row
     * @param  {Number} rowNum - Row number
     * @returns {Object} - view data object
     * @private
     */
    _createViewDataFromDataModel: function(rowDataModel, columnNames, height, rowNum) {
        var viewData = {
            height: height,
            rowKey: rowDataModel.get('rowKey'),
            _extraData: rowDataModel.get('_extraData')
        };

        _.each(columnNames, function(columnName) {
            var value = rowDataModel.get(columnName);

            if (columnName === '_number') {
                value = rowNum;
            }
            viewData[columnName] = value;
        });

        return viewData;
    },

    /**
     * Returns the object that contains two array of column names splitted by columnFixCount.
     * @returns {{lside: Array, rside: Array}} - Column names map
     * @private
     */
    _getColumnNamesOfEachSide: function() {
        var columnFixCount = this.columnModel.getVisibleColumnFixCount(true),
            columnModels = this.columnModel.getVisibleColumnModelList(null, true),
            columnNames = _.pluck(columnModels, 'columnName');

        return {
            lside: columnNames.slice(0, columnFixCount),
            rside: columnNames.slice(columnFixCount)
        };
    },

    /**
     * Resets specified view model list.
     * @param  {String} attrName - 'lside' or 'rside'
     * @param  {Object} viewData - Converted data for rendering view
     * @private
     */
    _resetViewModelList: function(attrName, viewData) {
        this.get(attrName).clear().reset(viewData, {
            parse: true
        });
    },

    /**
     * Resets both sides(lside, rside) of view model list with given range of data model list.
     * @param  {Number} startIndex - Start index
     * @param  {Number} endIndex - End index
     * @private
     */
    _resetAllViewModelListWithRange: function(startIndex, endIndex) {
        var columnNamesMap = this._getColumnNamesOfEachSide(),
            rowNum = this.get('startNumber') + startIndex,
            height = this.dimensionModel.get('rowHeight'),
            lsideData = [],
            rsideData = [],
            rowDataModel, i;

        for (i = startIndex; i <= endIndex; i += 1) {
            rowDataModel = this.dataModel.at(i);
            lsideData.push(this._createViewDataFromDataModel(rowDataModel, columnNamesMap.lside, height, rowNum));
            rsideData.push(this._createViewDataFromDataModel(rowDataModel, columnNamesMap.rside, height));
            rowNum += 1;
        }

        this._resetViewModelList('lside', lsideData);
        this._resetViewModelList('rside', rsideData);
    },

    /**
     * Returns the count of rows (except dummy rows) in view model list
     * @returns {Number} Count of rows
     * @private
     */
    _getActualRowCount: function() {
        return this.get('endIndex') - this.get('startIndex') + 1;
    },

    /**
     * Removes all dummy rows in the view model list.
     * @private
     */
    _clearDummyRows: function() {
        var dataRowCount = this.get('endIndex') - this.get('startIndex') + 1;

        _.each(['lside', 'rside'], function(attrName) {
            var rowList = this.get(attrName);
            while (rowList.length > dataRowCount) {
                rowList.pop();
            }
        }, this);
    },

    /**
     * fills the empty area with dummy rows.
     * @private
     */
    _fillDummyRows: function() {
        var displayRowCount = this.dimensionModel.get('displayRowCount'),
            actualRowCount = this._getActualRowCount(),
            dummyRowCount = Math.max(displayRowCount - actualRowCount, 0),
            rowHeight = this.dimensionModel.get('rowHeight');

        _.times(dummyRowCount, function() {
            _.each(['lside', 'rside'], function(listName) {
                this.get(listName).add({
                    height: rowHeight
                });
            }, this);
        }, this);

        this.set('dummyRowCount', dummyRowCount);
    },

    /**
     * Refreshes the rendering range and the list of view models, and triggers events.
     * @param {Boolean} columnModelChanged - The boolean value whether columnModel has changed
     * @param {Boolean} dataModelChanged - The boolean value whether dataModel has changed
     */
    refresh: function(columnModelChanged, dataModelChanged) {
        var startIndex, endIndex, i;

        this._setRenderingRange(this.get('scrollTop'));
        startIndex = this.get('startIndex');
        endIndex = this.get('endIndex');

        this._resetAllViewModelListWithRange(startIndex, endIndex);
        if (this.get('showDummyRows')) {
            this._fillDummyRows();
        }

        for (i = startIndex; i <= endIndex; i += 1) {
            this._executeRelation(i);
        }

        if (columnModelChanged) {
            this.trigger('columnModelChanged');
        } else {
            this.trigger('rowListChanged', dataModelChanged);
        }
        this._refreshState();
    },

    /**
     * Set state value based on the DataModel.length
     * @private
     */
    _refreshState: function() {
        if (this.dataModel.length) {
            this.set('state', renderStateMap.DONE);
        } else {
            this.set('state', renderStateMap.EMPTY);
        }
    },

    /**
     * columnName 으로 lside 와 rside rendering collection 중 하나를 반환한다.
     * @param {String} columnName   컬럼명
     * @returns {Collection} 컬럼명에 해당하는 영역의 콜랙션
     * @private
     */
    _getCollectionByColumnName: function(columnName) {
        var lside = this.get('lside'),
            collection;

        if (lside.at(0) && lside.at(0).get(columnName)) {
            collection = lside;
        } else {
            collection = this.get('rside');
        }
        return collection;
    },

    /**
     * Returns the specified row model.
     * @param {(Number|String)} rowKey - row key
     * @param {String} columnName - column name
     * @returns {module:model/row}
     * @private
     */
    _getRowModel: function(rowKey, columnName) {
        var collection = this._getCollectionByColumnName(columnName);

        return collection.get(rowKey);
    },

    /**
     * 셀 데이터를 반환한다.
     * @param {number} rowKey   데이터의 키값
     * @param {String} columnName   컬럼명
     * @returns {object} cellData 셀 데이터
     * @example
     =>
     {
         rowKey: rowKey,
         columnName: columnName,
         value: value,
         rowSpan: rowSpanData.count,
         isMainRow: rowSpanData.isMainRow,
         mainRowKey: rowSpanData.mainRowKey,
         isEditable: isEditable,
         isDisabled: isDisabled,
         optionList: [],
         className: row.getClassNameList(columnName).join(' '),
         changed: []    //names of changed properties
     }
     */
    getCellData: function(rowKey, columnName) {
        var row = this._getRowModel(rowKey, columnName),
            cellData = null;

        if (row) {
            cellData = row.get(columnName);
        }
        return cellData;
    },

    /**
     * Executes the relation of the row identified by rowIndex
     * @param {Number} rowIndex - Row index
     * @private
     */
    _executeRelation: function(rowIndex) {
        var row = this.dataModel.at(rowIndex),
            renderIdx = rowIndex - this.get('startIndex'),
            rowModel, relationResult;

        relationResult = row.executeRelationCallbacksAll();

        _.each(relationResult, function(changes, columnName) {
            rowModel = this._getCollectionByColumnName(columnName).at(renderIdx);
            if (rowModel) {
                rowModel.setCell(columnName, changes);
            }
        }, this);
    }
});

module.exports = Renderer;

},{"../base/model":5,"../common/constMap":8,"./rowList":24}],23:[function(require,module,exports){
/**
 * @fileoverview Row Model for Rendering (View Model)
 * @author NHN Ent. FE Development Team
 */
'use strict';

var Model = require('../base/model');
var util = require('../common/util');

/**
 * Row Model
 * @module model/row
 * @extends module:base/model
 */
var Row = Model.extend(/**@lends module:model/row.prototype */{
    /**
     * @constructs
     * @param  {object} attributes - Attributes
     * @param  {object} options - Options
     */
    initialize: function(attributes) {
        var rowKey = attributes && attributes.rowKey,
            dataModel = this.collection.dataModel,
            rowData = dataModel.get(rowKey);

        this.dataModel = dataModel;
        this.columnModel = this.collection.columnModel;
        this.focusModel = this.collection.focusModel;

        if (rowData) {
            this.listenTo(rowData, 'change', this._onDataModelChange);
            this.listenTo(rowData, 'restore', this._onDataModelRestore);
            this.listenTo(rowData, 'extraDataChanged', this._setRowExtraData);
            this.listenTo(dataModel, 'disabledChanged', this._onDataModelDisabledChanged);
            this.rowData = rowData;
        }
    },

    idAttribute: 'rowKey',

    /**
     * Event handler for 'change' event on module:data/row
     * @param {Object} rowData - RowData model on which event occurred
     * @private
     */
    _onDataModelChange: function(rowData) {
        _.each(rowData.changed, function(value, columnName) {
            var column, isTextType;

            if (this.has(columnName)) {
                column = this.columnModel.getColumnModel(columnName);
                isTextType = this.columnModel.isTextType(columnName);

                this.setCell(columnName, this._getValueAttrs(value, rowData, column, isTextType));
            }
        }, this);
    },

    /**
     * Event handler for 'restore' event on module:data/row
     * @param {String} columnName - columnName
     * @private
     */
    _onDataModelRestore: function(columnName) {
        var cellData = this.get(columnName);
        if (cellData) {
            this.trigger('restore', cellData);
        }
    },

    /**
     * Returns an array of visible column names.
     * @returns {Array.<String>} Visible column names
     * @private
     */
    _getColumnNameList: function() {
        var columnModels = this.collection.columnModel.getVisibleColumnModelList(null, true);

        return _.pluck(columnModels, 'columnName');
    },

    /**
     * Event handler for 'disabledChanged' event on dataModel
     */
    _onDataModelDisabledChanged: function() {
        var columnNames = this._getColumnNameList();

        _.each(columnNames, function(columnName) {
            this.setCell(columnName, {
                isDisabled: this.rowData.isDisabled(columnName),
                className: this._getClassNameString(columnName)
            });
        }, this);
    },

    /**
     * Sets the 'isDisabled', 'isEditable', 'className' property of each cell data.
     * @private
     */
    _setRowExtraData: function() {
        var dataModel = this.collection.dataModel,
            columnNames = this._getColumnNameList(),
            param;

        if (tui.util.isUndefined(this.collection)) {
            return;
        }

        _.each(columnNames, function(columnName) {
            var cellData = this.get(columnName),
                rowModel = this, // eslint-disable-line consistent-this
                cellState;

            if (!tui.util.isUndefined(cellData)) {
                cellState = this.rowData.getCellState(columnName);
                if (dataModel.isRowSpanEnable() && !cellData.isMainRow) {
                    rowModel = this.collection.get(cellData.mainRowKey);
                }
                if (rowModel) {
                    param = {
                        isDisabled: cellState.isDisabled,
                        isEditable: cellState.isEditable,
                        className: this._getClassNameString(columnName)
                    };
                    rowModel.setCell(columnName, param);
                }
            }
        }, this);
    },

    /**
     * Overrides Backbone.Model.parse
     * (this method is called before initialize method)
     * @param {Array} data - Original data
     * @param {Object} options - Options
     * @returns {Array} - Converted data.
     * @override
     */
    parse: function(data, options) {
        var collection = options.collection;

        return this._formatData(data, collection.dataModel, collection.columnModel, collection.focusModel);
    },

    /**
     * Convert the original data to the rendering data.
     * @param {Array} data - Original data
     * @param {module:model/data/rowList} dataModel - Data model
     * @param {module:model/data/columnModel} columnModel - Column model
     * @param {module:model/data/focusModel} focusModel - focus model
     * @param {Number} rowHeight - The height of a row
     * @returns {Array} - Converted data
     * @private
     */
    _formatData: function(data, dataModel, columnModel, focusModel) {
        var rowKey = data.rowKey,
            columnData, row;

        if (_.isUndefined(rowKey)) {
            return data;
        }

        row = dataModel.get(rowKey);
        columnData = _.omit(data, 'rowKey', '_extraData', 'height');

        _.each(columnData, function(value, columnName) {
            var rowSpanData = this._getRowSpanData(columnName, data, dataModel.isRowSpanEnable()),
                cellState = row.getCellState(columnName),
                isTextType = columnModel.isTextType(columnName),
                column = columnModel.getColumnModel(columnName);

            data[columnName] = {
                rowKey: rowKey,
                columnName: columnName,
                rowSpan: rowSpanData.count,
                isMainRow: rowSpanData.isMainRow,
                mainRowKey: rowSpanData.mainRowKey,
                isEditable: cellState.isEditable,
                isDisabled: cellState.isDisabled,
                isEditing: focusModel.isEditingCell(rowKey, columnName),
                isFocused: focusModel.isCurrentCell(rowKey, columnName),
                optionList: tui.util.pick(column, 'editOption', 'list'),
                className: this._getClassNameString(columnName, row, focusModel),
                columnModel: column,
                changed: [] //changed property names
            };
            _.assign(data[columnName], this._getValueAttrs(value, row, column, isTextType));
        }, this);

        return data;
    },

    /**
     * Returns the class name string of the a cell.
     * @param {String} columnName - column name
     * @param {module:model/data/row} [row] - data model of a row
     * @param {module:model/focus} [focusModel] - focus model
     * @returns {String}
     */
    _getClassNameString: function(columnName, row, focusModel) {
        var classNames;

        if (!row) {
            row = this.dataModel.get(this.get('rowKey'));
        }
        if (!focusModel) {
            focusModel = this.focusModel;
        }
        classNames = row.getClassNameList(columnName);

        if (focusModel.isCurrentCell(row.get('rowKey'), columnName, true)) {
            classNames.push('focused');
        }

        return classNames.join(' ');
    },

    /**
     * Returns the values of the attributes related to the cell value.
     * @param {String|Number} value - Value
     * @param {module:model/data/row} row - Row data model
     * @param {Object} column - Column model object
     * @param {Boolean} isTextType - True if the cell is the text-type
     * @returns {Object}
     * @private
     */
    _getValueAttrs: function(value, row, column, isTextType) {
        var beforeContent = tui.util.pick(column, 'editOption', 'beforeContent'),
            afterContent = tui.util.pick(column, 'editOption', 'afterContent'),
            converter = tui.util.pick(column, 'editOption', 'converter'),
            rowAttrs = row.toJSON();

        return {
            value: this._getValueToDisplay(value, column, isTextType),
            formattedValue: this._getFormattedValue(value, rowAttrs, column),
            beforeContent: this._getExtraContent(beforeContent, value, rowAttrs),
            afterContent: this._getExtraContent(afterContent, value, rowAttrs),
            convertedHTML: this._getConvertedHTML(converter, value, rowAttrs)
        };
    },

    /**
     * If the column has a 'formatter' function, exeucute it and returns the result.
     * @param {String} value - value to display
     * @param {Object} rowAttrs - All attributes of the row
     * @param {Object} column - Column info
     * @returns {String}
     * @private
     */
    _getFormattedValue: function(value, rowAttrs, column) {
        var result = value || '';

        if (_.isFunction(column.formatter)) {
            result = column.formatter(result, rowAttrs, column);
        }

        return result;
    },

    /**
     * Returns the value of the 'beforeContent' or 'afterContent'.
     * @param {(String|Function)} content - content
     * @param {String} cellValue - cell value
     * @param {Object} rowAttrs - All attributes of the row
     * @returns {string}
     * @private
     */
    _getExtraContent: function(content, cellValue, rowAttrs) {
        var result = '';

        if (_.isFunction(content)) {
            result = content(cellValue, rowAttrs);
        } else if (tui.util.isExisty(content)) {
            result = content;
        }

        return result;
    },

    /**
     * If the 'converter' function exist, execute it and returns the result.
     * @param {Function} converter - converter
     * @param {String} cellValue - cell value
     * @param {Object} rowAttrs - All attributes of the row
     * @returns {(String|Null)} - HTML string or Null
     * @private
     */
    _getConvertedHTML: function(converter, cellValue, rowAttrs) {
        var convertedHTML = null;

        if (_.isFunction(converter)) {
            convertedHTML = converter(cellValue, rowAttrs);
        }
        if (convertedHTML === false) {
            convertedHTML = null;
        }
        return convertedHTML;
    },

    /**
     * Returns the value to display
     * @param {String|Number} value - value
     * @param {String} column - column name
     * @param {Boolean} isTextType - True if the cell is the text-typee
     * @returns {String}
     * @private
     */
    _getValueToDisplay: function(value, column, isTextType) {
        var isExisty = tui.util.isExisty,
            notUseHtmlEntity = column.notUseHtmlEntity,
            defaultValue = column.defaultValue;

        if (!isExisty(value)) {
            value = isExisty(defaultValue) ? defaultValue : '';
        }

        if (isTextType && !notUseHtmlEntity && tui.util.hasEncodableString(value)) {
            value = tui.util.encodeHTMLEntity(value);
        }

        return value;
    },

    /**
     * Returns the rowspan data.
     * @param {String} columnName - column name
     * @param {Object} data - data
     * @param {Boolean} isRowSpanEnable - Whether the rowspan enable
     * @returns {Object} rowSpanData
     * @private
     */
    _getRowSpanData: function(columnName, data, isRowSpanEnable) {
        var rowSpanData = tui.util.pick(data, '_extraData', 'rowSpanData', columnName);

        if (!isRowSpanEnable || !rowSpanData) {
            rowSpanData = {
                mainRowKey: data.rowKey,
                count: 0,
                isMainRow: true
            };
        }
        return rowSpanData;
    },

    /**
     * Updates the className attribute of the cell identified by a given column name.
     * @param {String} columnName - column name
     */
    updateClassName: function(columnName) {
        this.setCell(columnName, {
            className: this._getClassNameString(columnName)
        });
    },

    /**
     * Sets the cell data.
     * (Each cell data is reference type, so do not change the cell data directly and
     *  use this method to trigger change event)
     * @param {String} columnName - Column name
     * @param {Object} param - Key-Value pair of the data to change
     */
    setCell: function(columnName, param) {
        var isValueChanged = false,
            changed = [],
            rowIndex, rowKey, data;

        if (!this.has(columnName)) {
            return;
        }

        rowKey = this.get('rowKey');
        data = _.clone(this.get(columnName));

        _.each(param, function(changeValue, name) {
            if (!util.isEqual(data[name], changeValue)) {
                isValueChanged = (name === 'value') ? true : isValueChanged;
                data[name] = changeValue;
                changed.push(name);
            }
        }, this);

        if (changed.length) {
            data.changed = changed;
            this.set(columnName, data, {
                silent: this._shouldSetSilently(data, isValueChanged)
            });
            if (isValueChanged && !data.isEditing) {
                rowIndex = this.collection.dataModel.indexOfRowKey(rowKey);
                this.trigger('valueChange', rowIndex);
            }
        }
    },

    /**
     * Returns whether the 'set' method should be called silently.
     * @param {Object} cellData - cell data
     * @param {Boolean} valueChanged - true if value changed
     * @returns {Boolean}
     * @private
     */
    _shouldSetSilently: function(cellData, valueChanged) {
        var valueChangedOnEditing = cellData.isEditing && valueChanged;
        var useViewMode = tui.util.pick(cellData, 'columnModel', 'editOption', 'useViewMode') !== false;
        var editingStarted = _.contains(cellData.changed, 'isEditing') && cellData.isEditing;

        return valueChangedOnEditing || (useViewMode && editingStarted);
    }
});

module.exports = Row;

},{"../base/model":5,"../common/util":11}],24:[function(require,module,exports){
/**
 * @fileoverview RowList 클래스파일
 * @author NHN Ent. FE Development Team
 */
'use strict';

var Collection = require('../base/collection');
var Row = require('./row');

/**
  * View Model rowList collection
  * @module model/rowList
  * @extends module:base/collection
  */
var RowList = Collection.extend(/**@lends module:model/rowList.prototype */{
    /**
     * @constructs
     * @param {Object} rawData - Raw data
     * @param {Object} options - Options
     */
    initialize: function(rawData, options) {
        this.setOwnProperties({
            dataModel: options.dataModel,
            columnModel: options.columnModel,
            focusModel: options.focusModel
        });
    },

    model: Row
});

module.exports = RowList;

},{"../base/collection":3,"./row":23}],25:[function(require,module,exports){
/**
 * @fileoverview Selection Model class
 * @author NHN Ent. FE Development Team
 */
'use strict';

var Model = require('../base/model'),
    util = require('../common/util');

/**
 * @ignore
 * @const
 * @type {{cell: string, row: string, column: string}}
 * @desc
 * Selection states
 */
var SELECTION_STATE = {
    cell: 'cell',
    row: 'row',
    column: 'column'
};

/**
 * Selection Model class
 * @module model/selection
 * @extends module:base/view
 */
var Selection = Model.extend(/**@lends module:model/selection.prototype */{
    /**
     * @constructs
     * @param {Object} attr - Attributes
     * @param {Object} options - Options
     */
    initialize: function(attr, options) {
        Model.prototype.initialize.apply(this, arguments);

        this.setOwnProperties({
            dataModel: options.dataModel,
            columnModel: options.columnModel,
            dimensionModel: options.dimensionModel,
            focusModel: options.focusModel,
            renderModel: options.renderModel,

            inputRange: null,
            intervalIdForAutoScroll: null,
            scrollPixelScale: 40,
            _isEnabled: true,
            _selectionState: SELECTION_STATE.cell
        });

        this.listenTo(this.dataModel, 'add remove sort reset', this.end);
        this.listenTo(this.dataModel, 'paste', this._onPasteData);
    },

    defaults: {
        /**
         * Selection range
         * ex) {row: [0, 1], column: [1, 2]}
         * @type {{row: array, column: array}}
         */
        range: null
    },

    /**
     * Event handler for 'paste' event on DataModel
     * @param {Object} range - Range
     */
    _onPasteData: function(range) {
        this.start(range.startIdx.row, range.startIdx.column);
        this.update(range.endIdx.row, range.endIdx.column);
    },

    /**
     * Set selection state
     * @param {string} state - Selection state (cell, row, column)
     */
    setState: function(state) {
        this._selectionState = SELECTION_STATE[state] || this._selectionState;
    },

    /**
     * Return the selection state
     * @returns {string} state - Selection state (cell, row, column)
     */
    getState: function() {
        return this._selectionState;
    },

    /**
     * Enables the selection.
     */
    enable: function() {
        this._isEnabled = true;
    },

    /**
     * Disables the selection.
     */
    disable: function() {
        this.end();
        this._isEnabled = false;
    },

    /**
     * Returns whether the selection is enabled.
     * @returns {boolean} True if the selection is enabled.
     */
    isEnabled: function() {
        return this._isEnabled;
    },

    /**
     * Starts the selection.
     * @param {Number} rowIndex - Row index
     * @param {Number} columnIndex - Column index
     * @param {string} state - Selection state강지
     */
    start: function(rowIndex, columnIndex, state) {
        if (!this._isEnabled) {
            return;
        }
        this.setState(state);
        this.inputRange = {
            row: [rowIndex, rowIndex],
            column: [columnIndex, columnIndex]
        };
        this._resetRangeAttribute();
    },

    /**
     * Starts the selection by mouse position.
     * @param {number} pageX - X position relative to the document
     * @param {number} pageY - Y position relative to the document
     * @param {string} state - Selection state
     */
    startByMousePosition: function(pageX, pageY, state) {
        var index = this.dimensionModel.getIndexFromMousePosition(pageX, pageY);
        this.start(index.row, index.column, state);
    },

    /**
     * Updates the selection range.
     * @param {number} rowIndex - Row index
     * @param {number} columnIndex - Column index
     * @param {string} [state] - Selection state
     */
    update: function(rowIndex, columnIndex, state) {
        var focusedIndex;

        if (!this._isEnabled || rowIndex < 0 || columnIndex < 0) {
            return;
        }

        if (!this.hasSelection()) {
            focusedIndex = this.focusModel.indexOf();
            this.start(focusedIndex.row, focusedIndex.column, state);
        } else {
            this.setState(state);
        }

        this._updateInputRange(rowIndex, columnIndex);
        this._resetRangeAttribute();
    },

    /**
     * Update input range (end range, not start range)
     * @param {number} rowIndex - Row index
     * @param {number} columnIndex - Column index
     * @private
     */
    _updateInputRange: function(rowIndex, columnIndex) {
        var inputRange = this.inputRange;

        inputRange.row[1] = rowIndex;
        inputRange.column[1] = columnIndex;
    },

    /**
     * Extend column selection
     * @param {undefined|Array} columnIndexes - Column indexes
     * @param {number} pageX - Mouse position X
     * @param {number} pageY - Mouse positino Y
     */
    extendColumnSelection: function(columnIndexes, pageX, pageY) {
        var minimumColumnRange = this._minimumColumnRange,
            index = this.dimensionModel.getIndexFromMousePosition(pageX, pageY),
            range = {
                row: [0, 0],
                column: []
            },
            minMax;

        if (!columnIndexes || !columnIndexes.length) {
            columnIndexes = [index.column];
        }

        this._setScrolling(pageX, pageY);
        if (minimumColumnRange) {
            minMax = util.getMinMax(columnIndexes.concat(minimumColumnRange));
        } else {
            columnIndexes.push(this.inputRange.column[0]);
            minMax = util.getMinMax(columnIndexes);
        }
        range.column.push(minMax.min, minMax.max);
        this._resetRangeAttribute(range);
    },

    /**
     * Set auto scrolling for selection
     * @param {number} pageX - Mouse position X
     * @param {number} pageY - Mouse positino Y
     * @private
     */
    _setScrolling: function(pageX, pageY) {
        var overflow = this.dimensionModel.getOverflowFromMousePosition(pageX, pageY);

        this.stopAutoScroll();
        if (this._isAutoScrollable(overflow.x, overflow.y)) {
            this.intervalIdForAutoScroll = setInterval(
                _.bind(this._adjustScroll, this, overflow.x, overflow.y)
            );
        }
    },

    /**
     * Updates the selection range by mouse position.
     * @param {number} pageX - X position relative to the document
     * @param {number} pageY - Y position relative to the document
     * @param {string} [state] - Selection state
     */
    updateByMousePosition: function(pageX, pageY, state) {
        var index = this.dimensionModel.getIndexFromMousePosition(pageX, pageY);

        this._setScrolling(pageX, pageY);
        this.update(index.row, index.column, state);
    },

    /**
     * selection 영역 선택을 종료하고 selection 데이터를 초기화한다.
     */
    end: function() {
        this.inputRange = null;
        this.unset('range');
        this.unsetMinimumColumnRange();
    },

    /**
     * Stops the auto-scroll interval.
     */
    stopAutoScroll: function() {
        if (!_.isNull(this.intervalIdForAutoScroll)) {
            clearInterval(this.intervalIdForAutoScroll);
            this.intervalIdForAutoScroll = null;
        }
    },

    /**
     * Select all data in a row
     * @param {Number} rowIndex - Row idnex
     */
    selectRow: function(rowIndex) {
        if (this._isEnabled) {
            this.focusModel.focusAt(rowIndex, 0);
            this.start(rowIndex, 0, SELECTION_STATE.row);
            this.update(rowIndex, this.columnModel.getVisibleColumnModelList().length - 1);
        }
    },

    /**
     * Select all data in a column
     * @param {Number} columnIdx - Column index
     */
    selectColumn: function(columnIdx) {
        if (this._isEnabled) {
            this.focusModel.focusAt(0, columnIdx);
            this.start(0, columnIdx, SELECTION_STATE.column);
            this.update(this.dataModel.length - 1, columnIdx);
        }
    },

    /**
     * Selects all data range.
     */
    selectAll: function() {
        if (this._isEnabled) {
            this.start(0, 0, SELECTION_STATE.cell);
            this.update(this.dataModel.length - 1, this.columnModel.getVisibleColumnModelList().length - 1);
        }
    },

    /**
     * Returns the row and column indexes of the starting position.
     * @returns {{row: number, column: number}} Objects containing indexes
     */
    getStartIndex: function() {
        var range = this.get('range');
        return {
            row: range.row[0],
            column: range.column[0]
        };
    },

    /**
     * Returns the row and column indexes of the ending position.
     * @returns {{row: number, column: number}} Objects containing indexes
     */
    getEndIndex: function() {
        var range = this.get('range');
        return {
            row: range.row[1],
            column: range.column[1]
        };
    },

    /**
     * selection 데이터가 존재하는지 확인한다.
     * @returns {boolean} selection 데이터 존재여부
     */
    hasSelection: function() {
        return !!this.get('range');
    },

    /**
     * Returns whether given range is a single cell. (include merged cell)
     * @param {Array.<String>} columnNameList - columnNameList
     * @param {Array.<Object>} rowList - rowList
     * @returns {Boolean}
     */
    _isSingleCell: function(columnNameList, rowList) {
        var isSingleColumn = columnNameList.length === 1,
            isSingleRow = rowList.length === 1,
            isSingleMergedCell = isSingleColumn && !isSingleRow &&
                (rowList[0].getRowSpanData(columnNameList[0]).count === rowList.length);

        return (isSingleColumn && isSingleRow) || isSingleMergedCell;
    },

    /**
     * Returns the string value of all cells in the selection range as a single string.
     * @returns {String} string of values
     */
    getValuesToString: function() {
        var range = this.get('range'),
            columnModelList, rowList, columnNameList, rowValues;

        columnModelList = this.columnModel.getVisibleColumnModelList().slice(range.column[0], range.column[1] + 1);
        rowList = this.dataModel.slice(range.row[0], range.row[1] + 1);

        columnNameList = _.pluck(columnModelList, 'columnName');
        rowValues = _.map(rowList, function(row) {
            var tmpString = _.map(columnNameList, function(columnName) {
                return row.getValueString(columnName);
            });
            return tmpString.join('\t');
        });

        if (this._isSingleCell(columnNameList, rowList)) {
            return rowValues[0];
        }
        return rowValues.join('\n');
    },

    /**
     * 마우스 드래그로 selection 선택 시 auto scroll 조건에 해당하는지 반환한다.
     * @param {Number} overflowX    가로축 기준 영역 overflow 값
     * @param {Number} overflowY    세로축 기준 영역 overflow 값
     * @returns {boolean} overflow 되었는지 여부
     * @private
     */
    _isAutoScrollable: function(overflowX, overflowY) {
        return !(overflowX === 0 && overflowY === 0);
    },

    /**
     * Adjusts scrollTop and scrollLeft value.
     * @param {Number} overflowX    가로축 기준 영역 overflow 값
     * @param {Number} overflowY    세로축 기준 영역 overflow 값
     * @private
     */
    _adjustScroll: function(overflowX, overflowY) {
        var renderModel = this.renderModel;

        if (overflowX) {
            this._adjustScrollLeft(overflowX, renderModel.get('scrollLeft'), renderModel.get('maxScrollLeft'));
        }
        if (overflowY) {
            this._adjustScrollTop(overflowY, renderModel.get('scrollTop'), renderModel.get('maxScrollTop'));
        }
    },

    /**
     * Adjusts scrollLeft value.
     * @param  {number} overflowX - 1 | 0 | -1
     * @param  {number} scrollLeft - Current scrollLeft value
     * @param  {number} maxScrollLeft - Max scrollLeft value
     * @private
     */
    _adjustScrollLeft: function(overflowX, scrollLeft, maxScrollLeft) {
        var adjusted = scrollLeft,
            pixelScale = this.scrollPixelScale;

        if (overflowX < 0) {
            adjusted = Math.max(0, scrollLeft - pixelScale);
        } else if (overflowX > 0) {
            adjusted = Math.min(maxScrollLeft, scrollLeft + pixelScale);
        }
        this.renderModel.set('scrollLeft', adjusted);
    },

    /**
     * Adjusts scrollTop value.
     * @param  {number} overflowY - 1 | 0 | -1
     * @param  {number} scrollTop - Current scrollTop value
     * @param  {number} maxScrollTop - Max scrollTop value
     * @private
     */
    _adjustScrollTop: function(overflowY, scrollTop, maxScrollTop) {
        var adjusted = scrollTop,
            pixelScale = this.scrollPixelScale;

        if (overflowY < 0) {
            adjusted = Math.max(0, scrollTop - pixelScale);
        } else if (overflowY > 0) {
            adjusted = Math.min(maxScrollTop, scrollTop + pixelScale);
        }
        this.renderModel.set('scrollTop', adjusted);
    },

    /**
     * Expands the 'this.inputRange' if rowspan data exists, and resets the 'range' attributes to the value.
     * @param {{column: number[], row: number[]}} [inputRange] - Input range. Default is this.inputRange
     * @private
     */
    _resetRangeAttribute: function(inputRange) {
        var dataModel = this.dataModel,
            hasSpannedRange, spannedRange, tmpRowRange;

        inputRange = inputRange || this.inputRange;
        if (!inputRange) {
            this.set('range', null);
            return;
        }

        spannedRange = {
            row: _.sortBy(inputRange.row),
            column: _.sortBy(inputRange.column)
        };

        if (dataModel.isRowSpanEnable()) {
            do {
                tmpRowRange = _.assign([], spannedRange.row);
                spannedRange = this._getRowSpannedIndex(spannedRange);

                hasSpannedRange = (
                    spannedRange.row[0] !== tmpRowRange[0] ||
                    spannedRange.row[1] !== tmpRowRange[1]
                );
            } while (hasSpannedRange);
        }

        this._setRangeMinMax(spannedRange.row, spannedRange.column);
        switch (this._selectionState) {
            case SELECTION_STATE.column:
                spannedRange.row = [0, dataModel.length - 1];
                break;
            case SELECTION_STATE.row:
                spannedRange.column = [0, this.columnModel.getVisibleColumnModelList().length - 1];
                break;
            case SELECTION_STATE.cell:
            default:
                break;
        }

        this.set('range', spannedRange);
    },

    /**
     * Set minimum column range
     * @param {Array} range - Minimum column range
     */
    setMinimumColumnRange: function(range) {
        this._minimumColumnRange = _.extend(range);
    },

    /**
     * Unset minimum column range
     */
    unsetMinimumColumnRange: function() {
        this._minimumColumnRange = null;
    },

    /**
     * Set min, max value of range(row, column)
     * @param {Array} rowRange - Row range
     * @param {Array} columnRange - Column range
     * @private
     */
    _setRangeMinMax: function(rowRange, columnRange) {
        if (rowRange) {
            rowRange[0] = Math.max(0, rowRange[0]);
            rowRange[1] = Math.min(this.dataModel.length - 1, rowRange[1]);
        }

        if (columnRange) {
            columnRange[0] = Math.max(0, columnRange[0]);
            columnRange[1] = Math.min(this.columnModel.getVisibleColumnModelList().length - 1, columnRange[1]);
        }
    },

    /**
     * row start index 기준으로 rowspan 을 확인하며 startRangeList 업데이트 하는 함수
     * @param {object} param - parameters
     * @private
     */
    _concatRowSpanIndexFromStart: function(param) {
        var startIndex = param.startIndex,
            endIndex = param.endIndex,
            columnName = param.columnName,
            rowSpanData = param.startRowSpanDataMap && param.startRowSpanDataMap[columnName],
            startIndexList = param.startIndexList,
            endIndexList = param.endIndexList,
            spannedIndex;

        if (!rowSpanData) {
            return;
        }

        if (!rowSpanData.isMainRow) {
            spannedIndex = startIndex + rowSpanData.count;
            startIndexList.push(spannedIndex);
        } else {
            spannedIndex = startIndex + rowSpanData.count - 1;
            if (spannedIndex > endIndex) {
                endIndexList.push(spannedIndex);
            }
        }
    },

    /**
     * row end index 기준으로 rowspan 을 확인하며 endRangeList 를 업데이트 하는 함수
     * @param {object} param - parameters
     * @private
     */
    _concatRowSpanIndexFromEnd: function(param) {
        var endIndex = param.endIndex,
            columnName = param.columnName,
            rowSpanData = param.endRowSpanDataMap && param.endRowSpanDataMap[columnName],
            endIndexList = param.endIndexList,
            dataModel = param.dataModel,
            spannedIndex, tmpRowSpanData;

        if (!rowSpanData) {
            return;
        }

        if (!rowSpanData.isMainRow) {
            spannedIndex = endIndex + rowSpanData.count;
            tmpRowSpanData = dataModel.at(spannedIndex).getRowSpanData(columnName);
            spannedIndex += tmpRowSpanData.count - 1;
            if (spannedIndex > endIndex) {
                endIndexList.push(spannedIndex);
            }
        } else {
            spannedIndex = endIndex + rowSpanData.count - 1;
            endIndexList.push(spannedIndex);
        }
    },

    /**
     * rowSpan 된 Index range 를 반환한다.
     * @param {{row: Array, column: Array}} spannedRange 인덱스 정보
     * @returns {{row: Array, column: Array}} New Range
     * @private
     */
    _getRowSpannedIndex: function(spannedRange) {
        var columnModelList = this.columnModel.getVisibleColumnModelList()
                .slice(spannedRange.column[0], spannedRange.column[1] + 1),
            dataModel = this.dataModel,
            startIndexList = [spannedRange.row[0]],
            endIndexList = [spannedRange.row[1]],
            startRow = dataModel.at(spannedRange.row[0]),
            endRow = dataModel.at(spannedRange.row[1]),
            newSpannedRange = $.extend({}, spannedRange),
            startRowSpanDataMap, endRowSpanDataMap, columnName, param;

        if (!startRow || !endRow) {
            return newSpannedRange;
        }

        startRowSpanDataMap = dataModel.at(spannedRange.row[0]).getRowSpanData();
        endRowSpanDataMap = dataModel.at(spannedRange.row[1]).getRowSpanData();

        //모든 열을 순회하며 각 열마다 설정된 rowSpan 정보에 따라 인덱스를 업데이트 한다.
        _.each(columnModelList, function(columnModel) {
            columnName = columnModel.columnName;
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
            this._concatRowSpanIndexFromStart(param);
            this._concatRowSpanIndexFromEnd(param);
        }, this);

        newSpannedRange.row = [Math.min.apply(null, startIndexList), Math.max.apply(null, endIndexList)];
        return newSpannedRange;
    }
});

module.exports = Selection;

},{"../base/model":5,"../common/util":11}],26:[function(require,module,exports){
/**
 * @fileoverview Toolbar model class
 * @author NHN Ent. FE Development Team
 */
'use strict';

var Model = require('../base/model');


/**
 * Toolbar Model
 * @module model/toolbar
 * @extends module:base/model
 */
var Toolbar = Model.extend(/**@lends module:model/toolbar.prototype */{
    defaults: {
        // set by user
        hasControlPanel: false,
        hasPagination: false,
        hasResizeHandler: false,

        // for control panel
        isExcelButtonVisible: false,
        isExcelAllButtonVisible: false,

        // tui.component.pagination
        pagination: null
    },

    /**
     * Returns whether the toolbar is visible
     * @returns {Boolean} True if the toolbar is visible
     */
    isVisible: function() {
        return this.get('hasControlPanel') || this.get('hasPagination') || this.get('hasResizeHandler');
    }
});

module.exports = Toolbar;

},{"../base/model":5}],27:[function(require,module,exports){
/**
 * @fileoverview Painter class for cell(TD) views
 * @author NHN Ent. FE Development Team
 */
'use strict';

var Painter = require('../base/painter');
var util = require('../common/util');

/**
 * Painter class for cell(TD) views
 * @module painter/cell
 * @extends module:base/painter
 */
var Cell = tui.util.defineClass(Painter, /**@lends module:painter/cell.prototype */{
    /**
     * @constructs
     * @param {Object} options - options
     */
    init: function(options) {
        Painter.apply(this, arguments);

        this.editType = options.editType;
        this.inputPainter = options.inputPainter;
        this.selector = 'td[edit-type=' + this.editType + ']';
    },

    /**
     * key-value object contains event names as keys and handler names as values
     * @type {Object}
     */
    events: {
        dblclick: '_onDblClick'
    },

    /**
     * Markup template
     * @returns {string} template
     */
    template: _.template(
        '<td <%=attributeString%>><%=contentHtml%></td>'
    ),

    /**
     * Event handler for 'dblclick' DOM event.
     * @param {MouseEvent} event - mouse event object
     */
    _onDblClick: function(event) {
        var address;

        if (this._isEditableType()) {
            address = this._getCellAddress($(event.target));
            this.controller.startEditing(address, true);
        }
    },

    /**
     * Returns whether the instance is editable type.
     * @returns {Boolean}
     */
    _isEditableType: function() {
        return !_.contains(['normal', 'mainButton'], this.editType);
    },

    /**
     * Returns the HTML string of the contents containg the value of the 'beforeContent' and 'afterContent'.
     * @param {Object} cellData - cell data
     * @returns {String}
     * @private
     */
    _getContentHtml: function(cellData) {
        var content = cellData.formattedValue,
            beforeContent = cellData.beforeContent,
            afterContent = cellData.afterContent;

        if (this.inputPainter) {
            content = this.inputPainter.generateHtml(cellData);

            if (this._shouldContentBeWrapped() && !this._isUsingViewMode(cellData)) {
                beforeContent = this._getSpanWrapContent(beforeContent, 'before');
                afterContent = this._getSpanWrapContent(afterContent, 'after');
                content = this._getSpanWrapContent(content, 'input');

                return beforeContent + afterContent + content;
            }
        }

        return beforeContent + content + afterContent;
    },

    /**
     * Returns whether the cell has view mode.
     * @param {Object} cellData - cell data
     * @returns {Boolean}
     * @private
     */
    _isUsingViewMode: function(cellData) {
        return tui.util.pick(cellData, 'columnModel', 'editOption', 'useViewMode') !== false;
    },

    /**
     * Returns whether the contents should be wrapped with span tags to display them correctly.
     * @returns {Boolean}
     * @private
     */
    _shouldContentBeWrapped: function() {
        return _.contains(['text', 'password', 'select'], this.editType);
    },

    /**
     * 주어진 문자열을 span 태그로 감싼 HTML 코드를 반환한다.
     * @param {string} content - 감싸질 문자열
     * @param {string} className - span 태그의 클래스명
     * @returns {string} span 태그로 감싼 HTML 코드
     * @private
     */
    _getSpanWrapContent: function(content, className) {
        if (tui.util.isFalsy(content)) {
            content = '';
        }

        return '<span class="' + className + '">' + content + '</span>';
    },

    /**
     * Returns the object contains attributes of a TD element.
     * @param {Object} cellData - cell data
     * @returns {Object}
     * @private
     */
    _getAttributes: function(cellData) {
        return {
            'class': cellData.className + ' cell_content',
            'edit-type': this.editType,
            'data-row-key': cellData.rowKey,
            'data-column-name': cellData.columnName,
            'rowspan': cellData.rowSpan || '',
            'align': cellData.columnModel.align || 'left'
        };
    },

    /**
     * Attaches all event handlers to the $target element.
     * @param {jquery} $target - target element
     * @param {String} parentSelector - selector of a parent element
     * @override
     */
    attachEventHandlers: function($target, parentSelector) {
        Painter.prototype.attachEventHandlers.call(this, $target, parentSelector);

        if (this.inputPainter) {
            this.inputPainter.attachEventHandlers($target, parentSelector + ' ' + this.selector);
        }
    },

    /**
     * Generates a HTML string from given data, and returns it.
     * @param {object} cellData - cell data
     * @returns {string} HTML string of the cell (TD)
     * @implements {module:base/painter}
     */
    generateHtml: function(cellData) {
        var attributeString = util.getAttributesString(this._getAttributes(cellData)),
            contentHtml = this._getContentHtml(cellData);

        return this.template({
            attributeString: attributeString,
            contentHtml: contentHtml || '&#8203;' // '&#8203;' for height issue with empty cell in IE7
        });
    },

    /**
     * Refreshes the cell(td) element.
     * @param {object} cellData - cell data
     * @param {jQuery} $td - cell element
     */
    refresh: function(cellData, $td) {
        var contentProps = ['value', 'isEditing', 'isDisabled'];
        var isEditingChanged = _.contains(cellData.changed, 'isEditing');
        var shouldUpdateContent = _.intersection(contentProps, cellData.changed).length > 0;
        var attrs = this._getAttributes(cellData);

        delete attrs.rowspan; // prevent error in IE7 (cannot update rowspan attribute)
        $td.attr(attrs);

        if (isEditingChanged && cellData.isEditing && !this._isUsingViewMode(cellData)) {
            this.inputPainter.focus($td);
        } else if (shouldUpdateContent) {
            $td.html(this._getContentHtml(cellData));
            $td.scrollLeft(0);
        }
    }
});

module.exports = Cell;

},{"../base/painter":6,"../common/util":11}],28:[function(require,module,exports){
/**
 * @fileoverview Controller class to handle actions from the painters
 * @author NHN Ent. FE Development Team
 */
'use strict';

/**
 * Controller class to handle actions from the painters
 * @module painter/controller
 */
var PainterController = tui.util.defineClass(/**@lends module:painter/controller.prototype */{
    /**
     * @constructs
     * @param {Object} options - options
     */
    init: function(options) {
        this.focusModel = options.focusModel;
        this.dataModel = options.dataModel;
        this.columnModel = options.columnModel;
        this.selectionModel = options.selectionModel;
    },

    /**
     * Starts editing a cell identified by a given address, and returns the result.
     * @param {{rowKey:String, columnName:String}} address - cell address
     * @param {Boolean} force - if set to true, finish current editing before start.
     * @returns {Boolean} true if succeeded, false otherwise
     */
    startEditing: function(address, force) {
        var result;

        if (force) {
            this.focusModel.finishEditing();
        }

        result = this.focusModel.startEditing(address.rowKey, address.columnName);

        if (result) {
            this.selectionModel.end();
        }

        return result;
    },

    /**
     * Ends editing a cell identified by a given address, and returns the result.
     * @param {{rowKey:String, columnName:String}} address - cell address
     * @param {Boolean} shouldBlur - if set to true, make the current input lose focus.
     * @param {String} [value] - if not undefined, set the value of the data model to this value.
     * @returns {Boolean} - true if succeeded, false otherwise
     */
    finishEditing: function(address, shouldBlur, value) {
        var focusModel = this.focusModel;

        if (!focusModel.isEditingCell(address.rowKey, address.columnName)) {
            return false;
        }

        this.selectionModel.enable();

        if (!_.isUndefined(value)) {
            this.setValue(address, value);
            this.dataModel.get(address.rowKey).validateCell(address.columnName);
        }
        focusModel.finishEditing();

        if (shouldBlur) {
            focusModel.focusClipboard();
        } else {
            _.defer(function() {
                focusModel.refreshState();
            });
        }

        return true;
    },

    /**
     * Moves focus to the next cell, and starts editing the cell.
     * @param {Boolean} reverse - if set to true, find the previous cell instead of next cell
     */
    focusInToNextCell: function(reverse) {
        var focusModel = this.focusModel,
            rowKey = focusModel.get('rowKey'),
            columnName = focusModel.get('columnName'),
            nextColumnName = reverse ? focusModel.prevColumnName() : focusModel.nextColumnName();

        if (columnName !== nextColumnName) {
            focusModel.focusIn(rowKey, nextColumnName, true);
        }
    },

    /**
     * Executes the custom handler (defined by user) of the input events.
     * @param {Event} event - DOM Event object
     * @param {{rowKey:String, columnName:String}} address - cell address
     */
    executeCustomInputEventHandler: function(event, address) {
        var columnModel = this.columnModel.getColumnModel(address.columnName),
            eventType = event.type,
            eventHandler;

        if (eventType === 'focusin') {
            eventType = 'focus';
        } else if (eventType === 'focusout') {
            eventType = 'blur';
        }

        eventHandler = tui.util.pick(columnModel, 'editOption', 'inputEvents', eventType);

        if (_.isFunction(eventHandler)) {
            eventHandler.call(event.target, event, address);
        }
    },

    /**
     * Appends an empty row and moves focus to the first cell of the row.
     */
    appendEmptyRowAndFocus: function() {
        this.dataModel.append({}, {
            focus: true
        });
    },

    /**
     * Sets the value of the given cell.
     * @param {{rowKey:String, columnName:String}} address - cell address
     * @param {(Number|String|Boolean)} value - value
     */
    setValue: function(address, value) {
        this.dataModel.setValue(address.rowKey, address.columnName, value);
    }
});

module.exports = PainterController;

},{}],29:[function(require,module,exports){
/**
 * @fileoverview Dummy cell painter
 * @author NHN Ent. FE Development Team
 */
'use strict';

var Painter = require('../base/painter'),
    util = require('../common/util');

/**
 * Dummy Cell Painter
 * @module painter/dummyCell
 * @extends module:base/painter
 */
var DummyCell = tui.util.defineClass(Painter, /**@lends module:painter/dummyCell.prototype */{
    /**
     * @constructs
     */
    init: function() {
        Painter.apply(this, arguments);
    },

    /**
     * key-value object contains event names as keys and handler names as values
     * @type {Object}
     */
    events: {
        dblclick: '_onDblClick'
    },

    /**
     * css selector to find its own element(s) from a parent element.
     * @type {String}
     */
    selector: 'td[edit-type=dummy]',

    /**
     * Template function
     * @returns {String} HTML string
     */
    template: _.template(
        '<td data-column-name="<%=columnName%>" ' +
            'class="<%=className%>" ' +
            'edit-type="dummy">' +
            '&#8203;' + // 'for height issue with empty cell in IE7
        '</td>'
    ),

    /**
     * Event handler for 'dblclick' event
     * @private
     */
    _onDblClick: function() {
        this.controller.appendEmptyRowAndFocus(true);
    },

    /**
     * Generates a HTML string from given data, and returns it.
     * @param {String} columnName - column name
     * @returns {string} HTML string
     * @implements {module:base/painter}
     */
    generateHtml: function(columnName) {
        var isMeta = util.isMetaColumn(columnName);

        return this.template({
            columnName: columnName,
            className: (isMeta ? 'meta_column ' : '') + 'dummy'
        });
    }
});

module.exports = DummyCell;

},{"../base/painter":6,"../common/util":11}],30:[function(require,module,exports){
/**
 * @fileoverview Base class for the Input Painter
 * @author NHN Ent. FE Development Team
 */
'use strict';

var Painter = require('../../base/painter');
var keyNameMap = require('../../common/constMap').keyName;

/**
 * Input Painter Base
 * @module painter/input/base
 * @extends module:base/painter
 */
var InputPainter = tui.util.defineClass(Painter, /**@lends module:painter/input/base.prototype */{
    /**
     * @constructs
     * @param {Object} options - options
     */
    init: function() {
        Painter.apply(this, arguments);
    },

    /**
     * key-value object contains event names as keys and handler names as values
     * @type {Object}
     */
    events: {
        keydown: '_onKeyDown',
        focusin: '_onFocusIn',
        focusout: '_onFocusOut'
    },

    /**
     * keydown Actions
     * @type {Object}
     */
    keyDownActions: {
        ESC: function(param) {
            this.controller.finishEditing(param.address, true);
        },
        ENTER: function(param) {
            this.controller.finishEditing(param.address, true, param.value);
        },
        TAB: function(param) {
            this.controller.finishEditing(param.address, true, param.value);
            this.controller.focusInToNextCell(param.shiftKey);
        }
    },

    /**
     * Extends the default keydown actions.
     * @param {Object} actions - Object that contains the action functions
     * @private
     */
    _extendKeydownActions: function(actions) {
        this.keyDownActions = _.assign({}, this.keyDownActions, actions);
    },

    /**
     * Extends the default event object
     * @param {Object} events - Object that contains the names of event handlers
     */
    _extendEvents: function(events) {
        this.events = _.assign({}, this.events, events);
    },

    /**
     * Executes the custom handler (defined by user) of the input events.
     * @param {Event} event - DOM event object
     * @private
     */
    _executeCustomEventHandler: function(event) {
        var $input = $(event.target),
            address = this._getCellAddress($input);

        this.controller.executeCustomInputEventHandler(event, address);
    },

    /**
     * Event handler for the 'focus' event.
     * @param {Event} event - DOM event object
     * @private
     */
    _onFocusIn: function(event) {
        var address = this._getCellAddress($(event.target));

        this._executeCustomEventHandler(event);
        this.controller.startEditing(address);
    },

    /**
     * Event handler for the 'blur' event.
     * @param {Event} event - DOM event object
     * @private
     */
    _onFocusOut: function(event) {
        var $target = $(event.target),
            address = this._getCellAddress($target);

        this._executeCustomEventHandler(event);
        this.controller.finishEditing(address, false, $target.val());
    },

    /**
     * Event handler for the 'keydown' event.
     * @param  {KeyboardEvent} event - KeyboardEvent object
     * @private
     */
    _onKeyDown: function(event) {
        var keyCode = event.keyCode || event.which,
            keyName = keyNameMap[keyCode],
            action = this.keyDownActions[keyName],
            $target = $(event.target),
            param = {
                $target: $target,
                address: this._getCellAddress($target),
                shiftKey: event.shiftKey,
                value: $target.val()
            };

        this._executeCustomEventHandler(event);

        if (action) {
            action.call(this, param);
            event.preventDefault();
        }
    },

    /**
     * Returns the value string of given data to display in the cell.
     * @abstract
     * @protected
     */
    _getDisplayValue: function() {
        throw new Error('implement _getDisplayValue() method');
    },

    /**
     * Generates an input HTML string from given data, and returns it.
     * @abstract
     * @protected
     */
    _generateInputHtml: function() {
        throw new Error('implement _generateInputHtml() method');
    },

    /**
     * Returns whether the cell has view mode.
     * @param {Object} cellData - cell data
     * @returns {Boolean}
     * @private
     */
    _isUsingViewMode: function(cellData) {
        return tui.util.pick(cellData, 'columnModel', 'editOption', 'useViewMode') !== false;
    },

    /**
     * Generates a HTML string from given data, and returns it.
     * @param {Object} cellData - cell data
     * @returns {String}
     * @implements {module:painter/input/base}
     */
    generateHtml: function(cellData) {
        var result;

        if (!_.isNull(cellData.convertedHTML)) {
            result = cellData.convertedHTML;
        } else if (!this._isUsingViewMode(cellData) || cellData.isEditing) {
            result = this._generateInputHtml(cellData);
        } else {
            result = this._getDisplayValue(cellData);
        }

        return result;
    },

    /**
     * Finds an element from the given parent element with 'this.selector', and moves focus to it.
     * @param {jquery} $parent - parent element
     */
    focus: function($parent) {
        var $input = $parent.find(this.selector);

        if (!$input.is(':focus')) {
            $input.eq(0).focus();
        }
    }
});

module.exports = InputPainter;

},{"../../base/painter":6,"../../common/constMap":8}],31:[function(require,module,exports){
/**
 * @fileoverview Painter class for 'checkbox' and 'radio button'.
 * @author NHN Ent. FE Development Team
 */
'use strict';

var InputPainter = require('./base');
var util = require('../../common/util');

/**
 * Painter class for 'checkbox' and 'radio button'.
 * @module painter/input/button
 * @extends module:painter/input/base
 */
var ButtonPainter = tui.util.defineClass(InputPainter, /**@lends module:painter/input/button.prototype */{
    /**
     * @constructs
     * @param {Object} options - options
     */
    init: function(options) {
        InputPainter.apply(this, arguments);

        this.inputType = options.inputType;

        /**
         * css selector to use delegated event handlers by '$.on()' method.
         * @type {String}
         */
        this.selector = 'fieldset[data-type=' + this.inputType + ']';

        this._extendEvents({
            mousedown: '_onMouseDown'
        });

        this._extendKeydownActions({
            TAB: function(param) {
                var value;
                if (!this._focusNextInput(param.$target, param.shiftKey)) {
                    value = this._getCheckedValueString(param.$target);
                    this.controller.finishEditing(param.address, true, value);
                    this.controller.focusInToNextCell(param.shiftKey);
                }
            },
            ENTER: function(param) {
                var value = this._getCheckedValueString(param.$target);
                this.controller.finishEditing(param.address, true, value);
            },
            LEFT_ARROW: function(param) {
                this._focusNextInput(param.$target, true);
            },
            RIGHT_ARROW: function(param) {
                this._focusNextInput(param.$target);
            },
            UP_ARROW: function() {},
            DOWN_ARROW: function() {}
        });
    },

    /**
     * fieldset markup template
     * @returns {String}
     */
    template: _.template(
        '<fieldset data-type="<%=type%>"><%=content%></fieldset>'
    ),

    /**
     * Input markup template
     * @returns {String}
     */
    inputTemplate: _.template(
        '<input type="<%=type%>" data-value-type="<%=valueType%>" name="<%=name%>" id="<%=id%>" value="<%=value%>"' +
        ' <%=checked%> <%=disabled%> />'
    ),

    /**
     * Label markup template
     * @returns {String}
     */
    labelTemplate: _.template(
        '<label for="<%=id%>"><%=labelText%></label>'
    ),

    /**
     * Event handler for 'blur' event
     * @param {Event} event - event object
     * @override
     * @private
     */
    _onFocusOut: function(event) {
        var $target = $(event.target);
        var self = this;

        _.defer(function() {
            var address, value;

            if (!$target.siblings('input:focus').length) {
                address = self._getCellAddress($target);
                value = self._getCheckedValueString($target);
                self.controller.finishEditing(address, false, value);
            }
        });
    },

    /**
     * Event handler for 'mousedown' DOM event
     * @param {MouseEvent} event - mouse event object
     * @private
     */
    _onMouseDown: function(event) {
        var $target = $(event.target);
        var hasFocusedInput = $target.closest('fieldset').find('input:focus').length > 0;

        if (!$target.is('input') && hasFocusedInput) {
            event.stopPropagation();
            event.preventDefault();
        }
    },

    /**
     * Moves focus to the next input element.
     * @param {jquery} $target - target element
     * @param {Boolean} reverse - if set to true, find previous element instead of next element.
     * @returns {Boolean} - false if no element exist, true otherwise.
     * @private
     */
    _focusNextInput: function($target, reverse) {
        var traverseFuncName = reverse ? 'prevAll' : 'nextAll',
            $nextInputs = $target[traverseFuncName]('input');

        if ($nextInputs.length) {
            $nextInputs.first().focus();
            return true;
        }
        return false;
    },

    /**
     * Returns the comma seperated value of all checked inputs
     * @param {jQuery} $target - target element
     * @returns {String}
     * @private
     */
    _getCheckedValueString: function($target) {
        var $checkedInputs = $target.parent().find('input:checked');
        var checkedValues = [];
        var result;

        $checkedInputs.each(function() {
            var $input = $(this);
            var valueType = $input.attr('data-value-type');
            var value = util.convertValueType($input.val(), valueType);

            checkedValues.push(value);
        });

        if (checkedValues.length === 1) {
            result = checkedValues[0];
        } else {
            result = checkedValues.join(',');
        }

        return result;
    },

    /**
     * Returns the set object that contains the checked value.
     * @param {String} value - value
     * @returns {Object}
     * @private
     */
    _getCheckedValueSet: function(value) {
        var checkedMap = {};

        _.each(String(value).split(','), function(itemValue) {
            checkedMap[itemValue] = true;
        });

        return checkedMap;
    },

    /**
     * Returns the value string of given data to display in the cell.
     * @param {Object} cellData - cell data
     * @implements {module:painter/input/base}
     * @returns {String}
     * @protected
     */
    _getDisplayValue: function(cellData) {
        var checkedSet = this._getCheckedValueSet(cellData.value);
        var optionTexts = [];

        _.each(cellData.optionList, function(item) {
            if (checkedSet[item.value]) {
                optionTexts.push(item.text);
            }
        });

        return optionTexts.join(',');
    },

    /**
     * Generates an input HTML string from given data, and returns it.
     * @param {object} cellData - cell data
     * @implements {module:painter/input/base}
     * @returns {string}
     * @protected
     */
    _generateInputHtml: function(cellData) {
        var checkedSet = this._getCheckedValueSet(cellData.value);
        var name = util.getUniqueKey();
        var contentHtml = '';

        _.each(cellData.optionList, function(item) {
            var id = name + '_' + item.value;

            contentHtml += this.inputTemplate({
                type: this.inputType,
                id: id,
                name: name,
                value: item.value,
                valueType: typeof item.value,
                checked: checkedSet[item.value] ? 'checked' : '',
                disabled: cellData.isDisabled ? 'disabled' : ''
            });
            if (item.text) {
                contentHtml += this.labelTemplate({
                    id: id,
                    labelText: item.text
                });
            }
        }, this);

        return this.template({
            type: this.inputType,
            content: contentHtml
        });
    },

    /**
     * Finds an element from the given parent element with 'this.selector', and moves focus to it.
     * @param {jquery} $parent - parent element
     * @override
     */
    focus: function($parent) {
        var $input = $parent.find('input');

        if (!$input.is(':focus')) {
            $input.eq(0).focus();
        }
    }
});

module.exports = ButtonPainter;

},{"../../common/util":11,"./base":30}],32:[function(require,module,exports){
/**
 * @fileoverview Main Button Painter
 * @author NHN Ent. FE Development Team
 */
'use strict';

var Painter = require('../../base/painter');

/**
 * Main Button Painter
 * (This class does not extend from module:painter/input/base but from module:base/painter directly)
 * @module painter/input/mainButton
 * @extends module:base/painter
 */
var InputPainter = tui.util.defineClass(Painter, /**@lends module:painter/input/mainButton.prototype */{
    /**
     * @constructs
     * @param {Object} options - options
     */
    init: function(options) {
        Painter.apply(this, arguments);

        this.selector = 'input.main_button';
        this.inputType = options.inputType;
        this.gridId = options.gridId;
    },

    /**
     * key-value object contains event names as keys and handler names as values
     * @type {Object}
     */
    events: {
        change: '_onChange'
    },

    /**
     * markup template
     * @returns {String}
     */
    template: _.template(
        '<input class="main_button" type="<%=type%>" name="<%=name%>" <%=checked%> />'
    ),

     /**
     * Event handler for 'change' DOM event.
     * @param {Event} event - DOM event object
     * @private
     */
    _onChange: function(event) {
        var $target = $(event.target);
        var address = this._getCellAddress($target);

        this.controller.setValue(address, $target.is(':checked'));
    },

    /**
     * Generates a HTML string from given data, and returns it.
     * @param {Object} cellData - cell data
     * @returns {String}
     * @implements {module:painter/input/base}
     */
    generateHtml: function(cellData) {
        return this.template({
            type: this.inputType,
            name: this.gridId,
            checked: cellData.value ? 'checked' : ''
        });
    }
});

module.exports = InputPainter;

},{"../../base/painter":6}],33:[function(require,module,exports){
/**
 * @fileoverview Painter class for 'select' input.
 * @author NHN Ent. FE Development Team
 */
'use strict';

var InputPainter = require('./base');
var util = require('../../common/util');

/**
 * Painter class for 'select' input.
 * @module painter/input/select
 * @extends module:painter/input/base
 */
var SelectPainter = tui.util.defineClass(InputPainter, /**@lends module:painter/input/select.prototype */{
    /**
     * @constructs
     */
    init: function() {
        InputPainter.apply(this, arguments);

        /**
         * css selector to use delegated event handlers by '$.on()' method.
         * @type {String}
         */
        this.selector = 'select';
    },

    /**
     * Content markup template
     * @returns {string} html
     */
    template: _.template(
        '<select name="<%=name%>" <%=disabled%>><%=options%></select>'
    ),

    /**
     * Options markup template
     * @returns {string} html
     */
    optionTemplate: _.template(
        '<option value="<%=value%>" <%=selected%>><%=text%></option>'
    ),

    /**
     * Returns the value string of given data to display in the cell.
     * @param {Object} cellData - cell data
     * @implements {module:painter/input/base}
     * @returns {String}
     * @protected
     */
    _getDisplayValue: function(cellData) {
        var selectedOption = _.find(cellData.optionList, function(item) {
            return String(item.value) === String(cellData.value);
        });

        return selectedOption ? selectedOption.text : '';
    },

    /**
     * Generates an input HTML string from given data, and returns it.
     * @param {object} cellData - cell data
     * @implements {module:painter/input/base}
     * @returns {string}
     * @protected
     */
    _generateInputHtml: function(cellData) {
        var optionHtml = _.reduce(cellData.optionList, function(html, item) {
            return html + this.optionTemplate({
                value: item.value,
                text: item.text,
                selected: (String(cellData.value) === String(item.value)) ? 'selected' : ''
            });
        }, '', this);

        return this.template({
            name: util.getUniqueKey(),
            disabled: cellData.isDisabled ? 'disabled' : '',
            options: optionHtml
        });
    }
});

module.exports = SelectPainter;

},{"../../common/util":11,"./base":30}],34:[function(require,module,exports){
/**
 * @fileoverview Painter class for the 'input[type=text]' and 'input[type=password]'.
 * @author NHN Ent. FE Development Team
 */
'use strict';

var InputPainter = require('./base');
var util = require('../../common/util');

/**
 * Painter class for the 'input[type=text]' and 'input[type=password]'
 * @module painter/input/text
 * @extends module:painter/input/base
 */
var TextPainter = tui.util.defineClass(InputPainter, /**@lends module:painter/input/text.prototype */{
    /**
     * @constructs
     * @param {Object} options - options
     */
    init: function(options) {
        InputPainter.apply(this, arguments);

        this.inputType = options.inputType;

        /**
         * css selector to use delegated event handlers by '$.on()' method.
         * @type {String}
         */
        this.selector = 'input[type=' + this.inputType + ']';

        this._extendEvents({
            selectstart: '_onSelectStart'
        });
    },

    /**
     * Markup template
     * @returns {string} html
     */
    template: _.template(
        '<input' +
        ' type="<%=type%>"' +
        ' value="<%=value%>"' +
        ' name="<%=name%>"' +
        ' align="center"' +
        ' maxLength="<%=maxLength%>"' +
        ' <%=disabled%>' +
        '/>'
    ),

    /**
     * Event handler for the'selectstart' event.
     * (To prevent 'selectstart' event be prevented by module:view/layout/body in IE)
     * @param {Event} event - DOM event object
     * @private
     */
    _onSelectStart: function(event) {
        event.stopPropagation();
    },

    /**
     * Convert each character in the given string to '*' and returns them as a string.
     * @param {String} value - value string
     * @returns {String}
     * @private
     */
    _convertStringToAsterisks: function(value) {
        return Array(value.length + 1).join('*');
    },

    /**
     * Returns the value string of given data to display in the cell.
     * @param {Object} cellData - cell data
     * @implements {module:painter/input/base}
     * @returns {String}
     * @protected
     */
    _getDisplayValue: function(cellData) {
        var value = cellData.formattedValue;

        if (this.inputType === 'password') {
            value = this._convertStringToAsterisks(cellData.value);
        }

        return value;
    },

    /**
     * Generates an input HTML string from given data, and returns it.
     * @param {object} cellData - cell data
     * @implements {module:painter/input/base}
     * @returns {string}
     * @protected
     */
    _generateInputHtml: function(cellData) {
        var maxLength = tui.util.pick(cellData, 'columnModel', 'editOption', 'maxLength');

        return this.template({
            type: this.inputType,
            value: cellData.value,
            name: util.getUniqueKey(),
            disabled: cellData.isDisabled ? 'disabled' : '',
            maxLength: maxLength
        });
    },

    /**
     * Finds an element from the given parent element with 'this.selector', and moves focus to it.
     * @param {jquery} $parent - parent element
     * @override
     */
    focus: function($parent) {
        var $input = $parent.find(this.selector);

        if ($input.length === 1 && !$input.is(':focus')) {
            $input.select();
        }
    }
});

module.exports = TextPainter;

},{"../../common/util":11,"./base":30}],35:[function(require,module,exports){
/**
 * @fileoverview Painter Manager
 * @author NHN Ent. FE Development Team
 */
'use strict';

var RowPainter = require('./row');
var CellPainter = require('./cell');
var DummyCellPainter = require('./dummyCell');
var TextPainter = require('./input/text');
var SelectPainter = require('./input/select');
var ButtonPainter = require('./input/button');
var MainButtonPainter = require('./input/mainButton');

/**
 * Painter manager
 * @module painter/manager
 */
var PainterManager = tui.util.defineClass(/**@lends module:painter/manager.prototype */{
    /**
     * @constructs
     * @param {Object} options - Options
     */
    init: function(options) {
        this.gridId = options.gridId;
        this.selectType = options.selectType;

        this.inputPainters = this._createInputPainters(options.controller);
        this.cellPainters = this._createCellPainters(options.controller);
        this.rowPainter = this._createRowPainter();
    },

    /**
     * Creates instances of input painters and returns the object that stores them
     * using 'inputType' as keys.
     * @param {module:painter/controller} controller - painter controller
     * @returns {Object}
     * @private
     */
    _createInputPainters: function(controller) {
        return {
            text: new TextPainter({
                controller: controller,
                inputType: 'text'
            }),
            password: new TextPainter({
                controller: controller,
                inputType: 'password'
            }),
            checkbox: new ButtonPainter({
                controller: controller,
                inputType: 'checkbox'
            }),
            radio: new ButtonPainter({
                controller: controller,
                inputType: 'radio'
            }),
            select: new SelectPainter({
                controller: controller
            }),
            mainButton: new MainButtonPainter({
                controller: controller,
                inputType: this.selectType,
                gridId: this.gridId
            })
        };
    },

    /**
     * Creates instances of cell painters and returns the object that stores them
     * using 'editType' as keys.
     * @param {module:painter/controller} controller - painter controller
     * @returns {Object} Key-value object
     * @private
     */
    _createCellPainters: function(controller) {
        var cellPainters = {
            dummy: new DummyCellPainter({
                controller: controller
            }),
            normal: new CellPainter({
                controller: controller,
                editType: 'normal'
            })
        };

        _.each(this.inputPainters, function(inputPainter, editType) {
            cellPainters[editType] = new CellPainter({
                editType: editType,
                controller: controller,
                inputPainter: inputPainter
            });
        }, this);

        return cellPainters;
    },

    /**
     * Creates row painter and returns it.
     * @returns {module:painter/row} New row painter instance
     * @private
     */
    _createRowPainter: function() {
        return new RowPainter({
            painterManager: this
        });
    },

    /**
     * Returns an instance of cell painter which has given editType
     * @param {String} editType - Edit type
     * @returns {Object} - Cell painter instance
     */
    getCellPainter: function(editType) {
        return this.cellPainters[editType];
    },

    /**
     * Returns all cell painters
     * @returns {Object} Object that has edit-type as a key and cell painter as a value
     */
    getCellPainters: function() {
        return this.cellPainters;
    },

    /**
     * Returns all input painters
     * @param {Boolean} withoutMeta - if set to true, returns without meta cell painters
     * @returns {Object} Object that has edit-type as a key and input painter as a value
     */
    getInputPainters: function(withoutMeta) {
        var result = this.inputPainters;
        if (withoutMeta) {
            result = _.omit(result, 'mainButton');
        }

        return result;
    },

    /**
     * Returns a row painter
     * @returns {module:painter/row} Row painter
     */
    getRowPainter: function() {
        return this.rowPainter;
    }
});

module.exports = PainterManager;

},{"./cell":27,"./dummyCell":29,"./input/button":31,"./input/mainButton":32,"./input/select":33,"./input/text":34,"./row":36}],36:[function(require,module,exports){
/**
 * @fileoverview Painter class for the row(TR) views
 * @author NHN Ent. FE Development Team
 */
'use strict';

var Painter = require('../base/painter');
var util = require('../common/util');

/**
 * Painter class for the row(TR) views
 * @module painter/row
 * @extends module:base/painter
 */
var RowPainter = tui.util.defineClass(Painter, /**@lends module:painter/row.prototype */{
    /**
     * @constructs
     * @param {object} options - Options
     */
    init: function(options) {
        Painter.apply(this, arguments);
        this.painterManager = options.painterManager;
    },

    /**
     * css selector to find its own element(s) from a parent element.
     * @type {String}
     */
    selector: 'tr',

    /**
     * markup template
     * @returns {String} HTML string
     */
    template: _.template(
        '<tr ' +
        'key="<%=key%>" ' +
        'class="<%=className%>" ' +
        'style="height: <%=height%>px;">' +
        '<%=contents%>' +
        '</tr>'
    ),

    /**
     * cellData 의 isEditable 프로퍼티에 따른 editType 을 반환한다.
     * editable 프로퍼티가 false 라면 normal type 으로 설정한다.
     * @param {string} columnName 컬럼명
     * @param {Object} cellData 셀 데이터
     * @returns {string} cellFactory 에서 사용될 editType
     * @private
     */
    _getEditType: function(columnName, cellData) {
        var editType = tui.util.pick(cellData.columnModel, 'editOption', 'type');

        return editType || 'normal';
    },

    /**
     * Returns the HTML string of all cells in Dummy row.
     * @param  {Array.<String>} columnNames - An array of column names
     * @returns {String} HTLM string
     * @private
     */
    _generateHtmlForDummyRow: function(columnNames) {
        var cellPainter = this.painterManager.getCellPainter('dummy'),
            html = '';

        _.each(columnNames, function(columnName) {
            html += cellPainter.generateHtml(columnName);
        });

        return html;
    },

    /**
     * Returns the HTML string of all cells in Actual row.
     * @param  {module:model/row} model - View model instance
     * @param  {Array.<String>} columnNames - An array of column names
     * @returns {String} HTLM string
     * @private
     */
    _generateHtmlForActualRow: function(model, columnNames) {
        var html = '';

        _.each(columnNames, function(columnName) {
            var cellData = model.get(columnName),
                editType, cellPainter;

            if (cellData && cellData.isMainRow) {
                editType = this._getEditType(columnName, cellData);
                cellPainter = this.painterManager.getCellPainter(editType);
                html += cellPainter.generateHtml(cellData);
            }
        }, this);

        return html;
    },

    /**
     * Returns the HTML string of all cells in the given model (row).
     * @param  {module:model/row} model - View model instance
     * @param  {Array.<String>} columnNames - An array of column names
     * @returns {String} HTLM string
     */
    generateHtml: function(model, columnNames) {
        var rowKey = model.get('rowKey'),
            html;

        if (_.isUndefined(rowKey)) {
            html = this._generateHtmlForDummyRow(columnNames);
        } else {
            html = this._generateHtmlForActualRow(model, columnNames);
        }

        return this.template({
            key: rowKey,
            height: model.get('height') + RowPainter._extraHeight,
            contents: html,
            className: ''
        });
    },

    /**
     * Refreshes the row(TR) element.
     * @param {object} changed - object that contains the changed data using columnName as keys
     * @param {jQuery} $tr - jquery object for tr element
     */
    refresh: function(changed, $tr) {
        _.each(changed, function(cellData, columnName) {
            var editType, cellPainter, $td;

            if (columnName !== '_extraData') {
                $td = $tr.find('td[data-column-name=' + columnName + ']');
                editType = this._getEditType(columnName, cellData);
                cellPainter = this.painterManager.getCellPainter(editType);
                cellPainter.refresh(cellData, $td);
            }
        }, this);
    },

    static: {
        /**
         * IE7에서만 TD의 border만큼 높이가 늘어나는 버그에 대한 예외처리를 위한 값
         * @memberof RowPainter
         * @static
         */
        _extraHeight: (function() {
            var value = 0;
            if (util.isBrowserIE7()) {
                // css에서 IE7에 대해서만 padding의 높이를 위아래 1px씩 주고 있음 (border가 생겼을 때는 0)
                value = -2;
            }
            return value;
        })()
    }
});

module.exports = RowPainter;

},{"../base/painter":6,"../common/util":11}],37:[function(require,module,exports){
/**
 * @fileoverview Public Event Emitter
 * @author NHN Ent. FE Development Team
 */
'use strict';

/**
 * Class that listens public events (for external user) to the other object and
 * triggers them on the public object(module:grid).
 * @module publicEventEmitter
 */
var PublicEventEmitter = tui.util.defineClass(/**@lends module:publicEventEmitter.prototype */{
    /**
     * @constructs
     * @param {Object} publicObject - Object on which event will be triggered.
     *            This object should have methods of Backbone.Events.
     */
    init: function(publicObject) {
        this.publicObject = publicObject;
    },

    /**
     * Listen and trigger specified events with same event name.
     * @param {Object} target - Target object
     * @param {String[]} eventNames - An array of the event names
     * @private
     */
    _listenForThrough: function(target, eventNames) {
        _.each(eventNames, function(eventName) {
            this.listenTo(target, eventName, _.bind(this._triggerOnPublic, this, eventName));
        }, this);
    },

    /**
     * Listen specified event and rename it to public name and trigger it.
     * @param  {Object} target - Target object
     * @param  {String} eventName - Event name
     * @param  {String} publicEventName - New event name for public use
     * @private
     */
    _listenForRename: function(target, eventName, publicEventName) {
        this.listenTo(target, eventName, _.bind(this._triggerOnPublic, this, publicEventName));
    },

    /**
     * Trigger specified event on the public object.
     * @param  {String} eventName - Event name
     * @param  {Object} eventData - Event data
     * @private
     */
    _triggerOnPublic: function(eventName, eventData) {
        this.publicObject.trigger(eventName, eventData);
    },

    /**
     * Listen to Net addon.
     * @param {module:addon/net} net - Net addon object
     */
    listenToNetAddon: function(net) {
        this._listenForThrough(net, [
            'beforeRequest',
            'response',
            'successResponse',
            'failResponse',
            'errorResponse'
        ]);
    },

    /**
     * Listen to Conatiner view.
     * @param  {module:view/container} container - Container view object
     */
    listenToContainerView: function(container) {
        this._listenForThrough(container, [
            'click',
            'dblclick',
            'mousedown',
            'clickCell',
            'dblclickCell',
            'mouseoverCell',
            'mouseoutCell',
            'rendered'
        ]);
    },

    /**
     * Listen to Focus model
     * @param  {module:model/focus} focusModel - Focus model
     */
    listenToFocusModel: function(focusModel) {
        this._listenForRename(focusModel, 'select', 'selectRow');
    }
});

_.extend(PublicEventEmitter.prototype, Backbone.Events);

module.exports = PublicEventEmitter;

},{}],38:[function(require,module,exports){
/**
 * @fileoverview 키 이벤트 핸들링 담당하는 Clipboard 정의
 * @author NHN Ent. FE Development Team
 */
'use strict';

var View = require('../base/view');
var util = require('../common/util');
var keyCodeMap = require('../common/constMap').keyCode;

/**
 * Clipboard view class
 * @module view/clipboard
 * @extends module:base/view
 */
var Clipboard = View.extend(/**@lends module:view/clipboard.prototype */{
    /**
     * @constructs
     * @param {Object} options - Options
     */
    initialize: function(options) {
        this.setOwnProperties({
            focusModel: options.focusModel,
            selectionModel: options.selectionModel,
            painterManager: options.painterManager,
            dimensionModel: options.dimensionModel,
            dataModel: options.dataModel,
            columnModel: options.columnModel,
            renderModel: options.renderModel,
            timeoutIdForKeyIn: 0,
            isLocked: false
        });
        this.listenTo(this.focusModel, 'focusClipboard', this._onFocus);
    },

    tagName: 'textarea',

    className: 'clipboard',

    events: {
        'keydown': '_onKeyDown',
        'blur': '_onBlur'
    },

    /**
     * Event handler for blur event.
     * @private
     */
    _onBlur: function() {
        var focusModel = this.focusModel;
        setTimeout(function() {
            focusModel.refreshState();
        }, 0);
    },

    /**
     * Event handler for 'focusClipboard' event on focusModel
     * @private
     */
    _onFocus: function() {
        try {
            if (!this.$el.is(':focus')) {
                this.$el.focus();
                this.focusModel.refreshState();
            }
        } catch (e) {
            // Do nothing.
            // This try/catch block is just for preventing 'Unspecified error'
            // in IE9(and under) when running test using karma.
        }
    },

    /**
     * 랜더링 한다.
     * @returns {View.Clipboard} this object
     */
    render: function() {
        return this;
    },

    /**
     * keyEvent 의 중복 호출을 방지하는 lock 을 설정한다.
     * @private
     */
    _lock: function() {
        clearTimeout(this.timeoutIdForKeyIn);
        this.isLocked = true;
        this.timeoutIdForKeyIn = setTimeout($.proxy(this._unlock, this), 10); // eslint-disable-line no-magic-numbers
    },

    /**
     * keyEvent 의 중복 호출을 방지하는 lock 을 해제한다.
     * @private
     */
    _unlock: function() {
        this.isLocked = false;
    },

    /**
     * keyDown 이벤트 핸들러
     * @param {Event} keyDownEvent 이벤트 객체
     * @private
     */
    _onKeyDown: function(keyDownEvent) {
        if (this.isLocked) {
            keyDownEvent.preventDefault();
            return;
        }

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
    },

    /**
     * ctrl, shift 둘다 눌리지 않은 상태에서의 key down 이벤트 핸들러
     * @param {Event} keyDownEvent 이벤트 객체
     * @private
     */
    _keyIn: function(keyDownEvent) { // eslint-disable-line complexity
        var focusModel = this.focusModel,
            selectionModel = this.selectionModel,
            focused = focusModel.which(),
            rowKey = focused.rowKey,
            columnName = focused.columnName,
            displayRowCount = this.dimensionModel.get('displayRowCount'),
            isKeyIdentified = true,
            keyCode = keyDownEvent.keyCode || keyDownEvent.which;

        if (util.isBlank(focused.rowKey)) {
            return;
        }

        switch (keyCode) {
            case keyCodeMap.UP_ARROW:
                focusModel.focus(focusModel.prevRowKey(), columnName, true);
                break;
            case keyCodeMap.DOWN_ARROW:
                focusModel.focus(focusModel.nextRowKey(), columnName, true);
                break;
            case keyCodeMap.LEFT_ARROW:
                focusModel.focus(rowKey, focusModel.prevColumnName(), true);
                break;
            case keyCodeMap.RIGHT_ARROW:
                focusModel.focus(rowKey, focusModel.nextColumnName(), true);
                break;
            case keyCodeMap.PAGE_UP:
                focusModel.focus(focusModel.prevRowKey(displayRowCount - 1), columnName, true);
                break;
            case keyCodeMap.PAGE_DOWN:
                focusModel.focus(focusModel.nextRowKey(displayRowCount - 1), columnName, true);
                break;
            case keyCodeMap.HOME:
                focusModel.focus(rowKey, focusModel.firstColumnName(), true);
                break;
            case keyCodeMap.END:
                focusModel.focus(rowKey, focusModel.lastColumnName(), true);
                break;
            //space 와 enter 는 동일동작
            case keyCodeMap.SPACE:
            case keyCodeMap.ENTER:
                this._onEnterSpace(rowKey, columnName);
                break;
            case keyCodeMap.DEL:
                this._del(rowKey, columnName);
                break;
            case keyCodeMap.TAB:
                focusModel.focusIn(rowKey, focusModel.nextColumnName(), true);
                break;
            default:
                isKeyIdentified = false;
                break;
        }
        if (isKeyIdentified) {
            keyDownEvent.preventDefault();
        }
        selectionModel.end();
    },

    /**
     * enter 또는 space 가 입력되었을 때, 처리하는 로직
     * @param {(number|string)} rowKey 키 입력이 발생한 엘리먼트의 rowKey
     * @param {string} columnName 키 입력이 발생한 엘리먼트의 컬럼명
     * @private
     */
    _onEnterSpace: function(rowKey, columnName) {
        this.focusModel.focusIn(rowKey, columnName);
    },

    /**
     * Return index for reference of selection before moving by key event.
     * @returns {{row: number, column:number}} index
     * @private
     */
    _getIndexBeforeMove: function() {
        var focusedIndex = this.focusModel.indexOf(),
            selectionRange = this.selectionModel.get('range'),
            index = _.extend({}, focusedIndex),
            selectionRowRange, selectionColumnRange;

        if (selectionRange) {
            selectionRowRange = selectionRange.row;
            selectionColumnRange = selectionRange.column;

            index.row = selectionRowRange[0];
            index.column = selectionColumnRange[0];

            if (selectionRowRange[1] > focusedIndex.row) {
                index.row = selectionRowRange[1];
            }
            if (selectionColumnRange[1] > focusedIndex.column) {
                index.column = selectionColumnRange[1];
            }
        }
        return index;
    },

    /**
     * shift 가 눌린 상태에서의 key down event handler
     * @param {Event} keyDownEvent 이벤트 객체
     * @private
     */
    _keyInWithShift: function(keyDownEvent) { // eslint-disable-line complexity
        var focusModel = this.focusModel,
            dimensionModel = this.dimensionModel,
            columnModelList = this.columnModel.getVisibleColumnModelList(),
            focused = focusModel.which(),
            displayRowCount = dimensionModel.get('displayRowCount'),
            keyCode = keyDownEvent.keyCode || keyDownEvent.which,
            index = this._getIndexBeforeMove(),
            isKeyIdentified = true,
            isSelection = true,
            columnModel, scrollPosition, isValid, selectionState;

        switch (keyCode) {
            case keyCodeMap.UP_ARROW:
                index.row -= 1;
                break;
            case keyCodeMap.DOWN_ARROW:
                index.row += 1;
                break;
            case keyCodeMap.LEFT_ARROW:
                index.column -= 1;
                break;
            case keyCodeMap.RIGHT_ARROW:
                index.column += 1;
                break;
            case keyCodeMap.PAGE_UP:
                index.row = focusModel.prevRowIndex(displayRowCount - 1);
                break;
            case keyCodeMap.PAGE_DOWN:
                index.row = focusModel.nextRowIndex(displayRowCount - 1);
                break;
            case keyCodeMap.HOME:
                index.column = 0;
                break;
            case keyCodeMap.END:
                index.column = columnModelList.length - 1;
                break;
            case keyCodeMap.ENTER:
                isSelection = false;
                break;
            case keyCodeMap.TAB:
                isSelection = false;
                focusModel.focusIn(focused.rowKey, focusModel.prevColumnName(), true);
                break;
            default:
                isSelection = false;
                isKeyIdentified = false;
                break;
        }

        columnModel = columnModelList[index.column];
        isValid = !!(columnModel && this.dataModel.getRowData(index.row));

        if (isSelection && isValid) {
            this._updateSelectionByKeyIn(index.row, index.column);
            scrollPosition = dimensionModel.getScrollPosition(index.row, columnModel.columnName);
            if (scrollPosition) {
                selectionState = this.selectionModel.getState();
                if (selectionState === 'column') {
                    delete scrollPosition.scrollTop;
                } else if (selectionState === 'row') {
                    delete scrollPosition.scrollLeft;
                }
                this.renderModel.set(scrollPosition);
            }
        }

        if (isKeyIdentified) {
            keyDownEvent.preventDefault();
        }
    },

    /**
     * ctrl 가 눌린 상태에서의 key down event handler
     * @param {Event} keyDownEvent 이벤트 객체
     * @private
     */
    _keyInWithCtrl: function(keyDownEvent) {
        var focusModel = this.focusModel,
            keyCode = keyDownEvent.keyCode || keyDownEvent.which;

        switch (keyCode) {
            case keyCodeMap.CHAR_A:
                this.selectionModel.selectAll();
                break;
            case keyCodeMap.CHAR_C:
                this._copyToClipboard();
                break;
            case keyCodeMap.HOME:
                focusModel.focus(focusModel.firstRowKey(), focusModel.firstColumnName(), true);
                break;
            case keyCodeMap.END:
                focusModel.focus(focusModel.lastRowKey(), focusModel.lastColumnName(), true);
                break;
            case keyCodeMap.CHAR_V:
                this._paste();
                break;
            default:
                break;
        }
    },

    /**
     * paste date
     * @private
     */
    _paste: function() {
        // pressing v long time, clear clipboard to keep final paste date
        this._clearClipBoard();
        if (this.pasting) {
            return;
        }

        this.pasting = true;
        this._onKeyupCharV();
    },

    /**
     * keyup event attach
     * @private
     */
    _onKeyupCharV: function() {
        this.$el.on('keyup', $.proxy(this.onKeyupCharV, this));
    },

    onKeyupCharV: function() {
        this._pasteToGrid();
        this.pasting = false;
    },

   /**
     * clipboard textarea clear
     * @private
     */
    _clearClipBoard: function() {
        this.$el.val('');
    },

    /**
     * paste text data
     * @private
     */
    _pasteToGrid: function() {
        var selectionModel = this.selectionModel,
            focusModel = this.focusModel,
            dataModel = this.dataModel,
            startIdx, data;

        if (selectionModel.hasSelection()) {
            startIdx = selectionModel.getStartIndex();
        } else {
            startIdx = focusModel.indexOf();
        }
        data = this._getProcessClipBoardData();

        this.$el.off('keyup');
        dataModel.paste(data, startIdx);
    },

    /**
     * process data for paste to grid
     * @private
     * @returns {Array.<Array.<string>>} result
     */
    _getProcessClipBoardData: function() {
        var text = this.$el.val(),
            result = text.split('\n'),
            i = 0,
            len = result.length;

        for (; i < len; i += 1) {
            result[i] = result[i].split('\t');
        }
        return result;
    },

    /**
     * ctrl, shift 둘다 눌린 상태에서의 key down event handler
     * @param {Event} keyDownEvent 이벤트 객체
     * @private
     */
    _keyInWithShiftAndCtrl: function(keyDownEvent) {
        var isKeyIdentified = true,
            columnModelList = this.columnModel.getVisibleColumnModelList(),
            keyCode = keyDownEvent.keyCode || keyDownEvent.which;

        switch (keyCode) {
            case keyCodeMap.HOME:
                this._updateSelectionByKeyIn(0, 0);
                break;
            case keyCodeMap.END:
                this._updateSelectionByKeyIn(this.dataModel.length - 1, columnModelList.length - 1);
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
     * text type 의 editOption cell 의 data 를 빈 스트링으로 세팅한다.
     * selection 영역이 지정되어 있다면 selection 영역에 해당하는 모든 셀.
     * selection 영역이 지정되어 있지 않다면 focus된 셀
     * @private
     */
    _del: function() {
        var selectionModel = this.selectionModel,
            dataModel = this.dataModel,
            focused = this.focusModel.which(),
            columnModelList = this.columnModel.getVisibleColumnModelList(),
            rowKey = focused.rowKey,
            columnName = focused.columnName,
            range, i, j;

        if (selectionModel.hasSelection()) {
            //다수의 cell 을 제거 할 때에는 silent 로 데이터를 변환한 후 한번에 랜더링을 refresh 한다.
            range = selectionModel.get('range');
            for (i = range.row[0]; i < range.row[1] + 1; i += 1) {
                rowKey = dataModel.at(i).get('rowKey');
                for (j = range.column[0]; j < range.column[1] + 1; j += 1) {
                    columnName = columnModelList[j].columnName;
                    dataModel.del(rowKey, columnName, true);
                    dataModel.get(rowKey).validateCell(columnName);
                }
            }
            this.renderModel.refresh(true);
        } else {
            dataModel.del(rowKey, columnName);
        }
    },

    /**
     * keyIn 으로 selection 영역을 update 한다. focus 로직도 함께 수행한다.
     * @param {Number} rowIndex 행의 index 정보
     * @param {Number} columnIndex 열의 index 정보
     * @private
     */
    _updateSelectionByKeyIn: function(rowIndex, columnIndex) {
        var selectionModel = this.selectionModel;

        selectionModel.update(rowIndex, columnIndex);
    },

    /**
     * clipboard 에 설정될 문자열 반환한다.
     * @returns {String} 데이터를 text 형태로 변환한 문자열
     * @private
     */
    _getClipboardString: function() {
        var text,
            selectionModel = this.selectionModel,
            focused = this.focusModel.which();
        if (selectionModel.hasSelection()) {
            text = this.selectionModel.getValuesToString();
        } else {
            text = this.dataModel.get(focused.rowKey).getValueString(focused.columnName);
        }
        return text;
    },

    /**
     * 현재 그리드의 data 를 clipboard 에 copy 한다.
     * @private
     */
     /* istanbul ignore next */
    _copyToClipboard: function() {
        var text = this._getClipboardString();
        if (window.clipboardData) {
            window.clipboardData.setData('Text', text);
        } else {
            this.$el.val(text).select();
        }
    }
});

module.exports = Clipboard;

},{"../base/view":7,"../common/constMap":8,"../common/util":11}],39:[function(require,module,exports){
/**
 * @fileoverview View class that conaints a top element of the DOM structure of the grid.
 * @author NHN Ent. FE Development Team
 */
'use strict';

var View = require('../base/view'),
    GridEvent = require('../common/gridEvent');

/**
 * Container View
 * @module view/container
 * @extends module:base/view
 */
var Container = View.extend(/**@lends module:view/container.prototype */{
    /**
     * @constructs
     * @param {Object} options - Options
     */
    initialize: function(options) {
        View.prototype.initialize.call(this);

        this.gridId = options.gridId;
        this.singleClickEdit = options.singleClickEdit;
        this.dimensionModel = options.dimensionModel;
        this.focusModel = options.focusModel;
        this.dataModel = options.dataModel;
        this.viewFactory = options.viewFactory;

        this._createChildViews();

        this.listenTo(this.dimensionModel, 'change:bodyHeight', this._refreshHeight);
        this.listenTo(this.dimensionModel, 'setSize', this._onSetSize);
        $(window).on('resize.grid', $.proxy(this._onResizeWindow, this));

        this.__$el = this.$el.clone();
    },

    events: {
        'click': '_onClick',
        'dblclick': '_onDblClick',
        'mousedown': '_onMouseDown',
        'mouseover': '_onMouseOver',
        'mouseout': '_onMouseOut',

        // for preventing drag
        'selectstart': '_preventDrag',
        'dragstart': '_preventDrag'
    },

    /**
     * 내부에서 사용할 view 인스턴스들을 초기화한다.
     * @private
     */
    _createChildViews: function() {
        var factory = this.viewFactory;

        this._addChildren([
            factory.createFrame('L'),
            factory.createFrame('R'),
            factory.createToolbar(),
            factory.createStateLayer(),
            factory.createEditingLayer(),
            factory.createClipboard()
        ]);
    },

    /**
     * Event handler for resize event on window.
     * @private
     */
    _onResizeWindow: function() {
        this.dimensionModel.refreshLayout();
    },

    /**
     * drag 이벤트 발생시 이벤트 핸들러
     * @returns {boolean} false
     * @private
     */
    _preventDrag: function() {
        return false;
    },

    /**
     * Event handler for 'setSize' event on Dimension
     * @private
     */
    _onSetSize: function() {
        this.$el.width(this.dimensionModel.get('width'));
    },

    /**
     * click 이벤트 핸들러
     * @param {MouseEvent} mouseEvent 이벤트 객체
     * @private
     */
    _onClick: function(mouseEvent) {
        var eventData = new GridEvent(mouseEvent),
            $target = $(mouseEvent.target),
            cellInfo;

        this.trigger('click', eventData);
        if (eventData.isStopped()) {
            return;
        }
        if (this._isCellElement($target, true)) {
            cellInfo = this._getCellInfoFromElement($target.closest('td'));
            if (this.singleClickEdit && !$target.is('input')) {
                this.focusModel.focusIn(cellInfo.rowKey, cellInfo.columnName);
            }
            this._triggerCellMouseEvent('clickCell', eventData, cellInfo);
        }
    },

    /**
     * doubleClick 이벤트 핸들러
     * @param {MouseEvent} mouseEvent 이벤트 객체
     * @private
     */
    _onDblClick: function(mouseEvent) {
        var eventData = new GridEvent(mouseEvent),
            $target = $(mouseEvent.target);

        this.trigger('dblclick', eventData);
        if (eventData.isStopped()) {
            return;
        }
        if (this._isCellElement($target, true)) {
            this._triggerCellMouseEvent('dblclickCell', eventData, $target.closest('td'));
        }
    },

    /**
     * mouseover 이벤트 발생시 실행될 핸들러
     * @private
     * @param {MouseEvent} mouseEvent 마우스 이벤트 객체
     */
    _onMouseOver: function(mouseEvent) {
        var $target = $(mouseEvent.target),
            eventData;

        if (this._isCellElement($target)) {
            eventData = new GridEvent(mouseEvent);
            this._triggerCellMouseEvent('mouseoverCell', eventData, $target);
        }
    },

    /**
     * mouseout 이벤트 발생시 실행될 핸들러
     * @private
     * @param {MouseEvent} mouseEvent 마우스 이벤트 객체
     */
    _onMouseOut: function(mouseEvent) {
        var $target = $(mouseEvent.target),
            eventData;

        if (this._isCellElement($target)) {
            eventData = new GridEvent(mouseEvent);
            this._triggerCellMouseEvent('mouseoutCell', eventData, $target);
        }
    },

    /**
     * 셀과 관련된 커스텀 마우스 이벤트를 발생시킨다.
     * @private
     * @param {string} eventName 이벤트명
     * @param {MouseEvent} eventData 커스터마이징 된 마우스 이벤트 객체
     * @param {(jQuery|object)} cell 이벤트가 발생한 cell (jquery 객체이거나 rowKey, columnName, rowData를 갖는 plain 객체)
     */
    _triggerCellMouseEvent: function(eventName, eventData, cell) {
        var cellInfo = cell;
        if (cell instanceof $) {
            cellInfo = this._getCellInfoFromElement(cell);
        }
        _.extend(eventData, cellInfo);
        this.trigger(eventName, eventData);
    },

    /**
     * 해당 HTML요소가 셀인지 여부를 반환한다.
     * @private
     * @param {jQuery} $target 검사할 HTML요소의 jQuery 객체
     * @param {boolean} isIncludeChild true이면 셀의 자식요소까지 포함한다.
     * @returns {boolean} 셀이면 true, 아니면 false
     */
    _isCellElement: function($target, isIncludeChild) {
        var $cell = isIncludeChild ? $target.closest('td') : $target;

        return !!($cell.is('td') && $cell.attr('data-column-name') && $cell.parent().attr('key'));
    },

    /**
     * HTML요소에서 셀의 rowKey와 columnName값을 찾아서 rowData와 함께 객체로 반환한다.
     * @private
     * @param {jQuery} $cell TD요소의 jquery 객체
     * @returns {{rowKey: string, rowData: Data.Row, columnName: string}} 셀 관련 정보를 담은 객체
     */
    _getCellInfoFromElement: function($cell) {
        var rowKey = Number($cell.attr('data-row-key'));
        var columnName = $cell.attr('data-column-name');

        return {
            rowKey: rowKey,
            columnName: columnName,
            rowData: this.dataModel.getRowData(rowKey)
        };
    },

    /**
     * mousedown 이벤트 핸들러
     * @param {event} mouseEvent 이벤트 객체
     * @private
     */
    _onMouseDown: function(mouseEvent) {
        var $target = $(mouseEvent.target),
            eventData = new GridEvent(mouseEvent);

        this.trigger('mousedown', eventData);
        if (eventData.isStopped()) {
            return;
        }
        if (!$target.is('input, a, button, select')) {
            mouseEvent.preventDefault();
            this.focusModel.focusClipboard();
        }
    },

    /**
     * rendering 이후, 또는 bodyHeight 가 변경되었을 때, header, toolbar 의 높이를 포함하여
     * grid 의 전체 너비를 설정한다.
     * @private
     */
    _refreshHeight: function() {
        this.$el.height(this.dimensionModel.getHeight());
    },

    /**
     * Render
     * @returns {module:view/container} this object
     */
    render: function() {
        var childElements = this._renderChildren().concat([
            $('<div>').addClass('left_line'),
            $('<div>').addClass('right_line')
        ]);
        this.$el.addClass('grid_wrapper uio_grid')
            .attr('data-grid-id', this.gridId)
            .append(childElements);

        this._appendBottomLine();
        this._refreshHeight();
        this.trigger('rendered');
        return this;
    },

    /**
     * Appends botton line of data
     * @private
     */
    _appendBottomLine: function() {
        var bottomPos = this.dimensionModel.get('toolbarHeight') + this.dimensionModel.getScrollXHeight();
        if (bottomPos) {
            this.$el.append($('<div>').addClass('data_bottom_line').css('bottom', bottomPos));
        }
    },

    /**
     * 소멸자
     */
    destroy: function() {
        this.stopListening();
        $(window).off('resize.grid');
        this._destroyChildren();

        this.$el.replaceWith(this.__$el);
        this.$el = this.__$el = null;
    }
});

module.exports = Container;

},{"../base/view":7,"../common/gridEvent":10}],40:[function(require,module,exports){
/**
 * @fileoverview Layer class that represents the state of rendering phase
 * @author NHN Ent. FE Development Team
 */
'use strict';

var View = require('../base/view');
var CELL_BORDER_WIDTH = require('../common/constMap').dimension.CELL_BORDER_WIDTH;

/**
 * Layer class that represents the state of rendering phase.
 * @module view/editingLayer
 * @extends module:base/view
 */
var EditingLayer = View.extend(/**@lends module:view/editingLayer.prototype */{
    /**
     * @constructs
     * @param {Object} options - Options
     */
    initialize: function(options) {
        this.renderModel = options.renderModel;
        this.domState = options.domState;
        this.inputPainters = options.inputPainters;

        this.listenTo(this.renderModel, 'editingStateChanged', this._onEditingStateChanged);
    },

    className: 'editing_layer cell_content',

    /**
     * Starts editing the given cell.
     * @param {Object} cellData - cell data
     * @private
     */
    _startEditing: function(cellData) {
        var rowKey = cellData.rowKey;
        var columnName = cellData.columnName;
        var editType = tui.util.pick(cellData, 'columnModel', 'editOption', 'type');
        var styleMap = this._calculateLayoutStyle(rowKey, columnName, this._isWidthExpandable(editType));
        var painter = this.inputPainters[editType];

        this.$el.css(styleMap).show();
        this.$el.attr({
            'data-row-key': rowKey,
            'data-column-name': columnName
        });
        this.$el.html(painter.generateHtml(cellData));
        this._adjustLeftPosition();

        painter.focus(this.$el);
    },

    /**
     * Returns whether the width is expandable.
     * @param {String} editType - edit type
     * @returns {Boolean}
     * @private
     */
    _isWidthExpandable: function(editType) {
        return _.contains(['checkbox', 'radio'], editType);
    },

    /**
     * Fisishes editing the current cell.
     * @private
     */
    _finishEditing: function() {
        this.$el.removeAttr('data-row-key');
        this.$el.removeAttr('data-column-name');
        this.$el.empty().hide();
    },

    /**
     * Adjust the left position of the layer not to lay beyond the boundary of the grid.
     * @private
     */
    _adjustLeftPosition: function() {
        var gridWidth = this.domState.getWidth();
        var layerWidth = this.$el.outerWidth();
        var layerLeftPos = this.$el.position().left;

        if (layerLeftPos + layerWidth > gridWidth) {
            this.$el.css('left', gridWidth - layerWidth);
        }
    },

    /**
     * Calculates the position and the dimension of the layer and returns the object that contains css properties.
     * @param {Stirng} rowKey - row key
     * @param {String} columnName - column name
     * @param {Boolean} expandable - true if the width of layer is expandable
     * @returns {Object}
     * @private
     */
    _calculateLayoutStyle: function(rowKey, columnName, expandable) {
        var wrapperOffset = this.domState.getOffset(),
            $cell = this.domState.getElement(rowKey, columnName),
            cellOffset = $cell.offset(),
            cellHeight = $cell.height(),
            cellWidth = $cell.width() - (CELL_BORDER_WIDTH * 2);

        return {
            top: cellOffset.top - wrapperOffset.top,
            left: cellOffset.left - wrapperOffset.left,
            height: cellHeight,
            minWidth: expandable ? cellWidth : '',
            width: expandable ? '' : cellWidth,
            lineHeight: cellHeight + 'px'
        };
    },

    /**
     * Event handler for 'editingStateChanged' event on the render model.
     * @param {Object} cellData - cell data
     * @private
     */
    _onEditingStateChanged: function(cellData) {
        if (cellData.isEditing) {
            this._startEditing(cellData);
        } else {
            this._finishEditing();
        }
    },

    /**
     * Render
     * @returns {Object} this instance
     */
    render: function() {
        _.each(this.inputPainters, function(painter) {
            painter.attachEventHandlers(this.$el, '');
        }, this);

        return this;
    }
});

module.exports = EditingLayer;

},{"../base/view":7,"../common/constMap":8}],41:[function(require,module,exports){
/**
 * @fileoverview View factory
 * @author NHN Ent. FE Development Team
 */
'use strict';

var ContainerView = require('./container');
var ToolbarView = require('./layout/toolbar');
var ToolbarControlPanelView = require('./layout/toolbar/controlPanel');
var ToolbarPaginationView = require('./layout/toolbar/pagination');
var ToolbarResizeHandlerView = require('./layout/toolbar/resizeHandler');
var StateLayerView = require('./stateLayer');
var ClipboardView = require('./clipboard');
var LsideFrameView = require('./layout/frame-lside');
var RsideFrameView = require('./layout/frame-rside');
var HeaderView = require('./layout/header');
var HeaderResizeHandlerView = require('./layout/resizeHandler');
var BodyView = require('./layout/body');
var BodyTableView = require('./layout/bodyTable');
var RowListView = require('./rowList');
var SelectionLayerView = require('./selectionLayer');
var EditingLayerView = require('./editingLayer');

/**
 * View Factory
 * @module viewFactory
 */
var ViewFactory = tui.util.defineClass({
    init: function(options) {
        this.domState = options.domState;
        this.modelManager = options.modelManager;
        this.painterManager = options.painterManager;
    },

    /**
     * Creates container view and returns it.
     * @param {Object} options - Options set by user
     * @returns {module:view/container} - New container view instance
     */
    createContainer: function(options) {
        return new ContainerView({
            el: options.el,
            singleClickEdit: options.singleClickEdit,
            dataModel: this.modelManager.dataModel,
            dimensionModel: this.modelManager.dimensionModel,
            focusModel: this.modelManager.focusModel,
            gridId: this.modelManager.gridId,
            viewFactory: this
        });
    },

    /**
     * Creates toolbar view and returns it.
     * @returns {module:view/toolbar} - New toolbar view instance
     */
    createToolbar: function() {
        return new ToolbarView({
            toolbarModel: this.modelManager.toolbarModel,
            dimensionModel: this.modelManager.dimensionModel,
            viewFactory: this
        });
    },

    /**
     * Creates toolbar control panel view and returns it.
     * @returns {module:view/toolbar/controlPanel} - New control panel vew insatnce
     */
    createToolbarControlPanel: function() {
        return new ToolbarControlPanelView({
            gridId: this.modelManager.gridId,
            toolbarModel: this.modelManager.toolbarModel
        });
    },

    /**
     * Creates toolbar pagination view and returns it.
     * @returns {module:view/toolbar/pagination} - New pagination view instance
     */
    createToolbarPagination: function() {
        return new ToolbarPaginationView({
            toolbarModel: this.modelManager.toolbarModel
        });
    },

    /**
     * Creates toolbar resize handler view and returns it.
     * @returns {module:view/toolbar/resizeHandler} - New resize hander view instance
     */
    createToolbarResizeHandler: function() {
        return new ToolbarResizeHandlerView({
            dimensionModel: this.modelManager.dimensionModel
        });
    },

    /**
     * Creates state layer view and returns it.
     * @returns {module:view/stateLayer} - New state layer view instance
     */
    createStateLayer: function() {
        return new StateLayerView({
            dimensionModel: this.modelManager.dimensionModel,
            renderModel: this.modelManager.renderModel
        });
    },

    /**
     * Creates clipboard view and returns it.
     * @returns {module:view/clipboard} - New clipboard view instance
     */
    createClipboard: function() {
        return new ClipboardView({
            columnModel: this.modelManager.columnModel,
            dataModel: this.modelManager.dataModel,
            dimensionModel: this.modelManager.dimensionModel,
            selectionModel: this.modelManager.selectionModel,
            focusModel: this.modelManager.focusModel,
            renderModel: this.modelManager.renderModel,
            painterManager: this.modelManager.painterManager
        });
    },

    /**
     * Creates frame view and returns it.
     * @param  {String} whichSide - 'L'(left) or 'R'(right)
     * @returns {module:view/layout/frame} New frame view instance
     */
    createFrame: function(whichSide) {
        var Constructor = whichSide === 'L' ? LsideFrameView : RsideFrameView;

        return new Constructor({
            dimensionModel: this.modelManager.dimensionModel,
            renderModel: this.modelManager.renderModel,
            viewFactory: this
        });
    },

    /**
     * Creates header view and returns it.
     * @param  {String} whichSide - 'L'(left) or 'R'(right)
     * @returns {module:view/layout/header} New header view instance
     */
    createHeader: function(whichSide) {
        return new HeaderView({
            whichSide: whichSide,
            renderModel: this.modelManager.renderModel,
            dimensionModel: this.modelManager.dimensionModel,
            focusModel: this.modelManager.focusModel,
            selectionModel: this.modelManager.selectionModel,
            dataModel: this.modelManager.dataModel,
            columnModel: this.modelManager.columnModel,
            viewFactory: this
        });
    },

    /**
     * Creates resize handler of header view and returns it.
     * @param  {String} whichSide - 'L'(left) or 'R'(right)
     * @returns {module:view/layout/header} New resize handler view instance
     */
    createHeaderResizeHandler: function(whichSide) {
        return new HeaderResizeHandlerView({
            whichSide: whichSide,
            dimensionModel: this.modelManager.dimensionModel,
            columnModel: this.modelManager.columnModel
        });
    },

    /**
     * Creates body view and returns it.
     * @param  {String} whichSide - 'L'(left) or 'R'(right)
     * @returns {module:view/layout/body} New body view instance
     */
    createBody: function(whichSide) {
        return new BodyView({
            whichSide: whichSide,
            renderModel: this.modelManager.renderModel,
            dimensionModel: this.modelManager.dimensionModel,
            dataModel: this.modelManager.dataModel,
            columnModel: this.modelManager.columnModel,
            selectionModel: this.modelManager.selectionModel,
            focusModel: this.modelManager.focusModel,
            viewFactory: this
        });
    },

    /**
     * Creates body-table view and returns it.
     * @param  {String} whichSide - 'L'(left) or 'R'(right)
     * @returns {module:view/layout/bodyTable} New body-table view instance
     */
    createBodyTable: function(whichSide) {
        return new BodyTableView({
            whichSide: whichSide,
            dimensionModel: this.modelManager.dimensionModel,
            renderModel: this.modelManager.renderModel,
            columnModel: this.modelManager.columnModel,
            painterManager: this.painterManager,
            viewFactory: this
        });
    },

    /**
     * Creates row list view and returns it.
     * @param  {Object} options - Options
     * @param  {jQuery} options.el - jquery object wrapping tbody html element
     * @param  {String} options.whichSide - 'L'(left) or 'R'(right)
     * @param  {module:view/layout/bodyTable} options.bodyTableView - body table view
     * @returns {module:view/rowList} New row list view instance
     */
    createRowList: function(options) {
        return new RowListView({
            el: options.el,
            whichSide: options.whichSide,
            bodyTableView: options.bodyTableView,
            dataModel: this.modelManager.dataModel,
            columnModel: this.modelManager.columnModel,
            dimensionModel: this.modelManager.dimensionModel,
            selectionModel: this.modelManager.selectionModel,
            renderModel: this.modelManager.renderModel,
            focusModel: this.modelManager.focusModel,
            painterManager: this.painterManager
        });
    },

    /**
     * Creates selection view and returns it.
     * @param  {String} whichSide - 'L'(left) or 'R'(right)
     * @returns {module:view/selectionLayer} New selection layer view instance
     */
    createSelectionLayer: function(whichSide) {
        return new SelectionLayerView({
            whichSide: whichSide,
            selectionModel: this.modelManager.selectionModel,
            dimensionModel: this.modelManager.dimensionModel,
            columnModel: this.modelManager.columnModel
        });
    },

    /**
     * Creates editing layer view and returns it.
     * @returns {module:view/editingLayer}
     */
    createEditingLayer: function() {
        return new EditingLayerView({
            renderModel: this.modelManager.renderModel,
            inputPainters: this.painterManager.getInputPainters(true),
            domState: this.domState
        });
    }
});

module.exports = ViewFactory;

},{"./clipboard":38,"./container":39,"./editingLayer":40,"./layout/body":42,"./layout/bodyTable":43,"./layout/frame-lside":44,"./layout/frame-rside":45,"./layout/header":47,"./layout/resizeHandler":48,"./layout/toolbar":49,"./layout/toolbar/controlPanel":50,"./layout/toolbar/pagination":51,"./layout/toolbar/resizeHandler":52,"./rowList":53,"./selectionLayer":54,"./stateLayer":55}],42:[function(require,module,exports){
/**
 * @fileoverview Class for the body layout
 * @author NHN Ent. FE Development Team
 */
'use strict';

var View = require('../../base/view'),
    util = require('../../common/util');

var HTML_CONTAINER = '<div class="body_container"></div>',

    // Minimum time (ms) to detect if an alert or confirm dialog has been displayed.
    MIN_INTERVAL_FOR_PAUSED = 200,

    // Minimum distance (pixel) to detect if user wants to drag when moving mouse with button pressed.
    MIN_DISATNCE_FOR_DRAG = 10;

/**
 * Class for the body layout
 * @module view/layout/body
 * @extends module:base/view
 */
var Body = View.extend(/**@lends module:view/layout/body.prototype */{
    /**
     * @constructs
     * @param {Object} options - Options
     * @param {String} [options.whichSide='R'] L or R (which side)
     */
    initialize: function(options) {
        View.prototype.initialize.call(this);

        this.setOwnProperties({
            dimensionModel: options.dimensionModel,
            dataModel: options.dataModel,
            columnModel: options.columnModel,
            renderModel: options.renderModel,
            selectionModel: options.selectionModel,
            focusModel: options.focusModel,
            viewFactory: options.viewFactory,

            // DIV for setting rendering position of entire child-nodes of $el.
            $container: null,
            whichSide: options && options.whichSide || 'R'
        });

        this.listenTo(this.dimensionModel, 'change:bodyHeight', this._onBodyHeightChange)
            .listenTo(this.dataModel, 'add remove reset', this._resetContainerHeight)
            .listenTo(this.renderModel, 'change:scrollTop', this._onScrollTopChange)
            .listenTo(this.renderModel, 'change:scrollLeft', this._onScrollLeftChange);
    },

    tagName: 'div',

    className: 'data',

    events: {
        'scroll': '_onScroll',
        'mousedown .body_container': '_onMouseDown'
    },

    /**
     * Event handler for 'change:bodyHeight' event on module:model/dimension
     * @param {Object} model - changed model
     * @param {Number} value - new height value
     * @private
     */
    _onBodyHeightChange: function(model, value) {
        this.$el.css('height', value + 'px');
    },

    /**
     * Resets the height of a container DIV
     * @private
     */
    _resetContainerHeight: function() {
        this.$container.css({
            height: this.dimensionModel.get('totalRowHeight')
        });
    },

    /**
     * Event handler for 'scroll' event on DOM
     * @param {UIEvent} event - event object
     * @private
     */
    _onScroll: function(event) {
        var attrs = {
            scrollTop: event.target.scrollTop
        };

        if (this.whichSide === 'R') {
            attrs.scrollLeft = event.target.scrollLeft;
        }
        this.renderModel.set(attrs);
    },

    /**
     * Event handler for 'change:scrollLeft' event on module:model/renderer
     * @param {Object} model - changed model
     * @param {Number} value - new scrollLeft value
     * @private
     */
    _onScrollLeftChange: function(model, value) {
        if (this.whichSide === 'R') {
            this.el.scrollLeft = value;
        }
    },

    /**
     * Event handler for 'chage:scrollTop' event on module:model/renderer
     * @param {Object} model - changed model instance
     * @param {Number} value - new scrollTop value
     * @private
     */
    _onScrollTopChange: function(model, value) {
        this.el.scrollTop = value;
    },

    /**
     * Returns the name of the visible data columns at given index
     * @param  {Number} columnIndex - Column index
     * @returns {String} - Column name
     * @private
     */
    _getColumnNameByVisibleIndex: function(columnIndex) {
        var columns = this.columnModel.getVisibleColumnModelList(null, false);
        return columns[columnIndex].columnName;
    },

    /**
     * Mousedown event handler
     * @param {MouseEvent} event - Mousedown event
     * @private
     */
    _onMouseDown: function(event) {
        var columnModel = this.columnModel,
            $target = $(event.target),
            $td = $target.closest('td'),
            $tr = $target.closest('tr'),
            columnName = $td.attr('data-column-name'),
            rowKey = $tr.attr('key'),
            startAction = true,
            inputData = _.pick(event, 'pageX', 'pageY', 'shiftKey'),
            indexData;

        if (!$td.length) { // selection layer
            indexData = this.dimensionModel.getIndexFromMousePosition(event.pageX, event.pageY);
            columnName = this._getColumnNameByVisibleIndex(indexData.column);
        } else if (rowKey && columnName) { // valid cell
            indexData = {
                column: columnModel.indexOfColumnName(columnName, true),
                row: this.dataModel.indexOfRowKey(rowKey)
            };
            if (this.columnModel.get('selectType') === 'radio') {
                this.dataModel.check(indexData.row);
            }
        } else { // dummy cell
            startAction = false;
        }

        if (startAction) {
            this._controlStartAction(inputData, indexData, columnName, $target.is('input'));
        }
    },

    /**
     * Control selection action when started
     * @param {Object} inputData - Mouse position X
     * @param   {number} inputData.pageY - Mouse position Y
     * @param   {number} inputData.pageY - Mouse position Y
     * @param   {boolean} inputData.shiftKey - Whether the shift-key is pressed.
     * @param {{column:number, row:number}} indexData - Index map object
     * @param {String} columnName - column name
     * @param {boolean} isInput - Whether the target is input element.
     * @private
     */
    _controlStartAction: function(inputData, indexData, columnName, isInput) {
        var selectionModel = this.selectionModel,
            columnIndex = indexData.column,
            rowIndex = indexData.row,
            startDrag = true;

        if (!selectionModel.isEnabled()) {
            return;
        }

        if (!util.isMetaColumn(columnName)) {
            selectionModel.setState('cell');
            if (inputData.shiftKey && !isInput) {
                selectionModel.update(rowIndex, columnIndex);
            } else {
                startDrag = this._doFocusAtAndCheckDraggable(rowIndex, columnIndex);
                selectionModel.end();
            }
        } else if (columnName === '_number') {
            this._updateSelectionByRow(rowIndex, inputData.shiftKey);
        } else {
            startDrag = false;
        }

        if (!isInput && startDrag) {
            this._attachDragEvents(inputData.pageX, inputData.pageY);
        }
    },

    /**
     * Update selection model by row unit.
     * @param {number} rowIndex - row index
     * @param {boolean} shiftKey - true if the shift key is pressed
     * @private
     */
    _updateSelectionByRow: function(rowIndex, shiftKey) {
        if (shiftKey) {
            this.selectionModel.update(rowIndex, 0, 'row');
        } else {
            this.selectionModel.selectRow(rowIndex);
        }
    },

    /**
     * Executes the `focusModel.focusAt()` and returns the boolean value which indicates whether to start drag.
     * @param {number} rowIndex - row index
     * @param {number} columnIndex - column index
     * @returns {boolean}
     * @private
     */
    _doFocusAtAndCheckDraggable: function(rowIndex, columnIndex) {
        var startTime = (new Date()).getTime(),
            focusSuccessed = this.focusModel.focusAt(rowIndex, columnIndex),
            endTime = (new Date()).getTime(),
            hasPaused = (endTime - startTime) > MIN_INTERVAL_FOR_PAUSED;

        if (!focusSuccessed || hasPaused) {
            return false;
        }
        return true;
    },

    /**
     * Attach event handlers for drag event.
     * @param {Number} pageX - initial pageX value
     * @param {Number} pageY - initial pageY value
     * @private
     */
    _attachDragEvents: function(pageX, pageY) {
        this.setOwnProperties({
            mouseDownX: pageX,
            mouseDownY: pageY
        });
        $(document)
            .on('mousemove', $.proxy(this._onMouseMove, this))
            .on('mouseup', $.proxy(this._detachDragEvents, this))
            .on('selectstart', $.proxy(this._onSelectStart, this));
    },

    /**
     * Detach all handlers which are used for drag event.
     * @private
     */
    _detachDragEvents: function() {
        this.selectionModel.stopAutoScroll();
        $(document)
            .off('mousemove', this._onMouseMove)
            .off('mouseup', this._detachDragEvents)
            .off('selectstart', this._onSelectStart);
    },

    /**
     * Event handler for 'mousemove' event during drag
     * @param {MouseEvent} event - MouseEvent object
     * @private
     */
    _onMouseMove: function(event) {
        var selectionModel = this.selectionModel,
            pageX = event.pageX,
            pageY = event.pageY,
            dragged = this._getMouseMoveDistance(pageX, pageY) > MIN_DISATNCE_FOR_DRAG;

        if (selectionModel.hasSelection() || dragged) {
            selectionModel.updateByMousePosition(pageX, pageY);
        }
    },

    /**
     * Returns the distance between 'mousedown' position and specified position.
     * @param {number} pageX - X position relative to the document
     * @param {number} pageY - Y position relative to the document
     * @returns {number} Distance
     * @private
     */
    _getMouseMoveDistance: function(pageX, pageY) {
        var dx = Math.abs(this.mouseDownX - pageX),
            dy = Math.abs(this.mouseDownY - pageY);

        return Math.round(Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2)));
    },

    /**
     * Event handler to prevent default action on `selectstart` event.
     * @param {Event} event - event object
     * @returns {boolean} false
     * @private
     */
    _onSelectStart: function(event) {
        event.preventDefault();
        return false;
    },

    /**
     * renders
     * @returns {View.Layout.Body}   자기 자신
     */
    render: function() {
        var whichSide = this.whichSide;

        this._destroyChildren();

        if (!this.dimensionModel.get('scrollX')) {
            this.$el.css('overflow-x', 'hidden');
        }
        if (!this.dimensionModel.get('scrollY') && whichSide === 'R') {
            this.$el.css('overflow-y', 'hidden');
        }
        this.$el.css('height', this.dimensionModel.get('bodyHeight'));

        this.$container = $(HTML_CONTAINER);
        this.$el.append(this.$container);

        this._addChildren([
            this.viewFactory.createBodyTable(whichSide),
            this.viewFactory.createSelectionLayer(whichSide)
        ]);
        this.$container.append(this._renderChildren());
        this._resetContainerHeight();
        return this;
    }
});

module.exports = Body;

},{"../../base/view":7,"../../common/util":11}],43:[function(require,module,exports){
/**
 * @fileoverview Class for the table layout in the body(data) area
 * @author NHN Ent. FE Development Team
 */
'use strict';

var View = require('../../base/view');
var util = require('../../common/util');
var dimensionConstMap = require('../../common/constMap').dimension;

var CELL_BORDER_WIDTH = dimensionConstMap.CELL_BORDER_WIDTH;

/**
 * Class for the table layout in the body(data) area
 * @module view/layout/bodyTable
 * @extends module:base/view
 */
var BodyTable = View.extend(/**@lends module:view/layout/bodyTable.prototype */{
    /**
     * @constructs
     * @param {Object} options - Options
     * @param {String} [options.whichSide='R'] L or R (which side)
     */
    initialize: function(options) {
        View.prototype.initialize.call(this);

        this.setOwnProperties({
            dimensionModel: options.dimensionModel,
            renderModel: options.renderModel,
            columnModel: options.columnModel,
            viewFactory: options.viewFactory,
            painterManager: options.painterManager,
            whichSide: options.whichSide || 'R'
        });

        this.listenTo(this.dimensionModel, 'columnWidthChanged', this._onColumnWidthChanged);

        // To prevent issue of appearing vertical scrollbar when dummy rows exists
        this.listenTo(this.renderModel, 'change:dummyRowCount', this._resetOverflow);
        this.listenTo(this.dimensionModel, 'change:bodyHeight', this._resetHeight);

        this._attachAllTableEventHandlers();
    },

    tagName: 'div',

    className: 'table_container',

    template: _.template(
        '<table width="100%" border="0" cellspacing="1" cellpadding="0" bgcolor="#EFEFEF">' +
        '   <colgroup><%=colGroup%></colgroup>' +
        '   <tbody><%=tbody%></tbody>' +
        '</table>'),

    /**
     * Event handler for 'columnWidthChanged' event on a dimension model.
     * @private
     */
    _onColumnWidthChanged: function() {
        var columnWidthList = this.dimensionModel.getColumnWidthList(this.whichSide),
            $colList = this.$el.find('col'),
            totalWidth = 0;

        _.each(columnWidthList, function(width, index) {
            $colList.eq(index).css('width', width - BodyTable.EXTRA_WIDTH);
            totalWidth += width + CELL_BORDER_WIDTH;
        }, this);

        // to solve the overflow issue in IE7
        // (don't automatically expand to child's width when overflow:hidden)
        if (util.isBrowserIE7()) {
            this.$el.width(totalWidth);
        }
    },

    /**
     * Resets the overflow of element based on the dummyRowCount in renderModel.
     * @private
     */
    _resetOverflow: function() {
        var overflow = 'visible';

        if (this.renderModel.get('dummyRowCount') > 0) {
            overflow = 'hidden';
        }
        this.$el.css('overflow', overflow);
    },

    /**
     * Resets the height of element based on the dummyRowCount in renderModel
     * @private
     */
    _resetHeight: function() {
        var dimensionModel = this.dimensionModel;

        if (this.renderModel.get('dummyRowCount') > 0) {
            this.$el.height(dimensionModel.get('bodyHeight') - dimensionModel.getScrollXHeight());
        } else {
            this.$el.css('height', '');
        }
    },

    /**
     * Reset position of a table container
     * @param {number} top  조정할 top 위치 값
     */
    resetTablePosition: function() {
        this.$el.css('top', this.renderModel.get('top'));
    },

    /**
     * Renders elements
     * @returns {View.Layout.Body} This object
     */
    render: function() {
        this._destroyChildren();

        this.$el.html(this.template({
            colGroup: this._getColGroupMarkup(),
            tbody: ''
        }));

        this._addChildren(this.viewFactory.createRowList({
            bodyTableView: this,
            el: this.$el.find('tbody'),
            whichSide: this.whichSide
        }));
        this._renderChildren();

        // To prevent issue of appearing vertical scrollbar when dummy rows exists
        this._resetHeight();
        this._resetOverflow();
        return this;
    },

    /**
     * 테이블 내부(TR,TD)에서 발생하는 이벤트를 this.el로 넘겨 해당 요소들에게 위임하도록 설정한다.
     * @private
     */
    _attachAllTableEventHandlers: function() {
        var cellPainters = this.painterManager.getCellPainters();

        _.each(cellPainters, function(painter) {
            painter.attachEventHandlers(this.$el, '');
        }, this);
    },

    /**
     * table 요소를 새로 생성한다.
     * (IE7-9에서 tbody의 innerHTML 변경할 수 없는 문제를 해결하여 성능개선을 하기 위해 사용)
     * @param {string} tbodyHtml - tbody의 innerHTML 문자열
     * @returns {jquery} - 새로 생성된 table의 tbody 요소
     */
    redrawTable: function(tbodyHtml) {
        this.$el[0].innerHTML = this.template({
            colGroup: this._getColGroupMarkup(),
            tbody: tbodyHtml
        });

        return this.$el.find('tbody');
    },

    /**
     * Table 열 각각의 width 조정을 위한 columnGroup 마크업을 반환한다.
     * @returns {string} <colgroup> 안에 들어갈 마크업 문자열
     * @private
     */
    _getColGroupMarkup: function() {
        var whichSide = this.whichSide,
            columnWidthList = this.dimensionModel.getColumnWidthList(whichSide),
            columnModelList = this.columnModel.getVisibleColumnModelList(whichSide, true),
            html = '';

        _.each(columnModelList, function(columnModel, index) {
            var name = columnModel.columnName,
                width = columnWidthList[index] - BodyTable.EXTRA_WIDTH;

            html += '<col data-column-name="' + name + '" style="width:' + width + 'px">';
        });
        return html;
    }
}, {
    // IE7에서만 TD의 padding 만큼 넓이가 늘어나는 버그를 위한 예외처리를 위한 값
    EXTRA_WIDTH: util.isBrowserIE7() ? 20 : 0 // eslint-disable-line no-magic-numbers
});

module.exports = BodyTable;

},{"../../base/view":7,"../../common/constMap":8,"../../common/util":11}],44:[function(require,module,exports){
/**
 * @fileoverview Left Side Frame
 * @author NHN Ent. FE Development Team
 */
'use strict';

var Frame = require('./frame');

/**
 * Left Side Frame
 * @module view/layout/frame-lside
 * @extends module:view/layout/frame
 */
var LsideFrame = Frame.extend(/**@lends module:view/layout/frame-lside.prototype */{
    /**
     * @constructs
     */
    initialize: function() {
        Frame.prototype.initialize.apply(this, arguments);
        this.setOwnProperties({
            whichSide: 'L'
        });
    },

    className: 'lside_area',

    /**
     * Event handler for 'changeColumnWidth' event on module:model/dimension
     * @override
     * @private
     */
    _onColumnWidthChanged: function() {
        this.$el.css({
            width: this.dimensionModel.get('lsideWidth')
        });
    },

    /**
     * To be called at the beginning of the 'render' method.
     * @override
     */
    beforeRender: function() {
        this.$el.css({
            display: 'block',
            width: this.dimensionModel.get('lsideWidth')
        });
    },

    /**
     * To be called at the end of the 'render' method.
     * @override
     */
    afterRender: function() {
        var dimensionModel = this.dimensionModel,
            $scrollOverlay;  // overlay DIV to hide scrollbar UI

        if (!dimensionModel.get('scrollX')) {
            return;
        }

        $scrollOverlay = $('<div>')
            .addClass('scrollbar_overlay')
            .css('bottom', dimensionModel.get('toolbarHeight'));
        this.$el.append($scrollOverlay);
    }
});

module.exports = LsideFrame;

},{"./frame":46}],45:[function(require,module,exports){
/**
 * @fileoverview Right Side Frame
 * @author NHN Ent. FE Development Team
 */
'use strict';

var Frame = require('./frame');
var CELL_BORDER_WIDTH = require('../../common/constMap').dimension.CELL_BORDER_WIDTH;

/**
 * right side frame class
 * @module view/layout/frame-rside
 * @extends module:view/layout/frame
 */
var RsideFrame = Frame.extend(/**@lends module:view/layout/frame-rside.prototype */{
    /**
     * @constructs
     */
    initialize: function() {
        Frame.prototype.initialize.apply(this, arguments);
        this.setOwnProperties({
            whichSide: 'R',
            $scrollBorder: null
        });
        this.listenTo(this.dimensionModel, 'change:bodyHeight change:headerHeight',
            this._resetScrollBorderHeight);
    },

    className: 'rside_area',

    /**
     * Event handler for 'columnWidthChanged' event on dimensionModel
     * @private
     * @override
     */
    _onColumnWidthChanged: function() {
        this._refreshLayout();
    },

    /**
     * Refresh layout
     * @private
     */
    _refreshLayout: function() {
        var dimensionModel = this.dimensionModel,
            width = dimensionModel.get('rsideWidth'),
            marginLeft = dimensionModel.get('lsideWidth');

        // If left side exists and the division border should not be doubled,
        // right side should be covered border-width by left side to hide left border of the right side.
        if (marginLeft > 0 && !dimensionModel.isDivisionBorderDoubled()) {
            width += CELL_BORDER_WIDTH;
            marginLeft -= CELL_BORDER_WIDTH;
        }

        this.$el.css({
            width: width,
            marginLeft: marginLeft
        });
    },

    /**
     * Resets the height of a vertical scroll-bar border
     * @private
     */
    _resetScrollBorderHeight: function() {
        var dimensionModel, height;

        if (this.$scrollBorder) {
            dimensionModel = this.dimensionModel;
            height = dimensionModel.get('bodyHeight') - dimensionModel.getScrollXHeight();
            this.$scrollBorder.height(height);
        }
    },

    /**
     * To be called at the beginning of the 'render' method.
     * @override
     */
    beforeRender: function() {
        this.$el.css('display', 'block');
        this._refreshLayout();
    },

    /**
     * To be called at the end of the 'render' method.
     * @override
     */
    afterRender: function() {
        var dimensionModel = this.dimensionModel,
            $space, $scrollBorder, $scrollCorner,
            headerHeight;

        if (!dimensionModel.get('scrollY')) {
            return;
        }
        headerHeight = dimensionModel.get('headerHeight');

        // Empty DIV for hiding scrollbar in the header area
        $space = $('<div />').addClass('header_space');

        // Empty DIV for showing a left-border of vertical scrollbar in the body area
        $scrollBorder = $('<div />').addClass('scrollbar_border');


        $space.height(headerHeight - 2); // subtract 2px for border-width (top and bottom)
        $scrollBorder.css('top', headerHeight + 'px');

        this.$el.append($space, $scrollBorder);

        // Empty DIV for filling gray color in the right-bottom corner of the scrollbar.
        // (For resolving the issue that styling scrollbar-corner with '-webkit-scrollbar-corner'
        //  casues to be stuck in the same position in Chrome)
        if (dimensionModel.get('scrollX')) {
            $scrollCorner = $('<div />')
                .addClass('scrollbar_corner')
                .css('bottom', dimensionModel.get('toolbarHeight'));
            this.$el.append($scrollCorner);
        }

        this.$scrollBorder = $scrollBorder;
        this._resetScrollBorderHeight();
    }
});

module.exports = RsideFrame;

},{"../../common/constMap":8,"./frame":46}],46:[function(require,module,exports){
/**
 * @fileoverview Frame Base
 * @author NHN Ent. FE Development Team
 */
'use strict';

var View = require('../../base/view');

/**
 * Base class for frame view.
 * @module view/layout/frame
 * @extends module:base/view
 */
var Frame = View.extend(/**@lends module:view/layout/frame.prototype */{
    /**
     * @constructs
     * @param {Object} options Options
     *      @param {String} [options.whichSide='R'] 'R' for Right side, 'L' for Left side
     */
    initialize: function(options) {
        View.prototype.initialize.call(this);

        this.setOwnProperties({
            viewFactory: options.viewFactory,
            renderModel: options.renderModel,
            dimensionModel: options.dimensionModel,
            whichSide: options.whichSide || 'R'
        });

        this.listenTo(this.renderModel, 'columnModelChanged', this.render, this)
            .listenTo(this.dimensionModel, 'columnWidthChanged', this._onColumnWidthChanged, this);
    },

    tagName: 'div',

    className: 'lside_area',

    /**
     * Render
     * @returns {module:view/layout/frame} This object
     */
    render: function() {
        var factory = this.viewFactory;

        this.$el.empty();
        this._destroyChildren();

        this.beforeRender();
        this._addChildren([
            factory.createHeader(this.whichSide),
            factory.createBody(this.whichSide)
        ]);
        this.$el.append(this._renderChildren());
        this.afterRender();

        return this;
    },

    /**
     * Event handler for 'columnWidthChanged' event on module:module/dimension
     * @abstract
     * @private
     */
    _onColumnWidthChanged: function() {},

    /**
     * To be called at the beginning of the 'render' method.
     * @abstract
     */
    beforeRender: function() {},

    /**
     * To be called at the end of the 'render' method.
     * @abstract
     */
    afterRender: function() {}
});

module.exports = Frame;

},{"../../base/view":7}],47:[function(require,module,exports){
/**
 * @fileoverview Header 관련
 * @author NHN Ent. FE Development Team
 */
'use strict';

var View = require('../../base/view'),
    util = require('../../common/util');

var CLASSNAME_SELECTED = 'selected',
    DELAY_SYNC_CHECK = 10;

/**
 * Header 레이아웃 View
 * @module view/layout/header
 * @extends module:base/view
 */
var Header = View.extend(/**@lends module:view/layout/header.prototype */{
    /**
     * @constructs
     * @param {Object} options 옵션
     * @param {String} [options.whichSide='R']  어느 영역의 header 인지 여부.
     */
    initialize: function(options) {
        View.prototype.initialize.call(this);

        this.setOwnProperties({
            renderModel: options.renderModel,
            dimensionModel: options.dimensionModel,
            selectionModel: options.selectionModel,
            focusModel: options.focusModel,
            columnModel: options.columnModel,
            dataModel: options.dataModel,
            viewFactory: options.viewFactory,
            timeoutForAllChecked: 0,
            whichSide: options.whichSide || 'R'
        });

        this.listenTo(this.renderModel, 'change:scrollLeft', this._onScrollLeftChange)
            .listenTo(this.dimensionModel, 'columnWidthChanged', this._onColumnWidthChanged)
            .listenTo(this.selectionModel, 'change:range', this._refreshSelectedHeaders)
            .listenTo(this.focusModel, 'change:columnName', this._refreshSelectedHeaders)
            .listenTo(this.dataModel, 'change:_button', this._onCheckCountChange)
            .listenTo(this.dataModel, 'sortChanged', this._updateBtnSortState);
    },

    tagName: 'div',

    className: 'header',

    events: {
        'click': '_onClick',
        'mousedown th[columnName]': '_onMouseDown'
    },

    /**
     * 전체 template
     */
    template: _.template(
        '<table width="100%" border="0" cellspacing="1" cellpadding="0" bgcolor="#EFEFEF">' +
            '<colgroup><%=colGroup%></colgroup>' +
            '<tbody><%=tBody%></tbody>' +
        '</table>'
    ),

    /**
     * <th> 템플릿
     */
    templateHeader: _.template(
        '<th data-column-name="<%=columnName%>" ' +
            'class="<%=className%>" ' +
            'height="<%=height%>" ' +
            '<%if(colspan > 0) {%>' +
               'colspan=<%=colspan%> ' +
            '<%}%>' +
            '<%if(rowspan > 0) {%>' +
                'rowspan=<%=rowspan%> ' +
            '<%}%>' +
        '>' +
        '<%=title%><%=btnSort%>' +
        '</th>'
    ),

    /**
     * <col> 템플릿
     */
    templateCol: _.template(
        '<col ' +
            'data-column-name="<%=columnName%>" ' +
            'style="width:<%=width%>px">'
    ),

    /**
     * 정렬 버튼을 위한 HTML 마크업
     */
    markupBtnSort: '<a class="btn_sorting"></a>',

    /**
     * col group 마크업을 생성한다.
     * @returns {string} <colgroup>에 들어갈 html 마크업 스트링
     * @private
     */
    _getColGroupMarkup: function() {
        var columnData = this._getColumnData(),
            columnWidthList = columnData.widthList,
            columnModelList = columnData.modelList,
            htmlList = [];

        _.each(columnWidthList, function(width, index) {
            htmlList.push(this.templateCol({
                columnName: columnModelList[index].columnName,
                width: width
            }));
        }, this);
        return htmlList.join('');
    },

    /**
     * Returns an array of names of columns in selection range.
     * @private
     * @returns {Array.<String>}
     */
    _getSelectedColumnNames: function() {
        var columnRange = this.selectionModel.get('range').column,
            visibleColumns = this.columnModel.getVisibleColumnModelList(),
            selectedColumns = visibleColumns.slice(columnRange[0], columnRange[1] + 1);

        return _.pluck(selectedColumns, 'columnName');
    },

    /**
     * Returns an array of names of merged-column which contains every column name in the given array.
     * @param {Array.<String>} columnNames - an array of column names to test
     * @returns {Array.<String>}
     * @private
     */
    _getContainingMergedColumnNames: function(columnNames) {
        var columnModel = this.columnModel,
            mergedColumnNames = _.pluck(columnModel.get('columnMerge'), 'columnName');

        return _.filter(mergedColumnNames, function(mergedColumnName) {
            var unitColumnNames = columnModel.getUnitColumnNamesIfMerged(mergedColumnName);
            return _.every(unitColumnNames, function(name) {
                return _.contains(columnNames, name);
            });
        });
    },

    /**
     * Refreshes selected class of every header element (th)
     * @private
     */
    _refreshSelectedHeaders: function() {
        var $ths = this.$el.find('th'),
            columnNames, mergedColumnNames;

        if (this.selectionModel.hasSelection()) {
            columnNames = this._getSelectedColumnNames();
        } else if (this.focusModel.has(true)) {
            columnNames = [this.focusModel.get('columnName')];
        }

        $ths.removeClass(CLASSNAME_SELECTED);
        if (columnNames) {
            mergedColumnNames = this._getContainingMergedColumnNames(columnNames);
            _.each(columnNames.concat(mergedColumnNames), function(columnName) {
                $ths.filter('[data-column-name=' + columnName + ']').addClass(CLASSNAME_SELECTED);
            });
        }
    },

    /**
     * Mousedown event handler
     * @param {jQuery.Event} event - MouseDown event
     * @private
     */
    _onMouseDown: function(event) {
        var columnName, columnNames;

        if (!this.selectionModel.isEnabled() || $(event.target).is('a.btn_sorting')) {
            return;
        }

        columnName = $(event.target).closest('th').attr('columnName');
        columnNames = this.columnModel.getUnitColumnNamesIfMerged(columnName);

        if (!this._hasMetaColumn(columnNames)) {
            this._controlStartAction(columnNames, event.pageX, event.pageY, event.shiftKey);
        }
    },

    /**
     * Control selection action when started
     * @param {Array} columnNames - An array of column names
     * @param {number} pageX - Mouse position X
     * @param {number} pageY - Mouse position Y
     * @param {boolean} shiftKey - Whether the shift-key is pressed.
     * @private
     */
    _controlStartAction: function(columnNames, pageX, pageY, shiftKey) {
        var columnModel = this.columnModel,
            columnIndexes = _.map(columnNames, function(name) {
                return columnModel.indexOfColumnName(name, true);
            });

        if (shiftKey) {
            this._startColumnSelectionWithShiftKey(columnIndexes, pageX, pageY);
        } else {
            this._startColumnSelectionWithoutShiftKey(columnIndexes);
        }
        this._attachDragEvents();
    },

    /**
     * Start column selection with shiftKey pressed
     * @param {Array.<number>} columnIndexes - Indexes of columns
     * @param {number} pageX - Mouse position X
     * @param {number} pageY - Mouse position Y
     * @private
     */
    _startColumnSelectionWithShiftKey: function(columnIndexes, pageX, pageY) {
        var selectionModel = this.selectionModel,
            max = Math.max.apply(null, columnIndexes);

        selectionModel.update(0, max, 'column');
        selectionModel.extendColumnSelection(columnIndexes, pageX, pageY);
    },

    /**
     * Start column selection when shiftKey is not pressed
     * @param {Array.<number>} columnIndexes - Indexes of columns
     * @private
     */
    _startColumnSelectionWithoutShiftKey: function(columnIndexes) {
        var selectionModel = this.selectionModel,
            minMax = util.getMinMax(columnIndexes),
            min = minMax.min,
            max = minMax.max;

        selectionModel.setMinimumColumnRange([min, max]);
        selectionModel.selectColumn(min);
        selectionModel.update(0, max);
    },

    /**
     * Attach mouse drag event
     * @private
     */
    _attachDragEvents: function() {
        $(document)
            .on('mousemove', $.proxy(this._onMouseMove, this))
            .on('mouseup', $.proxy(this._detachDragEvents, this))
            .on('selectstart', $.proxy(this._onSelectStart, this));
    },

    /**
     * Detach mouse drag event
     * @private
     */
    _detachDragEvents: function() {
        this.selectionModel.stopAutoScroll();
        $(document)
            .off('mousemove', this._onMouseMove)
            .off('mouseup', this._detachDragEvents)
            .off('selectstart', this._onSelectStart);
    },

    /**
     * Mousemove event handler
     * @param {jQuery.Event} event - MouseMove event
     * @private
     */
    _onMouseMove: function(event) {
        var columnModel = this.columnModel,
            isExtending = true,
            columnName = $(event.target).closest('th').attr('columnName'),
            columnNames, columnIndexes;

        if (columnName) {
            columnNames = columnModel.getUnitColumnNamesIfMerged(columnName);
            columnIndexes = _.map(columnNames, function(name) {
                return columnModel.indexOfColumnName(name, true);
            });
        } else if ($.contains(this.el, event.target)) {
            isExtending = false;
        }

        if (isExtending) {
            this.selectionModel.extendColumnSelection(columnIndexes, event.pageX, event.pageY);
        }
    },

    /**
     * Whether this columnNames array has a meta column name.
     * @param {Array} columnNames - An array of column names
     * @returns {boolean} Has a meta column name or not.
     * @private
     */
    _hasMetaColumn: function(columnNames) {
        return _.some(columnNames, function(name) {
            return util.isMetaColumn(name);
        });
    },

    /**
     * Selectstart event handler
     * @param {jQuery.Event} event - Mouse event
     * @returns {boolean} false for preventDefault
     * @private
     */
    _onSelectStart: function(event) {
        event.preventDefault();
        return false;
    },

    /**
     * 그리드의 checkCount 가 변경되었을 때 수행하는 헨들러
     * @private
     */
    _onCheckCountChange: function() {
        if (this.columnModel.get('selectType') === 'checkbox') {
            clearTimeout(this.timeoutForAllChecked);
            this.timeoutForAllChecked = setTimeout($.proxy(this._syncCheckState, this), DELAY_SYNC_CHECK);
        }
    },

    /**
     * selectType 이 checkbox 일 때 랜더링 되는 header checkbox 엘리먼트를 반환한다.
     * @returns {jQuery} _butoon 컬럼 헤더의 checkbox input 엘리먼트
     * @private
     */
    _getHeaderMainCheckbox: function() {
        return this.$el.find('th[data-column-name="_button"] input');
    },

    /**
     * header 영역의 input 상태를 실제 checked 된 count 에 맞추어 반영한다.
     * @private
     */
    _syncCheckState: function() {
        var $input, enableCount, checkedCount;

        if (!this.columnModel || this.columnModel.get('selectType') !== 'checkbox') {
            return;
        }

        $input = this._getHeaderMainCheckbox();
        if (!$input.length) {
            return;
        }

        enableCount = 0;
        checkedCount = this.dataModel.getRowList(true).length;
        this.dataModel.forEach(function(row) {
            var cellState = row.getCellState('_button');
            if (!cellState.isDisabled && cellState.isEditable) {
                enableCount += 1;
            }
        }, this);
        $input.prop('checked', enableCount === checkedCount);
    },

    /**
     * column width 변경시 col 엘리먼트들을 조작하기 위한 헨들러
     * @private
     */
    _onColumnWidthChanged: function() {
        var columnData = this._getColumnData(),
            columnWidthList = columnData.widthList,
            $colList = this.$el.find('col');

        _.each(columnWidthList, function(columnWidth, index) {
            $colList.eq(index).css('width', columnWidth + 'px');
        });
    },

    /**
     * scroll left 값이 변경되었을 때 header 싱크를 맞추는 이벤트 핸들러
     * @param {Object} model    변경이 발생한 model 인스턴스
     * @param {Number} value    scrollLeft 값
     * @private
     */
    /* istanbul ignore next: scrollLeft 를 확인할 수 없음 */
    _onScrollLeftChange: function(model, value) {
        if (this.whichSide === 'R') {
            this.el.scrollLeft = value;
        }
    },

    /**
     * 클릭 이벤트 핸들러
     * @param {jQuery.Event} clickEvent 클릭이벤트
     * @private
     */
    _onClick: function(clickEvent) {
        var $target = $(clickEvent.target),
            columnName = $target.closest('th').attr('data-column-name');

        /* istanbul ignore else */
        if (columnName === '_button' && $target.is('input')) {
            if ($target.prop('checked')) {
                this.dataModel.checkAll();
            } else {
                this.dataModel.uncheckAll();
            }
        } else if ($target.is('a.btn_sorting')) {
            this.dataModel.sortByField(columnName);
        }
    },

    /**
     * 정렬 버튼의 상태를 변경한다.
     * @private
     * @param {object} sortOptions 정렬 옵션
     * @param {string} sortOptions.columnName 정렬할 컬럼명
     * @param {boolean} sortOptions.isAscending 오름차순 여부
     */
    _updateBtnSortState: function(sortOptions) {
        if (this._$currentSortBtn) {
            this._$currentSortBtn.removeClass('sorting_down sorting_up');
        }
        this._$currentSortBtn = this.$el.find('th[data-column-name=' + sortOptions.columnName + '] a.btn_sorting');
        this._$currentSortBtn.addClass(sortOptions.isAscending ? 'sorting_up' : 'sorting_down');
    },

    /**
     * 랜더링
     * @returns {View.Layout.Header} this
     */
    render: function() {
        this._destroyChildren();

        if (this.whichSide === 'R' && !this.dimensionModel.get('scrollY')) {
            this.$el.addClass('no_scroll');
        }

        this.$el.css({
            height: this.dimensionModel.get('headerHeight')
        }).html(this.template({
            colGroup: this._getColGroupMarkup(),
            tBody: this._getTableBodyMarkup()
        }));

        this._addChildren(this.viewFactory.createHeaderResizeHandler(this.whichSide));
        this.$el.append(this._renderChildren());
        return this;
    },

    /**
     * 컬럼 정보를 반환한다.
     * @returns {{widthList: (Array|*), modelList: (Array|*)}}   columnWidthList 와 columnModelList 를 함께 반환한다.
     * @private
     */
    _getColumnData: function() {
        var columnModel = this.columnModel,
            dimensionModel = this.dimensionModel,
            columnWidthList = dimensionModel.getColumnWidthList(this.whichSide),
            columnModelList = columnModel.getVisibleColumnModelList(this.whichSide, true);

        return {
            widthList: columnWidthList,
            modelList: columnModelList
        };
    },

    /**
     * Header 의 body markup 을 생성한다.
     * @returns {string} header 의 테이블 body 영역에 들어갈 html 마크업 스트링
     * @private
     */
    _getTableBodyMarkup: function() {
        var hierarchyList = this._getColumnHierarchyList(),
            maxRowCount = this._getHierarchyMaxRowCount(hierarchyList);
        // 가공한 컬럼 모델 리스트 정보를 바탕으로 컬럼 엘리먼트들에 대한 마크업을 구성한다.
        var headerHeight = this.dimensionModel.get('headerHeight'),
            rowMarkupList = new Array(maxRowCount),
            columnNameList = new Array(maxRowCount),
            colSpanList = [],
            rowHeight = util.getRowHeight(maxRowCount, headerHeight) - 1,
            rowSpan = 1,
            height,
            headerMarkupList;

        _.each(hierarchyList, function(hierarchy, i) {
            var length = hierarchyList[i].length,
                curHeight = 0;
            _.each(hierarchy, function(columnModel, j) {
                var columnName = columnModel.columnName;

                rowSpan = (length - 1 === j && (maxRowCount - length + 1) > 1) ? (maxRowCount - length + 1) : 1;
                height = rowHeight * rowSpan;

                if (j === length - 1) {
                    height = (headerHeight - curHeight) - 2;
                } else {
                    curHeight += height + 1;
                }
                if (columnNameList[j] === columnName) {
                    rowMarkupList[j].pop();
                    colSpanList[j] += 1;
                } else {
                    colSpanList[j] = 1;
                }
                columnNameList[j] = columnName;
                rowMarkupList[j] = rowMarkupList[j] || [];
                rowMarkupList[j].push(this.templateHeader({
                    columnName: columnName,
                    className: columnModel.isRequired ? 'required' : '',
                    height: height,
                    colspan: colSpanList[j],
                    rowspan: rowSpan,
                    title: columnModel.title,
                    btnSort: columnModel.isSortable ? this.markupBtnSort : ''
                }));
            }, this);
        }, this);
        headerMarkupList = _.map(rowMarkupList, function(rowMarkup) {
            return '<tr>' + rowMarkup.join('') + '</tr>';
        });

        return headerMarkupList.join('');
    },

    /**
     * column merge 가 설정되어 있을 때 헤더의 max row count 를 가져온다.
     * @param {Array} hierarchyList 헤더 마크업 생성시 사용될 계층구조 데이터
     * @returns {number} 헤더 영역의 row 최대값
     * @private
     */
    _getHierarchyMaxRowCount: function(hierarchyList) {
        var lengthList = [0];
        _.each(hierarchyList, function(hierarchy) {
            lengthList.push(hierarchy.length);
        }, this);
        return Math.max.apply(Math, lengthList);
    },

    /**
     * column merge 가 설정되어 있을 때 헤더의 계층구조 리스트를 가져온다.
     * @returns {Array}  계층구조 리스트
     * @private
     */
    _getColumnHierarchyList: function() {
        var columnModelList = this._getColumnData().modelList,
            hierarchyList;

        hierarchyList = _.map(columnModelList, function(columnModel) {
            return this._getColumnHierarchy(columnModel).reverse();
        }, this);

        return hierarchyList;
    },

    /**
     * column merge 가 설정되어 있을 때 재귀적으로 돌면서 계층구조를 형성한다.
     *
     * @param {Object} columnModel 컬럼모델
     * @param {Array} [resultList]  결과로 메모이제이션을 이용하기 위한 인자값
     * @returns {Array} 계층구조 결과값
     * @private
     */
    _getColumnHierarchy: function(columnModel, resultList) {
        var columnMergeList = this.columnModel.get('columnMerge');
        resultList = resultList || [];
        /* istanbul ignore else */
        if (columnModel) {
            resultList.push(columnModel);
            /* istanbul ignore else */
            if (columnMergeList) {
                _.each(columnMergeList, function(columnMerge) {
                    if ($.inArray(columnModel.columnName, columnMerge.columnNameList) !== -1) {
                        this._getColumnHierarchy(columnMerge, resultList);
                    }
                }, this);
            }
        }
        return resultList;
    }
});

module.exports = Header;

},{"../../base/view":7,"../../common/util":11}],48:[function(require,module,exports){
/**
 * @fileoverview ResizeHandler for the Header
 * @author NHN Ent. FE Development Team
 */
'use strict';

var View = require('../../base/view');

/**
 * Reside Handler class
 * @module view/layout/resizeHandler
 * @extends module:base/view
 */
var ResizeHandler = View.extend(/**@lends module:view/layout/resizeHandler.prototype */{
    /**
     * @constructs
     * @param {Object} options - Options
     */
    initialize: function(options) {
        this.setOwnProperties({
            dimensionModel: options.dimensionModel,
            columnModel: options.columnModel,
            whichSide: options.whichSide || 'R',

            isResizing: false,
            $target: null,
            differenceLeft: 0,
            initialWidth: 0,
            initialOffsetLeft: 0,
            initialLeft: 0
        });
        this.listenTo(this.dimensionModel, 'change:which columnWidthChanged', this._refreshHandlerPosition);
    },

    tagName: 'div',

    className: 'resize_handle_container',

    events: {
        'mousedown .resize_handle': '_onMouseDown',
        'dblclick .resize_handle': '_onDblClick'
    },

    template: _.template(
        '<div columnindex="<%=columnIndex%>" ' +
        'data-column-name="<%=columnName%>" ' +
        'class="resize_handle' +
        '<% if(isLast === true) ' +
        ' print(" resize_handle_last");%>' +
        '" ' +
        'style="<%=height%>" ' +
        'title="마우스 드래그를 통해 컬럼의 넓이를 변경할 수 있고,더블클릭을 통해 넓이를 초기화할 수 있습니다.">' +
        '</div>'),

    /**
     * Return an object that contains an array of column width and an array of column model.
     * @returns {{widthList: (Array|*), modelList: (Array|*)}} Column Data
     * @private
     */
    _getColumnData: function() {
        var columnModel = this.columnModel,
            dimensionModel = this.dimensionModel,
            columnWidthList = dimensionModel.getColumnWidthList(this.whichSide),
            columnModelList = columnModel.getVisibleColumnModelList(this.whichSide, true);

        return {
            widthList: columnWidthList,
            modelList: columnModelList
        };
    },

    /**
     * Returns the HTML string of all handler.
     * @returns {String}
     * @private
     */
    _getResizeHandlerMarkup: function() {
        var columnData = this._getColumnData(),
            columnModelList = columnData.modelList,
            headerHeight = this.dimensionModel.get('headerHeight'),
            length = columnModelList.length,
            resizeHandleMarkupList;

        resizeHandleMarkupList = _.map(columnModelList, function(columnModel, index) {
            return this.template({
                columnIndex: index,
                columnName: columnModel.columnName,
                isLast: index + 1 === length,
                height: headerHeight
            });
        }, this);
        return resizeHandleMarkupList.join('');
    },

    /**
     * Render
     * @returns {module:view/layout/resizeHandler} This object
     */
    render: function() {
        var headerHeight = this.dimensionModel.get('headerHeight'),
            htmlStr = this._getResizeHandlerMarkup();

        this.$el.empty().show().html(htmlStr).css({
            marginTop: -headerHeight,
            height: headerHeight
        });
        this._refreshHandlerPosition();

        return this;
    },

    /**
     * Refresh the position of every handler.
     * @private
     */
    _refreshHandlerPosition: function() {
        var columnData = this._getColumnData(),
            columnWidthList = columnData.widthList,
            $resizeHandleList = this.$el.find('.resize_handle'),
            $table = this.$el.parent().find('table:first'),
            isChanged = false,
            $handler,
            columnName,
            curPos = 0,
            BORDER_WIDTH = 1,
            HANDLER_WIDTH_HALF = 3,
            width;

        tui.util.forEachArray($resizeHandleList, function(item, index) {
            $handler = $resizeHandleList.eq(index);
            columnName = $handler.attr('data-column-name');
            width = $table.find('th[data-column-name=' + columnName + ']').width();
            if (tui.util.isExisty(width)) {
                isChanged = isChanged || (width !== columnWidthList[index]);
            } else {
                width = columnWidthList[index];
            }
            curPos += width + BORDER_WIDTH;
            $handler.css('left', curPos - HANDLER_WIDTH_HALF);
        });
    },

    /**
     * Returns whether resizing is in progress or not.
     * @returns {boolean}
     * @private
     */
    _isResizing: function() {
        return !!this.isResizing;
    },

    /**
     * Event handler for the 'mousedown' event
     * @param {MouseEvent} mouseEvent - mouse event
     * @private
     */
    _onMouseDown: function(mouseEvent) {
        this._startResizing(mouseEvent);
    },

    /**
     * Event handler for the 'dblclick' event
     * @param {MouseEvent} mouseEvent - mouse event
     * @private
     */
    _onDblClick: function(mouseEvent) {
        var $target = $(mouseEvent.target),
            index = parseInt($target.attr('columnindex'), 10);

        this.dimensionModel.restoreColumnWidth(this._getHandlerColumnIndex(index));
        this._refreshHandlerPosition();
    },

    /**
     * Event handler for the 'mouseup' event
     * @private
     */
    _onMouseUp: function() {
        this._stopResizing();
    },

    /**
     * Event handler for the 'mousemove' event
     * @param {MouseEvent} mouseEvent - mouse event
     * @private
     */
    _onMouseMove: function(mouseEvent) {
        var left, width, index;

        /* istanbul ignore else */
        if (this._isResizing()) {
            mouseEvent.preventDefault();

            left = mouseEvent.pageX - this.initialOffsetLeft;
            width = this._calculateWidth(mouseEvent.pageX);
            index = parseInt(this.$target.attr('columnindex'), 10);

            this.$target.css('left', left + 'px');
            this.dimensionModel.setColumnWidth(this._getHandlerColumnIndex(index), width);
            this._refreshHandlerPosition();
        }
    },

    /**
     * Returns the width of the column based on given mouse position and the initial offset.
     * @param {number} pageX - mouse x position
     * @returns {number}
     * @private
     */
    _calculateWidth: function(pageX) {
        var difference = pageX - this.initialOffsetLeft - this.initialLeft;
        return this.initialWidth + difference;
    },

    /**
     * Find the real index (based on visibility) of the column using index value of the handler and returns it.
     * @param {number} index - index value of the handler
     * @returns {number}
     * @private
     */
    _getHandlerColumnIndex: function(index) {
        return (this.whichSide === 'R') ? (index + this.columnModel.getVisibleColumnFixCount(true)) : index;
    },

    /**
     * Start resizing
     * @param {event} mouseDownEvent - mouse event
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
        $('body').css('cursor', 'col-resize');
        $(document)
            .bind('mousemove', $.proxy(this._onMouseMove, this))
            .bind('mouseup', $.proxy(this._onMouseUp, this));

        // for IE8 and under
        if ($target[0].setCapture) {
            $target[0].setCapture();
        }
    },

    /**
     * Stop resizing
     * @private
     */
    _stopResizing: function() {
        // for IE8 and under
        if (this.$target && this.$target[0].releaseCapture) {
            this.$target[0].releaseCapture();
        }

        this.isResizing = false;
        this.$target = null;
        this.initialLeft = 0;
        this.initialOffsetLeft = 0;
        this.initialWidth = 0;

        $('body').css('cursor', 'default');
        $(document)
            .unbind('mousemove', $.proxy(this._onMouseMove, this))
            .unbind('mouseup', $.proxy(this._onMouseUp, this));
    },

    /**
     * Destroy
     */
    destroy: function() {
        this.stopListening();
        this._stopResizing();
        this.remove();
    }
});

module.exports = ResizeHandler;

},{"../../base/view":7}],49:[function(require,module,exports){
/**
 * @fileoverview 툴바영역 클래스
 * @author NHN Ent. FE Development Team
 */
'use strict';

var View = require('../../base/view');

/**
 * 툴바 영역
 * @module view/layout/toolbar
 * @extends module:base/view
 */
var Toolbar = View.extend(/**@lends module:view/layout/toolbar.prototype */{
    /**
     * @constructs
     * @param {Object} options - Options
     */
    initialize: function(options) {
        View.prototype.initialize.call(this);

        this.toolbarModel = options.toolbarModel;
        this.dimensionModel = options.dimensionModel;
        this.viewFactory = options.viewFactory;
    },

    tagName: 'div',

    className: 'toolbar',

    /**
     * 랜더링한다.
     * @returns {View.Layout.Toolbar} this object
     */
    render: function() {
        var toolbarModel = this.toolbarModel;

        this._destroyChildren();

        if (toolbarModel.get('hasControlPanel')) {
            this._addChildren(this.viewFactory.createToolbarControlPanel());
        }

        if (toolbarModel.get('hasResizeHandler')) {
            this._addChildren(this.viewFactory.createToolbarResizeHandler());
        }

        if (toolbarModel.get('hasPagination')) {
            this._addChildren(this.viewFactory.createToolbarPagination());
        }

        this.$el.empty().append(this._renderChildren());
        this._refreshHeight();

        return this;
    },

    /**
     * Reset toolbar-height based on the model/dimension->toolbarHeight.
     * @private
     */
    _refreshHeight: function() {
        var height = this.dimensionModel.get('toolbarHeight');

        this.$el.height(height);
        this.$el.toggle(!!height);
    }
});

module.exports = Toolbar;

},{"../../base/view":7}],50:[function(require,module,exports){
/**
 * @fileoverview Class for the control panel in the toolbar
 * @author NHN Ent. FE Development Team
 */
'use strict';

var View = require('../../../base/view');

/**
 * Class for the control panel in the toolbar
 * @module view/layout/toolbar/controlPanel
 * @extends module:base/view
 */
var ControlPanel = View.extend(/**@lends module:view/layout/toolbar/controlPanel.prototype */{
    /**
     * @constructs
     * @param {Object} options - Options
     */
    initialize: function(options) {
        this.setOwnProperties({
            gridId: options.gridId,
            toolbarModel: options.toolbarModel,
            $btnExcel: null,
            $btnExcelAll: null
        });

        this.listenTo(this.toolbarModel,
            'change:isExcelButtonVisible change:isExcelAllButtonVisible', this.render);
    },

    events: {
        'click a.excel_download_button': '_onClickExcel'
    },

    tagName: 'div',

    className: 'btn_setup',

    templateExcelBtn: _.template(
        '<a href="#" class="excel_download_button btn_text <%=className%>">' +
        '<span><em class="excel"></em><%=text%></span>' +
        '</a>'
    ),

    /**
     * Click event handler for excel download buttons
     * @param  {MouseEvent} mouseEvent - MouseEvent object
     * @private
     */
    _onClickExcel: function(mouseEvent) {
        var grid = tui.Grid.getInstanceById(this.gridId),
            net = grid.getAddOn('Net'),
            $target;

        mouseEvent.preventDefault();

        if (net) {
            $target = $(mouseEvent.target).closest('a');

            if ($target.hasClass('excel_page')) {
                net.download('excel');
            } else if ($target.hasClass('excel_all')) {
                net.download('excelAll');
            }
        }
    },

    /**
     * Renders.
     * @returns {View.Layout.Toolbar.ControlPanel} - this object
     */
    render: function() {
        var toolbarModel = this.toolbarModel;

        this.$el.empty();

        if (toolbarModel.get('isExcelButtonVisible')) {
            this.$el.append(this.templateExcelBtn({
                className: 'excel_page',
                text: '엑셀 다운로드'
            }));
        }
        if (toolbarModel.get('isExcelAllButtonVisible')) {
            this.$el.append(this.templateExcelBtn({
                className: 'excel_all',
                text: '전체 엑셀 다운로드'
            }));
        }
        return this;
    }
});

module.exports = ControlPanel;

},{"../../../base/view":7}],51:[function(require,module,exports){
/**
 * @fileoverview Class for the pagination in the toolbar
 * @author NHN Ent. FE Development Team
 */
'use strict';

var View = require('../../../base/view');

/**
 * Class for the pagination in the toolbar
 * @module view/layout/toolbar/pagination
 * @extends module:base/view
 */
var Pagination = View.extend(/**@lends module:view/layout/toolbar/pagination.prototype */{
    /**
     * @constructs
     * @param {Object} options - Options
     */
    initialize: function(options) {
        this.toolbarModel = options.toolbarModel;
    },

    tagName: 'div',

    className: 'grid_pagination',

    template: _.template(
        '<a href="#" class="pre_end" title="First page">First</a>' +
        '<a href="#" class="pre" title="Previous page">Prev</a> ' +
        '<a href="#" class="next" title="Next page">Next</a>' +
        '<a href="#" class="next_end" title="Last page">Last</a>' +
        '<span class="pre_end_off">First Off</span>' +
        '<span class="pre_off">Prev Off</span>' +
        '<span class="next_off">Next Off</span>' +
        '<span class="next_end_off">Last Off</span>'
    ),

    /**
     * pagination 을 rendering 한다.
     * @returns {View.Layout.Toolbar.Pagination} This object
     */
    render: function() {
        this._destroyChildren();
        this.$el.empty().html(this.template());
        this._setPaginationInstance();
        return this;
    },

    /**
     * pagination instance 를 설정한다.
     * @private
     */
    _setPaginationInstance: function() {
        var PaginationClass = tui && tui.component && tui.component.Pagination,
            pagination = this.toolbarModel.get('pagination');

        if (!pagination && PaginationClass) {
            pagination = new PaginationClass({
                itemCount: 1,
                itemPerPage: 1,
                pagePerPageList: 5,
                isCenterAlign: true,
                moveUnit: 'page',
                $preOff: this.$el.find('.pre_off'),
                $pre_endOff: this.$el.find('.pre_end_off'), // eslint-disable-line camelcase
                $nextOff: this.$el.find('.next_off'),
                $lastOff: this.$el.find('.next_end_off')
            }, this.$el);
        }
        this.toolbarModel.set('pagination', pagination);
    }
});

module.exports = Pagination;

},{"../../../base/view":7}],52:[function(require,module,exports){
/**
 * @fileoverview Class for the resize handler of the toolbar
 * @author NHN Ent. FE Development Team
 */
'use strict';

var View = require('../../../base/view');

/**
 * Class for the resize handler of the toolbar
 * @module view/layout/toolbar/resizeHandler
 * @extends module:base/view
 */
var ResizeHandler = View.extend(/**@lends module:view/layout/toolbar/resizeHandler.prototype */{
    /**
     * @constructs
     * @param {Object} options - Options
     */
    initialize: function(options) {
        this.dimensionModel = options.dimensionModel;
        this.timeoutIdForResize = 0;
    },

    tagName: 'div',

    className: 'height_resize_bar',

    template: _.template('<a href="#" class="height_resize_handle"><span></span></a>'),

    events: {
        'mousedown': '_onMouseDown'
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
     * @param {event} mouseDownEvent 마우스 이벤트
     * @private
     */
    _onMouseDown: function(mouseDownEvent) {
        mouseDownEvent.preventDefault();
        $(document.body).css('cursor', 'row-resize');
        this._attachMouseEvent();
    },

    /**
     * mousemove 이벤트 핸들러
     * @param {event} mouseMoveEvent 마우스 이벤트
     * @private
     */
    _onMouseMove: function(mouseMoveEvent) {
        var dimensionModel = this.dimensionModel,
            offsetTop = dimensionModel.get('offsetTop'),
            headerHeight = dimensionModel.get('headerHeight'),
            rowHeight = dimensionModel.get('rowHeight'),
            toolbarHeight = dimensionModel.get('toolbarHeight'),
            bodyHeight = mouseMoveEvent.pageY - offsetTop - headerHeight - toolbarHeight;

        clearTimeout(this.timeoutIdForResize);

        bodyHeight = Math.max(bodyHeight, rowHeight + dimensionModel.getScrollXHeight());

        //매번 수행하면 성능이 느려지므로, resize 이벤트가 발생할 시 천천히 업데이트한다.
        this.timeoutIdForResize = setTimeout(function() {
            dimensionModel.set({
                bodyHeight: bodyHeight
            });
        }, 0);
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
     * @param {Event} event - Event object
     * @returns {boolean} - 기본 동작 방지를 위해 무조건 false 를 반환한다.
     * @private
     */
    _onSelectStart: function(event) {
        event.preventDefault();
        return false;
    },

    /**
     * 랜더링한다.
     * @returns {ResizeHandler} this object
     */
    render: function() {
        this._destroyChildren();
        this.$el.html(this.template());
        return this;
    },

    /**
     * 소멸자
     */
    destroy: function() {
        this.stopListening();
        this._onMouseUp();
        this._destroyChildren();
        this.remove();
    }
});

module.exports = ResizeHandler;

},{"../../../base/view":7}],53:[function(require,module,exports){
/**
 * @fileoverview RowList View
 * @author NHN Ent. FE Development Team
 */
'use strict';

var View = require('../base/view'),
    util = require('../common/util');

var CLASSNAME_SELECTED = 'selected',
    CLASSNAME_FOCUSED_ROW = 'focused_row',
    SELECTOR_META_CELL = 'td.meta_column';

/**
 * RowList View
 * @module view/rowList
 * @extends module:baes/view
 */
var RowList = View.extend(/**@lends module:view/rowList.prototype */{
    /**
     * @constructs
     * @param {object} options - Options
     * @param {string} [options.whichSide='R']   어느 영역에 속하는 rowList 인지 여부. 'L|R' 중 하나를 지정한다.
     */
    initialize: function(options) {
        var focusModel = options.focusModel,
            renderModel = options.renderModel,
            selectionModel = options.selectionModel,
            whichSide = options.whichSide || 'R';

        this.setOwnProperties({
            whichSide: whichSide,
            bodyTableView: options.bodyTableView,
            focusModel: focusModel,
            renderModel: renderModel,
            selectionModel: selectionModel,
            dataModel: options.dataModel,
            columnModel: options.columnModel,
            collection: renderModel.getCollection(whichSide),
            painterManager: options.painterManager,
            sortOptions: null,
            renderedRowKeys: null
        });

        this.listenTo(this.collection, 'change', this._onModelChange)
            .listenTo(this.collection, 'restore', this._onModelRestore)
            .listenTo(focusModel, 'change:rowKey', this._refreshFocusedRow)
            .listenTo(renderModel, 'rowListChanged', this.render);

        if (this.whichSide === 'L') {
            this.listenTo(focusModel, 'change:rowKey', this._refreshSelectedMetaColumns)
                .listenTo(selectionModel, 'change:range', this._refreshSelectedMetaColumns)
                .listenTo(renderModel, 'rowListChanged', this._refreshSelectedMetaColumns);
        }
    },

    /**
     * Returns the list of column models in it's own side
     * @returns {Array} - Column model list
     */
    _getColumnModelList: function() {
        return this.columnModel.getVisibleColumnModelList(this.whichSide, true);
    },

    /**
     * 기존에 생성되어 있던 TR요소들 중 새로 렌더링할 데이터와 중복되지 않은 목록의 TR요소만 삭제한다.
     * @param {array} dupRowKeys 중복된 데이터의 rowKey 목록
     */
    _removeOldRows: function(dupRowKeys) {
        var firstIdx = _.indexOf(this.renderedRowKeys, dupRowKeys[0]),
            lastIdx = _.indexOf(this.renderedRowKeys, _.last(dupRowKeys)),
            $rows = this.$el.children('tr');

        $rows.slice(0, firstIdx).remove();
        $rows.slice(lastIdx + 1).remove();
    },

    /**
     * 기존의 렌더링된 데이터와 중복되지 않은 목록에 대해서만 TR요소를 추가한다.
     * @param {array} rowKeys 렌더링할 데이터의 rowKey 목록
     * @param {array} dupRowKeys 중복된 데이터의 rowKey 목록
     */
    _appendNewRows: function(rowKeys, dupRowKeys) {
        var beforeRows = this.collection.slice(0, _.indexOf(rowKeys, dupRowKeys[0])),
            afterRows = this.collection.slice(_.indexOf(rowKeys, _.last(dupRowKeys)) + 1);

        this.$el.prepend(this._getRowsHtml(beforeRows));
        this.$el.append(this._getRowsHtml(afterRows));
    },

    /**
     * Redraw all rows.
     * @private
     */
    _resetRows: function() {
        var html = this._getRowsHtml(this.collection.models),
            $tbody;

        if (RowList.isInnerHtmlOfTbodyReadOnly) {
            $tbody = this.bodyTableView.redrawTable(html);
            this.setElement($tbody, false); // table이 다시 생성되었기 때문에 tbody의 참조를 갱신해준다.

            // prevent layout from breaking in IE7
            if (util.isBrowserIE7()) {
                $tbody.width($tbody.width());
            }
        } else {
            // As using a compatibility mode in IE makes it hard to detect the actual version of the browser,
            // use try/catch block to make in correct.
            try {
                this.$el[0].innerHTML = html;
            } catch (e) {
                RowList.isInnerHtmlOfTbodyReadOnly = true;
                this._resetRows();
            }
        }
    },

    /**
     * 행데이터 목록을 받아, HTML 문자열을 생성해서 반환한다.
     * @param {Model.Row[]} rows - 행데이터 목록
     * @returns {string} 생성된 HTML 문자열
     */
    _getRowsHtml: function(rows) {
        var rowPainter = this.painterManager.getRowPainter(),
            columnNames = _.pluck(this._getColumnModelList(), 'columnName');

        return _.map(rows, function(row) {
            return rowPainter.generateHtml(row, columnNames);
        }).join('');
    },

    /**
     * Returns a TR element of given rowKey
     * @param {(string|number)} rowKey - rowKey
     * @returns {jquery}
     * @private
     */
    _getRowElement: function(rowKey) {
        return this.$el.find('tr[key="' + rowKey + '"]');
    },

    /**
     * Refreshes 'selected' class of meta columns.
     * @private
     */
    _refreshSelectedMetaColumns: function() {
        var $rows = this.$el.find('tr'),
            $filteredRows;

        if (this.selectionModel.hasSelection()) {
            $filteredRows = this._filterRowsByIndexRange($rows, this.selectionModel.get('range').row);
        } else {
            $filteredRows = this._filterRowByKey($rows, this.focusModel.get('rowKey'));
        }

        $rows.find(SELECTOR_META_CELL).removeClass(CLASSNAME_SELECTED);
        $filteredRows.find(SELECTOR_META_CELL).addClass(CLASSNAME_SELECTED);
    },

    /**
     * Filters the rows by given range(index) and returns them.
     * @param {jQuery} $rows - rows (tr elements)
     * @param {Array.<Number>} rowRange - [startIndex, endIndex]
     * @returns {jQuery}
     * @private
     */
    _filterRowsByIndexRange: function($rows, rowRange) {
        var renderModel = this.renderModel,
            renderStartIndex = renderModel.get('startIndex'),
            startIndex, endIndex;

        startIndex = Math.max(rowRange[0] - renderStartIndex, 0);
        endIndex = Math.max(rowRange[1] - renderStartIndex + 1, 0); // add 1 for exclusive value

        if (!startIndex && !endIndex) {
            return $();
        }
        return $rows.slice(startIndex, endIndex);
    },

    /**
     * Filters the row by given rowKey
     * @param {jQuery} $rows - rows (tr elements)
     * @param {Number} rowKey - rowKey
     * @returns {jQuery}
     * @private
     */
    _filterRowByKey: function($rows, rowKey) {
        var rowIndex = this.dataModel.indexOfRowKey(rowKey),
            renderStartIndex = this.renderModel.get('startIndex');

        if (renderStartIndex > rowIndex) {
            return $();
        }
        return $rows.eq(rowIndex - renderStartIndex);
    },

    /**
     * Removes the CLASSNAME_FOCUSED_ROW class from the cells in the previously focused row and
     * adds it to the cells in the currently focused row.
     * @private
     */
    _refreshFocusedRow: function() {
        var rowKey = this.focusModel.get('rowKey'),
            prevRowKey = this.focusModel.get('prevRowKey');

        this._setFocusedRowClass(prevRowKey, false);
        this._setFocusedRowClass(rowKey, true);
    },

    /**
     * Finds all cells in the row indentified by given rowKey and toggles the CLASSNAME_FOCUSED_ROW on them.
     * @param {Number|String} rowKey - rowKey
     * @param {Boolean} focused - if set to true, the class will be added, otherwise be removed.
     * @private
     */
    _setFocusedRowClass: function(rowKey, focused) {
        var columnNames = _.pluck(this._getColumnModelList(), 'columnName'),
            trMap = {};

        _.each(columnNames, function(columnName) {
            var mainRowKey = this.dataModel.getMainRowKey(rowKey, columnName),
                $td;

            if (!trMap[mainRowKey]) {
                trMap[mainRowKey] = this._getRowElement(mainRowKey);
            }
            $td = trMap[mainRowKey].find('td[data-column-name=' + columnName + ']');
            $td.toggleClass(CLASSNAME_FOCUSED_ROW, focused);
        }, this);
    },

    /**
     * Renders.
     * @param {boolean} isModelChanged - 모델이 변경된 경우(add, remove..) true, 아니면(스크롤 변경 등) false
     * @returns {View.RowList} this 객체
     */
    render: function(isModelChanged) {
        var rowKeys = this.collection.pluck('rowKey'),
            dupRowKeys;

        this.bodyTableView.resetTablePosition();

        if (isModelChanged) {
            this._resetRows();
        } else {
            dupRowKeys = _.intersection(rowKeys, this.renderedRowKeys);
            if (_.isEmpty(rowKeys) || _.isEmpty(dupRowKeys) ||
                // 중복된 데이터가 70% 미만일 경우에는 성능을 위해 innerHTML을 사용.
                (dupRowKeys.length / rowKeys.length < 0.7)) { // eslint-disable-line no-magic-numbers
                this._resetRows();
            } else {
                this._removeOldRows(dupRowKeys);
                this._appendNewRows(rowKeys, dupRowKeys);
            }
        }
        this.renderedRowKeys = rowKeys;

        return this;
    },

    /**
     * modelChange 이벤트 발생시 실행되는 핸들러 함수.
     * @param {Model.Row} model Row 모델 객체
     * @private
     */
    _onModelChange: function(model) {
        var $tr = this._getRowElement(model.get('rowKey'));

        this.painterManager.getRowPainter().refresh(model.changed, $tr);
    },

    /**
     * Event handler for 'restore' event on module:model/row
     * @param {Object} cellData - CellData
     * @private
     */
    _onModelRestore: function(cellData) {
        var $td = this.dataModel.getElement(cellData.rowKey, cellData.columnName),
            editType = this.columnModel.getEditType(cellData.columnName);

        this.painterManager.getCellPainter(editType).redraw(cellData, $td);
    }
}, {
    /**
     * Whether the innerHTML property of a tbody element is readonly.
     * @memberof RowList
     * @static
     */
    isInnerHtmlOfTbodyReadOnly: (tui.util.browser.msie &&
        tui.util.browser.version <= 9) // eslint-disable-line no-magic-numbers
});

module.exports = RowList;

},{"../base/view":7,"../common/util":11}],54:[function(require,module,exports){
/**
 * @fileoverview Class for the selection layer
 * @author NHN Ent. FE Development Team
 */
'use strict';

var View = require('../base/view');
var util = require('../common/util');
var CELL_BORDER_WIDTH = require('../common/constMap').dimension.CELL_BORDER_WIDTH;

/**
 * Class for the selection layer
 * @module view/selectionLayer
 * @extends module:base/view
 */
var SelectionLayer = View.extend(/**@lends module:view/selectionLayer.prototype */{
    /**
     * @constructs
     * @param {object} options Options
     * @param {array} options.columnWidthList  selection 레이어에 해당하는 영역의 컬럼 너비 리스트 정보
     */
    initialize: function(options) {
        this.setOwnProperties({
            whichSide: options.whichSide || 'R',
            dimensionModel: options.dimensionModel,
            columnModel: options.columnModel,
            selectionModel: options.selectionModel
        });
        this._updateColumnWidthList();

        this.listenTo(this.dimensionModel, 'columnWidthChanged', this._onChangeColumnWidth);
        this.listenTo(this.selectionModel, 'change:range', this.render);
    },

    tagName: 'div',

    className: 'selection_layer',

    /**
     * Updates this.columnWidthList
     * @private
     */
    _updateColumnWidthList: function() {
        this.columnWidthList = this.dimensionModel.getColumnWidthList(this.whichSide);
    },

    /**
     * Event handler for 'columnWidthChanged' evnet on Dimension model.
     * @private
     */
    _onChangeColumnWidth: function() {
        this._updateColumnWidthList();
        this.render();
    },

    /**
     * Returns relative column range based on 'this.whichSide'
     * @private
     * @param {array} columnRange - Column range indexes. [start, end]
     * @returns {array} - Relative column range indexes. [start, end]
     */
    _getOwnSideColumnRange: function(columnRange) {
        var columnFixCount = this.columnModel.getVisibleColumnFixCount(),
            ownColumnRange = null;

        if (this.whichSide === 'L') {
            if (columnRange[0] < columnFixCount) {
                ownColumnRange = [
                    columnRange[0],
                    Math.min(columnRange[1], columnFixCount - 1)
                ];
            }
        } else if (columnRange[1] >= columnFixCount) {
            ownColumnRange = [
                Math.max(columnRange[0], columnFixCount) - columnFixCount,
                columnRange[1] - columnFixCount
            ];
        }

        return ownColumnRange;
    },

    /**
     * Returns the object containing 'top' and 'height' css value.
     * @private
     * @param  {array} rowRange - Row range indexes. [start, end]
     * @returns {{top: string, height: string}} - css values
     */
    _getVerticalStyles: function(rowRange) {
        var rowHeight = this.dimensionModel.get('rowHeight'),
            top = util.getHeight(rowRange[0], rowHeight),
            height = util.getHeight(rowRange[1] - rowRange[0] + 1, rowHeight) - CELL_BORDER_WIDTH;

        return {
            top: top + 'px',
            height: height + 'px'
        };
    },

    /**
     * Returns the object containing 'left' and 'width' css value.
     * @private
     * @param  {array} columnRange - Column range indexes. [start, end]
     * @returns {{left: string, width: string}} - css values
     */
    _getHorizontalStyles: function(columnRange) {
        var columnWidthList = this.columnWidthList,
            metaColumnCount = this.columnModel.getVisibleMetaColumnCount(),
            startIndex = columnRange[0],
            endIndex = columnRange[1],
            left = 0,
            width = 0,
            i = 0;

        if (this.whichSide === 'L') {
            startIndex += metaColumnCount;
            endIndex += metaColumnCount;
        }
        endIndex = Math.min(endIndex, columnWidthList.length - 1);

        for (; i <= endIndex; i += 1) {
            if (i < startIndex) {
                left += columnWidthList[i] + CELL_BORDER_WIDTH;
            } else {
                width += columnWidthList[i] + CELL_BORDER_WIDTH;
            }
        }
        width -= CELL_BORDER_WIDTH; // subtract last border width

        return {
            left: left + 'px',
            width: width + 'px'
        };
    },

    /**
     * Render.
     * @returns {SelectionLayer} this object
     */
    render: function() {
        var range = this.selectionModel.get('range'),
            styles, columnRange;

        if (range) {
            columnRange = this._getOwnSideColumnRange(range.column);
        }
        if (columnRange) {
            styles = _.assign({},
                this._getVerticalStyles(range.row),
                this._getHorizontalStyles(columnRange)
            );
            this.$el.show().css(styles);
        } else {
            this.$el.hide();
        }

        return this;
    }
});

module.exports = SelectionLayer;

},{"../base/view":7,"../common/constMap":8,"../common/util":11}],55:[function(require,module,exports){
/**
 * @fileoverview Layer class that represents the state of rendering phase
 * @author NHN Ent. FE Development Team
 */
'use strict';

var View = require('../base/view');
var renderStateMap = require('../common/constMap').renderState;

/**
 * Layer class that represents the state of rendering phase.
 * @module view/stateLayer
 * @extends module:base/view
 */
var StateLayer = View.extend(/**@lends module:view/stateLayer.prototype */{
    /**
     * @constructs
     * @param {Object} options - Options
     */
    initialize: function(options) {
        this.dimensionModel = options.dimensionModel;
        this.renderModel = options.renderModel;
        this.timeoutIdForDelay = null;

        this.listenTo(this.dimensionModel, 'change', this._refreshLayout);
        this.listenTo(this.renderModel, 'change:state', this.render);
    },

    className: 'state_layer',

    template: _.template(
        '<div class="layer_content">' +
        '    <%= text %>' +
        '    <% if (isLoading) { %>' +
        '    <div class="loading_img"></div>' +
        '    <% } %>' +
        '</div>'
    ),

    /**
     * Render
     * @returns {object} This object
     */
    render: function() {
        var renderState = this.renderModel.get('state');

        if (renderState === renderStateMap.DONE) {
            this.$el.hide();
        } else {
            this._showLayer(renderState);
        }

        return this;
    },

    /**
     * Shows the state layer.
     * @param {string} renderState - Render state {@link module:common/constMap#renderState}
     * @private
     */
    _showLayer: function(renderState) {
        var layerHtml = this.template({
            text: this._getMessage(renderState),
            isLoading: (renderState === renderStateMap.LOADING)
        });

        this.$el.html(layerHtml).show();
        this._refreshLayout();
    },

    /**
     * Returns the message based on the renderState value
     * @param  {string} renderState - Renderer.state value
     * @returns {string} - Message
     */
    _getMessage: function(renderState) {
        switch (renderState) {
            case renderStateMap.LOADING:
                return '요청을 처리 중입니다.';
            case renderStateMap.EMPTY:
                return (this.renderModel.get('emptyMessage') || '데이터가 존재하지 않습니다.');
            default:
                return null;
        }
    },

    /**
     * Sets the marginTop and height value.
     * @private
     */
    _refreshLayout: function() {
        var dimensionModel = this.dimensionModel;

        this.$el.css({
            marginTop: dimensionModel.get('headerHeight'),
            height: dimensionModel.get('bodyHeight') + dimensionModel.get('toolbarHeight')
        });
    }
});

module.exports = StateLayer;

},{"../base/view":7,"../common/constMap":8}]},{},[13]);
