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

function _renderPageSaving () {
  isExecuting = true
  $('.saved__block-title').html('').append('<div class="ui active inline loader tiny"></div> &nbsp; PAGE SAVING')
}

function _renderPageSavedError () {
  isExecuting = false
  $('.saved__block-title').html('').append('<i class="exclamation triangle icon"></i> &nbsp; PAGE SAVED ERROR')
}

function _renderPageSaved () {
  isExecuting = false
  $('.saved__block-title').html('').append('PAGE SAVED')
}

$(document).ready(function() {
  chrome.storage.sync.get(['bookmark_profile', 'bookmark_data'], result => {
    bookmarkData = JSON.parse(result.bookmark_data || '{}')
    profile = JSON.parse(result.bookmark_profile)
    const record = {...bookmarkData}
    // delete record.tags
    // delete record.innerText
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
        $('#saving__block').hide()
        if (res.status !== 200) {
          $('#save__error').show()
          return
        }
        $('#saved__block').show()
        $('#save-to-topics').checkbox('set unchecked')
      }).catch(() => {
        $('#saving__block').hide()
        $('#save__error').show()
      })
    }).catch(() => {
      $('#saving__block').hide()
      $('#save__error').show()
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
        chrome.runtime.sendMessage({action: 'remove-iframe'});
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
            !isExecuting && _renderPageSaving()
            if (topicIds.indexOf(_id) === -1) {
              topicIds.push(_id)
            }
            articleAddTopicsLevel({
              articleId,
              topicIds,
              levelId: selectedLevel._id
            }).then(res => {
              console.log('xxxx',res)
              if (res.status !== 200) {
                _renderPageSavedError()
                tagRemove(_id)
                return
              }
              const result = res.data
              if (!result || result.errors) {
                _renderPageSavedError()
                tagRemove(_id)
                return
              }
              currentTopicId = _id
              _renderPageSaved()
            }).catch(err => {
              console.log(err)
              _renderPageSavedError()
              tagRemove(_id)
            })
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
    $('#save__section, #relative__news').remove()
    $('#remove__block').hide()
    $('#archive__block').show()
    $('#archiving').show()
    bookmarkArchive(articleId).then(res => {
      $('#archiving').hide()
      if (res.status !== 200) {
        $('#archived__error').show()
        return
      }
      const result = res.data
      if (!result || result.errors) {
        $('#archived__error').show()
        return
      }
      $('#archived').show()
    }).catch(() => {
      $('#archiving').hide()
      $('#archived__error').show()
    })
  })
  $('#remove__bookmark').click(() => {
    $('#setting__block').removeClass('show')
    $('#save__section, #relative__news').remove()
    $('#archive__block').hide()
    $('#remove__block').show()
    $('#removing').show()
    bookmarkRemove(articleId).then(res => {
      $('#removing').hide()
      if (res.status !== 200) {
        $('#removed__error').show()
        return
      }
      const result = res.data
      if (!result || result.errors) {
        $('#removed__error').show()
        return
      }
      $('#setting__block').remove()
      $('#removed').show()
    }).catch(() => {
      $('#removing').hide()
      $('#removed__error').show()
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
        _renderPageSaving()
        articleAddTopicsLevel({
          articleId,
          topicIds,
          levelId: selectedLevel._id
        }).then(res => {
          if (res.status !== 200) {
            _renderPageSavedError()
            return
          }
          const result = res.data
          if (!result || result.errors) {
            _renderPageSavedError()
            return
          }
          $('#difficulty__title').text(level.title)
          $('.difficulty__level').removeClass('active')
          $(_this).addClass('active')
          _renderPageSaved()
        }).catch(() => {
          _renderPageSavedError()
        })
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

  $('#comment__text').keyup(function(e) {
    const comment = $(this).val()
    !isExecuting && _renderPageSaving()
    if (toComment) {
      clearTimeout(toComment)
      toComment = null
    }
    toComment = setTimeout(() => {
      postComment({
        articleId,
        comment
      }).then(res => {
        if (res.status !== 200) {
          _renderPageSavedError()
          return
        }
        const result = res.data
        if (!result || result.errors) {
          _renderPageSavedError()
          return
        }
        _renderPageSaved()
      }).catch(() => {
        _renderPageSavedError()
      })
    }, 300)
  })

})


