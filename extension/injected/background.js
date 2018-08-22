chrome.browserAction.onClicked.addListener(function(tab) {
   const url = new URL(tab.url)
   const fromExtension = url.protocol === 'chrome-extension:';
   if (fromExtension) {
    const pdfFile = url.searchParams.get('file');

    let apiClient;
    if (pdfFile) {
      getProfileFromStorage()
      .then((result) => {
        const { bookmark_token, bookmark_profile, bookmark_hide_circle_highlight } = result;
        const token = bookmark_token;
        apiClient = getApiClientByToken(token);
        const data = {
          title: tab.title,
          url: pdfFile
        }
        return apiClient
        .createArticleIfNotExists(data)
        .then((result) => {
          const { recordId, isBookmarked } = result;
          return { recordId, isBookmarked }
        })
        .then(({
          recordId: articleId, isBookmarked
        }) => {
          if (isBookmarked) {
            return chrome.browserAction.setIcon({
              path: '/assets/images/hasbrain-logo-full.png',
              tabId: tab.id
            })
          }
          return apiClient.userbookmarkCreate(articleId)
          .then(() => {
            chrome.browserAction.setIcon({
              path: '/assets/images/hasbrain-logo-full.png',
              tabId: tab.id
            })
          });
        });
      });
    }
   } else {
    chrome.tabs.executeScript(null, { file: "injected/click.js" });
   }
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
      "documentUrlPatterns": ["http://*/*", "https://*/*"],
      contexts: ['selection'],
      onclick: (info) => {
        function validHighlightLength(str) {return str.length > 5 && str.length < 5000;}
        if (validHighlightLength(info.selectionText.trim())) {
          chrome.tabs.executeScript(null, { file: "injected/contextMenuHighlight.js" });
        } else {
          console.log('NOT VALID HIGHLIGHT LENGHT')
        }
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
chrome.webNavigation.onHistoryStateUpdated.addListener(handleHistoryStateUpdated, {
  url: [{
    schemes: ['http', 'https']
  }]
});

/**
 * Check if the request is a PDF file.
 * @param {Object} details First argument of the webRequest.onHeadersReceived
 *                         event. The properties "responseHeaders" and "url"
 *                         are read.
 * @return {boolean} True if the resource is a PDF file.
 */
function isPdfFile(details) {
  var header = getHeaderFromHeaders(details.responseHeaders, 'content-type');
  if (header) {
    var headerValue = header.value.toLowerCase().split(';', 1)[0].trim();
    if (headerValue === 'application/pdf') {
      return true;
    }
    if (headerValue === 'application/octet-stream') {
      if (details.url.toLowerCase().indexOf('.pdf') > 0) {
        return true;
      }
      var cdHeader =
        getHeaderFromHeaders(details.responseHeaders, 'content-disposition');
      if (cdHeader && /\.pdf(["']|$)/i.test(cdHeader.value)) {
        return true;
      }
    }
  }
}

/**
 * Get the header from the list of headers for a given name.
 * @param {Array} headers responseHeaders of webRequest.onHeadersReceived
 * @return {undefined|{name: string, value: string}} The header, if found.
 */
function getHeaderFromHeaders(headers, headerName) {
  for (var i = 0; i < headers.length; ++i) {
    var header = headers[i];
    if (header.name.toLowerCase() === headerName) {
      return header;
    }
  }
}

const getViewerURL = url => `chrome-extension://${chrome.runtime.id}/pages/viewer.html?file=${encodeURIComponent(url)}`

chrome.webRequest.onHeadersReceived.addListener(
  function(details) {
    if (details.method !== 'GET') {
      // Don't intercept POST requests until http://crbug.com/104058 is fixed.
      return;
    }
    if (!isPdfFile(details)) {
      return;
    }

    var viewerUrl = getViewerURL(details.url);

    return { redirectUrl: viewerUrl, };
  },
  {
    urls: [
      '<all_urls>'
    ],
    types: ['main_frame', 'sub_frame'],
  },
  ['blocking', 'responseHeaders']
);
