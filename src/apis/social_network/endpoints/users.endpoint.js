const router = require('express').Router()
const userflows = require('../flows/users.flow')

router.post('/signup', userflows.signup)
router.post('/signin', userflows.signin)
router.get('/search', userflows.searchUsers)
router.get('/types', userflows.getPublicUserTypes)
router.get('/:username', userflows.getData)

module.exports = router
