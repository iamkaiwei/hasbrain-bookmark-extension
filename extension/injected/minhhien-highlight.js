function _renderErrorHighlight(err) {
  console.log('ERROR');
}

// const productionApi = 'https://contentkit-api.mstage.io/graphql'
// const stagingApi = 'https://contentkit-api-staging.mstage.io/graphql'
function getProfileFromStorage() {
  return new Promise(function(resolve, reject) {
    chrome && chrome.storage.sync.get(['bookmark_profile', 'bookmark_token', 'bookmark_hide_circle_highlight'], function(items) {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError.message);
      } else {
        resolve(items);
      }
    })
  });
}
function postHighlight ({ serialized, highlight }) {
  var photo = null, description = null,
  og = document.querySelector("meta[property='og:image']"),
  des = document.querySelector("meta[name='description']"),
  keywork = document.querySelector("meta[name='keywords']"),
  title = document.querySelector("title").innerText,
  h1s = document.getElementsByTagName("h1"),
  h2s = document.getElementsByTagName("h2"),
  h3s = document.getElementsByTagName("h3"),
  readingTime = document.body.innerText.split(" ").length / 230,
  url = document.location.href,
  // highlight = $(wrapper).attr('rel'),
  h1 = [], h2 = [], h3 = [], keywords = null

  for (var o = 0; o < h1s.length; o++) {h1.push(h1s[o].innerText);}
  for (var j = 0; j < h2s.length; j++) {h2.push(h2s[j].innerText);}
  for (var k = 0; k < h3s.length; k++) {h3.push(h3s[k].innerText);}
  if (des !== null) description = des.getAttribute("content")
  if (og !== null) photo = og.getAttribute("content")

  const data = {
    title,
    url,
    sourceImage: photo,
    shortDescription: description,
    // tags: keywords.tags,
    readingTime
  }
  getProfileFromStorage().then((result) => {
    const { bookmark_token: token } = result
    var bookmarkData = data      
    axios.post(
      stagingApi,
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
        'usertoken': token
      }
    }).then((res) => {
      if (res.status !== 200) {
        _renderErrorHighlight()
        return
      }
      const result = res.data
      if (!result || result.errors) {
        _renderErrorHighlight()
        return
      }
      const {data: {user: {articleCreateIfNotExist: {recordId}}}} = result
      axios.post(
        stagingApi,
        JSON.stringify({
          query: `
            mutation ($highlight: String, $serialized: String) {
              user{
                userhighlightAddOrUpdateOne(
                  filter:{
                    articleId: "${recordId}"
                  }, record: {
                    highlight: $highlight,
                    serialized: $serialized
                  }
                ) {
                  recordId
                }
              }
            }
          `, variables: { highlight, serialized }
        }), {
        headers: {
          'Content-type': 'application/json',
          'authorization': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcm9qZWN0SWQiOiI1YWRmNzRjNzdmZjQ0ZTAwMWViODI1MzkiLCJpYXQiOjE1MjQ1OTM4NjN9.Yx-17tVN1hupJeVa1sknrUKmxawuG5rx3cr8xZc7EyY',
          'usertoken': token
        }
      }).then((res) => {
        if (res.status !== 200) {
          _renderErrorHighlight()
          return
        }
        const result = res.data
        if (!result || result.errors) {
          _renderErrorHighlight()
          return
        }
        // $(highlightButton).find('span').text('Success!')
        _renderSuccessHighlight()
      }).catch(() => {
        _renderErrorHighlight()
      })
    }).catch(() => {
      _renderErrorHighlight()
    })
  });
  
}

function getHighlighter() {
  if (!window.minhhienHighlighter) {
    const HIGHLIGHT_NAME = 'highlight-hasbrain';
    rangy.init();
    const highlighter = rangy.createHighlighter(document, 'TextRange');
    highlighter.addClassApplier(rangy.createClassApplier(HIGHLIGHT_NAME, {
      ignoreWhiteSpace: true,
      tagNames: ["span", "a"]
    }));
    window.minhhienHighlighter = highlighter
    window.HIGHLIGHT_NAME = HIGHLIGHT_NAME
  }
  return {
    highlighter: window.minhhienHighlighter,
    highlighterName: window.HIGHLIGHT_NAME
  }
}

(function(){
  const { highlighter, highlighterName } = getHighlighter();
  highlighter.highlightSelection(highlighterName)
  const serialized = highlighter.serialize();
  // const serialized = JSON.stringify(rangy.getSelection().getBookmark());
  const highlight = Array.from(document.getElementsByClassName(highlighterName)).reduce((total, ele) => `${total}$${highlighterName}$${ele.innerText}`, "");
  postHighlight ({ serialized, highlight })
})()