const getUrlFromHref = (href) => {
  const url = new URL(href);
  if (url.protocol === 'chrome-extension:') return url.searchParams.get('file'); // pdf
  return href;
}

function getMetadata() {
  var photo = null, description = null, title = null
    og = document.querySelector("meta[property='og:image']"),
    des = document.querySelector("meta[name='description']") || document.querySelector("meta[name='og:description']"),
    titleTag = document.querySelector("title") || document.querySelector("og:title"),
    h1s = document.getElementsByTagName("h1"),
    h2s = document.getElementsByTagName("h2"),
    h3s = document.getElementsByTagName("h3"),
    readingTime = document.body.innerText.split(" ").length / 230,
    url = getUrlFromHref(document.location.href),
    h1 = [], h2 = [], h3 = []

  for (var o = 0; o < h1s.length; o++) {h1.push(h1s[o].innerText);}
  for (var j = 0; j < h2s.length; j++) {h2.push(h2s[j].innerText);}
  for (var k = 0; k < h3s.length; k++) {h3.push(h3s[k].innerText);}
  if (des !== null) description = des.getAttribute("content")
  if (og !== null) photo = og.getAttribute("content")
  if (titleTag) title = titleTag.innerText
  return {
    url, readingTime, title, photo, description
  }
}