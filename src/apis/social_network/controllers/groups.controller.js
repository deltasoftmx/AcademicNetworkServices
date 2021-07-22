const fs = require('fs')
const groupService = require('../../../services/group.service')
const errorHandlingService = require('../../../services/error_handling.service')
const messages = require('../../../../etc/messages.json')

async function getGroupPermissions(req, res) {
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
}

async function searchGroups(req, res) {
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
}

async function createGroup(req, res, next) {
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
}

async function switchGroupNotifications(req, res) {
  try {
    let result = await groupService.switchGroupNotifications(req.api.userId, req.params.group_id, req.body.state)

    return res.finish({
      code: result.exit_code,
      messages: [result.message]
    })
  } catch (err) {
    err.file = err.file || __filename
    err.func = err.func || 'switchGroupNotifications'
    errorHandlingService.handleErrorInRequest(req, res, err)
  }
}

async function updateGroupImage(req, res) {
  try {
    let result = await groupService.updateGroupImage(req.params.group_id, req.file, req.api.userId)
    // The image stored in local files is deleted.
    fs.unlinkSync(req.file.path)

    let httpStatusCode = undefined
    let message = undefined

    switch (result.exit_code) {
      case 0:
        httpStatusCode = 200
        message = 'Done'
        break;
      case 1:
        httpStatusCode = 404
        message = 'The group does not exist'
        break;
      case 2:
        httpStatusCode = 403
        message = 'Permission denied. You are not the group owner'
        break;
    }

    return res.status(httpStatusCode).finish({
      code: result.exit_code,
      messages: [message],
      data: {
        image_src: result.image_src
      }
    })
  } catch (err) {
    err.file = err.file || __filename
    err.func = err.func || 'updateGroupImage'
    // err.http_code = error code of Cloudinary.
    err.code = err.code || err.http_code

    // If exist some Cloudinary env var not configured.
    if (err.http_code === 401) {
      req.api.logger.error(err)
      res.status(500).finish({
        code: 1001,
        messages: [messages.error_messages.e500]
      })
    }
    errorHandlingService.handleImageUploadError(req, res, err)
  }
}

module.exports = {
  getGroupPermissions,
  searchGroups,
  createGroup,
  switchGroupNotifications,
  updateGroupImage
}
