const generalMiddleware = require('../../../middlewares/general.middleware')
const groupsController = require('../controllers/groups.controller')
const groupsMiddleware = require('../../../middlewares/groups.middleware')

module.exports = {
  getGroupPermissions: [
    generalMiddleware.verifyAPIKey,
    groupsMiddleware.checkGroupId,
    groupsController.getGroupPermissions
  ]
}
