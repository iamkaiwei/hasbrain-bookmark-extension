chrome.storage.sync.get(['bookmark_token'], result => {
  const token = result.bookmark_token || ''
  // check article exist or not
  const headers = {
    'Content-type': 'application/json',
    'authorization': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcm9qZWN0SWQiOiI1YWRmNzRjNzdmZjQ0ZTAwMWViODI1MzkiLCJpYXQiOjE1MjQ1OTM4NjN9.Yx-17tVN1hupJeVa1sknrUKmxawuG5rx3cr8xZc7EyY',
    'usertoken': token
  }
  axios.post(
    "https://contentkit-api.mstage.io/graphql",
    JSON.stringify({
      query: `
        query{
          viewer{
            articleOne(filter: {
              contentId: "${document.location.href}"
                _operators: {
                state: {
                  in: [published, unpublished]
                }
              }
            }) {
              _id
              userBookmarkCount
              userHighlightCount
            }
          }
        }
      `
    }), {
    headers
  }).then(response => {
    if (response.status !== 200) return
    const result = response.data
    if (!result || result.errors) return
    const {
      data: {
        viewer: {
          articleOne
        }
      }
    } = result
    if (!articleOne) return
    const { _id } = articleOne
    // check article is bookmark or not
    axios.post(
      "https://contentkit-api.mstage.io/graphql",
      JSON.stringify({
        query: `
          query{
            viewer{
              userbookmarkOne(filter: {
                contentId: "${_id}"
              }) {
                contentId
                kind
                createdAt
                state
                updatedAt
                profileId
                projectId
              }
            }
          }
        `
      }), {
      headers
    }).then(response => {
      if (response.status !== 200) return
      const result = response.data
      if (!result || result.errors) return
      const {
        data: {
          viewer: {
            userbookmarkOne
          }
        }
      } = result
      if (!userbookmarkOne) return
      chrome.runtime.sendMessage({action: 'change-icon'});
      // chrome.tabs.getCurrent(tab => {
      //   chrome.browserAction.setIcon({
      //     path: '/assets/images/hasbrain-logo-full.png',
      //     tabId: tab.id
      //   })
      // })
    })
  })
})