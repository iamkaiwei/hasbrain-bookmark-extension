const productionApi = 'https://contentkit-api.mstage.io/graphql'
const stagingApi = 'https://contentkit-api-staging.mstage.io/graphql'
function graphql({query, variables}) {
  return new Promise(function(resolve, reject) {
    chrome.storage.sync.get('bookmark_token', function(items) {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
        reject(chrome.runtime.lastError.message);
      } else {
        resolve(items);
      }
    });
  }).then(result => {
    token = result.bookmark_token
    return axios.post(
      stagingApi,
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