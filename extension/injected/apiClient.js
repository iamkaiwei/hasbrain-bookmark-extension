const baseURL = chrome.runtime.getManifest().storage.apiBaseUrl;
const userkitBaseUrl = chrome.runtime.getManifest().storage.userkitBaseUrl;
const authorizationToken = chrome.runtime.getManifest().storage.apiToken;

const topicOutput = `
  title
  privacy
`

const NOT_FOUND = 'NOT_FOUND';

class ContentkitApiClient {
  constructor(token) {
    const validateResponse = responseData => {
      const { data, errors } = responseData;
      if (!data || errors) {
        const error = errors && errors[0] && errors[0].message;
        throw new Error(error || 'NO RESPONSE DATA');
      }
      return data;
    }
    this.apiClient = axios.create({
      baseURL: baseURL,
      headers: {
        'Content-Type': 'application/json',
        authorization: authorizationToken,
        usertoken: token
      },
      transformRequest: [JSON.stringify],
      transformResponse: [JSON.parse, validateResponse]
    });
  }
  
  // -------- highlight ----------
  getOldHighlight(url) {
    return this.apiClient.post("/", {
      query: `
        query {
          viewer {
            contentUserAction(filter: {
              url: "${url}",
            }) {
              _id
              userCommentData {
                contentId
                comment
              }
              userBookmarkData {
                contentId
              }
              userHighlightData {
                contentId
                highlights {
                  _id
                  core
                  prev
                  next
                  serialized
                  comment
                }
              }
            }
          } 
        }`
    })
    .then(response => {
      const { contentUserAction } = response.data.viewer;
      if (!contentUserAction) return Promise.reject(NOT_FOUND);
      return Promise.resolve(contentUserAction);
    });
  }
  addOrUpdateHighlight(articleId, { core, prev, next, serialized, isPublic, comment }) {
    return this.apiClient.post("/", {
      query: `
        mutation ($prev: String, $next: String, $core: String, $serialized: String, $isPublic: Boolean, $comment: String) {
          user{
            userhighlightAddOrUpdateOne(
              filter:{
                contentId: "${articleId}"
              }, record: {
                core: $core,
                prev: $prev,
                next: $next,
                comment: $comment,
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
      variables: { core, prev, next, serialized, isPublic, comment }
    })
    .then(response => {
      const { userhighlightAddOrUpdateOne } = response.data.user;
      if (!userhighlightAddOrUpdateOne) return Promise.reject(NOT_FOUND);
      return Promise.resolve(userhighlightAddOrUpdateOne);
     });
  }
  // -------- highlight ----------

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
        record: bookmarkData
      }
    })
    .then(response => {
      const { articleCreateIfNotExist } = response.data.user;
      if (!articleCreateIfNotExist) return Promise.reject(NOT_FOUND);
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
              contentId: "${articleId}"
            }) {
              recordId
            }
          }
        }
      `
    })
    .then(response => {
      const { userHighlightRemoveOne } = response.data.user;
      if (!userHighlightRemoveOne) return Promise.reject(NOT_FOUND);
      return Promise.resolve(userHighlightRemoveOne);
    });
  }

  // -------- bookmark --------
  userbookmarkCreate(articleId) {
    return this.apiClient.post('/', {
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
    .then(response => {
      const { userbookmarkCreate } = response.data.user;
      if (!userbookmarkCreate) return Promise.reject(NOT_FOUND);
      return Promise.resolve(userbookmarkCreate);
    });
  }

  userBookmarkRemove(articleId) {
    return this.apiClient.post('/', {
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
    .then(response => {
      const { bookmarkRemoveOne } = response.data.user;
      if (!bookmarkRemoveOne) return Promise.reject(NOT_FOUND);
      return Promise.resolve(bookmarkRemoveOne);
    });
  }

  userBookmarkArchive(articleId) {
    return this.apiClient.post('/', {
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
    .then(response => {
      const { bookmarkUpdateOne } = response.data.user;
      if (!bookmarkUpdateOne) return Promise.reject(NOT_FOUND);
      return Promise.resolve(bookmarkUpdateOne);
    });
  }

  getUserBookmarkList() {
    return this.apiClient.post("/", {
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
    })
    .then(response => {
      const { userbookmarkPagination } = response.data.viewer;
      if (!userbookmarkPagination) return Promise.reject(NOT_FOUND);
      return Promise.resolve(userbookmarkPagination);
    });;
  }

  getArticleUser(filter = {}) {
    return this.apiClient.post("/", {
      query: `
        query($filter: contentUserActionFilter){
          viewer{
            contentUserAction(filter: $filter) {
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
                contentId
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
                contentId
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
    })
    .then(response => {
      const { contentUserAction } = response.data.viewer;
      if (!contentUserAction) return Promise.reject(NOT_FOUND);
      return Promise.resolve(contentUserAction);
    });;
  }
  // -------- bookmark --------

  // -------- topic --------
  searchTopics({text}) {
    return this.apiClient.post("/", {
      query: `
        query {
          viewer {
            topicSearch(
              query: {
                bool: {
                  must: [
                    {
                      query_string: {
                        query: "${text}",
                        default_operator: or
                      }
                    },
                    {
                      term: {
                        state: {
                          value: "published"
                        }
                      }
                    }
                  ]
                }
              },
              limit: 20,
              skip: 0
            ) {
              count
              hits{
                _id
                _source {
                  title
                  privacy
                }
              }
            }
          }
        }
      `
    })
    .then(response => {
      const { topicSearch } = response.data.viewer;
      if (!topicSearch) return Promise.reject(NOT_FOUND);
      return Promise.resolve(topicSearch);
    });
  }

  getUserTopics() {
    return this.apiClient.post("/", {
      query: `
        query{
          viewer{
            topicSearchUser {
              count
              hits {
                _id
                _source {
                  title
                  privacy
                }
              }
            }
          }
        }
      `
    })
    .then(response => {
      const { topicSearchUser } = response.data.viewer;
      if (!topicSearchUser) return Promise.reject(NOT_FOUND);
      return Promise.resolve(topicSearchUser);
    });
  }

  articleAddTopic({articleId = '', topicId = '', levelId = ''}) {
    return this.apiClient.post('/', {
      query:`
        mutation{
          user{
            articleAddTopic(record: {
              topicId: "${topicId}",
              levelId: "${levelId}"
            }, filter: {
              _id: "${articleId}",
            }) {
              _id
            }
          }
        }
      `
    })
    .then(response => {
      const { articleAddTopic } = response.data.user;
      if (!articleAddTopic) return Promise.reject(NOT_FOUND);
      return Promise.resolve(articleAddTopic);
    });
  }

  topicAddContent({ articleId = '' ,topicId = '' }) {
    return this.apiClient.post('/', {
      query: `
        mutation{
          user{
            topicAddContent(record: {
              contentId: "${articleId}"
            }, filter: {
              _id: "${topicId}"
            }) {
              _id
              ${topicOutput}
            }
          }
        }`
    })
    .then(response => {
      const { topicAddContent } = response.data.user;
      if (!topicAddContent) return Promise.reject(NOT_FOUND);
      return Promise.resolve(topicAddContent);
    });
  }

  topicRemoveContent({ articleId = '' ,topicId = '' }) {
    return this.apiClient.post('/', {
      query: `
        mutation{
          user{
            topicRemoveContent(record: {
              contentId: "${articleId}"
            }, filter: {
              _id: "${topicId}"
            }) {
              _id
              ${topicOutput}
            }
          }
        }
      `
    })
    .then(response => {
      const { topicRemoveContent } = response.data.user;
      if (!topicRemoveContent) return Promise.reject(NOT_FOUND);
      return Promise.resolve(topicRemoveContent);
    });
  }

  topicUpdate({topicId = '', record = {}}) {
    return this.apiClient.post('/', {
      query: `
        mutation ($record: UpdateOnetopictypeInput!) {
          user {
            topicUpdateOne(
              record: $record,
              filter: {
                _id: "${topicId}"
              }
            ) {
              recordId
            }
          }
        }
      `,
      variables: {
        record
      }
    })
    .then(response => {
      const { topicUpdateOne } = response.data.user;
      if (!topicUpdateOne) return Promise.reject(NOT_FOUND);
      return Promise.resolve(topicUpdateOne);
    });
  }

  topicCreate({title = '', privacy = 'private'}) {
    return this.apiClient.post('/', {
      query: `
        mutation {
          user {
            topicCreate(
              record: {
                title: "${title}",
                privacy: ${privacy}
              }
            ) {
              recordId
              record {
                privacy
                _id
                title
              }
            }
          }
        }
      `
    })
    .then(response => {
      const { topicCreate } = response.data.user;
      if (!topicCreate) return Promise.reject(NOT_FOUND);
      return Promise.resolve(topicCreate);
    });
  }
  // -------- topic --------

  // -------- common --------
  getLevels() {
    return this.apiClient.post("/", {
      query: `
      query{
        viewer{
          levelMany {
            _id
            title
            levelNumber
          }
        }
      }
    `
    })
    .then(response => {
      const { levelMany } = response.data.viewer;
      if (!levelMany) return Promise.reject(NOT_FOUND);
      return Promise.resolve(levelMany);
    });
  }

  postComment({ articleId = '', comment = '', isPublic = false}) {
    return this.apiClient.post("/", {
      query: `
        mutation ($comment: String) {
          user {
            userCommentCreateOrUpdate(record: {
              contentId: "${articleId}",
              comment: $comment,
              isPublic: ${isPublic}
            }) {
              recordId
              record {
                isPublic
              }
            }
          }
        }
      `, variables: { comment }
    })
    .then(response => {
      const { userCommentCreateOrUpdate } = response.data.user;
      if (!userCommentCreateOrUpdate) return Promise.reject(NOT_FOUND);
      return Promise.resolve(userCommentCreateOrUpdate);
    });
  }
  // -------- common --------

  getYoutubeData({videoId = ''}) {
    return this.apiClient.post('/', {
      query: `
        query{
          viewer{
            youtubeSearchVideo(contentId: "${videoId}") {
              title
              shortDescription
              sourceImage
              contentId
              url
              sourceActionName
              sourceActionCount
              sourceCommentCount
              sourceImage
            }
          }
        }
      `
    }).then(response => {
      const { youtubeSearchVideo } = response.data.viewer;
      if (!youtubeSearchVideo) return Promise.reject(NOT_FOUND);
      return Promise.resolve(youtubeSearchVideo);
    })
  }

  contentCreateIfNotExist(record = {}) {
    return this.apiClient.post('/', {
      query: `
        mutation ($record: CreateOnecontenttypeInput!) {
          user {
            contentCreateIfNotExist (record: $record) {
              recordId
              record {
                tags
                title
                sourceImage
              }
              isBookmarked
            }
          }
        }
      `,
      variables: {
        record
      }
    }).then(response => {
      const { contentCreateIfNotExist } = response.data.user;
      if (!contentCreateIfNotExist) return Promise.reject(NOT_FOUND);
      return Promise.resolve(contentCreateIfNotExist);
    });
  }
}

ContentkitApiClient.NOT_FOUND =  NOT_FOUND;

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