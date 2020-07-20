const { Validator, parseValidatorOutput } = require('../services/validator.service')

module.exports = {
  checkSignUpData: function(req, res, next) {
    let validator = new Validator()
    validator(req.body).required().isObject( obj => {
      obj('firstname').required().isString()
      obj('lastname').required().isString()
      obj('email').required().isString().isEmail()
      obj('passwd').required().isString()
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
  }
}