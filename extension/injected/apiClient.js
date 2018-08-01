const productionApi = "https://contentkit-api.mstage.io/graphql";
const stagingApi = "https://contentkit-api-staging.mstage.io/graphql";

const authorizationToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcm9qZWN0SWQiOiI1YWRmNzRjNzdmZjQ0ZTAwMWViODI1MzkiLCJpYXQiOjE1MjQ1OTM4NjN9.Yx-17tVN1hupJeVa1sknrUKmxawuG5rx3cr8xZc7EyY";

class ContentkitApiClient {
  constructor(token) {
    this.apiClient = axios.create({
      baseURL: stagingApi,
      headers: {
        'Content-Type': 'application/json',
        authorization: authorizationToken,
        usertoken: token
      },
      transformRequest: [JSON.stringify]
    });
  }
  getOldHighlight(url) {
    return this.apiClient.post("/", {
      query: `
        query {
          viewer {
            articleUserAction(filter: {
              url: "${url}",
            }) {
              _id
              userCommentData {
                articleId
                comment
              }
              userBookmarkData {
                contentId
              }
              userHighlightData {
                articleId
                highlights {
                  _id
                  core
                  prev
                  next
                  serialized
                }
              }
            }
          } 
        }`
    });
  }
  addOrUpdateHighlight(articleId, { core, prev, next, serialized, isPublic }) {
    return this.apiClient.post("/", {
      query: `
        mutation ($prev: String, $next: String, $core: String, $serialized: String, $isPublic: Boolean) {
          user{
            userhighlightAddOrUpdateOne(
              filter:{
                articleId: "${articleId}"
              }, record: {
                core: $core,
                prev: $prev,
                next: $next,
                serialized: $serialized,
                isPublic: $isPublic
              }
            ) {
              recordId
              record {
                highlights {
                  _id
                  core
                  prev
                  next
                  serialized
                }
              }
            }
          }
        }
      `,
      variables: { core, prev, next, serialized, isPublic }
    });
  }

  createArticleIfNotExists({
    title,
    url,
    sourceImage,
    shortDescription,
    readingTime
  }) {
    const bookmarkData = {
      title,
      url,
      sourceImage,
      shortDescription,
      readingTime
    };
    return this.apiClient.post("/", {
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
    });
  }
  removeHighlight(articleId, highlightId) {
    return this.apiClient.post('/', {
      query: `
        mutation {
          user {
            userHighlightRemoveOne(filter: {
              highlightId: "${highlightId}",
              articleId: "${articleId}"
            }) {
              recordId
            }
          }
        }
      `
    })
  }
  userbookmarkCreate(articleId) {
    return this.apiClient.post('/', {
      query: `
        mutation{
          user{
            userbookmarkCreate(record:{
              contentId: "${articleId}",
              kind: "articletype"
            }) {
              recordId
            }
          }
        }
      `
    })
  }
}

const apiClientByToken = {}

function getApiClientByToken(token) {
  if (!apiClientByToken[token]) {
    apiClientByToken[token] = new ContentkitApiClient(token);
  }
  return apiClientByToken[token]
}