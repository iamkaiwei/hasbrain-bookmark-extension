let baseUrl = chrome.runtime.getManifest().storage.hasBrainSiteUrl;

function openHasbrainSite() {
  return window.open(`${baseUrl}/#/get-started/?extensionId=${chrome.runtime.id}&src=extension`)
}

function removeElementById(id) {
  Element.prototype.remove = function() {
    this.parentElement.removeChild(this);
  }
  NodeList.prototype.remove = HTMLCollection.prototype.remove = function() {
    for(var i = this.length - 1; i >= 0; i--) {
      if(this[i] && this[i].parentElement) {
        this[i].parentElement.removeChild(this[i]);
      }
    }
  }
  if (document.getElementById(id)) {
    document.getElementById(id).remove();
  }
}

function renderRefreshTokenPopup() {
  removeElementById('iframe_popup')
  removeElementById('iframe_rt')
  
  const iframe = document.createElement('iframe')
  iframe.id = 'iframe_rt'
  iframe.style.border = 'none'
  iframe.style.position = 'fixed'
  iframe.style.top = '-2px'
  iframe.style.right = '10px'
  iframe.style.zIndex = '10000'
  iframe.style.height = '100%'
  iframe.src = 'chrome-extension://'+(chrome.runtime.id)+'/pages/loading.html'
  
  document.body.appendChild(iframe)
}

function renderPopup (token) {
  return getMetadata(token)
  .then(metadata => {
    const {
      photo, description, ...rest
    } = metadata;
    return {
      sourceImage: photo,
      shortDescription: description,
      ...rest,
    }
  })
  .then(bookmarkData => {
    chrome.storage.sync.set({'bookmark_data': JSON.stringify(bookmarkData)})
    const iframe = document.createElement('iframe')
    iframe.id = 'iframe_popup'
    iframe.style.border = 'none'
    iframe.style.position = 'fixed'
    iframe.style.top = '0'
    iframe.style.right = '10px'
    iframe.style.zIndex = '2147483647'
    iframe.style.height = '100%'
    iframe.style.width = '380px'
    iframe.src = 'chrome-extension://'+(chrome.runtime.id)+'/pages/popup.html'
    
    document.body.appendChild(iframe)
    window.addEventListener('click', function(e){
      const container = document.getElementById('iframe_popup')
      // console.log('ON WINDOWS CLICK CLICK', container, e.target);
      if (!container || !container.contains(e.target)) 
      {
        chrome.runtime.sendMessage({action: 'remove-iframe'})
      }
    });
  })
}

function renderBookmarkPopup() {
  return getProfileFromStorage()
  .then(result => {
    console.log('STORAGE TOKEN', result);
    const { bookmark_profile, bookmark_token, bookmark_refresh_token } = result;
    if (!bookmark_token) {
      return openHasbrainSite()
    }
    const rt_expire = jwtDecode(bookmark_token).exp * 1000 || 0
    const t_expire = jwtDecode(bookmark_refresh_token).exp * 1000 || 0

    // refresh token expired
    if (new Date().getTime() > rt_expire) {
      return removeItemsFromStorage().then(() => {
        openHasbrainSite()
      });
    }

    // refresh token is not expired, token expired
    if (new Date().getTime() > t_expire) {
      renderRefreshTokenPopup();
      return getUserkitApiClientByToken(result.bookmark_refresh_token)
      .getNewToken()
      .then(result => {
        const {token: new_bookmark_token, refresh_token} = result // res.data
        return setItemsToStorage({
          'bookmark_token': new_bookmark_token,
          'bookmark_refresh_token': refresh_token
        })
        .then(() => {
          setTimeout(() => {
            removeElementById('iframe_rt')
            renderPopup(new_bookmark_token)
          }, 500)
        })
      })
      .catch(() => removeProfileFromStorage())
    }

    removeElementById('iframe_popup')
    removeElementById('iframe_loading')

    if (bookmark_profile) {
      renderPopup(bookmark_token)
    } else {
      return openHasbrainSite()
    }
  })
}