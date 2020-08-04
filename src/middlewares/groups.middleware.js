const { Validator, parseValidatorOutput, parseNumberFromGroupIfApplic } = require('../services/validator.service')


module.exports = {
  checkGroupId: function(req, res, next) {
    let validator = new Validator()
    req.params = parseNumberFromGroupIfApplic(req.params)
    validator(req.params).required().isObject( obj =>{
      obj('group_id').required().isNumber().integer()
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
      obj('group_relative_type').isString().isIncludedInArray(['all', 'mine', undefined])
      obj('search').isString()
      obj('offset').isNumber().integer()
      obj('page').isNumber().integer()
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
}
