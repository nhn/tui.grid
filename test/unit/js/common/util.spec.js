'use strict';

var $ = require('jquery');

var util = require('common/util');

describe('core.util', function() {
    beforeEach(function() {
        jasmine.getFixtures().fixturesPath = 'base/';
        loadFixtures('test/unit/fixtures/util.template.html');
    });

    describe('sum()', function() {
        it('배열의 합을 반환한다.', function() {
            expect(util.sum([10, 20, 30, 40])).toBe(100);
            expect(util.sum([10])).toBe(10);
            expect(util.sum([100, 100, 100, 100, 100, 100])).toBe(600);
        });
    });

    describe('Rendering시 계산에 사용되는 메서드 : ', function() {
        it('getHeight()는 Row count 개수에 대응하는 table height를 반환한다.', function() {
            var rowHeight = 100;
            expect(util.getHeight(0, rowHeight)).toBe(0);
            expect(util.getHeight(1, rowHeight)).toBe(101);
            expect(util.getHeight(100, rowHeight)).toBe(10100);
        });

        it('getDisplayRowCount()는 화면상에 표시되는 Row 개수를 반환한다.', function() {
            var rowHeight = 100;
            expect(util.getDisplayRowCount(0, rowHeight)).toBe(0);
            expect(util.getDisplayRowCount(101, rowHeight)).toBe(1);
            expect(util.getDisplayRowCount(10100, rowHeight)).toBe(100);
        });

        it('getRowHeight()는 테이블 높이를 행 개수로 나눈 값이다.', function() {
            expect(util.getRowHeight(0, 0)).toBe(0);
            expect(util.getRowHeight(1, 101)).toBe(100);
            expect(util.getRowHeight(100, 10100)).toBe(100);
        });
    });

    describe('isEqual()', function() {
        it('Object 형을 비교할 수 있다.', function() {
            expect(util.isEqual(
                {
                    'prop1': 1,
                    'prop2': 2
                },
                {
                    'prop1': 1,
                    'prop2': 2
                }
            )).toBe(true);
            expect(util.isEqual(
                {
                    'prop1': 1,
                    'prop2': 2,
                    'prop3': 3
                },
                {
                    'prop1': 1,
                    'prop2': 2
                }
            )).toBe(false);
            expect(util.isEqual(
                {
                    'prop1': 1,
                    'prop2': 2
                },
                {
                    'prop1': 1,
                    'prop2': 2,
                    'prop3': 3
                }
            )).toBe(false);
            expect(util.isEqual(
                {
                    'prop1': 1,
                    'prop2': '2'
                },
                {
                    'prop1': 1,
                    'prop2': 2
                }
            )).toBe(false);
        });

        it('배열을 비교할 수 있다.', function() {
            expect(util.isEqual(
                [0, 1, 2],
                [0, 1, 2]
            )).toBe(true);
            expect(util.isEqual(
                [0, 1, '2'],
                [0, 1, 2]
            )).toBe(false);
            expect(util.isEqual(
                [0, 1],
                [0, 1, 2]
            )).toBe(false);
            expect(util.isEqual(
                [0, 1, 2],
                [0, 1]
            )).toBe(false);
        });

        it('배열과 Object는 서로 다르다.', function() {
            expect(util.isEqual(
                [0, 1, 2],
                {
                    0: 0,
                    1: 1,
                    2: 2
                }
            )).toBe(false);
        });

        it('primitive type을 비교할 수 있다.', function() {
            expect(util.isEqual(1, 1)).toBe(true);
            expect(util.isEqual(1, '1')).toBe(false);
            expect(util.isEqual(1, 2)).toBe(false);
            expect(util.isEqual(true, true)).toBe(true);
            expect(util.isEqual(true, 1)).toBe(false);
            expect(util.isEqual(true, false)).toBe(false);
        });
    });

    describe('stripTags()', function() {
        it('image tag가 포함된 경우 무조건 src 안의 내용만 반환한다.', function() {
            var htmlStr = $('#img').html(),
                expectStr = 'http://www.nhnent.com/ko/index.nhn?id=test';
            expect(util.stripTags(htmlStr)).toBe(expectStr);

            htmlStr += $.trim($('#button').html());
            htmlStr += $.trim($('#anchor').html());
            expect(util.stripTags(htmlStr)).toBe(expectStr);
        });

        it('button tag가 포함된 경우 <button> </button> 사이의 내용을 모두 제거한다.', function() {
            var htmlStr = $.trim($('#button').html()),
                expectStr = 'ButtonEnd of Example';
            expect(util.stripTags(htmlStr)).toBe(expectStr);
        });

        it('anchor tag가 포함된 경우 태그만 제거한다.', function() {
            var htmlStr = $.trim($('#anchor').html()),
                expectStr = 'Anchor LinkEnd of Example';
            expect(util.stripTags(htmlStr)).toBe(expectStr);
        });

        it('button과 anchor가 둘다 포함된 경우 button은 태그 사이 내용 모두 제거하고 anchor는 태그만 제거한다', function() {
            var htmlStr = $.trim($('#button').html()) + $.trim($('#anchor').html()),
                expectStr = 'ButtonEnd of ExampleAnchor LinkEnd of Example';
            expect(util.stripTags(htmlStr)).toBe(expectStr);
        });
    });

    describe('getUniqueKey()', function() {
        it('반드시 unique한 key 를 반환해야 한다.', function() {
            var i = 0,
                next,
                len = 100000,
                keyList = [],
                sortedKeyList;

            for (; i < len; i += 1) {
                keyList.push(util.getUniqueKey());
            }
            sortedKeyList = keyList.sort();

            for (; i < len; i += 1) {
                next = i + 1;
                if (next !== len) {
                    expect(sortedKeyList[i]).not.toEqual(sortedKeyList[next]);
                }
            }
        });
    });

    describe('Ajax history에 사용되는 queryString 조작 메서드를 테스트 한다.', function() {
        it('toQueryString()과 toQueryObject()의 상호 호환을 검증한다.', function() {
            var queryObject = {
                name: 'Peter',
                age: 24,
                height: 180,
                family: {
                    mother: true,
                    father: true,
                    brother: {
                        list: ['Tom', 'Amy']
                    }
                },
                car: 'Ferrari'
            };
            var queryString = util.toQueryString(queryObject);
            expect(util.toQueryObject(queryString)).toEqual(queryObject);
        });
    });

    describe('convertValueType()', function() {
        it('인자로 들어온 타입으로 변환한다.', function() {
            var str = '1';
            var num = 1;
            var obj = {};
            var arr = [1, 2, 3];

            expect(util.convertValueType(str, 'string')).toEqual(str);
            expect(util.convertValueType(str, 'number')).toEqual(num);

            expect(util.convertValueType(num, 'string')).toEqual(str);
            expect(util.convertValueType(num, 'number')).toEqual(num);

            expect(util.convertValueType(obj, 'string')).toEqual('[object Object]');
            expect(util.convertValueType(obj, 'number')).toEqual(NaN);

            expect(util.convertValueType(arr, 'string')).toEqual('1,2,3');
            expect(util.convertValueType(arr, 'number')).toEqual(NaN);

            expect(util.convertValueType(num, 'nothing')).toEqual(num);
            expect(util.convertValueType(str, 'nothing')).toEqual(str);
            expect(util.convertValueType(obj, 'nothing')).toEqual(obj);
            expect(util.convertValueType(arr, 'nothing')).toEqual(arr);
        });
    });

    describe('clamp', function() {
        it('should return 1 when value = 1, min = 0, max = 2', function() {
            expect(util.clamp(1, 0, 2)).toBe(1);
        });
        it('should return 0 when value = -1, min = 0, max = 1', function() {
            expect(util.clamp(-1, 0, 1)).toBe(0);
        });
        it('should return 1 when value = 2, min = 0, max = 1', function() {
            expect(util.clamp(2, 0, 1)).toBe(1);
        });
    });

    it('appendStyleElement() create a style element and append it to the document', function() {
        var styleId = 'my-style';
        var $styleEl, $divEl;

        jasmine.getFixtures().set('<div id="my-div"></div>');
        util.appendStyleElement(styleId, '#my-div {width: 100px; height: 100px}');

        $styleEl = $('#my-style');
        $divEl = $('#my-div');

        expect($styleEl[0].tagName.toUpperCase()).toBe('STYLE');
        expect($styleEl[0].type).toBe('text/css');
        expect($divEl.width()).toBe(100);
        expect($divEl.height()).toBe(100);
    });

    it('replaceText() replace text including "{{*}} pattern" to matched value.', function() {
        var replaceValue = {
            prop: 'hello'
        };
        var text = '{{prop}} world';
        var replacedText;

        replacedText = util.replaceText(text, replaceValue);

        expect(replacedText).toBe('hello world');
    });

    describe('isRightClickEvent() returns result of detecting right button by event', function() {
        var result;

        it('when mouse event has "which" property and this value is 3, the result is true.', function() {
            result = util.isRightClickEvent({
                which: 3
            });

            expect(result).toBe(true);
        });

        it('when mouse event has "button" property and this value is 2, the result is true.', function() {
            result = util.isRightClickEvent({
                button: 2
            });

            expect(result).toBe(true);
        });
    });
});
