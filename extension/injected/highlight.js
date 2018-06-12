var profile = null
var isSending = false
// var trackerButton = $('<a id="tracker__button" href="javascript:;"><img src="https://image.flaticon.com/icons/svg/751/751379.svg" alt="" /> <span>Add to highlight</span></a>')
var trackerButton = $('<a id="tracker__button" href="javascript:;"><span>Add to highlight</span></a>')

function checkHighlightWhitelist () {
  return new Promise(function(resolve, reject) {
    chrome && chrome.storage.sync.get(['bookmark_profile'], function(items) {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError.message);
      } else {
        resolve(items);
      }
    })
  }).then(result => {
    if (!result || !result.bookmark_profile) return false
    const {bookmark_profile = '{}'} = result
    profile = JSON.parse(bookmark_profile)
    const domain = document.domain
    const highlight_whitelist = profile.highlight_whitelist || []
    if ( (!domain.includes('www') && highlight_whitelist.indexOf('www.' + domain) !== -1) ||
      highlight_whitelist.indexOf(domain) !== -1
    ) return true
    return false
  }).then(res => res)
}

async function renderBtnHighlight (e) {
  var showBtn = await checkHighlightWhitelist()
  if (!showBtn) return
  $('body').append(trackerButton)
  // $(trackerButton).find('span').text('Add to highlight')
  var selection = $.trim(getSelected().toString());
  $(trackerButton).css('display', 'none');
  if (isDict(selection.toString())) {
    $(trackerButton)
      .css('display', 'none').css({
      'left': e.pageX,
      'top': e.pageY - 48,
      'display': 'flex'
    }).attr('rel', selection);
  }
}

function _renderErrorHighlight () {
  isSending = false
  $(trackerButton).find('span').text('Error...!')
  _renderInitialHighlight()
}

function _renderInitialHighlight () {
  setTimeout(function () {
    $(trackerButton).find('span').text('Add to highlight')
    $(trackerButton).removeClass('show')
    $(trackerButton).css('display', 'none');
  }, 1000)
}

$(document).ready(function (e) {
  $(this).mouseup(function (e) {
    e.stopPropagation()
    if (!profile) {
      chrome && chrome.storage.sync.get('bookmark_profile', result => {
        if (!result.bookmark_profile) return
        profile = JSON.parse(result.bookmark_profile)
        renderBtnHighlight(e)
      })
      return
    }
    renderBtnHighlight(e)
  });

  $(trackerButton).hover(
    function () {
      $(this).addClass('show')
    },
    function () {
      $(this).removeClass('show')
    }
  )

  $(trackerButton).click(function (e) {
    e.stopPropagation()
    if (!isSending) {
      $(trackerButton).find('span').text('Adding...')
      isSending = true
      var photo = null, description = null,
        og = document.querySelector("meta[property='og:image']"),
        des = document.querySelector("meta[name='description']"),
        keywork = document.querySelector("meta[name='keywords']"),
        title = document.querySelector("title").innerText,
        h1s = document.getElementsByTagName("h1"),
        h2s = document.getElementsByTagName("h2"),
        h3s = document.getElementsByTagName("h3"),
        readingTime = document.body.innerText.split(" ").length / 230,
        url = document.location.href,
        highlight = $(this).attr('rel'),
        h1 = [], h2 = [], h3 = [], keywords = null

      for (var o = 0; o < h1s.length; o++) {h1.push(h1s[o].innerText);}
      for (var j = 0; j < h2s.length; j++) {h2.push(h2s[j].innerText);}
      for (var k = 0; k < h3s.length; k++) {h3.push(h3s[k].innerText);}
      if (des !== null) description = des.getAttribute("content")
      if (og !== null) photo = og.getAttribute("content")
      // if (keywork !== null) keywords = keywork.getAttribute("content")
      // else {
      //   var src = [];
      //   var imgs = document.images;
      //   var size = 0
      //   for (var i = 0, iLen = imgs.length; i < iLen; i++) {
      //     var image = imgs[i]
      //     var size2 = image.width * image.height
      //     if (size2 > size) {
      //       photo = image.src;
      //       size = size2;
      //     }
      //   }
      // }
      keywords = extract_tags(document.body.innerText)

      // const content = {h1, h2, h3}

      const data = {
        title,
        url,
        sourceImage: photo,
        shortDescription: description,
        tags: keywords.tags,
        readingTime
      }
      var bookmarkToken = ''
      var bookmarkData = data      
      chrome && chrome.storage.sync.get('bookmark_token', result => {
        bookmarkToken = result.bookmark_token
        axios.post(
          "https://contentkit-api.mstage.io/graphql",
          JSON.stringify({
            query: `
              mutation ($record: CreateOnearticletypeInput!) {
                user{
                  articleCreateIfNotExist(record: $record) {
                    recordId
                  }
                }
              }
            `,
            variables: {
              record: bookmarkData
            }
          }), {
          headers: {
            'Content-type': 'application/json',
            'authorization': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcm9qZWN0SWQiOiI1YWRmNzRjNzdmZjQ0ZTAwMWViODI1MzkiLCJpYXQiOjE1MjQ1OTM4NjN9.Yx-17tVN1hupJeVa1sknrUKmxawuG5rx3cr8xZc7EyY',
            'usertoken': bookmarkToken
          }
        }).then((res) => {
          if (res.status !== 200) {
            _renderErrorHighlight()
            return
          }
          const result = res.data
          if (!result || result.errors) {
            _renderErrorHighlight()
            return
          }
          const {data: {user: {articleCreateIfNotExist: {recordId}}}} = result
          // console.log('record', recordId)
          axios.post(
            "https://contentkit-api.mstage.io/graphql",
            JSON.stringify({
              query: `
                mutation{
                  user{
                    userhighlightCreate(record:{
                      articleId: "${recordId}",
                      highlight: "${highlight}"
                    }) {
                      recordId
                    }
                  }
                }
              `
            }), {
            headers: {
              'Content-type': 'application/json',
              'authorization': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcm9qZWN0SWQiOiI1YWRmNzRjNzdmZjQ0ZTAwMWViODI1MzkiLCJpYXQiOjE1MjQ1OTM4NjN9.Yx-17tVN1hupJeVa1sknrUKmxawuG5rx3cr8xZc7EyY',
              'usertoken': bookmarkToken
            }
          }).then((res) => {
            // console.log('resssssssssssss', res)
            if (res.status !== 200) {
              _renderErrorHighlight()
              return
            }
            const result = res.data
            if (!result || result.errors) {
              _renderErrorHighlight()
              return
            }
            $(trackerButton).find('span').text('Success!')
            isSending = false
            _renderInitialHighlight()
          }).catch(() => {
            _renderErrorHighlight()
          })
        }).catch(() => {
          _renderErrorHighlight()
        })
      })
    }
  })

  chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    if (msg.from === 'popup' && msg.method === 'ping') {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
         chrome.tabs.sendMessage(tabs[0].id, {
          from: 'event',
          method:'ping'}, function(response) {
            sendResponse(response.data);
        });
      });
      return true; // <-- Indicate that sendResponse will be async
    }
  });
})

function isDict(str) {return str.length > 0 && str.length < 50000;}

function getSelected() {
  if (window.getSelection) return window.getSelection();
  else if (document.getSelection) return document.getSelection();
  else {
    var selection = document.selection && document.selection.createRange();
    if (selection.text) return selection.text;
    return false;
  }
  return false;
}

function elementContainsSelection(el) {
  var sel;
  if (window.getSelection) {
    sel = window.getSelection();
    if (sel.rangeCount > 0) {
      for (var i = 0; i < sel.rangeCount; ++i) {
        if (!isOrContains(sel.getRangeAt(i).commonAncestorContainer, el)) {
          return false;
        }
      }
      return true;
    }
  } else if ((sel = document.selection) && sel.type != "Control") {
    return isOrContains(sel.createRange().parentElement(), el);
  }
  return false;
}

function isOrContains(node, container) {
  while (node) {
    if (node === container) {
      return true;
    }
    node = node.parentNode;
  }
  return false;
}

