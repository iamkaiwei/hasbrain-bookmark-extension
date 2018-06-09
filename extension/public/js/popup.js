var bookmarkData = {}
var toRemoveIframe = null
var articleId = ''
var articleQuery = `
  query{
    viewer{
      articleRecommend(page: 1, perPage: 3) {
        items {
          id: _id
          url
          title
          longDescription
          shortDescription
          readingTime
          state
          custom
          author
          sourceId
          sourceName
          sourceImage
          sourceCreateAt
          createdAt
          updatedAt
          projectId
        }
      }
    }
  }
`
var profile = {}

function graphql({query, variables}) {
  return new Promise(function(resolve, reject) {
    chrome.storage.sync.get('bookmark_token', function(items) {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
        reject(chrome.runtime.lastError.message);
      } else {
        resolve(items.bookmark_token);
      }
    });
  }).then(token => {
    return axios.post(
      "https://contentkit-api.mstage.io/graphql",
      JSON.stringify({
        query,
        variables
      }), {
        headers: {
          'Content-type': 'application/json',
          'authorization': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcm9qZWN0SWQiOiI1YWRmNzRjNzdmZjQ0ZTAwMWViODI1MzkiLCJpYXQiOjE1MjQ1OTM4NjN9.Yx-17tVN1hupJeVa1sknrUKmxawuG5rx3cr8xZc7EyY',
          'usertoken': token
        }
      }
    )
  });
}

function bookmarkArticle (articleId) {
  $(`#${articleId}`).toggleClass('news--bookmarking')
  graphql({
    query: `
      mutation{
        user{
          userbookmarkCreate(record:{
            contentId: "${articleId}"
          }) {
            recordId
          }
        }
      }
    `
  }).then(res => {
    $(`#${articleId}`).toggleClass('news--bookmarking')
    if (res.status !== 200) {
      return
    }
    const result = res.data
    if (result && !result.errors) {
      $(`#${articleId}`).toggleClass('news--bookmarked')
    }
  }).catch(() => $(`#${articleId}`).toggleClass('news--bookmarking'))
}

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

function _handleUpdateTags () {
  graphql({
    query: `
      mutation ($id: String, $tags: [String]) {
        user {
          articleUpdateTags (
            id: $id,
            tags: $tags
          )
        }
      }
    `,
    variables: {
      id: articleId,
      tags: $('#tags').val().length ? $('#tags').val().split(',') : []
    }
  }).then(res => {
    console.log('update tags', res)
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

function bookmarkArchive () {
  return graphql({
    query: `
      mutation {
        user {
          bookmarkUpdateOne (
            record: {
              state: ${'archived'}
            },
            filter: {
              contentId: "${articleId}"
            }
          ) {
            recordId
          }
        }
      }
    `
  }).then(res => {
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
}

function bookmarkRemove () {
  return graphql({
    query: `
      mutation {
        user {
          bookmarkRemoveOne (
            filter: {
              contentId: "${articleId}"
            }
          ) {
            recordId
          }
        }
      }
    `
  }).then(res => {
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
}

$(document).ready(function() {
  // This callback function is never called, so no response is returned. 
  // But I can see message's sent successfully to event page from logs.
  // chrome.runtime.sendMessage('', {from: 'popup', method:'ping'},
  //   function(response) {
  //     console.log(response)
  //   });
  chrome.storage.sync.get(['bookmark_profile', 'bookmark_data'], result => {
    bookmarkData = JSON.parse(result.bookmark_data || '{}')
    profile = JSON.parse(result.bookmark_profile)
    const record = {...bookmarkData}
    delete record.tags
    delete record.innerText
    
    graphql({
      query: `
        mutation ($record: CreateOnearticletypeInput!) {
          user{
            articleCreateIfNotExist(record: $record) {
              recordId
              record {
                tags
              }
              isBookmarked
            }
          }
        }
      `,
      variables: {
        record
      }
    }).then(function (res) {
      if (res.status !== 200) return
      const result = res.data
      console.log(result)
      if (!result || result.errors) {
        return
      }
      const { data: { user: { articleCreateIfNotExist: { recordId } } } } = result
      articleId = recordId

      // get article tags
      graphql({
        query: `
          query {
            viewer {
              usertagOne (
                filter: {
                  articleId: "${articleId}"
                }
              ) {
                tags
              }
            }
          }
        `
      }).then(res => {
        if (res.status !== 200) return
        const result = res.data
        if (!result || result.errors) return
        console.log('rest', result)
        const { data: { viewer: { usertagOne } } } = result
        if (!usertagOne) {
          // console.log('bookmarktaggs', bookmarkData.tags)
          $('#tags').importTags(bookmarkData.tags.join(','))
          _handleUpdateTags()
          return
        }
        const { tags = [] } = usertagOne
        console.log('tags', tags)
        $('#tags').importTags(tags.join(','))
      })
      // get article tags

      graphql({
        query: `
          mutation{
            user{
              userbookmarkCreate(record:{
                contentId: "${recordId}",
                kind: "articletype"
              }) {
                recordId
              }
            }
          }
        `
      }).then(res => {
        $('#saving__block').hide()
        if (res.status !== 200) {
          $('#save__error').show()
          return
        }
        $('#saved__block').show()
        
        !profile.hideRecommend && $('#relative__news').show()
        !profile.hideRecommend && graphql({
          query: articleQuery
        }).then(res => {
          $('#loading__news').hide()
          if (res.status !== 200) {
            $('#load__news__error').show()
            return
          }
          $('#loaded__news').show()
          const list = res.data.data.viewer.articleRecommend.items

          let newsHTMl = ''
          list.map(item => {
            const newsItem = $(`<div class="news__item" id="${item.id}">
              <div class="news__right">
                <div class='bhTacker___news_thumb' style='background-image: url("${item.sourceImage}")'></div>
              </div>
            </div>`)
            const newsLeft = $(`<div class="news__left">
              <div class="news__title">
                <a href='${item.url}' target="_blank">${item.title || item.url}</a>
              </div>
            </div>`)
            const newsActions = $(`<div class="news__actions">`)
            const bookmarkLink = $(`<div class="news__bookmark">
              <div class="initial">
                <i class="bookmark outline icon"></i> Save
                </div>
              <div class="loading">
                <div class="ui active inline loader mini"></div> &nbsp; Saving
                </div>
              <div class="done">
                <i class="bookmark icon"></i> Saved
              </div>
            </div>`)
            $(bookmarkLink).click(e => {
              e.preventDefault()
              bookmarkArticle(item.id)
            })

            $(bookmarkLink).appendTo(newsActions)
            $(newsActions).appendTo(newsLeft)
            $(newsLeft).appendTo(newsItem)
            $(newsItem).appendTo($('#loaded__news'))
          })
          if (list.length === 0) {
            $('#loaded__news').append(`
              <div>Not found any recommend news</div>
            `)
          }
          return true
        }).catch((err) => {
          $('#loading__news').hide()
          $('#load__news__error').show()
        })
        // const tags = bookmarkData.tags || []
        // $('#tags').importTags(tags.join(','))
      }).catch(() => {
        $('#saving__block').hide()
        $('#save__error').show()
      })
    }).catch(() => {
      $('#saving__block').hide()
      $('#save__error').show()
    })
    // chrome.storage.sync.remove('bookmark_data')    
  })

  $('#tags').tagsInput({
    'onAddTag': _handleUpdateTags,
    'onRemoveTag': _handleUpdateTags
  });

  $( document ).hover(
    function(){
      // console.log( "mouseEnter" );
      $('#tracker-progress').addClass('progress--pause')
      $('#tracker-progress').removeClass('progress--running')
      if (toRemoveIframe) {
        clearTimeout(toRemoveIframe)
        toRemoveIframe = null
      }
    },
    function(){
      // console.log( "mouseLeave" );
      $('#tracker-progress').addClass('progress--running')
      $('#tracker-progress').removeClass('progress--pause')
      if (toRemoveIframe) {
        clearTimeout(toRemoveIframe)
        toRemoveIframe = null
      }
      toRemoveIframe = setTimeout(() => {
        chrome.runtime.sendMessage({action: 'remove-iframe'}, function(response) {
          // console.log(response.farewell);
          // callback message
        });
      }, 4000)
    }
  );

  // remove iframe
  $('#remove__iframe').click(() => {
    chrome.runtime.sendMessage({action: 'remove-iframe'}, function(response) {
      // console.log(response.farewell);
      // callback message
    });
  })


  // init dropdown search list
  $('.ui.dropdown').dropdown({
    forceSelection: false,
    allowAdditions: true,
    hideAdditions: false,
    // onChange: (value, text) => console.log('on change', value, text),
    onAdd: (addedValue, addedText, $addedChoice) => {
      // console.log('on add new', addedValue, addedText, $addedChoice.attr('data-value'))
      if (addedValue === addedText) {
        // console.log('create new')
        listCreate(addedText)
      } else {
        // console.log('updates')
        listUpdate(addedValue)
      }
    },
    onRemove: (removedValue, removedText) => {
      // console.log('remove', removedValue, removedText)
      listRemove(removedValue)
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
      listSearch({text}).then(result => {
        searchSeries.removeClass('loading')
        if (!result || result.errors) return
        const {items} = result.data
        // console.log('items, ', items)
        searchSeries.find('.menu > .item:not(.addition)').remove()
        items.map(item => searchSeries.find('.menu').append(`
          <div class="item" data-value="${item.data._id}">${item.data.title}</div>
        `))
      }).catch(() => {
        searchSeries.removeClass('loading')
      })
    }, 500)
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
      }, 350)
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
    bookmarkArchive()
  })
  $('#remove__bookmark').click(() => {
    $('#setting__block').removeClass('show')
    $('#save__section, #relative__news').remove()
    $('#archive__block').hide()
    $('#remove__block').show()
    $('#removing').show()
    bookmarkRemove()
  })

  $('#setting__btn').click(() => {
    window.open(`chrome-extension://${chrome.runtime.id}/pages/options.html`)
  })
})


