'use strict';

var builder = require('theme/cssRuleBuilder');

describe('theme.cssRuleBuilder', function() {
    it('create() without selector string throws an execption', function() {
        function createWithNumber() {
            builder.create(1);
        }

        function createWithEmpthString() {
            builder.create('');
        }

        function createWithNull() {
            builder.create(null);
        }

        expect(createWithNumber).toThrow();
        expect(createWithEmpthString).toThrow();
        expect(createWithNull).toThrow();
    });

    it('build() returns empty string if there are nothing added', function() {
        expect(builder.create('div').build()).toBe('');
    });

    describe('add():', function() {
        it('append "property:value" string to the rule', function() {
            var rule = builder.create('div');

            rule.add('color', 'red');
            expect(rule.build()).toBe('div{color:red}');
        });

        it('returns an instance object', function() {
            var rule = builder.create('div');

            expect(rule.add('color', 'red')).toBe(rule);
        });

        it('if called multiple times, concatenate added strings with semicolon', function() {
            var rule = builder.create('div')
                .add('color', 'red')
                .add('padding', '1px')
                .add('background-color', '#fff');

            expect(rule.build()).toBe('div{color:red;padding:1px;background-color:#fff}');
        });
    });

    describe('shortcuts of the add():', function() {
        var rule;

        beforeEach(function() {
            rule = builder.create('div');
            spyOn(rule, 'add').and.callThrough();
        });

        it('bg() for the background-color', function() {
            rule.bg('red');
            expect(rule.add).toHaveBeenCalledWith('background-color', 'red');
        });

        it('border() for the border-color', function() {
            rule.border('blue');
            expect(rule.add).toHaveBeenCalledWith('border-color', 'blue');
        });

        it('text() for the color', function() {
            rule.text('black');
            expect(rule.add).toHaveBeenCalledWith('color', 'black');
        });

        describe('borderWidth() for the border-width:', function() {
            it('if showVerticalBorder is true, add left and right value with 1px', function() {
                rule.borderWidth({showVerticalBorder: true});
                expect(rule.add).toHaveBeenCalledWith('border-left-width', '1px');
                expect(rule.add).toHaveBeenCalledWith('border-right-width', '1px');
                expect(rule.add.calls.count()).toBe(2);
            });

            it('if showVerticalBorderis false, add left and right value with 0', function() {
                rule.borderWidth({showVerticalBorder: false});
                expect(rule.add).toHaveBeenCalledWith('border-left-width', '0');
                expect(rule.add).toHaveBeenCalledWith('border-right-width', '0');
                expect(rule.add.calls.count()).toBe(2);
            });

            it('if showHorizontalBorder is true, add top and bottom value with 1px', function() {
                rule.borderWidth({showHorizontalBorder: true});
                expect(rule.add).toHaveBeenCalledWith('border-top-width', '1px');
                expect(rule.add).toHaveBeenCalledWith('border-bottom-width', '1px');
                expect(rule.add.calls.count()).toBe(2);
            });

            it('if showHorizontalBorder is false, add top and bottom value with 0', function() {
                rule.borderWidth({showHorizontalBorder: false});
                expect(rule.add).toHaveBeenCalledWith('border-top-width', '0');
                expect(rule.add).toHaveBeenCalledWith('border-bottom-width', '0');
                expect(rule.add.calls.count()).toBe(2);
            });

            it('if options have no boolean value, add nothing', function() {
                rule.borderWidth({});
                expect(rule.add).not.toHaveBeenCalled();
            });

            it('if both visible options are boolean, add all', function() {
                rule.borderWidth({
                    showVerticalBorder: true,
                    showHorizontalBorder: false
                });
                expect(rule.add).toHaveBeenCalledWith('border-left-width', '1px');
                expect(rule.add).toHaveBeenCalledWith('border-right-width', '1px');
                expect(rule.add).toHaveBeenCalledWith('border-top-width', '0');
                expect(rule.add).toHaveBeenCalledWith('border-bottom-width', '0');
            });
        });
    });

    it('createClassRule() is shortcut for the create() with class name selector', function() {
        spyOn(builder, 'create');
        builder.createClassRule('myClassName');

        expect(builder.create).toHaveBeenCalledWith('.myClassName');
    });

    it('cteateWebkitScrollbarRules() returns an array of builders for webkit-scrollbar', function() {
        var options = {
            background: 'white',
            thumb: 'green',
            active: 'blue'
        };
        var rules = builder.createWebkitScrollbarRules('div', options);

        expect(rules[0].build()).toBe('div ::-webkit-scrollbar{background-color:white}');
        expect(rules[1].build()).toBe('div ::-webkit-scrollbar-thumb{background-color:green}');
        expect(rules[2].build()).toBe('div ::-webkit-scrollbar-thumb:hover{background-color:blue}');
    });

    it('createIEScrollbarRule() returns a builder for IE scrollbar', function() {
        var options = {
            background: 'white',
            thumb: 'green',
            active: 'blue'
        };
        var rule = builder.createIEScrollbarRule('div', options);
        var valueString = [
            'scrollbar-3dlight-color:white',
            'scrollbar-darkshadow-color:white',
            'scrollbar-track-color:white',
            'scrollbar-shadow-color:white',
            'scrollbar-face-color:green',
            'scrollbar-highlight-color:green',
            'scrollbar-arrow-color:blue'
        ].join(';');

        expect(rule.build()).toBe('div{' + valueString + '}');
    });

    it('buildAll() builds all rules in the array and returns the concatenated string', function() {
        var rules = [
            builder.create('div').bg('white'),
            builder.create('p').border('green'),
            builder.create('span').text('blue')
        ];

        var expected = rules[0].build() + rules[1].build() + rules[2].build();

        expect(builder.buildAll(rules)).toBe(expected);
    });
});
