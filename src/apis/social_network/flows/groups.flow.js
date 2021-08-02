const multer = require('multer')
const generalMiddleware = require('../../../middlewares/general.middleware')
const groupsController = require('../controllers/groups.controller')
const groupsMiddleware = require('../../../middlewares/groups.middleware')

// Multer settings.
const upload = multer({dest: 'uploads/'})

module.exports = {
  getGroupInformation: [
    generalMiddleware.verifyAPIKey,
    groupsMiddleware.checkGroupId,
    groupsController.getGroupInformation
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
  ],

  addUserToGroup: [
    generalMiddleware.verifyAPIKey,
    generalMiddleware.userAuth,
    groupsMiddleware.checkGroupId,
    groupsController.addUserToGroup
  ],

  getAvailableGroupPermissions: [
    generalMiddleware.verifyAPIKey,
    groupsController.getAvailableGroupPermissions
  ],

  post: [
    generalMiddleware.verifyAPIKey,
    generalMiddleware.userAuth,
    groupsMiddleware.checkGroupId,
    groupsMiddleware.verifyPermissions,
    upload.single('image'),
    groupsMiddleware.checkNewPostData,
    groupsController.createPost
  ]
}
