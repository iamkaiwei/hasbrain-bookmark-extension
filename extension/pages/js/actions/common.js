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
    const result = res.data
    if (!result || result.errors) return result
    return { data: result.data.viewer.levelMany }
  })
}

function postComment({articleId = '', comment = '', isPublic = false}) {
  return graphql({
    query: `
      mutation ($comment: String) {
        user {
          userCommentCreateOrUpdate(record: {
            articleId: "${articleId}",
            comment: $comment,
            isPublic: ${isPublic}
          }) {
            recordId
          }
        }
      }
    `, variables: { comment }
  })
}