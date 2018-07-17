const topicOutput = `
  title
  privacy
`

function searchTopics ({text}) {
  return graphql({
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
  }).then(res => {
    if (res.status !== 200) {
      return res
    }
    console.log('res', res)
    const result = res.data
    console.log(result)
    if (!result || result.errors) return result
    return { data: result.data.viewer.topicSearch }
  })
}

function articleAddTopic({articleId = '', topicId = '', levelId = ''}) {
  return graphql({
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
}

function articleAddTopicsLevel({articleId = '', topicIds = [], levelId = ''}) {
  return graphql({
    query:`
      mutation ($topicIds: [ID]){
        user{
          articleAddTopicsLevel(record: {
            topicIds: $topicIds,
            levelId: "${levelId}"
          }, filter: {
            _id: "${articleId}",
          }) {
            title
          }
        }
      }
    `, variables: {topicIds}
  })
}

function getUserTopics() {
  return graphql({
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
  }).then(res => {
    if (res.status !== 200) {
      return res
    }
    const result = res.data

    if (!result || result.errors) return result
    return { data: result.data.viewer.topicSearchUser }
  })
}

function topicAddContent({articleId = '' ,topicId = '', levelId = ''}) {
  return graphql({
    query: `
      mutation{
        user{
          topicAddContent(record: {
          contentId: "${articleId}"
            levelId: "${levelId}"
          }, filter: {
            _id: "${topicId}"
          }) {
            _id
            ${topicOutput}
          }
        }
      }
    
    `
  }).then(res => {
    if (res.status !== 200) {
      return res
    }
    const result = res.data

    if (!result || result.errors) return result
    return { data: result.data.user.topicAddContent }
  })
}

function topicRemoveContent({articleId = '' ,topicId = '', levelId = ''}) {
  return graphql({
    query: `
      mutation{
        user{
          topicRemoveContent(record: {
          contentId: "${articleId}"
            levelId: "${levelId}"
          }, filter: {
            _id: "${topicId}"
          }) {
            _id
            ${topicOutput}
          }
        }
      }
    
    `
  }).then(res => {
    if (res.status !== 200) {
      return res
    }
    const result = res.data

    if (!result || result.errors) return result
    return { data: result.data.user.topicRemoveContent }
  })
}

function topicUpdate({topicId = '', record = {}}) {
  return graphql({
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
  }).then(res => {
    if (res.status !== 200) {
      return res
    }
    const result = res.data

    if (!result || result.errors) return result
    return { data: result.data.user.topicUpdateOne }
  })
}

function topicCreate({title = '', privacy = 'private'}) {
  return graphql({
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
  }).then(res => {
    if (res.status !== 200) {
      return res
    }
    const result = res.data

    if (!result || result.errors) return result
    return { data: result.data.user.topicCreate }
  })
}