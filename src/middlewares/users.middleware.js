const { Validator, parseValidatorOutput, parseNumberFromGroupIfApplic } = require('../services/validator.service')

module.exports = {
  checkSignUpData: function(req, res, next) {
    let validator = new Validator()
    validator(req.body).required().isObject( obj => {
      obj('firstname').required().isString()
      obj('lastname').required().isString()
      obj('username').isString().isMatch(/^[a-zA-Z0-9_\-]*$/)
      obj('email').required().isString().isEmail()
      obj('passwd').required().isString()
      obj('description').isString()
      obj('user_type_id').required().isNumber().integer()
    })
    let errors = parseValidatorOutput(validator.run())
    if(errors.length != 0) {
      return res.status(400).finish({
        code: -1,
        messages: errors
      })
    }

    return next()
  },

  checkStudentSignUpData: function(req, res, next) {
    let validator = new Validator()
    validator(req.body).required().isObject( obj => {
      obj('major_id').required().isNumber().integer()
      obj('student_id').isString().isMatch(/^[a-zA-Z0-9_\-]*$/)
    })
    let errors = parseValidatorOutput(validator.run())
    if(errors.length != 0) {
      return res.status(400).finish({
        code: -1,
        messages: errors
      })
    }
    return next()
  },

  checkNonStudentsSignUpData: function(req, res, next) {
    let validator = new Validator()
    validator(req.body).required().isObject( obj => {
      obj('username').required().isString()
    })
    let errors = parseValidatorOutput(validator.run())
    if(errors.length != 0) {
      return res.status(400).finish({
        code: -1,
        messages: errors
      })
    }
    return next()
  },

  checkSignInData: function(req, res, next) {
    let validator = new Validator()
    validator(req.body).required().isObject( obj => {
      obj('username').required().isString()
      obj('passwd').required().isString()
    })
    let errors = parseValidatorOutput(validator.run())
    if(errors.length != 0) {
      return res.status(400).finish({
        code: -1,
        messages: errors
      })
    }
    return next()
  },

  checkGetPublicUserDataParameter: function(req, res, next) {
    let validator = new Validator()
    validator(req.params).required().isObject( obj => {
      obj('username').required().isString()
    })
    let errors = parseValidatorOutput(validator.run())
    if(errors.length != 0) {
      return res.status(400).finish({
        code: -1,
        messages: errors
      })
    }
    return next()
  },

  checkNewPostData: function(req, res, next) {
    let validator = new Validator()
    validator(req.body.content).isString().display('content')
    // Multer will use the 'image' field, if a file is sent in this field multer will 
    // "send the image" in req.file so req.body.image will have undefined value, but 
    // if a file is not sent in the field 'image' req.file will be undefined and 
    // req.body.image will have a value so it is necessary to validate it.
    validator(req.file).isObject().display('image')
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
  
  checkSearchUserParams: function(req, res, next) {
    let validator = new Validator()
    req.query = parseNumberFromGroupIfApplic(req.query)
    if(req.query.search != undefined) {
      req.query.search = req.query.search.toString()
    }
    validator(req.query).isObject(obj => {
      obj('page').isNumber().integer()
      obj('offset').isNumber().integer()
      obj('asc').isNumber().integer()
      obj('search').isString()
      obj('user_relative_type').isString().isIncludedInArray(['all', 'followers', 'followed', undefined])
      obj('asc').isNumber().integer()
    })
    let errors = parseValidatorOutput(validator.run())
    if(errors.length != 0) {
      return res.status(400).finish({
        code: -1,
        messages: errors
      })
    }
    return next()
  }
}
