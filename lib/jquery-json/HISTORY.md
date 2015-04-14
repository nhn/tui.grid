## 2.5.0 / 2014-07-11

* (#66) build: Switch to UglifyJS for better minification (2.3kb -> 1.9kb).
* Published to npm.
* Compatible with jQuery 1.11.
* Moved project from Google Code to GitHub: https://github.com/Krinkle/jquery-json/releases.

## 2.4.0 / 2012-11-14

* (#50) Inherited properties should be left out.
* (#51) Use `hasOwnProperty` from the Object prototype to guard against objects
  with a property by the name "hasOwnProperty".
* (#59) Array detection should not use `.constructor` (broken in IE9).
  Also fixed for Date object detection.
* (#60) Constructed/Instantiated primitives should be stringified like their
  primitive equivalents.
* (#56) Fixed spelling errors in documentation comments.
* Improved build and unit test process.

## 2.3.0 / 2011-09-18

* (#49) Improved performance by use direct reference to the native API.
  Methods `$.toJSON`, `$.evalJSON` and `$.secureEvalJSON` will link directly to
  the native `JSON.stringify` and `JSON.parse`, no longer checks on every call.
* (#48) Minor performance improvements by not executing a typeof check if the
  result is not used.
* (#27) Object members with value of type "undefined" should be omitted.
* Reorganized testing environment (now using QUnit).
* Code clean up and JSHint validation (Yay!).

## 2.2.0 / 2009-08-14

* Fixed exception thrown in WebKit browsers.

## 2.1.0 / 2009-08-14

* Fixed a problem in how it was representing arrays and undefined values.

## 2.0.0 / 2009-08-14

* Fixed a bug where dates weren't converting correctly.
* The code has been re-written. It is now easier to read and follow; less
  of a mish-mash.
* Support for native JSON has been included. This means that if you are using a
  browser that supports JSON.stringify, it will be used. Also evalJSON and
  secureEvalJSON will use JSON.parse if available.
* Changes were made in the JSON output to match the JSON specification. This
  means 2.0 is not backwards compatible with the previous versions.
* $.toJSON now renders like $.compactJSON used to and $.compactJSON has been
  removed. As per the JSON specification, needless spaces are now removed. This
  makes it less readable; patches for a $.prettyJSON are welcome!
* Differences between output when JSON.stringify is available and when it is
  not could exist. I am unable to test all strings. Be aware of this when
  testing your application.
