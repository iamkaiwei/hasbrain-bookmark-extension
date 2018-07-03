function getLevels() {
  return graphql({
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
  }).then(res => {
    if (res.status !== 200) {
      return
    }
    console.log('res', res)
    const result = res.data
    console.log(result)
    if (!result || result.errors) return result
    return { data: result.data.viewer.levelMany }
  })
}

function postComment({articleId = '', comment = ''}) {
  return graphql({
    query: `
      mutation ($comment: String) {
        user {
          userCommentCreate(record: {
            articleId: "${articleId}",
            comment: $comment
          }) {
            recordId
          }
        }
      }
    `, variables: { comment }
  })
}