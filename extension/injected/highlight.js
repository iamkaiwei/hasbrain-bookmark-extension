const highlightIcon = `<?xml version="1.0"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px" viewBox="0 0 55.25 55.25" style="enable-background:new 0 0 55.25 55.25;" xml:space="preserve" width="20px" height="20px" class=""><g transform="matrix(0.9997 0 0 0.9997 0.00828666 0.00828666)"><path d="M52.618,2.631c-3.51-3.508-9.219-3.508-12.729,0L3.827,38.693C3.81,38.71,3.8,38.731,3.785,38.749  c-0.021,0.024-0.039,0.05-0.058,0.076c-0.053,0.074-0.094,0.153-0.125,0.239c-0.009,0.026-0.022,0.049-0.029,0.075  c-0.003,0.01-0.009,0.02-0.012,0.03l-3.535,14.85c-0.016,0.067-0.02,0.135-0.022,0.202C0.004,54.234,0,54.246,0,54.259  c0.001,0.114,0.026,0.225,0.065,0.332c0.009,0.025,0.019,0.047,0.03,0.071c0.049,0.107,0.11,0.21,0.196,0.296  c0.095,0.095,0.207,0.168,0.328,0.218c0.121,0.05,0.25,0.075,0.379,0.075c0.077,0,0.155-0.009,0.231-0.027l14.85-3.535  c0.027-0.006,0.051-0.021,0.077-0.03c0.034-0.011,0.066-0.024,0.099-0.039c0.072-0.033,0.139-0.074,0.201-0.123  c0.024-0.019,0.049-0.033,0.072-0.054c0.008-0.008,0.018-0.012,0.026-0.02l36.063-36.063C56.127,11.85,56.127,6.14,52.618,2.631z   M51.204,4.045c2.488,2.489,2.7,6.397,0.65,9.137l-9.787-9.787C44.808,1.345,48.716,1.557,51.204,4.045z M46.254,18.895l-9.9-9.9  l1.414-1.414l9.9,9.9L46.254,18.895z M4.961,50.288c-0.391-0.391-1.023-0.391-1.414,0L2.79,51.045l2.554-10.728l4.422-0.491  l-0.569,5.122c-0.004,0.038,0.01,0.073,0.01,0.11c0,0.038-0.014,0.072-0.01,0.11c0.004,0.033,0.021,0.06,0.028,0.092  c0.012,0.058,0.029,0.111,0.05,0.165c0.026,0.065,0.057,0.124,0.095,0.181c0.031,0.046,0.062,0.087,0.1,0.127  c0.048,0.051,0.1,0.094,0.157,0.134c0.045,0.031,0.088,0.06,0.138,0.084C9.831,45.982,9.9,46,9.972,46.017  c0.038,0.009,0.069,0.03,0.108,0.035c0.036,0.004,0.072,0.006,0.109,0.006c0,0,0.001,0,0.001,0c0,0,0.001,0,0.001,0h0.001  c0,0,0.001,0,0.001,0c0.036,0,0.073-0.002,0.109-0.006l5.122-0.569l-0.491,4.422L4.204,52.459l0.757-0.757  C5.351,51.312,5.351,50.679,4.961,50.288z M17.511,44.809L39.889,22.43c0.391-0.391,0.391-1.023,0-1.414s-1.023-0.391-1.414,0  L16.097,43.395l-4.773,0.53l0.53-4.773l22.38-22.378c0.391-0.391,0.391-1.023,0-1.414s-1.023-0.391-1.414,0L10.44,37.738  l-3.183,0.354L34.94,10.409l9.9,9.9L17.157,47.992L17.511,44.809z M49.082,16.067l-9.9-9.9l1.415-1.415l9.9,9.9L49.082,16.067z" data-original="#000000" class="active-path" data-old_color="#EEE9E9" fill="#F2EFEF"/></g> </svg>
`
const commentIcon = `<?xml version="1.0"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px" viewBox="0 0 60 60" style="enable-background:new 0 0 60 60;" xml:space="preserve" width="20px" height="20px"><g><path d="M30,1.5c-16.542,0-30,12.112-30,27c0,5.205,1.647,10.246,4.768,14.604c-0.591,6.537-2.175,11.39-4.475,13.689  c-0.304,0.304-0.38,0.769-0.188,1.153C0.276,58.289,0.625,58.5,1,58.5c0.046,0,0.093-0.003,0.14-0.01  c0.405-0.057,9.813-1.412,16.617-5.338C21.622,54.711,25.738,55.5,30,55.5c16.542,0,30-12.112,30-27S46.542,1.5,30,1.5z M30,53.5  c-3.487,0-6.865-0.57-10.075-1.68c4.075-2.546,4.085-2.727,4.081-3.316c-0.002-0.349-0.192-0.682-0.492-0.861  c-0.456-0.274-1.042-0.142-1.337,0.29c-0.549,0.435-2.906,1.947-5.016,3.249l0,0c-4.464,2.696-10.475,4.201-13.809,4.88  c2.202-3.669,3.091-8.986,3.441-13.16c0.02-0.241-0.048-0.482-0.192-0.677C3.591,38.143,2,33.398,2,28.5c0-13.785,12.561-25,28-25  s28,11.215,28,25S45.44,53.5,30,53.5z" data-original="#000000" class="active-path" data-old_color="#FBF8F8" fill="#F2EFEF"/></g> </svg>
`

const loadingIcon = `
  <svg version="1.1" id="loader-1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
     width="40px" height="40px" viewBox="0 0 50 50" style="enable-background:new 0 0 50 50;" xml:space="preserve">
  <path fill="#F2EFEF" d="M43.935,25.145c0-10.318-8.364-18.683-18.683-18.683c-10.318,0-18.683,8.365-18.683,18.683h4.068c0-8.071,6.543-14.615,14.615-14.615c8.072,0,14.615,6.543,14.615,14.615H43.935z">
    <animateTransform attributeType="xml"
      attributeName="transform"
      type="rotate"
      from="0 25 25"
      to="360 25 25"
      dur="0.6s"
      repeatCount="indefinite"/>
    </path>
  </svg>
`

var profile = null
var isSending = false
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

function checkHighlightWhitelist () {
  return new Promise(function(resolve, reject) {
    chrome && chrome.storage.sync.get(['bookmark_profile', 'bookmark_token'], function(items) {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError.message);
      } else {
        resolve(items);
      }
    })
  }).then(result => {
    if (!result || !result.bookmark_profile) return false
    const {bookmark_profile = '{}', bookmark_token} = result
    profile = JSON.parse(bookmark_profile)
    token = bookmark_token
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
  $(commentBlock).hide()
  $(wrapper).removeClass('show-comment__block')
  $(commentText).find('textarea').val('')
  $('body').append(wrapper)
  // $(trackerButton).find('span').text('Add to highlight')
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

    $(wrapper)
      .css('display', 'none').css({
      'left': e.pageX,
      'top': e.pageY - 88,
      'display': 'block'
    }).attr('rel', selection);
  }
}

function _renderErrorHighlight () {
  isSending = false
  // $(highlightButton).find('span').text('Error...!')
  _renderInitialHighlight()
}

function _renderInitialHighlight () {
  // setTimeout(function () {
  //   $(highlightButton).find('span').text('Add to highlight')
  //   $(highlightButton).removeClass('show')
  //   $(highlightButton).css('display', 'none');
  // }, 1000)
  $(highlightButton).find('span').html('').append(highlightIcon)
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
  var start = 0, end = 0;
  var sel, range, priorRange;
  if (typeof window.getSelection != "undefined") {
      range = window.getSelection().getRangeAt(0);
      priorRange = range.cloneRange();
      priorRange.selectNodeContents(element);
      priorRange.setEnd(range.startContainer, range.startOffset);
      start = priorRange.toString().length;
      end = start + range.toString().length;
  } else if (typeof document.selection != "undefined" &&
          (sel = document.selection).type != "Control") {
      range = sel.createRange();
      priorRange = document.body.createTextRange();
      priorRange.moveToElementText(element);
      priorRange.setEndPoint("EndToStart", range);
      start = priorRange.text.length;
      end = start + range.text.length;
  }
  return {
      start: start,
      end: end
  };
}

function postHighlight ({ position = '' }) {
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
        "https://contentkit-api.mstage.io/graphql",
        JSON.stringify({
          query: `
            mutation{
              user{
                userhighlightAddOrUpdateOne(
                  filter:{
                    articleId: "${recordId}"
                  }, record: {
                    highlight: "${highlight}",
                    position: "${position}"
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
        _renderInitialHighlight()
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
        "https://contentkit-api.mstage.io/graphql",
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


$(document).ready(function (e) {
  let position = ''
  $(this).mouseup(function (e) {
    if (stopMouseUp) return
    e.stopPropagation()
    const highlightOffset = getSelectionCharOffsetsWithin(document.body)
    position = parseFloat(highlightOffset.start*100/$(document).height()).toFixed(2)
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
    postHighlight({
      position
    })
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

