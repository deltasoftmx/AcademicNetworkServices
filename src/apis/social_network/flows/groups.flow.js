const multer = require('multer')
const generalMiddleware = require('../../../middlewares/general.middleware')
const groupsController = require('../controllers/groups.controller')
const groupsMiddleware = require('../../../middlewares/groups.middleware')

// Multer settings.
const upload = multer({dest: 'uploads/'})

module.exports = {
  getGroupPermissions: [
    generalMiddleware.verifyAPIKey,
    groupsMiddleware.checkGroupId,
    groupsController.getGroupPermissions
  ],

  searchGroups: [
    generalMiddleware.verifyAPIKey,
    generalMiddleware.userAuth,
    groupsMiddleware.checkSearchGroupsParams,
    groupsController.searchGroups
  ],

  createGroup: [
    generalMiddleware.verifyAPIKey,
    generalMiddleware.userAuth,
    groupsMiddleware.checkCreatingData,
    groupsController.createGroup
  ],

  switchGroupNotifications: [
    generalMiddleware.verifyAPIKey,
    generalMiddleware.userAuth,
    groupsMiddleware.checkGroupId,
    groupsMiddleware.checkSwitchGroupNotificationsData,
    groupsController.switchGroupNotifications
  ],

  updateGroupImage: [
    generalMiddleware.verifyAPIKey,
    generalMiddleware.userAuth,
    groupsMiddleware.checkGroupId,
    upload.single('image'),
    groupsMiddleware.checkUpdateGroupImageData,
    groupsController.updateGroupImage
  ]
}
