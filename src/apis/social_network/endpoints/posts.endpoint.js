const router = require('express').Router()
const postFlows = require('../flows/posts.flow')

router.get('/timeline', postFlows.postsForTimelime)

module.exports = router