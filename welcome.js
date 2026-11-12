const TEXT = {
  pt: 'Idioma salvo. Você já pode fechar esta página.\nLanguage saved. You can close this page.',
  en: 'Idioma salvo. Você já pode fechar esta página.\nLanguage saved. You can close this page.'
};

document.querySelectorAll('[data-lang]').forEach(button => {
  button.addEventListener('click', () => {
    const lang = button.dataset.lang;
    chrome.storage.sync.set({ 'if-lang': lang }, () => {
      const text = TEXT[lang];
      document.documentElement.lang = lang === 'en' ? 'en' : 'pt-BR';
      document.getElementById('description').textContent = text;
      document.querySelectorAll('[data-lang]').forEach(item => { item.disabled = true; });
      setTimeout(() => window.close(), 700);
    });
  });
});
