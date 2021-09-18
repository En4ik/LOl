(function(a,b){"use strict";b.behaviors.onetouch_webforms_select_chosen={attach:function(b){a(".webform-submission-form select",b).once("onetouch_webforms_select_chosen").each(function(){a(".webform-submission-form select").each(function(){a(this).attr("required")!==void 0&&a(this).on("change",function(){a(this).valid()})})})}}})(jQuery,Drupal);;
(function(a,b){"use strict";const c=".webform-button--submit",d=".js-form-item",e="coh-style-loading-spinner";let f;b.behaviors.onetouch_webforms_flood_control={blockButton:function(b){let e=this,f=a(b),g=f.find(c);g.prop("disabled",0==f.find("input.error:visible").length),e.updateLoading(b),f.find("a").css("pointer-events","none"),f.find(d).off("DOMSubtreeModified.flood_control").on("DOMSubtreeModified.flood_control",function(){e.unblockButton(b)})},unblockButton:function(b){let e=this,f=a(b),g=f.find(c);g.prop("disabled",!1),e.updateLoading(b),"undefined"!=typeof b&&(f.find("a").css("pointer-events","auto"),f.find(d).off("DOMSubtreeModified.flood_control"))},captchaPreventSubmit:function(b){if(!a(b).length)return;let c=this,d=".g-recaptcha-response";a(b).off("submit.captcha").on("submit.captcha",function(g){let e=a(b).find(d).val();a(b).find("iframe[title=\"reCAPTCHA\"]").css("border",""),a(b).find(d).length&&(""===e||e===void 0)&&(g.preventDefault(),a(b).find("iframe[title=\"reCAPTCHA\"]").css("border","1px solid #d40000"),c.unblockButton(a(b)),f=setInterval(function(){e=a(b).find(d).val(),""!==e&&(a(b).find("iframe[title=\"reCAPTCHA\"]").css("border",""),clearInterval(f))},1e3))})},updateLoading:function(b){let d=a(b),f=d.find(c),g=d.find(`.${e}`);f.is(":disabled")&&0==g.length?f.after(`<div class="${e}">`):f.is(":enabled")&&g.remove()},attach:function(b){let c=this;a(`.webform-submission-form:not(${".flood-control-off"})`,b).each((b,d)=>{a(d).on("submit.flood_control",function(){c.blockButton(d)}),c.captchaPreventSubmit(d)})}}})(jQuery,Drupal);;
(function(a,b){"use strict";b.behaviors.onetouch_webforms_radios={attach:function(b){a.validator.addMethod("validateRequiredRadio",function(a){return"undefined"!=typeof a},""),a("document").ready(function(){a("input[type=\"radio\"][data-webform-required-error]",b).each(function(){a(this).rules("add",{validateRequiredRadio:!0,messages:{required:""}})})})}}})(jQuery,Drupal);;
(function(a,b){'use strict';a(document).once("webform_ot_validate").on("cv-jquery-validate-options-update",function(b,c){c.errorElement="strong",c.showErrors=function(){this.defaultShowErrors(),a(this.currentForm).find("strong.error").addClass("form-item--error-message");a(this.currentForm).find([".form-checkboxes",".form-radios",".form-type-datelist",".container-inline",".form-type-tel",".webform-type-webform-height",".form--inline"].join(",")).each(function(){let b=a(this),c=b.find("strong.error.form-item--error-message");b.hasClass("form-checkboxes")?c.hide():c.insertAfter(b)}),a(this.currentForm).find("strong.error.form-item--error-message ~ .field-suffix").each(function(){let b=a(this),c=b.prev("strong.error.form-item--error-message");c.insertAfter(b)})}}),b.behaviors.onetouch_webforms_validate_checkboxes={attach:function(){a(".form-checkboxes input[type=checkbox]:required").closest(".form-checkboxes").addClass("form-checkboxes-required");let b=a(".form-checkboxes-required");if(b.hasClass("form-checkboxes")){function c(){0<b.find("input[type=\"checkbox\"]:checked").length?e.removeClass("error"):e.addClass("error")}let d=b.find("strong.error.form-item--error-message"),e=b.find("input[type=\"checkbox\"]");e.on("change",function(){c()}),a("form").once("webform_ot_validate_messages").on("submit",function(){c()}),d.hide()}}}})(jQuery,Drupal);;
"use strict";(function(a,b){'use strict';(function(){var b,c=a(".header-main-wrapper").parent(),d=a("#magic-line"),e=function(){var b=c.find("ul").find("li.in-active-trail").first();return 0<b.length?d.css({left:b.offset().left,width:b.outerWidth()}).data("origLeft",d.position().left):d.css({left:a(".header-navigation-wrapper").position().left,width:0}).data("origLeft",d.position().left),0<b.find("a.coh-style-register-you-device---icon").length||0<b.find("a.coh-style-free-meter-offer---icon").length?d.css({backgroundColor:"#ffffff"}):d.css({backgroundColor:"#00a919"}),!0},f=location.pathname+location.search+location.hash;"/"!==f&&setTimeout(function(){e(),a(".coh-menu-item.is-active .coh-link").addClass("changed")},500),a(window).resize(function(){"undefined"!=typeof b&&clearTimeout(b),b=setTimeout(e(),1e3)}),a(".header-main-wrapper ul:not(.header-dropdown-menu)").find("> li").hover(function(){var b=a(this),c=b.offset().left,e=b.outerWidth();d.stop().animate({left:c,width:e}),0<b.find("a.coh-style-register-you-device---icon").length||0<b.find("a.coh-style-free-meter-offer---icon").length?d.css({backgroundColor:"#ffffff"}):d.css({backgroundColor:"#00a919"})},function(){var b=a(".header-main-wrapper ul li.in-active-trail");0<b.length?(d.stop().animate({left:b.offset().left,width:b.outerWidth()}),0<b.find("a.coh-style-register-you-device---icon").length||0<b.find("a.coh-style-free-meter-offer---icon").length?d.css({backgroundColor:"#ffffff"}):d.css({backgroundColor:"#00a919"})):d.stop().animate({left:a(".header-navigation-wrapper").offset().left,width:0})})})(),b.behaviors.anchors={attach:function(c){var d=function(c,d){var e=a("div[data-id=\"".concat(c,"\"]"));return e?"hash"===d?void a(window).on("load",function(){b.behaviors.utils.scrollTo(e)}):void("anchor"==d&&setTimeout(function(){b.behaviors.utils.scrollTo(e)},300)):void 0};a("body",c).once("anchors").each(function(){var b=window.location.hash.substr(1);b&&d(b,"hash"),a(".anchor-link").on("click",function(){var c=a(".header-mobile-toggle-button");c.hasClass("active")&&c.trigger("click"),b=this.hash.substr(1),b&&d(b,"anchor")}),a(".coh-faq-section a").on("click",function(b){var c=a(this).attr("href"),d=c.split("#");if(1!==d.length&&d[0]==window.location.pathname){var e=a("#".concat(d[1]));if(0!==e.length){var f=a(".coh-accordion-tabs-content.is-active"),g=e.closest(".coh-accordion-tabs-content-wrapper"),h=f.closest(".coh-accordion-tabs-content-wrapper"),i=e.parent().offset().top,j=i;i>f.parent().offset().top&&g.is(h)&&(j=i-f.height()),a("html, body").stop().animate({scrollTop:j},1e3),e.parent().find(".coh-accordion-title > a").trigger("click"),b.preventDefault()}}})})}},b.behaviors.utils={scrollTo:function(c){var d=a(c);d.length&&(b.behaviors.lifescan_aos.removeAOS(a(".aos-mobile-off")),b.behaviors.lifescan_aos.removeAOS(a(".aos-desktop-off")),a("html, body").stop().animate({scrollTop:d.offset().top-20},1e3,function(){var a=b.behaviors.lifescan_aos.viewPortAOS();b.behaviors.lifescan_aos.checkAOS(a)}))}},b.behaviors.displayProductMenu={attach:function(b){function c(){g.css({visibility:"visible"}),k.css({opacity:1}),i.css({opacity:1}),j.css({opacity:1}),k.toggleClass("hide-effect"),i.toggleClass("hide-effect"),j.toggleClass("hide-effect"),h.css({height:380})}function d(){h.css({height:0}),k.css({opacity:0}),i.css({opacity:0}),j.css({opacity:0}),k.toggleClass("hide-effect"),i.toggleClass("hide-effect"),j.toggleClass("hide-effect"),setTimeout(function(){0==h.height()&&g.css({visibility:"hidden"})},600)}var e=a(b).find(".header-main-wrapper").once("displayProductMenu");if(0!==e.length){var f=a(".header-main-wrapper").first().find("li").first(),g=a("#product-submenu-container"),h=a("#product-submenu"),i=a(g).find("#left-arrow"),j=a(g).find("#right-arrow"),k=a("#view-products"),l=function(){return a("#product-submenu li").length*a("#product-submenu li").outerWidth(!0)},m=l(),n=function(){return a(h).parent().outerWidth()},o=n(),p=function(){return o=n(),o-m},q=p();a(window).on("resize",function(){q=p(),m=l(),u()});var r=o,s=0,t=function(){return a(h).scrollLeft()};d(),f.on("mouseenter",function(){c()}),f.on("mouseleave",function(){d()}),g.on("mouseenter",function(){f.mouseenter()}),g.on("mouseleave",function(){f.mouseleave()});var u=function(){a(i).addClass("hidden"),1024>m||m+40<o?a(j).addClass("hidden"):(a(j).removeClass("hidden"),a(h).on("scroll",function(){q=m-o,s=t(),s<=20?(a(i).addClass("hidden"),a(j).removeClass("hidden")):s<q+40?(a(i).removeClass("hidden"),a(j).removeClass("hidden")):s>=q+40&&(a(i).removeClass("hidden"),a(j).addClass("hidden")),m+40<o&&a(j).addClass("hidden")}))};u(),a(j).on("click",function(){a(h).animate({scrollLeft:r},300)}),a(i).on("click",function(){a(h).animate({scrollLeft:0},300)})}}},b.behaviors.productMenuViewScrolling={attach:function(b){var c=a(b).find(".products-anchor-links").once("attachScroll");0===c.length||a(c).find("a").on("click",function(c){c.preventDefault(),a("".concat(".products-anchor-links"," a"),b).removeClass("active"),a(this).addClass("active");var d=a(this).data("category-anchor"),e=a(".product-mobile-menu").find(".".concat(d)).position().left;a("".concat(".product-mobile-menu"),b).stop(!0,!0).animate({scrollLeft:"+=".concat(e)},"slow")})}},b.behaviors.webformPharmacyIconSubmit={attach:function(b){var c=a(b).find(".webform-pharmacy-search-icon").once("webformPharmacyIconSubmit");0===c.length||a(c).on("click",function(){a(c).closest("form").submit()})}},b.behaviors.messagesError={attach:function(b){var c=a(b).find(".messages--error").once("close");0===c.length||a(c).on("click",function(){a(b).find(".messages--error").hide("slow")})}},b.behaviors.carouselDotAnimation={attach:function(b){a(document).ready(function(){a(".coh-style-animated-bar",b).each(function(){var b,c="slick-active",d="first-time-active",e=a(this).find("li.".concat(c," button")).width()+"px";b=a(this).find("li.".concat(c)).removeClass(c),b.find("button").append("<span class=\"progress\"></span>"),setTimeout(function(){b.addClass(d),a(".progress").animate({width:e},{duration:4e3,easing:"linear"})},0);var f=setInterval(function(){b.next().hasClass(c)&&(b.removeClass(d),clearInterval(f))},10)})})}}})(jQuery,Drupal);;
"use strict";(function(a,b){'use strict';b.theme.ajaxProgressThrobber=function(){return"<div class=\"coh-style-loading-spinner ajax-spinner--inline\"></div>"}})(jQuery,Drupal);;
(function(a,b){"use strict";b.behaviors.onetouchGtmDatalayerAccordionWithImages={attach:function(b){function c(b,c){if(a(b).hasClass("gtm-expanded"))c.stopPropagation();else{var e=d();dataLayer.push({eventCategory:"otrplus-content",eventAction:a(e).text().trim()+":expanded",eventLabel:a(e).text().trim()+":expanded:"+a(b).text(),eventValue:"",event:"eventClick"})}}function d(){return a(".header-main-wrapper").parent().find("ul").find("li.in-active-trail").first()}var e=a(b).find(".otr-main-content").once("onetouchGtmDatalayerAccordionWithImages");0===e.length||a(".coh-accordion-title").on("click",function(a){c(this,a)})}}})(jQuery,Drupal,drupalSettings);;
(function(a,b){"use strict";b.behaviors.onetouchGtmDatalayerFAQAccordion={attach:function(b){function c(b){a(b).hasClass("gtm-expanded")?(a(".coh-accordion-title").removeClass("gtm-expanded"),f(b)):(a(".coh-accordion-title").removeClass("gtm-expanded"),a(b).parent().find(".coh-accordion-title").first().addClass("gtm-expanded"),e(b))}function d(b){var c="faq-content : ";return c+=a(b).parent().parent().parent().parent().parent().find(".coh-style-faq-heading").children("h3").text()+" : ",c+=a(b).find("a").attr("href")+" : ",c+=a(b).find("a").text(),c}function e(a){dataLayer.push({eventCategory:"faq-content",eventAction:"faq-content : expand",eventLabel:d(a),eventValue:"",event:"eventClick"})}function f(a){dataLayer.push({eventCategory:"faq-content",eventAction:"faq-content : collapse",eventLabel:d(a),eventValue:"",event:"eventClick"})}var g=a(b).find(".coh-faq-section").once("onetouchGtmDatalayerFAQAccordion");0===g.length||a.each(g,function(b){a(g[b]).find(".coh-accordion-title").on("click",function(){c(this)})})}}})(jQuery,Drupal,drupalSettings);;
(function(a,b){"use strict";function c(){a("form.webform-submission-search-form, form.views-exposed-form.bef-exposed-form").once().on("submit",function(){let b=a(this).find("input.form-text");dataLayer.push({eventCategory:"search",eventAction:"search : sitewide",eventLabel:b.val(),eventValue:0,event:"eventClick"})})}b.behaviors.bindSitewideSearch={attach:function(){c()}}})(jQuery,Drupal,drupalSettings);;
(function(a,b,c){"use strict";function d(a,b,c,d="0",e="eventClick"){dataLayer.push({eventCategory:a,eventAction:b,eventLabel:c,eventValue:d,event:e})}function e(a){var b="";return"undefined"!=typeof window.sessionStorage.getItem("optinCheckboxValue")&&(b=window.sessionStorage.getItem("optinCheckboxValue").toLowerCase()),`${a} success | opt-in ${b}`}function f(b,c){var d=a(".messages--error > div",c),e="";return 0<d.length&&(e=d.clone().children().remove().end().text().toLowerCase()),0<=e.indexOf(b)}function g(b,c){let g="email-form",h="email-form: cta",i="email: fail",j=c.lead_gen_webform,k=c.lead_gen_optin_checkbox,l=c.lead_gen_captcha_error_text,m=c.lead_gen_thankyou_page,n=c.lead_gen_thankyou_tile,o=c.lead_gen_thankyou_register;a(document).ready(function(){var c=a(j,b),p=0<a(".page-node-type-page",b).length,q=window.location.pathname===m,r="";if(p)if(f(l,b))d(g,g,i);else if(q){r=e("email:"),d(g,g,r);var s=a(n,b),t=a(o,b);s.once().on("click",function(){var b="email thank you : "+a.trim(a(this).text());d(g,h,b)}),t.once().on("click",function(){d(g,h,"email thank you : register")})}c.once().on("submit",function(){var c=a(k,b),e=a("[class*=\"-error-message\"] > .error:visible",b);0<e.length?d(g,g,i):window.sessionStorage.setItem("optinCheckboxValue",c.length?"Yes":"No")})})}b.behaviors.onetouchGtmLeadGen={attach:function(a){g(a,c.onetouch.onetouch_gtm)}}})(jQuery,Drupal,drupalSettings);;
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
/**
* DO NOT EDIT THIS FILE.
* See the following change record for more information,
* https://www.drupal.org/node/2815083
* @preserve
**/

Drupal.debounce = function (func, wait, immediate) {
  var timeout;
  var result;
  return function () {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var context = this;

    var later = function later() {
      timeout = null;

      if (!immediate) {
        result = func.apply(context, args);
      }
    };

    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);

    if (callNow) {
      result = func.apply(context, args);
    }

    return result;
  };
};;
/**
* DO NOT EDIT THIS FILE.
* See the following change record for more information,
* https://www.drupal.org/node/2815083
* @preserve
**/

(function ($, Drupal, debounce) {
  $.fn.drupalGetSummary = function () {
    var callback = this.data('summaryCallback');
    return this[0] && callback ? $.trim(callback(this[0])) : '';
  };

  $.fn.drupalSetSummary = function (callback) {
    var self = this;

    if (typeof callback !== 'function') {
      var val = callback;

      callback = function callback() {
        return val;
      };
    }

    return this.data('summaryCallback', callback).off('formUpdated.summary').on('formUpdated.summary', function () {
      self.trigger('summaryUpdated');
    }).trigger('summaryUpdated');
  };

  Drupal.behaviors.formSingleSubmit = {
    attach: function attach() {
      function onFormSubmit(e) {
        var $form = $(e.currentTarget);
        var formValues = $form.serialize();
        var previousValues = $form.attr('data-drupal-form-submit-last');

        if (previousValues === formValues) {
          e.preventDefault();
        } else {
          $form.attr('data-drupal-form-submit-last', formValues);
        }
      }

      $('body').once('form-single-submit').on('submit.singleSubmit', 'form:not([method~="GET"])', onFormSubmit);
    }
  };

  function triggerFormUpdated(element) {
    $(element).trigger('formUpdated');
  }

  function fieldsList(form) {
    var $fieldList = $(form).find('[name]').map(function (index, element) {
      return element.getAttribute('id');
    });
    return $.makeArray($fieldList);
  }

  Drupal.behaviors.formUpdated = {
    attach: function attach(context) {
      var $context = $(context);
      var contextIsForm = $context.is('form');
      var $forms = (contextIsForm ? $context : $context.find('form')).once('form-updated');
      var formFields;

      if ($forms.length) {
        $.makeArray($forms).forEach(function (form) {
          var events = 'change.formUpdated input.formUpdated ';
          var eventHandler = debounce(function (event) {
            triggerFormUpdated(event.target);
          }, 300);
          formFields = fieldsList(form).join(',');
          form.setAttribute('data-drupal-form-fields', formFields);
          $(form).on(events, eventHandler);
        });
      }

      if (contextIsForm) {
        formFields = fieldsList(context).join(',');
        var currentFields = $(context).attr('data-drupal-form-fields');

        if (formFields !== currentFields) {
          triggerFormUpdated(context);
        }
      }
    },
    detach: function detach(context, settings, trigger) {
      var $context = $(context);
      var contextIsForm = $context.is('form');

      if (trigger === 'unload') {
        var $forms = (contextIsForm ? $context : $context.find('form')).removeOnce('form-updated');

        if ($forms.length) {
          $.makeArray($forms).forEach(function (form) {
            form.removeAttribute('data-drupal-form-fields');
            $(form).off('.formUpdated');
          });
        }
      }
    }
  };
  Drupal.behaviors.fillUserInfoFromBrowser = {
    attach: function attach(context, settings) {
      var userInfo = ['name', 'mail', 'homepage'];
      var $forms = $('[data-user-info-from-browser]').once('user-info-from-browser');

      if ($forms.length) {
        userInfo.forEach(function (info) {
          var $element = $forms.find("[name=".concat(info, "]"));
          var browserData = localStorage.getItem("Drupal.visitor.".concat(info));
          var emptyOrDefault = $element.val() === '' || $element.attr('data-drupal-default-value') === $element.val();

          if ($element.length && emptyOrDefault && browserData) {
            $element.val(browserData);
          }
        });
      }

      $forms.on('submit', function () {
        userInfo.forEach(function (info) {
          var $element = $forms.find("[name=".concat(info, "]"));

          if ($element.length) {
            localStorage.setItem("Drupal.visitor.".concat(info), $element.val());
          }
        });
      });
    }
  };

  var handleFragmentLinkClickOrHashChange = function handleFragmentLinkClickOrHashChange(e) {
    var url;

    if (e.type === 'click') {
      url = e.currentTarget.location ? e.currentTarget.location : e.currentTarget;
    } else {
      url = window.location;
    }

    var hash = url.hash.substr(1);

    if (hash) {
      var $target = $("#".concat(hash));
      $('body').trigger('formFragmentLinkClickOrHashChange', [$target]);
      setTimeout(function () {
        return $target.trigger('focus');
      }, 300);
    }
  };

  var debouncedHandleFragmentLinkClickOrHashChange = debounce(handleFragmentLinkClickOrHashChange, 300, true);
  $(window).on('hashchange.form-fragment', debouncedHandleFragmentLinkClickOrHashChange);
  $(document).on('click.form-fragment', 'a[href*="#"]', debouncedHandleFragmentLinkClickOrHashChange);
})(jQuery, Drupal, Drupal.debounce);;
/**
 * @file
 * Webform behaviors.
 */

(function ($, Drupal) {

  'use strict';

  // Trigger Drupal's attaching of behaviors after the page is
  // completely loaded.
  // @see https://stackoverflow.com/questions/37838430/detect-if-page-is-load-from-back-button
  // @see https://stackoverflow.com/questions/20899274/how-to-refresh-page-on-back-button-click/20899422#20899422
  var isChrome = (/chrom(e|ium)/.test(window.navigator.userAgent.toLowerCase()));
  if (isChrome) {
    // Track back button in navigation.
    // @see https://stackoverflow.com/questions/37838430/detect-if-page-is-load-from-back-button
    var backButton = false;
    if (window.performance) {
      var navEntries = window.performance.getEntriesByType('navigation');
      if (navEntries.length > 0 && navEntries[0].type === 'back_forward') {
        backButton = true;
      }
      else if (window.performance.navigation
        && window.performance.navigation.type === window.performance.navigation.TYPE_BACK_FORWARD) {
        backButton = true;
      }
    }

    // If the back button is pressed, delay Drupal's attaching of behaviors.
    if (backButton) {
      var attachBehaviors = Drupal.attachBehaviors;
      Drupal.attachBehaviors = function (context, settings) {
        setTimeout(function (context, settings) {
          attachBehaviors(context, settings);
        }, 300);
      };
    }
  }

})(jQuery, Drupal);
;
/**
* DO NOT EDIT THIS FILE.
* See the following change record for more information,
* https://www.drupal.org/node/2815083
* @preserve
**/

(function ($, Drupal) {
  var states = {
    postponed: []
  };
  Drupal.states = states;

  function invert(a, invertState) {
    return invertState && typeof a !== 'undefined' ? !a : a;
  }

  function _compare2(a, b) {
    if (a === b) {
      return typeof a === 'undefined' ? a : true;
    }

    return typeof a === 'undefined' || typeof b === 'undefined';
  }

  function ternary(a, b) {
    if (typeof a === 'undefined') {
      return b;
    }

    if (typeof b === 'undefined') {
      return a;
    }

    return a && b;
  }

  Drupal.behaviors.states = {
    attach: function attach(context, settings) {
      var $states = $(context).find('[data-drupal-states]');
      var il = $states.length;

      var _loop = function _loop(i) {
        var config = JSON.parse($states[i].getAttribute('data-drupal-states'));
        Object.keys(config || {}).forEach(function (state) {
          new states.Dependent({
            element: $($states[i]),
            state: states.State.sanitize(state),
            constraints: config[state]
          });
        });
      };

      for (var i = 0; i < il; i++) {
        _loop(i);
      }

      while (states.postponed.length) {
        states.postponed.shift()();
      }
    }
  };

  states.Dependent = function (args) {
    var _this = this;

    $.extend(this, {
      values: {},
      oldValue: null
    }, args);
    this.dependees = this.getDependees();
    Object.keys(this.dependees || {}).forEach(function (selector) {
      _this.initializeDependee(selector, _this.dependees[selector]);
    });
  };

  states.Dependent.comparisons = {
    RegExp: function RegExp(reference, value) {
      return reference.test(value);
    },
    Function: function Function(reference, value) {
      return reference(value);
    },
    Number: function Number(reference, value) {
      return typeof value === 'string' ? _compare2(reference.toString(), value) : _compare2(reference, value);
    }
  };
  states.Dependent.prototype = {
    initializeDependee: function initializeDependee(selector, dependeeStates) {
      var _this2 = this;

      this.values[selector] = {};
      Object.keys(dependeeStates).forEach(function (i) {
        var state = dependeeStates[i];

        if ($.inArray(state, dependeeStates) === -1) {
          return;
        }

        state = states.State.sanitize(state);
        _this2.values[selector][state.name] = null;
        $(selector).on("state:".concat(state), {
          selector: selector,
          state: state
        }, function (e) {
          _this2.update(e.data.selector, e.data.state, e.value);
        });
        new states.Trigger({
          selector: selector,
          state: state
        });
      });
    },
    compare: function compare(reference, selector, state) {
      var value = this.values[selector][state.name];

      if (reference.constructor.name in states.Dependent.comparisons) {
        return states.Dependent.comparisons[reference.constructor.name](reference, value);
      }

      return _compare2(reference, value);
    },
    update: function update(selector, state, value) {
      if (value !== this.values[selector][state.name]) {
        this.values[selector][state.name] = value;
        this.reevaluate();
      }
    },
    reevaluate: function reevaluate() {
      var value = this.verifyConstraints(this.constraints);

      if (value !== this.oldValue) {
        this.oldValue = value;
        value = invert(value, this.state.invert);
        this.element.trigger({
          type: "state:".concat(this.state),
          value: value,
          trigger: true
        });
      }
    },
    verifyConstraints: function verifyConstraints(constraints, selector) {
      var result;

      if ($.isArray(constraints)) {
        var hasXor = $.inArray('xor', constraints) === -1;
        var len = constraints.length;

        for (var i = 0; i < len; i++) {
          if (constraints[i] !== 'xor') {
            var constraint = this.checkConstraints(constraints[i], selector, i);

            if (constraint && (hasXor || result)) {
              return hasXor;
            }

            result = result || constraint;
          }
        }
      } else if ($.isPlainObject(constraints)) {
          for (var n in constraints) {
            if (constraints.hasOwnProperty(n)) {
              result = ternary(result, this.checkConstraints(constraints[n], selector, n));

              if (result === false) {
                return false;
              }
            }
          }
        }

      return result;
    },
    checkConstraints: function checkConstraints(value, selector, state) {
      if (typeof state !== 'string' || /[0-9]/.test(state[0])) {
        state = null;
      } else if (typeof selector === 'undefined') {
        selector = state;
        state = null;
      }

      if (state !== null) {
        state = states.State.sanitize(state);
        return invert(this.compare(value, selector, state), state.invert);
      }

      return this.verifyConstraints(value, selector);
    },
    getDependees: function getDependees() {
      var cache = {};
      var _compare = this.compare;

      this.compare = function (reference, selector, state) {
        (cache[selector] || (cache[selector] = [])).push(state.name);
      };

      this.verifyConstraints(this.constraints);
      this.compare = _compare;
      return cache;
    }
  };

  states.Trigger = function (args) {
    $.extend(this, args);

    if (this.state in states.Trigger.states) {
      this.element = $(this.selector);

      if (!this.element.data("trigger:".concat(this.state))) {
        this.initialize();
      }
    }
  };

  states.Trigger.prototype = {
    initialize: function initialize() {
      var _this3 = this;

      var trigger = states.Trigger.states[this.state];

      if (typeof trigger === 'function') {
        trigger.call(window, this.element);
      } else {
        Object.keys(trigger || {}).forEach(function (event) {
          _this3.defaultTrigger(event, trigger[event]);
        });
      }

      this.element.data("trigger:".concat(this.state), true);
    },
    defaultTrigger: function defaultTrigger(event, valueFn) {
      var oldValue = valueFn.call(this.element);
      this.element.on(event, $.proxy(function (e) {
        var value = valueFn.call(this.element, e);

        if (oldValue !== value) {
          this.element.trigger({
            type: "state:".concat(this.state),
            value: value,
            oldValue: oldValue
          });
          oldValue = value;
        }
      }, this));
      states.postponed.push($.proxy(function () {
        this.element.trigger({
          type: "state:".concat(this.state),
          value: oldValue,
          oldValue: null
        });
      }, this));
    }
  };
  states.Trigger.states = {
    empty: {
      keyup: function keyup() {
        return this.val() === '';
      }
    },
    checked: {
      change: function change() {
        var checked = false;
        this.each(function () {
          checked = $(this).prop('checked');
          return !checked;
        });
        return checked;
      }
    },
    value: {
      keyup: function keyup() {
        if (this.length > 1) {
          return this.filter(':checked').val() || false;
        }

        return this.val();
      },
      change: function change() {
        if (this.length > 1) {
          return this.filter(':checked').val() || false;
        }

        return this.val();
      }
    },
    collapsed: {
      collapsed: function collapsed(e) {
        return typeof e !== 'undefined' && 'value' in e ? e.value : !this.is('[open]');
      }
    }
  };

  states.State = function (state) {
    this.pristine = state;
    this.name = state;
    var process = true;

    do {
      while (this.name.charAt(0) === '!') {
        this.name = this.name.substring(1);
        this.invert = !this.invert;
      }

      if (this.name in states.State.aliases) {
        this.name = states.State.aliases[this.name];
      } else {
        process = false;
      }
    } while (process);
  };

  states.State.sanitize = function (state) {
    if (state instanceof states.State) {
      return state;
    }

    return new states.State(state);
  };

  states.State.aliases = {
    enabled: '!disabled',
    invisible: '!visible',
    invalid: '!valid',
    untouched: '!touched',
    optional: '!required',
    filled: '!empty',
    unchecked: '!checked',
    irrelevant: '!relevant',
    expanded: '!collapsed',
    open: '!collapsed',
    closed: 'collapsed',
    readwrite: '!readonly'
  };
  states.State.prototype = {
    invert: false,
    toString: function toString() {
      return this.name;
    }
  };
  var $document = $(document);
  $document.on('state:disabled', function (e) {
    if (e.trigger) {
      $(e.target).prop('disabled', e.value).closest('.js-form-item, .js-form-submit, .js-form-wrapper').toggleClass('form-disabled', e.value).find('select, input, textarea').prop('disabled', e.value);
    }
  });
  $document.on('state:required', function (e) {
    if (e.trigger) {
      if (e.value) {
        var label = "label".concat(e.target.id ? "[for=".concat(e.target.id, "]") : '');
        var $label = $(e.target).attr({
          required: 'required',
          'aria-required': 'true'
        }).closest('.js-form-item, .js-form-wrapper').find(label);

        if (!$label.hasClass('js-form-required').length) {
          $label.addClass('js-form-required form-required');
        }
      } else {
        $(e.target).removeAttr('required aria-required').closest('.js-form-item, .js-form-wrapper').find('label.js-form-required').removeClass('js-form-required form-required');
      }
    }
  });
  $document.on('state:visible', function (e) {
    if (e.trigger) {
      $(e.target).closest('.js-form-item, .js-form-submit, .js-form-wrapper').toggle(e.value);
    }
  });
  $document.on('state:checked', function (e) {
    if (e.trigger) {
      $(e.target).prop('checked', e.value);
    }
  });
  $document.on('state:collapsed', function (e) {
    if (e.trigger) {
      if ($(e.target).is('[open]') === e.value) {
        $(e.target).find('> summary').trigger('click');
      }
    }
  });
})(jQuery, Drupal);;
/**
 * @file
 * JavaScript behaviors for custom webform #states.
 */

(function ($, Drupal) {

  'use strict';

  Drupal.webform = Drupal.webform || {};
  Drupal.webform.states = Drupal.webform.states || {};
  Drupal.webform.states.slideDown = Drupal.webform.states.slideDown || {};
  Drupal.webform.states.slideDown.duration = 'slow';
  Drupal.webform.states.slideUp = Drupal.webform.states.slideUp || {};
  Drupal.webform.states.slideUp.duration = 'fast';

  /* ************************************************************************ */
  // jQuery functions.
  /* ************************************************************************ */

  /**
   * Check if an element has a specified data attribute.
   *
   * @param {string} data
   *   The data attribute name.
   *
   * @return {boolean}
   *   TRUE if an element has a specified data attribute.
   */
  $.fn.hasData = function (data) {
    return (typeof this.data(data) !== 'undefined');
  };

  /**
   * Check if element is within the webform or not.
   *
   * @return {boolean}
   *   TRUE if element is within the webform.
   */
  $.fn.isWebform = function () {
    return $(this).closest('form[id^="webform"], form[data-is-webform]').length ? true : false;
  };

  /**
   * Check if element is to be treated as a webform element.
   *
   * @return {boolean}
   *   TRUE if element is to be treated as a webform element.
   */
  $.fn.isWebformElement = function () {
    return ($(this).isWebform() || $(this).closest('[data-is-webform-element]').length) ? true : false;
  };

  /* ************************************************************************ */
  // Trigger.
  /* ************************************************************************ */

  // The change event is triggered by cut-n-paste and select menus.
  // Issue #2445271: #states element empty check not triggered on mouse
  // based paste.
  // @see https://www.drupal.org/node/2445271
  Drupal.states.Trigger.states.empty.change = function change() {
    return this.val() === '';
  };

  /* ************************************************************************ */
  // Dependents.
  /* ************************************************************************ */


  // Apply solution included in #1962800 patch.
  // Issue #1962800: Form #states not working with literal integers as
  // values in IE11.
  // @see https://www.drupal.org/project/drupal/issues/1962800
  // @see https://www.drupal.org/files/issues/core-states-not-working-with-integers-ie11_1962800_46.patch
  //
  // This issue causes pattern, less than, and greater than support to break.
  // @see https://www.drupal.org/project/webform/issues/2981724
  var states = Drupal.states;
  Drupal.states.Dependent.prototype.compare = function compare(reference, selector, state) {
    var value = this.values[selector][state.name];

    var name = reference.constructor.name;
    if (!name) {
      name = $.type(reference);

      name = name.charAt(0).toUpperCase() + name.slice(1);
    }
    if (name in states.Dependent.comparisons) {
      return states.Dependent.comparisons[name](reference, value);
    }

    if (reference.constructor.name in states.Dependent.comparisons) {
      return states.Dependent.comparisons[reference.constructor.name](reference, value);
    }

    return _compare2(reference, value);
  };
  function _compare2(a, b) {
    if (a === b) {
      return typeof a === 'undefined' ? a : true;
    }

    return typeof a === 'undefined' || typeof b === 'undefined';
  }

  // Adds pattern, less than, and greater than support to #state API.
  // @see http://drupalsun.com/julia-evans/2012/03/09/extending-form-api-states-regular-expressions
  Drupal.states.Dependent.comparisons.Object = function (reference, value) {
    if ('pattern' in reference) {
      return (new RegExp(reference['pattern'])).test(value);
    }
    else if ('!pattern' in reference) {
      return !((new RegExp(reference['!pattern'])).test(value));
    }
    else if ('less' in reference) {
      return (value !== '' && parseFloat(reference['less']) > parseFloat(value));
    }
    else if ('less_equal' in reference) {
      return (value !== '' && parseFloat(reference['less_equal']) >= parseFloat(value));
    }
    else if ('greater' in reference) {
      return (value !== '' && parseFloat(reference['greater']) < parseFloat(value));
    }
    else if ('greater_equal' in reference) {
      return (value !== '' && parseFloat(reference['greater_equal']) <= parseFloat(value));
    }
    else if ('between' in reference || '!between' in reference) {
      if (value === '') {
        return false;
      }

      var between = reference['between'] || reference['!between'];
      var betweenParts = between.split(':');
      var greater = betweenParts[0];
      var less = (typeof betweenParts[1] !== 'undefined') ? betweenParts[1] : null;
      var isGreaterThan = (greater === null || greater === '' || parseFloat(value) >= parseFloat(greater));
      var isLessThan = (less === null || less === '' || parseFloat(value) <= parseFloat(less));
      var result = (isGreaterThan && isLessThan);
      return (reference['!between']) ? !result : result;
    }
    else {
      return reference.indexOf(value) !== false;
    }
  };

  /* ************************************************************************ */
  // States events.
  /* ************************************************************************ */

  var $document = $(document);

  $document.on('state:required', function (e) {
    if (e.trigger && $(e.target).isWebformElement()) {
      var $target = $(e.target);
      // Fix #required file upload.
      // @see Issue #2860529: Conditional required File upload field don't work.
      toggleRequired($target.find('input[type="file"]'), e.value);

      // Fix #required for radios.
      // @see Issue #2856795: If radio buttons are required but not filled form is nevertheless submitted.
      if ($target.is('.js-form-type-radios, .js-form-type-webform-radios-other, .js-webform-type-radios, .js-webform-type-webform-radios-other')) {
        toggleRequired($target.find('input[type="radio"]'), e.value);
      }

      // Fix #required for checkboxes.
      // @see Issue #2938414: Checkboxes don't support #states required.
      // @see checkboxRequiredhandler
      if ($target.is('.js-form-type-checkboxes, .js-form-type-webform-checkboxes-other, .js-webform-type-checkboxes, .js-webform-type-webform-checkboxes-other')) {
        var $checkboxes = $target.find('input[type="checkbox"]');
        if (e.value) {
          // Add event handler.
          $checkboxes.on('click', statesCheckboxesRequiredEventHandler);
          // Initialize and add required attribute.
          checkboxesRequired($target);
        }
        else {
          // Remove event handler.
          $checkboxes.off('click', statesCheckboxesRequiredEventHandler);
          // Remove required attribute.
          toggleRequired($checkboxes, false);
        }
      }

      // Fix required label for elements without the for attribute.
      // @see Issue #3145300: Conditional Visible Select Other not working.
      if ($target.is('.js-form-type-webform-select-other, .js-webform-type-webform-select-other')) {
        var $select = $target.find('select');
        toggleRequired($select, e.value);
        copyRequireMessage($target, $select);
      }
      if ($target.find('> label:not([for])').length) {
        $target.find('> label').toggleClass('js-form-required form-required', e.value);
      }

      // Fix required label for checkboxes and radios.
      // @see Issue #2938414: Checkboxes don't support #states required
      // @see Issue #2731991: Setting required on radios marks all options required.
      // @see Issue #2856315: Conditional Logic - Requiring Radios in a Fieldset.
      // Fix #required for fieldsets.
      // @see Issue #2977569: Hidden fieldsets that become visible with conditional logic cannot be made required.
      if ($target.is('.js-webform-type-radios, .js-webform-type-checkboxes, fieldset')) {
        $target.find('legend span.fieldset-legend:not(.visually-hidden)').toggleClass('js-form-required form-required', e.value);
      }

      // Issue #2986017: Fieldsets shouldn't have required attribute.
      if ($target.is('fieldset')) {
        $target.removeAttr('required aria-required');
      }
    }
  });

  $document.on('state:checked', function (e) {
    if (e.trigger) {
      $(e.target).trigger('change');
    }
  });

  $document.on('state:readonly', function (e) {
    if (e.trigger && $(e.target).isWebformElement()) {
      $(e.target).prop('readonly', e.value).closest('.js-form-item, .js-form-wrapper').toggleClass('webform-readonly', e.value).find('input, textarea').prop('readonly', e.value);

      // Trigger webform:readonly.
      $(e.target).trigger('webform:readonly')
        .find('select, input, textarea, button').trigger('webform:readonly');
    }
  });

  $document.on('state:visible state:visible-slide', function (e) {
    if (e.trigger && $(e.target).isWebformElement()) {
      if (e.value) {
        $(':input', e.target).addBack().each(function () {
          restoreValueAndRequired(this);
          triggerEventHandlers(this);
        });
      }
      else {
        // @see https://www.sitepoint.com/jquery-function-clear-form-data/
        $(':input', e.target).addBack().each(function () {
          backupValueAndRequired(this);
          clearValueAndRequired(this);
          triggerEventHandlers(this);
        });
      }
    }
  });

  $document.on('state:visible-slide', function (e) {
    if (e.trigger && $(e.target).isWebformElement()) {
      var effect = e.value ? 'slideDown' : 'slideUp';
      var duration = Drupal.webform.states[effect].duration;
      $(e.target).closest('.js-form-item, .js-form-submit, .js-form-wrapper')[effect](duration);
    }
  });
  Drupal.states.State.aliases['invisible-slide'] = '!visible-slide';

  $document.on('state:disabled', function (e) {
    if (e.trigger && $(e.target).isWebformElement()) {
      // Make sure disabled property is set before triggering webform:disabled.
      // Copied from: core/misc/states.js
      $(e.target)
        .prop('disabled', e.value)
        .closest('.js-form-item, .js-form-submit, .js-form-wrapper').toggleClass('form-disabled', e.value)
        .find('select, input, textarea, button').prop('disabled', e.value);

      // Never disable hidden file[fids] because the existing values will
      // be completely lost when the webform is submitted.
      var fileElements = $(e.target)
        .find(':input[type="hidden"][name$="[fids]"]');
      if (fileElements.length) {
        // Remove 'disabled' attribute from fieldset which will block
        // all disabled elements from being submitted.
        if ($(e.target).is('fieldset')) {
          $(e.target).prop('disabled', false);
        }
        fileElements.removeAttr('disabled');
      }

      // Trigger webform:disabled.
      $(e.target).trigger('webform:disabled')
        .find('select, input, textarea, button').trigger('webform:disabled');
    }
  });

  /* ************************************************************************ */
  // Behaviors.
  /* ************************************************************************ */

  /**
   * Adds HTML5 validation to required checkboxes.
   *
   * @type {Drupal~behavior}
   *
   * @see https://www.drupal.org/project/webform/issues/3068998
   */
  Drupal.behaviors.webformCheckboxesRequired = {
    attach: function (context) {
      $('.js-form-type-checkboxes.required, .js-form-type-webform-checkboxes-other.required, .js-webform-type-checkboxes.required, .js-webform-type-webform-checkboxes-other.required, .js-webform-type-webform-radios-other.checkboxes', context)
        .once('webform-checkboxes-required')
        .each(function () {
          var $element = $(this);
          $element.find('input[type="checkbox"]').on('click', statesCheckboxesRequiredEventHandler);
          setTimeout(function () {checkboxesRequired($element);});
        });
    }
  };

  /**
   * Adds HTML5 validation to required radios.
   *
   * @type {Drupal~behavior}
   *
   * @see https://www.drupal.org/project/webform/issues/2856795
   */
  Drupal.behaviors.webformRadiosRequired = {
    attach: function (context) {
      $('.js-form-type-radios, .js-form-type-webform-radios-other, .js-webform-type-radios, .js-webform-type-webform-radios-other', context)
        .once('webform-radios-required')
        .each(function () {
          var $element = $(this);
          setTimeout(function () {radiosRequired($element);});
        });
    }
  };

  /**
   * Add HTML5 multiple checkboxes required validation.
   *
   * @param {jQuery} $element
   *   An jQuery object containing HTML5 radios.
   *
   * @see https://stackoverflow.com/a/37825072/145846
   */
  function checkboxesRequired($element) {
    var $firstCheckbox = $element.find('input[type="checkbox"]').first();
    var isChecked = $element.find('input[type="checkbox"]').is(':checked');
    toggleRequired($firstCheckbox, !isChecked);
    copyRequireMessage($element, $firstCheckbox);
  }

  /**
   * Add HTML5 radios required validation.
   *
   * @param {jQuery} $element
   *   An jQuery object containing HTML5 radios.
   *
   * @see https://www.drupal.org/project/webform/issues/2856795
   */
  function radiosRequired($element) {
    var $radios = $element.find('input[type="radio"]');
    var isRequired = $element.hasClass('required');
    toggleRequired($radios, isRequired);
    copyRequireMessage($element, $radios);
  }

  /* ************************************************************************ */
  // Event handlers.
  /* ************************************************************************ */

  /**
   * Trigger #states API HTML5 multiple checkboxes required validation.
   *
   * @see https://stackoverflow.com/a/37825072/145846
   */
  function statesCheckboxesRequiredEventHandler() {
    var $element = $(this).closest('.js-webform-type-checkboxes, .js-webform-type-webform-checkboxes-other');
    checkboxesRequired($element);
  }

  /**
   * Trigger an input's event handlers.
   *
   * @param {element} input
   *   An input.
   */
  function triggerEventHandlers(input) {
    var $input = $(input);
    var type = input.type;
    var tag = input.tagName.toLowerCase();
    // Add 'webform.states' as extra parameter to event handlers.
    // @see Drupal.behaviors.webformUnsaved
    var extraParameters = ['webform.states'];
    if (type === 'checkbox' || type === 'radio') {
      $input
        .trigger('change', extraParameters)
        .trigger('blur', extraParameters);
    }
    else if (tag === 'select') {
      $input
        .trigger('change', extraParameters)
        .trigger('blur', extraParameters);
    }
    else if (type !== 'submit' && type !== 'button' && type !== 'file') {
      $input
        .trigger('input', extraParameters)
        .trigger('change', extraParameters)
        .trigger('keydown', extraParameters)
        .trigger('keyup', extraParameters)
        .trigger('blur', extraParameters);

      // Make sure input mask is reset when value is restored.
      // @see https://www.drupal.org/project/webform/issues/3124155
      if ($input.attr('data-inputmask-mask')) {
        setTimeout(function () {$input.inputmask('remove').inputmask();});
      }
    }
  }

  /* ************************************************************************ */
  // Backup and restore value functions.
  /* ************************************************************************ */

  /**
   * Backup an input's current value and required attribute
   *
   * @param {element} input
   *   An input.
   */
  function backupValueAndRequired(input) {
    var $input = $(input);
    var type = input.type;
    var tag = input.tagName.toLowerCase(); // Normalize case.

    // Backup required.
    if ($input.prop('required') && !$input.hasData('webform-required')) {
      $input.data('webform-required', true);
    }

    // Backup value.
    if (!$input.hasData('webform-value')) {
      if (type === 'checkbox' || type === 'radio') {
        $input.data('webform-value', $input.prop('checked'));
      }
      else if (tag === 'select') {
        var values = [];
        $input.find('option:selected').each(function (i, option) {
          values[i] = option.value;
        });
        $input.data('webform-value', values);
      }
      else if (type !== 'submit' && type !== 'button') {
        $input.data('webform-value', input.value);
      }
    }
  }

  /**
   * Restore an input's value and required attribute.
   *
   * @param {element} input
   *   An input.
   */
  function restoreValueAndRequired(input) {
    var $input = $(input);

    // Restore value.
    var value = $input.data('webform-value');
    if (typeof value !== 'undefined') {
      var type = input.type;
      var tag = input.tagName.toLowerCase(); // Normalize case.

      if (type === 'checkbox' || type === 'radio') {
        $input.prop('checked', value);
      }
      else if (tag === 'select') {
        $.each(value, function (i, option_value) {
          $input.find("option[value='" + option_value + "']").prop('selected', true);
        });
      }
      else if (type !== 'submit' && type !== 'button') {
        input.value = value;
      }
      $input.removeData('webform-value');
    }

    // Restore required.
    var required = $input.data('webform-required');
    if (typeof required !== 'undefined') {
      if (required) {
        $input.prop('required', true);
      }
      $input.removeData('webform-required');
    }
  }

  /**
   * Clear an input's value and required attributes.
   *
   * @param {element} input
   *   An input.
   */
  function clearValueAndRequired(input) {
    var $input = $(input);

    // Check for #states no clear attribute.
    // @see https://css-tricks.com/snippets/jquery/make-an-jquery-hasattr/
    if ($input.closest('[data-webform-states-no-clear]').length) {
      return;
    }

    // Clear value.
    var type = input.type;
    var tag = input.tagName.toLowerCase(); // Normalize case.
    if (type === 'checkbox' || type === 'radio') {
      $input.prop('checked', false);
    }
    else if (tag === 'select') {
      if ($input.find('option[value=""]').length) {
        $input.val('');
      }
      else {
        input.selectedIndex = -1;
      }
    }
    else if (type !== 'submit' && type !== 'button') {
      input.value = (type === 'color') ? '#000000' : '';
    }

    // Clear required.
    $input.prop('required', false);
  }

  /* ************************************************************************ */
  // Helper functions.
  /* ************************************************************************ */

  /**
   * Toggle an input's required attributes.
   *
   * @param {element} $input
   *   An input.
   * @param {boolean} required
   *   Is input required.
   */
  function toggleRequired($input, required) {
    if (required) {
      $input.attr({'required': 'required', 'aria-required': 'true'});
    }
    else {
      $input.removeAttr('required aria-required');
    }
  }

  /**
   * Copy the clientside_validation.module's message.
   *
   * @param {jQuery} $source
   *   The source element.
   * @param {jQuery} $destination
   *   The destination element.
   */
  function copyRequireMessage($source, $destination) {
    if ($source.attr('data-msg-required')) {
      $destination.attr('data-msg-required', $source.attr('data-msg-required'));
    }
  }

})(jQuery, Drupal);
;
/**
 * @file
 * JavaScript behaviors for webforms.
 */

(function ($, Drupal) {

  'use strict';

  /**
   * Remove single submit event listener.
   *
   * @type {Drupal~behavior}
   *
   * @prop {Drupal~behaviorAttach} attach
   *   Attaches the behavior for removing single submit event listener.
   *
   * @see Drupal.behaviors.formSingleSubmit
   */
  Drupal.behaviors.webformRemoveFormSingleSubmit = {
    attach: function attach() {
      function onFormSubmit(e) {
        var $form = $(e.currentTarget);
        $form.removeAttr('data-drupal-form-submit-last');
      }
      $('body')
        .once('webform-single-submit')
        .on('submit.singleSubmit', 'form.webform-remove-single-submit', onFormSubmit);
    }
  };

  /**
   * Prevent webform autosubmit on wizard pages.
   *
   * @type {Drupal~behavior}
   *
   * @prop {Drupal~behaviorAttach} attach
   *   Attaches the behavior for disabling webform autosubmit.
   *   Wizard pages need to be progressed with the Previous or Next buttons,
   *   not by pressing Enter.
   */
  Drupal.behaviors.webformDisableAutoSubmit = {
    attach: function (context) {
      // Not using context so that inputs loaded via Ajax will have autosubmit
      // disabled.
      // @see http://stackoverflow.com/questions/11235622/jquery-disable-form-submit-on-enter
      $('.js-webform-disable-autosubmit input')
        .not(':button, :submit, :reset, :image, :file')
        .once('webform-disable-autosubmit')
        .on('keyup keypress', function (e) {
          if (e.which === 13) {
            e.preventDefault();
            return false;
          }
        });
    }
  };

  /**
   * Custom required and pattern validation error messages.
   *
   * @type {Drupal~behavior}
   *
   * @prop {Drupal~behaviorAttach} attach
   *   Attaches the behavior for the webform custom required and pattern
   *   validation error messages.
   *
   * @see http://stackoverflow.com/questions/5272433/html5-form-required-attribute-set-custom-validation-message
   **/
  Drupal.behaviors.webformRequiredError = {
    attach: function (context) {
      $(context).find(':input[data-webform-required-error], :input[data-webform-pattern-error]').once('webform-required-error')
        .on('invalid', function () {
          this.setCustomValidity('');
          if (this.valid) {
            return;
          }

          if (this.validity.patternMismatch && $(this).attr('data-webform-pattern-error')) {
            this.setCustomValidity($(this).attr('data-webform-pattern-error'));
          }
          else if (this.validity.valueMissing && $(this).attr('data-webform-required-error')) {
            this.setCustomValidity($(this).attr('data-webform-required-error'));
          }
        })
        .on('input change', function () {
          // Find all related elements by name and reset custom validity.
          // This specifically applies to required radios and checkboxes.
          var name = $(this).attr('name');
          $(this.form).find(':input[name="' + name + '"]').each(function () {
            this.setCustomValidity('');
          });
        });
    }
  };

  // When #state:required is triggered we need to reset the target elements
  // custom validity.
  $(document).on('state:required', function (e) {
    $(e.target).filter('[data-webform-required-error]')
      .each(function () {this.setCustomValidity('');});
  });

})(jQuery, Drupal);
;
/**
 * @file
 * JavaScript behaviors for details element.
 */

(function ($, Drupal) {

  'use strict';

  // Determine if local storage exists and is enabled.
  // This approach is copied from Modernizr.
  // @see https://github.com/Modernizr/Modernizr/blob/c56fb8b09515f629806ca44742932902ac145302/modernizr.js#L696-731
  var hasLocalStorage = (function () {
    try {
      localStorage.setItem('webform', 'webform');
      localStorage.removeItem('webform');
      return true;
    }
    catch (e) {
      return false;
    }
  }());

  /**
   * Attach handler to save details open/close state.
   *
   * @type {Drupal~behavior}
   */
  Drupal.behaviors.webformDetailsSave = {
    attach: function (context) {
      if (!hasLocalStorage) {
        return;
      }

      // Summary click event handler.
      $('details > summary', context).once('webform-details-summary-save').on('click', function () {
        var $details = $(this).parent();

        // @see https://css-tricks.com/snippets/jquery/make-an-jquery-hasattr/
        if ($details[0].hasAttribute('data-webform-details-nosave')) {
          return;
        }

        var name = Drupal.webformDetailsSaveGetName($details);
        if (!name) {
          return;
        }

        var open = ($details.attr('open') !== 'open') ? '1' : '0';
        localStorage.setItem(name, open);
      });

      // Initialize details open state via local storage.
      $('details', context).once('webform-details-save').each(function () {
        var $details = $(this);

        var name = Drupal.webformDetailsSaveGetName($details);
        if (!name) {
          return;
        }

        var open = localStorage.getItem(name);
        if (open === null) {
          return;
        }

        if (open === '1') {
          $details.attr('open', 'open');
        }
        else {
          $details.removeAttr('open');
        }
      });
    }

  };

  /**
   * Get the name used to store the state of details element.
   *
   * @param {jQuery} $details
   *   A details element.
   *
   * @return {string}
   *   The name used to store the state of details element.
   */
  Drupal.webformDetailsSaveGetName = function ($details) {
    if (!hasLocalStorage) {
      return '';
    }

    // Ignore details that are vertical tabs pane.
    if ($details.hasClass('vertical-tabs__pane')) {
      return '';
    }

    // Any details element not included a webform must have define its own id.
    var webformId = $details.attr('data-webform-element-id');
    if (webformId) {
      return 'Drupal.webform.' + webformId.replace('--', '.');
    }

    var detailsId = $details.attr('id');
    if (!detailsId) {
      return '';
    }

    var $form = $details.parents('form');
    if (!$form.length || !$form.attr('id')) {
      return '';
    }

    var formId = $form.attr('id');
    if (!formId) {
      return '';
    }

    // ISSUE: When Drupal renders a webform in a modal dialog it appends a unique
    // identifier to webform ids and details ids. (i.e. my-form--FeSFISegTUI)
    // WORKAROUND: Remove the unique id that delimited using double dashes.
    formId = formId.replace(/--.+?$/, '').replace(/-/g, '_');
    detailsId = detailsId.replace(/--.+?$/, '').replace(/-/g, '_');
    return 'Drupal.webform.' + formId + '.' + detailsId;
  };

})(jQuery, Drupal);
;
/**
* DO NOT EDIT THIS FILE.
* See the following change record for more information,
* https://www.drupal.org/node/2815083
* @preserve
**/

(function (Drupal, debounce) {
  var liveElement;
  var announcements = [];
  Drupal.behaviors.drupalAnnounce = {
    attach: function attach(context) {
      if (!liveElement) {
        liveElement = document.createElement('div');
        liveElement.id = 'drupal-live-announce';
        liveElement.className = 'visually-hidden';
        liveElement.setAttribute('aria-live', 'polite');
        liveElement.setAttribute('aria-busy', 'false');
        document.body.appendChild(liveElement);
      }
    }
  };

  function announce() {
    var text = [];
    var priority = 'polite';
    var announcement;
    var il = announcements.length;

    for (var i = 0; i < il; i++) {
      announcement = announcements.pop();
      text.unshift(announcement.text);

      if (announcement.priority === 'assertive') {
        priority = 'assertive';
      }
    }

    if (text.length) {
      liveElement.innerHTML = '';
      liveElement.setAttribute('aria-busy', 'true');
      liveElement.setAttribute('aria-live', priority);
      liveElement.innerHTML = text.join('\n');
      liveElement.setAttribute('aria-busy', 'false');
    }
  }

  Drupal.announce = function (text, priority) {
    announcements.push({
      text: text,
      priority: priority
    });
    return debounce(announce, 200)();
  };
})(Drupal, Drupal.debounce);;
/**
 * @file
 * JavaScript behaviors for details element.
 */

(function ($, Drupal) {

  'use strict';

  Drupal.webform = Drupal.webform || {};
  Drupal.webform.detailsToggle = Drupal.webform.detailsToggle || {};
  Drupal.webform.detailsToggle.options = Drupal.webform.detailsToggle.options || {};

  /**
   * Attach handler to toggle details open/close state.
   *
   * @type {Drupal~behavior}
   */
  Drupal.behaviors.webformDetailsToggle = {
    attach: function (context) {
      $('.js-webform-details-toggle', context).once('webform-details-toggle').each(function () {
        var $form = $(this);
        var $tabs = $form.find('.webform-tabs');

        // Get only the main details elements and ignore all nested details.
        var selector = ($tabs.length) ? '.webform-tab' : '.js-webform-details-toggle, .webform-elements';
        var $details = $form.find('details').filter(function () {
          var $parents = $(this).parentsUntil(selector);
          return ($parents.find('details').length === 0);
        });

        // Toggle is only useful when there are two or more details elements.
        if ($details.length < 2) {
          return;
        }

        var options = $.extend({
          button: '<button type="button" class="webform-details-toggle-state"></button>'
        }, Drupal.webform.detailsToggle.options);

        // Create toggle buttons.
        var $toggle = $(options.button)
          .attr('title', Drupal.t('Toggle details widget state.'))
          .on('click', function (e) {
            // Get details that are not vertical tabs pane.
            var $details = $form.find('details:not(.vertical-tabs__pane)');
            var open;
            if (Drupal.webform.detailsToggle.isFormDetailsOpen($form)) {
              $details.removeAttr('open');
              open = 0;
            }
            else {
              $details.attr('open', 'open');
              open = 1;
            }
            Drupal.webform.detailsToggle.setDetailsToggleLabel($form);

            // Set the saved states for all the details elements.
            // @see webform.element.details.save.js
            if (Drupal.webformDetailsSaveGetName) {
              $details.each(function () {
                // Note: Drupal.webformDetailsSaveGetName checks if localStorage
                // exists and is enabled.
                // @see webform.element.details.save.js
                var name = Drupal.webformDetailsSaveGetName($(this));
                if (name) {
                  localStorage.setItem(name, open);
                }
              });
            }
          })
          .wrap('<div class="webform-details-toggle-state-wrapper"></div>')
          .parent();

        if ($tabs.length) {
          // Add toggle state before the tabs.
          $tabs.find('.item-list:first-child').eq(0).before($toggle);
        }
        else {
          // Add toggle state link to first details element.
          $details.eq(0).before($toggle);
        }

        Drupal.webform.detailsToggle.setDetailsToggleLabel($form);
      });
    }
  };

  /**
   * Determine if a webform's details are all opened.
   *
   * @param {jQuery} $form
   *   A webform.
   *
   * @return {boolean}
   *   TRUE if a webform's details are all opened.
   */
  Drupal.webform.detailsToggle.isFormDetailsOpen = function ($form) {
    return ($form.find('details[open]').length === $form.find('details').length);
  };

  /**
   * Set a webform's details toggle state widget label.
   *
   * @param {jQuery} $form
   *   A webform.
   */
  Drupal.webform.detailsToggle.setDetailsToggleLabel = function ($form) {
    var isOpen = Drupal.webform.detailsToggle.isFormDetailsOpen($form);

    var label = (isOpen) ? Drupal.t('Collapse all') : Drupal.t('Expand all');
    $form.find('.webform-details-toggle-state').html(label);

    var text = (isOpen) ? Drupal.t('All details have been expanded.') : Drupal.t('All details have been collapsed.');
    Drupal.announce(text);
  };

})(jQuery, Drupal);
;
(function(a){a(document).ready(()=>{var b=drupalSettings.onetouch.onetouch_lead_gen.leadg_gen_utm.params,c=!1,d=new URLSearchParams(location.search.substring(1)),e={};b.forEach(a=>{var b=d.get(a);b&&(e[a]=b,c=!0)}),c&&a.ajax({type:"POST",data:e,url:"/newsletter-signup/utm-save-session-values"})})})(jQuery);;
/**
 * @file
 * JavaScript behaviors for message element integration.
 */

(function ($, Drupal) {

  'use strict';

  // Determine if local storage exists and is enabled.
  // This approach is copied from Modernizr.
  // @see https://github.com/Modernizr/Modernizr/blob/c56fb8b09515f629806ca44742932902ac145302/modernizr.js#L696-731
  var hasLocalStorage = (function () {
    try {
      localStorage.setItem('webform', 'webform');
      localStorage.removeItem('webform');
      return true;
    }
    catch (e) {
      return false;
    }
  }());

  // Determine if session storage exists and is enabled.
  // This approach is copied from Modernizr.
  // @see https://github.com/Modernizr/Modernizr/blob/c56fb8b09515f629806ca44742932902ac145302/modernizr.js#L696-731
  var hasSessionStorage = (function () {
    try {
      sessionStorage.setItem('webform', 'webform');
      sessionStorage.removeItem('webform');
      return true;
    }
    catch (e) {
      return false;
    }
  }());

  /**
   * Behavior for handler message close.
   *
   * @type {Drupal~behavior}
   */
  Drupal.behaviors.webformMessageClose = {
    attach: function (context) {
      $(context).find('.js-webform-message--close').once('webform-message--close').each(function () {
        var $element = $(this);

        var id = $element.attr('data-message-id');
        var storage = $element.attr('data-message-storage');
        var effect = $element.attr('data-message-close-effect') || 'hide';
        switch (effect) {
          case 'slide': effect = 'slideUp'; break;

          case 'fade': effect = 'fadeOut'; break;
        }

        // Check storage status.
        if (isClosed($element, storage, id)) {
          return;
        }

        // Only show element if it's style is not set to 'display: none'.
        if ($element.attr('style') !== 'display: none;') {
          $element.show();
        }

        $element.find('.js-webform-message__link').on('click', function (event) {
          $element[effect]();
          setClosed($element, storage, id);
          $element.trigger('close');
          event.preventDefault();
        });
      });
    }
  };

  function isClosed($element, storage, id) {
    if (!id || !storage) {
      return false;
    }

    switch (storage) {
      case 'local':
        if (hasLocalStorage) {
          return localStorage.getItem('Drupal.webform.message.' + id) || false;
        }
        return false;

      case 'session':
        if (hasSessionStorage) {
          return sessionStorage.getItem('Drupal.webform.message.' + id) || false;
        }
        return false;

      default:
        return false;
    }
  }

  function setClosed($element, storage, id) {
    if (!id || !storage) {
      return;
    }

    switch (storage) {
      case 'local':
        if (hasLocalStorage) {
          localStorage.setItem('Drupal.webform.message.' + id, true);
        }
        break;

      case 'session':
        if (hasSessionStorage) {
          sessionStorage.setItem('Drupal.webform.message.' + id, true);
        }
        break;

      case 'user':
      case 'state':
      case 'custom':
        $.get($element.find('.js-webform-message__link').attr('href'));
        return true;
    }
  }

})(jQuery, Drupal);
;
/**
 * @file
 * Contains the definition of the behaviour recaptcha.
 */

(function ($, Drupal) {
  Drupal.behaviors.recaptcha = {
    attach: function (context) {
      $('.g-recaptcha', context).each(function () {
        if (typeof grecaptcha === 'undefined' || typeof grecaptcha.render !== 'function') {
          return;
        }
        if ($(this).closest('body').length > 0) {
          if ($(this).hasClass('recaptcha-processed')) {
            grecaptcha.reset();
          }
          else {
            grecaptcha.render(this, $(this).data());
            $(this).addClass('recaptcha-processed');
          }
        }
      });
    }
  };

  window.drupalRecaptchaOnload = function () {
    $('.g-recaptcha').each(function () {
      if (!$(this).hasClass('recaptcha-processed')) {
        grecaptcha.render(this, $(this).data());
        $(this).addClass('recaptcha-processed');
      }
    });
  };
})(jQuery, Drupal);
;
/**
 * @file
 * Attaches behaviors for the Clientside Validation jQuery module.
 */
(function ($, Drupal, drupalSettings) {
  'use strict';

  if (typeof drupalSettings.cvJqueryValidateOptions === 'undefined') {
    drupalSettings.cvJqueryValidateOptions = {};
  }

  if (drupalSettings.clientside_validation_jquery.force_validate_on_blur) {
    drupalSettings.cvJqueryValidateOptions.onfocusout = function (element) {
      // "eager" validation
      this.element(element);
    };
  }

  // Add messages with translations from backend.
  $.extend($.validator.messages, drupalSettings.clientside_validation_jquery.messages);

  // Allow all modules to update the validate options.
  // Example of how to do this is shown below.
  $(document).trigger('cv-jquery-validate-options-update', drupalSettings.cvJqueryValidateOptions);

  /**
   * Attaches jQuery validate behavior to forms.
   *
   * @type {Drupal~behavior}
   *
   * @prop {Drupal~behaviorAttach} attach
   *  Attaches the outline behavior to the right context.
   */
  Drupal.behaviors.cvJqueryValidate = {
    attach: function (context) {
      if (typeof Drupal.Ajax !== 'undefined') {
        // Update Drupal.Ajax.prototype.beforeSend only once.
        if (typeof Drupal.Ajax.prototype.beforeSubmitCVOriginal === 'undefined') {
          var validateAll = 2;
          try {
            validateAll = drupalSettings.clientside_validation_jquery.validate_all_ajax_forms;
          }
          catch(e) {
            // Do nothing if we do not have settings or value in settings.
          }

          Drupal.Ajax.prototype.beforeSubmitCVOriginal = Drupal.Ajax.prototype.beforeSubmit;
          Drupal.Ajax.prototype.beforeSubmit = function (form_values, element_settings, options) {
            if (typeof this.$form !== 'undefined' && (validateAll === 1 || $(this.element).hasClass('cv-validate-before-ajax'))) {
              $(this.$form).removeClass('ajax-submit-prevented');

              $(this.$form).validate();
              if (!($(this.$form).valid())) {
                this.ajaxing = false;
                $(this.$form).addClass('ajax-submit-prevented');
                return false;
              }
            }

            return this.beforeSubmitCVOriginal.apply(this, arguments);
          };
        }
      }

      $(context).find('form').once('cvJqueryValidate').each(function() {
        $(this).validate(drupalSettings.cvJqueryValidateOptions);
      });
    }
  };
})(jQuery, Drupal, drupalSettings);
;
/**
 * @file
 * Attaches behaviors for the Clientside Validation jQuery module.
 */
(function ($, Drupal, debounce, CKEDITOR) {
  /**
   * Attaches jQuery validate behavoir to forms.
   *
   * @type {Drupal~behavior}
   *
   * @prop {Drupal~behaviorAttach} attach
   *  Attaches the outline behavior to the right context.
   */
  Drupal.behaviors.cvJqueryValidateCKEditor = {
    attach: function (context) {
      if (typeof CKEDITOR === 'undefined') {
        return;
      }
      var ignore = ':hidden';
      var not = [];
      for (var instance in CKEDITOR.instances) {
        if (CKEDITOR.instances.hasOwnProperty(instance)) {
          not.push('#' + instance);
        }
      }
      ignore += not.length ? ':not(' + not.join(', ') + ')' : '';
      $('form').each(function () {
        var validator = $(this).data('validator');
        if (!validator) {
          return;
        }
        validator.settings.ignore = ignore;
        validator.settings.errorPlacement = function(place, $element) {
          var id = $element.attr('id');
          var afterElement = $element[0];
          if (CKEDITOR.instances.hasOwnProperty(id)) {
            afterElement = CKEDITOR.instances[id].container.$;
          }
          place.insertAfter(afterElement);
        };
      });
      var updateText = function (instance) {
        return debounce(function (e) {
          instance.updateElement();
          var event = $.extend(true, {}, e.data.$);
          delete event.target;
          delete event.explicitOriginalTarget;
          delete event.originalTarget;
          delete event.currentTarget;
          $(instance.element.$).trigger(new $.Event(e.name, event));
        }, 250);
      };
      CKEDITOR.on('instanceReady', function () {
        for (var instance in CKEDITOR.instances) {
          if (CKEDITOR.instances.hasOwnProperty(instance)) {
            CKEDITOR.instances[instance].document.on("keyup", updateText(CKEDITOR.instances[instance]));
            CKEDITOR.instances[instance].document.on("paste", updateText(CKEDITOR.instances[instance]));
            CKEDITOR.instances[instance].document.on("keypress", updateText(CKEDITOR.instances[instance]));
            CKEDITOR.instances[instance].document.on("blur", updateText(CKEDITOR.instances[instance]));
            CKEDITOR.instances[instance].document.on("change", updateText(CKEDITOR.instances[instance]));
          }
        }
      });
    }
  };
})(jQuery, Drupal, Drupal.debounce, (typeof CKEDITOR === 'undefined') ? undefined : CKEDITOR);
;
/**
 * @file
 * Attaches behaviors for the Clientside Validation jQuery module.
 */
(function ($) {
  // Override clientside validation jquery validation options.
  // We do this to display the error markup same as in inline_form_errors.
  $(document).once('cvjquery').on('cv-jquery-validate-options-update', function (event, options) {
    options.errorElement = 'strong';
    options.showErrors = function(errorMap, errorList) {
      // First remove all errors.
      for (var i in errorList) {
        $(errorList[i].element).parent().find('.form-item--error-message').remove();
      }

      // Show errors using defaultShowErrors().
      this.defaultShowErrors();

      // Wrap all errors with div.form-item--error-message.
      $(this.currentForm).find('strong.error').each(function () {
        if (!$(this).parent().hasClass('form-item--error-message')) {
          $(this).wrap('<div class="form-item--error-message"/>');
        }
      });
    };
  });
})(jQuery);
;
