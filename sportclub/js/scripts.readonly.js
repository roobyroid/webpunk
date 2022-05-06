/* eslint-disable no-unused-vars */
import {ieFix} from './utils/ie-fix';
import mobMenu from './modules/mobmenu';
import telMask from './modules/mask';
import {initModals} from './modules/init-modals';
import Swiper, {Navigation} from 'swiper';
import 'simplebar';
import WOW from 'wow.js';
import Swal from 'sweetalert2';
// import accordion from './modules/accordion';
// import tabs from './modules/tabs';

Swiper.use([Navigation]);

document.addEventListener('DOMContentLoaded', function () {
  ieFix();
  new WOW().init();

  try {
    const form = document.querySelector('.hero__form');
    const formBtn = document.querySelector('.hero__form-btn');
    const inputTel = document.querySelector('.hero__input--tel');
    const checkbox = document.querySelector('.hero__checkbox-input');
    formBtn.addEventListener('click', (event) => {
      event.preventDefault();
      let lastNum = inputTel.value.slice(-1);
      if (!checkbox.checked || (lastNum === '_' || inputTel.value.length < 1)) {
        Swal.fire('Для регистрации/авторизации необходимо дать согласие с политикой конфиденциальности и правилами обработки персональных данных');
        return;
      }
      form.classList.add('active');
      formBtn.textContent = 'Войти';
    });

  } catch (e) { }
  try {
    initModals();
  } catch (e) { }

  try {
    mobMenu();
  } catch (e) { }

  try {
    telMask();
  } catch (e) { }

  try {
    const swiper = new Swiper('.games__slider .swiper', {
      // slidesPerView: 4,
      spaceBetween: 18,
      navigation: {
        nextEl: '.games__slider-next',
        prevEl: '.games__slider-prev',
      },
      breakpoints: {
        320: {
          slidesPerView: 1,
        },
        575: {
          slidesPerView: 2,
        },
        768: {
          slidesPerView: 3,
        },
        1120: {
          slidesPerView: 4,
        },
      },
    });
  } catch (e) { }
});

const focusVisible = () => {
  /**
   * Applies the :focus-visible polyfill at the given scope.
   * A scope in this case is either the top-level Document or a Shadow Root.
   *
   * @param {(Document|ShadowRoot)} scope
   * @see https://github.com/WICG/focus-visible
   */
  function applyFocusVisiblePolyfill(scope) {
    let hadKeyboardEvent = true;
    let hadFocusVisibleRecently = false;
    let hadFocusVisibleRecentlyTimeout = null;

    let inputTypesAllowlist = {
      'text': true,
      'search': true,
      'url': true,
      'tel': true,
      'email': true,
      'password': true,
      'number': true,
      'date': true,
      'month': true,
      'week': true,
      'time': true,
      'datetime': true,
      'datetime-local': true,
    };

    /**
     * Helper function for legacy browsers and iframes which sometimes focus
     * elements like document, body, and non-interactive SVG.
     * @param {Element} el
     */
    function isValidFocusTarget(el) {
      if (
        el &&
        el !== document &&
        el.nodeName !== 'HTML' &&
        el.nodeName !== 'BODY' &&
        'classList' in el &&
        'contains' in el.classList
      ) {
        return true;
      }
      return false;
    }

    /**
     * Computes whether the given element should automatically trigger the
     * `focus-visible` class being added, i.e. whether it should always match
     * `:focus-visible` when focused.
     * @param {Element} el
     * @return {boolean}
     */
    function focusTriggersKeyboardModality(el) {
      let type = el.type;
      let tagName = el.tagName;

      if (tagName === 'INPUT' && inputTypesAllowlist[type] && !el.readOnly) {
        return true;
      }

      if (tagName === 'TEXTAREA' && !el.readOnly) {
        return true;
      }

      if (el.isContentEditable) {
        return true;
      }

      return false;
    }

    /**
     * Add the `focus-visible` class to the given element if it was not added by
     * the author.
     * @param {Element} el
     */
    function addFocusVisibleClass(el) {
      if (el.classList.contains('focus-visible')) {
        return;
      }
      el.classList.add('focus-visible');
      el.setAttribute('data-focus-visible-added', '');
    }

    /**
     * Remove the `focus-visible` class from the given element if it was not
     * originally added by the author.
     * @param {Element} el
     */
    function removeFocusVisibleClass(el) {
      if (!el.hasAttribute('data-focus-visible-added')) {
        return;
      }
      el.classList.remove('focus-visible');
      el.removeAttribute('data-focus-visible-added');
    }

    /**
     * If the most recent user interaction was via the keyboard;
     * and the key press did not include a meta, alt/option, or control key;
     * then the modality is keyboard. Otherwise, the modality is not keyboard.
     * Apply `focus-visible` to any current active element and keep track
     * of our keyboard modality state with `hadKeyboardEvent`.
     * @param {KeyboardEvent} e
     */
    function onKeyDown(e) {
      if (e.metaKey || e.altKey || e.ctrlKey) {
        return;
      }

      if (isValidFocusTarget(scope.activeElement)) {
        addFocusVisibleClass(scope.activeElement);
      }

      hadKeyboardEvent = true;
    }

    /**
     * If at any point a user clicks with a pointing device, ensure that we change
     * the modality away from keyboard.
     * This avoids the situation where a user presses a key on an already focused
     * element, and then clicks on a different element, focusing it with a
     * pointing device, while we still think we're in keyboard modality.
     * @param {Event} e
     */
    function onPointerDown(e) {
      hadKeyboardEvent = false;
    }

    /**
     * On `focus`, add the `focus-visible` class to the target if:
     * - the target received focus as a result of keyboard navigation, or
     * - the event target is an element that will likely require interaction
     *   via the keyboard (e.g. a text box)
     * @param {Event} e
     */
    function onFocus(e) {
      // Prevent IE from focusing the document or HTML element.
      if (!isValidFocusTarget(e.target)) {
        return;
      }

      if (hadKeyboardEvent || focusTriggersKeyboardModality(e.target)) {
        addFocusVisibleClass(e.target);
      }
    }

    /**
     * On `blur`, remove the `focus-visible` class from the target.
     * @param {Event} e
     */
    function onBlur(e) {
      if (!isValidFocusTarget(e.target)) {
        return;
      }

      if (
        e.target.classList.contains('focus-visible') ||
        e.target.hasAttribute('data-focus-visible-added')
      ) {
        // To detect a tab/window switch, we look for a blur event followed
        // rapidly by a visibility change.
        // If we don't see a visibility change within 100ms, it's probably a
        // regular focus change.
        hadFocusVisibleRecently = true;
        window.clearTimeout(hadFocusVisibleRecentlyTimeout);
        hadFocusVisibleRecentlyTimeout = window.setTimeout(function () {
          hadFocusVisibleRecently = false;
        }, 100);
        removeFocusVisibleClass(e.target);
      }
    }

    /**
     * If the user changes tabs, keep track of whether or not the previously
     * focused element had .focus-visible.
     * @param {Event} e
     */
    function onVisibilityChange(e) {
      if (document.visibilityState === 'hidden') {
        // If the tab becomes active again, the browser will handle calling focus
        // on the element (Safari actually calls it twice).
        // If this tab change caused a blur on an element with focus-visible,
        // re-apply the class when the user switches back to the tab.
        if (hadFocusVisibleRecently) {
          hadKeyboardEvent = true;
        }
        addInitialPointerMoveListeners();
      }
    }

    /**
     * Add a group of listeners to detect usage of any pointing devices.
     * These listeners will be added when the polyfill first loads, and anytime
     * the window is blurred, so that they are active when the window regains
     * focus.
     */
    function addInitialPointerMoveListeners() {
      document.addEventListener('mousemove', onInitialPointerMove);
      document.addEventListener('mousedown', onInitialPointerMove);
      document.addEventListener('mouseup', onInitialPointerMove);
      document.addEventListener('pointermove', onInitialPointerMove);
      document.addEventListener('pointerdown', onInitialPointerMove);
      document.addEventListener('pointerup', onInitialPointerMove);
      document.addEventListener('touchmove', onInitialPointerMove);
      document.addEventListener('touchstart', onInitialPointerMove);
      document.addEventListener('touchend', onInitialPointerMove);
    }

    function removeInitialPointerMoveListeners() {
      document.removeEventListener('mousemove', onInitialPointerMove);
      document.removeEventListener('mousedown', onInitialPointerMove);
      document.removeEventListener('mouseup', onInitialPointerMove);
      document.removeEventListener('pointermove', onInitialPointerMove);
      document.removeEventListener('pointerdown', onInitialPointerMove);
      document.removeEventListener('pointerup', onInitialPointerMove);
      document.removeEventListener('touchmove', onInitialPointerMove);
      document.removeEventListener('touchstart', onInitialPointerMove);
      document.removeEventListener('touchend', onInitialPointerMove);
    }

    /**
     * When the polfyill first loads, assume the user is in keyboard modality.
     * If any event is received from a pointing device (e.g. mouse, pointer,
     * touch), turn off keyboard modality.
     * This accounts for situations where focus enters the page from the URL bar.
     * @param {Event} e
     */
    function onInitialPointerMove(e) {
      // Work around a Safari quirk that fires a mousemove on <html> whenever the
      // window blurs, even if you're tabbing out of the page. ¯\_(ツ)_/¯
      if (e.target.nodeName && e.target.nodeName.toLowerCase() === 'html') {
        return;
      }

      hadKeyboardEvent = false;
      removeInitialPointerMoveListeners();
    }

    // For some kinds of state, we are interested in changes at the global scope
    // only. For example, global pointer input, global key presses and global
    // visibility change should affect the state at every scope:
    document.addEventListener('keydown', onKeyDown, true);
    document.addEventListener('mousedown', onPointerDown, true);
    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('touchstart', onPointerDown, true);
    document.addEventListener('visibilitychange', onVisibilityChange, true);

    addInitialPointerMoveListeners();

    // For focus and blur, we specifically care about state changes in the local
    // scope. This is because focus / blur events that originate from within a
    // shadow root are not re-dispatched from the host element if it was already
    // the active element in its own scope:
    scope.addEventListener('focus', onFocus, true);
    scope.addEventListener('blur', onBlur, true);

    // We detect that a node is a ShadowRoot by ensuring that it is a
    // DocumentFragment and also has a host property. This check covers native
    // implementation and polyfill implementation transparently. If we only cared
    // about the native implementation, we could just check if the scope was
    // an instance of a ShadowRoot.
    if (scope.nodeType === Node.DOCUMENT_FRAGMENT_NODE && scope.host) {
      // Since a ShadowRoot is a special kind of DocumentFragment, it does not
      // have a root element to add a class to. So, we add this attribute to the
      // host element instead:
      scope.host.setAttribute('data-js-focus-visible', '');
    } else if (scope.nodeType === Node.DOCUMENT_NODE) {
      document.documentElement.classList.add('js-focus-visible');
      document.documentElement.setAttribute('data-js-focus-visible', '');
    }
  }

  // It is important to wrap all references to global window and document in
  // these checks to support server-side rendering use cases
  // @see https://github.com/WICG/focus-visible/issues/199
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    // Make the polyfill helper globally available. This can be used as a signal
    // to interested libraries that wish to coordinate with the polyfill for e.g.,
    // applying the polyfill to a shadow root:
    window.applyFocusVisiblePolyfill = applyFocusVisiblePolyfill;

    // Notify interested libraries of the polyfill's presence, in case the
    // polyfill was loaded lazily:
    let event;

    try {
      event = new CustomEvent('focus-visible-polyfill-ready');
    } catch (error) {
      // IE11 does not support using CustomEvent as a constructor directly:
      event = document.createEvent('CustomEvent');
      event.initCustomEvent('focus-visible-polyfill-ready', false, false, {});
    }

    window.dispatchEvent(event);
  }

  if (typeof document !== 'undefined') {
    // Apply the polyfill to the global document, so that no JavaScript
    // coordination is required to use the polyfill in the top-level document:
    applyFocusVisiblePolyfill(document);
  }
};
export default focusVisible;

/* eslint-disable */
const ieFix = () => {
  // Polyfills
  //---------------------------------

  // forEach
  if (window.NodeList && !NodeList.prototype.forEach) {
    NodeList.prototype.forEach = function (callback, thisArg) {
      thisArg = thisArg || window;
      for (let i = 0; i < this.length; i++) {
        callback.call(thisArg, this[i], i, this);
      }
    };
  }

  // includes
  if (!Array.prototype.includes) {
    Object.defineProperty(Array.prototype, 'includes', {
      value: function(searchElement, fromIndex) {

        if (this == null) {
          throw new TypeError('"this" is null or not defined');
        }

        var o = Object(this);

        var len = o.length >>> 0;

        if (len === 0) {
          return false;
        }

        var n = fromIndex | 0;

        var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

        function sameValueZero(x, y) {
          return x === y || (typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y));
        }

        while (k < len) {
          if (sameValueZero(o[k], searchElement)) {
            return true;
          }
          k++;
        }

        return false;
      }
    });
  }

  // matches
  if (!Element.prototype.matches) {
    Element.prototype.matches =
      Element.prototype.matchesSelector ||
      Element.prototype.mozMatchesSelector ||
      Element.prototype.msMatchesSelector ||
      Element.prototype.oMatchesSelector ||
      Element.prototype.webkitMatchesSelector ||
      function (s) {
        let matches = (this.document || this.ownerDocument).querySelectorAll(s);
        let i = matches.length;
        // eslint-disable-next-line no-empty
        while (--i >= 0 && matches.item(i) !== this) {}
        return i > -1;
      };
  }

  // closest
  if (!Element.prototype.matches) {
    Element.prototype.matches =
      Element.prototype.msMatchesSelector ||
      Element.prototype.webkitMatchesSelector;
  }

  if (!Element.prototype.closest) {
    Element.prototype.closest = function (s) {
      let el = this;

      do {
        if (el.matches(s)) {
          return el;
        }
        el = el.parentElement || el.parentNode;
      } while (el !== null && el.nodeType === 1);
      return null;
    };
  }

  // prepend
  (function (arr) {
    arr.forEach(function (item) {
      if (item.hasOwnProperty(`prepend`)) {
        return;
      }
      Object.defineProperty(item, `prepend`, {
        configurable: true,
        enumerable: true,
        writable: true,
        value: function prepend() {
          // eslint-disable-next-line prefer-rest-params
          let argArr = Array.prototype.slice.call(arguments);
          let docFrag = document.createDocumentFragment();

          argArr.forEach(function (argItem) {
            let isNode = argItem instanceof Node;
            docFrag.appendChild(isNode ? argItem : document.createTextNode(String(argItem)));
          });

          this.insertBefore(docFrag, this.firstChild);
        },
      });
    });
  })([Element.prototype, Document.prototype, DocumentFragment.prototype]);

  // append
  (function (arr) {
    arr.forEach(function (item) {
      if (item.hasOwnProperty(`append`)) {
        return;
      }
      Object.defineProperty(item, `append`, {
        configurable: true,
        enumerable: true,
        writable: true,
        value: function append() {
          // eslint-disable-next-line prefer-rest-params
          let argArr = Array.prototype.slice.call(arguments);
          let docFrag = document.createDocumentFragment();

          argArr.forEach(function (argItem) {
            let isNode = argItem instanceof Node;
            docFrag.appendChild(isNode ? argItem : document.createTextNode(String(argItem)));
          });

          this.appendChild(docFrag);
        },
      });
    });
  })([Element.prototype, Document.prototype, DocumentFragment.prototype]);

  // before
  (function (arr) {
    arr.forEach(function (item) {
      if (item.hasOwnProperty(`before`)) {
        return;
      }
      Object.defineProperty(item, `before`, {
        configurable: true,
        enumerable: true,
        writable: true,
        value: function before() {
          // eslint-disable-next-line prefer-rest-params
          let argArr = Array.prototype.slice.call(arguments);
          let docFrag = document.createDocumentFragment();

          argArr.forEach(function (argItem) {
            let isNode = argItem instanceof Node;
            docFrag.appendChild(isNode ? argItem : document.createTextNode(String(argItem)));
          });

          this.parentNode.insertBefore(docFrag, this);
        },
      });
    });
  })([Element.prototype, CharacterData.prototype, DocumentType.prototype]);

  // remove
  (function (arr) {
    arr.forEach(function (item) {
      if (item.hasOwnProperty(`remove`)) {
        return;
      }
      Object.defineProperty(item, `remove`, {
        configurable: true,
        enumerable: true,
        writable: true,
        value: function remove() {
          if (this.parentNode !== null) {
            this.parentNode.removeChild(this);
          }
        },
      });
    });
  })([Element.prototype, CharacterData.prototype, DocumentType.prototype]);

  // startsWith
  if (!String.prototype.startsWith) {
    // eslint-disable-next-line no-extend-native
    Object.defineProperty(String.prototype, `startsWith`, {
      value(search, rawPos) {
        let pos = rawPos > 0 ? rawPos | 0 : 0;
        return this.substring(pos, pos + search.length) === search;
      },
    });
  }

  // Fixes
  //---------------------------------

  // ie download
  const ie11Download = (el) => {
    if (el.href === ``) {
      throw Error(`The element has no href value.`);
    }

    let filename = el.getAttribute(`download`);
    if (filename === null || filename === ``) {
      const tmp = el.href.split(`/`);
      filename = tmp[tmp.length - 1];
    }

    el.addEventListener(`click`, (evt) => {
      evt.preventDefault();
      const xhr = new XMLHttpRequest();
      xhr.onloadstart = () => {
        xhr.responseType = `blob`;
      };
      xhr.onload = () => {
        navigator.msSaveOrOpenBlob(xhr.response, filename);
      };
      xhr.open(`GET`, el.href, true);
      xhr.send();
    });
  };

  if (window.navigator.msSaveBlob) {
    const downloadLinks = document.querySelectorAll(`a[download]`);
    if (downloadLinks.length) {
      downloadLinks.forEach((el) => {
        ie11Download(el);
      });
    }
  }

  // ie svg focus fix
  const unfocusableSvg = () => {
    if (!(!!window.MSInputMethodContext && !!document.documentMode)) {
      return;
    }

    const svg = document.querySelectorAll('svg');

    svg.forEach((el) => {
      el.setAttribute('focusable', 'false');
    });
  }

  unfocusableSvg();

  //ie footer nailing
  const ieFooterNailing = () => {
    const main = document.querySelector('main');
    const header = document.querySelector('.header');
    const footer = document.querySelector('.footer');

    let headerH;
    let footerH;
    let mainHMin;

    if (!main || !(!!window.MSInputMethodContext && !!document.documentMode)) {
      return;
    }

    const mainHeight = () => {
      // eslint-disable-next-line no-unused-expressions
      header ? headerH = header.getBoundingClientRect().height : headerH = 0;
      // eslint-disable-next-line no-unused-expressions
      footer ? footerH = footer.getBoundingClientRect().height : footerH = 0;
      mainHMin = window.innerHeight;

      main.style.minHeight = mainHMin - (headerH + footerH) + 'px';
    };

    document.addEventListener('loadDOMContentLoaded', mainHeight());
    window.addEventListener('resize', mainHeight);
  };

  ieFooterNailing();
};

export {ieFix};

import { disableScrolling, enableScrolling } from './scroll-lock';

const openModal = (modal, callback) => {
  modal.classList.add('modal--active');

  if (callback) {
    callback();
  }

  disableScrolling();
};

const closeModal = (modal, callback) => {
  modal.classList.remove('modal--active');

  if (callback) {
    callback();
  }

  // таймаут нужен, чтобы исключить подергивание
  // тайминг стоит менять в зависимости от анимации закрытия
  setTimeout(enableScrolling, 300);
};

const onEscPress = (evt, modal, callback) => {
  const isEscKey = evt.key === 'Escape' || evt.key === 'Esc';

  if (isEscKey && modal.classList.contains('modal--active')) {
    evt.preventDefault();
    closeModal(modal, callback);
  }
};

const setModalListeners = (modal, closeCallback) => {
  const overlay = modal.querySelector('.modal__overlay');
  const closeBtn = modal.querySelector('.modal__close-btn');

  closeBtn.addEventListener('click', () => {
    closeModal(modal, closeCallback);
  });

  overlay.addEventListener('click', () => {
    closeModal(modal, closeCallback);
  });

  document.addEventListener('keydown', (evt) => {
    onEscPress(evt, modal, closeCallback);
  });
};

const setupModal = (modal, closeCallback, modalBtns, openCallback, noPrevDefault) => {
  if (modalBtns) {
    modalBtns.forEach((btn) => {
      btn.addEventListener('click', (evt) => {
        if (!noPrevDefault) {
          evt.preventDefault();
        }
        openModal(modal, openCallback);
      });
    });
  }

  setModalListeners(modal, closeCallback);
};

export { setupModal, openModal, closeModal };

const body = document.querySelector('body');

// eslint-disable-next-line consistent-return
const getScrollbarWidth = () => {
  const outer = document.createElement('div');
  outer.style.visibility = 'hidden';
  outer.style.overflow = 'scroll';
  outer.style.msOverflowStyle = 'scrollbar';
  body.appendChild(outer);
  const inner = document.createElement('div');
  outer.appendChild(inner);
  const scrollbarWidth = (outer.offsetWidth - inner.offsetWidth);
  outer.parentNode.removeChild(outer);
  if (body.offsetHeight > window.innerHeight) {
    return scrollbarWidth;
  }
};

const getBodyScrollTop = () => {
  return (
    self.pageYOffset ||
    (document.documentElement && document.documentElement.ScrollTop) ||
    (body && body.scrollTop)
  );
};

const disableScrolling = (noScrollbar) => {
  if (!noScrollbar) {
    const scrollWidth = getScrollbarWidth();
    body.setAttribute('style', `padding-right: ${scrollWidth}px;`);
  }
  body.dataset.scrollY = `${getBodyScrollTop()}`;
  body.style.top = `-${body.dataset.scrollY}px`;
  body.classList.add('scroll-lock');
};

const enableScrolling = () => {
  body.removeAttribute('style');
  body.classList.remove('scroll-lock');
  window.scrollTo(0, +body.dataset.scrollY);
};

export {
  disableScrolling,
  enableScrolling
};

const accordion = (triggersSelector) => {
  const accordions = document.querySelectorAll(triggersSelector);

  accordions.forEach((el) => {
    el.addEventListener('click', (e) => {
      const self = e.currentTarget;
      const control = self.querySelector('.accordion__control');
      const content = self.querySelector('.accordion__content');

      // self.classList.toggle('open');
      if (e.target === control || control.contains(e.target)) {
        // если открыт аккордеон
        if (self.classList.contains('open')) {
          self.classList.remove('open');
          control.setAttribute('aria-expanded', false);
          content.setAttribute('aria-hidden', true);
          content.style.maxHeight = null;
        } else {
          // accordions.forEach((accord) => {
          //   const accControl = accord.querySelector('.accordion__control');
          //   const accContent = accord.querySelector('.accordion__content');

          //   accord.classList.remove('open');
          //   accControl.setAttribute('aria-expanded', false);
          //   accContent.setAttribute('aria-hidden', true);
          //   accContent.style.maxHeight = null;
          // });
          self.classList.add('open');
          control.setAttribute('aria-expanded', true);
          content.setAttribute('aria-hidden', false);
          content.style.maxHeight = content.scrollHeight + 'px';
        }
      }

    });
  });
};

export default accordion;

import {setupModal, closeModal} from '../utils/modal';

const modals = document.querySelectorAll('.modal');
const modalRules = document.querySelector('.modal--rules');
const modalRulesBtns = document.querySelectorAll('[data-modal="rules"]');

// аргументы setupModal(modal, closeCallback, modalBtns, openCallback, noPrevDefault)
// возможна инициализация только с первыми аргументом,
// если вам нужно открывать модалку в другом месте под какими-нибудь условиями
const initModals = () => {
  // фикс для редких случаев, когда модалка появляется при загрузке страницы
  window.addEventListener('load', () => {
    if (modals.length) {
      modals.forEach((el) => {
        setTimeout(() => {
          el.classList.remove('modal--preload');
        }, 100);
      });
    }
  });

  if (modalRules && modalRulesBtns.length) {
    setupModal(modalRules, false, modalRulesBtns, false, false);
  }
};

export {initModals, closeModal};

import Inputmask from 'inputmask';

const telMask = () => {
  const telSelector = document.querySelectorAll('input[type="tel"]');
  const inputMask = new Inputmask('+7 (999) 999-99-99', {showMaskOnHover: false, showMaskOnFocus: false});
  inputMask.mask(telSelector);
};

export default telMask;

const mobMenu = () => {
  // mob menu
  const body = document.querySelector('body');
  const headerMenu = document.querySelector('.header__nav');
  const btnMenuOpen = document.querySelector('.header__burger');
  const links = headerMenu.querySelectorAll('a');
  btnMenuOpen.addEventListener('click', () => {
    body.classList.toggle('scroll-lock');
    headerMenu.classList.toggle('active');
    btnMenuOpen.classList.toggle('active');
  });
  links.forEach((link) => {
    link.addEventListener('click', () => {
      if (headerMenu.classList.contains('active')) {
        headerMenu.classList.remove('active');
        btnMenuOpen.classList.remove('active');
      }
    });
  });
};

export default mobMenu;

const tabs = (headerSelector, tabSelector, contentSelector, activeClass) => {
  const header = document.querySelector(headerSelector);
  const tab = document.querySelectorAll(tabSelector);
  const content = document.querySelectorAll(contentSelector);

  function hideTabContent() {
    content.forEach((item) => {
      item.classList.remove(activeClass);
    });

    tab.forEach((item) => {
      item.classList.remove(activeClass);
    });
  }

  function showTabContent(i = 0) {
    content[i].classList.add(activeClass);
    tab[i].classList.add(activeClass);
  }

  hideTabContent();
  showTabContent();

  header.addEventListener('click', (e) => {
    const target = e.target;
    if (target &&
      (target.classList.contains(tabSelector.replace(/\./, '')) ||
        target.parentNode.classList.contains(tabSelector.replace(/\./, '')))) {
      tab.forEach((item, i) => {
        if (target === item || target.parentNode === item) {
          hideTabContent();
          showTabContent(i);
        }
      });
    }
  });
};

export default tabs;
