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

function setItemsToStorage(object) {
  return new Promise(function(resolve, reject) {
    chrome && chrome.storage.sync.set(object, function() {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError.message);
      } else {
        resolve('SUCCESS');
      }
    })
  });
}

function removeItemsFromStorage(keys) {
  return new Promise(function(resolve, reject) {
    chrome && chrome.storage.sync.remove(keys, function(items) {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError.message);
      } else {
        resolve(items);
      }
    })
  });
}

function getOptionsFromStorage() {
  return getItemsFromStorage(['bookmark_hide_circle_highlight', 'bookmark_hide_newtab', 'bookmark_hide_context_menu']);
}

function getProfileFromStorage() {
  return getItemsFromStorage(['bookmark_profile', 'bookmark_token', 'bookmark_refresh_token']);
}

function removeProfileFromStorage() {
  return removeItemsFromStorage(['bookmark_profile', 'bookmark_token', 'bookmark_refresh_token']);
}
