const router = require('express').Router()
const userflows = require('../flows/users.flow')

router.post('/signup', userflows.signup)
router.post('/signin', userflows.signin)
router.get('/data/:username', userflows.getData)
router.post('/post', userflows.post)
router.get('/search', userflows.searchUsers)
router.get('/types', userflows.getPublicUserTypes)
router.get('/majors', userflows.getMajorsData)

module.exports = router
