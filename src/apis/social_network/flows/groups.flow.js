const fileUpload = require('express-fileupload')
const generalMiddleware = require('../../../middlewares/general.middleware')
const groupsController = require('../controllers/groups.controller')
const groupsMiddleware = require('../../../middlewares/groups.middleware')

const rootDir = process.env.ACADEMIC_NETWORK_BACKEND_ROOTDIR
// FileUpload settings.
const fileUploadMidd = fileUpload({
  useTempFiles : true,
  tempFileDir : `${rootDir}/uploads/`,
  safeFileNames: true
})

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
    fileUploadMidd,
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
    fileUploadMidd,
    groupsMiddleware.checkNewPostData,
    groupsController.createPost
  ],

  getMembershipInfo: [
    generalMiddleware.verifyAPIKey,
    generalMiddleware.userAuth,
    groupsMiddleware.checkGroupId,
    groupsController.getMembershipInfo
  ]
}
