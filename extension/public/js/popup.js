var token = ''
var bookmarkData = {}
var toRemoveIframe = null
var article = {}
var articleId = ''
var profile = {}
var levels = []
var selectedLevel = {}
var currentTopicId = ''
var toComment = null
var topicIds = []
var isExecuting = false
var userTopics = []
var selectedTopicIds = []
var searchTopicText = ''
var isPublicComment = false
var worldImg = '/assets/images/world.png'
var worldImgWrapper = '/assets/images/world-2.png'
var lockImg = '/assets/images/lock.png'
var lockImgWrapper = '/assets/images/lock-2.png'
var enableAddNew = false
var newTopicPrivacy = false
function _renderExecuting(text) {
  isExecuting = false
  $('.popup__title-status')
    .html('')
    .append(`<div class="ui active inline loader tiny"></div> &nbsp; ${text}`)
}

function _renderSuccess(text) {
  isExecuting = false
  $('.popup__title-status')
    .html('')
    .append(`${text}`)
}

function _renderError(text) {
  isExecuting = false
  $('.popup__title-status')
    .html('')
    .append(`<i class="exclamation triangle icon"></i> &nbsp; ${text}`)
}

function getAllTopics() {
  getUserTopics().then(result => {
    if (!result || result.errors) return
    const { count, hits = [] } = result.data
    const topicList = $('#topic__list')
    userTopics = hits
  })
}

function _buildTopicList() {
  const topicList = $('#topic__list')
  let list = [...userTopics]
  if (searchTopicText.length) {
    list = userTopics.filter(i =>
      ((i._source && i._source.title) || '')
        .toLowerCase()
        .includes(searchTopicText.toLowerCase())
    )
    if (list.length === 0) enableAddNew = true
  }
  $(topicList).html('')
  if (list.length === 0 && searchTopicText.length) {
    const addnew = $(
      `<div class="topic__add">Add new topic <b>${searchTopicText}</b></div>`
    )
    $(addnew).click(function() {
      $(topicList).append(
        '<div class="ui dimmer active inverted" id="topic__loading"><div class="ui loader"></div></div>'
      )
      topicCreate({
        title: searchTopicText
      }).then(result => {
        if (!result || result.errors) {
          $('#topic__loading').remove()
          $('#topic__error').show().find('span').text(result.errors[0].message || 'Error Add New Topic')
          setTimeout(() => {
            $('#topic__error').hide().find('span').text('')
          }, 1500)
          return
        }
        $('.topic__add').remove()
        searchTopicText = ''
        $('#topic_search > input').val('')

        const { record } = result.data
        userTopics.unshift({ _id: record._id, _source: record })
        _buildTopicList()
        topicAddContent({
          articleId,
          topicId: record._id,
          levelId: selectedLevel._id
        }).then(result => {
          if (!result || result.errors) return
          selectedTopicIds.push(record._id)
          _buildTopicList()
        })
      })
    })
    $(topicList).append(addnew)
  }

  list.map(item => {
    const { _source = {} } = item
    const topic = $(`<div class="topic"></div>`)
    const topicPrivacyImg = _source.privacy === 'everyone' ? worldImg : lockImg
    const topicPrivacy = $(
      `<div class="topic__privacy" data-privacy="${_source.privacy ||
        'private'}"><img alt="" src="${topicPrivacyImg}"></div>`
    )
    const topicCheckbox = $(`
      <div class="ui checkbox">
        <input type="checkbox">
        <label></label>
      </div>.
    `)

    // register event
    $(topic).click(function(e) {
      e.preventDefault()
      e.stopPropagation()
      let isChecked = false
      if (
        $(this)
          .find('.ui.checkbox')
          .hasClass('checked')
      ) {
        isChecked = false
        topicRemoveContent({
          articleId,
          topicId: item._id,
          levelId: selectedLevel._id
        })
          .then(result => {
            if (!result || result.errors) {
              $(this)
                .find('.ui.checkbox')
                .checkbox(`set checked`)
              return
            }
            const index = selectedTopicIds.indexOf(item._id)
            selectedTopicIds.splice(index, 1)
          })
          .catch(err => {
            $(this)
              .find('.ui.checkbox')
              .checkbox(`set checked`)
          })
      } else {
        isChecked = true
        topicAddContent({
          articleId,
          topicId: item._id,
          levelId: selectedLevel._id
        })
          .then(result => {
            if (!result || result.errors) {
              $(this)
                .find('.ui.checkbox')
                .checkbox(`set unchecked`)
              return
            }
            selectedTopicIds.push(item._id)
          })
          .catch(err => {
            $(this)
              .find('.ui.checkbox')
              .checkbox(`set unchecked`)
          })
      }
      $(this)
        .find('.ui.checkbox')
        .checkbox(`set ${isChecked ? 'checked' : 'unchecked'}`)
    })
    $(topicPrivacy).click(function(e) {
      e.preventDefault()
      e.stopPropagation()
      const privacy = $(this).attr('data-privacy')
      let img = ''
      let newPrivacy = ''
      if (privacy === 'everyone') {
        img = lockImg
        newPrivacy = 'private'
      } else {
        img = worldImg
        newPrivacy = 'everyone'
      }

      const tokenDecode = jwt_decode(token)
      if (!tokenDecode.role || tokenDecode.role !== 'contributor') {
        $('#topic__error').show().find('span').text('Only contributor can public the topic')
        setTimeout(() => {
          $('#topic__error').hide().find('span').text('')
        }, 1500)
      } else {
        // update topic privacy
        topicUpdate({
          topicId: item._id,
          record: {
            privacy: newPrivacy
          }
        }).then(result => {
          if (!result || result.errors) {
            $(this)
              .find('img')
              .attr('src', newPrivacy === 'private' ? worldImg : lockImg)
            $(this).attr(
              'data-privacy',
              newPrivacy === 'private' ? 'everyone' : 'private'
            )
            return
          }
        }).catch(err => {
          $(this)
            .find('img')
            .attr('src', newPrivacy === 'private' ? worldImg : lockImg)
          $(this).attr(
            'data-privacy',
            newPrivacy === 'private' ? 'everyone' : 'private'
          )
        })
        // update topic privacy
        $(this)
          .find('img')
          .attr('src', img)
        $(this).attr('data-privacy', newPrivacy)
      }
    })
    $(topic).append(topicPrivacy)
    $(topic).append(
      `<div class="topic__title">${_source.title || 'xxxx'}</div>`
    )
    $(topic).append(topicCheckbox)
    $(topic)
      .find(topicCheckbox)
      .checkbox(
        `set ${
          selectedTopicIds.indexOf(item._id) !== -1 ? 'checked' : 'unchecked'
        }`
      )
    $(topicList).append(topic)
  })

  if (list.length || searchTopicText.length) {
    $(topicList).addClass('has-shadow')
  } else {
    $(topicList).removeClass('has-shadow')
  }
}

function _bookmarkArticle() {
  articleCreateIfNotExist(bookmarkData)
  .then(function(res) {
    if (res.status !== 200) return
    const result = res.data
    if (!result || result.errors) {
      return
    }
    const {
      data: {
        user: {
          articleCreateIfNotExist: {
            recordId,
            record: { sourceImage, title, sourceData }
          }
        }
      }
    } = result
    articleId = recordId
    userbookmarkCreate(recordId)
      .then(res => {
        if (res.status !== 200) {
          _renderError('Error bookmark!')
          return
        }
        _renderSuccess('page saved')
        $('#save-to-topics').checkbox('set unchecked')
        $('#series__section').show()
        $('#review__title').text(title)
        $('#review__image').css({
          'background-image': `url(${sourceImage})`
        })
        $('#review__source-image').css({
          'background-image': `url(${(sourceData &&
            sourceData.sourceImage) ||
            '/assets/images/hasbrain-logo-grey.png'})`
        })
        _buildTopicList()

        // change extension icon when bookmark successfully
        chrome.runtime.sendMessage({ action: 'change-icon' })
        // getBookmarkList()
      })
      .catch(err => {
        console.log(err)
        _renderError('Error bookmark!')
      })
  })
  .catch(err => {
    console.log(err)
    _renderError('Error bookmark!')
  })
}

function _buildOldData () {
  const { userCommentData, title, sourceImage, sourceData, topicData, userBookmarkData } = article
  const commentData = userCommentData || []
  const {comment = '', isPublic = false} = commentData

  if (!userBookmarkData) {
    // TODO: bookmark article again if it is NULL
    userbookmarkCreate(articleId)
  }

  topicData && topicData.map(topic => selectedTopicIds.push(topic._id))

  $('#save-to-topics').checkbox('set unchecked')
  $('#series__section').show()
  $('#review__title').text(title)
  $('#review__image').css({
    'background-image': `url(${sourceImage})`
  })
  $('#review__source-image').css({
    'background-image': `url(${(sourceData &&
      sourceData.sourceImage) ||
      '/assets/images/hasbrain-logo-grey.png'})`
  })
  chrome.runtime.sendMessage({ action: 'change-icon' })

  // set comment data
  $('#comment__text').val(comment)
  $('#comment__privacy img').attr('src', isPublic ? worldImgWrapper : lockImgWrapper)
  $('#comment__privacy span').text(isPublic ? 'Share to public' : 'Share to private')
  $('#comment__privacy').attr('data-privacy', isPublic ? 'public' : 'private')
}

$(document).ready(function() {
  chrome.storage.sync.get(['bookmark_profile', 'bookmark_data', 'bookmark_token'], result => {
    bookmarkData = JSON.parse(result.bookmark_data || '{}')
    profile = JSON.parse(result.bookmark_profile)
    token = result.bookmark_token
    const record = { ...bookmarkData }
    _renderExecuting('page saving')
    getAllTopics()
    getArticleUser({
      url: record.url
    }).then(result => {
      if (result.data === null) return _bookmarkArticle()
      _renderSuccess('page saved')
      article = result.data
      articleId = article._id
      _buildOldData()
      // Get all user topics
      _buildTopicList()
      // Get all user topics
    }).catch(err => {
      console.log(err)
      _renderError('Error bookmark!')
    })

  })

  $(document).hover(
    function() {
      if (toRemoveIframe) {
        clearTimeout(toRemoveIframe)
        toRemoveIframe = null
      }
    },
    function() {
      if (toRemoveIframe) {
        clearTimeout(toRemoveIframe)
        toRemoveIframe = null
      }
      toRemoveIframe = setTimeout(() => {
        // chrome.runtime.sendMessage({action: 'remove-iframe'});
      }, 5000)
    }
  )

  // remove iframe
  $('#remove__iframe').click(() => {
    chrome.runtime.sendMessage({ action: 'remove-iframe' })
  })

  $('#new-topic__privacy').checkbox({
    onChecked: function() {
      newTopicPrivacy = true
    },
    onUnchecked: function() {
      newTopicPrivacy = false
    }
  })

  const topicList = $('#topic__list')
  let toSearchTopic = null
  $('#topic_search > input').keyup(function() {
    if (enableAddNew) enableAddNew = false
    // if (!$('#topic_search').hasClass('loading'))
    //   $('#topic_search').addClass('loading')
    searchTopicText = $(this).val()
    if (toSearchTopic) {
      clearTimeout(toSearchTopic)
      toSearchTopic = null
    }
    toSearchTopic = setTimeout(() => {
      $('#topic_search').removeClass('loading')
      _buildTopicList()
    }, 350)
  })

  let toShowDropdown = null
  $('#setting__block').hover(
    function() {
      if (toShowDropdown) {
        clearTimeout(toShowDropdown)
        toShowDropdown = null
      }
      $(this).addClass('show')
    },
    function() {
      if (toShowDropdown) {
        clearTimeout(toShowDropdown)
        toShowDropdown = null
      }
      toShowDropdown = setTimeout(() => {
        $(this).removeClass('show')
      }, 150)
    }
  )
  $('.setting__item').click(() => {
    $('#setting__block').removeClass('show')
  })
  $('#archive__bookmark').click(() => {
    $('#setting__block').removeClass('show')
    $('#series__section').remove()

    _renderExecuting('Bookmark Archiving...')
    bookmarkArchive(articleId)
      .then(res => {
        if (res.status !== 200) {
          _renderError('Bookmark Archive Error!')
          return
        }
        const result = res.data
        if (!result || result.errors) {
          _renderError('Bookmark Archive Error!')
          return
        }
        _renderSuccess('Bookmark archived')
        chrome.runtime.sendMessage({ action: 'change-icon-outline' })
        getBookmarkList()
      })
      .catch(() => {
        _renderError('Bookmark Archive Error!')
      })
  })
  $('#remove__bookmark').click(() => {
    $('#setting__block').removeClass('show')
    $('#series__section, #setting__block').remove()
    _renderExecuting('Bookmark removing...')
    bookmarkRemove(articleId)
      .then(res => {
        if (res.status !== 200) {
          _renderError('Bookmark Remove Error!')
          return
        }
        const result = res.data
        if (!result || result.errors) {
          _renderError('Bookmark Remove Error!')
          return
        }
        _renderSuccess('Bookmark removed')
        // change icon outline when remove bookmark
        chrome.runtime.sendMessage({ action: 'change-icon-outline' })
        getBookmarkList()
      })
      .catch(() => {
        _renderError('Bookmark Remove Error!')
      })
  })

  $('#setting__btn').click(() => {
    window.open(`chrome-extension://${chrome.runtime.id}/pages/options.html`)
  })

  const difficulty__levels = $('#difficulty__levels')

  getLevels().then(result => {
    if (!result || result.errors) return
    levels = result.data

    // levels.map(level => {
    //   const difficulty__level = $(`
    //     <span class="difficulty__level">
    //       <span class="point"></span>
    //     </span>
    //   `)
    //   $(difficulty__level).attr('level-title', level.title).attr('level-id', level._id)
    //   $(difficulty__level).click(function(e) {
    //     const _this = this
    //     selectedLevel = level
    //     $('#difficulty__title').text(level.title)
    //     $('.difficulty__level').removeClass('active')
    //     $(_this).addClass('active')
    //   })

    //   $(difficulty__levels).prepend(difficulty__level)
    //   return true
    // })
    // setTimeout(() => {
    //   $('#difficulty__block').show()
    // }, 500)
    // $('#difficulty__title').text(levels[0].title)
    selectedLevel = levels[0]
    // $('#difficulty__levels > *:last-child').addClass('active')
  })

  $('#comment__public').click(function(e) {
    if (isExecuting) return
    _renderExecuting('page saving...')
    $(this).addClass('loading')
    postComment({
      articleId,
      comment: $('#comment__text').val(),
      isPublic: isPublicComment
    })
      .then(res => {
        $(this).removeClass('loading')
        if (res.status !== 200) {
          _renderError('page saved error!')
          return
        }
        const result = res.data
        if (!result || result.errors) {
          _renderError('page saved error!')
          return
        }
        _renderSuccess('page saved')
      })
      .catch(() => {
        $(this).removeClass('loading')
        _renderError('page saved error!')
      })
  })

  $('#comment__privacy').click(function(e) {
    const privacy = $(this).data('privacy')
    if (privacy === 'private') {
      $(this).data('privacy', 'public')
      $(this)
        .find('img')
        .attr('src', worldImgWrapper)
      $(this)
        .find('span')
        .text('Share to public')
      isPublicComment = true
    } else if (privacy === 'public') {
      $(this).data('privacy', 'private')
      isPublicComment = false
      $(this)
        .find('img')
        .attr('src', lockImgWrapper)
      $(this)
        .find('span')
        .text('Share to private')
    }
  })

  $('#show-topic__button').click(function () {
    $(this).addClass('active')
    $('#show-comment__button').removeClass('active')
    $('#series__block').show()
    $('#comment__section').hide()
  })

  $('#show-comment__button').click(function () {
    $(this).addClass('active')
    $('#show-topic__button').removeClass('active')
    $('#series__block').hide()
    $('#comment__section').show()
  })
})
