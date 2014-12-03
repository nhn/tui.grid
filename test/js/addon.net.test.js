'use strict';

describe('addon.net', function() {
    var columnModelList = [
        {
            title: 'columnName1',
            columnName: 'columnName1',
            width: 100
        },{
            title: 'columnName2',
            columnName: 'columnName2',
            width: 200,
            editOption: {
                type: 'text'
            }
        },
        {
            title: 'columnName3',
            columnName: 'columnName3',
            width: 300,
            editOption: {
                type: 'text-convertible'
            }
        },
        {
            title: 'columnName4',
            columnName: 'columnName4',
            width: 400,
            editOption: {
                type: 'select',
                list: [
                    {text: 'text1', value: 1},
                    {text: 'text2', value: 2},
                    {text: 'text3', value: 3},
                    {text: 'text4', value: 4}
                ]
            }
        },
        {
            title: 'columnName5',
            columnName: 'columnName5',
            width: 500,
            editOption: {
                type: 'checkbox',
                list: [
                    {text: 'text1', value: 1},
                    {text: 'text2', value: 2},
                    {text: 'text3', value: 3},
                    {text: 'text4', value: 4}
                ]
            }
        },
        {
            title: 'columnName6',
            columnName: 'columnName6',
            width: 600,
            editOption: {
                type: 'radio',
                list: [
                    {text: 'text1', value: 1},
                    {text: 'text2', value: 2},
                    {text: 'text3', value: 3},
                    {text: 'text4', value: 4}
                ]
            }
        },
        {
            title: 'columnName7',
            columnName: 'columnName7',
            width: 700,
            relationList: [
                {
                    columnList: ['text', 'text-convertible'],
                    isDisabled: function(value, rowData) {
                        return !!value;
                    }
                }
            ]
        },
        {
            title: 'columnName8',
            columnName: 'columnName8',
            width: 800,
            relationList: [
                {
                    columnList: ['text', 'text-convertible'],
                    isEditable: function(value, rowData) {
                        return !!value;
                    }
                }
            ]
        }
    ];
    //두번째 행은 disabled 처리한다.
    var rowList = [
        {'columnName1': 'normal', 'columnName2': 1, 'columnName3': 1, 'columnName4': 1, 'columnName5': 'text', 'columnName6': 'text-convertible', 'columnName7': false ,'columnName8': true},
        {'columnName1': 'normal', 'columnName2': 1, 'columnName3': 1, 'columnName4': 1, 'columnName5': 'text', 'columnName6': 'text-convertible', 'columnName7': false ,'columnName8': true},
        {'columnName1': 'normal', 'columnName2': 1, 'columnName3': 1, 'columnName4': 1, 'columnName5': 'text', 'columnName6': 'text-convertible', 'columnName7': false ,'columnName8': true},
        {'columnName1': 'normal', 'columnName2': 1, 'columnName3': 1, 'columnName4': 1, 'columnName5': 'text', 'columnName6': 'text-convertible', 'columnName7': false ,'columnName8': true},
        {'columnName1': 'normal', 'columnName2': 1, 'columnName3': 1, 'columnName4': 1, 'columnName5': 'text', 'columnName6': 'text-convertible', 'columnName7': false ,'columnName8': true},
        {'columnName1': 'normal', 'columnName2': 1, 'columnName3': 1, 'columnName4': 1, 'columnName5': 'text', 'columnName6': 'text-convertible', 'columnName7': false ,'columnName8': true},
        {'columnName1': 'normal', 'columnName2': 1, 'columnName3': 1, 'columnName4': 1, 'columnName5': 'text', 'columnName6': 'text-convertible', 'columnName7': false ,'columnName8': true},
        {'columnName1': 'normal', 'columnName2': 1, 'columnName3': 1, 'columnName4': 1, 'columnName5': 'text', 'columnName6': 'text-convertible', 'columnName7': false ,'columnName8': true},
        {'columnName1': 'normal', 'columnName2': 1, 'columnName3': 1, 'columnName4': 1, 'columnName5': 'text', 'columnName6': 'text-convertible', 'columnName7': false ,'columnName8': true},
        {'columnName1': 'normal', 'columnName2': 1, 'columnName3': 1, 'columnName4': 1, 'columnName5': 'text', 'columnName6': 'text-convertible', 'columnName7': false ,'columnName8': true}
    ];
    var originalformData = {
        delivery_number: 1111,
        user_name: 'john_doe',
        weather: 'fall',
        gender: 'male',
        hobby: ['sport']
    };
    var grid,
        $form,
        $grid,
        net;

    beforeEach(function() {
        //jasmine.clock().install();
        //jasmine.Ajax.install();

        jasmine.getFixtures().fixturesPath = 'base/';
        loadFixtures('test/fixtures/addon.net.html');

        $form = $('#form');
        ne.util.setFormData(this.$el, originalformData);
        $grid = $('#grid');
        grid = new ne.Grid({
            el: $grid,
            columnModelList: columnModelList,
            selectType: 'checkbox'
        });
        window.alert = function(){};
        window.confirm = function(){return true};

        jasmine.clock().install();
        jasmine.Ajax.install();
        //grid.setRowList(rowList);
        //jasmine.clock().tick(10);

    });
    afterEach(function() {
        grid && grid.destroy();
        jasmine.Ajax.uninstall();
        jasmine.clock().uninstall();
    });

    function createNet(options) {
        grid.use('Net', options);
        net = grid.getAddOn('Net');
        net._isConfirmed = function(){return true;}
    }
    function createResponse() {
        var response = {
            readData: {

            },
            createData: {

            },
            updateData: {

            },
            deleteData: {

            },
            modifyData: {

            }
        };
    }
    describe('AddOn.Net 테스트', function() {
        beforeEach(function() {
            //grid.use('Net', {
            //    el: $('#form'),
            //    api: {
            //        'readData': '/api/read',
            //        'createData': '/api/create',
            //        'updateData': '/api/update',
            //        'deleteData': '/api/delete',
            //        'modifyData': '/api/modify',
            //        'downloadData': '/api/download',
            //        'downloadAllData': '/api/downloadAll'
            //    }
            //});
            //net = grid.getAddOn('Net');
        });
        describe('초기화 관련 메서드 확인', function() {
            describe('_initializeDataModelNetwork', function() {
                beforeEach(function() {
                    createNet({
                        el: $form,
                        api: {
                            'readData': '/api/read'
                        }
                    });
                });
                it('dataModel 의 network 설정을 확인한다.', function() {
                    expect(grid.core.dataModel.url).toBe('/api/read');
                    expect(typeof grid.core.dataModel.sync).toBe('function');
                });
            });
            describe('_initializeRouter', function() {
                describe('enableAjaxHistory 가 설정되어 있을때만 router 설정을 한다.', function() {
                    it('enableAjaxHistory on', function() {
                        createNet({
                            el: $form,
                            api: {
                                'readData': '/api/read'
                            },
                            enableAjaxHistory: true
                        });
                        expect(net.router).not.toBeNull();
                    });
                    it('enableAjaxHistory off', function() {
                        createNet({
                            el: $form,
                            api: {
                                'readData': '/api/read'
                            },
                            enableAjaxHistory: false
                        });
                        expect(net.router).toBeNull();
                    });
                });
            });
            describe('_ajax', function() {
                beforeEach(function() {
                    createNet({
                        el: $form,
                        api: {
                            'readData': '/api/read'
                        }
                    });
                });
                it('ajax 요청이 발생하는지 확인한다.', function() {

                    net._ajax({
                        url: '/api/test',
                        method: 'POST',
                        data: {
                            'param1': 1,
                            'param2': 2
                        }
                    });
                    var request = jasmine.Ajax.requests.mostRecent();
                    expect(request.url).toBe('/api/test');
                    expect(request.method).toBe('POST');
                    expect(request.data()).toEqual({
                        param1: ['1'],
                        param2: ['2']
                    });

                });
                it('grid 에서 beforeRequest 이벤트를 발생하는지 확인한다.', function() {
                    var listenModel = new Model.Base(),
                        callback = jasmine.createSpy('callback');

                    listenModel.listenTo(grid, 'beforeRequest', callback);

                    net._ajax({
                        url: '/api/test'
                    });
                });

                it('beforeRequest 이벤트 핸들러에서 stop() 을 호출하면 ajax 요청이 중지되는지 확인한다.', function() {
                    var listenModel = new Model.Base();

                    listenModel.listenTo(grid, 'beforeRequest', function(eventData) {
                        eventData.stop();
                    });

                    net._ajax({
                        url: '/api/stop'
                    });
                    var request = jasmine.Ajax.requests.mostRecent();
                    expect(request.url).not.toBe('/api/stop');
                });
            });
        });
        describe('_readDataAt', function() {
            it('기본적으로 ajaxHistory 를 사용하며, ajax history 를 사용한다면, router.navigate 를 호출하여 url 을 변경한다.', function() {
                createNet({
                    el: $form,
                    api: {
                        'readData': '/api/read'
                    }
                });
                net.router.navigate = jasmine.createSpy('navigate');
                net._readDataAt(1);
                jasmine.clock().tick(10);
                expect(net.router.navigate).toHaveBeenCalled();
            });

            it('isUsingRequestedData 가 true 일 경우, formData 변경여부와 관계없이 이전 질의한 데이터로 질의한다.', function() {
                var request,
                    beforeRequesteData,
                    afterRequesteData;

                createNet({
                    el: $form,
                    api: {
                        'readData': '/api/read'
                    }
                });

                net.router.navigate = jasmine.createSpy('navigate');
                net._readDataAt(1);
                request = jasmine.Ajax.requests.mostRecent();
                beforeRequesteData = $.extend(true, {}, request.data());
                //request 요청 후 form data 를 변경한다.
                net.setFormData({
                    delivery_number: 1111,
                    user_name: 'changed_name',
                    weather: 'fall',
                    gender: 'male',
                    hobby: ['sport']
                });
                net._readDataAt(1, true);
                request = jasmine.Ajax.requests.mostRecent();
                afterRequesteData = $.extend(true, {}, request.data());

                expect(beforeRequesteData).toEqual(afterRequesteData);
            });
        });
        describe('lock', function() {
            it('loading layer 를 보여주고, isLocked 를 true로 설정한다.', function() {
                createNet({
                    el: $form
                });

                grid.core.showGridLayer = jasmine.createSpy('showGridLayer');
                net._lock();
                expect(grid.core.showGridLayer).toHaveBeenCalledWith('loading');
                expect(net.isLocked).toBe(true);
            });
        });
        describe('unlock', function() {
            it('isLocked 를 false로 설정한다.', function() {
                createNet({
                    el: $form
                });
                net._lock();
                net._unlock();
                expect(net.isLocked).toBe(false);
            });
        });
        describe('_getDataParam', function() {
            function messUp() {
                grid.appendRow();
                grid.prependRow();
                grid.setValue(0, 'columnName1', 'Dirty');
                grid.setValue(1, 'columnName1', 'Dirty');
                grid.setValue(2, 'columnName1', 'Dirty');

                grid.removeRow(3);
            }
            it('type 이 createData 이고 기본옵션(isOnlyModified-true, isOnlyChecked=true) ', function() {
                var param,
                    updateList,
                    deleteList,
                    createList;

                createNet({
                    el: $form
                });
                grid.setRowList(rowList);
                jasmine.clock().tick(1);
                messUp();
                param = net._getDataParam('createData');
                updateList = $.parseJSON(param.data.updateList);
                deleteList = $.parseJSON(param.data.deleteList);
                createList = $.parseJSON(param.data.createList);

                expect(createList.length).toBe(2);
                expect(updateList.length).toBe(3);
                expect(deleteList.length).toBe(1);
                expect(param.count).toBe(2);

                grid.uncheckAll();
                param = net._getDataParam('createData');
                updateList = $.parseJSON(param.data.updateList);
                deleteList = $.parseJSON(param.data.deleteList);
                createList = $.parseJSON(param.data.createList);

                expect(createList.length).toBe(0);
                expect(updateList.length).toBe(0);

                //delete 는 checked 와 관계없다.
                expect(deleteList.length).toBe(1);
                expect(param.count).toBe(0);
            });
            it('type 이 createData 이고 isOnlyChecked=false ', function() {
                var param,
                    updateList,
                    deleteList,
                    createList;

                createNet({
                    el: $form
                });
                grid.setRowList(rowList);
                jasmine.clock().tick(1);
                messUp();
                param = net._getDataParam('createData', {isOnlyChecked: false});
                updateList = $.parseJSON(param.data.updateList);
                deleteList = $.parseJSON(param.data.deleteList);
                createList = $.parseJSON(param.data.createList);

                expect(createList.length).toBe(2);
                expect(updateList.length).toBe(3);
                expect(deleteList.length).toBe(1);
                expect(param.count).toBe(2);

                grid.uncheckAll();
                param = net._getDataParam('createData', {isOnlyChecked: false});
                updateList = $.parseJSON(param.data.updateList);
                deleteList = $.parseJSON(param.data.deleteList);
                createList = $.parseJSON(param.data.createList);

                expect(createList.length).toBe(2);
                expect(updateList.length).toBe(3);
                expect(deleteList.length).toBe(1);
                expect(param.count).toBe(2);
            });
            it('isOnlyModified=false, isOnlyChecked=false ', function() {
                var param,
                    rowList;

                createNet({
                    el: $form
                });
                grid.setRowList(rowList);
                jasmine.clock().tick(1);
                messUp();
                param = net._getDataParam('createData', {isOnlyChecked: false, isOnlyModified: false});
                expect(param.data.rowList).toBeDefined();
                expect(param.data.createList).not.toBeDefined();
                expect(param.data.updateList).not.toBeDefined();
                expect(param.data.deleteList).not.toBeDefined();
                expect(param.count).toBe(grid.getRowCount());
            });

            it('type 이 updateData 이고 기본옵션(isOnlyModified-true, isOnlyChecked=true) ', function() {
                var param;

                createNet({
                    el: $form
                });
                grid.setRowList(rowList);
                jasmine.clock().tick(1);
                messUp();
                param = net._getDataParam('updateData');
                expect(param.count).toBe(3);

                grid.uncheckAll();
                param = net._getDataParam('updateData');
                expect(param.count).toBe(0);
            });
            it('type 이 updateData 이고 isOnlyChecked=false ', function() {
                var param;

                createNet({
                    el: $form
                });
                grid.setRowList(rowList);
                jasmine.clock().tick(1);
                messUp();
                param = net._getDataParam('updateData', {isOnlyChecked: false});
                expect(param.count).toBe(3);

                grid.uncheckAll();
                param = net._getDataParam('updateData', {isOnlyChecked: false});
                expect(param.count).toBe(3);
            });

            it('type 이 deleteData 이고 기본옵션(isOnlyModified-true, isOnlyChecked=true) ', function() {
                var param;

                createNet({
                    el: $form
                });
                grid.setRowList(rowList);
                jasmine.clock().tick(1);
                messUp();
                param = net._getDataParam('deleteData');
                expect(param.count).toBe(1);

                grid.uncheckAll();
                param = net._getDataParam('deleteData');
                expect(param.count).toBe(1);
            });
            it('type 이 deleteData 이고 isOnlyChecked=false ', function() {
                var param;

                createNet({
                    el: $form
                });
                grid.setRowList(rowList);
                jasmine.clock().tick(1);
                messUp();
                param = net._getDataParam('deleteData', {isOnlyChecked: false});
                expect(param.count).toBe(1);

                grid.uncheckAll();
                param = net._getDataParam('deleteData', {isOnlyChecked: false});
                expect(param.count).toBe(1);
            });
            it('type 이 modifyData 이고 기본옵션(isOnlyModified-true, isOnlyChecked=true) ', function() {
                var param;

                createNet({
                    el: $form
                });
                grid.setRowList(rowList);
                jasmine.clock().tick(1);
                messUp();
                param = net._getDataParam('modifyData');
                expect(param.count).toBe(6);

                grid.uncheckAll();
                param = net._getDataParam('modifyData');
                expect(param.count).toBe(1);
            });
            it('type 이 modifyData 이고 isOnlyChecked=false ', function() {
                var param;

                createNet({
                    el: $form
                });
                grid.setRowList(rowList);
                jasmine.clock().tick(1);
                messUp();
                param = net._getDataParam('modifyData', {isOnlyChecked: false});
                expect(param.count).toBe(6);

                grid.uncheckAll();
                param = net._getDataParam('modifyData', {isOnlyChecked: false});
                expect(param.count).toBe(6);
            });

        });
        describe('_getConfirmMessage', function() {
            beforeEach(function() {
                createNet({
                    el: $form
                });
            });
            it('createData', function() {
                expect(net._getConfirmMessage('createData', 3)).toEqual('3건의 데이터를 입력하시겠습니까?');
                expect(net._getConfirmMessage('updateData', 3)).toEqual('3건의 데이터를 수정하시겠습니까?');
                expect(net._getConfirmMessage('deleteData', 3)).toEqual('3건의 데이터를 삭제하시겠습니까?');
                expect(net._getConfirmMessage('modifyData', 3)).toEqual('3건의 데이터를 반영하시겠습니까?');

                expect(net._getConfirmMessage('createData', 0)).toEqual('입력할 데이터가 없습니다.');
                expect(net._getConfirmMessage('updateData', 0)).toEqual('수정할 데이터가 없습니다.');
                expect(net._getConfirmMessage('deleteData', 0)).toEqual('삭제할 데이터가 없습니다.');
                expect(net._getConfirmMessage('modifyData', 0)).toEqual('반영할 데이터가 없습니다.');

            });
        });
        describe('request', function() {
            beforeEach(function() {
                createNet({
                    el: $form
                });
                grid.setRowList(rowList);
                jasmine.clock().tick(1);
                grid.appendRow();
                net._ajax = jasmine.createSpy('ajax');
            });
            it('ajax call 을 호출한다.', function() {
                net.request('createData');
                expect(net._ajax).toHaveBeenCalled();
            });
            it('_getRequestParam 의 반환값이 없다면 ajax call 을 호출하지 않는다.', function() {
                net._getRequestParam = function() {return null;};
                net.request('createData');
                expect(net._ajax).not.toHaveBeenCalled();
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
                createNet({
                    el: $form
                });
                responseData = {
                    success: {
                        'result': true,
                        'data' : []
                    },
                    failed: {
                        'result': false,
                        'data' : []
                    }
                };
                options = {
                    requestType: 'POST',
                    data: {
                        'data1': 1,
                        'data2': 2
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
                grid.on('successResponse', function(eventData) {eventData.stop();})
                    .on('failResponse', failResponse)
                    .on('response', response);

                net._onSuccess(callback, options, responseData.success, 200);

                expect(callback).not.toHaveBeenCalled();
                expect(response).toHaveBeenCalled();
                expect(failResponse).not.toHaveBeenCalled();
            });
            it('정상이지만 response 에서 stop 을 호출했을 때', function() {
                grid.on('successResponse', successResponse)
                    .on('failResponse', failResponse)
                    .on('response', function(eventData) {eventData.stop();});

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
        describe('_onComplete', function() {
            it('unlock 을 호출하는지 확인한다.', function() {
                createNet({
                    el: $form
                });
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
                createNet({
                    el: $form
                });
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
                expect(window.alert).toHaveBeenCalledWith('데이터 요청 중에 에러가 발생하였습니다.\n\n다시 시도하여 주시기 바랍니다.');
            });
            it('response 에서 stop 을 호출했을 때', function() {
                window.alert = jasmine.createSpy('alert');
                grid.on('errorResponse', errorResponse)
                    .on('response', function(eventData) {eventData.stop();});
                net._onError(callback, options, {readyState: 10});
                expect(errorResponse).not.toHaveBeenCalled();
                expect(window.alert).not.toHaveBeenCalled();
            });
            it('errorResponse 에서 stop 을 호출했을 때', function() {
                window.alert = jasmine.createSpy('alert');
                grid.on('errorResponse', function(eventData) {eventData.stop();})
                    .on('response', response);
                net._onError(callback, options, {readyState: 10});
                expect(response).toHaveBeenCalled();
                expect(window.alert).not.toHaveBeenCalled();
            });
        });
        describe('_onReadSuccess', function() {
            beforeEach(function() {
                createNet({
                    el: $form
                });
                net.pagination.movePageTo = jasmine.createSpy('movePageTo');
                net.pagination._setOption = jasmine.createSpy('setOption');
            });
            it('responseData 에 pagination 정보가 있다면 pagination instance 에 설정한다.', function() {
                net._onReadSuccess(null, {
                    pagination: {
                        page: 10,
                        totalCount: 100
                    }
                });
                expect(net.pagination._setOption).toHaveBeenCalledWith('itemPerPage', net.perPage);
                expect(net.pagination._setOption).toHaveBeenCalledWith('itemCount', 100);
                expect(net.pagination.movePageTo).toHaveBeenCalledWith(10);
            });
        });
        describe('_onPageBeforeMove', function() {
            var customEvent;
            beforeEach(function() {
                createNet({
                    el: $form
                });
                net._readDataAt = jasmine.createSpy('readDataAt');
                customEvent = {
                    page: 10
                };
            });
            it('curPage 가 인자로 넘어온 page 와 다르다면 readAt 을 호출한다.', function() {
                net.curPage = 11;
                net._onPageBeforeMove(customEvent);
                expect(net._readDataAt).toHaveBeenCalled();
            });
            it('curPage 가 인자로 넘어온 page 와 같다면 readAt 을 호출하지 않는다..', function() {
                net.curPage = 10;
                net._onPageBeforeMove(customEvent);
                expect(net._readDataAt).not.toHaveBeenCalled();
            });
        });
        it('ajax mock test', function() {
            var onSuccess = jasmine.createSpy('onSuccess'),
                onFailure = jasmine.createSpy('onFailure');
            $.ajax({
                url: 'http://nate.com'
            });
            var request = jasmine.Ajax.requests.mostRecent();
        });
    });
    describe('AddOn.Net.Router', function() {
        it('read 시 쿼리스트링을 잘 파싱해서 폼 설정 후 readData 를 호출하는지 확인한다.', function() {
            createNet({
                el: $form
            });
            net.setFormData = jasmine.createSpy('setFormData');
            net.readData = jasmine.createSpy('readData');
            net.router.read('a=10&b=20');

            expect(net.setFormData).toHaveBeenCalledWith({
                a: 10,
                b: 20
            });
            expect(net.readData).toHaveBeenCalledWith({
                a: 10,
                b: 20
            });
        });
    });
});
