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


let bookmark_hide_newtab = false

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log(
    sender.tab
      ? "from a content script:" + sender.tab.url
      : "from the extension"
  );
  sendResponse({message: 'get message'})
  if (request.action == "remove-iframe") {
    chrome.tabs.executeScript(null, { file: "injected/remove_iframe.js" });
    sendResponse({ farewell: "da nhan dc message cua ban. goodbye" });
  }

  if (request.action === 'hide-homepage') {
    bookmark_hide_newtab = request.result
  }

  if (request.action === 'change-icon') {
    console.log('sender', sender)
    chrome.browserAction.setIcon({
      path: '/assets/images/hasbrain-logo-full.png',
      tabId: sender.tab.id
    })
  }

  if (request.action === 'change-icon-outline') {
    chrome.browserAction.setIcon({
      path: '/assets/images/hasbrain-logo-outline.png',
      tabId: sender.tab.id
    })
  }

  if (request.action === 'bookmark-update-context-menu') {
    chrome.storage.sync.get(['bookmark_hide_context_menu'], result => {
      chrome.contextMenus.update('hasBrainHighlight', {
        visible: !(result.bookmark_hide_context_menu)
      })
    })
  }
});

chrome.storage.sync.get(['bookmark_hide_newtab'], result => {
  bookmark_hide_newtab = result.bookmark_hide_newtab
})

chrome.tabs.onCreated.addListener(function(tab) {
  if (!bookmark_hide_newtab && tab.url === 'chrome://newtab/') {
    chrome.tabs.update(tab.id, {
      // url: `chrome-extension://${chrome.runtime.id}/homepage/index.html`
      url: `http://pin.hasbrain.com/#/`
    })
  }
})

// chrome.tabs.onActivated.addListener(tab => {
//   chrome.tabs.get(tab.tabId, tabInfo => {
//     chrome.storage.sync.get(['hasbrain_bookmark_list'], result => {
//       const list = result.hasbrain_bookmark_list || ''
//       list.includes(tabInfo.url) && chrome.browserAction.setIcon({
//         path: '/assets/images/hasbrain-logo-full.png',
//         tabId: tabInfo.id
//       })
//     })
//   })
// })

const registerContextMenu = () => {
  chrome.storage.sync.get(['bookmark_hide_context_menu'], result => {
    chrome.contextMenus.create({
      id: 'hasBrainHighlight',
      visible: !(!!result.bookmark_hide_context_menu),
      title: 'Highlight it',
      contexts: ['selection'],
      onclick: () => {
        console.log('MINHHIEN', window.getSelection().toString())
        chrome.tabs.executeScript(null, { file: "injected/minhhien-highlight.js" });
      }
    })
  })
}

chrome.runtime.onInstalled.addListener(registerContextMenu)
chrome.runtime.onStartup.addListener(registerContextMenu)

const handleHistoryStateUpdated = function(details) {
  console.log("I AM CALLED DDDDDDD")
  console.log('Page uses History API and we heard a pushSate/replaceState.', details);
  chrome.tabs.executeScript(null, { file: "injected/onPageLoad.js" });
}


// dont know why onHistoryStateUpdated is call TWICE every url updated 
chrome.webNavigation.onHistoryStateUpdated.addListener(handleHistoryStateUpdated);



// chrome.webNavigation.onBeforeNavigate.addListener(() => console.log('onBeforeNavigate'))
// chrome.webNavigation.onCommitted.addListener(() => console.log('onCommitted'))
// chrome.webNavigation.onDOMContentLoaded.addListener(() => console.log('onDOMContentLoaded'))
// chrome.webNavigation.onCompleted.addListener(() => console.log('onCompleted'))
// chrome.webNavigation.onErrorOccurred.addListener(() => console.log('onErrorOccurred'))
// chrome.webNavigation.onCreatedNavigationTarget.addListener(() => console.log('onCreatedNavigationTarget'))
// chrome.webNavigation.onReferenceFragmentUpdated.addListener(() => console.log('onReferenceFragmentUpdated'))
// chrome.webNavigation.onTabReplaced.addListener(() => console.log('onTabReplaced'))
// chrome.webNavigation.onHistoryStateUpdated.addListener(() => console.log('onHistoryStateUpdated'))
