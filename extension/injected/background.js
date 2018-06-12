chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.tabs.executeScript(null, { file: "injected/click.js" });
});
chrome.runtime.onMessageExternal.addListener(function(
  request,
  sender,
  sendResponse
) {
  console.log(request);
  var action = request.action;
  var source = request.source || {};
  if (action === "sign-in") {
    console.log("source", source.data);
    chrome.storage.sync.set({
      bookmark_profile: JSON.stringify(source.data.profiles[0]),
      bookmark_token: source.data.token,
      bookmark_refresh_token: source.data.refresh_token
    });
  }
  if (action === "sign-out") {
    chrome.storage.sync.remove([
      "bookmark_profile",
      "bookmark_token",
      "bookmark_refresh_token"
    ]);
  }
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log(
    sender.tab
      ? "from a content script:" + sender.tab.url
      : "from the extension"
  );
  if (request.action == "remove-iframe") {
    chrome.tabs.executeScript(null, { file: "injected/remove_iframe.js" });
    sendResponse({ farewell: "da nhan dc message cua ban. goodbye" });
  }
});

chrome.tabs.onCreated.addListener(function(tab) {
  chrome.storage.sync.get(["bookmark_hide_newtab"], result => {
    if (result.bookmark_hide_newtab && tab.url === "chrome://newtab/") {
      chrome.tabs.update(tab.id, {
        url: "chrome-search://local-ntp/local-ntp.html"
      });
    }
  });
});
