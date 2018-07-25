const productionApi = 'https://contentkit-api.mstage.io/graphql'
const stagingApi = 'https://contentkit-api-staging.mstage.io/graphql'

console.log('HIHGLIGHT MINHHIEN')

var profile = null
var isSending = false
var position = 0
// var trackerButton = $('<a id="tracker__button" href="javascript:;"><img src="https://image.flaticon.com/icons/svg/751/751379.svg" alt="" /> <span>Add to highlight</span></a>')
const wrapper = $('<div id="tracker__wrapper"></div>')
const tracker__buttons = $('<div class="tracker__buttons"></div>')
const highlightButton = $(`<a id="tracker__button" href="javascript:;" title="Highlight"><span>${highlightIcon}</span></a>`)
const commentButton = $(`<a id="comment__button" href="javascript:;" title="Give comment"><span>${commentIcon}</span></a>`)
const commentBlock = $(`
  <div class="comment__block">
    <div class="comment__heading">Comment</div>
  </div>
`)
const commentUser = $(`
<div class="comment__user">
</div>
`)
const userAvatar = $(`
  <div class="comment__avt"></div>
`)
const userName = $(`
  <span class="comment__user-name"></span>
`)
const commentText = $(`
<div class="comment__text">
  <textarea id="comment__textarea" placeholder="Your comment here.." />
</div>
`)

const commentTextPreview = $(`
<div class="comment__text">
</div>
`)

const commentActions = $(`
  <div class="comment__actions"></div>
`)
const commentPost = $(`
  <div class="comment__post">Post</div>
`)
const commentPrivacy = $(`
  <div class="comment__privacy">Privacy</div>
`)

function getHighlighter() {
  if (!window.minhhienHighlighter) {
    //   const HIGHLIGHT_NAME = 'highlight-hasbrain';
    //   rangy.init();
    //   const highlighter = rangy.createHighlighter(document, 'TextRange');
    //   highlighter.addClassApplier(rangy.createClassApplier(HIGHLIGHT_NAME, {
    //     ignoreWhiteSpace: true,
    //     tagNames: ["span", "a"]
    //   }));
    //   window.minhhienHighlighter = highlighter
    //   window.HIGHLIGHT_NAME = HIGHLIGHT_NAME
      window.minhhienHighlighter = new window.HighlightHelper();
    }
    // return {
    //   highlighter: window.minhhienHighlighter,
    //   highlighterName: window.HIGHLIGHT_NAME
    // }
    return window.minhhienHighlighter
}


window.minhhienSelection = null;
window.readyForHighlight = false;

// add button highlight and comment to wrapper
tracker__buttons
  .append(highlightButton)
  .append(commentButton)

wrapper.append(tracker__buttons)

commentUser
  .append(userAvatar)
  .append(userName)


commentActions
  .append(commentPost)
  .append(commentPrivacy)


// commentBlock
//   .append(commentUser)
//   .append(commentText)
//   .append(commentActions)



// add comment block to wrapper
wrapper.append(commentBlock)


var stopMouseUp = false 
var body = document.querySelector('body')
var oldBody = body.innerHTML
var idCounter=0;
var textSelected=false;

let token = ''

function getProfileFromStorage() {
  return new Promise(function(resolve, reject) {
    chrome && chrome.storage.sync.get(['bookmark_profile', 'bookmark_token', 'bookmark_hide_circle_highlight'], function(items) {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError.message);
      } else {
        resolve(items);
      }
    })
  });
}

function checkHidingCircleHighlight () {
  return getProfileFromStorage()
  .then(result => {
    if (!result || !result.bookmark_profile) return false
    const {bookmark_profile = '{}', bookmark_token} = result
    profile = JSON.parse(bookmark_profile)
    token = bookmark_token
    return !!result.bookmark_hide_circle_highlight
  }).then(res => res) 
}

async function renderBtnHighlight (e) {
  saveSelection()
  var hideCircle = await checkHidingCircleHighlight()
  if (hideCircle) return

  _renderInitialHighlight()
  $(commentBlock).hide()
  $(wrapper).removeClass('show-comment__block')
  $(commentText).find('textarea').val('')
  $('body').append(wrapper)

  var selection = $.trim(getSelected().toString());
  $(wrapper).css('display', 'none');
  if (isDict(selection.toString())) {
    // $(trackerButton)
    //   .css('display', 'none').css({
    //   'left': e.pageX,
    //   'top': e.pageY - 48,
    //   'display': 'flex'
    // }).attr('rel', selection);
    userAvatar.html('')
    if (profile._avatar.length) {
      userAvatar.append(`<img src="${profile._avatar}" alt="" >`)
    } else {
      userAvatar.append(`
        <span class="comment__avatar-symbol">${profile.name}</span>
      `)
    }
    userName.html('').append(profile.name)
    // commentUser.html('')
    // commentUser.append(userAvatar)
    // commentUser.append(userName)

    
    
    // commentBlock.append(commentUser)
    // commentBlock.append(commentText)
    // commentBlock.append(commentActions)
    // wrapper.append(highlightButton)
    // wrapper.append(commentButton)
    // wrapper.append(commentBlock)
    const offset = getSelectionCharOffsetsWithin(document.body)
    const dimension = getSelectionDimensions()

    $(wrapper)
      .css('display', 'none').css({
      'right': ($(document).width() - offset.width) / 2,
      'top': offset.offset.top + (dimension.height / 2),
      'display': 'block',
      'z-index': 1000
    }).attr('rel', selection);
    if (selection.length) {
      const highlightOffset = getSelectionCharOffsetsWithin(document.body)
      position = parseFloat(highlightOffset.start*100/$(document).height()).toFixed(2)
    }
  }
}

function _renderErrorHighlight () {
  isSending = false
  // $(highlightButton).find('span').text('Error...!')
  // _renderInitialHighlight()
  $(highlightButton).find('span').html('').append(errorIcon)
}

function _renderInitialHighlight () {
  // setTimeout(function () {
  //   $(highlightButton).find('span').text('Add to highlight')
  //   $(highlightButton).removeClass('show')
  //   $(highlightButton).css('display', 'none');
  // }, 1000)
  $(highlightButton).find('span').html('').append(highlightIcon)
}

function _renderSuccessHighlight () {
  $(highlightButton).find('span').html('').append(successHighlightIcon)
}


function selectText() {	// onmouseup
	if (window.getSelection) {
		console.log("window.getSelection");
		sel = window.getSelection();
		if (sel.getRangeAt && sel.rangeCount) {	// Chrome, FF
			console.log(sel.getRangeAt(0));
			return sel.getRangeAt(0);
		}
		else{console.log(sel);}
	} else if (document.selection && document.selection.createRange) {
		console.log("elseif");
		return document.selection.createRange();
	}
	return null;
}

function appendAnchor(r) {	// onmouseup
	if (!r) return;
	extracted = r.extractContents();
	el = document.createElement('a');
	el.setAttribute("id", "a-"+idCounter);
	el.setAttribute("class", "highlighted");
	el.appendChild(extracted);
	r.insertNode(el)
}

function restore() {
	p.innerHTML = old;
  textSelected=false;
}

function getSelectionCharOffsetsWithin(element) {
  var start = 0, end = 0, width = 0, offset = {};
  var sel, range, priorRange;
  if (typeof window.getSelection != "undefined") {
    if (!window.getSelection().getRangeAt(0)) return
    range = window.getSelection().getRangeAt(0);
    priorRange = range.cloneRange();
    priorRange.selectNodeContents(element);
    width = $(range.startContainer.parentNode).innerWidth() || 0
    offset = $(range.startContainer.parentNode).offset()
    priorRange.setEnd(range.startContainer, range.startOffset);
    start = priorRange.toString().length;
    end = start + range.toString().length;
  } else if (typeof document.selection != "undefined" &&
          (sel = document.selection).type != "Control") {
    range = sel.createRange();
    width = $(range.startContainer.parentNode).innerWidth() || 0
    offset = $(range.startContainer.parentNode).offset()
    priorRange = document.body.createTextRange();
    priorRange.moveToElementText(element);
    priorRange.setEndPoint("EndToStart", range);
    start = priorRange.text.length;
    end = start + range.text.length;
  }
  return {
    start: start,
    end: end,
    width,
    offset
  };
}

function getSelectionDimensions() {
  var sel = document.selection, range;
  var width = 0, height = 0;
  if (sel) {
      if (sel.type != "Control") {
          range = sel.createRange();
          width = range.boundingWidth;
          height = range.boundingHeight;
      }
  } else if (window.getSelection) {
      sel = window.getSelection();
      if (sel.rangeCount) {
          range = sel.getRangeAt(0).cloneRange();
          if (range.getBoundingClientRect) {
              var rect = range.getBoundingClientRect();
              width = rect.right - rect.left;
              height = rect.bottom - rect.top;
          }
      }
  }
  return { width: width , height: height };
}

function postHighlight ({ core, prev, next, serialized  }) {
  if (!isSending) {
    // $(highlightButton).find('span').text('Adding...')
    $(highlightButton).find('span').html('').append(loadingIcon)
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
      // highlight = $(wrapper).attr('rel'),
      h1 = [], h2 = [], h3 = [], keywords = null

    for (var o = 0; o < h1s.length; o++) {h1.push(h1s[o].innerText);}
    for (var j = 0; j < h2s.length; j++) {h2.push(h2s[j].innerText);}
    for (var k = 0; k < h3s.length; k++) {h3.push(h3s[k].innerText);}
    if (des !== null) description = des.getAttribute("content")
    if (og !== null) photo = og.getAttribute("content")

    const data = {
      title,
      url,
      sourceImage: photo,
      shortDescription: description,
      // tags: keywords.tags,
      readingTime
    }
    var bookmarkData = data      
    axios.post(
      stagingApi,
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
        'usertoken': token
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
      axios.post(
        stagingApi,
        JSON.stringify({
          query: `
            mutation ($prev: String, $next: String, $core: String, $serialized: String) {
              user{
                userhighlightAddOrUpdateOne(
                  filter:{
                    articleId: "${recordId}"
                  }, record: {
                    core: $core,
                    prev: $prev,
                    next: $next,
                    serialized: $serialized
                  }
                ) {
                  recordId
                }
              }
            }
          `, variables: { core, prev, next, serialized }
        }), {
        headers: {
          'Content-type': 'application/json',
          'authorization': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcm9qZWN0SWQiOiI1YWRmNzRjNzdmZjQ0ZTAwMWViODI1MzkiLCJpYXQiOjE1MjQ1OTM4NjN9.Yx-17tVN1hupJeVa1sknrUKmxawuG5rx3cr8xZc7EyY',
          'usertoken': token
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
        // $(highlightButton).find('span').text('Success!')
        isSending = false
        _renderSuccessHighlight()
      }).catch(() => {
        _renderErrorHighlight()
      })
    }).catch(() => {
      _renderErrorHighlight()
    })
  }
}

function _renderLoadingPost () {
  $(commentPost).html('').append(loadingIcon)
}

function _renderCommentBlock () {
  $(commentPost).html('').text('Post')
  $(commentText).find('textarea').show()
  $(commentText).find('span').remove()
  $(commentActions).show()
  $(commentBlock)
    .append(commentUser)
    .append(commentText)
    .append(commentActions)
}

function _renderInitialPost () {
  $(commentPost).html('').append('Post')
  isSending = false
}

function _renderErrorPost () {
  $(commentPost).html('').append('Failed Post')
  setTimeout(() => {
    _renderInitialPost()
  }, 1500)
}

function _renderSuccessPost () {
  isSending = false
  $(commentActions).hide()
  const comment = $(commentText).find('textarea').val()
  $(commentText).find('textarea').val('').hide()
  $(commentText).append(`<span>${comment}</span>`)
}

function postComment ({ position = '' }) {
  const comment = $(commentText).find('textarea').val() || ""
  if (!isSending) {
    // $(highlightButton).find('span').text('Adding...')
    // $(highlightButton).find('span').html('').append(loadingIcon)
    _renderLoadingPost()
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
      highlight = $(wrapper).attr('rel'),
      h1 = [], h2 = [], h3 = [], keywords = null

    for (var o = 0; o < h1s.length; o++) {h1.push(h1s[o].innerText);}
    for (var j = 0; j < h2s.length; j++) {h2.push(h2s[j].innerText);}
    for (var k = 0; k < h3s.length; k++) {h3.push(h3s[k].innerText);}
    if (des !== null) description = des.getAttribute("content")
    if (og !== null) photo = og.getAttribute("content")

    const data = {
      title,
      url,
      sourceImage: photo,
      shortDescription: description,
      // tags: keywords.tags,
      readingTime
    }
    var bookmarkData = data      
    axios.post(
      stagingApi,
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
        'usertoken': token
      }
    }).then((res) => {
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
      const {data: {user: {articleCreateIfNotExist: {recordId}}}} = result
      // console.log('record', recordId)
      axios.post(
        stagingApi,
        JSON.stringify({
          query: `
            mutation{
              user{
                userhighlightAddOrUpdateOne(
                  filter:{
                    articleId: "${recordId}"
                  }, record: {
                    highlight: "${highlight}",
                    position: "${position}",
                    comment: "${comment}"
                  }
                ) {
                  recordId
                }
              }
            }
          `
        }), {
        headers: {
          'Content-type': 'application/json',
          'authorization': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcm9qZWN0SWQiOiI1YWRmNzRjNzdmZjQ0ZTAwMWViODI1MzkiLCJpYXQiOjE1MjQ1OTM4NjN9.Yx-17tVN1hupJeVa1sknrUKmxawuG5rx3cr8xZc7EyY',
          'usertoken': token
        }
      }).then((res) => {
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
        // $(highlightButton).find('span').text('Success!')
        _renderSuccessPost()
        // _renderInitialHighlight()
      }).catch(() => {
        // _renderErrorHighlight()
        _renderErrorPost()
      })
    }).catch(() => {
      // _renderErrorHighlight()
      _renderErrorPost()
    })
  }
}

function saveSelection() {
  console.log('SAVE SELECTION BEFORE HANDLE OF ON CLICK EVENT')
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

function getOldHighlight(url, token) {
  console.log('GET OLD HIGHLIGHT')
  axios.post(
    stagingApi,
    JSON.stringify({
      query: `
      query {
        viewer {
          articleUserAction(filter: {
            url: "${url}",
          }) {
            _id
            userCommentData {
              articleId
              comment
            }
            userBookmarkData {
              contentId
            }
            userHighlightData {
              articleId
              highlights {
                core
                prev
                next
                serialized
              }
            }
          }
        } 
      }
      `
      }), {
        headers: {
          'Content-type': 'application/json',
          'authorization': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcm9qZWN0SWQiOiI1YWRmNzRjNzdmZjQ0ZTAwMWViODI1MzkiLCJpYXQiOjE1MjQ1OTM4NjN9.Yx-17tVN1hupJeVa1sknrUKmxawuG5rx3cr8xZc7EyY',
          'usertoken': token
        }
    }).then((res) => {
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
      console.log('GET OLD HIGHLIGHT SUCESS', result);
      const articleUserAction = result.data.viewer.articleUserAction;
      const highlightData = articleUserAction && articleUserAction.userHighlightData && articleUserAction.userHighlightData.highlights;
      const oldHighlight = highlightData && highlightData.length
      const targets = oldHighlight && highlightData.map(({ core, prev, next, serialized }) => ({
        source: url,
        selector: JSON.parse(serialized)
      }))
      console.log('TARGETS TO RESTORE', targets);
      if (targets.length) {
        const highlightHelper = getHighlighter();
        setTimeout(() => highlightHelper.restoreHighlightFromTargets(targets), 2000); // delay to restore highlight after medium highlight their own
      }
      window.readyForHighlight = true;
    }).catch(() => {
      // _renderErrorHighlight()
      _renderErrorPost()
      window.readyForHighlight = true;
    });
}

$(document).ready(function (e) {
  const url = document.location.href;
  getProfileFromStorage().then((result) => {
    const { bookmark_token: token } = result
    getOldHighlight(url, token);
  });
  $(this).mouseup(function (e) {
    if (!window.readyForHighlight) return;
    if (stopMouseUp) return
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

  $(wrapper).hover(
    e => {
      // console.log('hover')
      stopMouseUp = true
      // appendAnchor(selectText())
    },
    e => {
      // console.log('leave')
      stopMouseUp = false
      // body.innerHTML = oldBody
    }
  )
  

  $(commentButton).click(function(e) {
    if ($(wrapper).hasClass('show-comment__block')) {
      $(commentBlock).hide()
      $(wrapper).removeClass('show-comment__block')
    } else {
      _renderCommentBlock()
      $(commentBlock).show()
      $(wrapper).addClass('show-comment__block')
    }
  })
  
  $(highlightButton).click(function (e) {
    e.stopPropagation()
    const { highlighter, highlighterName } = getHighlighter();
    restoreOldSelection()

    const highlightHelper = getHighlighter();
    selection = document.getSelection()
    isBackwards = highlightHelper.rangeUtil.isSelectionBackwards(selection)
    focusRect = highlightHelper.rangeUtil.selectionFocusRect(selection)
    if (!focusRect) {
      return
    }
    if (!selection.rangeCount || selection.getRangeAt(0).collapsed) {
      highlightHelper.selectedRanges = [] 
    } else {
      highlightHelper.selectedRanges = [selection.getRangeAt(0)];
    }
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
          }
        }
      }
    });
  })
  $(commentPost).on('click', function (e) {
    e.stopPropagation()
    console.log('post comment')
    postComment({
      position
    })
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

