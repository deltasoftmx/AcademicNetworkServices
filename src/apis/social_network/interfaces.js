const router = require('express').Router()
const userEndpoints = require('./endpoints/users.endpoint')

router.use('/users', userEndpoints)

module.exports = router
