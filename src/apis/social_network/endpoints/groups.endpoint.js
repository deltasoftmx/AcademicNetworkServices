const router = require('express').Router()
const groupsFlow = require('../flows/groups.flow')

router.get('/group/:group_id/permissions', groupsFlow.getGroupPermissions)
router.get('/search', groupsFlow.searchGroups)

module.exports = router
