const getUrlFromHref = (href) => {
  const url = new URL(href);
  if (url.protocol === 'chrome-extension:') return url.searchParams.get('file'); // pdf
  return href;
}

function getMetadata(token) {
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
  return getYoutubeMetadata(url, token)
  .then(youtubeDataIfValid => ({
    url, readingTime, title, photo, description,
    kind: ARTICLE_TYPE, // kind will be overridden to video if valid youtube
    ...youtubeDataIfValid,
  }));
}

function youtube_parser(url){
  var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
  var match = url.match(regExp);
  return (match&&match[7].length==11)? match[7] : false;
}

const ARTICLE_TYPE = 'articletype';
const VIDEO_TYPE = 'videotype';

function getYoutubeMetadata(url, token) {
  return getApiClientByToken(token).getYoutubeData({videoId: youtube_parser(url) || ''})
  .then(videoData => {
    if (videoData.title) {
      return {
        ...videoData,
        kind: VIDEO_TYPE
      }
    }
    return {};
  })
  .catch(err => {
    console.log(err)
    return {}
  })
}