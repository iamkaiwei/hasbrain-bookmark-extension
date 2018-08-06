function openHasbrainSite() {
  return window.open(`http://pin.hasbrain.com/#/get-started/?extensionId=${chrome.runtime.id}&src=extension`)
}

function removeElementById(id) {
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

function renderPopup () {
  const {
    url, readingTime, title, photo, description
  } = getMetadata()

  const bookmarkData = {
    title,
    url,
    sourceImage: photo,
    shortDescription: description,
    readingTime
  }

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
    console.log('ON WINDOWS CLICK CLICK', container, e.target);
    if (!container || !container.contains(e.target)) 
    {
      chrome.runtime.sendMessage({action: 'remove-iframe'})
    }
  });
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
        const {token, refresh_token} = result // res.data
        return setItemsToStorage({
          'bookmark_token': token,
          'bookmark_refresh_token': refresh_token
        })
        .then(() => {
          setTimeout(() => {
            removeElementById('iframe_rt')
            renderPopup(result)
          }, 500)
        })
      })
      .catch(() => removeProfileFromStorage())
    }

    removeElementById('iframe_popup')
    removeElementById('iframe_loading')

    if (bookmark_profile) {
      renderPopup()
    } else {
      return openHasbrainSite()
    }
  })
}