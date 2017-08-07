(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * array-foreach
 *   Array#forEach ponyfill for older browsers
 *   (Ponyfill: A polyfill that doesn't overwrite the native method)
 * 
 * https://github.com/twada/array-foreach
 *
 * Copyright (c) 2015-2016 Takuto Wada
 * Licensed under the MIT license.
 *   https://github.com/twada/array-foreach/blob/master/MIT-LICENSE
 */
'use strict';

module.exports = function forEach (ary, callback, thisArg) {
    if (ary.forEach) {
        ary.forEach(callback, thisArg);
        return;
    }
    for (var i = 0; i < ary.length; i+=1) {
        callback.call(thisArg, ary[i], i, ary);
    }
};

},{}],2:[function(require,module,exports){
module.exports = (typeof Array.from === 'function' ?
  Array.from :
  require('./polyfill')
);

},{"./polyfill":3}],3:[function(require,module,exports){
// Production steps of ECMA-262, Edition 6, 22.1.2.1
// Reference: http://www.ecma-international.org/ecma-262/6.0/#sec-array.from
module.exports = (function() {
  var isCallable = function(fn) {
    return typeof fn === 'function';
  };
  var toInteger = function (value) {
    var number = Number(value);
    if (isNaN(number)) { return 0; }
    if (number === 0 || !isFinite(number)) { return number; }
    return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
  };
  var maxSafeInteger = Math.pow(2, 53) - 1;
  var toLength = function (value) {
    var len = toInteger(value);
    return Math.min(Math.max(len, 0), maxSafeInteger);
  };
  var iteratorProp = function(value) {
    if(value != null) {
      if(['string','number','boolean','symbol'].indexOf(typeof value) > -1){
        return Symbol.iterator;
      } else if (
        (typeof Symbol !== 'undefined') &&
        ('iterator' in Symbol) &&
        (Symbol.iterator in value)
      ) {
        return Symbol.iterator;
      }
      // Support "@@iterator" placeholder, Gecko 27 to Gecko 35
      else if ('@@iterator' in value) {
        return '@@iterator';
      }
    }
  };
  var getMethod = function(O, P) {
    // Assert: IsPropertyKey(P) is true.
    if (O != null && P != null) {
      // Let func be GetV(O, P).
      var func = O[P];
      // ReturnIfAbrupt(func).
      // If func is either undefined or null, return undefined.
      if(func == null) {
        return void 0;
      }
      // If IsCallable(func) is false, throw a TypeError exception.
      if (!isCallable(func)) {
        throw new TypeError(func + ' is not a function');
      }
      return func;
    }
  };
  var iteratorStep = function(iterator) {
    // Let result be IteratorNext(iterator).
    // ReturnIfAbrupt(result).
    var result = iterator.next();
    // Let done be IteratorComplete(result).
    // ReturnIfAbrupt(done).
    var done = Boolean(result.done);
    // If done is true, return false.
    if(done) {
      return false;
    }
    // Return result.
    return result;
  };

  // The length property of the from method is 1.
  return function from(items /*, mapFn, thisArg */ ) {
    'use strict';

    // 1. Let C be the this value.
    var C = this;

    // 2. If mapfn is undefined, let mapping be false.
    var mapFn = arguments.length > 1 ? arguments[1] : void 0;

    var T;
    if (typeof mapFn !== 'undefined') {
      // 3. else
      //   a. If IsCallable(mapfn) is false, throw a TypeError exception.
      if (!isCallable(mapFn)) {
        throw new TypeError(
          'Array.from: when provided, the second argument must be a function'
        );
      }

      //   b. If thisArg was supplied, let T be thisArg; else let T
      //      be undefined.
      if (arguments.length > 2) {
        T = arguments[2];
      }
      //   c. Let mapping be true (implied by mapFn)
    }

    var A, k;

    // 4. Let usingIterator be GetMethod(items, @@iterator).
    // 5. ReturnIfAbrupt(usingIterator).
    var usingIterator = getMethod(items, iteratorProp(items));

    // 6. If usingIterator is not undefined, then
    if (usingIterator !== void 0) {
      // a. If IsConstructor(C) is true, then
      //   i. Let A be the result of calling the [[Construct]]
      //      internal method of C with an empty argument list.
      // b. Else,
      //   i. Let A be the result of the abstract operation ArrayCreate
      //      with argument 0.
      // c. ReturnIfAbrupt(A).
      A = isCallable(C) ? Object(new C()) : [];

      // d. Let iterator be GetIterator(items, usingIterator).
      var iterator = usingIterator.call(items);

      // e. ReturnIfAbrupt(iterator).
      if (iterator == null) {
        throw new TypeError(
          'Array.from requires an array-like or iterable object'
        );
      }

      // f. Let k be 0.
      k = 0;

      // g. Repeat
      var next, nextValue;
      while (true) {
        // i. Let Pk be ToString(k).
        // ii. Let next be IteratorStep(iterator).
        // iii. ReturnIfAbrupt(next).
        next = iteratorStep(iterator);

        // iv. If next is false, then
        if (!next) {

          // 1. Let setStatus be Set(A, "length", k, true).
          // 2. ReturnIfAbrupt(setStatus).
          A.length = k;

          // 3. Return A.
          return A;
        }
        // v. Let nextValue be IteratorValue(next).
        // vi. ReturnIfAbrupt(nextValue)
        nextValue = next.value;

        // vii. If mapping is true, then
        //   1. Let mappedValue be Call(mapfn, T, «nextValue, k»).
        //   2. If mappedValue is an abrupt completion, return
        //      IteratorClose(iterator, mappedValue).
        //   3. Let mappedValue be mappedValue.[[value]].
        // viii. Else, let mappedValue be nextValue.
        // ix.  Let defineStatus be the result of
        //      CreateDataPropertyOrThrow(A, Pk, mappedValue).
        // x. [TODO] If defineStatus is an abrupt completion, return
        //    IteratorClose(iterator, defineStatus).
        if (mapFn) {
          A[k] = mapFn.call(T, nextValue, k);
        }
        else {
          A[k] = nextValue;
        }
        // xi. Increase k by 1.
        k++;
      }
      // 7. Assert: items is not an Iterable so assume it is
      //    an array-like object.
    } else {

      // 8. Let arrayLike be ToObject(items).
      var arrayLike = Object(items);

      // 9. ReturnIfAbrupt(items).
      if (items == null) {
        throw new TypeError(
          'Array.from requires an array-like object - not null or undefined'
        );
      }

      // 10. Let len be ToLength(Get(arrayLike, "length")).
      // 11. ReturnIfAbrupt(len).
      var len = toLength(arrayLike.length);

      // 12. If IsConstructor(C) is true, then
      //     a. Let A be Construct(C, «len»).
      // 13. Else
      //     a. Let A be ArrayCreate(len).
      // 14. ReturnIfAbrupt(A).
      A = isCallable(C) ? Object(new C(len)) : new Array(len);

      // 15. Let k be 0.
      k = 0;
      // 16. Repeat, while k < len… (also steps a - h)
      var kValue;
      while (k < len) {
        kValue = arrayLike[k];
        if (mapFn) {
          A[k] = mapFn.call(T, kValue, k);
        }
        else {
          A[k] = kValue;
        }
        k++;
      }
      // 17. Let setStatus be Set(A, "length", len, true).
      // 18. ReturnIfAbrupt(setStatus).
      A.length = len;
      // 19. Return A.
    }
    return A;
  };
})();

},{}],4:[function(require,module,exports){
/*!
 * @copyright Copyright (c) 2016 IcoMoon.io
 * @license   Licensed under MIT license
 *            See https://github.com/Keyamoon/svgxuse
 * @version   1.1.23
 */
/*jslint browser: true */
/*global XDomainRequest, MutationObserver, window */
(function () {
    'use strict';
    if (window && window.addEventListener) {
        var cache = Object.create(null); // holds xhr objects to prevent multiple requests
        var checkUseElems;
        var tid; // timeout id
        var debouncedCheck = function () {
            clearTimeout(tid);
            tid = setTimeout(checkUseElems, 100);
        };
        var unobserveChanges = function () {
            return;
        };
        var observeChanges = function () {
            var observer;
            window.addEventListener('resize', debouncedCheck, false);
            window.addEventListener('orientationchange', debouncedCheck, false);
            if (window.MutationObserver) {
                observer = new MutationObserver(debouncedCheck);
                observer.observe(document.documentElement, {
                    childList: true,
                    subtree: true,
                    attributes: true
                });
                unobserveChanges = function () {
                    try {
                        observer.disconnect();
                        window.removeEventListener('resize', debouncedCheck, false);
                        window.removeEventListener('orientationchange', debouncedCheck, false);
                    } catch (ignore) {}
                };
            } else {
                document.documentElement.addEventListener('DOMSubtreeModified', debouncedCheck, false);
                unobserveChanges = function () {
                    document.documentElement.removeEventListener('DOMSubtreeModified', debouncedCheck, false);
                    window.removeEventListener('resize', debouncedCheck, false);
                    window.removeEventListener('orientationchange', debouncedCheck, false);
                };
            }
        };
        var createRequest = function (url) {
            // In IE 9, cross origin requests can only be sent using XDomainRequest.
            // XDomainRequest would fail if CORS headers are not set.
            // Therefore, XDomainRequest should only be used with cross origin requests.
            function getOrigin(loc) {
                var a;
                if (loc.protocol !== undefined) {
                    a = loc;
                } else {
                    a = document.createElement('a');
                    a.href = loc;
                }
                return a.protocol.replace(/:/g, '') + a.host;
            }
            var Request;
            var origin;
            var origin2;
            if (window.XMLHttpRequest) {
                Request = new XMLHttpRequest();
                origin = getOrigin(location);
                origin2 = getOrigin(url);
                if (Request.withCredentials === undefined && origin2 !== '' && origin2 !== origin) {
                    Request = XDomainRequest || undefined;
                } else {
                    Request = XMLHttpRequest;
                }
            }
            return Request;
        };
        var xlinkNS = 'http://www.w3.org/1999/xlink';
        checkUseElems = function () {
            var base;
            var bcr;
            var fallback = ''; // optional fallback URL in case no base path to SVG file was given and no symbol definition was found.
            var hash;
            var href;
            var i;
            var inProgressCount = 0;
            var isHidden;
            var Request;
            var url;
            var uses;
            var xhr;
            function observeIfDone() {
                // If done with making changes, start watching for chagnes in DOM again
                inProgressCount -= 1;
                if (inProgressCount === 0) { // if all xhrs were resolved
                    unobserveChanges(); // make sure to remove old handlers
                    observeChanges(); // watch for changes to DOM
                }
            }
            function attrUpdateFunc(spec) {
                return function () {
                    if (cache[spec.base] !== true) {
                        spec.useEl.setAttributeNS(xlinkNS, 'xlink:href', '#' + spec.hash);
                    }
                };
            }
            function onloadFunc(xhr) {
                return function () {
                    var body = document.body;
                    var x = document.createElement('x');
                    var svg;
                    xhr.onload = null;
                    x.innerHTML = xhr.responseText;
                    svg = x.getElementsByTagName('svg')[0];
                    if (svg) {
                        svg.setAttribute('aria-hidden', 'true');
                        svg.style.position = 'absolute';
                        svg.style.width = 0;
                        svg.style.height = 0;
                        svg.style.overflow = 'hidden';
                        body.insertBefore(svg, body.firstChild);
                    }
                    observeIfDone();
                };
            }
            function onErrorTimeout(xhr) {
                return function () {
                    xhr.onerror = null;
                    xhr.ontimeout = null;
                    observeIfDone();
                };
            }
            unobserveChanges(); // stop watching for changes to DOM
            // find all use elements
            uses = document.getElementsByTagName('use');
            for (i = 0; i < uses.length; i += 1) {
                try {
                    bcr = uses[i].getBoundingClientRect();
                } catch (ignore) {
                    // failed to get bounding rectangle of the use element
                    bcr = false;
                }
                href = uses[i].getAttributeNS(xlinkNS, 'href');
                if (href && href.split) {
                    url = href.split('#');
                } else {
                    url = ["", ""];
                }
                base = url[0];
                hash = url[1];
                isHidden = bcr && bcr.left === 0 && bcr.right === 0 && bcr.top === 0 && bcr.bottom === 0;
                if (bcr && bcr.width === 0 && bcr.height === 0 && !isHidden) {
                    // the use element is empty
                    // if there is a reference to an external SVG, try to fetch it
                    // use the optional fallback URL if there is no reference to an external SVG
                    if (fallback && !base.length && hash && !document.getElementById(hash)) {
                        base = fallback;
                    }
                    if (base.length) {
                        // schedule updating xlink:href
                        xhr = cache[base];
                        if (xhr !== true) {
                            // true signifies that prepending the SVG was not required
                            setTimeout(attrUpdateFunc({
                                useEl: uses[i],
                                base: base,
                                hash: hash
                            }), 0);
                        }
                        if (xhr === undefined) {
                            Request = createRequest(base);
                            if (Request !== undefined) {
                                xhr = new Request();
                                cache[base] = xhr;
                                xhr.onload = onloadFunc(xhr);
                                xhr.onerror = onErrorTimeout(xhr);
                                xhr.ontimeout = onErrorTimeout(xhr);
                                xhr.open('GET', base);
                                xhr.send();
                                inProgressCount += 1;
                            }
                        }
                    }
                } else {
                    if (!isHidden) {
                        if (cache[base] === undefined) {
                            // remember this URL if the use element was not empty and no request was sent
                            cache[base] = true;
                        } else if (cache[base].onload) {
                            // if it turns out that prepending the SVG is not necessary,
                            // abort the in-progress xhr.
                            cache[base].abort();
                            delete cache[base].onload;
                            cache[base] = true;
                        }
                    } else if (base.length && cache[base]) {
                        attrUpdateFunc({
                            useEl: uses[i],
                            base: base,
                            hash: hash
                        })();
                    }
                }
            }
            uses = '';
            inProgressCount += 1;
            observeIfDone();
        };
        // The load event fires when all resources have finished loading, which allows detecting whether SVG use elements are empty.
        window.addEventListener('load', function winLoad() {
            window.removeEventListener('load', winLoad, false); // to prevent memory leaks
            tid = setTimeout(checkUseElems, 0);
        }, false);
    }
}());

},{}],5:[function(require,module,exports){
'use strict';

// POLYFILLS
if (!Array.forEach) Array.forEach = require('array-foreach');
NodeList.prototype.forEach = Array.prototype.forEach;
HTMLCollection.prototype.forEach = Array.prototype.forEach; // Because of https://bugzilla.mozilla.org/show_bug.cgi?id=14869
if (!Array.from) Array.from = require('array-from');

// REQUIRE MODULES
require('./media.js');
require('./wells.js');
require('./mast.js');
require('svgxuse');

},{"./mast.js":6,"./media.js":7,"./wells.js":8,"array-foreach":1,"array-from":2,"svgxuse":4}],6:[function(require,module,exports){
'use strict';

document.querySelectorAll('.o-mast__search').forEach(function (s) {
  var search = s;
  var link = search.querySelector('label.o-mast__search-link');
  if (!link) {
    return;
  };
  var linkStateCheckboxId = link.getAttribute('for');
  if (!linkStateCheckboxId) {
    return;
  };
  var linkStateCheckbox = document.querySelector('#' + linkStateCheckboxId);
  if (!linkStateCheckbox) {
    return;
  };
  var searchField = link.parentElement.querySelector('input');

  link.addEventListener('click', function (e) {
    if (linkStateCheckbox.checked) {
      link.parentElement.submit();
    } else {
      setTimeout(function () {
        // Safari needs this timeout for whatever reason...
        searchField.focus();
      }, 0);
    }
  }, false);

  function uncheck() {
    setTimeout(function () {
      linkStateCheckbox.checked = false;
    }, 200);
  }

  searchField.addEventListener('blur', uncheck, true);
});

document.querySelectorAll('.o-mast__nav-link').forEach(function (l) {
  l.addEventListener('click', function (e) {
    // e.preventDefault();
    // return false;
    // ^^ uncomment above when implementing
    // sliding submenus
  });
  // l.children.forEach(function(c){
  //   c.addEventListener('click', function(e){
  //     e.preventDefault();
  //     return false;
  //   });

  // })
});

},{}],7:[function(require,module,exports){
"use strict";

// Collect large headlines that might need resizing.
var headlines = document.getElementsByClassName("media__headline--h1");

function checkLengthAndResize(headline, index) {

  // Look inside the headline's hyperlink to get the text
  // character count.
  var charCount = headline.getElementsByTagName("a")[0].textContent.length;

  // If this is a headline likely to wrap to three lines,
  // let's add a class to typeset it smaller.
  if (charCount > 60) {
    headline.classList.add("media__headline--h1-verbose");
  }
}

// Iterate through large headlines and resize where appropriate.
Array.from(headlines).forEach(checkLengthAndResize);

},{}],8:[function(require,module,exports){
"use strict";

// Wells JS
var s,
    wells = {

  settings: {
    well: document.getElementsByClassName("js-well"),
    wellDismissBtn: document.getElementsByClassName("js-well--dismiss-btn")
  },

  init: function init() {
    s = this.settings;
    this.bindUIActions();
    this.onLoadActions();
  },

  forEach: function forEach(array, callback, scope) {
    for (var i = 0; i < array.length; i++) {
      callback.call(scope, i, array[i]); // passes back stuff we need
    }
  },

  bindUIActions: function bindUIActions() {
    wells.forEach(s.wellDismissBtn, function (index, element) {
      element.addEventListener("click", function (event) {
        wells.dismissWell(element);
        event.preventDefault();
      }, false);
    });
  },

  onLoadActions: function onLoadActions() {
    wells.forEach(s.well, function (index, element) {
      // check cookies and hide wells where viewsLeft === 0
      var cookieName = element.getAttribute("data-name");
      var cookieValue = element.getAttribute("data-views");

      wells.createOrUpdateCookie(cookieName, cookieValue, element);
    });
  },

  getCookie: function getCookie(name) {
    var keyValue = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
    return keyValue ? keyValue[2] : null;
  },

  setCookie: function setCookie(name, viewsLeft) {
    var expires = new Date();

    expires.setTime(expires.getTime() + 31536000000); // 1 year
    document.cookie = name + "=" + viewsLeft + "; expires=" + expires.toUTCString();
  },

  createOrUpdateCookie: function createOrUpdateCookie(name, viewsLeft, element) {
    var cookie = wells.getCookie(name);
    var cookieValue = parseInt(cookie, 10);

    if (cookie === null) {
      wells.setCookie(name, viewsLeft);
    } else if (cookieValue > 0) {
      // Read cookie and update if it needs to be decremented
      viewsLeft = cookieValue - 1;
      wells.setCookie(name, viewsLeft);
    } else if (cookieValue === 0) {
      wells.dismissWell(element);
    }
  },

  dismissWell: function dismissWell(element) {
    if (element.classList.contains("js-well")) {
      var wellElement = element;
    } else {
      wellElement = element.parentNode;
    }
    var name = wellElement.getAttribute("data-name");

    wellElement.classList.add("js--hidden");
    wells.setCookie(name, 0);
  }

};

(function () {
  if (document.getElementsByClassName("js-well").length) {
    wells.init();
  }
})();

},{}]},{},[5])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYXJyYXktZm9yZWFjaC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9hcnJheS1mcm9tL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2FycmF5LWZyb20vcG9seWZpbGwuanMiLCJub2RlX21vZHVsZXMvc3ZneHVzZS9zdmd4dXNlLmpzIiwic3JjL3NjcmlwdHMvaW5kZXguanMiLCJzcmMvc2NyaXB0cy9tYXN0LmpzIiwic3JjL3NjcmlwdHMvbWVkaWEuanMiLCJzcmMvc2NyaXB0cy93ZWxscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUN2TkE7QUFDQSxJQUFJLENBQUMsTUFBTSxPQUFYLEVBQW9CLE1BQU0sT0FBTixHQUFnQixRQUFRLGVBQVIsQ0FBaEI7QUFDcEIsU0FB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bnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcbiAqIGFycmF5LWZvcmVhY2hcbiAqICAgQXJyYXkjZm9yRWFjaCBwb255ZmlsbCBmb3Igb2xkZXIgYnJvd3NlcnNcbiAqICAgKFBvbnlmaWxsOiBBIHBvbHlmaWxsIHRoYXQgZG9lc24ndCBvdmVyd3JpdGUgdGhlIG5hdGl2ZSBtZXRob2QpXG4gKiBcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS90d2FkYS9hcnJheS1mb3JlYWNoXG4gKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LTIwMTYgVGFrdXRvIFdhZGFcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZS5cbiAqICAgaHR0cHM6Ly9naXRodWIuY29tL3R3YWRhL2FycmF5LWZvcmVhY2gvYmxvYi9tYXN0ZXIvTUlULUxJQ0VOU0VcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGZvckVhY2ggKGFyeSwgY2FsbGJhY2ssIHRoaXNBcmcpIHtcbiAgICBpZiAoYXJ5LmZvckVhY2gpIHtcbiAgICAgICAgYXJ5LmZvckVhY2goY2FsbGJhY2ssIHRoaXNBcmcpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJ5Lmxlbmd0aDsgaSs9MSkge1xuICAgICAgICBjYWxsYmFjay5jYWxsKHRoaXNBcmcsIGFyeVtpXSwgaSwgYXJ5KTtcbiAgICB9XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSAodHlwZW9mIEFycmF5LmZyb20gPT09ICdmdW5jdGlvbicgP1xuICBBcnJheS5mcm9tIDpcbiAgcmVxdWlyZSgnLi9wb2x5ZmlsbCcpXG4pO1xuIiwiLy8gUHJvZHVjdGlvbiBzdGVwcyBvZiBFQ01BLTI2MiwgRWRpdGlvbiA2LCAyMi4xLjIuMVxuLy8gUmVmZXJlbmNlOiBodHRwOi8vd3d3LmVjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNi4wLyNzZWMtYXJyYXkuZnJvbVxubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oKSB7XG4gIHZhciBpc0NhbGxhYmxlID0gZnVuY3Rpb24oZm4pIHtcbiAgICByZXR1cm4gdHlwZW9mIGZuID09PSAnZnVuY3Rpb24nO1xuICB9O1xuICB2YXIgdG9JbnRlZ2VyID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgdmFyIG51bWJlciA9IE51bWJlcih2YWx1ZSk7XG4gICAgaWYgKGlzTmFOKG51bWJlcikpIHsgcmV0dXJuIDA7IH1cbiAgICBpZiAobnVtYmVyID09PSAwIHx8ICFpc0Zpbml0ZShudW1iZXIpKSB7IHJldHVybiBudW1iZXI7IH1cbiAgICByZXR1cm4gKG51bWJlciA+IDAgPyAxIDogLTEpICogTWF0aC5mbG9vcihNYXRoLmFicyhudW1iZXIpKTtcbiAgfTtcbiAgdmFyIG1heFNhZmVJbnRlZ2VyID0gTWF0aC5wb3coMiwgNTMpIC0gMTtcbiAgdmFyIHRvTGVuZ3RoID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgdmFyIGxlbiA9IHRvSW50ZWdlcih2YWx1ZSk7XG4gICAgcmV0dXJuIE1hdGgubWluKE1hdGgubWF4KGxlbiwgMCksIG1heFNhZmVJbnRlZ2VyKTtcbiAgfTtcbiAgdmFyIGl0ZXJhdG9yUHJvcCA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgaWYodmFsdWUgIT0gbnVsbCkge1xuICAgICAgaWYoWydzdHJpbmcnLCdudW1iZXInLCdib29sZWFuJywnc3ltYm9sJ10uaW5kZXhPZih0eXBlb2YgdmFsdWUpID4gLTEpe1xuICAgICAgICByZXR1cm4gU3ltYm9sLml0ZXJhdG9yO1xuICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnKSAmJlxuICAgICAgICAoJ2l0ZXJhdG9yJyBpbiBTeW1ib2wpICYmXG4gICAgICAgIChTeW1ib2wuaXRlcmF0b3IgaW4gdmFsdWUpXG4gICAgICApIHtcbiAgICAgICAgcmV0dXJuIFN5bWJvbC5pdGVyYXRvcjtcbiAgICAgIH1cbiAgICAgIC8vIFN1cHBvcnQgXCJAQGl0ZXJhdG9yXCIgcGxhY2Vob2xkZXIsIEdlY2tvIDI3IHRvIEdlY2tvIDM1XG4gICAgICBlbHNlIGlmICgnQEBpdGVyYXRvcicgaW4gdmFsdWUpIHtcbiAgICAgICAgcmV0dXJuICdAQGl0ZXJhdG9yJztcbiAgICAgIH1cbiAgICB9XG4gIH07XG4gIHZhciBnZXRNZXRob2QgPSBmdW5jdGlvbihPLCBQKSB7XG4gICAgLy8gQXNzZXJ0OiBJc1Byb3BlcnR5S2V5KFApIGlzIHRydWUuXG4gICAgaWYgKE8gIT0gbnVsbCAmJiBQICE9IG51bGwpIHtcbiAgICAgIC8vIExldCBmdW5jIGJlIEdldFYoTywgUCkuXG4gICAgICB2YXIgZnVuYyA9IE9bUF07XG4gICAgICAvLyBSZXR1cm5JZkFicnVwdChmdW5jKS5cbiAgICAgIC8vIElmIGZ1bmMgaXMgZWl0aGVyIHVuZGVmaW5lZCBvciBudWxsLCByZXR1cm4gdW5kZWZpbmVkLlxuICAgICAgaWYoZnVuYyA9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiB2b2lkIDA7XG4gICAgICB9XG4gICAgICAvLyBJZiBJc0NhbGxhYmxlKGZ1bmMpIGlzIGZhbHNlLCB0aHJvdyBhIFR5cGVFcnJvciBleGNlcHRpb24uXG4gICAgICBpZiAoIWlzQ2FsbGFibGUoZnVuYykpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihmdW5jICsgJyBpcyBub3QgYSBmdW5jdGlvbicpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZ1bmM7XG4gICAgfVxuICB9O1xuICB2YXIgaXRlcmF0b3JTdGVwID0gZnVuY3Rpb24oaXRlcmF0b3IpIHtcbiAgICAvLyBMZXQgcmVzdWx0IGJlIEl0ZXJhdG9yTmV4dChpdGVyYXRvcikuXG4gICAgLy8gUmV0dXJuSWZBYnJ1cHQocmVzdWx0KS5cbiAgICB2YXIgcmVzdWx0ID0gaXRlcmF0b3IubmV4dCgpO1xuICAgIC8vIExldCBkb25lIGJlIEl0ZXJhdG9yQ29tcGxldGUocmVzdWx0KS5cbiAgICAvLyBSZXR1cm5JZkFicnVwdChkb25lKS5cbiAgICB2YXIgZG9uZSA9IEJvb2xlYW4ocmVzdWx0LmRvbmUpO1xuICAgIC8vIElmIGRvbmUgaXMgdHJ1ZSwgcmV0dXJuIGZhbHNlLlxuICAgIGlmKGRvbmUpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgLy8gUmV0dXJuIHJlc3VsdC5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIC8vIFRoZSBsZW5ndGggcHJvcGVydHkgb2YgdGhlIGZyb20gbWV0aG9kIGlzIDEuXG4gIHJldHVybiBmdW5jdGlvbiBmcm9tKGl0ZW1zIC8qLCBtYXBGbiwgdGhpc0FyZyAqLyApIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICAvLyAxLiBMZXQgQyBiZSB0aGUgdGhpcyB2YWx1ZS5cbiAgICB2YXIgQyA9IHRoaXM7XG5cbiAgICAvLyAyLiBJZiBtYXBmbiBpcyB1bmRlZmluZWQsIGxldCBtYXBwaW5nIGJlIGZhbHNlLlxuICAgIHZhciBtYXBGbiA9IGFyZ3VtZW50cy5sZW5ndGggPiAxID8gYXJndW1lbnRzWzFdIDogdm9pZCAwO1xuXG4gICAgdmFyIFQ7XG4gICAgaWYgKHR5cGVvZiBtYXBGbiAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIC8vIDMuIGVsc2VcbiAgICAgIC8vICAgYS4gSWYgSXNDYWxsYWJsZShtYXBmbikgaXMgZmFsc2UsIHRocm93IGEgVHlwZUVycm9yIGV4Y2VwdGlvbi5cbiAgICAgIGlmICghaXNDYWxsYWJsZShtYXBGbikpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICAgICAnQXJyYXkuZnJvbTogd2hlbiBwcm92aWRlZCwgdGhlIHNlY29uZCBhcmd1bWVudCBtdXN0IGJlIGEgZnVuY3Rpb24nXG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIC8vICAgYi4gSWYgdGhpc0FyZyB3YXMgc3VwcGxpZWQsIGxldCBUIGJlIHRoaXNBcmc7IGVsc2UgbGV0IFRcbiAgICAgIC8vICAgICAgYmUgdW5kZWZpbmVkLlxuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAyKSB7XG4gICAgICAgIFQgPSBhcmd1bWVudHNbMl07XG4gICAgICB9XG4gICAgICAvLyAgIGMuIExldCBtYXBwaW5nIGJlIHRydWUgKGltcGxpZWQgYnkgbWFwRm4pXG4gICAgfVxuXG4gICAgdmFyIEEsIGs7XG5cbiAgICAvLyA0LiBMZXQgdXNpbmdJdGVyYXRvciBiZSBHZXRNZXRob2QoaXRlbXMsIEBAaXRlcmF0b3IpLlxuICAgIC8vIDUuIFJldHVybklmQWJydXB0KHVzaW5nSXRlcmF0b3IpLlxuICAgIHZhciB1c2luZ0l0ZXJhdG9yID0gZ2V0TWV0aG9kKGl0ZW1zLCBpdGVyYXRvclByb3AoaXRlbXMpKTtcblxuICAgIC8vIDYuIElmIHVzaW5nSXRlcmF0b3IgaXMgbm90IHVuZGVmaW5lZCwgdGhlblxuICAgIGlmICh1c2luZ0l0ZXJhdG9yICE9PSB2b2lkIDApIHtcbiAgICAgIC8vIGEuIElmIElzQ29uc3RydWN0b3IoQykgaXMgdHJ1ZSwgdGhlblxuICAgICAgLy8gICBpLiBMZXQgQSBiZSB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIFtbQ29uc3RydWN0XV1cbiAgICAgIC8vICAgICAgaW50ZXJuYWwgbWV0aG9kIG9mIEMgd2l0aCBhbiBlbXB0eSBhcmd1bWVudCBsaXN0LlxuICAgICAgLy8gYi4gRWxzZSxcbiAgICAgIC8vICAgaS4gTGV0IEEgYmUgdGhlIHJlc3VsdCBvZiB0aGUgYWJzdHJhY3Qgb3BlcmF0aW9uIEFycmF5Q3JlYXRlXG4gICAgICAvLyAgICAgIHdpdGggYXJndW1lbnQgMC5cbiAgICAgIC8vIGMuIFJldHVybklmQWJydXB0KEEpLlxuICAgICAgQSA9IGlzQ2FsbGFibGUoQykgPyBPYmplY3QobmV3IEMoKSkgOiBbXTtcblxuICAgICAgLy8gZC4gTGV0IGl0ZXJhdG9yIGJlIEdldEl0ZXJhdG9yKGl0ZW1zLCB1c2luZ0l0ZXJhdG9yKS5cbiAgICAgIHZhciBpdGVyYXRvciA9IHVzaW5nSXRlcmF0b3IuY2FsbChpdGVtcyk7XG5cbiAgICAgIC8vIGUuIFJldHVybklmQWJydXB0KGl0ZXJhdG9yKS5cbiAgICAgIGlmIChpdGVyYXRvciA9PSBudWxsKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXG4gICAgICAgICAgJ0FycmF5LmZyb20gcmVxdWlyZXMgYW4gYXJyYXktbGlrZSBvciBpdGVyYWJsZSBvYmplY3QnXG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIC8vIGYuIExldCBrIGJlIDAuXG4gICAgICBrID0gMDtcblxuICAgICAgLy8gZy4gUmVwZWF0XG4gICAgICB2YXIgbmV4dCwgbmV4dFZhbHVlO1xuICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgLy8gaS4gTGV0IFBrIGJlIFRvU3RyaW5nKGspLlxuICAgICAgICAvLyBpaS4gTGV0IG5leHQgYmUgSXRlcmF0b3JTdGVwKGl0ZXJhdG9yKS5cbiAgICAgICAgLy8gaWlpLiBSZXR1cm5JZkFicnVwdChuZXh0KS5cbiAgICAgICAgbmV4dCA9IGl0ZXJhdG9yU3RlcChpdGVyYXRvcik7XG5cbiAgICAgICAgLy8gaXYuIElmIG5leHQgaXMgZmFsc2UsIHRoZW5cbiAgICAgICAgaWYgKCFuZXh0KSB7XG5cbiAgICAgICAgICAvLyAxLiBMZXQgc2V0U3RhdHVzIGJlIFNldChBLCBcImxlbmd0aFwiLCBrLCB0cnVlKS5cbiAgICAgICAgICAvLyAyLiBSZXR1cm5JZkFicnVwdChzZXRTdGF0dXMpLlxuICAgICAgICAgIEEubGVuZ3RoID0gaztcblxuICAgICAgICAgIC8vIDMuIFJldHVybiBBLlxuICAgICAgICAgIHJldHVybiBBO1xuICAgICAgICB9XG4gICAgICAgIC8vIHYuIExldCBuZXh0VmFsdWUgYmUgSXRlcmF0b3JWYWx1ZShuZXh0KS5cbiAgICAgICAgLy8gdmkuIFJldHVybklmQWJydXB0KG5leHRWYWx1ZSlcbiAgICAgICAgbmV4dFZhbHVlID0gbmV4dC52YWx1ZTtcblxuICAgICAgICAvLyB2aWkuIElmIG1hcHBpbmcgaXMgdHJ1ZSwgdGhlblxuICAgICAgICAvLyAgIDEuIExldCBtYXBwZWRWYWx1ZSBiZSBDYWxsKG1hcGZuLCBULCDCq25leHRWYWx1ZSwga8K7KS5cbiAgICAgICAgLy8gICAyLiBJZiBtYXBwZWRWYWx1ZSBpcyBhbiBhYnJ1cHQgY29tcGxldGlvbiwgcmV0dXJuXG4gICAgICAgIC8vICAgICAgSXRlcmF0b3JDbG9zZShpdGVyYXRvciwgbWFwcGVkVmFsdWUpLlxuICAgICAgICAvLyAgIDMuIExldCBtYXBwZWRWYWx1ZSBiZSBtYXBwZWRWYWx1ZS5bW3ZhbHVlXV0uXG4gICAgICAgIC8vIHZpaWkuIEVsc2UsIGxldCBtYXBwZWRWYWx1ZSBiZSBuZXh0VmFsdWUuXG4gICAgICAgIC8vIGl4LiAgTGV0IGRlZmluZVN0YXR1cyBiZSB0aGUgcmVzdWx0IG9mXG4gICAgICAgIC8vICAgICAgQ3JlYXRlRGF0YVByb3BlcnR5T3JUaHJvdyhBLCBQaywgbWFwcGVkVmFsdWUpLlxuICAgICAgICAvLyB4LiBbVE9ET10gSWYgZGVmaW5lU3RhdHVzIGlzIGFuIGFicnVwdCBjb21wbGV0aW9uLCByZXR1cm5cbiAgICAgICAgLy8gICAgSXRlcmF0b3JDbG9zZShpdGVyYXRvciwgZGVmaW5lU3RhdHVzKS5cbiAgICAgICAgaWYgKG1hcEZuKSB7XG4gICAgICAgICAgQVtrXSA9IG1hcEZuLmNhbGwoVCwgbmV4dFZhbHVlLCBrKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBBW2tdID0gbmV4dFZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIC8vIHhpLiBJbmNyZWFzZSBrIGJ5IDEuXG4gICAgICAgIGsrKztcbiAgICAgIH1cbiAgICAgIC8vIDcuIEFzc2VydDogaXRlbXMgaXMgbm90IGFuIEl0ZXJhYmxlIHNvIGFzc3VtZSBpdCBpc1xuICAgICAgLy8gICAgYW4gYXJyYXktbGlrZSBvYmplY3QuXG4gICAgfSBlbHNlIHtcblxuICAgICAgLy8gOC4gTGV0IGFycmF5TGlrZSBiZSBUb09iamVjdChpdGVtcykuXG4gICAgICB2YXIgYXJyYXlMaWtlID0gT2JqZWN0KGl0ZW1zKTtcblxuICAgICAgLy8gOS4gUmV0dXJuSWZBYnJ1cHQoaXRlbXMpLlxuICAgICAgaWYgKGl0ZW1zID09IG51bGwpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICAgICAnQXJyYXkuZnJvbSByZXF1aXJlcyBhbiBhcnJheS1saWtlIG9iamVjdCAtIG5vdCBudWxsIG9yIHVuZGVmaW5lZCdcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgLy8gMTAuIExldCBsZW4gYmUgVG9MZW5ndGgoR2V0KGFycmF5TGlrZSwgXCJsZW5ndGhcIikpLlxuICAgICAgLy8gMTEuIFJldHVybklmQWJydXB0KGxlbikuXG4gICAgICB2YXIgbGVuID0gdG9MZW5ndGgoYXJyYXlMaWtlLmxlbmd0aCk7XG5cbiAgICAgIC8vIDEyLiBJZiBJc0NvbnN0cnVjdG9yKEMpIGlzIHRydWUsIHRoZW5cbiAgICAgIC8vICAgICBhLiBMZXQgQSBiZSBDb25zdHJ1Y3QoQywgwqtsZW7CuykuXG4gICAgICAvLyAxMy4gRWxzZVxuICAgICAgLy8gICAgIGEuIExldCBBIGJlIEFycmF5Q3JlYXRlKGxlbikuXG4gICAgICAvLyAxNC4gUmV0dXJuSWZBYnJ1cHQoQSkuXG4gICAgICBBID0gaXNDYWxsYWJsZShDKSA/IE9iamVjdChuZXcgQyhsZW4pKSA6IG5ldyBBcnJheShsZW4pO1xuXG4gICAgICAvLyAxNS4gTGV0IGsgYmUgMC5cbiAgICAgIGsgPSAwO1xuICAgICAgLy8gMTYuIFJlcGVhdCwgd2hpbGUgayA8IGxlbuKApiAoYWxzbyBzdGVwcyBhIC0gaClcbiAgICAgIHZhciBrVmFsdWU7XG4gICAgICB3aGlsZSAoayA8IGxlbikge1xuICAgICAgICBrVmFsdWUgPSBhcnJheUxpa2Vba107XG4gICAgICAgIGlmIChtYXBGbikge1xuICAgICAgICAgIEFba10gPSBtYXBGbi5jYWxsKFQsIGtWYWx1ZSwgayk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgQVtrXSA9IGtWYWx1ZTtcbiAgICAgICAgfVxuICAgICAgICBrKys7XG4gICAgICB9XG4gICAgICAvLyAxNy4gTGV0IHNldFN0YXR1cyBiZSBTZXQoQSwgXCJsZW5ndGhcIiwgbGVuLCB0cnVlKS5cbiAgICAgIC8vIDE4LiBSZXR1cm5JZkFicnVwdChzZXRTdGF0dXMpLlxuICAgICAgQS5sZW5ndGggPSBsZW47XG4gICAgICAvLyAxOS4gUmV0dXJuIEEuXG4gICAgfVxuICAgIHJldHVybiBBO1xuICB9O1xufSkoKTtcbiIsIi8qIVxuICogQGNvcHlyaWdodCBDb3B5cmlnaHQgKGMpIDIwMTYgSWNvTW9vbi5pb1xuICogQGxpY2Vuc2UgICBMaWNlbnNlZCB1bmRlciBNSVQgbGljZW5zZVxuICogICAgICAgICAgICBTZWUgaHR0cHM6Ly9naXRodWIuY29tL0tleWFtb29uL3N2Z3h1c2VcbiAqIEB2ZXJzaW9uICAgMS4xLjIzXG4gKi9cbi8qanNsaW50IGJyb3dzZXI6IHRydWUgKi9cbi8qZ2xvYmFsIFhEb21haW5SZXF1ZXN0LCBNdXRhdGlvbk9ic2VydmVyLCB3aW5kb3cgKi9cbihmdW5jdGlvbiAoKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuICAgIGlmICh3aW5kb3cgJiYgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIpIHtcbiAgICAgICAgdmFyIGNhY2hlID0gT2JqZWN0LmNyZWF0ZShudWxsKTsgLy8gaG9sZHMgeGhyIG9iamVjdHMgdG8gcHJldmVudCBtdWx0aXBsZSByZXF1ZXN0c1xuICAgICAgICB2YXIgY2hlY2tVc2VFbGVtcztcbiAgICAgICAgdmFyIHRpZDsgLy8gdGltZW91dCBpZFxuICAgICAgICB2YXIgZGVib3VuY2VkQ2hlY2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGlkKTtcbiAgICAgICAgICAgIHRpZCA9IHNldFRpbWVvdXQoY2hlY2tVc2VFbGVtcywgMTAwKTtcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIHVub2JzZXJ2ZUNoYW5nZXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH07XG4gICAgICAgIHZhciBvYnNlcnZlQ2hhbmdlcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBvYnNlcnZlcjtcbiAgICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCBkZWJvdW5jZWRDaGVjaywgZmFsc2UpO1xuICAgICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ29yaWVudGF0aW9uY2hhbmdlJywgZGVib3VuY2VkQ2hlY2ssIGZhbHNlKTtcbiAgICAgICAgICAgIGlmICh3aW5kb3cuTXV0YXRpb25PYnNlcnZlcikge1xuICAgICAgICAgICAgICAgIG9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoZGVib3VuY2VkQ2hlY2spO1xuICAgICAgICAgICAgICAgIG9ic2VydmVyLm9ic2VydmUoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LCB7XG4gICAgICAgICAgICAgICAgICAgIGNoaWxkTGlzdDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgc3VidHJlZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgYXR0cmlidXRlczogdHJ1ZVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHVub2JzZXJ2ZUNoYW5nZXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5kaXNjb25uZWN0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigncmVzaXplJywgZGVib3VuY2VkQ2hlY2ssIGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdvcmllbnRhdGlvbmNoYW5nZScsIGRlYm91bmNlZENoZWNrLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGlnbm9yZSkge31cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NU3VidHJlZU1vZGlmaWVkJywgZGVib3VuY2VkQ2hlY2ssIGZhbHNlKTtcbiAgICAgICAgICAgICAgICB1bm9ic2VydmVDaGFuZ2VzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignRE9NU3VidHJlZU1vZGlmaWVkJywgZGVib3VuY2VkQ2hlY2ssIGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIGRlYm91bmNlZENoZWNrLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdvcmllbnRhdGlvbmNoYW5nZScsIGRlYm91bmNlZENoZWNrLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgdmFyIGNyZWF0ZVJlcXVlc3QgPSBmdW5jdGlvbiAodXJsKSB7XG4gICAgICAgICAgICAvLyBJbiBJRSA5LCBjcm9zcyBvcmlnaW4gcmVxdWVzdHMgY2FuIG9ubHkgYmUgc2VudCB1c2luZyBYRG9tYWluUmVxdWVzdC5cbiAgICAgICAgICAgIC8vIFhEb21haW5SZXF1ZXN0IHdvdWxkIGZhaWwgaWYgQ09SUyBoZWFkZXJzIGFyZSBub3Qgc2V0LlxuICAgICAgICAgICAgLy8gVGhlcmVmb3JlLCBYRG9tYWluUmVxdWVzdCBzaG91bGQgb25seSBiZSB1c2VkIHdpdGggY3Jvc3Mgb3JpZ2luIHJlcXVlc3RzLlxuICAgICAgICAgICAgZnVuY3Rpb24gZ2V0T3JpZ2luKGxvYykge1xuICAgICAgICAgICAgICAgIHZhciBhO1xuICAgICAgICAgICAgICAgIGlmIChsb2MucHJvdG9jb2wgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICBhID0gbG9jO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgICAgICAgICAgICAgICAgIGEuaHJlZiA9IGxvYztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGEucHJvdG9jb2wucmVwbGFjZSgvOi9nLCAnJykgKyBhLmhvc3Q7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgUmVxdWVzdDtcbiAgICAgICAgICAgIHZhciBvcmlnaW47XG4gICAgICAgICAgICB2YXIgb3JpZ2luMjtcbiAgICAgICAgICAgIGlmICh3aW5kb3cuWE1MSHR0cFJlcXVlc3QpIHtcbiAgICAgICAgICAgICAgICBSZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgICAgICAgICAgICAgb3JpZ2luID0gZ2V0T3JpZ2luKGxvY2F0aW9uKTtcbiAgICAgICAgICAgICAgICBvcmlnaW4yID0gZ2V0T3JpZ2luKHVybCk7XG4gICAgICAgICAgICAgICAgaWYgKFJlcXVlc3Qud2l0aENyZWRlbnRpYWxzID09PSB1bmRlZmluZWQgJiYgb3JpZ2luMiAhPT0gJycgJiYgb3JpZ2luMiAhPT0gb3JpZ2luKSB7XG4gICAgICAgICAgICAgICAgICAgIFJlcXVlc3QgPSBYRG9tYWluUmVxdWVzdCB8fCB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgUmVxdWVzdCA9IFhNTEh0dHBSZXF1ZXN0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBSZXF1ZXN0O1xuICAgICAgICB9O1xuICAgICAgICB2YXIgeGxpbmtOUyA9ICdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJztcbiAgICAgICAgY2hlY2tVc2VFbGVtcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBiYXNlO1xuICAgICAgICAgICAgdmFyIGJjcjtcbiAgICAgICAgICAgIHZhciBmYWxsYmFjayA9ICcnOyAvLyBvcHRpb25hbCBmYWxsYmFjayBVUkwgaW4gY2FzZSBubyBiYXNlIHBhdGggdG8gU1ZHIGZpbGUgd2FzIGdpdmVuIGFuZCBubyBzeW1ib2wgZGVmaW5pdGlvbiB3YXMgZm91bmQuXG4gICAgICAgICAgICB2YXIgaGFzaDtcbiAgICAgICAgICAgIHZhciBocmVmO1xuICAgICAgICAgICAgdmFyIGk7XG4gICAgICAgICAgICB2YXIgaW5Qcm9ncmVzc0NvdW50ID0gMDtcbiAgICAgICAgICAgIHZhciBpc0hpZGRlbjtcbiAgICAgICAgICAgIHZhciBSZXF1ZXN0O1xuICAgICAgICAgICAgdmFyIHVybDtcbiAgICAgICAgICAgIHZhciB1c2VzO1xuICAgICAgICAgICAgdmFyIHhocjtcbiAgICAgICAgICAgIGZ1bmN0aW9uIG9ic2VydmVJZkRvbmUoKSB7XG4gICAgICAgICAgICAgICAgLy8gSWYgZG9uZSB3aXRoIG1ha2luZyBjaGFuZ2VzLCBzdGFydCB3YXRjaGluZyBmb3IgY2hhZ25lcyBpbiBET00gYWdhaW5cbiAgICAgICAgICAgICAgICBpblByb2dyZXNzQ291bnQgLT0gMTtcbiAgICAgICAgICAgICAgICBpZiAoaW5Qcm9ncmVzc0NvdW50ID09PSAwKSB7IC8vIGlmIGFsbCB4aHJzIHdlcmUgcmVzb2x2ZWRcbiAgICAgICAgICAgICAgICAgICAgdW5vYnNlcnZlQ2hhbmdlcygpOyAvLyBtYWtlIHN1cmUgdG8gcmVtb3ZlIG9sZCBoYW5kbGVyc1xuICAgICAgICAgICAgICAgICAgICBvYnNlcnZlQ2hhbmdlcygpOyAvLyB3YXRjaCBmb3IgY2hhbmdlcyB0byBET01cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmdW5jdGlvbiBhdHRyVXBkYXRlRnVuYyhzcGVjKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNhY2hlW3NwZWMuYmFzZV0gIT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNwZWMudXNlRWwuc2V0QXR0cmlidXRlTlMoeGxpbmtOUywgJ3hsaW5rOmhyZWYnLCAnIycgKyBzcGVjLmhhc2gpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZ1bmN0aW9uIG9ubG9hZEZ1bmMoeGhyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGJvZHkgPSBkb2N1bWVudC5ib2R5O1xuICAgICAgICAgICAgICAgICAgICB2YXIgeCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3gnKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHN2ZztcbiAgICAgICAgICAgICAgICAgICAgeGhyLm9ubG9hZCA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIHguaW5uZXJIVE1MID0geGhyLnJlc3BvbnNlVGV4dDtcbiAgICAgICAgICAgICAgICAgICAgc3ZnID0geC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnc3ZnJylbMF07XG4gICAgICAgICAgICAgICAgICAgIGlmIChzdmcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN2Zy5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJywgJ3RydWUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN2Zy5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdmcuc3R5bGUud2lkdGggPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgc3ZnLnN0eWxlLmhlaWdodCA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdmcuc3R5bGUub3ZlcmZsb3cgPSAnaGlkZGVuJztcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvZHkuaW5zZXJ0QmVmb3JlKHN2ZywgYm9keS5maXJzdENoaWxkKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBvYnNlcnZlSWZEb25lKCk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZ1bmN0aW9uIG9uRXJyb3JUaW1lb3V0KHhocikge1xuICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHhoci5vbmVycm9yID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgeGhyLm9udGltZW91dCA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIG9ic2VydmVJZkRvbmUoKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdW5vYnNlcnZlQ2hhbmdlcygpOyAvLyBzdG9wIHdhdGNoaW5nIGZvciBjaGFuZ2VzIHRvIERPTVxuICAgICAgICAgICAgLy8gZmluZCBhbGwgdXNlIGVsZW1lbnRzXG4gICAgICAgICAgICB1c2VzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3VzZScpO1xuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IHVzZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBiY3IgPSB1c2VzW2ldLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGlnbm9yZSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBmYWlsZWQgdG8gZ2V0IGJvdW5kaW5nIHJlY3RhbmdsZSBvZiB0aGUgdXNlIGVsZW1lbnRcbiAgICAgICAgICAgICAgICAgICAgYmNyID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGhyZWYgPSB1c2VzW2ldLmdldEF0dHJpYnV0ZU5TKHhsaW5rTlMsICdocmVmJyk7XG4gICAgICAgICAgICAgICAgaWYgKGhyZWYgJiYgaHJlZi5zcGxpdCkge1xuICAgICAgICAgICAgICAgICAgICB1cmwgPSBocmVmLnNwbGl0KCcjJyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdXJsID0gW1wiXCIsIFwiXCJdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBiYXNlID0gdXJsWzBdO1xuICAgICAgICAgICAgICAgIGhhc2ggPSB1cmxbMV07XG4gICAgICAgICAgICAgICAgaXNIaWRkZW4gPSBiY3IgJiYgYmNyLmxlZnQgPT09IDAgJiYgYmNyLnJpZ2h0ID09PSAwICYmIGJjci50b3AgPT09IDAgJiYgYmNyLmJvdHRvbSA9PT0gMDtcbiAgICAgICAgICAgICAgICBpZiAoYmNyICYmIGJjci53aWR0aCA9PT0gMCAmJiBiY3IuaGVpZ2h0ID09PSAwICYmICFpc0hpZGRlbikge1xuICAgICAgICAgICAgICAgICAgICAvLyB0aGUgdXNlIGVsZW1lbnQgaXMgZW1wdHlcbiAgICAgICAgICAgICAgICAgICAgLy8gaWYgdGhlcmUgaXMgYSByZWZlcmVuY2UgdG8gYW4gZXh0ZXJuYWwgU1ZHLCB0cnkgdG8gZmV0Y2ggaXRcbiAgICAgICAgICAgICAgICAgICAgLy8gdXNlIHRoZSBvcHRpb25hbCBmYWxsYmFjayBVUkwgaWYgdGhlcmUgaXMgbm8gcmVmZXJlbmNlIHRvIGFuIGV4dGVybmFsIFNWR1xuICAgICAgICAgICAgICAgICAgICBpZiAoZmFsbGJhY2sgJiYgIWJhc2UubGVuZ3RoICYmIGhhc2ggJiYgIWRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGhhc2gpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBiYXNlID0gZmFsbGJhY2s7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGJhc2UubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBzY2hlZHVsZSB1cGRhdGluZyB4bGluazpocmVmXG4gICAgICAgICAgICAgICAgICAgICAgICB4aHIgPSBjYWNoZVtiYXNlXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh4aHIgIT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB0cnVlIHNpZ25pZmllcyB0aGF0IHByZXBlbmRpbmcgdGhlIFNWRyB3YXMgbm90IHJlcXVpcmVkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChhdHRyVXBkYXRlRnVuYyh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVzZUVsOiB1c2VzW2ldLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYXNlOiBiYXNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYXNoOiBoYXNoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSksIDApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHhociA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUmVxdWVzdCA9IGNyZWF0ZVJlcXVlc3QoYmFzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKFJlcXVlc3QgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4aHIgPSBuZXcgUmVxdWVzdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWNoZVtiYXNlXSA9IHhocjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeGhyLm9ubG9hZCA9IG9ubG9hZEZ1bmMoeGhyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeGhyLm9uZXJyb3IgPSBvbkVycm9yVGltZW91dCh4aHIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4aHIub250aW1lb3V0ID0gb25FcnJvclRpbWVvdXQoeGhyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeGhyLm9wZW4oJ0dFVCcsIGJhc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4aHIuc2VuZCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpblByb2dyZXNzQ291bnQgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWlzSGlkZGVuKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2FjaGVbYmFzZV0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJlbWVtYmVyIHRoaXMgVVJMIGlmIHRoZSB1c2UgZWxlbWVudCB3YXMgbm90IGVtcHR5IGFuZCBubyByZXF1ZXN0IHdhcyBzZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FjaGVbYmFzZV0gPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjYWNoZVtiYXNlXS5vbmxvYWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBpZiBpdCB0dXJucyBvdXQgdGhhdCBwcmVwZW5kaW5nIHRoZSBTVkcgaXMgbm90IG5lY2Vzc2FyeSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhYm9ydCB0aGUgaW4tcHJvZ3Jlc3MgeGhyLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhY2hlW2Jhc2VdLmFib3J0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGNhY2hlW2Jhc2VdLm9ubG9hZDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWNoZVtiYXNlXSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoYmFzZS5sZW5ndGggJiYgY2FjaGVbYmFzZV0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGF0dHJVcGRhdGVGdW5jKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1c2VFbDogdXNlc1tpXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYXNlOiBiYXNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhc2g6IGhhc2hcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB1c2VzID0gJyc7XG4gICAgICAgICAgICBpblByb2dyZXNzQ291bnQgKz0gMTtcbiAgICAgICAgICAgIG9ic2VydmVJZkRvbmUoKTtcbiAgICAgICAgfTtcbiAgICAgICAgLy8gVGhlIGxvYWQgZXZlbnQgZmlyZXMgd2hlbiBhbGwgcmVzb3VyY2VzIGhhdmUgZmluaXNoZWQgbG9hZGluZywgd2hpY2ggYWxsb3dzIGRldGVjdGluZyB3aGV0aGVyIFNWRyB1c2UgZWxlbWVudHMgYXJlIGVtcHR5LlxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGZ1bmN0aW9uIHdpbkxvYWQoKSB7XG4gICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignbG9hZCcsIHdpbkxvYWQsIGZhbHNlKTsgLy8gdG8gcHJldmVudCBtZW1vcnkgbGVha3NcbiAgICAgICAgICAgIHRpZCA9IHNldFRpbWVvdXQoY2hlY2tVc2VFbGVtcywgMCk7XG4gICAgICAgIH0sIGZhbHNlKTtcbiAgICB9XG59KCkpO1xuIiwiLy8gUE9MWUZJTExTXG5pZiAoIUFycmF5LmZvckVhY2gpIEFycmF5LmZvckVhY2ggPSByZXF1aXJlKCdhcnJheS1mb3JlYWNoJyk7XG5Ob2RlTGlzdC5wcm90b3R5cGUuZm9yRWFjaCA9IEFycmF5LnByb3RvdHlwZS5mb3JFYWNoOyBcbkhUTUxDb2xsZWN0aW9uLnByb3RvdHlwZS5mb3JFYWNoID0gQXJyYXkucHJvdG90eXBlLmZvckVhY2g7IC8vIEJlY2F1c2Ugb2YgaHR0cHM6Ly9idWd6aWxsYS5tb3ppbGxhLm9yZy9zaG93X2J1Zy5jZ2k/aWQ9MTQ4NjlcbmlmICghQXJyYXkuZnJvbSkgQXJyYXkuZnJvbSA9IHJlcXVpcmUoJ2FycmF5LWZyb20nKTtcblxuXG4vLyBSRVFVSVJFIE1PRFVMRVNcbnJlcXVpcmUoJy4vbWVkaWEuanMnKTtcbnJlcXVpcmUoJy4vd2VsbHMuanMnKTtcbnJlcXVpcmUoJy4vbWFzdC5qcycpO1xucmVxdWlyZSgnc3ZneHVzZScpO1xuXG4iLCJkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuby1tYXN0X19zZWFyY2gnKS5mb3JFYWNoKGZ1bmN0aW9uIChzKSB7XG4gIHZhciBzZWFyY2ggICAgICAgICAgICAgID0gcztcbiAgdmFyIGxpbmsgICAgICAgICAgICAgICAgPSBzZWFyY2gucXVlcnlTZWxlY3RvcignbGFiZWwuby1tYXN0X19zZWFyY2gtbGluaycpO1xuICBpZiAoIWxpbmspe3JldHVybn07XG4gIHZhciBsaW5rU3RhdGVDaGVja2JveElkID0gbGluay5nZXRBdHRyaWJ1dGUoJ2ZvcicpO1xuICBpZiAoIWxpbmtTdGF0ZUNoZWNrYm94SWQpe3JldHVybn07XG4gIHZhciBsaW5rU3RhdGVDaGVja2JveCAgID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgIyR7bGlua1N0YXRlQ2hlY2tib3hJZH1gKTtcbiAgaWYgKCFsaW5rU3RhdGVDaGVja2JveCl7cmV0dXJufTtcbiAgdmFyIHNlYXJjaEZpZWxkICAgICAgICAgPSBsaW5rLnBhcmVudEVsZW1lbnQucXVlcnlTZWxlY3RvcignaW5wdXQnKTtcblxuICBsaW5rLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICBpZiAobGlua1N0YXRlQ2hlY2tib3guY2hlY2tlZCkge1xuICAgICAgbGluay5wYXJlbnRFbGVtZW50LnN1Ym1pdCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgIC8vIFNhZmFyaSBuZWVkcyB0aGlzIHRpbWVvdXQgZm9yIHdoYXRldmVyIHJlYXNvbi4uLlxuICAgICAgICBzZWFyY2hGaWVsZC5mb2N1cygpO1xuICAgICAgfSwgMCk7XG4gICAgfVxuICB9LCBmYWxzZSk7XG5cbiAgZnVuY3Rpb24gdW5jaGVjaygpe1xuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgIGxpbmtTdGF0ZUNoZWNrYm94LmNoZWNrZWQgPSBmYWxzZTtcbiAgICB9LCAyMDApXG4gIH1cblxuICBzZWFyY2hGaWVsZC5hZGRFdmVudExpc3RlbmVyKCdibHVyJywgdW5jaGVjaywgdHJ1ZSk7XG5cbn0pO1xuXG5kb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuby1tYXN0X19uYXYtbGluaycpLmZvckVhY2goZnVuY3Rpb24obCkge1xuICBsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oZSl7XG4gICAgLy8gZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIC8vIHJldHVybiBmYWxzZTtcbiAgICAvLyBeXiB1bmNvbW1lbnQgYWJvdmUgd2hlbiBpbXBsZW1lbnRpbmdcbiAgICAvLyBzbGlkaW5nIHN1Ym1lbnVzXG4gIH0pO1xuICAvLyBsLmNoaWxkcmVuLmZvckVhY2goZnVuY3Rpb24oYyl7XG4gIC8vICAgYy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKGUpe1xuICAvLyAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAvLyAgICAgcmV0dXJuIGZhbHNlO1xuICAvLyAgIH0pO1xuXG4gIC8vIH0pXG59KTsiLCIvLyBDb2xsZWN0IGxhcmdlIGhlYWRsaW5lcyB0aGF0IG1pZ2h0IG5lZWQgcmVzaXppbmcuXG52YXIgaGVhZGxpbmVzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcIm1lZGlhX19oZWFkbGluZS0taDFcIik7XG5cbmZ1bmN0aW9uIGNoZWNrTGVuZ3RoQW5kUmVzaXplKGhlYWRsaW5lLCBpbmRleCkge1xuXG4gIC8vIExvb2sgaW5zaWRlIHRoZSBoZWFkbGluZSdzIGh5cGVybGluayB0byBnZXQgdGhlIHRleHRcbiAgLy8gY2hhcmFjdGVyIGNvdW50LlxuICB2YXIgY2hhckNvdW50ID0gaGVhZGxpbmUuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJhXCIpWzBdLnRleHRDb250ZW50Lmxlbmd0aDtcblxuICAvLyBJZiB0aGlzIGlzIGEgaGVhZGxpbmUgbGlrZWx5IHRvIHdyYXAgdG8gdGhyZWUgbGluZXMsXG4gIC8vIGxldCdzIGFkZCBhIGNsYXNzIHRvIHR5cGVzZXQgaXQgc21hbGxlci5cbiAgaWYgKGNoYXJDb3VudCA+IDYwKSB7XG4gICAgaGVhZGxpbmUuY2xhc3NMaXN0LmFkZChcIm1lZGlhX19oZWFkbGluZS0taDEtdmVyYm9zZVwiKTtcbiAgfVxufVxuXG4vLyBJdGVyYXRlIHRocm91Z2ggbGFyZ2UgaGVhZGxpbmVzIGFuZCByZXNpemUgd2hlcmUgYXBwcm9wcmlhdGUuXG5BcnJheS5mcm9tKGhlYWRsaW5lcykuZm9yRWFjaChjaGVja0xlbmd0aEFuZFJlc2l6ZSk7XG4iLCJcbi8vIFdlbGxzIEpTXG52YXIgcyxcbndlbGxzID0ge1xuXG4gIHNldHRpbmdzOiB7XG4gICAgd2VsbDogZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcImpzLXdlbGxcIiksXG4gICAgd2VsbERpc21pc3NCdG46IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJqcy13ZWxsLS1kaXNtaXNzLWJ0blwiKVxuICB9LFxuXG4gIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgIHMgPSB0aGlzLnNldHRpbmdzO1xuICAgIHRoaXMuYmluZFVJQWN0aW9ucygpO1xuICAgIHRoaXMub25Mb2FkQWN0aW9ucygpO1xuICB9LFxuXG4gIGZvckVhY2g6IGZ1bmN0aW9uIChhcnJheSwgY2FsbGJhY2ssIHNjb3BlKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnJheS5sZW5ndGg7IGkrKykge1xuICAgICAgY2FsbGJhY2suY2FsbChzY29wZSwgaSwgYXJyYXlbaV0pOyAvLyBwYXNzZXMgYmFjayBzdHVmZiB3ZSBuZWVkXG4gICAgfVxuICB9LFxuXG4gIGJpbmRVSUFjdGlvbnM6IGZ1bmN0aW9uKCkge1xuICAgIHdlbGxzLmZvckVhY2gocy53ZWxsRGlzbWlzc0J0biwgZnVuY3Rpb24gKGluZGV4LCBlbGVtZW50KSB7XG4gICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbiggZXZlbnQgKSB7XG4gICAgICAgIHdlbGxzLmRpc21pc3NXZWxsKGVsZW1lbnQpO1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgfSwgZmFsc2UpO1xuICAgIH0pO1xuICB9LFxuXG4gIG9uTG9hZEFjdGlvbnM6IGZ1bmN0aW9uKCkge1xuICAgIHdlbGxzLmZvckVhY2gocy53ZWxsLCBmdW5jdGlvbiAoaW5kZXgsIGVsZW1lbnQpIHtcbiAgICAgIC8vIGNoZWNrIGNvb2tpZXMgYW5kIGhpZGUgd2VsbHMgd2hlcmUgdmlld3NMZWZ0ID09PSAwXG4gICAgICB2YXIgY29va2llTmFtZSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKFwiZGF0YS1uYW1lXCIpO1xuICAgICAgdmFyIGNvb2tpZVZhbHVlID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoXCJkYXRhLXZpZXdzXCIpO1xuXG4gICAgICB3ZWxscy5jcmVhdGVPclVwZGF0ZUNvb2tpZShjb29raWVOYW1lLCBjb29raWVWYWx1ZSwgZWxlbWVudCk7XG4gICAgfSk7XG4gIH0sXG5cbiAgZ2V0Q29va2llOiBmdW5jdGlvbihuYW1lKSB7XG4gICAgdmFyIGtleVZhbHVlID0gZG9jdW1lbnQuY29va2llLm1hdGNoKCcoXnw7KSA/JyArIG5hbWUgKyAnPShbXjtdKikoO3wkKScpO1xuICAgIHJldHVybiBrZXlWYWx1ZSA/IGtleVZhbHVlWzJdIDogbnVsbDtcbiAgfSxcblxuICBzZXRDb29raWU6IGZ1bmN0aW9uKG5hbWUsIHZpZXdzTGVmdCkge1xuICAgIHZhciBleHBpcmVzID0gbmV3IERhdGUoKTtcblxuICAgIGV4cGlyZXMuc2V0VGltZShleHBpcmVzLmdldFRpbWUoKSArIDMxNTM2MDAwMDAwKTsgLy8gMSB5ZWFyXG4gICAgZG9jdW1lbnQuY29va2llID0gbmFtZSArIFwiPVwiICsgdmlld3NMZWZ0ICsgXCI7IGV4cGlyZXM9XCIgKyBleHBpcmVzLnRvVVRDU3RyaW5nKCk7XG4gIH0sXG5cbiAgY3JlYXRlT3JVcGRhdGVDb29raWU6IGZ1bmN0aW9uKG5hbWUsIHZpZXdzTGVmdCwgZWxlbWVudCkge1xuICAgIHZhciBjb29raWUgPSB3ZWxscy5nZXRDb29raWUobmFtZSk7XG4gICAgdmFyIGNvb2tpZVZhbHVlID0gcGFyc2VJbnQoY29va2llLCAxMCk7XG5cbiAgICBpZiAoY29va2llID09PSBudWxsKSB7XG4gICAgICB3ZWxscy5zZXRDb29raWUobmFtZSwgdmlld3NMZWZ0KTtcbiAgICB9XG4gICAgZWxzZSBpZiAoY29va2llVmFsdWUgPiAwKSB7XG4gICAgICAvLyBSZWFkIGNvb2tpZSBhbmQgdXBkYXRlIGlmIGl0IG5lZWRzIHRvIGJlIGRlY3JlbWVudGVkXG4gICAgICB2aWV3c0xlZnQgPSBjb29raWVWYWx1ZSAtIDE7XG4gICAgICB3ZWxscy5zZXRDb29raWUobmFtZSwgdmlld3NMZWZ0KTtcbiAgICB9XG4gICAgZWxzZSBpZiAoY29va2llVmFsdWUgPT09IDApIHtcbiAgICAgIHdlbGxzLmRpc21pc3NXZWxsKGVsZW1lbnQpO1xuICAgIH1cbiAgfSxcblxuICBkaXNtaXNzV2VsbDogZnVuY3Rpb24oZWxlbWVudCkge1xuICAgIGlmIChlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhcImpzLXdlbGxcIikpIHtcbiAgICAgIHZhciB3ZWxsRWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgd2VsbEVsZW1lbnQgPSBlbGVtZW50LnBhcmVudE5vZGU7XG4gICAgfVxuICAgIHZhciBuYW1lID0gd2VsbEVsZW1lbnQuZ2V0QXR0cmlidXRlKFwiZGF0YS1uYW1lXCIpO1xuXG4gICAgd2VsbEVsZW1lbnQuY2xhc3NMaXN0LmFkZChcImpzLS1oaWRkZW5cIik7XG4gICAgd2VsbHMuc2V0Q29va2llKG5hbWUsIDApO1xuICB9XG5cbn07XG5cbihmdW5jdGlvbigpIHtcbiAgaWYgKGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJqcy13ZWxsXCIpLmxlbmd0aCkge1xuICAgIHdlbGxzLmluaXQoKTtcbiAgfVxufSkoKTtcbiJdfQ==
