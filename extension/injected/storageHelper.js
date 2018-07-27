function getItemsFromStorage(keys) {
  return new Promise(function(resolve, reject) {
    chrome && chrome.storage.sync.get(keys, function(items) {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError.message);
      } else {
        resolve(items);
      }
    })
  });
}

function getProfileFromStorage() {
  return getItemsFromStorage(['bookmark_profile', 'bookmark_token', 'bookmark_hide_circle_highlight']);
}
