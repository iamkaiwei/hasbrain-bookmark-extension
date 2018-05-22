var profile = null
var iframe = null


chrome.storage.sync.get('bookmark_profile', result => {
  if (document.getElementById("iframe_popup")) {
    // console.log('has iframe')
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
    var bookmarkData = {url, title, sourceImage: photo, shortDescription: description, tags: keywords.tags, readingTime}
    
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
})

