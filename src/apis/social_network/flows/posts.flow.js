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
}