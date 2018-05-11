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
          // setTimeout(() => {
          //   console.log('setTimeout')
          //   chrome.runtime.sendMessage({action: 'remove-iframe'}, function(response) {
          //     console.log(response.farewell);
          //   });
          // }, 4000);
          const tags = bookmarkData.tags || []
          $('#tags').importTags(tags.join(','))
          // let tagsHTML = ''
          // tags.map(tag => tagsHTML += `
        //   <div class="ui tiny label">${tag}</div>
          // `)
          // $('#tags__block').append(tagsHTML)
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


