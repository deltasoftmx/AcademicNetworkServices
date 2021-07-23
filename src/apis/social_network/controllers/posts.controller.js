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
  },

  getPostData: async function(req, res) {
    const userId = req.api.userId
    const postId = req.params.post_id

    try {
      const postInPrivateGroup = await postService.postBelongsToPrivateGroup(postId)

      if (postInPrivateGroup.group_private) {
        // User not authenticated
        if (userId === undefined) {
          return res.status(401).finish({
            code: 1,
            messages: ['Unauthenticated. User must authenticate to get the requested response.']
          })
        }
        // User authenticated
        const userIsMember = await postService.userBelongsToGroup(userId, postInPrivateGroup.group_id)

        if (userIsMember) {
          const post = await postService.getPostData(postId, userId)
          if (post.referenced_post_id != null) {
            post.referenced_post = await postService.getBasePostData(post.referenced_post_id, userId)
          }
          post.referenced_post_id = undefined
          return res.finish({
            code: 0,
            messages: ['Done'],
            data: post
          })
        } else {
          return res.status(403).finish({
            code: 2,
            messages: [`Forbidden. The requested post belongs to a private group to which the user requesting doesn't belong.`]
          })
        }
      } 

      const post = await postService.getPostData(postId, userId)
      if (!post) {
        return res.status(404).finish({
          code: 3,
          messages: ['Post not found']
        })
      }
      if (post.referenced_post_id != null) {
        post.referenced_post = await postService.getBasePostData(post.referenced_post_id, userId)
      }
      post.referenced_post_id = undefined
      return res.finish({
        code: 0,
        messages: ['Done'],
        data: post
      })
      
    } catch (err) {
      err.file = err.file || __filename
      err.func = err.func || 'getPostData'
      errorHandlingService.handleErrorInRequest(req, res, err)
    }
  }
}
