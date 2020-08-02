const router = require('express').Router()
const userEndpoints = require('./endpoints/users.endpoint')
const groupEndpoints = require('./endpoints/groups.endpoint')

router.use('/users', userEndpoints)
router.use('/groups', groupEndpoints)

module.exports = router
