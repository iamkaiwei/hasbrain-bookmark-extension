
(function onPageLoad() {
  const url = document.location.href;
  loadProfileToGlobal()
    .then(() => restoreOldHighlight(url))
})()