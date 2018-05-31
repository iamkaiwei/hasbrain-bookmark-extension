var profile = null
var iframe = null


chrome.storage.sync.get(['bookmark_profile', 'bookmark_token', 'bookmark_refresh_token'], result => {
  if (!result.bookmark_token) {
    window.open('http://hasbrain.surge.sh/#/?extensionId='+ chrome.runtime.id)
    return
  }
  const rt_expire = jwtDecode(result.bookmark_token).exp * 1000 || 0
  const t_expire = jwtDecode(result.bookmark_refresh_token).exp * 1000 || 0

  if (new Date().getTime() > rt_expire) {
    chrome.storage.sync.remove(['bookmark_profile', 'bookmark_token', 'bookmark_refresh_token'])
    window.open('http://hasbrain.surge.sh/#/?extensionId='+ chrome.runtime.id)
    return
  }
  if (new Date().getTime() > t_expire) {
    if (document.getElementById("iframe_popup")) {
      document.getElementById("iframe_popup").remove();
    }
    if (document.getElementById("iframe_rt")) {
      document.getElementById("iframe_rt").remove();
    }
    iframe = document.createElement('iframe')
    iframe.id = 'iframe_rt'
    iframe.style.border = 'none'
    iframe.style.position = 'fixed'
    iframe.style.top = '0'
    iframe.style.right = '10px'
    iframe.style.zIndex = '10000'
    iframe.style.height = '100%'
    iframe.src = 'chrome-extension://'+(chrome.runtime.id)+'/pages/refresh_token.html'
    
    document.body.appendChild(iframe)
    return axios({
      method: 'post',
      url: 'https://userkit-identity.mstage.io/v1/tokens/refresh',
      headers: {
        'Content-type': 'application/json',
        'X-USERKIT-TOKEN': result.bookmark_refresh_token
      }
    }).then(res => {
      if (!res || res.status !== 200) {
        chrome.storage.sync.remove(['bookmark_profile', 'bookmark_token', 'bookmark_refresh_token'])
        return
      }
      const {token, refresh_token} = res.data

      chrome.storage.sync.set({
        'bookmark_token': token,
        'bookmark_refresh_token': refresh_token
      }, () => {
        setTimeout(() => {
          document.getElementById("iframe_rt").remove();
          renderPopup(result)
        }, 500)
      })
    }).catch(() => chrome.storage.sync.remove(['bookmark_profile', 'bookmark_token', 'bookmark_refresh_token']))
  }
  renderPopup(result)
})

function renderPopup (result) {
  if (document.getElementById("iframe_popup")) {
    document.getElementById("iframe_popup").remove();
  }
  if (result.bookmark_profile) {
    profile = JSON.parse(result.bookmark_profile)
    var photo = null, description = null, title = null,
      title = document.title,
      og = document.querySelector("meta[property='og:image']"),
      des = document.querySelector("meta[name='description']"),
      readingTime = document.body.innerText.split(" ").length/230,
      url = document.location.href
  
    if (og !== null) photo = og.getAttribute("content")
    else {
      var imgs = document.images;
      var size = 0
      for (var i = 0, iLen = imgs.length; i < iLen; i++) {
        var image = imgs[i]
        var size2 = image.width * image.height
        if (size2 > size) {
          photo = image.src;
          size = size2;
        }
      }
    }
  
    if (des !== null) description = des.getAttribute("content")
    if (og !== null) photo = og.getAttribute("content")
    keywords = extract_tags(document.body.innerText)
    var bookmarkData = {url, title, sourceImage: photo, shortDescription: description, tags: keywords.tags, readingTime, sourceName: 'extension'}
    
    chrome.storage.sync.set({'bookmark_data': JSON.stringify(bookmarkData)})
  
    chrome.runtime.sendMessage({
      action: "getSource",
      source: bookmarkData
    });
    
    iframe = document.createElement('iframe')
    iframe.id = 'iframe_popup'
    iframe.style.border = 'none'
    iframe.style.position = 'fixed'
    iframe.style.top = '0'
    iframe.style.right = '10px'
    iframe.style.zIndex = '10000'
    iframe.style.height = '100%'
    iframe.src = 'chrome-extension://'+(chrome.runtime.id)+'/pages/popup.html'
    
    document.body.appendChild(iframe)
  } else {
    window.open('http://hasbrain.surge.sh/#/?extensionId='+ chrome.runtime.id)
  }
}

