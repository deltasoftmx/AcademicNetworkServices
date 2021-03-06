const moment = require('moment')
const userService = require('../../../services/user.service')
const cryptService = require('../../../services/crypt.service')
const authService = require('../../../services/auth.service')
const conf = require('../../../../etc/conf.json')
const messages = require('../../../../etc/messages.json')
const errorHandlingService = require('../../../services/error_handling.service')

module.exports = {
  createStudent: async function(req, res) {
    let at_index = req.body.email.indexOf('@')
    req.body.student_id = req.body.email.substring(0, at_index)
    req.body.passwd = cryptService.hash(req.body.passwd)
    try {
      let result = await userService.createStudent(req.body)
      let data
      if(result.exit_code == 0) {
        let token = await cryptService.generateJWT( { user_id: result.user_id },
                                                    conf.session.expires_in)
        data = { session_token: token }
      }
      res.finish({
        code: result.exit_code,
        messages: [result.message],
        data
      })
    } catch(err) {
      err.file = err.file || __filename
      err.func = err.func || 'createStudent'
      errorHandlingService.handleErrorInRequest(req, res, err)
    }
  },

  signIn: async function(req, res) {
    try {
      req.body.passwd = cryptService.hash(req.body.passwd)
      let userId = await authService.authUserByCrendent(req.body.username, req.body.passwd)
      if(!userId) {
        return res.status(406).finish({
          code: 1,
          messages: ['Invalid credentials']
        })
      }
      let token = await cryptService.generateJWT( { user_id: userId }, 
                                                  conf.session.expires_in)
      res.finish({
        code: 0, 
        data: {
          session_token: token
        },
        message: ['Done']
      })
    } catch(err) {
      err.file = err.file || __filename
      err.func = err.func || 'signIn'

      if(err.code == 'ENOENT') {
        req.api.logger.error(err)
        res.status(500).finish({
          code: 1000,
          messages: [messages.error_messages.e500]
        })
      }
      errorHandlingService.handleErrorInRequest(req, res, err)
    }
  },

  getPublicUserData: async function(req, res) {
    try {
      let resultUserData = await userService.getPublicUserData(req.params.username)

      if (!resultUserData) {
        res.status(404).finish({
          code: 1,
          messages: [`Username doesn't exists.`]
        })
      } else {
        resultUserData.created_at = moment(resultUserData.created_at).format("LL")

        res.finish({
          code: 0,
          data: resultUserData,
          messages: ['Done']
        })
      }
      
    } catch (err) {
      err.file = err.file || __filename
      err.func = err.func || 'getPublicUserData'
      errorHandlingService.handleErrorInRequest(req, res, err)
    }
  },

  createPost: async function(req, res) {
    try {
      const post = {
        content: req.body.content,
        image: req.file
      }
      let resultPost = await userService.createPost(req.api.userId, post)

      if (!resultPost) {
        return res.status(404).finish({
          code: 1,
          messages: ['No data was sent.']
        })
      }

      res.finish({
        code: 0,
        messages: ['Done'],
        data: resultPost
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
  
  searchUsers: async function(req, res) {
    try {
      let result = await userService.searchUsers(
        req.query.user_relative_type, 
        req.query.page, 
        req.query.offset, 
        req.query.search, 
        req.query.asc,
        req.api.userId)

      res.finish({
        code: 0,
        messages: ['Done'],
        data: result
      })
    } catch(err) {
      err.file = err.file || __filename
      err.func = err.func || 'searchUsers'
      errorHandlingService.handleErrorInRequest(req, res, err)
    }
  },

  getPublicUserTypes: async function(req, res) {
    try {
      let userTypes = await userService.getPublicUserTypes()
      res.finish({
        code: 0,
        messages: ['Done'],
        data: {
          user_types: userTypes
        }
      })
    } catch(err) {
      err.file = err.file || __filename
      err.func = err.func || 'getPublicUserTypes'
      errorHandlingService.handleErrorInRequest(req, res, err)
    }
  },

  getMajorsData: async function(req, res) {
    try {
      let majors = await userService.getMajorsData()
      res.finish({
        code: 0,
        messages: ['Done'],
        data: {
          majors: majors
        }
      })
    } catch(err) {
      err.file = err.file || __filename
      err.func = err.func || 'getMajorsData'
      errorHandlingService.handleErrorInRequest(req, res, err)
    }
  }
}
