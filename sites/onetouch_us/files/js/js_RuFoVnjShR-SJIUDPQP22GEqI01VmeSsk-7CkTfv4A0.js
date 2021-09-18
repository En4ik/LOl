/*!*
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the W3C SOFTWARE AND DOCUMENT NOTICE AND LICENSE.
 *
 *  https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document
 *
 */

(function(window, document) {
  'use strict';


  // Exits early if all IntersectionObserver and IntersectionObserverEntry
  // features are natively supported.
  if ('IntersectionObserver' in window &&
        'IntersectionObserverEntry' in window &&
        'intersectionRatio' in window.IntersectionObserverEntry.prototype) {

    // Minimal polyfill for Edge 15's lack of `isIntersecting`
    // See: https://github.com/w3c/IntersectionObserver/issues/211
    if (!('isIntersecting' in window.IntersectionObserverEntry.prototype)) {
      Object.defineProperty(window.IntersectionObserverEntry.prototype,
        'isIntersecting', {
          get: function () {
            return this.intersectionRatio > 0;
          }
        });
    }
    return;
  }


  /**
     * An IntersectionObserver registry. This registry exists to hold a strong
     * reference to IntersectionObserver instances currently observing a target
     * element. Without this registry, instances without another reference may be
     * garbage collected.
     */
  var registry = [];


  /**
     * Creates the global IntersectionObserverEntry constructor.
     * https://w3c.github.io/IntersectionObserver/#intersection-observer-entry
     * @param {Object} entry A dictionary of instance properties.
     * @constructor
     */
  function IntersectionObserverEntry(entry) {
    this.time = entry.time;
    this.target = entry.target;
    this.rootBounds = entry.rootBounds;
    this.boundingClientRect = entry.boundingClientRect;
    this.intersectionRect = entry.intersectionRect || getEmptyRect();
    this.isIntersecting = !!entry.intersectionRect;

    // Calculates the intersection ratio.
    var targetRect = this.boundingClientRect;
    var targetArea = targetRect.width * targetRect.height;
    var intersectionRect = this.intersectionRect;
    var intersectionArea = intersectionRect.width * intersectionRect.height;

    // Sets intersection ratio.
    if (targetArea) {
      // Round the intersection ratio to avoid floating point math issues:
      // https://github.com/w3c/IntersectionObserver/issues/324
      this.intersectionRatio = Number((intersectionArea / targetArea).toFixed(4));
    } else {
      // If area is zero and is intersecting, sets to 1, otherwise to 0
      this.intersectionRatio = this.isIntersecting ? 1 : 0;
    }
  }


  /**
     * Creates the global IntersectionObserver constructor.
     * https://w3c.github.io/IntersectionObserver/#intersection-observer-interface
     * @param {Function} callback The function to be invoked after intersection
     *     changes have queued. The function is not invoked if the queue has
     *     been emptied by calling the `takeRecords` method.
     * @param {Object=} opt_options Optional configuration options.
     * @constructor
     */
  function IntersectionObserver(callback, opt_options) {

    var options = opt_options || {};

    if (typeof callback != 'function') {
      throw new Error('callback must be a function');
    }

    if (options.root && options.root.nodeType != 1) {
      throw new Error('root must be an Element');
    }

    // Binds and throttles `this._checkForIntersections`.
    this._checkForIntersections = throttle(
      this._checkForIntersections.bind(this), this.THROTTLE_TIMEOUT);

    // Private properties.
    this._callback = callback;
    this._observationTargets = [];
    this._queuedEntries = [];
    this._rootMarginValues = this._parseRootMargin(options.rootMargin);

    // Public properties.
    this.thresholds = this._initThresholds(options.threshold);
    this.root = options.root || null;
    this.rootMargin = this._rootMarginValues.map(function(margin) {
      return margin.value + margin.unit;
    }).join(' ');
  }


  /**
     * The minimum interval within which the document will be checked for
     * intersection changes.
     */
  IntersectionObserver.prototype.THROTTLE_TIMEOUT = 100;


  /**
     * The frequency in which the polyfill polls for intersection changes.
     * this can be updated on a per instance basis and must be set prior to
     * calling `observe` on the first target.
     */
  IntersectionObserver.prototype.POLL_INTERVAL = null;

  /**
     * Use a mutation observer on the root element
     * to detect intersection changes.
     */
  IntersectionObserver.prototype.USE_MUTATION_OBSERVER = true;


  /**
     * Starts observing a target element for intersection changes based on
     * the thresholds values.
     * @param {Element} target The DOM element to observe.
     */
  IntersectionObserver.prototype.observe = function(target) {
    var isTargetAlreadyObserved = this._observationTargets.some(function(item) {
      return item.element == target;
    });

    if (isTargetAlreadyObserved) {
      return;
    }

    if (!(target && target.nodeType == 1)) {
      throw new Error('target must be an Element');
    }

    this._registerInstance();
    this._observationTargets.push({element: target, entry: null});
    this._monitorIntersections();
    this._checkForIntersections();
  };


  /**
     * Stops observing a target element for intersection changes.
     * @param {Element} target The DOM element to observe.
     */
  IntersectionObserver.prototype.unobserve = function(target) {
    this._observationTargets =
            this._observationTargets.filter(function(item) {

              return item.element != target;
            });
    if (!this._observationTargets.length) {
      this._unmonitorIntersections();
      this._unregisterInstance();
    }
  };


  /**
     * Stops observing all target elements for intersection changes.
     */
  IntersectionObserver.prototype.disconnect = function() {
    this._observationTargets = [];
    this._unmonitorIntersections();
    this._unregisterInstance();
  };


  /**
     * Returns any queue entries that have not yet been reported to the
     * callback and clears the queue. This can be used in conjunction with the
     * callback to obtain the absolute most up-to-date intersection information.
     * @return {Array} The currently queued entries.
     */
  IntersectionObserver.prototype.takeRecords = function() {
    var records = this._queuedEntries.slice();
    this._queuedEntries = [];
    return records;
  };


  /**
     * Accepts the threshold value from the user configuration object and
     * returns a sorted array of unique threshold values. If a value is not
     * between 0 and 1 and error is thrown.
     * @private
     * @param {Array|number=} opt_threshold An optional threshold value or
     *     a list of threshold values, defaulting to [0].
     * @return {Array} A sorted list of unique and valid threshold values.
     */
  IntersectionObserver.prototype._initThresholds = function(opt_threshold) {
    var threshold = opt_threshold || [0];
    if (!Array.isArray(threshold)) threshold = [threshold];

    return threshold.sort().filter(function(t, i, a) {
      if (typeof t != 'number' || isNaN(t) || t < 0 || t > 1) {
        throw new Error('threshold must be a number between 0 and 1 inclusively');
      }
      return t !== a[i - 1];
    });
  };


  /**
     * Accepts the rootMargin value from the user configuration object
     * and returns an array of the four margin values as an object containing
     * the value and unit properties. If any of the values are not properly
     * formatted or use a unit other than px or %, and error is thrown.
     * @private
     * @param {string=} opt_rootMargin An optional rootMargin value,
     *     defaulting to '0px'.
     * @return {Array<Object>} An array of margin objects with the keys
     *     value and unit.
     */
  IntersectionObserver.prototype._parseRootMargin = function(opt_rootMargin) {
    var marginString = opt_rootMargin || '0px';
    var margins = marginString.split(/\s+/).map(function(margin) {
      var parts = /^(-?\d*\.?\d+)(px|%)$/.exec(margin);
      if (!parts) {
        throw new Error('rootMargin must be specified in pixels or percent');
      }
      return {value: parseFloat(parts[1]), unit: parts[2]};
    });

    // Handles shorthand.
    margins[1] = margins[1] || margins[0];
    margins[2] = margins[2] || margins[0];
    margins[3] = margins[3] || margins[1];

    return margins;
  };


  /**
     * Starts polling for intersection changes if the polling is not already
     * happening, and if the page's visibility state is visible.
     * @private
     */
  IntersectionObserver.prototype._monitorIntersections = function() {
    if (!this._monitoringIntersections) {
      this._monitoringIntersections = true;

      // If a poll interval is set, use polling instead of listening to
      // resize and scroll events or DOM mutations.
      if (this.POLL_INTERVAL) {
        this._monitoringInterval = setInterval(
          this._checkForIntersections, this.POLL_INTERVAL);
      }
      else {
        addEvent(window, 'resize', this._checkForIntersections, true);
        addEvent(document, 'scroll', this._checkForIntersections, true);

        if (this.USE_MUTATION_OBSERVER && 'MutationObserver' in window) {
          this._domObserver = new MutationObserver(this._checkForIntersections);
          this._domObserver.observe(document, {
            attributes: true,
            childList: true,
            characterData: true,
            subtree: true
          });
        }
      }
    }
  };


  /**
     * Stops polling for intersection changes.
     * @private
     */
  IntersectionObserver.prototype._unmonitorIntersections = function() {
    if (this._monitoringIntersections) {
      this._monitoringIntersections = false;

      clearInterval(this._monitoringInterval);
      this._monitoringInterval = null;

      removeEvent(window, 'resize', this._checkForIntersections, true);
      removeEvent(document, 'scroll', this._checkForIntersections, true);

      if (this._domObserver) {
        this._domObserver.disconnect();
        this._domObserver = null;
      }
    }
  };


  /**
     * Scans each observation target for intersection changes and adds them
     * to the internal entries queue. If new entries are found, it
     * schedules the callback to be invoked.
     * @private
     */
  IntersectionObserver.prototype._checkForIntersections = function() {
    var rootIsInDom = this._rootIsInDom();
    var rootRect = rootIsInDom ? this._getRootRect() : getEmptyRect();

    this._observationTargets.forEach(function(item) {
      var target = item.element;
      var targetRect = getBoundingClientRect(target);
      var rootContainsTarget = this._rootContainsTarget(target);
      var oldEntry = item.entry;
      var intersectionRect = rootIsInDom && rootContainsTarget &&
                this._computeTargetAndRootIntersection(target, rootRect);

      var newEntry = item.entry = new IntersectionObserverEntry({
        time: now(),
        target: target,
        boundingClientRect: targetRect,
        rootBounds: rootRect,
        intersectionRect: intersectionRect
      });

      if (!oldEntry) {
        this._queuedEntries.push(newEntry);
      } else if (rootIsInDom && rootContainsTarget) {
        // If the new entry intersection ratio has crossed any of the
        // thresholds, add a new entry.
        if (this._hasCrossedThreshold(oldEntry, newEntry)) {
          this._queuedEntries.push(newEntry);
        }
      } else {
        // If the root is not in the DOM or target is not contained within
        // root but the previous entry for this target had an intersection,
        // add a new record indicating removal.
        if (oldEntry && oldEntry.isIntersecting) {
          this._queuedEntries.push(newEntry);
        }
      }
    }, this);

    if (this._queuedEntries.length) {
      this._callback(this.takeRecords(), this);
    }
  };


  /**
     * Accepts a target and root rect computes the intersection between then
     * following the algorithm in the spec.
     * TODO(philipwalton): at this time clip-path is not considered.
     * https://w3c.github.io/IntersectionObserver/#calculate-intersection-rect-algo
     * @param {Element} target The target DOM element
     * @param {Object} rootRect The bounding rect of the root after being
     *     expanded by the rootMargin value.
     * @return {?Object} The final intersection rect object or undefined if no
     *     intersection is found.
     * @private
     */
  IntersectionObserver.prototype._computeTargetAndRootIntersection =
        function(target, rootRect) {

          // If the element isn't displayed, an intersection can't happen.
          if (window.getComputedStyle(target).display == 'none') return;

          var targetRect = getBoundingClientRect(target);
          var intersectionRect = targetRect;
          var parent = getParentNode(target);
          var atRoot = false;

          while (!atRoot) {
            var parentRect = null;
            var parentComputedStyle = parent.nodeType == 1 ?
              window.getComputedStyle(parent) : {};

            // If the parent isn't displayed, an intersection can't happen.
            if (parentComputedStyle.display == 'none') return;

            if (parent == this.root || parent == document) {
              atRoot = true;
              parentRect = rootRect;
            } else {
              // If the element has a non-visible overflow, and it's not the <body>
              // or <html> element, update the intersection rect.
              // Note: <body> and <html> cannot be clipped to a rect that's not also
              // the document rect, so no need to compute a new intersection.
              if (parent != document.body &&
                        parent != document.documentElement &&
                        parentComputedStyle.overflow != 'visible') {
                parentRect = getBoundingClientRect(parent);
              }
            }

            // If either of the above conditionals set a new parentRect,
            // calculate new intersection data.
            if (parentRect) {
              intersectionRect = computeRectIntersection(parentRect, intersectionRect);

              if (!intersectionRect) break;
            }
            parent = getParentNode(parent);
          }
          return intersectionRect;
        };


  /**
     * Returns the root rect after being expanded by the rootMargin value.
     * @return {Object} The expanded root rect.
     * @private
     */
  IntersectionObserver.prototype._getRootRect = function() {
    var rootRect;
    if (this.root) {
      rootRect = getBoundingClientRect(this.root);
    } else {
      // Use <html>/<body> instead of window since scroll bars affect size.
      var html = document.documentElement;
      var body = document.body;
      rootRect = {
        top: 0,
        left: 0,
        right: html.clientWidth || body.clientWidth,
        width: html.clientWidth || body.clientWidth,
        bottom: html.clientHeight || body.clientHeight,
        height: html.clientHeight || body.clientHeight
      };
    }
    return this._expandRectByRootMargin(rootRect);
  };


  /**
     * Accepts a rect and expands it by the rootMargin value.
     * @param {Object} rect The rect object to expand.
     * @return {Object} The expanded rect.
     * @private
     */
  IntersectionObserver.prototype._expandRectByRootMargin = function(rect) {
    var margins = this._rootMarginValues.map(function(margin, i) {
      return margin.unit == 'px' ? margin.value :
        margin.value * (i % 2 ? rect.width : rect.height) / 100;
    });
    var newRect = {
      top: rect.top - margins[0],
      right: rect.right + margins[1],
      bottom: rect.bottom + margins[2],
      left: rect.left - margins[3]
    };
    newRect.width = newRect.right - newRect.left;
    newRect.height = newRect.bottom - newRect.top;

    return newRect;
  };


  /**
     * Accepts an old and new entry and returns true if at least one of the
     * threshold values has been crossed.
     * @param {?IntersectionObserverEntry} oldEntry The previous entry for a
     *    particular target element or null if no previous entry exists.
     * @param {IntersectionObserverEntry} newEntry The current entry for a
     *    particular target element.
     * @return {boolean} Returns true if a any threshold has been crossed.
     * @private
     */
  IntersectionObserver.prototype._hasCrossedThreshold =
        function(oldEntry, newEntry) {

          // To make comparing easier, an entry that has a ratio of 0
          // but does not actually intersect is given a value of -1
          var oldRatio = oldEntry && oldEntry.isIntersecting ?
            oldEntry.intersectionRatio || 0 : -1;
          var newRatio = newEntry.isIntersecting ?
            newEntry.intersectionRatio || 0 : -1;

          // Ignore unchanged ratios
          if (oldRatio === newRatio) return;

          for (var i = 0; i < this.thresholds.length; i++) {
            var threshold = this.thresholds[i];

            // Return true if an entry matches a threshold or if the new ratio
            // and the old ratio are on the opposite sides of a threshold.
            if (threshold == oldRatio || threshold == newRatio ||
                    threshold < oldRatio !== threshold < newRatio) {
              return true;
            }
          }
        };


  /**
     * Returns whether or not the root element is an element and is in the DOM.
     * @return {boolean} True if the root element is an element and is in the DOM.
     * @private
     */
  IntersectionObserver.prototype._rootIsInDom = function() {
    return !this.root || containsDeep(document, this.root);
  };


  /**
     * Returns whether or not the target element is a child of root.
     * @param {Element} target The target element to check.
     * @return {boolean} True if the target element is a child of root.
     * @private
     */
  IntersectionObserver.prototype._rootContainsTarget = function(target) {
    return containsDeep(this.root || document, target);
  };


  /**
     * Adds the instance to the global IntersectionObserver registry if it isn't
     * already present.
     * @private
     */
  IntersectionObserver.prototype._registerInstance = function() {
    if (registry.indexOf(this) < 0) {
      registry.push(this);
    }
  };


  /**
     * Removes the instance from the global IntersectionObserver registry.
     * @private
     */
  IntersectionObserver.prototype._unregisterInstance = function() {
    var index = registry.indexOf(this);
    if (index != -1) registry.splice(index, 1);
  };


  /**
     * Returns the result of the performance.now() method or null in browsers
     * that don't support the API.
     * @return {number} The elapsed time since the page was requested.
     */
  function now() {
    return window.performance && performance.now && performance.now();
  }


  /**
     * Throttles a function and delays its execution, so it's only called at most
     * once within a given time period.
     * @param {Function} fn The function to throttle.
     * @param {number} timeout The amount of time that must pass before the
     *     function can be called again.
     * @return {Function} The throttled function.
     */
  function throttle(fn, timeout) {
    var timer = null;
    return function () {
      if (!timer) {
        timer = setTimeout(function() {
          fn();
          timer = null;
        }, timeout);
      }
    };
  }


  /**
     * Adds an event handler to a DOM node ensuring cross-browser compatibility.
     * @param {Node} node The DOM node to add the event handler to.
     * @param {string} event The event name.
     * @param {Function} fn The event handler to add.
     * @param {boolean} opt_useCapture Optionally adds the even to the capture
     *     phase. Note: this only works in modern browsers.
     */
  function addEvent(node, event, fn, opt_useCapture) {
    if (typeof node.addEventListener == 'function') {
      node.addEventListener(event, fn, opt_useCapture || false);
    }
    else if (typeof node.attachEvent == 'function') {
      node.attachEvent('on' + event, fn);
    }
  }


  /**
     * Removes a previously added event handler from a DOM node.
     * @param {Node} node The DOM node to remove the event handler from.
     * @param {string} event The event name.
     * @param {Function} fn The event handler to remove.
     * @param {boolean} opt_useCapture If the event handler was added with this
     *     flag set to true, it should be set to true here in order to remove it.
     */
  function removeEvent(node, event, fn, opt_useCapture) {
    if (typeof node.removeEventListener == 'function') {
      node.removeEventListener(event, fn, opt_useCapture || false);
    }
    else if (typeof node.detatchEvent == 'function') {
      node.detatchEvent('on' + event, fn);
    }
  }


  /**
     * Returns the intersection between two rect objects.
     * @param {Object} rect1 The first rect.
     * @param {Object} rect2 The second rect.
     * @return {?Object} The intersection rect or undefined if no intersection
     *     is found.
     */
  function computeRectIntersection(rect1, rect2) {
    var top = Math.max(rect1.top, rect2.top);
    var bottom = Math.min(rect1.bottom, rect2.bottom);
    var left = Math.max(rect1.left, rect2.left);
    var right = Math.min(rect1.right, rect2.right);
    var width = right - left;
    var height = bottom - top;

    return (width >= 0 && height >= 0) && {
      top: top,
      bottom: bottom,
      left: left,
      right: right,
      width: width,
      height: height
    };
  }


  /**
     * Shims the native getBoundingClientRect for compatibility with older IE.
     * @param {Element} el The element whose bounding rect to get.
     * @return {Object} The (possibly shimmed) rect of the element.
     */
  function getBoundingClientRect(el) {
    var rect;

    try {
      rect = el.getBoundingClientRect();
    } catch (err) {
      // Ignore Windows 7 IE11 "Unspecified error"
      // https://github.com/w3c/IntersectionObserver/pull/205
    }

    if (!rect) return getEmptyRect();

    // Older IE
    if (!(rect.width && rect.height)) {
      rect = {
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        left: rect.left,
        width: rect.right - rect.left,
        height: rect.bottom - rect.top
      };
    }
    return rect;
  }


  /**
     * Returns an empty rect object. An empty rect is returned when an element
     * is not in the DOM.
     * @return {Object} The empty rect.
     */
  function getEmptyRect() {
    return {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      width: 0,
      height: 0
    };
  }

  /**
     * Checks to see if a parent element contains a child element (including inside
     * shadow DOM).
     * @param {Node} parent The parent element.
     * @param {Node} child The child element.
     * @return {boolean} True if the parent node contains the child node.
     */
  function containsDeep(parent, child) {
    var node = child;
    while (node) {
      if (node == parent) return true;

      node = getParentNode(node);
    }
    return false;
  }


  /**
     * Gets the parent node of an element or its host element if the parent node
     * is a shadow root.
     * @param {Node} node The node whose parent to get.
     * @return {Node|null} The parent node or null if no parent exists.
     */
  function getParentNode(node) {
    var parent = node.parentNode;

    if (parent && parent.nodeType == 11 && parent.host) {
      // If the parent is a shadow root, return the host element.
      return parent.host;
    }
    return parent;
  }


  // Exposes the constructors globally.
  window.IntersectionObserver = IntersectionObserver;
  window.IntersectionObserverEntry = IntersectionObserverEntry;

}(window, document));
;
function _extends(){return(_extends=Object.assign||function(t){for(var e=1;e<arguments.length;e++){var n=arguments[e];for(var o in n)Object.prototype.hasOwnProperty.call(n,o)&&(t[o]=n[o])}return t}).apply(this,arguments)}function _typeof(t){return(_typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}!function(t,e){"object"===("undefined"==typeof exports?"undefined":_typeof(exports))&&"undefined"!=typeof module?module.exports=e():"function"==typeof define&&define.amd?define(e):t.LazyLoad=e()}(this,function(){"use strict";var t="undefined"!=typeof window,e=t&&!("onscroll"in window)||"undefined"!=typeof navigator&&/(gle|ing|ro)bot|crawl|spider/i.test(navigator.userAgent),n=t&&"IntersectionObserver"in window,o=t&&"classList"in document.createElement("p"),r={elements_selector:"img",container:e||t?document:null,threshold:300,thresholds:null,data_src:"src",data_srcset:"srcset",data_sizes:"sizes",data_bg:"bg",class_loading:"loading",class_loaded:"loaded",class_error:"error",load_delay:0,auto_unobserve:!0,callback_enter:null,callback_exit:null,callback_reveal:null,callback_loaded:null,callback_error:null,callback_finish:null,use_native:!1},a=function(t,e){var n,o=new t(e);try{n=new CustomEvent("LazyLoad::Initialized",{detail:{instance:o}})}catch(t){(n=document.createEvent("CustomEvent")).initCustomEvent("LazyLoad::Initialized",!1,!1,{instance:o})}window.dispatchEvent(n)};var i=function(t,e){return t.getAttribute("data-"+e)},s=function(t,e,n){var o="data-"+e;null!==n?t.setAttribute(o,n):t.removeAttribute(o)},c=function(t){return"true"===i(t,"was-processed")},l=function(t,e){return s(t,"ll-timeout",e)},u=function(t){return i(t,"ll-timeout")},d=function(t,e){t&&t(e)},f=function(t,e){t._loadingCount+=e,0===t._elements.length&&0===t._loadingCount&&d(t._settings.callback_finish)},_=function(t){for(var e,n=[],o=0;e=t.children[o];o+=1)"SOURCE"===e.tagName&&n.push(e);return n},v=function(t,e,n){n&&t.setAttribute(e,n)},g=function(t,e){v(t,"sizes",i(t,e.data_sizes)),v(t,"srcset",i(t,e.data_srcset)),v(t,"src",i(t,e.data_src))},m={IMG:function(t,e){var n=t.parentNode;n&&"PICTURE"===n.tagName&&_(n).forEach(function(t){g(t,e)});g(t,e)},IFRAME:function(t,e){v(t,"src",i(t,e.data_src))},VIDEO:function(t,e){_(t).forEach(function(t){v(t,"src",i(t,e.data_src))}),v(t,"src",i(t,e.data_src)),t.load()}},b=function(t,e){var n,o,r=e._settings,a=t.tagName,s=m[a];if(s)return s(t,r),f(e,1),void(e._elements=(n=e._elements,o=t,n.filter(function(t){return t!==o})));!function(t,e){var n=i(t,e.data_src),o=i(t,e.data_bg);n&&(t.style.backgroundImage='url("'.concat(n,'")')),o&&(t.style.backgroundImage=o)}(t,r)},h=function(t,e){o?t.classList.add(e):t.className+=(t.className?" ":"")+e},p=function(t,e,n){t.addEventListener(e,n)},y=function(t,e,n){t.removeEventListener(e,n)},E=function(t,e,n){y(t,"load",e),y(t,"loadeddata",e),y(t,"error",n)},w=function(t,e,n){var r=n._settings,a=e?r.class_loaded:r.class_error,i=e?r.callback_loaded:r.callback_error,s=t.target;!function(t,e){o?t.classList.remove(e):t.className=t.className.replace(new RegExp("(^|\\s+)"+e+"(\\s+|$)")," ").replace(/^\s+/,"").replace(/\s+$/,"")}(s,r.class_loading),h(s,a),d(i,s),f(n,-1)},I=function(t,e){var n=function n(r){w(r,!0,e),E(t,n,o)},o=function o(r){w(r,!1,e),E(t,n,o)};!function(t,e,n){p(t,"load",e),p(t,"loadeddata",e),p(t,"error",n)}(t,n,o)},k=["IMG","IFRAME","VIDEO"],A=function(t,e){var n=e._observer;z(t,e),n&&e._settings.auto_unobserve&&n.unobserve(t)},L=function(t){var e=u(t);e&&(clearTimeout(e),l(t,null))},x=function(t,e){var n=e._settings.load_delay,o=u(t);o||(o=setTimeout(function(){A(t,e),L(t)},n),l(t,o))},z=function(t,e,n){var o=e._settings;!n&&c(t)||(k.indexOf(t.tagName)>-1&&(I(t,e),h(t,o.class_loading)),b(t,e),function(t){s(t,"was-processed","true")}(t),d(o.callback_reveal,t),d(o.callback_set,t))},O=function(t){return!!n&&(t._observer=new IntersectionObserver(function(e){e.forEach(function(e){return function(t){return t.isIntersecting||t.intersectionRatio>0}(e)?function(t,e){var n=e._settings;d(n.callback_enter,t),n.load_delay?x(t,e):A(t,e)}(e.target,t):function(t,e){var n=e._settings;d(n.callback_exit,t),n.load_delay&&L(t)}(e.target,t)})},{root:(e=t._settings).container===document?null:e.container,rootMargin:e.thresholds||e.threshold+"px"}),!0);var e},N=["IMG","IFRAME"],C=function(t,e){return function(t){return t.filter(function(t){return!c(t)})}((n=t||function(t){return t.container.querySelectorAll(t.elements_selector)}(e),Array.prototype.slice.call(n)));var n},M=function(t,e){this._settings=function(t){return _extends({},r,t)}(t),this._loadingCount=0,O(this),this.update(e)};return M.prototype={update:function(t){var n,o=this,r=this._settings;(this._elements=C(t,r),!e&&this._observer)?(function(t){return t.use_native&&"loading"in HTMLImageElement.prototype}(r)&&((n=this)._elements.forEach(function(t){-1!==N.indexOf(t.tagName)&&(t.setAttribute("loading","lazy"),z(t,n))}),this._elements=C(t,r)),this._elements.forEach(function(t){o._observer.observe(t)})):this.loadAll()},destroy:function(){var t=this;this._observer&&(this._elements.forEach(function(e){t._observer.unobserve(e)}),this._observer=null),this._elements=null,this._settings=null},load:function(t,e){z(t,this,e)},loadAll:function(){var t=this;this._elements.forEach(function(e){A(e,t)})}},t&&function(t,e){if(e)if(e.length)for(var n,o=0;n=e[o];o+=1)a(t,n);else a(t,e)}(M,window.lazyLoadOptions),M});

;
(function ($, Drupal, LazyLoad) {
  "use strict";

  Drupal.behaviors.CohesionLazyLoad = {
    attach: function (context, settings) {

      function isScrollable(el) {
        return (el.scrollWidth > el.clientWidth && (getComputedStyle(el).overflowY === 'auto' || getComputedStyle(el).overflowY === 'scroll')) ||
                    (el.scrollHeight > el.clientHeight  && (getComputedStyle(el).overflowX === 'auto' || getComputedStyle(el).overflowX === 'scroll')) ||
                    el.tagName === 'HTML';
      }

      $.each($('[loading=lazy]', context).once(), function() {
        var $this = $(this);
        $this.parents().each(function() {
          var $parent = $(this);
          if($parent.data('lazyContainerFound') === true) {
            return false;
          } else if(isScrollable(this)) {
            $parent.data('lazyContainerFound', true);
            var llContainer = new LazyLoad({
              container: this.tagName === 'HTML' ? document : this,
              elements_selector: "[loading=lazy]",
              class_loading: 'coh-lazy-loading',
              class_loaded: 'coh-lazy-loaded',
              class_error: 'coh-lazy-error',
              use_native: true
            });
            return false;
          }
        });

        $this.on('load', function () {
          if ($(this).length) {
            $.fn.matchHeight._update();
          }
        });
      });
    }
  };

})(jQuery, Drupal, LazyLoad);
;
/*! animate.js v1.4.1 | (c) 2018 Josh Johnson | https://github.com/jshjohnson/animate.js */
(function(root, factory) {
  if (typeof define === "function" && define.amd) {
    define(factory);
  } else if (typeof exports === "object") {
    module.exports = factory(root);
  } else {
    root.Animate = factory();
  }
})(this, function() {
  "use strict";

  var Animate = function(userOptions) {
    var el = document.createElement("fakeelement");
    var defaultOptions = {
      target: "[data-animate]",
      animatedClass: "js-animated",
      offset: [0.5, 0.5],
      delay: 0,
      remove: true,
      scrolled: false,
      reverse: false,
      onLoad: true,
      onScroll: true,
      onResize: false,
      disableFilter: null,
      callbackOnInit: function() {},
      callbackOnInView: function() {}
    };

    this.supports =
      "querySelector" in document &&
      "addEventListener" in window &&
      "classList" in el &&
      Function.prototype.bind;
    this.options = this._extend(defaultOptions, userOptions || {});
    this.elements = document.querySelectorAll(this.options.target);
    this.initialised = false;

    this.verticalOffset = this.options.offset;
    this.horizontalOffset = this.options.offset;

    // Offset can be [y, x] or the same value can be used for both
    if (this._isType("Array", this.options.offset)) {
      this.verticalOffset = this.options.offset[0];
      this.horizontalOffset = this.options.offset[1]
        ? this.options.offset[1]
        : this.options.offset[0];
    }

    this.throttledEvent = this._debounce(
      function() {
        this.render();
      }.bind(this),
      15
    );
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  // @private
  // @author David Walsh
  // @link https://davidwalsh.name/javascript-debounce-function
  Animate.prototype._debounce = function(func, wait, immediate) {
    var timeout;
    return function() {
      var context = this;
      var args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) {
          func.apply(context, args);
        }
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) {
        func.apply(context, args);
      }
    };
  };

  /**
   * Merges unspecified amount of objects into new object
   * @private
   * @return {Object} Merged object of arguments
   */
  Animate.prototype._extend = function() {
    var extended = {};
    var length = arguments.length;

    /**
     * Merge one object into another
     * @param  {Object} obj  Object to merge into extended object
     */
    var merge = function(obj) {
      for (var prop in obj) {
        if (Object.hasOwnProperty.call(obj, prop)) {
          extended[prop] = obj[prop];
        }
      }
    };

    // Loop through each passed argument
    for (var i = 0; i < length; i++) {
      // Store argument at position i
      var obj = arguments[i];

      // If we are in fact dealing with an object, merge it. Otherwise throw error
      if (this._isType("Object", obj)) {
        merge(obj);
      } else {
        console.error("Custom options must be an object");
      }
    }

    return extended;
  };

  /**
   * Determines when an animation has completed
   * @author  David Walsh
   * @link https://davidwalsh.name/css-animation-callback
   * @private
   * @return {String} Appropriate 'animationEnd' event for browser to handle
   */
  Animate.prototype._whichAnimationEvent = function() {
    var t;
    var el = document.createElement("fakeelement");

    var animations = {
      animation: "animationend",
      OAnimation: "oAnimationEnd",
      MozAnimation: "animationend",
      WebkitAnimation: "webkitAnimationEnd"
    };

    for (t in animations) {
      if (Object.hasOwnProperty.call(animations, t)) {
        if (el.style[t] !== undefined) {
          return animations[t];
        }
      }
    }
  };

  /**
   * Determines whether we have already scrolled past the element
   * @param  {HTMLElement}  el Element to test
   * @return {Boolean}
   */
  Animate.prototype._isAboveScrollPos = function(el) {
    var dimensions = el.getBoundingClientRect();
    var scrollPos = window.scrollY || window.pageYOffset;

    return dimensions.top + dimensions.height * this.verticalOffset < scrollPos;
  };

  /**
   * Determines the offset for a particular element considering
   * any attribute overrides. Falls back to config options otherwise
   * @param  {HTMLElement} el Element to get offset for
   * @return {Array}    An offset array of [Y,X] offsets
   */
  Animate.prototype._getElementOffset = function(el) {
    var elementOffset = el.getAttribute("data-wow-offset");
    var elementOffsetArray = [this.verticalOffset, this.horizontalOffset];

    if (elementOffset) {
      var stringArray = elementOffset.split(",");
      if (stringArray.length === 1) {
        elementOffsetArray = [
          parseFloat(stringArray[0]),
          parseFloat(stringArray[0])
        ];
      } else {
        elementOffsetArray = [
          parseFloat(stringArray[0]),
          parseFloat(stringArray[1])
        ];
      }
    }

    return elementOffsetArray;
  };

  /**
   * Determine whether an element is within the viewport
   * @param  {HTMLElement}  el Element to test for
   * @return {String} Position of scroll
   * @return {Boolean}
   */
  Animate.prototype._isInView = function(el) {
    // Dimensions
    var dimensions = el.getBoundingClientRect();
    var viewportHeight =
      window.innerHeight || document.documentElement.clientHeight;
    var viewportWidth =
      window.innerWidth || document.documentElement.clientWidth;

    // Offset
    var elementOffset = this._getElementOffset(el);
    var verticalOffset = elementOffset[0];
    var horizontalOffset = elementOffset[1];

    // Vertical
    var isInViewFromTop = dimensions.bottom - verticalOffset > 0;
    var isInViewFromBottom = dimensions.top + verticalOffset < viewportHeight;
    var isInViewVertically = isInViewFromTop && isInViewFromBottom;

    // Horizontal
    var isInViewFromLeft = dimensions.right - horizontalOffset > 0;
    var isInViewFromRight = dimensions.left + horizontalOffset < viewportWidth;
    var isInViewHorizontally = isInViewFromLeft && isInViewFromRight;

    return isInViewVertically && isInViewHorizontally;
  };

  /**
   * Tests whether a DOM node's visibility attribute is set to true
   * @private
   * @param  {HTMLElement}  el Element to test
   * @return {Boolean}
   */
  Animate.prototype._isVisible = function(el) {
    var visibility = el.getAttribute("data-visibility");
    return visibility === "true";
  };

  /**
   * Tests whether a DOM node has already been animated
   * @private
   * @param  {HTMLElement}  el Element to test
   * @return {Boolean}
   */
  Animate.prototype._hasAnimated = function(el) {
    var animated = el.getAttribute("data-animated");
    return animated === "true";
  };

  /**
   * Test whether an object is of a give type
   * @private
   * @param  {String}  type Type to test for e.g. 'String', 'Array'
   * @param  {Object}  obj  Object to test type against
   * @return {Boolean}      Whether object is of a type
   */
  Animate.prototype._isType = function(type, obj) {
    var test = Object.prototype.toString.call(obj).slice(8, -1);
    return obj !== null && obj !== undefined && test === type;
  };

  /**
   * Add animation to given element
   * @private
   * @param {HTMLElement} el Element to target
   */
  Animate.prototype._addAnimation = function(el) {
    if (!this._isVisible(el)) {
      this._doCallback(this.options.callbackOnInView, el);

      var classes = el.getAttribute("data-animation-classes");
      if (classes) {
        el.setAttribute("data-visibility", true);
        var animations = classes.split(" ");

        if (el.getAttribute("data-wow-duration")) {
          el.style.animationDuration = el.getAttribute("data-wow-duration");
        }

        if (
          !el.style.iteration &&
          el.getAttribute("data-wow-iteration") &&
          parseInt(el.getAttribute("data-wow-iteration")) > 0
        ) {
          el.style.iteration = parseInt(el.getAttribute("data-wow-iteration"));
        } else {
          el.style.iteration = 1;
        }

        var animationDelay = el.getAttribute("data-wow-delay")
          ? el.getAttribute("data-wow-delay")
          : 0;
        if (typeof animationDelay === "string") {
          animationDelay = animationDelay.replace("s", "");
          animationDelay = parseFloat(animationDelay, 10);
        }

        var targetClass = this.options.target.replace(".", "");

        var addAnimation = function(animation) {
          el.classList.remove(targetClass);
          el.classList.add(animation);
        };

        if (
          animationDelay &&
          this._isType("Number", animationDelay) &&
          animationDelay !== 0
        ) {
          setTimeout(function() {
            animations.forEach(addAnimation);
          }, animationDelay * 1000);
        } else {
          animations.forEach(addAnimation);
        }

        this._completeAnimation(el);
      } else {
        console.error("No animation classes were given");
      }
    }
  };

  /**
   * Remove animation from given element
   * @private
   * @param {HTMLElement} el Element to target
   */
  Animate.prototype._removeAnimation = function(el) {
    var classes = el.getAttribute("data-animation-classes");
    if (classes) {
      el.setAttribute("data-visibility", false);
      el.removeAttribute("data-animated");
      var animations = classes.split(" ");
      var animationDelay = parseInt(el.getAttribute("data-wow-delay"), 10);
      var removeAnimation = function(animation) {
        el.classList.remove(animation);
      };

      animations.push(this.options.animatedClass);

      if (animationDelay && this._isType("Number", animationDelay)) {
        setTimeout(function() {
          animations.forEach(removeAnimation);
        }, animationDelay);
      } else {
        animations.forEach(removeAnimation);
      }
    } else {
      console.error("No animation classes were given");
    }
  };

  /**
   * If valid callback has been passed, run it with optional element as a parameter
   * @private
   * @param  {Function}         fn Callback function
   */
  Animate.prototype._doCallback = function(fn) {
    var el =
      arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    if (fn && this._isType("Function", fn)) {
      fn(el, this);
    } else {
      console.error("Callback is not a function");
    }
  };

  /**
   * Add class & data attribute to element on animation completion
   * @private
   * @param  {HTMLElement} el Element to target
   */
  Animate.prototype._completeAnimation = function(el) {
    // Store animation event
    var animationEvent = this._whichAnimationEvent();

    // When animation event has finished
    el.addEventListener(
      animationEvent,
      function() {
        var removeOverride = el.getAttribute("data-animation-remove");

        // If remove animations on completion option is turned on
        if (removeOverride !== "false" && this.options.remove) {
          // Separate each class held in the animation classes attribute
          var animations = el.getAttribute("data-animation-classes").split(" ");
          var removeAnimation = function(animation) {
            el.classList.remove(animation);
          };

          // Remove each animation from element
          animations.forEach(removeAnimation);
        }

        // Add animation complete class
        el.classList.add(this.options.animatedClass);
        // Set animated attribute to true
        el.setAttribute("data-animated", true);

        this._doCallback(this.iterations, el);
      }.bind(this)
    );
  };

  Animate.prototype.iterations = function(el, _context) {
    if (el.style.iteration > 1) {
      el.style.iteration -= 1;

      // Remove animation classes and re-run it.
      _context._removeAnimation(el);

      setTimeout(
        function() {
          _context._addAnimation(el);
        }.bind(_context),
        1
      );
    }
  };

  /**
   * Remove event listeners
   * @public
   */
  Animate.prototype.removeEventListeners = function() {
    if (this.options.onResize) {
      window.removeEventListener("resize", this.throttledEvent, false);
    }

    if (this.options.onScroll) {
      window.removeEventListener("scroll", this.throttledEvent, false);
    }
  };

  /**
   * Add event listeners
   * @public
   */
  Animate.prototype.addEventListeners = function() {
    if (this.options.onLoad && document.readyState === "loading") {
      document.addEventListener(
        "DOMContentLoaded",
        function() {
          this.render(true);
        }.bind(this)
      );
    } else if (this.options.onLoad) {
      this.render(true); // Call render immediately if document already loaded
    }

    if (this.options.onResize) {
      window.addEventListener("resize", this.throttledEvent, false);
    }

    if (this.options.onScroll) {
      window.addEventListener("scroll", this.throttledEvent, false);
    }
  };

  /**
   * Initializes Animate.js and adds event listeners
   * @public
   */
  Animate.prototype.init = function() {
    // If browser doesn't cut the mustard, let it fail silently
    if (!this.supports) return;

    // Copy the classes to data-animation-classes
    var els = this.elements;

    // Loop through all elements
    for (var i = els.length - 1; i >= 0; i--) {
      // Store element at location 'i'
      var el = els[i];

      if (!el.getAttribute("data-animation-classes")) {
        var animationClass = "";
        var targetClass = this.options.target.replace(".", "");

        for (var ci = 0; ci < el.classList.length; ci++) {
          if (el.classList[ci] === targetClass) {
            var animationClass = el.classList[ci + 1];

            el.setAttribute("data-animation-classes", animationClass);
            el.classList.remove(animationClass);
          }
        }
      }
    }

    this.initialised = true;

    this.addEventListeners();

    this._doCallback(this.options.callbackOnInit);
  };

  /**
   * Stop all running event listeners & resets options to null
   * @public
   */
  Animate.prototype.kill = function() {
    // If we haven't initialised, there is nothing to kill.
    if (!this.initialised) return;

    this.removeEventListeners();

    // Reset settings
    this.options = null;
    this.initialised = false;
  };

  /**
   * Toggles animations on an event
   * @public
   * @return {}
   */
  Animate.prototype.render = function(onLoad) {
    if (this.initialised) {
      // If a disability filter function has been passed...
      if (
        this.options.disableFilter &&
        this._isType("Function", this.options.disableFilter)
      ) {
        var test = this.options.disableFilter();
        // ...and it passes, kill render
        if (test === true) return;
      }

      // Grab all elements in the DOM with the correct target
      var els = this.elements;

      // Loop through all elements
      for (var i = els.length - 1; i >= 0; i--) {
        // Store element at location 'i'
        var el = els[i];

        // If element is in view
        if (this._isInView(el)) {
          // Add those snazzy animations
          this._addAnimation(el);
        } else if (this._hasAnimated(el)) {
          // See whether it has a reverse override
          var reverseOverride = el.getAttribute("data-animation-reverse");

          if (reverseOverride !== "false" && this.options.reverse) {
            this._removeAnimation(el);
          }
        } else if (onLoad) {
          var animateScrolled = el.getAttribute("data-animation-scrolled");

          // If this render has been triggered on load and the element is above our current
          // scroll position and the `scrolled` option is set, animate it.
          if (
            (this.options.scrolled || animateScrolled) &&
            this._isAboveScrollPos(el)
          ) {
            this._addAnimation(el);
          }
        }
      }
    }
  };

  return Animate;
});
;
(function($, Drupal, drupalSettings) {
  "use strict";

  Drupal.behaviors.DX8AnimateOnView = {
    attach: function(context, settings) {
      // User agent matches mobile and disabled.
      if (
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        ) &&
        drupalSettings.cohesion.animate_on_view_mobile !== "ENABLED"
      ) {
        $(".dx8-aov").removeClass("dx8-aov");
      } else {
        var animate = new Animate({
          target: ".dx8-aov",
          animatedClass: "animated",
          offset: [0, 0],
          remove: true,
          scrolled: true,
          reverse: false,
          onLoad: true,
          onScroll: true,
          onResize: true,
          disableFilter: false,
          callbackOnInit: function() {},
          callbackOnInView: function(el) {}
        });
        animate.init();
      }
    }
  };
})(jQuery, Drupal, drupalSettings);
;
/**
 * @file
 * Attaches behaviors for the Clientside Validation jQuery module.
 */
(function ($, Drupal) {

  'use strict';

  /**
   * Disable clientside validation for webforms.
   *
   * @type {Drupal~behavior}
   */
  Drupal.behaviors.webformClientSideValidationNoValidation = {
    attach: function (context) {
      $(context)
        .find('form[data-webform-clientside-validation-novalidate]')
        .once('webformClientSideValidationNoValidate')
        .each(function () {
          $(this).validate().destroy();
        });
    }
  };

})(jQuery, Drupal);
;
