const groupService = require('../../../services/group.service')
const errorHandlingService = require('../../../services/error_handling.service')

module.exports = {
  getGroupPermissions: async function(req, res) {
    try {
      let groupPerm = await groupService.getGroupPermissions(req.params.group_id)
      let code = groupPerm.exists_group ? 0 : 1
      res.finish({
        code,
        messages: code == 0 ? ['Done'] : ['Group does not exists'],
        data: {
          permissions: groupPerm.permissions
        }
      })
    } catch(err) {
      err.file = err.file || __filename
      err.func = err.func || 'getGroupPermissions'
      errorHandlingService.handleErrorInRequest(req, res, err)
    }
  },
  
  searchGroups: async function(req, res) {
    try {
      let result = await groupService.searchGroups(
        req.query.group_relative_type,
        req.query.search,
        req.query.offset,
        req.query.page,
        req.query.asc,
        req.api.userId
      )

      res.finish({
        code: 0,
        messages: ['Done'],
        data: result
      })
    } catch (err) {
      err.file = err.file || __filename
      err.func = err.func || 'searchGroups',
      errorHandlingService.handleErrorInRequest(req, res, err)
    }
  },

  createGroup: async function(req, res, next) {
    try {
      let result = await groupService.createGroup(req.api.userId, req.body)
      let data
      if(result.exit_code == 0) {
        data = { group_id: result.id }
      }
      return res.finish({
        code: result.exit_code,
        messages: [result.message],
        data
      })
    } catch(err) {
      err.file = err.file || __filename
      err.func = err.func || 'createGroup'
      errorHandlingService.handleErrorInRequest(req, res, err)
    }
  },

  switchGroupNotifications: async function(req, res) {
    try {
      let result = await groupService.switchGroupNotifications(req.body.group_id, req.body.state, req.api.userId)
      if (!result) {
        return res.status(404).finish({
          code: 1,
          messages: ['The user does not belong to the group']
        })
      }

      res.finish({
        code: result.code,
        messages: [result.message]
      })
    } catch (err) {
      err.file = err.file || __filename
      err.func = err.func || 'switchGroupNotifications'
      errorHandlingService.handleErrorInRequest(req, res, err)
    }
  }
}
