const productionApi = "https://contentkit-api.mstage.io/graphql";
const stagingApi = "https://contentkit-api-staging.mstage.io/graphql";

const userkitBaseUrl = 'https://userkit-identity.mstage.io/v1';

const authorizationToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcm9qZWN0SWQiOiI1YWRmNzRjNzdmZjQ0ZTAwMWViODI1MzkiLCJpYXQiOjE1MjQ1OTM4NjN9.Yx-17tVN1hupJeVa1sknrUKmxawuG5rx3cr8xZc7EyY";

class ContentkitApiClient {
  constructor(token) {
    const validateResponse = responseData => {
      const { data, errors } = responseData;
      if (!data || errors) {
        const error = errors && errors[0]
        throw new Error(error || 'NO RESPONSE DATA');
      }
      return data;
    }
    this.apiClient = axios.create({
      baseURL: stagingApi,
      headers: {
        'Content-Type': 'application/json',
        authorization: authorizationToken,
        usertoken: token
      },
      transformRequest: [JSON.stringify],
      transformResponse: [JSON.parse, validateResponse]
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
    })
    .then(response => {
      const { articleUserAction } = response.data.viewer;
      if (!articleUserAction) return Promise.reject('NOT_FOUND');
      return Promise.resolve(articleUserAction);
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
    })
    .then(response => {
      const { userhighlightAddOrUpdateOne } = response.data.user;
      if (!userhighlightAddOrUpdateOne) return Promise.reject('NOT_FOUND');
      return Promise.resolve(userhighlightAddOrUpdateOne);
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
    })
    .then(response => {
      const { articleCreateIfNotExist } = response.data.user;
      if (!articleCreateIfNotExist) return Promise.reject('NOT_FOUND');
      return Promise.resolve(articleCreateIfNotExist);
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
    .then(response => {
      const { userHighlightRemoveOne } = response.data.user;
      if (!userHighlightRemoveOne) return Promise.reject('NOT_FOUND');
      return Promise.resolve(userHighlightRemoveOne);
    });
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
    .then(response => {
      const { userbookmarkCreate } = response.data.user;
      if (!userbookmarkCreate) return Promise.reject('NOT_FOUND');
      return Promise.resolve(userbookmarkCreate);
    });
  }
}

class UserkitApiClient {
  constructor(token) {
    const validateResponse = responseData => {
      if (!responseData) throw new Error('NO RESPONSE DATA');
      return responseData;
    }
    this.apiClient = axios.create({
      baseURL: userkitBaseUrl,
      headers: {
        'Content-Type': 'application/json',
       ' X-USERKIT-TOKEN': token
      },
      transformRequest: [JSON.stringify],
      transformResponse:  [JSON.parse, validateResponse],
    });
  }

  getNewToken() {
    return this.apiClient.post('/tokens/refresh')
    .then(response => {
      const { data } = response;
      return data;
    })
  }

  updateProfile(profileId, profileData) {
    return this.apiClient.put(`/profiles/${profileId}`, profileData)
    .then(response => {
      const { data } = response;
      return data;
    });
  }
}

const apiClientByToken = {}

function getApiClientByToken(token) {
  if (!apiClientByToken[token]) {
    apiClientByToken[token] = new ContentkitApiClient(token);
  }
  return apiClientByToken[token]
}

const userkitApiClientByToken = {}

function getUserkitApiClientByToken(token) {
  if (!userkitApiClientByToken[token]) {
    userkitApiClientByToken[token] = new UserkitApiClient(token);
  }
  return userkitApiClientByToken[token]
}