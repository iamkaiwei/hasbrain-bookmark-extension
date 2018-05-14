var bookmarkData = {}

function post({query, variables}) {
  return Promise.resolve(true).then(() => {
    return chrome.storage.sync.get('bookmark_token', result => {
      return axios.post(
        "https://contentkit-api.mstage.io/graphql",
        JSON.stringify({
          query,
          variables
        }), {
          headers: {
            'Content-type': 'application/json',
            'authorization': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcm9qZWN0SWQiOiI1YWRmNzRjNzdmZjQ0ZTAwMWViODI1MzkiLCJpYXQiOjE1MjQ1OTM4NjN9.Yx-17tVN1hupJeVa1sknrUKmxawuG5rx3cr8xZc7EyY',
            'usertoken': result.bookmark_token
          }
        }
      )
    })
  })
}

$(document).ready(function() {
  // This callback function is never called, so no response is returned. 
  // But I can see message's sent successfully to event page from logs.
  // chrome.runtime.sendMessage('', {from: 'popup', method:'ping'},
  //   function(response) {
  //     console.log(response)
  //   });
  var bookmarkToken = ''
  chrome.storage.sync.get('bookmark_token', result => bookmarkToken = result.bookmark_token)
  chrome.storage.sync.get('bookmark_data', result => {
    console.log('result', result)
    bookmarkData = JSON.parse(result.bookmark_data)
    console.log(bookmarkToken)
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
        'usertoken': bookmarkToken
      }
    }).then(function (res) {
      if (res.status !== 200) return
      const result = res.data
      if (result && !result.errors) {
        const {data: {user: {articleCreateIfNotExist: {recordId}}}} = result
        console.log('record', recordId)
        axios.post(
          "https://contentkit-api.mstage.io/graphql",
          JSON.stringify({
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
          }), {
          headers: {
            'Content-type': 'application/json',
            'authorization': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcm9qZWN0SWQiOiI1YWRmNzRjNzdmZjQ0ZTAwMWViODI1MzkiLCJpYXQiOjE1MjQ1OTM4NjN9.Yx-17tVN1hupJeVa1sknrUKmxawuG5rx3cr8xZc7EyY',
            'usertoken': bookmarkToken
          }
        }).then(res => {
          console.log('user bookmark create', res)
          if (res.status !== 200) return
          $('#saving__block').hide()
          $('#saved__block').show()
          $('#relative__news').show()

          axios.post(
            "https://contentkit-api.mstage.io/graphql",
            JSON.stringify({
              query: `
                query{
                  viewer{
                    articlePagination(page: 1, perPage: 3) {
                      count
                      items {
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
            }),
            {
              headers: {
                'Content-type': 'application/json',
                'authorization': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcm9qZWN0SWQiOiI1YWRmNzRjNzdmZjQ0ZTAwMWViODI1MzkiLCJpYXQiOjE1MjQ1OTM4NjN9.Yx-17tVN1hupJeVa1sknrUKmxawuG5rx3cr8xZc7EyY',
                'usertoken': bookmarkToken
              }
            }).then(res => {
              if (res.status !== 200) return
              $('#loading__news').hide()
              $('#loaded__news').show()
              const list = res.data.data.viewer.articlePagination.items
              let newsHTMl = ''
              list.map(item => newsHTMl += `
                <div class="news__item">
                  <div class="news__right">
                    <div class='bhTacker___news_thumb' style='background-image: url("${item.sourceImage}")'></div>
                  </div>
                  <div class="news__left">
                    <div class="news__title">
                      <a href='${item.url}' target="_blank">${item.title}</a>
                    </div> 
                  </div>
                </div>
              `)
              $('#loaded__news').append(newsHTMl)

              setTimeout(() => {
                chrome.runtime.sendMessage({action: 'remove-iframe'}, function(response) {
                  console.log(response.farewell);
                });
              }, 10000)
            })

          // setTimeout(() => {
          //   // console.log('setTimeout')
          //   // chrome.runtime.sendMessage({action: 'remove-iframe'}, function(response) {
          //   //   console.log(response.farewell);
          //   // });
          //   $('#loading__news').hide()
          //   $('#loaded__news').show()
          //   setTimeout(() => {
          //     chrome.runtime.sendMessage({action: 'remove-iframe'}, function(response) {
          //       console.log(response.farewell);
          //     });
          //   }, 4000)
          // }, 1000);
          const tags = bookmarkData.tags || []
          $('#tags').importTags(tags.join(','))
        })
      }
    })
  })

  $('#tags').tagsInput();

  // let $ti = s => [].slice.call(document.querySelectorAll(s));
  // let t = $('#tags')[0];
  // t.addEventListener('input', log);
  // t.addEventListener('change', log);
  // function log(e) {
  //   $('#out')[0].textContent = `${e.type}: ${this.value.replace(/,/g,', ')}`;
  // }

  // hook 'em up:
  // $ti('input[type="tags"]').forEach(tagsInput);

})


