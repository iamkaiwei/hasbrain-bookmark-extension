var profile = null
var iframe = null

function extract_tags(data) {
  const start_parse_time = new Date();
  const raw_words = data.match(/\w+/g) || [];

  const tags_obj = raw_words.reduce((rs, val) => {
    if (!keywordsList.has(val)) return rs;

    if (!rs[val]) rs[val] = 0;
    rs[val] += 1;
    return rs;
  }, {});

  let full_tags = Object.keys(tags_obj).map(k => ({
    name: k,
    count: tags_obj[k]
  }));

  full_tags.sort((a, b) => {
    return b.count - a.count;
  });

  const tags = full_tags.slice(0, 10).map(t => t.name);
  const parse_time = new Date() - start_parse_time;

  return { tags, parse_time };
}

chrome.storage.sync.get('bookmark_profile', result => {
  if (document.getElementById("iframe_popup")) {
    console.log('has iframe')
    document.getElementById("iframe_popup").remove();
  }
  if (result.bookmark_profile) {
    profile = JSON.parse(result.bookmark_profile)
    var photo = null, description = null, title = null,
      tit = document.querySelector("meta[name='title"),
      og = document.querySelector("meta[property='og:image']"),
      des = document.querySelector("meta[name='description']"),
      keywork = document.querySelector("meta[name='keywords']"),
      h1s = document.getElementsByTagName("h1"),
      h2s = document.getElementsByTagName("h2"),
      h3s = document.getElementsByTagName("h3"),
      readingTime = document.body.innerText.split(" ").length/230,
      h1 = [], h2 = [], h3 = [], keywords = []
    
    for(var o = 0; o < h1s.length; o++) {h1.push(h1s[o].innerText);}
    for(var j = 0; j < h2s.length; j++) {h2.push(h2s[j].innerText);}
    for(var k = 0; k < h3s.length; k++) {h3.push(h3s[k].innerText);}
    if (tit !== null ) title = tit.getAttribute("content")
    if (des !== null) description = des.getAttribute("content")
    if (og !== null) photo = og.getAttribute("content")
    // if (keywork !== null) keywords = keywork.getAttribute("content")
    // else {
    //   var src = [];
    //   var imgs = document.images;
    //   var size = 0
    //   for (var i=0, iLen=imgs.length; i<iLen; i++) {
    //     var image = imgs[i]
    //     var size2 = image.width * image.height
    //     if (size2 > size) {
    //       photo = image.src;
    //       size = size2;
    //     }
    //   }
    // }
    keywords = extract_tags(document.body.innerText)
    
    // var content = {h1, h2, h3}

    var bookmarkData = {title, sourceImage: photo, shortDescription: description, tags: keywords.tags, readingTime}
    
    chrome.storage.sync.set({'bookmark_data': JSON.stringify(bookmarkData)})

    chrome.runtime.sendMessage({
      action: "getSource",
      source: bookmarkData
    });
    
    iframe = document.createElement('iframe')
    iframe.id = 'iframe_popup'
    iframe.style.border = 'none'
    iframe.style.position = 'fixed'
    iframe.style.top = '10px'
    iframe.style.right = '10px'
    iframe.style.zIndex = '1000'
    iframe.src = 'chrome-extension://'+(chrome.runtime.id)+'/pages/popup.html'
    
    document.body.appendChild(iframe)
  } else {
    window.open('http://hasbrain.surge.sh/#/?extensionId='+ chrome.runtime.id)
  }
})
