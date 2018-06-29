var bookmarkData = {}
var toRemoveIframe = null
var articleId = ''
var profile = {}

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
  const searchSeries = $('#search_list')
  searchSeries.find(`> a.ui.label[data-value="${value}"]`).remove()
  searchSeries.find('.menu .item').remove('selected')
  searchSeries.find(`.menu > .item[data-value="${value}"]`).removeClass('filtered').removeClass('active')
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


$(document).ready(function() {
  chrome.storage.sync.get(['bookmark_profile', 'bookmark_data'], result => {
    bookmarkData = JSON.parse(result.bookmark_data || '{}')
    profile = JSON.parse(result.bookmark_profile)
    const record = {...bookmarkData}
    delete record.tags
    delete record.innerText
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

  // $( document ).hover(
  //   function(){
  //     $('#tracker-progress').addClass('progress--pause')
  //     $('#tracker-progress').removeClass('progress--running')
  //     if (toRemoveIframe) {
  //       clearTimeout(toRemoveIframe)
  //       toRemoveIframe = null
  //     }
  //   },
  //   function(){
  //     $('#tracker-progress').addClass('progress--running')
  //     $('#tracker-progress').removeClass('progress--pause')
  //     if (toRemoveIframe) {
  //       clearTimeout(toRemoveIframe)
  //       toRemoveIframe = null
  //     }
  //     toRemoveIframe = setTimeout(() => {
  //       chrome.runtime.sendMessage({action: 'remove-iframe'});
  //     }, 4000)
  //   }
  // );

  // remove iframe
  $('#remove__iframe').click(() => {
    chrome.runtime.sendMessage({action: 'remove-iframe'});
  })



  $('#save-to-topics').checkbox({
    onChecked: function () {
      // updateProfile({hideRecommend: false})
      $('.series__block').addClass('show-saving')
    },
    onUnchecked: function () {
      // updateProfile({hideRecommend: true})
      $('.series__block').removeClass('show-saving')
    }
  })
  // init dropdown search list
  $('.ui.dropdown').dropdown({
    forceSelection: false,
    allowAdditions: false,
    // hideAdditions: false,
    // onChange: (value, text) => console.log('on change', value, text),
    onAdd: (addedValue, addedText, $addedChoice) => {
      // console.log('on add new', addedValue, addedText, $addedChoice.attr('data-value'))
      if (addedValue === addedText) {
        // console.log('create new')
        // listCreate(addedText)
      } else {
        console.log('updates', addedValue)
        // listUpdate(addedValue)
        articleAddTopic({
          articleId,
          topicId: addedValue
        }).then(res => {
          if (res.status !== 200) {
            tagRemove(addedValue)
            return
          }
          const result = res.data
          if (!result || result.errors) {
            tagRemove(addedValue)
            return
          }
        }).catch(err => {
          console.log(err)
          tagRemove(addedValue)
        })
      }
    },
    onRemove: (removedValue, removedText) => {
      // console.log('remove', removedValue, removedText)
      // listRemove(removedValue)
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
        items.map( ({_id, _source}) => searchSeries.find('.menu').append(`
          <div class="item" data-value="${_id}">${_source.title}</div>
        `))
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
})


