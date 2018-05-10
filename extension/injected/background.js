chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.tabs.executeScript(null, {file: "injected/click.js"});
});
chrome.runtime.onMessageExternal.addListener(
  function(request, sender, sendResponse) {
    console.log(request)
    var action = request.action
    var source = request.source || {}
    if (action === "sign-in") {
      chrome.storage.sync.set({
        'bookmark_profile': JSON.stringify(source.data.profiles[0]),
        'bookmark_token': source.data.token,
        'bookmark_refresh_token': source.data.refresh_token,
      })
    }
    if (action === 'sign-out') {
      chrome.storage.sync.remove(['bookmark_profile', 'bookmark_token', 'bookmark_refresh_token'])
    }
  });