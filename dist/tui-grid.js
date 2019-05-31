(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["Grid"] = factory();
	else
		root["tui"] = root["tui"] || {}, root["tui"]["Grid"] = factory();
})(window, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 23);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__extends", function() { return __extends; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__assign", function() { return __assign; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__rest", function() { return __rest; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__decorate", function() { return __decorate; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__param", function() { return __param; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__metadata", function() { return __metadata; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__awaiter", function() { return __awaiter; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__generator", function() { return __generator; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__exportStar", function() { return __exportStar; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__values", function() { return __values; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__read", function() { return __read; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__spread", function() { return __spread; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__await", function() { return __await; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__asyncGenerator", function() { return __asyncGenerator; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__asyncDelegator", function() { return __asyncDelegator; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__asyncValues", function() { return __asyncValues; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__makeTemplateObject", function() { return __makeTemplateObject; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__importStar", function() { return __importStar; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "__importDefault", function() { return __importDefault; });
/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    }
    return __assign.apply(this, arguments);
}

function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
}

function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

function __param(paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
}

function __metadata(metadataKey, metadataValue) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
}

function __awaiter(thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

function __exportStar(m, exports) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}

function __values(o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
}

function __read(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
}

function __spread() {
    for (var ar = [], i = 0; i < arguments.length; i++)
        ar = ar.concat(__read(arguments[i]));
    return ar;
}

function __await(v) {
    return this instanceof __await ? (this.v = v, this) : new __await(v);
}

function __asyncGenerator(thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
}

function __asyncDelegator(o) {
    var i, p;
    return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
    function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
}

function __asyncValues(o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
}

function __makeTemplateObject(cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};

function __importStar(mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result.default = mod;
    return result;
}

function __importDefault(mod) {
    return (mod && mod.__esModule) ? mod : { default: mod };
}


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
function shallowEqual(o1, o2) {
    for (var key in o1) {
        if (o1[key] !== o2[key]) {
            return false;
        }
    }
    for (var key in o2) {
        if (!(key in o1)) {
            return false;
        }
    }
    return true;
}
exports.shallowEqual = shallowEqual;
function arrayEqual(a1, a2) {
    if (a1.length !== a2.length) {
        return false;
    }
    for (var i = 0, len = a1.length; i < len; i += 1) {
        if (a1[i] !== a2[i]) {
            return false;
        }
    }
    return true;
}
exports.arrayEqual = arrayEqual;
function sum(nums) {
    return nums.reduce(function (acc, num) { return acc + num; }, 0);
}
exports.sum = sum;
function pipe(initVal) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    return args.reduce(function (acc, fn) { return fn(acc); }, initVal);
}
exports.pipe = pipe;
function includes(arr, searchItem, searchIndex) {
    if (typeof searchIndex === 'number' && arr[searchIndex] !== searchItem) {
        return false;
    }
    for (var _i = 0, arr_1 = arr; _i < arr_1.length; _i++) {
        var item = arr_1[_i];
        if (item === searchItem) {
            return true;
        }
    }
    return false;
}
exports.includes = includes;
// eslint-disable-next-line consistent-return
function find(predicate, arr) {
    for (var _i = 0, arr_2 = arr; _i < arr_2.length; _i++) {
        var item = arr_2[_i];
        if (predicate(item)) {
            return item;
        }
    }
}
exports.find = find;
function findProp(propName, value, arr) {
    return find(function (item) { return item[propName] === value; }, arr);
}
exports.findProp = findProp;
function some(predicate, arr) {
    return !!find(predicate, arr);
}
exports.some = some;
function someProp(propName, value, arr) {
    return !!findProp(propName, value, arr);
}
exports.someProp = someProp;
function findIndex(predicate, arr) {
    for (var i = 0, len = arr.length; i < len; i += 1) {
        if (predicate(arr[i])) {
            return i;
        }
    }
    return -1;
}
exports.findIndex = findIndex;
function findPropIndex(propName, value, arr) {
    return findIndex(function (item) { return item[propName] === value; }, arr);
}
exports.findPropIndex = findPropIndex;
function findIndexes(predicate, arr) {
    return arr.reduce(function (acc, v, idx) { return (predicate(v) ? acc.concat([idx]) : acc); }, []);
}
exports.findIndexes = findIndexes;
function findPrevIndex(arr, predicate) {
    var index = findIndex(predicate, arr);
    return index >= 0 ? index - 1 : arr.length - 1;
}
exports.findPrevIndex = findPrevIndex;
function findOffsetIndex(offsets, targetOffset) {
    return findPrevIndex(offsets, function (offset) { return offset > targetOffset; });
}
exports.findOffsetIndex = findOffsetIndex;
function mapProp(propName, arr) {
    return arr.map(function (item) { return item[propName]; });
}
exports.mapProp = mapProp;
function deepMergedCopy(targetObj, obj) {
    var resultObj = tslib_1.__assign({}, targetObj);
    for (var _i = 0, _a = Object.keys(obj); _i < _a.length; _i++) {
        var prop = _a[_i];
        if (resultObj.hasOwnProperty(prop) && typeof resultObj[prop] === 'object') {
            if (Array.isArray(obj[prop])) {
                resultObj[prop] = obj[prop];
            }
            else {
                resultObj[prop] = deepMergedCopy(resultObj[prop], obj[prop]);
            }
        }
        else {
            resultObj[prop] = obj[prop];
        }
    }
    return resultObj;
}
exports.deepMergedCopy = deepMergedCopy;
function assign(targetObj, obj) {
    for (var _i = 0, _a = Object.keys(obj); _i < _a.length; _i++) {
        var prop = _a[_i];
        if (targetObj.hasOwnProperty(prop) && typeof targetObj[prop] === 'object') {
            if (Array.isArray(obj[prop])) {
                targetObj[prop] = obj[prop];
            }
            else {
                assign(targetObj[prop], obj[prop]);
            }
        }
        else {
            targetObj[prop] = obj[prop];
        }
    }
}
exports.assign = assign;
function removeArrayItem(targetItem, arr) {
    var targetIdx = findIndex(function (item) { return item === targetItem; }, arr);
    arr.splice(targetIdx, 1);
    return arr;
}
exports.removeArrayItem = removeArrayItem;
function createMapFromArray(arr, propName) {
    var resultMap = {};
    arr.forEach(function (item) {
        var key = String(item[propName]);
        resultMap[key] = item;
    });
    return resultMap;
}
exports.createMapFromArray = createMapFromArray;
function isObject(obj) {
    return typeof obj === 'object' && obj !== null;
}
exports.isObject = isObject;
function forEachObject(fn, obj) {
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            fn(obj[key], key, obj);
        }
    }
}
exports.forEachObject = forEachObject;
function hasOwnProp(obj, key) {
    return obj.hasOwnProperty(key);
}
exports.hasOwnProp = hasOwnProp;
function encodeHTMLEntity(html) {
    var entities = {
        '"': 'quot',
        '&': 'amp',
        '<': 'lt',
        '>': 'gt',
        "'": '#39'
    };
    return html.replace(/[<>&"']/g, function (match) { return "&" + entities[match] + ";"; });
}
exports.encodeHTMLEntity = encodeHTMLEntity;
function setDefaultProp(obj, key, defValue) {
    if (typeof obj[key] === 'undefined') {
        obj[key] = defValue;
    }
}
exports.setDefaultProp = setDefaultProp;
/**
 * Returns a number whose value is limited to the given range.
 * @param value - A number to force within given min-max range
 * @param min - The lower boundary of the output range
 * @param max - The upper boundary of the output range
 * @returns A number in the range [min, max]
 * @example
 *      // limit the output of this computation to between 0 and 255
 *      value = clamp(value, 0, 255);
 */
function clamp(value, min, max) {
    var _a;
    if (min > max) {
        _a = [min, max], max = _a[0], min = _a[1];
    }
    return Math.max(min, Math.min(value, max));
}
exports.clamp = clamp;
function range(end) {
    var arr = [];
    for (var i = 0; i < end; i += 1) {
        arr.push(i);
    }
    return arr;
}
exports.range = range;
function last(arr) {
    return arr[arr.length - 1];
}
exports.last = last;
function isBlank(value) {
    if (typeof value === 'string') {
        return !value.length;
    }
    return typeof value === 'undefined' || value === null;
}
exports.isBlank = isBlank;
function isUndefined(value) {
    return typeof value === 'undefined';
}
exports.isUndefined = isUndefined;
function isNull(value) {
    return value === null;
}
exports.isNull = isNull;
function isBoolean(value) {
    return typeof value === 'boolean';
}
exports.isBoolean = isBoolean;
function isNumber(value) {
    return typeof value === 'number';
}
exports.isNumber = isNumber;
function fromArray(value) {
    return Array.prototype.slice.call(value);
}
exports.fromArray = fromArray;
function convertToNumber(value) {
    if (typeof value === 'string') {
        value = value.replace(/,/g, '');
    }
    if (typeof value === 'number' || isNaN(value) || isBlank(value)) {
        return value;
    }
    return Number(value);
}
exports.convertToNumber = convertToNumber;
function debounce(fn, wait, immediate) {
    if (immediate === void 0) { immediate = false; }
    var timeout = null;
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var later = function () {
            timeout = -1;
            if (!immediate) {
                fn.apply(void 0, args);
            }
        };
        var callNow = immediate && !timeout;
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = window.setTimeout(later, wait);
        if (callNow) {
            fn.apply(void 0, args);
        }
    };
}
exports.debounce = debounce;
function pruneObject(obj) {
    var pruned = {};
    forEachObject(function (value, key) {
        if (!isUndefined(value) && !isNull(value)) {
            pruned[key] = value;
        }
    }, obj);
    return pruned;
}
exports.pruneObject = pruneObject;


/***/ }),
/* 2 */
/***/ (function(__webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "h", function() { return h; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createElement", function() { return h; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "cloneElement", function() { return cloneElement; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createRef", function() { return createRef; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Component", function() { return Component; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "render", function() { return render; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "rerender", function() { return rerender; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "options", function() { return options; });
var VNode = function VNode() {};

var options = {};

var stack = [];

var EMPTY_CHILDREN = [];

function h(nodeName, attributes) {
	var children = EMPTY_CHILDREN,
	    lastSimple,
	    child,
	    simple,
	    i;
	for (i = arguments.length; i-- > 2;) {
		stack.push(arguments[i]);
	}
	if (attributes && attributes.children != null) {
		if (!stack.length) stack.push(attributes.children);
		delete attributes.children;
	}
	while (stack.length) {
		if ((child = stack.pop()) && child.pop !== undefined) {
			for (i = child.length; i--;) {
				stack.push(child[i]);
			}
		} else {
			if (typeof child === 'boolean') child = null;

			if (simple = typeof nodeName !== 'function') {
				if (child == null) child = '';else if (typeof child === 'number') child = String(child);else if (typeof child !== 'string') simple = false;
			}

			if (simple && lastSimple) {
				children[children.length - 1] += child;
			} else if (children === EMPTY_CHILDREN) {
				children = [child];
			} else {
				children.push(child);
			}

			lastSimple = simple;
		}
	}

	var p = new VNode();
	p.nodeName = nodeName;
	p.children = children;
	p.attributes = attributes == null ? undefined : attributes;
	p.key = attributes == null ? undefined : attributes.key;

	if (options.vnode !== undefined) options.vnode(p);

	return p;
}

function extend(obj, props) {
  for (var i in props) {
    obj[i] = props[i];
  }return obj;
}

function applyRef(ref, value) {
  if (ref != null) {
    if (typeof ref == 'function') ref(value);else ref.current = value;
  }
}

var defer = typeof Promise == 'function' ? Promise.resolve().then.bind(Promise.resolve()) : setTimeout;

function cloneElement(vnode, props) {
  return h(vnode.nodeName, extend(extend({}, vnode.attributes), props), arguments.length > 2 ? [].slice.call(arguments, 2) : vnode.children);
}

var IS_NON_DIMENSIONAL = /acit|ex(?:s|g|n|p|$)|rph|ows|mnc|ntw|ine[ch]|zoo|^ord/i;

var items = [];

function enqueueRender(component) {
	if (!component._dirty && (component._dirty = true) && items.push(component) == 1) {
		(options.debounceRendering || defer)(rerender);
	}
}

function rerender() {
	var p;
	while (p = items.pop()) {
		if (p._dirty) renderComponent(p);
	}
}

function isSameNodeType(node, vnode, hydrating) {
	if (typeof vnode === 'string' || typeof vnode === 'number') {
		return node.splitText !== undefined;
	}
	if (typeof vnode.nodeName === 'string') {
		return !node._componentConstructor && isNamedNode(node, vnode.nodeName);
	}
	return hydrating || node._componentConstructor === vnode.nodeName;
}

function isNamedNode(node, nodeName) {
	return node.normalizedNodeName === nodeName || node.nodeName.toLowerCase() === nodeName.toLowerCase();
}

function getNodeProps(vnode) {
	var props = extend({}, vnode.attributes);
	props.children = vnode.children;

	var defaultProps = vnode.nodeName.defaultProps;
	if (defaultProps !== undefined) {
		for (var i in defaultProps) {
			if (props[i] === undefined) {
				props[i] = defaultProps[i];
			}
		}
	}

	return props;
}

function createNode(nodeName, isSvg) {
	var node = isSvg ? document.createElementNS('http://www.w3.org/2000/svg', nodeName) : document.createElement(nodeName);
	node.normalizedNodeName = nodeName;
	return node;
}

function removeNode(node) {
	var parentNode = node.parentNode;
	if (parentNode) parentNode.removeChild(node);
}

function setAccessor(node, name, old, value, isSvg) {
	if (name === 'className') name = 'class';

	if (name === 'key') {} else if (name === 'ref') {
		applyRef(old, null);
		applyRef(value, node);
	} else if (name === 'class' && !isSvg) {
		node.className = value || '';
	} else if (name === 'style') {
		if (!value || typeof value === 'string' || typeof old === 'string') {
			node.style.cssText = value || '';
		}
		if (value && typeof value === 'object') {
			if (typeof old !== 'string') {
				for (var i in old) {
					if (!(i in value)) node.style[i] = '';
				}
			}
			for (var i in value) {
				node.style[i] = typeof value[i] === 'number' && IS_NON_DIMENSIONAL.test(i) === false ? value[i] + 'px' : value[i];
			}
		}
	} else if (name === 'dangerouslySetInnerHTML') {
		if (value) node.innerHTML = value.__html || '';
	} else if (name[0] == 'o' && name[1] == 'n') {
		var useCapture = name !== (name = name.replace(/Capture$/, ''));
		name = name.toLowerCase().substring(2);
		if (value) {
			if (!old) node.addEventListener(name, eventProxy, useCapture);
		} else {
			node.removeEventListener(name, eventProxy, useCapture);
		}
		(node._listeners || (node._listeners = {}))[name] = value;
	} else if (name !== 'list' && name !== 'type' && !isSvg && name in node) {
		try {
			node[name] = value == null ? '' : value;
		} catch (e) {}
		if ((value == null || value === false) && name != 'spellcheck') node.removeAttribute(name);
	} else {
		var ns = isSvg && name !== (name = name.replace(/^xlink:?/, ''));

		if (value == null || value === false) {
			if (ns) node.removeAttributeNS('http://www.w3.org/1999/xlink', name.toLowerCase());else node.removeAttribute(name);
		} else if (typeof value !== 'function') {
			if (ns) node.setAttributeNS('http://www.w3.org/1999/xlink', name.toLowerCase(), value);else node.setAttribute(name, value);
		}
	}
}

function eventProxy(e) {
	return this._listeners[e.type](options.event && options.event(e) || e);
}

var mounts = [];

var diffLevel = 0;

var isSvgMode = false;

var hydrating = false;

function flushMounts() {
	var c;
	while (c = mounts.shift()) {
		if (options.afterMount) options.afterMount(c);
		if (c.componentDidMount) c.componentDidMount();
	}
}

function diff(dom, vnode, context, mountAll, parent, componentRoot) {
	if (!diffLevel++) {
		isSvgMode = parent != null && parent.ownerSVGElement !== undefined;

		hydrating = dom != null && !('__preactattr_' in dom);
	}

	var ret = idiff(dom, vnode, context, mountAll, componentRoot);

	if (parent && ret.parentNode !== parent) parent.appendChild(ret);

	if (! --diffLevel) {
		hydrating = false;

		if (!componentRoot) flushMounts();
	}

	return ret;
}

function idiff(dom, vnode, context, mountAll, componentRoot) {
	var out = dom,
	    prevSvgMode = isSvgMode;

	if (vnode == null || typeof vnode === 'boolean') vnode = '';

	if (typeof vnode === 'string' || typeof vnode === 'number') {
		if (dom && dom.splitText !== undefined && dom.parentNode && (!dom._component || componentRoot)) {
			if (dom.nodeValue != vnode) {
				dom.nodeValue = vnode;
			}
		} else {
			out = document.createTextNode(vnode);
			if (dom) {
				if (dom.parentNode) dom.parentNode.replaceChild(out, dom);
				recollectNodeTree(dom, true);
			}
		}

		out['__preactattr_'] = true;

		return out;
	}

	var vnodeName = vnode.nodeName;
	if (typeof vnodeName === 'function') {
		return buildComponentFromVNode(dom, vnode, context, mountAll);
	}

	isSvgMode = vnodeName === 'svg' ? true : vnodeName === 'foreignObject' ? false : isSvgMode;

	vnodeName = String(vnodeName);
	if (!dom || !isNamedNode(dom, vnodeName)) {
		out = createNode(vnodeName, isSvgMode);

		if (dom) {
			while (dom.firstChild) {
				out.appendChild(dom.firstChild);
			}
			if (dom.parentNode) dom.parentNode.replaceChild(out, dom);

			recollectNodeTree(dom, true);
		}
	}

	var fc = out.firstChild,
	    props = out['__preactattr_'],
	    vchildren = vnode.children;

	if (props == null) {
		props = out['__preactattr_'] = {};
		for (var a = out.attributes, i = a.length; i--;) {
			props[a[i].name] = a[i].value;
		}
	}

	if (!hydrating && vchildren && vchildren.length === 1 && typeof vchildren[0] === 'string' && fc != null && fc.splitText !== undefined && fc.nextSibling == null) {
		if (fc.nodeValue != vchildren[0]) {
			fc.nodeValue = vchildren[0];
		}
	} else if (vchildren && vchildren.length || fc != null) {
			innerDiffNode(out, vchildren, context, mountAll, hydrating || props.dangerouslySetInnerHTML != null);
		}

	diffAttributes(out, vnode.attributes, props);

	isSvgMode = prevSvgMode;

	return out;
}

function innerDiffNode(dom, vchildren, context, mountAll, isHydrating) {
	var originalChildren = dom.childNodes,
	    children = [],
	    keyed = {},
	    keyedLen = 0,
	    min = 0,
	    len = originalChildren.length,
	    childrenLen = 0,
	    vlen = vchildren ? vchildren.length : 0,
	    j,
	    c,
	    f,
	    vchild,
	    child;

	if (len !== 0) {
		for (var i = 0; i < len; i++) {
			var _child = originalChildren[i],
			    props = _child['__preactattr_'],
			    key = vlen && props ? _child._component ? _child._component.__key : props.key : null;
			if (key != null) {
				keyedLen++;
				keyed[key] = _child;
			} else if (props || (_child.splitText !== undefined ? isHydrating ? _child.nodeValue.trim() : true : isHydrating)) {
				children[childrenLen++] = _child;
			}
		}
	}

	if (vlen !== 0) {
		for (var i = 0; i < vlen; i++) {
			vchild = vchildren[i];
			child = null;

			var key = vchild.key;
			if (key != null) {
				if (keyedLen && keyed[key] !== undefined) {
					child = keyed[key];
					keyed[key] = undefined;
					keyedLen--;
				}
			} else if (min < childrenLen) {
					for (j = min; j < childrenLen; j++) {
						if (children[j] !== undefined && isSameNodeType(c = children[j], vchild, isHydrating)) {
							child = c;
							children[j] = undefined;
							if (j === childrenLen - 1) childrenLen--;
							if (j === min) min++;
							break;
						}
					}
				}

			child = idiff(child, vchild, context, mountAll);

			f = originalChildren[i];
			if (child && child !== dom && child !== f) {
				if (f == null) {
					dom.appendChild(child);
				} else if (child === f.nextSibling) {
					removeNode(f);
				} else {
					dom.insertBefore(child, f);
				}
			}
		}
	}

	if (keyedLen) {
		for (var i in keyed) {
			if (keyed[i] !== undefined) recollectNodeTree(keyed[i], false);
		}
	}

	while (min <= childrenLen) {
		if ((child = children[childrenLen--]) !== undefined) recollectNodeTree(child, false);
	}
}

function recollectNodeTree(node, unmountOnly) {
	var component = node._component;
	if (component) {
		unmountComponent(component);
	} else {
		if (node['__preactattr_'] != null) applyRef(node['__preactattr_'].ref, null);

		if (unmountOnly === false || node['__preactattr_'] == null) {
			removeNode(node);
		}

		removeChildren(node);
	}
}

function removeChildren(node) {
	node = node.lastChild;
	while (node) {
		var next = node.previousSibling;
		recollectNodeTree(node, true);
		node = next;
	}
}

function diffAttributes(dom, attrs, old) {
	var name;

	for (name in old) {
		if (!(attrs && attrs[name] != null) && old[name] != null) {
			setAccessor(dom, name, old[name], old[name] = undefined, isSvgMode);
		}
	}

	for (name in attrs) {
		if (name !== 'children' && name !== 'innerHTML' && (!(name in old) || attrs[name] !== (name === 'value' || name === 'checked' ? dom[name] : old[name]))) {
			setAccessor(dom, name, old[name], old[name] = attrs[name], isSvgMode);
		}
	}
}

var recyclerComponents = [];

function createComponent(Ctor, props, context) {
	var inst,
	    i = recyclerComponents.length;

	if (Ctor.prototype && Ctor.prototype.render) {
		inst = new Ctor(props, context);
		Component.call(inst, props, context);
	} else {
		inst = new Component(props, context);
		inst.constructor = Ctor;
		inst.render = doRender;
	}

	while (i--) {
		if (recyclerComponents[i].constructor === Ctor) {
			inst.nextBase = recyclerComponents[i].nextBase;
			recyclerComponents.splice(i, 1);
			return inst;
		}
	}

	return inst;
}

function doRender(props, state, context) {
	return this.constructor(props, context);
}

function setComponentProps(component, props, renderMode, context, mountAll) {
	if (component._disable) return;
	component._disable = true;

	component.__ref = props.ref;
	component.__key = props.key;
	delete props.ref;
	delete props.key;

	if (typeof component.constructor.getDerivedStateFromProps === 'undefined') {
		if (!component.base || mountAll) {
			if (component.componentWillMount) component.componentWillMount();
		} else if (component.componentWillReceiveProps) {
			component.componentWillReceiveProps(props, context);
		}
	}

	if (context && context !== component.context) {
		if (!component.prevContext) component.prevContext = component.context;
		component.context = context;
	}

	if (!component.prevProps) component.prevProps = component.props;
	component.props = props;

	component._disable = false;

	if (renderMode !== 0) {
		if (renderMode === 1 || options.syncComponentUpdates !== false || !component.base) {
			renderComponent(component, 1, mountAll);
		} else {
			enqueueRender(component);
		}
	}

	applyRef(component.__ref, component);
}

function renderComponent(component, renderMode, mountAll, isChild) {
	if (component._disable) return;

	var props = component.props,
	    state = component.state,
	    context = component.context,
	    previousProps = component.prevProps || props,
	    previousState = component.prevState || state,
	    previousContext = component.prevContext || context,
	    isUpdate = component.base,
	    nextBase = component.nextBase,
	    initialBase = isUpdate || nextBase,
	    initialChildComponent = component._component,
	    skip = false,
	    snapshot = previousContext,
	    rendered,
	    inst,
	    cbase;

	if (component.constructor.getDerivedStateFromProps) {
		state = extend(extend({}, state), component.constructor.getDerivedStateFromProps(props, state));
		component.state = state;
	}

	if (isUpdate) {
		component.props = previousProps;
		component.state = previousState;
		component.context = previousContext;
		if (renderMode !== 2 && component.shouldComponentUpdate && component.shouldComponentUpdate(props, state, context) === false) {
			skip = true;
		} else if (component.componentWillUpdate) {
			component.componentWillUpdate(props, state, context);
		}
		component.props = props;
		component.state = state;
		component.context = context;
	}

	component.prevProps = component.prevState = component.prevContext = component.nextBase = null;
	component._dirty = false;

	if (!skip) {
		rendered = component.render(props, state, context);

		if (component.getChildContext) {
			context = extend(extend({}, context), component.getChildContext());
		}

		if (isUpdate && component.getSnapshotBeforeUpdate) {
			snapshot = component.getSnapshotBeforeUpdate(previousProps, previousState);
		}

		var childComponent = rendered && rendered.nodeName,
		    toUnmount,
		    base;

		if (typeof childComponent === 'function') {

			var childProps = getNodeProps(rendered);
			inst = initialChildComponent;

			if (inst && inst.constructor === childComponent && childProps.key == inst.__key) {
				setComponentProps(inst, childProps, 1, context, false);
			} else {
				toUnmount = inst;

				component._component = inst = createComponent(childComponent, childProps, context);
				inst.nextBase = inst.nextBase || nextBase;
				inst._parentComponent = component;
				setComponentProps(inst, childProps, 0, context, false);
				renderComponent(inst, 1, mountAll, true);
			}

			base = inst.base;
		} else {
			cbase = initialBase;

			toUnmount = initialChildComponent;
			if (toUnmount) {
				cbase = component._component = null;
			}

			if (initialBase || renderMode === 1) {
				if (cbase) cbase._component = null;
				base = diff(cbase, rendered, context, mountAll || !isUpdate, initialBase && initialBase.parentNode, true);
			}
		}

		if (initialBase && base !== initialBase && inst !== initialChildComponent) {
			var baseParent = initialBase.parentNode;
			if (baseParent && base !== baseParent) {
				baseParent.replaceChild(base, initialBase);

				if (!toUnmount) {
					initialBase._component = null;
					recollectNodeTree(initialBase, false);
				}
			}
		}

		if (toUnmount) {
			unmountComponent(toUnmount);
		}

		component.base = base;
		if (base && !isChild) {
			var componentRef = component,
			    t = component;
			while (t = t._parentComponent) {
				(componentRef = t).base = base;
			}
			base._component = componentRef;
			base._componentConstructor = componentRef.constructor;
		}
	}

	if (!isUpdate || mountAll) {
		mounts.push(component);
	} else if (!skip) {

		if (component.componentDidUpdate) {
			component.componentDidUpdate(previousProps, previousState, snapshot);
		}
		if (options.afterUpdate) options.afterUpdate(component);
	}

	while (component._renderCallbacks.length) {
		component._renderCallbacks.pop().call(component);
	}if (!diffLevel && !isChild) flushMounts();
}

function buildComponentFromVNode(dom, vnode, context, mountAll) {
	var c = dom && dom._component,
	    originalComponent = c,
	    oldDom = dom,
	    isDirectOwner = c && dom._componentConstructor === vnode.nodeName,
	    isOwner = isDirectOwner,
	    props = getNodeProps(vnode);
	while (c && !isOwner && (c = c._parentComponent)) {
		isOwner = c.constructor === vnode.nodeName;
	}

	if (c && isOwner && (!mountAll || c._component)) {
		setComponentProps(c, props, 3, context, mountAll);
		dom = c.base;
	} else {
		if (originalComponent && !isDirectOwner) {
			unmountComponent(originalComponent);
			dom = oldDom = null;
		}

		c = createComponent(vnode.nodeName, props, context);
		if (dom && !c.nextBase) {
			c.nextBase = dom;

			oldDom = null;
		}
		setComponentProps(c, props, 1, context, mountAll);
		dom = c.base;

		if (oldDom && dom !== oldDom) {
			oldDom._component = null;
			recollectNodeTree(oldDom, false);
		}
	}

	return dom;
}

function unmountComponent(component) {
	if (options.beforeUnmount) options.beforeUnmount(component);

	var base = component.base;

	component._disable = true;

	if (component.componentWillUnmount) component.componentWillUnmount();

	component.base = null;

	var inner = component._component;
	if (inner) {
		unmountComponent(inner);
	} else if (base) {
		if (base['__preactattr_'] != null) applyRef(base['__preactattr_'].ref, null);

		component.nextBase = base;

		removeNode(base);
		recyclerComponents.push(component);

		removeChildren(base);
	}

	applyRef(component.__ref, null);
}

function Component(props, context) {
	this._dirty = true;

	this.context = context;

	this.props = props;

	this.state = this.state || {};

	this._renderCallbacks = [];
}

extend(Component.prototype, {
	setState: function setState(state, callback) {
		if (!this.prevState) this.prevState = this.state;
		this.state = extend(extend({}, this.state), typeof state === 'function' ? state(this.state, this.props) : state);
		if (callback) this._renderCallbacks.push(callback);
		enqueueRender(this);
	},
	forceUpdate: function forceUpdate(callback) {
		if (callback) this._renderCallbacks.push(callback);
		renderComponent(this, 2);
	},
	render: function render() {}
});

function render(vnode, parent, merge) {
  return diff(merge, vnode, {}, false, parent, false);
}

function createRef() {
	return {};
}

var preact = {
	h: h,
	createElement: h,
	cloneElement: cloneElement,
	createRef: createRef,
	Component: Component,
	render: render,
	rerender: rerender,
	options: options
};

/* harmony default export */ __webpack_exports__["default"] = (preact);

//# sourceMappingURL=preact.mjs.map


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var CLS_PREFIX = 'tui-grid-';
function cls() {
    var names = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        names[_i] = arguments[_i];
    }
    var result = [];
    for (var _a = 0, names_1 = names; _a < names_1.length; _a++) {
        var name_1 = names_1[_a];
        var className = void 0;
        if (Array.isArray(name_1)) {
            className = name_1[0] ? name_1[1] : null;
        }
        else {
            className = name_1;
        }
        if (className) {
            result.push("" + CLS_PREFIX + className);
        }
    }
    return result.join(' ');
}
exports.cls = cls;
function hasClass(el, className) {
    return el.className.split(' ').indexOf(cls(className)) !== -1;
}
exports.hasClass = hasClass;
function findParentByTagName(el, tagName) {
    var currentEl = el;
    while (currentEl && currentEl.tagName.toLowerCase() !== tagName) {
        currentEl = currentEl.parentElement;
    }
    return currentEl;
}
exports.findParentByTagName = findParentByTagName;
function findParent(el, className) {
    var currentEl = el;
    while (currentEl && !hasClass(currentEl, className)) {
        currentEl = currentEl.parentElement;
    }
    return currentEl;
}
exports.findParent = findParent;
function getCellAddress(el) {
    var cellElement = findParent(el, 'cell');
    if (!cellElement) {
        return null;
    }
    var rowKey = Number(cellElement.getAttribute('data-row-key'));
    var columnName = cellElement.getAttribute('data-column-name');
    return { rowKey: rowKey, columnName: columnName };
}
exports.getCellAddress = getCellAddress;
/**
 * create style element and append it into the head element.
 * @param {String} id - element id
 * @param {String} cssString - css string
 */
function appendStyleElement(id, cssString) {
    var style = document.createElement('style');
    style.type = 'text/css';
    style.id = id;
    style.appendChild(document.createTextNode(cssString));
    document.getElementsByTagName('head')[0].appendChild(style);
}
exports.appendStyleElement = appendStyleElement;
function setCursorStyle(type) {
    document.body.style.cursor = type;
}
exports.setCursorStyle = setCursorStyle;


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var preact_1 = __webpack_require__(2);
var observable_1 = __webpack_require__(5);
function connect(selector) {
    return function (WrappedComponent) {
        var _a;
        return _a = /** @class */ (function (_super) {
                tslib_1.__extends(class_1, _super);
                function class_1() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                class_1.prototype.setStateUsingSelector = function (ownProps) {
                    if (selector) {
                        this.setState(selector(this.context.store, ownProps));
                    }
                };
                class_1.prototype.componentWillMount = function () {
                    var _this = this;
                    if (selector) {
                        this.unobserve = observable_1.observe(function () {
                            _this.setStateUsingSelector(_this.props);
                        });
                    }
                };
                class_1.prototype.componentWillReceiveProps = function (nextProps) {
                    this.setStateUsingSelector(nextProps);
                };
                class_1.prototype.componentWillUnmount = function () {
                    if (this.unobserve) {
                        this.unobserve();
                    }
                };
                class_1.prototype.render = function () {
                    var _a = this, props = _a.props, state = _a.state;
                    var dispatch = this.context.dispatch;
                    return preact_1.h(WrappedComponent, tslib_1.__assign({}, props, state, { dispatch: dispatch }));
                };
                return class_1;
            }(preact_1.Component)),
            _a.displayName = "Connect:" + WrappedComponent.name,
            _a;
    };
}
exports.connect = connect;


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var common_1 = __webpack_require__(1);
var generateObserverId = (function () {
    var lastId = 0;
    return function () {
        lastId += 1;
        return "@observer" + lastId;
    };
})();
// store all observer info
var observerInfoMap = {};
// observerId stack for managing recursive observing calls
var observerIdStack = [];
function isObservable(resultObj) {
    return common_1.isObject(resultObj) && common_1.hasOwnProp(resultObj, '__storage__');
}
function callObserver(observerId) {
    observerIdStack.push(observerId);
    observerInfoMap[observerId].fn();
    observerIdStack.pop();
}
function setValue(storage, observerIdSet, key, value) {
    if (storage[key] !== value) {
        storage[key] = value;
        Object.keys(observerIdSet).forEach(function (observerId) {
            callObserver(observerId);
        });
    }
}
function observe(fn) {
    var observerId = generateObserverId();
    observerInfoMap[observerId] = { fn: fn, targetObserverIdSets: [] };
    callObserver(observerId);
    // return unobserve function
    return function () {
        observerInfoMap[observerId].targetObserverIdSets.forEach(function (idSet) {
            delete idSet[observerId];
        });
    };
}
exports.observe = observe;
function observable(obj) {
    if (isObservable(obj)) {
        throw new Error('Target object is already Reactive');
    }
    if (Array.isArray(obj)) {
        throw new Error('Array object cannot be Reactive');
    }
    var storage = {};
    var propObserverIdSetMap = {};
    var resultObj = {};
    Object.defineProperties(resultObj, {
        __storage__: { value: storage },
        __propObserverIdSetMap__: { value: propObserverIdSetMap }
    });
    Object.keys(obj).forEach(function (key) {
        var getter = (Object.getOwnPropertyDescriptor(obj, key) || {}).get;
        var observerIdSet = (propObserverIdSetMap[key] = {});
        Object.defineProperty(resultObj, key, {
            configurable: true,
            get: function () {
                var observerId = common_1.last(observerIdStack);
                if (observerId && !observerIdSet[observerId]) {
                    observerIdSet[observerId] = true;
                    observerInfoMap[observerId].targetObserverIdSets.push(observerIdSet);
                }
                return storage[key];
            }
        });
        if (typeof getter === 'function') {
            observe(function () {
                var value = getter.call(resultObj);
                setValue(storage, observerIdSet, key, value);
            });
        }
        else {
            storage[key] = obj[key];
            Object.defineProperty(resultObj, key, {
                set: function (value) {
                    setValue(storage, observerIdSet, key, value);
                }
            });
        }
    });
    return resultObj;
}
exports.observable = observable;
function notify(obj, key) {
    if (isObservable(obj)) {
        Object.keys(obj.__propObserverIdSetMap__[key]).forEach(function (observerId) {
            callObserver(observerId);
        });
    }
}
exports.notify = notify;
function getOriginObject(obj) {
    var result = {};
    common_1.forEachObject(function (value, key) {
        result[key] = isObservable(value) ? getOriginObject(value) : value;
    }, obj.__storage__);
    return result;
}
exports.getOriginObject = getOriginObject;


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function isRowHeader(columnName) {
    return ['_number', '_checked'].indexOf(columnName) > -1;
}
exports.isRowHeader = isRowHeader;


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var common_1 = __webpack_require__(1);
var instance_1 = __webpack_require__(8);
var eventBusMap = {};
function createEventBus(id) {
    var listenersMap = {};
    eventBusMap[id] = {
        on: function (eventName, func) {
            var listeners = listenersMap[eventName];
            listenersMap[eventName] = listeners ? listeners.concat([func]) : [func];
        },
        off: function (eventName, func) {
            var listeners = listenersMap[eventName];
            if (listeners) {
                if (func) {
                    listenersMap[eventName] = common_1.removeArrayItem(func, listeners);
                }
                else {
                    delete listenersMap[eventName];
                }
            }
        },
        trigger: function (eventName, gridEvent) {
            if (listenersMap[eventName]) {
                var instance = instance_1.getInstance(id);
                gridEvent.setInstance(instance);
                listenersMap[eventName].forEach(function (func) {
                    func(gridEvent);
                });
            }
        }
    };
    return eventBusMap[id];
}
exports.createEventBus = createEventBus;
function getEventBus(id) {
    return eventBusMap[id];
}
exports.getEventBus = getEventBus;


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var currentId = 0;
var instanceMap = {};
function generateId() {
    currentId += 1;
    return currentId;
}
function register(instance) {
    var id = generateId();
    instanceMap[id] = instance;
    return id;
}
exports.register = register;
function getInstance(id) {
    return instanceMap[id];
}
exports.getInstance = getInstance;


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var common_1 = __webpack_require__(1);
var CUSTOM_LF_SUBCHAR = '___tui_grid_lf___';
var CUSTOM_CR_SUBCHAR = '___tui_grid_cr___';
var CUSTOM_LF_REGEXP = new RegExp(CUSTOM_LF_SUBCHAR, 'g');
var CUSTOM_CR_REGEXP = new RegExp(CUSTOM_CR_SUBCHAR, 'g');
var LF = '\n';
var CR = '\r';
function setDataInSpanRange(value, data, colspanRange, rowspanRange) {
    var startColspan = colspanRange[0], endColspan = colspanRange[1];
    var startRowspan = rowspanRange[0], endRowspan = rowspanRange[1];
    for (var rowIdx = startRowspan; rowIdx < endRowspan; rowIdx += 1) {
        for (var columnIdx = startColspan; columnIdx < endColspan; columnIdx += 1) {
            data[rowIdx][columnIdx] = startRowspan === rowIdx && startColspan === columnIdx ? value : ' ';
        }
    }
}
exports.setDataInSpanRange = setDataInSpanRange;
function convertTableToData(rows) {
    var data = [];
    var colspanRange, rowspanRange;
    for (var index = 0; index < rows.length; index += 1) {
        data[index] = [];
    }
    common_1.fromArray(rows).forEach(function (tr, rowIndex) {
        var columnIndex = 0;
        common_1.fromArray(tr.cells).forEach(function (td) {
            var text = td.textContent || td.innerText;
            while (data[rowIndex][columnIndex]) {
                columnIndex += 1;
            }
            colspanRange = [columnIndex, columnIndex + (td.colSpan || 1)];
            rowspanRange = [rowIndex, rowIndex + (td.rowSpan || 1)];
            setDataInSpanRange(text, data, colspanRange, rowspanRange);
            columnIndex = colspanRange[1];
        });
    });
    return data;
}
exports.convertTableToData = convertTableToData;
function removeDoubleQuotes(text) {
    if (text.match(CUSTOM_LF_REGEXP)) {
        return text.substring(1, text.length - 1).replace(/""/g, '"');
    }
    return text;
}
function replaceNewlineToSubchar(text) {
    return text.replace(/"([^"]|"")*"/g, function (value) {
        return value.replace(LF, CUSTOM_LF_SUBCHAR).replace(CR, CUSTOM_CR_SUBCHAR);
    });
}
function convertTextToData(text) {
    // Each newline cell data is wrapping double quotes in the text and
    // newline characters should be replaced with substitution characters temporarily
    // before spliting the text by newline characters.
    text = replaceNewlineToSubchar(text);
    return text.split(/\r?\n/).map(function (row) {
        return row.split('\t').map(function (column) {
            return removeDoubleQuotes(column)
                .replace(CUSTOM_LF_REGEXP, LF)
                .replace(CUSTOM_CR_REGEXP, CR);
        });
    });
}
exports.convertTextToData = convertTextToData;
function getCustomValue(customValue, value, rowAttrs, column) {
    return typeof customValue === 'function' ? customValue(value, rowAttrs, column) : customValue;
}
exports.getCustomValue = getCustomValue;
function getTextWithCopyOptionsApplied(valueMap, rawData, column) {
    var text = valueMap.value;
    var copyOptions = column.copyOptions, editorOptions = column.editorOptions;
    // priority: customValue > useListItemText > useFormattedValue > original Data
    if (copyOptions) {
        if (copyOptions.customValue) {
            text = getCustomValue(copyOptions.customValue, valueMap.value, rawData, column);
        }
        else if (copyOptions.useListItemText && editorOptions) {
            var listItems_1 = editorOptions.listItems;
            var value = valueMap.value;
            var valueList = [value];
            var result_1 = [];
            if (typeof value === 'string') {
                valueList = value.split(',');
            }
            valueList.forEach(function (val) {
                var listItem = common_1.find(function (item) { return item.value === val; }, listItems_1);
                result_1.push(listItem ? listItem.text : val);
            });
            text = result_1.join(',');
        }
        else if (copyOptions.useFormattedValue) {
            var prefix = valueMap.prefix, postfix = valueMap.postfix, formattedValue = valueMap.formattedValue;
            text = "" + prefix + formattedValue + postfix;
        }
    }
    if (typeof text === 'undefined' || text === null) {
        return '';
    }
    return String(text);
}
exports.getTextWithCopyOptionsApplied = getTextWithCopyOptionsApplied;
function isColumnEditable(viewData, rowIndex, columnName) {
    var _a = viewData[rowIndex].valueMap[columnName], disabled = _a.disabled, editable = _a.editable;
    return editable && !disabled;
}
exports.isColumnEditable = isColumnEditable;
function isSupportWindowClipboardData() {
    return !!window.clipboardData;
}
exports.isSupportWindowClipboardData = isSupportWindowClipboardData;


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var dom_1 = __webpack_require__(3);
var common_1 = __webpack_require__(1);
var column_1 = __webpack_require__(6);
function getTargetInfo(nativeEvent) {
    var targetType = 'etc';
    var target = nativeEvent.target;
    var cell = dom_1.findParentByTagName(target, 'td');
    var rowKey, columnName;
    if (cell) {
        var address = dom_1.getCellAddress(cell);
        if (address) {
            // eslint-disable-next-line prefer-destructuring
            rowKey = address.rowKey;
            // eslint-disable-next-line prefer-destructuring
            columnName = address.columnName;
            targetType = column_1.isRowHeader(address.columnName) ? 'rowHeader' : 'cell';
        }
        else {
            targetType = 'dummy';
        }
    }
    else {
        cell = dom_1.findParentByTagName(target, 'th');
        if (cell) {
            columnName = cell.getAttribute('data-column-name');
            targetType = 'columnHeader';
        }
    }
    return common_1.pruneObject({
        nativeEvent: nativeEvent,
        targetType: targetType,
        rowKey: rowKey,
        columnName: columnName
    });
}
var GridEvent = /** @class */ (function () {
    function GridEvent(_a) {
        var event = _a.event, props = tslib_1.__rest(_a, ["event"]);
        this.stopped = false;
        if (event) {
            this.assignData(getTargetInfo(event));
        }
        if (props) {
            this.assignData(props);
        }
    }
    GridEvent.prototype.stop = function () {
        this.stopped = true;
    };
    GridEvent.prototype.isStopped = function () {
        return this.stopped;
    };
    GridEvent.prototype.assignData = function (data) {
        common_1.assign(this, data);
    };
    GridEvent.prototype.setInstance = function (instance) {
        common_1.assign(this, { instance: instance });
    };
    return GridEvent;
}());
exports.default = GridEvent;


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var common_1 = __webpack_require__(1);
var eventBus_1 = __webpack_require__(7);
var selection_1 = __webpack_require__(64);
var gridEvent_1 = tslib_1.__importDefault(__webpack_require__(10));
function changeSelectionRange(selection, inputRange, id) {
    if (!selection_1.isSameInputRange(selection.inputRange, inputRange)) {
        selection.inputRange = inputRange;
        var eventBus = eventBus_1.getEventBus(id);
        var gridEvent = new gridEvent_1.default({ range: selection.range });
        eventBus.trigger('selection', gridEvent);
    }
}
exports.changeSelectionRange = changeSelectionRange;
function setSelection(store, range) {
    var selection = store.selection, viewData = store.data.viewData, visibleColumns = store.column.visibleColumns, id = store.id;
    var rowLength = viewData.length;
    var columnLength = visibleColumns.length;
    var startRowIndex = common_1.clamp(range.start[0], 0, rowLength - 1);
    var endRowIndex = common_1.clamp(range.end[0], 0, rowLength - 1);
    var startColumnIndex = common_1.clamp(range.start[1], 0, columnLength - 1);
    var endColumnIndex = common_1.clamp(range.end[1], 0, columnLength - 1);
    var inputRange = {
        row: [startRowIndex, endRowIndex],
        column: [startColumnIndex, endColumnIndex]
    };
    changeSelectionRange(selection, inputRange, id);
}
exports.setSelection = setSelection;


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var preact_1 = __webpack_require__(2);
var hoc_1 = __webpack_require__(4);
var ColGroupComp = /** @class */ (function (_super) {
    tslib_1.__extends(ColGroupComp, _super);
    function ColGroupComp() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ColGroupComp.prototype.render = function (_a) {
        var columns = _a.columns, widths = _a.widths, borderWidth = _a.borderWidth;
        return (preact_1.h("colgroup", null, columns.map(function (_a, idx) {
            var name = _a.name;
            return (preact_1.h("col", { key: name, "data-column-name": name, style: { width: widths[idx] + borderWidth } }));
        })));
    };
    return ColGroupComp;
}(preact_1.Component));
exports.ColGroup = hoc_1.connect(function (_a, _b) {
    var columnCoords = _a.columnCoords, dimension = _a.dimension, column = _a.column;
    var side = _b.side;
    return ({
        widths: columnCoords.widths[side],
        columns: column.visibleColumnsBySide[side],
        borderWidth: dimension.cellBorderWidth
    });
})(ColGroupComp);


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var common_1 = __webpack_require__(1);
exports.keyNameMap = {
    8: 'backspace',
    9: 'tab',
    13: 'enter',
    17: 'ctrl',
    27: 'esc',
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down',
    65: 'a',
    67: 'c',
    86: 'v',
    32: 'space',
    33: 'pageUp',
    34: 'pageDown',
    36: 'home',
    35: 'end',
    46: 'del'
};
exports.keyboardEventTypeMap = {
    move: 'move',
    edit: 'edit',
    remove: 'remove',
    select: 'select',
    clipboard: 'clipboard'
};
exports.keyboardEventCommandMap = {
    up: 'up',
    down: 'down',
    left: 'left',
    right: 'right',
    pageUp: 'pageUp',
    pageDown: 'pageDown',
    firstColumn: 'firstColumn',
    lastColumn: 'lastColumn',
    currentCell: 'currentCell',
    nextCell: 'nextCell',
    prevCell: 'prevCell',
    firstCell: 'firstCell',
    lastCell: 'lastCell',
    all: 'all',
    copy: 'copy',
    paste: 'paste'
};
/**
 * K-V object for matching keystroke and event command
 * K: keystroke (order : ctrl -> shift -> keyName)
 * V: [key event type, command]
 * @type {Object}
 * @ignore
 */
exports.keyStrokeCommandMap = {
    up: ['move', 'up'],
    down: ['move', 'down'],
    left: ['move', 'left'],
    right: ['move', 'right'],
    pageUp: ['move', 'pageUp'],
    pageDown: ['move', 'pageDown'],
    home: ['move', 'firstColumn'],
    end: ['move', 'lastColumn'],
    enter: ['edit', 'currentCell'],
    space: ['edit', 'currentCell'],
    tab: ['edit', 'nextCell'],
    backspace: ['remove'],
    del: ['remove'],
    'shift-tab': ['edit', 'prevCell'],
    'shift-up': ['select', 'up'],
    'shift-down': ['select', 'down'],
    'shift-left': ['select', 'left'],
    'shift-right': ['select', 'right'],
    'shift-pageUp': ['select', 'pageUp'],
    'shift-pageDown': ['select', 'pageDown'],
    'shift-home': ['select', 'firstColumn'],
    'shift-end': ['select', 'lastColumn'],
    'ctrl-a': ['select', 'all'],
    'ctrl-c': ['clipboard', 'copy'],
    'ctrl-v': ['clipboard', 'paste'],
    'ctrl-home': ['move', 'firstCell'],
    'ctrl-end': ['move', 'lastCell'],
    'ctrl-shift-home': ['select', 'firstCell'],
    'ctrl-shift-end': ['select', 'lastCell']
};
/**
 * Returns the keyStroke string
 * @param {Event} ev - Keyboard event
 * @returns {String}
 * @ignore
 */
function getKeyStrokeString(ev) {
    var keys = [];
    var keyCode = ev.keyCode, ctrlKey = ev.ctrlKey, metaKey = ev.metaKey, shiftKey = ev.shiftKey;
    if (ctrlKey || metaKey) {
        keys.push('ctrl');
    }
    if (shiftKey) {
        keys.push('shift');
    }
    if (keyCode in exports.keyNameMap) {
        keys.push(exports.keyNameMap[keyCode]);
    }
    return keys.join('-');
}
exports.getKeyStrokeString = getKeyStrokeString;
function keyEventGenerate(ev) {
    var keyStroke = getKeyStrokeString(ev);
    var commandInfo = exports.keyStrokeCommandMap[keyStroke];
    return commandInfo
        ? {
            type: commandInfo[0],
            command: commandInfo[1]
        }
        : {};
}
exports.keyEventGenerate = keyEventGenerate;
function findOffsetIndex(offsets, cellBorderWidth, position) {
    position += cellBorderWidth * 2;
    var idx = offsets.findIndex(function (offset) { return offset - cellBorderWidth > position; });
    return idx >= 0 ? idx - 1 : offsets.length - 1;
}
function getPageMovedPosition(rowIndex, offsets, bodyHeight, isPrevDir) {
    var distance = isPrevDir ? -bodyHeight : bodyHeight;
    return offsets[rowIndex] + distance;
}
exports.getPageMovedPosition = getPageMovedPosition;
function getPageMovedIndex(offsets, cellBorderWidth, movedPosition) {
    var movedIndex = findOffsetIndex(offsets, cellBorderWidth, movedPosition);
    return common_1.clamp(movedIndex, 0, offsets.length - 1);
}
exports.getPageMovedIndex = getPageMovedIndex;


/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var clipboard_1 = __webpack_require__(9);
function getRangeToPaste(store, pasteData) {
    var range = store.selection.range, _a = store.focus, rowIndex = _a.rowIndex, totalColumnIndex = _a.totalColumnIndex, visibleColumns = store.column.visibleColumns, viewData = store.data.viewData;
    var startRowIndex, startColumnIndex;
    if (range) {
        startRowIndex = range.row[0];
        startColumnIndex = range.column[0];
    }
    else {
        startRowIndex = rowIndex;
        startColumnIndex = totalColumnIndex;
    }
    var endRowIndex = Math.min(pasteData.length + startRowIndex, viewData.length) - 1;
    var endColumnIndex = Math.min(pasteData[0].length + startColumnIndex, visibleColumns.length) - 1;
    return {
        row: [startRowIndex, endRowIndex],
        column: [startColumnIndex, endColumnIndex]
    };
}
exports.getRangeToPaste = getRangeToPaste;
function copyDataToRange(range, pasteData) {
    var rowLength = range.row[1] - range.row[0] + 1;
    var colLength = range.column[1] - range.column[0] + 1;
    var dataRowLength = pasteData.length;
    var dataColLength = pasteData[0].length;
    var rowDupCount = Math.floor(rowLength / dataRowLength) - 1;
    var colDupCount = Math.floor(colLength / dataColLength) - 1;
    var result = pasteData.slice();
    for (var i = 0; i < rowDupCount; i += 1) {
        pasteData.forEach(function (row) {
            result.push(row.slice(0));
        });
    }
    result.forEach(function (row) {
        var rowData = row.slice(0);
        for (var i = 0; i < colDupCount; i += 1) {
            row.push.apply(row, rowData);
        }
    });
    return result;
}
exports.copyDataToRange = copyDataToRange;
function getValueToString(store) {
    var visibleColumns = store.column.visibleColumns, _a = store.focus, rowIndex = _a.rowIndex, columnName = _a.columnName, totalColumnIndex = _a.totalColumnIndex, _b = store.data, viewData = _b.viewData, rawData = _b.rawData;
    if (rowIndex === null || columnName === null || totalColumnIndex === null) {
        return '';
    }
    var valueMap = viewData[rowIndex].valueMap[columnName];
    return clipboard_1.getTextWithCopyOptionsApplied(valueMap, rawData, visibleColumns[totalColumnIndex]);
}
function getValuesToString(store) {
    var range = store.selection.range, visibleColumns = store.column.visibleColumns, _a = store.data, viewData = _a.viewData, rawData = _a.rawData;
    if (!range) {
        return '';
    }
    var row = range.row, column = range.column;
    var rowList = viewData.slice(row[0], row[1] + 1);
    var columnInRange = visibleColumns.slice(column[0], column[1] + 1);
    return rowList
        .map(function (_a) {
        var valueMap = _a.valueMap;
        return columnInRange
            .map(function (_a, index) {
            var name = _a.name;
            return clipboard_1.getTextWithCopyOptionsApplied(valueMap[name], rawData, visibleColumns[index]);
        })
            .join('\t');
    })
        .join('\n');
}
function getText(store) {
    var selection = store.selection, _a = store.focus, rowIndex = _a.rowIndex, columnName = _a.columnName;
    if (selection.range) {
        return getValuesToString(store);
    }
    if (rowIndex !== null && columnName !== null) {
        return getValueToString(store);
    }
    return '';
}
exports.getText = getText;


/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var eventBus_1 = __webpack_require__(7);
var gridEvent_1 = tslib_1.__importDefault(__webpack_require__(10));
var data_1 = __webpack_require__(22);
var focus_1 = __webpack_require__(68);
function startEditing(store, rowKey, columnName) {
    var data = store.data, focus = store.focus, column = store.column;
    if (data_1.isCellDisabled(data, rowKey, columnName) || !focus_1.isFocusedCell(focus, rowKey, columnName)) {
        return;
    }
    var columnInfo = column.allColumnMap[columnName];
    if (columnInfo && columnInfo.editor) {
        focus.navigating = false;
        focus.editingAddress = { rowKey: rowKey, columnName: columnName };
    }
}
exports.startEditing = startEditing;
function finishEditing(_a, rowKey, columnName) {
    var focus = _a.focus;
    var editingAddress = focus.editingAddress;
    if (editingAddress &&
        editingAddress.rowKey === rowKey &&
        editingAddress.columnName === columnName) {
        focus.editingAddress = null;
        focus.navigating = true;
    }
}
exports.finishEditing = finishEditing;
function changeFocus(focus, rowKey, columnName, id) {
    if (focus_1.isFocusedCell(focus, rowKey, columnName)) {
        return;
    }
    var eventBus = eventBus_1.getEventBus(id);
    var gridEvent = new gridEvent_1.default({
        rowKey: rowKey,
        columnName: columnName,
        prevColumnName: focus.columnName,
        prevRowKey: focus.rowKey
    });
    eventBus.trigger('focusChange', gridEvent);
    if (!gridEvent.isStopped()) {
        focus.prevColumnName = focus.columnName;
        focus.prevRowKey = focus.rowKey;
        focus.rowKey = rowKey;
        focus.columnName = columnName;
    }
}
exports.changeFocus = changeFocus;


/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var observable_1 = __webpack_require__(5);
var column_1 = __webpack_require__(6);
var common_1 = __webpack_require__(1);
var listItemText_1 = __webpack_require__(26);
function getCellDisplayValue(value) {
    if (typeof value === 'undefined' || value === null) {
        return '';
    }
    return String(value);
}
exports.getCellDisplayValue = getCellDisplayValue;
function getFormattedValue(props, formatter, defaultValue) {
    var value;
    if (formatter === 'listItemText') {
        value = listItemText_1.listItemText(props);
    }
    else if (typeof formatter === 'function') {
        value = formatter(props);
    }
    else if (typeof formatter === 'string') {
        value = formatter;
    }
    else {
        value = defaultValue;
    }
    var strValue = getCellDisplayValue(value);
    if (strValue && props.column.escapeHTML) {
        return common_1.encodeHTMLEntity(strValue);
    }
    return strValue;
}
function getRelationCbResult(fn, relationParams) {
    return typeof fn === 'function' ? fn(relationParams) : null;
}
function getEditable(fn, relationParams) {
    var result = getRelationCbResult(fn, relationParams);
    return result === null ? true : result;
}
function getDisabled(fn, relationParams) {
    var result = getRelationCbResult(fn, relationParams);
    return result === null ? false : result;
}
function getListItems(fn, relationParams) {
    return getRelationCbResult(fn, relationParams);
}
function getRowHeaderValue(row, columnName) {
    if (columnName === '_number') {
        return row._attributes.rowNum;
    }
    if (columnName === '_checked') {
        return row._attributes.checked;
    }
    return '';
}
function getValidationCode(value, validation) {
    if (validation && validation.required && common_1.isBlank(value)) {
        return 'REQUIRED';
    }
    if (validation && validation.dataType === 'string' && typeof value !== 'string') {
        return 'TYPE_STRING';
    }
    if (validation && validation.dataType === 'number' && typeof value !== 'number') {
        return 'TYPE_NUMBER';
    }
    return '';
}
function createViewCell(row, column) {
    var name = column.name, formatter = column.formatter, prefix = column.prefix, postfix = column.postfix, editor = column.editor, editorOptions = column.editorOptions, validation = column.validation;
    var value = column_1.isRowHeader(name) ? getRowHeaderValue(row, name) : row[name];
    var formatterProps = { row: row, column: column, value: value };
    var _a = row._attributes, disabled = _a.disabled, checkDisabled = _a.checkDisabled, className = _a.className;
    var columnClassName = common_1.isUndefined(className.column[name]) ? [] : className.column[name];
    return {
        editable: !!editor,
        editorOptions: editorOptions ? tslib_1.__assign({}, editorOptions) : {},
        className: className.row.concat(columnClassName).join(' '),
        disabled: name === '_checked' ? checkDisabled : disabled,
        invalidState: getValidationCode(value, validation),
        formattedValue: getFormattedValue(formatterProps, formatter, value),
        prefix: getFormattedValue(formatterProps, prefix),
        postfix: getFormattedValue(formatterProps, postfix),
        value: value
    };
}
function createRelationViewCell(name, row, columnMap, valueMap) {
    var _a = valueMap[name], editable = _a.editable, disabled = _a.disabled, value = _a.value;
    var _b = columnMap[name].relationMap, relationMap = _b === void 0 ? {} : _b;
    Object.keys(relationMap).forEach(function (targetName) {
        var _a = relationMap[targetName], editableCallback = _a.editable, disabledCallback = _a.disabled, listItemsCallback = _a.listItems;
        var relationCbParams = { value: value, editable: editable, disabled: disabled, row: row };
        var targetEditable = getEditable(editableCallback, relationCbParams);
        var targetDisabled = getDisabled(disabledCallback, relationCbParams);
        var targetListItems = getListItems(listItemsCallback, relationCbParams);
        var cellData = createViewCell(row, columnMap[targetName]);
        var hasValue = targetListItems ? common_1.someProp('value', cellData.value, targetListItems) : false;
        if (!hasValue) {
            cellData = createViewCell(row, columnMap[targetName]);
        }
        if (!targetEditable) {
            cellData.editable = false;
        }
        if (targetDisabled) {
            cellData.disabled = true;
        }
        if (Array.isArray(cellData.editorOptions.listItems)) {
            cellData.editorOptions.listItems = targetListItems || [];
        }
        valueMap[targetName] = cellData;
    });
}
function createViewRow(row, columnMap) {
    var rowKey = row.rowKey;
    var initValueMap = {};
    Object.keys(columnMap).forEach(function (name) {
        initValueMap[name] = null;
    });
    var valueMap = observable_1.observable(initValueMap);
    Object.keys(columnMap).forEach(function (name) {
        var _a = columnMap[name], related = _a.related, relationMap = _a.relationMap;
        // add condition expression to prevent to call watch function recursively
        if (!related) {
            observable_1.observe(function () {
                valueMap[name] = createViewCell(row, columnMap[name]);
            });
        }
        // @TODO need to improve relation
        if (relationMap && Object.keys(relationMap).length) {
            observable_1.observe(function () {
                createRelationViewCell(name, row, columnMap, valueMap);
            });
        }
    });
    return { rowKey: rowKey, valueMap: valueMap };
}
exports.createViewRow = createViewRow;
function getAttributes(row, index) {
    var defaultAttr = {
        rowNum: index + 1,
        checked: false,
        disabled: false,
        checkDisabled: false,
        className: {
            row: [],
            column: {}
        }
    };
    if (row._attributes) {
        if (common_1.isBoolean(row._attributes.disabled) && common_1.isUndefined(row._attributes.checkDisabled)) {
            row._attributes.checkDisabled = row._attributes.disabled;
        }
        if (!common_1.isUndefined(row._attributes.className)) {
            row._attributes.className = tslib_1.__assign({ row: [], column: {} }, row._attributes.className);
        }
    }
    return observable_1.observable(tslib_1.__assign({}, defaultAttr, row._attributes));
}
function createRawRow(row, index, defaultValues, keyColumnName) {
    row.rowKey = keyColumnName ? row[keyColumnName] : index;
    row._attributes = getAttributes(row, index);
    defaultValues.forEach(function (_a) {
        var name = _a.name, value = _a.value;
        common_1.setDefaultProp(row, name, value);
    });
    return observable_1.observable(row);
}
exports.createRawRow = createRawRow;
function createData(data, column) {
    var defaultValues = column.defaultValues, keyColumnName = column.keyColumnName;
    var rawData = data.map(function (row, index) { return createRawRow(row, index, defaultValues, keyColumnName); });
    var viewData = rawData.map(function (row) { return createViewRow(row, column.allColumnMap); });
    return { rawData: rawData, viewData: viewData };
}
exports.createData = createData;
function create(data, column) {
    var _a = createData(data, column), rawData = _a.rawData, viewData = _a.viewData;
    // @TODO neet to modify useClient options with net api
    var sortOptions = { columnName: 'rowKey', ascending: true, useClient: false };
    return observable_1.observable({
        disabled: false,
        rawData: rawData,
        viewData: viewData,
        sortOptions: sortOptions,
        get checkedAllRows() {
            var checkedRows = rawData.filter(function (row) { return row._attributes.checked; });
            return checkedRows.length === rawData.length;
        }
    });
}
exports.create = create;


/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var observable_1 = __webpack_require__(5);
var common_1 = __webpack_require__(1);
function getRowHeight(row, defaultRowHeight) {
    var height = row._attributes.height;
    return common_1.isNumber(height) ? height : defaultRowHeight;
}
exports.getRowHeight = getRowHeight;
function create(_a) {
    var data = _a.data, dimension = _a.dimension;
    var rowHeight = dimension.rowHeight;
    return observable_1.observable({
        heights: data.rawData.map(function (row) { return getRowHeight(row, rowHeight); }),
        get offsets() {
            var offsets = [0];
            var heights = this.heights;
            for (var i = 1, len = heights.length; i < len; i += 1) {
                offsets[i] = offsets[i - 1] + heights[i - 1];
            }
            return offsets;
        },
        get totalRowHeight() {
            return common_1.last(this.offsets) + common_1.last(this.heights);
        }
    });
}
exports.create = create;


/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function calculate(values) {
    var cnt = values.length;
    var min = Number.MAX_VALUE;
    var max = Number.MIN_VALUE;
    var sum = 0;
    var avg = 0;
    for (var i = 0; i < cnt; i += 1) {
        var value = Number(values[i]);
        if (isNaN(value)) {
            value = 0;
        }
        sum += value;
        if (min > value) {
            min = value;
        }
        if (max < value) {
            max = value;
        }
    }
    if (!cnt) {
        max = min = avg = 0;
    }
    else {
        avg = sum / cnt;
    }
    return { sum: sum, min: min, max: max, avg: avg, cnt: cnt };
}
exports.calculate = calculate;
function castToSummaryColumnContent(content) {
    if (!content) {
        return null;
    }
    return typeof content === 'string'
        ? { template: content, useAutoSummary: false }
        : {
            template: content.template,
            useAutoSummary: typeof content.useAutoSummary === 'undefined' ? true : content.useAutoSummary
        };
}
exports.castToSummaryColumnContent = castToSummaryColumnContent;
function createSummaryValue(content, columnValues) {
    var initSummaryMap = { sum: 0, min: 0, max: 0, avg: 0, cnt: 0 };
    return content && content.useAutoSummary ? calculate(columnValues) : initSummaryMap;
}
exports.createSummaryValue = createSummaryValue;
function extractSummaryColumnContent(content, defaultContent) {
    var summaryColumnContent = null;
    if (content) {
        summaryColumnContent = content;
    }
    else if (!content && defaultContent) {
        summaryColumnContent = defaultContent;
    }
    return summaryColumnContent;
}
exports.extractSummaryColumnContent = extractSummaryColumnContent;


/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var preact_1 = __webpack_require__(2);
var colGroup_1 = __webpack_require__(12);
var dom_1 = __webpack_require__(3);
var hoc_1 = __webpack_require__(4);
var columnResizer_1 = __webpack_require__(43);
var HeaderAreaComp = /** @class */ (function (_super) {
    tslib_1.__extends(HeaderAreaComp, _super);
    function HeaderAreaComp() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.handleChange = function (ev) {
            var target = ev.target;
            var dispatch = _this.props.dispatch;
            if (target.checked) {
                dispatch('checkAll');
            }
            else {
                dispatch('uncheckAll');
            }
        };
        _this.handleClick = function (ev) {
            var target = ev.target;
            if (!dom_1.hasClass(target, 'btn-sorting')) {
                return;
            }
            var _a = _this.props, dispatch = _a.dispatch, sortOptions = _a.sortOptions;
            var th = dom_1.findParent(target, 'cell');
            var targetColumnName = th.getAttribute('data-column-name');
            var targetAscending = true;
            if (sortOptions) {
                var columnName = sortOptions.columnName, ascending = sortOptions.ascending;
                targetAscending = columnName === targetColumnName ? !ascending : targetAscending;
            }
            dispatch('sort', targetColumnName, targetAscending);
        };
        _this.handleDblClick = function (ev) {
            ev.stopPropagation();
        };
        return _this;
    }
    HeaderAreaComp.prototype.updateRowHeaderCheckbox = function () {
        var _a = this.props, checkedAllRows = _a.checkedAllRows, disabled = _a.disabled;
        var input = this.el.querySelector('input[name=_checked]');
        if (input) {
            input.checked = checkedAllRows;
            input.disabled = disabled;
        }
    };
    HeaderAreaComp.prototype.componentDidUpdate = function () {
        var _a = this.props, scrollLeft = _a.scrollLeft, hasRowHeaderCheckbox = _a.hasRowHeaderCheckbox;
        this.el.scrollLeft = scrollLeft;
        if (hasRowHeaderCheckbox) {
            this.updateRowHeaderCheckbox();
        }
    };
    HeaderAreaComp.prototype.render = function () {
        var _this = this;
        var _a = this.props, headerHeight = _a.headerHeight, cellBorderWidth = _a.cellBorderWidth, columns = _a.columns, side = _a.side, sortOptions = _a.sortOptions;
        var areaStyle = { height: headerHeight + cellBorderWidth };
        var theadStyle = { height: headerHeight };
        return (preact_1.h("div", { class: dom_1.cls('header-area'), style: areaStyle, ref: function (el) {
                _this.el = el;
            } },
            preact_1.h("table", { class: dom_1.cls('table') },
                preact_1.h(colGroup_1.ColGroup, { side: side }),
                preact_1.h("tbody", null,
                    preact_1.h("tr", { style: theadStyle, onClick: this.handleClick, onDblClick: this.handleDblClick }, columns.map(function (_a) {
                        var name = _a.name, header = _a.header, sortable = _a.sortable;
                        return (preact_1.h("th", { key: name, "data-column-name": name, class: dom_1.cls('cell', 'cell-header') },
                            name === '_checked' ? (preact_1.h("span", { dangerouslySetInnerHTML: { __html: header }, onChange: _this.handleChange })) : (header),
                            sortable && (preact_1.h("a", { class: dom_1.cls('btn-sorting', [
                                    sortOptions.columnName === name,
                                    sortOptions.ascending ? 'btn-sorting-up' : 'btn-sorting-down'
                                ]) }))));
                    })))),
            preact_1.h(columnResizer_1.ColumnResizer, { side: side })));
    };
    return HeaderAreaComp;
}(preact_1.Component));
exports.HeaderArea = hoc_1.connect(function (store, _a) {
    var side = _a.side;
    var data = store.data, column = store.column, _b = store.dimension, headerHeight = _b.headerHeight, cellBorderWidth = _b.cellBorderWidth, viewport = store.viewport;
    return {
        headerHeight: headerHeight,
        cellBorderWidth: cellBorderWidth,
        columns: store.column.visibleColumnsBySide[side],
        scrollLeft: side === 'L' ? 0 : viewport.scrollLeft,
        hasRowHeaderCheckbox: !!column.allColumnMap._checked,
        checkedAllRows: data.checkedAllRows,
        sortOptions: data.sortOptions,
        disabled: data.disabled
    };
})(HeaderAreaComp);


/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var preact_1 = __webpack_require__(2);
var bodyRows_1 = __webpack_require__(44);
var colGroup_1 = __webpack_require__(12);
var dom_1 = __webpack_require__(3);
var hoc_1 = __webpack_require__(4);
var focusLayer_1 = __webpack_require__(48);
var selectionLayer_1 = __webpack_require__(49);
var common_1 = __webpack_require__(1);
// Minimum distance (pixel) to detect if user wants to drag when moving mouse with button pressed.
var MIN_DISATNCE_FOR_DRAG = 10;
// only updates when these props are changed
// for preventing unnecessary rendering when scroll changes
var PROPS_FOR_UPDATE = [
    'columns',
    'bodyHeight',
    'totalRowHeight',
    'offsetY'
];
var BodyAreaComp = /** @class */ (function (_super) {
    tslib_1.__extends(BodyAreaComp, _super);
    function BodyAreaComp() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.dragStartData = {
            pageX: null,
            pageY: null
        };
        _this.handleScroll = function (ev) {
            var _a = ev.srcElement, scrollLeft = _a.scrollLeft, scrollTop = _a.scrollTop;
            var dispatch = _this.props.dispatch;
            if (_this.props.side === 'R') {
                dispatch('setScrollLeft', scrollLeft);
            }
            dispatch('setScrollTop', scrollTop);
        };
        _this.handleMouseDown = function (ev) {
            if (!_this.el) {
                return;
            }
            var el = _this.el;
            var shiftKey = ev.shiftKey;
            var pageX = ev.pageX - window.pageXOffset;
            var pageY = ev.pageY - window.pageYOffset;
            var scrollTop = el.scrollTop, scrollLeft = el.scrollLeft;
            var _a = _this.props, side = _a.side, dispatch = _a.dispatch;
            var _b = el.getBoundingClientRect(), top = _b.top, left = _b.left;
            dispatch('mouseDownBody', { top: top, left: left, scrollTop: scrollTop, scrollLeft: scrollLeft, side: side }, { pageX: pageX, pageY: pageY, shiftKey: shiftKey });
            _this.dragStartData = { pageX: pageX, pageY: pageY };
            dom_1.setCursorStyle('default');
            document.addEventListener('mousemove', _this.handleMouseMove);
            document.addEventListener('mouseup', _this.clearDocumentEvents);
            document.addEventListener('selectstart', _this.handleSelectStart);
        };
        _this.moveEnoughToTriggerDragEvent = function (current) {
            var dx = Math.abs(_this.dragStartData.pageX - current.pageX);
            var dy = Math.abs(_this.dragStartData.pageY - current.pageY);
            var distance = Math.round(Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2)));
            return distance >= MIN_DISATNCE_FOR_DRAG;
        };
        _this.handleSelectStart = function (ev) {
            ev.preventDefault();
        };
        _this.handleMouseMove = function (ev) {
            var pageX = ev.pageX - window.pageXOffset;
            var pageY = ev.pageY - window.pageYOffset;
            if (_this.moveEnoughToTriggerDragEvent({ pageX: pageX, pageY: pageY })) {
                var dragData = { pageX: pageX, pageY: pageY };
                _this.props.dispatch('dragMoveBody', _this.dragStartData, dragData);
            }
        };
        _this.clearDocumentEvents = function () {
            _this.dragStartData = { pageX: null, pageY: null };
            _this.props.dispatch('dragEndBody');
            dom_1.setCursorStyle('');
            document.removeEventListener('mousemove', _this.handleMouseMove);
            document.removeEventListener('mouseup', _this.clearDocumentEvents);
            document.removeEventListener('selectstart', _this.handleSelectStart);
        };
        return _this;
    }
    BodyAreaComp.prototype.shouldComponentUpdate = function (nextProps) {
        var currProps = this.props;
        return common_1.some(function (propName) { return nextProps[propName] !== currProps[propName]; }, PROPS_FOR_UPDATE);
    };
    BodyAreaComp.prototype.componentWillReceiveProps = function (nextProps) {
        this.el.scrollTop = nextProps.scrollTop;
        this.el.scrollLeft = nextProps.scrollLeft;
    };
    BodyAreaComp.prototype.render = function (_a) {
        var _this = this;
        var side = _a.side, bodyHeight = _a.bodyHeight, totalRowHeight = _a.totalRowHeight, scrollXHeight = _a.scrollXHeight, offsetY = _a.offsetY, dummyRowCount = _a.dummyRowCount, scrollX = _a.scrollX, scrollY = _a.scrollY;
        var overflowX = scrollX ? 'scroll' : 'hidden';
        var overflowY = scrollY ? 'scroll' : 'hidden';
        var areaStyle = { overflowX: overflowX, overflowY: overflowY, height: bodyHeight };
        var tableContainerStyle = {
            top: offsetY,
            height: dummyRowCount ? bodyHeight - scrollXHeight : '',
            overflow: dummyRowCount ? 'hidden' : 'visible'
        };
        var containerStyle = { height: totalRowHeight };
        return (preact_1.h("div", { class: dom_1.cls('body-area'), style: areaStyle, onScroll: this.handleScroll, onMouseDown: this.handleMouseDown, ref: function (el) {
                _this.el = el;
            } },
            preact_1.h("div", { class: dom_1.cls('body-container'), style: containerStyle },
                preact_1.h("div", { class: dom_1.cls('table-container'), style: tableContainerStyle },
                    preact_1.h("table", { class: dom_1.cls('table') },
                        preact_1.h(colGroup_1.ColGroup, { side: side }),
                        preact_1.h(bodyRows_1.BodyRows, { side: side }))),
                preact_1.h("div", { class: dom_1.cls('layer-selection'), style: "display: none;" }),
                preact_1.h(focusLayer_1.FocusLayer, { side: side }),
                preact_1.h(selectionLayer_1.SelectionLayer, { side: side }))));
    };
    return BodyAreaComp;
}(preact_1.Component));
exports.BodyArea = hoc_1.connect(function (store, _a) {
    var side = _a.side;
    var column = store.column, rowCoords = store.rowCoords, dimension = store.dimension, viewport = store.viewport;
    var totalRowHeight = rowCoords.totalRowHeight;
    var bodyHeight = dimension.bodyHeight, scrollXHeight = dimension.scrollXHeight, scrollX = dimension.scrollX, scrollY = dimension.scrollY;
    var offsetY = viewport.offsetY, scrollTop = viewport.scrollTop, scrollLeft = viewport.scrollLeft, dummyRowCount = viewport.dummyRowCount;
    return {
        columns: column.visibleColumnsBySide[side],
        bodyHeight: bodyHeight,
        totalRowHeight: totalRowHeight,
        scrollTop: scrollTop,
        offsetY: offsetY,
        scrollLeft: side === 'L' ? 0 : scrollLeft,
        scrollXHeight: scrollXHeight,
        dummyRowCount: dummyRowCount,
        scrollX: scrollX,
        scrollY: scrollY
    };
})(BodyAreaComp);


/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var preact_1 = __webpack_require__(2);
var colGroup_1 = __webpack_require__(12);
var summaryBodyRow_1 = __webpack_require__(50);
var dom_1 = __webpack_require__(3);
var hoc_1 = __webpack_require__(4);
var SummaryAreaComp = /** @class */ (function (_super) {
    tslib_1.__extends(SummaryAreaComp, _super);
    function SummaryAreaComp() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.handleScroll = function (ev) {
            var scrollLeft = ev.srcElement.scrollLeft;
            var _a = _this.props, dispatch = _a.dispatch, side = _a.side;
            if (side === 'R') {
                dispatch('setScrollLeft', scrollLeft);
            }
        };
        return _this;
    }
    SummaryAreaComp.prototype.componentWillReceiveProps = function (nextProps) {
        if (this.el) {
            this.el.scrollLeft = nextProps.scrollLeft;
        }
    };
    SummaryAreaComp.prototype.render = function (_a) {
        var _this = this;
        var height = _a.height, columns = _a.columns, side = _a.side;
        var tableStyle = { height: height };
        return (height > 0 && (preact_1.h("div", { class: dom_1.cls('summary-area'), onScroll: this.handleScroll, ref: function (el) {
                _this.el = el;
            } },
            preact_1.h("table", { class: dom_1.cls('table'), style: tableStyle },
                preact_1.h(colGroup_1.ColGroup, { side: side }),
                preact_1.h(summaryBodyRow_1.SummaryBodyRow, { columns: columns })))));
    };
    return SummaryAreaComp;
}(preact_1.Component));
exports.SummaryArea = hoc_1.connect(function (store, _a) {
    var side = _a.side;
    var column = store.column, dimension = store.dimension, viewport = store.viewport;
    var summaryHeight = dimension.summaryHeight;
    var scrollLeft = viewport.scrollLeft;
    return {
        height: summaryHeight,
        columns: column.visibleColumnsBySide[side],
        scrollLeft: scrollLeft
    };
})(SummaryAreaComp);


/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var common_1 = __webpack_require__(1);
function getCellAddressByIndex(_a, rowIndex, columnIndex) {
    var data = _a.data, column = _a.column;
    return {
        rowKey: data.viewData[rowIndex].rowKey,
        columnName: column.visibleColumns[columnIndex].name
    };
}
exports.getCellAddressByIndex = getCellAddressByIndex;
function isCellDisabled(data, rowKey, columnName) {
    var viewData = data.viewData, disabled = data.disabled;
    var row = common_1.findProp('rowKey', rowKey, viewData);
    var rowDisabled = row.valueMap[columnName].disabled;
    return disabled || rowDisabled;
}
exports.isCellDisabled = isCellDisabled;


/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var tslib_1 = __webpack_require__(0);
var grid_1 = tslib_1.__importDefault(__webpack_require__(24));
__webpack_require__(77);
module.exports = grid_1.default;


/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var create_1 = __webpack_require__(25);
var root_1 = __webpack_require__(40);
var preact_1 = __webpack_require__(2);
var create_2 = __webpack_require__(59);
var manager_1 = tslib_1.__importDefault(__webpack_require__(71));
var instance_1 = __webpack_require__(8);
var i18n_1 = tslib_1.__importDefault(__webpack_require__(75));
var clipboard_1 = __webpack_require__(14);
var validation_1 = __webpack_require__(76);
var clipboard_2 = __webpack_require__(9);
var common_1 = __webpack_require__(1);
var observable_1 = __webpack_require__(5);
var eventBus_1 = __webpack_require__(7);
var data_1 = __webpack_require__(22);
var column_1 = __webpack_require__(6);
/* eslint-disable */
if (false) {}
/* eslint-enable */
var Grid = /** @class */ (function () {
    function Grid(options) {
        var el = options.el;
        var id = instance_1.register(this);
        var store = create_1.createStore(id, options);
        var dispatch = create_2.createDispatcher(store);
        var eventBus = eventBus_1.createEventBus(id);
        this.store = store;
        this.dispatch = dispatch;
        this.eventBus = eventBus;
        // @TODO: Only for Development env
        // eslint-disable-next-line
        window.store = store;
        if (!manager_1.default.isApplied()) {
            manager_1.default.apply('default');
        }
        preact_1.render(preact_1.h(root_1.Root, { store: store, dispatch: dispatch, rootElement: el }), el);
    }
    /**
     * Apply theme to all grid instances with the preset options of a given name.
     * @static
     * @param {string} presetName - preset theme name. Available values are 'default', 'striped' and 'clean'.
     * @param {Object} [extOptions] - if exist, extend preset options with this object.
     *     @param {Object} [extOptions.outline] - Styles for the table outline.
     *         @param {string} [extOptions.outline.border] - Color of the table outline.
     *         @param {boolean} [extOptions.outline.showVerticalBorder] - Whether vertical outlines of
     *             the table are visible.
     *     @param {Object} [extOptions.selection] - Styles for a selection layer.
     *         @param {string} [extOptions.selection.background] - Background color of a selection layer.
     *         @param {string} [extOptions.selection.border] - Border color of a selection layer.
     *     @param {Object} [extOptions.scrollbar] - Styles for scrollbars.
     *         @param {string} [extOptions.scrollbar.border] - Border color of scrollbars.
     *         @param {string} [extOptions.scrollbar.background] - Background color of scrollbars.
     *         @param {string} [extOptions.scrollbar.emptySpace] - Color of extra spaces except scrollbar.
     *         @param {string} [extOptions.scrollbar.thumb] - Color of thumbs in scrollbars.
     *         @param {string} [extOptions.scrollbar.active] - Color of arrows(for IE) or
     *              thumb:hover(for other browsers) in scrollbars.
     *     @param {Object} [extOptions.frozenBorder] - Styles for a frozen border.
     *         @param {string} [extOptions.frozenBorder.border] - Border color of a frozen border.
     *     @param {Object} [extOptions.area] - Styles for the table areas.
     *         @param {Object} [extOptions.area.header] - Styles for the header area in the table.
     *             @param {string} [extOptions.area.header.background] - Background color of the header area
     *                 in the table.
     *             @param {string} [extOptions.area.header.border] - Border color of the header area
     *                 in the table.
     *         @param {Object} [extOptions.area.body] - Styles for the body area in the table.
     *             @param {string} [extOptions.area.body.background] - Background color of the body area
     *                 in the table.
     *         @param {Object} [extOptions.area.summary] - Styles for the summary area in the table.
     *             @param {string} [extOptions.area.summary.background] - Background color of the summary area
     *                 in the table.
     *             @param {string} [extOptions.area.summary.border] - Border color of the summary area
     *                 in the table.
     *     @param {Object} [extOptions.cell] - Styles for the table cells.
     *         @param {Object} [extOptions.cell.normal] - Styles for normal cells.
     *             @param {string} [extOptions.cell.normal.background] - Background color of normal cells.
     *             @param {string} [extOptions.cell.normal.border] - Border color of normal cells.
     *             @param {string} [extOptions.cell.normal.text] - Text color of normal cells.
     *             @param {boolean} [extOptions.cell.normal.showVerticalBorder] - Whether vertical borders of
     *                 normal cells are visible.
     *             @param {boolean} [extOptions.cell.normal.showHorizontalBorder] - Whether horizontal borders of
     *                 normal cells are visible.
     *         @param {Object} [extOptions.cell.head] - Styles for head cells.
     *             @param {string} [extOptions.cell.head.background] - Background color of head cells.
     *             @param {string} [extOptions.cell.head.border] - border color of head cells.
     *             @param {string} [extOptions.cell.head.text] - text color of head cells.
     *             @param {boolean} [extOptions.cell.head.showVerticalBorder] - Whether vertical borders of
     *                 head cells are visible.
     *             @param {boolean} [extOptions.cell.head.showHorizontalBorder] - Whether horizontal borders of
     *                 head cells are visible.
     *         @param {Object} [extOptions.cell.selectedHead] - Styles for selected head cells.
     *             @param {string} [extOptions.cell.selectedHead.background] - background color of selected haed cells.
     *         @param {Object} [extOptions.cell.rowHead] - Styles for row's head cells.
     *             @param {string} [extOptions.cell.rowHead.background] - Background color of row's head cells.
     *             @param {string} [extOptions.cell.rowHead.border] - border color of row's head cells.
     *             @param {string} [extOptions.cell.rowHead.text] - text color of row's head cells.
     *             @param {boolean} [extOptions.cell.rowHead.showVerticalBorder] - Whether vertical borders of
     *                 row's head cells are visible.
     *             @param {boolean} [extOptions.cell.rowHead.showHorizontalBorder] - Whether horizontal borders of
     *                 row's head cells are visible.
     *         @param {Object} [extOptions.cell.selectedRowHead] - Styles for selected row's head cells.
     *             @param {string} [extOptions.cell.selectedRowHead.background] - background color of selected row's haed cells.
     *         @param {Object} [extOptions.cell.summary] - Styles for cells in the summary area.
     *             @param {string} [extOptions.cell.summary.background] - Background color of cells in the summary area.
     *             @param {string} [extOptions.cell.summary.border] - border color of cells in the summary area.
     *             @param {string} [extOptions.cell.summary.text] - text color of cells in the summary area.
     *             @param {boolean} [extOptions.cell.summary.showVerticalBorder] - Whether vertical borders of
     *                 cells in the summary area are visible.
     *             @param {boolean} [extOptions.cell.summary.showHorizontalBorder] - Whether horizontal borders of
     *                 cells in the summary area are visible.
     *         @param {Object} [extOptions.cell.focused] - Styles for a focused cell.
     *             @param {string} [extOptions.cell.focused.background] - background color of a focused cell.
     *             @param {string} [extOptions.cell.focused.border] - border color of a focused cell.
     *         @param {Object} [extOptions.cell.focusedInactive] - Styles for a inactive focus cell.
     *             @param {string} [extOptions.cell.focusedInactive.border] - border color of a inactive focus cell.
     *         @param {Object} [extOptions.cell.required] - Styles for required cells.
     *             @param {string} [extOptions.cell.required.background] - background color of required cells.
     *             @param {string} [extOptions.cell.required.text] - text color of required cells.
     *         @param {Object} [extOptions.cell.editable] - Styles for editable cells.
     *             @param {string} [extOptions.cell.editable.background] - background color of the editable cells.
     *             @param {string} [extOptions.cell.editable.text] - text color of the selected editable cells.
     *         @param {Object} [extOptions.cell.disabled] - Styles for disabled cells.
     *             @param {string} [extOptions.cell.disabled.background] - background color of disabled cells.
     *             @param {string} [extOptions.cell.disabled.text] - text color of disabled cells.
     *         @param {Object} [extOptions.cell.invalid] - Styles for invalid cells.
     *             @param {string} [extOptions.cell.invalid.background] - background color of invalid cells.
     *             @param {string} [extOptions.cell.invalid.text] - text color of invalid cells.
     *         @param {Object} [extOptions.cell.currentRow] - Styles for cells in a current row.
     *             @param {string} [extOptions.cell.currentRow.background] - background color of cells in a current row.
     *             @param {string} [extOptions.cell.currentRow.text] - text color of cells in a current row.
     *         @param {Object} [extOptions.cell.evenRow] - Styles for cells in even rows.
     *             @param {string} [extOptions.cell.evenRow.background] - background color of cells in even rows.
     *             @param {string} [extOptions.cell.evenRow.text] - text color of cells in even rows.
     *         @param {Object} [extOptions.cell.oddRow] - Styles for cells in even rows.
     *             @param {string} [extOptions.cell.oddRow.background] - background color of cells in odd rows.
     *             @param {string} [extOptions.cell.oddRow.text] - text color of cells in odd rows.
     *         @param {Object} [extOptions.cell.dummy] - Styles for dummy cells.
     *             @param {string} [extOptions.cell.dummy.background] - background color of dummy cells.
     * @example
     * var Grid = tui.Grid; // or require('tui-grid')
     *
     * Grid.applyTheme('striped', {
     *     grid: {
     *         border: '#aaa',
     *         text: '#333'
     *     },
     *     cell: {
     *         disabled: {
     *             text: '#999'
     *         }
     *     }
     * });
     */
    Grid.applyTheme = function (presetName, extOptions) {
        manager_1.default.apply(presetName, extOptions);
    };
    /**
     * Set language
     * @static
     * @param {string} localeCode - Code to set locale messages and
     *     this is the language or language-region combination (ex: en-US)
     * @param {Object} [data] - Messages using in Grid
     * @example
     * var Grid = tui.Grid; // or require('tui-grid')
     *
     * Grid.setLanguage('en'); // default and set English
     * Grid.setLanguage('ko'); // set Korean
     * Grid.setLanguage('en-US', { // set new language
     *      display: {
     *          noData: 'No data.',
     *          loadingData: 'Loading data.',
     *          resizeHandleGuide: 'You can change the width of the column by mouse drag, ' +
     *                              'and initialize the width by double-clicking.'
     *      },
     *      net: {
     *          confirmCreate: 'Are you sure you want to create {{count}} data?',
     *          confirmUpdate: 'Are you sure you want to update {{count}} data?',
     *          confirmDelete: 'Are you sure you want to delete {{count}} data?',
     *          confirmModify: 'Are you sure you want to modify {{count}} data?',
     *          noDataToCreate: 'No data to create.',
     *          noDataToUpdate: 'No data to update.',
     *          noDataToDelete: 'No data to delete.',
     *          noDataToModify: 'No data to modify.',
     *          failResponse: 'An error occurred while requesting data.\nPlease try again.'
     *      }
     * });
     */
    Grid.setLanguage = function (localeCode, data) {
        i18n_1.default.setLanguage(localeCode, data);
    };
    /**
     * Sets the width of the dimension.
     * @param {number} width - The width of the dimension
     */
    Grid.prototype.setWidth = function (width) {
        this.dispatch('setWidth', width, false);
    };
    /**
     * Sets the height of the dimension.
     * @param {number} height - The height of the dimension
     */
    Grid.prototype.setHeight = function (height) {
        this.dispatch('setHeight', height);
    };
    /**
     * Sets the height of body-area.
     * @param {number} value - The number of pixel
     */
    Grid.prototype.setBodyHeight = function (bodyHeight) {
        this.dispatch('setBodyHeight', bodyHeight);
    };
    /**
     * Sets the count of frozen columns.
     * @param {number} count - The count of columns to be frozen
     */
    Grid.prototype.setFrozenColumnCount = function (count) {
        this.dispatch('setFrozenColumnCount', count);
    };
    /**
     * Hides columns
     * @param {...string} arguments - Column names to hide
     */
    Grid.prototype.hideColumn = function (columnName) {
        this.dispatch('hideColumn', columnName);
    };
    /**
     * Shows columns
     * @param {...string} arguments - Column names to show
     */
    Grid.prototype.showColumn = function (columnName) {
        this.dispatch('showColumn', columnName);
    };
    /**
     * Selects cells or rows by range
     * @param {Object} range - Selection range
     *     @param {Array} [range.start] - Index info of start selection (ex: [rowIndex, columnIndex])
     *     @param {Array} [range.end] - Index info of end selection (ex: [rowIndex, columnIndex])
     */
    Grid.prototype.selection = function (range) {
        this.dispatch('setSelection', range);
    };
    /**
     * Returns data of currently focused cell
     * @returns {number|string} rowKey - The unique key of the row
     * @returns {string} columnName - The name of the column
     * @returns {string} value - The value of the cell
     */
    Grid.prototype.getFocusedCell = function () {
        var _a = this.store.focus, columnName = _a.columnName, rowKey = _a.rowKey;
        var value = null;
        if (rowKey !== null && columnName !== null) {
            value = this.getValue(rowKey, columnName);
        }
        return { rowKey: rowKey, columnName: columnName, value: value };
    };
    /**
     * Removes focus from the focused cell.
     */
    Grid.prototype.blur = function () {
        // @TODO: save previous 이후 추가 필요.
        this.dispatch('setFocusInfo', null, null, false);
    };
    /**
     * Focus to the cell identified by given rowKey and columnName.
     * @param {Number|String} rowKey - rowKey
     * @param {String} columnName - columnName
     * @param {Boolean} [setScroll=false] - if set to true, move scroll position to focused position
     * @returns {Boolean} true if focused cell is changed
     */
    Grid.prototype.focus = function (rowKey, columnName, setScroll) {
        this.dispatch('setFocusInfo', rowKey, columnName, true);
        if (setScroll) {
            this.dispatch('setScrollToFocus');
        }
        // @TODO: radio button인지 확인, radio 버튼인 경우 체크해주기
        return true;
    };
    /**
     * Focus to the cell identified by given rowIndex and columnIndex.
     * @param {Number} rowIndex - rowIndex
     * @param {Number} columnIndex - columnIndex
     * @param {boolean} [setScroll=false] - if set to true, scroll to focused cell
     * @returns {Boolean} true if success
     */
    Grid.prototype.focusAt = function (rowIndex, columnIndex, isScrollable) {
        var _a = data_1.getCellAddressByIndex(this.store, rowIndex, columnIndex), rowKey = _a.rowKey, columnName = _a.columnName;
        if (!common_1.isUndefined(rowKey) && columnName) {
            return this.focus(rowKey, columnName, isScrollable);
        }
        return false;
    };
    /**
     * Makes view ready to get keyboard input.
     */
    Grid.prototype.activateFocus = function () {
        this.dispatch('setNavigating', true);
    };
    /**
     * Sets focus on the cell at the specified index of row and column and starts to edit.
     * @param {number|string} rowKey - The unique key of the row
     * @param {string} columnName - The name of the column
     * @param {boolean} [setScroll=false] - If set to true, the view will scroll to the cell element.
     */
    Grid.prototype.startEditing = function (rowKey, columnName, setScroll) {
        if (this.focus(rowKey, columnName, setScroll)) {
            this.dispatch('startEditing', rowKey, columnName);
        }
    };
    /**
     * Sets focus on the cell at the specified index of row and column and starts to edit.
     * @param {number|string} rowIndex - The index of the row
     * @param {string} columnIndex - The index of the column
     * @param {boolean} [setScroll=false] - If set to true, the view will scroll to the cell element.
     */
    Grid.prototype.startEditingAt = function (rowIndex, columnIndex, setScroll) {
        var _a = data_1.getCellAddressByIndex(this.store, rowIndex, columnIndex), rowKey = _a.rowKey, columnName = _a.columnName;
        this.startEditing(rowKey, columnName, setScroll);
    };
    /**
     * Sets the value of the cell identified by the specified rowKey and columnName.
     * @param {number|string} rowKey - The unique key of the row
     * @param {string} columnName - The name of the column
     * @param {number|string} value - The value to be set
     */
    Grid.prototype.setValue = function (rowKey, columnName, value) {
        this.dispatch('setValue', rowKey, columnName, value);
    };
    /**
     * Returns the value of the cell identified by the rowKey and columnName.
     * @param {number|string} rowKey - The unique key of the target row.
     * @param {string} columnName - The name of the column
     * @param {boolean} [isOriginal] - It set to true, the original value will be return.
     * @returns {number|string} - The value of the cell
     */
    Grid.prototype.getValue = function (rowKey, columnName) {
        var targetRow = this.store.data.rawData.find(function (row) { return row.rowKey === rowKey; });
        // @TODO: isOriginal 처리 original 개념 추가되면 필요(getOriginal)
        if (targetRow) {
            return targetRow[columnName];
        }
        return null;
    };
    /**
     * Sets the all values in the specified column.
     * @param {string} columnName - The name of the column
     * @param {number|string} columnValue - The value to be set
     * @param {boolean} [checkCellState=true] - If set to true, only editable and not disabled cells will be affected.
     */
    Grid.prototype.setColumnValues = function (columnName, columnValue, checkCellState) {
        this.dispatch('setColumnValues', columnName, columnValue, checkCellState);
    };
    /**
     * Sets the HTML string of given column summary.
     * The type of content is the same as the options.summary.columnContent of the constructor.
     * @param {string} columnName - column name
     * @param {string|object} columnContent - HTML string or options object.
     */
    Grid.prototype.setSummaryColumnContent = function (columnName, columnContent) {
        this.dispatch('setSummaryColumnContent', columnName, columnContent);
    };
    /**
     * Returns the values of given column summary.
     * If the column name is not specified, all values of available columns are returned.
     * The shape of returning object looks like the example below.
     * @param {string} [columnName] - column name
     * @returns {Object}
     * @example
     * {
     *     sum: 1000,
     *     avg: 200,
     *     max: 300,
     *     min: 50,
     *     cnt: 5
     * }
     */
    Grid.prototype.getSummaryValues = function (columnName) {
        var summary = this.store.summary;
        var content = summary.summaryColumnContents[columnName];
        if (content && content.useAutoSummary) {
            return summary.summaryValues[columnName];
        }
        return null;
    };
    /**
     * Returns a list of the column model.
     * @returns {Array} - A list of the column model.
     */
    Grid.prototype.getColumns = function () {
        return this.store.column.allColumns
            .filter(function (_a) {
            var name = _a.name;
            return !column_1.isRowHeader(name);
        })
            .map(function (column) { return observable_1.getOriginObject(column); });
    };
    /**
     * Returns a list of all values in the specified column.
     * @param {string} columnName - The name of the column
     * @returns {(Array|string)} - A List of all values in the specified column. (or JSON string of the list)
     */
    Grid.prototype.getColumnValues = function (columnName) {
        return common_1.mapProp(columnName, this.store.data.rawData);
    };
    /**
     * Returns the index of the column indentified by the column name.
     * @param {string} columnName - The unique key of the column
     * @returns {number} - The index of the column
     */
    Grid.prototype.getIndexOfColumn = function (columnName) {
        return common_1.findPropIndex('name', columnName, this.store.column.allColumns);
    };
    /**
     * Checks the row identified by the specified rowKey.
     * @param {number|string} rowKey - The unique key of the row
     */
    Grid.prototype.check = function (rowKey) {
        this.dispatch('check', rowKey);
    };
    /**
     * Unchecks the row identified by the specified rowKey.
     * @param {number|string} rowKey - The unique key of the row
     */
    Grid.prototype.uncheck = function (rowKey) {
        this.dispatch('uncheck', rowKey);
    };
    /**
     * Checks all rows.
     */
    Grid.prototype.checkAll = function () {
        this.dispatch('checkAll');
    };
    /**
     * Unchecks all rows.
     */
    Grid.prototype.uncheckAll = function () {
        this.dispatch('uncheckAll');
    };
    /**
     * Returns a list of the rowKey of checked rows.
     * @returns {Array.<string|number>} - A list of the rowKey.
     */
    Grid.prototype.getCheckedRowKeys = function () {
        return this.store.data.rawData.filter(function (_a) {
            var _checked = _a._checked;
            return _checked;
        }).map(function (_a) {
            var rowKey = _a.rowKey;
            return rowKey;
        });
    };
    /**
     * Returns a list of the checked rows.
     * @returns {Array.<object>} - A list of the checked rows.
     */
    Grid.prototype.getCheckedRows = function () {
        // @TODO 반환되는 값 - 순수 객체 처리 변환
        return this.store.data.rawData.filter(function (_a) {
            var _checked = _a._checked;
            return _checked;
        });
    };
    /**
     * Sorts all rows by the specified column.
     * @param {string} columnName - The name of the column to be used to compare the rows
     * @param {boolean} [ascending] - Whether the sort order is ascending.
     *        If not specified, use the negative value of the current order.
     */
    Grid.prototype.sort = function (columnName, ascending) {
        this.dispatch('sort', columnName, ascending);
    };
    /**
     * Unsorts all rows. (Sorts by rowKey).
     */
    Grid.prototype.unSort = function () {
        this.dispatch('sort', 'rowKey', true);
    };
    /**
     * Gets state of the sorted column in rows
     * @returns {{columnName: string, ascending: boolean, useClient: boolean}} Sorted column's state
     */
    Grid.prototype.getSortState = function () {
        return this.store.data.sortOptions;
    };
    /**
     * Copy to clipboard
     */
    Grid.prototype.copyToClipboard = function () {
        document.querySelector('.tui-grid-clipboard').innerHTML = clipboard_1.getText(this.store);
        if (!clipboard_2.isSupportWindowClipboardData()) {
            // Accessing the clipboard is a security concern on chrome
            document.execCommand('copy');
        }
    };
    /*
     * Validates all data and returns the result.
     * Return value is an array which contains only rows which have invalid cell data.
     * @returns {Array.<Object>} An array of error object
     * @example
     * // return value example
     * [
     *     {
     *         rowKey: 1,
     *         errors: [
     *             {
     *                 columnName: 'c1',
     *                 errorCode: 'REQUIRED'
     *             },
     *             {
     *                 columnName: 'c2',
     *                 errorCode: 'REQUIRED'
     *             }
     *         ]
     *     },
     *     {
     *         rowKey: 3,
     *         errors: [
     *             {
     *                 columnName: 'c2',
     *                 errorCode: 'REQUIRED'
     *             }
     *         ]
     *     }
     * ]
     */
    Grid.prototype.validate = function () {
        return validation_1.getInvalidRows(this.store);
    };
    /**
     * Enables all rows.
     */
    Grid.prototype.enable = function () {
        this.dispatch('setDisabled', false);
    };
    /**
     * Disables all rows.
     */
    Grid.prototype.disable = function () {
        this.dispatch('setDisabled', true);
    };
    /**
     * Disables the row identified by the rowkey.
     * @param {number|string} rowKey - The unique key of the target row
     * @param {boolean} [withCheckbox] - change including checkbox. The default value is 'true'
     */
    Grid.prototype.disableRow = function (rowKey, withCheckbox) {
        if (withCheckbox === void 0) { withCheckbox = true; }
        this.dispatch('setRowDisabled', true, rowKey, withCheckbox);
    };
    /**
     * Enables the row identified by the rowKey.
     * @param {number|string} rowKey - The unique key of the target row
     * @param {boolean} [withCheckbox] - change including checkbox. The default value is 'true'
     */
    Grid.prototype.enableRow = function (rowKey, withCheckbox) {
        if (withCheckbox === void 0) { withCheckbox = true; }
        this.dispatch('setRowDisabled', false, rowKey, withCheckbox);
    };
    /**
     * Disables the row identified by the spcified rowKey to not be able to check.
     * @param {number|string} rowKey - The unique keyof the row.
     */
    Grid.prototype.disableRowCheck = function (rowKey) {
        this.dispatch('setRowCheckDisabled', true, rowKey);
    };
    /**
     * Enables the row identified by the rowKey to be able to check.
     * @param {number|string} rowKey - The unique key of the row
     */
    Grid.prototype.enableRowCheck = function (rowKey) {
        this.dispatch('setRowCheckDisabled', false, rowKey);
    };
    /*
     * Inserts the new row with specified data to the end of table.
     * @param {Object} [row] - The data for the new row
     * @param {Object} [options] - Options
     * @param {number} [options.at] - The index at which new row will be inserted
     * @param {boolean} [options.extendPrevRowSpan] - If set to true and the previous row at target index
     *        has a rowspan data, the new row will extend the existing rowspan data.
     * @param {boolean} [options.focus] - If set to true, move focus to the new row after appending
     * @param {(Number|String)} [options.parentRowKey] - Tree row key of the parent which appends given rows
     * @param {number} [options.offset] - Tree offset from first sibling
     */
    Grid.prototype.appendRow = function (row, options) {
        if (row === void 0) { row = {}; }
        if (options === void 0) { options = {}; }
        this.dispatch('appendRow', row, options);
        if (options.focus) {
            var rowIdx = common_1.isUndefined(options.at) ? this.getRowCount() - 1 : options.at;
            this.focusAt(rowIdx, 0);
        }
    };
    /**
     * Inserts the new row with specified data to the beginning of table.
     * @param {Object} [row] - The data for the new row
     * @param {Object} [options] - Options
     * @param {boolean} [options.focus] - If set to true, move focus to the new row after appending
     */
    Grid.prototype.prependRow = function (row, options) {
        if (options === void 0) { options = {}; }
        this.appendRow(row, tslib_1.__assign({}, options, { at: 0 }));
    };
    /**
     * Removes the row identified by the specified rowKey.
     * @param {number|string} rowKey - The unique key of the row
     * @param {boolean} [options.removeOriginalData] - If set to true, the original data will be removed.
     * @param {boolean} [options.keepRowSpanData] - If set to true, the value of the merged cells will not be
     *     removed although the target is first cell of them.
     */
    Grid.prototype.removeRow = function (rowKey, options) {
        if (options === void 0) { options = {}; }
        this.dispatch('removeRow', rowKey, options);
    };
    /**
     * Returns the object that contains all values in the specified row.
     * @param {number|string} rowKey - The unique key of the target row
     * @returns {Object} - The object that contains all values in the row.
     */
    Grid.prototype.getRow = function (rowKey) {
        return this.getRowAt(this.getIndexOfRow(rowKey));
    };
    /**
     * Returns the object that contains all values in the row at specified index.
     * @param {number} rowIdx - The index of the row
     * @returns {Object} - The object that contains all values in the row.
     */
    Grid.prototype.getRowAt = function (rowIdx) {
        var row = this.store.data.rawData[rowIdx];
        return row ? observable_1.getOriginObject(row) : null;
    };
    /**
     * Returns the index of the row indentified by the rowKey.
     * @param {number|string} rowKey - The unique key of the row
     * @returns {number} - The index of the row
     */
    Grid.prototype.getIndexOfRow = function (rowKey) {
        return common_1.findPropIndex('rowKey', rowKey, this.store.data.rawData);
    };
    /**
     * Returns a list of all rows.
     * @returns {Array} - A list of all rows
     */
    Grid.prototype.getData = function () {
        return this.store.data.rawData.map(function (row) { return observable_1.getOriginObject(row); });
    };
    /**
     * Returns the total number of the rows.
     * @returns {number} - The total number of the rows
     */
    Grid.prototype.getRowCount = function () {
        return this.store.data.rawData.length;
    };
    /**
     * Removes all rows.
     */
    Grid.prototype.clear = function () {
        this.dispatch('clearData');
    };
    /**
     * Replaces all rows with the specified list. This will not change the original data.
     * @param {Array} data - A list of new rows
     */
    Grid.prototype.resetData = function (data) {
        this.dispatch('resetData', data);
    };
    /**
     * Adds the specified css class to cell element identified by the rowKey and className
     * @param {number|string} rowKey - The unique key of the row
     * @param {string} columnName - The name of the column
     * @param {string} className - The css class name to add
     */
    Grid.prototype.addCellClassName = function (rowKey, columnName, className) {
        this.dispatch('addCellClassName', rowKey, columnName, className);
    };
    /**
     * Adds the specified css class to all cell elements in the row identified by the rowKey
     * @param {number|string} rowKey - The unique key of the row
     * @param {string} className - The css class name to add
     */
    Grid.prototype.addRowClassName = function (rowKey, className) {
        this.dispatch('addRowClassName', rowKey, className);
    };
    /**
     * Removes the specified css class from the cell element indentified by the rowKey and columnName.
     * @param {number|string} rowKey - The unique key of the row
     * @param {string} columnName - The name of the column
     * @param {string} className - The css class name to be removed
     */
    Grid.prototype.removeCellClassName = function (rowKey, columnName, className) {
        this.dispatch('removeCellClassName', rowKey, columnName, className);
    };
    /**
     * Removes the specified css class from all cell elements in the row identified by the rowKey.
     * @param {number|string} rowKey - The unique key of the row
     * @param {string} className - The css class name to be removed
     */
    Grid.prototype.removeRowClassName = function (rowKey, className) {
        this.dispatch('removeRowClassName', rowKey, className);
    };
    Grid.prototype.on = function (eventName, fn) {
        this.eventBus.on(eventName, fn);
    };
    Grid.prototype.off = function (eventName, fn) {
        this.eventBus.off(eventName, fn);
    };
    return Grid;
}());
exports.default = Grid;


/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var observable_1 = __webpack_require__(5);
var data_1 = __webpack_require__(16);
var column_1 = __webpack_require__(27);
var dimension_1 = __webpack_require__(34);
var viewport_1 = __webpack_require__(35);
var columnCoords_1 = __webpack_require__(36);
var rowCoords_1 = __webpack_require__(17);
var focus_1 = __webpack_require__(37);
var summary_1 = __webpack_require__(38);
var selection_1 = __webpack_require__(39);
function createStore(id, options) {
    var el = options.el, width = options.width, rowHeight = options.rowHeight, bodyHeight = options.bodyHeight, minBodyHeight = options.minBodyHeight, _a = options.columnOptions, columnOptions = _a === void 0 ? {} : _a, keyColumnName = options.keyColumnName, _b = options.rowHeaders, rowHeaders = _b === void 0 ? [] : _b, _c = options.copyOptions, copyOptions = _c === void 0 ? {} : _c, _d = options.summary, summaryOptions = _d === void 0 ? {} : _d, _e = options.selectionUnit, selectionUnit = _e === void 0 ? 'cell' : _e, _f = options.showDummyRows, showDummyRows = _f === void 0 ? false : _f, _g = options.editingEvent, editingEvent = _g === void 0 ? 'dblclick' : _g, _h = options.scrollX, scrollX = _h === void 0 ? true : _h, _j = options.scrollY, scrollY = _j === void 0 ? true : _j;
    var frozenBorderWidth = columnOptions.frozenBorderWidth;
    var summaryHeight = summaryOptions.height, summaryPosition = summaryOptions.position;
    var column = column_1.create({
        columns: options.columns,
        columnOptions: columnOptions,
        rowHeaders: rowHeaders,
        copyOptions: copyOptions,
        keyColumnName: keyColumnName
    });
    var data = data_1.create(options.data || [], column);
    var dimension = dimension_1.create({
        column: column,
        width: width,
        domWidth: el.clientWidth,
        rowHeight: rowHeight,
        bodyHeight: bodyHeight,
        minBodyHeight: minBodyHeight,
        frozenBorderWidth: frozenBorderWidth,
        summaryHeight: summaryHeight,
        summaryPosition: summaryPosition,
        scrollX: scrollX,
        scrollY: scrollY
    });
    var columnCoords = columnCoords_1.create({ column: column, dimension: dimension });
    var rowCoords = rowCoords_1.create({ data: data, dimension: dimension });
    var viewport = viewport_1.create({
        data: data,
        column: column,
        dimension: dimension,
        rowCoords: rowCoords,
        columnCoords: columnCoords,
        showDummyRows: showDummyRows
    });
    var focus = focus_1.create({ data: data, column: column, columnCoords: columnCoords, rowCoords: rowCoords, editingEvent: editingEvent });
    var summary = summary_1.create({ column: column, data: data, summary: summaryOptions });
    var selection = selection_1.create({ selectionUnit: selectionUnit, columnCoords: columnCoords, column: column, dimension: dimension, rowCoords: rowCoords });
    // manual observe to resolve circular references
    observable_1.observe(function () {
        dimension_1.setBodyHeight(dimension, rowCoords);
    });
    return observable_1.observable({
        id: id,
        data: data,
        column: column,
        dimension: dimension,
        columnCoords: columnCoords,
        rowCoords: rowCoords,
        viewport: viewport,
        focus: focus,
        summary: summary,
        selection: selection
    });
}
exports.createStore = createStore;


/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var common_1 = __webpack_require__(1);
function getListItemText(listItems, value) {
    var item = common_1.findProp('value', value, listItems);
    return item ? item.text : '';
}
function listItemText(_a) {
    var column = _a.column, value = _a.value;
    var _b = column.editorOptions, type = _b.type, listItems = _b.listItems;
    if (type === 'checkbox') {
        return String(value)
            .split(',')
            .map(getListItemText.bind(null, listItems))
            .join(',');
    }
    return getListItemText(listItems, value);
}
exports.listItemText = listItemText;


/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var observable_1 = __webpack_require__(5);
var common_1 = __webpack_require__(1);
var default_1 = __webpack_require__(28);
var manager_1 = __webpack_require__(29);
var rowHeaderInput_1 = __webpack_require__(33);
var defMinWidth = {
    ROW_HEADER: 40,
    COLUMN: 50
};
var DEF_ROW_HEADER_INPUT = '<input type="checkbox" name="_checked" />';
function getEditorInfo(editor, editorOptions) {
    if (typeof editor === 'string') {
        var editInfo = manager_1.editorMap[editor];
        return {
            editor: editInfo[0],
            editorOptions: tslib_1.__assign({}, editInfo[1], editorOptions)
        };
    }
    return { editor: editor, editorOptions: editorOptions };
}
function getRelationMap(relations) {
    var relationMap = {};
    relations.forEach(function (relation) {
        var editable = relation.editable, disabled = relation.disabled, listItems = relation.listItems, _a = relation.targetNames, targetNames = _a === void 0 ? [] : _a;
        targetNames.forEach(function (targetName) {
            relationMap[targetName] = {
                editable: editable,
                disabled: disabled,
                listItems: listItems
            };
        });
    });
    return relationMap;
}
function getRelationColumns(relations) {
    var relationColumns = [];
    relations.forEach(function (relation) {
        var _a = relation.targetNames, targetNames = _a === void 0 ? [] : _a;
        targetNames.forEach(function (targetName) {
            relationColumns.push(targetName);
        });
    });
    return relationColumns;
}
function createColumn(column, columnOptions, relationColumns, gridCopyOptions) {
    var header = column.header, width = column.width, minWidth = column.minWidth, align = column.align, hidden = column.hidden, resizable = column.resizable, editor = column.editor, editorOptions = column.editorOptions, renderer = column.renderer, relations = column.relations, sortable = column.sortable, copyOptions = column.copyOptions, validation = column.validation;
    return observable_1.observable(tslib_1.__assign({}, column, { escapeHTML: !!column.escapeHTML, header: header || column.name, hidden: Boolean(hidden), resizable: Boolean(resizable), align: align || 'left', renderer: renderer || default_1.DefaultRenderer, fixedWidth: typeof width === 'number', copyOptions: tslib_1.__assign({}, gridCopyOptions, copyOptions), baseWidth: (width === 'auto' ? 0 : width) || 0, minWidth: minWidth || columnOptions.minWidth || defMinWidth.COLUMN, relationMap: getRelationMap(relations || []), related: common_1.includes(relationColumns, column.name), sortable: sortable }, getEditorInfo(editor, editorOptions), { validation: validation ? tslib_1.__assign({}, validation) : {} }));
}
function createRowHeader(data) {
    var rowHeader = typeof data === 'string' ? { name: data } : data;
    var name = rowHeader.name, header = rowHeader.header, align = rowHeader.align, renderer = rowHeader.renderer, rendererOptions = rowHeader.rendererOptions, width = rowHeader.width, minWidth = rowHeader.minWidth;
    var baseRendererOptions = rendererOptions || { inputType: 'checkbox' };
    var baseMinWith = typeof minWidth === 'number' ? minWidth : defMinWidth.ROW_HEADER;
    var baseWidth = (width === 'auto' ? baseMinWith : width) || baseMinWith;
    var isRowNum = name === '_number';
    var defaultHeader = '';
    if (isRowNum) {
        defaultHeader = 'No.';
    }
    else if (baseRendererOptions.inputType === 'checkbox') {
        defaultHeader = DEF_ROW_HEADER_INPUT;
    }
    return observable_1.observable({
        name: name,
        header: header || defaultHeader,
        hidden: false,
        resizable: false,
        align: align || 'center',
        renderer: renderer || (isRowNum ? default_1.DefaultRenderer : rowHeaderInput_1.RowHeaderInputRenderer),
        rendererOptions: baseRendererOptions,
        fixedWidth: true,
        baseWidth: baseWidth,
        escapeHTML: false,
        minWidth: baseMinWith
    });
}
function create(_a) {
    var columns = _a.columns, columnOptions = _a.columnOptions, rowHeaders = _a.rowHeaders, copyOptions = _a.copyOptions, keyColumnName = _a.keyColumnName;
    var relationColumns = columns.reduce(function (acc, _a) {
        var relations = _a.relations;
        acc = acc.concat(getRelationColumns(relations || []));
        return acc.filter(function (columnName, idx) { return acc.indexOf(columnName) === idx; });
    }, []);
    var rowHeaderInfos = rowHeaders.map(function (rowHeader) { return createRowHeader(rowHeader); });
    var columnInfos = columns.map(function (column) {
        return createColumn(column, columnOptions, relationColumns, copyOptions);
    });
    var allColumns = rowHeaderInfos.concat(columnInfos);
    return observable_1.observable({
        keyColumnName: keyColumnName,
        frozenCount: columnOptions.frozenCount || 0,
        allColumns: allColumns,
        get allColumnMap() {
            return common_1.createMapFromArray(this.allColumns, 'name');
        },
        get rowHeaderCount() {
            return rowHeaderInfos.length;
        },
        get visibleColumns() {
            return allColumns.filter(function (_a) {
                var hidden = _a.hidden;
                return !hidden;
            });
        },
        get visibleColumnsBySide() {
            var frozenLastIndex = this.frozenCount + this.rowHeaderCount;
            return {
                L: this.visibleColumns.slice(0, frozenLastIndex),
                R: this.visibleColumns.slice(frozenLastIndex)
            };
        },
        get defaultValues() {
            return this.allColumns
                .filter(function (_a) {
                var defaultValue = _a.defaultValue;
                return Boolean(defaultValue);
            })
                .map(function (_a) {
                var name = _a.name, defaultValue = _a.defaultValue;
                return ({ name: name, value: defaultValue });
            });
        },
        get visibleFrozenCount() {
            return this.visibleColumnsBySide.L.length;
        },
        get validationColumns() {
            return allColumns.filter(function (_a) {
                var validation = _a.validation;
                return !!validation;
            });
        }
    });
}
exports.create = create;


/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var dom_1 = __webpack_require__(3);
var DefaultRenderer = /** @class */ (function () {
    function DefaultRenderer(props) {
        var el = document.createElement('div');
        var _a = props.columnInfo, ellipsis = _a.ellipsis, whiteSpace = _a.whiteSpace;
        el.className = dom_1.cls('cell-content');
        if (ellipsis) {
            el.style.textOverflow = 'ellipsis';
        }
        if (whiteSpace) {
            el.style.whiteSpace = whiteSpace;
        }
        this.el = el;
        this.changed(props);
    }
    DefaultRenderer.prototype.getElement = function () {
        return this.el;
    };
    DefaultRenderer.prototype.changed = function (props) {
        this.el.innerHTML = "" + props.prefix + props.formattedValue + props.postfix;
    };
    return DefaultRenderer;
}());
exports.DefaultRenderer = DefaultRenderer;


/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var text_1 = __webpack_require__(30);
var checkbox_1 = __webpack_require__(31);
var select_1 = __webpack_require__(32);
exports.editorMap = {
    text: [text_1.TextEditor, { type: 'text' }],
    password: [text_1.TextEditor, { type: 'password' }],
    checkbox: [checkbox_1.CheckboxEditor, { type: 'checkbox' }],
    radio: [checkbox_1.CheckboxEditor, { type: 'radio' }],
    select: [select_1.SelectEditor]
};


/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var dom_1 = __webpack_require__(3);
var TextEditor = /** @class */ (function () {
    function TextEditor(props) {
        var el = document.createElement('input');
        var options = props.editorOptions;
        el.className = dom_1.cls('content-text');
        el.type = options.type;
        el.value = String(props.value);
        this.el = el;
    }
    TextEditor.prototype.getElement = function () {
        return this.el;
    };
    TextEditor.prototype.getValue = function () {
        return this.el.value;
    };
    TextEditor.prototype.start = function () {
        this.el.select();
    };
    return TextEditor;
}());
exports.TextEditor = TextEditor;


/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var CheckboxEditor = /** @class */ (function () {
    function CheckboxEditor(props) {
        var _this = this;
        var name = 'tui-grid-check-input';
        var el = document.createElement('fieldset');
        var _a = props.editorOptions, listItems = _a.listItems, type = _a.type;
        listItems.forEach(function (_a) {
            var text = _a.text, value = _a.value;
            var id = name + "-" + value;
            el.appendChild(_this.createCheckbox(value, name, id, type));
            el.appendChild(_this.createLabel(text, id));
        });
        this.el = el;
        this.setValue(props.value);
    }
    CheckboxEditor.prototype.createLabel = function (text, id) {
        var label = document.createElement('label');
        label.innerText = text;
        label.setAttribute('for', id);
        return label;
    };
    CheckboxEditor.prototype.createCheckbox = function (value, name, id, inputType) {
        var input = document.createElement('input');
        input.type = inputType;
        input.id = id;
        input.name = name;
        input.value = String(value);
        input.setAttribute('data-value-type', 'string');
        return input;
    };
    CheckboxEditor.prototype.getFirstInput = function () {
        return this.el.querySelector('input');
    };
    CheckboxEditor.prototype.getElement = function () {
        return this.el;
    };
    CheckboxEditor.prototype.setValue = function (value) {
        var _this = this;
        String(value)
            .split(',')
            .forEach(function (inputValue) {
            var input = _this.el.querySelector("input[value=\"" + inputValue + "\"]");
            if (input) {
                input.checked = true;
            }
        });
    };
    CheckboxEditor.prototype.getValue = function () {
        var checkedInputs = this.el.querySelectorAll('input:checked');
        var checkedValues = [];
        for (var i = 0, len = checkedInputs.length; i < len; i += 1) {
            checkedValues.push(checkedInputs[i].value);
        }
        return checkedValues.join(',');
    };
    CheckboxEditor.prototype.start = function () {
        var firstInput = this.getFirstInput();
        if (firstInput) {
            firstInput.focus();
        }
    };
    return CheckboxEditor;
}());
exports.CheckboxEditor = CheckboxEditor;


/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var SelectEditor = /** @class */ (function () {
    function SelectEditor(props) {
        var _this = this;
        var el = document.createElement('select');
        var listItems = props.editorOptions.listItems;
        listItems.forEach(function (_a) {
            var text = _a.text, value = _a.value;
            el.appendChild(_this.createOptions(text, value));
        });
        el.value = String(props.value);
        this.el = el;
    }
    SelectEditor.prototype.createOptions = function (text, value) {
        var option = document.createElement('option');
        option.setAttribute('value', String(value));
        option.innerText = text;
        return option;
    };
    SelectEditor.prototype.getElement = function () {
        return this.el;
    };
    SelectEditor.prototype.getValue = function () {
        return this.el.value;
    };
    SelectEditor.prototype.start = function () {
        this.el.focus();
    };
    return SelectEditor;
}());
exports.SelectEditor = SelectEditor;


/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var RowHeaderInputRenderer = /** @class */ (function () {
    function RowHeaderInputRenderer(props) {
        var el = document.createElement('input');
        var grid = props.grid, rowKey = props.rowKey, disabled = props.disabled, allDisabled = props.allDisabled, rendererOptions = props.columnInfo.rendererOptions;
        el.type = rendererOptions ? rendererOptions.inputType : 'checkbox';
        el.name = '_checked';
        el.disabled = allDisabled || disabled;
        el.addEventListener('change', function () {
            if (el.checked) {
                grid.check(rowKey);
            }
            else {
                grid.uncheck(rowKey);
            }
        });
        this.el = el;
        this.changed(props);
    }
    RowHeaderInputRenderer.prototype.getElement = function () {
        return this.el;
    };
    RowHeaderInputRenderer.prototype.changed = function (props) {
        var value = props.value, allDisabled = props.allDisabled, disabled = props.disabled;
        this.el.checked = Boolean(value);
        this.el.disabled = allDisabled || disabled;
    };
    return RowHeaderInputRenderer;
}());
exports.RowHeaderInputRenderer = RowHeaderInputRenderer;


/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var observable_1 = __webpack_require__(5);
var common_1 = __webpack_require__(1);
function create(_a) {
    var column = _a.column, _b = _a.width, width = _b === void 0 ? 'auto' : _b, domWidth = _a.domWidth, _c = _a.rowHeight, rowHeight = _c === void 0 ? 40 : _c, _d = _a.bodyHeight, bodyHeight = _d === void 0 ? 'auto' : _d, _e = _a.minRowHeight, minRowHeight = _e === void 0 ? 40 : _e, _f = _a.minBodyHeight, minBodyHeight = _f === void 0 ? 130 : _f, _g = _a.frozenBorderWidth, frozenBorderWidth = _g === void 0 ? 1 : _g, scrollX = _a.scrollX, scrollY = _a.scrollY, _h = _a.summaryHeight, summaryHeight = _h === void 0 ? 0 : _h, _j = _a.summaryPosition, summaryPosition = _j === void 0 ? 'bottom' : _j;
    var bodyHeightVal = typeof bodyHeight === 'number' ? Math.max(bodyHeight, minBodyHeight) : 0;
    return observable_1.observable({
        offsetLeft: 0,
        offsetTop: 0,
        width: width === 'auto' ? domWidth : width,
        autoWidth: width === 'auto',
        minBodyHeight: minBodyHeight,
        bodyHeight: Math.max(bodyHeightVal, minBodyHeight),
        autoHeight: bodyHeight === 'auto',
        fitToParentHeight: bodyHeight === 'fitToParent',
        minRowHeight: minRowHeight,
        rowHeight: common_1.isNumber(rowHeight) ? Math.max(rowHeight, minRowHeight) : minRowHeight,
        autoRowHeight: rowHeight === 'auto',
        scrollX: scrollX,
        scrollY: scrollY,
        summaryHeight: summaryHeight,
        summaryPosition: summaryPosition,
        headerHeight: 40,
        scrollbarWidth: 17,
        tableBorderWidth: 1,
        cellBorderWidth: 1,
        get scrollYWidth() {
            return this.scrollY ? this.scrollbarWidth : 0;
        },
        get scrollXHeight() {
            return this.scrollX ? this.scrollbarWidth : 0;
        },
        get frozenBorderWidth() {
            var visibleFrozenCount = column.visibleFrozenCount, rowHeaderCount = column.rowHeaderCount;
            var visibleLeftColumnCount = visibleFrozenCount - rowHeaderCount;
            return visibleLeftColumnCount > 0 ? frozenBorderWidth : 0;
        },
        get contentsWidth() {
            var columnLen = column.visibleColumns.length;
            var totalBorderWidth = (columnLen + 1) * this.cellBorderWidth;
            return this.width - this.scrollYWidth - totalBorderWidth - this.frozenBorderWidth;
        }
    });
}
exports.create = create;
function setBodyHeight(dimension, rowCoords) {
    var totalRowHeight = rowCoords.totalRowHeight;
    var autoHeight = dimension.autoHeight, scrollXHeight = dimension.scrollXHeight;
    if (autoHeight) {
        dimension.bodyHeight = totalRowHeight + scrollXHeight;
    }
}
exports.setBodyHeight = setBodyHeight;


/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var observable_1 = __webpack_require__(5);
var common_1 = __webpack_require__(1);
function indexOfRow(rowOffsets, posY) {
    var rowOffset = common_1.findIndex(function (offset) { return offset > posY; }, rowOffsets);
    return rowOffset === -1 ? rowOffsets.length - 1 : rowOffset - 1;
}
function create(_a) {
    var data = _a.data, column = _a.column, dimension = _a.dimension, rowCoords = _a.rowCoords, columnCoords = _a.columnCoords, showDummyRows = _a.showDummyRows;
    var visibleColumns = column.visibleColumns;
    return observable_1.observable({
        scrollLeft: 0,
        scrollTop: 0,
        scrollPixelScale: 40,
        get maxScrollLeft() {
            var scrollbarWidth = dimension.scrollbarWidth, cellBorderWidth = dimension.cellBorderWidth;
            var areaWidth = columnCoords.areaWidth, widths = columnCoords.widths;
            var totalRWidth = 0;
            widths.R.forEach(function (width) {
                totalRWidth += width + cellBorderWidth;
            });
            return totalRWidth - areaWidth.R + scrollbarWidth;
        },
        get maxScrollTop() {
            var bodyHeight = dimension.bodyHeight, scrollbarWidth = dimension.scrollbarWidth;
            var totalRowHeight = rowCoords.totalRowHeight;
            return totalRowHeight - bodyHeight + scrollbarWidth;
        },
        get colRange() {
            return [0, visibleColumns.length];
        },
        get rowRange() {
            var bodyHeight = dimension.bodyHeight;
            var offsets = rowCoords.offsets;
            // safari uses negative scrollTop for bouncing effect
            var scrollY = Math.max(this.scrollTop, 0);
            var start = indexOfRow(offsets, scrollY);
            var end = indexOfRow(offsets, scrollY + bodyHeight) + 1;
            var value = [start, end];
            var prevValue = this.__storage__.rowRange;
            if (prevValue && common_1.arrayEqual(prevValue, value)) {
                return prevValue;
            }
            return value;
        },
        get rows() {
            var _a;
            return (_a = data.viewData).slice.apply(_a, this.rowRange);
        },
        get offsetY() {
            return rowCoords.offsets[this.rowRange[0]];
        },
        get dummyRowCount() {
            var rowHeight = dimension.rowHeight, bodyHeight = dimension.bodyHeight, scrollXHeight = dimension.scrollXHeight, cellBorderWidth = dimension.cellBorderWidth;
            var totalRowHeight = rowCoords.totalRowHeight;
            var adjustedRowHeight = rowHeight + cellBorderWidth;
            var adjustedBodyHeight = bodyHeight - scrollXHeight;
            if (showDummyRows && totalRowHeight < adjustedBodyHeight) {
                return Math.ceil((adjustedBodyHeight - totalRowHeight) / adjustedRowHeight) + 1;
            }
            return 0;
        }
    });
}
exports.create = create;


/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var observable_1 = __webpack_require__(5);
var common_1 = __webpack_require__(1);
function distributeExtraWidthEqually(extraWidth, targetIdxes, widths) {
    var targetLen = targetIdxes.length;
    var avgValue = Math.round(extraWidth / targetLen);
    var errorValue = avgValue * targetLen - extraWidth; // to correct total width
    var result = widths.slice();
    targetIdxes.forEach(function (idx) {
        result[idx] += avgValue;
    });
    if (targetLen) {
        result[targetIdxes[targetLen - 1]] -= errorValue;
    }
    return result;
}
function fillEmptyWidth(contentWidth, widths) {
    var remainTotalWidth = contentWidth - common_1.sum(widths);
    var emptyIndexes = common_1.findIndexes(function (width) { return !width; }, widths);
    return distributeExtraWidthEqually(remainTotalWidth, emptyIndexes, widths);
}
function applyMinimumWidth(minWidths, widths) {
    return widths.map(function (width, index) { return Math.max(width, minWidths[index]); });
}
function reduceExcessColumnWidthSub(totalRemainWidth, availableList, widths) {
    var avgValue = Math.round(totalRemainWidth / availableList.length);
    var newAvailableList = [];
    availableList.forEach(function (_a) {
        var index = _a[0], width = _a[1];
        // note that totalRemainWidth and avgValue are negative number.
        if (width < Math.abs(avgValue)) {
            totalRemainWidth += width;
            widths[index] -= width;
        }
        else {
            newAvailableList.push([index, width]);
        }
    });
    // call recursively until all available width are less than average
    if (availableList.length > newAvailableList.length) {
        return reduceExcessColumnWidthSub(totalRemainWidth, newAvailableList, widths);
    }
    var columnIndexes = availableList.map(function (_a) {
        var index = _a[0];
        return index;
    });
    return distributeExtraWidthEqually(totalRemainWidth, columnIndexes, widths);
}
function adjustWidths(minWidths, fixedFlags, availableWidth, fitToReducedTotal, widths) {
    var columnLength = widths.length;
    var totalExtraWidth = availableWidth - common_1.sum(widths);
    var fixedCount = fixedFlags.filter(Boolean).length;
    var fixedIndexes = common_1.findIndexes(function (v) { return !v; }, fixedFlags);
    var result;
    if (totalExtraWidth > 0 && columnLength > fixedCount) {
        result = distributeExtraWidthEqually(totalExtraWidth, fixedIndexes, widths);
    }
    else if (fitToReducedTotal && totalExtraWidth < 0) {
        var availableWidthInfos = fixedIndexes.map(function (index) { return [index, widths[index] - minWidths[index]]; });
        result = reduceExcessColumnWidthSub(totalExtraWidth, availableWidthInfos, widths);
    }
    else {
        result = widths;
    }
    return result;
}
function calculateWidths(columns, contentWidth) {
    var baseWidths = common_1.mapProp('baseWidth', columns);
    var minWidths = common_1.mapProp('minWidth', columns);
    var fixedFlags = common_1.mapProp('fixedWidth', columns);
    return common_1.pipe(baseWidths, fillEmptyWidth.bind(null, contentWidth), applyMinimumWidth.bind(null, minWidths), adjustWidths.bind(null, minWidths, fixedFlags, contentWidth, true));
}
function calculateOffsets(widths, borderWidth) {
    var offsets = [0];
    for (var i = 1, len = widths.length; i < len; i += 1) {
        offsets[i] = offsets[i - 1] + widths[i - 1] + borderWidth;
    }
    return offsets;
}
function create(_a) {
    var column = _a.column, dimension = _a.dimension;
    return observable_1.observable({
        get widths() {
            var visibleColumns = column.visibleColumns, visibleFrozenCount = column.visibleFrozenCount;
            var widths = calculateWidths(visibleColumns, dimension.contentsWidth);
            return {
                L: widths.slice(0, visibleFrozenCount),
                R: widths.slice(visibleFrozenCount)
            };
        },
        get offsets() {
            return {
                L: calculateOffsets(this.widths.L, dimension.cellBorderWidth),
                R: calculateOffsets(this.widths.R, dimension.cellBorderWidth)
            };
        },
        get areaWidth() {
            var visibleFrozenCount = column.visibleFrozenCount;
            var width = dimension.width, frozenBorderWidth = dimension.frozenBorderWidth, cellBorderWidth = dimension.cellBorderWidth;
            var leftBorderWidth = visibleFrozenCount * dimension.cellBorderWidth;
            var leftAreaWidth = common_1.sum(this.widths.L) + leftBorderWidth;
            if (!frozenBorderWidth) {
                leftAreaWidth += cellBorderWidth;
            }
            // @TODO: areawidth 계산 때문에 매번 scrollX 나타나는 부분 수정필요
            return {
                L: leftAreaWidth,
                R: width - leftAreaWidth - cellBorderWidth
            };
        }
    });
}
exports.create = create;


/***/ }),
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var observable_1 = __webpack_require__(5);
var common_1 = __webpack_require__(1);
function create(_a) {
    var column = _a.column, data = _a.data, rowCoords = _a.rowCoords, columnCoords = _a.columnCoords, editingEvent = _a.editingEvent;
    return observable_1.observable({
        rowKey: null,
        columnName: null,
        prevRowKey: null,
        prevColumnName: null,
        editingAddress: null,
        editingEvent: editingEvent,
        navigating: false,
        get side() {
            if (this.columnName === null) {
                return null;
            }
            return common_1.someProp('name', this.columnName, column.visibleColumnsBySide.R) ? 'R' : 'L';
        },
        get columnIndex() {
            var _a = this, columnName = _a.columnName, side = _a.side;
            if (columnName === null || side === null) {
                return null;
            }
            return common_1.findPropIndex('name', columnName, column.visibleColumnsBySide[side]);
        },
        get totalColumnIndex() {
            var visibleColumnsBySide = column.visibleColumnsBySide;
            var _a = this, columnIndex = _a.columnIndex, side = _a.side;
            if (columnIndex === null) {
                return columnIndex;
            }
            return side === 'R' ? columnIndex + visibleColumnsBySide.L.length : columnIndex;
        },
        get rowIndex() {
            var rowKey = this.rowKey;
            if (rowKey === null) {
                return null;
            }
            return common_1.findPropIndex('rowKey', rowKey, data.rawData);
        },
        get cellPosRect() {
            var _a = this, columnIndex = _a.columnIndex, rowIndex = _a.rowIndex, side = _a.side;
            if (columnIndex === null || rowIndex === null || side === null) {
                return null;
            }
            var left = columnCoords.offsets[side][columnIndex];
            var right = left + columnCoords.widths[side][columnIndex];
            var top = rowCoords.offsets[rowIndex];
            var bottom = top + rowCoords.heights[rowIndex];
            return { left: left, right: right, top: top, bottom: bottom };
        }
    });
}
exports.create = create;


/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var observable_1 = __webpack_require__(5);
var summary_1 = __webpack_require__(18);
function create(_a) {
    var column = _a.column, data = _a.data, summary = _a.summary;
    var summaryColumnContents = {};
    var summaryValues = {};
    if (Object.keys(summary).length) {
        var rawData_1 = data.rawData;
        var orgColumnContent = summary.columnContent, orgDefaultContent = summary.defaultContent;
        var castedDefaultContent_1 = summary_1.castToSummaryColumnContent(orgDefaultContent || '');
        var columnContent_1 = orgColumnContent || {};
        column.allColumns.forEach(function (_a) {
            var name = _a.name;
            observable_1.observe(function () {
                var columnValues = rawData_1.map(function (row) { return row[name]; });
                var castedColumnContent = summary_1.castToSummaryColumnContent(columnContent_1[name]);
                var content = summary_1.extractSummaryColumnContent(castedColumnContent, castedDefaultContent_1);
                summaryColumnContents[name] = content;
                summaryValues[name] = summary_1.createSummaryValue(content, columnValues);
            });
        });
        summaryColumnContents = observable_1.observable(summaryColumnContents);
        summaryValues = observable_1.observable(summaryValues);
    }
    return { summaryColumnContents: summaryColumnContents, summaryValues: summaryValues };
}
exports.create = create;


/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var observable_1 = __webpack_require__(5);
function getSortedRange(range) {
    return range[0] > range[1] ? [range[1], range[0]] : range;
}
function getOwnSideColumnRange(columnRange, side, visibleFrozenCount) {
    if (side === 'L') {
        if (columnRange[0] < visibleFrozenCount) {
            return [columnRange[0], Math.min(columnRange[1], visibleFrozenCount - 1)];
        }
    }
    else if (columnRange[1] >= visibleFrozenCount) {
        return [
            Math.max(columnRange[0], visibleFrozenCount) - visibleFrozenCount,
            columnRange[1] - visibleFrozenCount
        ];
    }
    return null;
}
function getVerticalStyles(rowRange, rowOffsets, rowHeights) {
    var top = rowOffsets[rowRange[0]];
    var bottom = rowOffsets[rowRange[1]] + rowHeights[rowRange[1]];
    return { top: top, height: bottom - top };
}
function getHorizontalStyles(columnRange, columnWidths, side, cellBorderWidth) {
    var left = 0;
    var width = 0;
    if (!columnRange) {
        return { left: left, width: width };
    }
    var widths = columnWidths[side];
    var startIndex = columnRange[0];
    var endIndex = Math.min(columnRange[1], widths.length - 1);
    for (var i = 0; i <= endIndex; i += 1) {
        if (i < startIndex) {
            left += widths[i] + cellBorderWidth;
        }
        else {
            width += widths[i] + cellBorderWidth;
        }
    }
    width -= cellBorderWidth;
    return { left: left, width: width };
}
function create(_a) {
    var selectionUnit = _a.selectionUnit, rowCoords = _a.rowCoords, columnCoords = _a.columnCoords, columnInfo = _a.column, dimension = _a.dimension;
    return observable_1.observable({
        inputRange: null,
        unit: selectionUnit,
        type: 'cell',
        intervalIdForAutoScroll: null,
        get range() {
            if (!this.inputRange) {
                return null;
            }
            var columnWidths = columnCoords.widths;
            var row = getSortedRange(this.inputRange.row);
            var column = getSortedRange(this.inputRange.column);
            if (this.unit === 'row') {
                var lastColumnIndex = columnWidths.L.length + columnWidths.R.length - 1;
                column = [0, lastColumnIndex];
            }
            // @TODO: span 처리 필요
            return { row: row, column: column };
        },
        get rangeBySide() {
            if (!this.range) {
                return null;
            }
            var visibleFrozenCount = columnInfo.visibleFrozenCount;
            var _a = this.range, column = _a.column, row = _a.row;
            return {
                L: { row: row, column: getOwnSideColumnRange(column, 'L', visibleFrozenCount) },
                R: { row: row, column: getOwnSideColumnRange(column, 'R', visibleFrozenCount) }
            };
        },
        get rangeAreaInfo() {
            if (!this.rangeBySide) {
                return null;
            }
            var cellBorderWidth = dimension.cellBorderWidth;
            var rowOffsets = rowCoords.offsets, rowHeights = rowCoords.heights;
            var columnWidths = columnCoords.widths;
            var _a = this.rangeBySide, leftRange = _a.L, rightRange = _a.R;
            var leftSideStyles = null;
            var rightSideStyles = null;
            if (leftRange.column) {
                leftSideStyles = tslib_1.__assign({}, getVerticalStyles(leftRange.row, rowOffsets, rowHeights), getHorizontalStyles(leftRange.column, columnWidths, 'L', cellBorderWidth));
            }
            if (rightRange.column) {
                rightSideStyles = tslib_1.__assign({}, getVerticalStyles(rightRange.row, rowOffsets, rowHeights), getHorizontalStyles(rightRange.column, columnWidths, 'R', cellBorderWidth));
            }
            return {
                L: leftSideStyles,
                R: rightSideStyles
            };
        }
    });
}
exports.create = create;


/***/ }),
/* 40 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var preact_1 = __webpack_require__(2);
var container_1 = __webpack_require__(41);
var Root = /** @class */ (function (_super) {
    tslib_1.__extends(Root, _super);
    function Root() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Root.prototype.getChildContext = function () {
        return {
            store: this.props.store,
            dispatch: this.props.dispatch
        };
    };
    Root.prototype.render = function () {
        return preact_1.h(container_1.Container, { rootElement: this.props.rootElement });
    };
    return Root;
}(preact_1.Component));
exports.Root = Root;


/***/ }),
/* 41 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var preact_1 = __webpack_require__(2);
var leftSide_1 = __webpack_require__(42);
var rightSide_1 = __webpack_require__(52);
var stateLayer_1 = __webpack_require__(53);
var editingLayer_1 = __webpack_require__(54);
var heightResizeHandle_1 = __webpack_require__(56);
var clipboard_1 = __webpack_require__(57);
var dom_1 = __webpack_require__(3);
var hoc_1 = __webpack_require__(4);
var eventBus_1 = __webpack_require__(7);
var gridEvent_1 = tslib_1.__importDefault(__webpack_require__(10));
var ContainerComp = /** @class */ (function (_super) {
    tslib_1.__extends(ContainerComp, _super);
    function ContainerComp() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.handleMouseover = function (event) {
            var eventBus = _this.props.eventBus;
            var gridEvent = new gridEvent_1.default({ event: event });
            /**
             * Occurs when a mouse pointer is moved onto the Grid.
             * The properties of the event object include the native MouseEvent object.
             * @event Grid#mouseover
             * @property {Event} nativeEvent - Event object
             * @property {string} targetType - Type of event target
             * @property {number} rowKey - rowKey of the target cell
             * @property {string} columnName - columnName of the target cell
             * @property {Grid} instance - Current grid instance
             */
            eventBus.trigger('mouseover', gridEvent);
        };
        _this.handleClick = function (event) {
            var _a = _this.props, eventBus = _a.eventBus, editingEvent = _a.editingEvent;
            var gridEvent = new gridEvent_1.default({ event: event });
            /**
             * Occurs when a mouse button is clicked on the Grid.
             * The properties of the event object include the native event object.
             * @event Grid#click
             * @property {Event} nativeEvent - Event object
             * @property {string} targetType - Type of event target
             * @property {number} rowKey - rowKey of the target cell
             * @property {string} columnName - columnName of the target cell
             * @property {Grid} instance - Current grid instance
             */
            eventBus.trigger('click', gridEvent);
            if (!gridEvent.isStopped() && editingEvent === 'click') {
                _this.startEditing(event.target);
            }
        };
        _this.handleMouseout = function (event) {
            var eventBus = _this.props.eventBus;
            var gridEvent = new gridEvent_1.default({ event: event });
            /**
             * Occurs when a mouse pointer is moved off from the Grid.
             * The event object has all properties copied from the native MouseEvent.
             * @event Grid#mouseout
             * @property {Event} nativeEvent - Event object
             * @property {string} targetType - Type of event target
             * @property {number | string} rowKey - rowKey of the target cell
             * @property {string} columnName - columnName of the target cell
             * @property {Grid} instance - Current grid instance
             */
            eventBus.trigger('mouseout', gridEvent);
        };
        _this.handleMouseDown = function (event) {
            if (!_this.el) {
                return;
            }
            var _a = _this.props, dispatch = _a.dispatch, editing = _a.editing, eventBus = _a.eventBus;
            var el = _this.el;
            var gridEvent = new gridEvent_1.default({ event: event });
            /**
             * Occurs when a mouse button is downed on the Grid.
             * The event object has all properties copied from the native MouseEvent.
             * @event Grid#mousedown
             * @property {Event} nativeEvent - Event object
             * @property {string} targetType - Type of event target
             * @property {number | string} rowKey - rowKey of the target cell
             * @property {string} columnName - columnName of the target cell
             * @property {Grid} instance - Current grid instance
             */
            eventBus.trigger('mousedown', gridEvent);
            if (!gridEvent.isStopped()) {
                dispatch('setNavigating', true);
                if (!editing) {
                    event.preventDefault();
                }
                var _b = el.getBoundingClientRect(), top_1 = _b.top, left = _b.left;
                dispatch('setOffsetTop', top_1 + el.scrollTop);
                dispatch('setOffsetLeft', left + el.scrollLeft);
            }
        };
        _this.handleDblClick = function (event) {
            if (!_this.el) {
                return;
            }
            var _a = _this.props, eventBus = _a.eventBus, editingEvent = _a.editingEvent;
            var gridEvent = new gridEvent_1.default({ event: event });
            /**
             * Occurs when a mouse button is double clicked on the Grid.
             * The properties of the event object include the native event object.
             * @event Grid#dblclick
             * @property {Event} nativeEvent - Event object
             * @property {string} targetType - Type of event target
             * @property {number} rowKey - rowKey of the target cell
             * @property {string} columnName - columnName of the target cell
             * @property {Grid} instance - Current grid instance
             */
            eventBus.trigger('dblClick', gridEvent);
            if (!gridEvent.isStopped() && editingEvent === 'dblclick') {
                _this.startEditing(event.target);
            }
        };
        _this.syncWithDOMWidth = function () {
            var _a = _this.el, clientWidth = _a.clientWidth, clientHeight = _a.clientHeight;
            var _b = _this.props, width = _b.width, fitToParentHeight = _b.fitToParentHeight, rootElement = _b.rootElement;
            if (clientWidth !== width) {
                _this.props.dispatch('setWidth', clientWidth, true);
            }
            if (fitToParentHeight) {
                var parentElement = rootElement.parentElement;
                if (parentElement && parentElement.clientHeight !== clientHeight) {
                    _this.props.dispatch('setHeight', parentElement.clientHeight);
                }
            }
        };
        return _this;
    }
    ContainerComp.prototype.startEditing = function (eventTarget) {
        var dispatch = this.props.dispatch;
        var address = dom_1.getCellAddress(eventTarget);
        if (address) {
            var rowKey = address.rowKey, columnName = address.columnName;
            dispatch('startEditing', rowKey, columnName);
        }
    };
    ContainerComp.prototype.componentDidMount = function () {
        if (this.props.autoWidth) {
            window.addEventListener('resize', this.syncWithDOMWidth);
            // In Preact, the componentDidMount is called before the DOM elements are actually mounted.
            // https://github.com/preactjs/preact/issues/648
            // Use setTimeout to wait until the DOM element is actually mounted
            window.setTimeout(this.syncWithDOMWidth, 0);
        }
    };
    ContainerComp.prototype.componentWillUnmount = function () {
        if (this.props.autoWidth) {
            window.removeEventListener('resize', this.syncWithDOMWidth);
        }
    };
    ContainerComp.prototype.shouldComponentUpdate = function (nextProps) {
        if (this.props.autoWidth && nextProps.autoWidth) {
            return false;
        }
        return true;
    };
    ContainerComp.prototype.render = function () {
        var _this = this;
        var _a = this.props, summaryHeight = _a.summaryHeight, summaryPosition = _a.summaryPosition, gridId = _a.gridId, width = _a.width, autoWidth = _a.autoWidth, scrollXHeight = _a.scrollXHeight, showLeftSide = _a.showLeftSide, scrollX = _a.scrollX, scrollY = _a.scrollY;
        var style = { width: autoWidth ? '100%' : width };
        var attrs = { 'data-grid-id': gridId };
        return (preact_1.h("div", tslib_1.__assign({}, attrs, { style: style, class: dom_1.cls('container', [showLeftSide, 'show-lside-area']), onMouseDown: this.handleMouseDown, onDblClick: this.handleDblClick, onClick: this.handleClick, onMouseOut: this.handleMouseout, onMouseOver: this.handleMouseover, ref: function (el) {
                _this.el = el;
            } }),
            preact_1.h("div", { class: dom_1.cls('content-area', [!!summaryHeight, summaryPosition === 'top' ? 'has-summary-top' : 'has-summary-bottom'], [!scrollX, 'no-scroll-x'], [!scrollY, 'no-scroll-y']) },
                preact_1.h(leftSide_1.LeftSide, null),
                preact_1.h(rightSide_1.RightSide, null),
                preact_1.h("div", { class: dom_1.cls('border-line', 'border-line-top') }),
                preact_1.h("div", { class: dom_1.cls('border-line', 'border-line-left') }),
                preact_1.h("div", { class: dom_1.cls('border-line', 'border-line-right') }),
                preact_1.h("div", { class: dom_1.cls('border-line', 'border-line-bottom'), style: { bottom: scrollXHeight } })),
            preact_1.h(heightResizeHandle_1.HeightResizeHandle, null),
            preact_1.h(stateLayer_1.StateLayer, null),
            preact_1.h(editingLayer_1.EditingLayer, null),
            preact_1.h(clipboard_1.Clipboard, null)));
    };
    return ContainerComp;
}(preact_1.Component));
exports.ContainerComp = ContainerComp;
exports.Container = hoc_1.connect(function (_a) {
    var id = _a.id, dimension = _a.dimension, focus = _a.focus, columnCoords = _a.columnCoords, data = _a.data;
    return ({
        gridId: id,
        width: dimension.width,
        autoWidth: dimension.autoWidth,
        editing: !!focus.editingAddress,
        scrollXHeight: dimension.scrollX ? dimension.scrollbarWidth : 0,
        fitToParentHeight: dimension.fitToParentHeight,
        summaryHeight: dimension.summaryHeight,
        summaryPosition: dimension.summaryPosition,
        showLeftSide: !!columnCoords.areaWidth.L,
        disabled: data.disabled,
        editingEvent: focus.editingEvent,
        viewData: data.viewData,
        eventBus: eventBus_1.getEventBus(id),
        scrollX: dimension.scrollX,
        scrollY: dimension.scrollY
    });
})(ContainerComp);


/***/ }),
/* 42 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var preact_1 = __webpack_require__(2);
var headerArea_1 = __webpack_require__(19);
var bodyArea_1 = __webpack_require__(20);
var summaryArea_1 = __webpack_require__(21);
var dom_1 = __webpack_require__(3);
var hoc_1 = __webpack_require__(4);
var LeftSideComp = /** @class */ (function (_super) {
    tslib_1.__extends(LeftSideComp, _super);
    function LeftSideComp() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    LeftSideComp.prototype.render = function (_a) {
        var width = _a.width, scrollX = _a.scrollX;
        var style = { width: width, display: 'block' };
        var summaryPosition = this.props.summaryPosition;
        return (preact_1.h("div", { class: dom_1.cls('lside-area'), style: style },
            preact_1.h(headerArea_1.HeaderArea, { side: "L" }),
            summaryPosition === 'top' && preact_1.h(summaryArea_1.SummaryArea, { side: "L" }),
            preact_1.h(bodyArea_1.BodyArea, { side: "L" }),
            summaryPosition === 'bottom' && preact_1.h(summaryArea_1.SummaryArea, { side: "L" }),
            scrollX && preact_1.h("div", { class: dom_1.cls('scrollbar-left-bottom') })));
    };
    return LeftSideComp;
}(preact_1.Component));
exports.LeftSide = hoc_1.connect(function (_a) {
    var columnCoords = _a.columnCoords, dimension = _a.dimension;
    return ({
        width: columnCoords.areaWidth.L,
        scrollX: dimension.scrollX,
        summaryPosition: dimension.summaryPosition
    });
})(LeftSideComp);


/***/ }),
/* 43 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var preact_1 = __webpack_require__(2);
var dom_1 = __webpack_require__(3);
var hoc_1 = __webpack_require__(4);
exports.HANDLE_WIDTH = 7;
exports.HANDLE_WIDTH_HALF = 3;
var ColumnResizerComp = /** @class */ (function (_super) {
    tslib_1.__extends(ColumnResizerComp, _super);
    function ColumnResizerComp() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.dragStartX = -1;
        _this.draggingWidth = -1;
        _this.draggingIndex = -1;
        _this.handleMouseDown = function (ev, index) {
            _this.draggingIndex = index;
            _this.draggingWidth = _this.props.widths[index];
            _this.dragStartX = ev.pageX;
            dom_1.setCursorStyle('col-resize');
            document.addEventListener('mousemove', _this.handleMouseMove);
            document.addEventListener('mouseup', _this.clearDocumentEvents);
            document.addEventListener('selectstart', _this.handleSelectStart);
        };
        _this.handleSelectStart = function (ev) {
            ev.preventDefault();
        };
        _this.handleMouseMove = function (ev) {
            var width = _this.draggingWidth + ev.pageX - _this.dragStartX;
            var side = _this.props.side;
            _this.props.dispatch('setColumnWidth', side, _this.draggingIndex, width);
        };
        _this.clearDocumentEvents = function () {
            dom_1.setCursorStyle('');
            document.removeEventListener('mousemove', _this.handleMouseMove);
            document.removeEventListener('mouseup', _this.clearDocumentEvents);
            document.removeEventListener('selectstart', _this.handleSelectStart);
        };
        return _this;
    }
    ColumnResizerComp.prototype.componentWillUnmount = function () {
        this.clearDocumentEvents();
    };
    ColumnResizerComp.prototype.renderHandle = function (index) {
        var _this = this;
        var _a = this.props, columns = _a.columns, offsets = _a.offsets, widths = _a.widths;
        var _b = columns[index], name = _b.name, resizable = _b.resizable;
        var offset = offsets[index];
        var width = widths[index];
        if (!resizable) {
            return null;
        }
        return (preact_1.h("div", { "data-column-index": index, "data-column-name": name, class: dom_1.cls('column-resize-handle'), title: '', style: {
                height: 33,
                width: exports.HANDLE_WIDTH,
                left: offset + width - exports.HANDLE_WIDTH_HALF
            }, onMouseDown: function (ev) { return _this.handleMouseDown(ev, index); } }));
    };
    ColumnResizerComp.prototype.render = function (_a) {
        var _this = this;
        var columns = _a.columns;
        return (preact_1.h("div", { class: dom_1.cls('column-resize-container'), style: "display: block; margin-top: -35px; height: 35px;" }, columns.map(function (_, index) { return _this.renderHandle(index); })));
    };
    return ColumnResizerComp;
}(preact_1.Component));
exports.ColumnResizer = hoc_1.connect(function (_a, _b) {
    var column = _a.column, columnCoords = _a.columnCoords;
    var side = _b.side;
    return ({
        widths: columnCoords.widths[side],
        offsets: columnCoords.offsets[side],
        columns: column.visibleColumnsBySide[side]
    });
})(ColumnResizerComp);


/***/ }),
/* 44 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var preact_1 = __webpack_require__(2);
var bodyRow_1 = __webpack_require__(45);
var bodyDummyRow_1 = __webpack_require__(47);
var common_1 = __webpack_require__(1);
var hoc_1 = __webpack_require__(4);
var BodyRowsComp = /** @class */ (function (_super) {
    tslib_1.__extends(BodyRowsComp, _super);
    function BodyRowsComp() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BodyRowsComp.prototype.shouldComponentUpdate = function (nextProps) {
        if (common_1.shallowEqual(nextProps, this.props)) {
            return false;
        }
        return true;
    };
    BodyRowsComp.prototype.render = function (_a) {
        var rows = _a.rows, rowIndexOffset = _a.rowIndexOffset, columns = _a.columns, dummyRowCount = _a.dummyRowCount;
        var columnNames = columns.map(function (_a) {
            var name = _a.name;
            return name;
        });
        return (preact_1.h("tbody", null,
            rows.map(function (row, index) { return (preact_1.h(bodyRow_1.BodyRow, { key: row.rowKey, rowIndex: index + rowIndexOffset, viewRow: row, columnNames: columnNames })); }),
            common_1.range(dummyRowCount).map(function (index) { return (preact_1.h(bodyDummyRow_1.BodyDummyRow, { key: "dummy-" + index, index: rows.length + index, columnNames: columnNames })); })));
    };
    return BodyRowsComp;
}(preact_1.Component));
exports.BodyRows = hoc_1.connect(function (_a, _b) {
    var viewport = _a.viewport, column = _a.column;
    var side = _b.side;
    return {
        rowIndexOffset: viewport.rowRange[0],
        rows: viewport.rows,
        columns: column.visibleColumnsBySide[side],
        dummyRowCount: viewport.dummyRowCount
    };
})(BodyRowsComp);


/***/ }),
/* 45 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var preact_1 = __webpack_require__(2);
var bodyCell_1 = __webpack_require__(46);
var hoc_1 = __webpack_require__(4);
var dom_1 = __webpack_require__(3);
var common_1 = __webpack_require__(1);
var BodyRowComp = /** @class */ (function (_super) {
    tslib_1.__extends(BodyRowComp, _super);
    function BodyRowComp() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.renderedRowHeight = _this.props.rowHeight;
        // This debounced function is aimed to wait until setTimeout(.., 0) calls
        // from the all child BodyCell components is made.
        // 10ms is just an approximate number. (smaller than 10ms might be safe enough)
        _this.updateRowHeightDebounced = common_1.debounce(function () {
            var _a = _this.props, dispatch = _a.dispatch, rowIndex = _a.rowIndex, rowHeight = _a.rowHeight;
            if (rowHeight !== _this.renderedRowHeight) {
                dispatch('setRowHeight', rowIndex, _this.renderedRowHeight);
            }
        }, 10);
        _this.refreshRowHeight = function (cellHeight) {
            _this.renderedRowHeight = Math.max(cellHeight, _this.renderedRowHeight);
            _this.updateRowHeightDebounced();
        };
        return _this;
    }
    BodyRowComp.prototype.render = function (_a) {
        var _this = this;
        var rowIndex = _a.rowIndex, viewRow = _a.viewRow, columnNames = _a.columnNames, rowHeight = _a.rowHeight, autoRowHeight = _a.autoRowHeight;
        var isOddRow = rowIndex % 2 === 0;
        return (preact_1.h("tr", { style: { height: rowHeight }, class: dom_1.cls([isOddRow, 'row-odd'], [!isOddRow, 'row-even']) }, columnNames.map(function (name) {
            // Pass row object directly instead of passing value of it only,
            // so that BodyCell component can watch the change of value using selector function.
            return (preact_1.h(bodyCell_1.BodyCell, { key: name, viewRow: viewRow, columnName: name, refreshRowHeight: autoRowHeight ? _this.refreshRowHeight : null }));
        })));
    };
    return BodyRowComp;
}(preact_1.Component));
exports.BodyRow = hoc_1.connect(function (_a, _b) {
    var rowCoords = _a.rowCoords, dimension = _a.dimension;
    var rowIndex = _b.rowIndex;
    return ({
        rowHeight: rowCoords.heights[rowIndex],
        autoRowHeight: dimension.autoRowHeight
    });
})(BodyRowComp);


/***/ }),
/* 46 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var preact_1 = __webpack_require__(2);
var dom_1 = __webpack_require__(3);
var hoc_1 = __webpack_require__(4);
var instance_1 = __webpack_require__(8);
var column_1 = __webpack_require__(6);
var BodyCellComp = /** @class */ (function (_super) {
    tslib_1.__extends(BodyCellComp, _super);
    function BodyCellComp() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BodyCellComp.prototype.componentDidMount = function () {
        var _a = this.props, grid = _a.grid, rowKey = _a.rowKey, renderData = _a.renderData, columnInfo = _a.columnInfo, refreshRowHeight = _a.refreshRowHeight, allDisabled = _a.disabled;
        // eslint-disable-next-line new-cap
        this.renderer = new columnInfo.renderer(tslib_1.__assign({ grid: grid,
            rowKey: rowKey,
            columnInfo: columnInfo }, renderData, { allDisabled: allDisabled }));
        var rendererEl = this.renderer.getElement();
        this.el.appendChild(rendererEl);
        if (this.renderer.mounted) {
            this.renderer.mounted(this.el);
        }
        if (refreshRowHeight) {
            // In Preact, the componentDidMount is called before the DOM elements are actually mounted.
            // https://github.com/preactjs/preact/issues/648
            // Use setTimeout to wait until the DOM element is actually mounted
            //  - If the width of grid is 'auto' actual width of grid is calculated from the
            //    Container component using setTimeout(fn, 0)
            //  - Delay 16ms for defer the function call later than the Container component.
            window.setTimeout(function () { return refreshRowHeight(rendererEl.clientHeight); }, 16);
        }
    };
    BodyCellComp.prototype.componentWillReceiveProps = function (nextProps) {
        if (this.props.renderData !== nextProps.renderData && this.renderer && this.renderer.changed) {
            var grid = nextProps.grid, rowKey = nextProps.rowKey, renderData = nextProps.renderData, columnInfo = nextProps.columnInfo, refreshRowHeight = nextProps.refreshRowHeight, allDisabled = nextProps.disabled;
            this.renderer.changed(tslib_1.__assign({ grid: grid,
                rowKey: rowKey,
                columnInfo: columnInfo }, renderData, { allDisabled: allDisabled }));
            if (refreshRowHeight) {
                refreshRowHeight(this.el.scrollHeight);
            }
        }
    };
    BodyCellComp.prototype.render = function () {
        var _this = this;
        var _a = this.props, rowKey = _a.rowKey, _b = _a.renderData, disabled = _b.disabled, editable = _b.editable, invalidState = _b.invalidState, className = _b.className, _c = _a.columnInfo, align = _c.align, valign = _c.valign, name = _c.name, _d = _c.validation, validation = _d === void 0 ? {} : _d, allDisabled = _a.disabled;
        var style = tslib_1.__assign({ textAlign: align }, (valign && { verticalAlign: valign }));
        var attrs = {
            'data-row-key': String(rowKey),
            'data-column-name': name
        };
        return (preact_1.h("td", tslib_1.__assign({}, attrs, { style: style, class: dom_1.cls('cell', 'cell-has-input', [editable, 'cell-editable'], [column_1.isRowHeader(name), 'cell-row-header'], [validation.required || false, 'cell-required'], [!!invalidState, 'cell-invalid'], [disabled || allDisabled, 'cell-disabled']) + " " + className, ref: function (el) {
                _this.el = el;
            } })));
    };
    return BodyCellComp;
}(preact_1.Component));
exports.BodyCellComp = BodyCellComp;
exports.BodyCell = hoc_1.connect(function (_a, _b) {
    var id = _a.id, column = _a.column, data = _a.data;
    var viewRow = _b.viewRow, columnName = _b.columnName;
    var rowKey = viewRow.rowKey, valueMap = viewRow.valueMap;
    var disabled = data.disabled;
    var grid = instance_1.getInstance(id);
    var columnInfo = column.allColumnMap[columnName];
    return {
        grid: grid,
        rowKey: rowKey,
        disabled: disabled,
        columnInfo: columnInfo,
        renderData: valueMap[columnName]
    };
})(BodyCellComp);


/***/ }),
/* 47 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var preact_1 = __webpack_require__(2);
var hoc_1 = __webpack_require__(4);
var dom_1 = __webpack_require__(3);
var column_1 = __webpack_require__(6);
var BodyDummyRowComp = function (_a) {
    var columnNames = _a.columnNames, rowHeight = _a.rowHeight, index = _a.index;
    var isOddRow = !!(index % 2);
    return (preact_1.h("tr", { style: { height: rowHeight }, class: dom_1.cls([isOddRow, 'row-odd'], [!isOddRow, 'row-even']) }, columnNames.map(function (name) {
        var attrs = {
            'data-column-name': name
        };
        return (preact_1.h("td", tslib_1.__assign({}, attrs, { key: index, class: dom_1.cls('cell', 'cell-dummy', [column_1.isRowHeader(name), 'cell-row-header']) })));
    })));
};
exports.BodyDummyRow = hoc_1.connect(function (_a) {
    var rowHeight = _a.dimension.rowHeight;
    return ({
        rowHeight: rowHeight
    });
})(BodyDummyRowComp);


/***/ }),
/* 48 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var preact_1 = __webpack_require__(2);
var dom_1 = __webpack_require__(3);
var hoc_1 = __webpack_require__(4);
var FocusLayerComp = /** @class */ (function (_super) {
    tslib_1.__extends(FocusLayerComp, _super);
    function FocusLayerComp() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    FocusLayerComp.prototype.render = function () {
        var _a = this.props, active = _a.active, cellPosRect = _a.cellPosRect, cellBorderWidth = _a.cellBorderWidth;
        if (cellPosRect === null) {
            return null;
        }
        var top = cellPosRect.top, left = cellPosRect.left, right = cellPosRect.right, bottom = cellPosRect.bottom;
        var height = bottom - top;
        var width = right - left;
        var leftStyle = {
            top: top,
            left: left,
            width: cellBorderWidth,
            height: height
        };
        var topStyle = {
            top: top === 0 ? cellBorderWidth : top,
            left: left,
            width: width + cellBorderWidth,
            height: cellBorderWidth
        };
        var rightStyle = {
            top: top,
            left: left + width,
            width: cellBorderWidth,
            height: height + cellBorderWidth
        };
        var bottomStyle = {
            top: top + height,
            left: left,
            width: width + cellBorderWidth,
            height: cellBorderWidth
        };
        return (preact_1.h("div", { class: dom_1.cls('layer-focus', [!active, 'layer-focus-deactive']) },
            preact_1.h("div", { class: dom_1.cls('layer-focus-border'), style: leftStyle }),
            preact_1.h("div", { class: dom_1.cls('layer-focus-border'), style: topStyle }),
            preact_1.h("div", { class: dom_1.cls('layer-focus-border'), style: rightStyle }),
            preact_1.h("div", { class: dom_1.cls('layer-focus-border'), style: bottomStyle })));
    };
    return FocusLayerComp;
}(preact_1.Component));
exports.FocusLayer = hoc_1.connect(function (_a, _b) {
    var focus = _a.focus, dimension = _a.dimension;
    var side = _b.side;
    var cellPosRect = focus.cellPosRect, editingAddress = focus.editingAddress, navigating = focus.navigating;
    return {
        active: !!editingAddress || navigating,
        cellPosRect: side === focus.side ? cellPosRect : null,
        cellBorderWidth: dimension.cellBorderWidth
    };
})(FocusLayerComp);


/***/ }),
/* 49 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var preact_1 = __webpack_require__(2);
var dom_1 = __webpack_require__(3);
var hoc_1 = __webpack_require__(4);
var SelectionLayerComp = /** @class */ (function (_super) {
    tslib_1.__extends(SelectionLayerComp, _super);
    function SelectionLayerComp() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SelectionLayerComp.prototype.render = function () {
        var styles = this.props.styles;
        return preact_1.h("div", null, !!styles && preact_1.h("div", { class: dom_1.cls('layer-selection'), style: styles }));
    };
    return SelectionLayerComp;
}(preact_1.Component));
exports.SelectionLayer = hoc_1.connect(function (_a, _b) {
    var rangeAreaInfo = _a.selection.rangeAreaInfo;
    var side = _b.side;
    var styles = rangeAreaInfo && rangeAreaInfo[side];
    return { styles: styles };
})(SelectionLayerComp);


/***/ }),
/* 50 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var preact_1 = __webpack_require__(2);
var summaryBodyCell_1 = __webpack_require__(51);
var common_1 = __webpack_require__(1);
var SummaryBodyRow = /** @class */ (function (_super) {
    tslib_1.__extends(SummaryBodyRow, _super);
    function SummaryBodyRow() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SummaryBodyRow.prototype.shouldComponentUpdate = function (nextProps) {
        if (common_1.shallowEqual(nextProps, this.props)) {
            return false;
        }
        return true;
    };
    SummaryBodyRow.prototype.render = function (_a) {
        var columns = _a.columns;
        var columnNames = columns.map(function (_a) {
            var name = _a.name;
            return name;
        });
        return (preact_1.h("tbody", null,
            preact_1.h("tr", null, columnNames.map(function (name) { return (preact_1.h(summaryBodyCell_1.SummaryBodyCell, { key: name, columnName: name })); }))));
    };
    return SummaryBodyRow;
}(preact_1.Component));
exports.SummaryBodyRow = SummaryBodyRow;


/***/ }),
/* 51 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var preact_1 = __webpack_require__(2);
var dom_1 = __webpack_require__(3);
var common_1 = __webpack_require__(1);
var hoc_1 = __webpack_require__(4);
var SummaryBodyCellComp = /** @class */ (function (_super) {
    tslib_1.__extends(SummaryBodyCellComp, _super);
    function SummaryBodyCellComp() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.getTemplate = function () {
            var _a = _this.props, content = _a.content, summaryValue = _a.summaryValue;
            if (!content) {
                return '';
            }
            var template = content.template;
            return typeof template === 'string' ? template : template(summaryValue);
        };
        return _this;
    }
    SummaryBodyCellComp.prototype.shouldComponentUpdate = function (nextProps) {
        if (common_1.shallowEqual(nextProps, this.props)) {
            return false;
        }
        return true;
    };
    SummaryBodyCellComp.prototype.render = function () {
        var columnName = this.props.columnName;
        var attrs = {
            'data-column-name': columnName
        };
        var template = this.getTemplate();
        return (preact_1.h("td", tslib_1.__assign({ class: dom_1.cls('cell', 'cell-summary'), dangerouslySetInnerHTML: { __html: template } }, attrs)));
    };
    return SummaryBodyCellComp;
}(preact_1.Component));
exports.SummaryBodyCellComp = SummaryBodyCellComp;
exports.SummaryBodyCell = hoc_1.connect(function (_a, _b) {
    var summary = _a.summary;
    var columnName = _b.columnName;
    var summaryColumnContents = summary.summaryColumnContents, summaryValues = summary.summaryValues;
    var content = summaryColumnContents[columnName];
    var summaryValue = summaryValues[columnName];
    return { content: content, summaryValue: summaryValue };
})(SummaryBodyCellComp);


/***/ }),
/* 52 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var preact_1 = __webpack_require__(2);
var dom_1 = __webpack_require__(3);
var bodyArea_1 = __webpack_require__(20);
var headerArea_1 = __webpack_require__(19);
var summaryArea_1 = __webpack_require__(21);
var hoc_1 = __webpack_require__(4);
var RightSideComp = /** @class */ (function (_super) {
    tslib_1.__extends(RightSideComp, _super);
    function RightSideComp() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RightSideComp.prototype.renderScrollbarYInnerBorder = function () {
        var _a = this.props, cornerTopHeight = _a.cornerTopHeight, bodyHeight = _a.bodyHeight, scrollXHeight = _a.scrollXHeight;
        var style = {
            top: cornerTopHeight,
            height: bodyHeight - scrollXHeight
        };
        return preact_1.h("div", { class: dom_1.cls('scrollbar-y-inner-border'), style: style });
    };
    RightSideComp.prototype.renderScrollbarRightTop = function () {
        var style = { height: this.props.cornerTopHeight };
        return preact_1.h("div", { class: dom_1.cls('scrollbar-right-top'), style: style });
    };
    RightSideComp.prototype.renderScrollbarYOuterBorder = function () {
        return preact_1.h("div", { class: dom_1.cls('scrollbar-y-outer-border') });
    };
    RightSideComp.prototype.renderScrollbarRightBottom = function () {
        var style = { height: this.props.cornerBottomHeight };
        return preact_1.h("div", { class: dom_1.cls('scrollbar-right-bottom'), style: style });
    };
    RightSideComp.prototype.renderScrollbarFrozenBorder = function () {
        var _a = this.props, scrollXHeight = _a.scrollXHeight, frozenBorderWidth = _a.frozenBorderWidth, cellBorderWidth = _a.cellBorderWidth;
        var style = {
            height: scrollXHeight,
            width: frozenBorderWidth,
            marginLeft: -(frozenBorderWidth + cellBorderWidth)
        };
        return preact_1.h("div", { class: dom_1.cls('scrollbar-frozen-border'), style: style });
    };
    RightSideComp.prototype.renderFrozenBorder = function () {
        var frozenBorderWidth = this.props.frozenBorderWidth;
        var style = {
            marginLeft: -frozenBorderWidth,
            width: frozenBorderWidth
        };
        return preact_1.h("div", { class: dom_1.cls('frozen-border'), style: style });
    };
    RightSideComp.prototype.render = function () {
        var _a = this.props, marginLeft = _a.marginLeft, width = _a.width, summaryPosition = _a.summaryPosition, scrollY = _a.scrollY;
        var style = {
            display: 'block',
            marginLeft: marginLeft,
            width: width
        };
        return (preact_1.h("div", { class: dom_1.cls('rside-area'), style: style },
            preact_1.h(headerArea_1.HeaderArea, { side: "R" }),
            summaryPosition === 'top' && preact_1.h(summaryArea_1.SummaryArea, { side: "R" }),
            preact_1.h(bodyArea_1.BodyArea, { side: "R" }),
            summaryPosition === 'bottom' && preact_1.h(summaryArea_1.SummaryArea, { side: "R" }),
            scrollY && this.renderScrollbarYInnerBorder(),
            scrollY && this.renderScrollbarYOuterBorder(),
            scrollY && this.renderScrollbarRightTop(),
            this.renderScrollbarRightBottom(),
            this.renderScrollbarFrozenBorder(),
            this.renderFrozenBorder()));
    };
    return RightSideComp;
}(preact_1.Component));
exports.RightSide = hoc_1.connect(function (_a) {
    var dimension = _a.dimension, columnCoords = _a.columnCoords;
    var scrollbarWidth = dimension.scrollbarWidth, scrollX = dimension.scrollX, scrollY = dimension.scrollY, summaryHeight = dimension.summaryHeight, headerHeight = dimension.headerHeight, cellBorderWidth = dimension.cellBorderWidth, tableBorderWidth = dimension.tableBorderWidth, bodyHeight = dimension.bodyHeight, summaryPosition = dimension.summaryPosition, frozenBorderWidth = dimension.frozenBorderWidth;
    var cornerTopHeight = headerHeight;
    var cornerBottomHeight = scrollX ? scrollbarWidth : 0;
    if (scrollY && summaryHeight) {
        if (summaryPosition === 'top') {
            cornerTopHeight += summaryHeight + tableBorderWidth;
        }
        else {
            cornerBottomHeight += summaryHeight;
        }
    }
    var scrollXHeight = scrollX ? scrollbarWidth : 0;
    var width = columnCoords.areaWidth.R;
    var marginLeft = columnCoords.areaWidth.L + tableBorderWidth;
    if (!frozenBorderWidth) {
        marginLeft -= cellBorderWidth;
    }
    return {
        width: width,
        marginLeft: marginLeft,
        cornerTopHeight: cornerTopHeight,
        cornerBottomHeight: cornerBottomHeight,
        scrollXHeight: scrollXHeight,
        bodyHeight: bodyHeight,
        cellBorderWidth: cellBorderWidth,
        frozenBorderWidth: frozenBorderWidth,
        summaryPosition: summaryPosition,
        scrollX: scrollX,
        scrollY: scrollY
    };
})(RightSideComp);


/***/ }),
/* 53 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var preact_1 = __webpack_require__(2);
var dom_1 = __webpack_require__(3);
var hoc_1 = __webpack_require__(4);
var StateLayerComp = /** @class */ (function (_super) {
    tslib_1.__extends(StateLayerComp, _super);
    function StateLayerComp() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    // @TODO: need to match i18n code and net api
    // private getMessage(renderState: string) {}
    StateLayerComp.prototype.render = function (_a) {
        var hasData = _a.hasData, top = _a.top, height = _a.height, left = _a.left, right = _a.right;
        var display = hasData ? 'none' : 'block';
        var layerStyle = { display: display, top: top, height: height, left: left, right: right };
        return (preact_1.h("div", { class: dom_1.cls('layer-state'), style: layerStyle },
            preact_1.h("div", { class: dom_1.cls('layer-state-content') },
                preact_1.h("p", null, "No data."))));
    };
    return StateLayerComp;
}(preact_1.Component));
exports.StateLayer = hoc_1.connect(function (_a) {
    var data = _a.data, dimension = _a.dimension;
    var headerHeight = dimension.headerHeight, bodyHeight = dimension.bodyHeight, cellBorderWidth = dimension.cellBorderWidth, tableBorderWidth = dimension.tableBorderWidth, scrollXHeight = dimension.scrollXHeight, scrollYWidth = dimension.scrollYWidth;
    return {
        hasData: !!data.rawData.length,
        top: headerHeight + cellBorderWidth + 1,
        height: bodyHeight - scrollXHeight - tableBorderWidth,
        left: 0,
        right: scrollYWidth
    };
})(StateLayerComp);


/***/ }),
/* 54 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var preact_1 = __webpack_require__(2);
var hoc_1 = __webpack_require__(4);
var editingLayerInner_1 = __webpack_require__(55);
var EditingLayerComp = /** @class */ (function (_super) {
    tslib_1.__extends(EditingLayerComp, _super);
    function EditingLayerComp() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    EditingLayerComp.prototype.render = function (_a) {
        var editingAddress = _a.editingAddress;
        if (!editingAddress) {
            return null;
        }
        var rowKey = editingAddress.rowKey, columnName = editingAddress.columnName;
        return preact_1.h(editingLayerInner_1.EditingLayerInner, { rowKey: rowKey, columnName: columnName });
    };
    return EditingLayerComp;
}(preact_1.Component));
exports.EditingLayerComp = EditingLayerComp;
exports.EditingLayer = hoc_1.connect(function (_a) {
    var editingAddress = _a.focus.editingAddress;
    return ({
        editingAddress: editingAddress
    });
})(EditingLayerComp);


/***/ }),
/* 55 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var preact_1 = __webpack_require__(2);
var dom_1 = __webpack_require__(3);
var hoc_1 = __webpack_require__(4);
var keyboard_1 = __webpack_require__(13);
var instance_1 = __webpack_require__(8);
var EditingLayerInnerComp = /** @class */ (function (_super) {
    tslib_1.__extends(EditingLayerInnerComp, _super);
    function EditingLayerInnerComp() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.handleKeyDown = function (ev) {
            var keyName = keyboard_1.keyNameMap[ev.keyCode];
            switch (keyName) {
                case 'enter':
                    _this.finishEditing(true);
                    break;
                case 'esc':
                    _this.finishEditing(false);
                    break;
                default:
                // do nothing;
            }
        };
        _this.handleMouseDownDocument = function (ev) {
            var target = ev.target;
            var contentEl = _this.contentEl;
            if (contentEl && contentEl !== target && !contentEl.contains(target)) {
                _this.finishEditing(true);
            }
        };
        return _this;
    }
    EditingLayerInnerComp.prototype.finishEditing = function (save) {
        if (this.editor) {
            var _a = this.props, dispatch = _a.dispatch, rowKey = _a.rowKey, columnName = _a.columnName, sortOptions = _a.sortOptions;
            if (save) {
                dispatch('setValue', rowKey, columnName, this.editor.getValue());
                if (sortOptions.columnName === columnName) {
                    dispatch('sort', columnName, sortOptions.ascending);
                }
            }
            if (typeof this.editor.finish === 'function') {
                this.editor.finish();
            }
            dispatch('finishEditing', rowKey, columnName);
        }
    };
    EditingLayerInnerComp.prototype.componentDidMount = function () {
        var _a = this.props, grid = _a.grid, rowKey = _a.rowKey, columnInfo = _a.columnInfo, value = _a.value, editorOptions = _a.editorOptions;
        var EditorClass = columnInfo.editor;
        var editorProps = { grid: grid, rowKey: rowKey, columnInfo: columnInfo, value: value, editorOptions: editorOptions };
        var cellEditor = new EditorClass(editorProps);
        var editorEl = cellEditor.getElement();
        if (editorEl && this.contentEl) {
            this.contentEl.appendChild(editorEl);
            this.editor = cellEditor;
            if (typeof cellEditor.start === 'function') {
                cellEditor.start();
            }
            document.addEventListener('mousedown', this.handleMouseDownDocument);
        }
    };
    EditingLayerInnerComp.prototype.componentWillUnmount = function () {
        this.finishEditing(false);
        document.removeEventListener('mousedown', this.handleMouseDownDocument);
    };
    EditingLayerInnerComp.prototype.render = function () {
        var _this = this;
        var _a = this.props, top = _a.top, left = _a.left, width = _a.width, height = _a.height, contentHeight = _a.contentHeight;
        var lineHeight = contentHeight + "px";
        var styles = { top: top, left: left, width: width, height: height, lineHeight: lineHeight };
        return (preact_1.h("div", { style: styles, class: dom_1.cls('layer-editing', 'cell-content', 'cell-content-editor'), onKeyDown: this.handleKeyDown, ref: function (el) {
                _this.contentEl = el;
            } }));
    };
    return EditingLayerInnerComp;
}(preact_1.Component));
exports.EditingLayerInnerComp = EditingLayerInnerComp;
exports.EditingLayerInner = hoc_1.connect(function (store, _a) {
    var rowKey = _a.rowKey, columnName = _a.columnName;
    var _b = store.focus, cellPosRect = _b.cellPosRect, side = _b.side;
    var _c = store.dimension, cellBorderWidth = _c.cellBorderWidth, tableBorderWidth = _c.tableBorderWidth, headerHeight = _c.headerHeight, width = _c.width;
    var _d = store.viewport, scrollLeft = _d.scrollLeft, scrollTop = _d.scrollTop;
    var areaWidth = store.columnCoords.areaWidth;
    var _e = store.data, viewData = _e.viewData, sortOptions = _e.sortOptions;
    var allColumnMap = store.column.allColumnMap;
    var _f = cellPosRect, top = _f.top, left = _f.left, right = _f.right, bottom = _f.bottom;
    var cellWidth = right - left + cellBorderWidth;
    var cellHeight = bottom - top + cellBorderWidth;
    var offsetTop = headerHeight - scrollTop + tableBorderWidth;
    var offsetLeft = Math.min(areaWidth.L - scrollLeft + tableBorderWidth, width - right);
    var targetRow = viewData.find(function (row) { return row.rowKey === rowKey; });
    var _g = targetRow.valueMap[columnName], value = _g.value, editorOptions = _g.editorOptions;
    return {
        grid: instance_1.getInstance(store.id),
        left: left + (side === 'L' ? 0 : offsetLeft),
        top: top + offsetTop,
        width: cellWidth,
        height: cellHeight,
        contentHeight: cellHeight - 2 * cellBorderWidth,
        columnInfo: allColumnMap[columnName],
        value: value,
        editorOptions: editorOptions,
        sortOptions: sortOptions
    };
})(EditingLayerInnerComp);


/***/ }),
/* 56 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var preact_1 = __webpack_require__(2);
var hoc_1 = __webpack_require__(4);
var dom_1 = __webpack_require__(3);
var HeightResizeHandleComp = /** @class */ (function (_super) {
    tslib_1.__extends(HeightResizeHandleComp, _super);
    function HeightResizeHandleComp() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.dragStartY = -1;
        _this.dragStartBodyHeight = -1;
        _this.handleMouseDown = function (ev) {
            _this.dragStartY = ev.pageY;
            _this.dragStartBodyHeight = _this.props.bodyHeight;
            dom_1.setCursorStyle('row-resize');
            document.addEventListener('mousemove', _this.handleMouseMove);
            document.addEventListener('mouseup', _this.clearDocumentEvents);
            document.addEventListener('selectstart', _this.handleSelectStart);
        };
        _this.handleSelectStart = function (ev) {
            ev.preventDefault();
        };
        _this.handleMouseMove = function (ev) {
            var distance = ev.pageY - _this.dragStartY;
            _this.props.dispatch('setBodyHeight', _this.dragStartBodyHeight + distance);
        };
        _this.clearDocumentEvents = function () {
            dom_1.setCursorStyle('');
            document.removeEventListener('mousemove', _this.handleMouseMove);
            document.removeEventListener('mouseup', _this.clearDocumentEvents);
            document.removeEventListener('selectstart', _this.handleSelectStart);
        };
        return _this;
    }
    HeightResizeHandleComp.prototype.render = function () {
        return (preact_1.h("div", { class: dom_1.cls('height-resize-handle'), onMouseDown: this.handleMouseDown },
            preact_1.h("button", null,
                preact_1.h("span", null))));
    };
    return HeightResizeHandleComp;
}(preact_1.Component));
exports.HeightResizeHandle = hoc_1.connect(function (_a) {
    var dimension = _a.dimension;
    return ({
        bodyHeight: dimension.bodyHeight
    });
})(HeightResizeHandleComp);


/***/ }),
/* 57 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var preact_1 = __webpack_require__(2);
var hoc_1 = __webpack_require__(4);
var dom_1 = __webpack_require__(3);
var keyboard_1 = __webpack_require__(13);
var browser_1 = __webpack_require__(58);
var clipboard_1 = __webpack_require__(9);
var clipboard_2 = __webpack_require__(14);
var KEYDOWN_LOCK_TIME = 10;
var ClipboardComp = /** @class */ (function (_super) {
    tslib_1.__extends(ClipboardComp, _super);
    function ClipboardComp() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.isLocked = false;
        _this.lock = function () {
            _this.isLocked = true;
            setTimeout(_this.unlock.bind(_this), KEYDOWN_LOCK_TIME);
        };
        /**
         * Unlock
         * @private
         */
        _this.unlock = function () {
            _this.isLocked = false;
        };
        _this.onBlur = function () {
            _this.props.dispatch('setNavigating', false);
        };
        _this.dispatchKeyboardEvent = function (type, command) {
            var dispatch = _this.props.dispatch;
            switch (type) {
                case 'move':
                    dispatch('selectionEnd');
                    dispatch('moveFocus', command);
                    dispatch('setScrollToFocus');
                    break;
                case 'edit':
                    dispatch('editFocus', command);
                    break;
                case 'select':
                    dispatch('changeSelection', command);
                    dispatch('setScrollToSelection');
                    break;
                case 'remove':
                    dispatch('removeFocus');
                    break;
                /*
                 * Call directly because of timing issues
                 * - Step 1: When the keys(ctrl+c) are downed on grid, 'clipboard' is triggered.
                 * - Step 2: When 'clipboard' event is fired,
                 *           IE browsers set copied data to window.clipboardData in event handler and
                 *           other browsers append copied data and focus to contenteditable element.
                 * - Step 3: Finally, when 'copy' event is fired on browsers except IE,
                 *           setting copied data to ClipboardEvent.clipboardData.
                 */
                case 'clipboard': {
                    if (!_this.el) {
                        return;
                    }
                    var store = _this.context.store;
                    if (clipboard_1.isSupportWindowClipboardData()) {
                        window.clipboardData.setData('Text', clipboard_2.getText(store));
                    }
                    else {
                        _this.el.innerHTML = clipboard_2.getText(store);
                    }
                    break;
                }
                default:
                    break;
            }
        };
        /**
         * Event handler for the keydown event
         * @param {Event} ev - Event
         * @private
         */
        _this.onKeyDown = function (ev) {
            if (_this.isLocked) {
                ev.preventDefault();
                return;
            }
            var _a = keyboard_1.keyEventGenerate(ev), type = _a.type, command = _a.command;
            if (!type) {
                return;
            }
            _this.lock();
            if (type !== 'clipboard') {
                ev.preventDefault();
            }
            if (!(type === 'clipboard' && command === 'paste')) {
                _this.dispatchKeyboardEvent(type, command);
            }
        };
        _this.onCopy = function (ev) {
            if (!_this.el) {
                return;
            }
            var text = _this.el.innerHTML;
            if (clipboard_1.isSupportWindowClipboardData()) {
                window.clipboardData.setData('Text', text);
            }
            else if (ev.clipboardData) {
                ev.clipboardData.setData('text/plain', text);
            }
            ev.preventDefault();
        };
        _this.onPaste = function (ev) {
            var clipboardData = ev.clipboardData || window.clipboardData;
            if (!clipboardData) {
                return;
            }
            if (!browser_1.isEdge() && !clipboard_1.isSupportWindowClipboardData()) {
                ev.preventDefault();
                _this.pasteInOtherBrowsers(clipboardData);
            }
            else {
                _this.pasteInMSBrowser(clipboardData);
            }
        };
        return _this;
    }
    ClipboardComp.prototype.isClipboardFocused = function () {
        return document.hasFocus() && document.activeElement === this.el;
    };
    /**
     * Paste copied data in other browsers (chrome, safari, firefox)
     * [if] condition is copying from ms-excel,
     * [else] condition is copying from the grid or the copied data is plain text.
     */
    ClipboardComp.prototype.pasteInOtherBrowsers = function (clipboardData) {
        if (!this.el) {
            return;
        }
        var el = this.el;
        var html = clipboardData.getData('text/html');
        var data;
        if (html && html.indexOf('table') !== -1) {
            // step 1: Append copied data on contenteditable element to parsing correctly table data.
            el.innerHTML = html;
            // step 2: Make grid data from cell data of appended table element.
            var rows = el.querySelector('tbody').rows;
            data = clipboard_1.convertTableToData(rows);
            // step 3: Empty contenteditable element to reset.
            el.innerHTML = '';
        }
        else {
            data = clipboard_1.convertTextToData(clipboardData.getData('text/plain'));
        }
        this.props.dispatch('paste', data);
    };
    /**
     * Paste copied data in MS-browsers (IE, edge)
     */
    ClipboardComp.prototype.pasteInMSBrowser = function (clipboardData) {
        var _this = this;
        var data = clipboard_1.convertTextToData(clipboardData.getData('Text'));
        setTimeout(function () {
            if (!_this.el) {
                return;
            }
            var el = _this.el;
            if (el.querySelector('table')) {
                var rows = el.querySelector('tbody').rows;
                data = clipboard_1.convertTableToData(rows);
            }
            _this.props.dispatch('paste', data);
            el.innerHTML = '';
        }, 0);
    };
    ClipboardComp.prototype.componentDidUpdate = function () {
        var _this = this;
        setTimeout(function () {
            var _a = _this.props, navigating = _a.navigating, editing = _a.editing;
            if (_this.el && navigating && !editing && !_this.isClipboardFocused()) {
                _this.el.focus();
            }
        });
    };
    ClipboardComp.prototype.render = function () {
        var _this = this;
        return (preact_1.h("div", { class: dom_1.cls('clipboard'), onBlur: this.onBlur, onKeyDown: this.onKeyDown, onCopy: this.onCopy, onPaste: this.onPaste, contentEditable: true, ref: function (el) {
                _this.el = el;
            } }));
    };
    return ClipboardComp;
}(preact_1.Component));
exports.Clipboard = hoc_1.connect(function (_a) {
    var focus = _a.focus;
    return ({
        navigating: focus.navigating,
        editing: !!focus.editingAddress
    });
})(ClipboardComp);


/***/ }),
/* 58 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function isEdge() {
    var rEdge = /Edge\/(\d+)\./;
    return rEdge.exec(window.navigator.userAgent);
}
exports.isEdge = isEdge;


/***/ }),
/* 59 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var viewport = tslib_1.__importStar(__webpack_require__(60));
var dimension = tslib_1.__importStar(__webpack_require__(61));
var data = tslib_1.__importStar(__webpack_require__(62));
var column = tslib_1.__importStar(__webpack_require__(65));
var keyboard = tslib_1.__importStar(__webpack_require__(66));
var mouse = tslib_1.__importStar(__webpack_require__(69));
var focus = tslib_1.__importStar(__webpack_require__(15));
var summary = tslib_1.__importStar(__webpack_require__(70));
var selection = tslib_1.__importStar(__webpack_require__(11));
var dispatchMap = tslib_1.__assign({}, viewport, dimension, data, column, mouse, focus, keyboard, summary, selection);
function createDispatcher(store) {
    return function dispatch(fname) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        // @ts-ignore
        dispatchMap[fname].apply(dispatchMap, [store].concat(args));
    };
}
exports.createDispatcher = createDispatcher;


/***/ }),
/* 60 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function getHorizontalScrollPosition(rightSideWidth, cellPosRect, scrollLeft, tableBorderWidth) {
    var left = cellPosRect.left, right = cellPosRect.right;
    if (left < scrollLeft) {
        return left;
    }
    if (right > scrollLeft + rightSideWidth - tableBorderWidth) {
        return right - rightSideWidth + tableBorderWidth;
    }
    return null;
}
function getVerticalScrollPosition(height, cellPosRect, scrollTop, tableBorderWidth) {
    var top = cellPosRect.top, bottom = cellPosRect.bottom;
    if (top < scrollTop) {
        return top + tableBorderWidth;
    }
    if (bottom > scrollTop + height) {
        return bottom - height + tableBorderWidth;
    }
    return null;
}
function setScrollPosition(viewport, changedScrollTop, changedScrollLeft) {
    if (changedScrollLeft !== null) {
        viewport.scrollLeft = changedScrollLeft;
    }
    if (changedScrollTop !== null) {
        viewport.scrollTop = changedScrollTop;
    }
}
function setScrollToFocus(store) {
    var _a = store.dimension, bodyHeight = _a.bodyHeight, scrollbarWidth = _a.scrollbarWidth, tableBorderWidth = _a.tableBorderWidth, areaWidth = store.columnCoords.areaWidth, _b = store.focus, cellPosRect = _b.cellPosRect, side = _b.side, viewport = store.viewport;
    var scrollLeft = viewport.scrollLeft, scrollTop = viewport.scrollTop;
    if (cellPosRect === null || side === null) {
        return;
    }
    var changedScrollLeft = side === 'R'
        ? getHorizontalScrollPosition(areaWidth.R - scrollbarWidth, cellPosRect, scrollLeft, tableBorderWidth)
        : null;
    var changedScrollTop = getVerticalScrollPosition(bodyHeight - scrollbarWidth, cellPosRect, scrollTop, tableBorderWidth);
    setScrollPosition(viewport, changedScrollTop, changedScrollLeft);
}
exports.setScrollToFocus = setScrollToFocus;
function setScrollToSelection(store) {
    var _a = store.dimension, bodyHeight = _a.bodyHeight, scrollbarWidth = _a.scrollbarWidth, tableBorderWidth = _a.tableBorderWidth, _b = store.columnCoords, areaWidth = _b.areaWidth, widths = _b.widths, columnOffsets = _b.offsets, _c = store.rowCoords, heights = _c.heights, rowOffsets = _c.offsets, inputRange = store.selection.inputRange, viewport = store.viewport;
    if (!inputRange) {
        return;
    }
    var scrollLeft = viewport.scrollLeft, scrollTop = viewport.scrollTop;
    var rowIndex = inputRange.row[1];
    var columnIndex = inputRange.column[1];
    var cellSide = columnIndex > widths.L.length - 1 ? 'R' : 'L';
    var rightSideColumnIndex = columnIndex - widths.L.length;
    var left = columnOffsets[cellSide][rightSideColumnIndex];
    var right = left + widths[cellSide][rightSideColumnIndex];
    var top = rowOffsets[rowIndex];
    var bottom = top + heights[rowIndex];
    var cellPosRect = { left: left, right: right, top: top, bottom: bottom };
    var changedScrollLeft = cellSide === 'R'
        ? getHorizontalScrollPosition(areaWidth.R - scrollbarWidth, cellPosRect, scrollLeft, tableBorderWidth)
        : null;
    var changedScrollTop = getVerticalScrollPosition(bodyHeight - scrollbarWidth, cellPosRect, scrollTop, tableBorderWidth);
    setScrollPosition(viewport, changedScrollTop, changedScrollLeft);
}
exports.setScrollToSelection = setScrollToSelection;
function setScrollLeft(_a, scrollLeft) {
    var viewport = _a.viewport;
    viewport.scrollLeft = scrollLeft;
}
exports.setScrollLeft = setScrollLeft;
function setScrollTop(_a, scrollTop) {
    var viewport = _a.viewport;
    viewport.scrollTop = scrollTop;
}
exports.setScrollTop = setScrollTop;


/***/ }),
/* 61 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function setWidth(_a, width, autoWidth) {
    var dimension = _a.dimension;
    dimension.autoWidth = autoWidth;
    dimension.width = width;
}
exports.setWidth = setWidth;
function setHeight(_a, height) {
    var dimension = _a.dimension;
    var headerHeight = dimension.headerHeight, summaryHeight = dimension.summaryHeight, tableBorderWidth = dimension.tableBorderWidth;
    dimension.bodyHeight = height - headerHeight - summaryHeight - tableBorderWidth;
}
exports.setHeight = setHeight;
function setBodyHeight(_a, bodyHeight) {
    var dimension = _a.dimension;
    dimension.autoHeight = false;
    dimension.bodyHeight = Math.max(bodyHeight, dimension.minBodyHeight);
}
exports.setBodyHeight = setBodyHeight;
function setOffsetTop(_a, offsetTop) {
    var dimension = _a.dimension;
    dimension.offsetTop = offsetTop;
}
exports.setOffsetTop = setOffsetTop;
function setOffsetLeft(_a, offsetLeft) {
    var dimension = _a.dimension;
    dimension.offsetLeft = offsetLeft;
}
exports.setOffsetLeft = setOffsetLeft;


/***/ }),
/* 62 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var clipboard_1 = __webpack_require__(14);
var common_1 = __webpack_require__(1);
var sort_1 = __webpack_require__(63);
var clipboard_2 = __webpack_require__(9);
var data_1 = __webpack_require__(16);
var observable_1 = __webpack_require__(5);
var rowCoords_1 = __webpack_require__(17);
var eventBus_1 = __webpack_require__(7);
var selection_1 = __webpack_require__(11);
var gridEvent_1 = tslib_1.__importDefault(__webpack_require__(10));
function setValue(_a, rowKey, columnName, value) {
    var column = _a.column, data = _a.data;
    var targetRow = common_1.findProp('rowKey', rowKey, data.rawData);
    if (!targetRow || targetRow[columnName] === value) {
        return;
    }
    var targetColumn = common_1.findProp('name', columnName, column.visibleColumns);
    var gridEvent = new gridEvent_1.default({ rowKey: rowKey, columnName: columnName, value: value });
    if (targetColumn && targetColumn.onBeforeChange) {
        targetColumn.onBeforeChange(gridEvent);
    }
    if (!gridEvent.isStopped()) {
        if (targetRow) {
            targetRow[columnName] = value;
        }
        if (targetColumn && targetColumn.onAfterChange) {
            gridEvent = new gridEvent_1.default({ rowKey: rowKey, columnName: columnName, value: value });
            targetColumn.onAfterChange(gridEvent);
        }
    }
}
exports.setValue = setValue;
function isUpdatableRowAttr(name, checkDisabled, allDisabled) {
    return !(name === 'checked' && (checkDisabled || allDisabled));
}
function setRowAttribute(_a, rowKey, attrName, value) {
    var data = _a.data;
    var disabled = data.disabled, rawData = data.rawData;
    var targetRow = common_1.findProp('rowKey', rowKey, rawData);
    if (targetRow && isUpdatableRowAttr(attrName, targetRow._attributes.checkDisabled, disabled)) {
        targetRow._attributes[attrName] = value;
    }
}
exports.setRowAttribute = setRowAttribute;
function setAllRowAttribute(_a, attrName, value) {
    var data = _a.data;
    data.rawData.forEach(function (row) {
        if (isUpdatableRowAttr(attrName, row._attributes.checkDisabled, data.disabled)) {
            row._attributes[attrName] = value;
        }
    });
}
exports.setAllRowAttribute = setAllRowAttribute;
function setColumnValues(store, columnName, value, checkCellState) {
    if (checkCellState === void 0) { checkCellState = false; }
    // @TODO Check Cell State
    store.data.rawData.forEach(function (targetRow) {
        targetRow[columnName] = value;
    });
}
exports.setColumnValues = setColumnValues;
function check(store, rowKey) {
    var _a = store.column.allColumnMap._checked.rendererOptions, rendererOptions = _a === void 0 ? {} : _a;
    var eventBus = eventBus_1.getEventBus(store.id);
    var gridEvent = new gridEvent_1.default({ rowKey: rowKey });
    /**
     * Occurs when a checkbox in row header is checked
     * @event Grid#check
     * @property {number | string} rowKey - rowKey of the checked row
     * @property {Grid} instance - Current grid instance
     */
    eventBus.trigger('check', gridEvent);
    if (rendererOptions.inputType === 'radio') {
        setAllRowAttribute(store, 'checked', false);
    }
    setRowAttribute(store, rowKey, 'checked', true);
}
exports.check = check;
function uncheck(store, rowKey) {
    var eventBus = eventBus_1.getEventBus(store.id);
    var gridEvent = new gridEvent_1.default({ rowKey: rowKey });
    /**
     * Occurs when a checkbox in row header is unchecked
     * @event Grid#uncheck
     * @property {number | string} rowKey - rowKey of the unchecked row
     * @property {Grid} instance - Current grid instance
     */
    eventBus.trigger('uncheck', gridEvent);
    setRowAttribute(store, rowKey, 'checked', false);
}
exports.uncheck = uncheck;
function checkAll(store) {
    var _a = store.column.allColumnMap._checked.rendererOptions, rendererOptions = _a === void 0 ? {} : _a;
    if (rendererOptions.inputType !== 'radio') {
        setAllRowAttribute(store, 'checked', true);
    }
}
exports.checkAll = checkAll;
function uncheckAll(store) {
    var _a = store.column.allColumnMap._checked.rendererOptions, rendererOptions = _a === void 0 ? {} : _a;
    if (rendererOptions.inputType !== 'radio') {
        setAllRowAttribute(store, 'checked', false);
    }
}
exports.uncheckAll = uncheckAll;
// @TODO neet to modify useClient options with net api
function sort(_a, columnName, ascending) {
    var data = _a.data;
    var sortOptions = data.sortOptions;
    if (sortOptions.columnName !== columnName || sortOptions.ascending !== ascending) {
        data.sortOptions = tslib_1.__assign({}, sortOptions, { columnName: columnName, ascending: ascending });
    }
    var _b = sort_1.getSortedData(data, columnName, ascending), rawData = _b.rawData, viewData = _b.viewData;
    if (!common_1.arrayEqual(rawData, data.rawData)) {
        data.rawData = rawData;
        data.viewData = viewData;
    }
}
exports.sort = sort;
function applyPasteDataToRawData(store, pasteData, indexToPaste) {
    var _a = store.data, rawData = _a.rawData, viewData = _a.viewData, visibleColumns = store.column.visibleColumns;
    var _b = indexToPaste.row, startRowIndex = _b[0], endRowIndex = _b[1], _c = indexToPaste.column, startColumnIndex = _c[0], endColumnIndex = _c[1];
    var columnNames = common_1.mapProp('name', visibleColumns);
    for (var rowIdx = 0; rowIdx + startRowIndex <= endRowIndex; rowIdx += 1) {
        var rawRowIndex = rowIdx + startRowIndex;
        for (var columnIdx = 0; columnIdx + startColumnIndex <= endColumnIndex; columnIdx += 1) {
            var name_1 = columnNames[columnIdx + startColumnIndex];
            if (clipboard_2.isColumnEditable(viewData, rawRowIndex, name_1)) {
                rawData[rawRowIndex][name_1] = pasteData[rowIdx][columnIdx];
            }
        }
    }
}
function paste(store, pasteData) {
    var selection = store.selection, id = store.id;
    if (selection.range) {
        pasteData = clipboard_1.copyDataToRange(selection.range, pasteData);
    }
    var rangeToPaste = clipboard_1.getRangeToPaste(store, pasteData);
    applyPasteDataToRawData(store, pasteData, rangeToPaste);
    selection_1.changeSelectionRange(selection, rangeToPaste, id);
}
exports.paste = paste;
function setDisabled(store, disabled) {
    store.data.disabled = disabled;
}
exports.setDisabled = setDisabled;
function setRowDisabled(store, disabled, rowKey, withCheckbox) {
    var rawData = store.data.rawData;
    var row = common_1.findProp('rowKey', rowKey, rawData);
    if (row) {
        row._attributes.disabled = disabled;
        if (withCheckbox) {
            row._attributes.checkDisabled = disabled;
        }
    }
}
exports.setRowDisabled = setRowDisabled;
function setRowCheckDisabled(store, disabled, rowKey) {
    var rawData = store.data.rawData;
    var row = common_1.findProp('rowKey', rowKey, rawData);
    if (row) {
        row._attributes.checkDisabled = disabled;
    }
}
exports.setRowCheckDisabled = setRowCheckDisabled;
function appendRow(_a, row, options) {
    var data = _a.data, column = _a.column, rowCoords = _a.rowCoords, dimension = _a.dimension;
    var rawData = data.rawData, viewData = data.viewData;
    var heights = rowCoords.heights;
    var defaultValues = column.defaultValues, allColumnMap = column.allColumnMap;
    var _b = options.at, at = _b === void 0 ? rawData.length : _b;
    var rawRow = data_1.createRawRow(row, rawData.length, defaultValues);
    var viewRow = data_1.createViewRow(rawRow, allColumnMap);
    rawData.splice(at, 0, rawRow);
    viewData.splice(at, 0, viewRow);
    heights.splice(at, 0, rowCoords_1.getRowHeight(rawRow, dimension.rowHeight));
    observable_1.notify(data, 'rawData');
    observable_1.notify(data, 'viewData');
    observable_1.notify(rowCoords, 'heights');
}
exports.appendRow = appendRow;
function removeRow(_a, rowKey, options) {
    var data = _a.data, rowCoords = _a.rowCoords;
    var rawData = data.rawData, viewData = data.viewData;
    var heights = rowCoords.heights;
    var rowIdx = common_1.findPropIndex('rowKey', rowKey, rawData);
    rawData.splice(rowIdx, 1);
    viewData.splice(rowIdx, 1);
    heights.splice(rowIdx, 1);
    observable_1.notify(data, 'rawData');
    observable_1.notify(data, 'viewData');
    observable_1.notify(rowCoords, 'heights');
}
exports.removeRow = removeRow;
function clearData(_a) {
    var data = _a.data;
    data.rawData = [];
    data.viewData = [];
}
exports.clearData = clearData;
function resetData(_a, inputData) {
    var data = _a.data, column = _a.column, dimension = _a.dimension, rowCoords = _a.rowCoords;
    var _b = data_1.createData(inputData, column), rawData = _b.rawData, viewData = _b.viewData;
    var rowHeight = dimension.rowHeight;
    data.rawData = rawData;
    data.viewData = viewData;
    rowCoords.heights = rawData.map(function (row) { return rowCoords_1.getRowHeight(row, rowHeight); });
}
exports.resetData = resetData;
function addRowClassName(store, rowKey, className) {
    var rawData = store.data.rawData;
    var row = common_1.findProp('rowKey', rowKey, rawData);
    if (row) {
        var rowClassMap = row._attributes.className.row;
        var isExist = common_1.includes(rowClassMap, className);
        if (!isExist) {
            rowClassMap.push(className);
            observable_1.notify(row._attributes, 'className');
        }
    }
}
exports.addRowClassName = addRowClassName;
function removeRowClassName(store, rowKey, className) {
    var rawData = store.data.rawData;
    var row = common_1.findProp('rowKey', rowKey, rawData);
    if (row) {
        common_1.removeArrayItem(className, row._attributes.className.row);
        observable_1.notify(row._attributes, 'className');
    }
}
exports.removeRowClassName = removeRowClassName;
function addCellClassName(store, rowKey, columnName, className) {
    var rawData = store.data.rawData;
    var row = common_1.findProp('rowKey', rowKey, rawData);
    if (row) {
        var columnClassMap = row._attributes.className.column;
        if (common_1.isUndefined(columnClassMap[columnName])) {
            columnClassMap[columnName] = [className];
        }
        else {
            var isExist = common_1.includes(columnClassMap[columnName], className);
            if (!isExist) {
                columnClassMap[columnName].push(className);
            }
        }
        observable_1.notify(row._attributes, 'className');
    }
}
exports.addCellClassName = addCellClassName;
function removeCellClassName(store, rowKey, columnName, className) {
    var rawData = store.data.rawData;
    var row = common_1.findProp('rowKey', rowKey, rawData);
    if (row) {
        var columnClassMap = row._attributes.className.column;
        if (common_1.isUndefined(columnClassMap[columnName])) {
            return;
        }
        common_1.removeArrayItem(className, columnClassMap[columnName]);
        observable_1.notify(row._attributes, 'className');
    }
}
exports.removeCellClassName = removeCellClassName;
function setRowHeight(_a, rowIndex, rowHeight) {
    var data = _a.data, rowCoords = _a.rowCoords;
    data.rawData[rowIndex]._attributes.height = rowHeight;
    rowCoords.heights[rowIndex] = rowHeight;
    observable_1.notify(rowCoords, 'heights');
}
exports.setRowHeight = setRowHeight;


/***/ }),
/* 63 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var common_1 = __webpack_require__(1);
function comparator(valueA, valueB, ascending) {
    var isBlankA = common_1.isBlank(valueA);
    var isBlankB = common_1.isBlank(valueB);
    var result = 0;
    if (isBlankA && !isBlankB) {
        result = -1;
    }
    else if (!isBlankA && isBlankB) {
        result = 1;
    }
    else if (valueA < valueB) {
        result = -1;
    }
    else if (valueA > valueB) {
        result = 1;
    }
    return ascending ? result : -result;
}
exports.comparator = comparator;
function getSortedData(data, sortKey, ascending) {
    var rawData = data.rawData.slice();
    var viewData = data.viewData.slice();
    rawData.sort(function (a, b) { return comparator(a[sortKey], b[sortKey], ascending); });
    viewData.sort(function (a, b) {
        var _a = sortKey === 'rowKey'
            ? [a.rowKey, b.rowKey]
            : [a.valueMap[sortKey].value, b.valueMap[sortKey].value], valueA = _a[0], valueB = _a[1];
        return comparator(valueA, valueB, ascending);
    });
    return { rawData: rawData, viewData: viewData };
}
exports.getSortedData = getSortedData;


/***/ }),
/* 64 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var common_1 = __webpack_require__(1);
function isSameInputRange(inp1, inp2) {
    if (common_1.isNull(inp1) || common_1.isNull(inp2)) {
        return inp1 === inp2;
    }
    return (inp1.column[0] === inp2.column[0] &&
        inp1.column[1] === inp2.column[1] &&
        inp1.row[0] === inp2.row[0] &&
        inp1.row[1] === inp2.row[1]);
}
exports.isSameInputRange = isSameInputRange;


/***/ }),
/* 65 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function setFrozenColumnCount(_a, count) {
    var column = _a.column;
    column.frozenCount = count;
}
exports.setFrozenColumnCount = setFrozenColumnCount;
function setColumnWidth(_a, side, index, width) {
    var column = _a.column;
    var columnItem = column.visibleColumnsBySide[side][index];
    columnItem.baseWidth = width;
    columnItem.fixedWidth = true;
}
exports.setColumnWidth = setColumnWidth;
function hideColumn(_a, columnName) {
    var column = _a.column;
    var columnItem = column.allColumnMap[columnName];
    if (columnItem) {
        columnItem.hidden = true;
    }
}
exports.hideColumn = hideColumn;
function showColumn(_a, columnName) {
    var column = _a.column;
    var columnItem = column.allColumnMap[columnName];
    if (columnItem) {
        columnItem.hidden = false;
    }
}
exports.showColumn = showColumn;


/***/ }),
/* 66 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var keyboard_1 = __webpack_require__(67);
var focus_1 = __webpack_require__(15);
var selection_1 = __webpack_require__(11);
var column_1 = __webpack_require__(6);
function moveFocus(store, command) {
    var focus = store.focus, viewData = store.data.viewData, visibleColumns = store.column.visibleColumns, id = store.id;
    var rowIndex = focus.rowIndex, columnIndex = focus.totalColumnIndex;
    if (rowIndex === null || columnIndex === null) {
        return;
    }
    var _a = keyboard_1.getNextCellIndex(store, command, [rowIndex, columnIndex]), nextRowIndex = _a[0], nextColumnIndex = _a[1];
    var nextColumnName = visibleColumns[nextColumnIndex].name;
    if (!column_1.isRowHeader(nextColumnName)) {
        focus.navigating = true;
        focus_1.changeFocus(focus, viewData[nextRowIndex].rowKey, nextColumnName, id);
    }
}
exports.moveFocus = moveFocus;
function editFocus(_a, command) {
    var column = _a.column, focus = _a.focus;
    var rowKey = focus.rowKey, columnName = focus.columnName;
    if (rowKey === null || columnName === null) {
        return;
    }
    if (command === 'currentCell') {
        var columnInfo = column.allColumnMap[columnName];
        if (columnInfo && columnInfo.editor) {
            focus.navigating = false;
            focus.editingAddress = { rowKey: rowKey, columnName: columnName };
        }
    }
}
exports.editFocus = editFocus;
function changeSelection(store, command) {
    var selection = store.selection, focus = store.focus, viewData = store.data.viewData, visibleColumns = store.column.visibleColumns, id = store.id;
    var currentInputRange = selection.inputRange;
    var focusRowIndex = focus.rowIndex, totalFocusColumnIndex = focus.totalColumnIndex;
    if (focusRowIndex === null || totalFocusColumnIndex === null) {
        return;
    }
    if (!currentInputRange) {
        currentInputRange = selection.inputRange = {
            row: [focusRowIndex, focusRowIndex],
            column: [totalFocusColumnIndex, totalFocusColumnIndex]
        };
    }
    var rowLength = viewData.length;
    var columnLength = visibleColumns.length;
    var rowStartIndex = currentInputRange.row[0];
    var rowIndex = currentInputRange.row[1];
    var columnStartIndex = currentInputRange.column[0];
    var columnIndex = currentInputRange.column[1];
    var nextCellIndexes;
    if (command === 'all') {
        rowStartIndex = 0;
        columnStartIndex = 0;
        nextCellIndexes = [rowLength - 1, columnLength - 1];
    }
    else {
        nextCellIndexes = keyboard_1.getNextCellIndex(store, command, [rowIndex, columnIndex]);
    }
    var nextRowIndex = nextCellIndexes[0], nextColumnIndex = nextCellIndexes[1];
    var nextColumnName = visibleColumns[nextColumnIndex].name;
    if (!column_1.isRowHeader(nextColumnName)) {
        var inputRange = {
            row: [rowStartIndex, nextRowIndex],
            column: [columnStartIndex, nextColumnIndex]
        };
        selection_1.changeSelectionRange(selection, inputRange, id);
    }
}
exports.changeSelection = changeSelection;
function removeFocus(store) {
    // @TODO: 이후 관련 키보드 이벤트 작업 필요
    console.log(store);
}
exports.removeFocus = removeFocus;
function setFocusInfo(store, rowKey, columnName, navigating) {
    var focus = store.focus, id = store.id;
    focus.navigating = navigating;
    focus_1.changeFocus(store.focus, rowKey, columnName, id);
}
exports.setFocusInfo = setFocusInfo;


/***/ }),
/* 67 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var common_1 = __webpack_require__(1);
var keyboard_1 = __webpack_require__(13);
function getNextCellIndex(store, command, _a) {
    var rowIndex = _a[0], columnIndex = _a[1];
    var viewData = store.data.viewData, visibleColumns = store.column.visibleColumns, _b = store.dimension, bodyHeight = _b.bodyHeight, cellBorderWidth = _b.cellBorderWidth, offsets = store.rowCoords.offsets;
    switch (command) {
        case 'up':
            rowIndex -= 1;
            break;
        case 'down':
            rowIndex += 1;
            break;
        case 'left':
            columnIndex -= 1;
            break;
        case 'right':
            columnIndex += 1;
            break;
        case 'firstCell':
            columnIndex = 0;
            rowIndex = 0;
            break;
        case 'lastCell':
            columnIndex = visibleColumns.length - 1;
            rowIndex = viewData.length - 1;
            break;
        case 'pageUp': {
            var movedPosition = keyboard_1.getPageMovedPosition(rowIndex, offsets, bodyHeight, true);
            rowIndex = keyboard_1.getPageMovedIndex(offsets, cellBorderWidth, movedPosition);
            break;
        }
        case 'pageDown': {
            var movedPosition = keyboard_1.getPageMovedPosition(rowIndex, offsets, bodyHeight, false);
            rowIndex = keyboard_1.getPageMovedIndex(offsets, cellBorderWidth, movedPosition);
            break;
        }
        case 'firstColumn':
            columnIndex = 0;
            break;
        case 'lastColumn':
            columnIndex = visibleColumns.length - 1;
            break;
        default:
            break;
    }
    rowIndex = common_1.clamp(rowIndex, 0, viewData.length - 1);
    columnIndex = common_1.clamp(columnIndex, 0, visibleColumns.length - 1);
    return [rowIndex, columnIndex];
}
exports.getNextCellIndex = getNextCellIndex;


/***/ }),
/* 68 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function isFocusedCell(focus, rowKey, columnName) {
    return rowKey === focus.rowKey && columnName === focus.columnName;
}
exports.isFocusedCell = isFocusedCell;


/***/ }),
/* 69 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var common_1 = __webpack_require__(1);
var column_1 = __webpack_require__(6);
var focus_1 = __webpack_require__(15);
var selection_1 = __webpack_require__(11);
function setNavigating(_a, navigating) {
    var focus = _a.focus;
    focus.navigating = navigating;
}
exports.setNavigating = setNavigating;
function getPositionFromBodyArea(pageX, pageY, dimension) {
    var offsetLeft = dimension.offsetLeft, offsetTop = dimension.offsetTop, tableBorderWidth = dimension.tableBorderWidth, cellBorderWidth = dimension.cellBorderWidth, headerHeight = dimension.headerHeight, summaryHeight = dimension.summaryHeight, summaryPosition = dimension.summaryPosition;
    var adjustedSummaryHeight = summaryPosition === 'top' ? summaryHeight : 0;
    return {
        x: pageX - offsetLeft,
        y: pageY -
            (offsetTop + headerHeight + adjustedSummaryHeight + cellBorderWidth + tableBorderWidth)
    };
}
function getTotalColumnOffsets(widths, cellBorderWidth) {
    var totalWidths = widths.L.concat(widths.R);
    var offsets = [0];
    for (var i = 1, len = totalWidths.length; i < len; i += 1) {
        offsets.push(offsets[i - 1] + totalWidths[i - 1] + cellBorderWidth);
    }
    return offsets;
}
function getScrolledPosition(_a, dimension, leftSideWidth) {
    var pageX = _a.pageX, pageY = _a.pageY, scrollLeft = _a.scrollLeft, scrollTop = _a.scrollTop;
    var _b = getPositionFromBodyArea(pageX, pageY, dimension), bodyPositionX = _b.x, bodyPositionY = _b.y;
    var scrollX = bodyPositionX > leftSideWidth ? scrollLeft : 0;
    var scrolledPositionX = bodyPositionX + scrollX;
    var scrolledPositionY = bodyPositionY + scrollTop;
    return {
        x: scrolledPositionX,
        y: scrolledPositionY
    };
}
function judgeOverflow(_a, _b) {
    var containerX = _a.x, containerY = _a.y;
    var bodyHeight = _b.bodyHeight, bodyWidth = _b.bodyWidth;
    var overflowY = 0;
    var overflowX = 0;
    if (containerY < 0) {
        overflowY = -1;
    }
    else if (containerY > bodyHeight) {
        overflowY = 1;
    }
    if (containerX < 0) {
        overflowX = -1;
    }
    else if (containerX > bodyWidth) {
        overflowX = 1;
    }
    return {
        x: overflowX,
        y: overflowY
    };
}
function getOverflowFromMousePosition(pageX, pageY, bodyWidth, dimension) {
    var bodyHeight = dimension.bodyHeight;
    var _a = getPositionFromBodyArea(pageX, pageY, dimension), x = _a.x, y = _a.y;
    return judgeOverflow({ x: x, y: y }, { bodyWidth: bodyWidth, bodyHeight: bodyHeight });
}
function stopAutoScroll(selection) {
    var intervalIdForAutoScroll = selection.intervalIdForAutoScroll;
    if (intervalIdForAutoScroll !== null) {
        clearInterval(intervalIdForAutoScroll);
        selection.intervalIdForAutoScroll = null;
    }
}
function isAutoScrollable(overflowX, overflowY) {
    return !(overflowX === 0 && overflowY === 0);
}
function adjustScrollLeft(overflowX, viewport) {
    var scrollPixelScale = viewport.scrollPixelScale, scrollLeft = viewport.scrollLeft, maxScrollLeft = viewport.maxScrollLeft;
    if (overflowX < 0) {
        viewport.scrollLeft = Math.max(0, scrollLeft - scrollPixelScale);
    }
    else if (overflowX > 0) {
        viewport.scrollLeft = Math.max(maxScrollLeft, scrollLeft - scrollPixelScale);
    }
}
function adjustScrollTop(overflowY, viewport) {
    var scrollTop = viewport.scrollTop, maxScrollTop = viewport.maxScrollTop, scrollPixelScale = viewport.scrollPixelScale;
    if (overflowY < 0) {
        viewport.scrollTop = Math.max(0, scrollTop - scrollPixelScale);
    }
    else if (overflowY > 0) {
        viewport.scrollTop = Math.min(maxScrollTop, scrollTop + scrollPixelScale);
    }
}
function adjustScroll(viewport, overflow) {
    if (overflow.x) {
        adjustScrollLeft(overflow.x, viewport);
    }
    if (overflow.y) {
        adjustScrollTop(overflow.y, viewport);
    }
}
function setScrolling(_a, bodyWidth, selection, dimension, viewport) {
    var pageX = _a.pageX, pageY = _a.pageY;
    var overflow = getOverflowFromMousePosition(pageX, pageY, bodyWidth, dimension);
    stopAutoScroll(selection);
    if (isAutoScrollable(overflow.x, overflow.y)) {
        selection.intervalIdForAutoScroll = setInterval(adjustScroll.bind(null, viewport, overflow));
    }
}
function selectionEnd(_a) {
    var selection = _a.selection;
    selection.inputRange = null;
    // @TODO: minimumColumnRange 고려 필요
    // selection.minimumColumnRange = null;
}
exports.selectionEnd = selectionEnd;
function selectionUpdate(store, dragStartData, dragData) {
    var dimension = store.dimension, _a = store.viewport, scrollTop = _a.scrollTop, scrollLeft = _a.scrollLeft, _b = store.columnCoords, widths = _b.widths, areaWidth = _b.areaWidth, rowOffsets = store.rowCoords.offsets, selection = store.selection, visibleColumns = store.column.visibleColumns, id = store.id;
    var pageX = dragData.pageX, pageY = dragData.pageY;
    var curInputRange = selection.inputRange;
    var startRowIndex, startColumnIndex;
    var viewInfo = { pageX: pageX, pageY: pageY, scrollTop: scrollTop, scrollLeft: scrollLeft };
    var scrolledPosition = getScrolledPosition(viewInfo, dimension, areaWidth.L);
    var rowIndex = common_1.findOffsetIndex(rowOffsets, scrolledPosition.y);
    var totalColumnOffsets = getTotalColumnOffsets(widths, dimension.cellBorderWidth);
    var columnIndex = common_1.findOffsetIndex(totalColumnOffsets, scrolledPosition.x);
    if (curInputRange === null) {
        var startViewInfo = {
            pageX: dragStartData.pageX,
            pageY: dragStartData.pageY,
            scrollTop: scrollTop,
            scrollLeft: scrollLeft
        };
        var startScrolledPosition = getScrolledPosition(startViewInfo, dimension, areaWidth.L);
        startRowIndex = common_1.findOffsetIndex(rowOffsets, startScrolledPosition.y);
        startColumnIndex = common_1.findOffsetIndex(totalColumnOffsets, startScrolledPosition.x);
    }
    else {
        startRowIndex = curInputRange.row[0];
        startColumnIndex = curInputRange.column[0];
    }
    var startColumnName = visibleColumns[startColumnIndex].name;
    var nextColumnName = visibleColumns[columnIndex].name;
    if (column_1.isRowHeader(nextColumnName) || column_1.isRowHeader(startColumnName)) {
        return;
    }
    var inputRange = {
        row: [startRowIndex, rowIndex],
        column: [startColumnIndex, columnIndex]
    };
    selection_1.changeSelectionRange(selection, inputRange, id);
}
exports.selectionUpdate = selectionUpdate;
function dragMoveBody(store, dragStartData, dragData) {
    var dimension = store.dimension, areaWidth = store.columnCoords.areaWidth, selection = store.selection, viewport = store.viewport;
    selectionUpdate(store, dragStartData, dragData);
    setScrolling(dragData, areaWidth.L + areaWidth.R, selection, dimension, viewport);
}
exports.dragMoveBody = dragMoveBody;
function dragEndBody(_a) {
    var selection = _a.selection;
    stopAutoScroll(selection);
}
exports.dragEndBody = dragEndBody;
function mouseDownBody(store, elementInfo, eventInfo) {
    var data = store.data, column = store.column, columnCoords = store.columnCoords, rowCoords = store.rowCoords, focus = store.focus, id = store.id;
    var pageX = eventInfo.pageX, pageY = eventInfo.pageY, shiftKey = eventInfo.shiftKey;
    var side = elementInfo.side, scrollLeft = elementInfo.scrollLeft, scrollTop = elementInfo.scrollTop, left = elementInfo.left, top = elementInfo.top;
    var offsetX = pageX - left + scrollLeft;
    var offsetY = pageY - top + scrollTop;
    var rowIndex = common_1.findOffsetIndex(rowCoords.offsets, offsetY);
    var columnIndex = common_1.findOffsetIndex(columnCoords.offsets[side], offsetX);
    var columnName = column.visibleColumnsBySide[side][columnIndex].name;
    if (!column_1.isRowHeader(columnName)) {
        if (shiftKey) {
            var dragData = { pageX: pageX, pageY: pageY };
            selectionUpdate(store, dragData, dragData);
        }
        else {
            focus_1.changeFocus(focus, data.viewData[rowIndex].rowKey, columnName, id);
            selectionEnd(store);
        }
    }
}
exports.mouseDownBody = mouseDownBody;


/***/ }),
/* 70 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var summary_1 = __webpack_require__(18);
function setSummaryColumnContent(_a, columnName, columnContent) {
    var summary = _a.summary, data = _a.data;
    var rawData = data.rawData;
    var columnValues = rawData.map(function (row) { return row[columnName]; });
    var castedColumnContent = summary_1.castToSummaryColumnContent(columnContent);
    var content = summary_1.extractSummaryColumnContent(castedColumnContent, null);
    summary.summaryColumnContents[columnName] = content;
    summary.summaryValues[columnName] = summary_1.createSummaryValue(content, columnValues);
}
exports.setSummaryColumnContent = setSummaryColumnContent;


/***/ }),
/* 71 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var preset_1 = __webpack_require__(72);
var common_1 = __webpack_require__(1);
var dom_1 = __webpack_require__(3);
var styleGen = tslib_1.__importStar(__webpack_require__(73));
var STYLE_ELEMENT_ID = 'tui-grid-theme-style';
var presetOptions = {
    default: preset_1.presetDefault,
    striped: preset_1.striped,
    clean: preset_1.clean
};
var styleGenMethodMap = {
    outline: styleGen.outline,
    frozenBorder: styleGen.frozenBorder,
    scrollbar: styleGen.scrollbar,
    heightResizeHandle: styleGen.heightResizeHandle,
    pagination: styleGen.pagination,
    selection: styleGen.selection
};
var styleGenAreaMethodMap = {
    header: styleGen.headArea,
    body: styleGen.bodyArea,
    summary: styleGen.summaryArea
};
var styleGenCellMethodMap = {
    normal: styleGen.cell,
    dummy: styleGen.cellDummy,
    editable: styleGen.cellEditable,
    head: styleGen.cellHead,
    rowHead: styleGen.cellRowHead,
    summary: styleGen.cellSummary,
    oddRow: styleGen.cellOddRow,
    evenRow: styleGen.cellEvenRow,
    required: styleGen.cellRequired,
    disabled: styleGen.cellDisabled,
    invalid: styleGen.cellInvalid,
    currentRow: styleGen.cellCurrentRow,
    selectedHead: styleGen.cellSelectedHead,
    selectedRowHead: styleGen.cellSelectedRowHead,
    focused: styleGen.cellFocused,
    focusedInactive: styleGen.cellFocusedInactive
};
/**
 * build css string with given options.
 * @param {Object} options - options
 * @returns {String}
 * @ignore
 */
function buildCssString(options) {
    var area = options.area, cell = options.cell;
    var styles = [];
    Object.keys(styleGenMethodMap).forEach(function (key) {
        var keyWithType = key;
        var value = options[keyWithType];
        if (value) {
            var fn = styleGen[keyWithType];
            styles.push(fn(value));
        }
    });
    if (area) {
        Object.keys(styleGenAreaMethodMap).forEach(function (key) {
            var keyWithType = key;
            var value = area[keyWithType];
            if (value) {
                var fn = styleGenAreaMethodMap[keyWithType];
                styles.push(fn(value));
            }
        });
    }
    if (cell) {
        Object.keys(styleGenCellMethodMap).forEach(function (key) {
            var keyWithType = key;
            var value = cell[keyWithType];
            if (value) {
                var fn = styleGenCellMethodMap[keyWithType];
                styles.push(fn(value));
            }
        });
    }
    return styles.join('');
}
/**
 * Set document style with given options.
 * @param {Object} options - options
 * @ignore
 */
function setDocumentStyle(options) {
    var cssString = buildCssString(options);
    var elem = document.getElementById(STYLE_ELEMENT_ID);
    if (elem && elem.parentNode) {
        elem.parentNode.removeChild(elem);
    }
    dom_1.appendStyleElement(STYLE_ELEMENT_ID, cssString);
}
exports.default = {
    /**
     * Creates a style element using theme options identified by given name,
     * and appends it to the document.
     * @param themeName - preset theme name
     * @param extOptions - if exist, extend preset theme options with it.
     */
    apply: function (themeName, extOptions) {
        var options = presetOptions[themeName];
        if (!options) {
            options = presetOptions['default'];
        }
        if (extOptions) {
            options = common_1.deepMergedCopy(options, extOptions);
        }
        setDocumentStyle(options);
    },
    /**
     * Returns whether the style of a theme is applied.
     */
    isApplied: function () {
        return !!document.getElementById(STYLE_ELEMENT_ID);
    }
};


/***/ }),
/* 72 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var common_1 = __webpack_require__(1);
exports.presetDefault = {
    selection: {
        background: '#00A9ff',
        border: '#00a9ff'
    },
    heightResizeHandle: {
        border: '#fff',
        background: '#fff'
    },
    pagination: {
        border: 'transparent',
        background: 'transparent'
    },
    scrollbar: {
        border: '#eee',
        background: '#fff',
        emptySpace: '#f9f9f9',
        thumb: '#ddd',
        active: '#ddd'
    },
    outline: {
        border: '#aaa',
        showVerticalBorder: false
    },
    frozenBorder: {
        border: '#aaa'
    },
    area: {
        header: {
            border: '#ccc',
            background: '#fff'
        },
        body: {
            background: '#fff'
        },
        summary: {
            border: '#eee',
            background: '#fff'
        }
    },
    cell: {
        normal: {
            background: '#f4f4f4',
            border: '#eee',
            text: '#333',
            showVerticalBorder: false,
            showHorizontalBorder: true
        },
        head: {
            background: '#fff',
            border: '#eee',
            text: '#222',
            showVerticalBorder: true,
            showHorizontalBorder: true
        },
        rowHead: {
            background: '#fff',
            border: '#eee',
            text: '#333',
            showVerticalBorder: false,
            showHorizontalBorder: true
        },
        summary: {
            background: '#fff',
            border: '#eee',
            text: '#333',
            showVerticalBorder: false
        },
        selectedHead: {
            background: '#e5f6ff'
        },
        selectedRowHead: {
            background: '#e5f6ff'
        },
        focused: {
            border: '#00a9ff'
        },
        focusedInactive: {
            border: '#aaa'
        },
        required: {
            background: '#fffdeb'
        },
        editable: {
            background: '#fff'
        },
        disabled: {
            background: '#f9f9f9',
            text: '#c1c1c1'
        },
        dummy: {
            background: '#fff'
        },
        invalid: {
            background: '#ffe5e5'
        },
        evenRow: {},
        oddRow: {},
        currentRow: {}
    }
};
exports.clean = common_1.deepMergedCopy(exports.presetDefault, {
    outline: {
        border: '#eee',
        showVerticalBorder: false
    },
    frozenBorder: {
        border: '#ddd'
    },
    area: {
        header: {
            border: '#eee',
            background: '#f9f9f9'
        },
        body: {
            background: '#fff'
        },
        summary: {
            border: '#fff',
            background: '#fff'
        }
    },
    cell: {
        normal: {
            background: '#fff',
            border: '#eee',
            showVerticalBorder: false,
            showHorizontalBorder: false
        },
        head: {
            background: '#f9f9f9',
            border: '#eee',
            showVerticalBorder: true,
            showHorizontalBorder: true
        },
        rowHead: {
            border: '#eee',
            showVerticalBorder: false,
            showHorizontalBorder: false
        }
    }
});
exports.striped = common_1.deepMergedCopy(exports.presetDefault, {
    outline: {
        border: '#eee',
        showVerticalBorder: false
    },
    frozenBorder: {
        border: '#ccc'
    },
    area: {
        header: {
            border: '#fff',
            background: '#eee'
        },
        body: {
            background: '#fff'
        },
        summary: {
            border: '#fff',
            background: '#fff'
        }
    },
    cell: {
        normal: {
            background: '#fff',
            border: '#fff',
            showVerticalBorder: false,
            showHorizontalBorder: false
        },
        head: {
            background: '#eee',
            border: '#fff',
            showVerticalBorder: true,
            showHorizontalBorder: true
        },
        rowHead: {
            border: '#fff',
            showVerticalBorder: false,
            showHorizontalBorder: false
        },
        oddRow: {
            background: '#fff'
        },
        evenRow: {
            background: '#f4f4f4'
        }
    }
});


/***/ }),
/* 73 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var dom_1 = __webpack_require__(3);
var cssRuleBuilder_1 = __webpack_require__(74);
/**
 * Creates a rule string for background and text colors.
 * @param {String} className - class name
 * @param {Objecr} options - options
 * @returns {String}
 * @ignore
 */
function bgTextRuleString(className, options) {
    var background = options.background, text = options.text;
    return cssRuleBuilder_1.createClassRule(className)
        .bg(background)
        .text(text)
        .build();
}
/**
 * Creates a rule string for background and border colors.
 * @param {String} className - class name
 * @param {Objecr} options - options
 * @returns {String}
 * @ignore
 */
function bgBorderRuleString(className, options) {
    var background = options.background, border = options.border;
    return cssRuleBuilder_1.createClassRule(className)
        .bg(background)
        .border(border)
        .build();
}
/**
 * Generates a css string for grid outline.
 * @param {Object} options - options
 * @returns {String}
 */
function outline(options) {
    var border = options.border, showVerticalBorder = options.showVerticalBorder;
    var borderTopRule = cssRuleBuilder_1.createClassRule('border-line-top').bg(border);
    var borderBottomRule = cssRuleBuilder_1.createNestedClassRule(' .', ['no-scroll-x', 'border-line-bottom']).bg(border);
    var rules = [borderTopRule, borderBottomRule];
    var borderLeftRule, borderRightRule;
    if (showVerticalBorder) {
        borderLeftRule = cssRuleBuilder_1.createClassRule('border-line-left').bg(border);
        borderRightRule = cssRuleBuilder_1.createNestedClassRule(' .', ['no-scroll-y', 'border-line-right']).bg(border);
        rules = rules.concat([borderLeftRule, borderRightRule]);
    }
    return cssRuleBuilder_1.buildAll(rules);
}
exports.outline = outline;
/**
 * Generates a css string for border of frozen columns.
 * @param {Object} options - options
 * @returns {String}
 */
function frozenBorder(options) {
    return cssRuleBuilder_1.createClassRule('frozen-border')
        .bg(options.border)
        .build();
}
exports.frozenBorder = frozenBorder;
/**
 * Generates a css string for scrollbars.
 * @param {Object} options - options
 * @returns {String}
 */
function scrollbar(options) {
    var border = options.border, emptySpace = options.emptySpace;
    var webkitScrollbarRules = cssRuleBuilder_1.createWebkitScrollbarRules("." + dom_1.cls('container'), options);
    var ieScrollbarRule = cssRuleBuilder_1.createIEScrollbarRule("." + dom_1.cls('container'), options);
    var xInnerBorderRule = cssRuleBuilder_1.createClassRule('border-line-bottom').bg(border);
    var xOuterBorderRule = cssRuleBuilder_1.createClassRule('content-area').border(border);
    var yInnerBorderRule = cssRuleBuilder_1.createClassRule('scrollbar-y-inner-border').bg(border);
    var yOuterBorderRule = cssRuleBuilder_1.createClassRule('scrollbar-y-outer-border').bg(border);
    var spaceRightTopRule = cssRuleBuilder_1.createClassRule('scrollbar-right-top')
        .bg(emptySpace)
        .border(border);
    var spaceRightBottomRule = cssRuleBuilder_1.createClassRule('scrollbar-right-bottom')
        .bg(emptySpace)
        .border(border);
    var spaceLeftBottomRule = cssRuleBuilder_1.createClassRule('scrollbar-left-bottom')
        .bg(emptySpace)
        .border(border);
    var frozenBorderRule = cssRuleBuilder_1.createClassRule('scrollbar-frozen-border')
        .bg(emptySpace)
        .border(border);
    return cssRuleBuilder_1.buildAll(webkitScrollbarRules.concat([
        ieScrollbarRule,
        xInnerBorderRule,
        xOuterBorderRule,
        yInnerBorderRule,
        yOuterBorderRule,
        spaceRightTopRule,
        spaceRightBottomRule,
        spaceLeftBottomRule,
        frozenBorderRule
    ]));
}
exports.scrollbar = scrollbar;
/**
 * Generates a css string for a resize-handle.
 * @param {Object} options - options
 * @returns {String}
 */
function heightResizeHandle(options) {
    return bgBorderRuleString('height-resize-handle', options);
}
exports.heightResizeHandle = heightResizeHandle;
/**
 * Generates a css string for a pagination.
 * @param {Object} options - options
 * @returns {String}
 */
function pagination(options) {
    return bgBorderRuleString('pagination', options);
}
exports.pagination = pagination;
/**
 * Generates a css string for selection layers.
 * @param {Object} options - options
 * @returns {String}
 */
function selection(options) {
    return bgBorderRuleString('layer-selection', options);
}
exports.selection = selection;
/**
 * Generates a css string for head area.
 * @param {Object} options - options
 * @returns {String}
 */
function headArea(options) {
    return cssRuleBuilder_1.createClassRule('header-area')
        .bg(options.background)
        .border(options.border)
        .build();
}
exports.headArea = headArea;
/**
 * Generates a css string for body area.
 * @param {Object} options - options
 * @returns {String}
 */
function bodyArea(options) {
    return cssRuleBuilder_1.createClassRule('body-area')
        .bg(options.background)
        .build();
}
exports.bodyArea = bodyArea;
/**
 * Generates a css string for summary area.
 * @param {Object} options - options
 * @returns {String}
 */
function summaryArea(options) {
    var border = options.border, background = options.background;
    var contentAreaRule = cssRuleBuilder_1.createClassRule('summary-area')
        .bg(background)
        .border(border);
    var bodyAreaRule = cssRuleBuilder_1.createNestedClassRule(' .', ['has-summary-top', 'body-area']).border(border);
    return cssRuleBuilder_1.buildAll([contentAreaRule, bodyAreaRule]);
}
exports.summaryArea = summaryArea;
/**
 * Generates a css string for table cells.
 * @param {Object} options - options
 * @returns {String}
 */
function cell(options) {
    return cssRuleBuilder_1.createClassRule('cell')
        .bg(options.background)
        .border(options.border)
        .borderWidth(options)
        .text(options.text)
        .build();
}
exports.cell = cell;
/*
 * Generates a css string for head cells.
 * @param {Object} options - options
 * @returns {String}
 */
function cellHead(options) {
    var background = options.background, border = options.border, text = options.text;
    var tableRule = cssRuleBuilder_1.createNestedClassRule(' .', [
        'show-lside-area',
        'lside-area',
        'header-area',
        'table'
    ]).verticalBorderStyle(options, 'right');
    var cellRule = cssRuleBuilder_1.createClassRule('cell-header')
        .bg(background)
        .border(border)
        .borderWidth(options)
        .text(text);
    return cssRuleBuilder_1.buildAll([tableRule, cellRule]);
}
exports.cellHead = cellHead;
/*
 * Generates a css string for row's head cells.
 * @param {Object} options - options
 * @returns {String}
 */
function cellRowHead(options) {
    var background = options.background, border = options.border, text = options.text;
    var tableRule = cssRuleBuilder_1.createNestedClassRule(' .', [
        'show-lside-area',
        'lside-area',
        'body-area',
        'table'
    ]).verticalBorderStyle(options, 'right');
    var cellRule = cssRuleBuilder_1.createClassRule('cell-row-header')
        .bg(background)
        .border(border)
        .borderWidth(options)
        .text(text);
    return cssRuleBuilder_1.buildAll([tableRule, cellRule]);
}
exports.cellRowHead = cellRowHead;
/*
 * Generates a css string for summary cells.
 * @param {Object} options - options
 * @returns {String}
 */
function cellSummary(options) {
    var background = options.background, border = options.border, text = options.text;
    var tableRule = cssRuleBuilder_1.createNestedClassRule(' .', [
        'show-lside-area',
        'lside-area',
        'summary-area',
        'table'
    ]).verticalBorderStyle(options, 'right');
    var cellRule = cssRuleBuilder_1.createClassRule('cell-summary')
        .bg(background)
        .border(border)
        .borderWidth(options)
        .text(text);
    return cssRuleBuilder_1.buildAll([tableRule, cellRule]);
}
exports.cellSummary = cellSummary;
/**
 * Generates a css string for the cells in even rows.
 * @param {Object} options - options
 * @returns {String}
 */
function cellEvenRow(options) {
    return cssRuleBuilder_1.create('.tui-grid-row-even>td')
        .bg(options.background)
        .build();
}
exports.cellEvenRow = cellEvenRow;
/**
 * Generates a css string for the cells in odd rows.
 * @param {Object} options - options
 * @returns {String}
 */
function cellOddRow(options) {
    return cssRuleBuilder_1.create('.tui-grid-row-odd>td')
        .bg(options.background)
        .build();
}
exports.cellOddRow = cellOddRow;
/**
 * Generates a css string for selected head cells.
 * @param {Object} options - options
 * @returns {String}
 */
function cellSelectedHead(options) {
    return cssRuleBuilder_1.createNestedClassRule('.', ['cell-header', 'cell-selected'])
        .bg(options.background)
        .text(options.text)
        .build();
}
exports.cellSelectedHead = cellSelectedHead;
/**
 * Generates a css string for selected row head cells.
 * @param {Object} options - options
 * @returns {String}
 */
function cellSelectedRowHead(options) {
    return cssRuleBuilder_1.createNestedClassRule('.', ['cell-row-header', 'cell-selected'])
        .bg(options.background)
        .text(options.text)
        .build();
}
exports.cellSelectedRowHead = cellSelectedRowHead;
/**
 * Generates a css string for focused cell.
 * @param {Object} options - options
 * @returns {String}
 */
function cellFocused(options) {
    var border = options.border;
    var focusLayerRule = cssRuleBuilder_1.createClassRule('layer-focus-border').bg(border);
    var editingLayerRule = cssRuleBuilder_1.createClassRule('layer-editing').border(border);
    return cssRuleBuilder_1.buildAll([focusLayerRule, editingLayerRule]);
}
exports.cellFocused = cellFocused;
/**
 * Generates a css string for focus inactive cell.
 * @param {Object} options - options
 * @returns {String}
 */
function cellFocusedInactive(options) {
    return cssRuleBuilder_1.createNestedClassRule(' .', ['layer-focus-deactive', 'layer-focus-border'])
        .bg(options.border)
        .build();
}
exports.cellFocusedInactive = cellFocusedInactive;
/**
 * Generates a css string for editable cells.
 * @param {Object} options - options
 * @returns {String}
 */
function cellEditable(options) {
    return bgTextRuleString('cell-editable', options);
}
exports.cellEditable = cellEditable;
/**
 * Generates a css string for required cells.
 * @param {Object} options - options
 * @returns {String}
 */
function cellRequired(options) {
    return bgTextRuleString('cell-required', options);
}
exports.cellRequired = cellRequired;
/**
 * Generates a css string for disabled cells.
 * @param {Object} options - options
 * @returns {String}
 */
function cellDisabled(options) {
    return bgTextRuleString('cell-disabled', options);
}
exports.cellDisabled = cellDisabled;
/**
 * Generates a css string for dummy cells.
 * @param {Object} options - options
 * @returns {String}
 */
function cellDummy(options) {
    return bgTextRuleString('cell-dummy', options);
}
exports.cellDummy = cellDummy;
/**
 * Generates a css string for invalid cells.
 * @param {Object} options - options
 * @returns {String}
 */
function cellInvalid(options) {
    return bgTextRuleString('cell-invalid', options);
}
exports.cellInvalid = cellInvalid;
/**
 * Generates a css string for cells in a current row.
 * @param {Object} options - options
 * @returns {String}
 */
function cellCurrentRow(options) {
    return bgTextRuleString('cell-current-row', options);
}
exports.cellCurrentRow = cellCurrentRow;


/***/ }),
/* 74 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var dom_1 = __webpack_require__(3);
var common_1 = __webpack_require__(1);
/**
 * create css rule string and returns it
 * @module {theme/cssBuilder}
 * @param selector - css selector
 * @param property - css property
 * @param  value - css value
 * @ignore
 */
var CSSRuleBuilder = /** @class */ (function () {
    function CSSRuleBuilder(selector) {
        this.selector = '';
        this.propValues = [];
        this.init(selector);
    }
    CSSRuleBuilder.prototype.init = function (selector) {
        if (!(typeof selector === 'string') || !selector) {
            throw new Error('The Selector must be a string and not be empty.');
        }
        this.selector = selector;
        this.propValues = [];
    };
    /**
     * Add a set of css property and value.
     * @param property - css property
     * @param  value - css value
     */
    CSSRuleBuilder.prototype.add = function (property, value) {
        if (value) {
            this.propValues.push(property + ":" + value);
        }
        return this;
    };
    /**
     * Shortcut for add('border-color', value)
     */
    CSSRuleBuilder.prototype.border = function (value) {
        return this.add('border-color', value);
    };
    /**
     * Add a border-width style to the rule.
     * @param options - visible options
     * @param [options.showVerticalBorder] - whether the vertical border is visible
     * @param [options.showHorizontalBorder] - whether the horizontal border is visible
     */
    CSSRuleBuilder.prototype.borderWidth = function (options) {
        var vertical = options.showVerticalBorder;
        var horizontal = options.showHorizontalBorder;
        var value;
        if (common_1.isBoolean(vertical)) {
            value = vertical ? '1px' : '0';
            this.add('border-left-width', value).add('border-right-width', value);
        }
        if (common_1.isBoolean(horizontal)) {
            value = horizontal ? '1px' : '0';
            this.add('border-top-width', value).add('border-bottom-width', value);
        }
        return this;
    };
    /**
     * Add a vertical border style to the rule.
     * @param options - visible options
     * @param [options.showVerticalBorder] - whether the vertical border is visible
     * @param position - Position of the vertical border ('right' or 'left')
     */
    CSSRuleBuilder.prototype.verticalBorderStyle = function (options, position) {
        var vertical = options.showVerticalBorder;
        var value;
        if (common_1.isBoolean(vertical) && position) {
            value = vertical ? 'solid' : 'hidden';
            this.add("border-" + position + "-style", value);
        }
        return this;
    };
    /**
     * Shortcut for add('background-color', value)
     */
    CSSRuleBuilder.prototype.bg = function (value) {
        return this.add('background-color', value);
    };
    /**
     * Shortcut for add('color', value)
     */
    CSSRuleBuilder.prototype.text = function (value) {
        return this.add('color', value);
    };
    /**
     * Create a CSS rule string with a selector and prop-values.
     */
    CSSRuleBuilder.prototype.build = function () {
        var result = '';
        if (this.propValues.length) {
            result = this.selector + "{" + this.propValues.join(';') + "}";
        }
        return result;
    };
    return CSSRuleBuilder;
}());
/**
 * Creates new Builder instance.
 */
function create(selector) {
    return new CSSRuleBuilder(selector);
}
exports.create = create;
/**
 * Creates a new Builder instance with a class name selector.
 */
function createClassRule(className) {
    return create("." + dom_1.cls(className));
}
exports.createClassRule = createClassRule;
/**
 * Creates a new Builder instance with a nested class name.
 * @param selector - selector to compose class names
 * @param classNames - classNames
 */
function createNestedClassRule(selector, classNames) {
    return create("." + classNames.map(function (className) { return dom_1.cls(className); }).join(selector));
}
exports.createNestedClassRule = createNestedClassRule;
/**
 * Creates an array of new Builder instances for the -webkit-scrollbar styles.
 */
function createWebkitScrollbarRules(selector, options) {
    return [
        create(selector + " ::-webkit-scrollbar").bg(options.background),
        create(selector + " ::-webkit-scrollbar-thumb").bg(options.thumb),
        create(selector + " ::-webkit-scrollbar-thumb:hover").bg(options.active)
    ];
}
exports.createWebkitScrollbarRules = createWebkitScrollbarRules;
/**
 * Creates a builder instance for the IE scrollbar styles.
 */
function createIEScrollbarRule(selector, options) {
    var bgProps = [
        'scrollbar-3dlight-color',
        'scrollbar-darkshadow-color',
        'scrollbar-track-color',
        'scrollbar-shadow-color'
    ];
    var thumbProps = ['scrollbar-face-color', 'scrollbar-highlight-color'];
    var ieScrollbarRule = create(selector);
    bgProps.forEach(function (prop) {
        ieScrollbarRule.add(prop, options.background);
    });
    thumbProps.forEach(function (prop) {
        ieScrollbarRule.add(prop, options.thumb);
    });
    ieScrollbarRule.add('scrollbar-arrow-color', options.active);
    return ieScrollbarRule;
}
exports.createIEScrollbarRule = createIEScrollbarRule;
/**
 * Build all rules and returns the concatenated string.
 */
function buildAll(rules) {
    return rules
        .map(function (rule) {
        return rule.build();
    })
        .join('');
}
exports.buildAll = buildAll;


/***/ }),
/* 75 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = __webpack_require__(0);
var messages = {
    en: {
        display: {
            noData: 'No data.',
            loadingData: 'Loading data.',
            resizeHandleGuide: 'You can change the width of the column by mouse drag, and initialize the width by double-clicking.'
        },
        net: {
            confirmCreate: 'Are you sure you want to create {{count}} data?',
            confirmUpdate: 'Are you sure you want to update {{count}} data?',
            confirmDelete: 'Are you sure you want to delete {{count}} data?',
            confirmModify: 'Are you sure you want to modify {{count}} data?',
            noDataToCreate: 'No data to create.',
            noDataToUpdate: 'No data to update.',
            noDataToDelete: 'No data to delete.',
            noDataToModify: 'No data to modify.',
            failResponse: 'An error occurred while requesting data.\nPlease try again.'
        }
    },
    ko: {
        display: {
            noData: '데이터가 존재하지 않습니다.',
            loadingData: '데이터를 불러오는 중입니다.',
            resizeHandleGuide: '마우스 드래그하여 컬럼 너비를 조정할 수 있고, 더블 클릭으로 컬럼 너비를 초기화할 수 있습니다.'
        },
        net: {
            confirmCreate: '{{count}}건의 데이터를 생성하겠습니까?',
            confirmUpdate: '{{count}}건의 데이터를 수정하겠습니까?',
            confirmDelete: '{{count}}건의 데이터를 삭제하겠습니까?',
            confirmModify: '{{count}}건의 데이터를 처리하겠습니까?',
            noDataToCreate: '생성할 데이터가 없습니다.',
            noDataToUpdate: '수정할 데이터가 없습니다.',
            noDataToDelete: '삭제할 데이터가 없습니다.',
            noDataToModify: '처리할 데이터가 없습니다.',
            failResponse: '데이터 요청 중에 에러가 발생하였습니다.\n다시 시도하여 주시기 바랍니다.'
        }
    }
};
var messageMap = {};
/**
 * Flatten message map
 * @param {object} data - Messages
 * @returns {object} Flatten message object (key format is 'key.subKey')
 * @ignore
 */
function flattenMessageMap(data) {
    if (data === void 0) { data = {}; }
    var obj = {};
    var newKey;
    Object.keys(data).forEach(function (key) {
        var keyWithType = key;
        var groupMessages = data[keyWithType];
        Object.keys(groupMessages).forEach(function (subKey) {
            newKey = key + "." + subKey;
            obj[newKey] = groupMessages[subKey];
        });
    });
    return obj;
}
/**
 * Replace text
 * @param {string} text - Text including handlebar expression
 * @param {Object} values - Replaced values
 * @returns {string} Replaced text
 */
function replaceText(text, values) {
    return text.replace(/\{\{(\w*)\}\}/g, function (value, prop) {
        return values.hasOwnProperty(prop) ? values[prop] : '';
    });
}
exports.default = {
    /**
     * Set messages
     * @param {string} localeCode - Code to set locale messages and
     *     this is the language or language-region combination. (ex: en-US)
     * @param {object} [data] - Messages using in Grid
     */
    setLanguage: function (localeCode, data) {
        var localeMessages = messages[localeCode];
        if (!localeMessages && !data) {
            throw new Error('You should set messages to map the locale code.');
        }
        var newData = flattenMessageMap(data);
        if (localeMessages) {
            var originData = flattenMessageMap(localeMessages);
            messageMap = tslib_1.__assign({}, originData, newData);
        }
        else {
            messageMap = newData;
        }
    },
    /**
     * Get message
     * @param {string} key - Key to find message (ex: 'net.confirmCreate')
     * @param {object} [replacements] - Values to replace string
     * @returns {string} Message
     */
    get: function (key, replacements) {
        if (replacements === void 0) { replacements = {}; }
        var message = messageMap[key];
        return replaceText(message, replacements);
    }
};


/***/ }),
/* 76 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function getInvalidRows(_a) {
    var data = _a.data, column = _a.column;
    var invalidRows = [];
    data.viewData.forEach(function (_a) {
        var rowKey = _a.rowKey, valueMap = _a.valueMap;
        var invalidColumns = column.validationColumns.filter(function (_a) {
            var name = _a.name;
            return !!valueMap[name].invalidState;
        });
        if (invalidColumns.length) {
            var errors = invalidColumns.map(function (_a) {
                var name = _a.name;
                return ({
                    columnName: name,
                    errorCode: valueMap[name].invalidState
                });
            });
            invalidRows.push({ rowKey: rowKey, errors: errors });
        }
    });
    return invalidRows;
}
exports.getInvalidRows = getInvalidRows;


/***/ }),
/* 77 */
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin

/***/ })
/******/ ]);
});