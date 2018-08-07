const wrapper = $(`<div id="minhhien__highlight__I_AM_NEW_HAHA" class="highlight__circle-wrapper"></div>`)
const newHighlightCircle = $(`<div class="highlight__circle"></div>`)
wrapper.append(newHighlightCircle)

var profile = null
var hideCircle = false
var token = ''

var articleId = ''

var isSending = false

var originalUrl = null

window.shouldPopup = false

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
  return Promise.all([getProfileFromStorage(), getOptionsFromStorage()])
  .then(([profile, options])=> ({ ...profile, ...options }))
  .then((result) => {
    const { bookmark_token, bookmark_profile, bookmark_hide_circle_highlight } = result;
    token = bookmark_token;
    profile = bookmark_profile && JSON.parse(bookmark_profile);
    hideCircle = bookmark_hide_circle_highlight;
    return Promise.resolve(result);
  });
}

function _renderErrorHighlight () {
  
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
  })
  .then((responseData) => {
    isSending = false
    $(wrapper).hide()
    return responseData
  })
  .catch(() => {
    isSending = false
  })
}

function handleCreateHighlight(e) {
  $(newHighlightCircle).removeClass('highlight__circle--outline')
  e.stopPropagation()
  window.readyForHighlight = false;
  restoreOldSelection()

  const highlightHelper = getHighlighter();
  highlightHelper.createHighlight().then(result => {
    if (result.length) {
      window.getSelection().empty()
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
            console.log('POST HIGHLIGH RESULT', result);
            console.log('IN HIHGLIGHT AFTER', window.shouldPopup)
            if (window.shouldPopup) {
              renderBookmarkPopup();
              window.shouldPopup = false
            }
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
  saveSelection();
  $(wrapper).hide();
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
  isSending = true;
  getApiClientByToken(token).getOldHighlight(url)
    .then((articleUserAction) => {
      isSending = false;
      window.readyForHighlight = true;
      
      const { userBookmarkData: bookmarkData, userHighlightData } = articleUserAction;
      // const bookmarkData = articleUserAction && articleUserAction.userBookmarkData
      
      window.shouldPopup = !bookmarkData || !bookmarkData.contentId
      console.log('SHOULD POPUP', window.shouldPopup)

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
      isSending = false;
    });
}

$(window).on('load', () => {
  originalUrl = (new URL(document.location.href)).searchParams.get('file');
  console.log('I AM LOADED', originalUrl);
  $(newHighlightCircle).click(handleCreateHighlight);
  $(wrapper).hide();
  $('body').append(wrapper);

  window.shouldPopup = true
  
  setTimeout(() => {
    document.addEventListener('textlayerrendered', function (e) {
      if (e.detail.pageNumber === PDFViewerApplication.page) {
        window.pdfminhhienHighlighter = new window.PdfHighlighterHelper();
          loadProfileToGlobal()
          .then(() => {
            restoreOldHighlight(originalUrl);
          });
      }
    }, true);
    
    $(window).mouseup(() => {
      return loadProfileToGlobal()
      .then(() => {
        renderBtnHighlight();
      });
    })
  }, 500);
  
});