/**
 * @fileoverview application-grid
 * @author NHN Ent. FE Development Team
 * @version 1.0.4c
 * @license MIT
 * @link https://github.com/nhnent/fe.application-grid
 */
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * @fileoverview Router for Addon.Net
 * @author NHN Ent. FE Development Team
 */
'use strict';

var common = require('../base/common');
var util = require('../util');

/**
 * Router for Addon.Net
 * @module addon/net-router
 */
var Router = Backbone.Router.extend(/**@lends module:addon/net-router.prototype */{
    /**
     * @constructs
     * @mixes module:base/common
     * @param  {object} attributes - Attributes
     */
    initialize: function(attributes) {
        this.setOwnProperties({
            grid: attributes && attributes.grid || null,
            net: attributes && attributes.net || null
        });
    },

    routes: {
        'read/:queryStr': 'read'
    },

    /**
     * Backbone Router 에서 url 정보를 통해 서버로 read 요청을 한다.
     * @param {String} queryStr 쿼리 문자열
     */
    read: function(queryStr) {
        var data = util.toQueryObject(queryStr);
        //formData 를 설정한다.
        this.net.setFormData(data);
        //그 이후 read
        this.net.readData(data);
    }
});

_.assign(Router.prototype, common);

module.exports = Router;

},{"../base/common":4,"../util":19}],2:[function(require,module,exports){
/**
 * @fileoverview Network 모듈 addon
 * @author NHN Ent. FE Development Team
 */
'use strict';

var View = require('../base/view');
var Router = require('./net-router');
var util = require('../util');

/**
 * Net Addon
 * @module addon/net
 */
var Net = View.extend(/**@lends module:addon/net.prototype */{
    tagName: 'form',
    events: {
        submit: '_onSubmit'
    },
    /**
     * @constructs
     * @mixes module:base/common
     * @param {object} attributes
     *      @param {jquery} attributes.el   form 엘리먼트
     *      @param {boolean} [attributes.initialRequest=true]   Net 인스턴스 생성과 동시에 readData request 요청을 할 지 여부.
     *      @param {object} [attributes.api]   사용할 API URL 리스트
     *          @param {string} [attributes.api.readData]  데이터 조회 API 주소
     *          @param {string} [attributes.api.createData] 데이터 생성 API 주소
     *          @param {string} [attributes.api.updateData] 데이터 업데이트 API 주소
     *          @param {string} [attributes.api.modifyData] 데이터 수정 API 주소 (생성/조회/삭제 한번에 처리하는 API 주소)
     *          @param {string} [attributes.api.deleteData] 데이터 삭제 API 주소
     *      @param {number} [attributes.perPage=500]  한 페이지당 보여줄 item 개수
     *      @param {boolean} [attributes.enableAjaxHistory=true]   ajaxHistory 를 사용할지 여부
     * @example
     <form id="data_form">
     <input type="text" name="query"/>
     </form>
     <script>
     var net,
     grid = new ne.Grid({
            //...option 생략...
    });

     //Net AddOn 을 그리드 내부에서 인스턴스화 하며 초기화 한다.
     grid.use('Net', {
        el: $('#data_form'),         //필수 - form 엘리먼트
        initialRequest: true,   //(default: true) Net 인스턴스 생성과 동시에 readData request 요청을 할 지 여부.
        perPage: 500,           //(default: 500) 한 페이지당 load 할 데이터 개수
        enableAjaxHistory: true, //(default: true) ajaxHistory 를 사용할지 여부
        //사용할 API URL 리스트
        api: {
            'readData': './api/read',                       //데이터 조회 API 주소
            'createData': './api/create',                   //데이터 생성 API 주소
            'updateData': './api/update',                   //데이터 업데이트 API 주소
            'deleteData': './api/delete',                   //데이터 삭제 API 주소
            'modifyData': './api/modify',                   //데이터 수정 API 주소 (생성/조회/삭제 한번에 처리하는 API 주소)
            'downloadExcel': './api/download/excel',        //엑셀 다운로드 (현재페이지) API 주소
            'downloadExcelAll': './api/download/excelAll'   //엑셀 다운로드 (전체 데이터) API 주소
        }
    });
     //이벤트 핸들러 바인딩
     grid.on('beforeRequest', function(data) {
        //모든 dataRequest 시 호출된다.
    }).on('response', function(data) {
        //response 이벤트 핸들러
        //성공/실패와 관계없이 response 를 받을 떄 호출된다.
    }).on('successResponse', function(data) {
        //successResponse 이벤트 핸들러
        //response.result 가 true 일 때 호출된다.
    }).on('failResponse', function(data) {
        //failResponse 이벤트 핸들러
        //response.result 가 false 일 때 호출된다.
    }).on('errorResponse', function(data) {
        //ajax error response 이벤트 핸들러
    });

     //grid 로부터 사용할 net 인스턴스를 가져온다.
     net = grid.getAddOn('Net');

     //request 관련 자세한 옵션은 Net#request 를 참고한다.
     //createData API 요청
     net.request('createData');

     //updateData API 요청
     net.request('updateData');

     //deleteData API 요청
     net.request('deleteData');

     //modifyData API 요청
     net.request('modifyData');
     </script>
     */
    initialize: function(attributes) {
        var defaultOptions, options, pagination;

        View.prototype.initialize.apply(this, arguments);

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
        options = $.extend(true, defaultOptions, attributes); // deep extend
        pagination = this.grid.getPaginationInstance();

        this.setOwnProperties({
            curPage: 1,
            perPage: options.perPage,
            options: options,
            router: null,
            pagination: pagination,
            requestedFormData: null,
            isLocked: false,
            lastRequestedReadData: null
        });
        this._initializeDataModelNetwork();
        this._initializeRouter();
        this._initializePagination();
        this._showToolbarExcelBtns();

        this.listenTo(this.grid.dataModel, 'sortChanged', this._onSortChanged, this);

        if (options.initialRequest) {
            this._readDataAt(1, false);
        }
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
            this.router = new Router({
                grid: this.grid,
                net: this
            });
            if (!Backbone.History.started) {
                Backbone.history.start();
            }
        }
    },

    /**
     * Shows the excel-buttons in a toolbar (control-panel) area if the matching api exist.
     */
    _showToolbarExcelBtns: function() {
        var controlPanel = this.grid.view.toolbar.controlPanel,
            api = this.options.api;

        if (!controlPanel) {
            return;
        }

        if (api.downloadExcel) {
            controlPanel.$btnExcel.show();
        }
        if (api.downloadExcelAll) {
            controlPanel.$btnExcelAll.show();
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
        /*
        page 이동시 form input 을 수정하더라도,
        formData 를 유지하기 위해 데이터를 기록한다.
         */
        this._readDataAt(1, false);
    },

    /**
     * 폼 데이터를 설정한다.
     * 내부에서 사용하는 메서드이므로 외부에서 사용하지 않기를 권장한다.
     * @param {Object} formData 폼 데이터 정보
     */
    setFormData: function(formData) {
        //form data 를 실제 form 에 반영한다.
        /* istanbul ignore next */
        util.form.setFormData(this.$el, formData);
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
            Backbone.sync.call(Backbone, method, model, options);
        }
    },

    /**
     * network 통신에 대한 _lock 을 건다.
     * @private
     */
    _lock: function() {
        this.grid.showGridLayer('loading');
        this.isLocked = true;
    },

    /**
     * network 통신에 대해 unlock 한다.
     * loading layer hide 는 rendering 하는 로직에서 수행한다.
     * @private
     */
    _unlock: function() {
        this.isLocked = false;
    },

    /**
     * form 으로 지정된 엘리먼트의 Data 를 반환한다.
     * @return {object} formData 데이터 오브젝트
     * @private
     */
    _getFormData: function() {
        /* istanbul ignore next*/
        return util.form.getFormData(this.$el);
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
     * 가장 마지막에 조회 요청한 request 파라미터로 다시 요청한다.
     */
    reloadData: function() {
        this.readData(this.lastRequestedReadData);
    },

    /**
     * 데이터 조회 요청.
     * 내부적으로 사용하는 메서드이므로 외부에서 호출하지 않기를 권장함.
     * @param {object} data 요청시 사용할 request 파라미터
     */
    readData: function(data) {
        var startNumber = 1,
            grid = this.grid;
        if (!this.isLocked) {
            grid.renderModel.initializeVariables();
            this._lock();

            this.requestedFormData = _.clone(data);
            this.curPage = data.page || this.curPage;
            startNumber = (this.curPage - 1) * this.perPage + 1;
            grid.renderModel.set({
                startNumber: startNumber
            });

            //마지막 요청한 reloadData에서 사용하기 위해 data 를 저장함.
            this.lastRequestedReadData = _.clone(data);
            grid.dataModel.fetch({
                requestType: 'readData',
                data: data,
                type: 'POST',
                success: $.proxy(this._onReadSuccess, this),
                error: $.proxy(this._onReadError, this),
                reset: true
            });
            grid.dataModel.setSortOptionValues(data.sortColumn, data.sortAscending);
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

        isUsingRequestedData = isUsingRequestedData === undefined ? true : isUsingRequestedData;
        data = isUsingRequestedData ? this.requestedFormData : this._getFormData();
        data.page = page;
        data.perPage = this.perPage;

        this._changeSortOptions(data, sortOptions);

        if (this.router) {
            this.router.navigate('read/' + util.toQueryString(data), {
                trigger: false
            });
        }
        this.readData(data);
    },

    /**
     * 서버로 API request 한다.
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
                url: this.options.api[requestType],
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
     * @param {string} type - Download type. 'excel' or 'excelAll'.
     *        Will be matched with API 'downloadExcel', 'downloadExcelAll'.
     */
    download: function(type) {
        var apiName = 'download' + util.toUpperCaseFirstLetter(type),
            data = this.requestedFormData,
            url = this.options.api[apiName],
            paramStr;

        if (type === 'excel') {
            data.page = this.curPage;
            data.perPage = this.perPage;
        } else {
            data = _.omit(data, 'page', 'perPage');
        }

        paramStr = $.param(data);
        window.location = url + '?'+ paramStr;
    },

    /**
     * Set number of rows per page and reload current page
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
     * @return {{count: number, data: {requestType: string, url: string, data: object, type: string, dataType: string}}}
     * 옵션 조건에 해당하는 그리드 데이터 정보
     * @private
     */
    _getDataParam: function(requestType, options) {
        var dataModel = this.grid.dataModel,
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
     *      @param {String} [options.url=this.options.api[requestType]] 요청할 url.
     *      지정하지 않을 시 option 으로 넘긴 API 중 request Type 에 해당하는 url 로 지정됨
     *      @param {String} [options.type='POST'] request method 타입
     *      @param {boolean} [options.hasDataParam=true] request 데이터에 rowList 관련 데이터가 포함될 지 여부.
     *      @param {boolean} [options.isOnlyModified=true] rowList 관련 데이터 중 수정된 데이터만 포함할 지 여부
     *      @param {boolean} [options.isOnlyChecked=true] rowList 관련 데이터 중 checked 된 데이터만 포함할 지 여부
     * @return {{requestType: string, url: string, data: object, type: string, dataType: string}} ajax 호출시 사용될 option 파라미터
     * @private
     */
    _getRequestParam: function(requestType, options) {
        var defaultOptions = {
                url: this.options.api[requestType],
                type: null,
                hasDataParam: true,
                isOnlyModified: true,
                isOnlyChecked: true
            },
            newOptions = $.extend(defaultOptions, options),
            dataParam = this._getDataParam(requestType, newOptions),
            param;

        if (newOptions.isSkipConfirm || this._isConfirmed(requestType, dataParam.count)) {
            param = {
                requestType: requestType,
                url: newOptions.url,
                data: dataParam.data,
                type: newOptions.type
            };
            return param;
        }
    },

    /**
     * requestType 에 따른 컨펌 메세지를 노출한다.
     * @param {String} requestType 요청 타입. 'createData|updateData|deleteData|modifyData' 중 하나를 인자로 넘긴다.
     * @param {Number} count   전송될 데이터 개수
     * @return {boolean}    계속 진행할지 여부를 반환한다.
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
     * @return {string} 생성된 confirm 메세지
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
        var eventData = this.createEventData(options.data),
            params;

        this.grid.trigger('beforeRequest', eventData);
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
        var message = responseData && responseData['message'],
            eventData = this.createEventData({
                httpStatus: status,
                requestType: options.requestType,
                requestParameter: options.data,
                responseData: responseData
            });

        this.grid.trigger('response', eventData);
        if (eventData.isStopped()) {
            return;
        }
        if (responseData && responseData['result']) {
            this.grid.trigger('successResponse', eventData);
            if (eventData.isStopped()) {
                return;
            }
            if (_.isFunction(callback)) {
                callback(responseData['data'] || {}, status, jqXHR);
            }
        } else {
            // TODO: 오류 처리 - invalid 셀에 마크하기 등. 스펙아웃 할 수도 있음
            this.grid.trigger('failResponse', eventData);
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
        var eventData = this.createEventData({
            httpStatus: status,
            requestType: options.requestType,
            requestParameter: options.data,
            responseData: null
        });
        this.grid.hideGridLayer();

        this.grid.trigger('response', eventData);
        if (eventData.isStopped()) {
            return;
        }

        this.grid.trigger('errorResponse', eventData);
        if (eventData.isStopped()) {
            return;
        }

        if (jqXHR.readyState > 1) {
            alert('데이터 요청 중에 에러가 발생하였습니다.\n\n다시 시도하여 주시기 바랍니다.');
        }
    }
});

module.exports = Net;

},{"../base/view":7,"../util":19,"./net-router":1}],3:[function(require,module,exports){
/**
 * @fileoverview Base class for Collections
 * @author NHN Ent. FE Development Team
 */
'use strict';

var common = require('./common');

/**
 * Base class for Collection
 * @module base/collection
 */
var Collection = Backbone.Collection.extend(/**@lends module:base/collection.prototype */{
    /**
     * @param {Array} models - 콜랙션에 추가할 model 리스트
     * @param {Object} options - 생성자의 option 객체. 인자의 프로퍼티에 grid 가 존재한다면 내부 프로퍼티에 grid 를 할당한다.
     * @mixes module:base/common
     * @constructs
     */
    initialize: function(models, options) {
        var grid = options && options.grid || this.collection && this.collection.grid || null;
        this.setOwnProperties({
            grid: grid
        });
    },

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
 */
var Model = Backbone.Model.extend(/**@lends module:base/model.prototype*/{
    /**
     * @constructs
     * @mixes module:base/common
     * @param {Object} attributes Attributes
     */
    initialize: function(attributes) {
        var grid = attributes && attributes.grid || this.collection && this.collection.grid || null;
        this.setOwnProperties({
            grid: grid
        });
    }
});

_.assign(Model.prototype, common);

module.exports = Model;

},{"./common":4}],6:[function(require,module,exports){
/**
 * @fileoverview Base class for Painters
 * @author NHN Ent. FE Development Team
 */
'use strict';

var common = require('./common');

/**
 * Base class for Painters
 * - HTML Element 당 하나의 view 를 생성하면 성능이 좋지 않기 때문에 Drawer 라는 개념을 도입.
 * - 마크업 문자열을 생성하고 이벤트 핸들러를 attach, detach 하는 역할.
 * - backbone view 의 events 와 동일한 방식으로 evantHandler 라는 프로퍼티에 이벤트 핸들러를 정의한다.
 * @module painter
 */
var Painter = ne.util.defineClass(/**@lends module:painter.prototype */{
    /**
     * @constructs
     */
    init: function(attributes) {
        var grid = attributes && attributes.grid || this.collection && this.collection.grid || null;
        this.setOwnProperties({
            grid: grid
        });
        this.initializeEventHandler();
    },

    eventHandler: {},

    /**
     * eventHandler 를 미리 parsing 하여 들고있는다.
     */
    initializeEventHandler: function() {
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

    /**
     * 이벤트 핸들러 정보를 반환한다.
     * @returns {object} Event handlers
     */
    getEventHandlerInfo: function() {
        return this._eventHandler;
    },

    /**
     * 렌더러에서 반환할 HTML 스트링
     */
    getHtml: function() {
        throw this.error('implement getHtml() method');
    }
});
_.assign(Painter.prototype, common);
module.exports = Painter;

},{"./common":4}],7:[function(require,module,exports){
/**
 * @fileoverview Base class for Views
 * @author NHN Ent. FE Development Team
 */
'use strict';

var common = require('./common');

/**
 * Base class for Views
 * @module base/view
 */
var View = Backbone.View.extend(/**@lends module:base/view.prototype */{
    /**
     * @constructs
     * @mixes module:base/common
     * @param {Object} attributes Attributes
     */
    initialize: function(attributes) {
        var grid = attributes && attributes.grid || this.collection && this.collection.grid || null;
        this.setOwnProperties({
            grid: grid,
            _viewList: []
        });
    },

    /**
     * 에러 객체를 반환한다.
     * @param {String} message - Error message
     * @return {error} 에러객체
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
     * 자식 View 를 생성할 때 사용하는 메서드
     * 스스로를 다시 rendering 하거나 소멸 될 때 내부에서 스스로 생성한 View instance 들도 메모리에서 제거하기 위함이다.
     *
     * @param {class} constructor   View 생성자
     * @param {object} params   생성자에 넘길 옵션 파라미터
     * @return {instance} instance    생성자를 통해 인스턴스화 한 객체
     */
    createView: function(constructor, params) {
        var instance = new constructor(params);
        this.addView(instance);
        return instance;
    },

    /**
     * destroy 시 함께 삭제할 View 를 내부 변수 _viewList 에 추가한다.
     * @param {instance} instance 인스턴스 객체
     * @return {instance} instance 인자로 전달받은 인스턴스 객체
     */
    addView: function(instance) {
        if (!this.hasOwnProperty('_viewList')) {
            this.setOwnProperties({
                _viewList: []
            });
        }
        this._viewList.push(instance);
        return instance;
    },

    /**
     * 자식 View를 제거한 뒤 자신도 제거한다.
     */
    destroy: function() {
        this.stopListening();
        this.destroyChildren();
        this.remove();
    },

    /**
     * customEvent 에서 사용할 이벤트 객체를 포멧에 맞게 생성하여 반환한다.
     * @param {Object} data 이벤트 핸들러에 넘길 데이터
     * @return {{_isStopped: boolean, stop: function, param1: param1, param2: param2}} 생성된 커스텀 이벤트 객체
     */
    createEventData: function(data) {
        var eventData = $.extend({}, data);
        eventData.stop = function() {
            this._isStopped = true;
        };
        eventData.isStopped = function() {
            return this._isStopped;
        };
        eventData._isStopped = eventData._isStopped || false;
        return eventData;
    },

    /**
     * 등록되어있는 자식 View 들을 제거한다.
     */
    destroyChildren: function() {
        if (this._viewList instanceof Array) {
            while (this._viewList.length !== 0) {
                this._viewList.pop().destroy();
            }
        }
    }
});

_.assign(View.prototype, common);

module.exports = View;

},{"./common":4}],8:[function(require,module,exports){
/**
 * @fileoverview Grid Core 파일
 * @author NHN Ent. FE Development Team
 */
 'use strict';

var View = require('./base/view');

// data models
var ColumnModelData = require('./data/columnModel');
var RowListData = require('./data/rowList');

// models
var DimensionModel = require('./model/dimension');
var FocusModel = require('./model/focus');
var RenderModel = require('./model/renderer');
var SmartRenderModel = require('./model/renderer-smart');

// views
var CellFactory = require('./view/cellFactory');
var Selection = require('./view/selection');
var Clipboard = require('./view/clipboard');

// layouts
var LsideFrame = require('./view/layout/frame-lside');
var RsideFrame = require('./view/layout/frame-rside');
var ToolbarLayout = require('./view/layout/toolbar');

// layers
var ReadyLayer = require('./view/layer/ready');
var EmptyLayer = require('./view/layer/empty');
var LoadingLayer = require('./view/layer/loading');

var Net = require('./addon/net');
var util = require('./util');

var addOn = {
    Net: Net
};

/**
 * Grid Core
 * @module core
 */
var Core = View.extend(/**@lends module:core.prototype */{
    /**
     * @constructs
     * @extends module:base/view
     * @param {Object} options Grid.js 의 생성자 option 과 동일값.
     */
    initialize: function(options) {
        var id = util.getUniqueKey();

        View.prototype.initialize.apply(this, arguments);

        this.publicInstance = options.publicInstance;
        this.__instance[id] = this;
        this.id = id;

        this._initializeOptions(options);
        this._initializeProperties();

        this._initializeModel();
        this._initializeListener();
        this._initializeView();

        this._attachExtraEvent();

        this.render();

        this.updateLayoutData();
    },

    /**
     * 스크롤바의 높이
     * @type {Number}
     */
    scrollBarSize: 17,

    lside: null,

    rside: null,

    toolbar: null,

    cellFactory: null,

    events: {
        'click': '_onClick',
        'dblclick': '_onDblClick',
        'mousedown': '_onMouseDown',
        'selectstart': '_preventDrag',
        'dragstart': '_preventDrag',
        'mouseover': '_onMouseOver',
        'mouseout': '_onMouseOut'
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

    /**
     * default 설정된 옵션에서 생성자로부터 인자로 받은 옵션들을 확장하여 옵션을 설정한다.
     * @param {Object} options Grid.js 의 생성자 option 과 동일값.
     * @private
     */
    _initializeOptions: function(options) {
        var defaultOptions = {
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
            scrollX: true,
            scrollY: true,
            useDataCopy: true,
            useClientSort: true,
            singleClickEdit: false,
            toolbar: {
                hasResizeHandler: true,
                hasControlPanel: true,
                hasPagination: true
            }
        };

        this.options = $.extend(true, defaultOptions, options);
    },

    /**
     * 내부 properties 를 초기화한다.
     * @private
     */
    _initializeProperties: function() {
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
            'timeoutIdForBlur': 0,
            'timeoutIdForResize': 0,
            'timeoutIdForSetRowList': 0,
            '__$el': this.$el.clone()
        });
    },

    /**
     * 내부에서 사용할 모델 instance를 초기화한다.
     *
     * Initialize data model instances
     * @private
     */
    _initializeModel: function() {
        var offset = this.$el.offset();

        this.columnModel = new ColumnModelData({
            grid: this,
            hasNumberColumn: this.option('autoNumbering'),
            keyColumnName: this.option('keyColumnName'),
            columnFixIndex: this.option('columnFixIndex'),
            selectType: this.option('selectType')
        });
        this.setColumnModelList(this.option('columnModelList'));

        this.dataModel = new RowListData([], {
            grid: this,
            useClientSort: this.option('useClientSort')
        });
        this.dataModel.reset([]);

        this.dimensionModel = new DimensionModel({
            grid: this,
            offsetTop: offset.top,
            offsetLeft: offset.left,
            width: this.$el.width(),
            headerHeight: this.option('headerHeight'),
            rowHeight: this.option('rowHeight'),

            scrollX: !!this.option('scrollX'),
            scrollY: !!this.option('scrollY'),
            scrollBarSize: this.scrollBarSize,

            minimumColumnWidth: this.option('minimumColumnWidth'),
            displayRowCount: this.option('displayRowCount')
        });

        this.focusModel = new FocusModel({
            grid: this,
            scrollX: !!this.option('scrollX'),
            scrollY: !!this.option('scrollY'),
            scrollBarSize: this.scrollBarSize
        });

        if (this.option('notUseSmartRendering')) {
            this.renderModel = new RenderModel({
                grid: this
            });
        } else {
            this.renderModel = new SmartRenderModel({
                grid: this
            });
        }
    },

    /**
     * 내부에서 사용할 view 인스턴스들을 초기화한다.
     * @private
     */
    _initializeView: function() {
        this.cellFactory = this.createView(CellFactory, {
            grid: this
        });

        this.selection = this.createView(Selection, {
            grid: this
        });

        //define header & body area
        this.view.lside = this.createView(LsideFrame, {
            grid: this
        });

        this.view.rside = this.createView(RsideFrame, {
            grid: this
        });

        this.view.toolbar = this.createView(ToolbarLayout, {
            grid: this
        });

        this.view.layer.ready = this.createView(ReadyLayer, {
            grid: this
        });
        this.view.layer.empty = this.createView(EmptyLayer, {
            grid: this
        });
        this.view.layer.loading = this.createView(LoadingLayer, {
            grid: this
        });

        this.view.clipboard = this.createView(Clipboard, {
            grid: this
        });

        if (this.options && !this.options.useDataCopy) {
            this.selection.disable();
        }
    },

    /**
     * 커스텀 이벤트 리스너를 초기화한다.
     * @private
     */
    _initializeListener: function() {
        this.listenTo(this.dimensionModel, 'change:bodyHeight', this._setHeight)
            .listenTo(this.focusModel, 'select', this._onRowSelectChanged);
    },

    /**
     * event 속성에 정의되지 않은 이벤트 attach 한다.
     * @private
     */
    _attachExtraEvent: function() {
        $(window).on('resize', $.proxy(this._onWindowResize, this));
        $(document).on('focusin', $.proxy(this._onBlur, this));
    },

    /**
     * 클립보드 blur 이벤트 핸들러
     * @private
     */
    _onBlur: function() {
        clearTimeout(this.timeoutIdForBlur);
        this.timeoutIdForBlur = setTimeout($.proxy(this._doBlur, this), 0);
    },

    /**
     * 실제 blur 를 한다.
     * @private
     */
    _doBlur: function() {
        var $focused, hasFocusedElement;

        if (this.$el) {
            $focused = this.$el.find(':focus');
            hasFocusedElement = !!$focused.length;

            if (!hasFocusedElement) {
                this.focusModel.blur();
            } else if ($focused.is('td') || $focused.is('a')) {
                this.focusClipboard();
            }
        }
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
     * window resize  이벤트 핸들러
     * @private
     */
    _onWindowResize: function() {
        if (this.$el) {
            this.dimensionModel.set('width', this.$el.width());
        }
    },

    /**
     * click 이벤트 핸들러
     * @param {MouseEvent} mouseEvent 이벤트 객체
     * @private
     */
    _onClick: function(mouseEvent) {
        var eventData = this.createEventData(mouseEvent),
            $target = $(mouseEvent.target),
            cellInfo;

        this.trigger('click', eventData);
        if (eventData.isStopped()) {
            return;
        }
        if (this._isCellElement($target, true)) {
            cellInfo = this._getCellInfoFromElement($target.closest('td'));
            if (this.option('singleClickEdit') && !$target.is('input')) {
                this.focusIn(cellInfo.rowKey, cellInfo.columnName);
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
        var eventData = this.createEventData(mouseEvent),
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
            eventData = this.createEventData(mouseEvent);
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
            eventData = this.createEventData(mouseEvent);
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
     * @return {boolean} 셀이면 true, 아니면 false
     */
    _isCellElement: function($target, isIncludeChild) {
        var $td = isIncludeChild ? $target.closest('td') : $target;

        if (!$td.is('td')) {
            return false;
        }
        return !!($td.parent().attr('key') && $td.attr('columnname'));
    },

    /**
     * HTML요소에서 셀의 rowKey와 columnName값을 찾아서 rowData와 함께 객체로 반환한다.
     * @private
     * @param {jQuery} $cell TD요소의 jquery 객체
     * @return {{rowKey: string, rowData: Data.Row, columnName: string}} 셀 관련 정보를 담은 객체
     */
    _getCellInfoFromElement: function($cell) {
        var rowKey = $cell.parent().attr('key'),
            columnName = $cell.attr('columnname');

        return {
            rowKey: rowKey,
            columnName: columnName,
            rowData: this.getRow(rowKey)
        };
    },

    /**
     * mousedown 이벤트 핸들러
     * @param {event} mouseDownEvent 이벤트 객체
     * @private
     */
    _onMouseDown: function(mouseDownEvent) {
        var $target = $(mouseDownEvent.target),
            eventData = this.createEventData(mouseDownEvent);

        this.trigger('mousedown', eventData);
        if (eventData.isStopped()) {
            return;
        }
        if (!$target.is('input, a, button, select')) {
            mouseDownEvent.preventDefault();
            this.selection.show();
            this.focusClipboard();
        }
    },

    /**
     * select 된 row 가 변경된 경우 이벤트 핸들러.
     * radio select type 의 경우에 select 된 행을 check 해주는 로직을 담당한다.
     * @param {(Number|String)} rowKey 변경이 일어난 데이터의 rowKey
     * @private
     */
    _onRowSelectChanged: function(rowKey) {
        if (this.columnModel.get('selectType') === 'radio') {
            this.uncheckAll();
            this.check(rowKey);
        }
        this.trigger('selectRow', {
            rowKey: rowKey,
            rowData: this.getRow(rowKey)
        });
    },

    /**
     * layout 에 필요한 크기 및 위치 데이터를 갱신한다.
     * @private
     */
    updateLayoutData: function() {
        var offset = this.$el.offset();

        this.dimensionModel.set({
            offsetTop: offset.top,
            offsetLeft: offset.left,
            width: this.$el.width(),
            toolbarHeight: this.view.toolbar.$el.height()
        });
    },

    /**
     * option 값을 설정하거나 가져온다.
     * @param {(String|Number)} key 데이터의 key
     * @param {*} [value]   설정할 값. 두번째 값이 설정되어 있지 않다면 getter 로 활용된다.
     * @return {*}  결과값
     */
    option: function(key, value) {
        var result;

        if (ne.util.isUndefined(value)) {
            this.options = this.options || {};
            result = this.options[key];
        } else {
            this.options[key] = value;
            result = this;
        }
        return result;
    },

    /**
     * Makes view ready to get keyboard input.
     */
    readyForKeyControl: function() {
        this.focusClipboard();
    },

    /**
     * clipboard 에 focus 한다.
     */
    focusClipboard: function() {
        if (ne.util.isExisty(ne.util.pick(this, 'view', 'clipboard'))) {
            this.view.clipboard.$el.focus();
        }
    },

    /**
     * 랜더링한다.
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
        this.trigger('rendered');
    },

    /**
     * rendering 이후, 또는 bodyHeight 가 변경되었을 때, header, toolbar 의 높이를 포함하여
     * grid 의 전체 너비를 설정한다.
     * @private
     */
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
     * rowKey 와 columnName 에 해당하는 값을 반환한다.
     *
     * @param {(Number|String)} rowKey    행 데이터의 고유 키
     * @param {String} columnName   컬럼 이름
     * @param {boolean} [isOriginal]  원본 데이터 리턴 여부
     * @return {(Number|String)}    조회한 셀의 값.
     */
    getValue: function(rowKey, columnName, isOriginal) {
        var value;
        if (isOriginal) {
            value = this.dataModel.getOriginal(rowKey, columnName);
        } else {
            value = this.dataModel.get(rowKey).get(columnName);
        }
        return value;
    },

    /**
     * columnName에 해당하는 column data list를 리턴한다.
     *
     * @param {String} columnName   컬럼명
     * @param {boolean} [isJsonString=false]  true 일 경우 JSON String 으로 반환한다.
     * @return {Array} 컬럼명에 해당하는 셀들의 데이터 리스트
     */
    getColumnValues: function(columnName, isJsonString) {
        var valueList = this.dataModel.pluck(columnName);
        return isJsonString ? $.toJSON(valueList) : valueList;
    },

    /**
     * rowKey에 해당하는 행의 데이터를 리턴한다. isJsonString을 true로 설정하면 결과를 json객체로 변환하여 리턴한다.
     * @param {(Number|String)} rowKey  행 데이터의 고유 키
     * @param {Boolean} [isJsonString=false]  true 일 경우 JSON String 으로 반환한다.
     * @return {Object} 행 데이터
     */
    getRow: function(rowKey, isJsonString) {
        var row = this.dataModel.get(rowKey);
        row = row && row.toJSON();
        return isJsonString ? $.toJSON(row) : row;
    },

    /**
     * 그리드 전체 데이터 중에서 index에 해당하는 순서의 데이터 객체를 리턴한다.
     * @param {Number} index 행의 인덱스
     * @param {Boolean} [isJsonString=false]  true 일 경우 JSON String 으로 반환한다.
     * @return {Object} 행 데이터
     */
    getRowAt: function(index, isJsonString) {
        var row = this.dataModel.at(index).toJSON();
        row = isJsonString ? $.toJSON(row) : row;
        return row;
    },

    /**
     * 현재 그리드에 설정된 전체 데이터의 개수를 리턴한다.
     * @return {Number} 데이터 개수
     */
    getRowCount: function() {
        return this.dataModel.length;
    },

    /**
     * rowKey 와 columnName 에 해당하는 td element 를 반환한다.
     * 내부적으로 자동으로 mainRowKey 를 찾아 반환한다.
     * @param {(Number|String)} rowKey    행 데이터의 고유 키
     * @param {String} columnName   컬럼 이름
     * @return {jQuery} 해당 jQuery Element
     */
    getElement: function(rowKey, columnName) {
        var $frame = this.columnModel.isLside(columnName) ? this.view.lside.$el : this.view.rside.$el;
        rowKey = this.dataModel.getMainRowKey(rowKey, columnName);
        return $frame.find('tr[key="' + rowKey + '"]').find('td[columnname="' + columnName + '"]');
    },

    /**
     * rowKey에 해당하는 행에 대해 선택한다.
     * - checkRow()는 행에 포함된 체크박스나 라디오박스를 선택하며, selectRow()는 클릭된 행이 선택되어졌음을 시각적으로 나타내기 위해 해당 행의 배경색을 변경한다.
     *
     * @param {(Number|String)} rowKey 행 데이터의 고유 키
     */
    select: function(rowKey) {
        this.focusModel.select(rowKey);
    },

    /**
     * 선택되었던 행에 대한 선택을 해제한다.
     */
    unselect: function() {
        this.focusModel.unselect(true);
    },

    /**
     * 그리드 내에서 현재 선택된 row의 키값을 리턴한다.
     * @return {(Number|String)} 행 데이터의 고유 키
     */
    getSelectedRowKey: function() {
        return this.focusModel.which().rowKey;
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
        var row = this.dataModel.get(rowKey),
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
        isCheckCellState = isCheckCellState === undefined ? true : isCheckCellState;

        this.dataModel.forEach(function(row) {
            if (isCheckCellState) {
                cellState = this.getCellState(row.get('rowKey'), columnName);
            }
            if (!cellState.isDisabled && cellState.isEditable) {
                row.set(obj, {
                    silent: silent
                });
            }
        }, this);
    },

    /**
     * rowList 를 설정한다. setRowList 와 다르게 setOriginalRowList 를 호출하여 원본데이터를 갱신하지 않는다.
     * @param {Array} rowList 설정할 데이터 배열 값
     * @param {boolean} [isParse=true]  backbone 의 parse 로직을 수행할지 여부
     */
    replaceRowList: function(rowList, isParse) {
        var callback = ne.util.bind(function() {
            this.dataModel.set(rowList, {
                parse: isParse
            });
        }, this);
        this.showGridLayer('loading');
        isParse = isParse === undefined ? true : isParse;
        //데이터 파싱에 시간이 많이 걸릴 수 있으므로, loading layer 를 먼저 보여주기 위해 timeout 을 사용한다.
        if (rowList && rowList.length > 500) {
            clearTimeout(this.timeoutIdForSetRowList);
            this.timeoutIdForSetRowList = setTimeout($.proxy(function() {
                callback();
            }, this), 0);
        } else {
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
        var doProcess = ne.util.bind(function() {
            this.dataModel.reset(rowList, {
                parse: isParse
            });
            this.dataModel.setOriginalRowList();
            if (_.isFunction(callback)) {
                callback();
            }
        }, this);
        this.showGridLayer('loading');
        isParse = isParse === undefined ? true : isParse;
        //데이터 파싱에 시간이 많이 걸릴 수 있으므로, loading layer 를 먼저 보여주기 위해 timeout 을 사용한다.
        if (rowList && rowList.length > 500) {
            clearTimeout(this.timeoutIdForSetRowList);
            this.timeoutIdForSetRowList = setTimeout($.proxy(function() {
                doProcess();
            }, this), 0);
        } else {
            doProcess();
        }
    },

    /**
     * rowKey, columnName 에 해당하는 셀에 포커싱한다.
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
     */
    focusIn: function(rowKey, columnName, isScrollable) {
        var cellPainter;
        this.focus(rowKey, columnName, isScrollable);
        rowKey = this.dataModel.getMainRowKey(rowKey, columnName);
        if (this.isEditable(rowKey, columnName)) {
            cellPainter = this.cellFactory.getInstance(this.columnModel.getEditType(columnName));
            cellPainter.focusIn(this.getElement(rowKey, columnName));
        } else {
            this.focusClipboard();
        }
    },

    /**
     * rowIndex, columnIndex 에 해당하는 컬럼에 포커싱한다.
     * @param {(Number|String)} rowIndex 행 index
     * @param {String} columnIndex 열 index
     * @param {boolean} [isScrollable=false] 그리드에서 해당 영역으로 scroll 할지 여부
     */
    focusAt: function(rowIndex, columnIndex, isScrollable) {
        var row = this.dataModel.at(rowIndex),
            column = this.columnModel.at(columnIndex, true);
        if (row && column) {
            this.focus(row.get('rowKey'), column['columnName'], isScrollable);
        }
    },

    /**
     * rowIndex, columnIndex 에 해당하는 컬럼에 포커싱 후 편진모드로 전환 한다.
     * @param {(Number|String)} rowIndex 행 index
     * @param {String} columnIndex 열 index
     * @param {boolean} [isScrollable=false] 그리드에서 해당 영역으로 scroll 할지 여부
     */
    focusInAt: function(rowIndex, columnIndex, isScrollable) {
        var row = this.dataModel.at(rowIndex),
            column = this.columnModel.at(columnIndex, true);
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
        this.setColumnValues('_button', true);
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
        this.setColumnValues('_button', false);
    },

    /**
     * rowKey 에 해당하는 행의 체크박스 및 라디오박스를 선택한다.
     * @param {(Number|String)} rowKey    행 데이터의 고유 키
     */
    uncheck: function(rowKey) {
        this.setValue(rowKey, '_button', false);
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
     * @param {(Number|String)} rowKey - 행 데이터의 고유 키
     * @param {boolean|object} options - 삭제 옵션
     * @param {boolean} options.removeOriginalData - 원본 데이터도 함께 삭제할 지 여부
     * @param {boolean} options.keepRowSpanData - rowSpan이 mainRow를 삭제하는 경우 데이터를 유지할지 여부
     */
    removeRow: function(rowKey, options) {
        this.dataModel.removeRow(rowKey, options);
    },

    /**
     * chcked된 행을 삭제한다.
     * @param {boolean} isConfirm 삭제하기 전에 confirm 메시지를 표시할지 여부
     * @return {boolean} 삭제된 행이 있으면 true, 없으면 false
     */
    removeCheckedRows: function(isConfirm) {
        var rowKeyList = this.getCheckedRowKeyList(),
            message = rowKeyList.length + '건의 데이터를 삭제하시겠습니까?';

        if (rowKeyList.length > 0 && (!isConfirm || confirm(message))) {
            _.each(rowKeyList, function(rowKey) {
                this.removeRow(rowKey);
            }, this);
            return true;
        }
        return false;
    },

    /**
     * rowKey에 해당하는 행을 활성화시킨다.
     * @param {(Number|String)} rowKey 행 데이터의 고유 키
     */
    enableRow: function(rowKey) {
        this.dataModel.get(rowKey).setRowState('');
    },

    /**
     * rowKey에 해당하는 행을 비활성화 시킨다.
     * @param {(Number|String)} rowKey    행 데이터의 고유 키
     */
    disableRow: function(rowKey) {
        this.dataModel.get(rowKey).setRowState('DISABLED');
    },

    /**
     * rowKey에 해당하는 행의 메인 체크박스를 체크할 수 있도록 활성화 시킨다.
     * @param {(Number|String)} rowKey 행 데이터의 고유 키
     */
    enableCheck: function(rowKey) {
        this.dataModel.get(rowKey).setRowState('');
    },

    /**
     * rowKey에 해당하는 행의 메인 체크박스를 체크하지 못하도록 비활성화 시킨다.
     * @param {(Number|String)} rowKey 행 데이터의 고유 키
     */
    disableCheck: function(rowKey) {
        this.dataModel.get(rowKey).setRowState('DISABLED_CHECK');
    },

    /**
     * 현재 선택된 행들의 키값만을 배열로 리턴한다.
     * @param {Boolean} [isJsonString=false]  true 일 경우 json 문자열을 리턴한다.
     * @return {Array|String} 선택된 행들의 키값 리스트.
     */
    getCheckedRowKeyList: function(isJsonString) {
        var rowKeyList = [];
        _.each(this.dataModel.where({
            _button: true
        }), function(row) {
            rowKeyList.push(row.get('rowKey'));
        }, this);
        return isJsonString ? $.toJSON(rowKeyList) : rowKeyList;
    },

    /**
     * 현재 선택된 행들의 모든 데이터를 배열로 리턴한다.
     * @param {Boolean} [isJsonString=false]  true 일 경우 json 문자열을 리턴한다.
     * @return {Array|String} 선택된 행들의 데이터값 리스트.
     */
    getCheckedRowList: function(isJsonString) {
        var checkedRowList = this.dataModel.getRowList(true);
        return isJsonString ? $.toJSON(checkedRowList) : checkedRowList;
    },

    /**
     * 그리드에 설정된 컬럼모델 정보를 배열 형태로 리턴한다.
     * @return {Array}  컬럼모델 리스트
     */
    getColumnModelList: function() {
        return this.columnModel.get('columnModelList');
    },

    /**
     * 그리드 내에서 변경된 데이터들의 목록을 구성하여 리턴한다.
     * 리턴되는 객체에는 createList, updateList, deleteList 라는 필드가 있고,
     * 각 필드에는 변경된 데이터들이 배열로 구성되어 있다.
     * @param {Object} [options] Options
     *      @param {boolean} [options.isOnlyChecked=false] true 로 설정된 경우 checked 된 데이터 대상으로 비교 후 반환한다.
     *      @param {boolean} [options.isRaw=false] true 로 설정된 경우 내부 연산용 데이터 제거 필터링을 거치지 않는다.
     *      @param {boolean} [options.isOnlyRowKeyList=false] true 로 설정된 경우 키값만 저장하여 리턴한다.
     *      @param {Array} [options.filteringColumnList]   행 데이터 중에서 데이터 변경으로 간주하지 않을 컬럼 이름을 배열로 설정한다.
     * @return {{createList: Array, updateList: Array, deleteList: Array}} 옵션에 따라 반환된 수정된 데이터 목록
     */
    getModifiedRowList: function(options) {
        //@todo 파라미터 옵션에 따른 데이터 형 변화
        return this.dataModel.getModifiedRowList(options);
    },

    /**
     * 현재 그리드의 제일 끝에 행을 추가한다.
     * @param {object} [row] - row 데이터 오브젝트 없을경우 임의로 빈 데이터를 추가한다.
     * @param {object} [options] - 옵션 객체
     * @param {number} options.at - 데이터를 append 할 index
     */
    appendRow: function(row, options) {
        this.dataModel.append(row, options);
    },

    /**
     * 현재 그리드의 제일 앞에 행을 추가한다.
     * @param {object} [row]  row 데이터 오브젝트 없을경우 임의로 빈 데이터를 추가한다.
     */
    prependRow: function(row) {
        this.dataModel.prepend(row);
    },

    /**
     * 열 고정 위치를 변경한다.
     * @param {Number} columnFixIndex 고정시킬 열의 인덱스
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
     * @return {Boolean}    데이터가 변경되었는지 여부
     */
    isChanged: function() {
        var modifiedRowMap = this.getModifiedRowList(),
            result = false;

        ne.util.forEach(modifiedRowMap, function(data) {
            if (data.length) {
                result = true;
                return false;
            }
        });

        return result;
    },

    /**
     * setRowList()를 통해 그리드에 설정된 초기 데이터 상태로 복원한다.
     * 그리드에서 수정되었던 내용을 초기화하는 용도로 사용한다.
     */
    restore: function() {
        var originalRowList = this.dataModel.getOriginalRowList();
        this.replaceRowList(originalRowList, false);
    },

    /**
     * Grid Layer 를 모두 감춘다.
     */
    hideGridLayer: function() {
        _.each(this.view.layer, function(view) {
            view.hide();
        }, this);
    },

    /**
     * name 에 해당하는 Grid Layer를 보여준다.
     * @param {String} name ready|empty|loading 중 하나를 설정한다.
     */
    showGridLayer: function(name) {
        this.hideGridLayer();
        if (this.view.layer[name]) {
            this.view.layer[name].show();
        }
    },

    /**
     * pagination instance 를 반환한다.
     * @return {instance} pagination 인스턴스
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
     * @return {Core} this
     */
    use: function(name, options) {
        var Constructor = addOn[name];

        options = $.extend({grid: this}, options);
        if (Constructor) {
            this.addOn[name] = new Constructor(options);
        }
        return this;
    },

    /**
     * 정렬이 되었는지 여부 반환
     * @return {Boolean} 현재 정렬이 되어있는지 여부
     */
    isSorted: function() {
        return this.dataModel.isSortedByField();
    },

    /**
     * rowKey 와 columnName 에 해당하는 셀이 편집 가능한지 여부를 반환한다.
     * @param {(Number|String)} rowKey 행 데이터의 고유 키
     * @param {String} columnName 컬럼 이름
     * @return {Boolean} 편집 가능한지 여부
     */
    isEditable: function(rowKey, columnName) {
        var focused = this.focusModel.which(),
            dataModel = this.dataModel,
            row,
            isEditable;

        rowKey = rowKey !== undefined ? rowKey : focused.rowKey;
        columnName = columnName !== undefined ? columnName : focused.columnName;
        row = dataModel.get(rowKey);
        isEditable = row ? row.isEditable(columnName) : true;
        return isEditable;
    },

    /**
     * rowKey 와 columnName 에 해당하는 셀이 disabled 상태인지 여부를 반환한다.
     * @param {(Number|String)} rowKey 행 데이터의 고유 키
     * @param {String} columnName 컬럼 이름
     * @return {Boolean} disabled 상태인지 여부
     */
    isDisabled: function(rowKey, columnName) {
        var focused = this.focusModel.which(),
            dataModel = this.dataModel,
            row,
            isDisabled;

        rowKey = rowKey !== undefined ? rowKey : focused.rowKey;
        columnName = columnName !== undefined ? columnName : focused.columnName;
        row = dataModel.get(rowKey);
        isDisabled = row ? row.isDisabled(columnName) : false;
        return isDisabled;
    },

    /**
     * rowKey 와 columnName 에 해당하는 셀의 편집 가능여부와 disabled 상태 여부를 반환한다.
     * @param {(Number|String)} rowKey 행 데이터의 고유 키
     * @param {String} columnName 컬럼 이름
     * @return {{isEditable: boolean, isDisabled: boolean}} 편집가능한지 여부와 disabled 인지 여부.
     */
    getCellState: function(rowKey, columnName) {
        var focused = this.focusModel.which(),
            dataModel = this.dataModel;

        rowKey = rowKey !== undefined ? rowKey : focused.rowKey;
        columnName = columnName !== undefined ? columnName : focused.columnName;

        return dataModel.get(rowKey).getCellState(columnName);
    },

    /**
     * columnModelList 를 재설정한다..
     * @param {Array} columnModelList 컬럼모델 리스트
     */
    setColumnModelList: function(columnModelList) {
        this.columnModel.set('columnModelList', columnModelList);
    },

    /**
     * columnName 기준으로 정렬한다.
     * @param {String} columnName 정렬할 컬럼명
     * @param {Boolean} isAscending 오름차순 여부
     */
    sort: function(columnName, isAscending) {
        this.dataModel.sortByField(columnName, isAscending);
    },

    /**
     * 현재 그리드의 rowList 를 반환한다.
     * @return {Array} 그리드의 데이터 리스트
     */
    getRowList: function() {
        return this.dataModel.getRowList();
    },

    /**
     * rowKey 와 columnName 에 해당하는 text 형태의 셀의 값을 삭제한다.
     * @param {(Number|String)} rowKey 행 데이터의 고유 키
     * @param {String} columnName 컬럼 이름
     * @param {Boolean} [silent=false] 이벤트 발생 여부. true 로 변경할 상황은 거의 없다.
     */
    del: function(rowKey, columnName, silent) {
        var editType = this.columnModel.getEditType(columnName),
            mainRowKey = this.dataModel.getMainRowKey(rowKey, columnName),
            isDisabledCheck = this.dataModel.get(mainRowKey).getRowState().isDisabledCheck,
            deletableEditTypeList = ['text', 'text-convertible', 'text-password'],
            isDeletable = $.inArray(editType, deletableEditTypeList) !== -1,
            selectType = this.option('selectType'),
            cellState = this.getCellState(mainRowKey, columnName),
            isRemovable = !!(isDeletable && cellState.isEditable && !cellState.isDisabled);

        if (isRemovable) {
            this.setValue(mainRowKey, columnName, '', silent);
            //silent 의 경우 데이터 모델의 change 이벤트가 발생하지 않기 때문에, 강제로 checkbox 를 세팅한다.
            if (silent && selectType === 'checkbox' && !isDisabledCheck) {
                this.setValue(mainRowKey, '_button', true, silent);
            }
        }
    },

    /**
     * 2차원 배열로 된 데이터를 받아 현재 Focus된 셀을 기준으로 하여 각각의 인덱스의 해당하는 만큼 우측 아래 방향으로
     * 이동하며 셀의 값을 변경한다. 완료한 후 적용된 셀 범위에 Selection을 지정한다.
     * @param {Array[]} data - 2차원 배열 데이터. 내부배열의 사이즈는 모두 동일해야 한다.
     */
    paste: function(data) {
        var columnModelList = this.columnModel.getVisibleColumnModelList(),
            start = this._getStartIndexToPaste(),
            end = this._getEndIndexToPaste(start, data, columnModelList),
            rowIdx, columnIdx, row, value;

        _.each(data, function(row, index) {
            this._setValueForPaste(row, start.rowIdx + index, start.columnIdx, end.columnIdx);
        }, this);

        this.selection.startSelection(start.rowIdx, start.columnIdx);
        this.selection.updateSelection(end.rowIdx, end.columnIdx);
    },

    /**
     * 붙여넣기를 실행할때 시작점이 될 셀의 인덱스를 반환한다.
     * @return {{rowIdx: number, columnIdx: number}} 행과 열의 인덱스 정보를 가진 객체
     */
    _getStartIndexToPaste: function() {
        var startIdx;

        if (this.selection.hasSelection()) {
            startIdx = this.selection.getStartIndex();
        } else {
            startIdx = this.focusModel.indexOf();
        }
        return startIdx;
    },

    /**
     * 붙여넣기를 실행할 때 끝점이 될 셀의 인덱스를 반환한다.
     * @param  {{rowIdx: number, columnIdx: number}} startIdx - 시작점이 될 셀의 인덱스
     * @param  {Array[]} data - 붙여넣기할 데이터
     * @param  {Array} columnModelList - 현재 화면에 보여지는 컬럼모델의 목록
     * @return {{rowIdx: number, columnIdx: number}} 행과 열의 인덱스 정보를 가진 객체
     */
    _getEndIndexToPaste: function(startIdx, data, columnModelList) {
        var endIdx = {
            rowIdx: data.length + startIdx.rowIdx - 1,
            columnIdx: Math.min(data[0].length + startIdx.columnIdx, columnModelList.length) - 1
        };
        return endIdx;
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
        var row = this.dataModel.at(rowIdx),
            attributes = {},
            columnIdx, columnName, cellState, rowSpanData;

        if (!row) {
            row = this.dataModel.append({})[0];
        }
        for (columnIdx = columnStartIdx; columnIdx <= columnEndIdx; columnIdx += 1) {
            columnName = this.columnModel.at(columnIdx, true).columnName;
            cellState = row.getCellState(columnName);
            rowSpanData = row.getRowSpanData(columnName);

            if (cellState.isEditable && !cellState.isDisabled && (!rowSpanData || rowSpanData.count >= 0)) {
                attributes[columnName] = rowData[columnIdx - columnStartIdx];
            }
        }
        row.set(attributes);
    },

    /**
     * rowKey 와 columnName 에 해당하는 Cell 에 CSS className 을 설정한다.
     * @param {(Number|String)} rowKey 행 데이터의 고유 rowKey
     * @param {String} columnName 컬럼 이름
     * @param {String} className 지정할 디자인 클래스명
     */
    addCellClassName: function(rowKey, columnName, className) {
        this.dataModel.get(rowKey).addCellClassName(columnName, className);
    },

    /**
     * rowKey 에 해당하는 행 전체에 CSS className 을 설정한다.
     * @param {(Number|String)} rowKey 행 데이터의 고유 rowKey
     * @param {String} className 지정할 디자인 클래스명
     */
    addRowClassName: function(rowKey, className) {
        this.dataModel.get(rowKey).addClassName(className);
    },

    /**
     * rowKey 와 columnName 에 해당하는 Cell 에 CSS className 을 제거한다.
     * @param {(Number|String)} rowKey 행 데이터의 고유 rowKey
     * @param {String} columnName 컬럼 이름
     * @param {String} className 지정할 디자인 클래스명
     */
    removeCellClassName: function(rowKey, columnName, className) {
        this.dataModel.get(rowKey).removeCellClassName(columnName, className);
    },

    /**
     * rowKey 에 해당하는 행 전체에 CSS className 을 제거한다.
     * @param {(Number|String)} rowKey 행 데이터의 고유 rowKey
     * @param {String} className 지정할 디자인 클래스명
     */
    removeRowClassName: function(rowKey, className) {
        this.dataModel.get(rowKey).removeClassName(className);
    },

    /**
     * rowKey 와 columnName 에 해당하는 Cell 의 rowSpanData 를 반환한다.
     * @param {(Number|String)} rowKey 행 데이터의 고유 rowKey
     * @param {String} columnName 컬럼 이름
     * @returns {object} rowSpanData
     */
    getRowSpanData: function(rowKey, columnName) {
        var row = this.dataModel.get(rowKey);
        if (row) {
            return row.getRowSpanData(columnName);
        }
    },

    /**
     * rowKey에 해당하는 행의 인덱스를 반환한다.
     * @param {number|string} rowKey - 행 고유키
     * @return {number} - 인덱스
     */
    getIndexOfRow: function(rowKey) {
        return this.dataModel.indexOfRowKey(rowKey);
    },

    /**
     * 화면에 한번에 보여지는 행 개수를 변경한다.
     * @param {number} count - 행 개수
     */
    setDisplayRowCount: function(count) {
        this.dimensionModel.set('displayRowCount', count);
    },

    /**
     * 데이터 필터링 기능 함수. 전체 그리드 데이터의 columnName에 해당하는 데이터와 columnValue를 비교하여 필터링 한 결과를 그리드에 출력한다
     * @todo 기능 구현
     * @param {String} columnName 컬럼 이름
     * @param {(String|Number)} columnValue 컬럼 이름
     */
    filterData: function(columnName, columnValue) { // eslint-disable-line no-unused-vars
    },

    /**
     * 그리드를 편집할 수 있도록 막았던 포커스를 풀고 딤드를 제거한다.
     * @todo 기능 구현
     */
    enable: function() {
    },

    /**
     * 그리드를 편집할 수 없도록 입력 엘리먼트들의 포커스를 막고, 옵션에 따라 딤드 처리한다.
     * @todo 기능 구현
     */
    disable: function() {
    },

    /**
     * Sets the width and height of the dimension.
     * @param {(number|null)} width - Width
     * @param {(number|null)} height - Height
     */
    setSize: function(width, height) {
        if (width > 0) {
            this.$el.width(width);
        }
        if (height > 0) {
            this.dimensionModel.setHeight(height);
        }
        this.updateLayoutData();
    },

    /**
     * 스크롤 핸들러의 위치를 변경한다.
     * @todo 기능 구현
     */
    setScrollHandlerPosition: function() {},

    /**
     * 소멸자
     */
    destroy: function() {
        this.stopListening();
        this.destroyChildren();
        _.each(this, function(value, property) {
            if (property !== 'publicInstance') {
                if (value instanceof View) {
                    if (value && ne.util.isFunction(value.destroy)) {
                        value.destroy();
                    }
                }
                if (property === 'view') {
                    _.each(value, function(instance) {
                        if (instance && ne.util.isFunction(instance.destroy)) {
                            instance.destroy();
                        }
                    }, this);
                }
            }

            if (value && ne.util.isFunction(value._destroy)) {
                value._destroy();
            }

            if (value && ne.util.isFunction(value.stopListening)) {
                value.stopListening();
            }

            if (property !== '$el' && property !== '__$el') {
                this[property] = null;
            }
        }, this);
        this.$el.replaceWith(this.__$el);
        this.$el = this.__$el = null;
    }
});

Core.prototype.__instance = Core.prototype.__instance || {};

module.exports = Core;

},{"./addon/net":2,"./base/view":7,"./data/columnModel":9,"./data/rowList":11,"./model/dimension":13,"./model/focus":14,"./model/renderer":16,"./model/renderer-smart":15,"./util":19,"./view/cellFactory":20,"./view/clipboard":21,"./view/layer/empty":23,"./view/layer/loading":24,"./view/layer/ready":25,"./view/layout/frame-lside":27,"./view/layout/frame-rside":28,"./view/layout/toolbar":32,"./view/selection":48}],9:[function(require,module,exports){
/**
 * @fileoverview 컬럼 모델
 * @author NHN Ent. FE Development Team
 */
'use strict';

var Model = require('../base/model');

/**
 * 컬럼 모델 데이터를 다루는 객체
 * @module data/columnModel
 */
var ColumnModel = Model.extend(/**@lends module:data/columnModel.prototype */{
    /**
     * @constructs
     * @extends module:base/model
     */
    initialize: function() {
        Model.prototype.initialize.apply(this, arguments);
        this.textType = {
            'normal': true,
            'text': true,
            'text-password': true,
            'text-convertible': true
        };
        this._setColumnModelList(this.get('columnModelList'), this.get('columnFixIndex'));
        this.on('change', this._onChange, this);
    },

    defaults: {
        keyColumnName: null,
        columnFixIndex: 0,  //columnFixIndex
        columnModelList: [],
        visibleList: [],
        hasNumberColumn: true,
        selectType: '',
        columnModelMap: {},
        relationListMap: {}
    },

    /**
     * 인자로 넘어온 columnModelList 에 설정값에 맞게 number column 을 추가한다.
     * @param {Array} columnModelList   컬럼모델 배열
     * @return {Array}  _number 컬럼이 추가된 컬럼모델 배열
     * @private
     */
    _initializeNumberColumn: function(columnModelList) {
        var hasNumberColumn = this.get('hasNumberColumn'),
            numberColumn = {
                columnName: '_number',
                title: 'No.',
                width: 60
            };
        if (!hasNumberColumn) {
            numberColumn.isHidden = true;
        }

        columnModelList = this._extendColumn(numberColumn, columnModelList);
        return columnModelList;
    },

    /**
     * 인자로 넘어온 columnModelList 에 설정값에 맞게 button column 을 추가한다.
     * @param {Array} columnModelList 컬럼모델 배열
     * @return {Array} _button 컬럼이 추가된 컬럼모델 배열
     * @private
     */
    _initializeButtonColumn: function(columnModelList) {
        var selectType = this.get('selectType'),
            buttonColumn = {
                columnName: '_button',
                isHidden: false,
                editOption: {
                    type: selectType,
                    list: [{
                        value: 'selected'
                    }]
                },
                width: 50
            };

        if (selectType === 'checkbox') {
            buttonColumn.title = '<input type="checkbox"/>';
        } else if (selectType === 'radio') {
            buttonColumn.title = '선택';
        } else {
            buttonColumn.isHidden = true;
        }

        columnModelList = this._extendColumn(buttonColumn, columnModelList);

        return columnModelList;
    },

    /**
     * column 을 prepend 한다.
     * - 만약 columnName 에 해당하는 columnModel 이 이미 존재한다면 해당 columnModel 을 columnObj 로 확장한다.
     * - _number, _button 컬럼 초기화시 사용함.
     * @param {object} columnObj    prepend 할 컬럼모델
     * @param {Array} columnModelList   컬럼모델 배열
     * @return {Array} 확장한 결과 컬럼모델 배열
     * @private
     */
    _extendColumn: function(columnObj, columnModelList) {
        var index;
        if (!ne.util.isUndefined(columnObj) && !ne.util.isUndefined(columnObj['columnName'])) {
            index = this._indexOfColumnName(columnObj['columnName'], columnModelList);
            if (index === -1) {
                columnModelList = _.union([columnObj], columnModelList);
            } else {
                columnModelList[index] = $.extend(columnModelList[index], columnObj);
            }
        }
        return columnModelList;
    },

    /**
     * index 에 해당하는 columnModel 을 반환한다.
     * @param {Number} index    조회할 컬럼모델의 인덱스 값
     * @param {Boolean} isVisible [isVisible=false] 화면에 노출되는 컬럼모델 기준으로 찾을것인지 여부.
     * @return {object} 조회한 컬럼 모델
     */
    at: function(index, isVisible) {
        var columnModelList = isVisible ? this.getVisibleColumnModelList() : this.get('columnModelList');
        return columnModelList[index];
    },

    /**
     * columnName 에 해당하는 index를 반환한다.
     * @param {string} columnName   컬럼명
     * @param {Boolean} isVisible [isVisible=false] 화면에 노출되는 컬럼모델 기준으로 반환할 것인지 여부.
     * @return {number} index   컬럼명에 해당하는 인덱스 값
     */
    indexOfColumnName: function(columnName, isVisible) {
        var columnModelList;

        if (isVisible || isVisible === undefined) {
            columnModelList = this.getVisibleColumnModelList();
        } else {
            columnModelList = this.get('columnModelList');
        }
        return this._indexOfColumnName(columnName, columnModelList);
    },

    /**
     * columnName 에 해당하는 index를 반환한다.
     * - columnModel 이 내부에 세팅되기 전에 button, number column 을 추가할 때만 사용됨.
     * @param {string} columnName   컬럼명
     * @param {Array} columnModelList   컬럼모델 배열
     * @return {number} 컬럼명에 해당하는 인덱스 값
     * @private
     */
    _indexOfColumnName: function(columnName, columnModelList) {
        var i = 0, len = columnModelList.length;
        for (; i < len; i += 1) {
            if (columnModelList[i]['columnName'] === columnName) {
                return i;
            }
        }
        return -1;
    },

    /**
     * columnName 이 열고정 영역에 있는 column 인지 반환한다.
     * @param {String} columnName   컬럼명
     * @return {Boolean} 열고정 영역에 존재하는 컬럼인지 여부
     */
    isLside: function(columnName) {
        var index = this.indexOfColumnName(columnName, true),
            result = false;

        if (index >= 0 && this.get('columnFixIndex') > index) {
            result = true;
        }
        return result;
    },

    /**
     * 화면에 노출되는 (!isHidden) 컬럼 모델 리스트를 반환한다.
     * @param {String} [whichSide] 열고정 영역인지, 열고정이 아닌 영역인지 여부. 지정하지 않았을 경우 전체 visibleList 를 반환한다.
     * @return {Array}  조회한 컬럼모델 배열
     */
    getVisibleColumnModelList: function(whichSide) {
        var columnModelList = [],
            columnFixIndex = this.get('columnFixIndex');

        whichSide = (whichSide) ? whichSide.toUpperCase() : undefined;

        if (whichSide === 'L') {
            columnModelList = this.get('visibleList').slice(0, columnFixIndex);
        } else if (whichSide === 'R') {
            columnModelList = this.get('visibleList').slice(columnFixIndex);
        } else {
            columnModelList = this.get('visibleList');
        }

        return columnModelList;
    },

    /**
     * 인자로 받은 columnName 에 해당하는 columnModel 을 반환한다.
     * @param {String} columnName   컬럼명
     * @return {Object} 컬럼명에 해당하는 컬럼모델
     */
    getColumnModel: function(columnName) {
        return this.get('columnModelMap')[columnName];
    },

    /**
     * columnName 에 해당하는 컬럼의 타입이 textType 인지 확인한다.
     * 랜더링시 html 태그 문자열을 제거할때 사용됨.
     * @param {String} columnName 컬럼명
     * @return {boolean} text 타입인지 여부
     */
    isTextType: function(columnName) {
        return !!this.textType[this.getEditType(columnName)];
    },

    /**
     * 컬럼 모델로부터 editType 을 반환한다.
     * @param {string} columnName The name of the target column
     * @return {string} 해당하는 columnName 의 editType 을 반환한다.
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

    /**
     * 인자로 받은 컬럼 모델에서 !isHidden 를 만족하는 리스트를 추려서 반환한다.
     * @param {Array} columnModelList   컬럼모델 배열
     * @return {Array}  isHidden 이 설정되지 않은 컬럼모델 배열
     * @private
     */
    _getVisibleList: function(columnModelList) {
        return _.filter(columnModelList, function(item) {
            return !item['isHidden'];
        });
    },

    /**
     * 각 columnModel 의 relationList 를 모아 주체가 되는 columnName 기준으로 relationListMap 를 생성하여 반환한다.
     * @param {Array} columnModelList - Column Model List
     * @return {{}|{columnName1: Array, columnName1: Array}} columnName 기준으로 생성된 relationListMap
     * @private
     */
    _getRelationListMap: function(columnModelList) {
        var columnName,
            relationListMap = {};

        ne.util.forEachArray(columnModelList, function(columnModel) {
            columnName = columnModel['columnName'];
            if (columnModel.relationList) {
                relationListMap[columnName] = columnModel.relationList;
            }
        });
        return relationListMap;
    },

    /**
     * isIgnore 가 true 로 설정된 columnName 의 list 를 반환한다.
     * @return {Array} isIgnore 가 true 로 설정된 columnName 배열.
     */
    getIgnoredColumnNameList: function() {
        var columnModelLsit = this.get('columnModelList'),
            ignoreColumnNameList = [];
        _.each(columnModelLsit, function(columnModel) {
            if (columnModel.isIgnore) {
                ignoreColumnNameList.push(columnModel['columnName']);
            }
        });
        return ignoreColumnNameList;
    },

    /**
     * 인자로 받은 columnModel 을 _number, _button 에 대하여 기본 형태로 가공한 뒤,
     * 열고정 영역 기준으로 partition 으로 나뉜 visible list 등 내부적으로 사용할 부가정보를 가공하여 저장한다.
     * @param {Array} columnModelList   컬럼모델 배열
     * @param {Number} columnFixIndex   열고정 인덱스
     * @private
     */
    _setColumnModelList: function(columnModelList, columnFixIndex) {
        var visibleList;

        columnModelList = $.extend(true, [], columnModelList);
        columnModelList = this._initializeNumberColumn(this._initializeButtonColumn(columnModelList));
        visibleList = this._getVisibleList(columnModelList);

        this.set({
            columnModelList: columnModelList,
            columnModelMap: _.indexBy(columnModelList, 'columnName'),
            relationListMap: this._getRelationListMap(columnModelList),
            columnFixIndex: columnFixIndex,
            visibleList: visibleList
        }, {silent: true});

        this.trigger('columnModelChange');
    },

    /**
     * change 이벤트 발생시 핸들러
     * @param {Object} model change 이벤트가 발생한 model 객체
     * @private
     */
    _onChange: function(model) {
        var changed = model.changed,
            columnModelList = changed['columnModelList'] || this.get('columnModelList'),
            columnFixIndex = changed['columnFixIndex'] ? changed['columnFixIndex'] : this.get('columnFixIndex');

        this._setColumnModelList(columnModelList, columnFixIndex);
    }
});

module.exports = ColumnModel;

},{"../base/model":5}],10:[function(require,module,exports){
/**
 * @fileoverview Grid 의 Data Source 에 해당하는 Model 정의
 * @author NHN Ent. FE Development Team
 */
'use strict';

var Model = require('../base/model');
var util = require('../util');

/**
 * Data 중 각 행의 데이터 모델 (DataSource)
 * @module data/row
 */
var Row = Model.extend(/**@lends module:data/row.prototype */{
    /**
     * @constructs
     * @extends module:base/model
     */
    initialize: function() {
        Model.prototype.initialize.apply(this, arguments);
    },

    idAttribute: 'rowKey',
    defaults: {
        _extraData: {
            'rowState': null
        }
    },

    /**
     * extraData 로 부터 rowState 를 object 형태로 반환한다.
     * @return {{isDisabled: boolean, isDisabledCheck: boolean}} rowState 정보
     */
    getRowState: function() {
        var extraData = this.get('_extraData'),
            rowState = extraData && extraData['rowState'],
            isDisabledCheck = false,
            isDisabled = false,
            isChecked = false;

        if (rowState === 'DISABLED') {
            isDisabled = true;
        } else if (rowState === 'DISABLED_CHECK') {
            isDisabledCheck = true;
        } else if (rowState === 'CHECKED') {
            isChecked = true;
        }

        isDisabledCheck = isDisabled ? isDisabled : isDisabledCheck;

        return {
            isDisabled: isDisabled,
            isDisabledCheck: isDisabledCheck,
            isChecked: isChecked
        };
    },
    /**
     * row의 extraData에 설정된 classNameList 를 반환한다.
     * @param {String} [columnName] columnName 이 없을 경우 row 에 정의된 className 만 반환한다.
     * @return {Array} css 클래스 이름의 배열
     */
    getClassNameList: function(columnName) {
        var classNameList = [],
            columnModel = this.grid.columnModel.getColumnModel(columnName),
            extraData = this.get('_extraData'),
            classNameObj = extraData.className,
            rowClassNameList = (classNameObj && classNameObj['row']) ? classNameObj['row'] : [], //_extraData 의 row 에 할당된 className 을 담는다.
            columnClassNameList = (classNameObj && classNameObj['column'] && classNameObj['column'][columnName]) ? classNameObj['column'][columnName] : [], //_extraData 의 column 에 할당된 className 을 담는다.
            tmpList,
            classNameMap = {},
            columnModelClassNameList = []; //columnModel 에 할당된 className 리스트

        if (columnModel.className) {
            columnModelClassNameList.push(columnModel.className);
        }
        if (columnModel.isEllipsis) {
            columnModelClassNameList.push('ellipsis');
        }

        tmpList = [classNameList, rowClassNameList, columnClassNameList, columnModelClassNameList];

        ne.util.forEachArray(tmpList, function(list) {
            ne.util.forEachArray(list, function(item) {
                var sliced = item.slice(' ');
                if (ne.util.isArray(sliced)) {
                    ne.util.forEachArray(sliced, function(className) {
                        classNameMap[className] = true;
                    });
                } else {
                    classNameMap[item] = true;
                }
            });
        });

        ne.util.forEach(classNameMap, function(value, className) {
            classNameList.push(className);
        });

        return classNameList;
    },
    /**
     * columnName 에 해당하는 셀의 편집 가능여부와 disabled 상태 여부를 반환한다.
     * @param {String} columnName   컬럼명
     * @return {{isEditable: boolean, isDisabled: boolean}} 편집 가능여부와 disabled 상태 정보
     */
    getCellState: function(columnName) {
        var notEditableTypeList = ['_number', 'normal'],
            columnModel = this.grid.columnModel,
            isDisabled = false,
            isEditable = true,
            editType = columnModel.getEditType(columnName),
            rowState, relationResult;


        relationResult = this.getRelationResult(['isDisabled', 'isEditable'])[columnName];
        rowState = this.getRowState();

        if (columnName === '_button') {
            isDisabled = rowState.isDisabledCheck;
        } else {
            isDisabled = rowState.isDisabled;
        }
        isDisabled = isDisabled || !!(relationResult && relationResult['isDisabled']);

        if ($.inArray(editType, notEditableTypeList) !== -1) {
            isEditable = false;
        } else {
            isEditable = !(relationResult && relationResult['isEditable'] === false);
        }

        return {
            isEditable: isEditable,
            isDisabled: isDisabled
        };
    },

    /**
     * rowKey 와 columnName 에 해당하는 셀이 편집 가능한지 여부를 반환한다.
     * @param {String} columnName   컬럼명
     * @return {Boolean}    편집 가능한지 여부
     */
    isEditable: function(columnName) {
        var notEditableTypeList = ['_number', 'normal'],
            editType = this.grid.columnModel.getEditType(columnName),
            result = false;

        if ($.inArray(editType, notEditableTypeList) === -1) {
            result = this.getCellState(columnName).isEditable;
        }
        return result;
    },

    /**
     * rowKey 와 columnName 에 해당하는 셀이 disable 상태인지 여부를 반환한다.
     * @param {String} columnName   컬럼명
     * @return {Boolean}    disabled 처리를 할지 여부
     */
    isDisabled: function(columnName) {
        var cellState;
        cellState = this.getCellState(columnName);
        return cellState.isDisabled;
    },

    /**
     * getRowSpanData
     * rowSpan 설정값을 반환한다.
     * @param {String} [columnName] 인자가 존재하지 않을 경우, 행 전체의 rowSpanData 를 맵 형태로 반환한다.
     * @return {*|{count: number, isMainRow: boolean, mainRowKey: *}}   rowSpan 설정값
     */
    getRowSpanData: function(columnName) {
        var extraData = this.get('_extraData'),
            rowSpanData = null;

        if (this.collection.isRowSpanEnable()) {
            if (!columnName) {
                rowSpanData = extraData['rowSpanData'];
            } else if (extraData && extraData['rowSpanData'] && extraData['rowSpanData'][columnName]) {
                rowSpanData = extraData['rowSpanData'][columnName];
            }
        }

        if (!rowSpanData && columnName) {
            rowSpanData = {
                count: 0,
                isMainRow: true,
                mainRowKey: this.get('rowKey')
            };
        }
        return rowSpanData;
    },

    /**
     * row 의 extraData 를 변경한다.
     * -Backbone 내부적으로 참조형 데이터의 프로퍼티 변경시 변화를 감지하지 못하므로, 데이터를 복제하여 변경 후 set 한다.
     * @param {Object} value    extraData 에 설정될 값
     * @param {Boolean} [silent=false] Backbone 의 'change' 이벤트 발생 여부
     */
    setExtraData: function(value, silent) {
        var extraData = $.extend(true, {}, this.get('_extraData'), value);

        this.set('_extraData', extraData, {
            silent: silent
        });
    },

    /**
     * rowSpanData를 설정한다.
     * @param {string} columnName - 컬럼명
     * @param {object} data - rowSpan 정보를 가진 객체
     */
    setRowSpanData: function(columnName, data) {
        var extraData, rowSpanData;

        if (!columnName) {
            return;
        }
        if (ne.util.isFalsy(data)) {
            extraData = this._getExtraDataClone();
            if (!extraData) {
                return;
            }
            rowSpanData = extraData.rowSpanData;

            if (rowSpanData && rowSpanData[columnName]) {
                delete rowSpanData[columnName];

                if (_.isEmpty(rowSpanData)) {
                    extraData.rowSpanData = null;
                }
                this.set('_extraData', extraData);
            }
        } else {
            rowSpanData = {};
            rowSpanData[columnName] = data;
            this.setExtraData({
                rowSpanData: rowSpanData
            }, true);
        }
    },

    /**
     * rowState 를 설정한다.
     * @param {string} rowState 해당 행의 상태값. 'DISABLED|DISABLED_CHECK|CHECKED' 중 하나를 설정한다.
     * @param {boolean} silent 내부 change 이벤트 발생 여부
     */
    setRowState: function(rowState, silent) {
        this.setExtraData({rowState: rowState}, silent);
    },

    /**
     * rowKey 에 해당하는 _extraData 를 복제하여 반환한다.
     * @param {(Number|String)} rowKey  데이터의 키값
     * @return {object} 조회한 rowKey 에 해당하는 extraData 사본
     * @private
     */
    _getExtraDataClone: function() {
        return $.extend(true, {}, this.get('_extraData'));
    },

    /**
     * rowKey 와 columnName 에 해당하는 Cell 에 CSS className 을 설정한다.
     * @param {String} columnName 컬럼 이름
     * @param {String} className 지정할 디자인 클래스명
     */
    addCellClassName: function(columnName, className) {
        var extraData = this._getExtraDataClone(),
            classNameData,
            classNameList;

        if (!ne.util.isUndefined(extraData)) {
            classNameData = extraData.className || {};
            classNameData.column = classNameData.column || {};
            classNameList = classNameData.column[columnName] || [];

            if (ne.util.inArray(className, classNameList) === -1) {
                classNameList.push(className);
                classNameData.column[columnName] = classNameList;
                this.setExtraData({className: classNameData});
            }
        }
    },

    /**
     * rowKey 에 해당하는 행 전체에 CSS className 을 설정한다.
     * @param {(Number|String)} rowKey 행 데이터의 고유 rowKey
     * @param {String} className 지정할 디자인 클래스명
     */
    addClassName: function(className) {
        var extraData = this._getExtraDataClone(),
            classNameData,
            classNameList;

        if (!ne.util.isUndefined(extraData)) {
            classNameData = extraData.className || {};
            classNameList = classNameData.row || [];

            if (ne.util.inArray(className, classNameList) === -1) {
                classNameList.push(className);
                classNameData.row = classNameList;
                this.setExtraData({className: classNameData});
            }
        }
    },

    /**
     * rowKey 와 columnName 에 해당하는 Cell 에 CSS className 을 제거한다.
     * @param {String} columnName 컬럼 이름
     * @param {String} className 지정할 디자인 클래스명
     */
    removeCellClassName: function(columnName, className) {
        var extraData = this._getExtraDataClone(),
            classNameData;

        if (ne.util.isExisty(ne.util.pick(extraData, 'className', 'column', columnName))) {
            classNameData = extraData.className;
            classNameData.column[columnName] = this._removeClassNameFromArray(classNameData.column[columnName], className);
            this.set('_extraData', extraData);
        }
    },

    /**
     * rowKey 에 해당하는 행 전체에 CSS className 을 제거한다.
     * @param {(Number|String)} rowKey 행 데이터의 고유 rowKey
     * @param {String} className 지정할 디자인 클래스명
     */
    removeClassName: function(className) {
        var extraData = this._getExtraDataClone(),
            classNameData;

        if (extraData && extraData.className && extraData.className.row) {
            classNameData = extraData.className;
            classNameData.row = this._removeClassNameFromArray(classNameData.row, className);
            //배열 제거이기 때문에 deep extend 를 하는 setExtraData 를 호출하면 삭제가 반영되지 않는다.
            this.set('_extraData', extraData);
        }
    },

    /**
     * className 이 담긴 배열로부터 특정 className 을 제거하여 반환한다.
     * @param {Array} classNameList 디자인 클래스명 리스트
     * @param {String} className    제거할 클래스명
     * @return {Array}  제거된 디자인 클래스명 리스트
     * @private
     */
    _removeClassNameFromArray: function(classNameList, className) {
        //배열 요소가 'class1 class2' 와 같이 두개 이상의 className을 포함할 수 있어, join & split 함.
        var classNameString = classNameList.join(' ');
        classNameList = classNameString.split(' ');
        return _.without(classNameList, className);
    },

    /**
     * html string 을 encoding 한다.
     * columnModel 에 notUseHtmlEntity 가 설정된 경우는 동작하지 않는다.
     *
     * @param {String} columnName   컬럼명
     * @return {String} 인코딩된 결과값
     */
    getHTMLEncodedString: function(columnName) {
        var columnModel = this.grid.columnModel.getColumnModel(columnName),
            isTextType = this.grid.columnModel.isTextType(columnName),
            value = this.get(columnName),
            notUseHtmlEntity = columnModel.notUseHtmlEntity;
        if (!notUseHtmlEntity && isTextType && ne.util.hasEncodableString(value)) {
            value = ne.util.encodeHTMLEntity(value);
        }
        return value;
    },

    /**
     * ctrl + c 로 복사 기능을 사용할 때 list 형태(select, button, checkbox)의 cell 의 경우, 해당 value 에 부합하는 text로 가공한다.
     * List type 의 경우 데이터 값과 editOption.list 의 text 값이 다르기 때문에
     * text 로 전환해서 반환할 때 처리를 하여 변환한다.
     *
     * @param {String} columnName   컬럼명
     * @return {String} text 형태로 가공된 문자열
     * @private
     */
    _getListTypeVisibleText: function(columnName) {
        var value = this.get(columnName),
            columnModel = this.grid.columnModel.getColumnModel(columnName),
            resultOptionList, editOptionList, typeExpected, valueList;

        if (ne.util.isExisty(ne.util.pick(columnModel, 'editOption', 'list'))) {
            resultOptionList = this.getRelationResult(['optionListChange'])[columnName];
            editOptionList = resultOptionList && resultOptionList['optionList'] ?
                    resultOptionList['optionList'] : columnModel.editOption.list;

            typeExpected = typeof editOptionList[0].value;
            valueList = value.toString().split(',');
            if (typeExpected !== typeof valueList[0]) {
                valueList = _.map(valueList, function(val) {
                    return util.convertValueType(val, typeExpected);
                });
            }
            _.each(valueList, function(val, index) {
                var item = _.findWhere(editOptionList, {value: val});
                valueList[index] = item && item.text || '';
            }, this);

            return valueList.join(',');
        }
    },

    /**
     * change 이벤트 발생시 동일한 changed 객체의 public 프라퍼티가 동일한 경우 중복 처리를 막기 위해 사용한다.
     * 10ms 내에 같은 객체로 함수 호출이 일어나면 true를 반환한다.
     * @param {object} publicChanged 비교할 객체
     * @return {boolean} 중복이면 true, 아니면 false
     */
    isDuplicatedPublicChanged: function(publicChanged) {
        if (this._timeoutIdForChanged && _.isEqual(this._lastPublicChanged, publicChanged)) {
            return true;
        }
        clearTimeout(this._timeoutIdForChanged);
        this._timeoutIdForChanged = setTimeout(_.bind(function() {
            this._timeoutIdForChanged = null;
        }, this), 10);
        this._lastPublicChanged = publicChanged;

        return false;
    },

    /**
     * 복사 기능을 사용할 때 화면에 보여지는 데이터를 반환한다.
     * @param {String} columnName   컬럼명
     * @return {String} 화면에 보여지는 데이터로 가공된 문자열
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
                if (ne.util.isExisty(ne.util.pick(model, 'editOption', 'list', 0, 'value'))) {
                    value = this._getListTypeVisibleText(columnName);
                } else {
                    throw this.error('Check "' + columnName + '"\'s editOption.list property out in your ColumnModel.');
                }
            } else if (_.isFunction(model.formatter)) {
                //editType 이 없는 경우, formatter 가 있다면 formatter를 적용한다.
                value = util.stripTags(model.formatter(this.getHTMLEncodedString(columnName), this.toJSON(), model));
            }
        }
        value = !ne.util.isUndefined(value) ? value.toString() : value;
        return value;
    },

    /**
     * 컬럼모델에 정의된 relation 들을 수행한 결과를 반환한다. (기존 affectOption)
     *
     * @param {Array}   callbackNameList 반환값의 결과를 확인할 대상 callbackList. (default : ['optionListChange', 'isDisabled', 'isEditable'])
     * @return {{}|{columnName: {attribute: *}}} row 의 columnName 에 적용될 속성값.
     */
    getRelationResult: function(callbackNameList) {
        var rowData = this.attributes,
            relationListMap = this.grid.columnModel.get('relationListMap'),
            relationResult = {},
            rowState = this.getRowState(),
            callback, attribute, targetColumnList, value;

        callbackNameList = (callbackNameList && callbackNameList.length) ?
            callbackNameList : ['optionListChange', 'isDisabled', 'isEditable'];

        //columnModel 에 저장된 relationListMap 을 순회하며 데이터를 가져온다.
        // relationListMap 구조 {columnName : relationList}
        _.each(relationListMap, function(relationList, columnName) {
            value = rowData[columnName];
            //relationList 를 순회하며 수행한다.
            _.each(relationList, function(relation) {
                targetColumnList = relation.columnList;

                //각 relation 에 걸려있는 콜백들을 수행한다.
                _.each(callbackNameList, function(callbackName) {
                    //isDisabled relation 의 경우 rowState 설정 값을 우선적으로 선택한다.
                    if (!(rowState.isDisabled && callbackName === 'isDisabled')) {
                        callback = relation[callbackName];
                        if (typeof callback === 'function') {
                            attribute = '';
                            if (callbackName === 'optionListChange') {
                                attribute = 'optionList';
                            } else if (callbackName === 'isDisabled') {
                                attribute = 'isDisabled';
                            } else if (callbackName === 'isEditable') {
                                attribute = 'isEditable';
                            }
                            if (attribute) {
                                //relation 에 걸려있는 컬럼들의 값을 변경한다.
                                _.each(targetColumnList, function(targetColumnName) {
                                    relationResult[targetColumnName] = relationResult[targetColumnName] || {};
                                    relationResult[targetColumnName][attribute] = callback(value, rowData);
                                }, this);
                            }
                        }
                    }
                }, this);
            }, this);
        }, this);
        return relationResult;
    }
});

module.exports = Row;

},{"../base/model":5,"../util":19}],11:[function(require,module,exports){
/**
 * @fileoverview Grid 의 Data Source 에 해당하는 Collection 정의
 * @author NHN Ent. FE Development Team
 */
'use strict';

var Collection = require('../base/collection');
var Row = require('./row');

/**
 * Raw 데이터 RowList 콜렉션. (DataSource)
 * Grid.setRowList 를 사용하여 콜렉션을 설정한다.
 * @module data/rowList
 */
var RowList = Collection.extend(/**@lends module:data/rowList.prototype */{
    model: Row,
    /**
     * @param {Array} models    콜랙션에 추가할 model 리스트
     * @param {Object} options   생성자의 option 객체
     * @extends module:base/collection
     * @constructs
     */
    initialize: function(models, options) {
        Collection.prototype.initialize.apply(this, arguments);
        this.setOwnProperties({
            lastRowKey: -1,
            originalRowList: [],
            originalRowMap: {},
            startIndex: options.startIndex || 1,
            privateProperties: [
                '_button',
                '_number',
                '_extraData'
            ],
            sortOptions: {
                columnName: 'rowKey',
                isAscending: true,
                useClient: (ne.util.isBoolean(options.useClientSort) ? options.useClientSort : true)
            }
        });
        if (!this.sortOptions.useClient) {
            this.comparator = null;
        }

        this.on('change', this._onChange, this);
    },
    /**
     * Backbone 이 collection 생성 시 내부적으로 parse 를 호출하여 데이터를 포멧에 맞게 파싱한다.
     * @param {Array} data  원본 데이터
     * @return {Array}  파싱하여 가공된 데이터
     */
    parse: function(data) {
        data = data && data['contents'] || data;
        return this._formatData(data);
    },
    /**
     * 데이터의 _extraData 를 분석하여, Model 에서 사용할 수 있도록 가공한다.
     * _extraData 필드에 rowSpanData 를 추가한다.
     * @param {Array} data  가공할 데이터
     * @return {Array} 가공된 데이터
     * @private
     */
    _formatData: function(data) {
        var rowList = data;

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
     * @return {object} 가공된 row 데이터
     * @private
     */
    _baseFormat: function(row) {
        var defaultExtraData = {
                rowSpan: null,
                rowSpanData: null,
                rowState: null
            },
            keyColumnName = this.grid.columnModel.get('keyColumnName'),
            rowKey = (keyColumnName === null) ? this._createRowKey() : row[keyColumnName];

        row['_extraData'] = $.extend(defaultExtraData, row['_extraData']);
        row['_button'] = (row['_extraData']['rowState'] === 'CHECKED');
        row['rowKey'] = rowKey;
        return row;
    },

    /**
     * 새로운 rowKey를 생성해서 반환한다.
     * @return {number} 생성된 rowKey
     */
    _createRowKey: function() {
        this.lastRowKey += 1;
        return this.lastRowKey;
    },

    /**
     * 랜더링시 사용될 extraData 필드에 rowSpanData 값을 세팅한다.
     * @param {Array} rowList - 전체 rowList 배열. rowSpan 된 경우 자식 row 의 데이터도 가공해야 하기 때문에 전체 list 를 인자로 넘긴다.
     * @param {number} index - 해당 배열에서 extraData 를 설정할 배열
     * @return {Array} rowList - 가공된 rowList
     * @private
     */
    _setExtraRowSpanData: function(rowList, index) {
        var row = rowList[index],
            rowSpan = row && row['_extraData'] && row['_extraData']['rowSpan'],
            rowKey = row && row['rowKey'],
            subCount, childRow, i;

        function hasRowSpanData(row, columnName) { // eslint-disable-line no-shadow
            var extraData = row['_extraData'];
            return !!(extraData['rowSpanData'] && extraData['rowSpanData'][columnName]);
        }
        function setRowSpanData(row, columnName, rowSpanData) { // eslint-disable-line no-shadow
            var extraData = row['_extraData'];
            extraData['rowSpanData'] = extraData && extraData['rowSpanData'] || {};
            extraData['rowSpanData'][columnName] = rowSpanData;
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
                        childRow['_extraData'] = childRow['_extraData'] || {};
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
     * @return {Array} format 을 거친 데이터 리스트.
     */
    setOriginalRowList: function(rowList) {
        this.originalRowList = rowList ? this._formatData(rowList) : this.toJSON();
        this.originalRowMap = _.indexBy(this.originalRowList, 'rowKey');
        return this.originalRowList;
    },

    /**
     * 원본 데이터 리스트를 반환한다.
     * @param {boolean} [isClone=true]  데이터 복제 여부.
     * @return {Array}  원본 데이터 리스트 배열.
     */
    getOriginalRowList: function(isClone) {
        isClone = isClone === undefined ? true : isClone;
        return isClone ? _.clone(this.originalRowList) : this.originalRowList;
    },

    /**
     * 원본 row 데이터를 반환한다.
     * @param {(Number|String)} rowKey  데이터의 키값
     * @return {Object} 해당 행의 원본 데이터값
     */
    getOriginalRow: function(rowKey) {
        return _.clone(this.originalRowMap[rowKey]);
    },

    /**
     * rowKey 와 columnName 에 해당하는 원본 데이터를 반환한다.
     * @param {(Number|String)} rowKey  데이터의 키값
     * @param {String} columnName   컬럼명
     * @return {(Number|String)}    rowKey 와 컬럼명에 해당하는 셀의 원본 데이터값
     */
    getOriginal: function(rowKey, columnName) {
        return _.clone(this.originalRowMap[rowKey][columnName]);
    },

    /**
     * mainRowKey 를 반환한다.
     * @param {(Number|String)} rowKey  데이터의 키값
     * @param {String} columnName   컬럼명
     * @return {(Number|String)}    rowKey 와 컬럼명에 해당하는 셀의 main row 키값
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
     * @return {Number} 키값에 해당하는 row의 인덱스
     */
    indexOfRowKey: function(rowKey) {
        return this.indexOf(this.get(rowKey));
    },

    /**
     * rowData 의 프로퍼티 중 내부에서 사용하는 프로퍼티인지 여부를 반환한다.
     * - 서버로 전송 시 내부에서 사용하는 데이터 제거시 사용 됨
     * @param {String} name 확인할 프로퍼티 명
     * @return {boolean}    private 프로퍼티인지 여부.
     * @private
     */
    _isPrivateProperty: function(name) {
        return $.inArray(name, this.privateProperties) !== -1;
    },

    /**
     * rowSpan 이 적용되어야 하는지 여부를 반환한다.
     * 랜더링시 사용된다.
     * - sorted, 혹은 filterd 된 경우 false 를 리턴한다.
     * @return {boolean}    랜더링 시 rowSpan 을 해야하는지 여부
     */
    isRowSpanEnable: function() {
        return !this.isSortedByField();
    },

    /**
     * 현재 RowKey가 아닌 다른 컬럼에 의해 정렬된 상태인지 여부를 반환한다.
     * @return {Boolean}    정렬된 상태인지 여부
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

        if (ne.util.isUndefined(columnName)) {
            columnName = 'rowKey';
        }
        if (ne.util.isUndefined(isAscending)) {
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

        if (ne.util.isUndefined(isAscending)) {
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
        var rowList,
            checkedRowList;
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
     * rowData 변경 이벤트 핸들러.
     * changeCallback 과 rowSpanData 에 대한 처리를 담당한다.
     * @param {object} row  데이터의 키값
     * @private
     */
    _onChange: function(row) {
        var columnModel,
            publicChanged = _.omit(row.changed, this.privateProperties);

        if (row.isDuplicatedPublicChanged(publicChanged)) {
            return;
        }
        _.each(publicChanged, function(value, columnName) {
            columnModel = this.grid.columnModel.getColumnModel(columnName);
            if (!columnModel) {
                return;
            }
            if (!this._executeChangeBeforeCallback(row, columnName)) {
                return;
            }
            this._syncRowSpannedData(row, columnName, value);
            this._executeChangeAfterCallback(row, columnName);
            if (!row.getRowState().isDisabledCheck && !columnModel.isIgnore) {
                row.set('_button', true);
            }
        }, this);
    },

    /**
     * row Data 값에 변경이 발생했을 경우, sorting 되지 않은 경우에만
     * rowSpan 된 데이터들도 함께 update 한다.
     *
     * @param {object} row row 모델
     * @param {String} columnName   변경이 발생한 컬럼명
     * @param {(String|Number)} value 변경된 값
     * @private
     */
    _syncRowSpannedData: function(row, columnName, value) {
        var index, rowSpanData, i;

        //정렬 되지 않았을 때만 rowSpan 된 데이터들도 함께 update 한다.
        if (this.isRowSpanEnable()) {
            rowSpanData = row.getRowSpanData(columnName);
            if (!rowSpanData['isMainRow']) {
                this.get(rowSpanData['mainRowKey']).set(columnName, value);
            } else {
                index = this.indexOfRowKey(row.get('rowKey'));
                for (i = 0; i < rowSpanData['count'] - 1; i += 1) {
                    this.at(i + 1 + index).set(columnName, value);
                }
            }
        }
    },

    /**
     * columnModel 에 정의된 changeCallback 을 수행할 때 전달핼 이벤트 객체를 생성한다.
     * @param {object} row row 모델
     * @param {String} columnName 컬럼명
     * @return {{rowKey: (number|string), columnName: string, columnData: *, instance: {object}}} changeCallback 에 전달될 이벤트 객체
     * @private
     */
    _createChangeCallbackEvent: function(row, columnName) {
        return {
            rowKey: row.get('rowKey'),
            columnName: columnName,
            value: row.get(columnName),
            instance: this.grid.publicInstance
        };
    },

    /**
     * columnModel 에 정의된 changeBeforeCallback 을 수행한다.
     * changeBeforeCallback 의 결과가 false 일 때, 데이터를 복원후 false 를 반환한다.
     *
     * @param {object} row row 모델
     * @param {String} columnName   컬럼명
     * @return {boolean} changeBeforeCallback 수행 결과값
     * @private
     */
    _executeChangeBeforeCallback: function(row, columnName) {
        var columnModel = this.grid.columnModel.getColumnModel(columnName),
            changeEvent,
            obj;
        if (columnModel.editOption && columnModel.editOption.changeBeforeCallback) {
            changeEvent = this._createChangeCallbackEvent(row, columnName);
            //beforeChangeCallback 의 결과값이 false 라면 restore 후 false 를 반환한다.
            if (columnModel.editOption.changeBeforeCallback(changeEvent) === false) {
                obj = {};
                obj[columnName] = row.previous(columnName);
                row.set(obj);
                row.trigger('restore', {
                    changed: obj
                });
                return false;
            }
        }
        return true;
    },

    /**
     * columnModel 에 정의된 changeAfterCallback 을 수행한다.
     * @param {object} row - row 모델
     * @param {String} columnName - 컬럼명
     * @return {boolean} changeAfterCallback 수행 결과값
     * @private
     */
    _executeChangeAfterCallback: function(row, columnName) {
        var columnModel = this.grid.columnModel.getColumnModel(columnName),
            changeEvent;

        if (columnModel.editOption && columnModel.editOption.changeAfterCallback) {
            changeEvent = this._createChangeCallbackEvent(row, columnName);
            return !!(columnModel.editOption.changeAfterCallback(changeEvent));
        }
        return true;
    },

    /**
     * Backbone 에서 sort() 실행시 내부적으로 사용되는 메소드.
     * @param {Row} a 비교할 앞의 모델
     * @param {Row} b 비교할 뒤의 모델
     * @return {number} a가 b보다 작으면 -1, 같으면 0, 크면 1. 내림차순이면 반대.
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
     * @return {Array}  private 프로퍼티를 제거한 결과값
     * @private
     */
    _removePrivateProp: function(rowList) {
        var obj,
            filteredRowList = [];

        _.each(rowList, function(row) {
            obj = {};
            //_로 시작하는 property 들은 제거한다.
            _.each(row, function(value, key) {
                if (!this._isPrivateProperty(key)) {
                    obj[key] = value;
                }
            }, this);
            filteredRowList.push(obj);
        }, this);

        return filteredRowList;
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
     * @return {Object} 값이 비어있는 더미 row 데이터
     * @private
     */
    _createDummyRow: function() {
        var columnModelList = this.grid.columnModel.get('columnModelList'),
            data = {};
        _.each(columnModelList, function(columnModel) {
            data[columnModel['columnName']] = '';
        }, this);
        return data;
    },

    /**
     * 현재 rowList 중 at 에 해당하는 인덱스에 데이터를 append 한다.
     * @param {object|array} rowData - 행 추가할 데이터. Array일 경우 여러행를 동시에 추가한다.
     * @param {object} [options] - 옵션 객체
     * @param {number} [options.at] - 데이터를 append 할 index
     * @param {boolean} [options.extendPrevRowSpan] - 이전 행의 rowSpan 데이터가 있는 경우 합칠지 여부
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
        this.trigger('add', modelList, addOptions);
        return modelList;
    },

    /**
     * 현재 rowList 에 최상단에 데이터를 append 한다.
     * @param {Object} rowData  prepend 할 행 데이터
     */
    prepend: function(rowData) {
        return this.append(rowData, {
            at: 0
        });
    },

    /**
     * 주어진 데이터로 모델 목록을 생성하여 반환한다.
     * @param {object|array} rowData - 모델을 생성할 데이터. Array일 경우 여러개를 동시에 생성한다.
     * @return {Row[]} 생성된 모델 목록
     */
    _createModelList: function(rowData) {
        var modelList = [],
            rowList;

        rowData = rowData || this._createDummyRow();
        if (!ne.util.isArray(rowData)) {
            rowData = [rowData];
        }
        rowList = this._formatData(rowData);

        _.each(rowList, function(row) {
            row._button = true;
            modelList.push(new Row(row, {collection: this}));
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
            row.set(columnName, '', {
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
     * @return {boolean} - 수정여부
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
     * @return {{createList: Array, updateList: Array, deleteList: Array}} options 조건에 해당하는 수정된 rowList 정보
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
        filteringColumnList = _.union(filteringColumnList, this.grid.columnModel.getIgnoredColumnNameList());

        // 추가/ 수정된 행 추출
        _.each(current, function(row, rowKey) {
            var originalRow = original[rowKey],
                item = isOnlyRowKeyList ? row['rowKey'] : row;

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
            var item = isOnlyRowKeyList ? obj['rowKey'] : obj;
            if (!current[rowKey]) {
                result.deleteList.push(item);
            }
        }, this);
        return result;
    }
});

module.exports = RowList;

},{"../base/collection":3,"./row":10}],12:[function(require,module,exports){
/**
 * @fileoverview The ne.Grid class for the external API.
 * @author NHN Ent. FE Development Team
 */
'use strict';

/**
 * Grid public API
 *
 * @param {Object} options
 *      @param {number} [options.columnFixIndex=0] - Column index for fixed column. The columns indexed from 0 to this value will alaways be shown on the left side. {@link ne.Grid#setColumnFixIndex|setColumnFixIndex} can be used for setting this value dynamically.
 *      @param {string} [options.selectType=''] - Type of buttons shown next to the _number(rowKey) column. The string value 'checkbox' or 'radiobox' can be used. If not specified, the button column will not be shown.
 *      @param {boolean} [options.autoNumbering=true] - Specifies whether to assign a auto increasing number to each rows when rendering time.
 *      @param {number} [options.headerHeight=35] - The height of header area. When rows in header are multiple (merged column), this value must be the total height of rows.
 *      @param {number} [options.rowHeight=27] - The height of each rows.
 *      @param {number} [options.displayRowCount=10] - The number of rows to be shown in the table area. Total height of grid will be set based on this value.
 *      @param {number} [options.minimumColumnWidth=50] - Minimum width of each columns.
 *      @param {boolean} [options.useClientSort=true] - If set to true, sorting will be executed by client itself without server.
 *      @param {boolean} [options.singleClickEdit=false] - If set to true, text-convertible cell will be changed to edit-mode with a single click.
 *      @param {boolean} [options.scrollX=true] - Specifies whether to show horizontal scrollbar.
 *      @param {boolean} [options.scrollY=true] - Specifies whether to show vertical scrollbar.
 *      @param {string} [options.keyColumnName=null] - The name of the column to be used to identify each rows. If not specified, unique value for each rows will be created internally.
 *      @param {Object} [options.toolbar] - The object for configuring toolbar UI.
 *          @param {boolean} [options.toolbar.hasResizeHandler=true] - Specifies whether to use the resize hendler.
 *          @param {boolean} [options.toolbar.hasControlPanel=true] - Specifies whether to use the control panel.
 *          @param {boolean} [options.toolbar.hasPagination=true] - Specifies whether to use the pagination.
 *      @param {array} options.columnModelList - The configuration of the grid columns.
 *          @param {string} options.columnModelList.columnName - The name of the column.
 *          @param {boolean} [options.columnModelList.isEllipsis=false] - If set to true, ellipsis will be used for overflowing content.
 *          @param {string} [options.columnModelList.align=left] - Horizontal alignment of the column content. Available values are 'left', 'center', 'right'.
 *          @param {string} [options.columnModelList.className] - The name of the class to be used for all cells of the column.
 *          @param {string} [options.columnModelList.title] - The title of the column to be shown on the header.
 *          @param {number} [options.columnModelList.width] - The width of the column. The unit is pixel.
 *          @param {boolean} [options.columnModelList.isHidden] - If set to true, the column will not be shown.
 *          @param {boolean} [options.columnModelList.isFixedWidth=false] - If set to true, the width of the column will not be changed.
 *          @param {string} [options.columnModelList.defaultValue] - The default value to be shown when the column doesn't have a value.
 *          @param {function} [options.columnModelList.formatter] - The function that formats the value of the cell. The retrurn value of the function will be shown as the value of the cell.
 *          @param {boolean} [options.columnModelList.notUseHtmlEntity=false] - If set to true, the value of the cell will not be encoded as HTML entities.
 *          @param {boolean} [options.columnModelList.isIgnore=false] - If set to true, the value of the column will be ignored when setting up the list of modified rows.
 *          @param {boolean} [options.columnModelList.isSortable=false] - If set to true, sort button will be shown on the right side of the column header, which executes the sort action when clicked.
 *          @param {Array} [options.columnModelList.editOption] - The object for configuring editing UI.
 *              @param {string} [options.columnModelList.editOption.type='normal'] - The string value that specifies the type of the editing UI. Available values are 'text', 'text-password', 'text-convertible', 'select', 'radio', 'checkbox'.
 *              @param {Array} [options.columnModelList.editOption.list] - Specifies the option list for the 'select', 'radio', 'checkbox' type. The item of the array must contain properties named 'text' and 'value'. (e.g. [{text: 'option1', value: 1}, {...}])
 *              @param {function} [options.columnModelList.editOption.changeBeforeCallback] - The function that will be called before changing the value of the cell. If returns false, the changing will be canceled.
 *              @param {function} [options.columnModelList.editOption.changeAfterCallback] - The function that will be called after changing the value of the cell.
 *              @param {string} [options.columnModelList.editOption.beforeText] <em>Deprecated</em>. (replaced with {@link beforeContent})
 *              @param {(string|function)} [options.columnModelList.editOption.beforeContent] - The HTML string to be shown left to the value. If it's a function, the return value will be used.
 *              @param {string} [options.columnModelList.editOption.afterText] <em>Deprecated</em>. (replaced with {@link afterContent})
 *              @param {(string|function)} [options.columnModelList.editOption.afterContent] - The HTML string to be shown right to the value. If it's a function, the return value will be used.
 *              @param {function} [options.columnModelList.editOption.converter] - The function whose return value (HTML) represents the UI of the cell. If the return value is falsy(null|undefined|false), default UI will be shown. This option is available for the 'text', 'text-password', 'select', 'checkbox', 'radio' type.
 *              @param {Object} [options.columnModelList.editOption.inputEvents] - The object that has an event name as a key and event handler as a value for events on input element.
 *          @param {Array} [options.columnModelList.relationList] - Specifies relation between this and other column.
 *              @param {array} [options.columnModelList.relationList.columnList] - Array of the names of target columns.
 *              @param {function} [options.columnModelList.relationList.isDisabled] - If returns true, target columns will be disabled.
 *              @param {function} [options.columnModelList.relationList.isEditable] - If returns true, target columns will be editable.
 *              @param {function} [options.columnModelList.relationList.optionListChange] - The function whose return value specifies the option list for the 'select', 'radio', 'checkbox' type. The options list of target columns will be replaced with the return value of this function.
 *      @param {array} options.columnMerge - The array that specifies the merged column. This options does not merge the cells of multiple columns into a single cell. This options only effects to the headers of the multiple columns, creates a new parent header that includes the headers of spcified columns, and sets up the hierarchy.
 * @constructor ne.Grid
 * @example
     <div id='grid'></div>
     <script>
 var grid = new ne.Grid({
    el: $('#grid'),
    columnFixIndex: 2,  //(default=0)
    selectType: 'checkbox', //(default='')
    autoNumbering: true, //(default=true)
    headerHeight: 100, //(default=35)
    rowHeight: 27, // (default=27)
    displayRowCount: 10, //(default=10)
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
            isFixedWidth: true,
            editOption: {
                type: 'text-password',
                beforeContent: 'password:'
            }
        },
        {
            title: 'text input when editing mode',
            columnName: 'column6',
            editOption: {
                type: 'text-convertible'
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
var Core = require('./core');

 /**
  * ne
  * @namespace
  */
ne = window.ne = ne || {};

ne.Grid = View.extend(/**@lends ne.Grid.prototype */{
    /**
     * Initializes the instance.
     * @param {Object} options - Options for the constructor
     */
    initialize: function(options) {
        //grid 에서 public instance 를 참조할 수 있도록 자신의 참조 추가
        options.publicInstance = this;
        this.core = new Core(options);
        this.listenTo(this.core, 'all', this._relayEvent, this);
    },
    /**
     * Relay the internal events to the external.
     * @private
     */
    _relayEvent: function() {
        this.trigger.apply(this, arguments);
    },
    /**
     * Disables the row identified by the rowkey.
     * @param {(number|string)} rowKey - The unique key of the target row
     */
    disableRow: function(rowKey) {
        this.core.disableRow(rowKey);
    },
    /**
     * Enables the row identified by the rowKey.
     * @param {(number|string)} rowKey - The unique key of the target row
     */
    enableRow: function(rowKey) {
        this.core.enableRow(rowKey);
    },
    /**
     * Returns the value of the cell identified by the rowKey and columnName.
     * @param {(number|string)} rowKey - The unique key of the target row.
     * @param {string} columnName - The name of the column
     * @param {boolean} [isOriginal] - It set to true, the original value will be return.
     * @return {(number|string)} - The value of the cell
     */
    getValue: function(rowKey, columnName, isOriginal) {
        return this.core.getValue(rowKey, columnName, isOriginal);
    },
    /**
     * Returns a list of all values in the specified column.
     * @param {string} columnName - The name of the column
     * @param {boolean} [isJsonString=false] - It set to true, return value will be converted to JSON string.
     * @return {(Array|string)} - A List of all values in the specified column. (or JSON string of the list)
     */
    getColumnValues: function(columnName, isJsonString) {
        return this.core.getColumnValues(columnName, isJsonString);
    },
    /**
     * Returns the object that contains all values in the specified row.
     * @param {(number|string)} rowKey - The unique key of the target row
     * @param {boolean} [isJsonString=false] - If set to true, return value will be converted to JSON string.
     * @return {(Object|string)} - The object that contains all values in the row. (or JSON string of the object)
     */
    getRow: function(rowKey, isJsonString) {
        return this.core.getRow(rowKey, isJsonString);
    },
    /**
     * Returns the object that contains all values in the row at specified index.
     * @param {number} index - The index of the row
     * @param {Boolean} [isJsonString=false] - If set to true, return value will be converted to JSON string.
     * @return {Object|string} - The object that contains all values in the row. (or JSON string of the object)
     */
    getRowAt: function(index, isJsonString) {
        return this.core.getRowAt(index, isJsonString);
    },
    /**
     * Returns the total number of the rows.
     * @return {number} - The total number of the rows
     */
    getRowCount: function() {
        return this.core.getRowCount();
    },
    /**
     * Returns the rowKey of the currently selected row.
     * @return {(number|string)} - The rowKey of the row
     */
    getSelectedRowKey: function() {
        return this.core.focusModel.which().rowKey;
    },
    /**
     * Returns the jquery object of the cell identified by the rowKey and columnName.
     * @param {(number|string)} rowKey - The unique key of the row
     * @param {string} columnName - The name of the column
     * @return {jQuery} - The jquery object of the cell element
     */
    getElement: function(rowKey, columnName) {
        return this.core.getElement(rowKey, columnName);
    },
    /**
     * Sets the value of the cell identified by the specified rowKey and columnName.
     * @param {(number|string)} rowKey - The unique key of the row
     * @param {string} columnName - The name of the column
     * @param {(number|string)} columnValue - The value to be set
     */
    setValue: function(rowKey, columnName, columnValue) {
        this.core.setValue(rowKey, columnName, columnValue);
    },
    /**
     * Sets the all values in the specified column.
     * @param {string} columnName - The name of the column
     * @param {(number|string)} columnValue - The value to be set
     * @param {Boolean} [isCheckCellState=true] - If set to true, only editable and not disabled cells will be affected.
     */
    setColumnValues: function(columnName, columnValue, isCheckCellState) {
        this.core.setColumnValues(columnName, columnValue, isCheckCellState);
    },
    /**
     * Replace all rows with the specified list. This will not change the original data.
     * @param {Array} rowList - A list of new rows
     */
    replaceRowList: function(rowList) {
        this.core.replaceRowList(rowList);
    },
    /**
     * Replace all rows with the specified list. This will change the original data.
     * @param {Array} rowList - A list of new rows
     * @param {function} callback - The function that will be called when done.
     */
    setRowList: function(rowList, callback) {
        this.core.setRowList(rowList, true, callback);
    },
    /**
     * Sets focus on the cell identified by the specified rowKey and columnName.
     * @param {(number|string)} rowKey - The unique key of the row
     * @param {string} columnName - The name of the column
     * @param {boolean} [isScrollable=false] - If set to true, the view will scroll to the cell element.
     */
    focus: function(rowKey, columnName, isScrollable) {
        this.core.focusClipboard();
        this.core.focus(rowKey, columnName, isScrollable);
    },
    /**
     * Sets focus on the cell at the specified index of row and column.
     * @param {(number|string)} rowIndex - The index of the row
     * @param {string} columnIndex - The index of the column
     * @param {boolean} [isScrollable=false] - If set to true, the view will scroll to the cell element.
     */
    focusAt: function(rowIndex, columnIndex, isScrollable) {
        this.core.focusAt(rowIndex, columnIndex, isScrollable);
    },
    /**
     * Sets focus on the cell at the specified index of row and column and starts to edit.
     * @param {(number|string)} rowKey - The unique key of the row
     * @param {string} columnName - The name of the column
     * @param {boolean} [isScrollable=false] - If set to true, the view will scroll to the cell element.
     */
    focusIn: function(rowKey, columnName, isScrollable) {
        this.core.focusIn(rowKey, columnName, isScrollable);
    },
    /**
     * Sets focus on the cell at the specified index of row and column and starts to edit.
     * @param {(number|string)} rowIndex - The index of the row
     * @param {string} columnIndex - The index of the column
     * @param {boolean} [isScrollable=false] - If set to true, the view will scroll to the cell element.     */
    focusInAt: function(rowIndex, columnIndex, isScrollable) {
        this.core.focusInAt(rowIndex, columnIndex, isScrollable);
    },
    /**
     * Makes view ready to get keyboard input.
     */
    readyForKeyControl: function() {
        this.core.readyForKeyControl();
    },
    /**
     * Removes focus from the focused cell.
     */
    blur: function() {
        this.core.blur();
    },
    /**
     * Checks all rows.
     */
    checkAll: function() {
        this.core.checkAll();
    },
    /**
     * Checks the row identified by the specified rowKey.
     * @param {(number|string)} rowKey - The unique key of the row
     */
    check: function(rowKey) {
        this.core.check(rowKey);
    },
    /**
     * Unchecks all rows.
     */
    uncheckAll: function() {
        this.core.uncheckAll();
    },
    /**
     * Unchecks the row identified by the specified rowKey.
     * @param {(number|string)} rowKey - The unique key of the row
     */
    uncheck: function(rowKey) {
        this.core.uncheck(rowKey);
    },
    /**
     * Removes all rows.
     */
    clear: function() {
        this.core.clear();
    },
    /**
     * Removes the row identified by the specified rowKey.
     * @param {(number|string)} rowKey - The unique key of the row
     * @param {(boolean|object)} [options] - Options. If the type is boolean, this value is equivalent to  options.removeOriginalData.
     * @param {boolean} [options.removeOriginalData] - If set to true, the original data will be removed.
     * @param {boolean} [options.keepRowSpanData] - If set to true, the value of the merged cells will not be removed although the target is first cell of them.
     */
    removeRow: function(rowKey, options) {
        if (ne.util.isBoolean(options) && options) {
            options = {
                removeOriginalData: true
            };
        }
        this.core.removeRow(rowKey, options);
    },
    /**
     * Removes all checked rows.
     * @param {boolean} isConfirm - If set to true, confirm message will be shown before remove.
     * @return {boolean} - True if there's at least one row removed.
     */
    removeCheckedRows: function(isConfirm) {
        return this.core.removeCheckedRows(isConfirm);
    },
    /**
     * Enables the row identified by the rowKey to be able to check.
     * @param {(number|string)} rowKey - The unique key of the row
     */
    enableCheck: function(rowKey) {
        this.core.enableCheck(rowKey);
    },
    /**
      * Disables the row identified by the spcified rowKey to not be abled to check.
     * @param {(number|string)} rowKey - The unique keyof the row.
     */
    disableCheck: function(rowKey) {
        this.core.disableCheck(rowKey);
    },
    /**
     * Returns a list of the rowKey of checked rows.
     * @param {Boolean} [isJsonString=false] - If set to true, return value will be converted to JSON string.
     * @return {Array|string} - A list of the rowKey. (or JSON string of the list)
     */
    getCheckedRowKeyList: function(isJsonString) {
        var checkedRowKeyList = this.core.getCheckedRowKeyList();
        return isJsonString ? $.toJSON(checkedRowKeyList) : checkedRowKeyList;
    },
    /**
     * Returns a list of the checked rows.
     * @param {Boolean} [isJsonString=false] - If set to true, return value will be converted to JSON string.
     * @return {Array|string} - A list of the checked rows. (or JSON string of the list)
     */
    getCheckedRowList: function(isJsonString) {
        var checkedRowList = this.core.getCheckedRowList();
        return isJsonString ? $.toJSON(checkedRowList) : checkedRowList;
    },
    /**
     * Returns a list of the column model.
     * @return {Array} - A list of the column model.
     */
    getColumnModelList: function() {
        return this.core.getColumnModelList();
    },
    /**
     * Returns the object that contains the lists of changed data compared to the original data.
     * The object has properties 'createList', 'updateList', 'deleteList'.
     * @param {Object} [options] Options
     *      @param {boolean} [options.isOnlyChecked=false] - If set to true, only checked rows will be considered.
     *      @param {boolean} [options.isRaw=false] - If set to true, the data will contains the row data for internal use.
     *      @param {boolean} [options.isOnlyRowKeyList=false] - If set to true, only keys of the changed rows will be returned.
     *      @param {Array} [options.filteringColumnList] - A list of column name to be excluded.
     * @return {{createList: Array, updateList: Array, deleteList: Array}} - Object that contains the result list.
     */
    getModifiedRowList: function(options) {
        return this.core.getModifiedRowList(options);
    },
    /**
     * Insert the new row with specified data to the end of table.
     * @param {object} [row] - The data for the new row
     * @param {object} [options] - Options
     * @param {number} [options.at] - The index at which new row will be inserted
     * @param {boolean} [options.extendPrevRowSpan] - If set to true and the previous row at target index has a rowspan data, the new row will extend the existing rowspan data.
     */
    appendRow: function(row, options) {
        this.core.appendRow(row, options);
    },
    /**
     * Insert the new row with specified data to the beginning of table.
     * @param {object} [row] - The data for the new row
     */
    prependRow: function(row) {
        this.core.prependRow(row);
    },
    /**
     * Returns true if there are at least one row changed.
     * @return {boolean} - True if there are at least one row changed.
     */
    isChanged: function() {
        return this.core.isChanged();
    },
    /**
     * Returns the instance of specified AddOn.
     * @param {string} name - The name of the AddOn
     * @return {instance} addOn - The instance of the AddOn
     */
    getAddOn: function(name) {
        return name ? this.core.addOn[name] : this.core.addOn;
    },
    /**
     * Restores the data to the original data.
     * (Original data is set by {@link ne.Grid#setRowList|setRowList}
     */
    restore: function() {
        this.core.restore();
    },
    /**
     * Selects the row identified by the rowKey.
     * @param {(number|string)} rowKey - The unique key of the row
     */
    select: function(rowKey) {
        this.core.select(rowKey);
    },
    /**
     * Unselects selected rows.
     */
    unselect: function() {
        this.core.unselect();
    },
    /**
     * Sets the index of fixed column.
     * @param {number} index - The index of column to be fixed
     */
    setColumnFixIndex: function(index) {
        this.core.setColumnFixIndex(index);
    },
    /**
     * Sets the list of column model.
     * @param {Array} columnModelList - A new list of column model
     */
    setColumnModelList: function(columnModelList) {
        this.core.setColumnModelList(columnModelList);
    },
    /**
     * Create an specified AddOn and use it on this instance.
     * @param {string} name - The name of the AddOn to use.
     * @param {object} options - The option objects for configuring the AddON.
     * @return {ne.Grid} - This instance.
     */
    use: function(name, options) {
        this.core.use(name, options);
        return this;
    },
    /**
     * Returns a list of all rows.
     * @return {Array} - A list of all rows
     */
    getRowList: function() {
        return this.core.getRowList();
    },
    /**
     * Sorts all rows by the specified column.
     * @param {string} columnName - The name of the column to be used to compare the rows
     */
    sort: function(columnName) {
        this.core.sort(columnName);
    },
    /**
     * Unsorts all rows. (Sorts by rowKey).
     */
    unSort: function() {
        this.core.sort('rowKey');
    },
    /**
     * Adds the specified css class to cell element identified by the rowKey and className
     * @param {(number|string)} rowKey - The unique key of the row
     * @param {string} columnName - The name of the column
     * @param {string} className - The css class name to add
     */
    addCellClassName: function(rowKey, columnName, className) {
        this.core.addCellClassName(rowKey, columnName, className);
    },
    /**
     * Adds the specified css class to all cell elements in the row identified by the rowKey
     * @param {(number|string)} rowKey - The unique key of the row
     * @param {string} className - The css class name to add
     */
    addRowClassName: function(rowKey, className) {
        this.core.addRowClassName(rowKey, className);
    },
    /**
     * Removes the specified css class from the cell element indentified by the rowKey and columnName.
     * @param {(number|string)} rowKey - The unique key of the row
     * @param {string} columnName - The name of the column
     * @param {string} className - The css class name to be removed
     */
    removeCellClassName: function(rowKey, columnName, className) {
        this.core.removeCellClassName(rowKey, columnName, className);
    },
    /**
     * Removes the specified css class from all cell elements in the row identified by the rowKey.
     * @param {(number|string)} rowKey - The unique key of the row
     * @param {string} className - The css class name to be removed
     */
    removeRowClassName: function(rowKey, className) {
        this.core.removeRowClassName(rowKey, className);
    },
    /**
     * Returns the rowspan data of the cell identified by the rowKey and columnName.
     * @param {(number|string)} rowKey - The unique key of the row
     * @param {string} columnName - The name of the column
     */
    getRowSpanData: function(rowKey, columnName) {
        this.core.getRowSpanData(rowKey, columnName);
    },
    /**
     * Returns the index of the row indentified by the rowKey.
     * @param {number|string} rowKey - The unique key of the row
     * @return {number} - The index of the row
     */
    getIndexOfRow: function(rowKey) {
        return this.core.getIndexOfRow(rowKey);
    },
    /**
     * Sets the number of rows to be shown in the table area.
     * @param {number} count - The number of rows
     */
    setDisplayRowCount: function(count) {
        this.core.setDisplayRowCount(count);
    },
     /**
      * Sets the width and height of the dimension.
      * @param  {(number|null)} width - The width of the dimension
      * @param  {(number|null)} height - The height of the dimension
      */
    setSize: function(width, height) {
        this.core.setSize(width, height);
    },
    /**
     * Refresh the layout view. Use this method when the view was rendered while hidden.
     */
    refreshLayout: function() {
        this.core.updateLayoutData();
    },
    /**
     * Destroys the instance.
     */
    destroy: function() {
        this.core.destroy();
        this.core = null;
    }
});

ne.Grid.getInstanceById = function(id) {
    return Core.prototype.__instance[id];
};

},{"./base/view":7,"./core":8}],13:[function(require,module,exports){
/**
 * @fileoverview 크기에 관련된 데이터를 다루는 모델
 * @author NHN Ent. FE Development Team
 */
'use strict';

var Model = require('../base/model');
var util = require('../util');

// The width of the border of the dimension.
var BORDER_WIDTH = 1;

// The width of the border of table row.
var ROW_BORDER_WIDTH = 1;

/**
 * 크기 관련 데이터 저장
 * @module model/dimension
 */
var Dimension = Model.extend(/**@lends module:model/dimension.prototype */{
    /**
     * @extends module:base/model
     * @constructs
     */
    initialize: function() {
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
        this.columnModel = this.grid.columnModel;

        this.listenTo(this.columnModel, 'columnModelChange', this._initColumnWidthVariables);
        this.listenTo(this.grid.dataModel, 'add remove reset', this._resetTotalRowHeight);

        this.on('change:width', this._onWidthChange, this);
        this.on('change:displayRowCount', this._setBodyHeight, this);

        this._initColumnWidthVariables();
        this._setBodyHeight();
    },

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
        totalRowHeight: 0,

        rsideWidth: 0,
        lsideWidth: 0,
        columnWidthList: [],

        minimumColumnWidth: 0,
        displayRowCount: 1,
        scrollBarSize: 17,
        scrollX: true,
        scrollY: true
    },

    /**
     * 전체 넓이에서 스크롤바, border등의 넓이를 제외하고 실제 셀의 넓이에 사용되는 값만 반환한다.
     * @param {number} columnLength - 컬럼의 개수
     * @return {number} 사용가능한 전체 셀의 넓이
     * @private
     */
    _getAvailableTotalWidth: function(columnLength) {
        var totalWidth = this.get('width'),
            availableTotalWidth = totalWidth - columnLength - 1;

        if (this.get('scrollY')) {
            availableTotalWidth -= this.get('scrollBarSize');
        }
        if (this.columnModel.get('columnFixIndex') > 0) {
            availableTotalWidth -= ROW_BORDER_WIDTH;
        }
        return availableTotalWidth;
    },

    /**
     * Makes all width of columns not less than minimumColumnWidth.
     * @param {number[]} columnWidthList - 컬럼 넓이값 배열
     * @return {number[]} - 수정된 새로운 넓이값 배열
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
     * Reset 'totalRowHeight' property.
     */
    _resetTotalRowHeight: function() {
        var rowHeight = this.get('rowHeight'),
            rowCount = this.grid.dataModel.length,
            totalBorderWidth = rowCount + 1;

        this.set('totalRowHeight', (rowHeight * rowCount) + totalBorderWidth);
    },

    /**
     * Sets the width of columns whose width is not assigned by distributing extra width to them equally.
     * @param {number[]} columnWidthList - An array of column widths
     * @return {number[]} - A new array of column widths
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
     * @return {number[]} - A new array of column widths
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
     * @return {number[]} - A new array of column widths
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
     * @return {number[]} - A new array of column widths
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
     * @return {number[]} - A new array of column widths
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
     * @param {boolean} fitToReducedTotal - If set to true and the total width is smaller than dimension(width),
     *                                    the column widths will be reduced.
     * @return {number[]} - A new array of column widths
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
        var columnModelList = this.columnModel.get('visibleList'),
            commonMinWidth = this.get('minimumColumnWidth'),
            widthList = [],
            fixedFlags = [],
            minWidthList = [],
            calculate;

        _.each(columnModelList, function(columnModel) {
            var width = columnModel.width > 0 ? columnModel.width : 0,
                minWidth = Math.max(width, commonMinWidth);
            // If the width is not assigned (not positive number), set it to zero (not applying minimum width)
            // so that #_fillEmptyColumnWidth() can detect which one is empty.
            // After then, minimum width will be applied by #_applyMinimumColumnWidth().
            widthList.push(width ? minWidth : 0);
            minWidthList.push(minWidth);
            fixedFlags.push(!!columnModel.isFixedWidth);
        });

        this._columnWidthFixedFlags = fixedFlags;
        this._minColumnWidthList = minWidthList;

        // note that the calling order of functions is bottom-to-top.
        calculate = _.compose(
            this._adjustColumnWidthList,
            this._applyMinimumColumnWidth,
            this._fillEmptyColumnWidth
        );
        this._setColumnWidthVariables(calculate.call(this, widthList), true);
    },

    /**
     * L, R 중 하나를 입력받아 frame 의 너비를 구한다.
     * @param {String} [whichSide]  지정하지 않을 경우 전체 너비.
     * @return {Number} 해당 frame 의 너비
     */
    getFrameWidth: function(whichSide) {
        var columnFixIndex = this.grid.columnModel.get('columnFixIndex'),
            columnWidthList = this.getColumnWidthList(whichSide),
            frameWidth = this._getFrameWidth(columnWidthList);
        if (ne.util.isUndefined(whichSide) && columnFixIndex > 0) {
            //columnFixIndex 가 0보다 클 경우, 열고정 되어있기 때문에, 경계영역에 대한 1px도 함께 더한다.
            frameWidth += 1;
        }
        return frameWidth;
    },

    /**
     * widthList 로부터 보더 값을 포함하여 계산한 frameWidth 를 구한다.
     * @param {Array} widthList 너비 리스트 배열
     * @return {Number} 계산된 frame 너비값
     * @private
     */
    _getFrameWidth: function(widthList) {
        var frameWidth = 0;
        if (widthList.length) {
            frameWidth = util.sum(widthList) + ((widthList.length + 1) * ROW_BORDER_WIDTH);
        }
        return frameWidth;
    },

    /**
     * columnWidthList 로 부터, lside 와 rside 의 전체 너비를 계산하여 저장한다.
     * @param {array} columnWidthList - 컬럼 넓이값 배열
     * @param {boolean} isSaveWidthList - 저장 여부. true이면 넓이값 배열을 originalWidthList로 저장한다.
     * @private
     */
    _setColumnWidthVariables: function(columnWidthList, isSaveWidthList) {
        var totalWidth = this.get('width'),
            columnFixIndex = this.columnModel.get('columnFixIndex'),
            maxLeftSideWidth = this._getMaxLeftSideWidth(),
            rsideWidth, lsideWidth, lsideWidthList, rsideWidthList;

        lsideWidthList = columnWidthList.slice(0, columnFixIndex);
        rsideWidthList = columnWidthList.slice(columnFixIndex);

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
     * @return {number} 열고정 영역의 최소 너비값.
     * @private
     */
    _getMinLeftSideWidth: function() {
        var minimumColumnWidth = this.get('minimumColumnWidth'),
            columnFixIndex = this.columnModel.get('columnFixIndex'),
            minWidth = 0,
            borderWidth;

        if (columnFixIndex) {
            borderWidth = (columnFixIndex + 1) * ROW_BORDER_WIDTH;
            minWidth = borderWidth + (minimumColumnWidth * columnFixIndex);
        }
        return minWidth;
    },

    /**
     * 열 고정 영역의 maximum width 값을 구한다.
     * @return {number} 열고정 영역의 최대 너비값.
     * @private
     */
    _getMaxLeftSideWidth: function() {
        var maxWidth = Math.ceil(this.get('width') * 0.9);

        if (maxWidth) {
            maxWidth = Math.max(maxWidth, this._getMinLeftSideWidth());
        }
        return maxWidth;
    },

    /**
     * 계산한 cell 의 위치를 리턴한다.
     * @param {Number|String} rowKey - 데이터의 키값
     * @param {String} columnName - 칼럼명
     * @return {{top: number, left: number, right: number, bottom: number}} - cell의 위치
     */
    getCellPosition: function(rowKey, columnName) {
        var top, left = 0, right, bottom, i = 0,
            dataModel = this.grid.dataModel,
            rowHeight = this.get('rowHeight'),
            rowSpanData = dataModel.get(rowKey).getRowSpanData(columnName),
            rowIdx, spanCount,
            columnWidthList = this.get('columnWidthList'),
            columnFixIndex = this.grid.columnModel.get('columnFixIndex'),
            columnIdx = this.grid.columnModel.indexOfColumnName(columnName, true),
            borderWidth = 1;


        if (!rowSpanData.isMainRow) {
            rowKey = rowSpanData.mainRowKey;
            rowSpanData = dataModel.get(rowKey).getRowSpanData(columnName);
        }

        spanCount = rowSpanData.count || 1;

        rowIdx = dataModel.indexOfRowKey(rowKey);

        top = util.getHeight(rowIdx, rowHeight);
        bottom = top + util.getHeight(spanCount, rowHeight) - borderWidth;

        if (columnFixIndex <= columnIdx) {
            i = columnFixIndex;
        }

        for (; i < columnIdx; i += 1) {
            left += columnWidthList[i] + borderWidth;
        }
        right = left + columnWidthList[i] + borderWidth;

        return {
            top: top,
            left: left,
            right: right,
            bottom: bottom
        };
    },

    /**
     * columnFixIndex 가 적용되었을 때, window resize 시 left side 의 너비를 조정한다.
     * @param {Array} lsideWidthList    열고정 영역의 너비 리스트 배열
     * @param {Number} totalWidth   grid 전체 너비
     * @return {Array} 열고정 영역의 너비 리스트
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
     * 그리드의 body height 를 계산하여 할당한다.
     * @private
     */
    _setBodyHeight: function() {
        var height = util.getHeight(this.get('displayRowCount'), this.get('rowHeight'));
        if (this.get('scrollX')) {
            height += this.get('scrollBarSize');
        }
        this.set('bodyHeight', height);
    },

    /**
     * 현재 화면에 보이는 row 개수를 반환
     * @return {number} 화면에 보이는 행 개수
     */
    getDisplayRowCount: function() {
        return util.getDisplayRowCount(this.get('bodyHeight') - this.getScrollXHeight(), this.get('rowHeight'));
    },

    /**
     * 수평 스크롤바의 높이를 구한다. 수평 스크롤바를 사용하지 않을 경우 0을 반환한다.
     * @return {number} 수평 스크롤바의 높이
     */
    getScrollXHeight: function() {
        return +this.get('scrollX') * this.get('scrollBarSize');
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
     * @return {number} The height of the table body
     * @private
     */
    _getBodyHeight: function(height) {
        return height - this.get('headerHeight') - this.get('toolbarHeight') - BORDER_WIDTH;
    },

    /**
     * Returns the minimum height of table body.
     * @return {number} The minimum height of table body
     * @private
     */
    _getMinBodyHeight: function() {
        return this.get('rowHeight') + (ROW_BORDER_WIDTH * 2) + this.getScrollXHeight();
    },

    /**
     * Sets the height of the dimension.
     * (Resets the bodyHeight and displayRowCount relative to the dimension height)
     * @param  {number} height - The height of the dimension
     */
    setHeight: function(height) {
        this.set('bodyHeight', Math.max(this._getBodyHeight(height), this._getMinBodyHeight()));
        this.set('displayRowCount', this.getDisplayRowCount(), {silent: true});
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
     * @return {Array}  조회한 영역의 columnWidthList
     */
    getColumnWidthList: function(whichSide) {
        var columnFixIndex = this.columnModel.get('columnFixIndex'),
            columnWidthList = [];

        whichSide = (whichSide) ? whichSide.toUpperCase() : undefined;
        switch (whichSide) {
            case 'L':
                columnWidthList = this.get('columnWidthList').slice(0, columnFixIndex);
                break;
            case 'R':
                columnWidthList = this.get('columnWidthList').slice(columnFixIndex);
                break;
            default :
                columnWidthList = this.get('columnWidthList');
                break;
        }
        return columnWidthList;
    }
});

module.exports = Dimension;

},{"../base/model":5,"../util":19}],14:[function(require,module,exports){
/**
 * @fileoverview Focus 관련 데이터 처리름 담당한다.
 * @author NHN Ent. FE Development Team
 */
'use strict';

var Model = require('../base/model');
var util = require('../util');

/**
 * Focus model
 * RowList collection 이 focus class 를 listen 한다.
 * @module model/focus
 */
var Focus = Model.extend(/**@lends module:model/focus.prototype */{
    /**
     * @extends module:base/model
     * @constructs
     */
    initialize: function() {
        Model.prototype.initialize.apply(this, arguments);
    },

    defaults: {
        rowKey: null,
        columnName: '',
        prevRowKey: null,
        prevColumnName: '',
        scrollX: true,
        scrollY: true,
        scrollBarSize: 17
    },

    /**
     * 이전 focus 정보를 저장한다.
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
     * 이전 focus 정보를 제거한다.
     * @private
     */
    _clearPrevious: function() {
        this.set({
            prevRowKey: null,
            prevColumnName: ''
        });
    },

    /**
     * 행을 select 한다.
     * @param {Number|String} rowKey - select 할 행의 키값
     * @returns {Model.Focus} This object
     */
    select: function(rowKey) {
        this.unselect().set('rowKey', rowKey);
        this.trigger('select', rowKey);
        return this;
    },

    /**
     * 행을 unselect 한다.
     * @param {boolean} blur - The boolean value whether to invoke blur
     * @return {Model.Focus} This object
     */
    unselect: function(blur) {
        if (blur) {
            this.blur();
        }
        this.trigger('unselect', this.get('rowKey'));
        this.set({
            'rowKey': null
        });
        return this;
    },

    /**
     * focus 처리한다.
     * @param {Number|String} rowKey focus 처리할 셀의 rowKey 값
     * @param {String} columnName focus 처리할 셀의 컬럼명
     * @param {Boolean} isScrollable focus 처리한 영역으로 scroll 위치를 이동할지 여부
     * @return {Model.Focus} This object
     */
    focus: function(rowKey, columnName, isScrollable) {
        var scrollPosition,
            curRowKey = this.get('rowKey');

        if (util.isBlank(rowKey) || util.isBlank(columnName)) {
            return this;
        }
        this._savePrevious();
        this.blur();

        if (rowKey !== curRowKey) {
            this.select(rowKey);
        }
        this.set('columnName', columnName);
        this.trigger('focus', rowKey, columnName);

        if (isScrollable) {
            //TODO: scrolltop 및 left 값 조정하는 로직 필요.
            scrollPosition = this._getScrollPosition();
            if (!ne.util.isEmpty(scrollPosition)) {
                this.grid.renderModel.set(scrollPosition);
            }
        }
        return this;
    },

    /**
     * focus 이동에 맞추어 scroll 위치를 조정한 값을 반환한다.
     * @return {{scrollTop: number, scrollLeft: number}} 위치 조정한 값
     * @private
     */
    _getScrollPosition: function() {
        var focused = this.which(),
            dimensionModel = this.grid.dimensionModel,
            renderModel = this.grid.renderModel,
            scrollTop = renderModel.get('scrollTop'),
            scrollLeft = renderModel.get('scrollLeft'),
            bodyHeight = dimensionModel.get('bodyHeight'),
            rsideWidth = dimensionModel.get('rsideWidth'),
            position = dimensionModel.getCellPosition(focused.rowKey, focused.columnName),
            currentLeft = scrollLeft,
            currentRight = scrollLeft + rsideWidth,
            scrollXSize = +this.get('scrollX') * this.get('scrollBarSize'),
            scrollYSize = +this.get('scrollY') * this.get('scrollBarSize'),
            scrollPosition = {};


        //수직 스크롤 조정
        if (position.top < scrollTop) {
            scrollPosition.scrollTop = position.top;
        } else if (position.bottom > bodyHeight + scrollTop - scrollXSize) {
            scrollPosition.scrollTop = position.bottom - bodyHeight + scrollXSize;
        }

        //수평 스크롤 조정
        if (!this.grid.columnModel.isLside(focused.columnName)) {
            if (position.left < currentLeft) {
                scrollPosition.scrollLeft = position.left;
            } else if (position.right > currentRight) {
                scrollPosition.scrollLeft = position.right - rsideWidth + scrollYSize + 1;
            }
        }
        return scrollPosition;
    },

    /**
     * 디자인 blur 처리한다.
     * @return {Model.Focus} This object
     */
    blur: function() {
        if (this.has()) {
            this.trigger('blur', this.get('rowKey'), this.get('columnName'));
            if (this.get('rowKey') !== null) {
                this.set('columnName', '');
            }
        }
        return this;
    },

    /**
     * 현재 focus 정보를 반환한다.
     * @return {{rowKey: (number|string), columnName: string}} 현재 focus 정보에 해당하는 rowKey, columnName
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
     * @return {{rowIdx: number, columnIdx: number}} The object that contains index info
     */
    indexOf: function(isPrevious) {
        var rowKey = isPrevious ? this.get('prevRowKey') : this.get('rowKey'),
            columnName = isPrevious ? this.get('prevColumnName') : this.get('columnName');

        return {
            rowIdx: this.grid.dataModel.indexOfRowKey(rowKey),
            columnIdx: this.grid.columnModel.indexOfColumnName(columnName, true)
        };
    },

    /**
     * 현재 focus를 가지고 있는지 여부를 리턴한다.
     * @return {boolean} 현재 focus 가 설정되어 있는지 여부
     */
    has: function() {
        var has = !util.isBlank(this.get('rowKey')) && !util.isBlank(this.get('columnName'));
        return has;
    },

    /**
     * 현재 focus 된 row 기준으로 offset 만큼 이동한 rowKey 를 반환한다.
     * @param {Number} offset   이동할 offset
     * @return {Number|String} rowKey   offset 만큼 이동한 위치의 rowKey
     * @private
     */
    _findRowKey: function(offset) {
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
     * @param {Number} offset   이동할 offset
     * @return {String} columnName  offset 만큼 이동한 위치의 columnName
     * @private
     */
    _findColumnName: function(offset) {
        var index,
            columnModel = this.grid.columnModel,
            columnModelList = columnModel.getVisibleColumnModelList(),
            columnIndex = columnModel.indexOfColumnName(this.get('columnName'), true);
        if (this.has()) {
            index = Math.max(Math.min(columnIndex + offset, columnModelList.length - 1), 0);
            return columnModelList[index] && columnModelList[index]['columnName'];
        }
    },

    /**
     * rowSpanData 를 반환한다.
     * @param {Number|String} rowKey    조회할 데이터의 키값
     * @param {String} columnName   컬럼명
     * @return {*|{count: number, isMainRow: boolean, mainRowKey: *}|*} rowSpanData 정보
     * @private
     */
    _getRowSpanData: function(rowKey, columnName) {
        return this.grid.dataModel.get(rowKey).getRowSpanData(columnName);
    },

    /**
     * offset 만큼 뒤로 이동한 row 의 index 를 반환한다.
     * @param {number} offset   이동할 offset
     * @return {Number} 이동한 위치의 row index
     */
    nextRowIndex: function(offset) {
        var rowKey = this.nextRowKey(offset);
        return this.grid.dataModel.indexOfRowKey(rowKey);
    },

    /**
     * offset 만큼 앞으로 이동한 row의 index를 반환한다.
     * @param {number} offset 이동할 offset
     * @return {Number} 이동한 위치의 row index
     */
    prevRowIndex: function(offset) {
        var rowKey = this.prevRowKey(offset);
        return this.grid.dataModel.indexOfRowKey(rowKey);
    },

    /**
     * 다음 컬럼의 인덱스를 반환한다.
     * @return {Number} 다음 컬럼의 index
     */
    nextColumnIndex: function() {
        var columnName = this.nextColumnName();
        return this.grid.columnModel.indexOfColumnName(columnName, true);
    },

    /**
     * 이전 컬럼의 인덱스를 반환한다.
     * @return {Number} 이전 컬럼의 인덱스
     */
    prevColumnIndex: function() {
        var columnName = this.prevColumnName();
        return this.grid.columnModel.indexOfColumnName(columnName, true);
    },

    /**
     * keyEvent 발생 시 호출될 메서드로,
     * rowSpan 정보 까지 계산된 다음 rowKey 를 반환한다.
     * @param {number}  offset 이동할 offset
     * @return {Number|String} offset 만큼 이동한 위치의 rowKey
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
     * @return {Number|String} offset 만큼 이동한 위치의 rowKey
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
     * @return {String} 다음 컬럼명
     */
    nextColumnName: function() {
        return this._findColumnName(1);
    },

    /**
     * keyEvent 발생 시 호출될 메서드로, 이전 columnName 을 반환한다.
     * @return {String} 이전 컬럼명
     */
    prevColumnName: function() {
        return this._findColumnName(-1);
    },

    /**
     * 첫번째 row 의 key 를 반환한다.
     * @return {(string|number)} 첫번째 row 의 키값
     */
    firstRowKey: function() {
        return this.grid.dataModel.at(0).get('rowKey');
    },

    /**
     * 마지막 row의 key 를 반환한다.
     * @return {(string|number)} 마지막 row 의 키값
     */
    lastRowKey: function() {
        return this.grid.dataModel.at(this.grid.dataModel.length - 1).get('rowKey');
    },

    /**
     * 첫번째 columnName 을 반환한다.
     * @return {string} 첫번째 컬럼명
     */
    firstColumnName: function() {
        var columnModelList = this.grid.columnModel.getVisibleColumnModelList();
        return columnModelList[0]['columnName'];
    },

    /**
     * 마지막 columnName 을 반환한다.
     * @return {string} 마지막 컬럼명
     */
    lastColumnName: function() {
        var columnModelList = this.grid.columnModel.getVisibleColumnModelList(),
            lastIndex = columnModelList.length - 1;
        return columnModelList[lastIndex]['columnName'];
    }
});

module.exports = Focus;

},{"../base/model":5,"../util":19}],15:[function(require,module,exports){
/**
 * @fileoverview 스마트 랜더링을 지원하는 Renderer 모ㄷ델
 * @author NHN Ent. FE Development Team
 */
'use strict';

var Renderer = require('./renderer');
var util = require('../util');

/**
 *  View 에서 Rendering 시 사용할 객체
 *  Smart Rendering 을 지원한다.
 *  @module model/renderer-smart
 */
var SmartRenderer = Renderer.extend(/**@lends module:model/renderer-smart.prototype */{
    /**
     * @extends module:model/renderer
     * @constructs
     */
    initialize: function() {
        Renderer.prototype.initialize.apply(this, arguments);
        this.on('change:scrollTop', this._onChange, this);
        this.listenTo(this.grid.dimensionModel, 'change:bodyHeight', this._onChange, this);

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
        var dimensionModel = this.grid.dimensionModel,
            dataModel = this.grid.dataModel,
            rowHeight = dimensionModel.get('rowHeight'),
            displayRowCount = dimensionModel.getDisplayRowCount(),
            startIndex = Math.max(0, Math.ceil(scrollTop / (rowHeight + 1)) - this.hiddenRowCount),
            endIndex = Math.min(dataModel.length - 1, startIndex + displayRowCount + (this.hiddenRowCount * 2)),
            top;

        if (dataModel.isRowSpanEnable()) {
            startIndex += this._getStartRowSpanMinCount(startIndex);
            endIndex += this._getEndRowSpanMaxCount(endIndex);
        }
        top = (startIndex === 0) ? 0 : util.getHeight(startIndex, rowHeight) - 1;

        this.set({
            top: top,
            startIndex: startIndex,
            endIndex: endIndex
        });
    },

    /**
     * 렌더링을 시작하는 행에 rowSpan 정보가 있으면, count 값이 가장 작은 행의 값을 반환한다.
     * @param {number} startIndex 시작하는 행의 Index
     * @return {number} rowSpan의 count 값 (0 이하)
     * @private
     */
    _getStartRowSpanMinCount: function(startIndex) {
        var firstRow = this.grid.dataModel.at(startIndex),
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
     * @return {number} rowSpan의 count 값 (0 이상)
     * @private
     */
    _getEndRowSpanMaxCount: function(endIndex) {
        var lastRow = this.grid.dataModel.at(endIndex),
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
     * @return {boolean}    랜더링 해야할지 여부
     * @private
     */
    _isRenderable: function(scrollTop) {
        var grid = this.grid,
            dimensionModel = grid.dimensionModel,
            dataModel = grid.dataModel,
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

},{"../util":19,"./renderer":16}],16:[function(require,module,exports){
/**
 * @fileoverview Rendering 모델
 * @author NHN Ent. FE Development Team
 */
'use strict';

var Model = require('../base/model');
var RowList = require('./rowList');

/**
 * View 에서 Rendering 시 사용할 객체
 * @module model/renderer
 */
var Renderer = Model.extend(/**@lends module:model/renderer.prototype */{
    /**
     * @extends module:base/model
     * @constructs
     */
    initialize: function() {
        var lside, rside;

        Model.prototype.initialize.apply(this, arguments);

        this.setOwnProperties({
            timeoutIdForRowListChange: 0,
            timeoutIdForRefresh: 0,
            isColumnModelChanged: false
        });

        lside = new RowList([], {grid: this.grid});
        rside = new RowList([], {grid: this.grid});
        this.set({
            lside: lside,
            rside: rside
        });

        this.listenTo(this.grid.columnModel, 'all', this._onColumnModelChange, this)
            .listenTo(this.grid.dataModel, 'add remove sort reset', this._onRowListChange, this)
            .listenTo(this.grid.dimensionModel, 'change:width', this._onWidthChange, this)
            .listenTo(lside, 'valueChange', this._onValueChange, this)
            .listenTo(rside, 'valueChange', this._onValueChange, this);
    },

    defaults: {
        top: 0,
        scrollTop: 0,
        scrollLeft: 0,
        maxScrollLeft: 0,
        startIndex: 0,
        endIndex: 0,
        startNumber: 1,
        lside: null,
        rside: null
    },

    /**
     * lside 와 rside collection 에서 value 값이 변경되었을 시 executeRelation 을 수행하기 위한 이벤트 핸들러
     * @param {number} rowIndex row 의 index 값
     * @private
     */
    _onValueChange: function(rowIndex) {
        this.executeRelation(rowIndex);
    },

    /**
     * Event handler for 'chage:width' event on Dimension.
     * @private
     */
    _onWidthChange: function() {
        var dimension = this.grid.dimensionModel;
        this.set('maxScrollLeft', dimension.getFrameWidth('R') - dimension.get('rsideWidth'));
    },

    /**
     * 내부 변수를 초기화 한다.
     */
    initializeVariables: function() {
        this.set({
            top: 0,
            scrollTop: 0,
            $scrollTarget: null,
            scrollLeft: 0,
            startIndex: 0,
            endIndex: 0,
            startNumber: 1
        });
    },

    /**
     * 열고정 영역 또는 열고정이 아닌 영역에 대한 Render Collection 을 반환한다.
     * @param {String} [whichSide='R']    어느 영역인지 여부. 'L|R' 중에 하나의 값을 넘긴다.
     * @return {Object} collection  해당 영역의 랜더 데이터 콜랙션
     */
    getCollection: function(whichSide) {
        return this.get(ne.util.isString(whichSide) ? whichSide.toLowerCase() + 'side' : 'rside');
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
        this.isColumnModelChanged = true;
        clearTimeout(this.timeoutIdForRefresh);
        this.timeoutIdForRefresh = setTimeout($.proxy(this.refresh, this), 0);
    },

    /**
     * Data.RowList 가 변경되었을 때 열고정 영역 frame, 열고정 영역이 아닌 frame 의 list 를 재생성 하기 위한 이벤트 핸들러
     * @private
     */
    _onRowListChange: function() {
        clearTimeout(this.timeoutIdForRefresh);
        this.timeoutIdForRefresh = setTimeout($.proxy(this.refresh, this, true), 0);
    },

    /**
     * rendering 할 index 범위를 결정한다.
     * Smart rendering 을 사용하지 않을 경우 전체 범위로 랜더링한다.
     * @private
     */
    _setRenderingRange: function() {
        this.set({
            startIndex: 0,
            endIndex: this.grid.dataModel.length - 1
        });
    },

    /**
     * rendering 할 데이터를 생성한다.
     * @param {boolean} isDataModelChanged - The boolean value whether dataModel has changed
     */
    refresh: function(isDataModelChanged) {
        this._setRenderingRange(this.get('scrollTop'));

        //TODO : rendering 해야할 데이터만 가져온다.
        //TODO : eslint 에러 수정
        var columnFixIndex = this.grid.columnModel.get('columnFixIndex'), // eslint-disable-line
            columnList = this.grid.columnModel.get('visibleList'),
            columnNameList = _.pluck(columnList, 'columnName'),

            lsideColumnList = columnNameList.slice(0, columnFixIndex),
            rsideColumnList = columnNameList.slice(columnFixIndex),

            lsideRowList = [],
            rsideRowList = [],
            lsideRow = [],
            rsideRow = [],
            startIndex = this.get('startIndex'),
            endIndex = this.get('endIndex'),
            num = this.get('startNumber') + startIndex,
            len,
            i,
            rowModel,
            rowKey;

        for (i = startIndex; i < endIndex + 1; i += 1) {
            rowModel = this.grid.dataModel.at(i);
            if (rowModel) {
                rowKey = rowModel.get('rowKey');

                //데이터 초기화
                lsideRow = {
                    '_extraData': rowModel.get('_extraData'),
                    'rowKey': rowKey
                };
                rsideRow = {
                    '_extraData': rowModel.get('_extraData'),
                    'rowKey': rowKey
                };

                //lside 데이터 먼저 채운다.
                _.each(lsideColumnList, function (columnName) { // eslint-disable-line
                    if (columnName === '_number') {
                        lsideRow[columnName] = num++; // eslint-disable-line
                    } else {
                        lsideRow[columnName] = rowModel.get(columnName);
                    }
                });

                _.each(rsideColumnList, function (columnName) { // eslint-disable-line
                    if (columnName === '_number') {
                        rsideRow[columnName] = num++; // eslint-disable-line
                    } else {
                        rsideRow[columnName] = rowModel.get(columnName);
                    }
                });
                lsideRowList.push(lsideRow);
                rsideRowList.push(rsideRow);
            }
        }

        this.get('lside').clear().reset(lsideRowList, {
            parse: true
        });
        this.get('rside').clear().reset(rsideRowList, {
            parse: true
        });

        len = rsideRowList.length + startIndex;
        for (i = startIndex; i < len; i += 1) {
            this.executeRelation(i);
        }

        if (this.isColumnModelChanged) {
            this.trigger('columnModelChanged');
            this.isColumnModelChanged = false;
        } else {
            this.trigger('rowListChanged', isDataModelChanged);
        }
        this.trigger('refresh');
    },

    /**
     * columnName 으로 lside 와 rside rendering collection 중 하나를 반환한다.
     * @param {String} columnName   컬럼명
     * @return {Collection} 컬럼명에 해당하는 영역의 콜랙션
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
     * 셀 데이터를 반환한다.
     * @param {number} rowKey   데이터의 키값
     * @param {String} columnName   컬럼명
     * @return {object} cellData 셀 데이터
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
         changed: []    //변경된 프로퍼티 목록들
     }
     */
    getCellData: function(rowKey, columnName) {
        var collection = this._getCollectionByColumnName(columnName),
            row = collection.get(rowKey);
        if (row) {
           return row.get(columnName);
        }
    },

    /**
     * rowIndex 에 해당하는 relation 을 수행한다.
     * @param {Number} rowIndex row 의 index 값
     */
    executeRelation: function(rowIndex) {
        var row = this.grid.dataModel.at(rowIndex),
            renderIdx = rowIndex - this.get('startIndex'),
            rowModel, relationResult;
        relationResult = row.getRelationResult();

        _.each(relationResult, function(changes, columnName) {
            rowModel = this._getCollectionByColumnName(columnName).at(renderIdx);
            if (rowModel) {
                rowModel.setCell(columnName, changes);
            }
        }, this);
    },

    /**
     * Destroys itself
     * @private
     */
    _destroy: function() {
        clearTimeout(this.timeoutIdForRefresh);
    }
});

module.exports = Renderer;

},{"../base/model":5,"./rowList":18}],17:[function(require,module,exports){
/**
 * @fileoverview RowList 클래스파일
 * @author NHN Ent. FE Development Team
 */
'use strict';

var Model = require('../base/model');
var util = require('../util');

/**
 * Row Model
 * @module model/row
 */
var Row = Model.extend(/**@lends module:model/row.prototype */{
    /**
     * @constructs
     * @extends module:base/model
     * @param  {object} attributes - Attributes
     * @param  {object} options - Options
     */
    initialize: function(attributes, options) { // eslint-disable-line no-unused-vars
        var rowKey;

        Model.prototype.initialize.apply(this, arguments);
        rowKey = attributes && attributes['rowKey'];

        this.setOwnProperties({
            dataModel: this.grid.dataModel,
            columnModel: this.grid.columnModel,
            renderModel: this.grid.renderModel
        });

        if (this.dataModel.get(rowKey)) {
            this.listenTo(this.dataModel.get(rowKey), 'change', this._onDataModelChange, this);
            this.listenTo(this.dataModel.get(rowKey), 'restore', this._onDataModelChange, this);
        }
    },

    idAttribute: 'rowKey',

    /**
     * dataModel 이 변경시 model 데이터를 함께 업데이트 하는 핸들러
     * @param {Object} model    변경이 발생한 row 모델
     * @private
     */
    _onDataModelChange: function(model) {
        _.each(model.changed, function(value, columnName) {
            if (columnName === '_extraData') {
                // 랜더링시 필요한 정보인 extra data 가 변경되었을 때 해당 row 에 disable, editable 상태를 업데이트 한다.
                // rowSpan 되어있는 행일 경우 main row 에 해당 처리를 수행한다..
                this._setRowExtraData();
            } else {
                this.setCell(columnName, {
                    value: value
                });
            }
        }, this);
    },

    /**
     * extra data 를 토대로 rowSpanned 된 render model 의 정보를 업데이트 한다.
     * @private
     */
    _setRowExtraData: function() {
        var dataModel = this.dataModel,
            columnModelList = this.columnModel.getVisibleColumnModelList(),
            row = this.dataModel.get(this.get('rowKey')),
            rowState = row.getRowState(),
            param;

        if (ne.util.isUndefined(this.collection)) {
            return;
        }

        _.each(columnModelList, function(columnModel) {
            var columnName = columnModel['columnName'],
                cellData = this.get(columnName),
                rowModel = this,
                isEditable, isDisabled;

            if (!ne.util.isUndefined(cellData)) {
                isEditable = row.isEditable(columnName);
                isDisabled = (columnName === '_button') ? rowState.isDisabledCheck : rowState.isDisabled;
                if (dataModel.isRowSpanEnable() && !cellData['isMainRow']) {
                    rowModel = this.collection.get(cellData['mainRowKey']);
                }
                if (rowModel) {
                    param = {
                        isDisabled: isDisabled,
                        isEditable: isEditable,
                        className: row.getClassNameList(columnName).join(' ')
                    };
                    rowModel.setCell(columnName, param);
                }
            }
        }, this);
    },

    /**
     * Backbone 이 collection 생성 시 내부적으로 parse 를 호출하여 데이터를 형식에 맞게 가공한다.
     * @param {Array} data  원본 데이터
     * @return {Array}  형식에 맞게 가공된 데이터
     */
    parse: function(data) {
        return this._formatData(data);
    },

    /**
     * 데이터를 View 에서 사용할 수 있도록 가공한다.
     * @param {Array} data  원본 데이터
     * @return {Array}  가공된 데이터
     * @private
     */
    _formatData: function(data) {
        var grid = this.grid || this.collection.grid,
            dataModel = grid.dataModel,
            rowKey = data['rowKey'],
            row = dataModel.get(rowKey),
            rowState = row.getRowState(),
            isDisabled = rowState.isDisabled;

        _.each(data, function(value, columnName) {
            var rowSpanData,
                isEditable = row.isEditable(columnName);

            if (columnName !== 'rowKey' && columnName !== '_extraData') {
                if (dataModel.isRowSpanEnable() &&
                    data['_extraData'] && data['_extraData']['rowSpanData'] &&
                    data['_extraData']['rowSpanData'][columnName]) {
                    rowSpanData = data['_extraData']['rowSpanData'][columnName];
                } else {
                    rowSpanData = {
                        mainRowKey: rowKey,
                        count: 0,
                        isMainRow: true
                    };
                }
                isDisabled = (columnName === '_button') ? rowState.isDisabledCheck : isDisabled;

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
                    className: row.getClassNameList(columnName).join(' '),

                    changed: []    //변경된 프로퍼티 목록들
                };
            }
        }, this);
        return data;
    },

    /**
     * Cell 의 값을 변경한다.
     * - 참조형 데이터 타입이기 때문에 change 이벤트 발생을 위해 이 method 를 사용하여 값 변경을 수행한다.
     * @param {String} columnName   컬럼명
     * @param {{key: value}} param  key:value 로 이루어진 셀에서 변경할 프로퍼티 목록
     */
    setCell: function(columnName, param) {
        var isValueChanged = false,
            changed = [],
            rowIndex, rowKey, data;

        if (!this.get(columnName)) {
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
            data['changed'] = changed;
            this.set(columnName, data);
            if (isValueChanged) {
                //value 가 변경되었을 경우 relation 을 수행한다.
                rowIndex = this.dataModel.indexOfRowKey(rowKey);
                this.trigger('valueChange', rowIndex);
            }
        }
    }
});

module.exports = Row;

},{"../base/model":5,"../util":19}],18:[function(require,module,exports){
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
  */
var RowList = Collection.extend(/**@lends module:model/rowList.prototype */{
    model: Row,
    /**
     * @constructs 
     * @extends module:base/collection
     */
    initialize: function() {
        Collection.prototype.initialize.apply(this, arguments);
    }
});

module.exports = RowList;

},{"../base/collection":3,"./row":17}],19:[function(require,module,exports){
/**
* @fileoverview 유틸리티 메서드 모음
* @author NHN Ent. FE Development Team
*/
'use strict';

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
     * @return {string} html 마크업에 포함될 문자열
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
     * 템플릿데이터에 객체의 데이터를 삽입해 스트링을 리턴한다.
     * 매핑데이터를 배열로 전달하면 갯수만큼 템플릿을 반복생성한다.
     * @memberof module:util
     * @param {string} template 템플릿 텍스트
     * @param {object|object[]} mapper 템플릿과 합성될 데이터
     * @return {Array} replaced array
     */
    template: function(template, mapper) {
        var totalReplaced = [],
            replaced;

        if (!ne.util.isArray(mapper)) {
            mapper = [mapper];
        }

        ne.util.forEach(mapper, function(mapdata) {
            replaced = template.replace(/<%=([^%]+)%>/g, function(matchedString, name) {
                return mapdata[name] ? mapdata[name].toString() : '';
            });

            totalReplaced.push(replaced);
        });

        return totalReplaced;
    },

    /**
     * 배열의 합을 반환한다.
     * @memberof module:util
     * @param {number[]} list   총 합을 구할 number 타입 배열
     * @return {number} 합산한 결과값
     */
    sum: function(list) {
        return _.reduce(list, function(memo, value) {
            memo += value;
            return memo;
        }, 0);
    },

    /**
     * 행 개수와 한 행당 높이를 인자로 받아 테이블 body 의 전체 높이를 구한다.
     * @memberof module:util
     * @param {number} rowCount  행 개수
     * @param {number} rowHeight    한 행당 높이
     * @return {number} 계산된 높이
     */
    getHeight: function(rowCount, rowHeight) {
        return rowCount === 0 ? rowCount : rowCount * (rowHeight + 1) + 1;
    },

    /**
     *Table 의 높이와 행당 높이를 인자로 받아, table 에서 보여줄 수 있는 행 개수를 반환한다.
     * @memberof module:util
     * @param {number} height 테이블 body 높이
     * @param {number} rowHeight    한 행당 높이
     * @return {number} 테이블 body 당 보여지는 행 개수
     */
    getDisplayRowCount: function(height, rowHeight) {
        return Math.ceil((height - 1) / (rowHeight + 1));
    },

    /**
     * Table 의 height 와 행 개수를 인자로 받아, 한 행당 높이를 구한다.
     * @memberof module:util
     * @param {number} rowCount  행 개수
     * @param {number} height   테이블 body 높이
     * @return {number} 한 행당 높이값
     */
    getRowHeight: function(rowCount, height) {
        return rowCount === 0 ? 0 : Math.floor(((height - 1) / rowCount)) - 1;
    },

    /**
     * target 과 dist 의 값을 비교하여 같은지 여부를 확인하는 메서드
     * === 비교 연산자를 사용하므로, object 의 경우 1depth 까지만 지원함.
     * @memberof module:util
     * @param {*} target    동등 비교할 target
     * @param {*} dist      동등 비교할 dist
     * @return {boolean}    동일한지 여부
     */
    isEqual: function(target, dist) {
        var isDiff,
            compareObject = function(targetObj, distObj) {
                var name,
                    result = true;
                /*
                    빠른 loop 탈출을 위해 ne.forEach 대신 for in 구문을 사용한다.
                    (추후 forEach 에 loop 탈출 기능이 추가되면 forEach 로 적용함.
                */
                for (name in targetObj) {
                    if (targetObj[name] !== distObj[name]) {
                        result = false;
                        break;
                    }
                }
                return result;
            };
        if (typeof target !== typeof dist) {
            return false;
        } else if (ne.util.isArray(target) && target.length !== dist.length) {
            return false;
        } else if (typeof target === 'object') {
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
     * @return {boolean} True if target is undefined or null or ''
     */
    isBlank: function(target) {
        if (ne.util.isString(target)) {
            return !target.length;
        }
        return target === undefined || target === null;
    },

    /**
     * Grid 에서 필요한 형태로 HTML tag 를 제거한다.
     * @memberof module:util
     * @param {string} htmlString   html 마크업 문자열
     * @return {String} HTML tag 에 해당하는 부분을 제거한 문자열
     */
    stripTags: function(htmlString) {
        var matchResult;
        htmlString = htmlString.replace(/[\n\r\t]/g, '');
        if (ne.util.hasEncodableString(htmlString)) {
            if (/<img/i.test(htmlString)) {
                matchResult = htmlString.match(/<img[^>]*\ssrc=[\"']?([^>\"']+)[\"']?[^>]*>/i);
                htmlString = matchResult ? matchResult[1] : '';
            } else {
                htmlString = htmlString.replace(/<button.*?<\/button>/gi, '');
            }
            htmlString = $.trim(ne.util.decodeHTMLEntity(htmlString.replace(/<\/?(?:h[1-5]|[a-z]+(?:\:[a-z]+)?)[^>]*>/ig, '')));
        }
        return htmlString;
    },

    /**
     * Create unique key
     * @memberof module:util
     * @return {number} unique key 를 반환한다.
     */
    getUniqueKey: function() {
        this.uniqueId += 1;
        return this.uniqueId;
    },

    /**
     * object 를 query string 으로 변경한다.
     * @memberof module:util
     * @param {object} dataObj  쿼리 문자열으로 반환할 객체
     * @return {string} 변환된 쿼리 문자열
     */
    toQueryString: function(dataObj) {
        var queryList = [];

        ne.util.forEach(dataObj, function(value, name) {
            if (typeof value !== 'string' && typeof value !== 'number') {
                value = $.toJSON(value);
            }
            value = encodeURIComponent(value);
            queryList.push(name + '=' + value);
        }, this);
        return queryList.join('&');
    },

    /**
     * queryString 을 object 형태로 변형한다.
     * @memberof module:util
     * @param {String} queryString 쿼리 문자열
     * @return {Object} 변환한 Object
     */
    toQueryObject: function(queryString) {
        var queryList = queryString.split('&'),
            obj = {};

        ne.util.forEach(queryList, function(query) {
            var tmp = query.split('='),
                key,
                value;
            key = tmp[0];
            value = decodeURIComponent(tmp[1]);
            try {
                value = $.parseJSON(value);
            } catch(e) {} // eslint-disable-line
            obj[key] = value;
        }, this);

        return obj;
    },

    /**
     * type 인자에 맞게 value type 을 convert 한다.
     * Data.Row 의 List 형태에서 editOption.list 에서 검색을 위해,
     * value type 해당 type 에 맞게 변환한다.
     * @memberof module:util
     * @param {*} value 컨버팅할 value
     * @param {String} type 컨버팅 될 타입
     * @return {*}  타입 컨버팅된 value
     */
    convertValueType: function(value, type) {
        if (type === 'string') {
            return value.toString();
        } else if (type === 'number') {
            return +value;
        }
        return value;
    },

    /**
     * Capitalize first character of the target string.
     * @param  {string} string Target string
     * @return {string} Converted new string
     */
    toUpperCaseFirstLetter: function(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    },

    /**
     * form 요소 설정
     * @memberof module:util
     */
    form: {
        /**
         * form 의 input 요소 값을 설정하기 위한 객체
         * @alias form.setInput
         * @memberof module:util
         */
        setInput: {
            /**
             * 배열의 값들을 전부 String 타입으로 변환한다.
             * @memberof module:util
             * @private
             * @alias form.setInput['_changeToStringInArray']
             * @param {Array}  arr 변환할 배열
             * @return {Array} 변환된 배열 결과 값
             */
            '_changeToStringInArray': function(arr) {
                ne.util.forEach(arr, function(value, i) {
                    arr[i] = String(value);
                }, this);
                return arr;
            },

            /**
             * radio type 의 input 요소의 값을 설정한다.
             * @memberof module:util
             * @alias form.setInput['radio']
             * @param {HTMLElement} targetElement - Target element
             * @param {String} formValue - Form value
             */
            'radio': function(targetElement, formValue) {
                targetElement.checked = (targetElement.value === formValue);
            },

            /**
             * radio type 의 input 요소의 값을 설정한다.
             * @memberof module:util
             * @alias form.setInput.checkbox
             * @param {HTMLElement} targetElement - Target element
             * @param {String} formValue - Form value
             */
            'checkbox': function(targetElement, formValue) {
                if (ne.util.isArray(formValue)) {
                    targetElement.checked = $.inArray(targetElement.value, this._changeToStringInArray(formValue)) !== -1;
                } else {
                    targetElement.checked = (targetElement.value === formValue);
                }
            },

            /**
             * select-one type 의 input 요소의 값을 설정한다.
             * @memberof module:util
             * @alias form.setInput['select-one']
             * @param {HTMLElement} targetElement - Target element
             * @param {String} formValue - Form value
             */
            'select-one': function(targetElement, formValue) {
                var options = ne.util.toArray(targetElement.options),
                    index = -1;

                ne.util.forEach(options, function(targetOption, i) {
                    if (targetOption.value === formValue || targetOption.text === formValue) {
                        index = i;
                        return false;
                    }
                }, this);

                targetElement.selectedIndex = index;
            },

            /**
             * select-multiple type 의 input 요소의 값을 설정한다.
             * @memberof module:util
             * @alias form.setinput['select-multiple']
             * @param {HTMLElement} targetElement - Target element
             * @param {String} formValue - Form value
             */
            'select-multiple': function(targetElement, formValue) {
                var options = ne.util.toArray(targetElement.options);

                if (ne.util.isArray(formValue)) {
                    formValue = this._changeToStringInArray(formValue);
                    ne.util.forEach(options, function(targetOption) {
                        targetOption.selected = $.inArray(targetOption.value, formValue) !== -1 ||
                        $.inArray(targetOption.text, formValue) !== -1;
                    }, this);
                } else {
                    this['select-one'].apply(this, arguments);
                }
            },

            /**
             * input 요소의 값을 설정하는 default 로직
             * @memberof module:util
             * @alias form.setinput['defaultAction']
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
         * @return {object} form 내의 데이터들을 key:value 형태의 DataObject 로 반환한다.
         **/
        getFormData: function($form) {
            var result = {},
                valueList = $form.serializeArray();

            ne.util.forEach(valueList, function(obj) {
                var value = obj.value,
                    name = obj.name;
                if (ne.util.isExisty(result[name])) {
                    if (!result[name].push) {
                        result[name] = [result[name]];
                    }
                    result[name].push(value || '');
                } else {
                    result[name] = value || '';
                }
            }, this);

            return result;
        },

        /**
         * 폼 안에 있는 모든 인풋 엘리먼트를 배열로 리턴하거나, elementName에 해당하는 인풋 엘리먼트를 리턴한다.
         * @memberof module:util
         * @alias form.getFormElement
         * @param {jquery} $form jQuery()로 감싼 폼엘리먼트
         * @param {String} [elementName] 특정 이름의 인풋 엘리먼트만 가져오고 싶은 경우 전달하며, 생략할 경우 모든 인풋 엘리먼트를 배열 형태로 리턴한다.
         * @return {jQuery}  jQuery 로 감싼 엘리먼트를 반환한다.
         */
        getFormElement: function($form, elementName) {
            var formElement;
            if ($form && $form.length) {
                if (elementName) {
                    formElement = $form.prop('elements')[elementName + ''];
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
            ne.util.forEachOwnProperties(formData, function(value, property) {
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
            var type,
                elementList = this.getFormElement($form, elementName);

            if (!elementList) {
                return;
            }
            if (!ne.util.isArray(formValue)) {
                formValue = String(formValue);
            }
            elementList = ne.util.isHTMLTag(elementList) ? [elementList] : elementList;
            elementList = ne.util.toArray(elementList);
            ne.util.forEach(elementList, function(targetElement) {
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
                } catch(e) {
                    // to prevent unspecified error in IE (occurs when running test)
                }
            } else if (target.createTextRange) {
                range = target.createTextRange();
                range.collapse(true);
                range.moveEnd('character', length);
                range.moveStart('character', length);
                try {
                     range.select();
                } catch(e) {
                     // to prevent unspecified error in IE (occurs when running test)
                }
            }
        }
    }
};

module.exports = util;

},{}],20:[function(require,module,exports){
/**
 * @fileoverview Cell Painter Factory
 * @author NHN Ent. FE Development Team
 */
'use strict';

var View = require('../base/view');

var MainButtonCell = require('./painter/cell/mainButton');
var NumberCell = require('./painter/cell/number');
var NormalCell = require('./painter/cell/normal');
var ButtonListCell = require('./painter/cell/button');
var SelectCell = require('./painter/cell/select');
var TextCell = require('./painter/cell/text');
var TextConvertibleCell = require('./painter/cell/text-convertible');
var TextPasswordCell = require('./painter/cell/text-password');

/**
 * Cell Factory
 * @module view/cellFactory
 */
var CellFactory = View.extend(/**@lends module:view/cellFactory.prototype */{
    /**
     * @constructs
     * @extends module:view/base 
     */
    initialize: function() {
        View.prototype.initialize.apply(this, arguments);
        this._initializeInstances();
    },

    /**
     * 종류별 Cell Painter Instance 를 를 생성한다.
     * @private
     */
    _initializeInstances: function() {
        var instances = {},
            args = {
                grid: this.grid
            },
            instanceList = [
                new MainButtonCell(args),
                new NumberCell(args),
                new NormalCell(args),
                new ButtonListCell(args),
                new SelectCell(args),
                new TextCell(args),
                new TextPasswordCell(args),
                new TextConvertibleCell(args)
            ];

        _.each(instanceList, function(instance) {
            instances[instance.getEditType()] = instance;
        }, this);

        this.setOwnProperties({
            instances: instances
        });
    },

    /**
     * 인자로 받은 editType 에 해당하는 Cell Painter Instance 를 반환한다.
     * @param {String} editType editType 정보
     * @return {Object} editType 에 해당하는 페인터 인스턴스
     */
    getInstance: function(editType) {
        var instance = this.instances[editType];

        if (!instance) {
            //checkbox, radio 의 경우, instance 의 이름이 전달받는 editType 과 다르기 때문에 예외처리 한다.
            if (editType === 'radio' || editType === 'checkbox') {
                instance = this.instances['button'];
            } else {
                //그 외의 경우 모두 normal 로 처리한다.
                instance = this.instances['normal'];
            }
        }
        return instance;
    }
});

module.exports = CellFactory;

},{"../base/view":7,"./painter/cell/button":37,"./painter/cell/mainButton":39,"./painter/cell/normal":40,"./painter/cell/number":41,"./painter/cell/select":42,"./painter/cell/text":45,"./painter/cell/text-convertible":43,"./painter/cell/text-password":44}],21:[function(require,module,exports){
/**
 * @fileoverview 키 이벤트 핸들링 담당하는 Clipboard 정의
 * @author NHN Ent. FE Development Team
 */
'use strict';

var View = require('../base/view');
var util = require('../util');

/**
 * Clipboard view class
 * @module view/clipboard
 */
var Clipboard = View.extend(/**@lends module:view/clipboard.prototype */{
    /**
     * @constructs
     * @extends module:base/view 
     */
    initialize: function() {
        View.prototype.initialize.apply(this, arguments);
        this.setOwnProperties({
            timeoutIdForKeyIn: 0,
            isLocked: false
        });
    },

    tagName: 'textarea',

    className: 'clipboard',

    events: {
        'keydown': '_onKeyDown',
        'focusin': '_onFocus'
    },

    /**
     * 클립보드 focus 이벤트 핸들러
     * @private
     */
    _onFocus: function() {
        var focusModel = this.grid.focusModel,
            focused = focusModel.which(),
            rowIdx;

        if (util.isBlank(focused.columnName)) {
            rowIdx = util.isBlank(focused.rowKey) ? 0 : this.grid.getIndexOfRow(focused.rowKey);
            this.grid.focusAt(rowIdx, 0);
        }
    },

    /**
     * 랜더링 한다.
     * @return {View.Clipboard} this object
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
        this.timeoutIdForKeyIn = setTimeout($.proxy(this._unlock, this), 10);
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
     * @param {event} keyDownEvent 이벤트 객체
     * @return {boolean} False if locked
     * @private
     */
    _onKeyDown: function(keyDownEvent) {
        if (this.isLocked) {
            keyDownEvent.preventDefault();
            return false;
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

        if (util.isBlank(focused.rowKey)) {
            return;
        }

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
            default:
                isKeyIdentified = false;
                break;
        }
        if (isKeyIdentified) {
            keyDownEvent.preventDefault();
        }
        selection.endSelection();
    },

    /**
     * enter 또는 space 가 입력되었을 때, 처리하는 로직
     * @param {(number|string)} rowKey 키 입력이 발생한 엘리먼트의 rowKey
     * @param {string} columnName 키 입력이 발생한 엘리먼트의 컬럼명
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
     * @param {event} keyDownEvent 이벤트 객체
     * @private
     */
    _keyInWithShift: function(keyDownEvent) { // eslint-disable-line complexity
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
            default:
                isKeyIdentified = false;
                break;
        }
        if (isKeyIdentified) {
            keyDownEvent.preventDefault();
        }
    },

    /**
     * ctrl 가 눌린 상태에서의 key down event handler
     * @param {event} keyDownEvent 이벤트 객체
     * @private
     */
    _keyInWithCtrl: function(keyDownEvent) {
        var grid = this.grid,
            keyMap = grid.keyMap,
            focusModel = grid.focusModel,
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
        var result = this._getProcessClipBoardData();
        this.$el.off('keyup');
        this.grid.paste(result);
    },

    /**
     * process data for paste to grid
     * @private
     * @return {Array.<Array.<string>>} result
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
     * @param {event} keyDownEvent 이벤트 객체
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
            for (i = range.row[0]; i < range.row[1] + 1; i += 1) {
                rowKey = dataModel.at(i).get('rowKey');
                for (j = range.column[0]; j < range.column[1] + 1; j += 1) {
                    columnName = columnModelList[j]['columnName'];
                    grid.del(rowKey, columnName, true);
                }
            }
            grid.renderModel.refresh(true);
        } else {
            grid.del(rowKey, columnName);
        }
    },

    /**
     * keyIn 으로 selection 영역을 update 한다. focus 로직도 함께 수행한다.
     * @param {Number} rowIndex 행의 index 정보
     * @param {Number} columnIndex 열의 index 정보
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
     * clipboard 에 설정될 문자열 반환한다.
     * @return {String} 데이터를 text 형태로 변환한 문자열
     * @private
     */
    _getClipboardString: function() {
        var text,
            selection = this.grid.selection,
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

},{"../base/view":7,"../util":19}],22:[function(require,module,exports){
/**
 * @fileoverview Base class for layers
 * @author NHN Ent. FE Development Team
 */
'use strict';

var View = require('../base/view');

/**
 * Base class for layers
 * @module view/layer
 */
var Layer = View.extend(/**@lends module:view/layer.prototype */{
    /**
     * @constructs
     * @extends module:base/view
     */
    initialize: function() {
        View.prototype.initialize.apply(this, arguments);
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

    /**
     * 랜더링 한다.
     * @param {String} text 레이어에 노출할 text
     * @return {View.Layer.Base} this object
     */
    render: function(text) {
        this.$el.html(this.template({
            text: text || this.text
        })).css('display', 'none');
        return this;
    },

    /**
     * Layer를 노출한다.
     * @param {String} text 레이어에 노출할 text
     */
    show: function(text) {
        this.render(text).$el.css('display', 'block')
            .css('zIndex', 1);
        this._resize();
    },

    /**
     * Layer 를 감춘다.
     */
    hide: function() {
        this.$el.css('display', 'none');
    },

    /**
     * 그리드의 크기에 맞추어 resize 한다.
     * @private
     */
    _resize: function() {
        var headerHeight, bodyHeight;

        if (this.$el.css('display') === 'block') {
            headerHeight = this.grid.dimensionModel.get('headerHeight');
            bodyHeight = this.grid.dimensionModel.get('bodyHeight');

            this.$el.css('marginTop', headerHeight + 'px')
                .css('height', bodyHeight + 'px');
        }
    }
});

module.exports = Layer;

},{"../base/view":7}],23:[function(require,module,exports){
/**
 * @fileoverview Empty layer class
 * @author NHN Ent. FE Development Team
 */
'use strict';

var Layer = require('../layer');

/**
 * Class for the layer which shows a 'no data' message
 * @module view/layer/empty
 */
var Empty = Layer.extend(/**@lends module:view/layer/empty.prototype */{
    /**
     * @constructs
     * @extends module:view/layer
     * @param {object} options - options
     * @param {string} options.text - text to be shown on the layer
     */
    initialize: function() {
        Layer.prototype.initialize.apply(this, arguments);
        this.setOwnProperties({
            text: this.grid.options.emptyMessage || '데이터가 존재하지 않습니다.'
        });
    },

    className: 'no_row_layer',

    template: _.template('<%=text%>')
});

module.exports = Empty;

},{"../layer":22}],24:[function(require,module,exports){
/**
 * @fileoverview Loading layer class
 * @author NHN Ent. FE Development Team
 */
'use strict';

var Layer = require('../layer');

/**
 * Class for the layer which shows a loading indicator
 * @module view/layer/loading
 */
var Loading = Layer.extend(/**@lends module:view/layer/loading.prototype */{
    /**
     * @constructs
     * @extends module:view/layer
     */
    initialize: function() {
        Layer.prototype.initialize.apply(this, arguments);
        this.text = '요청을 처리 중입니다.';
    },

    className: 'loading_layer',

    template: _.template('' +
        '<div>' +
        '    <%=text%>' +
        '    <div class="loading_img"></div>' +
        '</div>')
});

module.exports = Loading;

},{"../layer":22}],25:[function(require,module,exports){
/**
 * @fileoverview Ready layer class
 * @author NHN Ent. FE Development Team
 */
'use strict';

var Layer = require('../layer');

/**
 * Class for the layer which shows a initializing-message
 * @module view/layer/ready
 */
var Ready = Layer.extend(/**@lends module:view/layer/ready.prototype */{
    /**
     * @constructs
     * @extends module:view/layer
     */
    initialize: function() {
        Layer.prototype.initialize.apply(this, arguments);
        this.text = '초기화 중 입니다.';
    },

    className: 'initializing_layer'
});

module.exports = Ready;

},{"../layer":22}],26:[function(require,module,exports){
/**
 * @fileoverview Class for the body layout
 * @author NHN Ent. FE Development Team
 */
'use strict';

var View = require('../../base/view');
var RowListView = require('../rowList');

/**
 * Class for the body layout
 * @module view/layout/body
 */
var Body = View.extend(/**@lends module:view/layout/body.prototype */{
    /**
     * @constructs
     * @extends module:base/view
     * @param {Object} options - Options
     *      @param {String} [options.whichSide='R'] L or R (which side)
     */
    initialize: function(options) {
        View.prototype.initialize.apply(this, arguments);
        this.setOwnProperties({
            // Div for setting rendering position of entire child-nodes of $el.
            $bodyContainer: null,
            // Div for redraw table element with innerHTML.
            $tableContainer: null,
            whichSide: options && options.whichSide || 'R',
            isScrollSync: false,
            extraWidth: 0
        });

        this.listenTo(this.grid.dimensionModel, 'columnWidthChanged', this._onColumnWidthChanged)
            .listenTo(this.grid.dimensionModel, 'change:bodyHeight', this._onBodyHeightChange)
            .listenTo(this.grid.dataModel, 'add remove reset', this._resetContainerHeight)
            .listenTo(this.grid.renderModel, 'change:scrollTop', this._onScrollTopChange)
            .listenTo(this.grid.renderModel, 'change:scrollLeft', this._onScrollLeftChange);
    },

    tagName: 'div',

    className: 'data',

    template: _.template('' +
        '<div class="body_container">' +
        '   <div class="table_container"><%=table%></div>' +
        '</div>'),

    templateTable: _.template('' +
        '<table width="100%" border="0" cellspacing="1" cellpadding="0" bgcolor="#EFEFEF">' +
        '   <colgroup><%=colGroup%></colgroup>' +
        '   <tbody><%=tbody%></tbody>' +
        '</table>'),

    events: {
        'scroll': '_onScroll'
    },

    /**
     * DimensionModel 의 body Height 가 변경된 경우 element 의 height 를 조정한다.
     * @param {Object} model 변경이 일어난 model 인스턴스
     * @param {Number} value bodyHeight 값
     * @private
     */
    _onBodyHeightChange: function(model, value) {
        this.$el.css('height', value + 'px');
    },

    /**
     * Resets the height of a container div.
     */
    _resetContainerHeight: function() {
        this.$bodyContainer.css({
            height: this.grid.dimensionModel.get('totalRowHeight')
        });
    },

    /**
     * Event handler for 'columnWidthChanged' event on a dimension model.
     * @private
     */
    _onColumnWidthChanged: function() {
        var columnWidthList = this.grid.dimensionModel.getColumnWidthList(this.whichSide),
            $colList = this.$el.find('col');

        _.each(columnWidthList, function(width, index) {
            $colList.eq(index).css('width', (width - Body.extraWidth) + 'px');
        }, this);
    },

    /**
     * 스크롤 이벤트 핸들러
     * @param {event} scrollEvent   스크롤 이벤트
     * @private
     */
    _onScroll: function(scrollEvent) {
        var attrs = {
            scrollTop: scrollEvent.target.scrollTop
        };

        if (this.whichSide === 'R') {
            attrs.scrollLeft = scrollEvent.target.scrollLeft;
        }
        this.grid.renderModel.set(attrs);
    },

    /**
     * Render model 의 Scroll left 변경 이벤트 핸들러
     * @param {object} model 변경이 일어난 모델 인스턴스
     * @param {Number} value scrollLeft 값
     * @private
     */
    _onScrollLeftChange: function(model, value) {
        if (this.whichSide === 'R') {
            this.el.scrollLeft = value;
        }
    },

    /**
     * Render model 의 Scroll top 변경 이벤트 핸들러
     * @param {object} model 변경이 일어난 모델 인스턴스
     * @param {Number} value scrollTop값
     * @private
     */
    _onScrollTopChange: function(model, value) {
        this.el.scrollTop = value;
    },

    /**
     * Reset position of a table container
     * @param {number} top  조정할 top 위치 값
     * @private
     */
    resetTablePosition: function() {
        this.$tableContainer.css({
            top: this.grid.renderModel.get('top') + 'px'
        });
    },

    /**
     * rendering 한다.
     * @return {View.Layout.Body}   자기 자신
     */
    render: function() {
        var grid = this.grid,
            whichSide = this.whichSide,
            collection = grid.renderModel.getCollection(whichSide),
            selection, rowList, tableHtml;

        this.destroyChildren();

        if (!this.grid.option('scrollX')) {
            this.$el.css('overflow-x', 'hidden');
        }

        if (!this.grid.option('scrollY') && whichSide === 'R') {
            this.$el.css('overflow-y', 'hidden');
        }

        tableHtml = this.templateTable({
            colGroup: this._getColGroupMarkup(),
            tbody: ''
        });

        this.$el.css({
            height: grid.dimensionModel.get('bodyHeight')
        }).html(this.template({
            table: tableHtml
        }));
        this.$bodyContainer = this.$el.find('div.body_container');
        this.$tableContainer = this.$el.find('div.table_container');

        rowList = this.createView(RowListView, {
            grid: grid,
            collection: collection,
            bodyView: this,
            el: this.$el.find('tbody'),
            whichSide: whichSide
        });
        rowList.render();

        //selection 을 랜더링한다.
        selection = this.addView(grid.selection.createLayer(whichSide));
        this.$bodyContainer.append(selection.render().el);

        return this;
    },

    /**
     * 하위요소의 이벤트들을 this.el 에서 받아서 해당 요소에게 위임하도록 핸들러를 설정한다.
     * @param {string} selector - 선택자
     * @param {object} handlerInfos - 이벤트 정보 객체. ex) {'blur': {selector:string, handler:function}, 'click':{...}...}
     */
    attachTableEventHandler: function(selector, handlerInfos) {
        _.each(handlerInfos, function(obj, eventName) {
            this.$tableContainer.on(eventName, selector + ' ' + obj.selector, obj.handler);
        }, this);
    },

    /**
     * table 요소를 새로 생성한다.
     * (IE7-9에서 tbody의 innerHTML 변경할 수 없는 문제를 해결하여 성능개선을 하기 위해 사용)
     * @param {string} tbodyHtml - tbody의 innerHTML 문자열
     * @return {jquery} - 새로 생성된 table의 tbody 요소
     */
    redrawTable: function(tbodyHtml) {
        this.$tableContainer[0].innerHTML = this.templateTable({
            colGroup: this._getColGroupMarkup(),
            tbody: tbodyHtml
        });

        return this.$tableContainer.find('tbody');
    },

    /**
     * Table 열 각각의 width 조정을 위한 columnGroup 마크업을 반환한다.
     * @return {string} <colgroup> 안에 들어갈 마크업 문자열
     * @private
     */
    _getColGroupMarkup: function() {
        var grid = this.grid,
            whichSide = this.whichSide,
            dimensionModel = grid.dimensionModel,
            columnWidthList = dimensionModel.getColumnWidthList(whichSide),
            columnModelList = grid.columnModel.getVisibleColumnModelList(whichSide),
            html = '';

        _.each(columnModelList, function(columnModel, index) {
            var name = columnModel['columnName'],
                width = columnWidthList[index] - Body.extraWidth;

            html += '<col columnname="' + name + '" style="width:' + width + 'px">';
        });
        return html;
    }
},
{
    /**
     * IE7에서만 TD의 padding 만큼 넓이가 늘어나는 버그를 위한 예외처리를 위한 값
     * @memberof View.Layout.Body
     * @static
     */
    extraWidth: (function() {
        var value = 0;
        if (ne.util.browser.msie && ne.util.browser.version === 7) {
            // Grid.css의 padding값이 변경되면 다음 값을 같이 변경해 주어야함.
            value = 20;
        }
        return value;
    }())
});

module.exports = Body;

},{"../../base/view":7,"../rowList":47}],27:[function(require,module,exports){
/**
 * @fileoverview Left Side Frame
 * @author NHN Ent. FE Development Team
 */
'use strict';

var Frame = require('./frame');

/**
 * left side 프레임 클래스
 * @module view/layout/frame-lside
 */
var LsideFrame = Frame.extend(/**@lends module:view/layout/frame-lside.prototype */{
    /**
     * @constructs
     * @extends module:view/layout/frame
     */
    initialize: function() {
        Frame.prototype.initialize.apply(this, arguments);
        this.setOwnProperties({
            whichSide: 'L'
        });
    },

    className: 'lside_area',

    /**
     * columnWidth 변경시 호출될 이벤트 핸들러
     * @private
     */
    _onColumnWidthChanged: function() {
        var width = this.grid.dimensionModel.get('lsideWidth');
        this.$el.css({
            width: width + 'px'
        });
    },
    /**
     * 랜더링하기 전 수행되는 메서드
     */
    beforeRender: function() {
        var width = this.grid.dimensionModel.get('lsideWidth');
        this.$el.css({
            display: 'block',
            width: width + 'px'
        });
    }
});

module.exports = LsideFrame;

},{"./frame":29}],28:[function(require,module,exports){
/**
 * @fileoverview Right Side Frame
 * @author NHN Ent. FE Development Team
 */
'use strict';

var Frame = require('./frame');

/**
 * right side frame class
 * @module view/layout/frame-rside
 */
var RsideFrame = Frame.extend(/**@lends module:view/layout/frame-rside.prototype */{
    /**
     * @constructs
     * @extends module:view/layout/frame
     */
    initialize: function() {
        Frame.prototype.initialize.apply(this, arguments);
        this.setOwnProperties({
            whichSide: 'R',
            $scrollBorder: null
        });
        this.listenTo(this.grid.dimensionModel, 'change:bodyHeight change:headerHeight',
            this._resetScrollBorderHeight);
    },

    className: 'rside_area',

    /**
     * Event handler for 'columnWidthChanged' event on dimensionModel
     * @private
     * @override
     */
    _onColumnWidthChanged: function() {
        var dimensionModel = this.grid.dimensionModel,
            marginLeft = dimensionModel.get('lsideWidth'),
            width = dimensionModel.get('rsideWidth');

        this.$el.css({
            width: width + 'px',
            marginLeft: marginLeft + 'px'
        });
    },

    /**
     * Resets the height of a vertical scroll-bar border
     */
    _resetScrollBorderHeight: function() {
        var dimensionModel = this.grid.dimensionModel,
            height = dimensionModel.get('bodyHeight') - dimensionModel.getScrollXHeight();

        this.$scrollBorder.height(height);
    },

    /**
     * To be called before rendering.
     */
    beforeRender: function() {
        var dimensionModel = this.grid.dimensionModel,
            marginLeft = dimensionModel.get('lsideWidth'),
            width = dimensionModel.get('rsideWidth');

        this.$el.css({
            display: 'block',
            width: width + 'px',
            marginLeft: marginLeft + 'px'
        });
    },

    /**
     * To be called after rendering.
     */
    afterRender: function() {
        var dimensionModel = this.grid.dimensionModel,
            $space, $scrollBorder, $scrollCorner,
            headerHeight, bodyHeight;

        if (!this.grid.option('scrollY')) {
            return;
        }
        headerHeight = dimensionModel.get('headerHeight');
        bodyHeight = dimensionModel.get('bodyHeight');

        // Empty DIV for hiding scrollbar in the header area
        $space = $('<div />').addClass('header_space');

        // Empty DIV for showing a left-border of vertical scrollbar in the body area
        $scrollBorder = $('<div />').addClass('scrollbar_border');

        // Empty DIV for filling gray color in the right-bottom corner of the scrollbar.
        // (For resolving the issue that styling scrollbar-corner with '-webkit-scrollbar-corner'
        //  casues to be stuck in the same position in Chrome)
        $scrollCorner = $('<div />').addClass('scrollbar_corner');

        $space.height(headerHeight - 2); // subtract 2px for border-width (top and bottom)
        $scrollBorder.css('top', headerHeight + 'px');

        if (!this.grid.option('toolbar')) {
            $scrollCorner.css('bottom', 0);
        }

        this.$el.append($space, $scrollBorder, $scrollCorner);

        this.$scrollBorder = $scrollBorder;
        this._resetScrollBorderHeight();
    }
});

module.exports = RsideFrame;

},{"./frame":29}],29:[function(require,module,exports){
/**
 * @fileoverview Frame Base
 * @author NHN Ent. FE Development Team
 */
'use strict';

var View = require('../../base/view');
var Header = require('./header');
var Body = require('./body');

/**
 * frame Base 클래스
 * @module view/layout/frame
 */
var Frame = View.extend(/**@lends module:view/layout/frame.prototype */{
    /**
     * @constructs
     * @extends module:base/view
     * @param {Object} options Options
     *      @param {String} [options.whichSide='R']  어느 영역의 frame 인지 여부.
     */
    initialize: function(options) {
        View.prototype.initialize.apply(this, arguments);
        this.listenTo(this.grid.renderModel, 'columnModelChanged', this.render, this)
            .listenTo(this.grid.dimensionModel, 'columnWidthChanged', this._onColumnWidthChanged, this);

        this.setOwnProperties({
            header: null,
            body: null,
            whichSide: options && options.whichSide || 'R'
        });
    },

    tagName: 'div',

    className: 'lside_area',

    /**
     * 랜더링 메서드
     * @return {View.Layout.Frame} This object
     */
    render: function() {
        var header,
            body;
        this.destroyChildren();
        this.beforeRender();

        header = this.header = this.createView(Header, {
            grid: this.grid,
            whichSide: this.whichSide
        });
        body = this.body = this.createView(Body, {
            grid: this.grid,
            whichSide: this.whichSide
        });

        this.$el
            .append(header.render().el)
            .append(body.render().el);

        this.afterRender();
        return this;
    },
    /**
     * columnModel change 시 수행되는 핸들러 스켈레톤
     * @private
     */
    _onColumnWidthChanged: function() {},
    /**
     * 랜더링 하기전에 수행하는 함수 스켈레톤
     */
    beforeRender: function() {},
    /**
     * 랜더링 이후 수행하는 함수 스켈레톤
     */
    afterRender: function() {}
});

module.exports = Frame;

},{"../../base/view":7,"./body":26,"./header":30}],30:[function(require,module,exports){
/**
 * @fileoverview Header 관련
 * @author NHN Ent. FE Development Team
 */
'use strict';

var View = require('../../base/view');
var util = require('../../util');
var ResizeHandler = require('./resizeHandler');

/**
 * Header 레이아웃 View
 * @module view/layout/header
 */
var Header = View.extend(/**@lends module:view/layout/header.prototype */{
    /**
     * @constructs
     * @extends module:base/view 
     * @param {Object} options 옵션
     *      @param {String} [options.whichSide='R']  어느 영역의 header 인지 여부.
     */
    initialize: function(options) {
        View.prototype.initialize.apply(this, arguments);
        this.whichSide = options.whichSide;
        this.setOwnProperties({
            timeoutForAllChecked: 0
        });
        this.listenTo(this.grid.renderModel, 'change:scrollLeft', this._onScrollLeftChange, this)
            .listenTo(this.grid.dimensionModel, 'columnWidthChanged', this._onColumnWidthChanged, this)
            .listenTo(this.grid.dataModel, 'change:_button', this._onCheckCountChange, this)
            .listenTo(this.grid.dataModel, 'sortChanged', this._updateBtnSortState, this);
    },

    tagName: 'div',

    className: 'header',

    whichSide: 'R',

    events: {
        click: '_onClick'
    },

    /**
     * 전체 template
     */
    template: _.template('' +
    '    <table width="100%" border="0" cellspacing="1" cellpadding="0" bgcolor="#EFEFEF">' +
    '        <colgroup><%=colGroup%></colgroup>' +
    '        <tbody><%=tBody%></tbody>' +
    '    </table>'),
    /**
     * <th> 템플릿
     */
    templateHeader: _.template('' +
    '<th columnname="<%=columnName%>" ' +
    'height="<%=height%>" ' +
    '<%if(colspan > 0) {%>' +
    'colspan=<%=colspan%> ' +
    '<%}%>' +
    '<%if(rowspan > 0) {%>' +
    'rowspan=<%=rowspan%> ' +
    '<%}%>' +
    '><%=title%><%=btnSort%></th>' +
    ''),
    /**
     * <col> 템플릿
     */
    templateCol: _.template('' +
    '<col ' +
    'columnname="<%=columnName%>" ' +
    'style="width:<%=width%>px">' +
    ''),

    /**
     * 정렬 버튼을 위한 HTML 마크업
     */
    markupBtnSort: '<a class="btn_sorting"></a>',

    /**
     * col group 마크업을 생성한다.
     *
     * @return {string} <colgroup>에 들어갈 html 마크업 스트링
     * @private
     */
    _getColGroupMarkup: function() {
        var columnData = this._getColumnData(),
            columnWidthList = columnData.widthList,
            columnModelList = columnData.modelList,
            htmlList = [];

        _.each(columnWidthList, function(width, index) {
            htmlList.push(this.templateCol({
                columnName: columnModelList[index]['columnName'],
                width: width
            }));
        }, this);
        return htmlList.join('');
    },
    /**
     * 그리드의 checkCount 가 변경되었을 때 수행하는 헨들러
     * @private
     */
    _onCheckCountChange: function() {
        if (this.grid.option('selectType') === 'checkbox') {
            clearTimeout(this.timeoutForAllChecked);
            this.timeoutForAllChecked = setTimeout($.proxy(this._syncCheckState, this), 10);
        }
    },
    /**
     * selectType 이 checkbox 일 때 랜더링 되는 header checkbox 엘리먼트를 반환한다.
     * @return {jQuery} _butoon 컬럼 헤더의 checkbox input 엘리먼트
     * @private
     */
    _getHeaderMainCheckbox: function() {
        return this.$el.find('th[columnname="_button"] input');
    },
    /**
     * header 영역의 input 상태를 실제 checked 된 count 에 맞추어 반영한다.
     * @private
     */
    _syncCheckState: function() {
        var $input, enableCount, checkedCount;

        if (this.grid.option('selectType') !== 'checkbox') {
            return;
        }

        $input = this._getHeaderMainCheckbox();
        if (!$input.length) {
            return;
        }

        enableCount = 0;
        checkedCount = this.grid.dataModel.getRowList(true).length;
        this.grid.dataModel.forEach(function(row) {
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
     * @param {Event} clickEvent    클릭이벤트
     * @private
     */
    _onClick: function(clickEvent) {
        var $target = $(clickEvent.target),
            columnName = $target.closest('th').attr('columnname');

        /* istanbul ignore else */
        if (columnName === '_button' && $target.is('input')) {
            if ($target.prop('checked')) {
                this.grid.checkAll();
            } else {
                this.grid.uncheckAll();
            }
        } else if ($target.is('a.btn_sorting')) {
            this.grid.sort(columnName);
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
        this._$currentSortBtn = this.$el.find('th[columnname=' + sortOptions.columnName + '] a.btn_sorting');
        this._$currentSortBtn.addClass(sortOptions.isAscending ? 'sorting_up' : 'sorting_down');
    },

    /**
     * 랜더링
     * @return {View.Layout.Header} this
     */
    render: function() {
        var resizeHandler;

        this.destroyChildren();

        resizeHandler = this.createView(ResizeHandler, {
            whichSide: this.whichSide,
            grid: this.grid
        });
        if (!this.grid.option('scrollX')) {
            this.$el.css('overflow-x', 'hidden');
        }

        if (!this.grid.option('scrollY')) {
            this.$el.css('overflow-y', 'hidden');
        }

        this.$el.css({
            height: this.grid.dimensionModel.get('headerHeight')
        }).html(this.template({
            colGroup: this._getColGroupMarkup(),
            tBody: this._getTableBodyMarkup()
        }));

        this.$el.append(resizeHandler.render().el);
        return this;
    },

    /**
     * 컬럼 정보를 반환한다.
     * @return {{widthList: (Array|*), modelList: (Array|*)}}   columnWidthList 와 columnModelList 를 함께 반환한다.
     * @private
     */
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
     * Header 의 body markup 을 생성한다.
     * @return {string} header 의 테이블 body 영역에 들어갈 html 마크업 스트링
     * @private
     */
    _getTableBodyMarkup: function() {
        var hierarchyList = this._getColumnHierarchyList(),
            maxRowCount = this._getHierarchyMaxRowCount(hierarchyList);
        // 가공한 컬럼 모델 리스트 정보를 바탕으로 컬럼 엘리먼트들에 대한 마크업을 구성한다.
        var headerHeight = this.grid.dimensionModel.get('headerHeight'),
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
                var columnName = columnModel['columnName'];

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
     *
     * @param {Array} hierarchyList 헤더 마크업 생성시 사용될 계층구조 데이터
     * @return {number} 헤더 영역의 row 최대값
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
     * @return {Array}  계층구조 리스트
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
     * @return {Array} 계층구조 결과값
     * @private
     */
    _getColumnHierarchy: function(columnModel, resultList) {
        var columnMergeList = this.grid.option('columnMerge');
        resultList = resultList || [];
        /* istanbul ignore else */
        if (columnModel) {
            resultList.push(columnModel);
            /* istanbul ignore else */
            if (columnMergeList) {
                _.each(columnMergeList, function(columnMerge) {
                    if ($.inArray(columnModel['columnName'], columnMerge['columnNameList']) !== -1) {
                        resultList = this._getColumnHierarchy(columnMerge, resultList);
                    }
                }, this);
            }
        }
        return resultList;
    }
});

module.exports = Header;

},{"../../base/view":7,"../../util":19,"./resizeHandler":31}],31:[function(require,module,exports){
/**
 * @fileoverview ResizeHandler for the Header
 * @author NHN Ent. FE Development Team
 */
'use strict';

var View = require('../../base/view');

/**
 * Reside Handler class
 * @module view/layout/resizeHandler
 */
var ResizeHandler = View.extend(/**@lends module:view/layout/resizeHandler.prototype */{
    /**
     * @constructs
     * @extends module:base/view 
     * @param {Object} options - Options
     *      @param {String} [options.whichSide='R']  어느 영역의 handler 인지 여부.
     */
    initialize: function(options) {
        View.prototype.initialize.apply(this, arguments);
        this.setOwnProperties({
            whichSide: options.whichSide || 'R',
            isResizing: false,     //현재 resize 발생 상황인지
            $target: null,         //이벤트가 발생한 target resize handler
            differenceLeft: 0,
            initialWidth: 0,
            initialOffsetLeft: 0,
            initialLeft: 0
        });
        this.listenTo(this.grid.dimensionModel, 'columnWidthChanged', this._refreshHandlerPosition, this);
        if (this.grid instanceof View) {
            this.listenTo(this.grid, 'rendered', $.proxy(this._refreshHandlerPosition, this));
            this.listenTo(this.grid.dimensionModel, 'change:width', $.proxy(this._refreshHandlerPosition, this));
        }
    },

    tagName: 'div',

    className: 'resize_handle_container',

    events: {
        'mousedown .resize_handle': '_onMouseDown',
        'click .resize_handle': '_onClick'
    },

    template: _.template('' +
        '<div columnindex="<%=columnIndex%>" ' +
        'columnname="<%=columnName%>" ' +
        'class="resize_handle' +
        '<% if(isLast === true) ' +
        ' print(" resize_handle_last");%>' +
        '" ' +
        'style="<%=height%>" ' +
        'title="마우스 드래그를 통해 컬럼의 넓이를 변경할 수 있고,더블클릭을 통해 넓이를 초기화할 수 있습니다.">' +
        '</div>'),

    /**
     * columnWidthList 와 columnModelList 를 함께 반환한다.
     * @return {{widthList: (Array|*), modelList: (Array|*)}} Column Data
     * @private
     */
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
     * resize handler 마크업을 구성한다.
     * @return {String} resize handler 의 html 마크업 스트링
     * @private
     */
    _getResizeHandlerMarkup: function() {
        var columnData = this._getColumnData(),
            columnModelList = columnData.modelList,
            headerHeight = this.grid.dimensionModel.get('headerHeight'),
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
     * 랜더링 한다.
     * @return {View.Layout.Header.ResizeHandler} This object
     */
    render: function() {
        var headerHeight = this.grid.dimensionModel.get('headerHeight');
        this.$el.empty();
        this.$el
            .show()
            .css({
                'marginTop': -headerHeight + 'px',
                'height': headerHeight + 'px'
            })
            .html(this._getResizeHandlerMarkup());

        //header 가 랜더링 된 이후 widthList 를 보정 하기위해 setTimeout 을 사용한다.
        this._refreshHandlerPosition();
        return this;
    },

    /**
     * 생성된 핸들러의 위치를 설정한다.
     * @private
     */
    _refreshHandlerPosition: function() {
        var columnData = this._getColumnData(),
            columnWidthList = columnData.widthList,
            newColumnWidthList = [],
            $resizeHandleList = this.$el.find('.resize_handle'),
            $table = this.$el.parent().find('table:first'),
            isChanged = false,
            $handler,
            columnName,
            curPos = 0,
            border = 1,
            width;

        ne.util.forEachArray($resizeHandleList, function(item, index) {
            $handler = $resizeHandleList.eq(index);
            columnName = $handler.attr('columnname');
            width = $table.find('th[columnname="' + columnName + '"]').width();
            if (ne.util.isExisty(width)) {
                isChanged = isChanged || (width !== columnWidthList[index]);
            } else {
                width = columnWidthList[index];
            }
            curPos += width + border;
            $handler.css('left', (curPos - 3) + 'px');
            newColumnWidthList.push(width);
        });
    },

    /**
     * 현재 mouse move resizing 중인지 상태 flag 반환
     * @return {boolean}    현재 resize 중인지 여부
     * @private
     */
    _isResizing: function() {
        return !!this.isResizing;
    },

    /**
     * mousedown 이벤트 핸들러
     * @param {event} mouseDownEvent    마우스 이벤트 객체
     * @private
     */
    _onMouseDown: function(mouseDownEvent) {
        this._startResizing(mouseDownEvent);
    },

    /**
     * click 이벤트 핸들러
     * @param {Event} clickEvent 마우스 이벤트 객체
     * @private
     */
    _onClick: function(clickEvent) {
        var $target = $(clickEvent.target),
            index = parseInt($target.attr('columnindex'), 10),
            isClicked = $target.data('isClicked');

        if (isClicked) {
            this.grid.dimensionModel.restoreColumnWidth(this._getHandlerColumnIndex(index));
            this._clearClickedFlag($target);
            this._refreshHandlerPosition();
        } else {
            this._setClickedFlag($target);
        }
    },

    /**
     * 더블클릭을 확인하기 위한 isClicked 플래그를 설정한다.
     * @param {jQuery} $target 설정할 타겟 엘리먼트
     * @private
     */
    _setClickedFlag: function($target) {
        $target.data('isClicked', true);
        setTimeout($.proxy(this._clearClickedFlag, this, $target), 500);
    },

    /**
     * 더블클릭을 확인하기 위한 isClicked 를 제거한다.
     * @param {jQuery} $target 설정할 타겟 엘리먼트
     * @private
     */
    _clearClickedFlag: function($target) {
        $target.data('isClicked', false);
    },

    /**
     * mouseup 이벤트 핸들러
     * @private
     */
    _onMouseUp: function() {
        this._stopResizing();
    },

    /**
     * mousemove 이벤트 핸들러
     * @param {event} mouseMoveEvent    마우스 이벤트 객체
     * @private
     */
    _onMouseMove: function(mouseMoveEvent) {
        var left, width, index;

        /* istanbul ignore else */
        if (this._isResizing()) {
            mouseMoveEvent.preventDefault();

            left = mouseMoveEvent.pageX - this.initialOffsetLeft;
            width = this._calculateWidth(mouseMoveEvent.pageX);
            index = parseInt(this.$target.attr('columnindex'), 10);

            this.$target.css('left', left + 'px');
            this.grid.dimensionModel.setColumnWidth(this._getHandlerColumnIndex(index), width);
            this._refreshHandlerPosition();
        }
    },

    /**
     * 너비를 계산한다.
     * @param {number} pageX    마우스의 x 좌표
     * @return {number} x좌표를 기준으로 계산한 width 값
     * @private
     */
    _calculateWidth: function(pageX) {
        var difference = pageX - this.initialOffsetLeft - this.initialLeft;
        return this.initialWidth + difference;
    },

    /**
     * 핸들러의 index 로부터 컬럼의 index 를 반환한다.
     * @param {number} index 핸들러의 index 값
     * @return {number} 컬럼 index 값
     * @private
     */
    _getHandlerColumnIndex: function(index) {
        return this.whichSide === 'R' ? index + this.grid.columnModel.get('columnFixIndex') : index;
    },

    /**
     * resize start 세팅
     * @param {event} mouseDownEvent 마우스 이벤트
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
     * resize stop 세팅
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
     * 소멸자
     */
    destroy: function() {
        this.stopListening();
        this._stopResizing();
        this.destroyChildren();
        this.remove();
    }
});

module.exports = ResizeHandler;

},{"../../base/view":7}],32:[function(require,module,exports){
/**
 * @fileoverview 툴바영역 클래스
 * @author NHN Ent. FE Development Team
 */
'use strict';

var View = require('../../base/view');
var ControlPanel = require('./toolbar/controlPanel');
var Pagination = require('./toolbar/pagination');
var ResizeHandler = require('./toolbar/resizeHandler');

/**
 *  툴바 영역
 *  @module view/layout/toolbar
 */
var Toolbar = View.extend(/**@lends module:view/layout/toolbar.prototype */{
    /**
     * @constructs
     * @extends module:base/view
     */
    initialize: function() {
        View.prototype.initialize.apply(this, arguments);
        this.setOwnProperties({
            controlPanel: null,
            resizeHandler: null,
            pagination: null
        });
    },

    tagName: 'div',

    className: 'toolbar',

    /**
     * 랜더링한다.
     * @return {View.Layout.Toolbar} this object
     */
    render: function() {
        var option = this.grid.option('toolbar'),
            resizeHandler, controlPanel, pagination;

        this.destroyChildren();
        this.$el.empty();

        if (option && option.hasControlPanel) {
            controlPanel = this.createView(ControlPanel, {
                grid: this.grid
            });
            this.$el.append(controlPanel.render().el);
        }

        if (option && option.hasResizeHandler) {
            resizeHandler = this.createView(ResizeHandler, {
                grid: this.grid
            });
            this.$el.append(resizeHandler.render().el);
        }

        if (option && option.hasPagination) {
            pagination = this.createView(Pagination, {
                grid: this.grid
            });
            this.$el.append(pagination.render().el);
        }
        this.setOwnProperties({
            controlPanel: controlPanel,
            resizeHandler: resizeHandler,
            pagination: pagination
        });

        if (!controlPanel && !resizeHandler && !pagination) {
            this.$el.height(0);
        } else {
            this.$el.show();
        }
        return this;
    }
});

module.exports = Toolbar;

},{"../../base/view":7,"./toolbar/controlPanel":33,"./toolbar/pagination":34,"./toolbar/resizeHandler":35}],33:[function(require,module,exports){
/**
 * @fileoverview Class for the control panel in the toolbar
 * @author NHN Ent. FE Development Team
 */
'use strict';

var View = require('../../../base/view');

/**
 * Class for the control panel in the toolbar
 * @module view/layout/toolbar/controlPanel
 */
var ControlPanel = View.extend(/**@lends module:view/layout/toolbar/controlPanel.prototype */{
    /**
     * @constructs
     * @extends module:base/view
     */
    initialize: function() {
        View.prototype.initialize.apply(this, arguments);
        this.setOwnProperties({
            $btnExcel: null,
            $btnExcelAll: null
        });
    },

    events: {
        'click a.excel_download_button': '_onClickExcel'
    },

    tagName: 'div',

    className: 'btn_setup',

    templateExcelBtn: _.template(
        '<a href="#" class="excel_download_button btn_text <%=className%>">' +
        '<span><em class="excel"><%=text%></em></span>' +
        '</a>'
    ),

    /**
     * Click event handler for excel download buttons
     * @param  {MouseEvent} clickEvent - MouseEvent object
     */
    _onClickExcel: function(mouseEvent) {
        var net = this.grid.addOn.Net,
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
     * 랜더링한다.
     * @return {View.Layout.Toolbar.ControlPanel} - this object
     */
    render: function() {
        this.$btnExcelAll = $(this.templateExcelBtn({
            className: 'excel_all',
            text: '전체엑셀다운로드'
        }));
        this.$btnExcel = $(this.templateExcelBtn({
            className: 'excel_page',
            text: '엑셀 다운로드'
        }));

        this.$el.append(
            this.$btnExcelAll.hide(),
            this.$btnExcel.hide()
        );

        return this;
    }
});

module.exports = ControlPanel;

},{"../../../base/view":7}],34:[function(require,module,exports){
/**
 * @fileoverview Class for the pagination in the toolbar
 * @author NHN Ent. FE Development Team
 */
'use strict';

var View = require('../../../base/view');

/**
 * Class for the pagination in the toolbar
 * @module view/layout/toolbar/pagination
 */
var Pagination = View.extend(/**@lends module:view/layout/toolbar/pagination.prototype */{
    /**
     * @constructs
     * @extends module:base/view
     */
    initialize: function() {
        View.prototype.initialize.apply(this, arguments);
        this.setOwnProperties({
            instance: null
        });
    },

    tagName: 'div',

    className: 'grid_pagination',

    template: _.template('' +
        '<a href="#" class="pre_end">맨앞</a>' +
        '<a href="#" class="pre">이전</a> ' +
        '<a href="#" class="next">다음</a>' +
        '<a href="#" class="next_end">맨뒤</a>'
    ),

    /**
     * pagination 을 rendering 한다.
     * @return {View.Layout.Toolbar.Pagination} This object
     */
    render: function() {
        this.destroyChildren();
        this.$el.empty().html(this.template());
        this._setPaginationInstance();
        return this;
    },

    /**
     * pagination instance 를 설정한다.
     * @private
     */
    _setPaginationInstance: function() {
        var PaginationClass = ne && ne.component && ne.component.Pagination,
            pagination = this.instance;
        if (!pagination && PaginationClass) {
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

module.exports = Pagination;

},{"../../../base/view":7}],35:[function(require,module,exports){
/**
 * @fileoverview Class for the resize handler of the toolbar
 * @author NHN Ent. FE Development Team
 */
'use strict';

var View = require('../../../base/view');

/**
 * Class for the resize handler of the toolbar
 * @module view/layout/toolbar/resizeHandler
 */
var ResizeHandler = View.extend(/**@lends module:view/layout/toolbar/resizeHandler.prototype */{
    /**
     * @constructs
     * @extends module:base/view
     */
    initialize: function() {
        this.timeoutIdForResize = 0;
        View.prototype.initialize.apply(this, arguments);
    },

    tagName: 'div',

    className: 'height_resize_bar',

    template: _.template('<a href="#" class="height_resize_handle">높이 조절</a>'),

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
        this.grid.updateLayoutData();
        this._attachMouseEvent();
    },

    /**
     * mousemove 이벤트 핸들러
     * @param {event} mouseMoveEvent 마우스 이벤트
     * @private
     */
    _onMouseMove: function(mouseMoveEvent) {
        var dimensionModel = this.grid.dimensionModel,
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
     * @return {boolean} - 기본 동작 방지를 위해 무조건 false 를 반환한다.
     * @private
     */
    _onSelectStart: function(event) {
        event.preventDefault();
        return false;
    },

    /**
     * 랜더링한다.
     * @return {ResizeHandler} this object
     */
    render: function() {
        this.destroyChildren();
        this.$el.html(this.template());
        return this;
    },

    /**
     * 소멸자
     */
    destroy: function() {
        this.stopListening();
        this._onMouseUp();
        this.destroyChildren();
        this.remove();
    }
});

module.exports = ResizeHandler;

},{"../../../base/view":7}],36:[function(require,module,exports){
/**
 * @fileoverview CellPainter 의 기초 클래스
 * @author NHN Ent. FE Development Team
 */
'use strict';

var Painter = require('../../base/painter');
var util = require('../../util');

/**
 * Cell Painter Base
 * @module painter/cell
 */
var Cell = ne.util.defineClass(Painter, /**@lends module:painter/cell.prototype */{
    /**
     * @constructs
     * @extends module:painter
     */
    init: function() {
        Painter.apply(this, arguments);
        this.setOwnProperties({
            _keyDownSwitch: $.extend({}, this._defaultKeyDownSwitch)
        });
    },

    /**
     * model 의 변화가 발생했을 때, td 를 다시 rendering 해야하는 대상 프로퍼티 목록. 필요에 따라 확장 시 재정의 한다.
     */
    redrawAttributes: ['isEditable', 'optionList', 'value'],

    /**
     * keyDownEvent 발생시 기본 동작 switch
     * @private
     */
    _defaultKeyDownSwitch: {
        'ESC': function(keyDownEvent, param) {
            this.focusOut(param.$target);
        },
        'ENTER': function(keyDownEvent, param) {
            this.focusOut(param.$target);
        },
        'TAB': function(keyDownEvent, param) {
            if (keyDownEvent.shiftKey) {
                this.grid.focusIn(param.rowKey, param.focusModel.prevColumnName(), true);
            } else {
                this.grid.focusIn(param.rowKey, param.focusModel.nextColumnName(), true);
            }
        },
        'defaultAction': function() {}
    },

    /**
     * Event handlers
     */
    eventHandler: {},

    /**
     * RowPainter 에서 Render model 변경 감지 시 RowPainter 에서 호출하는 onChange 핸들러
     * @param {object} cellData Model 의 셀 데이터
     * @param {jQuery} $tr  tr 에 해당하는 jquery 로 감싼 html 엘리먼트
     */
    onModelChange: function(cellData, $tr) {
        var $td = $tr.find('td[columnname="' + cellData.columnName + '"]'),
            isRedraw = false,
            hasFocusedElement;

        ne.util.forEachArray(this.redrawAttributes, function(attribute) {
            if ($.inArray(attribute, cellData.changed) !== -1) {
                isRedraw = true;
                return false;
            }
        }, this);

        $td.attr('class', this._getClassNameList(cellData).join(' '));
        try {
            /*
             * IE 7, 8 에서 $td.find(':focus') 호출시 unexpected error 발생하는 경우가 발생하여 try/catch 함.
             */
            hasFocusedElement = !!($td.find(':focus').length);
        } catch (e) {
            hasFocusedElement = false;
        }

        if (isRedraw) {
            this.redraw(cellData, $td, hasFocusedElement);
            if (hasFocusedElement) {
                this.focusIn($td);
            }
        } else {
            this.setElementAttribute(cellData, $td, hasFocusedElement);
        }
    },

    /**
     * keyDown 이 발생했을 때, switch object 에서 필요한 공통 파라미터를 생성한다.
     * @param {Event} keyDownEvent  이벤트 객체
     * @return {{keyDownEvent: *, $target: (*|jQuery|HTMLElement), focusModel: (grid.focusModel|*), rowKey: *, columnName: *, keyName: *}}
     * _keyDownSwitch 에서 사용될 공통 파라미터 객체
     * @private
     */
    _getParamForKeyDownSwitch: function(keyDownEvent) {
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

    /**
     * keyDownSwitch 를 수행한다.
     * @param {Event} keyDownEvent 이벤트 객체
     * @return {boolean} 정의된 keyDownSwitch 가 존재하는지 여부. Default 액션을 수행한 경우 false 를 반환한다.
     * @private
     */
    _executeKeyDownSwitch: function(keyDownEvent) {
        var keyCode = keyDownEvent.keyCode || keyDownEvent.which,
            keyName = this.grid.keyName[keyCode],
            param = this._getParamForKeyDownSwitch(keyDownEvent);
        (this._keyDownSwitch[keyName] || this._keyDownSwitch['defaultAction']).call(this, keyDownEvent, param);
        return !!this._keyDownSwitch[keyName];
    },

    /**
     * keyDownSwitch 에 정의된 액션을 override 한다.
     *
     * @param {(String|Object)} keyName  정의된 key 이름. Object 형태일 경우 기존 keyDownSwitch 를 확장한다.
     * @param {function} [fn] keyDown 이 발생하였을 경우 수행할 액션
     */
    setKeyDownSwitch: function(keyName, fn) {
        if (typeof keyName === 'object') {
            this._keyDownSwitch = $.extend(this._keyDownSwitch, keyName);
        } else {
            this._keyDownSwitch[keyName] = fn;
        }
    },

    /**
     * keyDown 이벤트 핸들러
     * @param {Event} keyDownEvent  이벤트 객체
     * @private
     */
    _onKeyDown: function(keyDownEvent) {
        if (this._executeKeyDownSwitch(keyDownEvent)) {
            keyDownEvent.preventDefault();
        }
    },

    /**
     * cellData에 설정된 데이터를 기반으로 classNameList 를 생성하여 반환한다.
     * @param {Object} cellData Model 의 셀 데이터
     * @return {Array} 생성된 css 디자인 클래스 배열
     * @private
     */
    _getClassNameList: function(cellData) {
        var focused = this.grid.focusModel.which(),
            columnName = cellData.columnName,
            focusedRowKey = this.grid.dataModel.getMainRowKey(focused.rowKey, columnName),
            classNameList = [],
            classNameMap = {},
            privateColumnMap = {
                '_button': true,
                '_number': true
            },
            isPrivateColumnName = !!privateColumnMap[columnName];

        if (focusedRowKey === cellData.rowKey) {
            classNameMap['selected'] = true;
            if (focused.columnName === columnName) {
                classNameMap['focused'] = true;
            }
        }
        if (cellData.className) {
            classNameMap[cellData.className] = true;
        }

        if (cellData.isEditable && !isPrivateColumnName) {
            classNameMap['editable'] = true;
        }

        if (cellData.isDisabled) {
            classNameMap['disabled'] = true;
        }

        ne.util.forEach(classNameMap, function(val, className) {
            classNameList.push(className);
        });

        return classNameList;
    },

    /**
     * 각 셀 페인터 인스턴스마다 정의된 getContentHtml 을 이용하여
     * 컬럼모델의 defaultValue, beforeText, afterText 를 적용한 content html 마크업 스트링 을 반환한다.
     * @param {object} cellData Model 의 셀 데이터
     * @return {string} 컬럼모델의 defaultValue, beforeText, afterText 를 적용한 content html 마크업 스트링
     * @private
     */
    _getContentHtml: function(cellData) {
        var columnName = cellData.columnName,
            columnModel = this.grid.columnModel.getColumnModel(columnName),
            editOption = columnModel.editOption || {},
            defaultValue = columnModel.defaultValue,
            isExisty = ne.util.isExisty,
            beforeContent, afterContent, content;

        if (!isExisty(cellData.value)) {
            cellData.value = isExisty(defaultValue) ? defulatValue : '';
        }
        beforeContent = this._getExtraContent(editOption.beforeContent || editOption.beforeText, cellData);
        afterContent = this._getExtraContent(editOption.afterContent || editOption.afterText, cellData);

        content = beforeContent + this.getContentHtml(cellData) + afterContent;
        return content;
    },

    /**
     * beforeContent/afterContent의 내용을 반환하다.
     * 값이 function인 경우 function을 실행해 결과값을 반환한다.
     * @param {(string|function)} content - 내용
     * @param {object} cellData - 셀 데이터
     * @return {string} - 내용
     * @private
     */
    _getExtraContent: function(content, cellData) {
        var contentValue = content,
            row, cellValue;

        if (ne.util.isFunction(content)) {
            row = this.grid.dataModel.get(cellData.rowKey);
            cellValue = row.getHTMLEncodedString(cellData.columnName);
            contentValue = content(cellValue, row.attributes);
        }
        if (!ne.util.isExisty(contentValue)) {
            contentValue = '';
        }
        return contentValue;
    },

    /**
     * 주어진 문자열을 span 태그로 감싼 HTML 코드를 반환한다.
     * @param {string} content - 감싸질 문자열
     * @param {string} className - span 태그의 클래스명
     * @return {string} span 태그로 감싼 HTML 코드
     * @private
     */
    _getSpanWrapContent: function(content, className) {
        if (ne.util.isFalsy(content)) {
            content = '';
        }
        return '<span class="' + className + '">' + content + '</span>';
    },

    /**
     * Row Painter 에서 한번에 table 을 랜더링 할 때 사용하기 위해
     * td 단위의 html 문자열을 반환한다.
     * @param {object} cellData Model 의 셀 데이터
     * @return {string} td 마크업 문자열
     */
    getHtml: function(cellData) {
        var attributeString = util.getAttributesString(this.getAttributes(cellData)),
            htmlArr = [];

        htmlArr.push('<td');
        htmlArr.push(' columnName="');
        htmlArr.push(cellData.columnName);
        htmlArr.push('" ');
        htmlArr.push(cellData.rowSpan ? 'rowSpan="' + cellData.rowSpan + '"' : '');
        htmlArr.push(' class="');
        htmlArr.push(this._getClassNameList(cellData).join(' '));
        htmlArr.push('" ');
        htmlArr.push(attributeString);
        htmlArr.push(' edit-type="');
        htmlArr.push(this.getEditType());
        htmlArr.push('">');
        htmlArr.push(this._getContentHtml(cellData));
        htmlArr.push('</td>');
        return htmlArr.join('');
    },

    /**
     * 이미 rendering 되어있는 TD 엘리먼트 전체를 다시 랜더링 한다.
     * @param {object} cellData Model 의 셀 데이터
     * @param {jQuery} $td  td 에 해당하는 jquery 로 감싼 html 엘리먼트
     */
    redraw: function(cellData, $td) {
        var attributes = {
            'class': this._getClassNameList(cellData).join(' ')
        };
        if (cellData.rowSpan) {
            attributes['rowSpan'] = cellData.rowSpan;
        }
        attributes['edit-type'] = this.getEditType();
        attributes = $.extend(attributes, this.getAttributes(cellData));
        $td.attr(attributes);
        $td.html(this._getContentHtml(cellData));
    },

    /**
     * 인자로 받은 element 의 cellData 를 반환한다.
     * @param {jQuery} $target  조회할 엘리먼트
     * @return {Object} 조회한 cellData 정보
     * @private
     */
    _getCellData: function($target) {
        var cellData = this._getCellAddress($target);
        return this.grid.renderModel.getCellData(cellData.rowKey, cellData.columnName);
    },

    /**
     * 인자로 받은 element 로 부터 rowKey 와 columnName 을 반환한다.
     * @param {jQuery} $target 조회할 엘리먼트
     * @return {{rowKey: String, columnName: String}} rowKey 와 columnName 정보
     * @private
     */
    _getCellAddress: function($target) {
        return {
            rowKey: this.getRowKey($target),
            columnName: this.getColumnName($target)
        };
    },

    /**
     * cellData.columnName에 해당하는 editOption의 converter가 존재하는 경우
     * converter 함수를 적용한 결과값을 반환한다.
     * @param {string} value - 셀의 실제값
     * @param {object} cellData - 모델의 셀 데이터
     * @return {(string|null)} HTML문자열. 혹은 null
     * @private
     */
    _getConvertedHtml: function(value, cellData) {
        var columnModel = this.getColumnModel(cellData),
            editOption = columnModel.editOption,
            html;

        if (editOption && ne.util.isFunction(editOption.converter)) {
            html = editOption.converter(value, this.grid.dataModel.get(cellData.rowKey).attributes);
        }
        if (ne.util.isFalsy(html)) {
            html = null;
        }
        return html;
    },

    /**
     * 인자로 받은 element 로 부터 columnName 을 반환한다.
     * @param {jQuery} $target 조회할 엘리먼트
     * @return {string} 컬럼명
     */
    getColumnName: function($target) {
        return $target.closest('td').attr('columnName');
    },

    /**
     * 인자로 받은 element 로 부터 rowKey 를 반환한다.
     * @param {jQuery} $target 조회할 엘리먼트
     * @return {string} 행의 키값
     */
    getRowKey: function($target) {
        return $target.closest('tr').attr('key');
    },

    /**
     * columnModel 을 반환한다.
     * @param {object} cellData Model 의 셀 데이터
     * @return {*|Object} 컬럼모델
     */
    getColumnModel: function(cellData) {
        return this.grid.columnModel.getColumnModel(cellData.columnName);
    },

    /**
     * getHtml 으로 마크업 생성시 td에 포함될 attribute object 를 반환한다.
     * @param {Object} cellData Model 의 셀 데이터
     * @return {Object} td 에 지정할 attribute 데이터
     */
    getAttributes: function(cellData) {
        var columnModel = this.getColumnModel(cellData);
        return {
            align: columnModel.align || 'left'
        };
    },

    /**
     * focus in 상태에서 키보드 esc 를 입력했을 때 편집모드를 벗어난다. cell 내 input 을 blur 시키고, 편집모드를 벗어나는 로직.
     * - 필요에 따라 override 한다.
     */
    focusOut: function() {
        this.grid.focusClipboard();
    },

    /**
     * !상속받은 클래스는 이 메서드를 반드시 구현해야한다.
     * - 자기 자신의 인스턴스의 editType 을 반환한다.
     * @return {string} editType 'normal|button|select|button|text|text-password|text-convertible'
     */
    getEditType: function() {
        return 'normal';
    },

    /**
     * !상속받은 클래스는 이 메서드를 반드시 구현해야한다.
     * cell 에서 키보드 enter 를 입력했을 때 편집모드로 전환. cell 내 input 에 focus 를 수행하는 로직. 필요에 따라 override 한다.
     * @param {jQuery} $td 해당 cell 엘리먼트
     */
    focusIn: function($td) {}, // eslint-disable-line no-unused-vars

    /**
     * !상속받은 클래스는 이 메서드를 반드시 구현해야한다.
     * Cell data 를 인자로 받아 <td> 안에 들아갈 html string 을 반환한다.
     * redrawAttributes 에 해당하는 프로퍼티가 변경되었을 때 수행될 로직을 구현한다.
     * @param {object} cellData 모델의 셀 데이터
     * @return  {string} html 마크업 문자열
     * @example
     * var html = this.getContentHtml();
     * <select>
     *     <option value='1'>option1</option>
     *     <option value='2'>option1</option>
     *     <option value='3'>option1</option>
     * </select>
     */
    getContentHtml: function(cellData) { // eslint-disable-line no-unused-vars
        return '';
    },

    /**
     * !상속받은 클래스는 이 메서드를 반드시 구현해야한다.
     * model의 redrawAttributes 에 해당하지 않는 프로퍼티의 변화가 발생했을 때 수행할 메서드
     * redrawAttributes 에 해당하지 않는 프로퍼티가 변경되었을 때 수행할 로직을 구현한다.
     * @param {object} cellData 모델의 셀 데이터
     * @param {jQuery} $td 해당 cell 엘리먼트
     * @param {Boolean} hasFocusedElement 해당 셀에 실제 focuse 된 엘리먼트가 존재하는지 여부
     */
    setElementAttribute: function(cellData, $td, hasFocusedElement) {} // eslint-disable-line no-unused-vars
});

module.exports = Cell;

},{"../../base/painter":6,"../../util":19}],37:[function(require,module,exports){
/**
 * @fileoverview Painter class for the button cell
 * @author NHN Ent. FE Development Team
 */
'use strict';

var List = require('./list');
var util = require('../../../util');

/**
 * Painter class for the button cell
 * @module painter/cell/button
 */
var Button = ne.util.defineClass(List,/**@lends module:painter/cell/button.prototype */{
    /**
     * @constructs
     * @extends module:painter/cell/list
     */
    init: function() {
        List.apply(this, arguments);
        this.setKeyDownSwitch({
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
                //이후 cell 로 focus 이동
                } else if (!this._focusNextInput(param.$target)) {
                    this.grid.focusIn(param.rowKey, param.focusModel.nextColumnName(), true);
                }
            }
        });
    },

    eventHandler: {
        'change input': '_onChange',
        'keydown input': '_onKeyDown'
    },

    /**
     * 자기 자신의 인스턴스의 editType 을 반환한다.
     * @return {String} editType 'normal|button|select|button|text|text-password|text-convertible'
     */
    getEditType: function() {
        return 'button';
    },

    /**
     * cell 에서 키보드 enter 를 입력했을 때 편집모드로 전환. cell 내 input 에 focus 를 수행하는 로직. 필요에 따라 override 한다.
     * @param {jQuery} $td 해당 cell 엘리먼트
     */
    focusIn: function($td) {
        /* istanbul ignore next: focus 확인 불가 */
        if ($td.find('input').eq(0).prop('disabled')) {
            this.grid.focusClipboard();
        } else {
            $td.find('input').eq(0).focus();
        }
    },

    /**
     * Cell data 를 인자로 받아 <td> 안에 들아갈 html string 을 반환한다.
     * redrawAttributes 에 해당하는 프로퍼티가 변경되었을 때 수행될 로직을 구현한다.
     * @param {object} cellData 모델의 셀 데이터
     * @return  {string} html 마크업 문자열
     * @example
     * var html = this.getContentHtml();
     * <select>
     *     <option value='1'>option1</option>
     *     <option value='2'>option1</option>
     *     <option value='3'>option1</option>
     * </select>
     */
    getContentHtml: function(cellData) {
        var list = this.getOptionList(cellData),
            columnModel = this.grid.columnModel.getColumnModel(cellData.columnName),
            value = cellData.value,
            checkedList = ('' + value).split(','),
            checkedMap = {},
            html = this._getConvertedHtml(value, cellData),
            htmlArr = [],
            name = util.getUniqueKey(),
            isDisabled = cellData.isDisabled,
            id;

        if (ne.util.isNull(html)) {
            ne.util.forEachArray(checkedList, function(item) {
                checkedMap[item] = true;
            });

            ne.util.forEachArray(list, function(item) {
                id = name + '_' + item.value;

                htmlArr.push('<input type="');
                htmlArr.push(columnModel.editOption.type);
                htmlArr.push('" name="');
                htmlArr.push(name);
                htmlArr.push('" id="');
                htmlArr.push(id);
                htmlArr.push('" value="');
                htmlArr.push(item.value);
                htmlArr.push('" ');
                htmlArr.push(checkedMap[item.value] ? 'checked' : '');
                htmlArr.push(isDisabled ? 'disabled' : '');
                htmlArr.push('/>');

                if (item.text) {
                    htmlArr.push('<label for="');
                    htmlArr.push(id);
                    htmlArr.push('" style="margin-right:10px">');
                    htmlArr.push(item.text);
                    htmlArr.push('</label>');
                }
            }, this);
            html = htmlArr.join('');
        }
        return html;
    },

    /**
     * model의 redrawAttributes 에 해당하지 않는 프로퍼티의 변화가 발생했을 때 수행할 메서드
     * redrawAttributes 에 해당하지 않는 프로퍼티가 변경되었을 때 수행할 로직을 구현한다.
     * @param {object} cellData 모델의 셀 데이터
     * @param {jQuery} $td 해당 cell 엘리먼트
     */
    setElementAttribute: function(cellData, $td) {
        var value = cellData.value,
            checkedList = ('' + value).split(',');

        $td.find('input:checked').prop('checked', false);

        ne.util.forEachArray(checkedList, function(item) {
            $td.find('input[value="' + item + '"]').prop('checked', true);
        });
    },

    /**
     * 다음 input 에 focus 한다
     * @param {jQuery} $currentInput 현재 input jQuery 엘리먼트
     * @return {boolean} 다음 엘리먼트에 focus 되었는지 여부
     * @private
     */
    _focusNextInput: function($currentInput) {
        return this._focusTargetInput($currentInput, 'next');
    },

    /**
     * 이전 input 에 focus 한다.
     * @param {jQuery} $currentInput 현재 input jQuery 엘리먼트
     * @return {boolean} 다음 엘리먼트에 focus 되었는지 여부
     * @private
     */
    _focusPrevInput: function($currentInput) {
        return this._focusTargetInput($currentInput, 'prev');
    },

    /**
     * 이전 혹은 다음 input 에 focus 한다.
     * @param {jQuery} $currentInput 현재 input jQuery 엘리먼트
     * @param {string} direction 방향 'next|prev'
     * @return {boolean} 해당 엘리먼트에 focus 되었는지 여부
     * @private
     */
    _focusTargetInput: function($currentInput, direction) {
        var $target = $currentInput,
            result = false,
            find;

        if (direction === 'next') {
            find = function($el) {
                return $el.next();
            };
        } else if (direction === 'prev') {
            find = function($el) {
                return $el.prev();
            };
        }

        do {
            $target = find($target);
        } while ($target.length && !$target.is('input'));

        if ($target.length) {
            $target.focus();
            result = true;
        }
        return result;
    },

    /**
     * check 된 button 의 값들을 가져온다. onChange 이벤트 핸들러에서 호출한다.
     * @param {jQuery} $target 이벤트가 발생한 targetElement
     * @return {Array}  check 된 값들의 결과 배열
     * @private
     */
    _getCheckedValueList: function($target) {
        var $checkedList = $target.closest('td').find('input:checked'),
            checkedList = [];

        ne.util.forEachArray($checkedList, function($checked, index) {
            checkedList.push($checkedList.eq(index).val());
        });

        return checkedList;
    },

    /**
     * onChange 이벤트 핸들러
     * @param {Event} changeEvent 이벤트 객체
     * @private
     */
    _onChange: function(changeEvent) {
        var $target = $(changeEvent.target),
            cellAddress = this._getCellAddress($target);
        this.grid.setValue(cellAddress.rowKey, cellAddress.columnName, this._getCheckedValueList($target).join(','));
    }
});

module.exports = Button;

},{"../../../util":19,"./list":38}],38:[function(require,module,exports){
/**
 * @fileoverview 리스트 형태의 Cell Painter을 위한 Base 클래스
 * @author NHN Ent. FE Development Team
 */
'use strict';

var Cell = require('../cell');

/**
 * editOption 에 list 를 가지고 있는 형태의 Base 클래스
 * @module painter/cell/list
 */
var List = ne.util.defineClass(Cell,/**@lends module:painter/cell/list.prototype */{
    /**
     * @constructs
     * @extends module:painter/cell
     */
    init: function() {
        Cell.apply(this, arguments);
    },

    redrawAttributes: ['isDisabled', 'isEditable', 'optionList'],

    eventHandler: {},

    /* eslint-disable */
    /**
     * 자기 자신의 인스턴스의 editType 을 반환한다.
     * @return {String} editType 'normal|button|select|button|text|text-password|text-convertible'
     */
    getEditType: function() {},

    /**
     * cell 에서 키보드 enter 를 입력했을 때 편집모드로 전환. cell 내 input 에 focus 를 수행하는 로직. 필요에 따라 override 한다.
     * @param {jQuery} $td 해당 cell 엘리먼트
     */
    focusIn: function($td) {}, // eslint-disable-line no-unused-vars

    /**
     * Cell data 를 인자로 받아 <td> 안에 들아갈 html string 을 반환한다.
     * redrawAttributes 에 해당하는 프로퍼티가 변경되었을 때 수행될 로직을 구현한다.
     * @param {object} cellData 모델의 셀 데이터
     * @return  {string} html 마크업 문자열
     * @example
     * var html = this.getContentHtml();
     * <select>
     *     <option value='1'>option1</option>
     *     <option value='2'>option1</option>
     *     <option value='3'>option1</option>
     * </select>
     */
    getContentHtml: function(cellData) { // eslint-disable-line no-unused-vars
        throw this.error('Implement getContentHtml(cellData, $target) method. On re-rendering');
    },

    /**
     * model의 redrawAttributes 에 해당하지 않는 프로퍼티의 변화가 발생했을 때 수행할 메서드
     * redrawAttributes 에 해당하지 않는 프로퍼티가 변경되었을 때 수행할 로직을 구현한다.
     * @param {object} cellData 모델의 셀 데이터
     * @param {jQuery} $td 해당 cell 엘리먼트
     * @param {boolean} hasFocusedElement 해당 셀에 실제 focus 된 엘리먼트가 존재하는지 여부
     */
    setElementAttribute: function(cellData, $td, hasFocusedElement) { // eslint-disable-line no-unused-vars
        throw this.error('Implement setElementAttribute(cellData, $target) method. ');
    },
    /* eslint-enable */

    /**
     * List Type 의 option list 를 반환하는 메서드
     *
     * cellData 의 optionsList 가 존재한다면 cellData 의 옵션 List 를 반환하고,
     * 그렇지 않다면 columnModel 의 optionList 를 반환한다.
     * @param {Object} cellData 모델의 셀 데이터
     * @return {Array} 옵션 리스트
     */
    getOptionList: function(cellData) {
        var columnModel = this.grid.columnModel.getColumnModel(cellData.columnName);
        return cellData.optionList && cellData.optionList.length ? cellData.optionList : columnModel.editOption.list;
    }
});

module.exports = List;

},{"../cell":36}],39:[function(require,module,exports){
/**
 * @fileoverview Painter class for the main button
 * @author NHN Ent. FE Development Team
 */
'use strict';

var Cell = require('../cell');

/**
 * Painter class for the main button
 * @module painter/cell/mainButton
 */
var MainButton = ne.util.defineClass(Cell,/**@lends module:painter/cell/mainButton.prototype */{
    /**
     * @constructs
     * @extends module:painter/cell
     */
    init: function() {
        Cell.apply(this, arguments);
        this.setKeyDownSwitch({
            'UP_ARROW': function() {},
            'DOWN_ARROW': function() {},
            'ENTER': function(keyDownEvent, param) {
                this.focusOut(param.$target);
            },
            'LEFT_ARROW': function() {},
            'RIGHT_ARROW': function() {},
            'ESC': function() {}
        });
    },

    /**
     * rendering 해야하는 cellData 의 변경 목록
     */
    redrawAttributes: ['isDisabled', 'isEditable', 'optionList'],

    eventHandler: {
        'mousedown': '_onMouseDown',
        'change input': '_onChange',
        'keydown input': '_onKeyDown'
    },

    /**
     * 자기 자신의 인스턴스의 editType 을 반환한다.
     * @return {string} editType 'normal|button|select|button|text|text-password|text-convertible'
     */
    getEditType: function() {
        return '_button';
    },

    /**
     * Cell data 를 인자로 받아 <td> 안에 들아갈 html string 을 반환한다.
     * redrawAttributes 에 해당하는 프로퍼티가 변경되었을 때 수행될 로직을 구현한다.
     * @param {object} cellData 모델의 셀 데이터
     * @return  {string} html 마크업 문자열
     * @example
     * var html = this.getContentHtml();
     * <select>
     *     <option value='1'>option1</option>
     *     <option value='2'>option1</option>
     *     <option value='3'>option1</option>
     * </select>
     */
    getContentHtml: function(cellData) {
        var isDisabled = cellData.isDisabled,
            htmlArr = [];
        htmlArr.push('<input type="');
        htmlArr.push(this.grid.option('selectType'));
        htmlArr.push('" name="');
        htmlArr.push(this.grid.id);
        htmlArr.push('" ');
        htmlArr.push(cellData.value ? 'checked' : '');
        htmlArr.push(isDisabled ? 'disabled' : '');
        htmlArr.push('/>');
        return htmlArr.join('');
    },

    /**
     * cell 에서 키보드 enter 를 입력했을 때 편집모드로 전환. cell 내 input 에 focus 를 수행하는 로직. 필요에 따라 override 한다.
     * @param {jQuery} $td 해당 cell 엘리먼트
     */
    /* istanbul ignore next */
    focusIn: function() {
        //아무것도 안하도록 변경
    },

    /**
     * model의 redrawAttributes 에 해당하지 않는 프로퍼티의 변화가 발생했을 때 수행할 메서드
     * redrawAttributes 에 해당하지 않는 프로퍼티가 변경되었을 때 수행할 로직을 구현한다.
     * @param {object} cellData 모델의 셀 데이터
     * @param {jQuery} $td 해당 cell 엘리먼트
     */
    setElementAttribute: function(cellData, $td) {
        var $input = $td.find('input'),
            isChecked = $input.prop('checked');
        if (isChecked !== !!cellData.value) {
            $input.prop('checked', cellData.value);
        }
    },

    /**
     * checked 를 toggle 한다.
     * @param {jQuery} $td 해당 cell 엘리먼트
     */
    toggle: function($td) {
        var $input = $td.find('input');
        if (this.grid.option('selectType') === 'checkbox') {
            $input.prop('checked', !$input.prop('checked'));
        }
    },

    /**
     * getHtml 으로 마크업 생성시 td에 포함될 attribute object 를 반환한다.
     * @return {Object} td 에 지정할 attribute 데이터
     */
    getAttributes: function() {
        return {
            align: 'center'
        };
    },

    /**
     * onChange 이벤트 핸들러
     * @param {Event} changeEvent 이벤트 객체
     * @private
     */
    _onChange: function(changeEvent) {
        var $target = $(changeEvent.target),
            rowKey = this.getRowKey($target);
        this.grid.setValue(rowKey, '_button', $target.prop('checked'));
    },

    /**
     * TD 전체 mousedown 이벤트 발생시 checkbox 클릭 이벤트를 발생시킨다.
     * @param {Event} mouseDownEvent 이벤트 객체
     * @private
     */
    _onMouseDown: function(mouseDownEvent) {
        var $target = $(mouseDownEvent.target);
        if (!$target.is('input')) {
            $target.find('input').trigger('click');
        }
    }
});

module.exports = MainButton;

},{"../cell":36}],40:[function(require,module,exports){
/**
 * @fileoverview 기본 Cell (일반, 숫자, 메인 Checkbox) 관련 Painter 정의
 * @author NHN Ent. FE Development Team
 */
'use strict';

var Cell = require('../cell');

/**
 * editOption 이 적용되지 않은 cell 의 Painter
 * @module painter/cell/normal
 */
var Normal = ne.util.defineClass(Cell,/**@lends module:painter/cell/normal.prototype */{
    /**
     * @constructs
     * @extends module:painter/cell
     */
    init: function() {
        Cell.apply(this, arguments);
    },

    /**
     * 자기 자신의 인스턴스의 editType 을 반환한다.
     * @return {string} editType 'normal|select|button|text|text-convertible'
     */
    getEditType: function() {
        return 'normal';
    },

    /**
     * Cell data 를 인자로 받아 <td> 안에 들아갈 html string 을 반환한다.
     * redrawAttributes 에 해당하는 프로퍼티가 변경되었을 때 수행될 로직을 구현한다.
     * @param {object} cellData 모델의 셀 데이터
     * @return  {string} html 마크업 문자열
     * @example
     * var html = this.getContentHtml();
     * <select>
     *     <option value='1'>option1</option>
     *     <option value='2'>option1</option>
     *     <option value='3'>option1</option>
     * </select>
     */
    getContentHtml: function(cellData) {
        var columnName = cellData.columnName,
            columnModel = this.grid.columnModel.getColumnModel(columnName),
            value = this.grid.dataModel.get(cellData.rowKey).getHTMLEncodedString(columnName),
            rowKey = cellData.rowKey;
        if (ne.util.isFunction(columnModel.formatter)) {
            value = columnModel.formatter(value, this.grid.dataModel.get(rowKey).attributes, columnModel);
        }
        if (!ne.util.isExisty(value)) {
            value = '';
        }
        return value;
    },

    /**
     * cell 에서 키보드 enter 를 입력했을 때 편집모드로 전환. cell 내 input 에 focus 를 수행하는 로직. 필요에 따라 override 한다.
     */
    focusIn: function() {
        this.grid.focusClipboard();
    },

    /**
     * model의 redrawAttributes 에 해당하지 않는 프로퍼티의 변화가 발생했을 때 수행할 메서드
     * redrawAttributes 에 해당하지 않는 프로퍼티가 변경되었을 때 수행할 로직을 구현한다.
     * @param {object} cellData 모델의 셀 데이터
     * @param {jQuery} $td 해당 cell 엘리먼트
     * @param {Boolean} hasFocusedElement 해당 셀에 실제 focus 된 엘리먼트가 존재하는지 여부
     */
    /* istanbul ignore next */
    setElementAttribute: function(cellData, $td, hasFocusedElement) {} // eslint-disable-line
});

module.exports = Normal;

},{"../cell":36}],41:[function(require,module,exports){
/**
 * @fileoverview Painter class for the number cell
 * @author NHN Ent. FE Development Team
 */
'use strict';

var Normal = require('./normal');

/**
 * Number Cell 의 Painter
 * @module painter/cell/number
 */
var NumberCell = ne.util.defineClass(Normal,/**@lends module:painter/cell/number.prototype */{
    /**
     * @constructs
     * @extends module:painter/cell/normal
     */
    init: function() {
        Normal.apply(this, arguments);
    },

    redrawAttributes: [],

    /**
     * 자기 자신의 인스턴스의 editType 을 반환한다.
     * @return {string} editType 'normal|button|select|button|text|text-password|text-convertible'
     */
    getEditType: function() {
        return '_number';
    },

    /**
     * Cell data 를 인자로 받아 <td> 안에 들아갈 html string 을 반환한다.
     * redrawAttributes 에 해당하는 프로퍼티가 변경되었을 때 수행될 로직을 구현한다.
     * @param {object} cellData 모델의 셀 데이터
     * @return  {string} html 마크업 문자열
     * @example
     * var html = this.getContentHtml();
     * <select>
     *     <option value='1'>option1</option>
     *     <option value='2'>option1</option>
     *     <option value='3'>option1</option>
     * </select>
     */
    getContentHtml: function(cellData) {
        return cellData.value;
    }
});

module.exports = NumberCell;

},{"./normal":40}],42:[function(require,module,exports){
/**
 * @fileoverview Painter class for the select cell
 * @author NHN Ent. FE Development Team
 */
'use strict';

var List = require('./list');
var util = require('../../../util');

/**
 * Painter class for the select cell
 * @module view/painter/cell/select
 */
var Select = ne.util.defineClass(List,/**@lends module:view/painter/cell/select.prototype */{
    /**
     * @constructs
     * @extends module:view/painter/cell/list 
     */
    init: function() {
        List.apply(this, arguments);

        this.setKeyDownSwitch({
            'ESC': function(keyDownEvent, param) {
                this.focusOut(param.$target);
            },
            'ENTER': function(keyDownEvent, param) {
                this.focusOut(param.$target);
            }
        });
    },

    eventHandler: {
        'change select': '_onChange',
        'keydown select': '_onKeyDown'
    },

    /**
     * 자기 자신의 인스턴스의 editType 을 반환한다.
     * @return {String} editType 'normal|button|select|button|text|text-password|text-convertible'
     */
    getEditType: function() {
        return 'select';
    },

    /**
     * cell 에서 키보드 enter 를 입력했을 때 편집모드로 전환. cell 내 input 에 focus 를 수행하는 로직. 필요에 따라 override 한다.
     * @param {jQuery} $td 해당 cell 엘리먼트
     */
    focusIn: function($td) {
        /* istanbul ignore next */
        if ($td.find('select').prop('disabled')) {
            this.grid.focusClipboard();
        } else {
            $td.find('select').eq(0).focus();
        }
    },

    /**
     * Cell data 를 인자로 받아 <td> 안에 들아갈 html string 을 반환한다.
     * redrawAttributes 에 해당하는 프로퍼티가 변경되었을 때 수행될 로직을 구현한다.
     * @param {object} cellData 모델의 셀 데이터
     * @return  {string} html 마크업 문자열
     * @example
     * var html = this.getContentHtml();
     * <select>
     *     <option value='1'>option1</option>
     *     <option value='2'>option1</option>
     *     <option value='3'>option1</option>
     * </select>
     */
    getContentHtml: function(cellData) {
        var list = this.getOptionList(cellData),
            isDisabled = cellData.isDisabled,
            htmlArr = [],
            html = this._getConvertedHtml(cellData.value, cellData);

        if (ne.util.isNull(html)) {
            htmlArr.push('<select name="' + util.getUniqueKey() + '"');
            htmlArr.push(isDisabled ? ' disabled ' : '');
            htmlArr.push('>');

            ne.util.forEachArray(list, function(item) {
                htmlArr.push('<option ');
                htmlArr.push('value="' + item.value + '"');
                //option의 value 는 문자열 형태인데, cellData 의 변수 type과 관계없이 비교하기 위해 == 연산자를 사용함
                if (cellData.value == item.value) { // eslint-disable-line eqeqeq
                    htmlArr.push(' selected');
                }
                htmlArr.push(' >');
                htmlArr.push(item.text);
                htmlArr.push('</option>');
            });
            htmlArr.push('</select>');
            html = htmlArr.join('');
        }
        return html;
    },

    /**
     * 각 셀 페인터 인스턴스마다 정의된 getContentHtml 을 이용하여
     * 컬럼모델의 defaultValue, beforeText, afterText 를 적용한 content html 마크업 스트링 을 반환한다.
     * (Input의 width를 beforeText와 afterText의 유무에 관계없이 100%로 유지하기 위해 마크업이 달라져야 하기 때문에
     * View.Base.Painter.Cell로부터 override 해서 구현함)
     * @param {object} cellData Model 의 셀 데이터
     * @return {string} 컬럼모델의 defaultValue, beforeText, afterText 를 적용한 content html 마크업 스트링
     * @private
     * @override
     */
    _getContentHtml: function(cellData) {
        var columnName = cellData.columnName,
            columnModel = this.grid.columnModel.getColumnModel(columnName),
            editOption = columnModel.editOption || {},
            content = '',
            beforeContent, afterContent;

        if (!ne.util.isExisty(cellData.value)) {
            cellData.value = columnModel.defaultValue;
        }
        beforeContent = this._getExtraContent(editOption.beforeContent || editOption.beforeText, cellData);
        afterContent = this._getExtraContent(editOption.afterContent || editOption.afterText, cellData);

        if (beforeContent) {
            content += this._getSpanWrapContent(beforeContent, 'before', cellData);
        }
        if (afterContent) {
            content += this._getSpanWrapContent(afterContent, 'after', cellData);
        }
        content += this._getSpanWrapContent(this.getContentHtml(cellData), 'input');

        return content;
    },

    /**
     * model의 redrawAttributes 에 해당하지 않는 프로퍼티의 변화가 발생했을 때 수행할 메서드
     * redrawAttributes 에 해당하지 않는 프로퍼티가 변경되었을 때 수행할 로직을 구현한다.
     * @param {object} cellData 모델의 셀 데이터
     * @param {jquery} $td 해당 cell 엘리먼트
     * @param {Boolean} hasFocusedElement 해당 셀에 실제 focus 된 엘리먼트가 존재하는지 여부
     */
    setElementAttribute: function(cellData, $td, hasFocusedElement) {
        var $select = $td.find('select');
        /*
        키보드 상하로 조작시 onChange 콜백에서 false 리턴시 이전 값으로
        돌아가지 않는 현상때문에 blur focus 를 수행한다.
         */

        /* istanbul ignore next: blur 확인 불가 */
        if (hasFocusedElement) {
            $select.blur();
        }
        $select.val(cellData.value);

        /* istanbul ignore next: focus 확인 불가 */
        if (hasFocusedElement) {
            $select.focus();
        }
    },

    /**
     * change 이벤트 핸들러
     * @param {Event} changeEvent   이벤트 객체
     * @private
     */
    _onChange: function(changeEvent) {
        var $target = $(changeEvent.target),
            cellAddr = this._getCellAddress($target),
            grid = this.grid;
        grid.setValue(cellAddr.rowKey, cellAddr.columnName, $target.val());
    }
});

module.exports = Select;

},{"../../../util":19,"./list":38}],43:[function(require,module,exports){
/**
 * @fileoverview Painter class for the text-convertible cell
 * @author NHN Ent. FE Development Team
 */
'use strict';

var Cell = require('../cell');
var Text = require('./text');
var util = require('../../../util');

/**
 * input 이 존재하지 않는 text 셀에서 편집시 input 이 존재하는 셀로 변환이 가능한 cell renderer
 * @module view/painter/cell/text-convertible
 */
var Convertible = ne.util.defineClass(Text,/**@lends module:view/painter/cell/text-convertible.prototype */{
    /**
     * @constructs
     * @extends module:view/painter/cell/text 
     */
    init: function() {
        Text.apply(this, arguments);
        this.setOwnProperties({
            timeoutIdForClick: 0,
            editingCell: {
                rowKey: null,
                columnName: ''
            },
            clicked: {
                rowKey: null,
                columnName: null
            }
        });
    },

    redrawAttributes: ['isDisabled', 'isEditable', 'value'],

    eventHandler: {
        'dblclick': '_onDblClick',
        'mousedown': '_onMouseDown',
        'blur input': '_onBlurConvertible',
        'keydown input': '_onKeyDown',
        'focus input': '_onFocus',
        'selectstart input': '_onSelectStart'
    },

    /**
     * 자기 자신의 인스턴스의 editType 을 반환한다.
     * @return {String} editType 'normal|button|select|button|text|text-password|text-convertible'
     */
    getEditType: function() {
        return 'text-convertible';
    },

    /**
     * cell 에서 키보드 enter 를 입력했을 때 편집모드로 전환. cell 내 input 에 focus 를 수행하는 로직. 필요에 따라 override 한다.
     * @param {jQuery} $td 해당 cell 엘리먼트
     */
    focusIn: function($td) {
        this._startEdit($td);
    },

    /**
     * focus in 상태에서 키보드 esc 를 입력했을 때 편집모드를 벗어난다. cell 내 input 을 blur 시키고, 편집모드를 벗어나는 로직.
     * - 필요에 따라 override 한다.
     */
    focusOut: function() {
        this.grid.focusClipboard();
    },

    /**
     * Cell data 를 인자로 받아 <td> 안에 들아갈 html string 을 반환한다.
     * redrawAttributes 에 해당하는 프로퍼티가 변경되었을 때 수행될 로직을 구현한다.
     * @param {object} cellData 모델의 셀 데이터
     * @return  {string} html 마크업 문자열
     * @example
     * var html = this.getContentHtml();
     * <select>
     *     <option value='1'>option1</option>
     *     <option value='2'>option1</option>
     *     <option value='3'>option1</option>
     * </select>
     */
    getContentHtml: function(cellData) {
        // FIXME: defaultValue 옵션값 처리 (cellData.value 를 참조하도록)
        // TODO: html template 형태로 변경
        var columnModel = this.getColumnModel(cellData),
            value = this.grid.dataModel.get(cellData.rowKey).getHTMLEncodedString(cellData.columnName),
            htmlArr = [];

        if (ne.util.isUndefined(value)) {
            value = '';
        }

        if (!this._isEditingCell(cellData)) {
            if (ne.util.isFunction(columnModel.formatter)) {
                value = columnModel.formatter(value, this.grid.dataModel.get(cellData.rowKey).attributes, columnModel);
            }
            return value;
        }
        htmlArr.push('<span class="input">');
        htmlArr.push('<input type="');
        htmlArr.push(this._getInputType());
        htmlArr.push('" value="');
        htmlArr.push(value);
        htmlArr.push('" name="');
        htmlArr.push(util.getUniqueKey());
        htmlArr.push('" align="center" ');
        htmlArr.push(cellData.isDisabled ? 'disabled' : '');
        htmlArr.push(' maxLength="');
        htmlArr.push(columnModel.editOption.maxLength);
        htmlArr.push('"/>');
        htmlArr.push('</span>');

        return htmlArr.join('');
    },

    /**
     * 각 셀 페인터 인스턴스마다 정의된 getContentHtml 을 이용하여
     * 컬럼모델의 defaultValue, beforeText, afterText 를 적용한 content html 마크업 스트링 을 반환한다.
     * (상태에 따라 Text나 Base의 함수를 선택해서 사용해야 하기 때문에, 추가로 override 해서 prototype을 이용해 실행)
     * @param {object} cellData Model의 셀 데이터
     * @return {string} 컬럼모델의 defaultValue, beforeText, afterText 를 적용한 content html 마크업 스트링
     * @private
     * @override
     */
    _getContentHtml: function(cellData) {
        var targetProto;

        if (this._isEditingCell(cellData)) {
            targetProto = Text.prototype;
        } else {
            targetProto = Cell.prototype;
        }

        return targetProto._getContentHtml.call(this, cellData);
    },

    /**
     * 현재 편집중인 셀인지 여부를 반환한다.
     * @param {object} cellData Model의 셀 데이터
     * @return {boolean} - 편집중이면 true, 아니면 false
     * @private
     */
    _isEditingCell: function(cellData) {
        var editingCell = this.editingCell;
        return !!(editingCell.rowKey === cellData.rowKey.toString() && editingCell.columnName === cellData.columnName.toString());
    },

    /**
     * model의 redrawAttributes 에 해당하지 않는 프로퍼티의 변화가 발생했을 때 수행할 메서드
     * redrawAttributes 에 해당하지 않는 프로퍼티가 변경되었을 때 수행할 로직을 구현한다.
     * @param {object} cellData 모델의 셀 데이터
     * @param {jquery} $td 해당 cell 엘리먼트
     * @param {Boolean} hasFocusedElement 해당 셀에 실제 focus 된 엘리먼트가 존재하는지 여부
     */
    setElementAttribute: function(cellData, $td, hasFocusedElement) {}, // eslint-disable-line no-unused-vars

    /**
     * blur 이벤트 핸들러
     * @param {event} blurEvent 이벤트 객체
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
     * @param {jQuery} $td 해당 cell 엘리먼트
     * @private
     */
    _startEdit: function($td) {
        var $input, rowKey, columnName, cellState;

        this._blurEditingCell();

        rowKey = this.getRowKey($td);
        columnName = this.getColumnName($td);
        cellState = this.grid.dataModel.get(rowKey).getCellState(columnName);

        if (cellState.isEditable && !cellState.isDisabled) {
            this.editingCell = {
                rowKey: rowKey,
                columnName: columnName
            };

            this.redraw(this._getCellData($td), $td);
            $input = $td.find('input');
            this.originalText = $input.val();
            util.form.setCursorToEnd($input.get(0));
            $input.select();
        }
    },

    /**
     * textbox를  text로 교체한다.
     * @param {jQuery} $td 해당 cell 엘리먼트
     * @private
     */
    _endEdit: function($td) {
        var cellData = this._getCellData($td);
        this.editingCell = {
            rowKey: null,
            columnName: null
        };
        this.clicked = {
            rowKey: null,
            columnName: null
        };
        if (cellData) {
            this.redraw(cellData, $td);
        }
    },

    /**
     * Trigger blur event on editing cell if exist
     * @private
     */
    _blurEditingCell: function() {
        var rowKey = this.editingCell.rowKey,
            columnName = this.editingCell.columnName,
            $td;

        if (!ne.util.isNull(rowKey) && !ne.util.isNull(columnName)) {
            $td = this.grid.getElement(rowKey, columnName);
            $td.find('input')[0].blur();
        }
    },

    /**
     * Event Handler for double click event.
     * @param  {MouseEvent} mouseEvent - MouseEvent object
     */
    _onDblClick: function(mouseEvent) {
        var $target = $(mouseEvent.target),
            $td = $target.closest('td'),
            address = this._getCellAddress($td);

        if (!this._isEditingCell(address)) {
            this._startEdit($td);
        }
    },

    /**
     * mousedown 이벤트 핸들러.
     * Core의 onMouseDown에서 focusClipboard를 호출하여 input에서 의도하지 않은 blur 이벤트가 발생하는 것을
     * 방지하기 위해 이벤트 버블링을 멈춘다.
     * @param {MouseEvent} event 마우스 이벤트 객체
     * @private
     */
    _onMouseDown: function(event) {
        if ($(event.target).is('input')) {
            event.stopPropagation();
        }
    }
});

module.exports = Convertible;

},{"../../../util":19,"../cell":36,"./text":45}],44:[function(require,module,exports){
/**
 * @fileoverview Password 타입의 Input을 가진 Cell Painter
 * @author NHN Ent. FE Development Team
 * @module view/painter/cell/text-password
 */
'use strict';

var Text = require('./text');

/**
 * Password 타입의 cell renderer
 * @extends module:view/painter/cell/text
 * @constructor module:view/painter/cell/text-password
 */
var Password = ne.util.defineClass(Text,/**@lends module:view/painter/cell/text-password.prototype */{
    /**
     * Initializes
     * @param {object} attributes Attributes
     * @param {object} options Options
     */
    init: function(attributes, options) { // eslint-disable-line
        Text.apply(this, arguments);
    },

    /**
     * input type 을 반환한다.
     * @return {string} input 타입
     * @private
     */
    _getInputType: function() {
        return 'password';
    },

    /**
     * 자기 자신의 인스턴스의 editType 을 반환한다.
     * @return {String} editType 'normal|button|select|button|text|text-password|text-convertible'
     */
    getEditType: function() {
        return 'text-password';
    }
});

module.exports = Password;

},{"./text":45}],45:[function(require,module,exports){
/**
 * @fileoverview Painter class for the text cell
 * @author NHN Ent. FE Development Team
 */
'use strict';

var Cell = require('../cell');
var util = require('../../../util');

/**
 * Painter class for the text cell
 * @module painter/cell/text
 */
var Text = ne.util.defineClass(Cell,/**@lends module:painter/cell/text.prototype */{
    /**
     * @constructs
     * @extends module:painter/cell
     * @param {object} attributes Attributes
     * @param {object} options Options
     */
    init: function(attributes, options) { // eslint-disable-line
        Cell.apply(this, arguments);
        this.setOwnProperties({
            originalText: ''
        });

        this.setKeyDownSwitch({
            'UP_ARROW': function() {},
            'DOWN_ARROW': function() {},
            'PAGE_UP': function() {},
            'PAGE_DOWN': function() {},
            'ENTER': function(keyDownEvent, param) {
                this.focusOut(param.$target.closest('td'));
            },
            'ESC': function(keyDownEvent, param) {
                this._restore(param.$target);
                this.focusOut(param.$target.closest('td'));
            }
        });
    },

    redrawAttributes: ['isEditable'],

    eventHandler: {
        'blur input': '_onBlur',
        'keydown input': '_onKeyDown',
        'focus input': '_onFocus',
        'selectstart input': '_onSelectStart'
    },

    template: _.template('<input type="<%=type%>" value="<%=value%>" name="<%=name%>" align="center" <%=disabled%> maxLength="<%=maxLength%>"/>'),

    /**
     * input type 을 반환한다.
     * @return {string} input 타입
     * @private
     */
    _getInputType: function() {
        return 'text';
    },

    /**
     * 자기 자신의 인스턴스의 editType 을 반환한다.
     * @return {String} editType 'normal|button|select|button|text|text-password|text-convertible'
     */
    getEditType: function() {
        return 'text';
    },

    /**
     * cell 에서 키보드 enter 를 입력했을 때 편집모드로 전환. cell 내 input 에 focus 를 수행하는 로직. 필요에 따라 override 한다.
     * @param {jQuery} $td 해당 cell 엘리먼트
     */
    /* istanbul ignore next: focus, select 를 검증할 수 없음 */
    focusIn: function($td) {
        var $input = $td.find('input');
        if ($input.prop('disabled')) {
            this.grid.focusClipboard();
        } else {
            util.form.setCursorToEnd($input.get(0));
            $input.select();
        }
    },

    /**
     * focus in 상태에서 키보드 esc 를 입력했을 때 편집모드를 벗어난다. cell 내 input 을 blur 시키고, 편집모드를 벗어나는 로직.
     * - 필요에 따라 override 한다.
     */
    focusOut: function() {
        this.grid.focusClipboard();
    },

    /**
     * Cell data 를 인자로 받아 <td> 안에 들아갈 html string 을 반환한다.
     * redrawAttributes 에 해당하는 프로퍼티가 변경되었을 때 수행될 로직을 구현한다.
     * @param {object} cellData 모델의 셀 데이터
     * @return  {string} html 마크업 문자열
     * @example
     * var html = this.getContentHtml();
     * <select>
     *     <option value='1'>option1</option>
     *     <option value='2'>option1</option>
     *     <option value='3'>option1</option>
     * </select>
     */
    getContentHtml: function(cellData) {
        //@fixme: defaultValue 옵션값 처리 (cellData.value 를 참조하도록)
        var columnModel = this.getColumnModel(cellData),
            editOption = columnModel.editOption,
            value = this.grid.dataModel.get(cellData.rowKey).getHTMLEncodedString(cellData.columnName),
            html;

        if (ne.util.isUndefined(value)) {
            value = '';
        }
        html = this._getConvertedHtml(value, cellData);

        if (ne.util.isNull(html)) {
            html = this.template({
                type: this._getInputType(),
                value: value,
                name: util.getUniqueKey(),
                disabled: cellData.isDisabled ? 'disabled' : '',
                maxLength: editOption.maxLength || ''
            });
        }
        return html;
    },

    /**
     * model의 redrawAttributes 에 해당하지 않는 프로퍼티의 변화가 발생했을 때 수행할 메서드
     * redrawAttributes 에 해당하지 않는 프로퍼티가 변경되었을 때 수행할 로직을 구현한다.
     * @param {object} cellData 모델의 셀 데이터
     * @param {jQuery} $td 해당 cell 엘리먼트
     */
    setElementAttribute: function(cellData, $td) {
        var isValueChanged = $.inArray('value', cellData.changed) !== -1,
            $input = $td.find('input');

        if (isValueChanged) {
            $input.val(cellData.value);
        }
        $input.prop('disabled', cellData.isDisabled);
    },

    /**
     * 원래 text 와 비교하여 값이 변경 되었는지 여부를 판단한다.
     * @param {jQuery} $input   인풋 jquery 엘리먼트
     * @return {Boolean}    값의 변경여부
     * @private
     */
    _isEdited: function($input) {
        return $input.val() !== this.originalText;
    },

    /**
     * 원래 text로 값을 되돌린다.
     * @param {jQuery} $input 인풋 jquery 엘리먼트
     * @private
     */
    _restore: function($input) {
        $input.val(this.originalText);
    },

    /**
     * 각 셀 페인터 인스턴스마다 정의된 getContentHtml 을 이용하여
     * 컬럼모델의 defaultValue, beforeText, afterText 를 적용한 content html 마크업 스트링 을 반환한다.
     * (Input의 width를 beforeText와 afterText의 유무에 관계없이 100%로 유지하기 위해 마크업이 달라져야 하기 때문에
     * Painter.Cell로부터 override 해서 구현함)
     * @param {object} cellData Model 의 셀 데이터
     * @return {string} 컬럼모델의 defaultValue, beforeText, afterText 를 적용한 content html 마크업 스트링
     * @private
     * @override
     */
    _getContentHtml: function(cellData) {
        var columnName = cellData.columnName,
            columnModel = this.grid.columnModel.getColumnModel(columnName),
            editOption = columnModel.editOption || {},
            content = '',
            beforeContent, afterContent;

        if (!ne.util.isExisty(cellData.value)) {
            cellData.value = columnModel.defaultValue;
        }
        beforeContent = this._getExtraContent(editOption.beforeContent || editOption.beforeText, cellData);
        afterContent = this._getExtraContent(editOption.afterContent || editOption.afterText, cellData);

        if (beforeContent) {
            content += this._getSpanWrapContent(beforeContent, 'before', cellData);
        }
        if (afterContent) {
            content += this._getSpanWrapContent(afterContent, 'after', cellData);
        }
        content += this._getSpanWrapContent(this.getContentHtml(cellData), 'input');

        return content;
    },

    /**
     * blur 이벤트 핸들러
     * @param {Event} blurEvent 이벤트 객체
     * @private
     */
    _onBlur: function(blurEvent) {
        var $target = $(blurEvent.target),
            rowKey = this.getRowKey($target),
            columnName = this.getColumnName($target);

        this._executeInputEventHandler(blurEvent, 'blur');
        if (this._isEdited($target)) {
            this.grid.setValue(rowKey, columnName, $target.val());
        }
        this.grid.selection.enable();
    },

    /**
     * focus 이벤트 핸들러
     * @param {Event} focusEvent 이벤트 객체
     * @private
     */
    _onFocus: function(focusEvent) {
        var $input = $(focusEvent.target);

        this.originalText = $input.val();
        this._executeInputEventHandler(focusEvent, 'focus');
        this.grid.selection.disable();
    },

    /**
     * keydown 이벤트 핸들러
     * @param  {KeyboardEvent} keyboardEvent 키보드 이벤트 객체
     * @private
     */
    _onKeyDown: function(keyboardEvent) {
        this._executeInputEventHandler(keyboardEvent, 'keydown');
        Cell.prototype._onKeyDown.call(this, keyboardEvent);
    },

    /**
     * 해당 input 요소가 포함된 셀을 찾아 rowKey와 columnName을 객체로 반환한다.
     * @param  {jQuery} $input - 인풋 요소의 jquery 객체
     * @return {{rowKey: number, columnName: number}} 셀의 rowKey, columnName 정보
     * @private
     */
    _getCellInfoFromInput: function($input) {
        var $cell = $input.closest('td'),
            $row = $cell.closest('tr');

        return {
            rowKey: $row.attr('key'),
            columnName: $cell.attr('columnname')
        };
    },

    /**
     * event 객체가 발생한 셀을 찾아 editOption에 inputEvent 핸들러 정보가 설정되어 있으면
     * 해당 이벤트 핸들러를 호출해준다.
     * @param {Event} event - 이벤트 객체
     * @param {string} eventName - 이벤트명
     * @return {boolean} Return value of the event handler. Null if there's no event handler.
     * @private
     */
    _executeInputEventHandler: function(event, eventName) {
        var $input = $(event.target),
            cellInfo = this._getCellInfoFromInput($input),
            columnModel = this.grid.columnModel.getColumnModel(cellInfo.columnName),
            eventHandler = ne.util.pick(columnModel, 'editOption', 'inputEvents', eventName);

        if (_.isFunction(eventHandler)) {
            return eventHandler(event, cellInfo);
        }
        return null;
    },

    /**
     * selectstart 이벤트 핸들러
     * IE에서 selectstart 이벤트가 Input 요소에 까지 적용되어 값에 셀렉션 지정이 안되는 문제를 해결
     * @param {Event} event 이벤트 객체
     * @private
     */
    _onSelectStart: function(event) {
        event.stopPropagation();
    }
});

module.exports = Text;

},{"../../../util":19,"../cell":36}],46:[function(require,module,exports){
/**
 * @fileoverview Row Painter 정의
 * @author NHN Ent. FE Development Team
 */
'use strict';

var Painter = require('../../base/painter');

/**
 * Row Painter
 * 성능 향상을 위해 Row Painter 를 위한 클래스 생성
 * @module painter/row
 */
var RowPainter = ne.util.defineClass(Painter,/**@lends module:painter/row.prototype */{
    /**
     * @constructs
     * @extends module:painter
     * @param {object} options - Options
     *      @param {string} [options.whichSide='R']   어느 영역에 속하는 row 인지 여부. 'L|R' 중 하나를 지정한다.
     *      @param {object} options.collection change 를 감지할 collection 객체
     */
    init: function(options) {
        Painter.apply(this, arguments);

        this.setOwnProperties({
            columnModelList: options.columnModelList
        });
    },

    eventHandler: {
        'mousedown': '_onMouseDown'
    },

    baseTemplate: _.template(
        '' +
        '<tr ' +
        'key="<%=key%>" ' +
        'class="<%=className%>" ' +
        'style="height: <%=height%>px;">' +
        '<%=contents%>' +
        '</tr>'
    ),
    
    /**
     * mousedown 이벤트 핸들러
     * @param {Event} mouseDownEvent 이벤트 객체
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
        this.grid.selection.onMouseDown(mouseDownEvent);
    },

    /**
     * model 변경 시 이벤트 핸들러
     * @param {object} model - 변화가 일어난 모델 인스턴스
     * @param {jQuery} $tr - jquery object for tr element
     */
    onModelChange: function(model, $tr) {
        var editType,
            cellInstance;

        _.each(model.changed, function(cellData, columnName) {
            if (columnName !== '_extraData') {
                editType = this._getEditType(columnName, cellData);
                cellInstance = this.grid.cellFactory.getInstance(editType);
                cellInstance.onModelChange(cellData, $tr);
            }
        }, this);
    },

    /**
     * cellData 의 isEditable 프로퍼티에 따른 editType 을 반환한다.
     * editable 프로퍼티가 false 라면 normal type 으로 설정한다.
     * @param {string} columnName 컬럼명
     * @param {Object} cellData 셀 데이터
     * @return {string} cellFactory 에서 사용될 editType
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
     * 등록된 Cell Painter들의 이름을 key로 갖고, instance를 value로 갖는 객체를 반환한다.
     * @returns {object} CellFactory
     */
    getCellPainters: function() {
        return this.grid.cellFactory.instances;
    },

    /**
     * tr html 마크업을 반환한다.
     * @param {object} model 마크업을 생성할 모델 인스턴스
     * @return {string} tr 마크업 문자열
     */
    getHtml: function(model) {
        var columnModelList = this.columnModelList,
            cellFactory = this.grid.cellFactory,
            html = '',
            columnName, cellData, editType, cellInstance;

        if (ne.util.isUndefined(model.get('rowKey'))) {
           return html;
        }

        _.each(columnModelList, function(columnModel) {
            columnName = columnModel['columnName'];
            cellData = model.get(columnName);
            /* istanbul ignore else */
            if (cellData && cellData['isMainRow']) {
                editType = this._getEditType(columnName, cellData);
                cellInstance = cellFactory.getInstance(editType);
                html += cellInstance.getHtml(cellData);
            }
        }, this);

        return this.baseTemplate({
            key: model.get('rowKey'),
            height: this.grid.dimensionModel.get('rowHeight') + RowPainter._extraHeight,
            contents: html,
            className: ''
        });
    },

    static: {
        /**
         * IE7에서만 TD의 border만큼 높이가 늘어나는 버그에 대한 예외처리를 위한 값
         * @memberof RowPainter
         * @static
         */
        _extraHeight: (function() {
            var value = 0;
            if (ne.util.browser.msie && ne.util.browser.version === 7) {
                // css에서 IE7에 대해서만 padding의 높이를 위아래 1px씩 주고 있음 (border가 생겼을 때는 0)
                value = -2;
            }
            return value;
        }())
    }
});

module.exports = RowPainter;

},{"../../base/painter":6}],47:[function(require,module,exports){
/**
 * @fileoverview RowList View
 * @author NHN Ent. FE Development Team
 */
'use strict';

var View = require('../base/view');
var RowPainter = require('./painter/row');

/**
 * RowList View
 * @module view/rowList
 */
var RowList = View.extend(/**@lends module:view/rowList.prototype */{
    /**
     * 초기화 함수
     * @constructs
     * @extends module:baes/view
     * @param {object} options 옵션 객체
     *      @param {string} [options.whichSide='R']   어느 영역에 속하는 rowList 인지 여부. 'L|R' 중 하나를 지정한다.
     */
    initialize: function(options) {
        var focusModel, renderModel, whichSide;

        View.prototype.initialize.apply(this, arguments);

        whichSide = (options && options.whichSide) || 'R';
        this.setOwnProperties({
            whichSide: whichSide,
            bodyView: options.bodyView,
            columnModelList: this.grid.columnModel.getVisibleColumnModelList(whichSide),
            sortOptions: null,
            renderedRowKeys: null,
            rowPainter: null
        });
        this.renderCount = 0;
        this._createRowPainter();
        this._delegateTableEventsFromBody();
        this._focusClipboardDebounced = _.debounce(this._focusClipboard, 10);

        focusModel = this.grid.focusModel;
        renderModel = this.grid.renderModel;
        this.listenTo(this.collection, 'change', this._onModelChange)
            .listenTo(focusModel, 'select', this._onSelect)
            .listenTo(focusModel, 'unselect', this._onUnselect)
            .listenTo(focusModel, 'focus', this._onFocus)
            .listenTo(focusModel, 'blur', this._onBlur)
            .listenTo(renderModel, 'rowListChanged', this.render);
    },

    /**
     * Rendering 에 사용할 RowPainter Instance 를 생성한다.
     * @private
     */
    _createRowPainter: function() {
        this.rowPainter = new RowPainter({
            grid: this.grid,
            columnModelList: this.columnModelList
        });
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
     * 전체 행목록을 갱신한다.
     */
    _resetRows: function() {
        var html = this._getRowsHtml(this.collection.models),
            $tbody;

        if (RowList.isInnerHtmlOfTbodyReadOnly) {
            $tbody = this.bodyView.redrawTable(html);
            this.setElement($tbody, false); // table이 다시 생성되었기 때문에 tbody의 참조를 갱신해준다.

            // IE7에서 레이아웃이 틀어지는 현상 방지
            if (ne.util.browser.msie && ne.util.browser.version <= 7) {
                $tbody.width($tbody.width());
            }
        } else {
            // IE의 호환성 보기를 사용하면 브라우저 검출이 정확하지 않기 때문에, try/catch로 방어코드를 추가함.
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
     * @return {string} 생성된 HTML 문자열
     */
    _getRowsHtml: function(rows) {
        return _.map(rows, this.rowPainter.getHtml, this.rowPainter).join('');
    },

    /**
     * timeout을 사용해 일정 시간이 지난 후 포커스를 Clipboard로 옮긴다.
     */
    _focusClipboard: function() {
        try {
            this.grid.focusClipboard();
        } catch (e) {
            // prevent Error from running test cases (caused by setTimeout in _.debounce())
        }
    },

    /**
     * tr 엘리먼트를 찾아서 반환한다.
     * @param {(string|number)} rowKey rowKey 대상의 키값
     * @return {jquery} 조회한 tr jquery 엘리먼트
     * @private
     */
    _getRowElement: function(rowKey) {
        return this.$el.find('tr[key="' + rowKey + '"]');
    },

    /**
     * focusModel 의 select 이벤트 발생시 이벤트 핸들러
     * @param {(Number|String)} rowKey 대상의 키값
     * @private
     */
    _onSelect: function(rowKey) {
        this._setCssSelect(rowKey, true);
    },

    /**
     * focusModel 의 unselect 이벤트 발생시 이벤트 핸들러
     * @param {(Number|String)} rowKey 대상의 키값
     * @private
     */
    _onUnselect: function(rowKey) {
        this._setCssSelect(rowKey, false);
    },

    /**
     * 인자로 넘어온 rowKey 에 해당하는 행(각 TD)에 Select 디자인 클래스를 적용한다.
     * @param {(Number|String)} rowKey 대상의 키값
     * @param {Boolean} isSelected  css select 를 수행할지 unselect 를 수행할지 여부
     * @private
     */
    _setCssSelect: function(rowKey, isSelected) {
        var grid = this.grid,
            columnModelList = this.columnModelList,
            columnName,
            $trCache = {},
            $tr, $td,
            mainRowKey;

        _.each(columnModelList, function(columnModel) {
            columnName = columnModel['columnName'];
            mainRowKey = grid.dataModel.getMainRowKey(rowKey, columnName);

            $trCache[mainRowKey] = $trCache[mainRowKey] || this._getRowElement(mainRowKey);
            $tr = $trCache[mainRowKey];
            $td = $tr.find('td[columnname="' + columnName + '"]');
            if ($td.length) {
                $td.toggleClass('selected', isSelected);
            }
        }, this);
    },

    /**
     * focusModel 의 blur 이벤트 발생시 해당 $td 를 찾고, focus 클래스를 제거한다.
     * @param {(Number|String)} rowKey 대상의 키값
     * @param {String} columnName 컬럼명
     * @private
     */
    _onBlur: function(rowKey, columnName) {
        var $td = this.grid.getElement(rowKey, columnName);
        if ($td.length) {
            $td.removeClass('focused');
        }
    },

    /**
     * focusModel 의 _onFocus 이벤트 발생시 해당 $td 를 찾고, focus 클래스를 추가한다.
     * @param {(Number|String)} rowKey 대상의 키값
     * @param {String} columnName 컬럼명
     * @private
     */
    _onFocus: function(rowKey, columnName) {
        var $td = this.grid.getElement(rowKey, columnName);
        if ($td.length) {
            $td.addClass('focused');
        }
    },

    /**
     * 랜더링한다.
     * @param {boolean} isModelChanged - 모델이 변경된 경우(add, remove..) true, 아니면(스크롤 변경 등) false
     * @return {View.RowList} this 객체
     */
    render: function(isModelChanged) {
        var rowKeys = this.collection.pluck('rowKey'),
            dupRowKeys;

        this.bodyView.resetTablePosition();

        if (isModelChanged) {
            this._resetRows();
        } else {
            dupRowKeys = _.intersection(rowKeys, this.renderedRowKeys);
            if (_.isEmpty(rowKeys) || _.isEmpty(dupRowKeys) ||
                // 중복된 데이터가 70% 미만일 경우에는 성능을 위해 innerHTML을 사용.
                (dupRowKeys.length / rowKeys.length < 0.7)) {
                this._resetRows();
            } else {
                this._removeOldRows(dupRowKeys);
                this._appendNewRows(rowKeys, dupRowKeys);
            }
        }

        this.renderedRowKeys = rowKeys;
        this._focusClipboardDebounced();
        this._showLayer();

        return this;
    },

    /**
     * 테이블 내부(TR,TD)에서 발생하는 이벤트를 View.Layout.Body에게 넘겨 해당 요소들에게 위임하도록 설정한다.
     * @private
     */
    _delegateTableEventsFromBody: function() {
        this.bodyView.attachTableEventHandler('tr', this.rowPainter.getEventHandlerInfo());

        _.each(this.rowPainter.getCellPainters(), function(painter, editType) {
            var selector = 'td[edit-type=' + editType + ']',
                handlerInfo = painter.getEventHandlerInfo();

            this.bodyView.attachTableEventHandler(selector, handlerInfo);
        }, this);
    },

    /**
     * modelChange 이벤트 발생시 실행되는 핸들러 함수.
     * @param {Model.Row} model Row 모델 객체
     * @private
     */
    _onModelChange: function(model) {
        var $tr = this._getRowElement(model.get('rowKey'));
        this.rowPainter.onModelChange(model, $tr);
    },

    /**
     * 데이터가 있다면 Layer 를 노출하고, 없는 경우 데이터 없음 레이어를 노출한다.
     * @private
     */
    _showLayer: function() {
        if (this.grid.dataModel.length) {
            this.grid.hideGridLayer();
        } else {
            this.grid.showGridLayer('empty');
        }
    }
},
{
    /**
     * tbody 요소의 innerHTML이 읽기전용인지 여부
     * @memberof RowList
     * @static
     */
    isInnerHtmlOfTbodyReadOnly: (ne.util.browser.msie && ne.util.browser.version <= 9)
});

module.exports = RowList;

},{"../base/view":7,"./painter/row":46}],48:[function(require,module,exports){
/**
 * @fileoverview Selection 클래스 파일
 * @author NHN Ent. FE Development Team
 */
'use strict';

var View = require('../base/view');
var Layer = require('./selectionLayer');

/**
 *  selection layer 의 컨트롤을 담당하는 틀래스
 *  @module view/selection
 */
var Selection = View.extend(/**@lends module:view/selection.prototype */{
    /**
     * @constructs
     * @extends module:base/view
     */
    initialize: function() {
        View.prototype.initialize.apply(this, arguments);

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
            scrollPixelScale: 40,
            isEnable: true,
            _isShown: false
        });

        this.listenTo(this.grid.dimensionModel, 'columnWidthChanged', this._onColumnWidthChanged, this)
            .listenTo(this.grid.dataModel, 'add remove sort reset', this.endSelection, this);
    },

    events: {},

    /**
     * selection 을 disable 한다.
     */
    enable: function() {
        if (this.grid.option('useDataCopy')) {
            this.isEnable = true;
        }
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
     * @param {Number} pageX    초기값으로 설정할 마우스 x좌표
     * @param {Number} pageY    초기값으로 설정할 마우스 y 좌표
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
     * selection 영역에 대한 mouseDown 퍼블릭 이벤트 핸들러
     * @param {MouseDownEvent} mouseDownEvent Event object
     */
    onMouseDown: function(mouseDownEvent) {
        var grid = this.grid,
            selection = this,
            focused,
            pos;

        if (mouseDownEvent.shiftKey) {
            focused = grid.focusModel.indexOf(true);
            if (!selection.hasSelection()) {
                selection.startSelection(focused.rowIdx, focused.columnIdx);
            }

            selection.attachMouseEvent(mouseDownEvent.pageX, mouseDownEvent.pageY);
            pos = selection.getIndexFromMousePosition(mouseDownEvent.pageX, mouseDownEvent.pageY);
            selection.updateSelection(pos.row, pos.column);
            grid.focusAt(pos.row, pos.column);
        } else {
            selection.endSelection();
            selection.attachMouseEvent(mouseDownEvent.pageX, mouseDownEvent.pageY);
        }
    },

    /**
     * mouse move 이벤트 핸들러
     * @param {event} mouseMoveEvent 이벤트 객체
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
     * 마우스 드래그로 selection 선택 시 auto scroll 조건에 해당하는지 반환한다.
     * @param {Number} overflowX    가로축 기준 영역 overflow 값
     * @param {Number} overflowY    세로축 기준 영역 overflow 값
     * @return {boolean} overflow 되었는지 여부
     * @private
     */
    _isAutoScrollable: function(overflowX, overflowY) {
        return !(overflowX === 0 && overflowY === 0);
    },

    /**
     * scrollTop 과 scrollLeft 값을 조정한다.
     * @param {Number} overflowX    가로축 기준 영역 overflow 값
     * @param {Number} overflowY    세로축 기준 영역 overflow 값
     * @private
     */
    _adjustScroll: function(overflowX, overflowY) {
        var renderModel = this.grid.renderModel,
            scrollLeft = renderModel.get('scrollLeft'),
            maxScrollLeft = renderModel.get('maxScrollLeft'),
            scrollTop = renderModel.get('scrollTop');
        if (overflowX < 0) {
            renderModel.set('scrollLeft', Math.min(Math.max(0, scrollLeft - this.scrollPixelScale), maxScrollLeft));
        } else if (overflowX > 0) {
            renderModel.set('scrollLeft', Math.min(Math.max(0, scrollLeft + this.scrollPixelScale), maxScrollLeft));
        }

        /* istanbul ignore next: scrollTop 은 보정로직과 얽혀있어 확인이 어렵기 때문에 무시한다. */
        if (overflowY < 0) {
            renderModel.set('scrollTop', Math.max(0, scrollTop - this.scrollPixelScale));
        } else if (overflowY > 0) {
            renderModel.set('scrollTop', Math.max(0, scrollTop + this.scrollPixelScale));
        }
    },

    /**
     * mousedown 이 일어난 지점부터의 거리를 구한다.
     * @param {event} mouseMoveEvent 이벤트 객체
     * @return {number} 처음 위치좌표로 부터의 거리.
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
     * mouse up 이벤트 핸들러
     * @private
     */
    _onMouseUp: function() {
        this.detachMouseEvent();
    },

    /**
     * 마우스 위치 정보에 해당하는 row 와 column index 를 반환한다.
     * @param {Number} pageX    마우스 x좌표
     * @param {Number} pageY    마우스 y 좌표
     * @return {{row: number, column: number, overflowX: number, overflowY: number}} row, column의 인덱스 정보와 x, y축 overflow 정보.
     */
    getIndexFromMousePosition: function(pageX, pageY) {
        var containerPos = this._getContainerPosition(pageX, pageY),
            dimensionModel = this.grid.dimensionModel,
            renderModel = this.grid.renderModel,
            columnWidthList = dimensionModel.getColumnWidthList(),
            scrollTop = renderModel.get('scrollTop'),
            scrollLeft = renderModel.get('scrollLeft'),
            totalColumnWidth = dimensionModel.getFrameWidth(),
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
            rowIdx, columnIdx;


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
            ne.util.forEachArray(columnWidthList, function(columnWidth, i) {
                curWidth += columnWidth + 1;
                if (dataPosX <= curWidth) {
                    columnIdx = i;
                    return false;
                }
            });
        }

        return {
            row: rowIdx,
            column: columnIdx,
            overflowX: overflowX,
            overflowY: overflowY
        };
    },

    /**
     * rowSpan 을 함께 계산한 범위를 반환한다.
     * @return {{row: array, column: array}} rowSpan 을 함께 계산한 범위정보
     */
    getRange: function() {
        return $.extend(true, {}, this.spannedRange);
    },

    /**
     *  현재 selection 범위내 데이터를 문자열 형태로 변환하여 반환한다.
     *  @return {String} selection 범위내 데이터 문자열
     */
    getSelectionToString: function() {
        var columnModelList = this.grid.columnModel.getVisibleColumnModelList()
                .slice(this.spannedRange.column[0], this.spannedRange.column[1] + 1),
            filteringMap = {
                '_button': true
            },
            columnNameList = [],
            tmpString = [],
            strings = [],
            startIdx = this.grid.renderModel.get('startNumber') + this.spannedRange.row[0],
            rowList, string;

        _.each(columnModelList, function(columnModel) {
            columnNameList.push(columnModel['columnName']);
        });

        rowList = this.grid.dataModel.slice(this.spannedRange.row[0], this.spannedRange.row[1] + 1);

        _.each(rowList, function(row, i) {
            tmpString = [];
            _.each(columnNameList, function(columnName, j) {
                if (!filteringMap[columnName]) {
                    //number 형태의 경우 실 데이터는 존재하지 않으므로 가공하여 추가한다.
                    if (columnNameList[j] === '_number') {
                        tmpString.push(startIdx + i);
                    } else {
                        tmpString.push(row.getVisibleText(columnName));
                    }
                }
            });
            strings.push(tmpString.join('\t'));
        });

        string = strings.join('\n');
        return string;
    },

    /**
     * 실제로 랜더링될 selection layer view 를 생성 후 반환한다.
     * @param {String} [whichSide='L'] 좌 우 영역중 어느 영역인지 여부
     * @return {Object} 해당 영역의 selection layer view 인스턴스
     */
    createLayer: function(whichSide) {
        var layer = this._getLayer(whichSide);

        if (layer && ne.util.isFunction(layer.destroy())) {
            layer.destroy();
        }
        layer = this.createView(Layer, {
            grid: this.grid,
            whichSide: whichSide,
            columnWidthList: this.grid.dimensionModel.getColumnWidthList(whichSide)
        });

        if (whichSide === 'R') {
            this.rside = layer;
        } else {
            this.lside = layer;
        }
        return layer;
    },

    /**
     * 전체 영역을 선택한다.
     */
    selectAll: function() {
        if (this.isEnable) {
            this.startSelection(0, 0);
            this.updateSelection(this.grid.dataModel.length - 1, this.grid.columnModel.getVisibleColumnModelList().length - 1);
        }
    },

    /**
     * selection 영역 선택을 시작한다.
     * @param {Number} rowIndex 시작점의 row 인덱스 정보
     * @param {Number} columnIndex 시작점의 column 인덱스 정보
     */
    startSelection: function(rowIndex, columnIndex) {
        if (this.isEnable) {
            this.range.row[0] = this.range.row[1] = rowIndex;
            this.range.column[0] = this.range.column[1] = columnIndex;
            this.show();
        }
    },

    /**
     * selection 영역 선택을 확장한다.
     * @param {Number} rowIndex 확장할 지점의 row 인덱스 정보
     * @param {Number} columnIndex 확장할 지점의 column 인덱스 정보
     */
    updateSelection: function(rowIndex, columnIndex) {
        if (this.isEnable) {
            this.range.row[1] = rowIndex;
            this.range.column[1] = columnIndex;
            this.show();
        }
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
        if (!this.isEnable || !this.hasSelection()) {
            return;
        }
        this._isShown = true;

        var dataModel = this.grid.dataModel, // eslint-disable-line vars-on-top
            columnFixIndex = this.grid.columnModel.get('columnFixIndex'),
            startRow = Math.min.apply(Math, this.range.row),
            endRow = Math.max.apply(Math, this.range.row),
            startColumn = Math.min.apply(Math, this.range.column),
            endColumn = Math.max.apply(Math, this.range.column),
            spannedRange = {
                row: [startRow, endRow],
                column: [startColumn, endColumn]
            },
            tmpRowRange;

        if (dataModel.isRowSpanEnable()) {
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
    },

    /**
     * selection layer 를 숨긴다. 데이터는 초기화 되지 않는다.
     */
    hide: function() {
        this._isShown = false;
        if (this.lside) {
            this.lside.hide();
        }
        if (this.rside) {
            this.rside.hide();
        }
    },

    /**
     * 현재 selection 레이어가 노출되어 있는지 확인한다.
     * @return {boolean}    레이어 노출여부
     */
    isShown: function() {
        return this._isShown;
    },

    /**
     * selection이 시작된 셀의 인덱스를 반환한다.
     * @return {{rowIdx: number, columnIdx: number}} 행과 열의 인덱스정보를 가진 객체
     */
    getStartIndex: function() {
        return {
            rowIdx: this.range.row[0],
            columnIdx: this.range.column[0]
        };
    },

    /**
     * selection이 끝나는 셀의 인덱스를 반환한다.
     * @return {{rowIdx: number, columnIdx: number}} 행과 열의 인덱스정보를 가진 객체
     */
    getEndIndex: function() {
        return {
            rowIdx: this.range.row[1],
            columnIdx: this.range.column[1]
        };
    },

    /**
     * Selection Layer View 를 반환한다.
     * @param {String} [whichSide='L'] 어느 영역의 layer 를 조회할지 여부. 'L|R' 중 하나를 지정한다.
     * @return {View.Selection.rside|View.Selection.lside} 해당 selection layer view 인스턴스
     * @private
     */
    _getLayer: function(whichSide) {
        return whichSide === 'R' ? this.rside : this.lside;
    },

    /**
     * 마우스 위치 정보에 해당하는 grid container 기준 pageX 와 pageY 를 반환한다.
     * @param {Number} pageX    마우스 x 좌표
     * @param {Number} pageY    마우스 y 좌표
     * @return {{pageX: number, pageY: number}} 그리드 container 기준의 pageX, pageY 값
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
     * select start 이벤트를 방지한다.
     * @param {event} selectStartEvent 이벤트 객체
     * @returns {boolean} false
     * @private
     */
    _onSelectStart: function(selectStartEvent) {
        selectStartEvent.preventDefault();
        return false;
    },

    /**
     * selection 데이터가 존재하는지 확인한다.
     * @return {boolean}    selection 데이터 존재여부
     * @private
     */
    hasSelection: function() {
        return !(this.range.row[0] === -1);
    },

    /**
     * row start index 기준으로 rowspan 을 확인하며 startRangeList 업데이트 하는 함수
     * @param {object} param - parameters
     */
    _concatRowSpanIndexFromStart: function(param) {
        var startIndex = param.startIndex,
            endIndex = param.endIndex,
            columnName = param.columnName,
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
    },

    /**
     * row end index 기준으로 rowspan 을 확인하며 endRangeList 를 업데이트 하는 함수
     * @param {object} param - parameters
     */
    _concatRowSpanIndexFromEnd: function(param) {
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
    },

    /**
     * rowSpan 된 Index range 를 반환한다.
     * @param {{row: Array, column: Array}} spannedRange 인덱스 정보
     * @returns {{row: Array, column: Array}} New Range
     * @private
     */
    _getRowSpannedIndex: function(spannedRange) {
        var columnModelList = this.grid.columnModel.get('columnModelList')
                .slice(spannedRange.column[0], spannedRange.column[1] + 1),
            dataModel = this.grid.dataModel,
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
            columnName = columnModel['columnName'];
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

        newSpannedRange.row = [Math.min.apply(Math, startIndexList), Math.max.apply(Math, endIndexList)];
        return newSpannedRange;
    },

    /**
     * 소멸자
     */
    destroy: function() {
        this.stopListening();
        this.detachMouseEvent();
        this.destroyChildren();
        this.remove();
    }
});

module.exports = Selection;

},{"../base/view":7,"./selectionLayer":49}],49:[function(require,module,exports){
/**
 * @fileoverview Class for the selection layer
 * @author NHN Ent. FE Development Team
 */
'use strict';

var View = require('../base/view');
var util = require('../util');

/**
 * Class for the selection layer
 * @module view/selectionLayer
 */
var SelectionLayer = View.extend(/**@lends module:view/selectionLayer.prototype */{
    /**
     * @constructs
     * @extends module:base/view
     * @param {object} options Options
     *      @param {array} options.columnWidthList  selection 레이어에 해당하는 영역의 컬럼 너비 리스트 정보
     */
    initialize: function(options) {
        View.prototype.initialize.apply(this, arguments);
        this.listenTo(this.grid.dimensionModel, 'columnWidthChanged', this._updateColumnWidthList, this);
        this.setOwnProperties({
            columnWidthList: options.columnWidthList,
            whichSide: options.whichSide || 'R',
            spannedRange: {
                row: [-1, -1],
                column: [-1, -1]
            }
        });
    },

    tagName: 'div',

    className: 'selection_layer',

    events: {
        mousedown: '_onMouseDown'
    },

    /**
     * selection 영역의 mousedown 이벤트
     * @param {Event} mouseDownEvent - MousedownEvent object
     * @private
     */
    _onMouseDown: function(mouseDownEvent) {
        this.grid.selection.onMouseDown(mouseDownEvent);
    },

    /**
     * 컬럼 widthList 값의 변화가 발생했을때 이벤트 핸들러
     * @private
     */
    _updateColumnWidthList: function() {
        this.columnWidthList = this.grid.dimensionModel.getColumnWidthList(this.whichSide);
    },

    /**
     * 영역 정보를 바탕으로 selection 레이어의 크기와 위치 정보를 담은 css 스타일을 반환한다.
     * @param {{row: range, column: range}} spannedRange 인덱스 정보
     * @return {{display: string, width: string, height: string, top: string, left: string}} css 스타일 정보
     * @private
     */
    _getGeometryStyles: function(spannedRange) {
        var columnWidthList = this.columnWidthList,
            rowHeight = this.grid.dimensionModel.get('rowHeight'),
            len = columnWidthList.length,
            display = 'block',
            left = 0,
            width = 0,
            border = 1,
            rowRange, columnRange, top, height, style, i;

        spannedRange = spannedRange || this.indexObj;
        rowRange = spannedRange.row;
        columnRange = spannedRange.column;
        top = util.getHeight(rowRange[0], rowHeight) - 1;
        height = util.getHeight(rowRange[1] - rowRange[0] + 1, rowHeight) - 2;

        for (i = 0; i < columnRange[1] + 1 && i < len; i += 1) {
            //border 두께 (1px) 값도 포함하여 계산한다.
            if (i < columnRange[0]) {
                left += columnWidthList[i] + border;
            } else {
                width += columnWidthList[i] + border;
            }
        }
        //border 두께 (1px) 가 추가로 한번 더 계산되었기 때문에 -1 한다.
        width -= border;

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
     * 레이어를 노출한다.
     * @param {{row: range, column: range}} spannedRange 인덱스 정보
     */
    show: function(spannedRange) {
        this.indexObj = spannedRange;
        this.$el.css(this._getGeometryStyles(spannedRange));
    },

    /**
     * 레이어를 숨긴다.
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

    /**
     * 렌더링한다.
     * @return {View.Selection.Layer} this object
     */
    render: function() {
        return this;
    }
});

module.exports = SelectionLayer;

},{"../base/view":7,"../util":19}]},{},[12]);
