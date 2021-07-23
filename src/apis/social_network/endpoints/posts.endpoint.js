const router = require('express').Router()
const postFlows = require('../flows/posts.flow')

router.get('/timeline', postFlows.postsForTimelime)
router.get('/post/:post_id', postFlows.getPostData)

module.exports = router