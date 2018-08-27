const wrapper = $(`<div id="minhhien__highlight__I_AM_NEW_HAHA" class="highlight__circle-wrapper"></div>`)
const newHighlightCircle = $(`<div class="highlight__circle"></div>`)
wrapper.append(newHighlightCircle)

const HIGHLIGHT_CIRCLE_WIDTH = 14
const HIGHLIGHT_CIRCLE_OFFSET = 5
const Z_INDEX = 999
const NEW_HIGHLIGHT_CIRCLE_ID = 'minhhien__highlight__I_AM_NEW_HAHA';

var profile = null
var hideCircle = false
var token = ''

var articleId = ''

var isSending = false

var originalUrl = null

window.shouldPopup = false

function saveSelection() {
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
  // .createArticleIfNotExists(data)
  .contentCreateIfNotExist(data)
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
          .then(responseData => {
            if (window.shouldPopup) {
              renderBookmarkPopup();
              setTimeout(() => {
                // remove iframe
                chrome.runtime.sendMessage({ action: 'remove-iframe' })
              }, 2000);
              window.shouldPopup = false
            }
            $(wrapper).hide();
            window.readyForHighlight = true;
            const highlightData = responseData.record.highlights
            const currentHighlight = highlightData.find(({ prev, core, next }) => prev === textQuoteSelector.prefix && core === textQuoteSelector.exact && next === textQuoteSelector.suffix);
            renderHighlightCircleFromAnchor({
              ...anchor,
              target: {
                ...anchor.target,
                ...currentHighlight,
              },
            })
            
          })
        }
      }
    }
  });
}

function getHighlighter() {
  return window.pdfminhhienHighlighter
}

function getPdfScale() {
  return PDFViewerApplication.pdfViewer.currentScale;
}

async function renderBtnHighlight () {
  saveSelection();
  $(wrapper).hide();
  if (!window.getSelection().toString()) return;

  const range =  document.getSelection().getRangeAt(0);
  const boundingRect = range.getBoundingClientRect();
  const topOffset = boundingRect.top > 0 ? boundingRect.top + (boundingRect.height / 2) : boundingRect.bottom / 2
  const top = window.scrollY + topOffset
  const viewerOffset = $('#viewer').offset()
  currentPositionBtn = {
    top: top - (HIGHLIGHT_CIRCLE_WIDTH  * getPdfScale()) / 2 - viewerOffset.top,
    left: boundingRect.width + boundingRect.left + HIGHLIGHT_CIRCLE_OFFSET * getPdfScale()  - viewerOffset.left // ($(document).width() - boundingRect.right) / 2
  }
  $(newHighlightCircle).addClass('highlight__circle--outline')
  $(newHighlightCircle).css({
    width: HIGHLIGHT_CIRCLE_WIDTH * getPdfScale(),
    height: HIGHLIGHT_CIRCLE_WIDTH * getPdfScale(),
  });
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
        chrome.runtime.sendMessage({ action: 'change-icon' })
      } else {
        chrome.runtime.sendMessage({ action: 'change-icon-outline' })
      }

      // console.log('TARGETS TO RESTORE', targets);
      if (targets.length) {
        const highlightHelper = getHighlighter();
        highlightHelper.restoreHighlightFromTargets(targets);
      }
    }).catch((error) => {
      console.log('CAN NOT RESTORE OLD HIGHLIGHT', error);
      window.readyForHighlight = true;
      isSending = false;
    });
}

const targetToHighlightData = (target) => {
  const textQuoteSelector = target.selector.find(({ type }) => type === "TextQuoteSelector");
  const highlightData = {
    prev: textQuoteSelector.prefix,
    core: textQuoteSelector.exact,
    next: textQuoteSelector.suffix,
    serialized: JSON.stringify(target.selector)
  }
  return highlightData
}

const renderHighlightCircleFromAnchor = (anchor) => {
  console.log('renderHighlightCircleFromAnchor', anchor.target._id)
  const { range, highlights, target } = anchor;
  if(!range || !highlights) return
  const getOffsetRect = (elements) => {
    const rects = elements.map(ele => {
      return $(ele.parentNode).offset()
  });
    return rects.reduce(function(acc, r) {
      return {
        top: Math.min(acc.top, r.top),
        left: Math.min(acc.left, r.left),
      };
    });
  }
  const boundingRect = anchor.range.getBoundingClientRect()
  const offset = getOffsetRect(highlights)
  const height = boundingRect.height
  const currentHighlight = targetToHighlightData(target);
  const highlightDataId = target._id;
  const ele = document.getElementById(`minhhien__highlight__${highlightDataId}`)
  let selector = null;
  let circleSelector = null;
  if (!ele) {
    const wrapper = $(`<div id="minhhien__highlight__${highlightDataId}" class="highlight__circle-wrapper"></div>`)
    const highlightCircle = $(`<div class="highlight__circle "></div>`)
    
    const highlightHelper = getHighlighter();
    $(highlightCircle).on('click', function() {
      if (!highlightDataId) return
      if ($(this).hasClass('highlight__circle--outline')) {
        $(wrapper).remove();
        $(this).remove();
        const newTarget = {
          selector: target.selector
        };
        return getApiClientByToken(token).addOrUpdateHighlight(articleId, currentHighlight)
        .then((addOrUpdateHighlightResult) => {
          newTarget._id = addOrUpdateHighlightResult.record.highlights[addOrUpdateHighlightResult.record.highlights.length - 1]._id;
          console.log('new target', newTarget._id);
          return highlightHelper.restoreHighlightFromTargets([newTarget])
        })
        .then((result) => {
          console.log(result)
          // renderHighlightCircleFromAnchor({
          //   ...anchor,
          //   target: newTarget
          // })
        })  
        // .then(addOrUpdateHighlightResult => {
        //   $(this).removeClass('highlight__circle--outline')
        // });
      }
      return getApiClientByToken(token)
      .removeHighlight(articleId, highlightDataId)
      .then(result => {
        highlightHelper.removeHighlightsFromAnchor(anchor);
        $(this).addClass('highlight__circle--outline')
      })
    });
    
    $(wrapper).append(highlightCircle)
    $('#viewer').append(wrapper)
    selector = $(wrapper)
    circleSelector = $(highlightCircle)
  } else {
    selector = $(`#minhhien__highlight__${highlightDataId}`)
    circleSelector = $(selector).children().first()
  }
  circleSelector.css({
    width: HIGHLIGHT_CIRCLE_WIDTH * getPdfScale(),
    height: HIGHLIGHT_CIRCLE_WIDTH * getPdfScale(),
  });
  const viewerOffset = $('#viewer').offset()
  const { top, left, } = offset;
  const width = boundingRect.width;
  selector.css({
    position: 'absolute',
    left: width + left + HIGHLIGHT_CIRCLE_OFFSET * getPdfScale() - viewerOffset.left,
    top: top + height / 2 - (HIGHLIGHT_CIRCLE_WIDTH * getPdfScale()) / 2 - viewerOffset.top,
    display: 'block',
    'z-index': Z_INDEX
  })
}

$(window).on('load', () => {
  originalUrl = (new URL(document.location.href)).searchParams.get('file');
  $(newHighlightCircle).click(handleCreateHighlight);
  $(wrapper).hide();
  $('#viewer').append(wrapper);

  window.shouldPopup = true

  window.firstTimeload = true;
  
  setTimeout(() => {
    document.addEventListener('textlayerrendered', function (e) {
      if (e.detail.pageNumber === PDFViewerApplication.page) {

        if (!window.firstTimeload) return;
        window.firstTimeload = false;

        window.pdfminhhienHighlighter = new window.PdfHighlighterHelper(renderHighlightCircleFromAnchor);
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