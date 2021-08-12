const { 
  Validator, 
  parseValidatorOutput, 
  parseNumberFromGroupIfApplic,
  parseNumberIfApplicable
} = require('../services/validator.service')

module.exports = {
  checkPaginationParams: function(req, res, next) {
    let validator = new Validator()
    req.query = parseNumberFromGroupIfApplic(req.query)

    validator(req.query).isObject(obj => {
      obj('offset').isNumber().integer().isPositive()
      obj('page').isNumber().integer().notNegative()
    })

    let errors = parseValidatorOutput(validator.run())
    if(errors.length != 0) {
      return res.status(400).finish({
        code: -1,
        messages: errors
      })
    }
    
    next()
  },

  checkPostId: function(req, res, next) {
    req.params.post_id = parseNumberIfApplicable(req.params.post_id)
    
    let validator = new Validator()
    validator(req.params).required().isObject( obj => {
      obj('post_id').required().isNumber().integer().isPositive()
    })
    let errors = parseValidatorOutput(validator.run())
    if(errors.length != 0) {
      return res.status(400).finish({
        code: -1,
        messages: errors
      })
    }
    next()
  }
}
