const generalMidd = require('../../../middlewares/general.middleware')
const postMidd = require('../../../middlewares/posts.middleware')
const postCtrl = require('../controllers/posts.controller')

module.exports = {
  postsForTimelime: [
    generalMidd.verifyAPIKey,
    generalMidd.userAuth,
    postMidd.checkPaginationParams,
    postCtrl.getPostsForTimeline
  ],

  getPostData: [
    generalMidd.verifyAPIKey,
    generalMidd.userAuthIfTokenSent,
    postMidd.checkPostId,
    postCtrl.getPostData
  ],

  favoritePosts: [
    generalMidd.verifyAPIKey,
    generalMidd.userAuth,
    postMidd.checkPaginationParams,
    postCtrl.favoritePosts
  ],

  getCommentsOfAPost: [
    generalMidd.verifyAPIKey,
    generalMidd.userAuthIfTokenSent,
    postMidd.checkPostId,
    postMidd.checkPaginationParams,
    postCtrl.getCommentsOfAPost
  ]
}