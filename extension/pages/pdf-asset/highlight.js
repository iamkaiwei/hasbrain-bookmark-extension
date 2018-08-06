const wrapper = $(`<div id="minhhien__highlight__I_AM_NEW_HAHA" class="highlight__circle-wrapper"></div>`)
const newHighlightCircle = $(`<div class="highlight__circle"></div>`)
wrapper.append(newHighlightCircle)

var profile = null
var hideCircle = false
var token = ''

var articleId = ''

var isSending = false

var originalUrl = null

let shouldPopup = false

const HIGHLIGHT_CIRCLE_WIDTH = 22
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

// function getMetadata() {
//   var photo = null, description = null, title = null
//     og = document.querySelector("meta[property='og:image']"),
//     des = document.querySelector("meta[name='description']") || document.querySelector("meta[name='og:description']"),
//     titleTag = document.querySelector("title") || document.querySelector("og:title"),
//     h1s = document.getElementsByTagName("h1"),
//     h2s = document.getElementsByTagName("h2"),
//     h3s = document.getElementsByTagName("h3"),
//     readingTime = document.body.innerText.split(" ").length / 230,
//     url = originalUrl,
//     h1 = [], h2 = [], h3 = []

//   for (var o = 0; o < h1s.length; o++) {h1.push(h1s[o].innerText);}
//   for (var j = 0; j < h2s.length; j++) {h2.push(h2s[j].innerText);}
//   for (var k = 0; k < h3s.length; k++) {h3.push(h3s[k].innerText);}
//   if (des !== null) description = des.getAttribute("content")
//   if (og !== null) photo = og.getAttribute("content")
//   if (titleTag) title = titleTag.innerText
//   return {
//     url, readingTime, title, photo, description
//   }
// }

function _renderErrorHighlight () {
  isSending = false
  // $(highlightButton).find('span').html('').append(errorIcon)
}

function _renderSuccessHighlight () {
  // $(highlightButton).find('span').html('').append(successHighlightIcon)
}

function postHighlight ({ core, prev, next, serialized }) {
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
  .then((result) => {
    const { recordId } = result;
    articleId = recordId;

    const highlightObject = { core, prev, next, serialized, isPublic: false }

    return getApiClientByToken(token)
    .addOrUpdateHighlight(articleId, highlightObject)
    .then((responseData) => {
      isSending = false
      _renderSuccessHighlight()
      $(wrapper).hide()
      return responseData
    }).catch(() => {
      _renderErrorHighlight()
    })
  }).catch(() => {
    _renderErrorHighlight()
  })
}

function handleCreateHighlight(e) {
  $(newHighlightCircle).removeClass('highlight__circle--outline')
  e.stopPropagation()
  window.readyForHighlight = false;
  restoreOldSelection()

  const highlightHelper = getHighlighter();
  const selection = document.getSelection()

  // if (!highlightHelper.canCreateHighlightFromSelection(selection)) {
  //   return
  // }

  // highlightHelper.saveRangeBeforeCreateHighlight(selection);
  highlightHelper.createHighlight().then(result => {
    console.log('AFTER CREATE HIGHLIGHT', result)
    if (result.length) {
      window.getSelection().empty()
      const anchor = result[0];
      if (anchor && anchor.target && anchor.target.selector) {
        const textQuoteSelector = anchor.target.selector.find(({ type }) => type === "TextQuoteSelector");
        if (textQuoteSelector) {
          console.log('TRGIGER POST HIHGLIGHT')
          postHighlight ({ 
            core: textQuoteSelector.exact,
            prev: textQuoteSelector.prefix,
            next: textQuoteSelector.suffix,
            serialized: JSON.stringify(anchor.target.selector)
          })
          .then(result => {
            console.log('POST HIGHLIGH RESULT', result);
            window.readyForHighlight = true;
          })
        }
      }
    }
  });
}

function getHighlighter() {
  return window.pdfminhhienHighlighter
}

async function renderBtnHighlight () {
  console.log('I AM MOUSE UP HIGHLIGHT')
  saveSelection()
  // var hideCircle = await checkHidingCircleHighlight()
  // if (hideCircle) return


  // isSending = false
  // const highlightDataId = 'I_AM_NEW_HAHA';
  // const wrapper = $(`<div id="minhhien__highlight__${highlightDataId}" class="highlight__circle-wrapper"></div>`)
  $(wrapper).css({
    display: 'none'
  })
  if (!window.getSelection().toString()) return;

  const range =  document.getSelection().getRangeAt(0);
  const boundingRect = range.getBoundingClientRect();
  const topOffset = boundingRect.top > 0 ? boundingRect.top + (boundingRect.height / 2) : boundingRect.bottom / 2
  const top = window.scrollY + topOffset
  currentPositionBtn = {
    top: top - HIGHLIGHT_CIRCLE_WIDTH / 2,
    left: boundingRect.width + boundingRect.left + 20// ($(document).width() - boundingRect.right) / 2
  }
  $(newHighlightCircle).addClass('highlight__circle--outline')
  $(wrapper).css({
    ...currentPositionBtn,
    position: 'absolute',
    display: 'block',
    'z-index': 1000
  })
}

function restoreOldHighlight(url) {
  if (window.restoringHighlight) return;
  console.log('RESTORING OLD HIGHLIGHT');

  function _renderRestoreOldHighlightError () {
    isSending = false;
    console.log('CAN NOT RESTORE OLD HIHGLIGHT')
  }

  getApiClientByToken(token).getOldHighlight(url)
    .then((articleUserAction) => {
      console.log('OLD HIHGLIHGT', articleUserAction);
      isSending = false;
      window.readyForHighlight = true;
      
      const { userBookmarkData: bookmarkData, userHighlightData } = articleUserAction;
      // const bookmarkData = articleUserAction && articleUserAction.userBookmarkData
      shouldPopup = !bookmarkData || !bookmarkData.contentId
      // console.log('SHOULD POPUP', shouldPopup)
      articleId = articleUserAction._id
      const highlightData = userHighlightData && userHighlightData.highlights;
      const hasOldHighlights = highlightData && highlightData.length
      const targets = (hasOldHighlights && highlightData.map(({ core, prev, next, serialized, _id }) => ({
        _id,
        source: url,
        selector: JSON.parse(serialized),
      }))) || []
      // change icon extension
      
      if (bookmarkData && bookmarkData.contentId) {
        console.log('CHAnGE ICON ')
        chrome.runtime.sendMessage({ action: 'change-icon' })
      } else {
        console.log('CHAnGE ICON OUTLINE')
        chrome.runtime.sendMessage({ action: 'change-icon-outline' })
      }

      // console.log('TARGETS TO RESTORE', targets);
      if (targets.length) {
        const highlightHelper = getHighlighter();
        highlightHelper.restoreHighlightFromTargets(targets)
      }
    }).catch((error) => {
      console.log('CAN NOT RESTORE OLD HIGHLIGHT', error);
      window.readyForHighlight = true;
      return _renderRestoreOldHighlightError();
    });
}

$(window).on('load', () => {
  originalUrl = (new URL(document.location.href)).searchParams.get('file');
  console.log('I AM LOADED', originalUrl);
  $(newHighlightCircle).click(handleCreateHighlight)
  $(wrapper).css({
    display: 'none'
  })
  $('body').append(wrapper);
  
  setTimeout(() => {
    window.pdfminhhienHighlighter = new window.PdfHighlighterHelper();
    loadProfileToGlobal()
    .then(() => {
      restoreOldHighlight(originalUrl);
    });
    $(window).mouseup(() => {
      return loadProfileToGlobal()
      .then(() => {
        renderBtnHighlight();
      });
    })
  }, 1000);
  
});