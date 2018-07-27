var profile = null
var hideCircle = false
var token = ''

var isSending = false

var articleId = ''

var currentPositionBtn = {}

// controls
const wrapper = $('<div id="tracker__wrapper"></div>')
const tracker__buttons = $('<div class="tracker__buttons"></div>')
const highlightButton = $(`<a id="tracker__button" href="javascript:;" title="Highlight"><span>${highlightIcon}</span></a>`)

function getHighlighter() {
  if (!window.minhhienHighlighter) {
    window.minhhienHighlighter = new window.HighlightHelper();
  }
  return window.minhhienHighlighter
}


window.minhhienSelection = null;
window.readyForHighlight = false;

// add button highlight  to wrapper
tracker__buttons
  .append(highlightButton)

wrapper.append(tracker__buttons)

var stopMouseUp = false

function checkHidingCircleHighlight () {
  return loadProfileToGlobal()
  .then(() => !!hideCircle)
}

async function renderBtnHighlight () {
  saveSelection()
  var hideCircle = await checkHidingCircleHighlight()
  if (hideCircle) return

  _renderInitialHighlight()
  $('body').append(wrapper)

  var selection = $.trim(getSelected().toString());
  $(wrapper).css('display', 'none');
  if (isDict(selection.toString())) {

    const range =  document.getSelection().getRangeAt(0);
    const boundingRect = range.getBoundingClientRect() 
    
    const topOffset = boundingRect.top > 0 ? boundingRect.top + (boundingRect.height / 2) : boundingRect.bottom / 2
    const top = window.scrollY + topOffset
    currentPositionBtn = {
      top: top - 22,
      right: ($(document).width() - boundingRect.right) / 2
    }
    $(wrapper)
      .css('display', 'none').css({
      ...currentPositionBtn,
      display: 'block',
      'z-index': 1000
    })
  }
}

function _renderErrorHighlight () {
  isSending = false
  $(highlightButton).find('span').html('').append(errorIcon)
}

function _renderInitialHighlight () {
  $(highlightButton).find('span').html('').append(highlightIcon)
}

function _renderSuccessHighlight () {
  $(highlightButton).find('span').html('').append(successHighlightIcon)
}

function _renderErrorPost () {
  setTimeout(() => {
    _renderInitialPost()
  }, 1500)
}

function _renderInitialPost () {
  isSending = false
}

function getMetadata() {
  var photo = null, description = null,
    og = document.querySelector("meta[property='og:image']"),
    des = document.querySelector("meta[name='description']"),
    title = document.querySelector("title").innerText,
    h1s = document.getElementsByTagName("h1"),
    h2s = document.getElementsByTagName("h2"),
    h3s = document.getElementsByTagName("h3"),
    readingTime = document.body.innerText.split(" ").length / 230,
    url = document.location.href,
    h1 = [], h2 = [], h3 = []

  for (var o = 0; o < h1s.length; o++) {h1.push(h1s[o].innerText);}
  for (var j = 0; j < h2s.length; j++) {h2.push(h2s[j].innerText);}
  for (var k = 0; k < h3s.length; k++) {h3.push(h3s[k].innerText);}
  if (des !== null) description = des.getAttribute("content")
  if (og !== null) photo = og.getAttribute("content")
  return {
    url, readingTime, title, photo, description
  }
}

function postHighlight ({ core, prev, next, serialized }) {
  if (isSending) return
  $(highlightButton).find('span').html('').append(loadingIcon)
  isSending = true
  
  const {
    url, readingTime, title, photo, description
  } = getMetadata()

  const data = {
    title,
    url,
    sourceImage: photo,
    shortDescription: description,
    readingTime
  }
  return getApiClientByToken(token)
  .createArticleIfNotExists(data)
  .then((res) => {
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
    articleId = recordId
    const highlightObject = { core, prev, next, serialized }

    return getApiClientByToken(token)
    .addOrUpdateHighlight(articleId, highlightObject)
    .then((res) => {
      if (res.status !== 200) {
        _renderErrorHighlight()
        return null
      }
      const result = res.data
      if (!result || result.errors) {
        _renderErrorHighlight()
        return result
      }
      isSending = false
      _renderSuccessHighlight()
      $(wrapper).hide()
      return result
    }).catch(() => {
      _renderErrorHighlight()
    })
  }).catch(() => {
    _renderErrorHighlight()
  })
}


function saveSelection() {
  // console.log('SAVE SELECTION BEFORE HANDLE OF ON CLICK EVENT')
  if (window.getSelection().toString()) {
    window.minhhienSelectionRange = window.getSelection().getRangeAt(0).cloneRange();
  }
}

function restoreOldSelection() {
  const selection = window.getSelection();
  const oldRange = window.minhhienSelectionRange;
  selection.removeAllRanges();
  selection.addRange(oldRange);
}

function removeHighlight(highlightId) {
  return getApiClientByToken(token).removeHighlight(articleId, highlightId);
}

const renderHighlightCircleFromAnchor = highlightData =>  anchor => {
  const { range, highlights } = anchor;
  const getOffsetRect = (elements) => {
    const rects = elements.map(ele => $(ele).offset());
    return rects.reduce(function(acc, r) {
      return {
        top: Math.min(acc.top, r.top),
        left: Math.min(acc.left, r.left),
      };
    });
  }
  if(!anchor.range) return
  const boundingRect = anchor.range.getBoundingClientRect()
  const offset = getOffsetRect(highlights) // $(range.startContainer.parentNode).offset()
  const width = $(range.startContainer.parentNode).width()
  const height = boundingRect.height
  const textQuoteSelector = anchor.target.selector.find(({ type }) => type === "TextQuoteSelector");
  const currentHighlight = highlightData.find(({ prev, core, next }) => prev === textQuoteSelector.prefix && core === textQuoteSelector.exact && next === textQuoteSelector.suffix);
  if (!currentHighlight) {
    console.warn('CAN NOT FIND HIGHLIGHT FROM SELECTOR', textQuoteSelector)
  }
  const highlightDataId = (currentHighlight && currentHighlight._id);
  const wrapper = $(`<div id="minhhien__highlight__${highlightDataId}" class="highlight__circle-wrapper"></div>`)
  const { top, left } = offset;
  $(wrapper)
    .css('display', 'block').css({
      position: 'absolute',
    'left': width + left + 20, // ($(document).width() - offset.width) / 2,
    'top': top + height / 2 - 28,// offset.offset.top + (dimension.height / 2),
    'display': 'block',
    'z-index': 1000
  })

  const highlightCircle = $(`<div class="highlight__circle "></div>`)

  $(highlightCircle).on('click', function() {
    if (!highlightDataId) return
    console.log('highlightData', currentHighlight)
    if ($(this).hasClass('highlight__circle--outline')) {
      getApiClientByToken(token).addOrUpdateHighlight(articleId, currentHighlight).then(res => {
        if (res.status !== 200) {
          return
        }
        const result = res.data
        if (!result || result.errors) return
        $(this).removeClass('highlight__circle--outline')
      })
      return
    }
    removeHighlight(highlightDataId).then(res => {
      if (res.status !== 200) {
        return
      }
      const result = res.data
      if (!result || result.errors) return
      $(this).addClass('highlight__circle--outline')
    })
  });
  $(wrapper).append(highlightCircle)
  $('body').append(wrapper)
}

function restoreOldHighlight(url) {
  // console.log('GET OLD HIGHLIGHT')
  getApiClientByToken(token).getOldHighlight(url)
    .then((res) => {
      // console.log('resssssssssssss', res)
      if (res.status !== 200) {
        // _renderErrorHighlight()
        _renderErrorPost()
        return
      }
      const result = res.data
      if (!result || result.errors) {
        // _renderErrorHighlight()
        _renderErrorPost()
        return
      }
      // console.log('GET OLD HIGHLIGHT SUCESS', result);
      const articleUserAction = result.data.viewer.articleUserAction;
      articleId = articleUserAction._id
      const highlightData = articleUserAction && articleUserAction.userHighlightData && articleUserAction.userHighlightData.highlights;
      const oldHighlight = highlightData && highlightData.length
      const targets = oldHighlight && highlightData.map(({ core, prev, next, serialized }) => ({
        source: url,
        selector: JSON.parse(serialized)
      }))
      // console.log('TARGETS TO RESTORE', targets);
      if (targets.length) {
        const highlightHelper = getHighlighter();
        setTimeout(() => highlightHelper.restoreHighlightFromTargets(targets).then(() => {
          const anchors = highlightHelper.getAnchors();
          anchors.forEach(renderHighlightCircleFromAnchor(highlightData));
          
        }), 2000); // delay to restore highlight after medium highlight their own
      }
      window.readyForHighlight = true;

      // change icon extension
      const {userBookmarkData} = articleUserAction
      userBookmarkData && userBookmarkData.contentId && chrome.runtime.sendMessage({ action: 'change-icon' })
    }).catch((error) => {
      console.log('CAN NOT RESTORE OLD HIGHLIGHT', error);
      _renderErrorPost()
      window.readyForHighlight = true;
    });
}

function loadProfileToGlobal() {
  return getProfileFromStorage()
  .then((result) => {
    const { bookmark_token, bookmark_profile, bookmark_hide_circle_highlight } = result;
    token = bookmark_token;
    profile = bookmark_profile && JSON.parse(bookmark_profile);
    hideCircle = bookmark_hide_circle_highlight;
    return Promise.resolve(result);
  });
}

function handleMouseupToRenderHighlightCircle(e) {
  if (!window.readyForHighlight || stopMouseUp) {
    return;
  }
  e.stopPropagation()
  return loadProfileToGlobal()
  .then(() => renderBtnHighlight());
}

function handleCreateHighlight(e) {
  e.stopPropagation()
  restoreOldSelection()

  const highlightHelper = getHighlighter();
  const selection = document.getSelection()

  if (!highlightHelper.canCreateHighlightFromSelection(selection)) {
    return
  }
  highlightHelper.saveRangeBeforeCreateHighlight(selection);
  highlightHelper.createHighlight().then(result => {
    if (result.length) {
      const anchor = result[0];
      if (anchor && anchor.target && anchor.target.selector) {
        const textQuoteSelector = anchor.target.selector.find(({ type }) => type === "TextQuoteSelector");
        if (textQuoteSelector) {
          postHighlight ({ 
            core: textQuoteSelector.exact,
            prev: textQuoteSelector.prefix,
            next: textQuoteSelector.suffix,
            serialized: JSON.stringify(anchor.target.selector)
          })
          .then(result => {
            const highlightData = result.data.user.userhighlightAddOrUpdateOne.record.highlights
            renderHighlightCircleFromAnchor(highlightData)(anchor)
          })
        }
      }
    }
  });
}

$(document).ready(function (e) {
  const url = document.location.href;
  loadProfileToGlobal()
  .then(() => restoreOldHighlight(url, token))
  $(this).mouseup(handleMouseupToRenderHighlightCircle);
  $(wrapper).hover(
    e => {
      stopMouseUp = true
    },
    e => {
      stopMouseUp = false
    }
  )

  $(highlightButton).click(handleCreateHighlight)

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
