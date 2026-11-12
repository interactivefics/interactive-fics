// sangtacviet-decode.js
// Decodes sangtacviet.vip font-obfuscated text (PUA chars) into readable text.
(async function () {
  if (!/sangtacviet/i.test(location.hostname)) return;

  const STV_KEY = 'stv-decode-enabled-interactive-fics';
  try {
    const items = await new Promise(res => chrome.storage.sync.get(STV_KEY, res));
    if (items[STV_KEY] === false) return;
  } catch (e) {}

  const REF_URL = chrome.runtime.getURL('arial-ref.ttf');
  let mapping = null;
  let decoding = false;
  let decodeTimer = null;

  function isPUA(ch) {
    const c = ch.charCodeAt(0);
    return (c >= 0xE000 && c <= 0xF8FF) || (c >= 0x100000);
  }
  function hasPUA(text) {
    if (!text) return false;
    for (const ch of text) if (isPUA(ch)) return true;
    return false;
  }

  function getEncryptedFontUrl() {
    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules || []) {
          if (rule.type === 5 && /stvarial/i.test(rule.cssText) && /ctp\/fenc/i.test(rule.cssText)) {
            const m = rule.cssText.match(/url\(["']?([^"')]+)["']?\)/);
            if (m) return new URL(m[1], location.origin).href;
          }
        }
      } catch (e) {}
    }
    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules || []) {
          if (rule.type === 5 && /ctp\/fenc/i.test(rule.cssText)) {
            const m = rule.cssText.match(/url\(["']?([^"')]+)["']?\)/);
            if (m && /\.ttf/i.test(m[1])) return new URL(m[1], location.origin).href;
          }
        }
      } catch (e) {}
    }
    return null;
  }

  async function buildMapping(encUrl) {
    const cacheKey = 'stv-map-v2-' + encUrl;
    try {
      const cached = await new Promise(res => chrome.storage.local.get(cacheKey, res));
      const c = cached[cacheKey];
      if (c) {
        mapping = (c && c.map) ? c.map : c;
        return mapping;
      }
    } catch (e) {}

    const [encBuf, refBuf] = await Promise.all([
      fetch(encUrl).then(r => r.arrayBuffer()),
      fetch(REF_URL).then(r => r.arrayBuffer())
    ]);
    const enc = opentype.parse(encBuf);
    const ref = opentype.parse(refBuf);

    const refMap = {};
    for (const cpStr of Object.keys(ref.tables.cmap.glyphIndexMap)) {
      const cp = parseInt(cpStr);
      const gi = ref.tables.cmap.glyphIndexMap[cpStr];
      const g = ref.glyphs.get(gi);
      const path = g.path.toPathData(2);
      if (refMap[path] === undefined) refMap[path] = cp;
    }

    const m = {};
    for (const cpStr of Object.keys(enc.tables.cmap.glyphIndexMap)) {
      const cp = parseInt(cpStr);
      if (cp < 0xE000 || cp > 0xF8FF) continue;
      const gi = enc.tables.cmap.glyphIndexMap[cpStr];
      const g = enc.glyphs.get(gi);
      const path = g.path.toPathData(2);
      if (refMap[path] !== undefined) m[String.fromCharCode(cp)] = String.fromCharCode(refMap[path]);
    }
    mapping = m;
    try {
      const obj = {};
      obj[cacheKey] = { map: m, ts: Date.now() };
      chrome.storage.local.set(obj, () => {
        // LRU prune: keep at most 20 maps
        chrome.storage.local.get(null, items => {
          const entries = Object.keys(items)
            .filter(k => k.startsWith('stv-map-v2-'))
            .map(k => ({ k, ts: (items[k] && items[k].ts) || 0 }))
            .sort((a, b) => a.ts - b.ts);
          if (entries.length > 20) {
            const toRemove = entries.slice(0, entries.length - 20).map(e => e.k);
            chrome.storage.local.remove(toRemove);
          }
        });
      });
    } catch (e) {}
    return mapping;
  }

  function decodeTextNode(node, m) {
    let s = node.nodeValue;
    let out = '';
    let changed = false;
    for (const ch of s) {
      if (m[ch] !== undefined) { out += m[ch]; changed = true; }
      else out += ch;
    }
    if (changed) {
      node.nodeValue = out;
      // keep InteractiveFics originalTextNodes in sync
      const otn = (typeof window !== 'undefined') ? window.originalTextNodes : null;
      if (otn instanceof WeakMap) {
        otn.set(node, node.nodeValue);
      }
    } else {
      const otn = (typeof window !== 'undefined') ? window.originalTextNodes : null;
      if (otn instanceof WeakMap && !otn.has(node)) {
        otn.set(node, node.nodeValue);
      }
    }
  }

  function walkContainer(container, m) {
    if (container.dataset && container.dataset.stvDecoded === '1') {
      if (!hasPUA(container.innerText)) return;
    }
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null, false);
    let node;
    while (node = walker.nextNode()) {
      if (node.parentElement && node.parentElement.closest && node.parentElement.closest('script,style,noscript')) continue;
      decodeTextNode(node, m);
    }
    container.style.fontFamily = 'sans-serif, Arial, "Segoe UI", sans-serif';
    if (container.dataset) container.dataset.stvDecoded = '1';
  }

  function applySavedReplacements() {
    const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const isSpecial = (k) => k === 'person' || k === 'deactivate-this-extension-pls-interactive-fics-yalla-bina' || k === 'observe-this-dom-pls-interactive-fics-yalla-bina' || k === 'pause-this-domain-pls-interactive-fics-yalla-bina' || k === 'enable-copy-everywhere-interactive-fics-yalla-bina' || k === 'enable-copy-hosts-interactive-fics-yalla-bina' || k === 'enable-copy-pending-flash-hosts-interactive-fics-yalla-bina' || k === 'protected-replacements-interactive-fics-yalla-bina' || k === 'stv-decode-enabled-interactive-fics' || k === 'review-mode-interactive-fics-yalla-bina' || k === 'quick-replace-mode-interactive-fics-yalla-bina' || k.startsWith('stv-map-') || k.endsWith('_case_sensitive');
    chrome.storage.sync.get(null, sync_items => {
      chrome.storage.local.get(null, local_items => {
        const items = Object.assign({}, sync_items, local_items);
        const rules = [];
        for (const key in items) {
          if (key === 'person' && items[key]) {
            rules.push({ re: /\(y\/n\)|\[y\/n\]|\(s\/n\)|\[s\/n\]|\by\/n\b|\byn\b|\bs\/n\b/gi, val: items[key] });
          } else if (!isSpecial(key) && typeof items[key] === 'string') {
            const cs = !!items[key + '_case_sensitive'];
            const flags = cs ? 'g' : 'ig';
            try { rules.push({ re: new RegExp(escapeRegex(key), flags), val: items[key] }); } catch (e) {}
          }
        }
        const containers = document.querySelectorAll('.contentbox, [id^="cld-"]');
        containers.forEach(c => {
          const walker = document.createTreeWalker(c, NodeFilter.SHOW_TEXT, null, false);
          let node;
          while (node = walker.nextNode()) {
            let v = node.nodeValue;
            rules.forEach(r => { v = v.replace(r.re, r.val); });
            node.nodeValue = v;
          }
        });
      });
    });
  }

  async function decodeAll() {
    if (decoding) return;
    decoding = true;
    try {
      const containers0 = document.querySelectorAll('.contentbox, [id^="cld-"]');
      let needsDecode = false;
      containers0.forEach(c => { if (hasPUA(c.innerText || '')) needsDecode = true; });
      if (!needsDecode) { decoding = false; return; }
      const m = mapping || await buildMapping(getEncryptedFontUrl());
      if (!m) return;
      const containers = document.querySelectorAll('.contentbox, [id^="cld-"]');
      containers.forEach(c => walkContainer(c, m));
      // Detect obfuscation-method change: if text still has PUA after decode, warn
      const stillPUA = Array.from(containers).some(c => hasPUA(c.innerText || ''));
      if (stillPUA || Object.keys(m).length === 0) {
        try { chrome.runtime.sendMessage({ type: 'set-badge', text: '!' }, () => { void chrome.runtime.lastError; }); } catch (e) {}
      }
      // Trigger InteractiveFics replacements now that text is decoded
      try {
        if (typeof replaceAll === 'function') replaceAll();
      } catch (e) {}
      try { chrome.runtime.sendMessage({}); } catch (e) {}
    } catch (e) {
      console.error('sangtacviet decode error', e);
    } finally {
      decoding = false;
    }
  }

  function scheduleDecode() {
    clearTimeout(decodeTimer);
    decodeTimer = setTimeout(() => {
      document.querySelectorAll('.contentbox, [id^="cld-"]').forEach(el => {
        if (hasPUA(el.innerText || '')) decodeAll();
      });
    }, 200);
  }

  if (document.body) {
    decodeAll();
  } else {
    document.addEventListener('DOMContentLoaded', decodeAll, { once: true });
  }
  const obs = new MutationObserver(scheduleDecode);
  obs.observe(document.documentElement, { childList: true, subtree: true });

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg && msg.type === 'stv-toggle') {
      chrome.storage.sync.get(STV_KEY, obj => {
        if (obj[STV_KEY] !== false) {
          decodeAll();
        }
      });
    }
  });

  window.stvDecodeAll = decodeAll;
})();
