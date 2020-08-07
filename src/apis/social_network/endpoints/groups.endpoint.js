const router = require('express').Router()
const groupsFlow = require('../flows/groups.flow')

router.get('/group/:group_id/permissions', groupsFlow.getGroupPermissions)
router.get('/search', groupsFlow.searchGroups)
router.post('/create', groupsFlow.createGroup)
router.put('/switch-group-notifications', groupsFlow.switchGroupNotifications)

module.exports = router
