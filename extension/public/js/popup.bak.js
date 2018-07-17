var bookmarkData = {}
var toRemoveIframe = null
var articleId = ''
var profile = {}
var levels = []
var selectedLevel = {}
var currentTopicId = ''
var toComment = null
var topicIds = []
var isExecuting = false
function listSearch ({text, limit = 10, skip = 0, operator = 'or'}) {
  return graphql({
    query: `
      query {
        viewer {
          listSearchUser(
            query: {
              bool: {
                must: {
                  query_string: {
                    query: "${text}",
                    default_operator: ${operator}
                  }
                }
              }
            },
            limit: ${limit},
            skip: ${skip}
          ) {
            count
            items: hits {
              data: fromMongo {
                _id
                title
              }
            }
          }
        }
      }
    `
  }).then(res => {
    if (res.status !== 200) {
      return
    }
    const result = res.data
    if (result && !result.errors) return {data: result.data.viewer.listSearchUser}
    return result
  })
}

function listUpdate (listId) {
  return graphql({
    query: `
      mutation ($record: addContentRecordInput, $filter: addContentFilterInput) {
        user {
          listAddContent (
            record: $record,
            filter: $filter
          ) {
            _id
          }
        }
      }
    `,
    variables: {
      record: {
        contentId: articleId
      },
      filter: {
        _id: listId
      }
    }
  }).then(res => {
    console.log('res', res)
    if (res.status !== 200)  {
      tagRemove(title)
      return
    }
    const result = res.data
    if (!result || result.errors )  {
      tagRemove(title)
      return
    }
  }).catch(() => tagRemove(listId))
}

function listCreate (title) {
  const searchSeries = $('#search_list')
  
  return graphql({
    query: `
      mutation {
        user {
          listCreate (record: {
            title: "${title}"
            contentIds: ["${articleId}"]
          }) {
            recordId
          }
        }
      }
    `
  }).then(res => {
    if (res.status !== 200) {
      tagRemove(title)
      return
    }
    const result = res.data
    if (!result || result.errors)  {
      tagRemove(title)
      return
    }
    if (searchSeries.find('> a.ui.label').attr('data-value') === title) {
      searchSeries.find('> a.ui.label').attr('data-value', result.data.user.listCreate.recordId)
    }
  }).catch(() => tagRemove(title))
}

function tagRemove (value) {
  // remove tag list when update or create failed
  const targetIndex = topicIds.indexOf(value)
  topicIds.splice(targetIndex, 1)
  const searchSeries = $('#search_list')
  searchSeries.find(`> a.ui.label[data-value="${value}"]`).remove()
  searchSeries.find(`.menu > .item[data-value="${value}"]`).removeClass('filtered').removeClass('active')
  searchSeries.find('.menu .item').remove('selected')
}

function listRemove (id) {
  return graphql({
    query: `
      mutation ($record: removeContentRecordInput, $filter: removeContentFilterInput) {
        user {
          listRemoveContent (
            record: $record,
            filter: $filter
          ) {
            _id
          }
        }
      }
    `,
    variables: {
      record: {
        contentIds: [articleId]
      },
      filter: {
        _id: id
      }
    }
  }).then(res => {
    console.log('res', res)
  })
}

function _renderExecuting (text) {
  isExecuting = false
  $('.popup__title-status').html('').append(`<div class="ui active inline loader tiny"></div> &nbsp; ${text}`)
}

function _renderSuccess (text) {
  isExecuting = false
  $('.popup__title-status').html('').append(`${text}`)
}

function _renderError (text) {
  console.log('render error', text)
  isExecuting = false
  $('.popup__title-status').html('').append(`<i class="exclamation triangle icon"></i> &nbsp; ${text}`)
}

$(document).ready(function() {
  chrome.storage.sync.get(['bookmark_profile', 'bookmark_data'], result => {
    bookmarkData = JSON.parse(result.bookmark_data || '{}')
    profile = JSON.parse(result.bookmark_profile)
    const record = {...bookmarkData}
    _renderExecuting('page saving')
    articleCreateIfNotExist(record).then(function (res) {
      if (res.status !== 200) return
      const result = res.data
      console.log(result)
      if (!result || result.errors) {
        return
      }
      const { data: { user: { articleCreateIfNotExist: { recordId } } } } = result
      articleId = recordId
      userbookmarkCreate(recordId).then(res => {
        if (res.status !== 200) {
          _renderError('Error bookmark!')
          return
        }
        _renderSuccess('page saved')
        $('#save-to-topics').checkbox('set unchecked')

        // change extension icon when bookmark successfully
        chrome.runtime.sendMessage({action: 'change-icon'});
        getBookmarkList()
      }).catch(err => {
        console.log(err)
        _renderError('Error bookmark!')
      })
    }).catch((err) => {
      console.log(err)
      _renderError('Error bookmark!')
    })
  })

  $( document ).hover(
    function(){
      // $('#tracker-progress').addClass('progress--pause')
      // $('#tracker-progress').removeClass('progress--running')
      if (toRemoveIframe) {
        clearTimeout(toRemoveIframe)
        toRemoveIframe = null
      }
    },
    function(){
      // $('#tracker-progress').addClass('progress--running')
      // $('#tracker-progress').removeClass('progress--pause')
      if (toRemoveIframe) {
        clearTimeout(toRemoveIframe)
        toRemoveIframe = null
      }
      toRemoveIframe = setTimeout(() => {
        // chrome.runtime.sendMessage({action: 'remove-iframe'});
      }, 5000)
    }
  );

  // remove iframe
  $('#remove__iframe').click(() => {
    chrome.runtime.sendMessage({action: 'remove-iframe'});
  })


  $('#save-to-topics').checkbox({
    onChecked: function () {
      // updateProfile({hideRecommend: false})
      $('.series__block').addClass('show-saving')
      $('.relative__path').show()
    },
    onUnchecked: function () {
      // updateProfile({hideRecommend: true})
      $('.series__block').removeClass('show-saving')
      $('.relative__path').hide()
    }
  })
  // init dropdown search list
  $('#search_list.ui.dropdown').dropdown({
    forceSelection: false,
    allowAdditions: false,
    onRemove: (removedValue, removedText) => {
      // console.log('remove', removedValue, removedText)
      tagRemove(removedValue)
    }
  });
  

  // search list event
  const searchSeries = $('#search_list')
  let toSearchSeries = null
  $('.ui.dropdown .search').keyup(function () {
    if (!searchSeries.hasClass('loading')) searchSeries.addClass('loading')
    const text = $(this).val()
    if (toSearchSeries) {
      clearTimeout(toSearchSeries)
      toSearchSeries = null
    }
    toSearchSeries = setTimeout(() => {
      searchTopics({text}).then(result => {
        searchSeries.removeClass('loading')
        console.log('result')
        if (!result || result.errors) return
        const {count, hits: items} = result.data

        console.log('data', items)

        if (items.length) {
          searchSeries.find('.menu').html('')
        }
        items.map( ({_id, _source}) => {
          const menuItem = $(`
          <div class="item" data-value="${_id}">${_source.title}</div>
        `)
          $(menuItem).click(function(e) {
            if (topicIds.indexOf(_id) === -1) {
              topicIds.push(_id)
            }
          })
          searchSeries.find('.menu').append(menuItem)
          return true
        })
      }).catch(() => {
        searchSeries.removeClass('loading')
      })
    }, 350)
  })
  let toShowDropdown = null
  $('#setting__block').hover(
    function () {
      if (toShowDropdown) {
        clearTimeout(toShowDropdown)
        toShowDropdown = null
      }
      $(this).addClass('show')
    },
    function () {
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
    $('#series__section, #relative__path').remove()

    _renderExecuting('Bookmark Archiving...')
    bookmarkArchive(articleId).then(res => {
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
      chrome.runtime.sendMessage({action: 'change-icon-outline'});
      getBookmarkList()
    }).catch(() => {
      _renderError('Bookmark Archive Error!')
    })
  })
  $('#remove__bookmark').click(() => {
    $('#setting__block').removeClass('show')
    $('#series__section, #relative__path, #setting__block').remove()
    _renderExecuting('Bookmark removing...')
    bookmarkRemove(articleId).then(res => {
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
      chrome.runtime.sendMessage({action: 'change-icon-outline'});
      getBookmarkList()
    }).catch(() => {
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
    
    levels.map(level => {
      const difficulty__level = $(`
        <span class="difficulty__level">
          <span class="point"></span>
        </span>
      `)
      $(difficulty__level).attr('level-title', level.title).attr('level-id', level._id)
      $(difficulty__level).click(function(e) {
        const _this = this
        selectedLevel = level
        $('#difficulty__title').text(level.title)
        $('.difficulty__level').removeClass('active')
        $(_this).addClass('active')
      })

      $(difficulty__levels).prepend(difficulty__level)
      return true
    })
    setTimeout(() => {
      $('#difficulty__block').show()
    }, 500)
    $('#difficulty__title').text(levels[0].title)
    selectedLevel = levels[0]
    $('#difficulty__levels > *:last-child').addClass('active')
  })

  $('#comment__public').click(function(e) {
    if (isExecuting) return
    _renderExecuting('page saving...')
    $(this).addClass('loading')
    Promise.all([
      articleAddTopicsLevel({
        articleId,
        topicIds,
        levelId: selectedLevel._id
      }),
      $('#comment__text').val().length ? postComment({
        articleId,
        comment: $('#comment__text').val(),
        isPublic: true
      }) : {status: 200, data: {}}
    ])
    .then(res => {
      $(this).removeClass('loading')
      const [res1, res2] = res
      if (res1.status !== 200 || res2.status !== 200) {
        _renderError('page saved error!')
        return
      }
      const result1 = res1.data
      const result2 = res2.data
      if (!result1 || result1.errors || !result2 || result2.errors) {
        _renderError('page saved error!')
        return
      }
      _renderSuccess('page saved')
    }).catch(() => {
      $(this).removeClass('loading')
      _renderError('page saved error!')
    })
  })

})


