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
      return
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
