'use strict';

var $ = require('jquery');

var snippet = require('tui-code-snippet');

var formUtil = require('common/formUtil');

describe('core.formUtil', function() {
    var $form;

    beforeEach(function() {
        jasmine.getFixtures().fixturesPath = 'base/';
        loadFixtures('test/unit/fixtures/form.html');
    });

    describe('getFormElement()', function() {
        beforeEach(function() {
            $form = $('#test_form');
        });

        it('name에 해당하는 input이 존재하지 않는 경우 길이가 0인 배열을 반환한다.', function() {
            var $element = formUtil.getFormElement($form, 'notFoundDeliveryNumber');
            expect($element.length).toEqual(0);
        });

        it('$form이 존재하지 않는 경우 길이가 0인 배열을 반환한다.', function() {
            var $element = formUtil.getFormElement('', 'deliveryNumber');
            expect($element.length).toEqual(0);
        });

        it('name에 해당하는 input요소들을 배열 형태로 반환한다.', function() {
            var names = ['deliveryNumber', 'userName', 'weather'];
            snippet.forEachArray(names, function(name) {
                var element = formUtil.getFormElement($form, name);
                expect(element.length).toBe(1);
                expect(element[0].name).toBe(name);
            });
            expect(formUtil.getFormElement($form, 'gender').length).toBe(2);
            expect(formUtil.getFormElement($form, 'hobby').length).toBe(4);
        });
    });

    describe('getFormData()', function() {
        describe('Form에 설정된 데이터를 object 형태로 반환한다.', function() {
            beforeEach(function() {
                $form = $('#test_form_empty');
                $form.html('');
            });

            it('text input의 데이터를 가져올 수 있다.', function() {
                var htmlText = '<input type="text" name="userName" value="defaultText"/>',
                    formData,
                    expectResult = 'defaultText';
                $form.append(htmlText);

                formData = formUtil.getFormData($form);
                expect(formData.userName).toEqual(expectResult);
            });

            it('select의 데이터를 가져올 수 있다.', function() {
                var htmlText = '<select name="weather">' +
                        '<option value="spring">봄</option>' +
                        '<option value="summer" selected>여름</option>' +
                        '<option value="fall">가을</option>' +
                        '<option value="winter">겨울</option>' +
                        '</select>',
                    expectResult = 'summer',
                    formData;
                $form.append(htmlText);
                formData = formUtil.getFormData($form);
                expect(formData.weather).toEqual(expectResult);
            });

            it('2개 이상 선택된 multiple select 의 데이터를 가져올 수 있다.', function() {
                var htmlText = '<select multiple="" name="drink">' +
                        '<option value="soju" selected>소주</option>' +
                        '<option value="beer">맥주</option>' +
                        '<option value="koreanWine">막걸리</option>' +
                        '<option value="redWine">레드와인</option>' +
                        '<option value="whiteWine">화이트와인</option>' +
                        '<option value="whiskey" selected>위스키</option>' +
                        '<option value="vodca">보드카</option>' +
                        '</select>',
                    expectResult = ['soju', 'whiskey'],
                    formData;
                $form.append(htmlText);
                formData = formUtil.getFormData($form);
                expect(formData.drink).toEqual(expectResult);
            });

            it('1개 선택된 multiple select 의 데이터를 가져올 수 있다.', function() {
                var htmlText = '<select multiple="" name="drink">' +
                        '<option value="soju">소주</option>' +
                        '<option value="beer">맥주</option>' +
                        '<option value="koreanWine">막걸리</option>' +
                        '<option value="redWine">레드와인</option>' +
                        '<option value="whiteWine">화이트와인</option>' +
                        '<option value="whiskey" selected>위스키</option>' +
                        '<option value="vodca">보드카</option>' +
                        '</select>',
                    expectResult = 'whiskey',
                    formData;
                $form.append(htmlText);
                formData = formUtil.getFormData($form);
                expect(formData.drink).toEqual(expectResult);
            });

            it('radio input 의 데이터를 가져올 수 있다.', function() {
                var htmlText = '<input type="radio" name="gender" value="male"/>남' +
                        '<input type="radio" name="gender" value="female" checked/>여',
                    expectResult = 'female',
                    formData;

                $form.append(htmlText);

                formData = formUtil.getFormData($form);
                expect(formData.gender).toEqual(expectResult);
            });

            it('2개 이상 선택된 checkbox input 의 데이터를 가져올 수 있다.', function() {
                var htmlText = '<input type="checkbox" name="hobby" value="sport"/>스포츠' +
                        '<input type="checkbox" name="hobby" value="sewing" checked/>재봉틀' +
                        '<input type="checkbox" name="hobby" value="drinking" checked/>음주' +
                        '<input type="checkbox" name="hobby" value="dancing"/>가무',
                    expectResult = ['sewing', 'drinking'],
                    formData;

                $form.append(htmlText);

                formData = formUtil.getFormData($form);
                expect(formData.hobby).toEqual(expectResult);
            });

            it('1개 선택된 checkbox input 의 데이터를 가져올 수 있다.', function() {
                var htmlText = '<input type="checkbox" name="hobby" value="sport"/>스포츠' +
                        '<input type="checkbox" name="hobby" value="sewing"/>재봉틀' +
                        '<input type="checkbox" name="hobby" value="drinking" checked/>음주' +
                        '<input type="checkbox" name="hobby" value="dancing"/>가무',
                    expectResult = 'drinking',
                    formData;

                $form.append(htmlText);

                formData = formUtil.getFormData($form);
                expect(formData.hobby).toEqual(expectResult);
            });
        });
    });

    describe('setFormElementValue()', function() {
        describe('form의 각 인풋 요소에 값을 설정할 수 있다.', function() {
            beforeEach(function() {
                $form = $('#test_form_empty');
                $form.html('');
            });

            it('text input에 값을 설정할 수 있다.', function() {
                var htmlText = '<input type="text" name="userName"/>',
                    formData,
                    expectResult = 'defaultText';

                $form.append(htmlText);
                formUtil.setFormElementValue($form, 'userName', expectResult);

                formData = formUtil.getFormData($form);
                expect(formData.userName).toEqual(expectResult);
            });

            it('select 요소의 값을 설정할 수 있다.', function() {
                var htmlText = '<select name="weather">' +
                        '<option value="spring">봄</option>' +
                        '<option value="summer">여름</option>' +
                        '<option value="fall">가을</option>' +
                        '<option value="winter">겨울</option>' +
                        '</select>',
                    expectResult = 'winter',
                    formData;

                $form.append(htmlText);
                formUtil.setFormElementValue($form, 'weather', expectResult);
                formData = formUtil.getFormData($form);
                expect(formData.weather).toEqual(expectResult);
            });

            describe('multiple select 요소의 값을 설정할 수 있다.', function() {
                var htmlText,
                    expectResult,
                    formData;

                beforeEach(function() {
                    htmlText = '<select multiple="" name="drink">' +
                    '<option value="1">1번소주</option>' +
                    '<option value="soju">소주</option>' +
                    '<option value="beer">맥주</option>' +
                    '<option value="koreanWine">막걸리</option>' +
                    '<option value="redWine">레드와인</option>' +
                    '<option value="whiteWine">화이트와인</option>' +
                    '<option value="whiskey">위스키</option>' +
                    '<option value="vodca">보드카</option>' +
                    '</select>';
                    $form.append(htmlText);
                });

                it('배열을 인자로 하여 설정할 수 있다', function() {
                    expectResult = ['redWine', 'whiteWine'];
                    formUtil.setFormElementValue($form, 'drink', expectResult);
                    formData = formUtil.getFormData($form);
                    expect(formData.drink).toEqual(expectResult);

                    formUtil.setFormElementValue($form, 'drink', ['redWine']);
                    formData = formUtil.getFormData($form);
                    expect(formData.drink).toEqual('redWine');
                });

                it('String 형태 인자로 설정할 수 있다.', function() {
                    expectResult = 'redWine';
                    formUtil.setFormElementValue($form, 'drink', expectResult);
                    formData = formUtil.getFormData($form);
                    expect(formData.drink).toEqual(expectResult);
                });

                it('Number 형태도 사용 가능하다.', function() {
                    expectResult = '1';
                    formUtil.setFormElementValue($form, 'drink', 1);
                    formData = formUtil.getFormData($form);
                    expect(formData.drink).toEqual(expectResult);
                });
            });

            it('radio input 의 값을 설정할 수 있다.', function() {
                var htmlText = '<input type="radio" name="gender" value="male"/>남' +
                        '<input type="radio" name="gender" value="female"/>여',
                    expectResult = 'male',
                    formData;

                $form.append(htmlText);
                formUtil.setFormElementValue($form, 'gender', expectResult);

                formData = formUtil.getFormData($form);
                expect(formData.gender).toEqual(expectResult);
            });

            describe('checkbox input 의 값을 설정할 수 있다.', function() {
                var htmlText,
                    expectResult,
                    formData;

                beforeEach(function() {
                    htmlText = '<input type="checkbox" name="hobby" value="1"/>넘버원' +
                    '<input type="checkbox" name="hobby" value="sport"/>스포츠' +
                    '<input type="checkbox" name="hobby" value="sewing"/>재봉틀' +
                    '<input type="checkbox" name="hobby" value="drinking"/>음주' +
                    '<input type="checkbox" name="hobby" value="dancing"/>가무';
                    $form.append(htmlText);
                });

                it('배열을 인자로 하여 설정할 수 있다', function() {
                    expectResult = ['sewing', 'drinking', 'sport', 'dancing'];

                    formUtil.setFormElementValue($form, 'hobby', expectResult);
                    formData = formUtil.getFormData($form);
                    expect(formData.hobby.sort()).toEqual(expectResult.sort());

                    formUtil.setFormElementValue($form, 'hobby', ['sewing']);
                    formData = formUtil.getFormData($form);
                    expect(formData.hobby).toEqual('sewing');
                });

                it('String 형태 인자로 설정할 수 있다.', function() {
                    expectResult = 'sewing';
                    formUtil.setFormElementValue($form, 'hobby', expectResult);

                    formData = formUtil.getFormData($form);
                    expect(formData.hobby).toEqual(expectResult);
                });

                it('Number 형태도 사용 가능하다.', function() {
                    expectResult = '1';
                    formUtil.setFormElementValue($form, 'hobby', 1);

                    formData = formUtil.getFormData($form);
                    expect(formData.hobby).toEqual(expectResult);
                });
            });
        });
    });

    describe('setFormData()', function() {
        var sampleFormData;

        beforeEach(function() {
            sampleFormData = {
                'deliveryNumber': 1000,
                'userName': 'john',
                'weather': 'summer',
                'gender': 'male',
                'drink': ['soju', 'whiteWine'],
                'hobby': ['sport', 'dancing']
            };
            $form = $('#test_form');
        });

        it('Object 형태의 데이터를 전달하여 form 엘리먼트들의 data 들을 설정할 수 있다.', function() {
            var formData;
            formUtil.setFormData($form, sampleFormData);
            sampleFormData.deliveryNumber = String(sampleFormData.deliveryNumber);
            formData = formUtil.getFormData($form);
            expect(formData).toEqual(sampleFormData);
        });
    });
});
