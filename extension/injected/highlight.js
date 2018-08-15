var profile = null
var hideCircle = false
var token = ''

var isSending = false

var articleId = ''

// var currentPositionBtn = {}

window.shouldPopup = false

const HIGHLIGHT_CIRCLE_WIDTH = 22
const HIGHLIGHT_CIRCLE_OFFSET = 20
const Z_INDEX = 999
const NEW_HIGHLIGHT_CIRCLE_ID = 'minhhien__highlight__I_AM_NEW_HAHA';

window.minhhienSelection = null;
window.readyForHighlight = false;

var stopMouseUp = false

// controls
const wrapper = $(`<div id="${NEW_HIGHLIGHT_CIRCLE_ID}" class="highlight__circle-wrapper"></div>`)
const newHighlightCircle = $(`<div class="highlight__circle"></div>`)
wrapper.append(newHighlightCircle)

function getHighlighter() {
  if (!window.minhhienHighlighter) {
    window.minhhienHighlighter = new window.HighlightHelper();
  }
  return window.minhhienHighlighter
}

function checkHidingCircleHighlight () {
  return loadProfileToGlobal()
  .then(() => !!hideCircle)
}

const highlightDataToTarget = ({ core, prev, next, serialized, _id, comment }) => ({
  core, prev, next,
  comment,
  _id,
  selector: JSON.parse(serialized),
})

const targetToHighlightData = (target) => {
  const textQuoteSelector = target.selector.find(({ type }) => type === "TextQuoteSelector");
  const highlightData = {
    prev: textQuoteSelector.prefix,
    core: textQuoteSelector.exact,
    next: textQuoteSelector.suffix,
    serialized: JSON.stringify(target.selector),
    comment: target.comment
  }
  return highlightData
}

async function renderBtnHighlight () {
  saveSelection()
  let hideCircle = await checkHidingCircleHighlight()
  if (hideCircle) return

  isSending = false

  const selection = document.getSelection();

  if (validHighlightLength(selection.toString().trim())) {
    const range =  document.getSelection().getRangeAt(0);
    const boundingRect = range.getBoundingClientRect();
    const topOffset = boundingRect.top > 0 ? boundingRect.top + (boundingRect.height / 2) : boundingRect.bottom / 2
    const top = window.scrollY + topOffset
    const currentPositionBtn = {
      top: top - HIGHLIGHT_CIRCLE_WIDTH / 2,
      left: boundingRect.width + boundingRect.left + HIGHLIGHT_CIRCLE_OFFSET // ($(document).width() - boundingRect.right) / 2
    }
    $(newHighlightCircle).addClass('highlight__circle--outline')
    $(wrapper)
      .css({
      ...currentPositionBtn,
      position: 'absolute',
      display: 'block',
      'z-index': 1000
    })
  }  else {
    console.log('NOT VALID HIGHLIGHT LENGHT')
  }
}

function _renderErrorHighlight () {
  // $(highlightButton).find('span').html('').append(errorIcon)
}

function _renderInitialHighlight () {
  // $(highlightButton).find('span').html('').append(highlightIcon)
}

function _renderSuccessHighlight () {
  // $(highlightButton).find('span').html('').append(successHighlightIcon)
}

function _renderRestoreOldHighlightError () {
  chrome.runtime.sendMessage({ action: 'change-icon-outline' })
  console.log('CAN NOT RESTORE OLD HIHGLIGHT')
}

function postHighlight ({ core, prev, next, serialized, comment }) {
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
    articleId = recordId
    const highlightObject = { core, prev, next, serialized, isPublic: false, comment }

    return getApiClientByToken(token)
    .addOrUpdateHighlight(articleId, highlightObject)
  })
  .then((responseData) => {
    isSending = false
    _renderSuccessHighlight()
    $(wrapper).hide()
    return responseData
  })
  .catch(() => {
    isSending = false
    _renderErrorHighlight()
  })
}


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

function removeHighlight(highlightId) {
  return getApiClientByToken(token).removeHighlight(articleId, highlightId);
}

const renderHighlightCircleFromAnchor =  anchor => {
  const { range, highlights, target } = anchor;
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
  const offset = getOffsetRect(highlights)
  const width = $(range.startContainer.parentNode).width()
  const height = boundingRect.height
  const currentHighlight = targetToHighlightData(target);
  const { comment, _id: highlightDataId, core, prev, next, serialized } = target;
  const ele = document.getElementById(`minhhien__highlight__${highlightDataId}`)
  let selector = null;
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
        .then(([anchor]) => renderHighlightCircleFromAnchor(anchor))
        // highlightHelper.restoreHighlightFromTargets([target])
        // .then(() => {
        //   return getApiClientByToken(token).addOrUpdateHighlight(articleId, currentHighlight)
        // })  
        // .then(addOrUpdateHighlightResult => {
        //   $(this).removeClass('highlight__circle--outline')
        // });
      }
      return getApiClientByToken(token).removeHighlight(articleId, highlightDataId)
      .then(result => {
        highlightHelper.removeHighlightsFromAnchor(anchor);
        $(this).addClass('highlight__circle--outline')
      })
    });

    
    const commentInput = $(`<textarea id="comment__textarea-${highlightDataId}" placeholder="Your comment here..">${comment || ''}</textarea>`);
    const controlGroups = $(`
      <div id='control-wrapper-${highlightDataId}'>
      </div>
    `)
    $(controlGroups).append(commentInput);

    $(wrapper).append(highlightCircle)
    $(wrapper).append(controlGroups)
    $(controlGroups).hide()
    $(wrapper).hover(function() {
      $(controlGroups).css({
        position: 'relative',
        display: 'block',
        top: 5
      })
      
    }, function() {
      $(controlGroups).hide()
      const highlightObject = targetToHighlightData({
        ...target,
        comment: $(commentInput).val()
      })
      return getApiClientByToken(token)
      .addOrUpdateHighlight(articleId, highlightObject)
      .catch(err => console.log('COMMENT ERROR', err));
    })
    $('body').append(wrapper)
    selector = $(wrapper)
  } else {
    selector = $(`#minhhien__highlight__${highlightDataId}`)
  }
  
  const { top, left } = offset;
  selector.css({
    position: 'absolute',
    left: width + left + HIGHLIGHT_CIRCLE_OFFSET,
    top: top + height / 2 - HIGHLIGHT_CIRCLE_WIDTH / 2,
    display: 'block',
    'z-index': Z_INDEX
  })
}

function restoreOldHighlight(url) {
  if (window.restoringHighlight) return;
  const highlightWrapers = document.getElementsByClassName("highlight__circle-wrapper");
  Array.from(highlightWrapers).forEach(ele => {
    if (ele.id === NEW_HIGHLIGHT_CIRCLE_ID) {
      $(ele).hide()
    } else {
      ele.remove();
    }
  })
  getApiClientByToken(token).getOldHighlight(url)
    .then((articleUserAction) => {
      isSending = false;
      window.readyForHighlight = true;
      const { userBookmarkData: bookmarkData, userHighlightData } = articleUserAction;
      window.shouldPopup = !bookmarkData || !bookmarkData.contentId
      articleId = articleUserAction._id
      const highlightData = userHighlightData && userHighlightData.highlights;
      const oldHighlight = highlightData && highlightData.length
      const targets = (oldHighlight && highlightData.map(highlightDataToTarget)) || []
      
      // change icon extension
      if (bookmarkData && bookmarkData.contentId) {
        chrome.runtime.sendMessage({ action: 'change-icon' })
      } else {
        chrome.runtime.sendMessage({ action: 'change-icon-outline' })
      }

      // console.log('TARGETS TO RESTORE', targets);
      if (targets.length) {
        const highlightHelper = getHighlighter();
        setTimeout(() => {
          highlightHelper.restoreHighlightFromTargets(targets).then(() => {
            const anchors = highlightHelper.getAnchors();
            anchors.forEach(renderHighlightCircleFromAnchor);
          })
        }, 2000); // delay to restore highlight after medium highlight their own
      }
    })
    .catch((error) => {
      console.log(error)
      window.readyForHighlight = true;
      isSending = false;
      return _renderRestoreOldHighlightError();
    });
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

function handleMouseupToRenderHighlightCircle(e) {
  console.log('readyForHighlight', window.readyForHighlight, 'stopMouseUp', stopMouseUp)
  if (!window.readyForHighlight || stopMouseUp) {
    return;
  }
  e.stopPropagation()
  return loadProfileToGlobal()
  .then(() => {
    const highlightHelper = getHighlighter();
    const selection = window.getSelection();
    if (!highlightHelper.canCreateHighlightFromSelection(selection)) {
      return $(wrapper).hide();
    }
    renderBtnHighlight()
  });
}

function handleCreateHighlight(e) {
  $(newHighlightCircle).removeClass('highlight__circle--outline')
  e.stopPropagation()
  window.readyForHighlight = false;
  restoreOldSelection()

  const highlightHelper = getHighlighter();
  const selection = document.getSelection()

  if (!highlightHelper.canCreateHighlightFromSelection(selection)) {
    return
  }
  highlightHelper.saveRangeBeforeCreateHighlight(selection);
  highlightHelper.createHighlight().then(result => {
    console.log('AFTER CREATE HIGHLIGHT', result)
    if (result.length) {
      window.getSelection().empty()
      const anchor = result[0];
      if (anchor && anchor.target && anchor.target.selector) {
        const textQuoteSelector = anchor.target.selector.find(({ type }) => type === "TextQuoteSelector");
        if (textQuoteSelector) {
          console.log('TRGIGER POST HIHGLIGHT')
          return postHighlight(targetToHighlightData(anchor.target))
          .then(responseData => {
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
            console.log('IN HIHGLIGHT AFTER', window.shouldPopup)
            if (window.shouldPopup) {
              renderBookmarkPopup();
              window.shouldPopup = false
            }
          });
        }
      }
    }
  });
}

function handleHistoryStateUpdated() {
  profile = null
  hideCircle = false
  token = ''
  isSending = false
  articleId = ''

  // remove iframe
  removeElementById('iframe_popup')
  removeElementById('iframe_rt')

  window.shouldPopup = true
  window.minhhienHighlighter = new window.HighlightHelper();
  const url = document.location.href;
  loadProfileToGlobal()
  .then(() => restoreOldHighlight(url))
  $(wrapper).hide()
}

const debouncedHandleHistoryStateUpdated = debounce(handleHistoryStateUpdated, 1000, true);

function handleWindowReady(e) {
  $(window).mouseup(handleMouseupToRenderHighlightCircle);
  $(wrapper).hover(
    e => {
      stopMouseUp = true
    },
    e => {
      stopMouseUp = false
    }
  )

  $(newHighlightCircle).click(handleCreateHighlight)
  $(wrapper).hide()
  $('body').append(wrapper)

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
  debouncedHandleHistoryStateUpdated();
}

$(window).on('load', handleWindowReady);

function validHighlightLength(str) {return str.length > 5 && str.length < 5000;}

// function getSelected() {
//   if (window.getSelection) return window.getSelection();
//   else if (document.getSelection) return document.getSelection();
//   else {
//     var selection = document.selection && document.selection.createRange();
//     if (selection.text) return selection.text;
//     return false;
//   }
//   return false;
// }


