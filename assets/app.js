/*!
 * HVAC Design Suite — shared runtime
 * Zero dependencies. Provides: active-nav state, offline badge, toast
 * notifications, clipboard copy, per-tool input persistence, shareable
 * calculation links, and the site-wide unit-conversion constants.
 */
(function (global) {
  'use strict';

  /* ---- site-wide unit conversion constants -----------------------------
     Kept identical across every tool so a value converted in one place
     always matches the same value converted anywhere else in the suite.
     Length uses the suite's stated 1 in = 25 mm / 1 ft = 300 mm design
     convention (rounded, so nominal inch and metric duct/pipe sizes line
     up); everything else uses exact physical constants.               */
  const UNITS = {
    MM_PER_IN: 25,
    MM_PER_FT: 300,
    CFM_PER_LS: 2.1189,
    CFM_PER_M3H: 0.5886,
    FPM_PER_MS: 196.85,
    KPA_PER_BAR: 100,
    KPA_PER_PSI: 6.89476,
    KPA_PER_INWG: 0.249089,
    KW_PER_TR: 3.51685,
    KW_PER_HP: 0.7457,
    GPM_PER_LS: 15.850323,
    FT_PER_M: 3.28084, // real-world (site engineering calcs, not nominal sizing) length factor
  };

  function cToF(c) { return (c * 9) / 5 + 32; }
  function fToC(f) { return ((f - 32) * 5) / 9; }
  function cToK(c) { return c + 273.15; }

  function round(v, dp) {
    if (!isFinite(v)) return v;
    const m = Math.pow(10, dp);
    return Math.round(v * m) / m;
  }
  function roundTo(v, nearest) {
    return Math.round(v / nearest) * nearest;
  }
  function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }
  function fmt(v, dp) {
    if (v === null || v === undefined || !isFinite(v)) return '—';
    return v.toLocaleString(undefined, { minimumFractionDigits: dp, maximumFractionDigits: dp });
  }
  function debounce(fn, ms) {
    let t;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), ms);
    };
  }

  /* ---- paint every [data-icon] element with its inline SVG -------------- */
  function paintIcons(root) {
    (root || document).querySelectorAll('[data-icon]').forEach((el) => {
      const name = el.getAttribute('data-icon');
      if (ICONS[name]) el.innerHTML = ICONS[name];
    });
  }

  /* ---- navigation: active link + offline badge -------------------------- */
  function initNav() {
    paintIcons(document);
    const here = location.pathname.replace(/index\.html$/, '');
    document.querySelectorAll('.tool-nav a.nav-link').forEach((a) => {
      const href = a.getAttribute('href') || '';
      const resolved = new URL(href, location.href).pathname.replace(/index\.html$/, '');
      if (resolved === here || (resolved.endsWith('/') && here.endsWith(resolved))) {
        a.classList.add('active');
        a.setAttribute('aria-current', 'page');
        // tool identity comes from data-tool, never from the folder name, so
        // folders can be renamed for clearer URLs without breaking this
        const toolId = a.getAttribute('data-tool') || resolved.split('/').filter(Boolean).pop();
        if (toolId) store.recordVisit(toolId, a.textContent.trim(), resolved);
      }
    });

    const status = document.querySelector('.nav-status');
    if (status) {
      const paint = () => {
        const online = navigator.onLine;
        status.classList.toggle('online', online);
        status.querySelector('.label').textContent = online ? 'Ready offline' : 'Offline';
      };
      window.addEventListener('online', paint);
      window.addEventListener('offline', paint);
      paint();
    }
  }

  /* ---- toast -------------------------------------------------------------- */
  let toastHost = null;
  function toast(message) {
    if (!toastHost) {
      toastHost = document.createElement('div');
      toastHost.className = 'toast-host';
      toastHost.setAttribute('role', 'status');
      toastHost.setAttribute('aria-live', 'polite');
      document.body.appendChild(toastHost);
    }
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = message;
    toastHost.appendChild(el);
    requestAnimationFrame(() => el.classList.add('show'));
    setTimeout(() => {
      el.classList.remove('show');
      setTimeout(() => el.remove(), 250);
    }, 2200);
  }

  /* ---- clipboard ------------------------------------------------------- */
  function copyText(text, successMessage) {
    const done = () => toast(successMessage || 'Copied to clipboard');
    const fail = () => toast('Copy failed — select and copy manually');
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done).catch(fail);
    } else {
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
        done();
      } catch (e) {
        fail();
      }
    }
  }

  /* ---- persistence: remember a tool's inputs between visits ------------ */
  const STORE_PREFIX = 'hvac-suite:';
  const store = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem(STORE_PREFIX + key);
        return raw ? JSON.parse(raw) : fallback;
      } catch (e) { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(STORE_PREFIX + key, JSON.stringify(value)); } catch (e) { /* storage unavailable */ }
    },
    recordVisit(toolId, label, href) {
      try {
        const recents = store.get('recents', []);
        const filtered = recents.filter((r) => r.id !== toolId);
        filtered.unshift({ id: toolId, label, href, at: Date.now() });
        store.set('recents', filtered.slice(0, 5));
      } catch (e) { /* ignore */ }
    },
  };

  /* ---- shareable state via URL query string ----------------------------- */
  function stateToQuery(state) {
    const p = new URLSearchParams();
    Object.keys(state).forEach((k) => {
      const v = state[k];
      if (v !== '' && v !== null && v !== undefined) p.set(k, v);
    });
    return p.toString();
  }
  function queryToState() {
    const p = new URLSearchParams(location.search);
    const out = {};
    for (const [k, v] of p.entries()) out[k] = v;
    return out;
  }
  function shareLink(state) {
    const q = stateToQuery(state);
    const url = location.origin + location.pathname + (q ? '?' + q : '');
    copyText(url, 'Shareable link copied');
    history.replaceState(null, '', q ? '?' + q : location.pathname);
    return url;
  }

  /* ---- lightweight inline SVG icon set ----------------------------------- */
  const ICONS = {
    'y-piece': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 21V13M12 13L6 5M12 13l6-8"/></svg>',
    'duct-sizer': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="8" width="12" height="8" rx="1"/><path d="M15 10h4a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2h-4"/></svg>',
    psychrometrics: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 3c3 4 5 6.8 5 9.5a5 5 0 1 1-10 0C7 9.8 9 7 12 3Z"/></svg>',
    'chilled-water': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 12h5l2-4 3 8 2-4h4"/></svg>',
    converter: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M7 7h11l-3-3M17 17H6l3 3"/></svg>',
    copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="1.5"/><path d="M5 15V5a1.5 1.5 0 0 1 1.5-1.5H15"/></svg>',
    reset: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg>',
    share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="2.3"/><circle cx="6" cy="12" r="2.3"/><circle cx="18" cy="19" r="2.3"/><path d="M8.1 10.8 15.9 6.2M8.1 13.2l7.8 4.6"/></svg>',
    warn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 1.9 18a2 2 0 0 0 1.7 3h16.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
    print: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V3h12v6M6 18H4a1 1 0 0 1-1-1v-5a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-2"/><rect x="6" y="14" width="12" height="7"/></svg>',
  };

  global.HvacSuite = {
    UNITS, cToF, fToC, cToK, round, roundTo, clamp, fmt, debounce,
    initNav, toast, copyText, store, stateToQuery, queryToState, shareLink,
    paintIcons, ICONS,
  };
})(window);

/* register the service worker for offline use. app.js always lives at
   <site-root>/assets/app.js, so the currently-executing <script> tag tells
   us where the site root is regardless of how deep the current page sits
   (root, or one level down in /y/, /duct/, etc.). */
(function () {
  const thisScript = document.currentScript;
  if (!('serviceWorker' in navigator) || !thisScript) return;
  window.addEventListener('load', () => {
    try {
      const assetsUrl = new URL(thisScript.src, location.href);
      const rootUrl = new URL('../', assetsUrl);
      const swUrl = new URL('sw.js', rootUrl);
      navigator.serviceWorker.register(swUrl.href, { scope: rootUrl.pathname }).catch(() => {});
    } catch (e) { /* offline support unavailable */ }
  });
})();
