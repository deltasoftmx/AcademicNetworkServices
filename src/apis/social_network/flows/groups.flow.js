const generalMiddleware = require('../../../middlewares/general.middleware')
const groupsController = require('../controllers/groups.controller')
const groupsMiddleware = require('../../../middlewares/groups.middleware')

module.exports = {
  getGroupPermissions: [
    generalMiddleware.allowExternalConnections,
    generalMiddleware.verifyAPIKey,
    groupsMiddleware.checkGroupId,
    groupsController.getGroupPermissions
  ],

  searchGroups: [
    generalMiddleware.allowExternalConnections,
    generalMiddleware.verifyAPIKey,
    generalMiddleware.userAuth,
    groupsMiddleware.checkSearchGroupsParams,
    groupsController.searchGroups
  ]
}