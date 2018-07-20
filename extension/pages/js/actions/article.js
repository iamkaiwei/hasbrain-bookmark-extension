function articleCreateIfNotExist (record) {
  return graphql({
    query: `
      mutation ($record: CreateOnearticletypeInput!) {
        user{
          articleCreateIfNotExist(record: $record) {
            recordId
            record {
              tags
              title
              sourceImage
              sourceData {
                sourceImage
              }
            }
            isBookmarked
          }
        }
      }
    `,
    variables: {
      record
    }
  })
}

function userbookmarkCreate(recordId) {
  return graphql({
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
  })
}

function bookmarkArchive (articleId) {
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
  })
}

function bookmarkRemove (articleId) {
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
  })
}


function bookmarkArticle (articleId) {
  return graphql({
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
  })
}

function getBookmarkList () {
  return graphql({
    query: `
      query{
        viewer{
          userbookmarkPagination(
            perPage: 200,
            filter: {
              state: published
            }
          ) {
            items {
              content{
                contentId
              }
            }
          }
        }
      }
    `
  }).then(response => {
    if (response.status !== 200) return
    const result = response.data
    const {
      data: {
        viewer: {
          userbookmarkPagination: { items = [] }
        }
      }
    } = result

    let listUrlBookmarked = []
    items.map(i => i.content && i.content.contentId && listUrlBookmarked.push(i.content.contentId))
    chrome.storage.sync.set({
      'hasbrain_bookmark_list': JSON.stringify(listUrlBookmarked)
    }, function() {  
      var error = chrome.runtime.lastError;  
      if (error) {  
        console.log(error)
      }  
   })
  })
}

function getArticleUser(filter = {}) {
  return graphql({
    query: `
      query($filter: articleUserActionFilter){
        viewer{
          articleUserAction(filter: $filter) {
            _id
            title
            sourceImage
            topicData {
              _id
              privacy
              forkedFrom
              gitlabProjectId
              gitlabUserName
              title
              state
              kind
            }
            sourceData {
              title
              sourceId
              sourceImage
            }
            userCommentData {
              articleId
              comment
              state
              createdAt
              updatedAt
              profileId
              projectId
              wasNew
              isPublic
            }
            userBookmarkData {
              contentId
              kind
              state
              createdAt
              updatedAt
              profileId
              projectId
            }
            userHighlightData {
              articleId
              highlight
              state
              createdAt
              updatedAt
              profileId
              projectId
              wasNew
              isPublic
            }
          }
        }
      }
    `,
    variables: { filter }
  }).then(response => {
    if (response.status !== 200) return
    const result = response.data
    if (!result || result.errors || !result.data) return result
    return {data: result.data.viewer.articleUserAction}
  })
}