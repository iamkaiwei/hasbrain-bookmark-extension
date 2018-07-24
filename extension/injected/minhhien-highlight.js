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
  //   const HIGHLIGHT_NAME = 'highlight-hasbrain';
  //   rangy.init();
  //   const highlighter = rangy.createHighlighter(document, 'TextRange');
  //   highlighter.addClassApplier(rangy.createClassApplier(HIGHLIGHT_NAME, {
  //     ignoreWhiteSpace: true,
  //     tagNames: ["span", "a"]
  //   }));
  //   window.minhhienHighlighter = highlighter
  //   window.HIGHLIGHT_NAME = HIGHLIGHT_NAME
    window.minhhienHighlighter = new window.HighlightHelper();
  }
  // return {
  //   highlighter: window.minhhienHighlighter,
  //   highlighterName: window.HIGHLIGHT_NAME
  // }
  return window.minhhienHighlighter
}

(function(){
  // const { highlighter, highlighterName } = getHighlighter();
  // highlighter.highlightSelection(highlighterName)
  // const serialized = highlighter.serialize();
  // // const serialized = JSON.stringify(rangy.getSelection().getBookmark());
  // const highlight = Array.from(document.getElementsByClassName(highlighterName)).reduce((total, ele) => `${total}$${highlighterName}$${ele.innerText}`, "");
  // postHighlight ({ serialized, highlight })
  // const highlightHelper = new window.HighlightHelper();
  const highlightHelper = getHighlighter();

  // selection = document.getSelection()
  // isBackwards = highlightHelper.rangeUtil.isSelectionBackwards(selection)
  // focusRect = highlightHelper.rangeUtil.selectionFocusRect(selection)
  // if (!focusRect) {
  //   return
  // }
  // if (!selection.rangeCount || selection.getRangeAt(0).collapsed) {
  //   highlightHelper.selectedRanges = [] 
  // } else {
  //   highlightHelper.selectedRanges = [selection.getRangeAt(0)];
  // }
  // console.log(highlightHelper.createHighlight());
  
  highlightHelper.restoreHighlightFromTargets(JSON.parse(`[{"source":"https://blog.hackster.io/are-floppy-disks-dead-technology-eb680cc60afc","selector":[{"type":"FragmentSelector","value":"e732","conformsTo":"https://tools.ietf.org/html/rfc3236"},{"type":"RangeSelector","startContainer":"/div[1]/div[2]/div[1]/main[1]/article[1]/div[1]/section[1]/div[2]/div[1]/p[9]","startOffset":0,"endContainer":"/div[1]/div[2]/div[1]/main[1]/article[1]/div[1]/section[1]/div[2]/div[1]/p[9]","endOffset":280},{"type":"TextPositionSelector","start":2856,"end":3136},{"type":"TextQuoteSelector","exact":"In any case the folks at Strudelsoft have left me feeling a bit paranoid about the fate of 3.5-inch floppies, and I’m starting to feel that not only should I hang on to my last USB floppy drive for a little bit longer, maybe I should pick up a spare while the going is still good?","prefix":"ow ‘retro’ has me a bit worried.","suffix":"While I’m feeling paranoid, anyo"}]}]`))
})()