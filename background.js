const ENABLE_COPY_HOSTS_KEY = 'enable-copy-hosts-interactive-fics-yalla-bina';
const ENABLE_COPY_PENDING_FLASH_HOSTS_KEY = 'enable-copy-pending-flash-hosts-interactive-fics-yalla-bina';

const isSupportedTabUrl = url => /^https?:\/\//.test(url || '');

const getHostname = url => {
  if (!isSupportedTabUrl(url)) { return null; }
  return new URL(url).hostname;
};

const executeEnableCopy = (tabId, showFlash) => {
  if (showFlash) {
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['enable-copy/flash.js']
    }, () => chrome.runtime.lastError);
  }

  const delay = showFlash ? 3500 : 0;
  setTimeout(() => {
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['enable-copy/code.js']
    }, () => chrome.runtime.lastError);
  }, delay);
};

const removePendingFlashHostname = hostname => {
  const storage_key = {};
  storage_key[ENABLE_COPY_PENDING_FLASH_HOSTS_KEY] = [];
  chrome.storage.sync.get(storage_key, obj => {
    const pending_hostnames = obj[ENABLE_COPY_PENDING_FLASH_HOSTS_KEY] || [];
    const new_pending_hostnames = pending_hostnames.filter(item => item !== hostname);
    const new_obj = {};
    new_obj[ENABLE_COPY_PENDING_FLASH_HOSTS_KEY] = new_pending_hostnames;
    chrome.storage.sync.set(new_obj);
  });
};

const MENU_TITLES = {
  pt: 'Substituir seleção...',
  en: 'Replace selection...'
};

function setMenuTitle(lang) {
  const title = MENU_TITLES[lang] || MENU_TITLES.pt;
  chrome.contextMenus.update('if-replace-selection', { title });
}

chrome.runtime.onInstalled.addListener(details => {
  chrome.storage.sync.get('if-lang', obj => {
    const lang = obj['if-lang'] === 'en' ? 'en' : 'pt';
    chrome.contextMenus.create({
      id: 'if-replace-selection',
      title: MENU_TITLES[lang] || MENU_TITLES.pt,
      contexts: ['selection']
    });
  });

  if (details.reason === 'install') {
    chrome.tabs.create({ url: chrome.runtime.getURL('welcome.html') });
  }
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && 'if-lang' in changes) {
    setMenuTitle(changes['if-lang'].newValue === 'en' ? 'en' : 'pt');
  }
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'if-replace-selection' && tab && typeof tab.id === 'number') {
    chrome.tabs.sendMessage(tab.id, { type: 'quick-replace', text: info.selectionText }, () => {
      void chrome.runtime.lastError;
    });
  }
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg && msg.type === 'set-badge' && sender.tab && typeof sender.tab.id === 'number') {
    const text = (msg.text === '!') ? '!' : (msg.text && /^\d+$/.test(msg.text) ? msg.text : '✓');
    const color = (msg.text === '!') ? '#dc2626' : '#28a745';
    chrome.action.setBadgeText({ text, tabId: sender.tab.id });
    chrome.action.setBadgeBackgroundColor({ color, tabId: sender.tab.id });
  }
});

chrome.tabs.onUpdated.addListener((tabId, info, tab) => {
  if (info.status !== 'complete') { return; }

  const hostname = getHostname(tab.url);
  if (!hostname) { return; }

  const storage_key = {};
  storage_key[ENABLE_COPY_HOSTS_KEY] = [];
  storage_key[ENABLE_COPY_PENDING_FLASH_HOSTS_KEY] = [];
  chrome.storage.sync.get(storage_key, obj => {
    const hostnames = obj[ENABLE_COPY_HOSTS_KEY] || [];
    const pending_flash_hostnames = obj[ENABLE_COPY_PENDING_FLASH_HOSTS_KEY] || [];
    if (hostnames.indexOf(hostname) !== -1) {
      const show_flash = pending_flash_hostnames.indexOf(hostname) !== -1;
      if (show_flash) {
        removePendingFlashHostname(hostname);
      }
      executeEnableCopy(tabId, show_flash);
    }
  });
});
