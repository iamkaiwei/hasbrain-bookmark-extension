
(function onPageLoad() {
  const url = document.location.href;
  window.minhhienHighlighter = new window.HighlightHelper();
  loadProfileToGlobal()
    .then(() => restoreOldHighlight(url))
})()