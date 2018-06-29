function articleCreateIfNotExist (record) {
  return graphql({
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