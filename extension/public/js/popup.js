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
  setTimeout(() => {
    // $('#saving').hide()
    // $('#saved').show()
    chrome.runtime.sendMessage('ldmmlifmnkjmikleigigbkffoamjakji', {action: 'hello'})
  }, 500);
  // This callback function is never called, so no response is returned. 
  // But I can see message's sent successfully to event page from logs.
  // chrome.runtime.sendMessage('', {from: 'popup', method:'ping'},
  //   function(response) {
  //     console.log(response)
  //   });
  // var bookmarkToken = '', bookmarkData = {}
  // chrome.storage.sync.get('bookmark_token', result => bookmarkToken = result.bookmark_token)
  // chrome.storage.sync.get('bookmark_data', result => {
  //   console.log('result', result)
  //   bookmarkData = JSON.parse(result.bookmark_data)
  //   console.log(bookmarkToken)
  //   axios.post(
  //     "https://contentkit-api.mstage.io/graphql",
  //     JSON.stringify({
  //       query: `
  //         mutation ($record: CreateOnearticletypeInput!) {
  //           user{
  //             articleCreateIfNotExist(record: $record) {
  //               recordId
  //             }
  //           }
  //         }
  //       `,
  //       variables: {
  //         record: bookmarkData
  //       }
  //     }), {
  //     headers: {
  //       'Content-type': 'application/json',
  //       'authorization': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcm9qZWN0SWQiOiI1YWRmNzRjNzdmZjQ0ZTAwMWViODI1MzkiLCJpYXQiOjE1MjQ1OTM4NjN9.Yx-17tVN1hupJeVa1sknrUKmxawuG5rx3cr8xZc7EyY',
  //       'usertoken': bookmarkToken
  //     }
  //   }).then(function (res) {
  //     if (res.status !== 200) return
  //     const result = res.data
  //     if (result && !result.errors) {
  //       const {data: {user: {articleCreateIfNotExist: {recordId}}}} = result
  //       console.log('record', recordId)
  //       axios.post(
  //         "https://contentkit-api.mstage.io/graphql",
  //         JSON.stringify({
  //           query: `
  //             mutation{
  //               user{
  //                 userbookmarkCreate(record:{
  //                   articleId: "${recordId}"
  //                 }) {
  //                   recordId
  //                 }
  //               }
  //             }
  //           `
  //         }), {
  //         headers: {
  //           'Content-type': 'application/json',
  //           'authorization': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcm9qZWN0SWQiOiI1YWRmNzRjNzdmZjQ0ZTAwMWViODI1MzkiLCJpYXQiOjE1MjQ1OTM4NjN9.Yx-17tVN1hupJeVa1sknrUKmxawuG5rx3cr8xZc7EyY',
  //           'usertoken': bookmarkToken
  //         }
  //       }).then(res => {
  //         console.log('user bookmark create', res)
  //         if (res.status !== 200) return
  //       })
  //     }
  //   })
  // })
})


