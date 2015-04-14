/**
 * Test suite for the jQuery JSON plugin.
 */
/*jshint freeze:false */
/*global QUnit */

// Utility function
QUnit.assert.toJSON = function (obj, string, description) {
	QUnit.assert.equal(jQuery.toJSON(obj), string, description || '');
};

QUnit.module('jQuery.toJSON');

QUnit.test('Basic toJSON usage', function (assert) {
	assert.toJSON(
		'hi',
		'"hi"',
		'Strings should be wrapped in double quotes'
	);
	assert.toJSON(
		{ apple: 2 },
		'{"apple":2}',
		'Objects'
	);
	assert.toJSON(
		{ apple: { apple: 2 } },
		'{"apple":{"apple":2}}',
		'Objects inside objects'
	);
	assert.toJSON(
		{ apple: 7, pear: 5 },
		'{"apple":7,"pear":5}',
		'Objects with multiple members should be separated by a comma'
	);
	assert.toJSON(
		2.5,
		'2.5',
		'Numbers with a decimal'
	);
	assert.toJSON(
		25,
		'25',
		'Number'
	);
	assert.toJSON(
		[2, 5],
		'[2,5]',
		'Array of numbers'
	);
	assert.toJSON(
		function () {},
		undefined,
		'Functions are not supported and should return undefined'
	);
	assert.toJSON(
		'C:\\A.TXT',
		'"C:\\\\A.TXT"',
		'Slashes should be double escaped'
	);
	assert.toJSON(
		'C:\\B.TXT',
		'"C:\\\\B.TXT"',
		'Slashes should be double escaped'
	);
	assert.toJSON(
		['C:\\A.TXT', 'C:\\B.TXT', 'C:\\C.TXT', 'C:\\D.TXT'],
		'["C:\\\\A.TXT","C:\\\\B.TXT","C:\\\\C.TXT","C:\\\\D.TXT"]',
		'Array of strings with slashes'
	);
	assert.toJSON(
		{ dDefault: '1.84467440737E+19' },
		'{"dDefault":"1.84467440737E+19"}',
		'Object with lower case key and value that should not be touched'
	);
	assert.toJSON(
		[0, false, function () {}],
		'[0,false,null]',
		'Resolve unsupported values (like functions) to null when encountered as object member values'
	);
	assert.toJSON(
		0,
		'0',
		'Zero is zero'
	);
	assert.toJSON(
		false,
		'false',
		'False is false'
	);
	assert.toJSON(
		null,
		'null',
		'null is null'
	);
	assert.toJSON(
		undefined,
		undefined,
		'undefined is not valid and should not return a string "undefined" but literally undefined'
	);
});

QUnit.test('Dates', function (assert) {
	// '1224892800000' is the Epoch timestamp of midnight October 25, 2008.
	// Using that instead of Date(2008,10,25) to avoid errors when the user
	// running the tests is not in a UTC +00:00 timezone (which is very likely)
	assert.toJSON(
		new Date(1224892800000),
		'"2008-10-25T00:00:00.000Z"',
		'Check date handling, likely the browser itself'
	);

	// Test without the native version (if available)
	// So that we can test the fallback in jQuery.toJSON
	var dateToJson = Date.prototype.toJSON; // Keep a reference to the native one
	if (dateToJson) {
		Date.prototype.toJSON = undefined;
	}

	assert.toJSON(
		new Date(1224892800000),
		'"2008-10-25T00:00:00.000Z"',
		'Testing fallback, any native browser handling disabled'
	);

	// Restore
	if (dateToJson) {
		Date.prototype.toJSON = dateToJson;
	}

	assert.toJSON(
		new Date(1224892800000),
		'"2008-10-25T00:00:00.000Z"',
		'Sanity check in case something screwed up'
	);
});

QUnit.test('RegExp', function (assert) {
	// We don't really care what RegExp objects end up like,
	// but we want to match browser behavior.
	assert.toJSON(
		new RegExp('hello'),
		'{}',
		'Instantiated RegExp (simple) '
	);
	assert.toJSON(
		new RegExp('hello', 'gi'),
		'{}',
		'Instantiated RegExp (with options)'
	);
	assert.toJSON(
		/hello/,
		'{}',
		'RegExp literal (simple)'
	);
	assert.toJSON(
		/hello/gi,
		'{}',
		'RegExp literal (with options)'
	);
});

QUnit.test('Primitive constructors', function (assert) {
	// Nobody should be using new Number(), new Boolean(), or new String()
	// but they are an interesting edge case, because they are typeof 'object'.
	// Workaround for jshint:
	var N = Number, B = Boolean, S = String;

	assert.toJSON(
		new N(7),
		'7',
		'Instantiated Number'
	);
	assert.toJSON(
		new B(true),
		'true',
		'Instantiated Boolean (true)'
	);
	assert.toJSON(
		new B(false),
		'false',
		'Instantiated Boolean (false)'
	);
	assert.toJSON(
		new S('hello'),
		'"hello"',
		'Instantiated String'
	);
});

if (navigator.userAgent.indexOf('PhantomJS') === -1) {
	// https://github.com/ariya/phantomjs/issues/10315
	QUnit.test('Function arguments object', function (assert) {
		function argTest() {
			assert.toJSON(
				arguments,
				'{"0":"foo","1":"bar","2":"baz"}',
				'arguments, as instance of Arguments, should be treated as an object'
			);
		}

		argTest('foo', 'bar', 'baz');
	});
}

QUnit.test('Undefined and null', function (assert) {
	assert.toJSON(
		{ apple: undefined, pear: 5 },
		'{"pear":5}',
		'Objects with a member with value of type undefined should be removed'
	);
	assert.toJSON(
		[undefined, undefined, 1, 2],
		'[null,null,1,2]',
		'Resolve undefined to null when encountered as object member values'
	);
});

QUnit.test('Prototype inheritance', function (assert) {

	Object.prototype.AWESOME = 7;

	assert.toJSON(
		{ apple: 2, key: 'value' },
		'{"apple":2,"key":"value"}',
		'Prototype values should not be included in the string'
	);

	// Since prototypes are highly dangerous,
	// make sure to remove it as soon as possible
	// Lots of code in jQuery will fail as it is
	// in the policy of jQuery that Object prototypes
	// are not supported.
	try {
		// Might fail in IE. Make sure to not let any exception
		// get out.
		delete Object.prototype.AWESOME;
	} catch (e) {}
});

QUnit.test('"hasOwnProperty" mixup', function (assert) {
	assert.toJSON(
		/*jshint -W001 */
		{ isAwesome: true, hasOwnProperty: false },
		'{"isAwesome":true,"hasOwnProperty":false}',
		'Guard against inherited prototypes should not depend on prototype inheritance itself'
	);
});
