const router = require('express').Router()
const groupsFlow = require('../flows/groups.flow')

router.get('/group/:group_id/information', groupsFlow.getGroupInformation)
router.get('/search', groupsFlow.searchGroups)
router.post('/create', groupsFlow.createGroup)
router.put('/group/:group_id/switch-notifications', groupsFlow.switchGroupNotifications)
router.put('/group/:group_id/update-image', groupsFlow.updateGroupImage)
router.post('/group/:group_id/add-user', groupsFlow.addUserToGroup)

module.exports = router
