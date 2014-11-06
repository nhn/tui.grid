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
