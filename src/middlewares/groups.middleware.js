const { Validator, parseValidatorOutput, parseNumberFromGroupIfApplic } = require('../services/validator.service')

function checkGroupId(req, res, next) {
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
}

function checkSearchGroupsParams(req, res, next) {
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
}

function checkCreatingData(req, res, next) {
  let validator = new Validator()
  validator(req.body).required().isObject( obj => {
    obj('group_name').required().isString()
    obj('description').isString()
    obj('visibility').required().isString().isIncludedInArray(['public', 'private'])
    obj('permissions').required().isArray( item => {
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
}

function checkSwitchGroupNotificationsData(req, res, next) {
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
}

function checkUpdateGroupImageData(req, res, next) {
  let validator = new Validator()
  validator(req.file).display('image').required()
  
  let errors = parseValidatorOutput(validator.run())
  if (errors.length) {
    return res.status(400).finish({
      code: -1,
      messages: errors
    })
  }

  next()
}

module.exports = {
  checkGroupId,
  checkSearchGroupsParams,
  checkCreatingData,
  checkSwitchGroupNotificationsData,
  checkUpdateGroupImageData
}
