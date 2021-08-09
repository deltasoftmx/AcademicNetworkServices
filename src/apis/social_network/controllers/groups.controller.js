const fs = require('fs')
const groupService = require('../../../services/group.service')
const errorHandlingService = require('../../../services/error_handling.service')
const messages = require('../../../../etc/messages.json')
const postService = require('../../../services/post.service')

module.exports = {
  getGroupInformation: async function(req, res) {
    try {
      let groupPerm = await groupService.getGroupInformation(req.params.group_id)
      let code = groupPerm.exit_code
      res.finish({
        code,
        messages: code == 0 ? ['Done'] : ['Group does not exist'],
        data: {
          group_data: groupPerm.groupData,
          permissions: groupPerm.permissions,
          tags: groupPerm.tags
        }
      })
    } catch(err) {
      err.file = err.file || __filename
      err.func = err.func || 'getGroupInformation'
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
  },

  updateGroupImage: async function(req, res) {
    try {
      const image = {
        path: req.files.image.tempFilePath
      }
      let result = await groupService.updateGroupImage(req.params.group_id, image, req.api.userId)
      // The image stored in local files is deleted.
      fs.unlinkSync(image.path)

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
  },

  addUserToGroup: async function(req, res) {
    try {
      const result = await groupService.addUserToGroup(req.api.userId, req.params.group_id)
      const status = result.exit_code == 1 ? 404 : 200

      res.status(status).finish({
        code: result.exit_code,
        messages: [result.message]
      })
    } catch (err) {
      err.file = err.file || __filename
      err.func = err.func || 'addUserToGroup'
      errorHandlingService.handleErrorInRequest(req, res, err)
    }
  },

  getAvailableGroupPermissions: async function(req, res) {
    try {
      const availablePermissions = await groupService.getAvailableGroupPermissions()

      res.status(200).finish({
        code: 0,
        messages: [messages.success_messages.c200],
        data: {
          group_permissions: availablePermissions
        }
      })
    } catch (err) {
      err.file = err.file || __filename
      err.func = err.func || 'getAvailableGroupPermissions'
      errorHandlingService.handleErrorInRequest(req, res, err)
    }
  },
  
  createPost: async function(req, res) {
    const post = {
      content: req.body.content
    }
    if (req.files && req.files.image) {
      post.image = {
        path: req.files.image.tempFilePath
      }
    }
    const referencedPostId = req.body.referenced_post_id
    if (!referencedPostId && !post.content && !post.image) {
      // The code is 3 because in the method verifyPermissions() used as middleware 
      // already use codes 1 and 2.
      return res.status(400).finish({
        code: 3,
        messages: ['No data was sent']
      })
    }
    try {
      let resultPost = await groupService.createPost(
        req.api.userId, 
        req.params.group_id, 
        post,
        referencedPostId
      )
        
      let statusHttp = 200
      if (resultPost.exit_code == 1 || resultPost.exit_code == 2) {
        // It's necessary add 3 to exit_code because there are 3 codes in use.
        resultPost.exit_code += 3
        statusHttp = 403
      }

      //Retrieve post data.
      let newPostData = {}

      if(resultPost.exit_code == 0) {
        newPostData = await postService.getPostData(
          resultPost.post_data.post_id,
          true,
          req.api.userId)
      }
      
      if(newPostData.referenced_post_id) {
        let referencedPost = await postService.getPostData(
          newPostData.referenced_post_id,
          false,
          req.api.userId)
        newPostData.referenced_post = referencedPost
      }
      //END Retrieve post data.
      
      res.status(statusHttp).finish({
        code: resultPost.exit_code,
        messages: [resultPost.message],
        data: newPostData
      })
    } catch (err) {
      err.file = err.file || __filename
      err.func = err.func || 'createPost'

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
  },

  getMembershipInfo: async function(req, res) {
    try {
      const resultInfo = await groupService.getMembershipInfo(req.api.userId, req.params.group_id)
      const code = resultInfo.exit_code
      const statusHttp = code == 0 ? 200 : 400

      res.status(statusHttp).finish({
        code,
        messages: code == 0 ? ['Done'] : ['Group does not exist'],
        data: resultInfo.membershipInfo
      })
    } catch (err) {
      err.file = err.file || __filename
      err.func = err.func || 'getMembershipInfo'
      errorHandlingService.handleErrorInRequest(req, res, err)
    }
  }
}
