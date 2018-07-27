const productionApi = 'https://contentkit-api.mstage.io/graphql'
const stagingApi = 'https://contentkit-api-staging.mstage.io/graphql'

console.log('HIHGLIGHT MINHHIEN')

var profile = null
var isSending = false
var position = 0
var articleId = ''
var token = ''
var authorizationToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcm9qZWN0SWQiOiI1YWRmNzRjNzdmZjQ0ZTAwMWViODI1MzkiLCJpYXQiOjE1MjQ1OTM4NjN9.Yx-17tVN1hupJeVa1sknrUKmxawuG5rx3cr8xZc7EyY'

var currentPositionBtn = {}

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


// add comment block to wrapper
wrapper.append(commentBlock)


var stopMouseUp = false 
var body = document.querySelector('body')
var oldBody = body.innerHTML
var idCounter=0;
var textSelected=false;


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
    userAvatar.html('')
    if (profile._avatar.length) {
      userAvatar.append(`<img src="${profile._avatar}" alt="" >`)
    } else {
      userAvatar.append(`
        <span class="comment__avatar-symbol">${profile.name}</span>
      `)
    }
    userName.html('').append(profile.name)

    const range =  document.getSelection().getRangeAt(0);
    const boundingRect = range.getBoundingClientRect() // highlightHelper.getBoundingRect(nodes);
    // console.log('BOUNDING RECT OFFSET', boundingRect)
    
    const topOffset = boundingRect.top > 0 ? boundingRect.top + (boundingRect.height / 2) : boundingRect.bottom / 2
    const top = window.scrollY + topOffset
    currentPositionBtn = {
      top: top - 22,
      right: ($(document).width() - boundingRect.right) / 2
    }
    $(wrapper)
      .css('display', 'none').css({
      'right': ($(document).width() - boundingRect.right) / 2, // ($(document).width() - offset.width) / 2,
      'top':  top - 22,// window.scrollY + Math.max(rangeStart.getClientRects()[0].top, 0) + rectHeight,// offset.top + (boundingRect.height / 2) + boundingRect.top,// offset.offset.top + (dimension.height / 2),
      'display': 'block',
      'z-index': 1000
    }).attr('rel', selection);
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

function postHighlight ({ core, prev, next, serialized }) {
  if (isSending) return
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
  return axios.post(
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
      'authorization': authorizationToken,
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
    articleId = recordId
    return axios.post(
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
        'authorization': authorizationToken,
        'usertoken': token
      }
    }).then((res) => {
      if (res.status !== 200) {
        _renderErrorHighlight()
        return null
      }
      const result = res.data
      if (!result || result.errors) {
        _renderErrorHighlight()
        return result
      }
      // $(highlightButton).find('span').text('Success!')
      isSending = false
      _renderSuccessHighlight()
      $(wrapper).hide()
      _renderNewCircle({
        url,
        highlightData: { core, prev, next, serialized },
        result
      })
      return result
    }).catch(() => {
      _renderErrorHighlight()
    })
  }).catch(() => {
    _renderErrorHighlight()
  })
}

function _renderNewCircle ({ url, highlightData, result }) {
  const { serialized } = highlightData
  const targets = [{
    source: url,
    selector: JSON.parse(serialized)
  }]

  const highlightDataId = result.data.user.userhighlightAddOrUpdateOne.recordId || ''

  const highlightHelper = getHighlighter();
  highlightHelper.restoreHighlightFromTargets(targets).then(() => {
    const anchors = highlightHelper.getAnchors();
    anchors.forEach((anchor, idx)  => {
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

      const boundingRect = anchor.range.getBoundingClientRect()
      const offset = getOffsetRect(highlights) // $(range.startContainer.parentNode).offset()
      const width = $(range.startContainer.parentNode).width()
      const height = boundingRect.height
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

      $(commentActions)
        .append(commentPost)
        .append(commentPrivacy)
      $(commentBlock)
        // .append(commentUser)
        .append(commentText)
        .append(commentActions)

      $(highlightCircle).on('click', function() {
        if (!highlightDataId) return
        console.log('highlightData', highlightData)
        if ($(this).hasClass('highlight__circle--outline')) {
          // TODO: highlight
          justPostHighlight(highlightData).then(res => {
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
          console.log('xxx', res)
          if (res.status !== 200) {
            return
          }
          const result = res.data
          if (!result || result.errors) return
          $(this).addClass('highlight__circle--outline')
        })
      });
      $(wrapper).append(highlightCircle).append(commentBlock)
      $('body').append(wrapper)
    }); 
  })
}

function justPostHighlight ({ core, prev, next, serialized }) {
  return axios.post(
    stagingApi,
    JSON.stringify({
      query: `
        mutation ($prev: String, $next: String, $core: String, $serialized: String) {
          user{
            userhighlightAddOrUpdateOne(
              filter:{
                articleId: "${articleId}"
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
      'authorization': authorizationToken,
      'usertoken': token
    }
  })
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
        'authorization': authorizationToken,
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
          'authorization': authorizationToken,
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

function removeHighlight(highlightId) {
  console.log('REMOVE HIGHLIGHT ', highlightId);
  console.log('token', token)
  console.log('articleId', articleId)
  return axios.post(
    stagingApi,
    JSON.stringify({
      query: `
        mutation {
          user {
            userHighlightRemoveOne(filter: {
              highlightId: "${highlightId}",
              articleId: "${articleId}"
            }) {
              recordId
            }
          }
        }
      `
    }), {
    headers: {
      'Content-type': 'application/json',
      'authorization': authorizationToken,
      'usertoken': token
    }
  })
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
                _id
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
          'authorization': authorizationToken,
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
      articleId = articleUserAction._id
      const highlightData = articleUserAction && articleUserAction.userHighlightData && articleUserAction.userHighlightData.highlights;
      const oldHighlight = highlightData && highlightData.length
      const targets = oldHighlight && highlightData.map(({ core, prev, next, serialized }) => ({
        source: url,
        selector: JSON.parse(serialized)
      }))
      console.log('TARGETS TO RESTORE', targets);
      if (targets.length) {
        const highlightHelper = getHighlighter();
        setTimeout(() => highlightHelper.restoreHighlightFromTargets(targets).then(() => {
          const anchors = highlightHelper.getAnchors();
          anchors.forEach((anchor, idx)  => {
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
            const highlightDataId = (currentHighlight && currentHighlight._id) || idx;
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

            $(commentActions)
              .append(commentPost)
              .append(commentPrivacy)
            $(commentBlock)
              // .append(commentUser)
              .append(commentText)
              .append(commentActions)


            // const removeHighlightHanlder = () => highlightDataId && removeHighlight(highlightDataId);
            $(highlightCircle).on('click', function() {
              if (!highlightDataId) return
              console.log('highlightData', currentHighlight)
              if ($(this).hasClass('highlight__circle--outline')) {
                // TODO: highlight
                justPostHighlight(currentHighlight).then(res => {
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
            $(wrapper).append(highlightCircle).append(commentBlock)
            $('body').append(wrapper)
          });
          
        }), 2000); // delay to restore highlight after medium highlight their own
      }
      window.readyForHighlight = true;

      // change icon extension
      const {userBookmarkData} = articleUserAction
      userBookmarkData && userBookmarkData.contentId && chrome.runtime.sendMessage({ action: 'change-icon' })
    }).catch(() => {
      // _renderErrorHighlight()
      _renderErrorPost()
      window.readyForHighlight = true;
    });
}

$(document).ready(function (e) {
  const url = document.location.href;
  getProfileFromStorage().then((result) => {
    const { bookmark_token } = result
    token = bookmark_token
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
      stopMouseUp = true
    },
    e => {
      stopMouseUp = false
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

