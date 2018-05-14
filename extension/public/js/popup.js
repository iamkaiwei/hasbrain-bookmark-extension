var bookmarkData = {}
var toRemoveIframe = null

var articleQuery = `
  query{
    viewer{
      articlePagination(page: 1, perPage: 3) {
        count
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
  console.log('bookmark', articleId)
  $(`#${articleId}`).toggleClass('news--bookmarking')
  graphql({
    query: `
      mutation{
        user{
          userbookmarkCreate(record:{
            articleId: "${articleId}"
          }) {
            recordId
          }
        }
      }
    `
  }).then(res => {
    console.log('bookmark res', res)
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

$(document).ready(function() {
  // This callback function is never called, so no response is returned. 
  // But I can see message's sent successfully to event page from logs.
  // chrome.runtime.sendMessage('', {from: 'popup', method:'ping'},
  //   function(response) {
  //     console.log(response)
  //   });
  // var bookmarkToken = ''
  // chrome.storage.sync.get('bookmark_token', result => bookmarkToken = result.bookmark_token)
  chrome.storage.sync.get('bookmark_data', result => {
    // console.log('result', result)
    bookmarkData = JSON.parse(result.bookmark_data)
    // console.log(bookmarkToken)
    graphql({
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
    }).then(function (res) {
      if (res.status !== 200) return
      const result = res.data
      if (result && !result.errors) {
        const {data: {user: {articleCreateIfNotExist: {recordId}}}} = result
        console.log('record', recordId)
        graphql({
          query: `
            mutation{
              user{
                userbookmarkCreate(record:{
                  articleId: "${recordId}"
                }) {
                  recordId
                }
              }
            }
          `
        }).then(res => {
          console.log('user bookmark create', res)
          $('#saving__block').hide()
          if (res.status !== 200) {
            $('#save__error').show()
            return
          }
          $('#saved__block').show()
          $('#relative__news').show()

          graphql({
            query: articleQuery
          }).then(res => {
            $('#loading__news').hide()
            if (res.status !== 200) {
              $('#load__news__error').show()
              return
            }
            $('#loaded__news').show()
            const list = res.data.data.viewer.articlePagination.items

            let newsHTMl = ''
            list.map(item => {
              const newsItem = $(`<div class="news__item" id="${item.id}">
                <div class="news__right">
                  <div class='bhTacker___news_thumb' style='background-image: url("${item.sourceImage}")'></div>
                </div>
              </div>`)
              const newsLeft = $(`<div class="news__left">
                <div class="news__title">
                  <a href='${item.url}' target="_blank">${item.title}</a>
                </div>
              </div>`)
              const newsActions = $(`<div class="news__actions">`)
              const bookmarkLink = $(`<div class="news__bookmark">
                <div class="initial">
                  <i class="bookmark outline icon"></i> Bookmark
                  </div>
                <div class="loading">
                  <div class="ui active inline loader mini"></div> &nbsp; Bookmarking
                  </div>
                <div class="done">
                  <i class="bookmark icon"></i> Bookmarked
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
          }).catch(() => {
            $('#loading__news').hide()
            $('#load__news__error').show()
          })
          const tags = bookmarkData.tags || []
          $('#tags').importTags(tags.join(','))
        }).catch(() => {
          $('#saving__block').hide()
          $('#save__error').show()
        })
      }
    })
  })

  $('#tags').tagsInput({
    'onAddTag': (e) => {
      console.log('val', $('#tags').val())
    },
    'onRemoveTag': (e) => {
      console.log('val', $('#tags').val())
    }
  });

  $( document ).hover(
    function(){
      console.log( "mouseEnter" );
      if (toRemoveIframe) {
        clearTimeout(toRemoveIframe)
        toRemoveIframe = null
      }
    },
    function(){
      console.log( "mouseLeave" );
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
})


