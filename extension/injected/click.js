var photo = null, description = null,
  og = document.querySelector("meta[property='og:image']"),
  des = document.querySelector("meta[name='description']"),
  keywork = document.querySelector("meta[name='keywords']"),
  h1s = document.getElementsByTagName("h1"),
  h2s = document.getElementsByTagName("h2"),
  h3s = document.getElementsByTagName("h3"),
  readingTime = document.body.innerText.split(" ").length/230,
  h1 = [], h2 = [], h3 = [], keywords = null

for(var o = 0; o < h1s.length; o++) {h1.push(h1s[o].innerText);}
for(var j = 0; j < h2s.length; j++) {h2.push(h2s[j].innerText);}
for(var k = 0; k < h3s.length; k++) {h3.push(h3s[k].innerText);}
if (des !== null) description = des.getAttribute("content")
if (og !== null) photo = og.getAttribute("content")
if (keywork !== null) keywords = keywork.getAttribute("content")
else {
  var src = [];
  var imgs = document.images;
  var size = 0
  for (var i=0, iLen=imgs.length; i<iLen; i++) {
    var image = imgs[i]
    var size2 = image.width * image.height
    if (size2 > size) {
      photo = image.src;
      size = size2;
    }
  }
}


chrome.runtime.sendMessage({
  action: "getSource",
  source: {photo, description, keywords, readingTime, content: {h1, h2, h3}}
});

console.log({photo, description, keywords, readingTime, content: {h1, h2, h3}});