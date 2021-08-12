const { 
  Validator, 
  parseValidatorOutput, 
  parseNumberFromGroupIfApplic,
  parseNumberIfApplicable } = require('../services/validator.service')
const groupService = require('../services/group.service')


module.exports = {
  checkGroupId: function(req, res, next) {
    let validator = new Validator()
    req.params = parseNumberFromGroupIfApplic(req.params)
    validator(req.params).required().isObject( obj =>{
      obj('group_id').required().isNumber().integer().isPositive()
    })
    let errors = parseValidatorOutput(validator.run())
    if(errors.length) {
      return res.status(400).finish({
        code: -1,
        messages: errors
      })
    }

    return next()
  },
  
  checkSearchGroupsParams: function(req, res, next) {
    let validator = new Validator()

    req.query = parseNumberFromGroupIfApplic(req.query)
    if (req.query.search != undefined) {
      req.query.search = req.query.search.toString()
    }

    validator(req.query).isObject(obj => {
      obj('group_relative_type').isString().isIncludedInArray(['all', 'user', undefined])
      obj('search').isString()
      obj('offset').isNumber().integer().isPositive()
      obj('page').isNumber().integer().notNegative()
      obj('asc').isNumber().integer().isIncludedInArray([0, 1, undefined])
    })

    let errors = parseValidatorOutput(validator.run())
    if (errors.length != 0) {
      return res.status(400).finish({
        code: -1,
        messages: errors
      })
    }

    return next()
  },

  checkCreatingData: function(req, res, next) {
    let validator = new Validator()
    validator(req.body).required().isObject( obj => {
      obj('group_name').required().isString()
      obj('description').isString()
      obj('visibility').required().isString().isIncludedInArray(['public', 'private'])
      obj('permissions').isArray( item => {
        item.required().isNumber().integer().isPositive()
      })
      obj('tags').isArray( item => {
        item.required().isString()
      })
    })
    let errors = parseValidatorOutput(validator.run())
    if(errors.length) {
      return res.status(400).finish({
        code: -1,
        messages: errors
      })
    }

    return next()
  },

  checkSwitchGroupNotificationsData: function(req, res, next) {
    let validator = new Validator()
    validator(req.body).required().isObject( obj => {
      obj('state').required().isNumber().integer().isIncludedInArray([0, 1, undefined])
    })
    let errors = parseValidatorOutput(validator.run())
    if (errors.length) {
      return res.status(400).finish({
        code: -1,
        messages: errors
      })
    }

    next()
  },

  checkUpdateGroupImageData: function(req, res, next) {
    let validator = new Validator()

    // FileUploader will use the 'image' named field, if a file is sent in this field FileUploader
    // will "send the image" in req.files.image as an object.
    // But if no file is sent, req.files.image will be undefined and req.files will be undefined as well.
    if (!req.files) {
      req.files = {}
    }
    validator(req.files.image).required().isObject().display('image')
    
    let errors = parseValidatorOutput(validator.run())
    if (errors.length) {
      return res.status(400).finish({
        code: -1,
        messages: errors
      })
    }

    next()
  },

  checkNewPostData: function(req, res, next) {
    req.body.referenced_post_id = parseNumberIfApplicable(req.body.referenced_post_id)
    
    let validator = new Validator()
    validator(req.body).required().isObject( obj => {
      obj('content').isString(),
      obj('referenced_post_id').isNumber().integer().isPositive()
    })

    // FileUploader will use the 'image'-named field, if a file is sent in this field FileUploader
    // will "send the image" in req.files.image so req.body.image will have undefined value, but 
    // if a file is not sent in the field 'image' req.files.image will be undefined and 
    // req.body.image will have a value so it is necessary to validate it.
    // If no file is sent, req.files will be undefined as well.
    if (!req.files) {
      req.files = {}
    }
    validator(req.files.image).isObject().display('image')
    if (req.body.image) {
      validator(req.body.image).isObject().display('image')
    }

    let errors = parseValidatorOutput(validator.run())
    if (errors.length != 0) {
      return res.status(400).finish({
        code: -1,
        messages: errors
      })
    }
    return next()
  },

  verifyPermissions: async function(req, res, next) {
    const groupInformation = await groupService.getGroupInformation(req.params.group_id)
    if (groupInformation.exit_code == 1) {
      return res.status(404).finish({
        code: 1,
        messages: ['Group does not exist']
      })
    }
    if (groupInformation.groupData.owner_username === req.api.username) {
      return next()
    }
    let groupPermissions = groupInformation.permissions
    delete groupPermissions.meta
    const endpointPermissions = await groupService.getEndpointPermissions()

    // The request parameter group_id that appears in the path as a number, is changed 
    // by 'group_id', this is how was registered in group_endpoint_permissions table.
    let urlEndpoint = req.originalUrl.replace(/\/[0-9]+\//, '/:group_id/')

    for (const endpointPer of endpointPermissions) {
      if (endpointPer.endpoint === urlEndpoint) {
        for (const groupPer of groupPermissions) {
          if (endpointPer.group_permission_id == groupPer.id && groupPer.granted == 0) {
            return res.status(403).finish({
              code: 2,
              messages: [`Group does not have ${groupPer.codename} permission.`]
            })
          }
        }
      }      
    }

    next()
  }
}
