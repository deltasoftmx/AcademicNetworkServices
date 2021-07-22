const { Validator, parseValidatorOutput, parseNumberFromGroupIfApplic } = require('../services/validator.service')

function checkSignUpData(req, res, next) {
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
}

function checkStudentSignUpData(req, res, next) {
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
}

function checkNonStudentsSignUpData(req, res, next) {
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
}

function checkSignInData(req, res, next) {
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

function checkGetPublicUserDataParameter(req, res, next) {
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
}

function checkNewPostData(req, res, next) {
  let validator = new Validator()
  validator(req.body.content).isString()
  validator(req.file).isObject()

  let errors = parseValidatorOutput(validator.run())
  if (errors.length != 0) {
    return res.status(400).finish({
      code: -1,
      messages: errors
    })
  }
  return next()
}

function checkSearchUserParams(req, res, next) {
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

module.exports = {
  checkSignUpData,
  checkStudentSignUpData,
  checkNonStudentsSignUpData,
  checkSignInData,
  checkGetPublicUserDataParameter,
  checkNewPostData,
  checkSearchUserParams
}
