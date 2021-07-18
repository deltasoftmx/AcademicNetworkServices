const postService = require('../../../services/post.service')
const errorHandlingService = require('../../../services/error_handling.service')

module.exports = {
  getPostsForTimeline: async function(req, res) {
    try {
      let result = await postService.getPostsForTimeline(
        req.api.userId,
        req.query.offset,
        req.query.page
      )
      let posts = result.posts
      
      for (let i = 0; i < posts.length; i++) {
        let post = posts[i]
        post.referenced_post = (post.referenced_post_id != null) ? 
          await postService.getBasePostData(post.referenced_post_id, req.api.userId) : null
        post.referenced_post_id = undefined
      }

      res.finish({
        code: 0,
        messages: ['Done'],
        data: {
          posts,
          total_records: result.total_records
        }
      })
    } catch (err) {
      err.file = err.file || __filename
      err.func = err.func || 'getPostsForTimeline'
      errorHandlingService.handleErrorInRequest(req, res, err)
    }
  }
}
