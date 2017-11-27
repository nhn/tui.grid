'use strict';

var $ = require('jquery');

var Grid = require('grid');
var Model = require('base/model');
var formUtil = require('common/formUtil');
var i18n = require('common/i18n');
var renderStateMap = require('common/constMap').renderState;

describe('addon.net', function() {
    var columns = [{
        name: 'c1'
    }];
    var data = [
        {c1: '0-1'},
        {c1: '1-1'},
        {c1: '2-1'},
        {c1: '3-1'}
    ];

    var grid, $grid, net;

    function createNet(options) {
        grid.use('Net', options);
        net = grid.getAddOn('Net');
        net._isConfirmed = function() {
            return true;
        };
    }

    beforeEach(function() {
        jasmine.getFixtures().fixturesPath = 'base/';
        loadFixtures('test/unit/fixtures/addon.net.html');
        $grid = $('#grid');
        grid = new Grid({
            el: $grid,
            columns: columns,
            selectType: 'checkbox'
        });
        Grid.setLanguage('en');
        window.alert = function() {};
        window.confirm = function() {
            return true;
        };
        jasmine.clock().install();
        jasmine.Ajax.install();
    });

    afterEach(function() {
        grid.destroy();
        jasmine.Ajax.uninstall();
        jasmine.clock().uninstall();
    });

    describe('초기화 관련 메서드 확인', function() {
        it('el을 지정안하면 빈 form이 생성된다', function() {
            createNet();
            expect(net.$el.is('form')).toBe(true);
        });

        describe('_initializeDataModelNetwork', function() {
            beforeEach(function() {
                createNet({
                    api: {
                        readData: '/api/read'
                    }
                });
            });

            it('dataModel 의 network 설정을 확인한다.', function() {
                expect(net.dataModel.url).toBe('/api/read');
                expect(typeof net.dataModel.sync).toBe('function');
            });
        });

        describe('_initializeRouter', function() {
            describe('enableAjaxHistory 가 설정되어 있을때만 router 설정을 한다.', function() {
                it('enableAjaxHistory on', function() {
                    createNet({
                        api: {
                            readData: '/api/read'
                        },
                        enableAjaxHistory: true
                    });
                    expect(net.router).not.toBeNull();
                });

                it('enableAjaxHistory off', function() {
                    createNet({
                        api: {
                            readData: '/api/read'
                        },
                        enableAjaxHistory: false
                    });
                    expect(net.router).toBeNull();
                });
            });
        });
    });

    describe('_ajax', function() {
        beforeEach(function() {
            createNet({
                api: {
                    readData: '/api/read'
                }
            });
        });

        it('ajax 요청이 발생하는지 확인한다.', function() {
            var request;
            net._ajax({
                url: '/api/test',
                method: 'POST',
                data: {
                    param1: 1,
                    param2: 2
                }
            });
            request = jasmine.Ajax.requests.mostRecent();
            expect(request.url).toBe('/api/test');
            expect(request.method).toBe('POST');
            expect(request.data()).toEqual({
                param1: ['1'],
                param2: ['2']
            });
        });

        it('grid 에서 beforeRequest 이벤트를 발생하는지 확인한다.', function() {
            var callback = jasmine.createSpy('callback');

            grid.on('beforeRequest', callback);
            net._ajax({
                url: '/api/test'
            });
            expect(callback).toHaveBeenCalled();
        });

        it('beforeRequest 이벤트 핸들러에서 stop()을 호출하면 ajax 요청이 중지되는지 확인한다.', function() {
            var listenModel = new Model(),
                request;

            listenModel.listenTo(grid, 'beforeRequest', function(eventData) {
                eventData.stop();
            });

            net._ajax({
                url: '/api/stop'
            });
            request = jasmine.Ajax.requests.mostRecent();
            expect(request.url).not.toBe('/api/stop');
        });
    });

    describe('_setFormData', function() {
        it('this.$el의 내부 인풋 요소들에 주어진 데이터를 설정한다.', function() {
            var $form = $('<form />'),
                inputData, actualData;

            $form.append($('<input name="input1" />'));
            $form.append($('<input name="input2" />'));

            createNet({
                el: $form
            });
            inputData = {
                input1: 'data1',
                input2: 'data2'
            };
            net._setFormData(inputData);
            actualData = formUtil.getFormData($form);
            expect(actualData).toEqual(inputData);
        });

        it('this.$el의 폼과 형식이 다른 경우 데이터가 설정되지 않는다.', function() {
            createNet(); // form을 따로 지정하지 않으면 내부적으로 빈 form이 생성됨
            net._setFormData({
                input: 'data1'
            });
            expect(formUtil.getFormData(net.$el)).toEqual({});
        });
    });

    it('_readDataAt: 기본적으로 ajaxHistory를 사용하며, ajax history를 사용한다면, router.navigate를 호출하여 url을 변경한다.', function() {
        createNet({
            api: {
                readData: '/api/read'
            }
        });
        net.router.navigate = jasmine.createSpy('navigate');
        net._readDataAt(1);

        expect(net.router.navigate).toHaveBeenCalled();
    });

    it('_readDataAt: isUsingRequestedData가 true일 경우, formData 변경여부와 관계없이 이전 질의한 데이터로 질의한다.', function() {
        var request,
            beforeRequesteData,
            afterRequesteData,
            $form = $('<form />');

        $form.append($('<input />').attr('name', 'input1'));
        $form.append($('<input />').attr('name', 'input2'));
        createNet({
            el: $form,
            api: {
                readData: '/api/read'
            }
        });

        net.router.navigate = jasmine.createSpy('navigate');
        net._readDataAt(1);
        request = jasmine.Ajax.requests.mostRecent();
        beforeRequesteData = $.extend(true, {}, request.data());

        // request 요청 후 form data를 변경한다.
        net._setFormData({
            input1: 'data1',
            input2: 'data2'
        });
        net._readDataAt(1, true);
        request = jasmine.Ajax.requests.mostRecent();
        afterRequesteData = $.extend(true, {}, request.data());

        expect(beforeRequesteData).toEqual(afterRequesteData);
    });

    describe('lock', function() {
        it('set isLocked to true', function() {
            createNet();
            net._lock();
            expect(net.isLocked).toBe(true);
        });

        it('set renderState to LOADING if time elapsed is more than 200ms', function() {
            createNet();

            net._lock();
            jasmine.clock().tick(200);
            expect(net.renderModel.get('state')).toBe(renderStateMap.LOADING);
        });
    });

    describe('unlock', function() {
        it('isLocked 를 false로 설정한다.', function() {
            createNet();
            net._lock();
            net._unlock();
            expect(net.isLocked).toBe(false);
        });
    });

    describe('_getDataParam', function() {
        function messUp() {
            grid.appendRow();
            grid.prependRow();
            grid.setValue(0, 'c1', 'Dirty');
            grid.setValue(1, 'c1', 'Dirty');
            grid.setValue(2, 'c1', 'Dirty');
            grid.removeRow(3);
        }

        it('createData, {modifiedOnly: true, checkedOnly: true}', function() {
            var param, createdRows;

            createNet();
            grid.setData(data);

            messUp();
            grid.checkAll();
            param = net._getDataParam('createData');
            createdRows = $.parseJSON(param.data.createdRows);

            expect(createdRows.length).toBe(2);
            expect(param.data.updatedRows).toBeUndefined();
            expect(param.data.deletedRows).toBeUndefined();
            expect(param.count).toBe(2);

            grid.uncheckAll();
            param = net._getDataParam('createData');
            expect(param.createdRows).toBeUndefined();
        });

        it('createData, {checkedOnly: false}', function() {
            var param, createdRows;

            createNet();
            grid.setData(data);

            messUp();
            param = net._getDataParam('createData', {checkedOnly: false});
            createdRows = $.parseJSON(param.data.createdRows);

            expect(createdRows.length).toBe(2);
            expect(param.data.updatedRows).not.toBeDefined();
            expect(param.data.deletedRows).not.toBeDefined();
            expect(param.count).toBe(2);

            grid.uncheckAll();
            param = net._getDataParam('createData', {checkedOnly: false});
            createdRows = $.parseJSON(param.data.createdRows);

            expect(createdRows.length).toBe(2);
            expect(param.count).toBe(2);
        });

        it('createData, {modifiedOnly: false, checkedOnly: false}', function() {
            var param;

            createNet();
            grid.setData(data);

            messUp();
            param = net._getDataParam('createData', {
                checkedOnly: false,
                modifiedOnly: false
            });
            expect(param.data.rows).toBeDefined();
            expect(param.data.createdRows).not.toBeDefined();
            expect(param.data.updatedRows).not.toBeDefined();
            expect(param.data.deletedRows).not.toBeDefined();
            expect(param.count).toBe(grid.getRowCount());
        });

        it('updateData, {modifiedOnly: true, checkedOnly: true} ', function() {
            var param;

            createNet();
            grid.setData(data);

            messUp();
            grid.checkAll();
            param = net._getDataParam('updateData');
            expect(param.count).toBe(3);
            expect($.parseJSON(param.data.updatedRows).length).toBe(3);
            expect(param.data.createdRows).not.toBeDefined();
            expect(param.data.deletedRows).not.toBeDefined();

            grid.uncheckAll();
            param = net._getDataParam('updateData');
            expect(param.count).toBe(0);
            expect(param.data.updatedRows).not.toBeDefined();
        });

        it('updateData, {checkedOnly: false}', function() {
            var param;

            createNet();
            grid.setData(data);

            messUp();
            param = net._getDataParam('updateData', {checkedOnly: false});
            expect(param.count).toBe(3);
            expect($.parseJSON(param.data.updatedRows).length).toBe(3);
            expect(param.data.createdRows).not.toBeDefined();
            expect(param.data.deletedRows).not.toBeDefined();

            grid.uncheckAll();
            param = net._getDataParam('updateData', {checkedOnly: false});
            expect(param.count).toBe(3);
            expect($.parseJSON(param.data.updatedRows).length).toBe(3);
            expect(param.data.createdRows).not.toBeDefined();
            expect(param.data.deletedRows).not.toBeDefined();
        });

        it('deleteData, {modifiedOnly: true, checkedOnly: true}', function() {
            // deleteData는 modifiedOnly, checkedOnly 옵션과 관계없음
            var param;

            createNet();
            grid.setData(data);

            messUp();
            param = net._getDataParam('deleteData');
            expect(param.count).toBe(1);
            expect(param.data.createdRows).not.toBeDefined();
            expect(param.data.updatedRows).not.toBeDefined();
        });

        it('modifyData, {modifiedOnly: true, checkedOnly: true}', function() {
            var param;

            createNet();
            grid.setData(data);

            messUp();
            grid.checkAll();
            param = net._getDataParam('modifyData');
            expect(param.count).toBe(6);
            expect($.parseJSON(param.data.createdRows).length).toBe(2);
            expect($.parseJSON(param.data.updatedRows).length).toBe(3);
            expect($.parseJSON(param.data.deletedRows).length).toBe(1);

            grid.uncheckAll();
            param = net._getDataParam('modifyData');
            expect(param.count).toBe(1);
            expect(param.data.createdRows).not.toBeDefined();
            expect(param.data.updatedRows).not.toBeDefined();
            expect($.parseJSON(param.data.deletedRows).length).toBe(1);
        });

        it('modifyData, {checkedOnly: false}', function() {
            var param;

            createNet();
            grid.setData(data);

            messUp();
            param = net._getDataParam('modifyData', {checkedOnly: false});
            expect($.parseJSON(param.data.createdRows).length).toBe(2);
            expect($.parseJSON(param.data.updatedRows).length).toBe(3);
            expect($.parseJSON(param.data.deletedRows).length).toBe(1);
            expect(param.count).toBe(6);

            grid.uncheckAll();
            param = net._getDataParam('modifyData', {checkedOnly: false});
            expect($.parseJSON(param.data.createdRows).length).toBe(2);
            expect($.parseJSON(param.data.updatedRows).length).toBe(3);
            expect($.parseJSON(param.data.deletedRows).length).toBe(1);
            expect(param.count).toBe(6);
        });
    });

    describe('_getConfirmMessage', function() {
        function getRequestMessage(key, count) {
            return i18n.get(key, {
                count: count
            });
        }
        beforeEach(function() {
            createNet();
        });

        it('createData', function() {
            expect(net._getConfirmMessage('createData', 3)).toEqual(getRequestMessage('net.confirmCreate', 3));
            expect(net._getConfirmMessage('updateData', 3)).toEqual(getRequestMessage('net.confirmUpdate', 3));
            expect(net._getConfirmMessage('deleteData', 3)).toEqual(getRequestMessage('net.confirmDelete', 3));
            expect(net._getConfirmMessage('modifyData', 3)).toEqual(getRequestMessage('net.confirmModify', 3));

            expect(net._getConfirmMessage('createData', 0)).toEqual(i18n.get('net.noDataToCreate'));
            expect(net._getConfirmMessage('updateData', 0)).toEqual(i18n.get('net.noDataToUpdate'));
            expect(net._getConfirmMessage('deleteData', 0)).toEqual(i18n.get('net.noDataToDelete'));
            expect(net._getConfirmMessage('modifyData', 0)).toEqual(i18n.get('net.noDataToModify'));
        });
    });

    describe('request', function() {
        beforeEach(function() {
            createNet();
            grid.setData(data);

            grid.appendRow();
            net._ajax = jasmine.createSpy('ajax');
        });

        it('ajax call 을 호출한다.', function() {
            net.request('createData');
            expect(net._ajax).toHaveBeenCalled();
        });

        it('_getRequestParam 의 반환값이 없다면 ajax call 을 호출하지 않는다.', function() {
            net._getRequestParam = function() {
                return null;
            };
            net.request('createData');
            expect(net._ajax).not.toHaveBeenCalled();
        });

        it('call setOriginalRowList() if updateOriginal is true', function() {
            spyOn(net.dataModel, 'setOriginalRowList');
            net.request('updateData', {
                updateOriginal: true
            });
            expect(net.dataModel.setOriginalRowList).toHaveBeenCalled();
        });
    });

    describe('request', function() {
        var response,
            successResponse,
            failResponse,
            callback,
            options,
            responseData;

        beforeEach(function() {
            createNet();
            responseData = {
                success: {
                    result: true,
                    data: []
                },
                failed: {
                    result: false,
                    data: []
                }
            };
            options = {
                requestType: 'POST',
                data: {
                    data1: 1,
                    data2: 2
                }
            };
            response = jasmine.createSpy('response');
            successResponse = jasmine.createSpy('successResponse');
            failResponse = jasmine.createSpy('failResponse');
            callback = jasmine.createSpy('callback');
        });

        it('정상일때', function() {
            grid.on('successResponse', successResponse)
                .on('failResponse', failResponse)
                .on('response', response);

            net._onSuccess(callback, options, responseData.success, 200);
            expect(callback).toHaveBeenCalled();
            expect(successResponse).toHaveBeenCalled();
            expect(response).toHaveBeenCalled();
            expect(failResponse).not.toHaveBeenCalled();
        });

        it('정상이지만 successResponse 에서 stop 을 호출했을 때', function() {
            grid.on('successResponse', function(eventData) {
                eventData.stop();
            }).on('failResponse', failResponse).on('response', response);

            net._onSuccess(callback, options, responseData.success, 200);

            expect(callback).not.toHaveBeenCalled();
            expect(response).toHaveBeenCalled();
            expect(failResponse).not.toHaveBeenCalled();
        });

        it('정상이지만 response 에서 stop 을 호출했을 때', function() {
            grid.on('successResponse', successResponse)
                .on('failResponse', failResponse)
                .on('response', function(eventData) {
                    eventData.stop();
                });

            net._onSuccess(callback, options, responseData.success, 200);

            expect(callback).not.toHaveBeenCalled();
            expect(successResponse).not.toHaveBeenCalled();
            expect(failResponse).not.toHaveBeenCalled();
        });

        it('응답 결과가 실패 일때', function() {
            grid.on('successResponse', successResponse)
                .on('failResponse', failResponse)
                .on('response', response);

            net._onSuccess(callback, options, responseData.failed, 200);
            expect(callback).not.toHaveBeenCalled();
            expect(successResponse).not.toHaveBeenCalled();
            expect(response).toHaveBeenCalled();
            expect(failResponse).toHaveBeenCalled();
        });
    });

    describe('setPerPage', function() {
        it('Set number of rows per page and reload current page', function() {
            createNet();
            spyOn(net, '_readDataAt');
            net.setPerPage(15);

            expect(net.perPage).toEqual(15);
            expect(net._readDataAt).toHaveBeenCalledWith(1);
        });
    });

    describe('_onComplete', function() {
        it('unlock 을 호출하는지 확인한다.', function() {
            createNet();
            net._unlock = jasmine.createSpy('unlock');
            net._onComplete();
            expect(net._unlock).toHaveBeenCalled();
        });
    });

    describe('_onError', function() {
        var response,
            errorResponse,
            options,
            callback;

        beforeEach(function() {
            createNet();
            options = {
                requestType: 'POST',
                data: {
                    'data1': 1,
                    'data2': 2
                }
            };
            response = jasmine.createSpy('response');
            errorResponse = jasmine.createSpy('errorResponse');
            callback = jasmine.createSpy('callback');
        });

        it('alert 을 호출하는지 확인한다.', function() {
            window.alert = jasmine.createSpy('alert');

            grid.on('errorResponse', errorResponse)
                .on('response', response);

            net._onError(callback, options, {readyState: 10});
            expect(errorResponse).toHaveBeenCalled();
            expect(response).toHaveBeenCalled();
            expect(window.alert).toHaveBeenCalledWith(i18n.get('net.failResponse'));
        });

        it('response 에서 stop 을 호출했을 때', function() {
            window.alert = jasmine.createSpy('alert');
            grid.on('errorResponse', errorResponse)
                .on('response', function(eventData) {
                    eventData.stop();
                });
            net._onError(callback, options, {readyState: 10});
            expect(errorResponse).not.toHaveBeenCalled();
            expect(window.alert).not.toHaveBeenCalled();
        });

        it('errorResponse 에서 stop 을 호출했을 때', function() {
            window.alert = jasmine.createSpy('alert');
            grid.on('errorResponse', function(eventData) {
                eventData.stop();
            }).on('response', response);
            net._onError(callback, options, {readyState: 10});
            expect(response).toHaveBeenCalled();
            expect(window.alert).not.toHaveBeenCalled();
        });
    });

    describe('_onReadSuccess', function() {
        var dataModel = {
            setOriginalRowList: function() {}
        };

        beforeEach(function() {
            createNet();
            net.pagination = {};
            net.pagination.setTotalItems = jasmine.createSpy('setTotalItems');
            net.pagination.setItemsPerPage = jasmine.createSpy('setItemsPerPage');
            net.pagination.movePageTo = jasmine.createSpy('movePageTo');
        });

        it('When "responseData" has pagination information, current page is changed.', function() {
            net._onReadSuccess(dataModel, {
                pagination: {
                    page: 10,
                    totalCount: 100
                }
            });
            expect(net.pagination.setItemsPerPage).toHaveBeenCalledWith(net.perPage);
            expect(net.pagination.setTotalItems).toHaveBeenCalledWith(100);
            expect(net.pagination.movePageTo).toHaveBeenCalledWith(10);
        });
    });

    describe('_onPageBeforeMove', function() {
        var customEvent;

        beforeEach(function() {
            createNet();
            net._readDataAt = jasmine.createSpy('readDataAt');
            customEvent = {
                page: 10
            };
        });

        it('curPage가 인자로 넘어온 page 와 다르다면 readAt을 호출한다.', function() {
            net.curPage = 11;
            net._onPageBeforeMove(customEvent);
            expect(net._readDataAt).toHaveBeenCalled();
        });

        it('curPage가 인자로 넘어온 page 와 같다면 readAt을 호출하지 않는다..', function() {
            net.curPage = 10;
            net._onPageBeforeMove(customEvent);
            expect(net._readDataAt).not.toHaveBeenCalled();
        });
    });

    describe('AddOn.Net.Router', function() {
        it('read시 쿼리스트링을 잘 파싱해서 폼 설정 후 readData를 호출하는지 확인한다.', function() {
            createNet();
            net._requestReadData = jasmine.createSpy('_requestReadData');
            net.router.trigger('route:read', 'a=10&b=20');

            expect(net._requestReadData).toHaveBeenCalledWith({
                a: 10,
                b: 20
            });
        });
    });
});
