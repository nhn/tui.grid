'use strict';

describe('core.util', function() {
    beforeEach(function() {
        jasmine.getFixtures().fixturesPath = 'base/';
        loadFixtures('test/fixtures/util.template.html');
    });
    describe('Rendering 시 계산에 사용되는 메서드를 테스트한다..', function() {
        it('getHeight()', function() {
            var rowHeight = 100;
            expect(Util.getHeight(0, rowHeight)).toBe(0);
            expect(Util.getHeight(1, rowHeight)).toBe(102);
            expect(Util.getHeight(100, rowHeight)).toBe(10101);
        });

        it('getDisplayRowCount()', function() {
            var rowHeight = 100;
            expect(Util.getDisplayRowCount(0, rowHeight)).toBe(0);
            expect(Util.getDisplayRowCount(102, rowHeight)).toBe(1);
            expect(Util.getDisplayRowCount(10101, rowHeight)).toBe(100);
        });

        it('getRowHeight()', function() {
            expect(Util.getRowHeight(0, 0)).toBe(0);
            expect(Util.getRowHeight(1, 102)).toBe(100);
            expect(Util.getRowHeight(100, 10101)).toBe(100);
        });
    });

    describe('isEqual()', function() {
        it('Object 형을 비교할 수 있다.', function() {
            expect(Util.isEqual(
                {'prop1': 1, 'prop2': 2},
                {'prop1': 1, 'prop2': 2}
            )).toBe(true);
            expect(Util.isEqual(
                {'prop1': 1, 'prop2': 2, 'prop3': 3},
                {'prop1': 1, 'prop2': 2}
            )).toBe(false);
            expect(Util.isEqual(
                {'prop1': 1, 'prop2': 2},
                {'prop1': 1, 'prop2': 2, 'prop3': 3}
            )).toBe(false);
            expect(Util.isEqual(
                {'prop1': 1, 'prop2': '2'},
                {'prop1': 1, 'prop2': 2}
            )).toBe(false);
        });
        it('배열을 비교할 수 있다.', function() {
            expect(Util.isEqual(
                [0, 1, 2],
                [0, 1, 2]
            )).toBe(true);
            expect(Util.isEqual(
                [0, 1, '2'],
                [0, 1, 2]
            )).toBe(false);
            expect(Util.isEqual(
                [0, 1],
                [0, 1, 2]
            )).toBe(false);
            expect(Util.isEqual(
                [0, 1, 2],
                [0, 1]
            )).toBe(false);
        });
        it('배열과 Object 는 서로 다르다.', function() {
            expect(Util.isEqual(
                [0, 1, 2],
                {
                    0: 0,
                    1: 1,
                    2: 2
                }
            )).toBe(false);
        });
        it('primitive type 을 비교할 수 있다.', function() {
            expect(Util.isEqual(1, 1)).toBe(true);
            expect(Util.isEqual(1, '1')).toBe(false);
            expect(Util.isEqual(1, 2)).toBe(false);
            expect(Util.isEqual(true, true)).toBe(true);
            expect(Util.isEqual(true, 1)).toBe(false);
            expect(Util.isEqual(true, false)).toBe(false);
        });
    });

    describe('stripTags()', function() {
        it('image tag 가 포함된 경우 무조건 src 안의 내용만 반환한다.', function() {
            var htmlStr = $('#img').html(),
                expectStr = 'http://www.nhnent.com/ko/index.nhn?id=test';
            expect(Util.stripTags(htmlStr)).toBe(expectStr);

            htmlStr += $('#button').html();
            htmlStr += $('#anchor').html();
            expect(Util.stripTags(htmlStr)).toBe(expectStr);
        });
        it('button tag 가 포함된 경우 <button> </button> 사이의 내용을 모두 제거한다.', function() {
            var htmlStr = $('#button').html(),
                expectStr = 'Button  End of Example';
            expect(Util.stripTags(htmlStr)).toBe(expectStr);
        });
        it('anchor tag 가 포함된 경우 태그만 제거한다.', function() {
            var htmlStr = $('#anchor').html(),
                expectStr = 'Anchor Link End of Example';
            expect(Util.stripTags(htmlStr)).toBe(expectStr);
        });
        it('button 과 anchor 가 둘다 포함된 경우 button 은 태그 사이 내용 모두 제거하고 anchor 는 태그만 제거한다', function() {
            var htmlStr = $('#button').html() + $('#anchor').html(),
                expectStr = 'Button  End of ExampleAnchor Link End of Example';
            expect(Util.stripTags(htmlStr)).toBe(expectStr);
        });
    });

    describe('getUniqueKey()', function() {
        it('반드시 unique 한 key 를 반환해야 한다.', function() {
            var i = 0,
                next,
                len = 100000,
                keyList = [],
                sortedKeyList;
            for (; i < len; i++) {
                keyList.push(Util.getUniqueKey());
            }
            sortedKeyList = keyList.sort();

            for (; i < len; i++) {
                next = i + 1;
                if (next !== len) {
                    expect(sortedKeyList[i]).not.toEqual(sortedKeyList[next]);
                }
            }
        });
    });

    describe('Ajax history 에 사용되는 queryString 조작 메서드를 테스트 한다.', function() {
        it('toQueryString() 과 toQueryObject 의 상호 호환을 검증한다.', function() {
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
            var queryString = Util.toQueryString(queryObject);
            expect(Util.toQueryObject(queryString)).toEqual(queryObject);
        });
    });
});
