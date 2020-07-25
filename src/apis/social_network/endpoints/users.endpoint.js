const router = require('express').Router()
const userflows = require('../flows/users.flow')

router.post('/signup', userflows.signup)
router.post('/signin', userflows.signin)
router.get('/:username', userflows.getData)
router.post('/post', userflows.post)

module.exports = router
