const router = require('express').Router()
const userflows = require('../flows/users.flow')
const usersFlow = require('../flows/users.flow')

router.post('/signup', userflows.signup)
router.post('/signin', userflows.signin)
router.get('/search', usersFlow.searchUsers)
router.get('/:username', userflows.getData)

module.exports = router
