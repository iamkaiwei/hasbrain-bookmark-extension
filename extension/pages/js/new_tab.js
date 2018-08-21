chrome.tabs.getCurrent(function (tab) {
  chrome.tabs.update(tab.id, {
    "url": "http://pin.hasbrain.com",
    "highlighted": true
  });
});