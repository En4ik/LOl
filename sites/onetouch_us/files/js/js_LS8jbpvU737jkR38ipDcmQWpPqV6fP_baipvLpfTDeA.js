/*
 * Copyright 2015 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

if (!('inert' in HTMLElement.prototype)) {
  Object.defineProperty(HTMLElement.prototype, 'inert', {
    enumerable: true,

    /**
     * @return {boolean}
     * @this {Element}
     */
    get: function() { return this.hasAttribute('inert'); },

    /**
     * @param {boolean} inert
     * @this {Element}
     */
    set: function(inert) {
      if (inert) {
        this.setAttribute('inert', '');
      } else {
        this.removeAttribute('inert');
      }
    }
  });

  window.addEventListener('load', function() {
    function applyStyle(css) {
      var style = document.createElement('style');
      style.type = 'text/css';
      if (style.styleSheet) {
        style.styleSheet.cssText = css;
      } else {
        style.appendChild(document.createTextNode(css));
      }
      document.body.appendChild(style);
    }
    var css = "/*[inert]*/*[inert]{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;pointer-events:none}";
    applyStyle(css);

    /**
     * Sends a fake tab event. This is only supported by some browsers.
     *
     * @param {boolean=} opt_shiftKey whether to send this tab with shiftKey
     */
    function dispatchTabEvent(opt_shiftKey) {
      var ev = null;
      try {
        ev = new KeyboardEvent('keydown', {
          keyCode: 9,
          which: 9,
          key: 'Tab',
          code: 'Tab',
          keyIdentifier: 'U+0009',
          shiftKey: !!opt_shiftKey,
          bubbles: true
        });
      } catch (e) {
        try {
          // Internet Explorer
          ev = document.createEvent('KeyboardEvent');
          ev.initKeyboardEvent(
            'keydown',
            true,
            true,
            window,
            'Tab',
            0,
            opt_shiftKey ? 'Shift' : '',
            false,
            'en'
          )
        } catch (e) {}
      }
      if (ev) {
        try {
          Object.defineProperty(ev, 'keyCode', { value: 9 });
        } catch (e) {}
        document.dispatchEvent(ev);
      }
    }

    /**
     * Determines whether the specified element is inert, and returns the element
     * which caused this state. This is limited to, but may include, the body
     * element.
     *
     * @param {Element} e to check
     * @return {Element} element is made inert by, if any
     */
    function madeInertBy(e) {
      while (e && e !== document.documentElement) {
        if (e.hasAttribute('inert')) {
          return e;
        }
        e = e.parentElement;
      }
      return null;
    }

    /**
     * Finds the nearest shadow root from an element that's within said shadow root.
     *
     * TODO(samthor): We probably want to find the highest shadow root.
     *
     * @param {Element} e to check
     * @return {Node} shadow root, if any
     */
    var findShadowRoot = function(e) { return null; };
    if (window.ShadowRoot) {
      findShadowRoot = function(e) {
        while (e && e !== document.documentElement) {
          if (e instanceof window.ShadowRoot) { return e; }
          e = e.parentNode;
        }
        return null;
      }
    }

    /**
     * Returns the target of the passed event. If there's a path (shadow DOM only), then prefer it.
     *
     * @param {!Event} event
     * @return {Element} target of event
     */
    function targetForEvent(event) {
      var p = event.path;
      return  /** @type {Element} */ (p && p[0] || event.target);
    }

    // Hold onto the last tab direction: next (tab) or previous (shift-tab). This
    // can be used to step over inert elements in the correct direction. Mouse
    // or non-tab events should reset this and inert events should focus nothing.
    var lastTabDirection = 0;
    document.addEventListener('keydown', function(ev) {
      if (ev.keyCode === 9) {
        lastTabDirection = ev.shiftKey ? -1 : +1;
      } else {
        lastTabDirection = 0;
      }
    });
    document.addEventListener('mousedown', function(ev) {
      lastTabDirection = 0;
    });

    // Retain the currently focused shadowRoot.
    var focusedShadowRoot = null;
    function updateFocusedShadowRoot(root) {
      if (root == focusedShadowRoot) { return; }
      if (focusedShadowRoot) {
        if (!(focusedShadowRoot instanceof window.ShadowRoot)) {
          throw new Error('not shadow root: ' + focusedShadowRoot);
        }
        focusedShadowRoot.removeEventListener('focusin', shadowFocusHandler, true);  // remove
      }
      if (root) {
        root.addEventListener('focusin', shadowFocusHandler, true);  // add
      }
      focusedShadowRoot = root;
    }

    /**
     * Focus handler on a Shadow DOM host. This traps focus events within that root.
     *
     * @param {!Event} ev
     */
    function shadowFocusHandler(ev) {
      // ignore "direct" focus, we only want shadow root focus
      var last = ev.path[ev.path.length - 1];
      if (last === /** @type {*} */ (window)) { return; }
      sharedFocusHandler(targetForEvent(ev));
      ev.preventDefault();
      ev.stopPropagation();
    }

    /**
     * Called indirectly by both the regular focus handler and Shadow DOM host focus handler. This
     * is the bulk of the polyfill which prevents focus.
     *
     * @param {Element} target focused on
     */
    function sharedFocusHandler(target) {
      var inertElement = madeInertBy(target);
      if (!inertElement) { return; }

      // If the page has been tabbed recently, then focus the next element
      // in the known direction (if available).
      if (document.hasFocus() && lastTabDirection !== 0) {
        function getFocused() {
          return (focusedShadowRoot || document).activeElement;
        }

        // Send a fake tab event to enumerate through the browser's view of
        // focusable elements. This is supported in some browsers (not Firefox).
        var previous = getFocused();
        dispatchTabEvent(lastTabDirection < 0 ? true : false);
        if (previous != getFocused()) { return; }

        // Otherwise, enumerate through adjacent elements to find the next
        // focusable element. This won't respect any custom tabIndex.
        var filter = /** @type {NodeFilter} */ ({
          /**
           * @param {Node} node
           * @return {number}
           */
          acceptNode: function(node) {
            if (!node || !node.focus || node.tabIndex < 0) {
              return NodeFilter.FILTER_SKIP;  // look at descendants
            }
            var contained = inertElement.contains(node);
            return contained ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
          },
        });
        var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT, filter);
        walker.currentNode = inertElement;

        var nextFunc = Math.sign(lastTabDirection) === -1 ? walker.previousNode : walker.nextNode
        var next = nextFunc.bind(walker);
        for (var candidate; candidate = next(); ) {
          candidate.focus();
          if (getFocused() !== previous) { return; }
        }

        // FIXME: If a focusable element can't be found here, it's likely to mean
        // that this is the start or end of the page. Blurring is then not quite
        // right, as it prevents access to the browser chrome.
      }

      // Otherwise, immediately blur the targeted element. Technically, this
      // still generates focus and blur events on the element. This is (probably)
      // the price to pay for this polyfill.
      target.blur();
    }

    // The 'focusin' event bubbles, but instead, use 'focus' with useCapture set
    // to true as this is supported in Firefox. Additionally, target the body so
    // this doesn't generate superfluous events on document itself.
    document.body.addEventListener('focus', function(ev) {
      var target = targetForEvent(ev);
      updateFocusedShadowRoot((target == ev.target ? null : findShadowRoot(target)));
      sharedFocusHandler(target);  // either real DOM node or shadow node
    }, true);

    // Use a capturing click listener as both a safety fallback where pointer-events is not
    // available (IE10 and below), and to prevent accessKey access to inert elements.
    // TODO(samthor): Note that pointer-events polyfills trap more mouse events, e.g.-
    //   https://github.com/kmewhort/pointer_events_polyfill
    document.addEventListener('click', function(ev) {
      var target = targetForEvent(ev);
      if (madeInertBy(target)) {
        ev.preventDefault();
        ev.stopPropagation();
      }
    }, true);
  });
};
// https://github.com/cohesiondx8/accessible_modal_window - forked to here
;(function (w, doc, undefined) {
  'use strict';
  var ARIAmodal = {};
  w.ARIAmodal = ARIAmodal;
  ARIAmodal.NS = 'ARIAmodal';
  ARIAmodal.AUTHOR = 'Scott O\'Hara';
  ARIAmodal.VERSION = '3.4.0';
  ARIAmodal.LICENSE = 'https://github.com/scottaohara/accessible_modal_window/blob/master/LICENSE';
  var activeClass = 'modal-open';
  var body = doc.body;
  var main = doc.getElementsByTagName('main')[0] || body;
  var modal = doc.querySelectorAll('[data-modal]');
  var children = doc.querySelectorAll('body > *:not([data-modal])');
  var initialTrigger;
  var activeModal;
  var useAriaModal = false;
  var returnToBody = false;
  var firstClass = 'js-first-focus';
  var lastClass = 'js-last-focus';
  var tabFocusElements = 'button:not([hidden]):not([disabled]), [href]:not([hidden]), input:not([hidden]):not([type="hidden"]):not([disabled]), select:not([hidden]):not([disabled]), textarea:not([hidden]):not([disabled]), [tabindex="0"]:not([hidden]):not([disabled]), summary:not([hidden]), [contenteditable]:not([hidden]), audio[controls]:not([hidden]), video[controls]:not([hidden])';
  ARIAmodal.organizeDOM = function () {
    var refEl = body.firstElementChild || null;
    var i;
    for (i = 0; i < modal.length; i += 1) {
      body.insertBefore(modal[i], refEl)
    }
  };
  ARIAmodal.setupTrigger = function () {
    var trigger = doc.querySelectorAll('[data-modal-open]');
    var self;
    var i;
    for (i = 0; i < trigger.length; i += 1) {
      self = trigger[i];
      var getOpenTarget = self.getAttribute('data-modal-open');
      var hasHref = self.getAttribute('href');
      if (self.nodeName !== 'BUTTON') {
        self.setAttribute('role', 'button');
        self.tabIndex = 0
      }
      if (getOpenTarget === '' && hasHref) {
        self.setAttribute('data-modal-open', hasHref.split('#')[1]);
        getOpenTarget = hasHref.split('#')[1]
      }
      self.removeAttribute('href');
      if (getOpenTarget) {
        if (self.hasAttribute('disabled') && !self.hasAttribute('data-modal-disabled')) {
          self.removeAttribute('disabled')
        }
        self.removeAttribute('hidden');
        self.addEventListener('click', ARIAmodal.openModal);
        self.addEventListener('keydown', ARIAmodal.keyEvents, false)
      } else {
        console.warn('Missing target modal dialog - [data-modal-open="IDREF"]')
      }
    }
  };
  ARIAmodal.setupModal = function () {
    var self;
    var i;
    for (i = 0; i < modal.length; i += 1) {
      var self = modal[i];
      var modalType = self.getAttribute('data-modal');
      var getClass = self.getAttribute('data-modal-class') || 'a11y-modal';
      var heading = self.querySelector('h1, h2, h3, h4, h5, h6');
      var modalLabel = self.getAttribute('data-modal-label');
      var hideHeading = self.hasAttribute('data-modal-hide-heading');
      var modalDesc = self.querySelector('[data-modal-description]');
      var modalDoc = self.querySelector('[data-modal-document]');
      if (modalType === 'alert') {
        self.setAttribute('role', 'alertdialog')
      } else {
        self.setAttribute('role', 'dialog')
      }
      self.classList.add(getClass);
      self.hidden = true;
      self.tabIndex = '-1';
      if (modalDoc) {
        modalDoc.setAttribute('role', 'document')
      }
      ARIAmodal.setupModalCloseBtn(self, getClass, modalType);
      if (self.hasAttribute('data-aria-modal')) {
        self.setAttribute('aria-modal', 'true')
      }
      if (modalDesc) {
        modalDesc.id = modalDesc.id || 'md_desc_' + Math.floor(Math.random() * 999) + 1;
        self.setAttribute('aria-describedby', modalDesc.id)
      }
      if (modalLabel) {
        self.setAttribute('aria-label', modalLabel)
      } else {
        if (heading) {
          var makeHeading = self.id + '_heading';
          heading.classList.add(getClass + '__heading');
          heading.id = makeHeading;
          self.setAttribute('aria-labelledby', makeHeading);
          if (heading.hasAttribute('data-autofocus')) {
            heading.tabIndex = '-1'
          }
        } else {
          console.warn('Dialogs should have their purpose conveyed by a heading element (h1).')
        }
      }
      if (hideHeading) {
        self.querySelector('#' + heading.id).classList.add('at-only')
      }
      var focusable = self.querySelectorAll(tabFocusElements);
      focusable[0].classList.add(firstClass);
      focusable[focusable.length - 1].classList.add(lastClass)
    }
  };
  ARIAmodal.setupModalCloseBtn = function (self, modalClass, modalType) {
    var doNotGenerate = self.hasAttribute('data-modal-manual-close');
    var manualClose = self.querySelectorAll('[data-modal-close-btn]');
    var modalClose = self.getAttribute('data-modal-close');
    var modalCloseClass = self.getAttribute('data-modal-close-class');
    var closeIcon = '<span data-modal-x></span>';
    var btnClass = modalClass;
    var i;
    if (!doNotGenerate) {
      if (manualClose.length < 2) {
        var closeBtn = doc.createElement('button');
        closeBtn.type = 'button';
        self.classList.add(modalClass);
        closeBtn.classList.add(modalClass + '__close-btn');
        if (!modalClose && modalType !== 'alert') {
          closeBtn.innerHTML = closeIcon;
          closeBtn.setAttribute('aria-label', 'Close');
          closeBtn.classList.add('is-icon-btn')
        } else {
          closeBtn.innerHTML = modalClose;
          if (modalCloseClass) {
            closeBtn.classList.add(modalCloseClass)
          }
        }
        if (modalType !== 'alert') {
          if (self.querySelector('[role="document"]')) {
            self.querySelector('[role="document"]').appendChild(closeBtn)
          } else {
            self.appendChild(closeBtn)
          }
        }
        closeBtn.addEventListener('click', ARIAmodal.closeModal)
      }
    }
    for (i = 0; i < manualClose.length; i += 1) {
      manualClose[i].addEventListener('click', ARIAmodal.closeModal)
    }
    doc.addEventListener('keydown', ARIAmodal.keyEvents, false)
  };
  ARIAmodal.openModal = function (e, autoOpen) {
    var i;
    var getTargetModal = autoOpen || this.getAttribute('data-modal-open');
    activeModal = doc.getElementById(getTargetModal);
    var focusTarget = activeModal;
    var getAutofocus = activeModal.querySelector('[autofocus]') || activeModal.querySelector('[data-autofocus]');
    var setInert = activeModal.hasAttribute('data-coh-modal-overlay');
    useAriaModal = activeModal.hasAttribute('aria-modal');
    if (autoOpen) {
      returnToBody = true
    }
    if (!autoOpen) {
      e.preventDefault();
      initialTrigger = this.id
    }
    if (getAutofocus) {
      focusTarget = getAutofocus
    } else if (activeModal.hasAttribute('data-modal-close-focus')) {
      focusTarget = activeModal.querySelector('[class*="close-btn"]')
    }
    if (!body.classList.contains(activeClass)) {
      body.classList.add(activeClass);

      if(setInert) {
        for (i = 0; i < children.length; i += 1) {
          if (!useAriaModal) {
            if (children[i].hasAttribute('aria-hidden')) {
              children[i].setAttribute('data-keep-hidden', children[i].getAttribute('aria-hidden'))
            }
            children[i].setAttribute('aria-hidden', 'true')
          }
          if (children[i].getAttribute('inert')) {
            children[i].setAttribute('data-keep-inert', '')
          } else {
            children[i].setAttribute('inert', 'true')
          }
        }
      }
    } else {
      console.warn('It is not advised to open dialogs from within other dialogs. Instead consider replacing the contents of this dialog with new content. Or providing a stepped, or tabbed interface within this dialog.')
    }
    activeModal.removeAttribute('hidden');
    requestAnimationFrame(function () {
      focusTarget.focus()
    });

    return [initialTrigger, activeModal, returnToBody]
  };
  ARIAmodal.closeModal = function (e) {
    var trigger = doc.getElementById(initialTrigger) || null;
    var i;
    var m;
    for (i = 0; i < children.length; i += 1) {
      if (!children[i].hasAttribute('data-keep-inert')) {
        children[i].removeAttribute('inert')
      }
      children[i].removeAttribute('data-keep-inert');
      if (children[i].getAttribute('data-keep-hidden')) {
        children[i].setAttribute('aria-hidden', children[i].getAttribute('data-keep-hidden'))
      } else {
        children[i].removeAttribute('aria-hidden')
      }
      children[i].removeAttribute('data-keep-hidden')
    }
    body.classList.remove(activeClass);
    for (m = 0; m < modal.length; m += 1) {
      if (!modal[m].hasAttribute('hidden')) {
        modal[m].hidden = true
      }
    }
    if (trigger !== null) {
      trigger.focus()
    } else {
      if (main && !returnToBody) {
        main.tabIndex = -1;
        main.focus()
      } else {
        body.tabIndex = -1;
        body.focus()
      }
    }
    initialTrigger = undefined;
    activeModal = undefined;
    returnToBody = false;
    return [initialTrigger, activeModal, returnToBody]
  };
  ARIAmodal.keyEvents = function (e) {
    var keyCode = e.keyCode || e.which;
    var escKey = 27;
    var enterKey = 13;
    var spaceKey = 32;
    var tabKey = 9;
    if (e.target.hasAttribute('data-modal-open')) {
      switch (keyCode) {
        case enterKey:
        case spaceKey:
          e.preventDefault();
          e.target.click();
          break
      }
    }
    if (body.classList.contains(activeClass)) {
      switch (keyCode) {
        case escKey:
          ARIAmodal.closeModal();
          break;
        default:
          break
      }
      if (body.classList.contains(activeClass)) {
        var firstFocus = activeModal.querySelector('.' + firstClass);
        var lastFocus = activeModal.querySelector('.' + lastClass)
      }
      if (doc.activeElement.classList.contains(lastClass)) {
        if (keyCode === tabKey && !e.shiftKey) {
          e.preventDefault();
          firstFocus.focus()
        }
      }
      if (doc.activeElement.classList.contains(firstClass)) {
        if (keyCode === tabKey && e.shiftKey) {
          e.preventDefault();
          lastFocus.focus()
        }
      }
    }
  };

  ARIAmodal.autoLoad = function () {
    var getAuto = doc.querySelectorAll('[data-modal-auto]');
    var hashValue = w.location.hash || null;
    var autoOpen;
    var useHash = false;
    var e = null;
    if (hashValue !== null) {
      autoOpen = hashValue.split('#')[1];
      if (autoOpen === '') {
        return false
      } else if (autoOpen === '!null') {
        return false
      } else {
        var checkforDialog = doc.getElementById(autoOpen) || null;
        if (checkforDialog !== null) {
          if (checkforDialog.getAttribute('role') === 'dialog' || checkforDialog.getAttribute('role') === 'alertdialog') {
            useHash = true
          }
        }
      }
    }
    if (useHash) {
      ARIAmodal.openModal(e, autoOpen);
      if (getAuto.length > 1) {
        console.warn('Only the modal indicated by the hash value will load.')
      }
    } else if (getAuto.length !== 0) {
      if (getAuto[0].getAttribute('role') === 'dialog' || getAuto[0].getAttribute('role') === 'alertdialog') {
        autoOpen = getAuto[0].id;
        ARIAmodal.openModal(e, autoOpen);
        if (getAuto.length > 1) {
          console.warn('Multiple modal dialogs can not auto load.')
        }
      } else if (getAuto[0].getAttribute('role') === 'button' || getAuto[0].tagName === 'BUTTON') {
        autoOpen = getAuto[0].id;
        getAuto[0].click()
      }
    }
    if (getAuto.length !== 0 && !doc.getElementById(autoOpen).hasAttribute('data-modal-auto-persist')) {
      w.location.replace("#!null")
    }
  };
  ARIAmodal.init = function () {
    ARIAmodal.organizeDOM();
    ARIAmodal.setupTrigger();
    ARIAmodal.setupModal();
    ARIAmodal.autoLoad()
  };
  ARIAmodal.init()
})(window, document);;
(function ($, Drupal) {
  "use strict";

  Drupal.behaviors.CohesionModal = {
    attach: function (context) {

      $.each($('.coh-modal', context).once('coh-js-modal-init'), function () {

        var $this = $(this);
        var modalAnimation = $this.data('cohModalAnimation');
        var modalDelayOpen = $this.data('cohModalDelayOpen') || 0;
        var modalDelayClose = $this.data('cohModalDelayClose') || 0;
        var $modalInner = $this.find('> .coh-modal-inner');
        var $modalOverlay = $this.find('> .coh-modal-overlay');
        var $modalCloseWrapper = $this.find('> .coh-modal-close-wrapper');
        var animOptions = {}
        var overlayAnimOptions = {effect: 'fade', duration: 150};
        var delayOpenTimeout, delayCloseTimeout;
        var openClass = 'is-open';

        if (modalAnimation && modalAnimation.effect !== 'none') {
          animOptions = {
            effect: modalAnimation.effect,
            direction: modalAnimation.direction,
            distance: modalAnimation.distance,
            size: modalAnimation.size,
            horizFirst: modalAnimation.horizFirst,
            times: modalAnimation.times,
            easing: modalAnimation.easing,
            duration: modalAnimation.duration
          };
        }

          if (modalAnimation && modalAnimation.effect === 'none') {
              animOptions = {
                  duration: 0
              };
          }

        var openAnimOptions = $.extend({}, animOptions);
        var closeAnimOptions = $.extend({
          complete: function () {
            $this.hide();

            $($this).removeClass(openClass);
            $($modalInner).removeClass(openClass);

            Drupal.detachBehaviors($this[0]);
          }
        }, animOptions);

        openAnimOptions.complete = function() {
          // Run Drupal behaviors for anything that is hidden
          Drupal.attachBehaviors($this[0]);

          $($this).addClass(openClass);
          $($modalInner).addClass(openClass);
        };

        if ($this.attr('coh-data-modal-auto-close') !== undefined && modalDelayClose) {
          openAnimOptions.complete = function() {
            // Run Drupal behaviors for anything that is hidden
            Drupal.attachBehaviors($this[0]);
            delayCloseTimeout = setTimeout(function() {
              window.ARIAmodal.closeModal();

              $($this).addClass(openClass);
              $($modalInner).addClass(openClass);

            }, modalDelayClose);
          };
        }

        // Load on init if it's supposed to.
        if ($this.attr('data-modal-auto') !== undefined && $this.attr('hidden') === undefined) {
          delayOpenTimeout = setTimeout(function () {

            $this.show();

            if ($modalCloseWrapper.length) {
              $modalCloseWrapper.show(overlayAnimOptions);
            }

            if ($modalOverlay.length) {
              $modalOverlay.show(overlayAnimOptions);
              $('body').addClass('coh-modal-overlay-open');
            }

            $modalInner.show(openAnimOptions);
          }, modalDelayOpen);
        }

        // Watch the hidden attribute set by modal plugin and run anims if they are set.
        var onMutate = function(mutationsList, observer) {
          mutationsList.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'hidden') {
              var $modalContainer = $(mutation.target);
              var $modal = $modalContainer.find('> .coh-modal-inner');
              if (mutation.target['hidden']) {
                // close the modal
                window.clearTimeout(delayOpenTimeout);
                window.clearTimeout(delayCloseTimeout);

                if ($modalCloseWrapper.length) {
                  $modalCloseWrapper.hide(overlayAnimOptions);
                }

                if ($modalOverlay.length) {
                  $modalOverlay.hide(overlayAnimOptions);
                  $('body').removeClass('coh-modal-overlay-open');
                };

                $modal.hide(closeAnimOptions);
              } else {
                // open the modal
                window.clearTimeout(delayOpenTimeout);
                window.clearTimeout(delayCloseTimeout);

                if ($modalOverlay.length) {
                  $('body').addClass('coh-modal-overlay-open');
                }

                $modalContainer.show(0, function() {
                  $modal.show(openAnimOptions);

                  if ($modalCloseWrapper.length) {
                    $modalCloseWrapper.show(overlayAnimOptions);
                  }

                  if ($modalOverlay.length) {
                    $modalOverlay.show(overlayAnimOptions);
                  };
                });
              }
            }
          });
        };

        var observer = new MutationObserver(onMutate);
        observer.observe($this[0], {attributes: true});
      });
    }
  };

})(jQuery, Drupal);
;
/**!
* jquery-match-height 0.7.2 by @liabru
* http://brm.io/jquery-match-height/
* License: MIT
*/

;(function(factory) { // eslint-disable-line no-extra-semi
  'use strict';
  if (typeof define === 'function' && define.amd) {
    // AMD
    define(['jquery'], factory);
  } else if (typeof module !== 'undefined' && module.exports) {
    // CommonJS
    module.exports = factory(require('jquery'));
  } else {
    // Global
    factory(jQuery);
  }
})(function($) {
  /*
    *  internal
    */

  var _previousResizeWidth = -1,
    _updateTimeout = -1;

  /*
    *  _parse
    *  value parse utility function
    */

  var _parse = function(value) {
    // parse value and convert NaN to 0
    return parseFloat(value) || 0;
  };

  /*
    *  _rows
    *  utility function returns array of jQuery selections representing each row
    *  (as displayed after float wrapping applied by browser)
    */

  var _rows = function(elements) {
    var tolerance = 1,
      $elements = $(elements),
      lastTop = null,
      rows = [];

    // group elements by their top position
    $elements.each(function(){
      var $that = $(this),
        top = $that.offset().top - _parse($that.css('margin-top')),
        lastRow = rows.length > 0 ? rows[rows.length - 1] : null;

      if (lastRow === null) {
        // first item on the row, so just push it
        rows.push($that);
      } else {
        // if the row top is the same, add to the row group
        if (Math.floor(Math.abs(lastTop - top)) <= tolerance) {
          rows[rows.length - 1] = lastRow.add($that);
        } else {
          // otherwise start a new row group
          rows.push($that);
        }
      }

      // keep track of the last row top
      lastTop = top;
    });

    return rows;
  };

  /*
    *  _parseOptions
    *  handle plugin options
    */

  var _parseOptions = function(options) {
    var opts = {
      byRow: true,
      property: 'height',
      target: null,
      remove: false
    };

    if (typeof options === 'object') {
      return $.extend(opts, options);
    }

    if (typeof options === 'boolean') {
      opts.byRow = options;
    } else if (options === 'remove') {
      opts.remove = true;
    }

    return opts;
  };

  /*
    *  matchHeight
    *  plugin definition
    */

  var matchHeight = $.fn.matchHeight = function(options) {
    var opts = _parseOptions(options);

    // handle remove
    if (opts.remove) {
      var that = this;

      // remove fixed height from all selected elements
      this.css(opts.property, '');

      // remove selected elements from all groups
      $.each(matchHeight._groups, function(key, group) {
        group.elements = group.elements.not(that);
      });

      // TODO: cleanup empty groups

      return this;
    }

    if (this.length <= 1 && !opts.target) {
      return this;
    }

    // keep track of this group so we can re-apply later on load and resize events
    matchHeight._groups.push({
      elements: this,
      options: opts
    });

    // match each element's height to the tallest element in the selection
    matchHeight._apply(this, opts);

    return this;
  };

  /*
    *  plugin global options
    */

  matchHeight.version = '0.7.2';
  matchHeight._groups = [];
  matchHeight._throttle = 80;
  matchHeight._maintainScroll = false;
  matchHeight._beforeUpdate = null;
  matchHeight._afterUpdate = null;
  matchHeight._rows = _rows;
  matchHeight._parse = _parse;
  matchHeight._parseOptions = _parseOptions;

  /*
    *  matchHeight._apply
    *  apply matchHeight to given elements
    */

  matchHeight._apply = function(elements, options) {
    var opts = _parseOptions(options),
      $elements = $(elements),
      rows = [$elements];

    // take note of scroll position
    var scrollTop = $(window).scrollTop(),
      htmlHeight = $('html').outerHeight(true);

    // get hidden parents
    var $hiddenParents = $elements.parents().filter(':hidden');

    // cache the original inline style
    $hiddenParents.each(function() {
      var $that = $(this);
      $that.data('style-cache', $that.attr('style'));
    });

    // temporarily must force hidden parents visible
    $hiddenParents.css('display', 'block');

    // get rows if using byRow, otherwise assume one row
    if (opts.byRow && !opts.target) {

      // must first force an arbitrary equal height so floating elements break evenly
      $elements.each(function() {
        var $that = $(this),
          display = $that.css('display');

        // temporarily force a usable display value
        if (display !== 'inline-block' && display !== 'flex' && display !== 'inline-flex') {
          display = 'block';
        }

        // cache the original inline style
        $that.data('style-cache', $that.attr('style'));

        $that.css({
          'display': display,
          'padding-top': '0',
          'padding-bottom': '0',
          'margin-top': '0',
          'margin-bottom': '0',
          'border-top-width': '0',
          'border-bottom-width': '0',
          'height': '100px',
          'overflow': 'hidden'
        });
      });

      // get the array of rows (based on element top position)
      rows = _rows($elements);

      // revert original inline styles
      $elements.each(function() {
        var $that = $(this);
        $that.attr('style', $that.data('style-cache') || '');
      });
    }

    $.each(rows, function(key, row) {
      var $row = $(row),
        targetHeight = 0;

      if (!opts.target) {
        // skip apply to rows with only one item
        if (opts.byRow && $row.length <= 1) {
          $row.css(opts.property, '');
          return;
        }

        // iterate the row and find the max height
        $row.each(function(){
          var $that = $(this),
            style = $that.attr('style'),
            display = $that.css('display');

          // temporarily force a usable display value
          if (display !== 'inline-block' && display !== 'flex' && display !== 'inline-flex') {
            display = 'block';
          }

          // ensure we get the correct actual height (and not a previously set height value)
          var css = { 'display': display };
          css[opts.property] = '';
          $that.css(css);

          // find the max height (including padding, but not margin)
          if ($that.outerHeight(false) > targetHeight) {
            targetHeight = $that.outerHeight(false);
          }

          // revert styles
          if (style) {
            $that.attr('style', style);
          } else {
            $that.css('display', '');
          }
        });
      } else {
        // if target set, use the height of the target element
        targetHeight = opts.target.outerHeight(false);
      }

      // iterate the row and apply the height to all elements
      $row.each(function(){
        var $that = $(this),
          verticalPadding = 0;

        // don't apply to a target
        if (opts.target && $that.is(opts.target)) {
          return;
        }

        // handle padding and border correctly (required when not using border-box)
        if ($that.css('box-sizing') !== 'border-box') {
          verticalPadding += _parse($that.css('border-top-width')) + _parse($that.css('border-bottom-width'));
          verticalPadding += _parse($that.css('padding-top')) + _parse($that.css('padding-bottom'));
        }

        // set the height (accounting for padding and border)
        $that.css(opts.property, (targetHeight - verticalPadding) + 'px');
      });
    });

    // revert hidden parents
    $hiddenParents.each(function() {
      var $that = $(this);
      $that.attr('style', $that.data('style-cache') || null);
    });

    // restore scroll position if enabled
    if (matchHeight._maintainScroll) {
      $(window).scrollTop((scrollTop / htmlHeight) * $('html').outerHeight(true));
    }

    return this;
  };

  /*
    *  matchHeight._applyDataApi
    *  applies matchHeight to all elements with a data-match-height attribute
    */

  matchHeight._applyDataApi = function() {
    var groups = {};

    // generate groups by their groupId set by elements using data-match-height
    $('[data-match-height], [data-mh]').each(function() {
      var $this = $(this),
        groupId = $this.attr('data-mh') || $this.attr('data-match-height');

      if (groupId in groups) {
        groups[groupId] = groups[groupId].add($this);
      } else {
        groups[groupId] = $this;
      }
    });

    // apply matchHeight to each group
    $.each(groups, function() {
      this.matchHeight(true);
    });
  };

  /*
    *  matchHeight._update
    *  updates matchHeight on all current groups with their correct options
    */

  var _update = function(event) {
    if (matchHeight._beforeUpdate) {
      matchHeight._beforeUpdate(event, matchHeight._groups);
    }

    $.each(matchHeight._groups, function() {
      matchHeight._apply(this.elements, this.options);
    });

    if (matchHeight._afterUpdate) {
      matchHeight._afterUpdate(event, matchHeight._groups);
    }
  };

  matchHeight._update = function(throttle, event) {
    // prevent update if fired from a resize event
    // where the viewport width hasn't actually changed
    // fixes an event looping bug in IE8
    if (event && event.type === 'resize') {
      var windowWidth = $(window).width();
      if (windowWidth === _previousResizeWidth) {
        return;
      }
      _previousResizeWidth = windowWidth;
    }

    // throttle updates
    if (!throttle) {
      _update(event);
    } else if (_updateTimeout === -1) {
      _updateTimeout = setTimeout(function() {
        _update(event);
        _updateTimeout = -1;
      }, matchHeight._throttle);
    }
  };

  /*
    *  bind events
    */

  // apply on DOM ready event
  $(matchHeight._applyDataApi);

  // use on or bind where supported
  var on = $.fn.on ? 'on' : 'bind';

  // update heights on load and resize events
  $(window)[on]('load orientationchange', function(event) {
    matchHeight._update(false, event);
  });

  // throttled update heights on resize events
  $(window)[on]('resize', function(event) {
    matchHeight._update(true, event);
  });

});
;
(function ($, Drupal, drupalSettings) {

  "use strict";

  Drupal.CohesionResponsiveBreakpoints = function (settings) {

    this.constants = {
      'desktop': 'desktop-first',
      'mobile': 'mobile-first',
      'widthType': {
        'fluid': 'fluid',
        'fixed': 'fixed'
      },
      'mediaQuery': {
        'all': 'all',
        'max': 'max-width',
        'min': 'min-width'
      }
    };

    // Custom responsive grid settings
    this.settings = settings || drupalSettings.cohesion.responsive_grid_settings;

    // Array of breakpoints in the correct order
    this.breakpoints = [];
        
    // Keyed list of listeners
    this.listeners = {};

    /**
         * Init when first loaded to do some setup
         */
    this.init = function () {

      this.sortBreakpoints();
    };

    /**
         * Returns the current media query depending on the breakpoint "key" passed
         * @param {string} breakpoint xs|ps|sm|md|lg|xl
         */
    this.getBreakpointMediaQuery = function (breakpoint) {

      if (this.getGridType() === this.constants.mobile) {

        if (breakpoint === this.getFirstBreakpoint()) {

          return this.constants.mediaQuery.all;

        } else {

          if (typeof this.getBreakpoints()[breakpoint] !== 'undefined') {

            return '(min-width: ' + this.getBreakpointWidth(breakpoint) + 'px)';

          } else {

            // Custom breakpoint
            return '(min-width: ' + breakpoint + 'px)';
          }
        }
      }

      if (this.getGridType() === this.constants.desktop) {

        var breakpointIndex = this.getBreakpointIndex(breakpoint);

        var minWidth = 0;
        var breakpointMaxWidth = false;

        if (breakpoint !== this.getLastBreakpoint()) {
          minWidth = this.getBreakpointWidth(this.breakpoints[breakpointIndex].key);
        }

        if (breakpoint !== this.getFirstBreakpoint()) {
          breakpointMaxWidth = this.getBreakpointWidth(this.breakpoints[breakpointIndex - 1].key) - 1;
        }

        var mediaQuery = '(min-width: ' + minWidth + 'px)';
        if (breakpointMaxWidth) {
          mediaQuery = mediaQuery + ' and (max-width: ' + breakpointMaxWidth + 'px)';
        }

        return mediaQuery;
      }
    };

    /**
         * Returns the key for the first breakpoint (xs||ps) etc
         * @returns {string}
         */
    this.getFirstBreakpoint = function () {
      return this.breakpoints[0].key;
    };

    /**
         * Returns the key for the last breakpoint (xs||ps) etc
         * @returns {string}
         */
    this.getLastBreakpoint = function () {
      return this.breakpoints[this.breakpoints.length - 1].key;
    };

    /**
         * Get the current grid type mobile / desktop first
         * @return {string} dekstop-fist || mobile-first
         */
    this.getGridType = function () {
      return this.settings.gridType;
    };
        
    /**
         * Simple helper function to determine if we are mobile first
         * @returns {Boolean}
         */
    this.isMobileFirst = function() {
      return this.settings.gridType === this.constants.mobile;
    };
        
    /**
         * Simple helper function to determine if we are desktop first
         * @returns {Boolean}
         */
    this.isDesktopFirst = function()    {
      return this.settings.gridType === this.constants.desktop;
    }

    /**
         * Gets the responsive width type - fluid || fixed
         * @param {string} breakpoint xs|ps|sm|md|lg|xl
         * @returns {string} fixed || fluid
         */
    this.getBreakpointType = function (breakpoint) {
      return this.settings.breakpoints[breakpoint].widthType;
    };

    /**
         * Returns the current breakpoint width depending on the breakpoint "key" passed
         * @param {string} breakpoint xs|ps|sm|md|lg|xl
         * @returns {int} breakpoint width
         */
    this.getBreakpointWidth = function (breakpoint) {
      return this.settings.breakpoints[breakpoint].width;
    };

    /**
         * Returns the min-width breakpoint
         * @param {string} breakpoint xs|ps|sm|md|lg|xl
         * @returns {int}
         */
    this.getBreakpointMediaWidth = function (breakpoint) {

      if (this.getGridType() === this.constants.mobile) {

        if (breakpoint === this.getFirstBreakpoint()) {

          return 0;

        } else {

          if (typeof this.getBreakpoints()[breakpoint] !== 'undefined') {

            return this.getBreakpointWidth(breakpoint);

          } else {

            // Custom breakpoint
            return breakpoint;
          }
        }
      }

      if (this.getGridType() === this.constants.desktop) {

        var breakpointIndex = this.getBreakpointIndex(breakpoint);

        var minWidth = 0;
        var breakpointMaxWidth = false;

        if (typeof this.breakpoints[breakpointIndex - 1] !== 'undefined') {
          minWidth = this.getBreakpointWidth(this.breakpoints[breakpointIndex].key);
        }

        if (breakpoint !== this.getFirstBreakpoint()) {
          breakpointMaxWidth = this.getBreakpointWidth(this.breakpoints[breakpointIndex - 1].key) - 1;
        }

        var mediaQuery = '(min-width: ' + minWidth + 'px)';
        if (breakpointMaxWidth) {
          mediaQuery = mediaQuery + ' and (max-width: ' + breakpointMaxWidth + 'px)';
        }

        return breakpointMaxWidth;
      }

    };

    /**
         * Returns the current breakpoint outerGutter depending on the breakpoint "key" passed
         * @param {string} breakpoint xs|ps|sm|md|lg|xl
         * @returns {int} outerGutter width
         */
    this.getBreakpointOuterGutter = function (breakpoint) {
      return this.settings.breakpoints[breakpoint].outerGutter;
    };

    /**
         * Returns the current breakpoint index depending on the breakpoint "key" passed
         * @param {string} breakpoint xs|ps|sm|md|lg|xl
         * @returns {int} position of the breakpoint
         */
    this.getBreakpointIndex = function (breakpoint) {
      for (var i = 0; i < this.breakpoints.length; i++) {
        if (this.breakpoints[i].key === breakpoint) {
          return i;
        }
      }
    };

    /**
         * Returns a list of the breakpoint settings
         * @returns {object}
         */
    this.getBreakpoints = function () {
      return this.settings.breakpoints;
    };

    /**
         * Returns the settings for a specific breakpoint depending on the breakpoint "key" passed
         * @param {string} breakpoint xs|ps|sm|md|lg|xl
         */
    this.getBreakpointSettings = function (breakpoint) {
      return this.settings.breakpoints[breakpoint];
    };

    /**
         * Returns the settings for the current matched breakpoint
         * @returns {object}
         */
    this.getCurrentBreakpoint = function () {

      var match = false;

      for (var i = 0; i < this.breakpoints.length; i++) {
        // Set the first item to match as this is the default
        if (i === 0) {
          match = this.breakpoints[i];
        }

        // Check for matches
        var m = window.matchMedia(this.getBreakpointMediaQuery(this.breakpoints[i].key));
        if (m.matches) {
          match = this.breakpoints[i];
        }
      }
      return match;
    };

    /**
         * Patch to help out Safari understand where the object actually is
         * @param {Object} - The returned `MediaQueryListEvent` from the `window`
         * @returns {Object} - `MediaQueryListEvent`
         */
    this.getMediaQueryListEventObject = function (mql) {
      return typeof mql.target !== 'undefined' ? mql.target : mql;
    };

    /**
         * Shorthand method for this.getMediaQueryListEventObject()
         * @param {Object} - The returned `MediaQueryListEvent` from the `window`
         * @returns {Object} - `MediaQueryListEvent`
         */
    this.getMql = function (mql) {
      return this.getMediaQueryListEventObject(mql);
    };

    /**
         * @param {function} cb - the callback function to be executed at each breakpoint
         * @returns {object}
         */
    this.addListener = function (breakpoint, cb) {

    };

    /**
         * Run the callback with the correct settings
         * @param {type} mql
         * @param {type} key
         * @param {type} callback
         * @param {type} settings
         * @returns {undefined}
         */
    this.handleListener = function(mql, key, callback, callbackSettings)   {
            
      var _this = this;
            
      if (!mql.matches && this.isDesktopFirst())    {
        return;
      }
            
      // If there is no match in mobile first manually grab the current breakpoint settings as the user is most likely scaling down
      if(!mql.matches && this.isMobileFirst())  {
        key = _this.getCurrentBreakpoint().key;
        mql = _this.listeners[key];
      }
            
      mql = _this.getMql(mql);
            
      mql.cohesion = {
        'key': key,
        'settings': callbackSettings
      };
            
      return callback(mql);
    };

    /**
         * Binding of the native window.addListener
         * @param {type} cb - the callback function to be executed at each breakpoint
         * @returns {undefined}
         */
    this.addListeners = function (settings, callback) {
      var _this = this;
      var i, breakpointKey, mq, match;

      for (i = 0; i < _this.breakpoints.length; i++) {

        breakpointKey = _this.breakpoints[i].key;
        mq = _this.getBreakpointMediaQuery(breakpointKey);

        var listener;
        listener = window.matchMedia(mq);
                    
        // Keep a record of the listeners
        _this.listeners[breakpointKey] = listener;

        listener.addListener(this.handleListener.bind(this, listener, breakpointKey, callback, settings));

        // Store a current match
        if(listener.matches)    {
          match = listener;
          match.key = breakpointKey;
        }
      }
            
      // Run the callback for the first time
      if(match)   {
        this.handleListener(match, match.key, callback, settings);
      }
    };

    /**
         * Sorts the responsive breakpoints into the correct order
         * @returns {array}
         */
    this.sortBreakpoints = function () {

      var _this = this;

      var i = 0;
      // Pass breakpoints into an array ready to be sorted
      for (var k in _this.settings.breakpoints) {
        if (_this.settings.breakpoints.hasOwnProperty(k)) {
          _this.breakpoints.push(_this.settings.breakpoints[k]);
          _this.breakpoints[i].key = k;
          i++;
        }
      }
      // Sort the array depending on mobile || desktop first
      if (_this.getGridType() === _this.constants.mobile) {

        _this.breakpoints.sort(function (a, b) {
          return a.width - b.width;
        });

      } else if (_this.getGridType() === _this.constants.desktop) {

        _this.breakpoints.sort(function (a, b) {
          return b.width - a.width;
        });

      } else {

        throw 'Mobile or Desktop first must be set in Website settings > Responsive grid settings';
      }
    };

    // Init the
    this.init();
  };

})(jQuery, Drupal, drupalSettings);
;
(function ($, Drupal) {

  'use strict';

  // Create the defaults once
  var cmm = new Drupal.CohesionResponsiveBreakpoints();

  var pluginName = 'cohesionContainerMatchHeights';

  var defaults = {
    current: false,
    excludeElements: ['column'],
    expressionPrefixes: ['>', '> .coh-column'],
    loadersPrefix: '.coh-row > .coh-row-inner',
    elements : {
      'none': {
        'parent': 'none',
        'child': false
      },
      'h1': {
        'parent': 'h1',
        'child': false
      },
      'h2': {
        'parent': 'h2',
        'child': false
      },
      'h3': {
        'parent': 'h3',
        'child': false
      },
      'h4': {
        'parent': 'h4',
        'child': false
      },
      'h5': {
        'parent': 'h5',
        'child': false
      },
      'h6': {
        'parent': 'h6',
        'child': false
      },
      'p': {
        'parent': 'p',
        'child': false
      },
      'list-container': {
        'parent': '.coh-list-container',
        'child': false
      },
      'container': {
        'parent': '.coh-container',
        'child': false
      },
      'wysiwyg': {
        'parent': '.coh-wysiwyg',
        'child': false
      },
      'hyperlink': {
        'parent': 'a',
        'child': false
      },
      'blockquote': {
        'parent': 'blockquote',
        'child': false
      },
      'slide': {
        'parent': '.slick-list > .slick-track > .coh-slider-item',
        'child': false
      },
      'iframe': {
        'parent': '.coh-iframe',
        'child': false
      },
      'youtube-video-background': {
        'parent': '.coh-youtube-video-background',
        'child': false
      }
    },
    loaders: [
      '.coh-row > .coh-row-inner frame',
      '.coh-row > .coh-row-inner iframe',
      '.coh-row > .coh-row-inner img',
      '.coh-row > .coh-row-inner input[type="image"]',
      '.coh-row > .coh-row-inner link',
      '.coh-row > .coh-row-inner script',
      '.coh-row > .coh-row-inner style'
    ]
  };

  // The actual plugin constructor
  function ccmh(element, options) {

    this.element = element;
    this.$element = $(element);

    this.options = $.extend({}, defaults, options);
    this._defaults = defaults;

    this._name = pluginName;
    this._current = false;

    this.init();
  }

  ccmh.prototype.init = function () {
    // Place initialization logic here
    // Already have access to the DOM element and the options via the instance,
    // e.g., this.element and this.options

    var _self = this;
    var key = '';
    var previous = {
      target: 'none'
    };

    var settings = {};
    settings._self = _self;
    settings.breakpoints = {};

    for (var i = 0; i < cmm.breakpoints.length; i++) {

      key = cmm.breakpoints[i].key;

      settings.breakpoints[key] = previous;

      if (typeof _self.options.targets[key] !== 'undefined') {

        settings.breakpoints[key] = _self.options.targets[key];

        previous = _self.options.targets[key];

      } else {

        if (typeof cmm.breakpoints[i - 1] !== 'undefined' && typeof previous !== false) {

          settings.breakpoints[key] = previous;

          _self.options.targets[key] = {};
          _self.options.targets[key] = previous;
        }
      }
    }

    // Bind the listeners
    cmm.addListeners(settings, _self.setMatchHeightsCallback);

    // Once the ajax has finished loading AND anything else that could effect the layout (onload)
    $(_self.options.context).ajaxComplete(function (event, xhr, settings) {

      $.fn.matchHeight._update();

      $(_self.options.loaders.toString(), _self.options.context).on('load', function () {
        if ($(this).length) {
          $.fn.matchHeight._update();
        }
      });
    });
  };

  /**
     * Grabs the HTML Element / Class from our mapper otherwise turns the value into a class
     * @param {String} elementKey - the key of `this.settings.elements`
     * @returns CSS selector from the mapper || generates a custom class
     */
  ccmh.prototype.getElement = function (elementKey) {
    var element;

    // If the value exists in 'elements' then use this otherwise hopefully this is a CSS class
    if (this.options.elements.hasOwnProperty(elementKey)) {
      element = this.options.elements[elementKey];
    } else {
      element = elementKey.match(/^[.]/) ? elementKey : '.' + elementKey;
    }

    return element;
  };

  /**
     * Generates the jQuery selector
     * @param {String} element - the key of `this.settings.elements`
     * @param {Int} targetLevel (optional)
     * @returns jQuery selector
     */
  ccmh.prototype.getElementExpression = function (element, targetLevel) {

    var expression = [],
      prefixes = [''],
      el = this.getElement(element),
      elementIsClass = typeof el === 'string',
      depth = typeof targetLevel !== 'undefined' ? targetLevel : false;

    if(this.options.excludeElements.indexOf(element) < 0)   {
      prefixes = this.options.expressionPrefixes;
    }

    for (var i = 0; i < prefixes.length; i++) {

      if(!elementIsClass) {
        // Append the parent element
        // If element, the element should be an immediately inside
        expression[i] = prefixes[i] + ' > ' + el.parent;
      } else {
        // Append the parent element

        // If Custom class then drill down to the class to any level
        expression[i] = prefixes[i] + ' ' + el;
      }

      // Append the :nth-of-type
      if(depth !== false) {
        expression[i] = expression[i] + ':nth-of-type(' + depth + ')';
      }

      // Append any children
      if(!elementIsClass && el.child)   {
        expression[i] = expression[i] + ' > ' + el.child;
      }
    }
    return expression.join(', ');
  };

  /**
     * Initialises match heights
     * @param {Object} settings - object of the breakpoints
     * @returns {jQuery obj} - match heights jQuery object
     */
  ccmh.prototype.setMatchHeights = function (settings) {

    var _self = this;

    var target = settings.cohesion.settings.breakpoints[settings.cohesion.key];

    // If the breakpoint is false do not set anything - just let it inherit or do its thing
    if(typeof target === 'undefined' || target === false)    {
      return;
    }

    var el = _self.getElement(target.target);

    _self.destroyMatchHeights();

    if (el !== 'none') {

      var expression = _self.getElementExpression(target.target, target.targetLevel);

      // Save the current matches so we can destroy it later
      _self._current = $(expression, _self.$element);

      return _self._current.matchHeight({
        byRow: false
      });
    }
  };

  /**
     * Wrapper for when the callback is returned so we can apply the correct scope
     * @param {type} settings
     * @returns {undefined}
     */
  ccmh.prototype.setMatchHeightsCallback = function(settings) {
        
    var _self = settings.cohesion.settings._self || this;

    return _self.setMatchHeights(settings);
  };

  /**
     * Destroys match heights for the current instance
     * @returns {unresolved}
     */
  ccmh.prototype.destroyMatchHeights = function () {
    return $(this._current).matchHeight({
      remove: true
    });
  };


  // A really lightweight plugin wrapper around the constructor,
  // preventing against multiple instantiations
  $.fn[pluginName] = function (options) {
    return this.each(function () {
      if (!$.data(this, 'plugin_' + pluginName)) {
        $.data(this, 'plugin_' + pluginName, new ccmh(this, options));
      }
    });
  };

})(jQuery, Drupal);
;

/* *
 * @license
 */

(function ($, Drupal, drupalSettings) {
  'use strict';

  Drupal.behaviors.CohesionRowForColumns = {

    attach: function (context, settings) {

      $.each($('[data-coh-row-match-heights]', context).once('coh-row-match-heights-init'), function () {

        var targets = $(this).data('cohRowMatchHeights');

        $('> .coh-row-inner', this).cohesionContainerMatchHeights({
          'targets': targets,
          'context': context
        });
      });
    }
  };

})(jQuery, Drupal, drupalSettings);
;
/**
 * jQuery plugin paroller.js v1.3.1
 * https://github.com/tgomilar/paroller.js
 * preview: https://tgomilar.github.io/paroller/
 **/
(function (factory) {
  'use strict';

  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = factory(require('jquery'));
  }
  else {
    factory(jQuery);
  }
})(function ($) {
  'use strict';

  var setDirection = {
    bgVertical: function (elem, bgOffset, bgStart) {
      return elem.css({'backgroundPositionY': 'calc(' + -bgOffset + 'px + ' + bgStart + ')'});
    },
    bgHorizontal: function (elem, bgOffset, bgStart) {
      return elem.css({'backgroundPositionX': 'calc(' + -bgOffset + 'px + ' + bgStart + ')'});
    },
    vertical: function (elem, elemOffset, oldTransform) {
      (oldTransform === 'none' ? oldTransform = '' : true);
      return elem.css({
        '-webkit-transform': 'translateY(' + elemOffset + 'px)' + oldTransform,
        '-moz-transform': 'translateY(' + elemOffset + 'px)' + oldTransform,
        'transform': 'translateY(' + elemOffset + 'px)' + oldTransform,
        'transition': 'transform linear',
        'will-change': 'transform'
      });
    },
    horizontal: function (elem, elemOffset, oldTransform) {
      (oldTransform === 'none' ? oldTransform = '' : true);
      return elem.css({
        '-webkit-transform': 'translateX(' + elemOffset + 'px)' + oldTransform,
        '-moz-transform': 'translateX(' + elemOffset + 'px)' + oldTransform,
        'transform': 'translateX(' + elemOffset + 'px)' + oldTransform,
        'transition': 'transform linear',
        'will-change': 'transform'
      });
    }
  };

  $.fn.paroller = function (options) {
    var windowHeight = $(window).height();
    var documentHeight = $(document).height();

    // default options
    options = $.extend({
      factor: 0, // - to +
      type: 'background', // foreground
      direction: 'vertical', // horizontal
      bgstart: 0
    }, options);

    return this.each(function () {
      var working = false;
      var $this = $(this);
      var offset = $this.offset().top;
      var height = $this.outerHeight();
      var dataFactor = $this.data('paroller-factor');
      var dataType = $this.data('paroller-type');
      var dataDirection = $this.data('paroller-direction');
      var dataBgStart = $this.data('paroller-bg-start');
      var factor = (dataFactor) ? dataFactor : options.factor;
      var type = (dataType) ? dataType : options.type;
      var direction = (dataDirection) ? dataDirection : options.direction;
      var bgStart = (dataBgStart) ? dataBgStart : options.bgstart;
      var bgOffset = Math.round(offset * factor);
      var transform = Math.round((offset - (windowHeight / 2) + height) * factor);

      /* Transform directive of element before paroller */
      var oldTransform = $this.css('transform');

      if (type === 'background') {

        if(typeof bgStart === 'number') {
          bgStart = bgStart + 'px';
        }

        if(!bgStart.length) {
          bgStart = '0';
        }
        //if last char is a number, there is no unit specified, add px.
        if($.isNumeric(bgStart.slice(-1)) ) {
          bgStart = bgStart + 'px';
        }

        if (direction === 'vertical') {
          setDirection.bgVertical($this, bgOffset, bgStart);
        }
        else if (direction === 'horizontal') {
          setDirection.bgHorizontal($this, bgOffset, bgStart);
        }
      }
      else if (type === 'foreground') {
        if (direction === 'vertical') {
          setDirection.vertical($this, transform, oldTransform);
        }
        else if (direction === 'horizontal') {
          setDirection.horizontal($this, transform, oldTransform);
        }
      }

      $(window).on('scroll.paroller', onScroll).trigger('scroll');

      function scrollAction() {
        working = false;
      }

      function onScroll() {
        if (!working) {
          var scrolling = $(this).scrollTop();
          documentHeight = $(document).height();

          bgOffset = Math.round((offset - scrolling) * factor);
          transform = Math.round(((offset - (windowHeight / 2) + height) - scrolling) * factor);

          if (type === 'background') {
            if (direction === 'vertical') {
              setDirection.bgVertical($this, bgOffset, bgStart);
            }
            else if (direction === 'horizontal') {
              setDirection.bgHorizontal($this, bgOffset, bgStart);
            }
          }
          else if ((type === 'foreground') && (scrolling <= documentHeight)) {
            if (direction === 'vertical') {
              setDirection.vertical($this, transform, oldTransform);
            }
            else if (direction === 'horizontal') {
              setDirection.horizontal($this, transform, oldTransform);
            }
          }

          window.requestAnimationFrame(scrollAction);
          working = true;
        }
      }
    });
  };
});;
(function($, Drupal, drupalSettings){
  "use strict";

  Drupal.behaviors.DX8ParallaxScrolling = {

    attach: function (context, settings){

      var cmm = new Drupal.CohesionResponsiveBreakpoints();
            
      var resetCSS = {
        'background': '',
        'transform': '',
        'transition': '',
        'will-change': '',
        'background-position-y': '',
        'background-position-x': ''
      };

      var count = 0;
      var total = 0;
                
      function initParoller(settings) {
            
        var key = settings.cohesion.key,
          settings = settings.cohesion.settings,
          $el = settings.$el;
                
        if(!count) {
          total = $('[data-coh-paroller]', context).length;
          count = total;
        }

        if(count === total) {
          //Ensure that unbind only happens the first time we loop round the elements.
          $(window).off('.paroller');
        }

        count--;

        // Always wipe the CSS when changing between breakpoints
        $el.css(resetCSS);
            
        if(settings.breakpoints[key].enabled){
                    
          // Init the paroller elements
          $el.paroller({
            factor: settings.breakpoints[key].factor,
            direction: settings.breakpoints[key].direction,
            type: settings.breakpoints[key].type,
            bgstart: settings.breakpoints[key].bgstart
          });
        }
      }

      $.each($('[data-coh-paroller]', context).once('dx8-js-parallax-init'), function(){
        var $el = $(this);
        var responsiveSettings = $el.data('coh-paroller');
        var key, previous;
        var settings = {
          $el: $el,
          breakpoints: {}
        };

        for (var i = 0; i < cmm.breakpoints.length; i++) {

          key = cmm.breakpoints[i].key;

          // Populate all breakpoints regardless of whether the settings are set or not to simulate inheritance
          settings.breakpoints[key] = {};
          if (typeof responsiveSettings[key] !== 'undefined') {

            settings.breakpoints[key] = responsiveSettings[key];

            previous = responsiveSettings[key];

          } else {

            if (typeof cmm.breakpoints[i - 1] !== 'undefined' && typeof previous !== 'undefined') {
              settings.breakpoints[key] = previous;
            }
          }
        }

        cmm.addListeners(settings, initParoller);
      });
    }
  };

})(jQuery, Drupal, drupalSettings);;
/*!
 * jQuery.scrollTo
 * Copyright (c) 2007 Ariel Flesler - aflesler ○ gmail • com | https://github.com/flesler
 * Licensed under MIT
 * https://github.com/flesler/jquery.scrollTo
 * @projectDescription Lightweight, cross-browser and highly customizable animated scrolling with jQuery
 * @author Ariel Flesler
 * @version 2.1.2
 */
;(function(factory) {
  'use strict';
  if (typeof define === 'function' && define.amd) {
    // AMD
    define(['jquery'], factory);
  } else if (typeof module !== 'undefined' && module.exports) {
    // CommonJS
    module.exports = factory(require('jquery'));
  } else {
    // Global
    factory(jQuery);
  }
})(function($) {
  'use strict';

  var $scrollTo = $.scrollTo = function(target, duration, settings) {
    return $(window).scrollTo(target, duration, settings);
  };

  $scrollTo.defaults = {
    axis:'xy',
    duration: 0,
    limit:true
  };

  function isWin(elem) {
    return !elem.nodeName ||
			$.inArray(elem.nodeName.toLowerCase(), ['iframe','#document','html','body']) !== -1;
  }

  $.fn.scrollTo = function(target, duration, settings) {
    if (typeof duration === 'object') {
      settings = duration;
      duration = 0;
    }
    if (typeof settings === 'function') {
      settings = { onAfter:settings };
    }
    if (target === 'max') {
      target = 9e9;
    }

    settings = $.extend({}, $scrollTo.defaults, settings);
    // Speed is still recognized for backwards compatibility
    duration = duration || settings.duration;
    // Make sure the settings are given right
    var queue = settings.queue && settings.axis.length > 1;
    if (queue) {
      // Let's keep the overall duration
      duration /= 2;
    }
    settings.offset = both(settings.offset);
    settings.over = both(settings.over);

    return this.each(function() {
      // Null target yields nothing, just like jQuery does
      if (target === null) return;

      var win = isWin(this),
        elem = win ? this.contentWindow || window : this,
        $elem = $(elem),
        targ = target,
        attr = {},
        toff;

      switch (typeof targ) {
        // A number will pass the regex
        case 'number':
        case 'string':
          if (/^([+-]=?)?\d+(\.\d+)?(px|%)?$/.test(targ)) {
            targ = both(targ);
            // We are done
            break;
          }
          // Relative/Absolute selector
          targ = win ? $(targ) : $(targ, elem);
          /* falls through */
        case 'object':
          if (targ.length === 0) return;
          // DOMElement / jQuery
          if (targ.is || targ.style) {
            // Get the real position of the target
            toff = (targ = $(targ)).offset();
          }
      }

      var offset = $.isFunction(settings.offset) && settings.offset(elem, targ) || settings.offset;

      $.each(settings.axis.split(''), function(i, axis) {
        var Pos	= axis === 'x' ? 'Left' : 'Top',
          pos = Pos.toLowerCase(),
          key = 'scroll' + Pos,
          prev = $elem[key](),
          max = $scrollTo.max(elem, axis);

        if (toff) {// jQuery / DOMElement
          attr[key] = toff[pos] + (win ? 0 : prev - $elem.offset()[pos]);

          // If it's a dom element, reduce the margin
          if (settings.margin) {
            attr[key] -= parseInt(targ.css('margin'+Pos), 10) || 0;
            attr[key] -= parseInt(targ.css('border'+Pos+'Width'), 10) || 0;
          }

          attr[key] += offset[pos] || 0;

          if (settings.over[pos]) {
            // Scroll to a fraction of its width/height
            attr[key] += targ[axis === 'x'?'width':'height']() * settings.over[pos];
          }
        } else {
          var val = targ[pos];
          // Handle percentage values
          attr[key] = val.slice && val.slice(-1) === '%' ?
            parseFloat(val) / 100 * max
            : val;
        }

        // Number or 'number'
        if (settings.limit && /^\d+$/.test(attr[key])) {
          // Check the limits
          attr[key] = attr[key] <= 0 ? 0 : Math.min(attr[key], max);
        }

        // Don't waste time animating, if there's no need.
        if (!i && settings.axis.length > 1) {
          if (prev === attr[key]) {
            // No animation needed
            attr = {};
          } else if (queue) {
            // Intermediate animation
            animate(settings.onAfterFirst);
            // Don't animate this axis again in the next iteration.
            attr = {};
          }
        }
      });

      animate(settings.onAfter);

      function animate(callback) {
        var opts = $.extend({}, settings, {
          // The queue setting conflicts with animate()
          // Force it to always be true
          queue: true,
          duration: duration,
          complete: callback && function() {
            callback.call(elem, targ, settings);
          }
        });
        $elem.animate(attr, opts);
      }
    });
  };

  // Max scrolling position, works on quirks mode
  // It only fails (not too badly) on IE, quirks mode.
  $scrollTo.max = function(elem, axis) {
    var Dim = axis === 'x' ? 'Width' : 'Height',
      scroll = 'scroll'+Dim;

    if (!isWin(elem))
      return elem[scroll] - $(elem)[Dim.toLowerCase()]();

    var size = 'client' + Dim,
      doc = elem.ownerDocument || elem.document,
      html = doc.documentElement,
      body = doc.body;

    return Math.max(html[scroll], body[scroll]) - Math.min(html[size], body[size]);
  };

  function both(val) {
    return $.isFunction(val) || $.isPlainObject(val) ? val : { top:val, left:val };
  }

  // Add special hooks so that window scroll properties can be animated
  $.Tween.propHooks.scrollLeft =
	$.Tween.propHooks.scrollTop = {
	  get: function(t) {
	    return $(t.elem)[t.prop]();
	  },
	  set: function(t) {
	    var curr = this.get(t);
	    // If interrupt is true and user scrolled, stop animating
	    if (t.options.interrupt && t._last && t._last !== curr) {
	      return $(t.elem).stop();
	    }
	    var next = Math.round(t.now);
	    // Don't waste CPU
	    // Browsers don't render floating point scroll
	    if (curr !== next) {
	      $(t.elem)[t.prop](next);
	      t._last = this.get(t);
	    }
	  }
	};

  // AMD requirement
  return $scrollTo;
});;
// https://tc39.github.io/ecma262/#sec-array.prototype.find
if (!Array.prototype.find) {
  Object.defineProperty(Array.prototype, "find", {
    value: function(predicate) {
      // 1. Let O be ? ToObject(this value).
      if (this == null) {
        throw new TypeError('"this" is null or not defined');
      }

      var o = Object(this);

      // 2. Let len be ? ToLength(? Get(O, "length")).
      var len = o.length >>> 0;

      // 3. If IsCallable(predicate) is false, throw a TypeError exception.
      if (typeof predicate !== "function") {
        throw new TypeError("predicate must be a function");
      }

      // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
      var thisArg = arguments[1];

      // 5. Let k be 0.
      var k = 0;

      // 6. Repeat, while k < len
      while (k < len) {
        // a. Let Pk be ! ToString(k).
        // b. Let kValue be ? Get(O, Pk).
        // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
        // d. If testResult is true, return kValue.
        var kValue = o[k];
        if (predicate.call(thisArg, kValue, k, o)) {
          return kValue;
        }
        // e. Increase k by 1.
        k++;
      }

      // 7. Return undefined.
      return undefined;
    },
    configurable: true,
    writable: true
  });
}

(function($) {
  "use strict";

  Drupal.behaviors.CohesionLink = {
    attach: function(context) {
      // Libs
      var cmm = new Drupal.CohesionResponsiveBreakpoints();

      // Scroll to functionality.
      $.each(
        $(".coh-js-scroll-to", context).once("coh-js-scroll-to-init"),
        bindScrollTo
      );

      // Scroll to top functionality.
      $.each(
        $(".coh-js-scroll-top", context).once("coh-js-scroll-top-init"),
        bindScrollTop
      );

      // Toggle modifier interactivity.
      $.each(
        $(".coh-interaction", context).once("coh-toggle-modifier-init"),
        bindModifier
      );

      // Animation interactivity.
      $.each(
        $(".coh-interaction", context).once("coh-animation-init"),
        bindAnimation
      );

      // Function from David Walsh: http://davidwalsh.name/css-animation-callback
      function whichTransitionEvent() {
        var t,
          el = document.createElement("fakeelement");

        var transitions = {
          transition: "transitionend",
          OTransition: "oTransitionEnd",
          MozTransition: "transitionend",
          WebkitTransition: "webkitTransitionEnd"
        };

        for (t in transitions) {
          if (el.style[t] !== undefined) {
            return transitions[t];
          }
        }
      }

      function getComponentClass($el) {
        if (!$el || !$el.length) {
          return undefined;
        }
        for (var i = 0; i < $el.prop("classList").length; i++) {
          if (
            $el
              .prop("classList")
              [i].match(
                /coh-component-instance-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/
              )
          ) {
            return $el.prop("classList")[i];
          }
        }
      }

      function bindScrollTo() {
        var $this = $(this);

        $this.on("click", function(e) {
          // Don't click through to the page.
          e.preventDefault();

          var defaultSettings = {
            duration: 450,
            offset: 0
          };

          var scrollTarget = $this.data("cohScrollTo");
          var scrollDuration = $this.data("cohScrollDuration");

          /**
           * Offset can either be a jQuery selector (in which cas return elements height) or a number
           * @returns {*}
           */
          var scrollOffset = function() {
            var offset = $this.data("cohScrollOffset");

            if (typeof offset === "string") {
              var $el = $(offset);

              if ($el.length) {
                return 0 - $el.height();
              }

              return 0;
            }

            // plugin expects negative value, when positive value is better UX - reverses logic
            return offset * -1;
          };
          var scrollSettings = {
            duration: scrollDuration,
            offset: scrollOffset()
          };

          var settings = $.extend(defaultSettings, scrollSettings);

          // And smoothly scroll.
          $("html, body").scrollTo(scrollTarget, settings);
        });
      }

      function bindScrollTop() {
        $(this).on("click", function(e) {
          // Don't click through to the page.
          e.preventDefault();

          // And smoothly scroll.
          $("html, body").scrollTo(0, 450);
        });
      }

      function bindModifier() {
        var settings = $(this).data("interactionModifiers");

        // If there are no settings just return
        if (!settings || settings[0].modifierType === "") {
          return;
        }

        $(this).on("click.coh.modifier", function(e) {
          var $this = $(this);
          // Don't click through to the page.
          e.preventDefault();

          var modifier_types = {
            "add-modifier": "addClass",
            "remove-modifier": "removeClass",
            "toggle-modifier": "toggleClass",
            "toggle-modifier-accessible-collapsed": "toggleClass",
            "toggle-modifier-accessible-expanded": "toggleClass"
          };

          for (var i = 0; i < settings.length; i++) {
            if (!settings[i].modifierName) {
              console.warn(
                'Link element is set to toggle a modifier class on a target element but no "Modifier class name" was specified. You must specify a "Modifier class name".'
              );
              return;
            }

            var modifier_name = settings[i].modifierName.replace(/^\./, ""); // Check for and remove leading dot character
            var interaction_target = settings[i].interactionTarget;
            var modifier_type = settings[i].modifierType;
            var transitionEvent = whichTransitionEvent();
            var $interaction_scope;
            var $target;

            // If the scope is something other than 'this' but a target isn't supplied, don't do anything.
            if (
              settings[i].interactionScope !== "this" &&
              !interaction_target
            ) {
              console.warn(
                'Link element is set to "' +
                  modifier_type +
                  '" but does not have a "Target (jQuery selector)" specified. You must specify a "Target (jQuery selector)" or set "Scope to" to "This element"'
              );
              return;
            }

            $interaction_scope = getScope(
              $this,
              settings[i].interactionScope,
              settings[i].interactionParent
            );

            $target = getTarget(
              $this,
              interaction_target,
              $interaction_scope,
              settings[i].interaction_scope
            );

            if ($target.length) {
              $this.data("clickedModifier", !$this.data.clickedModifier);
              // Get jQuery method from modifier types object based on model and apply transition class
              $target[modifier_types[modifier_type]](modifier_name).addClass(
                "coh-transition"
              );

              $target.on(transitionEvent, function() {
                // Remove transition class once transition has finished
                $(this)
                  .removeClass("coh-transition")
                  .off(transitionEvent);
              });

              // If the modifier is an accessible popup
              if (modifier_type.indexOf("toggle-modifier-accessible-") === 0) {
                // Toggle aria-expanded attribute value
                $(this).attr(
                  "aria-expanded",
                  $(this).attr("aria-expanded") === "true" ? "false" : "true"
                );
              }
              // Run Drupal behaviors for anything that is hidden
              Drupal.attachBehaviors($target[0]);
            }
          }
        });
      }

      /**
       * Called when moving between breakpoints. This function compares the breakpoint you have just moved to with the
       * breakpoint you've just come from (stored in previousBreakPointAnimSettings). If you are moving from a breakpoint
       * that has animation to a breakpoint that does not have settings for a matching animationTarget
       * then the css display property is removed. https://cohesion-dev.atlassian.net/browse/COH-4794
       * @param mm
       */
      function cohCheckDisplayResize(mm) {
        var currentSettings =
          mm.cohesion.settings.breakpoints[mm.cohesion.key] || {};
        var animSettings =
          currentSettings.linkAnimation ||
          currentSettings.buttonAnimation ||
          [];
        mm.cohesion.settings.element
          .data("previousBreakPointAnimSettings")
          .forEach(function(prevSetting) {
            // if prevSetting.target doesn't exist in any of the current settings
            var matchedSetting = animSettings.find(function(setting) {
              return prevSetting.animationTarget === setting.animationTarget;
            });

            // In future we can add `displayReset` as a bool/toggle to the JSON form and control this behaviour
            if (!matchedSetting && prevSetting.displayReset !== false) {
              if (mm.cohesion.settings.element.data("clickedAnimation")) {
                // mm.cohesion.settings.element.trigger('click.coh.animation');
                runAnimation(mm.cohesion.settings.element, prevSetting, true);
                if (mm.cohesion.settings.element.data("clickedModifier")) {
                  mm.cohesion.settings.element.trigger("click.coh.modifier");
                }
              } else {
                if (prevSetting.animationTarget) {
                  var $interaction_scope = getScope(
                    mm.cohesion.settings.element,
                    prevSetting.animationScope,
                    prevSetting.animationParent
                  );
                  var $target = getTarget(
                    mm.cohesion.settings.element,
                    prevSetting.animationTarget,
                    $interaction_scope,
                    prevSetting.animationScope
                  );
                  $target.css("display", "");
                }
              }
            }
          });

        mm.cohesion.settings.element.data(
          "previousBreakPointAnimSettings",
          animSettings || []
        );
      }

      function bindAnimation() {
        var $this = $(this),
          data = $this.data("cohSettings"),
          settings = {
            element: $this,
            breakpoints: {}
          },
          key;

        $this.data("previousBreakPointAnimSettings", []);

        for (var i = 0; i < cmm.breakpoints.length; i++) {
          key = cmm.breakpoints[i].key;

          // Populate all breakpoints regardless of whether the settings are set or not to simulate inheritance
          settings.breakpoints[key] = {};
          if (typeof data[key] !== "undefined" && !$.isEmptyObject(data[key])) {
            settings.breakpoints[key] = data[key];

            var previous = data[key];
          } else {
            if (
              typeof cmm.breakpoints[i - 1] !== "undefined" &&
              typeof previous !== "undefined"
            ) {
              settings.breakpoints[key] = previous;
            }
          }
        }

        cmm.addListeners(settings, cohCheckDisplayResize);

        $this.on("click.coh.animation", function(e) {
          e.preventDefault();

          var currentSettings =
            settings.breakpoints[cmm.getCurrentBreakpoint().key];
          currentSettings =
            currentSettings.linkAnimation || currentSettings.buttonAnimation;

          if (currentSettings) {
            for (var i = 0; i < currentSettings.length; i++) {
              var currentSetting = currentSettings[i];

              if (currentSetting.animationType !== "none") {
                runAnimation($this, currentSetting);
              }
            }
          }
        });
      }

      function runAnimation($this, settings, removeDisplay) {
        var $interaction_scope;
        var $target, origin;

        $interaction_scope = getScope(
          $this,
          settings.animationScope,
          settings.animationParent
        );
        $target = getTarget(
          $this,
          settings.animationTarget,
          $interaction_scope,
          settings.animationScope
        );

        if ($target.length) {
          $this.data("clickedAnimation", !$this.data("clickedAnimation"));

          if (settings.animationOrigin) {
            origin = settings.animationOrigin.split(",");
          }

          $.each($($target), function() {
            var $that = $(this);

            $that.toggle({
              effect: settings.animationType,
              direction: settings.animationDirection,
              distance: settings.animationDistance,
              pieces: settings.animationPieces,
              percent: settings.animationScale,
              origin: origin,
              size: settings.animationFoldHeight,
              horizFirst: settings.animationHorizontalFirst,
              times: settings.animationIterations,
              easing: settings.animationEasing,
              duration: removeDisplay ? 0 : settings.animationDuration,
              complete: function() {
                // Run Drupal behaviors for anything that is hidden
                Drupal.attachBehaviors($(this)[0]);
                if (removeDisplay) {
                  $that.css("display", "");
                }
              }
            });
          });
        }
      }

      function getScope($this, scope, parent) {
        var $interaction_scope;
        switch (scope) {
          case "this":
            $interaction_scope = $this;
            break;
          case "parent":
            $interaction_scope = $this.closest(parent);
            break;
          case "component":
            var componentClass = getComponentClass(
              $this.closest(".coh-component")
            );

            if (componentClass) {
              $interaction_scope = $("." + componentClass);
            } else {
              // 'component' scope was chosen but there isn't a parent component. (i.e. element is just sat on a layout canvas).
              $interaction_scope = $(document);
            }
            break;
          default:
            $interaction_scope = $(document);
            break;
        }
        return $interaction_scope;
      }

      function getTarget(
        $this,
        interaction_target,
        $interaction_scope,
        interaction_scope
      ) {
        var $target = $();
        if (interaction_scope === "this" && !interaction_target) {
          $target = $this;
        } else if (!interaction_target) {
          console.warn(
            'Element does not have a "Target (jQuery selector)" specified. You must specify a "Target (jQuery selector)" or set "Scope to" to "This element".'
          );
          return $target;
        }

        if (!$target.length) {
          // Process the interaction target as a jQuery selector
          $target = $(interaction_target, $interaction_scope);
        }

        // Is it one of the top level elements in a component
        if (!$target.length) {
          $target = $interaction_scope.filter(interaction_target);
        }

        // Is it a child of the scope?
        if (!$target.length) {
          $target = $interaction_scope.find($(interaction_target));
        }

        // Try the interaction target as a className (legacy - we used to except a class, unprefixed with . instead of a jquery selector.
        if (interaction_target.indexOf(".") !== 0) {
          if (!$target.length) {
            $target = $interaction_scope.filter("." + interaction_target);
          }

          if (!$target.length) {
            $target = $interaction_scope.find($("." + interaction_target));
          }
        }

        if (!$target.length) {
          console.warn(
            'Element has "Target (jQuery selector)" set to "' +
              interaction_target +
              '", but no matching element was found on the page.'
          );
        }

        return $target;
      }
    }
  };
})(jQuery);
;
(function ($, Drupal) {

  Drupal.behaviors.CohesionScroll = {

    attach: function (context) {

      if(drupalSettings.cohesion.add_animation_classes === 'ENABLED') {

        function getWindowOffset() {
          return window.pageYOffset || document.documentElement.scrollTop;
        }

        var previous = getWindowOffset();

        $('body', context).once('cohWindowScroll').each(function() {

          var $body = $(this);
          var timeout, flag = false;

          // Add the class onload if there is an offset
          if(getWindowOffset() > 0) {
            $body.addClass('is-scrolled');
          }

          // Bind the listener
          //window.onscroll = function() {
          $(window).scroll(function() {
            var current = getWindowOffset();

            // Determine if the user is scrolling up or down
            var state = current > previous;

            // These classes should only be applied when the event is taking place
            if(!flag) {
              flag = true;
              $body.addClass('is-scrolling');
            }

            // These class should persist even once scrolling has ceased
            if(current !== previous)    {
              $body.addClass('is-scrolled').toggleClass('is-scrolled-down', state).toggleClass('is-scrolled-up', !state);
            }

            // Store the previous position (handles mobile or negative scrolling)
            previous = current <= 0 ? 0 : current;

            // Remove is-scrolling on scroll stop (no event for scrollStop)
            clearTimeout(timeout);
            timeout = setTimeout(function() {
              $body.removeClass('is-scrolling');
              flag = false;
            }, 200);

            // Remove 'is-scrolled' class if there is no offset
            if(previous === 0) {
              $body.removeClass('is-scrolled');
            }
          });
        });
      }
    }
  };
})(jQuery, Drupal, drupalSettings);
;
(function ($, Drupal) {

  "use strict";

  Drupal.behaviors.CohesionMatchHeights = {

    attach: function (context) {

      var cmm = new Drupal.CohesionResponsiveBreakpoints();

      var once = '';

      // List of possible elements that could be loaded into the DOM onload
      var loaders = [
        'img',
        'frame',
        'iframe',
        'input[type="image"]',
        'link',
        'script',
        'style'
      ];

      /**
             * Applies match height to the given and current DOM objects
             * @param {object} settings - the settings
             * @returns {object} the match height object
             */
      function cohInitMatchHeights(settings) {

        var s = settings.cohesion.settings;
        var $this = s.element;
        var target = s.breakpoints[settings.cohesion.key].target.match(/^[.]/) ? s.breakpoints[settings.cohesion.key].target : '.' + s.breakpoints[settings.cohesion.key].target;
        var $el;

        // Should we target the children
        if(typeof s.breakpoints[settings.cohesion.key].children !== 'undefined' && s.breakpoints[settings.cohesion.key].children === true)  {
          $el = $(target, $this);
        } else {
          $el =  s.element.add(target);
        }

        // Save the current matches so we can destroy it later
        if (typeof $this.data('currentMatchHeight') !== 'undefined') {

          // If $el is the same there is not point in matching again
          if ($this.data('currentMatchHeight') === $el) {
            return;
          }

          cohUnsetMatchHeight($this.data('currentMatchHeight'));

          // If none is set then just return as well
          if (s.breakpoints[settings.cohesion.key].target === 'none') {
            return;
          }
        }

        $this.data('currentMatchHeight', $el);

        return $el.matchHeight({
          byRow: false
        });
      }

      /**
             * Unset match heights to just the current active DOM objects
             * @param {type} $this
             * @returns {undefined}
             */
      function cohUnsetMatchHeight($this) {
        return $this.matchHeight({
          remove: true
        });
      }

      // Trigger match heights to update - this will be called when behaviors are reattached
      $.fn.matchHeight._update();

      $.each($('[data-coh-match-heights]', context).once('coh-js-matchheights-init'), function () {

        var $this = $(this),
          targets = $this.data('cohMatchHeights'),
          key;

        var settings = {};
        settings.element = $this;
        settings.breakpoints = {};

        // Update the settings prior to attaching the listeners
        for (var i = 0; i < cmm.breakpoints.length; i++) {

          key = cmm.breakpoints[i].key;

          // Populate all breakpoints regardless of whether the settings are set or not to simulate inheritance
          settings.breakpoints[key] = {};
          if (typeof targets[key] !== 'undefined') {

            settings.breakpoints[key] = targets[key];

            var previous = targets[key];

          } else {

            if (typeof cmm.breakpoints[i - 1] !== 'undefined' && typeof previous !== 'undefined') {
              settings.breakpoints[key] = previous;
            }
          }
        }

        // Bind the listeners to our callback
        cmm.addListeners(settings, cohInitMatchHeights);

        // Once the ajax has finished loading AND anything else that could effect the layout (onload)
        $(context).ajaxComplete(function (event, xhr, settings) {

          $.fn.matchHeight._update();

          $(loaders.toString(), context).on('load', function () {
            if ($(this).length) {
              $.fn.matchHeight._update();
            }
          });
        });
      });
    }
  };

})(jQuery, Drupal);
;
/*!
 * PEP v0.4.3 | https://github.com/jquery/PEP
 * Copyright jQuery Foundation and other contributors | http://jquery.org/license
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
      (global.PointerEventsPolyfill = factory());
}(this, function () { 'use strict';

  /**
   * This is the constructor for new PointerEvents.
   *
   * New Pointer Events must be given a type, and an optional dictionary of
   * initialization properties.
   *
   * Due to certain platform requirements, events returned from the constructor
   * identify as MouseEvents.
   *
   * @constructor
   * @param {String} inType The type of the event to create.
   * @param {Object} [inDict] An optional dictionary of initial event properties.
   * @return {Event} A new PointerEvent of type `inType`, initialized with properties from `inDict`.
   */
  var MOUSE_PROPS = [
    'bubbles',
    'cancelable',
    'view',
    'detail',
    'screenX',
    'screenY',
    'clientX',
    'clientY',
    'ctrlKey',
    'altKey',
    'shiftKey',
    'metaKey',
    'button',
    'relatedTarget',
    'pageX',
    'pageY'
  ];

  var MOUSE_DEFAULTS = [
    false,
    false,
    null,
    null,
    0,
    0,
    0,
    0,
    false,
    false,
    false,
    false,
    0,
    null,
    0,
    0
  ];

  function PointerEvent(inType, inDict) {
    inDict = inDict || Object.create(null);

    var e = document.createEvent('Event');
    e.initEvent(inType, inDict.bubbles || false, inDict.cancelable || false);

    // define inherited MouseEvent properties
    // skip bubbles and cancelable since they're set above in initEvent()
    for (var i = 2, p; i < MOUSE_PROPS.length; i++) {
      p = MOUSE_PROPS[i];
      e[p] = inDict[p] || MOUSE_DEFAULTS[i];
    }
    e.buttons = inDict.buttons || 0;

    // Spec requires that pointers without pressure specified use 0.5 for down
    // state and 0 for up state.
    var pressure = 0;

    if (inDict.pressure && e.buttons) {
      pressure = inDict.pressure;
    } else {
      pressure = e.buttons ? 0.5 : 0;
    }

    // add x/y properties aliased to clientX/Y
    e.x = e.clientX;
    e.y = e.clientY;

    // define the properties of the PointerEvent interface
    e.pointerId = inDict.pointerId || 0;
    e.width = inDict.width || 0;
    e.height = inDict.height || 0;
    e.pressure = pressure;
    e.tiltX = inDict.tiltX || 0;
    e.tiltY = inDict.tiltY || 0;
    e.twist = inDict.twist || 0;
    e.tangentialPressure = inDict.tangentialPressure || 0;
    e.pointerType = inDict.pointerType || '';
    e.hwTimestamp = inDict.hwTimestamp || 0;
    e.isPrimary = inDict.isPrimary || false;
    return e;
  }

  /**
   * This module implements a map of pointer states
   */
  var USE_MAP = window.Map && window.Map.prototype.forEach;
  var PointerMap = USE_MAP ? Map : SparseArrayMap;

  function SparseArrayMap() {
    this.array = [];
    this.size = 0;
  }

  SparseArrayMap.prototype = {
    set: function(k, v) {
      if (v === undefined) {
        return this.delete(k);
      }
      if (!this.has(k)) {
        this.size++;
      }
      this.array[k] = v;
    },
    has: function(k) {
      return this.array[k] !== undefined;
    },
    delete: function(k) {
      if (this.has(k)) {
        delete this.array[k];
        this.size--;
      }
    },
    get: function(k) {
      return this.array[k];
    },
    clear: function() {
      this.array.length = 0;
      this.size = 0;
    },

    // return value, key, map
    forEach: function(callback, thisArg) {
      return this.array.forEach(function(v, k) {
        callback.call(thisArg, v, k, this);
      }, this);
    }
  };

  var CLONE_PROPS = [

    // MouseEvent
    'bubbles',
    'cancelable',
    'view',
    'detail',
    'screenX',
    'screenY',
    'clientX',
    'clientY',
    'ctrlKey',
    'altKey',
    'shiftKey',
    'metaKey',
    'button',
    'relatedTarget',

    // DOM Level 3
    'buttons',

    // PointerEvent
    'pointerId',
    'width',
    'height',
    'pressure',
    'tiltX',
    'tiltY',
    'pointerType',
    'hwTimestamp',
    'isPrimary',

    // event instance
    'type',
    'target',
    'currentTarget',
    'which',
    'pageX',
    'pageY',
    'timeStamp'
  ];

  var CLONE_DEFAULTS = [

    // MouseEvent
    false,
    false,
    null,
    null,
    0,
    0,
    0,
    0,
    false,
    false,
    false,
    false,
    0,
    null,

    // DOM Level 3
    0,

    // PointerEvent
    0,
    0,
    0,
    0,
    0,
    0,
    '',
    0,
    false,

    // event instance
    '',
    null,
    null,
    0,
    0,
    0,
    0
  ];

  var BOUNDARY_EVENTS = {
    'pointerover': 1,
    'pointerout': 1,
    'pointerenter': 1,
    'pointerleave': 1
  };

  var HAS_SVG_INSTANCE = (typeof SVGElementInstance !== 'undefined');

  /**
   * This module is for normalizing events. Mouse and Touch events will be
   * collected here, and fire PointerEvents that have the same semantics, no
   * matter the source.
   * Events fired:
   *   - pointerdown: a pointing is added
   *   - pointerup: a pointer is removed
   *   - pointermove: a pointer is moved
   *   - pointerover: a pointer crosses into an element
   *   - pointerout: a pointer leaves an element
   *   - pointercancel: a pointer will no longer generate events
   */
  var dispatcher = {
    pointermap: new PointerMap(),
    eventMap: Object.create(null),
    captureInfo: Object.create(null),

    // Scope objects for native events.
    // This exists for ease of testing.
    eventSources: Object.create(null),
    eventSourceList: [],
    /**
     * Add a new event source that will generate pointer events.
     *
     * `inSource` must contain an array of event names named `events`, and
     * functions with the names specified in the `events` array.
     * @param {string} name A name for the event source
     * @param {Object} source A new source of platform events.
     */
    registerSource: function(name, source) {
      var s = source;
      var newEvents = s.events;
      if (newEvents) {
        newEvents.forEach(function(e) {
          if (s[e]) {
            this.eventMap[e] = s[e].bind(s);
          }
        }, this);
        this.eventSources[name] = s;
        this.eventSourceList.push(s);
      }
    },
    register: function(element) {
      var l = this.eventSourceList.length;
      for (var i = 0, es; (i < l) && (es = this.eventSourceList[i]); i++) {

        // call eventsource register
        es.register.call(es, element);
      }
    },
    unregister: function(element) {
      var l = this.eventSourceList.length;
      for (var i = 0, es; (i < l) && (es = this.eventSourceList[i]); i++) {

        // call eventsource register
        es.unregister.call(es, element);
      }
    },
    contains: /*scope.external.contains || */function(container, contained) {
      try {
        return container.contains(contained);
      } catch (ex) {

        // most likely: https://bugzilla.mozilla.org/show_bug.cgi?id=208427
        return false;
      }
    },

    // EVENTS
    down: function(inEvent) {
      inEvent.bubbles = true;
      this.fireEvent('pointerdown', inEvent);
    },
    move: function(inEvent) {
      inEvent.bubbles = true;
      this.fireEvent('pointermove', inEvent);
    },
    up: function(inEvent) {
      inEvent.bubbles = true;
      this.fireEvent('pointerup', inEvent);
    },
    enter: function(inEvent) {
      inEvent.bubbles = false;
      this.fireEvent('pointerenter', inEvent);
    },
    leave: function(inEvent) {
      inEvent.bubbles = false;
      this.fireEvent('pointerleave', inEvent);
    },
    over: function(inEvent) {
      inEvent.bubbles = true;
      this.fireEvent('pointerover', inEvent);
    },
    out: function(inEvent) {
      inEvent.bubbles = true;
      this.fireEvent('pointerout', inEvent);
    },
    cancel: function(inEvent) {
      inEvent.bubbles = true;
      this.fireEvent('pointercancel', inEvent);
    },
    leaveOut: function(event) {
      this.out(event);
      this.propagate(event, this.leave, false);
    },
    enterOver: function(event) {
      this.over(event);
      this.propagate(event, this.enter, true);
    },

    // LISTENER LOGIC
    eventHandler: function(inEvent) {

      // This is used to prevent multiple dispatch of pointerevents from
      // platform events. This can happen when two elements in different scopes
      // are set up to create pointer events, which is relevant to Shadow DOM.
      if (inEvent._handledByPE) {
        return;
      }
      var type = inEvent.type;
      var fn = this.eventMap && this.eventMap[type];
      if (fn) {
        fn(inEvent);
      }
      inEvent._handledByPE = true;
    },

    // set up event listeners
    listen: function(target, events) {
      events.forEach(function(e) {
        this.addEvent(target, e);
      }, this);
    },

    // remove event listeners
    unlisten: function(target, events) {
      events.forEach(function(e) {
        this.removeEvent(target, e);
      }, this);
    },
    addEvent: /*scope.external.addEvent || */function(target, eventName) {
      target.addEventListener(eventName, this.boundHandler);
    },
    removeEvent: /*scope.external.removeEvent || */function(target, eventName) {
      target.removeEventListener(eventName, this.boundHandler);
    },

    // EVENT CREATION AND TRACKING
    /**
     * Creates a new Event of type `inType`, based on the information in
     * `inEvent`.
     *
     * @param {string} inType A string representing the type of event to create
     * @param {Event} inEvent A platform event with a target
     * @return {Event} A PointerEvent of type `inType`
     */
    makeEvent: function(inType, inEvent) {

      // relatedTarget must be null if pointer is captured
      if (this.captureInfo[inEvent.pointerId]) {
        inEvent.relatedTarget = null;
      }
      var e = new PointerEvent(inType, inEvent);
      if (inEvent.preventDefault) {
        e.preventDefault = inEvent.preventDefault;
      }
      e._target = e._target || inEvent.target;
      return e;
    },

    // make and dispatch an event in one call
    fireEvent: function(inType, inEvent) {
      var e = this.makeEvent(inType, inEvent);
      return this.dispatchEvent(e);
    },
    /**
     * Returns a snapshot of inEvent, with writable properties.
     *
     * @param {Event} inEvent An event that contains properties to copy.
     * @return {Object} An object containing shallow copies of `inEvent`'s
     *    properties.
     */
    cloneEvent: function(inEvent) {
      var eventCopy = Object.create(null);
      var p;
      for (var i = 0; i < CLONE_PROPS.length; i++) {
        p = CLONE_PROPS[i];
        eventCopy[p] = inEvent[p] || CLONE_DEFAULTS[i];

        // Work around SVGInstanceElement shadow tree
        // Return the <use> element that is represented by the instance for Safari, Chrome, IE.
        // This is the behavior implemented by Firefox.
        if (HAS_SVG_INSTANCE && (p === 'target' || p === 'relatedTarget')) {
          if (eventCopy[p] instanceof SVGElementInstance) {
            eventCopy[p] = eventCopy[p].correspondingUseElement;
          }
        }
      }

      // keep the semantics of preventDefault
      if (inEvent.preventDefault) {
        eventCopy.preventDefault = function() {
          inEvent.preventDefault();
        };
      }
      return eventCopy;
    },
    getTarget: function(inEvent) {
      var capture = this.captureInfo[inEvent.pointerId];
      if (!capture) {
        return inEvent._target;
      }
      if (inEvent._target === capture || !(inEvent.type in BOUNDARY_EVENTS)) {
        return capture;
      }
    },
    propagate: function(event, fn, propagateDown) {
      var target = event.target;
      var targets = [];

      // Order of conditions due to document.contains() missing in IE.
      while (target !== document && !target.contains(event.relatedTarget)) {
        targets.push(target);
        target = target.parentNode;

        // Touch: Do not propagate if node is detached.
        if (!target) {
          return;
        }
      }
      if (propagateDown) {
        targets.reverse();
      }
      targets.forEach(function(target) {
        event.target = target;
        fn.call(this, event);
      }, this);
    },
    setCapture: function(inPointerId, inTarget, skipDispatch) {
      if (this.captureInfo[inPointerId]) {
        this.releaseCapture(inPointerId, skipDispatch);
      }

      this.captureInfo[inPointerId] = inTarget;
      this.implicitRelease = this.releaseCapture.bind(this, inPointerId, skipDispatch);
      document.addEventListener('pointerup', this.implicitRelease);
      document.addEventListener('pointercancel', this.implicitRelease);

      var e = new PointerEvent('gotpointercapture');
      e.pointerId = inPointerId;
      e._target = inTarget;

      if (!skipDispatch) {
        this.asyncDispatchEvent(e);
      }
    },
    releaseCapture: function(inPointerId, skipDispatch) {
      var t = this.captureInfo[inPointerId];
      if (!t) {
        return;
      }

      this.captureInfo[inPointerId] = undefined;
      document.removeEventListener('pointerup', this.implicitRelease);
      document.removeEventListener('pointercancel', this.implicitRelease);

      var e = new PointerEvent('lostpointercapture');
      e.pointerId = inPointerId;
      e._target = t;

      if (!skipDispatch) {
        this.asyncDispatchEvent(e);
      }
    },
    /**
     * Dispatches the event to its target.
     *
     * @param {Event} inEvent The event to be dispatched.
     * @return {Boolean} True if an event handler returns true, false otherwise.
     */
    dispatchEvent: /*scope.external.dispatchEvent || */function(inEvent) {
      var t = this.getTarget(inEvent);
      if (t) {
        return t.dispatchEvent(inEvent);
      }
    },
    asyncDispatchEvent: function(inEvent) {
      requestAnimationFrame(this.dispatchEvent.bind(this, inEvent));
    }
  };
  dispatcher.boundHandler = dispatcher.eventHandler.bind(dispatcher);

  var targeting = {
    shadow: function(inEl) {
      if (inEl) {
        return inEl.shadowRoot || inEl.webkitShadowRoot;
      }
    },
    canTarget: function(shadow) {
      return shadow && Boolean(shadow.elementFromPoint);
    },
    targetingShadow: function(inEl) {
      var s = this.shadow(inEl);
      if (this.canTarget(s)) {
        return s;
      }
    },
    olderShadow: function(shadow) {
      var os = shadow.olderShadowRoot;
      if (!os) {
        var se = shadow.querySelector('shadow');
        if (se) {
          os = se.olderShadowRoot;
        }
      }
      return os;
    },
    allShadows: function(element) {
      var shadows = [];
      var s = this.shadow(element);
      while (s) {
        shadows.push(s);
        s = this.olderShadow(s);
      }
      return shadows;
    },
    searchRoot: function(inRoot, x, y) {
      if (inRoot) {
        var t = inRoot.elementFromPoint(x, y);
        var st, sr;

        // is element a shadow host?
        sr = this.targetingShadow(t);
        while (sr) {

          // find the the element inside the shadow root
          st = sr.elementFromPoint(x, y);
          if (!st) {

            // check for older shadows
            sr = this.olderShadow(sr);
          } else {

            // shadowed element may contain a shadow root
            var ssr = this.targetingShadow(st);
            return this.searchRoot(ssr, x, y) || st;
          }
        }

        // light dom element is the target
        return t;
      }
    },
    owner: function(element) {
      var s = element;

      // walk up until you hit the shadow root or document
      while (s.parentNode) {
        s = s.parentNode;
      }

      // the owner element is expected to be a Document or ShadowRoot
      if (s.nodeType !== Node.DOCUMENT_NODE && s.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) {
        s = document;
      }
      return s;
    },
    findTarget: function(inEvent) {
      var x = inEvent.clientX;
      var y = inEvent.clientY;

      // if the listener is in the shadow root, it is much faster to start there
      var s = this.owner(inEvent.target);

      // if x, y is not in this root, fall back to document search
      if (!s.elementFromPoint(x, y)) {
        s = document;
      }
      return this.searchRoot(s, x, y);
    }
  };

  var forEach = Array.prototype.forEach.call.bind(Array.prototype.forEach);
  var map = Array.prototype.map.call.bind(Array.prototype.map);
  var toArray = Array.prototype.slice.call.bind(Array.prototype.slice);
  var filter = Array.prototype.filter.call.bind(Array.prototype.filter);
  var MO = window.MutationObserver || window.WebKitMutationObserver;
  var SELECTOR = '[touch-action]';
  var OBSERVER_INIT = {
    subtree: true,
    childList: true,
    attributes: true,
    attributeOldValue: true,
    attributeFilter: ['touch-action']
  };

  function Installer(add, remove, changed, binder) {
    this.addCallback = add.bind(binder);
    this.removeCallback = remove.bind(binder);
    this.changedCallback = changed.bind(binder);
    if (MO) {
      this.observer = new MO(this.mutationWatcher.bind(this));
    }
  }

  Installer.prototype = {
    watchSubtree: function(target) {

      // Only watch scopes that can target find, as these are top-level.
      // Otherwise we can see duplicate additions and removals that add noise.
      //
      // TODO(dfreedman): For some instances with ShadowDOMPolyfill, we can see
      // a removal without an insertion when a node is redistributed among
      // shadows. Since it all ends up correct in the document, watching only
      // the document will yield the correct mutations to watch.
      if (this.observer && targeting.canTarget(target)) {
        this.observer.observe(target, OBSERVER_INIT);
      }
    },
    enableOnSubtree: function(target) {
      this.watchSubtree(target);
      if (target === document && document.readyState !== 'complete') {
        this.installOnLoad();
      } else {
        this.installNewSubtree(target);
      }
    },
    installNewSubtree: function(target) {
      forEach(this.findElements(target), this.addElement, this);
    },
    findElements: function(target) {
      if (target.querySelectorAll) {
        return target.querySelectorAll(SELECTOR);
      }
      return [];
    },
    removeElement: function(el) {
      this.removeCallback(el);
    },
    addElement: function(el) {
      this.addCallback(el);
    },
    elementChanged: function(el, oldValue) {
      this.changedCallback(el, oldValue);
    },
    concatLists: function(accum, list) {
      return accum.concat(toArray(list));
    },

    // register all touch-action = none nodes on document load
    installOnLoad: function() {
      document.addEventListener('readystatechange', function() {
        if (document.readyState === 'complete') {
          this.installNewSubtree(document);
        }
      }.bind(this));
    },
    isElement: function(n) {
      return n.nodeType === Node.ELEMENT_NODE;
    },
    flattenMutationTree: function(inNodes) {

      // find children with touch-action
      var tree = map(inNodes, this.findElements, this);

      // make sure the added nodes are accounted for
      tree.push(filter(inNodes, this.isElement));

      // flatten the list
      return tree.reduce(this.concatLists, []);
    },
    mutationWatcher: function(mutations) {
      mutations.forEach(this.mutationHandler, this);
    },
    mutationHandler: function(m) {
      if (m.type === 'childList') {
        var added = this.flattenMutationTree(m.addedNodes);
        added.forEach(this.addElement, this);
        var removed = this.flattenMutationTree(m.removedNodes);
        removed.forEach(this.removeElement, this);
      } else if (m.type === 'attributes') {
        this.elementChanged(m.target, m.oldValue);
      }
    }
  };

  function shadowSelector(v) {
    return 'body /shadow-deep/ ' + selector(v);
  }
  function selector(v) {
    return '[touch-action="' + v + '"]';
  }
  function rule(v) {
    return '{ -ms-touch-action: ' + v + '; touch-action: ' + v + '; }';
  }
  var attrib2css = [
    'none',
    'auto',
    'pan-x',
    'pan-y',
    {
      rule: 'pan-x pan-y',
      selectors: [
        'pan-x pan-y',
        'pan-y pan-x'
      ]
    }
  ];
  var styles = '';

  // only install stylesheet if the browser has touch action support
  var hasNativePE = window.PointerEvent || window.MSPointerEvent;

  // only add shadow selectors if shadowdom is supported
  var hasShadowRoot = !window.ShadowDOMPolyfill && document.head.createShadowRoot;

  function applyAttributeStyles() {
    if (hasNativePE) {
      attrib2css.forEach(function(r) {
        if (String(r) === r) {
          styles += selector(r) + rule(r) + '\n';
          if (hasShadowRoot) {
            styles += shadowSelector(r) + rule(r) + '\n';
          }
        } else {
          styles += r.selectors.map(selector) + rule(r.rule) + '\n';
          if (hasShadowRoot) {
            styles += r.selectors.map(shadowSelector) + rule(r.rule) + '\n';
          }
        }
      });

      var el = document.createElement('style');
      el.textContent = styles;
      document.head.appendChild(el);
    }
  }

  var pointermap = dispatcher.pointermap;

  // radius around touchend that swallows mouse events
  var DEDUP_DIST = 25;

  // left, middle, right, back, forward
  var BUTTON_TO_BUTTONS = [1, 4, 2, 8, 16];

  var HAS_BUTTONS = false;
  try {
    HAS_BUTTONS = new MouseEvent('test', { buttons: 1 }).buttons === 1;
  } catch (e) {}

  // handler block for native mouse events
  var mouseEvents = {
    POINTER_ID: 1,
    POINTER_TYPE: 'mouse',
    events: [
      'mousedown',
      'mousemove',
      'mouseup',
      'mouseover',
      'mouseout'
    ],
    register: function(target) {
      dispatcher.listen(target, this.events);
    },
    unregister: function(target) {
      dispatcher.unlisten(target, this.events);
    },
    lastTouches: [],

    // collide with the global mouse listener
    isEventSimulatedFromTouch: function(inEvent) {
      var lts = this.lastTouches;
      var x = inEvent.clientX;
      var y = inEvent.clientY;
      for (var i = 0, l = lts.length, t; i < l && (t = lts[i]); i++) {

        // simulated mouse events will be swallowed near a primary touchend
        var dx = Math.abs(x - t.x);
        var dy = Math.abs(y - t.y);
        if (dx <= DEDUP_DIST && dy <= DEDUP_DIST) {
          return true;
        }
      }
    },
    prepareEvent: function(inEvent) {
      var e = dispatcher.cloneEvent(inEvent);

      // forward mouse preventDefault
      var pd = e.preventDefault;
      e.preventDefault = function() {
        inEvent.preventDefault();
        pd();
      };
      e.pointerId = this.POINTER_ID;
      e.isPrimary = true;
      e.pointerType = this.POINTER_TYPE;
      return e;
    },
    prepareButtonsForMove: function(e, inEvent) {
      var p = pointermap.get(this.POINTER_ID);

      // Update buttons state after possible out-of-document mouseup.
      if (inEvent.which === 0 || !p) {
        e.buttons = 0;
      } else {
        e.buttons = p.buttons;
      }
      inEvent.buttons = e.buttons;
    },
    mousedown: function(inEvent) {
      if (!this.isEventSimulatedFromTouch(inEvent)) {
        var p = pointermap.get(this.POINTER_ID);
        var e = this.prepareEvent(inEvent);
        if (!HAS_BUTTONS) {
          e.buttons = BUTTON_TO_BUTTONS[e.button];
          if (p) { e.buttons |= p.buttons; }
          inEvent.buttons = e.buttons;
        }
        pointermap.set(this.POINTER_ID, inEvent);
        if (!p || p.buttons === 0) {
          dispatcher.down(e);
        } else {
          dispatcher.move(e);
        }
      }
    },
    mousemove: function(inEvent) {
      if (!this.isEventSimulatedFromTouch(inEvent)) {
        var e = this.prepareEvent(inEvent);
        if (!HAS_BUTTONS) { this.prepareButtonsForMove(e, inEvent); }
        e.button = -1;
        pointermap.set(this.POINTER_ID, inEvent);
        dispatcher.move(e);
      }
    },
    mouseup: function(inEvent) {
      if (!this.isEventSimulatedFromTouch(inEvent)) {
        var p = pointermap.get(this.POINTER_ID);
        var e = this.prepareEvent(inEvent);
        if (!HAS_BUTTONS) {
          var up = BUTTON_TO_BUTTONS[e.button];

          // Produces wrong state of buttons in Browsers without `buttons` support
          // when a mouse button that was pressed outside the document is released
          // inside and other buttons are still pressed down.
          e.buttons = p ? p.buttons & ~up : 0;
          inEvent.buttons = e.buttons;
        }
        pointermap.set(this.POINTER_ID, inEvent);

        // Support: Firefox <=44 only
        // FF Ubuntu includes the lifted button in the `buttons` property on
        // mouseup.
        // https://bugzilla.mozilla.org/show_bug.cgi?id=1223366
        e.buttons &= ~BUTTON_TO_BUTTONS[e.button];
        if (e.buttons === 0) {
          dispatcher.up(e);
        } else {
          dispatcher.move(e);
        }
      }
    },
    mouseover: function(inEvent) {
      if (!this.isEventSimulatedFromTouch(inEvent)) {
        var e = this.prepareEvent(inEvent);
        if (!HAS_BUTTONS) { this.prepareButtonsForMove(e, inEvent); }
        e.button = -1;
        pointermap.set(this.POINTER_ID, inEvent);
        dispatcher.enterOver(e);
      }
    },
    mouseout: function(inEvent) {
      if (!this.isEventSimulatedFromTouch(inEvent)) {
        var e = this.prepareEvent(inEvent);
        if (!HAS_BUTTONS) { this.prepareButtonsForMove(e, inEvent); }
        e.button = -1;
        dispatcher.leaveOut(e);
      }
    },
    cancel: function(inEvent) {
      var e = this.prepareEvent(inEvent);
      dispatcher.cancel(e);
      this.deactivateMouse();
    },
    deactivateMouse: function() {
      pointermap.delete(this.POINTER_ID);
    }
  };

  var captureInfo = dispatcher.captureInfo;
  var findTarget = targeting.findTarget.bind(targeting);
  var allShadows = targeting.allShadows.bind(targeting);
  var pointermap$1 = dispatcher.pointermap;

  // This should be long enough to ignore compat mouse events made by touch
  var DEDUP_TIMEOUT = 2500;
  var CLICK_COUNT_TIMEOUT = 200;
  var ATTRIB = 'touch-action';
  var INSTALLER;

  // handler block for native touch events
  var touchEvents = {
    events: [
      'touchstart',
      'touchmove',
      'touchend',
      'touchcancel'
    ],
    register: function(target) {
      INSTALLER.enableOnSubtree(target);
    },
    unregister: function() {

      // TODO(dfreedman): is it worth it to disconnect the MO?
    },
    elementAdded: function(el) {
      var a = el.getAttribute(ATTRIB);
      var st = this.touchActionToScrollType(a);
      if (st) {
        el._scrollType = st;
        dispatcher.listen(el, this.events);

        // set touch-action on shadows as well
        allShadows(el).forEach(function(s) {
          s._scrollType = st;
          dispatcher.listen(s, this.events);
        }, this);
      }
    },
    elementRemoved: function(el) {
      el._scrollType = undefined;
      dispatcher.unlisten(el, this.events);

      // remove touch-action from shadow
      allShadows(el).forEach(function(s) {
        s._scrollType = undefined;
        dispatcher.unlisten(s, this.events);
      }, this);
    },
    elementChanged: function(el, oldValue) {
      var a = el.getAttribute(ATTRIB);
      var st = this.touchActionToScrollType(a);
      var oldSt = this.touchActionToScrollType(oldValue);

      // simply update scrollType if listeners are already established
      if (st && oldSt) {
        el._scrollType = st;
        allShadows(el).forEach(function(s) {
          s._scrollType = st;
        }, this);
      } else if (oldSt) {
        this.elementRemoved(el);
      } else if (st) {
        this.elementAdded(el);
      }
    },
    scrollTypes: {
      EMITTER: 'none',
      XSCROLLER: 'pan-x',
      YSCROLLER: 'pan-y',
      SCROLLER: /^(?:pan-x pan-y)|(?:pan-y pan-x)|auto$/
    },
    touchActionToScrollType: function(touchAction) {
      var t = touchAction;
      var st = this.scrollTypes;
      if (t === 'none') {
        return 'none';
      } else if (t === st.XSCROLLER) {
        return 'X';
      } else if (t === st.YSCROLLER) {
        return 'Y';
      } else if (st.SCROLLER.exec(t)) {
        return 'XY';
      }
    },
    POINTER_TYPE: 'touch',
    firstTouch: null,
    isPrimaryTouch: function(inTouch) {
      return this.firstTouch === inTouch.identifier;
    },
    setPrimaryTouch: function(inTouch) {

      // set primary touch if there no pointers, or the only pointer is the mouse
      if (pointermap$1.size === 0 || (pointermap$1.size === 1 && pointermap$1.has(1))) {
        this.firstTouch = inTouch.identifier;
        this.firstXY = { X: inTouch.clientX, Y: inTouch.clientY };
        this.scrolling = false;
        this.cancelResetClickCount();
      }
    },
    removePrimaryPointer: function(inPointer) {
      if (inPointer.isPrimary) {
        this.firstTouch = null;
        this.firstXY = null;
        this.resetClickCount();
      }
    },
    clickCount: 0,
    resetId: null,
    resetClickCount: function() {
      var fn = function() {
        this.clickCount = 0;
        this.resetId = null;
      }.bind(this);
      this.resetId = setTimeout(fn, CLICK_COUNT_TIMEOUT);
    },
    cancelResetClickCount: function() {
      if (this.resetId) {
        clearTimeout(this.resetId);
      }
    },
    typeToButtons: function(type) {
      var ret = 0;
      if (type === 'touchstart' || type === 'touchmove') {
        ret = 1;
      }
      return ret;
    },
    touchToPointer: function(inTouch) {
      var cte = this.currentTouchEvent;
      var e = dispatcher.cloneEvent(inTouch);

      // We reserve pointerId 1 for Mouse.
      // Touch identifiers can start at 0.
      // Add 2 to the touch identifier for compatibility.
      var id = e.pointerId = inTouch.identifier + 2;
      e.target = captureInfo[id] || findTarget(e);
      e.bubbles = true;
      e.cancelable = true;
      e.detail = this.clickCount;
      e.button = 0;
      e.buttons = this.typeToButtons(cte.type);
      e.width = (inTouch.radiusX || inTouch.webkitRadiusX || 0) * 2;
      e.height = (inTouch.radiusY || inTouch.webkitRadiusY || 0) * 2;
      e.pressure = inTouch.force || inTouch.webkitForce || 0.5;
      e.isPrimary = this.isPrimaryTouch(inTouch);
      e.pointerType = this.POINTER_TYPE;

      // forward modifier keys
      e.altKey = cte.altKey;
      e.ctrlKey = cte.ctrlKey;
      e.metaKey = cte.metaKey;
      e.shiftKey = cte.shiftKey;

      // forward touch preventDefaults
      var self = this;
      e.preventDefault = function() {
        self.scrolling = false;
        self.firstXY = null;
        cte.preventDefault();
      };
      return e;
    },
    processTouches: function(inEvent, inFunction) {
      var tl = inEvent.changedTouches;
      this.currentTouchEvent = inEvent;
      for (var i = 0, t; i < tl.length; i++) {
        t = tl[i];
        inFunction.call(this, this.touchToPointer(t));
      }
    },

    // For single axis scrollers, determines whether the element should emit
    // pointer events or behave as a scroller
    shouldScroll: function(inEvent) {
      if (this.firstXY) {
        var ret;
        var scrollAxis = inEvent.currentTarget._scrollType;
        if (scrollAxis === 'none') {

          // this element is a touch-action: none, should never scroll
          ret = false;
        } else if (scrollAxis === 'XY') {

          // this element should always scroll
          ret = true;
        } else {
          var t = inEvent.changedTouches[0];

          // check the intended scroll axis, and other axis
          var a = scrollAxis;
          var oa = scrollAxis === 'Y' ? 'X' : 'Y';
          var da = Math.abs(t['client' + a] - this.firstXY[a]);
          var doa = Math.abs(t['client' + oa] - this.firstXY[oa]);

          // if delta in the scroll axis > delta other axis, scroll instead of
          // making events
          ret = da >= doa;
        }
        this.firstXY = null;
        return ret;
      }
    },
    findTouch: function(inTL, inId) {
      for (var i = 0, l = inTL.length, t; i < l && (t = inTL[i]); i++) {
        if (t.identifier === inId) {
          return true;
        }
      }
    },

    // In some instances, a touchstart can happen without a touchend. This
    // leaves the pointermap in a broken state.
    // Therefore, on every touchstart, we remove the touches that did not fire a
    // touchend event.
    // To keep state globally consistent, we fire a
    // pointercancel for this "abandoned" touch
    vacuumTouches: function(inEvent) {
      var tl = inEvent.touches;

      // pointermap.size should be < tl.length here, as the touchstart has not
      // been processed yet.
      if (pointermap$1.size >= tl.length) {
        var d = [];
        pointermap$1.forEach(function(value, key) {

          // Never remove pointerId == 1, which is mouse.
          // Touch identifiers are 2 smaller than their pointerId, which is the
          // index in pointermap.
          if (key !== 1 && !this.findTouch(tl, key - 2)) {
            var p = value.out;
            d.push(p);
          }
        }, this);
        d.forEach(this.cancelOut, this);
      }
    },
    touchstart: function(inEvent) {
      this.vacuumTouches(inEvent);
      this.setPrimaryTouch(inEvent.changedTouches[0]);
      this.dedupSynthMouse(inEvent);
      if (!this.scrolling) {
        this.clickCount++;
        this.processTouches(inEvent, this.overDown);
      }
    },
    overDown: function(inPointer) {
      pointermap$1.set(inPointer.pointerId, {
        target: inPointer.target,
        out: inPointer,
        outTarget: inPointer.target
      });
      dispatcher.enterOver(inPointer);
      dispatcher.down(inPointer);
    },
    touchmove: function(inEvent) {
      if (!this.scrolling) {
        if (this.shouldScroll(inEvent)) {
          this.scrolling = true;
          this.touchcancel(inEvent);
        } else {
          inEvent.preventDefault();
          this.processTouches(inEvent, this.moveOverOut);
        }
      }
    },
    moveOverOut: function(inPointer) {
      var event = inPointer;
      var pointer = pointermap$1.get(event.pointerId);

      // a finger drifted off the screen, ignore it
      if (!pointer) {
        return;
      }
      var outEvent = pointer.out;
      var outTarget = pointer.outTarget;
      dispatcher.move(event);
      if (outEvent && outTarget !== event.target) {
        outEvent.relatedTarget = event.target;
        event.relatedTarget = outTarget;

        // recover from retargeting by shadow
        outEvent.target = outTarget;
        if (event.target) {
          dispatcher.leaveOut(outEvent);
          dispatcher.enterOver(event);
        } else {

          // clean up case when finger leaves the screen
          event.target = outTarget;
          event.relatedTarget = null;
          this.cancelOut(event);
        }
      }
      pointer.out = event;
      pointer.outTarget = event.target;
    },
    touchend: function(inEvent) {
      this.dedupSynthMouse(inEvent);
      this.processTouches(inEvent, this.upOut);
    },
    upOut: function(inPointer) {
      if (!this.scrolling) {
        dispatcher.up(inPointer);
        dispatcher.leaveOut(inPointer);
      }
      this.cleanUpPointer(inPointer);
    },
    touchcancel: function(inEvent) {
      this.processTouches(inEvent, this.cancelOut);
    },
    cancelOut: function(inPointer) {
      dispatcher.cancel(inPointer);
      dispatcher.leaveOut(inPointer);
      this.cleanUpPointer(inPointer);
    },
    cleanUpPointer: function(inPointer) {
      pointermap$1.delete(inPointer.pointerId);
      this.removePrimaryPointer(inPointer);
    },

    // prevent synth mouse events from creating pointer events
    dedupSynthMouse: function(inEvent) {
      var lts = mouseEvents.lastTouches;
      var t = inEvent.changedTouches[0];

      // only the primary finger will synth mouse events
      if (this.isPrimaryTouch(t)) {

        // remember x/y of last touch
        var lt = { x: t.clientX, y: t.clientY };
        lts.push(lt);
        var fn = (function(lts, lt) {
          var i = lts.indexOf(lt);
          if (i > -1) {
            lts.splice(i, 1);
          }
        }).bind(null, lts, lt);
        setTimeout(fn, DEDUP_TIMEOUT);
      }
    }
  };

  INSTALLER = new Installer(touchEvents.elementAdded, touchEvents.elementRemoved,
    touchEvents.elementChanged, touchEvents);

  var pointermap$2 = dispatcher.pointermap;
  var HAS_BITMAP_TYPE = window.MSPointerEvent &&
    typeof window.MSPointerEvent.MSPOINTER_TYPE_MOUSE === 'number';
  var msEvents = {
    events: [
      'MSPointerDown',
      'MSPointerMove',
      'MSPointerUp',
      'MSPointerOut',
      'MSPointerOver',
      'MSPointerCancel',
      'MSGotPointerCapture',
      'MSLostPointerCapture'
    ],
    register: function(target) {
      dispatcher.listen(target, this.events);
    },
    unregister: function(target) {
      dispatcher.unlisten(target, this.events);
    },
    POINTER_TYPES: [
      '',
      'unavailable',
      'touch',
      'pen',
      'mouse'
    ],
    prepareEvent: function(inEvent) {
      var e = inEvent;
      if (HAS_BITMAP_TYPE) {
        e = dispatcher.cloneEvent(inEvent);
        e.pointerType = this.POINTER_TYPES[inEvent.pointerType];
      }
      return e;
    },
    cleanup: function(id) {
      pointermap$2.delete(id);
    },
    MSPointerDown: function(inEvent) {
      pointermap$2.set(inEvent.pointerId, inEvent);
      var e = this.prepareEvent(inEvent);
      dispatcher.down(e);
    },
    MSPointerMove: function(inEvent) {
      var e = this.prepareEvent(inEvent);
      dispatcher.move(e);
    },
    MSPointerUp: function(inEvent) {
      var e = this.prepareEvent(inEvent);
      dispatcher.up(e);
      this.cleanup(inEvent.pointerId);
    },
    MSPointerOut: function(inEvent) {
      var e = this.prepareEvent(inEvent);
      dispatcher.leaveOut(e);
    },
    MSPointerOver: function(inEvent) {
      var e = this.prepareEvent(inEvent);
      dispatcher.enterOver(e);
    },
    MSPointerCancel: function(inEvent) {
      var e = this.prepareEvent(inEvent);
      dispatcher.cancel(e);
      this.cleanup(inEvent.pointerId);
    },
    MSLostPointerCapture: function(inEvent) {
      var e = dispatcher.makeEvent('lostpointercapture', inEvent);
      dispatcher.dispatchEvent(e);
    },
    MSGotPointerCapture: function(inEvent) {
      var e = dispatcher.makeEvent('gotpointercapture', inEvent);
      dispatcher.dispatchEvent(e);
    }
  };

  function applyPolyfill() {

    // only activate if this platform does not have pointer events
    if (!window.PointerEvent) {
      window.PointerEvent = PointerEvent;

      if (window.navigator.msPointerEnabled) {
        var tp = window.navigator.msMaxTouchPoints;
        Object.defineProperty(window.navigator, 'maxTouchPoints', {
          value: tp,
          enumerable: true
        });
        dispatcher.registerSource('ms', msEvents);
      } else {
        Object.defineProperty(window.navigator, 'maxTouchPoints', {
          value: 0,
          enumerable: true
        });
        dispatcher.registerSource('mouse', mouseEvents);
        if (window.ontouchstart !== undefined) {
          dispatcher.registerSource('touch', touchEvents);
        }
      }

      dispatcher.register(document);
    }
  }

  var n = window.navigator;
  var s;
  var r;
  var h;
  function assertActive(id) {
    if (!dispatcher.pointermap.has(id)) {
      var error = new Error('InvalidPointerId');
      error.name = 'InvalidPointerId';
      throw error;
    }
  }
  function assertConnected(elem) {
    var parent = elem.parentNode;
    while (parent && parent !== elem.ownerDocument) {
      parent = parent.parentNode;
    }
    if (!parent) {
      var error = new Error('InvalidStateError');
      error.name = 'InvalidStateError';
      throw error;
    }
  }
  function inActiveButtonState(id) {
    var p = dispatcher.pointermap.get(id);
    return p.buttons !== 0;
  }
  if (n.msPointerEnabled) {
    s = function(pointerId) {
      assertActive(pointerId);
      assertConnected(this);
      if (inActiveButtonState(pointerId)) {
        dispatcher.setCapture(pointerId, this, true);
        this.msSetPointerCapture(pointerId);
      }
    };
    r = function(pointerId) {
      assertActive(pointerId);
      dispatcher.releaseCapture(pointerId, true);
      this.msReleasePointerCapture(pointerId);
    };
  } else {
    s = function setPointerCapture(pointerId) {
      assertActive(pointerId);
      assertConnected(this);
      if (inActiveButtonState(pointerId)) {
        dispatcher.setCapture(pointerId, this);
      }
    };
    r = function releasePointerCapture(pointerId) {
      assertActive(pointerId);
      dispatcher.releaseCapture(pointerId);
    };
  }
  h = function hasPointerCapture(pointerId) {
    return !!dispatcher.captureInfo[pointerId];
  };

  function applyPolyfill$1() {
    if (window.Element && !Element.prototype.setPointerCapture) {
      Object.defineProperties(Element.prototype, {
        'setPointerCapture': {
          value: s
        },
        'releasePointerCapture': {
          value: r
        },
        'hasPointerCapture': {
          value: h
        }
      });
    }
  }

  applyAttributeStyles();
  applyPolyfill();
  applyPolyfill$1();

  var pointerevents = {
    dispatcher: dispatcher,
    Installer: Installer,
    PointerEvent: PointerEvent,
    PointerMap: PointerMap,
    targetFinding: targeting
  };

  return pointerevents;

}));;
(function ($, Drupal) {
    'use strict';

    Drupal.behaviors.DX8Menus = {
        // Attachment trigger.
        attach: function (context, settings) {
            // Cache
            var menuItemLinks = [];

            // Counters
            var menuItemLinkCounter;

            // Libs
            var cmm = new Drupal.CohesionResponsiveBreakpoints();

            // States
            var over = false;
            var $lastAnimatedSubmenu = $();
            var hasEntered = false;

            // Constants
            var onceMenuItem = 'js-coh-menu-item-init';
            var onceMenuItemLink = 'js-coh-menu-item-link-init';
            var nameSpace = '.coh-menu-item-link';

            // Constants - classes
            var cls = {
                isCollapsed: 'is-collapsed',
                isExpanded: 'is-expanded',
                both: 'is-collapsed is-expanded',
                hasChildren: 'has-children',
                menuListContainer: 'coh-menu-list-container',
                menuListItem: 'coh-menu-list-item',
                menuListLink: 'js-coh-menu-item-link'
            };

            // Constants - aria attributes
            var aria = {
                expanded: 'aria-expanded',
                popup: 'aria-haspopup'
            };

            // Events
            var onEnter = ['pointerenter'];
            var onLeave = ['mouseleave'];
            var onClick = ['click'];
            var onFocus = ['focus'];
            var onFocusOut = ['focusout'];
            var onKeyDown = ['keydown'];

            /**
             * Call back for initializing the Drupal menu item link functionality
             * @param {Object} settings
             * @returns {undefined}
             */
            function initDrupalMenuItemLink(settings) {
                var bOnClick = true;

                settings = settings.cohesion;
                var $a = settings.settings.$a; // Can be either `<a>` || `<button>`
                var $li = settings.settings.$li;
                var isParent = settings.settings.isParent;
                var thisNameSpace = nameSpace + $a[0].nodeName;

                // Ensure all previous bound events are removed (by nameSpace)
                $li.off(thisNameSpace);
                $a.off(thisNameSpace);

                // Grab the current breakpoint setting
                var setting = settings.settings.breakpoints[settings.key];

                // If animation target exists, store for later use
                if (typeof setting.animationTarget !== 'undefined') {
                    $a.data('currentAnimationTarget', $(setting.animationTarget, $li));
                }

                // If animation target is stored, remove inline display property
                if ($a.data('currentAnimationTarget')) {
                    $($a.data('currentAnimationTarget')).css('display','');
                }

                var toggleSiblings = setting.link_interaction === 'toggle-on-click-hide-siblings' || setting.button_interaction === 'toggle-on-click-hide-siblings';

                if ((setting.link_interaction === 'toggle-on-hover' || toggleSiblings || setting.link_interaction === 'toggle-on-click' || setting.button_interaction === 'toggle-on-click' || settings.button_interaction === 'toggle-parent-on-click') && $li.hasClass(cls.hasChildren) ) {

                    $a.attr(aria.popup, true);

                } else {
                    $a.removeAttr(aria.popup);
                    $a.removeAttr(aria.expanded);
                }

                // Hover events
                if (setting.link_interaction === 'toggle-on-hover') {
                    over = false;

                    if ($li.hasClass(cls.hasChildren)) {
                        $li.on(onLeave.join(thisNameSpace + ' ') + thisNameSpace, function (event) {
                            // hotfix/COH-4793 - prevent leave event being able to fire before enter event to stop menu show/hide getting inverted on page load.
                            if (!hasEntered) {
                                return;
                            }
                            window.setTimeout(function () {
                                over = false;
                            }, 200);

                            // Disable click events for links and buttons.
                            event.preventDefault();

                            // If the menu is closed when leaving ensure it doesnt get reopened
                            if($li.hasClass(cls.isCollapsed))   {
                                return;
                            }

                            toggleSubMenu($li, $a, setting, true, event);
                        });

                        $li.on(onEnter.join(thisNameSpace + ' ') + thisNameSpace, function (event) {
                            // Once the menu is open, make the link clickable - delay so it doesn't happen immediately on touch device.
                            window.setTimeout(function () {
                                over = true;
                            }, 200);

                            // Disable click events for links and buttons.
                            event.preventDefault();
                            // Ensure that the mouseEnter event always fires after a mouseLeave event when mousing between menu elements.
                            setTimeout(function () {
                                toggleSubMenu($li, $a, setting);
                                hasEntered = true;
                            }, 1);

                        });

                        $a.on(onClick.join(thisNameSpace + ' ') + thisNameSpace, function (event) {
                            if (!over) {
                                event.preventDefault();
                            }
                        });

                    }
                    bOnClick = false;
                }

                // Click events
                if (bOnClick) {
                    $a.on(onClick.join(thisNameSpace + ' ') + thisNameSpace, function (e) {

                        // Click through to link || return to parent
                        if (setting.link_interaction === 'click-through-to-link') {
                            return;
                        }

                        // No interaction
                        if (setting.link_interaction === 'no-interaction') {
                            e.preventDefault();
                            return;
                        }

                        // If has children - do something with them
                        if ($li.hasClass(cls.hasChildren)) {

                            e.preventDefault();

                            // On click, toggle sub-menu visibility and hide sibling items. If no sub-menu, go to link
                            toggleSubMenu($li, $(this), setting, toggleSiblings);

                            if(setting.link_interaction === 'toggle-parent-on-click') {
                                return;
                            }
                        }
                    });
                }

                // Focus events
                $a.on(onFocus.join(thisNameSpace + ' ') + thisNameSpace, function (e) {
                    over = true;

                    // Ensure the pointer is always up to date on focus - probably a little overkill, but safer than sorry
                    for (var i = 0; i < menuItemLinks.length; i++) {
                        if ($(this).is(menuItemLinks[i]['$a'])) {
                            menuItemLinkCounter = i;
                            break;
                        }
                    }

                    $a.on(onKeyDown.join(thisNameSpace + ' ') + thisNameSpace, function (e) {

                        // Handle accessibility keys
                        switch (e.key) {

                            case ' ':
                            case 'Spacebar': // IE
                                e.preventDefault();
                                e.stopPropagation();

                                // If menu list item does not have child menu, space follows link
                                if (!$li.hasClass(cls.hasChildren)) {
                                    window.location = $a.attr('href');
                                }

                                // If menu list item has child menu, space toggles child menu
                                if ($li.hasClass(cls.hasChildren)) {
                                    toggleSubMenu($li, $a, setting, toggleSiblings);
                                }

                                break;

                            case 'ArrowDown':
                            case 'ArrowRight':
                            case 'Down': // IE
                            case 'Right': // IE
                                e.preventDefault();
                                e.stopPropagation();

                                // Handle parent menu items (when collapsed you should be able to navigate left / right)
                                if (isParent && (e.key === 'ArrowRight' || e.key === 'Right') && $li.next('.' + cls.menuListItem) && !$li.hasClass(cls.isExpanded)) {
                                    $('.' + cls.menuListLink, $li.next('.' + cls.menuListItem)).eq(0).focus();
                                    break;
                                }

                                // If expanded then move into child items
                                if ($li.hasClass(cls.isExpanded) && $li.hasClass(cls.hasChildren)) {
                                    focusNextMenuItem($li);
                                }

                                // If !expanded then do it
                                if (!$li.hasClass(cls.isExpanded) && $li.hasClass(cls.hasChildren)) {
                                    toggleSubMenu($li, $a, setting, toggleSiblings);
                                }

                                // If !children move onto the next sibling
                                if (!$li.hasClass(cls.hasChildren)) {
                                    focusNextMenuItem($li);
                                }

                                break;

                            case 'Escape':
                            case 'Esc': // IE
                                e.preventDefault();
                                e.stopPropagation();

                                if ($li.parent().closest('.' + cls.menuListItem)) {

                                    toggleSubMenu($li.parent().closest('.' + cls.menuListItem), $li.parent().closest('.' + cls.menuListItem).children('.' + cls.menuListLink), setting, toggleSiblings);

                                    $li.parent().closest('.' + cls.menuListItem).children('.' + cls.menuListLink).focus();
                                }

                                break;

                            case 'ArrowUp':
                            case 'ArrowLeft':
                            case 'Up': // IE
                            case 'Left': // IE
                                e.preventDefault();
                                e.stopPropagation();

                                // Handle parent menu items (when collapsed you should be able to navigate left / right)
                                if (isParent && (e.key === 'ArrowLeft' || e.key === 'Left') && $li.prev('.' + cls.menuListItem) && !$li.hasClass(cls.isExpanded)) {
                                    $('.' + cls.menuListLink, $li.prev('.' + cls.menuListItem)).eq(0).focus();
                                    break;
                                }

                                // If !children || isCollapsed then move back to the previous link
                                if (!$li.hasClass(cls.hasChildren) || $li.hasClass(cls.isCollapsed)) {
                                    focusPreviousMenuItem();
                                }

                                // If !collapsed then do it, toggle siblings and move back to the previous link
                                if (!$li.hasClass(cls.isCollapsed) && $li.hasClass(cls.hasChildren)) {
                                    toggleSubMenu($li, $a, setting, toggleSiblings);
                                }

                                break;

                            case 'Enter':
                                e.preventDefault();
                                e.stopPropagation();
                                // Enter should always follow the link, expanding the menu can be handled with down or space.
                                window.location = $a.attr('href');

                                break;

                            default:
                                return;
                        }


                    });
                });

                $a.on(onFocusOut.join(thisNameSpace + ' ') + thisNameSpace, function (e) {
                    // Remove the previous keyboard events
                    $a.off(onKeyDown.join(thisNameSpace + ' ') + thisNameSpace);
                    over = false;
                });
            }

            /**
             *
             * @param {type} settings
             * @returns {undefined}
             */
            function initDrupalMenuItem(settings) {
                settings = settings.cohesion;
                var $a = settings.settings.$a; // Can be either `<a>` || `<button>`
                var $li = settings.settings.$li;
                var bInteracted = false;
                var $interactees = $a.add($a.siblings('a, button')); // used to ensure sibling A and BUTTON elements get same aria values.

                // Grab the current breakpoint setting
                var setting = settings.settings.breakpoints[settings.key];

                if (typeof $li.data('interacted') !== 'undefined' && $li.data('interacted') === true) {
                    bInteracted = true;
                }

                if (!bInteracted) {
                    $li.toggleClass(cls.isCollapsed, setting === 'hidden' || (setting === 'trail' && !$li.hasClass('in-active-trail')));
                    $li.toggleClass(cls.isExpanded, setting === 'visible' || (setting === 'trail' && $li.hasClass('in-active-trail')));
                    if ($li.hasClass(cls.hasChildren)) {

                        $interactees.each(function () {
                            var $interactee = $(this);

                            if ($interactee.attr(aria.popup) === "true") {
                                if ($li.hasClass(cls.isCollapsed)) {
                                    $interactee.attr(aria.expanded, false);
                                }
                                if ($li.hasClass(cls.isExpanded)) {
                                    $interactee.attr(aria.expanded, true);
                                }
                            }
                        });
                    }
                }
            }

            function toggleSiblingsFn($li, $a, setting) {
                var $siblings = $li.siblings('li.has-children');
                $siblings.children('a, button').each(function() {
                    var $this = $(this);
                    if($this.attr(aria.expanded) === "true") {
                        toggleSubMenu($this.parent('li'), $this, setting, false);
                    }
                });
            }

            function toggleSubMenu($li, $a, setting, toggleSiblings) {
                var $interactees = $a.add($a.siblings('a, button'));
                var $submenu;

                if (setting.animationTarget && setting.animationType) {
                    // hardcoded general sibling selector for animation target, as sub menu will always be a sibling of parent menu's link
                    $submenu = $('~' + setting.animationTarget, $a);

                    if(setting.button_interaction === 'toggle-parent-on-click')  {
                        $submenu = $('> ' + setting.animationTarget, $li);
                        $interactees = $interactees.add($('> a, > button', $li));
                    }

                    var animationOriginArray;

                    if (setting.animationOrigin) {
                        // convert animation origin string to array
                        animationOriginArray = setting.animationOrigin.split(',');
                    }

                    if ((setting.link_interaction !== 'toggle-on-click-hide-siblings' || setting.button_interaction !== 'toggle-on-click-hide-siblings') && $lastAnimatedSubmenu.length && !$lastAnimatedSubmenu.is($submenu)) {
                        $lastAnimatedSubmenu.stop(true, true);
                    }

                    $submenu.stop(true, true).toggle({
                        effect: setting.animationType,
                        direction: setting.animationDirection,
                        distance: setting.animationDistance,
                        percent: setting.animationScale,
                        origin: animationOriginArray,
                        size: setting.animationFoldHeight,
                        horizFirst: setting.animationHorizontalFirst,
                        times: setting.animationIterations,
                        easing: setting.animationEasing,
                        duration: setting.animationDuration
                    });
                    $lastAnimatedSubmenu = $submenu;
                }
                $li.toggleClass(cls.both);

                $interactees.each(function () {
                    var $interactee = $(this);
                    if ($interactee.attr(aria.popup) === "true") {
                        if ($li.hasClass(cls.isCollapsed)) {
                            $interactee.attr(aria.expanded, false);
                        }
                        if ($li.hasClass(cls.isExpanded)) {
                            $interactee.attr(aria.expanded, true);
                        }
                    }
                });

                $li.data('interacted', true);

                // Call the call back if defined
                if (toggleSiblings) {
                    toggleSiblingsFn($li, $a, setting);
                }
            }

            function focusPreviousMenuItem() {
                if (menuItemLinkCounter > 0) {
                    menuItemLinkCounter--;
                    menuItemLinks[menuItemLinkCounter]['$a'].focus();
                }
            }

            function focusNextMenuItem() {
                if (menuItemLinkCounter + 1 < menuItemLinks.length) {
                    menuItemLinkCounter++;
                    menuItemLinks[menuItemLinkCounter]['$a'].focus();
                }
            }

            function focusMenuItem() {
                menuItemLinks[menuItemLinkCounter]['$a'].focus();
            }

            // Each menu item link
            var menuItems = $('.js-coh-menu-item-link, .js-coh-menu-item-button');
            $.each(menuItems.once(onceMenuItemLink), function (i, e) {
                var $this = $(this),
                    $li = $(this).closest('.coh-menu-list-item'),
                    responsiveSettings = $this.data('cohSettings'),
                    key,
                    settings = {
                        $a: $this,
                        $li: $li,
                        isParent: !$li.parent().closest('.' + cls.menuListItem).length,
                        breakpoints: {}
                    };

                // Keep a list of the menu links
                menuItemLinks.push({
                    $a: $this,
                    $li: $li,
                    tabindex: $this.attr('tabindex') || i
                });

                // Ensure they are in the correct order
                if (i + 1 === menuItems.length) {

                    menuItemLinks.sort(function (a, b) {
                        return a.tabindex - b.tabindex;
                    });
                }

                for (var i = 0; i < cmm.breakpoints.length; i++) {

                    key = cmm.breakpoints[i].key;

                    // Populate all breakpoints regardless of whether the settings are set or not to simulate inheritance
                    settings.breakpoints[key] = {};
                    if (typeof responsiveSettings[key] !== 'undefined') {

                        settings.breakpoints[key] = responsiveSettings[key];

                        var previous = responsiveSettings[key];

                    } else {

                        if (typeof cmm.breakpoints[i - 1] !== 'undefined' && typeof previous !== 'undefined') {
                            settings.breakpoints[key] = previous;
                        }
                    }
                }

                cmm.addListeners(settings, initDrupalMenuItemLink);
            });

            // Each menu item
            $.each($('.js-coh-menu-item').once(onceMenuItem), function () {

                var $this = $(this),
                    responsiveSettings = $this.data('cohSettings'),
                    key,
                    settings = {
                        $li: $this,
                        $a: $('> a, > button', $this),
                        breakpoints: {}
                    };

                // No children or settings then just return
                if ($this.hasClass(cls.hasChildren)) {
                    for (var i = 0; i < cmm.breakpoints.length; i++) {

                        key = cmm.breakpoints[i].key;

                        // Populate all breakpoints regardless of whether the settings are set or not to simulate inheritance
                        settings.breakpoints[key] = {};
                        if (typeof responsiveSettings[key] !== 'undefined') {

                            settings.breakpoints[key] = responsiveSettings[key];

                            var previous = responsiveSettings[key];

                        } else {

                            if (typeof cmm.breakpoints[i - 1] !== 'undefined' && typeof previous !== 'undefined') {
                                settings.breakpoints[key] = previous;
                            }
                        }
                    }

                    cmm.addListeners(settings, initDrupalMenuItem);
                }
            });
        }
    };

})(jQuery, Drupal);
;
/**!
 * author Christopher Blum
 *    - based on the idea of Remy Sharp, http://remysharp.com/2009/01/26/element-in-view-event-plugin/
 *    - forked from http://github.com/zuk/jquery.inview/
 */
(function (factory) {
  if (typeof define == 'function' && define.amd) {
    // AMD
    define(['jquery'], factory);
  } else if (typeof exports === 'object') {
    // Node, CommonJS
    module.exports = factory(require('jquery'));
  } else {
    // Browser globals
    factory(jQuery);
  }
}(function ($) {

  var inviewObjects = [], viewportSize, viewportOffset,
    d = document, w = window, documentElement = d.documentElement, timer;

  $.event.special.inview = {
    add: function(data) {
      inviewObjects.push({ data: data, $element: $(this), element: this });
      // Use setInterval in order to also make sure this captures elements within
      // "overflow:scroll" elements or elements that appeared in the dom tree due to
      // dom manipulation and reflow
      // old: $(window).scroll(checkInView);
      //
      // By the way, iOS (iPad, iPhone, ...) seems to not execute, or at least delays
      // intervals while the user scrolls. Therefore the inview event might fire a bit late there
      //
      // Don't waste cycles with an interval until we get at least one element that
      // has bound to the inview event.
      if (!timer && inviewObjects.length) {
        timer = setInterval(checkInView, 250);
      }
    },

    remove: function(data) {
      for (var i=0; i<inviewObjects.length; i++) {
        var inviewObject = inviewObjects[i];
        if (inviewObject.element === this && inviewObject.data.guid === data.guid) {
          inviewObjects.splice(i, 1);
          break;
        }
      }

      // Clear interval when we no longer have any elements listening
      if (!inviewObjects.length) {
        clearInterval(timer);
        timer = null;
      }
    }
  };

  function getViewportSize() {
    var mode, domObject, size = { height: w.innerHeight, width: w.innerWidth };

    // if this is correct then return it. iPad has compat Mode, so will
    // go into check clientHeight/clientWidth (which has the wrong value).
    if (!size.height) {
      mode = d.compatMode;
      if (mode || !$.support.boxModel) { // IE, Gecko
        domObject = mode === 'CSS1Compat' ?
          documentElement : // Standards
          d.body; // Quirks
        size = {
          height: domObject.clientHeight,
          width:  domObject.clientWidth
        };
      }
    }

    return size;
  }

  function getViewportOffset() {
    return {
      top:  w.pageYOffset || documentElement.scrollTop   || d.body.scrollTop,
      left: w.pageXOffset || documentElement.scrollLeft  || d.body.scrollLeft
    };
  }

  function checkInView() {
    if (!inviewObjects.length) {
      return;
    }

    var i = 0, $elements = $.map(inviewObjects, function(inviewObject) {
      var selector  = inviewObject.data.selector,
        $element  = inviewObject.$element;
      return selector ? $element.find(selector) : $element;
    });

    viewportSize   = viewportSize   || getViewportSize();
    viewportOffset = viewportOffset || getViewportOffset();

    for (; i<inviewObjects.length; i++) {
      // Ignore elements that are not in the DOM tree
      if (!$.contains(documentElement, $elements[i][0])) {
        continue;
      }

      var $element      = $($elements[i]),
        elementSize   = { height: $element[0].offsetHeight, width: $element[0].offsetWidth },
        elementOffset = $element.offset(),
        inView        = $element.data('inview');

      // Don't ask me why because I haven't figured out yet:
      // viewportOffset and viewportSize are sometimes suddenly null in Firefox 5.
      // Even though it sounds weird:
      // It seems that the execution of this function is interferred by the onresize/onscroll event
      // where viewportOffset and viewportSize are unset
      if (!viewportOffset || !viewportSize) {
        return;
      }

      if (elementOffset.top + elementSize.height > viewportOffset.top &&
          elementOffset.top < viewportOffset.top + viewportSize.height &&
          elementOffset.left + elementSize.width > viewportOffset.left &&
          elementOffset.left < viewportOffset.left + viewportSize.width) {
        if (!inView) {
          $element.data('inview', true).trigger('inview', [true]);
        }
      } else if (inView) {
        $element.data('inview', false).trigger('inview', [false]);
      }
    }
  }

  $(w).on("scroll resize scrollstop", function() {
    viewportSize = viewportOffset = null;
  });

  // IE < 9 scrolls to focused elements without firing the "scroll" event
  if (!documentElement.addEventListener && documentElement.attachEvent) {
    documentElement.attachEvent("onfocusin", function() {
      viewportOffset = null;
    });
  }
}));
;
(function ($, Drupal) {
  "use strict";

  Drupal.behaviors.AnalyticsDatalayer = {
    attach: function (context, settings) {

      // Check to see if dataLayer is available.
      if (typeof dataLayer !== 'undefined') {

        $('[data-analytics-layer]').once('coh-js-analytics-layer-init').each(function () {

          // Save the element reference.
          var element = $(this);

          // Decode the analytics JSON from the data attribute.
          var events = JSON.parse($(this).attr('data-analytics-layer'));

          // Loop through this attribute object, creating an event for each entry.
          events.forEach(function (event) {

            element.bind(event.trigger, function (e, inView) {

              // inview trigger fired, but element left the viewport.
              if (e.type === 'inview' && !inView) {
                return;
              }

              // Create object with event key value.
              var obj = {};
              obj[event.key] = event.value;

              // Push the data.
              dataLayer.push(obj);
            });
          });
        });
      }
      // Data layer is not defined.
      else {
        console.warn('Data layer is not available, but Data layer events have been defined.');
      }
    }
  };

})(jQuery, Drupal);
;
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
(function(a,b){"use strict";b.behaviors.gtm_rxfinder={attach:function(b){a(document).ready(()=>{function c(){let a=d.val();!/^\d{5}$/.test(a)&&5>a.length&&(a=("00000"+a).substr(a.length),d.val(a)),f.attr("data-attribute-datalayer-event-action","rx-finder: "+a),f.attr("data-attribute-datalayer-event-label","rx-finder: "+a)}let d=a("[name=zip]",b),e=a(d.closest("form"),b),f=e.find("[type=submit]"),g=e.find("[type=submit]").parent();d.one("change",c),f.one("click",c),g.one("click",function(){c();var a=f.attr("data-attribute-datalayer-event-action"),b=f.attr("data-attribute-datalayer-event-category"),d=f.attr("data-attribute-datalayer-event-label");dataLayer.push({eventCategory:b,eventAction:a,eventLabel:d,eventValue:0,event:"eventClick"})})})}}})(jQuery,Drupal);;
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
