/**
 * @fileoverview Add-on for binding to remote data
 * @author NHN Ent. FE Development Lab
 */

'use strict';

var $ = require('jquery');
var Backbone = require('backbone');
var _ = require('underscore');

var View = require('../base/view');
var Router = require('./net-router');
var util = require('../common/util');
var formUtil = require('../common/formUtil');
var i18n = require('../common/i18n');
var GridEvent = require('../event/gridEvent');

var renderStateMap = require('../common/constMap').renderState;
var DELAY_FOR_LOADING_STATE = 200;

var requestMessageMap = {
    createData: 'net.confirmCreate',
    updateData: 'net.confirmUpdate',
    deleteData: 'net.confirmDelete',
    modifyData: 'net.confirmModify'
};
var errorMessageMap = {
    createData: 'net.noDataToCreate',
    updateData: 'net.noDataToUpdate',
    deleteData: 'net.noDataToDelete',
    modifyData: 'net.noDataToModify'
};

/**
 * Add-on for binding to remote data
 * @module addon/net
 * @param {object} options
 *      @param {jquery} [options.el] - Form element (to be used for ajax request)
 *      @param {boolean} [options.initialRequest=true] - Whether to request 'readData' after initialized
 *      @param {string} [options.readDataMethod='POST'] - Http method to be used for 'readData' API ('POST' or 'GET')
 *      @param {object} [options.api] - URL map
 *          @param {string} [options.api.readData] - URL for read-data
 *          @param {string} [options.api.createData] - URL for create
 *          @param {string} [options.api.updateData] - URL for update
 *          @param {string} [options.api.modifyData] - URL for modify (create/update/delete at once)
 *          @param {string} [options.api.deleteData] - URL for delete
 *          @param {string} [options.api.downloadExcel] - URL for download data of this page as an excel-file
 *          @param {string} [options.api.downloadExcelAll] - URL for download all data as an excel-file
 *      @param {number} [options.perPage=500] - The number of items to be shown in a page
 *      @param {boolean} [options.enableAjaxHistory=true] - Whether to use the browser history for the ajax requests
 * @example
 *   <form id="data_form">
 *   <input type="text" name="query"/>
 *   </form>
 *   <script>
 *      var net;
 *      var grid = new tui.Grid({
 *          //...options...
 *      });
 *
 *      // Activate 'Net' addon
 *      grid.use('Net', {
 *         el: $('#data_form'),
 *         initialRequest: true,
 *         readDataMethod: 'GET',
 *         perPage: 500,
 *         enableAjaxHistory: true,
 *         api: {
 *             'readData': './api/read',
 *             'createData': './api/create',
 *             'updateData': './api/update',
 *             'deleteData': './api/delete',
 *             'modifyData': './api/modify',
 *             'downloadExcel': './api/download/excel',
 *             'downloadExcelAll': './api/download/excelAll'
 *         }
 *      });
 *
 *      // Bind event handlers
 *      grid.on('beforeRequest', function(data) {
 *          // For all requests
 *      }).on('response', function(data) {
 *          // For all response (regardless of success or failure)
 *      }).on('successResponse', function(data) {
 *          // Only if response.result is true
 *      }).on('failResponse', function(data) {
 *          // Only if response.result is false
 *      }).on('errorResponse', function(data) {
 *          // For error response
 *      });
 *
 *      net = grid.getAddOn('Net');
 *
 *      // Request create
 *      net.request('createData');
 *
 *      // Request update
 *      net.request('updateData');
 *
 *      // Request delete
 *      net.request('deleteData');
 *
 *      // Request create/update/delete at once
 *      net.request('modifyData');
 *   </script>
 */
var Net = View.extend(/** @lends module:addon/net.prototype */{
    initialize: function(options) {
        var defaultOptions = {
            initialRequest: true,
            perPage: 500,
            enableAjaxHistory: true
        };
        var defaultApi = {
            readData: '',
            createData: '',
            updateData: '',
            deleteData: '',
            modifyData: '',
            downloadExcel: '',
            downloadExcelAll: ''
        };

        options = _.assign(defaultOptions, options);
        options.api = _.assign(defaultApi, options.api);

        _.assign(this, {
            // models
            dataModel: options.dataModel,
            renderModel: options.renderModel,

            // extra objects
            router: null,
            domEventBus: options.domEventBus,
            pagination: options.pagination,

            // configs
            api: options.api,
            enableAjaxHistory: options.enableAjaxHistory,
            readDataMethod: options.readDataMethod || 'POST',
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

        this.listenTo(this.dataModel, 'sortChanged', this._onSortChanged);
        this.listenTo(this.domEventBus, 'click:excel', this._onClickExcel);

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
            pagination.setItemsPerPage(this.perPage);
            pagination.setTotalItems(1);
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
     * Event listener for 'click:excel' event on domEventBus
     * @param {module:event/gridEvent} gridEvent - GridEvent
     * @private
     */
    _onClickExcel: function(gridEvent) {
        var downloadType = (gridEvent.type === 'all') ? 'excelAll' : 'excel';
        this.download(downloadType);
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
        return formUtil.getFormData(this.$el);
    },

    /**
     * DataModel 에서 Backbone.fetch 수행 이후 success 콜백
     * @param {object} dataModel grid 의 dataModel
     * @param {object} responseData 응답 데이터
     * @private
     */
    _onReadSuccess: function(dataModel, responseData) {
        var pagination = this.pagination;
        var page, totalCount;

        dataModel.setOriginalRowList();

        if (pagination && responseData.pagination) {
            page = responseData.pagination.page;
            totalCount = responseData.pagination.totalCount;

            pagination.setItemsPerPage(this.perPage);
            pagination.setTotalItems(totalCount);
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
     */
    reloadData: function() {
        this._requestReadData(this.lastRequestedReadData);
    },

    /**
     * Requests 'readData' to the server. The last requested data will be extended with new data.
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
            startNumber = ((this.curPage - 1) * this.perPage) + 1;
            this.renderModel.set({
                startNumber: startNumber
            });

            // 마지막 요청한 reloadData에서 사용하기 위해 data 를 저장함.
            this.lastRequestedReadData = _.clone(data);
            this.dataModel.fetch({
                requestType: 'readData',
                data: data,
                type: this.readDataMethod,
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
     * @param {boolean} sortOptions.ascending 오름차순 여부
     */
    _onSortChanged: function(sortOptions) {
        if (sortOptions.requireFetch) {
            this._readDataAt(1, true, sortOptions);
        }
    },

    /**
     * 데이터 객체의 정렬 옵션 관련 값을 변경한다.
     * @private
     * @param {object} data 데이터 객체
     * @param {object} sortOptions 정렬 옵션
     * @param {string} sortOptions.sortColumn 정렬할 컬럼명
     * @param {boolean} sortOptions.ascending 오름차순 여부
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
            data.sortAscending = sortOptions.ascending;
        }
    },

    /**
     * 현재 form data 기준으로, page 에 해당하는 데이터를 조회 한다.
     * @param {Number} page 조회할 페이지 정보
     * @param {Boolean} [isUsingRequestedData=true] page 단위 검색이므로, form 수정여부와 관계없이 처음 보낸 form 데이터로 조회할지 여부를 결정한다.
     * @param {object} sortOptions 정렬 옵션
     * @param {string} sortOptions.sortColumn 정렬할 컬럼명
     * @param {boolean} sortOptions.ascending 오름차순 여부
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
     * Send request to server to sync data
     * @param {String} requestType - 'createData|updateData|deleteData|modifyData'
     * @param {object} options - Options
     *      @param {String} [options.url] - URL to send the request
     *      @param {String} [options.hasDataParam=true] - Whether the row-data to be included in the request param
     *      @param {String} [options.checkedOnly=true] - Whether the request param only contains checked rows
     *      @param {String} [options.modifiedOnly=true] - Whether the request param only contains modified rows
     *      @param {String} [options.showConfirm=true] - Whether to show confirm dialog before sending request
     *      @param {String} [options.updateOriginal=false] - Whether to update original data with current data
     * @returns {boolean} Whether requests or not
     */
    request: function(requestType, options) {
        var newOptions = _.extend({
            url: this.api[requestType],
            type: null,
            hasDataParam: true,
            checkedOnly: true,
            modifiedOnly: true,
            showConfirm: true,
            updateOriginal: false
        }, options);
        var param = this._getRequestParam(requestType, newOptions);

        if (param) {
            if (newOptions.updateOriginal) {
                this.dataModel.setOriginalRowList();
            }
            this._ajax(param);
        }

        return !!param;
    },

    /**
     * Change window.location to registered url for downloading data
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
     *      @param {boolean} [options.hasDataParam=true] request 데이터에 rows 관련 데이터가 포함될 지 여부.
     *      @param {boolean} [options.modifiedOnly=true] rows 관련 데이터 중 수정된 데이터만 포함할 지 여부
     *      @param {boolean} [options.checkedOnly=true] rows 관련 데이터 중 checked 된 데이터만 포함할 지 여부
     * @returns {{count: number, data: {requestType: string, url: string, rows: object,
     *      type: string, dataType: string}}} 옵션 조건에 해당하는 그리드 데이터 정보
     * @private
     */
    _getDataParam: function(requestType, options) {
        var dataModel = this.dataModel,
            checkMap = {
                createData: ['createdRows'],
                updateData: ['updatedRows'],
                deleteData: ['deletedRows'],
                modifyData: ['createdRows', 'updatedRows', 'deletedRows']
            },
            checkList = checkMap[requestType],
            data = {},
            count = 0,
            dataMap;

        options = _.defaults(options || {}, {
            hasDataParam: true,
            modifiedOnly: true,
            checkedOnly: true
        });

        if (options.hasDataParam) {
            if (options.modifiedOnly) {
                // {createdRows: [], updatedRows:[], deletedRows: []} 에 담는다.
                dataMap = dataModel.getModifiedRows({
                    checkedOnly: options.checkedOnly
                });
                _.each(dataMap, function(list, name) {
                    if (_.contains(checkList, name) && list.length) {
                        count += list.length;
                        data[name] = JSON.stringify(list);
                    }
                }, this);
            } else {
                // {rows: []} 에 담는다.
                data.rows = dataModel.getRows(options.checkedOnly);
                count = data.rows.length;
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
     *      @param {boolean} [options.modifiedOnly=true] rowList 관련 데이터 중 수정된 데이터만 포함할 지 여부
     *      @param {boolean} [options.checkedOnly=true] rowList 관련 데이터 중 checked 된 데이터만 포함할 지 여부
     * @returns {{requestType: string, url: string, data: object, type: string, dataType: string}}
     *      ajax 호출시 사용될 option 파라미터
     * @private
     */
    _getRequestParam: function(requestType, options) {
        var defaultOptions = {
            url: this.api[requestType],
            type: null,
            hasDataParam: true,
            modifiedOnly: true,
            checkedOnly: true
        };
        var newOptions = $.extend(defaultOptions, options);
        var dataParam = this._getDataParam(requestType, newOptions);
        var param = null;

        if (!newOptions.showConfirm || this._isConfirmed(requestType, dataParam.count)) {
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
        var messageKey = (count > 0) ? requestMessageMap[requestType] : errorMessageMap[requestType];
        var replacedValues = {
            count: count
        };

        return i18n.get(messageKey, replacedValues);
    },

    /**
     * ajax 통신을 한다.
     * @param {{requestType: string, url: string, data: object, type: string, dataType: string}} options ajax 요청 파라미터
     * @private
     */
    _ajax: function(options) {
        var gridEvent = new GridEvent(null, options.data);
        var params;

        /**
         * Occurs before the http request is sent
         * @event Grid#beforeRequest
         * @type {module:event/gridEvent}
         * @property {Grid} instance - Current grid instance
         */
        this.trigger('beforeRequest', gridEvent);
        if (gridEvent.isStopped()) {
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

    /* eslint-disable complexity */
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
        var responseMessage = responseData && responseData.message;
        var gridEvent = new GridEvent(null, {
            httpStatus: status,
            requestType: options.requestType,
            requestParameter: options.data,
            responseData: responseData
        });

        /**
         * Occurs when the response is received from the server
         * @event Grid#reponse
         * @type {module:event/gridEvent}
         * @property {number} httpStatus - HTTP status
         * @property {string} requestType - Request type
         * @property {string} requestParameter - Request parameters
         * @property {Object} responseData - response data
         * @property {Grid} instance - Current grid instance
         */
        this.trigger('response', gridEvent);
        if (gridEvent.isStopped()) {
            return;
        }
        if (responseData && responseData.result) {
            /**
             * Occurs after the response event, if the result is true
             * @event Grid#successReponse
             * @type {module:event/gridEvent}
             * @property {number} httpStatus - HTTP status
             * @property {string} requestType - Request type
             * @property {string} requestParameter - Request parameter
             * @property {Object} responseData - response data
             * @property {Grid} instance - Current grid instance
             */
            this.trigger('successResponse', gridEvent);
            if (gridEvent.isStopped()) {
                return;
            }
            if (_.isFunction(callback)) {
                callback(responseData.data || {}, status, jqXHR);
            }
        } else {
            /**
             * Occurs after the response event, if the result is false
             * @event Grid#failResponse
             * @type {module:event/gridEvent}
             * @property {number} httpStatus - HTTP status
             * @property {string} requestType - Request type
             * @property {string} requestParameter - Request parameter
             * @property {Object} responseData - response data
             * @property {Grid} instance - Current grid instance
             */
            this.trigger('failResponse', gridEvent);
            if (gridEvent.isStopped()) {
                return;
            }
            if (responseMessage) {
                alert(responseMessage);
            }
        }
    },
    /* eslint-enable complexity */

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
        var eventData = new GridEvent(null, {
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

        /**
         * Occurs after the response event, if the response is Error
         * @event Grid#errorResponse
         * @type {module:event/gridEvent}
         * @property {number} httpStatus - HTTP status
         * @property {string} requestType - Request type
         * @property {string} requestParameter - Request parameters
         * @property {Grid} instance - Current grid instance
         */
        this.trigger('errorResponse', eventData);
        if (eventData.isStopped()) {
            return;
        }

        if (jqXHR.readyState > 1) {
            alert(i18n.get('net.failResponse'));
        }
    }
});

module.exports = Net;
