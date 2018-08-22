let baseUrl = chrome.runtime.getManifest().storage.hasBrainSiteUrl;

chrome.tabs.getCurrent(function (tab) {
  chrome.tabs.update(tab.id, {
    "url": baseUrl,
    "highlighted": true
  });
});